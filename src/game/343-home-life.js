/* ================= home life: pyjamas, towels, and placing your own furniture =================
   - Going to sleep (or a nap) you change into pyjamas; you get dressed again when you wake up.
   - Showering or bathing you wrap a towel round yourself, and shower curtains / frosted glass hide you.
     Roommates sleeping or bathing do the same.
   - Furniture you buy for your room (rug, plant, fan, mirror, beanbag, fridge, gaming chair, ring light,
     water dispenser) is placed by you, Sims-style: drag it around the floor, rotate it, and put it down
     anywhere it fits. You can rearrange your room any time. */
const PJ_PAL=['sky','lilac','pink','navy','maroon','olive','heather'];
function pjLook(L,seed){return Object.assign({},L,{outfit:'pj',pal:PJ_PAL[Math.abs(Math.floor(seed||0))%PJ_PAL.length],shoes:'slides',bag:'none',extra:'none'})}
function towelLook(L){return Object.assign({},L,{outfit:'towel',pal:'white',shoes:'slides',bag:'none',extra:'none'})}
const SLEEPY=/^Sleeping|nap\b|Napping|Taking a nap/i,BATHY=/shower|bucket bath|bathtub/i;
/* you */
{const _sb=startBusy;startBusy=function(label,a,dur,done){const r=_sb.apply(this,arguments);try{const p=P(),b=S.busy;if(b&&b.label===label)p.bedYaw=a&&a.spot&&a.spot.yaw!=null&&a.pose==='lie'?a.spot.yaw:0;if(b&&b.label===label&&!p._lookBak){
  const k=SLEEPY.test(label)?'pj':BATHY.test(label)?'towel':null;if(k){p._lookBak=p.look;p.look=k==='pj'?pjLook(p.look,(p.name||'').length+3):towelLook(p.look);rebuildPlayer();p.noTurn=false;if(k==='pj')p.sleepStyle=null}}}catch(e){console.warn(e)}return r}}
{const _fb=finishBusy;finishBusy=function(){const p=P();const r=_fb.apply(this,arguments);try{if(p._lookBak&&!S.busy){p.look=p._lookBak;p._lookBak=null;rebuildPlayer()}}catch(e){console.warn(e)}return r}}
/* roommates and friends in the room */
{const _ai=addInPerson;addInPerson=function(look,label,x,z,ry,pose,o){o=o||{};try{if(o.lie&&o.n)look=pjLook(look,o.n.id||label.length);else if(pose==='shower')look=towelLook(look)}catch(e){}const q=_ai.call(this,look,label,x,z,ry,pose,o);if(q&&o.yaw!=null)q.bedYaw=o.yaw;return q}}
function swapLook(q,look){if(!q||!q.mesh||!IS)return;const old=q.mesh,h=makeHuman(look,{label:q.n&&(q.n.met||q.n.mate)?q.n.name:'',labelColor:'#f6f0e8'});h.g.position.copy(old.position);h.g.rotation.copy(old.rotation);
  IS.scene.remove(old);try{disposeTree(old)}catch(e){}IS.scene.add(h.g);Object.assign(q,{mesh:h.g,legs:h.legs,knees:h.knees,arms:h.arms,elbows:h.elbows,head:h.head,lids:h.lids,torso:h.torso});q._pv=null}
{const _ar=arrive;arrive=function(q,g){const r=_ar.apply(this,arguments);try{q.bedYaw=g&&g.lie?(g.yaw||0):0;if(g&&g.lie&&q.n&&!q._pj){q._pj=1;swapLook(q,pjLook(q.n.look,q.n.id||1))}}catch(e){}return r}}
{const _sw=startWalk;startWalk=function(q,A,g){try{if(q._pj&&q.n&&!(g&&g.lie)){q._pj=0;swapLook(q,q.n.look)}}catch(e){}return _sw.apply(this,arguments)}}

/* ---------------- place your own furniture, Sims-style ----------------
   Room items are bought from inside your room (HomeMart / Drip & Flex). The moment you buy one you go into
   build mode: drag it where you want it (floor things on the floor, wall things snap onto a wall), turn it,
   put it down. Cancel and it waits in a box in your room until you place it. "Arrange your room" moves
   anything later. Things that just sit on your desk or in your cupboard set themselves up. */
