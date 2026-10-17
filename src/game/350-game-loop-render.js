/* ================= loop & render ================= */
/* ================= inside vehicles ================= */
const VIN={on:false,g:null,people:[]};
/* inside-vehicle view: hide the small things (trees, signs, lamps, arches) that sit between the camera and the vehicle */
const OCC={t:0,hid:new Set()},_occV=new THREE.Vector3(),_occD=new THREE.Vector3();
function occlude(dt,target){OCC.t-=dt;if(OCC.t>0&&!!target===!!OCC.on)return;OCC.t=.15;OCC.on=!!target;const now=new Set();
  if(target){target.updateMatrixWorld(true);const big=target.userData&&target.userData.seats&&target.userData.seats.length>4;
    for(const [ox,oz,oy] of [[0,0,.5],[1,0,.5],[-1,0,.5],[1,1,.9],[1,-1,.9],[0,1,.9],[0,-1,.9],[-1,1,.9],[-1,-1,.9]]){_occV.set(ox*(big?1.6:.95),oy,oz*(big?.6:.5));target.localToWorld(_occV);_occD.copy(_occV).sub(camera.position);const dist=_occD.length();_occD.normalize();ray.set(camera.position,_occD);ray.camera=camera;ray.far=dist-.2;
      for(const h of ray.intersectObjects(scene.children,true)){const o=h.object;if(!o.isMesh||o.isInstancedMesh||o.isSkinnedMesh||o.isSprite||!o.visible&&!OCC.hid.has(o))continue;let a=o,skip=false;while(a){if(a===target||(a.userData&&'ring' in a.userData)){skip=true;break}a=a.parent}if(skip)continue;
        if(!o.geometry.boundingSphere)o.geometry.computeBoundingSphere();o.getWorldScale(_occV);if(o.geometry.boundingSphere.radius*Math.max(_occV.x,_occV.y,_occV.z)>8)continue;now.add(o)}}
    ray.far=Infinity}
  OCC.hid.forEach(o=>{if(!now.has(o)){o.visible=true;OCC.hid.delete(o)}});now.forEach(o=>{if(o.visible){o.visible=false;OCC.hid.add(o)}})}let VPOOL=null;
function curVeh(){const p=P();if(!S||IS)return null;if(S.ride&&S.ride.phase==='drive'&&p.inCar)return{g:S.ride.g,kind:'car',r:S.ride};if(p.onBus)return{g:p.onBus.bus.g,kind:'bus',b:p.onBus.bus};return null}
function vpool(){if(VPOOL)return VPOOL;VPOOL=[];for(let i=0;i<8;i++){const L=randomLook(Math.random()<.5?'m':'f');const h=makeHuman(L,{});h.g.visible=false;scene.add(h.g);VPOOL.push({mesh:h.g,legs:h.legs,knees:h.knees,arms:h.arms,elbows:h.elbows,head:h.head,lids:h.lids,torso:h.torso,phase:0,id:i*2.3,pose:'sit'})}return VPOOL}
function seatPos(g,sx,sz){const u=g.userData,v=new THREE.Vector3(sx,u.seatY,sz);u.inner.localToWorld(v);return v}
function seatHuman(h,g,sx,sz,pose,dt){const w=seatPos(g,sx,sz);h.pose=pose;h.spotY=w.y-.5;posePerson(h,false,dt);h.mesh.position.x=w.x;h.mesh.position.z=w.z;h.mesh.rotation.y=g.rotation.y+Math.PI/2;h.mesh.visible=true}
function vehInterior(dt){const v=curVeh(),p=P();
  if(VIN.g&&(!v||v.g!==VIN.g)){VIN.g.userData.roofParts.forEach(m=>m.visible=true);VIN.people.forEach(h=>{h.mesh.visible=false;h.gest=null});VIN.g=null;S.radio=false;if(p.pose==='sit')p.pose=null;S._vk=null}
  if(!v)return;const g=v.g,u=g.userData,inside=VIN.on;g.updateMatrixWorld(true);u.roofParts.forEach(m=>m.visible=!inside);
  if(VIN.g!==g){VIN.g=g;const P8=vpool();VIN.people=v.kind==='car'?P8.slice(0,v.r.shared?3:1):P8.slice(0,7);VIN.seats=v.kind==='bus'?u.seats.slice().sort(()=>Math.random()-.5):null}
  if(!inside){VIN.people.forEach(h=>h.mesh.visible=false);return}
  if(v.kind==='car'){const S4=u.seats;seatHuman(VIN.people[0],g,S4[0][0],S4[0][1],'sit',dt);if(VIN.people[0].head)VIN.people[0].head.rotation.y=Math.sin(performance.now()/2300)*.2;
    const mine=v.r.app==='taxi'?1:3;const others=[1,2,3].filter(i=>i!==mine);VIN.people.slice(1).forEach((h,i)=>{const q=S4[others[i]];if(q)seatHuman(h,g,q[0],q[1],'phone',dt)});
    p.pose='sit';seatHuman(p,g,S4[mine][0],S4[mine][1],'sit',dt)}
  else{const d=u.driver;seatHuman(VIN.people[0],g,d[0],d[1],'sit',dt);const ss=VIN.seats;VIN.people.slice(1).forEach((h,i)=>seatHuman(h,g,ss[i+1][0],ss[i+1][1],['phone','sit','phone','sitTalk','sit','phone'][i],dt));
    p.pose='sit';seatHuman(p,g,ss[0][0],ss[0][1],'sit',dt)}}
