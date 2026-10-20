/* YOLO web build: gives the game the same online features it gets on claude.ai
   (live rooms, a small document database, a player id), backed by Firebase.
   - room  -> Firebase Realtime Database (who is on a campus, where they walk, campus chat)
   - db    -> Cloud Firestore (campus members, private messages, saved student lives)
   - user  -> Firebase Authentication (Google or guest sign-in)                          */
import {initializeApp} from 'firebase/app';
import {getAuth,onAuthStateChanged,signInAnonymously,GoogleAuthProvider,signInWithPopup,signInWithRedirect,signOut} from 'firebase/auth';
import {getFirestore,doc as fsDoc,collection as fsColl,getDoc,setDoc,updateDoc,deleteDoc,onSnapshot,query,where,orderBy,limit,getDocs} from 'firebase/firestore';
import {getDatabase,ref,set,remove,onDisconnect,onValue,onChildAdded,onChildChanged,onChildRemoved,serverTimestamp,goOffline,push,query as rtQuery,limitToLast} from 'firebase/database';
import cfg from './firebase-config.js';

if(!cfg||!cfg.apiKey||String(cfg.apiKey).includes('PASTE')){console.warn('YOLO: no Firebase config, playing offline');window.__fbResolve(null)}
else start().catch(e=>{console.error(e);window.__fbResolve(null)});

async function start(){
  const app=initializeApp(cfg),auth=getAuth(app),fs=getFirestore(app),rtdb=getDatabase(app);
  const user=await new Promise(res=>{const un=onAuthStateChanged(auth,u=>{un();res(u)})});
  const u=user||await signInScreen(auth);
  if(!u){goOffline(rtdb);window.__fbResolve(null);return}
  window.fbSignOut=async()=>{await signOut(auth);location.reload()};
  // a fresh sign-in token for the game's own server functions (the gem bank)
  window.fbIdToken=()=>auth.currentUser?auth.currentUser.getIdToken():Promise.resolve(null);
  // the server's clock, so the shared campus time and the club DJ line up on every phone
  onValue(ref(rtdb,'.info/serverTimeOffset'),s=>{window.__srvOff=+s.val()||0});
  /* group chats and the campus feed live in the Realtime Database under groups/ and feed/ */
  const okP=p=>/^(groups|feed)\/[A-Za-z0-9_-]{1,60}(\/[A-Za-z0-9_-]{1,60}){0,3}$/.test(p);
  window.fbRT={
    listen(path,n,cb){if(!okP(path))return()=>{};const q=rtQuery(ref(rtdb,path),limitToLast(n));return onChildAdded(q,s=>cb(s.key,s.val()))},
    watch(path,cb){if(!okP(path))return()=>{};return onValue(ref(rtdb,path),s=>cb(s.val()))},
    async push(path,v){if(!okP(path))throw new Error('bad path');const r=push(ref(rtdb,path));await set(r,v);return r.key},
    async set(path,v){if(!okP(path))throw new Error('bad path');await set(ref(rtdb,path),v)},
    uid:()=>auth.currentUser&&auth.currentUser.uid,
    /* status/<uid>: am I online and on which campus (tiny, so friends can see it without the lobby) */
    async status(v){const me=(auth.currentUser&&auth.currentUser.uid)||u.uid;if(!me)return;const r=ref(rtdb,'status/'+me);try{if(v){onDisconnect(r).remove();await set(r,{...v,t:serverTimestamp()})}else await remove(r)}catch(e){}},
    watchStatus(u,cb){if(!/^[A-Za-z0-9_-]{6,64}$/.test(u))return()=>{};return onValue(ref(rtdb,'status/'+u),s=>cb(s.val()),()=>cb(null))}};
  window.__fbResolve({user:userApi(u),db:dbApi(fs),room:roomApi(rtdb,u.uid,null)});
}

