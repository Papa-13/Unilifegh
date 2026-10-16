/* ---- live moments (campus chat, saying things out loud, gestures) ---- */
function mpSend(to,k,tx){if(!MP.croom){toast('You are not on an online campus right now.');return null}const m={i:MP.sess+'.'+(++MP.seq),to,k,tx:mpClean(tx),t:Date.now()};MP.out.push(m);if(MP.out.length>6)MP.out.shift();MP.lastPres='';mpTick();return m}
function mpIn(rp,m){if(!m||typeof m!=='object'||typeof m.i!=='string')return;const key=rp.peer+'|'+m.i;if(MP.seen.has(key))return;MP.seen.add(key);
  if(rp.isMe||MP.blocked[mpKey(rp)])return;const age=Date.now()-(+m.t||0);const tx=mpClean(m.tx),k=String(m.k||'m');
  if(m.to==='*rom'){if(age<60000)try{romSeen(rp,tx)}catch(e){console.error(e)}return}
  const forMe=(MP.uid&&m.to===MP.uid)||(MP.peer&&m.to==='p:'+MP.peer);
  if(m.to==='*all'){if(age>120000||!tx)return;MP.camp.push({nm:rp.nm,key:mpKey(rp),tx,t:+m.t||Date.now()});if(MP.camp.length>80)MP.camp.shift();if(!(MP.view&&MP.view.tab==='camp'&&!MP.view.key))MP.campUnread=(MP.campUnread||0)+1;mpBadge();if(MP.view)mpRedraw();return}
  if(m.to==='*near'){if(age>30000||!tx||!S||IS||!rp.mesh)return;const p=P();if(Math.hypot(rp.x-p.x,rp.y-p.y)>380)return;chatBubble(rp.mesh,tx);return}
  if(!forMe||age>180000)return;const ck=mpKey(rp);
  if(LOAN_KINDS.includes(k)){if(age>120000)return;try{loanIn(ck,rp.nm,k,tx,'p|'+rp.peer+'|'+m.i)}catch(e){console.error(e)}return}
  if(REL_KINDS.includes(k)){if(age>120000)return;try{relIn(ck,rp.nm,k,tx,'p|'+rp.peer+'|'+m.i)}catch(e){console.error(e)}return}
  if(k==='sg'||k==='vis'||k==='ask'||k==='ans'){if(age>60000)return;try{({sg:sgIn,vis:visIn,ask:askIn,ans:ansIn})[k](rp,ck,tx)}catch(e){console.error(e)}return}
  if(k==='act'){const a=['wave','hug','dap','laugh','dance','handshake','walk','stopwalk'].includes(tx)?tx:null;if(!a)return;mpSys(ck,`${rp.nm} ${ {wave:'waved at you 👋',hug:'hugged you 🤗',dap:'gave you a dap 🤜🤛',laugh:'is laughing 😂',dance:'is dancing with you 💃',handshake:'shook your hand 🤝',walk:'is walking with you 🚶',stopwalk:'stopped walking with you'}[a]}`);if(a==='walk'||a==='stopwalk'){if(!(MP.view&&MP.view.key===ck))toast(`🚶 ${rp.nm} ${a==='walk'?'is walking with you. Tap them to walk together.':'went their own way.'}`);return}
    if(S&&!IS){const p=P();if(Math.hypot(rp.x-p.x,rp.y-p.y)<200){try{setGest(rp,a==='laugh'?'laugh':a,2.2);setGest(p,a==='hug'?'hug':a==='dap'?'dap':a==='handshake'?'handshake':'wave',2)}catch(e){}}}
    if(!(MP.view&&MP.view.key===ck))toast(`🌐 ${rp.nm}: ${ {wave:'👋 waves at you',hug:'🤗 hugs you',dap:'🤜🤛 daps you',laugh:'😂 laughs',dance:'💃 dances with you',handshake:'🤝 shakes your hand'}[a]}`);mpPing(.5);return}
  if(MP.db&&MP.uid&&rp.by)return; // private messages arrive through the mail box below
  const th=MP.chats[ck]=MP.chats[ck]||{nm:rp.nm,ms:[]};th.nm=rp.nm;
  if(k==='m'&&tx){th.ms.push({me:0,tx,t:+m.t||Date.now()});if(th.ms.length>150)th.ms.splice(0,th.ms.length-150);mpNotify(ck,rp.nm,tx)}
  mpStore.set('chats',MP.chats);mpBadge();if(MP.view)mpRedraw()}
function mpSys(ck,tx){(MP.sys[ck]=MP.sys[ck]||[]).push({sys:1,tx,t:Date.now()});if(MP.view&&MP.view.key===ck)mpRedraw()}
