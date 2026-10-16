/* ================= play together: sports against real students =================
   Challenge a real player who is at the same place:
   ⚽ Sports Field → penalty shootout (take turns: the shooter aims, the keeper dives)
   🏀 Basketball Court → shooting contest (take turns: stop the meter in the green to score)
   🏊 Swimming Pool → 50 m race (tap to swim; first to the wall wins)
   Moves travel as small live messages between the two games (kind 'sg'), and both games
   work out the same result from the same moves. */
const SG_KINDS={
  fb:{name:'penalty shootout',ic:'⚽',where:'field',sport:'football'},
  bb:{name:'shooting contest',ic:'🏀',where:'court',sport:'basketball'},
  sw:{name:'50 m swim race',ic:'🏊',where:'pool',sport:'swim'}};
let SG=null;
const SG_SIDES=['Left','Middle','Right'];

/* who can play: real students standing at that place (outdoors, not in a car) */
function sgNear(where,x,y){const b=BID[where];return !!b&&x>b.x-140&&x<b.x+b.w+140&&y>b.y-140&&y<b.y+b.h+140}
const sgMeAt=where=>!!(S&&!IS&&!P().inCar&&sgNear(where,P().x,P().y));
function sgRealHere(where){return (typeof mpOnline==='function'?mpOnline():[]).filter(rp=>!rp.in&&!rp.car&&sgNear(where,rp.x,rp.y))}
function sgKindsFor(rp){return Object.entries(SG_KINDS).filter(([k,v])=>sgMeAt(v.where)&&!rp.in&&!rp.car&&sgNear(v.where,rp.x,rp.y)&&(k!=='sw'||(hour()>=6&&hour()<19))).map(([k])=>k)}

/* ---- inviting ---- */
function sgInvite(rp,kind){const K=SG_KINDS[kind];if(SG)return toast('Finish the game you\'re in first.');
  if(!sgMeAt(K.where))return toast(`Go to the ${BID[K.where].name} first.`);if(!sgNear(K.where,rp.x,rp.y))return toast(`${rp.nm} needs to be at the ${BID[K.where].name} too.`);
  const gid=(MP.sess||'g')+Date.now().toString(36);SG={gid,kind,me:'h',opp:{ck:mpKey(rp),nm:rp.nm,peer:rp.peer},state:'wait',picks:{},score:{h:0,g:0},r:0,seen:Date.now()};
  mpSend(SG.opp.ck,'sg',`inv|${kind}|${gid}`);toast(`${K.ic} You challenged ${rp.nm} to a ${K.name}. Waiting for them…`);
  setTimeout(()=>{if(SG&&SG.gid===gid&&SG.state==='wait'){SG=null;toast(`${rp.nm} didn't answer the challenge.`)}},45000)}

/* ---- messages from the other player ---- */
function sgIn(rp,ck,tx){const a=String(tx).split('|'),cmd=a[0];
  if(cmd==='inv'){const kind=a[1],gid=a[2],K=SG_KINDS[kind];if(!K||!gid)return;
    if(SG||!S||$('game').hidden){mpSend(ck,'sg',`busy|${gid}`);return}
    mpPing();story(`<div class="eyebrow">${K.ic} Challenge · ${esc(BID[K.where].name)}</div><h3>${esc(rp.nm)} wants a ${K.name}!</h3><p class="scene">${kind==='fb'?'Five penalties each. Take turns to shoot and keep goal.':kind==='bb'?'Five shots each. Stop the meter in the green to score.':'Two lanes, 50 metres. Tap as fast as you can.'}</p>`,
      [['Play','g',()=>{if(SG){mpSend(ck,'sg',`busy|${gid}`);return}SG={gid,kind,me:'g',opp:{ck,nm:rp.nm,peer:rp.peer},state:'on',picks:{},score:{h:0,g:0},r:0,seen:Date.now()};mpSend(ck,'sg',`acc|${gid}`);sgBegin()}],
       ['Not now','',()=>mpSend(ck,'sg',`no|${gid}`)]]);return}
  if(!SG||a[1]!==SG.gid||ck!==SG.opp.ck)return;SG.seen=Date.now();
  if(cmd==='acc'&&SG.me==='h'&&SG.state==='wait'){SG.state='on';sgBegin();return}
  if(cmd==='no'||cmd==='busy'){toast(cmd==='no'?`${SG.opp.nm} said not now.`:`${SG.opp.nm} is busy right now.`);SG=null;return}
  if(cmd==='quit'){toast(`${SG.opp.nm} left the game.`);sgEnd(true);return}
  if(cmd==='mv'){const r=+a[2],v=a[3];if(!(r>=0))return;(SG.picks[r]=SG.picks[r]||{}).o=v;sgCheck();return}
  if(cmd==='pos'){SG.oPos=Math.min(50,+a[2]||0);sgDraw();return}
  if(cmd==='fin'){SG.oTime=+a[2]||0;SG.oPos=50;sgSwimDone();return}}