const DRIVER_LINES=['"Chale, this traffic by the Faculty Gate eh, every morning!"','"You are a fresher? Ah, enjoy it, these are the best years."','"My son is also in level 200. Engineering. Very serious boy."','"The SRC concert this week, I will be working all night 😄"','"Fuel price has gone up again o. Hmm, Ghana."','"Which hostel? Ei, that place is nice. Too expensive for me 😂"'];
const BUS_LINES=['Did you understand anything in that lecture? Because me, I didn\'t.','This shuttle is always full at this time 😩','Are you going for the SRC concert?','I\'m trying to find the Print & Type place. Is it near the library?','Who is your hall rep? Mine never answers WhatsApp.'];
function vehAct(k){const p=P(),v=curVeh();if(!v)return;S.vcd=S.vcd||{};if(S.vcd[k]>S.min&&k!=='vradio')return toast('Give it a few minutes 🙂');S.vcd[k]=S.min+20;const n=p.needs,dr=VIN.people[0];
  if(k==='vchat'){n.social=clamp(n.social+6);n.fun=clamp(n.fun+3);if(dr)setGest(dr,'explain',3);setTimeout(()=>setGest(p,'laugh',2.2),900);toast(`🚗 Driver: ${pick(DRIVER_LINES)}`)}
  if(k==='vradio'){S.radio=!S.radio;if(S.radio){n.fun=clamp(n.fun+4);addBuff('music');[p,...VIN.people].forEach(h=>setGest(h,'nod',40));toast('🎶 The driver turns up the radio. Afrobeats! Everyone is nodding along.')}else{[p,...VIN.people].forEach(h=>h.gest=null);toast('🔉 Music down.')}S._vk=null;acts(true)}
  if(k==='vphone'){setGest(p,'phonecall',4);n.fun=clamp(n.fun+3);n.social=clamp(n.social+3);toast(v.kind==='bus'?'📱 You scroll TikTok. The student next to you is watching your screen 😂':'📱 You update the group chat: "On my way!"')}
  if(k==='bchat'){const nn=pick(S.npcs.filter(x=>!x.mate))||pick(S.npcs)||{};nn.met=true;nn.friend=clamp(nn.friend+4);n.social=clamp(n.social+8);const nb=VIN.people[1];if(nb)setGest(nb,'explain',3);setTimeout(()=>setGest(p,'nod',1.6,'smile'),700);try{ev('talk',{a:'chat',good:true})}catch(e){}
    toast(`🚌 You get talking with ${nn.name} (${nn.prog}): "${pick(BUS_LINES)}"`)}
  if(k==='bdoze'){n.energy=clamp(n.energy+6);setExpr(p,'sleep',10);toast('😴 You lean your head on the window and doze off. Don\'t miss your stop!')}
  hud()}
function glideTick(dt){const b=S&&S.busy,gl=b&&b.glide;if(!gl)return;gl.t=Math.min(1,gl.t+dt/.45);const e=gl.t<1?1-Math.pow(1-gl.t,3):1,p=P();
  if(gl.k==='i'){p.mesh.position.x=gl.x0+(gl.x1-gl.x0)*e;p.mesh.position.z=gl.z0+(gl.z1-gl.z0)*e}else{p.mesh.position.x=wx(gl.x0+(gl.x1-gl.x0)*e);p.mesh.position.z=wz(gl.z0+(gl.z1-gl.z0)*e)}if(gl.t>=1)b.glide=null}