/* ---------- sign-in screen ---------- */
function signInScreen(auth){return new Promise(res=>{
  const o=document.createElement('div');o.id='fbSign';
  o.innerHTML=`<div class="fbs-in"><div class="fbs-eye">A GHANAIAN LIFE GAME</div><h2>YO<span style="color:#e8b24a">LO</span> 🎓</h2><p>Sign in to join an online campus with real students. Your student and your chats are saved to your account.</p>
   <button id="fbG" class="fbs-btn fbs-main">Continue with Google</button><button id="fbA" class="fbs-btn">Play as a guest</button><button id="fbO" class="fbs-btn fbs-ghost">Play offline</button>
   <small>Guest students are saved on this device only. Use Google to play from any device.</small><div id="fbErr"></div></div>`;
  const st=document.createElement('style');st.textContent=`#fbSign{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;background:radial-gradient(circle at 50% 0,#3a1d22,#0f0c0a 70%);color:#f6efe6;font:16px/1.5 Figtree,system-ui,sans-serif;padding:20px}
   .fbs-in{max-width:380px;width:100%;display:flex;flex-direction:column;gap:10px}.fbs-eye{font:600 11px/1 'JetBrains Mono',monospace;letter-spacing:.14em;opacity:.7}#fbSign h2{font:800 42px/1.05 'Bricolage Grotesque',system-ui;margin:0}#fbSign p{margin:0 0 6px;opacity:.85}
   .fbs-btn{padding:14px 16px;border-radius:14px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.08);color:inherit;font:700 16px Figtree,system-ui;cursor:pointer;text-align:left}.fbs-main{background:#e8b24a;color:#1b1206;border-color:#e8b24a}.fbs-ghost{background:transparent}
   #fbSign small{opacity:.6}#fbErr{color:#ff8f8f;font-size:14px}`;
  document.head.appendChild(st);document.body.appendChild(o);
  const done=u=>{o.remove();res(u)},err=e=>{o.querySelector('#fbErr').textContent=e&&e.message?e.message.replace('Firebase: ',''):'Sign-in failed. Try again.'};
  o.querySelector('#fbG').onclick=async()=>{const p=new GoogleAuthProvider();try{done((await signInWithPopup(auth,p)).user)}catch(e){if(/popup/i.test(e.code||''))signInWithRedirect(auth,p);else err(e)}};
  o.querySelector('#fbA').onclick=async()=>{try{done((await signInAnonymously(auth)).user)}catch(e){err(e)}};
  o.querySelector('#fbO').onclick=()=>done(null)})}

/* ---------- user ---------- */
function userApi(u){return Object.freeze({id:async()=>u.uid,me:async()=>({id:u.uid,name:u.displayName||'',avatarUrl:u.photoURL||'',color:'#e8b24a',email:null,isOwner:false,canEdit:false}),
  isOwner:async()=>false,canEdit:async()=>false,can:async()=>null,name:async()=>u.displayName||'',profiles:async ids=>Object.fromEntries([].concat(ids).map(i=>[i,{id:i,name:'',avatarUrl:'',color:'#888',email:null,isMe:i===u.uid,guest:false}]))})}

