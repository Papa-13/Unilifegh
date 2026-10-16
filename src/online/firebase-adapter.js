/* YOLO web build: gives the game the same online features it gets on claude.ai
   (live rooms, a small document database, a player id), backed by Firebase.
   - room  -> Firebase Realtime Database (who is on a campus, where they walk, campus chat)
   - db    -> Cloud Firestore (campus members, private messages, saved student lives)
   - user  -> Firebase Authentication (Google or guest sign-in)                          */
import {initializeApp} from 'firebase/app';
import {getAuth,onAuthStateChanged,signInAnonymously,GoogleAuthProvider,signInWithPopup,signInWithRedirect,signOut} from 'firebase/auth';
import {getFirestore,doc as fsDoc,collection as fsColl,getDoc,setDoc,updateDoc,deleteDoc,onSnapshot,query,where,orderBy,limit,getDocs} from 'firebase/firestore';
import {getDatabase,ref,set,remove,onDisconnect,onValue,onChildAdded,onChildChanged,onChildRemoved,serverTimestamp,goOffline} from 'firebase/database';
import cfg from './firebase-config.js';

if(!cfg||!cfg.apiKey||String(cfg.apiKey).includes('PASTE')){console.warn('YOLO: no Firebase config, playing offline');window.__fbResolve(null)}
else start().catch(e=>{console.error(e);window.__fbResolve(null)});

async function start(){
  const app=initializeApp(cfg),auth=getAuth(app),fs=getFirestore(app),rtdb=getDatabase(app);
  const user=await new Promise(res=>{const un=onAuthStateChanged(auth,u=>{un();res(u)})});
  const u=user||await signInScreen(auth);
  if(!u){goOffline(rtdb);window.__fbResolve(null);return}
  window.fbSignOut=async()=>{await signOut(auth);location.reload()};
  window.__fbResolve({user:userApi(u),db:dbApi(fs),room:roomApi(rtdb,u.uid,null)});
}

/* ---------- sign-in screen ---------- */
function signInScreen(auth){return new Promise(res=>{
  const o=document.createElement('div');o.id='fbSign';
  o.innerHTML=`<div class="fbs-in"><div class="fbs-eye">YOU ONLY LIVE ONCE</div><h2>YO<span style="color:#e8b24a">LO</span> 🎓</h2><p>Sign in to join an online campus with real students. Your student and your chats are saved to your account.</p>
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
   rooms/<name>/slow/<peer> = {by, p:{...everything except position}, t}   (changes rarely)
   rooms/<name>/fast/<peer> = {by, x, y, f, t}                            (several times a second)
   Both are removed automatically when the tab closes or loses connection. */
const FAST=['x','y','f'];
function roomApi(rtdb,uid,name){
  const myPeer=(window.__fbPeer=window.__fbPeer||Math.random().toString(36).slice(2,12)),rn=name||'lobby',base=`rooms/${rn}`;
  const slowR=ref(rtdb,`${base}/slow/${myPeer}`),fastR=ref(rtdb,`${base}/fast/${myPeer}`);
  let mine={},lastSlow='',lastFast='',fastT=0,fastTimer=null,dead=false;const peers=new Map(),hs=[],ch=[],unsubs=[];
  const peerOf=id=>{let p=peers.get(id);if(!p){p={slow:null,fast:null};peers.set(id,p)}return p};
  let fireT=null;const fire=()=>{if(fireT)return;fireT=setTimeout(()=>{fireT=null;const list=snapshot();hs.forEach(h=>{try{h({peers:list,joined:[],left:[],updated:[]})}catch(e){console.error(e)}})},80)};
  const snapshot=()=>{const out=[{peer:myPeer,by:uid,isMe:true,sameTab:true,kind:'viewer',guest:false,presence:Object.freeze({...mine}),updatedAt:Date.now()}];
    for(const [id,p] of peers){if(!p.slow||id===myPeer)continue;const pr=Object.assign({},p.slow.p||{});if(p.fast){FAST.forEach(k=>{if(k in p.fast)pr[k]=p.fast[k]})}
      out.push({peer:id,by:typeof p.slow.by==='string'?p.slow.by:null,isMe:p.slow.by===uid,sameTab:false,kind:'viewer',guest:false,presence:Object.freeze(pr),updatedAt:(p.fast&&p.fast.t)||p.slow.t||Date.now()})}
    return Object.freeze(out)};
  const watch=(kind)=>{const r=ref(rtdb,`${base}/${kind}`);
    unsubs.push(onChildAdded(r,s=>{peerOf(s.key)[kind]=s.val();fire()}),onChildChanged(r,s=>{peerOf(s.key)[kind]=s.val();fire()}),
      onChildRemoved(r,s=>{const p=peers.get(s.key);if(p){p[kind]=null;if(!p.slow&&!p.fast)peers.delete(s.key);if(kind==='slow')peers.delete(s.key)}fire()}))};
  watch('slow');watch('fast');
  let connected=false;unsubs.push(onValue(ref(rtdb,'.info/connected'),s=>{connected=!!s.val();if(connected&&!dead){onDisconnect(slowR).remove();onDisconnect(fastR).remove();lastSlow='';lastFast='';push()}ch.forEach(h=>h(connected))}));
  const push=()=>{if(dead)return;const slow={},fast={};for(const k in mine){if(FAST.includes(k))fast[k]=mine[k];else slow[k]=mine[k]}
    const sj=JSON.stringify(slow);if(sj!==lastSlow){lastSlow=sj;set(slowR,{by:uid,p:slow,t:serverTimestamp()}).catch(()=>{})}
    const fj=JSON.stringify(fast);if(fj!==lastFast&&'x' in fast){const now=Date.now(),wait=Math.max(0,350-(now-fastT));clearTimeout(fastTimer);fastTimer=setTimeout(()=>{fastT=Date.now();lastFast=JSON.stringify(fastNow());set(fastR,{by:uid,...fastNow(),t:serverTimestamp()}).catch(()=>{})},wait)}};
  const fastNow=()=>{const o={};FAST.forEach(k=>{if(mine[k]!=null)o[k]=mine[k]});return o};
  const api={name:name||undefined,
    presence:async patch=>{for(const k in patch){if(patch[k]===null)delete mine[k];else mine[k]=patch[k]}push();fire()},
    peers:()=>snapshot(),onPeers:(h)=>{hs.push(h);setTimeout(fire,0);return()=>{const i=hs.indexOf(h);if(i>=0)hs.splice(i,1)}},
    connected:()=>connected,onConnection:(h)=>{ch.push(h);setTimeout(()=>h(connected),0);return()=>{const i=ch.indexOf(h);if(i>=0)ch.splice(i,1)}},
    emit:async()=>{},on:()=>()=>{},
    join:async n=>roomApi(rtdb,uid,n),
    leave:async()=>{dead=true;clearTimeout(fastTimer);unsubs.forEach(f=>{try{f()}catch(e){}});await Promise.all([remove(slowR),remove(fastR)]).catch(()=>{});peers.clear()}};
  return Object.freeze(api)}