/* ---- the game panel ---- */
function sgBegin(){const K=SG_KINDS[SG.kind];closeSheet();$('story').hidden=true;let el=$('sgUI');if(!el){el=document.createElement('div');el.id='sgUI';el.setAttribute('role','dialog');el.setAttribute('aria-label',K.name);document.body.appendChild(el)}
  el.dataset.kind=SG.kind;SG.state='on';SG.r=0;if(SG.kind==='sw'){SG.pos=0;SG.oPos=0;SG.t0=null}
  toast(`${K.ic} ${K.name[0].toUpperCase()+K.name.slice(1)} vs ${SG.opp.nm}!`);sgRound()}
const sgShooter=r=>r%2===0?'h':'g';
const sgMyName=()=>P().name==='You'?'You':P().name;
function sgHead(){const K=SG_KINDS[SG.kind],my=SG.score[SG.me],op=SG.score[SG.me==='h'?'g':'h'];
  return `<div class="sg-top"><span>${K.ic} ${esc(sgMyName())}</span><b>${my} : ${op}</b><span>${esc(SG.opp.nm)} 🌐</span><button id="sgQuit" aria-label="Leave the game">✕</button></div>`}
function sgRound(){if(!SG)return;const el=$('sgUI');if(!el)return;clearTimeout(SG.tm);
  if(SG.kind==='sw')return sgSwimUI();
  const r=SG.r,shoot=sgShooter(r)===SG.me,K=SG_KINDS[SG.kind],turn=Math.floor(r/2)+1,mine=(SG.picks[r]||{}).m!=null;
  if(SG.kind==='fb')el.innerHTML=`${sgHead()}<div class="sg-stage">${sgGoalSVG()}</div>
    <p class="sg-msg">${mine?`Waiting for ${esc(SG.opp.nm)}…`:shoot?`Penalty ${turn} of 5: you're shooting. Where do you aim?`:`Penalty ${turn} of 5: ${esc(SG.opp.nm)} is shooting. Which way do you dive?`}</p>
    <div class="sg-btns">${SG_SIDES.map((s,i)=>`<button data-sg="${i}" ${mine?'disabled':''}>${['⬅️','⬆️','➡️'][i]} ${shoot?'Aim':'Dive'} ${s.toLowerCase()}</button>`).join('')}</div><div class="sg-timer"><i id="sgBar"></i></div>`;
  else el.innerHTML=`${sgHead()}<div class="sg-stage">${sgHoopSVG()}</div>
    <p class="sg-msg">${shoot?`Shot ${turn} of 5: stop the meter in the green!`:`${esc(SG.opp.nm)} is taking shot ${turn} of 5…`}</p>
    ${shoot&&!mine?`<div class="sg-meter"><i id="sgMk"></i><b></b></div><div class="sg-btns"><button id="sgShoot">🏀 Shoot!</button></div>`:''}<div class="sg-timer"><i id="sgBar"></i></div>`;
  $('sgQuit').onclick=()=>{if(confirm('Leave the game?')){mpSend(SG.opp.ck,'sg',`quit|${SG.gid}`);sgEnd(true)}};
  el.querySelectorAll('[data-sg]').forEach(b=>b.onclick=()=>sgPick(r,b.dataset.sg));
  if($('sgShoot'))sgMeter(r);
  if(!mine&&(SG.kind==='fb'||shoot)){const bar=$('sgBar');if(bar){bar.style.transition='none';bar.style.width='100%';requestAnimationFrame(()=>{bar.style.transition='width 10s linear';bar.style.width='0%'})}
    SG.tm=setTimeout(()=>{if(SG&&SG.r===r&&(SG.picks[r]||{}).m==null)sgPick(r,SG.kind==='fb'?String(Math.floor(Math.random()*3)):'0')},10000)}
  sgCheck()}
function sgPick(r,v){if(!SG||SG.r!==r||(SG.picks[r]||{}).m!=null)return;(SG.picks[r]=SG.picks[r]||{}).m=v;mpSend(SG.opp.ck,'sg',`mv|${SG.gid}|${r}|${v}`);sgRound()}

/* basketball meter: a marker sweeps; stopping it in the green middle scores */
function sgMeter(r){const mk=$('sgMk');let t0=performance.now();const speed=1.6+Math.min(1.4,r*.12);
  const step=()=>{if(!SG||SG.r!==r||!$('sgMk'))return;const t=(performance.now()-t0)/1000,x=(Math.sin(t*speed*Math.PI)+1)/2;mk.style.left=(x*100)+'%';mk.dataset.x=x;SG.raf=requestAnimationFrame(step)};step();
  $('sgShoot').onclick=()=>{cancelAnimationFrame(SG.raf);const x=+mk.dataset.x;sgPick(r,Math.abs(x-.5)<.13?'1':'0')}}

/* both games work out each round the same way */
function sgCheck(){if(!SG||SG.kind==='sw')return;const r=SG.r,pk=SG.picks[r]||{},shooter=sgShooter(r),iShoot=shooter===SG.me;
  let res=null;if(SG.kind==='fb'){if(pk.m==null||pk.o==null)return;const aim=+(iShoot?pk.m:pk.o),dive=+(iShoot?pk.o:pk.m);res={goal:aim!==dive,aim,dive}}
  else{const v=iShoot?pk.m:pk.o;if(v==null)return;res={goal:v==='1'}}
  if(SG.done===r)return;SG.done=r;clearTimeout(SG.tm);if(res.goal)SG.score[shooter]++;sgShow(res,iShoot);
  setTimeout(()=>{if(!SG)return;SG.r++;const R=SG.r,h=SG.score.h,g=SG.score.g;
    const over=SG.kind==='fb'?(R>=10&&R%2===0&&h!==g)||R>=16:R>=10;
    // decided early: one side can't catch up
    const leftH=Math.max(0,Math.ceil((10-R)/2)),leftG=Math.max(0,Math.floor((10-R)/2));
    if(over||(R<10&&(h>g+leftG||g>h+leftH)))sgFinish();else sgRound()},2300)}
function sgShow(res,iShoot){const el=$('sgUI');if(!el)return;const msg=el.querySelector('.sg-msg'),btn=el.querySelector('.sg-btns');if(btn)btn.remove();const mt=el.querySelector('.sg-meter');if(mt)mt.remove();
  if(SG.kind==='fb'){const ball=$('sgBall'),kp=$('sgKeep');const X=[95,150,205];if(ball){ball.style.transform=`translate(${X[res.aim]-150}px,-108px) scale(.7)`}if(kp)kp.style.transform=`translateX(${X[res.dive]-150}px) rotate(${[-50,0,50][res.dive]}deg)`;
    msg.innerHTML=res.goal?`<b class="sg-big">GOAL! ⚽</b> ${iShoot?'You scored.':esc(SG.opp.nm)+' scored.'}`:`<b class="sg-big">SAVED! 🧤</b> ${iShoot?esc(SG.opp.nm)+' saved it.':'You saved it!'}`}
  else{const ball=$('sgBall');if(ball)ball.classList.add(res.goal?'in':'miss');msg.innerHTML=res.goal?`<b class="sg-big">SWISH! 🏀</b> ${iShoot?'You scored.':esc(SG.opp.nm)+' scored.'}`:`<b class="sg-big">Miss…</b> ${iShoot?'Off the rim.':esc(SG.opp.nm)+' missed.'}`}
  const hd=el.querySelector('.sg-top b');if(hd)hd.textContent=`${SG.score[SG.me]} : ${SG.score[SG.me==='h'?'g':'h']}`}
function sgGoalSVG(){return `<svg viewBox="0 0 300 170" class="sg-svg" aria-hidden="true"><rect x="0" y="0" width="300" height="170" fill="#2f7a3a"/><rect x="0" y="118" width="300" height="52" fill="#3a8c45"/>
  <g stroke="#fff" stroke-width="5" fill="none"><path d="M60 118 V24 H240 V118"/></g><g stroke="rgba(255,255,255,.35)" stroke-width="1">${[...Array(9)].map((_,i)=>`<path d="M${70+i*20} 26 V116"/>`).join('')}${[...Array(4)].map((_,i)=>`<path d="M62 ${40+i*20} H238"/>`).join('')}</g>
  <g id="sgKeep" class="sg-keep"><circle cx="150" cy="70" r="9" fill="#5a3a26"/><rect x="138" y="80" width="24" height="30" rx="6" fill="#f5b41f"/><rect x="124" y="82" width="52" height="7" rx="3" fill="#f5b41f"/></g>
  <circle id="sgBall" class="sg-ball" cx="150" cy="150" r="8" fill="#fff" stroke="#222" stroke-width="2"/></svg>`}
function sgHoopSVG(){return `<svg viewBox="0 0 300 170" class="sg-svg" aria-hidden="true"><rect width="300" height="170" fill="#8a5a32"/><rect y="140" width="300" height="30" fill="#7a4e2a"/>
  <rect x="190" y="18" width="70" height="48" fill="#fff" stroke="#222" stroke-width="3"/><rect x="212" y="36" width="26" height="18" fill="none" stroke="#d93a2b" stroke-width="3"/>
  <ellipse cx="225" cy="62" rx="18" ry="4" fill="none" stroke="#d93a2b" stroke-width="4"/><path d="M209 64 L216 86 H234 L241 64" fill="none" stroke="#fff" stroke-width="1.5"/>
  <circle id="sgBall" class="sg-hball" cx="60" cy="130" r="11" fill="#e8742a" stroke="#222" stroke-width="2"/></svg>`}

/* ---- swim race ---- */
function sgSwimUI(){const el=$('sgUI');el.innerHTML=`${sgHead()}<div class="sg-pool"><div class="lane"><span id="sgMe">🏊</span><small>${esc(sgMyName())}</small></div><div class="lane"><span id="sgOp">🏊</span><small>${esc(SG.opp.nm)}</small></div></div>
  <p class="sg-msg" id="sgSwMsg">Get ready…</p><div class="sg-btns"><button id="sgStroke" disabled>🏊 Swim! (tap fast)</button></div>`;
  $('sgQuit').onclick=()=>{if(confirm('Leave the race?')){mpSend(SG.opp.ck,'sg',`quit|${SG.gid}`);sgEnd(true)}};
  let n=3;const cd=()=>{if(!SG||!$('sgSwMsg'))return;if(n>0){$('sgSwMsg').textContent=`${n}…`;n--;setTimeout(cd,800)}else{$('sgSwMsg').textContent='GO!';SG.t0=performance.now();$('sgStroke').disabled=false}};cd();
  let lastSend=0,lastTap=0;$('sgStroke').onclick=()=>{if(!SG||SG.t0==null||SG.myTime)return;const now=performance.now();if(now-lastTap<70)return;lastTap=now;SG.pos=Math.min(50,SG.pos+1.25);sgDraw();
    if(SG.pos>=50){SG.myTime=Math.round(now-SG.t0);mpSend(SG.opp.ck,'sg',`fin|${SG.gid}|${SG.myTime}`);$('sgStroke').disabled=true;$('sgSwMsg').textContent=`You touched the wall in ${(SG.myTime/1000).toFixed(2)} s!`;sgSwimDone()}
    else if(now-lastSend>350){lastSend=now;mpSend(SG.opp.ck,'sg',`pos|${SG.gid}|${SG.pos.toFixed(1)}`)}};sgDraw()}
function sgDraw(){if(!SG||SG.kind!=='sw')return;const a=$('sgMe'),b=$('sgOp');if(a)a.style.left=`calc(${SG.pos/50*100}% - ${SG.pos/50*28}px)`;if(b)b.style.left=`calc(${(SG.oPos||0)/50*100}% - ${(SG.oPos||0)/50*28}px)`}
function sgSwimDone(){sgDraw();if(!SG||!SG.myTime||!SG.oTime){if(SG&&SG.oTime&&!SG.myTime&&$('sgSwMsg'))$('sgSwMsg').textContent=`${SG.opp.nm} touched the wall! Keep going!`;return}
  if(SG.myTime<SG.oTime)SG.score[SG.me]=1;else if(SG.oTime<SG.myTime)SG.score[SG.me==='h'?'g':'h']=1;setTimeout(sgFinish,900)}

/* ---- the end ---- */
function sgFinish(){if(!SG)return;const K=SG_KINDS[SG.kind],my=SG.score[SG.me],op=SG.score[SG.me==='h'?'g':'h'],won=my>op,draw=my===op,p=P(),nm=SG.opp.nm,ck=SG.opp.ck,sw=SG.kind==='sw';
  const n=p.needs;n.fun=clamp(n.fun+22);n.social=clamp(n.social+12);n.energy=clamp(n.energy-(sw?12:9));n.hygiene=clamp(n.hygiene-8);if(sw)p.fit=(p.fit||0)+1;
  if(won)S.wins=(S.wins||0)+1;try{ev('game',{kind:K.sport,win:won?1:0})}catch(e){}if(MP.friends[ck])MP.friends[ck].lv=Math.min(100,(MP.friends[ck].lv||20)+6);
  mpSys(ck,`${K.ic} ${K.name}: ${sw?(won?'you won':'they won'):`${my}–${op}`}`);
  const times=sw?`<p>You: <b>${(SG.myTime/1000).toFixed(2)} s</b> · ${esc(nm)}: <b>${(SG.oTime/1000).toFixed(2)} s</b></p>`:'';
  sgEnd(false);story(`<div class="eyebrow">${K.ic} ${K.name} · vs ${esc(nm)} (real student)</div><h3>${draw?'It\'s a draw!':won?'You win! 🏆':`${esc(nm)} wins this one.`}</h3>
    ${sw?times:`<div class="big">${my} – ${op}</div>`}<p class="scene">${won?'Bragging rights are yours. Fun +22, Social +12.':'Good game. Ask for a rematch? Fun +22, Social +12.'}</p>`,
    [['🔁 Rematch','g',()=>{const rp=[...MP.peers.values()].find(x=>mpKey(x)===ck);if(rp)sgInvite(rp,Object.keys(SG_KINDS).find(k=>SG_KINDS[k]===K));else toast(`${nm} isn't here any more.`)}],['Done','',()=>{}]])}
function sgEnd(quiet){if(!SG)return;clearTimeout(SG.tm);cancelAnimationFrame(SG.raf);SG=null;const el=$('sgUI');if(el)el.remove()}
/* if the other player disappears, stop waiting */
setInterval(()=>{if(SG&&SG.state==='on'&&!MP.peers.has(SG.opp.peer)&&Date.now()-SG.seen>15000){toast(`${SG.opp.nm} went offline. Game over.`);sgEnd(true)}},3000);
