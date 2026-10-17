/* ================= traffic, rides, food delivery ================= */
const HROADS=[[420,0,MW],[900,0,MW],[1560,0,1600],[2350,0,MW]],HY=HROADS.map(r=>r[0]),VX=[400,1600,2550,3850];
function makeCar(col,taxi){if(taxi===2)return makeOkada();if(taxi===3)return makeTrotro();return makeCarModel(taxi?pick([0x2f6bb5,0x8e2a3a,0x2fa84f,0xd8d8d8,0x222222]):col,taxi)}
function makeCar_old(col,taxi){const g=new THREE.Group();box(1.9,.45,.9,col,0,.42,0,g);box(1.1,.38,.84,0x1d2a36,-.05,.82,0,g);
  [[-.6,.45],[.6,.45],[-.6,-.45],[.6,-.45]].forEach(([x,z])=>{const w=mesh(cyl(.17,.17,.12,10),lam(0x111111),x,.18,z,g);w.rotation.x=Math.PI/2});
  box(.04,.12,.7,basic(0xfff3c4),.96,.45,0,g);box(.04,.1,.7,basic(0xd33a2a),-.96,.45,0,g);if(taxi){box(.3,.12,.18,0xf4c430,0,1.07,0,g);box(1.92,.08,.92,0x222222,0,.55,0,g)}
  g.userData.doors=[1,-1].map(sd=>{const pv=new THREE.Group();pv.position.set(.36,.6,sd*.458);g.add(pv);box(.6,.34,.03,col,-.3,0,0,pv);box(.42,.17,.035,0x1d2a36,-.3,.13,0,pv);return pv});scene.add(g);return g}
function makeBike(){const g=new THREE.Group();box(.9,.25,.2,0xc8322b,0,.45,0,g);[-.38,.38].forEach(x=>{const w=mesh(cyl(.2,.2,.08,12),lam(0x111111),x,.2,0,g);w.rotation.x=Math.PI/2});
  mesh(cyl(.13,.15,.5,10),lam(0x2f7a4a),-.05,.85,0,g);mesh(sph(.13,10,8),lam(0x2f7a4a),-.05,1.22,0,g);box(.4,.4,.4,0x2f7a4a,-.42,.85,0,g);scene.add(g);return g}