const MOVABLE={
  rug:{w:1.8,d:1.2,flat:1,build:g=>{const r=mesh(new THREE.PlaneGeometry(1.8,1.2),clothMat('kente'),0,.012,0,g);r.rotation.x=-Math.PI/2}},
  plant:{w:.6,d:.6,build:g=>{mesh(cyl(.15,.12,.3,10),lam(0xb5653a),0,.15,0,g);mesh(sph(.3,10,8),lam(0x3f8a3a),0,.55,0,g)}},
  fan:{w:.5,d:.5,build:g=>{mesh(cyl(.18,.2,.04,12),lam(0xeeeeee),0,.02,0,g);mesh(cyl(.02,.02,1.1,6),lam(0xcccccc),0,.57,0,g);const h=mesh(cyl(.22,.22,.08,16),lam(0xdddddd),0,1.15,.02,g);h.rotation.x=Math.PI/2}},
  mirror:{w:.6,d:.25,build:g=>{box(.55,1.55,.06,lam(0x6b4a2e),0,.8,0,g);box(.45,1.4,.02,lam(0xcfe3f0),0,.82,.04,g)}},
  beanbag:{w:.8,d:.8,obj:{id:'beanbag',label:'Beanbag',r:.75},spot:'bean',build:g=>{const bb=mesh(sph(.42,18,12),stdM(P().ledCol?0x3b2a6a:0x8e2a3a,.95),0,.22,0,g);bb.scale.set(1,.55,1)}},
  fridge:{w:.55,d:.55,obj:{id:'fridge',label:'Mini fridge',r:.7},build:g=>{box(.5,.82,.5,lam(0xe9ecef),0,.41,0,g);box(.5,.01,.5,lam(0x777777),0,.6,.001,g);box(.03,.22,.03,lam(0x9a9a9a),.2,.45,.26,g)}},
  gchair:{w:.6,d:.6,build:g=>{box(.55,.12,.55,lam(0x1b1b1b),0,.48,0,g);box(.55,.8,.1,lam(0xc8102e),0,.95,-.24,g);box(.4,.5,.11,lam(0x1b1b1b),0,.95,-.235,g);mesh(cyl(.04,.04,.42,6),lam(0x555555),0,.24,0,g)}},
  ringlight:{w:.45,d:.45,obj:{id:'ringlight',label:'Ring light',r:.65},build:g=>{mesh(cyl(.02,.02,1.5,6),lam(0x222222),0,.75,0,g);mesh(new THREE.TorusGeometry(.2,.03,8,24),new THREE.MeshBasicMaterial({color:0xfff6e0}),0,1.55,0,g)}},
  dispenser:{w:.4,d:.4,obj:{id:'dispenser',label:'Water dispenser',r:.6},build:g=>{box(.34,.9,.34,lam(0xf4f4f4),0,.45,0,g);mesh(cyl(.13,.13,.35,14),new THREE.MeshLambertMaterial({color:0x8fd3ff,transparent:true,opacity:.7}),0,1.07,0,g);[-.06,.06].forEach((dx,i)=>box(.04,.04,.03,lam(i?0x3b78c2:0xd9542b),dx,.7,.18,g))}},
  ps5:{w:.4,d:.35,build:g=>{box(.12,.42,.3,lam(0xf4f4f4),0,.21,0,g);box(.04,.42,.3,lam(0x111111),0,.21,0,g)}},
  tv:{w:1.2,d:.45,front:1.2,build:g=>{box(1.1,.5,.4,lam(0x3a2a20),0,.25,0,g);box(1.3,.75,.05,lam(0x111111),0,.9,-.12,g);box(1.2,.66,.01,basic(0x1d3a5a),0,.9,-.09,g);box(.3,.05,.2,lam(0x222222),0,.52,-.12,g);box(.8,.45,.06,lam(0x2c2c2c),0,.9,-.17,g)}},
  /* wall things: they snap onto the nearest wall at the right height */
  poster:{wall:1,w:.8,build:g=>mesh(new THREE.PlaneGeometry(.8,1),new THREE.MeshBasicMaterial({map:textTex('AFROBEATS',{w:256,h:320,font:'900 46px system-ui',color:'#1b1206',stroke:false,bg:'#e8b24a'})}),0,1.75,.01,g)},
  photos:{wall:1,w:1.2,build:g=>{for(let i=0;i<3;i++){const x=-.4+i*.4,y=1.95+(i%2)*.14;box(.28,.34,.03,lam(0x2b1d12),x,y,0,g);mesh(new THREE.PlaneGeometry(.22,.28),new THREE.MeshBasicMaterial({map:photoTex(i)}),x,y,.02,g)}}},
  clock:{wall:1,w:.4,build:g=>{const G=new THREE.Group();G.position.set(0,2.2,0);g.add(G);const fc=mesh(cyl(.16,.16,.03,28),lam(0xf7f4ec),0,0,0,G);fc.rotation.x=Math.PI/2;const rim=mesh(new THREE.TorusGeometry(.165,.012,8,28),lam(0x2b1d12),0,0,.012,G);void rim;
    const hand=(len,w,c)=>{const h=new THREE.Group();h.position.z=.024;box(w,len,.004,basic(c),0,len/2-.015,0,h);G.add(h);return h};IS.clock={hh:hand(.08,.012,0x111111),mh:hand(.12,.008,0x111111),sh:hand(.13,.003,0xc8102e)}}},
  shelf:{wall:1,w:1,build:g=>{[1.82,2.18].forEach((y,j)=>{box(.95,.03,.22,lam(0x6b4a2e),0,y,.11,g);for(let i=0;i<8;i++)box(.07,.22+(i%3)*.03,.16,lam([0x8e2a3a,0x2f6b9b,0x3c8a4a,0xd9a537,0x5a3e8a][(i+j*2)%5]),-.38+i*.1,y+.13,.11,g)})}},
  neon:{wall:1,w:1.5,build:g=>{const nm=(P().name||'UNILIFE').split(' ')[0].toUpperCase().slice(0,10);mesh(new THREE.PlaneGeometry(1.5,.42),new THREE.MeshBasicMaterial({map:textTex(nm+' ✦',{font:'900 64px system-ui',color:'#ff4fd8',stroke:false,bg:'rgba(0,0,0,0)'}),transparent:true}),0,2.05,.02,g);const gl=new THREE.PointLight(0xff4fd8,.7,3.2,1.8);gl.position.set(0,2.05,.35);g.add(gl)}},
  ac:{wall:1,w:.9,build:g=>{box(.85,.28,.2,lam(0xf4f4f4),0,2.32,.1,g);box(.7,.04,.02,basic(0x9ad8ff),0,2.22,.21,g)}}};
