/* ================= traffic brain: vehicles never overlap; overtaking only when it is safe ================= */
function vehicles(){const L=[];TRAFFIC.forEach(c=>{if(c.px==null)return;L.push({ref:c,x:c.px,y:c.py,dx:c.dx,dy:c.dy,hl:VH.car[0],hw:VH.car[1],v:c.v??0});if(c.ov&&Math.abs(c.lo-LANE)>4){const q=lanePt(c.route,c.d,LANE);L.push({ref:c,shadow:1,x:q.x,y:q.y,dx:q.dx,dy:q.dy,hl:VH.car[0],hw:VH.car[1],v:c.v??0})}});
  BUSES.forEach(b=>{if(b.x==null)return;L.push({ref:b,x:b.x,y:b.y,dx:b.dx??1,dy:b.dy??0,hl:VH.bus[0],hw:VH.bus[1],v:b.wait>0?0:(b.v??0)});if(b.ov&&Math.abs(b.lo-LANE)>4){const q=lanePt(SH_ROUTE,b.d,LANE);L.push({ref:b,shadow:1,x:q.x,y:q.y,dx:q.dx,dy:q.dy,hl:VH.bus[0],hw:VH.bus[1],v:b.v??0})}});
  const r=S&&S.ride;if(r&&r.lp&&r.dir)L.push({ref:r,x:r.lp.x,y:r.lp.y,dx:r.dir.x,dy:r.dir.y,hl:VH.car[0],hw:VH.car[1],v:['pickup','drive','leave'].includes(r.phase)?(r.sp||200)*(r.rv??1):0});
  const d=S&&S.del;if(d&&d.lp&&d.dir)L.push({ref:d,x:d.lp.x,y:d.lp.y,dx:d.dir.x,dy:d.dir.y,hl:18,hw:8,v:['ride','leave'].includes(d.phase)?(d.sp||150):0});return L}
function obbHit(a,b,pad){const ax=[[a.dx,a.dy],[-a.dy,a.dx],[b.dx,b.dy],[-b.dy,b.dx]],tx=b.x-a.x,ty=b.y-a.y;
  for(const [ux,uy] of ax){const ra=a.hl*Math.abs(a.dx*ux+a.dy*uy)+a.hw*Math.abs(-a.dy*ux+a.dx*uy),rb=b.hl*Math.abs(b.dx*ux+b.dy*uy)+b.hw*Math.abs(-b.dy*ux+b.dx*uy);if(Math.abs(tx*ux+ty*uy)>ra+rb+pad)return false}return true}
/* how far can I drive straight ahead before touching anything in front of me? (things behind me are their problem) */
function freeAhead(self,x,y,dx,dy,hl,hw,maxD,L,ghost,poseAt){const me={x,y,dx,dy,hl,hw};let best=maxD,blk=null;
  for(const o of L){if(o.ref===self)continue;const rx=o.x-x,ry=o.y-y,al=rx*dx+ry*dy;if(al<=0||al>maxD+hl+o.hl+12)continue;if(Math.abs(-rx*dy+ry*dx)>hw+o.hl+o.hw+8+(poseAt?maxD:0))continue;
    if(ghost&&(o.dx*dx+o.dy*dy)<.5)continue;if(o.shadow&&al<hl+o.hl+4)continue;
    const cross=Math.abs(o.dx*dx+o.dy*dy)<.7,fut=self&&cross&&o.v>10&&(self.vid??0)>(o.ref.vid??0)?{x:o.x+o.dx*Math.min(90,o.v*.9),y:o.y+o.dy*Math.min(90,o.v*.9),dx:o.dx,dy:o.dy,hl:o.hl+Math.min(45,o.v*.45),hw:o.hw}:null;
    if((o.ref===S.ride||o.ref===S.del)&&self&&!(self===S.ride||self===S.del)&&obbHit({x,y,dx,dy,hl,hw},o,-4))continue;
    for(let s=0;s<=best;s+=6){if(poseAt){const q=poseAt(s);me.x=q.x;me.y=q.y;me.dx=q.dx;me.dy=q.dy}else{me.x=x+dx*s;me.y=y+dy*s}if(obbHit(me,o,5)||(fut&&obbHit(me,fut,4))){if(s<best||!blk){best=Math.max(0,s-6);blk=o}break}}}
  if(self){self._blk=blk;self._blkRef=blk&&best<30?blk.ref:null}return best}
const nearJunc=(x,y,dx,dy,back,fwd)=>JUNCS.some(J=>{const rx=J.x-x,ry=J.y-y,al=rx*dx+ry*dy;return Math.abs(-rx*dy+ry*dx)<RHW+20&&al>-back&&al<fwd});
function footClear(self,x,y,dx,dy,hl,hw,L,pad=4){const me={x,y,dx,dy,hl,hw};return !L.some(o=>o.ref!==self&&Math.abs(o.x-x)<260&&Math.abs(o.y-y)<260&&obbHit(me,o,pad))}
function driveSpeed(o,sp,free,stop,dt){const tgt=stop?0:Math.min(sp,Math.max(0,(free-8)*2.4));o.v=o.v??sp;o.v+=(tgt-o.v)*Math.min(1,dt*(tgt<o.v?7:1.3));if(tgt===0&&o.v<3)o.v=0;return Math.min(o.v*dt,Math.max(0,free-2))}
function rageTick(o,blockedByCar,pb,dt){if(pb){if(!o.pb){o.pb=1;nearMiss(o,o.byP)}o.pw=(o.pw||0)+dt;if(o.pw>4&&!o.ph){o.ph=1;honk(o,'📯 Move!');if(o.byP===P()&&o.g&&o.g.position.distanceTo(camT)<16){addBuff('honked');toast(`📯 ${pick(RAGE_P)}`)}}}else{o.pb=0;o.pw=0;o.ph=0}
  if(blockedByCar){o.bt=(o.bt||0)+dt;if(o.bt>2.4&&!o.bh){o.bh=1;if(o.g&&o.g.position.distanceTo(camT)<16&&Math.random()<.7){honk(o,pick(['📯 BEEP!','😡 Move!','📯 Pip pip!']));if(Math.random()<.35)toast(`🚦 ${pick(RAGE_C)}`)}}}else{o.bt=0;o.bh=0}}