function syncChar(c,dt,vis=true,x=wx(c.x),z=wz(c.y)){
  const g=c.mesh,dx=x-(c._lx??x),dz=z-(c._lz??z),dd=Math.hypot(dx,dz),moving=dd>.0008&&dd<3&&!c.lying;c._lx=x;c._lz=z;
  g.position.x=x;g.position.z=z;
  if(moving&&dt){c._v=dd/dt;c.phase+=dt*(Math.min(c._v,7)*2.3+2.4)}
  const want=moving?Math.atan2(dx,dz):c.face;
  if(want!=null){let d=want-g.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));g.rotation.y+=d*(dt?Math.min(1,dt*(moving?11:6)):1)}
  if(c.head&&S&&c!==S.p){const p=P();if(p&&p!==c&&!IS){const dx2=p.x-c.x,dy2=p.y-c.y,dd2=Math.hypot(dx2,dy2);
    if(dd2<130&&dd2>4&&!c.lying&&c.pose!=='swim'){let rel=Math.atan2(dx2,dy2)-g.rotation.y;rel=Math.atan2(Math.sin(rel),Math.cos(rel));c.lookY=Math.abs(rel)<1.9?clamp(rel,-.95,.95):null}else c.lookY=null}}
  posePerson(c,moving,dt);
  if(c.pose==='swim'&&!c.lying){g.position.x-=Math.sin(g.rotation.y)*.85;g.position.z-=Math.cos(g.rotation.y)*.85}
  g.visible=vis}
const dayCol=new THREE.Color(0x9fd3f0),duskCol=new THREE.Color(0xf0a070),nightCol=new THREE.Color(0x0e1631),sky=new THREE.Color();
const SKYK=[[0,0x050a1a,0x16203a],[5,0x0a1430,0x2a3050],[6,0x4a6fa5,0xf6c08a],[7.5,0x3d8fd6,0xcfe8f5],[16.5,0x3d8fd6,0xcfe8f5],[18,0x3a5a9a,0xf0a070],[19.2,0x1c2350,0xb06a60],[20.5,0x050a1a,0x16203a],[24,0x050a1a,0x16203a]].map(([h,a,b])=>[h,new THREE.Color(a),new THREE.Color(b)]);
const _c1=new THREE.Color(),_c2=new THREE.Color(),sunCol=new THREE.Color();
function skyAt(h){for(let i=0;i<SKYK.length-1;i++){const [h1,a1,b1]=SKYK[i],[h2,a2,b2]=SKYK[i+1];if(h>=h1&&h<=h2){const k=(h-h1)/(h2-h1);_c1.copy(a1).lerp(a2,k);_c2.copy(b1).lerp(b2,k);return}}}
let WATER_T=0;
function lighting(dt=0){const h=hour();const s=Math.max(0,Math.sin((h-5.8)/13*Math.PI));skyAt(h);
  sky.copy(_c2);SKY.u.top.value.copy(_c1);SKY.u.hor.value.copy(_c2);SKY.u.bot.value.copy(_c2).multiplyScalar(.6);
  scene.background=sky;scene.fog.color.copy(_c2);
  hemi.color.copy(_c1).lerp(new THREE.Color(0xffffff),.5);hemi.groundColor.setHex(0x4a3a26).lerp(_c2,.25);hemi.intensity=.14+.42*Math.min(1,s*1.6);
  sunCol.setHex(0xffd29a).lerp(new THREE.Color(0xfff6e8),Math.min(1,s*1.5));sun.color.copy(sunCol);const isDay=h>5.8&&h<18.8;sun.intensity=isDay?.25+1.15*s:.2;if(!isDay)sun.color.setHex(0x8fa8e8);
  const az=(h-6)/12*Math.PI,el=Math.max(.12,s);const dir=new THREE.Vector3(-Math.cos(az)*Math.cos(el*1.2),Math.sin(el*1.2)+.15,.45).normalize();
  {const md0=dir.clone().multiplyScalar(-1);md0.y=Math.abs(md0.y)+.5;md0.normalize();sun.position.copy(camT).addScaledVector(isDay?dir:md0,40)}sun.target.position.copy(camT);
  SKY.dome.position.copy(camera.position);SKY.stars.position.copy(camera.position);
  SKY.sunS.position.copy(camera.position).addScaledVector(dir,170);SKY.sunS.visible=h>5.6&&h<18.9;
  const md=dir.clone().multiplyScalar(-1);md.y=Math.abs(md.y)+.3;md.normalize();SKY.moonS.position.copy(camera.position).addScaledVector(md,170);
  const night=h>=18.5||h<6;SKY.moonS.visible=night;SKY.stars.material.opacity=night?Math.min(.9,(h>=18.5?h-18.5:6-h)*.8):0;
  SKY.cm.opacity=.85*(night?.25:1);SKY.cm.color.copy(_c2).lerp(new THREE.Color(0xffffff),.65);
  const t=performance.now()/1000;SKY.clouds.forEach((c,i)=>{const u=c.userData,x=((u.ox+t*1.2+i*40)%300+300)%300-150;c.position.set(camera.position.x+x,u.y,camera.position.z+u.oz)});
  WINLIT.emissive.setHex(night?0xffc066:0x000000);if(WINLIT.emissiveIntensity!==undefined)WINLIT.emissiveIntensity=night?.85:0;WINROY.emissive.setHex(night?0x7fb8e0:0);
  WATER_T+=dt;WATER.forEach(w=>{if(w.material.map){w.material.map.offset.x=WATER_T*.03;w.material.map.offset.y=Math.sin(WATER_T*.4)*.05}});
  nightLights.forEach(l=>{l.intensity=night?1.4:0;l.visible=night});if(STAGE.lights)STAGE.lights.forEach(o=>o.l.visible=o.l.intensity>0);const lampOn=h>=18.3||h<6.2;if(SKY.lampGlow)SKY.lampGlow.visible=lampOn;if(LAMPS.groundPool)LAMPS.groundPool.visible=lampOn;if(LAMPS.head)LAMPS.head.emissive.setHex(lampOn?0xffd9a0:0);
  if(lampOn&&LAMPS.pool.length){const cx=camT.x,cz=camT.z;LAMPS.pos.sort((a,b)=>((a.x-cx)**2+(a.z-cz)**2)-((b.x-cx)**2+(b.z-cz)**2));const NL=GFX==='high'?6:GFX==='medium'?3:0;LAMPS.pool.forEach((l,i)=>{const q=LAMPS.pos[i];l.visible=i<NL&&!!q;if(q){l.position.set(q.x,q.y-.3,q.z);l.intensity=1.5}})}else LAMPS.pool.forEach(l=>{l.intensity=0;l.visible=false});
  try{weatherTick(dt)}catch(e){console.error(e)}
  return sky}