const itemName=id=>{const a=SHOP.find(x=>x.id===id)||(typeof DRIP!=='undefined'&&DRIP.room.find(x=>x.id===id));return a?a.name:id};
const footprint=(id,x,z,ry)=>{const M=MOVABLE[id],sw=Math.abs(Math.round(Math.sin(ry)))===1,w=sw?(M.d||.2):M.w,d=sw?M.w:(M.d||.2);return{x1:x-w/2,x2:x+w/2,z1:z-d/2,z2:z+d/2}};
const placedOrBoxed=p=>p.items.filter(id=>MOVABLE[id]&&((p.place&&p.place[id])||(p.boxed||[]).includes(id)));
/* when the room is built: things you placed are drawn where you put them; things still in their box aren't out yet */
{const _er=enterRoom0;enterRoom0=function(owner){const p=P(),mine=owner==='me',hide=mine?placedOrBoxed(p):[],all=[...new Set(hide.concat(PLACE.hideId?[PLACE.hideId]:[]))];
  const bak=p.items.slice();if(mine&&all.length)p.items=p.items.filter(i=>!all.includes(i));let r;
  try{r=_er.apply(this,arguments)}finally{if(mine&&all.length)p.items=bak}
  try{if(mine&&IS){hide.filter(id=>id!==PLACE.hideId&&p.place&&p.place[id]&&!(p.boxed||[]).includes(id)).forEach(id=>{const q=p.place[id];putItem(id,q.x,q.z,q.ry)});
    if((p.boxed||[]).length){const bx=box(.5,.36,.4,lam(0xc9a36a),-.2,.18,IS.D/2-.6,IS.scene);void bx;IS.objs.push({id:'boxes',label:'📦 Boxes to unpack',x:-.2,z:IS.D/2-1.1,r:.7})}}}catch(e){console.warn(e)}
  return r}}