function placeCar(g,x,y,dx,dy){g.position.set(wx(x),0,wz(y));g.rotation.y=Math.atan2(dx,dy)-Math.PI/2}
const ROUTES=[[[400,420],[1600,420],[1600,900],[400,900]],[[1600,420],[2550,420],[2550,900],[1600,900]],[[2550,420],[3850,420],[3850,900],[2550,900]],[[2550,900],[3850,900],[3850,2350],[2550,2350]],[[400,900],[1600,900],[1600,2350],[400,2350]],[[1600,2350],[2550,2350],[2550,900],[1600,900]],[[400,1560],[1600,1560],[1600,2350],[400,2350]]];const ROUTES_OLD=[[[1470,615],[1800,615],[1800,975],[1470,975]],[[365,975],[1170,975],[1170,1274],[365,1274]],[[1170,615],[365,615],[365,280],[1170,280]],[[1470,615],[1170,615],[1170,975],[1470,975]]];
const perim=rt=>{let s=0;for(let i=0;i<rt.length;i++){const a=rt[i],b=rt[(i+1)%rt.length];s+=Math.hypot(b[0]-a[0],b[1]-a[1])}return s};
function along(rt,d){d=((d%perim(rt))+perim(rt))%perim(rt);for(let i=0;i<rt.length;i++){const a=rt[i],b=rt[(i+1)%rt.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(d<=L){const t=d/L;return{x:a[0]+(b[0]-a[0])*t,y:a[1]+(b[1]-a[1])*t,dx:(b[0]-a[0])/L,dy:(b[1]-a[1])/L}}d-=L}return{x:rt[0][0],y:rt[0][1],dx:1,dy:0}}
const TRAFFIC=[[0,0,0xf4c430,1],[0,.5,0x2f6bb5,0],[1,.3,0xd8d8d8,2],[2,.1,0xf4c430,1],[2,.6,0x8e2a3a,3],[3,.2,0x222222,0],[3,.7,0xf4c430,1],[4,.4,0x2fa84f,3],[5,.1,0xf4c430,1],[5,.6,0xd8d8d8,2],[1,.8,0xd8d8d8,2],[6,.75,0xd8d8d8,3],[6,.3,0x2f6bb5,0]].map(([r,o,c,t])=>({route:ROUTES[r],d:o*perim(ROUTES[r]),g:makeCar(c,t),sp:R(110,150)}));
function blockedAhead(x,y,dx,dy,look,self){const ax=x+dx*look,ay=y+dy*look,p=P();if(self){self.byCar=false;self.byP=null}
  if(!p.inCar&&!IS&&Math.hypot(p.x-ax,p.y-ay)<30){if(self)self.byP=p;return 'p'}
  for(const n of S.npcs)if(!n.hidden&&Math.hypot(n.x-ax,n.y-ay)<26){if(self)self.byP=n;return 'p'}
  if(QF)for(const f of QF)if(f.on&&Math.hypot(f.x-ax,f.y-ay)<24)return 'p';
  if(S.del&&S.del.rider&&Math.hypot(S.del.rider.x-ax,S.del.rider.y-ay)<24)return 'p';
  const hit=()=>{if(self)self.byCar=true;return 'c'},gap=(cx,cy,ohl)=>{const ox=cx-x,oy=cy-y,a=ox*dx+oy*dy,l=Math.abs(-ox*dy+oy*dx);return a>0&&l<34&&a-ohl<look+22};
  for(const c of TRAFFIC)if(c!==self&&c.px!=null&&c.dx*dx+c.dy*dy>.7&&gap(c.px,c.py,VH.car[0]))return hit();
  for(const b of BUSES)if(b!==self&&b.x!=null&&(b.dx??0)*dx+(b.dy??0)*dy>.7&&gap(b.x,b.y,VH.bus[0]))return hit();
  const r=S.ride;if(r&&r.lp&&r.dir&&r!==self&&r.dir.x*dx+r.dir.y*dy>.7&&gap(r.lp.x,r.lp.y,VH.car[0]))return hit();
  return false}
const RAGE_P=['"Massa, the road is not your bedroom o!"','"Ei! You want to die before graduation?!"','"Look left, look right! Did they not teach you?"','"Chale, move! I have passengers!"','"Is it your father\'s road?!"'];
const RAGE_C=['"Trotro driver: \'Move that thing, you are blocking everybody!\'"','"\'Massa, the light is green! Are you sleeping?\'"','"\'Ah ah! Who gave you licence?\'"','"\'Paa, drive or park, make you choose one!\'"'];
function honk(o,txt){const g=o.g;if(!g)return;rageBubble(g,txt);const d=g.position.distanceTo(camT);if(d<18&&!IS)honkSound(1-d/18)}
function honkSound(vol){try{ACX=ACX||new (window.AudioContext||window.webkitAudioContext)();const t=ACX.currentTime,gn=ACX.createGain();gn.gain.setValueAtTime(0,t);gn.gain.linearRampToValueAtTime(.06*vol,t+.02);gn.gain.setValueAtTime(.06*vol,t+.22);gn.gain.linearRampToValueAtTime(0,t+.28);gn.connect(ACX.destination);
  [392,494].forEach(f=>{const o=ACX.createOscillator();o.type='square';o.frequency.value=f;o.connect(gn);o.start(t);o.stop(t+.3)})}catch(e){}}
const BUBS=[];function rageBubble(g,txt){let b=BUBS.find(x=>!x.on);if(!b){const c=document.createElement('canvas');c.width=256;c.height=96;const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false,transparent:true}));sp.renderOrder=998;sp.scale.set(1.9,.71,1);scene.add(sp);b={sp,c,on:false};BUBS.push(b)}
  const x=b.c.getContext('2d');x.clearRect(0,0,256,96);x.fillStyle='rgba(255,255,255,.96)';x.beginPath();x.roundRect?x.roundRect(4,4,248,70,18):x.rect(4,4,248,70);x.fill();x.beginPath();x.moveTo(110,72);x.lineTo(128,94);x.lineTo(140,72);x.fill();
  x.fillStyle='#c0392b';x.font='800 40px system-ui, Apple Color Emoji, Segoe UI Emoji';x.textAlign='center';x.textBaseline='middle';x.fillText(txt,128,40);b.sp.material.map.needsUpdate=true;b.on=true;b.g=g;b.t=0;b.sp.visible=true}