function lanePt(route,d,lo){const n=route.length,P=perim(route);d=((d%P)+P)%P;
  const seg=k=>{const a=route[(k+n)%n],b=route[(k+1+n)%n],L=Math.hypot(b[0]-a[0],b[1]-a[1]);return{a,b,L,dx:(b[0]-a[0])/L,dy:(b[1]-a[1])/L}};
  const vtx=k=>{const s1=seg(k-1),s2=seg(k),n1x=-s1.dy,n1y=s1.dx,n2x=-s2.dy,n2y=s2.dx,f=lo/(1+n1x*n2x+n1y*n2y);const v=route[(k+n)%n];return[v[0]+(n1x+n2x)*f,v[1]+(n1y+n2y)*f]};
  let k=0,D=0;for(;k<n;k++){const L=seg(k).L;if(d<=D+L||k===n-1)break;D+=L}
  const at=(kk,t)=>{const A=vtx(kk),Bv=vtx(kk+1);return[A[0]+(Bv[0]-A[0])*t,A[1]+(Bv[1]-A[1])*t]},sk=seg(k),r=Math.min(72,sk.L*.3),t=(d-D)/sk.L;
  let c=null;if(d-D<r){const sp=seg(k-1);c={P0:at(k-1,1-r/sp.L),C:vtx(k),P2:at(k,r/sk.L),u:(d-D+r)/(2*r)}}else if(D+sk.L-d<r){const sn=seg(k+1);c={P0:at(k,1-r/sk.L),C:vtx(k+1),P2:at(k+1,r/sn.L),u:(d-(D+sk.L-r))/(2*r)}}
  if(c){const{P0,C,P2,u}=c,m=1-u,x=m*m*P0[0]+2*u*m*C[0]+u*u*P2[0],y=m*m*P0[1]+2*u*m*C[1]+u*u*P2[1];let dx=2*m*(C[0]-P0[0])+2*u*(P2[0]-C[0]),dy=2*m*(C[1]-P0[1])+2*u*(P2[1]-C[1]);const l=Math.hypot(dx,dy)||1;
    if(l<1e-3)return{x,y,dx:sk.dx,dy:sk.dy};return{x,y,dx:dx/l,dy:dy/l}}
  const p=at(k,t);return{x:p[0],y:p[1],dx:sk.dx,dy:sk.dy}}

/* junction box reservation: one approach direction at a time inside a junction; followers in the same direction may share */
const JBOX=JUNCS.map(J=>({x:J.x,y:J.y,dx:1,dy:0,hl:RHW+58,hw:RHW+58,v:0,ref:J,hold:[]}));
function sweepOf(h,len){const P=[],isB=BUSES.includes(h),hl=isB?VH.bus[0]:VH.car[0],hw=isB?VH.bus[1]:VH.car[1],rt=h.route||(isB?SH_ROUTE:null);
  for(let sd=0;sd<=len;sd+=14){let q;if(rt)q=lanePt(rt,h.d+sd,h.lo??LANE);else if(h.lp&&h.dir)q={x:h.lp.x+h.dir.x*sd,y:h.lp.y+h.dir.y*sd,dx:h.dir.x,dy:h.dir.y};else break;P.push({ref:h,x:q.x,y:q.y,dx:q.dx,dy:q.dy,hl,hw,v:0})}return P}
function juncGate(o,x,y,dx,dy,hl,hw,free,red,pf){const me={x,y,dx,dy,hl,hw};let lim=free;o.jh=o.jh||{};o.gw=false;
  for(const B of JBOX){if(Math.abs(B.x-x)>260||Math.abs(B.y-y)>260){if(B.hold.includes(o))B.hold=B.hold.filter(h=>h!==o);continue}
    const inside=obbHit(me,B,-2),mine=B.hold.includes(o);
    if(mine){const al=(B.x-x)*dx+(B.y-y)*dy;if(!inside&&al<0)B.hold=B.hold.filter(h=>h!==o);continue}
    if(inside){B.hold.push(o);o.jh[B.x+','+B.y]=[dx,dy];continue}
    const d=freeAhead(null,x,y,dx,dy,hl,hw,130,[B]);if(d>=130)continue;
    if(red){lim=Math.min(lim,d);continue}
    const need=d+B.hl*2+hl*2,ok=!(o.ov&&Math.abs(o.lo-LANE)>4)&&B.hold.every(h=>{const e=h.jh&&h.jh[B.x+','+B.y];return e&&e[0]*dx+e[1]*dy>.95})&&(d>=10||!pf||pf(need)>=need-4);
    if(ok&&d<10){B.hold.push(o);o.jh[B.x+','+B.y]=[dx,dy]}else if(!ok){lim=Math.min(lim,d);o.gw=true;const sw=[];B.hold.forEach(h=>sw.push(...sweepOf(h,B.hl*2+60)));if(sw.length)lim=Math.min(lim,freeAhead(null,x,y,dx,dy,hl,hw,lim,sw))}}
  return lim}