function putItem(id,x,z,ry,ghost){const M=MOVABLE[id],g=new THREE.Group();M.build(g);g.position.set(x,0,z);g.rotation.y=ry||0;IS.scene.add(g);
  if(ghost){g.traverse(o=>{if(o.material){o.material=o.material.clone();o.material.transparent=true;o.material.opacity=.6;o.material.depthWrite=false}});return g}
  if(M.wall)return g;
  const f=footprint(id,x,z,ry||0);if(!M.flat)IS.obst.push(f);IS.grid=null;const fx=Math.sin(ry||0),fz=Math.cos(ry||0);
  if(M.obj){IS.objs=IS.objs.filter(o=>o.id!==M.obj.id);IS.objs.push({id:M.obj.id,label:M.obj.label,x:x+fx*.62,z:z+fz*.62,r:M.obj.r})}
  if(M.spot==='bean')IS.spots.bean={x,z,ry:ry||0,ly:-.2};
  if(id==='tv'){IS.tv=true;IS.tvAt={x,z};const vx=x+fx*1.45,vz=z+fz*1.45;IS.tvSpot={x:vx,z:vz,ry:Math.atan2(x-vx,z-vz)};IS.keep=[{x1:Math.min(x,vx)-.3,x2:Math.max(x,vx)+.3,z1:Math.min(z,vz)-.3,z2:Math.max(z,vz)+.3}];
    IS.objs=IS.objs.filter(o=>o.id!=='tv');IS.objs.push({id:'tv',label:'TV',x:(x+vx)/2,z:(z+vz)/2,r:1})}
  return g}
const PLACE={on:false,id:null,ghost:null,x:0,z:0,ry:0,hideId:null,fresh:false};
function startPlace(id,fresh){if(!IS||!IS.mine||!MOVABLE[id])return toast('Go to your room to arrange your furniture.');
  PLACE.hideId=id;PLACE.fresh=!!fresh;refreshRoom();setTimeout(()=>{if(!IS||!IS.mine){PLACE.hideId=null;return}PLACE.on=true;PLACE.id=id;S.paused=true;const p=P(),M=MOVABLE[id],q=p.place&&p.place[id];
    if(q){PLACE.x=q.x;PLACE.z=q.z;PLACE.ry=q.ry||0}else if(M.wall){PLACE.x=0;PLACE.z=-IS.D/2+.07;PLACE.ry=0}else{PLACE.x=0;PLACE.z=.4;PLACE.ry=0}
    PLACE.ghost=putItem(id,PLACE.x,PLACE.z,PLACE.ry,true);if(!M.wall)placeArrow(PLACE.ghost,M);placeUI();placeCheck()},700)}
/* a bright arrow on the floor shows which way the item is facing while you place it */
function placeArrow(g,M){const sh=new THREE.Shape();sh.moveTo(0,.26);sh.lineTo(.2,0);sh.lineTo(.08,0);sh.lineTo(.08,-.16);sh.lineTo(-.08,-.16);sh.lineTo(-.08,0);sh.lineTo(-.2,0);sh.lineTo(0,.26);
  const a=new THREE.Mesh(new THREE.ShapeGeometry(sh),new THREE.MeshBasicMaterial({color:0x35e07a,transparent:true,opacity:.9,depthWrite:false,side:THREE.DoubleSide}));a.rotation.x=-Math.PI/2;a.position.set(0,.03,(M.d||.4)/2+.28);a.renderOrder=5;a.userData.arrow=1;g.add(a)}
const FACING=ry=>{const k=((Math.round(ry/(Math.PI/2))%4)+4)%4;return['the front','the right','the back wall','the left'][k]};
/* which walls things can hang on: the back wall, and the solid part of the left wall away from the door */
function wallSnap(px,pz){const W=IS.W,D=IS.D,x0=IS.xmin??-W/2,opts=[{k:'b',d:Math.abs(pz+D/2),x:clamp(px,-W/2+.5,W/2-.5),z:-D/2+.07,ry:0}];
  if(IS.xmin==null)opts.push({k:'l',d:Math.abs(px-x0),x:x0+.07,z:clamp(pz,.5,D/2-.5),ry:Math.PI/2});return opts.sort((a,b)=>a.d-b.d)[0]}
