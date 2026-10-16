/* ---- presence ---- */
/* which indoor place I'm in: my room key, a friend's room, or a building id (null outdoors) */
const myInKey=()=>!IS?null:IS.kind==='room'?(IS.mine?myRoomKey():IS.owner&&IS.owner.real?realRoomKey(IS.owner):'v:'+(IS.owner&&IS.owner.home)):
  IS.bid==='hkitch'?'hkitch:'+P().home:(IS.bid==='hbath'||IS.bid==='lecoff')?'priv:'+(MP.peer||'me'):IS.bid;
function mpPresence(){if(!S||!S.p)return null;const p=P(),inB=myInKey(),L=p.look;
  return{g:'freshers',nm:mpClean(p.name,16),uid:MP.uid,lk:{gender:L.gender,skin:L.skin,hair:L.hair,outfit:L.outfit,pal:L.pal,shoes:L.shoes,extra:L.extra,bag:L.bag},
    x:Math.round(p.x),y:Math.round(p.y),f:p.face!=null?+p.face.toFixed(2):null,ps:p.inCar?'car':(['sit','sitTalk','phone','talk','dance','lie'].includes(p.pose)?p.pose:null),in:inB,car:!!p.inCar,
    mo:(()=>{try{return moodInfo().ic}catch(e){return''}})(),hm:p.home,pr:mpClean(lvlLabel()+' · '+p.prog,40),ty:MP.typing&&Date.now()-MP.typing.t<4000?MP.typing.to:null,wk:S.follow||null,ix:IS?Math.round(p.ix*100)/100:null,iz:IS?Math.round(p.iz*100)/100:null,mu:MUS.room&&inMyRoom()&&MUS.room.key===inB?{i:MUS.room.i,s:Math.round(MUS.room.s)}:null,out:MP.out}}
function mpTick(){document.body.classList.toggle('live',sharedClock());if(!MP.lobby)return;
  const lp={g:'freshers',cp:MP.campus,nm:mpClean(S&&S.p?P().name:(myLook&&myLook.name)||'',16),uid:MP.uid,st:S&&!$('game').hidden?'play':'menu'},lk=JSON.stringify(lp);if(lk!==MP.lastLobby){MP.lastLobby=lk;MP.lobby.presence(lp).catch(()=>{})}
  if(!MP.croom)return;let pr=mpPresence();if(!pr)return;let k=JSON.stringify(pr);const enc=new TextEncoder();while(enc.encode(k).length>3700&&MP.out.length){MP.out.shift();pr=mpPresence();k=JSON.stringify(pr)}
  if(k===MP.lastPres&&performance.now()-MP.lastT<4000)return;MP.lastPres=k;MP.lastT=performance.now();MP.croom.presence(pr).catch(()=>{})}
function mpPeers(ch){const live=new Set();
  ch.peers.forEach(q=>{if(q.sameTab||q.kind!=='viewer')return;const pr=q.presence||{};if(pr.g!=='freshers'||typeof pr.nm!=='string')return;live.add(q.peer);
    let rp=MP.peers.get(q.peer);const by=q.by||(okId(pr.uid)?pr.uid:null);
    if(!rp){rp={peer:q.peer,by,isMe:q.isMe,guest:q.guest,first:Date.now(),phase:0,x:0,y:0,tx:0,ty:0};MP.peers.set(q.peer,rp);if(S&&!q.isMe&&!$('game').hidden)toast(`🌐 ${mpClean(pr.nm,16)||'A student'} just came online`)}
    rp.by=by;rp.nm=mpClean(pr.nm,16)||'Student';rp.in=typeof pr.in==='string'?pr.in.slice(0,60):null;rp.car=!!pr.car;rp.mo=mpClean(pr.mo,4);rp.hm=typeof pr.hm==='string'&&BID[pr.hm]?pr.hm:null;rp.pr=mpClean(pr.pr,40);rp.upd=q.updatedAt;
    if(typeof pr.x==='number'&&typeof pr.y==='number'){rp.tx=clamp(pr.x,0,MW);rp.ty=clamp(pr.y,0,MH);if(!rp.placed){rp.x=rp.tx;rp.y=rp.ty;rp.placed=1}}
    rp.face2=typeof pr.f==='number'?pr.f:null;rp.ps=typeof pr.ps==='string'?pr.ps:null;rp.typ=typeof pr.ty==='string'?pr.ty:null;rp.ix=typeof pr.ix==='number'?pr.ix:null;rp.iz=typeof pr.iz==='number'?pr.iz:null;
    rp.mu=pr.mu&&typeof pr.mu==='object'&&Number.isInteger(pr.mu.i)&&pr.mu.i>=0&&pr.mu.i<CLUB_TRACKS.length&&typeof pr.mu.s==='number'?{i:pr.mu.i,s:pr.mu.s}:null;
    const lk=JSON.stringify(pr.lk||{})+rp.nm;if(lk!==rp.lkK&&S){rp.lkK=lk;rp.lookV=mpLook(pr.lk);mpMesh(rp,rp.lookV)}
    if(Array.isArray(pr.out))pr.out.slice(-8).forEach(m=>mpIn(rp,m))});
  for(const [k,rp] of MP.peers)if(!live.has(k)){if(rp.mesh){scene.remove(rp.mesh);disposeTree(rp.mesh)}MP.peers.delete(k)}
  mpRoomSync();mpBadge();if(MP.view)mpSoft()}
