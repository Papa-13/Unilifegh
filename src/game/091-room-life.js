/* ================= roommates and visitors live in the room =================
   Instead of standing frozen where they appeared, people in a room go about their day: they walk to
   their desk and sit to read or type, walk to the TV (sit on the beanbag/couch, or stand in front of it),
   walk to their bed and lie down for a nap, or come over and chat with you. They walk around furniture,
   then sit / lie / stand only once they get there. Sleepers at night stay asleep. */
function roomLifeTick(dt){if(!IS||IS.kind!=='room'||!S||S.paused)return;const now=performance.now()/1000;
  IS.people.forEach(q=>{if(!q.life||q.nightSleep||(S.talkN&&q.n===S.talkN)||(S.busy&&S.busy.bq===q)||q.pose==='shower')return;
    const A=q.ai||(q.ai={next:now+4+Math.random()*10,path:null,goal:null});
    if(A.path){walkAlong(q,A,dt);return}
    if(now<A.next)return;
    /* pick the next thing to do */
    const opts=[];if(q.deskSpot)opts.push(['desk',4]);if(IS.tvSpot)opts.push(['tv',IS.spots.bean?3:2]);if(q.bedSpot&&q.bedSpot.y<.7&&!q.visitor)opts.push(['bed',hour()>=13&&hour()<17?3:1]);opts.push(['chat',q.visitor?5:2]);opts.push(['stand',1]);
    let tot=opts.reduce((a,o)=>a+o[1],0),r=Math.random()*tot,k='stand';for(const o of opts){if((r-=o[1])<0){k=o[0];break}}
    const p=P(),bean=IS.spots.bean,beanFree=bean&&!IS.people.some(o=>o!==q&&o.ai&&o.ai.goal&&o.ai.goal.k==='tv'&&o.ai.goal.sit)&&Math.hypot(p.ix-bean.x,p.iz-bean.z)>.4;
    let g=null;
    if(k==='desk')g={k,x:q.deskSpot.x,z:q.deskSpot.z,ry:Math.PI,pose:pick(['sitWrite','type','sit','phone']),y:0};
    if(k==='tv')g=beanFree?{k,sit:1,x:bean.x,z:bean.z,ry:bean.ry,pose:'sit',y:bean.ly||0}:{k,x:IS.tvSpot.x+(Math.random()-.5)*.5,z:IS.tvSpot.z+(Math.random()-.5)*.5,ry:IS.tvSpot.ry,pose:'idle',y:0};
    if(k==='bed')g={k,x:q.bedSpot.x,z:q.bedSpot.z,ry:0,pose:'lie',y:q.bedSpot.y,lie:1,yaw:q.bedSpot.yaw||0};
    if(k==='chat'){const a=Math.random()*6.28;g={k,x:p.ix+Math.cos(a)*.9,z:p.iz+Math.sin(a)*.9,pose:'talk',y:0,face:1}}
    if(k==='stand'){const a=Math.random()*6.28;g={k,x:Math.cos(a)*1.2,z:Math.sin(a)*1.2,pose:pick(['phone','idle','drink']),y:0,ry:Math.random()*6.28}}
    startWalk(q,A,g);A.next=now+(k==='bed'?50:k==='desk'?35:k==='tv'?40:20)+Math.random()*25})}
function startWalk(q,A,g){const G=iGrid(),x0=q.mesh.position.x,z0=q.mesh.position.z;
  /* first move: they stop blocking the spot they started on */
  if(!q.freed){q.freed=1;const i=IS.obst.findIndex(o=>Math.abs((o.x1+o.x2)/2-q.x)<.01&&Math.abs((o.z1+o.z2)/2-q.z)<.01&&o.x2-o.x1<.4);if(i>=0){IS.obst.splice(i,1);IS.grid=null}}
  const free=(x,z)=>!G.bl[gIdx(G,x,z)];let ap={x:g.x,z:g.z};if(!free(g.x,g.z)){let best=null,bd=1e9;for(const r of[.45,.6,.8])for(let k=0;k<16;k++){const a=k/16*6.283,x=g.x+Math.cos(a)*r,z=g.z+Math.sin(a)*r;if(!free(x,z))continue;const d=Math.hypot(x-x0,z-z0);if(d<bd){bd=d;best={x,z}}}if(!best)return;ap=best}
  const path=findPath(iGrid(),x0,z0,ap.x,ap.z);if(!path||!path.length)return;
  q.pose=null;q.lying=false;q.sleeping=false;q.spotY=0;q.mesh.rotation.z=0;q.mesh.rotation.x=0;A.path=path.map(o=>({x:o.x,z:o.y}));A.goal=g;A.glide=null}
function walkAlong(q,A,dt){const m=q.mesh,pt=A.path[0];
  if(A.glide){const G=A.glide;G.t=Math.min(1,G.t+dt/.45);const e=1-Math.pow(1-G.t,3);m.position.x=G.x0+(G.x1-G.x0)*e;m.position.z=G.z0+(G.z1-G.z0)*e;if(G.t>=1){A.path=null;A.glide=null;arrive(q,A.goal)}return}
  if(!pt){const g=A.goal;A.glide={x0:m.position.x,z0:m.position.z,x1:g.face?m.position.x:g.x,z1:g.face?m.position.z:g.z,t:0};q.mov=false;return}
  const dx=pt.x-m.position.x,dz=pt.z-m.position.z,d=Math.hypot(dx,dz),st=dt*1.15;
  if(d<=st){m.position.x=pt.x;m.position.z=pt.z;A.path.shift()}else{m.position.x+=dx/d*st;m.position.z+=dz/d*st;const want=Math.atan2(dx,dz);let df=((want-m.rotation.y+Math.PI*3)%(Math.PI*2))-Math.PI;m.rotation.y+=df*Math.min(1,dt*10)}
  q.mov=true;q.pose=null;q.x=m.position.x;q.z=m.position.z}
function arrive(q,g){const m=q.mesh,p=P();q.mov=false;q.x=m.position.x;q.z=m.position.z;
  m.rotation.y=g.face?Math.atan2(p.ix-m.position.x,p.iz-m.position.z):g.ry;q.pose=g.pose;q.spotY=g.y||0;q.lying=!!g.lie;q.sleeping=!!g.lie;m.position.y=q.spotY}
