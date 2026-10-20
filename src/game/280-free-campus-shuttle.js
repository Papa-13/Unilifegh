/* ================= free campus shuttle ================= */
const SH_ROUTE=KP([[600,330],[4400,330],[4400,1000],[2000,1000],[2000,2150],[4400,2150],[4400,2800],[600,2800]]);
function projD(rt,x,y){let acc=0,best=0,bd=1e9;for(let i=0;i<rt.length;i++){const a=rt[i],b=rt[(i+1)%rt.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);
  const t=clamp(((x-a[0])*(b[0]-a[0])+(y-a[1])*(b[1]-a[1]))/(L*L),0,1),px=a[0]+(b[0]-a[0])*t,py=a[1]+(b[1]-a[1])*t,dd=Math.hypot(px-x,py-y);if(dd<bd){bd=dd;best=acc+t*L}acc+=L}return best}
const SH_PER=perim(SH_ROUTE);
const SH_STOPS=(()=>{const L=[],P=perim(SH_ROUTE),sn=b=>b.name.split(' · ')[0].replace(' (private)','');for(let d=180;d<P-120;d+=520){const q=along(SH_ROUTE,d);
    const near=B.filter(b=>!b.open||['taxi','trotro','terminal','parade','lake','market'].includes(b.id)).map(b=>({b,dd:Math.hypot(b.door[0]-q.x,b.door[1]-q.y)})).filter(o=>o.dd<420).sort((a,b)=>a.dd-b.dd).slice(0,2).map(o=>sn(o.b));
    const z=zoneOf(q.x+(-q.dy)*120,q.y+q.dx*120);L.push([near.length?near.join(' · '):z,q.x,q.y])}return L})().map(([name,x,y],i)=>{
  /* keep the shelter on the pavement: slide it along the route until it is clear of every road (junctions, side streets) */
  const offRoad=(x,y)=>!ROADS.some(([rx,ry,w,h])=>x>rx-26&&x<rx+w+26&&y>ry-26&&y<ry+h+26);
  let d=projD(SH_ROUTE,x,y),q=along(SH_ROUTE,d);for(let k=0;k<12;k++){const sx=q.x-q.dy*(RHW+26),sy=q.y+q.dx*(RHW+26);if(offRoad(sx,sy))break;d=(d+(k%2?-1:1)*(k+1)*45+SH_PER)%SH_PER;q=along(SH_ROUTE,d)}
  const ox=-q.dy,oy=q.dx;return{i,name,d,x:q.x,y:q.y,sx:q.x+ox*(RHW+26),sy:q.y+oy*(RHW+26),ox,oy}});
function makeBus(){return makeBusModel()}
function makeBus_old(){const g=new THREE.Group();box(3.4,1.05,1.15,0xf4f1ea,0,.85,0,g);box(3.42,.18,1.17,0x8e2a3a,0,.48,0,g);box(3.1,.42,1.17,0x24323f,0,1.08,0,g);box(.04,.55,.95,0x24323f,1.71,1.0,0,g);
  [[-1.1,.58],[1.1,.58],[-1.1,-.58],[1.1,-.58]].forEach(([x,z])=>{const w=mesh(cyl(.24,.24,.14,12),lam(0x111111),x,.25,z,g);w.rotation.x=Math.PI/2});
  box(.04,.12,.8,basic(0xfff3c4),1.72,.55,0,g);g.userData.door=box(.56,.92,.03,0x1b2630,1.2,.8,.59,g);box(.46,.38,.01,0x9fd3f0,0,.2,-.02,g.userData.door);
  [[.59,0],[-.59,Math.PI]].forEach(([z,r])=>{const sg=mesh(new THREE.PlaneGeometry(2.8,.28),new THREE.MeshBasicMaterial({map:textTex('CAMPUS SHUTTLE · FREE',{w:768,h:80,font:'900 46px system-ui',color:'#ffffff',stroke:false,bg:'#8e2a3a'})}),0,.72,z,g);sg.rotation.y=r});
  scene.add(g);return g}