function placeOK(){const M=MOVABLE[PLACE.id],W=IS.W,D=IS.D,x0=IS.xmin??-W/2,p=P();
  if(M.wall){const along=Math.abs(PLACE.ry)<.1?PLACE.x:PLACE.z,wallK=Math.abs(PLACE.ry)<.1?'b':PLACE.ry<0?'r':'l';
    if(wallK==="b"&&Math.abs(PLACE.x-(IS.winX??.1))<(M.w/2+1.1))return false;
    const door=IS.objs.find(o=>o.id==='door');if(wallK==='l'&&door&&Math.abs(PLACE.z-door.z)<M.w/2+.7)return false;
    for(const id in (p.place||{})){if(id===PLACE.id||!MOVABLE[id]||!MOVABLE[id].wall||!p.items.includes(id))continue;const q=p.place[id],k2=Math.abs(q.ry)<.1?'b':q.ry<0?'r':'l';if(k2!==wallK)continue;const a2=k2==='b'?q.x:q.z;if(Math.abs(a2-along)<(M.w+MOVABLE[id].w)/2+.05)return false}
    return true}
  const f=footprint(PLACE.id,PLACE.x,PLACE.z,PLACE.ry);if(f.x1<x0+.08||f.x2>W/2-.08||f.z1<-D/2+.08||f.z2>D/2-.08)return false;
  if(M.flat)return true;const pad=.04;if(IS.obst.some(o=>f.x1<o.x2-pad&&f.x2>o.x1+pad&&f.z1<o.z2-pad&&f.z2>o.z1+pad))return false;
  if(M.front){const fx=Math.sin(PLACE.ry),fz=Math.cos(PLACE.ry),cx=PLACE.x+fx*(M.front*.5+.35),cz=PLACE.z+fz*(M.front*.5+.35),h=M.front/2;
    if(cx-h<x0||cx+h>W/2||cz-h<-D/2||cz+h>D/2||IS.obst.some(o=>cx-.3<o.x2&&cx+.3>o.x1&&cz-.3<o.z2&&cz+.3>o.z1))return false}
  const door=IS.objs.find(o=>o.id==='door');if(door&&Math.hypot(PLACE.x-door.x,PLACE.z-door.z)<.95)return false;return true}
function placeCheck(){const ok=placeOK();if(PLACE.ghost){PLACE.ghost.position.set(PLACE.x,0,PLACE.z);PLACE.ghost.rotation.y=PLACE.ry;PLACE.ghost.traverse(o=>{if(o.userData&&o.userData.arrow){o.material.color.setHex(ok?0x35e07a:0xff5a4a);return}if(o.material&&o.material.color&&o.material._c0==null)o.material._c0=o.material.color.getHex();if(o.material&&o.material._c0!=null)o.material.color.setHex(ok?o.material._c0:0xff5a4a)})}
  const M=MOVABLE[PLACE.id],b=$('plOk');if(b)b.disabled=!ok;const h=$('plHint');if(h)h.textContent=(M.wall?'':`Facing ${FACING(PLACE.ry)} (green arrow). `)+(ok?'Looks good. Tap ✔ to put it here.':'')+(ok?'':M.wall?'Not over the window, the door or another wall item.':M.flat?'Keep it inside the room.':M.front?'Leave space in front of the TV to watch it.':'It doesn\'t fit there. Try another spot or turn it.')}
function placeUI(){let el=$('placeBar');if(!el){el=document.createElement('div');el.id='placeBar';document.body.appendChild(el)}const M=MOVABLE[PLACE.id];
  el.innerHTML=`<b>🛠️ ${esc(itemName(PLACE.id))}</b><small id="plHint">${M.wall?'Drag along a wall to hang it':'Drag on the floor to move it'}</small><div class="row" style="gap:8px;justify-content:center">${M.wall?(IS.xmin==null?'<button class="ghost sm" id="plWall">↔ Other wall</button>':''):'<button class="ghost sm" id="plRotL" aria-label="Turn left">⟲</button><button class="ghost sm" id="plRot" aria-label="Turn right">⟳</button>'}<button class="btn sm" id="plOk">✔ Put it here</button><button class="ghost sm" id="plNo">✖ ${PLACE.fresh?'Later':'Cancel'}</button></div>`;el.hidden=false;
  const turn=d=>{PLACE.ry=((Math.round(PLACE.ry/(Math.PI/2))+d)%4+4)%4*(Math.PI/2);placeCheck()};if($('plRot'))$('plRot').onclick=()=>turn(1);if($('plRotL'))$('plRotL').onclick=()=>turn(-1);
  if($('plWall'))$('plWall').onclick=()=>{const onBack=Math.abs(PLACE.ry)<.1,s2=onBack?wallSnap(IS.xmin??-IS.W/2,1):wallSnap(0,-IS.D/2);PLACE.x=s2.x;PLACE.z=s2.z;PLACE.ry=s2.ry;placeCheck()};
  $('plOk').onclick=()=>{if(!placeOK())return;const p=P(),id=PLACE.id;p.place=p.place||{};p.place[id]={x:+PLACE.x.toFixed(2),z:+PLACE.z.toFixed(2),ry:+PLACE.ry.toFixed(3)};p.boxed=(p.boxed||[]).filter(x=>x!==id);endPlace(true);toast(`✨ ${itemName(id)} placed!`)};
  $('plNo').onclick=()=>{const fresh=PLACE.fresh,id=PLACE.id;endPlace(false);if(fresh)toast(`📦 Your ${itemName(id).toLowerCase()} is in a box in your room. Tap the boxes to unpack it any time.`)}}