function mpMesh(rp,look){if(rp.mesh){scene.remove(rp.mesh);disposeTree(rp.mesh)}const h=makeHuman(look,{label:'🌐 '+rp.nm,labelColor:'#7fd8ff'});scene.add(h.g);
  Object.assign(rp,{look,mesh:h.g,legs:h.legs,knees:h.knees,arms:h.arms,elbows:h.elbows,head:h.head,lids:h.lids,torso:h.torso});rp._lx=null}
function mpRender(dt){if(!S)return;for(const rp of MP.peers.values()){if(!rp.mesh)continue;const d=Math.hypot(rp.tx-rp.x,rp.ty-rp.y);
    if(d>400){rp.x=rp.tx;rp.y=rp.ty}else if(d>.5){const k=Math.min(1,dt*6);rp.x+=(rp.tx-rp.x)*k;rp.y+=(rp.ty-rp.y)*k}
    rp.pose=d>3?null:(rp.ps&&rp.ps!=='car'?rp.ps:null);rp.face=rp.face2;syncChar(rp,dt,!IS&&!rp.in&&!rp.car)}}
/* real players in the same room or building as you appear inside it, where they really are, doing what they're doing */
function mpRoomSync(){if(!IS)return;const key=myInKey();if(!key)return;IS.mpp=IS.mpp||new Map();const want=new Set();
  for(const rp of MP.peers.values()){if(rp.isMe||rp.in!==key||!rp.lookV)continue;want.add(rp.peer);if(!IS.mpp.has(rp.peer)){const i=IS.mpp.size,x=rp.ix??(.4+i*.7),z=rp.iz??.9;const q=addInPerson(rp.lookV,'🌐 '+rp.nm,x,z,Math.PI*.85,rp.ps||'idle',{noObst:1});q.mp=rp;IS.mpp.set(rp.peer,q)}}
  for(const [k,q] of IS.mpp)if(!want.has(k)){IS.scene.remove(q.mesh);IS.people=IS.people.filter(x=>x!==q);IS.mpp.delete(k)}}

/* each frame: real players inside walk to where they are and do what they're doing (dancing, sitting…) */
function mpInTick(dt){if(!IS||!IS.mpp)return;const hw=IS.W/2-.3,hd=IS.D/2-.3;
  /* two people can't stand in one spot: in a lecture everyone's game seats them in "their" seat, so
     if someone's spot is taken (by you or a player placed before them), they shift along the row */
  const me=P(),taken=[[me.ix,me.iz]],free=(x,z)=>taken.every(([a,c])=>Math.hypot(a-x,c-z)>.45);
  for(const q of [...IS.mpp.values()].sort((a,b)=>a.mp&&b.mp&&a.mp.peer<b.mp.peer?-1:1)){const rp=q.mp;if(!rp)continue;let tx=clamp(rp.ix??q.x,-hw,hw),tz=clamp(rp.iz??q.z,-hd,hd);
    for(let k=1;k<7&&!free(tx,tz);k++){const nx=clamp((rp.ix??q.x)+(k%2?1:-1)*Math.ceil(k/2)*.75,-hw,hw);if(free(nx,tz)){tx=nx;break}if(k===6)tz=clamp(tz+.9,-hd,hd)}taken.push([tx,tz]);
    const dx=tx-q.x,dz=tz-q.z,d=Math.hypot(dx,dz);
    if(d>2.5){q.x=tx;q.z=tz;q.mov=false}else if(d>.04){const st=Math.min(d,dt*1.9);q.x+=dx/d*st;q.z+=dz/d*st;q.mov=true;q.mesh.rotation.y=Math.atan2(dx,dz)}else q.mov=false;
    q.pose=q.mov?null:(rp.ps&&rp.ps!=='car'?rp.ps:'idle');q.mesh.position.set(q.x,q.spotY||0,q.z)}}