SH_STOPS.forEach(st=>{let tight=solidAt(st.sx,st.sy,10)||B.some(b=>!b.open&&st.sx>b.x-12&&st.sx<b.x+b.w+12&&st.sy>b.y-12&&st.sy<b.y+b.h+12);
  if(tight&&!ROADS.some(([rx,ry,w,h])=>st.x+st.ox*(RHW+12)>rx&&st.x+st.ox*(RHW+12)<rx+w&&st.y+st.oy*(RHW+12)>ry&&st.y+st.oy*(RHW+12)<ry+h)){st.sx=st.x+st.ox*(RHW+12);st.sy=st.y+st.oy*(RHW+12)}else tight=false;const g=new THREE.Group();g.position.set(wx(st.sx),0,wz(st.sy));g.rotation.y=Math.atan2(st.ox,st.oy);
  if(tight){mesh(cyl(.035,.035,2.2,6),lam(0x666666),0,1.1,0,g);box(.5,.36,.03,0x8e2a3a,0,2.05,0,g);box(.36,.2,.035,0xffffff,0,2.05,.001,g)}
  else{box(1.6,.08,.7,0x8e2a3a,0,1.9,0,g);[-.7,.7].forEach(x=>mesh(cyl(.04,.04,1.9,6),lam(0x666666),x,.95,-.25,g));box(1.3,.08,.35,0x7a5a3a,0,.45,-.15,g);box(1.4,.9,.04,0x9fd3f0,0,1.2,-.33,g)}
  const t=sprite('🚌 '+st.name,'#ffffff',.7);t.position.set(0,2.5,0);g.add(t);scene.add(g)});
(function scenery(){let sd=7;const rnd=()=>(sd=(sd*16807)%2147483647)/2147483647;const sc=scene;
  const tree=(x,y,z)=>{solidC(x,y,11*z);niceTree(sc,x,y,z*.95)};
  const palm=(x,y)=>{solidC(x,y,8);nicePalm(sc,x,y)};
  const onRoad=(x,y,m)=>ROADS.some(([rx,ry,w,h])=>x>rx-m&&x<rx+w+m&&y>ry-m&&y<ry+h+m);
  const nearB=(x,y,m)=>B.some(b=>x>b.x-m&&x<b.x+b.w+m&&y>b.y-m&&y<b.y+b.h+m||Math.hypot(b.door[0]-x,b.door[1]-y)<m+40);
  const nearStop=(x,y)=>SH_STOPS.some(st=>Math.hypot(st.sx-x,st.sy-y)<70);
  // street lamps along every road
  ROADS.forEach(([rx,ry,w,h])=>{const horiz=w>h;for(let t=150;t<(horiz?w:h)-50;t+=300){const side=(Math.round(t/300)%2)?1:-1,x=horiz?rx+t:rx+w/2+side*(w/2+14),y=horiz?ry+h/2+side*(h/2+14):ry+t;
    if(onRoad(x,y,0)||nearB(x,y,12)||nearStop(x,y)||solidAt(x,y,14)||JUNCS.some(J=>Math.hypot(J.x-x,J.y-y)<70))continue;solidC(x,y,5);niceLamp(sc,x,y,horiz?(side>0?Math.PI/2:-Math.PI/2):(side>0?Math.PI:0))}});
  // trees and palms in open grass
  let n=0;for(let y=50;y<MH-40;y+=100)for(let x=50;x<MW-40;x+=100){if(n>520)break;const px=x+(rnd()-.5)*60,py=y+(rnd()-.5)*60;
    if(rnd()<.5&&!onRoad(px,py,26)&&!nearB(px,py,45)&&!nearStop(px,py)&&!solidAt(px,py,30)){rnd()<.3?palm(px,py):tree(px,py,.8+rnd()*.4);n++}}
  // evening lights in the new areas
  [[2075,1150],[1000,1590],[1500,2550],[3150,1300],[2075,2250]].map(([x,y])=>[x*KM,y*KM]).forEach(([x,y])=>{const L=new THREE.PointLight(0xffc77a,0,12,1.6);L.position.set(wx(x),2.8,wz(y));sc.add(L);nightLights.push(L)});
})();
const BUSES=[0,1/6,2/6,3/6,4/6,5/6].map(o=>({d:o*SH_PER,wait:0,last:-1,at:-1,g:makeBus()}));
SH_STOPS.forEach(st=>{const q=along(SH_ROUTE,st.d);st.fx=q.dx;st.fy=q.dy});
const rush=()=>{const h=hour();return wd()<5&&((h>=7&&h<8.7)||(h>=12.5&&h<14.3)||(h>=16.5&&h<18))};
const qSlot=(st,i)=>({x:st.x+st.ox*(RHW+16)+st.fx*(30-i*15),y:st.y+st.oy*(RHW+16)+st.fy*(30-i*15)});
const busDoorPt=st=>({x:st.x+st.ox*(BUSDOCK+40)+st.fx*60,y:st.y+st.oy*(BUSDOCK+40)+st.fy*60});
let QF=null,QST=-1,QT=0;
function ensureQF(){if(QF)return;QF=[];for(let i=0;i<9;i++){const L=Object.assign(randomLook(Math.random()<.5?'m':'f'),{bag:pick(['backpack','backpack','tote'])});const h=makeHuman(L,{});scene.add(h.g);h.g.visible=false;
  QF.push({mesh:h.g,legs:h.legs,knees:h.knees,arms:h.arms,elbows:h.elbows,head:h.head,lids:h.lids,torso:h.torso,x:0,y:0,phase:0,id:i*1.3,pose:'phone',face:0,on:false})}}