function spreadSpawn(){const L=[];[...BUSES,...TRAFFIC].forEach(c=>{const isB=BUSES.includes(c),hl=isB?VH.bus[0]:VH.car[0],hw=isB?VH.bus[1]:VH.car[1],rt=isB?SH_ROUTE:c.route;
  for(let k=0;k<60;k++){const q=lanePt(rt,c.d,LANE),me={x:q.x,y:q.y,dx:q.dx,dy:q.dy,hl,hw};if(!L.some(o=>obbHit(me,o,20))&&!JBOX.some(B=>obbHit(me,B,4))){L.push(me);break}c.d+=25}})}
/* is this vehicle (or the queue it is stuck in) parked rather than just waiting in traffic? */
function parkedV(o,k=0){const r=o&&o.ref;if(!r||k>3)return false;if(r===S.ride)return !['pickup','drive','leave'].includes(r.phase);if(r===S.del)return !['ride','leave'].includes(r.phase);
  if(BUSES.includes(r)&&r.wait>0&&r.at>=0)return true;return (r.v??0)<4&&r._blk&&r._blk.ref!==r&&parkedV(r._blk,k+1)}
function ovTick(c,rt,x0,y0,dx,dy,hl,hw,L,dt){c.lo=c.lo??LANE;c.ov=c.ov||0;const at=lo=>{const z=lanePt(rt,c.d,lo);return[z.x,z.y]};
  if(c.ov===0&&c.bt>1.4&&c._blk&&c._blk.v<4&&parkedV(c._blk)&&!nearJunc(x0,y0,dx,dy,90,((c._blk.x-x0)*dx+(c._blk.y-y0)*dy)+c._blk.hl+hl*2+90+RHW+150)){const [ox,oy]=at(-LANE);
    if(freeAhead(null,ox,oy,dx,dy,hl,hw,600,L.filter(o=>!o.shadow&&o.ref!==c))>=590&&footClear(c,ox,oy,dx,dy,hl+30,hw,L.filter(o=>!o.shadow),.5)){c.ov=1;c.blk=c._blk.ref;c.ovT=0;if(c.g&&c.g.position.distanceTo(camT)<16&&Math.random()<.5)honk(c,pick(['📯 Pip!','➡️ Passing','📯 Beep beep']))}}
  if(c.ov){c.ovT+=dt;const goal=c.ov===1?-LANE:LANE,nl=c.lo+(goal-c.lo)*Math.min(1,dt*2.2),[nx,ny]=at(nl);if(footClear(c,nx,ny,dx,dy,hl,hw,L,1.5)){c.lo=nl;[x0,y0]=[nx,ny]}
    if(c.ov===1){let b=L.find(o=>o.ref===c.blk&&!o.shadow);const [lx,ly]=at(LANE);let passed=!b||((b.x-x0)*dx+(b.y-y0)*dy)<-(hl+b.hl+14);
      if(passed&&b&&!footClear(c,lx,ly,dx,dy,hl+8,hw,L)){const nx2=b.ref._blk;if(nx2&&nx2.ref!==c&&((nx2.x-x0)*dx+(nx2.y-y0)*dy)>-(hl+nx2.hl)){c.blk=nx2.ref;passed=false}}
      const oncoming=freeAhead(null,x0,y0,dx,dy,hl,hw,260,L.filter(o=>o.ref!==c&&!o.shadow&&(o.dx*dx+o.dy*dy)<-.5))<250;
      if((passed&&footClear(c,lx,ly,dx,dy,hl+8,hw,L))||c.ovT>16||(oncoming&&!passed&&c.lo>-8)||nearJunc(x0,y0,dx,dy,0,RHW+140+hl))c.ov=2}
    else if(Math.abs(c.lo-LANE)<1){c.lo=LANE;c.ov=0}
    else if((c.stuck||0)>2.5){const back=freeAhead(null,x0,y0,-dx,-dy,hl,hw,60,L.filter(o=>o.ref!==c&&!o.shadow));if(back>8){c.d-=Math.min(30*dt,back-6);c.v=0}}}
  return[x0,y0]}
