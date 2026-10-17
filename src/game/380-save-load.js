/* ================= saving your student's life ================= */
const SKIPK=new Set(['walkTo','mesh','legs','knees','arms','elbows','head','lids','torso','path','ipath','target','itarget','gest','plan','with','tag','ring']);
const SKIPS=new Set(['p','npcs','lecs','mates','busy','ride','del','Q','pending','auto','goDo','talkN','sportRoster','lastNear','pendTalk','typing','paused','hangIv','_busyK','_vk','lastGame']);
function ser(v,d=0,own){if(d>14)return undefined;if(v==null)return v;const t=typeof v;if(t==='function')return undefined;if(t!=='object')return t==='number'&&!isFinite(v)?0:v;
  if(v.isObject3D||v.isMaterial||v.isTexture||(typeof HTMLElement!=='undefined'&&v instanceof HTMLElement))return undefined;
  if(!own&&S&&S.npcs&&S.npcs.includes(v))return{__npc:v.id};if(Array.isArray(v))return v.map(x=>{const r=ser(x,d+1);return r===undefined?null:r});
  if(v instanceof Map||v instanceof Set)return undefined;const o={};for(const k in v){if(SKIPK.has(k)||k[0]==='_')continue;const r=ser(v[k],d+1);if(r!==undefined)o[k]=r}return o}
function deser(v){if(v==null||typeof v!=='object')return v;if(Array.isArray(v))return v.map(deser);if('__npc' in v)return S.npcs.find(n=>n.id===v.__npc)||null;const o={};for(const k in v)o[k]=deser(v[k]);return o}
function makeSave(){if(!S||!S.p)return null;const sv={v:1,map2:1,map3:1,ts:Date.now(),campus:MP.campus,cn:MP.campus?campName(MP.campus):null,rn:MP.rn,look:ser(myLook),pre:ser(PRE),p:ser(S.p),npcs:S.npcs.map(n=>ser(n,0,true)),S:{},mp:{friends:MP.friends,lastRead:MP.lastRead,blocked:MP.blocked,rel:relGet(),relSeen:[...relSeen()].slice(-300)}};
  for(const k in S){if(SKIPS.has(k))continue;const v=ser(S[k]);if(v===undefined)continue;if(k==='msgs'&&Array.isArray(v)){sv.S[k]=v.slice(0,80);continue}try{if(JSON.stringify(v).length<40000)sv.S[k]=v}catch(e){}}return sv}
let SAVING=false;async function saveGame(){const sv=makeSave();if(!sv)return;try{localStorage.setItem('freshers-save',JSON.stringify(sv))}catch(e){}
  if(MP.db&&MP.uid&&!SAVING){SAVING=true;try{await MP.db.doc('data/users/'+MP.uid+'/save').set(sv)}catch(e){}SAVING=false}
  if(MP.campus&&MP.db&&(!MP.memT||Date.now()-MP.memT>120000)){MP.memT=Date.now();mpWriteMember()}}
async function findSave(){let a=null,b=null;try{a=JSON.parse(localStorage.getItem('freshers-save')||'null')}catch(e){}
  if(MP.db&&MP.uid)try{const d=await MP.db.doc('data/users/'+MP.uid+'/save').get();if(d.exists)b=d.data()}catch(e){}
  const ok=x=>x&&x.v===1&&x.p&&x.pre&&x.look&&ROOMS[x.pre.room];return [a,b].filter(ok).sort((x,y)=>(y.ts||0)-(x.ts||0))[0]||null}
async function loadGame(sv){if(sv&&sv.campus&&sv.cn&&String(sv.campus)[0]==='u')MP.cnames[sv.campus]=mpClean(sv.cn,24);myLook=Object.assign({},sv.look);PRE=Object.assign({},sv.pre);MP.campus=null;MP.rn=sv.rn||1;
  if(sv.campus&&MP.lobby)await joinCampus(sv.campus);
  NOBOTS=!!sv.campus;newGame();const p=P();
  (sv.npcs||[]).forEach(o=>{if(!o)return;const n=S.npcs.find(x=>x.id===o.id);if(!n)return;const relook=o.look&&JSON.stringify(o.look)!==JSON.stringify(n.look);
    for(const k in o){if(k==='look'||k==='id')continue;n[k]=deser(o[k])}if(relook){n.look=o.look;scene.remove(n.mesh);disposeTree(n.mesh);const h=makeHuman(n.look,{label:n.name});scene.add(h.g);Object.assign(n,{mesh:h.g,legs:h.legs,knees:h.knees,arms:h.arms,elbows:h.elbows,head:h.head,lids:h.lids,torso:h.torso})}
    n.plan=null;n.lastPlan=-1;n.amb=null;n.with=0;n.hidden=false;n.mirror=false;n.needPath=true});
  const sp=deser(sv.p);delete sp.look;Object.assign(p,sp);p.target=null;p.path=null;p.pose=null;p.inCar=false;p.onBus=null;
  Object.assign(S,deser(sv.S||{}));ensureAcad();S.mates=S.npcs.filter(n=>n.mate);S.paused=false;S.busy=null;S.lastHour=-1;
  if(MP.campus){const sd=Math.floor(S.min/1440),tod=campusMin()%1440;campusAlign(sd+(tod<S.min%1440?1:0))}else S.campOff=null;
  if(sv.mp){if(sv.mp.rel!==undefined&&!mpStore.get('rel',null))relSet(sv.mp.rel);if(Array.isArray(sv.mp.relSeen))sv.mp.relSeen.forEach(x=>relSeen().add(x));Object.assign(MP.friends,sv.mp.friends||{});Object.assign(MP.lastRead,sv.mp.lastRead||{});Object.assign(MP.blocked,sv.mp.blocked||{})}
  if(!sv.map3){const d=homeB().door;p.x=d[0];p.y=d[1]+24*outDir(homeB());IS&&leaveRoom(true);S.npcs.forEach(n=>{const b=BID[n.home];if(b){n.x=b.door[0]+R(-20,20);n.y=b.door[1]+24*outDir(b)}});setTimeout(()=>toast('🗺️ The campus has been rebuilt like KNUST! Hostels are now spread across Ayeduase, Kotei, Bomso, Ayigya and more. Tap 🗺 to explore.'),2500)}
  if(!isFinite(p.x)||solidAt(p.x,p.y,6)){const d=homeB().door;p.x=d[0];p.y=d[1]+24*outDir(homeB())}
  mpSyncMates();showGame();setTimeout(()=>{toast(`Welcome back, ${p.name}! Day ${day()+1} · ${hm(S.min)}${MP.campus?' · '+campName(MP.campus):''}`);if(MP.pendingWelcome){toast(`📬 ${MP.pendingWelcome} new message${MP.pendingWelcome>1?'s':''} while you were away. Tap 🌐`);MP.pendingWelcome=0}},900);
  if(MP.campus)mpWriteMember()}
setInterval(()=>{if(S&&S.p&&!$('game').hidden)saveGame()},30000);
addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&S&&S.p)saveGame()});
addEventListener('pagehide',()=>{if(S&&S.p){const sv=makeSave();try{localStorage.setItem('freshers-save',JSON.stringify(sv))}catch(e){}}});
