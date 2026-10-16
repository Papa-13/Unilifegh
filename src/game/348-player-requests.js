/* ================= asking before you touch: hugs, daps, dances need a yes =================
   When you hug, dap, shake hands, laugh, dance or walk with a real student, they get a pop-up
   ("Papa wants to hug you") with Accept / Decline. Nothing happens until they accept.
   A wave is just a wave: it goes through straight away.
   Messages: 'ask' = "id|action", 'ans' = "id|action|y or n". */
const ASK_KINDS={
  hug:{ic:'🤗',want:'hug you',noun:'the hug',did:'hugged',g:'hug'},
  handshake:{ic:'🤝',want:'shake your hand',noun:'the handshake',did:'shook hands with',g:'handshake'},
  dap:{ic:'🤜',want:'give you a dap',noun:'the dap',did:'gave a dap to',g:'dap'},
  laugh:{ic:'😂',want:'laugh with you',noun:'laughing together',did:'laughed with',g:'laugh'},
  dance:{ic:'💃',want:'dance with you',noun:'the dance',did:'danced with',g:'dance'},
  walk:{ic:'🚶',want:'walk with you',noun:'walking together',did:'started walking with',g:'wave'},
  flirt:{ic:'😏',want:'flirt with you',noun:'the flirting',did:'flirted with',g:'laugh',rom:5},
  date:{ic:'🌹',want:'go on a date with you',noun:'the date',did:'went on a date with',g:'wave',rom:12},
  kiss:{ic:'💋',want:'kiss you',noun:'the kiss',did:'kissed',g:'hug',rom:8}};
const ASK_WAIT=20000;
const ASK={out:{},seen:new Set()};

/* you ask */
function mpAsk(rp,a){const K=ASK_KINDS[a],k=mpKey(rp);if(!K||!rp)return;
  const o=ASK.out[k];if(o&&Date.now()-o.t<ASK_WAIT)return toast(`Waiting for ${rp.nm} to answer…`);
  const id=(MP.sess||'q')+Date.now().toString(36);ASK.out[k]={id,a,t:Date.now()};mpSend(k,'ask',`${id}|${a}`);
  const p=P();if(!IS&&rp.mesh)p.face=Math.atan2(rp.x-p.x,rp.y-p.y);
  toast(`${K.ic} You asked ${rp.nm}. Waiting for them to accept…`);
  setTimeout(()=>{const x=ASK.out[k];if(x&&x.id===id){delete ASK.out[k];toast(`${rp.nm} didn't answer.`)}},ASK_WAIT+2000)}

/* they asked you: pop-up with Accept / Decline */
function askIn(rp,ck,tx){const [id,a]=String(tx).split('|');const K=ASK_KINDS[a];if(!K||!id||ASK.seen.has(id))return;ASK.seen.add(id);
  if(!S||$('game').hidden){mpSend(ck,'ans',`${id}|${a}|n`);return}askPopup(rp,ck,id,a)}
function askPopup(rp,ck,id,a){const K=ASK_KINDS[a];let box=$('askPop');if(!box){box=document.createElement('div');box.id='askPop';box.setAttribute('aria-live','polite');document.body.appendChild(box)}
  const card=document.createElement('div');card.className='ask';card.setAttribute('role','alertdialog');card.setAttribute('aria-label',`${rp.nm} wants to ${K.want}`);
  const L=rp.lookV;card.innerHTML=`<span class="ask-ic">${K.ic}</span><div class="ask-t"><b>${esc(rp.nm)}</b> wants to ${K.want}${a==='walk'?'':'!'}<i class="ask-bar"></i></div>
    <button class="ask-no" aria-label="Decline">✕</button><button class="ask-yes">Accept</button>`;
  if(L)card.querySelector('.ask-ic').style.background=PAL[L.pal]?PAL[L.pal].a:'';
  box.appendChild(card);mpPing();
  const bar=card.querySelector('.ask-bar');requestAnimationFrame(()=>{bar.style.transition=`transform ${ASK_WAIT/1000}s linear`;bar.style.transform='scaleX(0)'});
  let done=false;const close=()=>{done=true;clearTimeout(t);card.classList.add('out');setTimeout(()=>card.remove(),250)};
  const t=setTimeout(()=>{if(!done){mpSend(ck,'ans',`${id}|${a}|n`);mpSys(ck,`You missed ${rp.nm}'s request (${K.noun})`);close()}},ASK_WAIT);
  card.querySelector('.ask-yes').onclick=()=>{if(done)return;mpSend(ck,'ans',`${id}|${a}|y`);close();askDo(rp,ck,a,false)};
  card.querySelector('.ask-no').onclick=()=>{if(done)return;mpSend(ck,'ans',`${id}|${a}|n`);mpSys(ck,`You declined ${K.noun}`);close()}}

/* the answer to your request */
function ansIn(rp,ck,tx){const [id,a,y]=String(tx).split('|');const K=ASK_KINDS[a],o=ASK.out[ck];if(!K||!o||o.id!==id)return;delete ASK.out[ck];
  if(y==='y'){askDo(rp,ck,a,true);toast(`${K.ic} ${rp.nm} accepted!`)}else{toast(`${K.ic} ${rp.nm} declined ${K.noun}.`);mpSys(ck,`${rp.nm} declined ${K.noun}`)}}

/* it happens: both of you play it, on both screens */
function askDo(rp,ck,a,iAsked){const K=ASK_KINDS[a],p=P();
  if(a==='walk'){if(iAsked){S.follow=rp.peer;toast(`🚶 Walking with ${rp.nm}. Tap the ground to go your own way.`)}else toast(`🚶 ${rp.nm} is walking with you.`);
    mpSys(ck,iAsked?`You're walking with ${rp.nm} 🚶`:`${rp.nm} is walking with you 🚶`);try{if(MP.friends[ck])ev('walkreal')}catch(e){}return}
  const them=IS&&IS.mpp?[...IS.mpp.values()].find(q=>q.mp===rp):rp;
  if(!IS&&rp.mesh)p.face=Math.atan2(rp.x-p.x,rp.y-p.y);
  try{setGest(p,K.g,2.4);if(them)setGest(them,K.g,2.4)}catch(e){}
  if(a==='dance'){p.pose='dance';setTimeout(()=>{if(P().pose==='dance')P().pose=null},4500)}
  p.needs.social=clamp(p.needs.social+(a==='hug'?6:4));p.needs.fun=clamp(p.needs.fun+(a==='dance'||a==='laugh'?5:2));
  if(MP.friends[ck])MP.friends[ck].lv=Math.min(100,(MP.friends[ck].lv||20)+(a==='hug'?3:2));
  try{ev('talk',{a:'real'});if(a==='dance')ev('emote',{k:'dance',n:1});if(a==='laugh')ev('talk',{a:'joke',good:true})}catch(e){}
  if(K.rom){romAdd(ck,K.rom);p.needs.fun=clamp(p.needs.fun+(a==='date'?12:4));if(a==='date')p.needs.social=clamp(p.needs.social+12);if(iAsked)try{romBroadcast(rp,ck,a)}catch(e){}
    if(a==='date')toast(`🌹 You're on a date with ${rp.nm}${IS&&IS.title?' at '+IS.title:''}. Romance +${K.rom}`)}
  mpSys(ck,iAsked?`You ${K.did} ${rp.nm} ${K.ic}`:`${rp.nm} ${K.did.replace(/^gave a dap to$/,'gave you a dap').replace(/ with$/,' with you').replace(/^hugged$/,'hugged you').replace(/^kissed$/,'kissed you')} ${K.ic}`)}