function updTraffic(dt){if(!updTraffic.sp){updTraffic.sp=1;spreadSpawn()}vehPush();TRAFFIC.forEach((c,i)=>c.vid=c.vid??i+1);BUSES.forEach((b,i)=>b.vid=b.vid??50+i);if(S.ride)S.ride.vid=90;if(S.del)S.del.vid=91;const L=vehicles(),CL=VH.car[0],CW=VH.car[1];
  TRAFFIC.forEach(c=>{c.lo=c.lo??LANE;c.ov=c.ov||0;const q0=along(c.route,c.d),Lp=lanePt(c.route,c.d,c.lo),dx=Lp.dx,dy=Lp.dy,at=lo=>{const z=lanePt(c.route,c.d,lo);return[z.x,z.y]};let [x0,y0]=[Lp.x,Lp.y];c.v=c.v??c.sp;
    const me=L.find(o=>o.ref===c);if(me){me.x=x0;me.y=y0;me.dx=dx;me.dy=dy}
    // ---- overtaking a parked vehicle (taxi picking up, bus at a stop, delivery bike) ----
    [x0,y0]=ovTick(c,c.route,x0,y0,dx,dy,CL,CW,L,dt);
    // ---- follow, stop for lights and people, never overlap ----
    const red=c.ov!==1&&redAhead(x0,y0,dx,dy,52),pb=blockedAhead(x0,y0,dx,dy,62,c)==='p';c.stuck=(c.v<2&&!red)?(c.stuck||0)+dt:0;
    const free=juncGate(c,x0,y0,dx,dy,CL,CW,freeAhead(c,x0,y0,dx,dy,CL,CW,46+c.v*1.1,L,0,sd=>lanePt(c.route,c.d+sd,c.lo)),red,m=>{const k=[c._blk,c._blkRef],r=freeAhead(c,x0,y0,dx,dy,CL,CW,m,L,0,sd=>lanePt(c.route,c.d+sd,LANE));[c._blk,c._blkRef]=k;return r});const bo=c._blk&&c._blk.ref,mut=bo&&bo._blkRef===c&&free<14;c.mut=mut?(c.mut||0)+dt:0;
    c.pushBack=Math.max(0,(c.pushBack||0)-dt);const blocking=c.pushBack>0||c.gw&&[...TRAFFIC,...BUSES].some(h=>h!==c&&h._blkRef===c&&(h.stuck||0)>1.2)||!c.ov&&[...TRAFFIC,...BUSES].some(h=>{if(h===c||!h.ov||Math.abs(h.lo-LANE)<=4||(h.stuck||0)<=2)return false;const hx=h.px??h.x,hy=h.py??h.y;return Math.hypot(hx-x0,hy-y0)<CL*2.4+(BUSES.includes(h)?60:0)&&((hx-x0)*dx+(hy-y0)*dy)>-CL*.5});if(blocking||c.mut>1.2&&!JBOX.some(B=>B.hold.includes(c))&&(bo.gw||(bo.vid??0)<c.vid||!TRAFFIC.includes(bo))){const tb={},back=freeAhead(tb,x0,y0,-dx,-dy,CL,CW,50,L);if(back>8){c.d-=Math.min(28*dt,back-6);c.v=0}else if(tb._blk&&TRAFFIC.includes(tb._blk.ref))tb._blk.ref.pushBack=1.2}
    const step=driveSpeed(c,c.ov===1&&Math.abs(c.lo+LANE)>10?Math.min(c.sp,60):c.sp,free,red||pb,dt);c.d+=step;rageTick(c,free<24&&!red&&!pb,pb,dt);
    const q=lanePt(c.route,c.d,c.lo);c.px=q.x;c.py=q.y;c.dx=q.dx;c.dy=q.dy;if(me){me.x=c.px;me.y=c.py;me.dx=q.dx;me.dy=q.dy;me.v=c.v}placeCar(c.g,c.px,c.py,q.dx,q.dy)})}
const hr=y=>HROADS.find(r=>r[0]===y),nearH=(y,x)=>HROADS.filter(r=>x==null||(x>=r[1]-1&&x<=r[2]+1)).reduce((a,r)=>Math.abs(r[0]-y)<Math.abs(a-y)?r[0]:a,1e9),nearV=x=>VX.reduce((a,b)=>Math.abs(b-x)<Math.abs(a-x)?b:a);
function roadPath(f,t){const h1=nearH(f.y,f.x),h2=nearH(t.y,t.x),r1=hr(h1),r2=hr(h2),m=(f.x+t.x)/2,v=VX.filter(x=>x>=Math.max(r1[1],r2[1])&&x<=Math.min(r1[2],r2[2])).reduce((a,b)=>Math.abs(b-m)<Math.abs(a-m)?b:a,nearV(m));return h1===h2?[{x:f.x,y:h1},{x:t.x,y:h2}]:[{x:f.x,y:h1},{x:v,y:h1},{x:v,y:h2},{x:t.x,y:h2}]}
const pathLen=pts=>pts.slice(1).reduce((s,q,i)=>s+Math.hypot(q.x-pts[i].x,q.y-pts[i].y),0);
function rideQuote(dest){const p=P(),b=BID[dest],to={x:b.door[0],y:b.door[1]},from=IS?doorOfInside():{x:p.x,y:p.y};const len=pathLen([from,...roadPath(from,to),to]);
  return{len,ryde:Math.round(15+len*.012),dash:Math.round(10+len*.009),mins:Math.round(4+len/80)}}