/* ---------- db (Firestore) ---------- */
// saved games can hold nested arrays, which Firestore does not store, so they travel as JSON text
const packed=p=>/^data\/users\//.test(p);
const snapOf=(id,exists,data,meta)=>({id,exists,data:()=>data,metadata:{fromCache:!!(meta&&meta.fromCache),hasPendingWrites:!!(meta&&meta.hasPendingWrites)}});
function unpack(path,d){if(!d)return d;if(packed(path)&&typeof d.__json==='string'){try{return JSON.parse(d.__json)}catch(e){return undefined}}return d}
function dbApi(fs){
  const docRef=path=>{const r=fsDoc(fs,path),id=path.split('/').pop();return{id,path,
    get:async()=>{const s=await getDoc(r);return snapOf(id,s.exists(),s.exists()?unpack(path,s.data()):undefined,s.metadata)},
    set:async d=>{await setDoc(r,packed(path)?{__json:JSON.stringify(d),ts:Date.now()}:d)},
    update:async d=>{await updateDoc(r,d)},delete:async()=>{await deleteDoc(r)},
    onSnapshot:(next,err)=>onSnapshot(r,s=>next(snapOf(id,s.exists(),s.exists()?unpack(path,s.data()):undefined,s.metadata)),e=>err&&err({code:'unavailable',message:e.message})),
    collection:p=>collRef(path+'/'+p),acquire:async()=>({acquired:true})}};
  const collRef=(path,cons=[])=>{const q=()=>cons.length?query(fsColl(fs,path),...cons):fsColl(fs,path);
    const wrap=s=>{const docs=s.docs.map(d=>snapOf(d.id,true,unpack(path+'/'+d.id,d.data()),d.metadata));return{docs,size:docs.length,empty:!docs.length,metadata:s.metadata,docChanges:()=>s.docChanges().map(c=>({type:c.type,doc:snapOf(c.doc.id,true,c.doc.data(),c.doc.metadata),oldIndex:c.oldIndex,newIndex:c.newIndex}))}};
    return{path,where:(f,op,v)=>collRef(path,cons.concat(where(f,op,v))),orderBy:(f,d)=>collRef(path,cons.concat(orderBy(f,d||'asc'))),limit:n=>collRef(path,cons.concat(limit(n))),
      get:async()=>wrap(await getDocs(q())),onSnapshot:(next,err)=>onSnapshot(q(),s=>next(wrap(s)),e=>err&&err({code:'unavailable',message:e.message})),
      doc:id=>docRef(path+'/'+(id||Math.random().toString(36).slice(2,12))),add:async d=>{const r=docRef(path+'/'+Math.random().toString(36).slice(2,12));await r.set(d);return r}}};
  return Object.freeze({doc:docRef,collection:p=>collRef(p)})}

/* ---------- room (Realtime Database) ----------
   Built so thousands of players can be online without everyone downloading everyone:
   rooms/<name>/slow/<peer>      = {by, p:{look, name, mood, rough position...}, t}   changes rarely (and at most every ~1.2 s)
   rooms/<name>/f/<cell>/<uid>   = {x, y, f, ix, iz}                                  several times a second while moving
   The map is cut into 900x900 cells (and each indoor place is its own cell). You only receive the
   live positions of players in your cell and the 8 around it (or inside the same place as you);
   everyone else you see from the rough position in their slow record (updated every ~20 s or 300 units).
   The lobby room is "lazy": the game only listens to it while you are on the menu or picking a campus.
   Everything is removed automatically when the tab closes or loses connection.
   If the database rules are still the old ones, it falls back to the old layout (rooms/<name>/fast/<peer>). */
