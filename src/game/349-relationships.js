/* ================= real relationships: friends → crush → partner → (maybe) cheating and getting caught =================
   Everything here is between real players and always needs the other person's yes:
   • Friend request → accepted friends go into your phone contacts.
   • Flirt 😏, go on a date 🌹, kiss 💋: asked in person (pop-up, Accept/Decline). Each raises romance.
   • 💍 "Be my boyfriend / girlfriend?": works even when they're offline; they decide.
   • 💔 Break up any time.
   • Cheating: flirting, dating or kissing someone who isn't your partner. If your partner is there, they see it.
     If a friend of your partner sees it, they get to choose: tell your partner, or keep quiet.
     A partner who finds out chooses: break up, forgive, or talk.
   Your relationship status is public on your player card ("❤️ Dating Abena").
   Messages (mail when possible, so they wait for offline players):
   gq ask out · ga yes · gn no · bu break up · tl a witness tells you · ct your partner found out (f forgave / b broke up) */
const REL_KINDS=['gq','ga','gn','bu','tl','ct'];
const relMe=()=>MP.uid||('p:'+MP.peer);
function relGet(){if(!MP._relL){MP._relL=1;MP.rel=mpStore.get('rel',null)}return MP.rel}
function relSet(v){MP.rel=v;MP._relL=1;mpStore.set('rel',v);MP.lastPres=''}
const relSeen=()=>MP.relSeen||(MP.relSeen=new Set(mpStore.get('relSeen',[])));
const romOf=ck=>(MP.friends[ck]&&MP.friends[ck].rom)||0;
function romAdd(ck,v){const f=MP.friends[ck];if(!f)return;f.rom=Math.max(0,Math.min(100,(f.rom||0)+v));mpStore.set('friends',MP.friends)}
const bfgf=g=>g==='f'?'girlfriend':g==='m'?'boyfriend':'partner';
function relSend(ck,k,tx=''){if(MP.db&&MP.uid&&!String(ck).startsWith('p:'))return mailSend(ck,k,tx);return Promise.resolve(!!mpSend(ck,k,tx))}

/* ---- popups, one at a time ---- */
const REL_Q=[];
function relShow(html,btns){REL_Q.push([html,btns]);if(REL_Q.length===1)relNext()}
function relNext(){const it=REL_Q[0];if(!it)return;if(!S||$('game').hidden){setTimeout(relNext,3000);return}
  mpPing();story(it[0],it[1].map(([l,c,f])=>[l,c,()=>{try{f()}catch(e){console.error(e)}REL_Q.shift();setTimeout(relNext,400)}]))}

/* ---- asking someone to be your partner ---- */
function relAsk(rp,ck,nm,g){const r=relGet();if(r&&r.ck===ck)return toast(`You're already together ❤️`);
  if(!MP.friends[ck])return toast('Become friends first: send a friend request.');
  MP.relAsked=ck;relSend(ck,'gq',P().look.gender||'');mpSys(ck,`You asked ${nm} to be your ${bfgf(g)} 💍`);toast(`💍 You asked ${nm}. It's up to them now…`)}
function relBreak(ck,nm){const r=relGet();if(!r||r.ck!==ck)return;if(!confirm(`Break up with ${nm}?`))return;relSet(null);relSend(ck,'bu','');mpSys(ck,`You broke up with ${nm} 💔`);toast(`💔 You and ${nm} broke up.`)}

