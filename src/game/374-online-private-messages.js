/* ---- private messages that wait for you (mail box in the shared database) ---- */
function mpMailSnap(s){const fresh=[];s.docs.forEach(d=>{if(d.id===MP.uid||!okId(d.id))return;const v=d.data()||{},arr=v.to&&Array.isArray(v.to[MP.uid])?v.to[MP.uid]:[];
    const ms=arr.slice(-60).filter(m=>m&&typeof m==='object').map(m=>({k:['m','fr','fa','vo',...REL_KINDS].includes(m.k)?m.k:'m',tx:mpClean(m.tx),t:+m.t||0,i:String(m.i||'')})).filter(m=>m.t);
    const sn=v.seen&&typeof v.seen==='object'?+v.seen[MP.uid]||0:0;MP.mailIn[d.id]={nm:mpClean(v.nm,16)||'Student',ms,seen:sn};
    ms.forEach(m=>{const key=d.id+'|'+m.i+'|'+m.t;if(MP.seen.has(key))return;MP.seen.add(key);if(m.t>(MP.lastRead[d.id]||0)&&!MP.blocked[d.id])fresh.push([d.id,m])})});
  fresh.sort((a,b)=>a[1].t-b[1].t);
  if(!MP.mailFirst){MP.mailFirst=1;const n=fresh.filter(([u,m])=>m.k==='m').length;if(n)MP.pendingWelcome=n}
  else fresh.forEach(([u,m])=>{const nm=MP.mailIn[u].nm;if(m.k==='m')mpNotify(u,nm,m.tx);else if(m.k==='fr')toast(`🤝 ${nm} sent you a friend request. Open 🌐 → Chats.`);else if(m.k==='fa'){mpMakeFriend(u,nm);toast(`🎉 ${nm} accepted your friend request`)}else if(m.k==='vo'){visParse(u,nm,m.tx,m.t);mpPing();toast(`🏠 ${nm} invited you to their room. Tap them or open 🌐 → Chats.`)}});
  fresh.forEach(([u,m])=>{if(m.k==='fa')mpMakeFriend(u,MP.mailIn[u].nm)});
  try{relMail()}catch(e){console.error(e)}
  mpBadge();if(MP.view)mpRedraw()}
function mpPing(v=1){try{ACX=ACX||new (window.AudioContext||window.webkitAudioContext)();const t=ACX.currentTime,g=ACX.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.05*v,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+.28);g.connect(ACX.destination);[880,1320].forEach((fq,i)=>{const o=ACX.createOscillator();o.type='sine';o.frequency.value=fq;o.connect(g);o.start(t+i*.07);o.stop(t+.3)})}catch(e){}}
MP.seenOut=mpStore.get('seenOut',{});
function mpSeen(k){if(!MP.db||!MP.uid||k.startsWith('p:'))return;const their=(MP.mailIn[k]||{}).ms||[];const lastT=their.reduce((a,m)=>Math.max(a,m.t||0),0);if(!lastT||(MP.seenOut[k]||0)>=lastT)return;MP.seenOut[k]=lastT;mpStore.set('seenOut',MP.seenOut);
  if(window.__pairMail){MP.myMail.to[k]=MP.myMail.to[k]||[];dmFlush(k)}else{const M=MP.myMail;M.to[k]=M.to[k]||[];if(!M.rcpt.includes(k))M.rcpt=[k].concat(M.rcpt).slice(0,30);mailFlush()}}
function mpNotify(ck,nm,tx){if(MP.view&&MP.view.key===ck)return;mpPing();if(S&&!$('game').hidden){toast(`💬 ${nm}: ${tx.length>60?tx.slice(0,58)+'…':tx}`);const rp=[...MP.peers.values()].find(r=>mpKey(r)===ck);if(rp&&rp.mesh&&!IS)chatBubble(rp.mesh,tx)}}
function mpMakeFriend(u,nm){if(!MP.friends[u]){MP.friends[u]={nm,since:Date.now(),lv:20};mpStore.set('friends',MP.friends)}else MP.friends[u].nm=nm}
async function mailSend(to,k,tx){if(!MP.db||!MP.uid||!okId(to))return false;const M=MP.myMail;M.nm=mpClean(S&&S.p?P().name:'',16);
  const m={i:MP.sess+'.'+(++MP.seq),k,tx:mpClean(tx),t:Date.now()};M.to[to]=(Array.isArray(M.to[to])?M.to[to]:[]).concat(m).slice(-40);
  const keys=Object.keys(M.to).sort((a,b)=>((M.to[b].slice(-1)[0]||{}).t||0)-((M.to[a].slice(-1)[0]||{}).t||0));keys.slice(30).forEach(x=>delete M.to[x]);M.rcpt=keys.slice(0,30);
  if(window.__pairMail){dmFlush(to);return true}mailFlush();return true}
