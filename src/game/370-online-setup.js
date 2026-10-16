/* ================= multiplayer: campuses of up to 50 real students, live + offline chat, saved lives =================
   - The lobby (everyone with the game open) shows each campus and how many students live there (35/50).
   - Each campus is its own live room: you see the other students walking around and can talk to them.
   - Private messages are kept in the game's shared database, so friends get them when they come back online.
   - Your student's life (money, needs, room, friends...) is saved and continues next time.
   Everything another player sends is untrusted text and is only ever shown as text. */
const CAMP_MAX=50,CNAMES=['Akwaaba','Sankofa','Unity','Adinkra','Volta','Ashanti','Coastal','Savannah','Kente','Harmattan','Lagoon','Cocoa'];
const campName=id=>{const i=Math.max(0,(parseInt(String(id).slice(1))||1)-1);return `${CNAMES[i%CNAMES.length]} Campus${i>=CNAMES.length?' '+(Math.floor(i/CNAMES.length)+1):''}`};
const ROOMCAP={4:3,3:4,2:5,1:8};
/* everyone on an online campus shares the same time of day: 1 real second = 1 game minute (a game day = 24 real minutes) */
const CAMP_EPOCH=Date.UTC(2026,0,1),CAMP_RATE=1;
const campusMin=()=>(Date.now()+(window.__srvOff||0)-CAMP_EPOCH)/1000*CAMP_RATE;
function syncClock(){const cm=campusMin();let t=cm+S.campOff;if(S.min-t>360){S.campOff=Math.round((S.min-cm)/1440)*1440;t=cm+S.campOff}const dd=t-S.min;if(dd>0)decay(Math.min(dd,3));S.min=t}
const sharedClock=()=>!!(MP.campus&&S&&S.campOff!=null);
function campusAlign(dayWanted){const cm=campusMin();S.campOff=dayWanted*1440-Math.floor(cm/1440)*1440;S.min=cm+S.campOff;S.lastHour=-1;S.speed=1}
const MP={lobby:null,croom:null,db:null,uid:null,peer:null,campus:null,rn:1,peers:new Map(),lobbyPeers:[],members:{},mailIn:{},myMail:{nm:'',rcpt:[],to:{}},mailBusy:false,mailAgain:false,
  out:[],seq:0,sess:Math.random().toString(36).slice(2,7),seen:new Set(),status:'connecting',view:null,lastPres:'',lastT:0,lastLobby:'',
  blocked:{},friends:{},lastRead:{},sys:{},chats:{},unread:{},camp:[],ready:false,readyFns:[]};
const mpStore={get(k,d){try{const v=localStorage.getItem('fr-mp-'+k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem('fr-mp-'+k,JSON.stringify(v))}catch(e){}}};
MP.friends=mpStore.get('friends',{});MP.chats=mpStore.get('chats',{});MP.blocked=mpStore.get('blocked',{});MP.lastRead=mpStore.get('lastRead',{});
const mpClean=(t,n=240)=>String(t==null?'':t).replace(/[\u0000-\u001f\u007f​-‏‪-‮⁦-⁩]/g,' ').replace(/\s+/g,' ').trim().slice(0,n);
function mpLook(L){const g=L&&L.gender==='f'?'f':'m',ok=(v,set)=>set.includes(v)?v:pick(set),r={gender:g};
  r.skin=ok(L&&L.skin,SKINS);r.hair=ok(L&&L.hair,Object.keys(HAIR[g]));r.outfit=ok(L&&L.outfit,Object.keys(OUTFIT[g]));r.pal=ok(L&&L.pal,Object.keys(PAL));r.shoes=ok(L&&L.shoes,Object.keys(SHOES));r.extra=ok(L&&L.extra,Object.keys(EXTRA));r.bag=ok(L&&L.bag,['backpack','tote','none']);return r}
const mpKey=rp=>rp.by||('p:'+rp.peer);
const okId=v=>typeof v==='string'&&/^[A-Za-z0-9_\-.~:@+]{1,120}$/.test(v);
function mpWhenReady(fn){if(MP.ready)fn();else MP.readyFns.push(fn)}
(async function mpInit(){const use=n=>window.claude&&claude.use?claude.use(n).catch(()=>null):Promise.resolve(null);let room,user,db;
  try{[room,user,db]=await Promise.all([use('room'),use('user'),use('db')])}catch(e){}
  if(user)try{MP.uid=await user.id()}catch(e){}
  MP.db=db&&MP.uid?db:null;
  if(MP.db){try{MP.db.collection('members').onSnapshot(s=>{const m={};s.docs.forEach(d=>{const v=d.data()||{};if(typeof v.cp==='string')m[d.id]={cp:v.cp,nm:mpClean(v.nm,16)||'Student',room:typeof v.room==='string'?v.room:null,rn:+v.rn||1,at:+v.at||0}});MP.members=m;mpSyncMates();mpBadge();mpRefreshMenus()},()=>{})}catch(e){}
    if(window.__pairMail){/* web build: one private document per sender→recipient pair */
      try{const s=await MP.db.collection('dm').where('from','==',MP.uid).get();s.docs.forEach(d=>{const v=d.data()||{};if(okId(v.to)&&Array.isArray(v.ms))MP.myMail.to[v.to]=v.ms.slice(-40)})}catch(e){}
      try{MP.db.collection('dm').where('to','==',MP.uid).onSnapshot(s=>mpMailSnap({docs:s.docs.map(d=>{const v=d.data()||{};return{id:v.from,data:()=>({nm:v.nm,seen:{[MP.uid]:+v.seen||0},to:{[MP.uid]:Array.isArray(v.ms)?v.ms:[]}})}}).filter(x=>okId(x.id))}),()=>{})}catch(e){}}
    else{try{const d=await MP.db.doc('mail/'+MP.uid).get();if(d.exists){const v=d.data()||{};MP.myMail={nm:v.nm||'',rcpt:Array.isArray(v.rcpt)?v.rcpt.filter(okId):[],to:v.to&&typeof v.to==='object'?v.to:{}}}}catch(e){}
    try{MP.db.collection('mail').where('rcpt','array-contains',MP.uid).onSnapshot(mpMailSnap,()=>{})}catch(e){}}}
  if(room){MP.lobby=room;MP.status='on';
    room.onConnection(c=>{MP.conn=c;mpBadge()},()=>{MP.status='off';mpBadge()});
    room.onPeers(ch=>{const me=ch.peers.find(q=>q.sameTab);if(me)MP.peer=me.peer;MP.lobbyPeers=ch.peers.filter(q=>!q.sameTab&&q.kind==='viewer'&&q.presence&&q.presence.g==='freshers');mpBadge();mpRefreshMenus();if(MP.view)mpSoft()},()=>{MP.status='off';mpBadge()});
    setInterval(mpTick,200)}else MP.status='off';
  MP.ready=true;MP.readyFns.splice(0).forEach(f=>{try{f()}catch(e){console.error(e)}});mpBadge()})();