function doorOfInside(){const b=insideB();return{x:b.door[0],y:b.door[1]+(b.door[1]>b.y?22:-22)}}
const carDesc=app=>app==='trotro'?'trotro':app==='ryde'?'black Toyota Corolla · GR 2451-24':app==='dash'?'green Kia Picanto · AS 778-23':'yellow taxi';
function roadPoint(x,y){const h={x,y:nearH(y,x)},v={x:nearV(x),y};return Math.abs(h.y-y)<=Math.abs(v.x-x)?Object.assign(h,{ax:'h'}):Object.assign(v,{ax:'v'})}
function rideSide(r,px,py){const d=r.dir,c=r.lp||r.pos;return((px-c.x)*(-d.y)+(py-c.y)*d.x)>=0?0:1}
function rideDoorPt(r,side){const d=r.dir,c=r.lp||r.pos,sx=side?d.y:-d.y,sy=side?-d.x:d.x;return{x:c.x+sx*38+d.x*8,y:c.y+sy*38+d.y*8}}
function rideLane(r,dt){const parked=['wait','board','fill','drop'].includes(r.phase);r.lo=r.lo??LANE;r.lo+=((parked?CURB:r.ov===1?-LANE:LANE)-r.lo)*Math.min(1,(dt||0)*(r.ov?2.2:3));r.lp=laneOf(r.pos.x,r.pos.y,r.dir.x,r.dir.y,r.lo);return r.lp}
function setDoor(r,k){const ds=r.g.userData.doors;if(ds)ds.forEach((pv,i)=>pv.rotation.y=i===r.side?(i?-1:1)*1.15*k:0)}
const farAhead=r=>({x:clamp(r.pos.x+r.dir.x*900,10,MW-10),y:clamp(r.pos.y+r.dir.y*900,10,MH-10)});
function callRide(dest,app){if(P().onBus)return toast('You are on the shuttle. Get off first.');if(S.ride)return toast('You already have a ride booked.');S.shuttleWait=null;
  const q=rideQuote(dest),price=q[app];if(P().money<price)return toast(`Not enough on MoMo for this ride (${cedi(price)}).`);
  if(IS)leaveRoom(true);const p=P(),b=BID[dest],door={x:b.door[0],y:b.door[1]+(b.door[1]>b.y?22:-22)},pick=roadPoint(p.x,p.y),drop=roadPoint(door.x,door.y);
  const start=pick.ax==='h'?{x:clamp(p.x+(p.x<MW/2?700:-700),20,MW-20),y:pick.y}:{x:pick.x,y:clamp(p.y+(p.y<MH/2?600:-600),20,MH-20)};
  S.ride={app,dest,price,mins:q.mins,phase:'pickup',pts:[start,pick],i:0,pos:{...start},dir:{x:Math.sign(pick.x-start.x)||0,y:Math.sign(pick.y-start.y)||0},g:makeCar(app==='ryde'?0x161616:0x2fa84f,false),sp:app==='ryde'?360:290,drive:[pick,...roadPath(pick,drop),drop],door,t:0,side:0};
  P().target=null;toast(`${app==='ryde'?'Ryde':'Dash'}: your driver is coming in a ${carDesc(app)}. ${cedi(price)} 🚗`);closeSheet();acts(true)}
/* public roads (taxis, trotros, okadas): the Accra–Kumasi Road, the Kotei and town roads, the Tech Junction and Ayeduase roads,
   the roads inside Ayeduase, and the bits of road outside campus. Campus roads are for shuttles, rides and private cars. */
const PUBNET=(()=>{const HYs=HROADS.map(r=>r[0]),isPubH=(y,x1,x2)=>[330,2800,3400].includes(y)||([1000,2150].includes(y)&&x1>=4400-1),isPubV=(x,y1,y2)=>x===600||x===4400||y2<=331||y1>=2799;
  const segs=[];HROADS.forEach(([y,a,b])=>{const xs=[a,...VX.filter(x=>x>a&&x<b),b];for(let k=0;k<xs.length-1;k++)if(isPubH(y,xs[k],xs[k+1]))segs.push([xs[k],y,xs[k+1],y])});
  VX.forEach(x=>{const ys=[0,...HYs.filter(y=>{const r=HROADS.find(h=>h[0]===y);return r&&x>=r[1]&&x<=r[2]}).sort((a,b)=>a-b),MH];for(let k=0;k<ys.length-1;k++)if(isPubV(x,ys[k],ys[k+1]))segs.push([x,ys[k],x,ys[k+1]])});
  return segs})();
function pubProject(x,y){let best=null;PUBNET.forEach((sg,i)=>{const [x1,y1,x2,y2]=sg,L=Math.hypot(x2-x1,y2-y1),t=clamp(((x-x1)*(x2-x1)+(y-y1)*(y2-y1))/(L*L),0,1),px=x1+(x2-x1)*t,py=y1+(y2-y1)*t,d=Math.hypot(px-x,py-y);if(!best||d<best.d)best={i,x:px,y:py,d,t,sg}});return best}
/* shortest route along public roads (Dijkstra over junctions) */
function pubPath(a,b){const A=pubProject(a.x,a.y),Bq=pubProject(b.x,b.y),key=(x,y)=>Math.round(x)+','+Math.round(y),G={},add=(p,q)=>{const k1=key(...p),k2=key(...q),d=Math.hypot(q[0]-p[0],q[1]-p[1]);(G[k1]=G[k1]||[]).push([k2,d,q]);(G[k2]=G[k2]||[]).push([k1,d,p])};
  PUBNET.forEach((sg,i)=>{const cuts=[[sg[0],sg[1]],[sg[2],sg[3]]];[A,Bq].forEach(P_=>{if(P_.i===i)cuts.push([P_.x,P_.y])});cuts.sort((p,q)=>(p[0]-sg[0])+(p[1]-sg[1])-((q[0]-sg[0])+(q[1]-sg[1])));for(let k=0;k<cuts.length-1;k++)add(cuts[k],cuts[k+1])});
  const s0=key(A.x,A.y),t0=key(Bq.x,Bq.y),dist={[s0]:0},prev={},pos={[s0]:[A.x,A.y]},Q=new Set([s0]);
  while(Q.size){let u=null;Q.forEach(k=>{if(u===null||dist[k]<dist[u])u=k});Q.delete(u);if(u===t0)break;(G[u]||[]).forEach(([v,d,pv])=>{const nd=dist[u]+d;if(dist[v]===undefined||nd<dist[v]){dist[v]=nd;prev[v]=u;pos[v]=pv;Q.add(v)}})}
  const pts=[];let k=t0;if(dist[t0]===undefined)return{from:{x:A.x,y:A.y},to:{x:Bq.x,y:Bq.y},mid:[]};while(k&&k!==s0){pts.unshift({x:pos[k][0],y:pos[k][1]});k=prev[k]}
  const to=pts.pop()||{x:Bq.x,y:Bq.y};const sg=A.sg;return{from:{x:A.x,y:A.y,ax:sg[1]===sg[3]?'h':'v'},to,mid:pts}}