const FAST=['x','y','f','ix','iz'],CELL=900;
function roomApi(rtdb,uid,name,opts={}){
  const myPeer=(window.__fbPeer=window.__fbPeer||Math.random().toString(36).slice(2,12)),rn=name||'lobby',base=`rooms/${rn}`,lazy=rn==='lobby';
  const slowR=ref(rtdb,`${base}/slow/${myPeer}`);
  let mine={},lastSlow='',slowT=0,slowTimer=null,lastFast='',fastT=0,fastTimer=null,dead=false,coarse=null,legacy=!!window.__fbLegacyFast,fastR=null,fastCell=null;
  const peers=new Map(),fastBy=new Map(),hs=[],ch=[],unsubs=[],cellSubs=new Map();
  let fireT=null;const fire=()=>{if(fireT)return;fireT=setTimeout(()=>{fireT=null;const list=snapshot();hs.forEach(h=>{try{h({peers:list,joined:[],left:[],updated:[]})}catch(e){console.error(e)}})},80)};
  const snapshot=()=>{const out=[{peer:myPeer,by:uid,isMe:true,sameTab:true,kind:'viewer',guest:false,presence:Object.freeze({...mine}),updatedAt:Date.now()}];
    for(const [id,p] of peers){if(!p.slow||id===myPeer)continue;const by=typeof p.slow.by==='string'?p.slow.by:null,pr=Object.assign({},p.slow.p||{}),fs=by&&fastBy.get(by);
      if(fs&&fs.v){FAST.forEach(k=>{if(k in fs.v)pr[k]=fs.v[k]})}
      out.push({peer:id,by,isMe:by===uid,sameTab:false,kind:'viewer',guest:false,presence:Object.freeze(pr),updatedAt:(fs&&fs.t)||p.slow.t||Date.now()})}
    return Object.freeze(out)};
  /* ---- slow records (who is here) ---- */
  let slowOn=false;const slowUn=[];
  const watchSlow=on=>{if(on===slowOn||dead)return;slowOn=on;if(!on){slowUn.splice(0).forEach(f=>{try{f()}catch(e){}});return}
    const r=ref(rtdb,`${base}/slow`);
    // an entry with my account but a different peer id is me from before a refresh: remove it so I don't see a copy of myself
    const stale=s=>{const v=s.val();if(v&&v.by===uid&&s.key!==myPeer){remove(ref(rtdb,`${base}/slow/${s.key}`)).catch(()=>{});return true}return false};
    const put=s=>{if(stale(s))return;const p=peers.get(s.key)||{};p.slow=s.val();peers.set(s.key,p);fire()};
    slowUn.push(onChildAdded(r,put),onChildChanged(r,put),onChildRemoved(r,s=>{peers.delete(s.key);fire()}))};
  if(!lazy)watchSlow(true);
  /* ---- live positions, by cell ---- */
  const safe=v=>String(v).replace(/[^A-Za-z0-9_-]/g,'_').slice(0,40);
  const cellOf=()=>mine.in?'i'+safe(mine.in):(mine.x==null?null:Math.floor(mine.x/CELL)+'_'+Math.floor(mine.y/CELL));
  const wantCells=()=>{const c=cellOf();if(!c)return[];if(c[0]==='i')return[c];const [a,b]=c.split('_').map(Number),o=[];for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)o.push((a+i)+'_'+(b+j));return o};
  const subCells=()=>{if(dead)return;const want=new Set(legacy?['*']:wantCells());
    for(const [c,un] of cellSubs)if(!want.has(c)){un.forEach(f=>{try{f()}catch(e){}});cellSubs.delete(c);for(const [u,v] of fastBy)if(v.c===c)fastBy.delete(u);fire()}
    for(const c of want){if(cellSubs.has(c))continue;const r=ref(rtdb,legacy?`${base}/fast`:`${base}/f/${c}`);
      const put=s=>{const v=s.val()||{},u=legacy?v.by:s.key;if(!u||u===uid)return;fastBy.set(u,{v,c,t:Date.now()});fire()};
      cellSubs.set(c,[onChildAdded(r,put),onChildChanged(r,put),onChildRemoved(r,s=>{const v=s.val()||{},u=legacy?v.by:s.key;const cur=fastBy.get(u);if(cur&&cur.c===c){fastBy.delete(u);fire()}})])}};
  const goLegacy=()=>{if(legacy)return;legacy=window.__fbLegacyFast=true;console.warn('YOLO: old database rules, using the old live-position layout');
    if(fastR){remove(fastR).catch(()=>{})}fastR=null;fastCell=null;for(const [,un] of cellSubs)un.forEach(f=>{try{f()}catch(e){}});cellSubs.clear();fastBy.clear();lastFast='';subCells();push()};
  let connected=false;unsubs.push(onValue(ref(rtdb,'.info/connected'),s=>{connected=!!s.val();if(connected&&!dead){onDisconnect(slowR).remove();if(fastR)onDisconnect(fastR).remove();lastSlow='';lastFast='';push()}ch.forEach(h=>h(connected))}));
  const fastNow=()=>{const o={};FAST.forEach(k=>{if(mine[k]!=null)o[k]=typeof mine[k]==='number'?Math.round(mine[k]*(k==='ix'||k==='iz'||k==='f'?100:1))/(k==='ix'||k==='iz'||k==='f'?100:1):mine[k]});return o};
  const writeSlow=()=>{if(dead)return;const slow={};for(const k in mine)if(!FAST.includes(k))slow[k]=mine[k];
    /* rough position for players far away: refreshed every 20 s or after moving 300 units */
    if(mine.x!=null){const now=Date.now();if(!coarse||Math.hypot(mine.x-coarse.x,mine.y-coarse.y)>300||now-coarse.t>20000||mine.in!==coarse.in)coarse={x:Math.round(mine.x/10)*10,y:Math.round(mine.y/10)*10,t:now,in:mine.in};slow.x=coarse.x;slow.y=coarse.y}
    const sj=JSON.stringify(slow);if(sj===lastSlow)return;const wait=Math.max(0,1200-(Date.now()-slowT));clearTimeout(slowTimer);
    slowTimer=setTimeout(()=>{if(dead)return;const again={};for(const k in mine)if(!FAST.includes(k))again[k]=mine[k];if(coarse&&mine.x!=null){again.x=coarse.x;again.y=coarse.y}const aj=JSON.stringify(again);if(aj===lastSlow)return;lastSlow=aj;slowT=Date.now();set(slowR,{by:uid,p:again,t:serverTimestamp()}).catch(()=>{})},wait)};
  const writeFast=()=>{if(dead||mine.x==null)return;const f=fastNow(),fj=JSON.stringify(f);if(fj===lastFast)return;
    const now=Date.now(),wait=Math.max(0,400-(now-fastT));clearTimeout(fastTimer);
    fastTimer=setTimeout(()=>{if(dead)return;const v=fastNow(),vj=JSON.stringify(v);if(vj===lastFast)return;fastT=Date.now();
      const cell=legacy?'*':cellOf();if(cell!==fastCell){if(fastR){const old=fastR;onDisconnect(old).cancel&&onDisconnect(old).cancel();remove(old).catch(()=>{})}
        fastR=ref(rtdb,legacy?`${base}/fast/${myPeer}`:`${base}/f/${cell}/${uid}`);fastCell=cell;onDisconnect(fastR).remove();subCells()}
      lastFast=vj;set(fastR,legacy?{by:uid,...v,t:serverTimestamp()}:v).catch(e=>{if(!legacy&&/permission/i.test(String(e&&(e.code||e.message))))goLegacy()})},wait)};
  const push=()=>{writeSlow();writeFast()};
  const api={name:name||undefined,
    presence:async patch=>{for(const k in patch){if(patch[k]===null)delete mine[k];else mine[k]=patch[k]}push();fire()},
    peers:()=>snapshot(),onPeers:(h)=>{hs.push(h);setTimeout(fire,0);return()=>{const i=hs.indexOf(h);if(i>=0)hs.splice(i,1)}},
    connected:()=>connected,onConnection:(h)=>{ch.push(h);setTimeout(()=>h(connected),0);return()=>{const i=ch.indexOf(h);if(i>=0)ch.splice(i,1)}},
    emit:async()=>{},on:()=>()=>{},
    /* lobby only: listen to who is online while on the menu, stop listening during play */
    watch:on=>{watchSlow(!!on);if(!on){peers.clear();fire()}},watching:()=>slowOn,
    join:async n=>roomApi(rtdb,uid,n),
    leave:async()=>{dead=true;clearTimeout(fastTimer);clearTimeout(slowTimer);watchSlow(false);unsubs.forEach(f=>{try{f()}catch(e){}});for(const [,un] of cellSubs)un.forEach(f=>{try{f()}catch(e){}});cellSubs.clear();
      await Promise.all([remove(slowR),fastR?remove(fastR):null]).catch(()=>{});peers.clear();fastBy.clear()}};
  return Object.freeze(api)}