const camT=new THREE.Vector3(),want=new THREE.Vector3();
function fitR(rend,cam,el){const w=el.clientWidth,h=el.clientHeight;if(!w||!h)return;const pr=rend.getPixelRatio();
  if(el.width!==Math.round(w*pr)||el.height!==Math.round(h*pr))rend.setSize(w,h,false);if(Math.abs(cam.aspect-w/h)>.001){cam.aspect=w/h;cam.updateProjectionMatrix()}}
function roomLighting(sk){const h=hour(),d=Math.max(0,Math.sin((h-5.8)/13*Math.PI)),on=IS.lightsOn,L=IS.L;
  L.dl.color.copy(sk).lerp(new THREE.Color(0xfff2dc),.6);L.dl.intensity=.08+.6*d;L.rh.intensity=(on?.42:.08)+.38*d;
  L.bulb.intensity=on?(d>.5?.55:1.15):0;if(IS.extraL)IS.extraL.forEach(l=>l.intensity=l.userData.base*(l.userData.alwaysOn||on||d<.3?1:0));if(IS.bulbMesh)IS.bulbMesh.material.color.setHex(on?0xfff2c8:0x777066);
  if(IS.clock){const m=S.min%1440,T2=Math.PI*2;IS.clock.hh.rotation.z=-((m/60)%12)/12*T2;IS.clock.mh.rotation.z=-(m%60)/60*T2;IS.clock.sh.rotation.z=-((performance.now()/1000)%60)/60*T2}}
