/* ================= the room doesn't "reset" when you buy, place, move or sell things =================
   Changing furniture rebuilds the room behind the scenes. Now that rebuild is invisible: no fade to black,
   the same little details (books, marks on the wall) in the same places, everyone stays exactly where
   they were and keeps doing what they were doing, you stay where you are, the TV stays on, and nobody
   greets you again or re-signs the visitors' book. Waking up in the morning still gives a fresh room. */
let SOFT=0,SOFT_T=0,ROOM_SEED=1;
const seededRnd=seed=>{let s=seed>>>0||1;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}};
/* the room's random details come from a seed that stays the same for this visit */
{const _e=enterRoom;enterRoom=function(owner){if(owner==='me'&&!SOFT)ROOM_SEED=(Math.random()*4294967296)>>>0;return _e.apply(this,arguments)}}
{const _e0=enterRoom0;enterRoom0=function(owner){if(owner!=='me')return _e0.apply(this,arguments);const R0=Math.random;Math.random=seededRnd(ROOM_SEED);try{return _e0.apply(this,arguments)}finally{Math.random=R0}}}
{const _f=fadeIn;fadeIn=function(){if(SOFT)return;return _f.apply(this,arguments)}}
{const _rt=roomTalk;roomTalk=function(){if(performance.now()-SOFT_T<3000)return;return _rt.apply(this,arguments)}}
{const _t=toast;toast=function(m){if(performance.now()-SOFT_T<2500&&/visitors' book/.test(String(m)))return;return _t.apply(this,arguments)}}
let HARD_REFRESH=0;
{const _sn=sleepNow;sleepNow=function(){HARD_REFRESH++;try{return _sn.apply(this,arguments)}finally{HARD_REFRESH--}}}
{const _rr=refreshRoom;refreshRoom=function(){if(HARD_REFRESH||!(IS&&IS.mine))return _rr.apply(this,arguments);
  const p=P(),me={ix:p.ix,iz:p.iz,face:p.face,pose:p.pose,spotY:p.spotY,lying:p.lying},tvOn=typeof TV!=='undefined'&&TV.on,
    snap=IS.people.map(q=>({k:q.n?'n'+q.n.id:(q.mp?'m'+(q.mp.ck||q.mp.uid||''):'l'+q.label),x:q.mesh.position.x,y:q.mesh.position.y,z:q.mesh.position.z,ry:q.mesh.rotation.y,pose:q.pose,spotY:q.spotY,lying:q.lying,sleeping:q.sleeping,ai:q.ai,freed:q.freed,nightSleep:q.nightSleep,n:q.n,lbl:q.lbl||q.label,life:q.life,visitor:q.visitor,deskSpot:q.deskSpot,bedSpot:q.bedSpot,mp:q.mp,used:0}));
  SOFT++;SOFT_T=performance.now();let r;try{r=_rr.apply(this,arguments)}finally{SOFT--}
  try{if(IS&&IS.mine){Object.assign(p,me);
    IS.people.forEach(q=>{const k=q.n?'n'+q.n.id:(q.mp?'m'+(q.mp.ck||q.mp.uid||''):'l'+q.label),o=snap.find(s=>s.k===k);if(!o)return;o.used=1;
      const dx=q.mesh.position.x,dz=q.mesh.position.z,moved=Math.hypot(dx-o.x,dz-o.z)>.05;
      if(moved||o.freed){const i=IS.obst.findIndex(b=>b.x2-b.x1<.4&&Math.abs((b.x1+b.x2)/2-dx)<.02&&Math.abs((b.z1+b.z2)/2-dz)<.02);if(i>=0)IS.obst.splice(i,1)}
      q.mesh.position.set(o.x,o.y,o.z);q.mesh.rotation.y=o.ry;q.x=o.x;q.z=o.z;q.pose=o.pose;q.spotY=o.spotY;q.lying=o.lying;q.sleeping=o.sleeping;q.nightSleep=o.nightSleep;q.ai=o.ai;q.freed=o.freed||moved});IS.grid=null;
    /* people who had walked in after you arrived are put back too */
    snap.filter(o=>!o.used&&o.n&&!o.mp).forEach(o=>{try{const q=addInPerson(o.n.look,o.lbl||(o.n.name+(o.n.mate?' · roommate':o.visitor?' · visiting':'')),o.x,o.z,o.ry,o.pose||'idle',{n:o.n,noObst:1});if(!q)return;q.mesh.position.y=o.y;q.spotY=o.spotY;q.lying=o.lying;q.sleeping=o.sleeping;q.nightSleep=o.nightSleep;
      q.life=o.life;q.visitor=o.visitor;q.deskSpot=o.deskSpot;q.bedSpot=o.bedSpot;q.ai=o.ai;q.freed=1}catch(e){}});
    if(tvOn)setTimeout(()=>{try{tvPower(true,TV.auto)}catch(e){}},50)}}catch(e){console.warn(e)}return r}}