function bubbleTick(dt){BUBS.forEach(b=>{if(!b.on)return;b.t+=dt;b.sp.position.set(b.g.position.x,2.6+Math.min(.3,b.t*.6),b.g.position.z);b.sp.material.opacity=b.t>1.4?Math.max(0,1-(b.t-1.4)*2):1;if(b.t>1.9){b.on=false;b.sp.visible=false}})}
function nearMiss(o,who){const p=P(),fast=(o.v||0)>70;if(!fast&&who!==p&&Math.random()<.6)return;honk(o,fast?'📯 BEEP!!':'📯 Beep');
  if(who===p){if(fast){addBuff('shaken');p.needs.fun=clamp(p.needs.fun-3);setGest(p,'save',.8,'surprised');toast(`🚗💨 A car screeches to a stop right in front of you! Driver: ${pick(RAGE_P)}`)}else if(o.g&&o.g.position.distanceTo(camT)<16){addBuff('honked');toast(`📯 Driver: ${pick(RAGE_P)}`)}}
  else if(who&&who.mesh){setGest(who,fast?'save':'cross',1.2,'surprised');setTimeout(()=>setGest(who,pick(['facepalm','cross','point']),1.6,'frown'),900)}}
function yieldSpeed(o,blocked,sp,dt){if(blocked==='p'){if(!o.pb){o.pb=1;nearMiss(o,o.byP)}o.ign=0;o.wt=(o.wt||0)+dt;if(o.wt>4&&!o.honk){o.honk=1;honk(o,'📯 Move!');if(o.byP===P()&&o.g&&o.g.position.distanceTo(camT)<16){addBuff('honked');toast(`📯 ${pick(RAGE_P)}`)}}}
  else o.pb=0;
  if(blocked==='c'&&!o.cb){o.cb=1;if(Math.random()<.5&&o.g&&o.g.position.distanceTo(camT)<16){honk(o,pick(['📯 BEEP!','😡 Move!','📯 Pip pip!']));if(Math.random()<.35)toast(`🚦 ${pick(RAGE_C)}`)}}else if(blocked!=='c')o.cb=0;
  if(blocked==='p'){}
  else if(blocked&&!(o.ign>0)){o.honk=0;o.wt=(o.wt||0)+dt;if(o.wt>2.5){o.ign=4;o.wt=0;if(blocked==='c'&&o.route&&o.lo!=null)o.ov=3.6}}else{o.wt=0;o.honk=0}if(o.ign>0)o.ign-=dt;
  if(o.ov>0&&blocked!=='p')blocked=o.lo>-12;
  const stop=o.ov>0&&blocked!=='p'?blocked:blocked&&(blocked==='p'||!(o.ign>0));if(o.v==null)o.v=sp;o.v+=((stop?0:sp)-o.v)*Math.min(1,dt*(stop?7:1.3));return o.v}
/* traffic lights: junction x,y + half-widths of the vertical (vhw) and horizontal (hhw) roads */
const JUNCS=[[400,420,30,30],[1600,420,30,30],[2550,420,30,30],[3850,420,30,30],[400,900,30,30],[1600,900,30,30],[2550,900,30,30],[3850,900,30,30],[400,2350,30,30],[1600,2350,30,30],[2550,2350,30,30],[3850,2350,30,30],[400,1560,30,30],[1600,1560,30,30]].map(([x,y,vhw,hhw],i)=>({x,y,vhw:RHW,hhw:RHW,off:i*4.3}));
let TL_T=0;const TL_CYC=18;
function lightState(J,axis){const t=(TL_T+J.off)%TL_CYC,ph=t<7?'EWg':t<9?'EWa':t<16?'NSg':'NSa';return ph[0]===axis[0]?(ph[2]==='g'?'green':'amber'):'red'}
function redAhead(x,y,dx,dy,front=0){for(const J of JUNCS){const rx=J.x-x,ry=J.y-y,al=rx*dx+ry*dy-front,lat=Math.abs(rx*dy-ry*dx);if(lat>48)continue;
  const ax=Math.abs(dx)>Math.abs(dy)?'EW':'NS',hw=ax==='EW'?J.vhw:J.hhw;if(al>hw+18&&al<hw+75){const st=lightState(J,ax);if(st==='red'||(st==='amber'&&al>hw+40))return true}}return false}