function render(dt,snap){if(S&&S.p)try{thoughtTick()}catch(e){}
  const p=P();const sk=lighting(dt);
  SKY.dome.visible=!IS;
  if(IS){fitR(renderer,IS.cam,cv);if(IS.tick)IS.tick(dt);syncChar(p,dt,true,p.ix,p.iz);glideTick(dt);try{mpInTick(dt)}catch(e){}IS.people.forEach(q=>posePerson(q,!!q.mov,dt));IS.win.material.color.copy(sk);if(IS.fan)IS.fan.rotation.y+=dt*8;if(IS.L)roomLighting(sk);
    const TQ=S.talkN&&IS.people.find(q=>q.n===S.talkN);let k=(IS.cam.aspect<1?1.55:1.08)*zoom*Math.max(1,(IS.camW||IS.W)/6.6),cx=IS.cam.aspect<1?p.ix*.8+(IS.cx0??.3)*.2:p.ix*.15+(IS.cx0??.3),cz=p.iz*.12;
    if(TQ){k=.42;cx=(p.ix+TQ.x)/2;cz=(p.iz+TQ.z)/2+.6}want.set(cx+IS.W*.28*k,7.4*k,cz+IS.D*1.2*k);
    if(snap)IS.cam.position.copy(want);else IS.cam.position.lerp(want,Math.min(1,dt*3));IS.cam.lookAt(cx,.2,cz);renderer.render(IS.scene,IS.cam);return}
  fitR(renderer,camera,cv);
  syncChar(p,dt,!p.inCar);glideTick(dt);vehInterior(dt);S.npcs.forEach(n=>syncChar(n,dt,!n.hidden));try{mpRender(dt);chatBubbleTick(dt)}catch(e){}S.lecs.forEach(l=>syncChar(l,dt,!l.hidden&&!l.gone));DECOR.forEach(v=>{if(v.path){const q=v.path(performance.now()/1000);v.x=q.x;v.y=q.y}v.vis=v.when()&&!(NOBOTS&&(v.crowd||v.path));syncChar(v,dt,v.vis)});updStage();if(S.del&&S.del.rider)syncChar(S.del.rider,dt);if(QF)QF.forEach(f=>{if(f.on||f.mesh.visible)syncChar(f,dt,f.on)});
  const GM=S.busy&&S.busy.game,fo=GM?GM.focus():S.ride&&S.ride.phase==='drive'?(S.ride.lp||S.ride.pos):p.onBus?{x:p.onBus.bus.x,y:p.onBus.bus.y}:p;FXP.step(dt);swimFX(dt);bubbleTick(dt);fadeBuildings(fo.x,fo.y);const TN=S.talkN&&!S.talkN.hidden&&!S.ride?S.talkN:null;if(TN)camT.set((wx(p.x)+wx(TN.x))/2,0,(wz(p.y)+wz(TN.y))/2);else camT.set(wx(fo.x),0,wz(fo.y));
  const CV=curVeh(),VI=CV&&VIN.on,mob=camera.aspect<1;
  if(VI){const kv=(mob?1.25:1)*Math.min(1.3,Math.max(.7,zoom))*(CV.kind==="bus"?1.2:.72);want.set(camT.x,8.4*kv,camT.z+3.6*kv)}
  else{const k=(mob?1.35:WIDEV&&!TN?1.22:1)*(TN?.6:zoom)*(CV?1.25:S.ride||p.onBus?1.25:GM?GM.zoomOut:1);want.set(camT.x+(TN?1.4:0),(TN?7:8.6)*k,camT.z+8.2*k)}
  if(snap)camera.position.copy(want);else camera.position.lerp(want,Math.min(1,dt*(TN?2.5:4)));camera.lookAt(camT.x,VI?.4:TN?.6:.8,camT.z+(VI?(mob?1.1:.3):TN?1.6:0));
  occlude(dt,VI?CV.g:null);
  renderer.render(scene,camera)}
