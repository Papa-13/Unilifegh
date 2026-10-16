/* ================= NPC life ================= */
function planFor(n){
  const h=hour(),w=wd();
  const mt=S.meets&&S.meets.find(m=>m.n===n&&m.going&&!m.done);if(mt)return{b:mt.b,meet:mt};
  if(examNow()&&n.prog===P().prog)return{b:n.col};
  const ev=eventNow();if(ev&&Math.random()<(ev.id==='concert'?.8:.5))return{b:'parade',spot:ev.id==='concert'?()=>TA('parade',R(1885,2075),R(525,720)):ev.id==='jama'?()=>TA('parade',R(1870,2090),R(560,900)):()=>TA('parade',R(1870,2090),R(900,1180))};
  if((h>=21||h<2.5)&&(n.ints.includes('Dance')||n.ints.includes('Afrobeats')||n.pers==='funny')&&Math.random()<(w>=3&&w<=5?.75:.2))return{b:'club',hide:true};
  if(h<6.5||h>=22.5)return{b:n.home,hide:true,sleep:true};
  const lec=TT[w]&&TT[w].find(([c,st])=>h>=st-.5&&h<st+2);
  if(lec&&n.prog===P().prog&&Math.random()<.85)return{b:n.col};
  if(lec&&Math.random()<.45)return{b:n.col};
  if(w===6&&h<12&&n.ints.includes('Church'))return{b:'chapel'};
  if(Math.random()<.18)return{b:n.home,hide:true};
  if(h<9)return{b:pick(['canteen','canteen','lib',n.home,'gym'])};
  if(h<17)return{b:pick(['lib','canteen','print','garden','field','office','mall','square','lib','salon','clinic','court','terminal','taxi','market','pool',n.col,n.col,'bank','books'])};
  if(h<19)return{b:pick(['field','court','gym','canteen','garden','lake','square',n.home,'pool','market'])};
  if(fnight()&&Math.random()<.6)return{b:'square'};
  return{b:pick(['night','night','night',n.home,'square','lake'])};
}
const fnight=()=>day()===S.semStart+4&&hour()>=19&&hour()<23.5;
const homeNow=n=>n.plan&&n.plan.b===n.home&&n.plan.hide&&n.with<=S.min;
function updateNPCs(dt){
  const hk=day()*24+Math.floor(hour()),G=campusGrid(),p=P();let budget=4;
  S.npcs.forEach(n=>{
    if(n.mirror){n.hidden=false;return}
    if(n.with>S.min&&!IS){n._fT=(n._fT||0)-dt;if(n._fT<=0){n._fT=.8;if(dist(n,p)>42){const q=freeSpot(p.x+R(-28,28),p.y+R(-28,28));n.tx=q.x;n.ty=q.y;n.needPath=true}}}
    else if(n.lastPlan!==hk){n.lastPlan=hk;const np=planFor(n);if(n.hidden&&n.plan&&np.hide&&np.b===n.plan.b){n.plan=np;return}n.plan=np;const b=BID[n.plan.b];
      const pt=n.plan.spot?n.plan.spot():b.open?{x:R(b.x+30,b.x+b.w-30),y:R(b.y+30,b.y+b.h-30)}:{x:b.door[0]+R(-50,50),y:b.door[1]+(b.door[1]>b.y?R(6,30):R(-30,-6))};const q=freeSpot(pt.x,pt.y);n.tx=q.x;n.ty=q.y;n.needPath=true}
    if(n.needPath&&budget>0){budget--;n.needPath=false;n.path=findPath(G,n.x,n.y,n.tx,n.ty)}
    const dT=Math.hypot(n.tx-n.x,n.ty-n.y);n.fast=dT>350&&!!n.path;
    if(n.path&&n.path.length&&S.talkN!==n&&crossWait(n,n.path[0].x,n.path[0].y)){n.pose=null;n.fast=false}
    else if(n.path&&n.path.length&&S.talkN!==n){const q=n.path[0],d=Math.hypot(q.x-n.x,q.y-n.y),st=(n.fast||n.hurry?150:62)*dt;
      if(d<=st){n.x=q.x;n.y=q.y;n.path.shift();if(!n.path.length)n.path=null}
      else if(!slideMove(n,(q.x-n.x)/d*st,(q.y-n.y)/d*st)){n.stuck=(n.stuck||0)+dt;if(n.stuck>1.2){n.stuck=0;n.path=null;n.needPath=true}}}
    else if(!n.path&&!n.needPath&&n.amb!==n.lastPlan&&S.talkN!==n){n.amb=n.lastPlan;n.pose=pick(ambientPose(n.plan.b));n.face=R(0,6.28)}
    n.hidden=!!(n.plan&&n.plan.hide&&dT<12&&!n.path);
  });
  // personal space: nobody walks through anybody
  const vis=S.npcs.filter(n=>!n.hidden&&!n.mirror),k=Math.min(1,dt*8);
  for(let i=0;i<vis.length;i++){const a=vis[i];
    for(let j=i+1;j<vis.length;j++){const b=vis[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d<17&&d>.01){const m=(17-d)*.5*k,ux=dx/d,uy=dy/d;if(S.talkN!==a)slideMove(a,-ux*m,-uy*m);if(S.talkN!==b)slideMove(b,ux*m,uy*m)}}
    if(!p.inCar&&!IS&&S.talkN!==a){const dx=a.x-p.x,dy=a.y-p.y,d=Math.hypot(dx,dy);if(d<18&&d>.01){const m=(18-d)*k;slideMove(a,dx/d*m,dy/d*m)}}}
  const w=wd(),h=hour();const lec=TT[w]&&TT[w].find(([c,st])=>h>=st-.5&&h<st+2);
  S.lecs.forEach((l,i)=>{l.hidden=!(lec&&((i===1)===(lec[0]===1)))});
}