function endPlace(saved){PLACE.on=false;PLACE.id=null;PLACE.ghost=null;PLACE.hideId=null;PLACE.fresh=false;const el=$('placeBar');if(el)el.hidden=true;S.paused=false;refreshRoom();try{if(saved)ev('act',{l:'Decorating'})}catch(e){}}
/* while placing, finger/mouse on the room moves the item instead of walking */
['pointerdown','pointermove'].forEach(t=>window.addEventListener(t,e=>{if(!PLACE.on||!IS||e.target!==cv)return;if(t==='pointermove'&&!(e.buttons||e.pointerType==='touch'))return;e.stopImmediatePropagation();e.preventDefault();
  const w=toWorld(e);if(!w)return;if(MOVABLE[PLACE.id].wall){const s=wallSnap(w.x,w.z);PLACE.x=Math.round(s.x/.05)*.05;PLACE.z=Math.round(s.z/.05)*.05;PLACE.ry=s.ry}else{PLACE.x=Math.round(w.x/.05)*.05;PLACE.z=Math.round(w.z/.05)*.05}placeCheck()},true));
/* buying for your room only happens in your room, and goes straight into build mode */
const inMyRoomNow=()=>!!(IS&&IS.kind==='room'&&IS.mine);
function needRoom(what){closeSheet();story(`<div class="eyebrow">🛋️ ${esc(what)}</div><h3>Shop for your room from your room</h3><p class="scene">Furniture is delivered to your room and you choose where it goes. Head home first, then open ${esc(what)}.</p>`,
  [['🏠 Go to my room','g',()=>{try{walkTo(homeB());toast(`Heading home to ${homeB().name} 🚶`)}catch(e){}}],['OK','',()=>{}]])}
function afterRoomBuy(id){const p=P();if(MOVABLE[id]){p.boxed=(p.boxed||[]).concat([id]);closeSheet();toast(`📦 ${itemName(id)} delivered! Choose where it goes.`);startPlace(id,true)}
  else{closeSheet();toast(`📦 ${itemName(id)} delivered and set up ${/lamp|speaker|kettle|cooker|laptop|iron/.test(id)?'on your desk':'in your room'} ✨`);refreshRoom()}}
{const _dc=decorate;decorate=function(tab){if(!inMyRoomNow())return needRoom('HomeMart');return _dc.apply(this,arguments)}}
{const _db=dripBuy;dripBuy=function(it,tab){if(it&&it.kind==='room'&&!inMyRoomNow())return needRoom('Drip & Flex');return _db.apply(this,arguments)}}
/* "Arrange your room" and the boxes in your room */
function arrangeSheet(){const p=P(),own=p.items.filter(id=>MOVABLE[id]);if(!own.length)return toast('Buy something for your room on HomeMart first.');
  placeSheet('🛠️ What do you want to move?',own.map(id=>`${(p.boxed||[]).includes(id)?'📦 ':''}${itemName(id)}${(p.boxed||[]).includes(id)?' · still in its box':MOVABLE[id].wall?' · on the wall':''}`),i=>{closeSheet();startPlace(own[i],(p.boxed||[]).includes(own[i]))})}
{const _ra=roomActions;roomActions=function(){const a=_ra.apply(this,arguments);try{if(inMyRoomNow()&&!S.busy){const p=P(),bx=(p.boxed||[]).filter(id=>p.items.includes(id));
  if(bx.length)a.unshift([`📦 Unpack: ${itemName(bx[0])}${bx.length>1?` (+${bx.length-1} more)`:''}`,()=>startPlace(bx[0],true),null,'b']);if(p.items.some(id=>MOVABLE[id]))a.push(['🛠️ Arrange your room (move furniture)',()=>arrangeSheet()])}}catch(e){}return a}}