const ringPath=pubPath;
function taxiRide(dest,shared){if(S.ride)return toast('You already have a ride.');
  const b=BID[dest],door={x:b.door[0],y:b.door[1]+(b.door[1]>b.y?22:-22)},RP=ringPath({x:BID.taxi.door[0],y:BID.taxi.door[1]},door),start=RP.from,drop=RP.to,len=pathLen([start,...RP.mid,drop]);
  const walk=Math.hypot(drop.x-door.x,drop.y-door.y);if(walk>260)setTimeout(()=>toast(`🚕 Taxis can't enter the campus. The driver will drop you at the nearest gate road. Walk or take the free shuttle from there.`),1200);
  const price=shared?8:Math.round(20+len*.01);if(!spend(price))return;
  S.ride={app:'taxi',dest,price:0,mins:Math.round(3+len/90),phase:'wait',waitUntil:S.min+45,pts:[],i:0,pos:{...start},dir:{x:1,y:0},g:makeCar(0xf4c430,true),sp:shared?300:360,drive:[start,...RP.mid,drop],door,shared,t:0,side:0};
  placeCar(S.ride.g,start.x,start.y,start.ax==='v'?0:1,start.ax==='v'?1:0);S.ride.dir={x:start.ax==='v'?0:1,y:start.ax==='v'?1:0};toast(`Paid ${cedi(price)}. Your ${shared?'shared ':''}taxi is parked on the road by the station. Walk up to it and get in 🚕`);acts(true)}
function boardRide(){const r=S.ride,p=P();if(!r)return;r.phase='board';r.side=rideSide(r,p.x,p.y);r.atDoor=false;r.t=0;p.target=rideDoorPt(r,r.side);S.shuttleWait=null;acts(true)}
function cancelRide(timeout){const r=S.ride;if(!r)return;const who=r.app==='taxi'?'Taxi driver':(r.app==='ryde'?'Ryde':'Dash')+' driver';
  if(r.phase==='wait'&&r.app!=='taxi'){P().money-=5}if(timeout)msg(who,`I waited but you didn't come 😒 ${r.app==='taxi'?'I have gone.':'Ride cancelled (GH₵5 fee).'}`);else toast(`Ride cancelled.${r.phase==='wait'&&r.app!=='taxi'?' GH₵5 cancellation fee.':''}`);
  setDoor(r,0);r.phase='leave';r.pts=[{...r.pos},farAhead(r)];r.i=0;acts(true)}
function taxiMenu(){S.paused=true;openSheet();const st=roadPoint(BID.taxi.door[0],BID.taxi.door[1]);
  const opts=B.filter(b=>b.id!=='taxi').map(b=>{const to={x:b.door[0],y:b.door[1]},q=Math.round(20+pathLen([st,...roadPath(st,to),to])*.01);return `<div class="item"><div class="grow"><b>${b.name}</b><small>Shared GH₵8 · Dropping ${cedi(q)}</small></div><button class="ghost sm" data-ts="${b.id}">Shared</button><button class="btn sm" data-td="${b.id}">Dropping</button></div>`}).join('');
  $('sheetIn').innerHTML=`<div class="eyebrow">Taxi Station</div><h3>🚕 Where are you going?</h3><p style="font-size:14px">A <strong>shared</strong> taxi is cheap but waits to fill up with passengers. A <strong>dropping</strong> takes only you, straight away.</p><div class="list">${opts}</div><button class="ghost sm" id="bye">Close</button>`;
  $('sheetIn').querySelectorAll('[data-ts]').forEach(x=>x.onclick=()=>{closeSheet();taxiRide(x.dataset.ts,true)});
  $('sheetIn').querySelectorAll('[data-td]').forEach(x=>x.onclick=()=>{closeSheet();taxiRide(x.dataset.td,false)});$('bye').onclick=closeSheet}
function moveAlong(o,dt){const tgt=o.pts[o.i+1];if(!tgt)return true;const dx=tgt.x-o.pos.x,dy=tgt.y-o.pos.y,d=Math.hypot(dx,dy),st=o.sp*dt;
  if(d<=st){o.pos.x=tgt.x;o.pos.y=tgt.y;o.i++;return o.i>=o.pts.length-1}o.dir={x:dx/d,y:dy/d};o.pos.x+=o.dir.x*st;o.pos.y+=o.dir.y*st;return false}