/* ---- incoming relationship messages (from mail or live) ---- */
function relIn(ck,nm,k,tx,id){const seen=relSeen();if(id){if(seen.has(id))return;seen.add(id);mpStore.set('relSeen',[...seen].slice(-300))}
  if(MP.blocked[ck])return;const r=relGet(),me=P&&S&&S.p?P():null;nm=mpClean(nm,16)||'Someone';
  if(k==='gq'&&tx&&me&&tx===me.look.gender)return;
  if(k==='gq'){const was=r&&r.ck!==ck?r:null;
    relShow(`<div class="eyebrow">💍 Relationship request</div><h3>${esc(nm)} wants you to be ${tx==='m'?'his':tx==='f'?'her':'their'} ${bfgf(me&&me.look.gender)}!</h3><p class="scene">${was?`You're dating <b>${esc(was.nm)}</b> right now. Saying yes means breaking up with ${esc(was.nm)}.`:`Your friendship and how you feel about ${esc(nm)} are up to you.`}</p>`,
      [['❤️ Yes','g',()=>{if(was){relSend(was.ck,'bu','');mpSys(was.ck,`You broke up with ${was.nm} 💔`)}mpMakeFriend(ck,nm);relSet({ck,nm,since:Date.now()});romAdd(ck,20);relSend(ck,'ga','');mpSys(ck,`You and ${nm} are together now ❤️`);toast(`❤️ You and ${nm} are official!`)}],
       ['Not now','',()=>{relSend(ck,'gn','');mpSys(ck,`You said not now to ${nm}`)}]]);return}
  if(k==='ga'){const asked=MP.relAsked===ck||(MP.myMail.to[ck]||[]).some(m=>m.k==='gq'&&Date.now()-m.t<7*86400000);if(!asked)return;
    if(r&&r.ck!==ck){relSend(r.ck,'bu','');mpSys(r.ck,`You broke up with ${r.nm} 💔`)}MP.relAsked=null;relSet({ck,nm,since:Date.now()});romAdd(ck,20);mpSys(ck,`${nm} said yes! You're together ❤️`);
    relShow(`<div class="eyebrow">💍 It's official</div><h3>${esc(nm)} said YES! ❤️</h3><p class="scene">You and ${esc(nm)} are together. Everyone on campus can see it on your player cards.</p>`,[['❤️ Yay','g',()=>{}]]);return}
  if(k==='gn'){if(MP.relAsked===ck)MP.relAsked=null;toast(`💔 ${nm} said not now.`);mpSys(ck,`${nm} said not now 💔`);return}
  if(k==='bu'){if(r&&r.ck===ck){relSet(null);mpSys(ck,`${nm} broke up with you 💔`);relShow(`<div class="eyebrow">💔 Break-up</div><h3>${esc(nm)} broke up with you</h3><p class="scene">It hurts. Your friends are still here. Maybe call one of them.</p>`,[['Okay','g',()=>{const n=P().needs;n.fun=Math.max(0,n.fun-25);n.social=Math.max(0,n.social-15)}]])}return}
  if(k==='tl'){const [cck,cnm,onm,where,kind]=String(tx).split('|');if(!r||r.ck!==cck)return;relCaught(cck,mpClean(cnm,16),mpClean(onm,16),mpClean(where,40),kind,`${nm} told you`);return}
  if(k==='ct'){const [onm,ch]=String(tx).split('|');if(ch==='b'){if(r&&r.ck===ck)relSet(null);relShow(`<div class="eyebrow">😬 Caught</div><h3>${esc(nm)} found out about you and ${esc(mpClean(onm,16))}</h3><p class="scene">${esc(nm)} broke up with you. 💔</p>`,[['Okay','g',()=>{}]])}
    else relShow(`<div class="eyebrow">😬 Caught</div><h3>${esc(nm)} found out about you and ${esc(mpClean(onm,16))}</h3><p class="scene">…and decided to forgive you. Don't make it a habit.</p>`,[['Phew','g',()=>{}]]);mpSys(ck,ch==='b'?`${nm} caught you and broke up 💔`:`${nm} caught you, but forgave you`);return}}
/* every relationship message in the mailbox, oldest first, each handled once */
function relMail(){const all=[];for(const [u,v] of Object.entries(MP.mailIn||{}))(v.ms||[]).forEach(m=>{if((REL_KINDS.includes(m.k)||LOAN_KINDS.includes(m.k)||HALL_KINDS.includes(m.k))&&Date.now()-m.t<7*86400000)all.push([u,v.nm,m])});
  all.sort((a,b)=>a[2].t-b[2].t).forEach(([u,nm,m])=>(LOAN_KINDS.includes(m.k)?loanIn:HALL_KINDS.includes(m.k)?hallIn:relIn)(u,nm,m.k,m.tx,u+'|'+m.i+'|'+m.t))}

/* ---- cheating: romantic moments are seen by whoever is around ---- */
const ROM_WORD={flirt:'flirting with',date:'on a date with',kiss:'kissing'};
function romBroadcast(rp,ck,a){const p=P(),place=myInKey()||'',where=IS?(IS.title||(BID[IS.bid]&&BID[IS.bid].name)||'inside'):(locOf(p.x,p.y)||{name:zoneOf(p.x,p.y)}).name;
  mpSend('*rom','rom',[relMe(),mpClean(p.name,16),ck,mpClean(rp.nm,16),a,place,mpClean(where,40),Math.round(p.x),Math.round(p.y)].join('|'))}
function romSeen(rp,tx){const [a1,n1,a2,n2,kind,place,where,x,y]=String(tx).split('|');if(!ROM_WORD[kind]||!S||!S.p)return;const me=relMe();if(me===a1||me===a2)return;
  const near=place?myInKey()===place:(!IS&&Math.hypot(P().x-(+x),P().y-(+y))<420);if(!near)return;const r=relGet();
  for(const [ck,nm,ock,onm] of [[a1,n1,a2,n2],[a2,n2,a1,n1]]){
    if(r&&r.ck===ck&&ock!==me){relCaught(ck,nm,onm,where,kind,'You saw it with your own eyes');return}}
  for(const [ck,nm,ock,onm] of [[a1,n1,a2,n2],[a2,n2,a1,n1]]){const who=[...MP.peers.values()].find(q=>mpKey(q)===ck),rl=who&&who.rl;
    if(rl&&rl.k!==ock&&rl.k!==me&&MP.friends[rl.k]){relWitness(ck,nm,onm,rl,where,kind);return}}}