function updQueue(dt){if(IS)return;ensureQF();const p=P();
  let st=S.shuttleWait!=null?SH_STOPS[S.shuttleWait]:SH_STOPS.reduce((a,b)=>Math.hypot(b.sx-p.x,b.sy-p.y)<Math.hypot(a.sx-p.x,a.sy-p.y)?b:a);
  if(S.shuttleWait==null&&Math.hypot(st.sx-p.x,st.sy-p.y)>420)st=null;
  if(!st){if(QST!==-1){QF.forEach(f=>{f.on=false;f.board=false});QST=-1;S.Q=null}return}
  if(QST!==st.i||!S.Q){QF.forEach(f=>{f.on=false;f.board=false});QST=st.i;S.Q={st,list:[]};const n=rush()?RI(4,7):RI(0,2);
    for(let i=0;i<n;i++){const f=QF[i],q=qSlot(st,i);f.on=true;f.x=q.x;f.y=q.y;f.pose=pick(['phone','idle','phone','talk']);S.Q.list.push(f)}}
  const Q=S.Q,fw=Math.atan2(st.fx,st.fy);QT+=dt;
  if(rush()&&QT>6&&Q.list.length<8){QT=0;const f=QF.find(f=>!f.on);if(f){const q=qSlot(st,Q.list.length);f.on=true;f.board=false;f.x=q.x+st.ox*60;f.y=q.y+st.oy*60;f.pose='phone';Q.list.push(f)}}
  if(S.shuttleWait===st.i&&!Q.list.includes('P'))Q.list.push('P');
  if(S.shuttleWait==null&&!S.pBoard)Q.list=Q.list.filter(x=>x!=='P');
  Q.list.forEach((f,i)=>{const isP=f==='P',o=isP?p:f,t=(isP?S.pBoard:f.board)?busDoorPt(st):qSlot(st,i),d=Math.hypot(t.x-o.x,t.y-o.y);
    if(d>1.5){const s2=Math.min(d,75*dt);o.x+=(t.x-o.x)/d*s2;o.y+=(t.y-o.y)/d*s2}else if(!(isP?S.pBoard:f.board)){o.face=fw;if(isP)p.pose='phone'}});
  const bu=BUSES.find(b=>b.board&&b.at===st.i);if(!bu)return;const Bd=bu.board;Bd.t+=dt;
  if(Bd.cur){const o=Bd.cur==='P'?p:Bd.cur,dp=busDoorPt(st);if(Math.hypot(o.x-dp.x,o.y-dp.y)<3){
      if(Bd.cur==='P'){p.inCar=true;p.onBus={bus:bu,dest:S.pDest};S.shuttleWait=null;S.pBoard=false;p.pose=null;toast(`You climb on. On the shuttle to ${SH_STOPS[S.pDest].name}… 🚌`)}else{Bd.cur.on=false;Bd.cur.board=false}
      Q.list.shift();Bd.cur=null;Bd.n++;Bd.t=0}return}
  if(Bd.t<.3||S.paused)return;const nx=Q.list[0];
  if(!nx||Bd.n>=Bd.cap){if(nx&&Q.list.includes('P'))toast(`🚌 The shuttle is full! ${Q.list.indexOf('P')} ahead of you. Wait for the next one…`);bu.board=null;bu.wait=.9;return}
  if(nx==='P'){Bd.t=-999;story(`<div class="eyebrow">Free campus shuttle · ${esc(st.name)}</div><h3>It's your turn. Where are you going?</h3><p class="scene">The driver nods at you. The bus is packed with students holding handouts and laptops.</p>`,
      SH_STOPS.filter(x=>x.i!==st.i).map(x=>[x.name,'',()=>{S.pDest=x.i;S.pBoard=true;Bd.cur='P';Bd.t=0}]).concat([['Not this one','',()=>{Q.list.shift();S.shuttleWait=null;p.pose=null;Bd.t=0;acts(true)}]]));return}
  nx.board=true;Bd.cur=nx}
