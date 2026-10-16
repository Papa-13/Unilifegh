/* ---- campuses ---- */
function campResidents(){const r={};Object.values(MP.members).forEach(m=>{r[m.cp]=(r[m.cp]||0)+1});return r}
function campOnline(){const r={};MP.lobbyPeers.forEach(q=>{const c=q.presence.cp;if(typeof c==='string'&&/^[a-z0-9]{1,8}$/.test(c)){r[c]=(r[c]||0)+1;const cn=q.presence.cn;if(c[0]==='u'&&typeof cn==='string'&&!MP.cnames[c])MP.cnames[c]=mpClean(cn,24)}});return r}
/* every campus that has students (living there or online now), plus one empty built-in campus to start on */
function campList(){const res=campResidents(),on=campOnline(),ids=new Set([...Object.keys(res),...Object.keys(on)].filter(c=>/^(c\d{1,3}|u[a-z0-9]{6})$/.test(c)));let n=1;while(ids.has('c'+n)&&(res['c'+n]||0)>=CAMP_MAX)n++;if(!ids.has('c'+n))ids.add('c'+n);
  return [...ids].map(id=>({id,name:campName(id),res:res[id]||0,on:on[id]||0,mine:id[0]==='u'})).filter(c=>c.res<CAMP_MAX).sort((a,b)=>b.on-a.on||b.res-a.res||a.name.localeCompare(b.name))}
/* a new campus needs a name nobody else is using (built-in names count too) */
const campKey=n=>String(n).toLowerCase().replace(/\bcampus\b/g,'').replace(/[^a-z0-9]/g,'');
function campNameProblem(name){const n=mpClean(name,24);if(n.length<3)return 'Give it a name with at least 3 letters.';if(!/^[\p{L}\p{N} '.-]+$/u.test(n))return 'Use letters, numbers, spaces, - or \' only.';
  const k=campKey(n);if(!k)return 'Give it a real name.';const taken=new Set([...CNAMES.map(campKey),...Object.values(MP.cnames).map(campKey),...Object.keys(campResidents()).map(id=>campKey(campName(id)))]);
  return taken.has(k)?`"${n}" is already taken. Try another name.`:null}
async function createCampus(name){const err=campNameProblem(name);if(err){toast(err);return false}const nm=mpClean(name,24),full=/campus$/i.test(nm)?nm:nm+' Campus';
  let id;do{id='u'+Math.random().toString(36).slice(2,8).padEnd(6,'0')}while(MP.cnames[id]);MP.cnames[id]=full;
  if(!(await joinCampus(id))){delete MP.cnames[id];return false}toast(`🏫 ${full} is yours! Create your student. Friends can find it in the campus list.`);return true}
async function joinCampus(id){if(!MP.lobby){MP.campus=null;return false}if(MP.campus===id&&MP.croom)return true;
  if(MP.croom){try{await MP.croom.leave()}catch(e){}MP.croom=null;for(const rp of MP.peers.values())if(rp.mesh){scene.remove(rp.mesh);disposeTree(rp.mesh)}MP.peers.clear()}
  MP.campus=id;MP.lastLobby='';try{const r=await MP.lobby.join('campus-'+id);MP.croom=r;r.onPeers(ch=>{try{mpPeers(ch)}catch(e){console.error(e)}},()=>{});return true}catch(e){toast('Could not connect to that campus right now.');return false}}
function bedsLeft(roomId){if(!MP.campus)return null;const r=ROOMS[roomId],cap=(ROOMCAP[r.beds]||4)*r.beds;let used=0;Object.entries(MP.members).forEach(([u,m])=>{if(u!==MP.uid&&m.cp===MP.campus&&m.room===roomId)used++});return Math.max(0,cap-used)}
function pickRoomNo(roomId){const r=ROOMS[roomId],nRooms=ROOMCAP[r.beds]||4,occ={};Object.entries(MP.members).forEach(([u,m])=>{if(u!==MP.uid&&m.cp===MP.campus&&m.room===roomId)occ[m.rn]=(occ[m.rn]||0)+1});
  for(let i=1;i<=nRooms;i++)if(occ[i]&&occ[i]<r.beds)return i;for(let i=1;i<=nRooms;i++)if(!occ[i])return i;return 1}
async function mpWriteMember(){if(!MP.db||!MP.uid||!MP.campus||!S)return;const p=P(),d={cp:MP.campus,nm:mpClean(p.name,16),room:p.room,rn:MP.rn||1,at:Date.now()};if(MP.campus[0]==='u')d.cn=campName(MP.campus);
  try{await MP.db.doc('members/'+MP.uid).set(d)}catch(e){if(d.cn)toast('⚠️ This campus could not be saved. The game\'s Firebase rules need updating (see docs/DEPLOY.md).')}}
function realMates(){if(!MP.campus||!S)return[];const p=P();return Object.entries(MP.members).filter(([u,m])=>u!==MP.uid&&m.cp===MP.campus&&m.room===p.room&&m.rn===(MP.rn||1)).map(([u,m])=>({uid:u,nm:m.nm,at:m.at}))}
function mpSyncMates(){if(!S||!MP.campus)return;const rm=realMates(),want=Math.max(0,roomOf().beds-1-rm.length);
  while(S.mates.length>want){const n=S.mates.pop();n.mate=false;n.home=n.origHome;n.bed=-1}
  const k=rm.map(x=>x.uid).sort().join(',');if(k!==MP.matesK){const was=MP.matesK;MP.matesK=k;if(was!=null&&rm.length)toast(`🛏 ${rm.map(x=>x.nm).join(' & ')} ${rm.length>1?'are':'is'} your real roommate${rm.length>1?'s':''} now`)}}
const myRoomKey=()=>S&&P()?`r:${P().room}:${MP.rn||1}`:'';