const rideBusy=()=>S.ride&&['board','fill','drive','drop'].includes(S.ride.phase)&&!(S.ride.phase==='board'&&!S.ride.atDoor);
function updRide(dt){const r=S.ride;if(!r)return;const p=P();
  if(r.phase==='pickup'||r.phase==='drive'||r.phase==='leave'){const L0=r.lp||r.pos,red=(r.phase!=='leave'&&redAhead(L0.x,L0.y,r.dir.x,r.dir.y,52))||(r.phase!=='pickup'||Math.hypot(r.pts[r.pts.length-1].x-r.pos.x,r.pts[r.pts.length-1].y-r.pos.y)>80)&&blockedAhead(L0.x,L0.y,r.dir.x,r.dir.y,62,r)==='p';r.stuck=((r.rv??1)<.05&&!red)?(r.stuck||0)+dt:0;
    const free=juncGate(r,L0.x,L0.y,r.dir.x,r.dir.y,VH.car[0],VH.car[1],freeAhead(r,L0.x,L0.y,r.dir.x,r.dir.y,VH.car[0],VH.car[1],50+r.sp*.45,vehicles()),red);r.rv=(r.rv??1)+(((red?0:Math.min(1,Math.max(0,free-8)/90)))-(r.rv??1))*Math.min(1,dt*6);
    {/* the ride also pulls out round a parked bus or taxi when the other lane is clear */const hl=VH.car[0],dx=r.dir.x,dy=r.dir.y,bk=r._blk;r.bt=free<24&&!red?(r.bt||0)+dt:0;r.ov=r.ov||0;
      if(!r.ov&&r.bt>1.4&&bk&&bk.v<4&&parkedV(bk)){const al=(bk.x-L0.x)*dx+(bk.y-L0.y)*dy,op=laneOf(r.pos.x,r.pos.y,dx,dy,-LANE),VL=vehicles().filter(o=>o.ref!==r&&!o.shadow);
        if(!nearJunc(L0.x,L0.y,dx,dy,90,al+bk.hl+hl*2+90+RHW+150)&&freeAhead(null,op.x,op.y,dx,dy,hl,VH.car[1],600,VL)>=590){r.ov=1;r.ovB=bk.ref;r.ovT=0}}
      if(r.ov===1){r.ovT+=dt;const b=vehicles().find(o=>o.ref===r.ovB&&!o.shadow);if(!b||((b.x-L0.x)*dx+(b.y-L0.y)*dy)<-(hl+b.hl+14)||r.ovT>14||nearJunc(L0.x,L0.y,dx,dy,0,RHW+140+hl))r.ov=2}
      else if(r.ov===2&&Math.abs((r.lo??LANE)-LANE)<1)r.ov=0}
    const done=moveAlong(r,Math.min(dt*r.rv,Math.max(0,free-3)/r.sp));const L=rideLane(r,dt);placeCar(r.g,L.x,L.y,r.dir.x,r.dir.y);if(r.phase==='drive'){p.x=L.x;p.y=L.y}
    if(done){if(r.phase==='pickup'){r.phase='wait';r.waitUntil=S.min+30;if(r.hail)toast(r.app==='trotro'?'🚐 The trotro stops. The mate slides the door open: "Enter, enter!"':'🚕 The taxi stops beside you. "Where are you going?"');else msg(`${r.app==='ryde'?'Ryde':'Dash'} driver`,`I'm here 📍 ${carDesc(r.app)} by the road. Come and get in!`);acts(true)}
      else if(r.phase==='drive'){r.phase='drop';r.t=0;r.side=rideSide(r,r.door.x,r.door.y)}
      else{scene.remove(r.g);disposeTree(r.g);S.ride=null;acts(true)}}return}
  r.t+=dt;{const L=rideLane(r,dt);placeCar(r.g,L.x,L.y,r.dir.x,r.dir.y)}
  if(r.phase==='wait'){if(S.min>r.waitUntil)cancelRide(true);return}
  if(r.phase==='board'){const dp=rideDoorPt(r,r.side),d=Math.hypot(p.x-dp.x,p.y-dp.y);
    if(!r.atDoor){if(d<9||(!p.target&&d<30)){r.atDoor=true;r.t=0;p.target=null;p.path=null;p.x=dp.x;p.y=dp.y;p.face=Math.atan2(r.pos.x-p.x,r.pos.y-p.y);acts(true)}else if(!p.target)p.target=dp;return}
    setDoor(r,Math.min(1,r.t/.45));
    if(r.t>.6&&!p.inCar){p.inCar=true;toast(r.app==='taxi'?'You open the door and get in. "Driver, good day!" 🚕':'You open the door and get in. Driver: "Charley, how far? Seatbelt o." 😄')}
    if(r.t>.6)setDoor(r,Math.max(0,1-(r.t-.6)/.4));
    if(r.t>1.1){setDoor(r,0);if(r.shared&&!r.filled){r.phase='fill';r.t=0;toast(r.app==='trotro'?'The mate shouts for more passengers… "One more seat! Let\'s go!" 🚐':'Waiting for the taxi to fill up with passengers… 🚕');acts(true);return}r.phase='drive';r.pts=r.drive;r.i=0;acts(true)}return}
  if(r.phase==='fill'){if(r.t>3.2){r.filled=true;r.phase='drive';r.pts=r.drive;r.i=0;toast(r.app==='trotro'?'The trotro is full. The mate bangs the side: "Drive!" 🚐':'The taxi is full. Off we go! 🚕')}return}
  if(r.phase==='drop'){const dp=rideDoorPt(r,r.side);setDoor(r,Math.min(1,r.t/.4));
    if(r.t>.45&&p.inCar){p.inCar=false;p.pose=null;p.x=dp.x;p.y=dp.y;unstick(p);p.money-=r.price;advance(r.mins);toast(r.app==='taxi'?(Math.hypot(r.door.x-p.x,r.door.y-p.y)>260?`🚕 Dropped at the road outside campus. Walking to ${BID[r.dest].name}… "Medaase, driver!"`:`Arrived at ${BID[r.dest].name}. "Medaase, driver!" 🚕`):`Arrived at ${BID[r.dest].name}. Paid ${cedi(r.price)} on MoMo. ⭐⭐⭐⭐⭐`);p.target={...r.door}}
    if(r.t>.9)setDoor(r,Math.max(0,1-(r.t-.9)/.4));
    if(r.t>1.4){setDoor(r,0);r.phase='leave';r.pts=[{...r.pos},farAhead(r)];r.i=0;acts(true)}}}