function busArrived(bu,st){const p=P();
  if(p.onBus&&p.onBus.bus===bu&&p.onBus.dest===st.i){const dp=busDoorPt(st);p.onBus=null;p.inCar=false;p.pose=null;p.x=dp.x;p.y=dp.y;p.target={x:st.sx+st.ox*14,y:st.sy+st.oy*14};bu.wait=Math.max(bu.wait,2.2);toast(`You step off at ${st.name}. Free ride, no wahala. 🚌`);acts(true)}
  if(st.i===QST&&S.Q&&S.Q.list.length){bu.board={cap:rush()?RI(2,5):RI(5,10),t:0,n:0,cur:null};bu.wait=999}}
let BVL=null;function updBuses(dt){BVL=vehicles();BUSES.forEach(bu=>{
  if(bu.wait>0){bu.wait-=dt;if(bu.wait<=0)bu.at=-1}
  else{const q00=lanePt(SH_ROUTE,bu.d,bu.lo??LANE);let [bx,by]=ovTick(bu,SH_ROUTE,q00.x,q00.y,q00.dx,q00.dy,VH.bus[0],VH.bus[1],BVL||vehicles(),dt);const lo=bu.lo,q0=lanePt(SH_ROUTE,bu.d,lo);bx=q0.x;by=q0.y;const red=bu.ov!==1&&redAhead(bx,by,q0.dx,q0.dy,88),pb=blockedAhead(bx,by,q0.dx,q0.dy,96,bu)==='p';bu.stuck=(bu.v<2&&!red)?(bu.stuck||0)+dt:0;
    const free=juncGate(bu,bx,by,q0.dx,q0.dy,VH.bus[0],VH.bus[1],freeAhead(bu,bx,by,q0.dx,q0.dy,VH.bus[0],VH.bus[1],60+(bu.v||0)*1.1,BVL||vehicles(),0,sd=>lanePt(SH_ROUTE,bu.d+sd,lo)),red,m=>{const k=[bu._blk,bu._blkRef],r=freeAhead(bu,bx,by,q0.dx,q0.dy,VH.bus[0],VH.bus[1],m,BVL||vehicles(),0,sd=>lanePt(SH_ROUTE,bu.d+sd,LANE));[bu._blk,bu._blkRef]=k;return r});const nd=bu.d+driveSpeed(bu,bu.ov===1&&Math.abs(bu.lo+LANE)>10?150:220,free,red||pb,dt);rageTick(bu,free<24&&!red&&!pb,pb,dt);let hit=null;
    for(const st of SH_STOPS){const k=Math.ceil((bu.d-st.d)/SH_PER),s2=st.d+k*SH_PER;if(s2>=bu.d&&s2<=nd&&bu.last!==st.i){hit=[st,s2];break}}
    if(hit&&bu.ov){bu.last=hit[0].i;bu.d=nd}else if(hit){bu.d=hit[1];bu.last=hit[0].i;bu.wait=2.6;bu.at=hit[0].i;busArrived(bu,hit[0])}else bu.d=nd}
  if(bu.board){bu.board.age=(bu.board.age||0)+dt;if(IS||!S.Q||bu.at!==QST||(P().inCar&&!S.pBoard)||(bu.board.age>40&&!S.pBoard&&S.shuttleWait==null)){bu.board=null;bu.wait=.6}}const dk=bu.wait>0&&bu.at>=0?1:0;bu.dk=(bu.dk||0)+(dk-(bu.dk||0))*Math.min(1,dt*6);if(bu.g.userData.door)bu.g.userData.door.position.x=1.2-.52*bu.dk;
  const dock=bu.wait>0&&bu.at>=0;bu.lo=bu.lo??LANE;if(!bu.ov){const nl=bu.lo+((dock?BUSDOCK:LANE)-bu.lo)*Math.min(1,dt*3);if(nl>=bu.lo){bu.lo=nl}else{const qn=lanePt(SH_ROUTE,bu.d,nl);if(footClear(bu,qn.x,qn.y,qn.dx,qn.dy,VH.bus[0],VH.bus[1],BVL||vehicles()))bu.lo=nl}}const q=lanePt(SH_ROUTE,bu.d,bu.lo);bu.x=q.x;bu.y=q.y;bu.dx=q.dx;bu.dy=q.dy;placeCar(bu.g,bu.x,bu.y,q.dx,q.dy)})}
function nearStop(){const p=P();return SH_STOPS.find(st=>Math.hypot(st.sx-p.x,st.sy-p.y)<70)}
function waitShuttle(st){const p=P();S.shuttleWait=st.i;S.pBoard=false;p.target=null;p.path=null;toast(rush()?'Rush hour! You join the queue for the shuttle… 🚌':'You join the queue for the free shuttle… 🚌');acts(true)}