function relWitness(ck,nm,onm,rl,where,kind){let box=$('askPop');if(!box){box=document.createElement('div');box.id='askPop';document.body.appendChild(box)}
  const card=document.createElement('div');card.className='ask';card.innerHTML=`<span class="ask-ic">👀</span><div class="ask-t">You saw <b>${esc(nm)}</b> ${ROM_WORD[kind]} <b>${esc(onm)}</b>. ${esc(nm)} is dating your friend <b>${esc(rl.n)}</b>. Tell ${esc(rl.n)}?<i class="ask-bar"></i></div><button class="ask-no" aria-label="Keep quiet">🤐</button><button class="ask-yes">Tell</button>`;
  box.appendChild(card);mpPing(.6);const bar=card.querySelector('.ask-bar');requestAnimationFrame(()=>{bar.style.transition='transform 25s linear';bar.style.transform='scaleX(0)'});
  const close=()=>{clearTimeout(t);card.classList.add('out');setTimeout(()=>card.remove(),250)},t=setTimeout(close,25000);
  card.querySelector('.ask-yes').onclick=()=>{relSend(rl.k,'tl',[ck,nm,onm,where,kind].join('|'));mpSys(rl.k,`You told ${rl.n} what you saw 👀`);toast(`👀 You told ${rl.n}.`);close()};
  card.querySelector('.ask-no').onclick=()=>{toast('🤐 You kept quiet.');close()}}
function relCaught(ck,nm,onm,where,kind,how){
  relShow(`<div class="eyebrow">💔 Caught</div><h3>${esc(nm)} was ${ROM_WORD[kind]||'with'} ${esc(onm)}</h3><p class="scene">${esc(how)}: ${esc(nm)} was ${ROM_WORD[kind]||'with'} ${esc(onm)} at ${esc(where)}. What do you do?</p>`,
    [['💔 Break up','g',()=>{relSet(null);relSend(ck,'ct',`${onm}|b`);mpSys(ck,`You caught ${nm} with ${onm} and broke up 💔`);const n=P().needs;n.fun=Math.max(0,n.fun-30)}],
     ['🤝 Forgive','',()=>{romAdd(ck,-25);relSend(ck,'ct',`${onm}|f`);mpSys(ck,`You caught ${nm} with ${onm}, but forgave them`)}],
     ['💬 Talk to them first','',()=>{mpSys(ck,`You found out about ${nm} and ${onm} 😠`);setTimeout(()=>mpChatKey(ck),300)}]])}

/* ---- your real friends in the phone's contacts ---- */
function realContactsHTML(){if(!MP.lobby)return '';const fr=Object.entries(MP.friends).filter(([k])=>!MP.blocked[k]);if(!fr.length)return '';const r=relGet();
  return `<p style="margin:4px 0"><strong>🌐 Real friends</strong></p><div class="list">${fr.sort((a,b)=>(r&&b[0]===r.ck)-(r&&a[0]===r.ck)||(romOf(b[0])+(b[1].lv||0))-(romOf(a[0])+(a[1].lv||0))).map(([k,f])=>{const o=onlineInfo(k);
    return `<div class="item"><i class="sw2" style="border-radius:50%;background:${o.on?'#2f9e5a':'#666'}"></i><div class="grow"><b>${esc(threadName(k))}${r&&r.ck===k?' 💍':''}</b><small>${esc(o.txt)} · friendship ${f.lv||20}%${romOf(k)?` · ❤️ ${romOf(k)}%`:''}</small></div><button class="btn sm" data-rc="${esc(k)}">💬 Chat</button></div>`}).join('')}</div>`}
/* how relationship messages read in a chat */
function relLine(m,nm){const T={gq:m.me?`You asked ${nm} out 💍`:`${nm} asked you out 💍`,ga:m.me?`You said yes to ${nm} ❤️`:`${nm} said yes ❤️`,gn:m.me?'You said not now':`${nm} said not now`,
  bu:m.me?`You broke up with ${nm} 💔`:`${nm} broke up with you 💔`,tl:m.me?'You told them what you saw 👀':`${nm} told you something 👀`,ct:m.me?`You found out 💔`:`${nm} found out 😬`,
  lq:m.me?'You asked to borrow money 🤝':`${nm} asked to borrow money 🤝`,la:m.me?'You lent them money 💸':`${nm} lent you money 💸`,ln:m.me?'You said no to lending':`${nm} said no to lending`,mo:m.me?'You sent money 💸':`${nm} sent you money 💸`,
  gi:m.me?'You invited them to your graduation 🎓':`${nm} graduated 🎓`,gc:m.me?'You congratulated them 🎉':`${nm} congratulated you 🎉`};return T[m.k]||''}