let hudT=0;
function update(dt){
  const p=P(),slow=(S.shuttleWait!=null||(S.ride&&['pickup','wait'].includes(S.ride.phase))||(S.del&&S.del.phase==='ride'))?.45:1;if(sharedClock())syncClock();else{S.min+=dt*MINPS*slow*(S._cm||1);decay(dt*MINPS*slow*(S._cm||1))}hourly();meetsCheck();
  updLights(dt);updRide(dt);updDelivery(dt);updBuses(dt);
  if(p.onBus){p.x=p.onBus.bus.x;p.y=p.onBus.bus.y}
  updQueue(dt);
  if(S.busy||rideBusy()||p.onBus||S.shuttleWait!=null){busyStep(dt);updateNPCs(dt);hudT+=dt;if(hudT>.25){hudT=0;hud();acts();drawMini();stageCheck()}return}
  let vx=(keys.ArrowRight||keys.d?1:0)-(keys.ArrowLeft||keys.a?1:0),vy=(keys.ArrowDown||keys.s?1:0)-(keys.ArrowUp||keys.w?1:0);
  if(IS){const mx=2.3,kb=vx||vy;
    if(kb){p.itarget=null;p.ipath=null}
    if(!p.itarget)p.ipath=null;else if(p.itarget!==p._ipt){p._ipt=p.itarget;p.ipath=findPath(iGrid(),p.ix,p.iz,p.itarget.x,p.itarget.z)}
    let dx=0,dz=0,last=0;
    if(kb){const l=Math.hypot(vx,vy);dx=vx/l;dz=vy/l}
    else if(p.ipath&&p.ipath.length){const q=p.ipath[0],d=Math.hypot(q.x-p.ix,q.y-p.iz);if(d<.02){p.ipath.shift();if(!p.ipath.length){p.ipath=null;p.itarget=null}}else{dx=(q.x-p.ix)/d;dz=(q.y-p.iz)/d;last=d}}
    if(dx||dz){p.spd=Math.min(mx,(p.spd||0)+mx*dt*5);const st=p.spd*dt;
      if(last&&st>=last){p.ix=p.ipath[0].x;p.iz=p.ipath[0].y;p.ipath.shift();if(!p.ipath.length){p.ipath=null;p.itarget=null}}
      else if(!slideI(p,dx*st,dz*st)&&!kb){p.ipath=null;p.itarget=null}}else p.spd=0}
  else{const mx=(p.needs.energy<10?110:170)*(p.hurry?1.35:1),kb=vx||vy;
    if(kb){p.target=null;p.path=null}
    if(!p.target)p.path=null;else if(p.target!==p._pt&&(!p.path||performance.now()-(p._ptT||0)>90)){p._pt=p.target;p._ptT=performance.now();p.path=findPath(campusGrid(),p.x,p.y,p.target.x,p.target.y)}
    let dx=0,dy=0,last=0;
    if(kb){const l=Math.hypot(vx,vy);dx=vx/l;dy=vy/l}
    else if(p.path&&p.path.length){const q=p.path[0],d=Math.hypot(q.x-p.x,q.y-p.y);if(d<.5){p.path.shift();if(!p.path.length){p.path=null;p.target=null}}else if(crossWait(p,q.x,q.y)){if(!p._cw){p._cw=1;toast('👀 Checking for cars before crossing…')}p.spd=Math.max(0,(p.spd||0)-mx*dt*6)}else{p._cw=0;dx=(q.x-p.x)/d;dy=(q.y-p.y)/d;last=d}}
    if(dx||dy){p.spd=Math.min(mx,(p.spd||0)+mx*dt*4);const st=p.spd*dt;
      if(last&&st>=last){p.x=p.path[0].x;p.y=p.path[0].y;p.path.shift();if(!p.path.length){p.path=null;p.target=null}}
      else if(!slideMove(p,dx*st,dy*st)&&!kb){const V=vehAt(p.x+dx*12,p.y+dy*12,7);p.vw=V?(p.vw||0)+dt:0;if(V&&p.vw>.6&&!p._dt){const q=p.path&&p.path[0],dt2=vehDetour(p,V,q?q.x:p.x,q?q.y:p.y);if(dt2){p.path.unshift(...dt2);p._dt=1;p.vw=0;setTimeout(()=>p._dt=0,1500)}}if(!V||p.vw>8||(S.ride&&S.ride.phase==='board')){p.vw=0;p.path=null;p.target=null}}else p.vw=0}else p.spd=0;
    p.x=clamp(p.x,10,MW-10);p.y=clamp(p.y,10,MH-10);pushOut(p)}
  updateNPCs(dt);try{goDoTick();mpFollowTick()}catch(e){console.error(e)}
  if(S.pending&&S.pending.length&&S.pending.some(q=>q.due<=S.min)){const due=S.pending.filter(q=>q.due<=S.min);S.pending=S.pending.filter(q=>q.due>S.min);due.forEach(q=>q.fn())}
  needWatch(dt);
  hudT+=dt;if(hudT>.25){hudT=0;hud();acts();drawMini();stageCheck()}
}
function loop(ts){const dt=Math.min(.05,(ts-last)/1000||0);last=ts;
  if(S&&!$('game').hidden){if(sharedClock()){S.speed=1;if(S.paused){syncClock();hourly()}}const sp=S.speed??1;if(sp>0){const n=[0,1,2,3][sp];S._cm=SPEEDS[sp]/n;for(let i=0;i<n;i++){if(!S.paused)update(dt);if(!IS)updTraffic(dt)}}else{hudT+=dt;if(hudT>.25){hudT=0;hud()}}render(dt)}
  if(pvOn)renderPreview(dt);requestAnimationFrame(loop)}