const FOOD=[['Jollof & chicken',60,65],['Waakye special',40,55],['Shawarma',55,50],['Fried yam & chicken',45,50],['Pizza (shared)',120,70]];
const RIDER_LOOK={gender:'m',skin:'#4e2e1c',hair:'short',outfit:'jersey',pal:'green',shoes:'sneakers',extra:'cap',bag:'none'};
function orderFood(i){const [n,c,h]=FOOD[i],fee=12;if(S.del)return toast('You already have an order on the way.');if(!spend(c+fee))return;
  const to=IS?doorOfInside():{x:P().x,y:P().y},stop=roadPoint(to.x,to.y),src=['mall','shawarma','night','canteen'].map(k=>BID[k]).sort((a,c)=>Math.hypot(a.door[0]-to.x,a.door[1]-to.y)-Math.hypot(c.door[0]-to.x,c.door[1]-to.y))[0],from=roadPoint(src.door[0],src.door[1]);
  S.del={item:{name:n,food:h},pts:[from,...roadPath(from,stop),stop],i:0,pos:{...from},dir:{x:1,y:0},g:makeBike(),sp:200,phase:'ride',to,indoor:!!IS,where:IS?IS.title:zoneName(to.x,to.y)};
  toast(`ChopNow: ${n} confirmed (${cedi(c)} + ${cedi(fee)} delivery). Rider is on the way 🛵`);closeSheet()}
function riderLeave(){const d=S.del;if(d.rider){scene.remove(d.rider.mesh);disposeTree(d.rider.mesh);d.rider=null}d.phase='leave';d.pts=[{...d.pos},farAhead(d)];d.i=0;acts(true)}
function collectFood(){const d=S.del,p=P();if(!d||!d.rider)return;d.phase='hand';d.rider.pose='talk';p.face=Math.atan2(d.rider.x-p.x,d.rider.y-p.y);d.rider.face=Math.atan2(p.x-d.rider.x,p.y-d.rider.y);
  startBusy(`Collecting your ${d.item.name}`,{pose:'talk'},1700,()=>{p.food.push(d.item);toast(`Got your ${d.item.name}! Rider: "Enjoy, boss! Rate me 5 stars o" 🛵`);riderLeave()})}
function updDelivery(dt){const d=S.del;if(!d)return;
  if(d.phase==='ride'||d.phase==='leave'){const L1=d.lp||d.pos,red=d.phase==='ride'&&redAhead(d.pos.x,d.pos.y,d.dir.x,d.dir.y),fr=freeAhead(d,L1.x,L1.y,d.dir.x,d.dir.y,18,8,70,vehicles());const done=red?false:moveAlong(d,Math.min(dt,Math.max(0,fr-3)/(d.sp||150)));d.lp=laneOf(d.pos.x,d.pos.y,d.dir.x,d.dir.y,CURB-6);placeCar(d.g,d.lp.x,d.lp.y,d.dir.x,d.dir.y);
    if(done){if(d.phase==='leave'){scene.remove(d.g);disposeTree(d.g);S.del=null;return}
      d.phase='wait';d.until=S.min+60;const h=makeHuman(RIDER_LOOK,{label:'ChopNow rider',labelColor:'#7fe0a0'});scene.add(h.g);box(.32,.3,.26,0x2f7a4a,0,-.42,.12,h.elbows[0]);
      const o0=d.lp||d.pos,v={x:d.to.x-o0.x,y:d.to.y-o0.y},l=Math.hypot(v.x,v.y)||1,rx=o0.x+v.x/l*Math.min(30,l),ry=o0.y+v.y/l*Math.min(30,l);
      d.rider={mesh:h.g,legs:h.legs,knees:h.knees,arms:h.arms,elbows:h.elbows,head:h.head,lids:h.lids,torso:h.torso,x:rx,y:ry,pose:'phone',face:Math.atan2(v.x,v.y),phase:0,id:5};
      msg('ChopNow rider',`I'm outside ${d.indoor?esc(d.where):'where you are'} 📍 Come for your ${d.item.name}, please. I'll wait small.`);acts(true)}return}
  {const L=d.lp||d.pos;placeCar(d.g,L.x,L.y,d.dir.x,d.dir.y)}
  if(d.phase==='wait'&&S.min>d.until){P().food.push(d.item);msg('ChopNow rider',`I couldn't wait any longer. I left your ${d.item.name} with the porter at ${d.where}. Next time come quick o 🙏`);riderLeave()}}