const DMQ={};async function dmFlush(to){const q=DMQ[to]=DMQ[to]||{};if(q.busy){q.again=1;return}q.busy=1;try{do{q.again=0;await MP.db.doc('dm/'+MP.uid+'_'+to).set({from:MP.uid,to,nm:MP.myMail.nm||mpClean(S&&S.p?P().name:'',16),ms:MP.myMail.to[to]||[],seen:MP.seenOut[to]||0,at:Date.now()})}while(q.again)}catch(e){toast('Message could not be sent. Check your connection.')}q.busy=0}
async function mailFlush(){if(MP.mailBusy){MP.mailAgain=true;return}MP.mailBusy=true;try{do{MP.mailAgain=false;await MP.db.doc('mail/'+MP.uid).set({nm:MP.myMail.nm,rcpt:MP.myMail.rcpt,to:MP.myMail.to,seen:MP.seenOut,at:Date.now()})}while(MP.mailAgain)}catch(e){toast('Message could not be saved for later. Check your connection.')}MP.mailBusy=false}
/* a conversation = their mail to me + my mail to them (+ local notes) */
function thread(k){if(MP.db&&MP.uid&&!k.startsWith('p:')){const a=((MP.mailIn[k]||{}).ms||[]).map(m=>({me:0,...m})),b=(Array.isArray(MP.myMail.to[k])?MP.myMail.to[k]:[]).map(m=>({me:1,k:m.k,tx:mpClean(m.tx),t:+m.t||0}));
    return a.concat(b,MP.sys[k]||[]).sort((x,y)=>x.t-y.t)}return ((MP.chats[k]||{}).ms||[]).concat(MP.sys[k]||[]).sort((x,y)=>x.t-y.t)}
const threadName=k=>(MP.mailIn[k]&&MP.mailIn[k].nm)||(MP.members[k]&&MP.members[k].nm)||(MP.friends[k]&&MP.friends[k].nm)||(MP.chats[k]&&MP.chats[k].nm)||([...MP.peers.values()].find(r=>mpKey(r)===k)||{}).nm||'Student';
function unreadOf(k){const lr=MP.lastRead[k]||0;return thread(k).filter(m=>!m.me&&!m.sys&&m.k!=='fa'&&m.t>lr).length}
function markRead(k){MP.lastRead[k]=Date.now();mpStore.set('lastRead',MP.lastRead)}
function allThreads(){const ks=new Set([...Object.keys(MP.mailIn),...Object.keys(MP.myMail.to||{}),...Object.keys(MP.chats)]);return [...ks].filter(k=>!MP.blocked[k]&&thread(k).length).sort((a,b)=>((thread(b).slice(-1)[0]||{}).t||0)-((thread(a).slice(-1)[0]||{}).t||0))}
/* who is online (anywhere) and where */
function onlineInfo(k){const rp=[...MP.peers.values()].find(r=>!r.isMe&&mpKey(r)===k);if(rp)return{on:1,here:1,txt:'🟢 '+mpWhere(rp),rp};
  const q=MP.lobbyPeers.find(q=>(q.by||q.presence.uid)===k&&!q.isMe);if(q)return{on:1,txt:'🟢 online'+(q.presence.cp?' · '+campName(q.presence.cp):'')};
  const m=MP.members[k];return{on:0,txt:m&&m.at?'⚪ last seen '+ago(m.at):'⚪ offline'}}
function ago(t){const s=(Date.now()-t)/1000;return s<90?'just now':s<3600?Math.round(s/60)+' min ago':s<86400?Math.round(s/3600)+' h ago':Math.round(s/86400)+' days ago'}
/* speech bubble over a player's head */
const CHB=[];function chatBubble(g,txt){CHB.forEach(x=>{if(x.on&&x.g===g){x.on=false;x.sp.visible=false}});let b=CHB.find(x=>!x.on);if(!b){const c=document.createElement('canvas');c.width=512;c.height=160;const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false,transparent:true}));sp.renderOrder=999;sp.scale.set(2.6,.81,1);scene.add(sp);b={sp,c,on:false};CHB.push(b)}
  const x=b.c.getContext('2d');x.clearRect(0,0,512,160);x.font='700 30px Figtree, system-ui, Apple Color Emoji';const words=String(txt).split(' '),lines=[''];words.forEach(w=>{const t=(lines[lines.length-1]+' '+w).trim();if(x.measureText(t).width>460&&lines[lines.length-1])lines.push(w);else lines[lines.length-1]=t});const L=lines.slice(0,3);if(lines.length>3)L[2]=L[2].slice(0,-1)+'…';
  const h=24+L.length*36;x.fillStyle='rgba(255,255,255,.97)';x.beginPath();x.roundRect?x.roundRect(6,4,500,h,24):x.rect(6,4,500,h);x.fill();x.beginPath();x.moveTo(236,h+3);x.lineTo(256,h+28);x.lineTo(278,h+3);x.fill();
  x.fillStyle='#1b1206';x.textAlign='center';x.textBaseline='middle';L.forEach((l,i)=>x.fillText(l,256,4+24+i*36));b.sp.material.map.needsUpdate=true;b.on=true;b.g=g;b.t=0;b.dur=Math.min(8,3+String(txt).length/18);b.sp.visible=true}
function chatBubbleTick(dt){CHB.forEach(b=>{if(!b.on)return;b.t+=dt;b.sp.position.set(b.g.position.x,2.75,b.g.position.z);b.sp.material.opacity=b.t>b.dur-.5?Math.max(0,(b.dur-b.t)*2):1;b.sp.visible=b.g.visible!==false||b.g===P().mesh;if(b.t>b.dur){b.on=false;b.sp.visible=false}})}
