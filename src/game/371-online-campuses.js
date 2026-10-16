/* ---- campuses ---- */
function campResidents(){const r={};Object.values(MP.members).forEach(m=>{r[m.cp]=(r[m.cp]||0)+1});return r}
function campOnline(){const r={};MP.lobbyPeers.forEach(q=>{const c=q.presence.cp;if(typeof c==='string')r[c]=(r[c]||0)+1});return r}
function campList(){const res=campResidents(),on=campOnline(),ids=new Set([...Object.keys(res),...Object.keys(on)].filter(c=>/^c\d{1,3}$/.test(c)));let n=1;while(ids.has('c'+n)&&(res['c'+n]||0)>=CAMP_MAX)n++;ids.add('c'+n);
  return [...ids].map(id=>({id,name:campName(id),res:res[id]||0,on:on[id]||0})).filter(c=>c.res<CAMP_MAX).sort((a,b)=>b.res-a.res||b.on-a.on||a.id.localeCompare(b.id,undefined,{numeric:true}))}
async function joinCampus(id){if(!MP.lobby){MP.campus=null;return false}if(MP.campus===id&&MP.croom)return true;
  if(MP.croom){try{await MP.croom.leave()}catch(e){}MP.croom=null;for(const rp of MP.peers.values())if(rp.mesh){scene.remove(rp.mesh);disposeTree(rp.mesh)}MP.peers.clear()}
  MP.campus=id;MP.lastLobby='';try{const r=await MP.lobby.join('campus-'+id);MP.croom=r;r.onPeers(ch=>{try{mpPeers(ch)}catch(e){console.error(e)}},()=>{});return true}catch(e){toast('Could not connect to that campus right now.');return false}}
function bedsLeft(roomId){if(!MP.campus)return null;const r=ROOMS[roomId],cap=(ROOMCAP[r.beds]||4)*r.beds;let used=0;Object.entries(MP.members).forEach(([u,m])=>{if(u!==MP.uid&&m.cp===MP.campus&&m.room===roomId)used++});return Math.max(0,cap-used)}
function pickRoomNo(roomId){const r=ROOMS[roomId],nRooms=ROOMCAP[r.beds]||4,occ={};Object.entries(MP.members).forEach(([u,m])=>{if(u!==MP.uid&&m.cp===MP.campus&&m.room===roomId)occ[m.rn]=(occ[m.rn]||0)+1});
  for(let i=1;i<=nRooms;i++)if(occ[i]&&occ[i]<r.beds)return i;for(let i=1;i<=nRooms;i++)if(!occ[i])return i;return 1}
async function mpWriteMember(){if(!MP.db||!MP.uid||!MP.campus||!S)return;const p=P();try{await MP.db.doc('members/'+MP.uid).set({cp:MP.campus,nm:mpClean(p.name,16),room:p.room,rn:MP.rn||1,at:Date.now()})}catch(e){}}
function realMates(){if(!MP.campus||!S)return[];const p=P();return Object.entries(MP.members).filter(([u,m])=>u!==MP.uid&&m.cp===MP.campus&&m.room===p.room&&m.rn===(MP.rn||1)).map(([u,m])=>({uid:u,nm:m.nm,at:m.at}))}
function mpSyncMates(){if(!S||!MP.campus)return;const rm=realMates(),want=Math.max(0,roomOf().beds-1-rm.length);
  while(S.mates.length>want){const n=S.mates.pop();n.mate=false;n.home=n.origHome;n.bed=-1}
  const k=rm.map(x=>x.uid).sort().join(',');if(k!==MP.matesK){const was=MP.matesK;MP.matesK=k;if(was!=null&&rm.length)toast(`🛏 ${rm.map(x=>x.nm).join(' & ')} ${rm.length>1?'are':'is'} your real roommate${rm.length>1?'s':''} now`)}}
const myRoomKey=()=>S&&P()?`r:${P().room}:${MP.rn||1}`:'';
