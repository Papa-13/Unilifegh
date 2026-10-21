/* ================= mini-games you actually play =================
   ⚽ FIFA penalty shootout: pick a corner and time your power; then guess where they shoot and dive.
   🟤 Oware (Abapa rules): six pits each, sow anticlockwise, capture 2s and 3s on their side.
   Both are played against a friend (roommate, guest, or whoever you're with). */
function mgOpponent(){if(IS&&IS.people){const q=IS.people.find(q=>q.n&&!q.lying&&!q.gone);if(q)return q.n}return buddy()||null}
function mgEnd(n,won,draw,what){const p=P();if(S.le)S.le.last=S.min+60;p.needs.fun=clamp(p.needs.fun+(won?30:draw?20:14));p.needs.social=clamp(p.needs.social+(n?15:0));if(n)n.friend=clamp(n.friend+(won?3:5));if(won)S.wins=(S.wins||0)+1;
  advance(what==='oware'?35:30);try{ev('game',{kind:what,win:won});window.track&&window.track('minigame_played',{kind:what,win:won})}catch(e){}
  const who=n?n.name.split(' ')[0]:'the computer';toast(won?`🏆 You beat ${who}! ${n?pick(['"Rematch tomorrow!" 😤','"You were lucky 😂"','"I\'ll get you next time."']):''}`:draw?`🤝 Draw with ${who}.`:`😩 ${who} wins. ${n?pick(['"Easy money 😂"','"Better luck next time!"','"Go and practise 😏"']):''}`);hud()}

/* ---------- ⚽ penalty shootout ---------- */
function penaltyGame(nOpt){const n=nOpt||mgOpponent(),who=n?n.name.split(' ')[0]:'CPU';S.paused=true;openSheet();
  const G={me:[],them:[],turn:'shoot',round:0,aim:null,pw:0,dir:1,iv:null};const Z=['↖','⬆','↗','↙','⬇','↘'];
  const dots=a=>Array.from({length:5},(_,i)=>`<i class="pd ${a[i]===1?'g':a[i]===0?'m':''}"></i>`).join('');
  const draw=(msgTxt='')=>{const sc=[G.me.filter(x=>x).length,G.them.filter(x=>x).length];
    $('sheetIn').innerHTML=`<div class="row" style="justify-content:space-between;align-items:center"><h3>⚽ Penalties vs ${esc(who)}</h3><b style="font-size:20px">${sc[0]} – ${sc[1]}</b></div>
      <div class="pdots"><span>You</span>${dots(G.me)}</div><div class="pdots"><span>${esc(who)}</span>${dots(G.them)}</div>
      <p style="font-size:14px;margin:8px 0">${msgTxt||(G.turn==='shoot'?(G.aim==null?'<b>Your penalty.</b> Pick where to shoot:':'Tap <b>SHOOT</b> when the bar is in the green!'):'<b>You\'re in goal.</b> Guess where they\'ll shoot and dive:')}</p>
      <div class="pgoal">${Z.map((z,i)=>`<button class="pz${G.aim===i?' on':''}" data-z="${i}">${z}</button>`).join('')}</div>
      ${G.turn==='shoot'&&G.aim!=null?'<div class="pbar"><i id="pPow"></i><b></b></div><button class="btn" id="pShoot" style="width:100%;margin-top:8px">SHOOT ⚽</button>':''}
      <button class="ghost sm" id="pQuit" style="margin-top:8px">Quit</button>`;
    $('pQuit').onclick=()=>{clearInterval(G.iv);closeSheet()};
    $('sheetIn').querySelectorAll('[data-z]').forEach(b=>b.onclick=()=>{const z=+b.dataset.z;if(G.turn==='shoot'){G.aim=z;draw();startBar()}else keep(z)});
    if($('pShoot'))$('pShoot').onclick=shoot};
  const startBar=()=>{clearInterval(G.iv);G.pw=0;G.dir=1;G.iv=setInterval(()=>{G.pw+=G.dir*4.5;if(G.pw>=100||G.pw<=0)G.dir*=-1;const el=$('pPow');if(el)el.style.width=G.pw+'%'},16)};
  const finished=()=>{const r=G.round,a=G.me.filter(x=>x).length,b=G.them.filter(x=>x).length;if(r>=5){if(a!==b)return true;return r>=8}const left=5-r;return a>b+left||b>a+left};
  const next=t=>{if(finished()){clearInterval(G.iv);const a=G.me.filter(x=>x).length,b=G.them.filter(x=>x).length;setTimeout(()=>{closeSheet();mgEnd(n,a>b,a===b,'penalties')},1300);draw(t+`<br><b>${a>b?'You win the shootout! 🏆':a<b?`${esc(who)} wins the shootout.`:'It\'s a draw.'}</b>`);return}draw(t)};
  const shoot=()=>{clearInterval(G.iv);const good=G.pw>=58&&G.pw<=88,wild=G.pw>94,dive=Math.random()<.42?G.aim:RI(0,5),saved=dive===G.aim&&!(G.pw>=70&&G.pw<=82&&Math.random()<.5);
    const goal=!wild&&(good||Math.random()<.45)&&!saved;G.me.push(goal?1:0);G.turn='keep';G.aim=null;
    next(wild?'😬 Over the bar!':goal?'⚽ GOAL! Top bins!':saved?`🧤 Saved! ${esc(who)} guessed right.`:'😩 Wide of the post!')};
  const keep=z=>{G.round++;const sh=RI(0,5),miss=Math.random()<.16,goal=!miss&&sh!==z;G.them.push(goal?1:0);G.turn='shoot';
    next(miss?`${esc(who)} skies it! 😂`:goal?`⚽ ${esc(who)} scores ${Z[sh]}. You dived ${Z[z]}.`:`🧤 YOU SAVED IT! You read it perfectly ${Z[z]}.`)};
  draw()}

/* ---------- 🟤 Oware (Abapa) ---------- */
function owareGame(nOpt){const n=nOpt||mgOpponent(),who=n?n.name.split(' ')[0]:'CPU';S.paused=true;openSheet();
  /* pits 0-5 are yours (left to right along the bottom), 6-11 theirs (right to left along the top); sowing goes 0→11 */
  const G={b:Array(12).fill(4),st:[0,0],turn:0,busy:false,last:''};
  const legal=(b,pl)=>{const own=pl?[6,7,8,9,10,11]:[0,1,2,3,4,5],oppEmpty=(pl?[0,1,2,3,4,5]:[6,7,8,9,10,11]).every(i=>!b[i]);
    let m=own.filter(i=>b[i]>0);if(oppEmpty)m=m.filter(i=>{const r=sim(b,i,pl);return (pl?[0,1,2,3,4,5]:[6,7,8,9,10,11]).some(j=>r.b[j]>0)});return m};
  const sim=(b0,i,pl)=>{const b=b0.slice();let s=b[i];b[i]=0;let j=i;while(s>0){j=(j+1)%12;if(j===i)continue;b[j]++;s--}
    let cap=0;const opp=k=>pl?k<6:k>=6;let k=j;const caps=[];while(opp(k)&&(b[k]===2||b[k]===3)){caps.push(k);k=(k+11)%12}
    const oppAll=(pl?[0,1,2,3,4,5]:[6,7,8,9,10,11]).reduce((a,x)=>a+b[x],0),capSum=caps.reduce((a,x)=>a+b[x],0);
    if(capSum&&capSum<oppAll){caps.forEach(x=>{cap+=b[x];b[x]=0})}return{b,cap,end:j}};
  const pit=(i,mine)=>`<button class="ow${mine?' my':''}" data-p="${i}" ${mine&&G.turn===0&&!G.busy&&legal(G.b,0).includes(i)?'':'disabled'}><span>${G.b[i]}</span><em>${'<i></i>'.repeat(Math.min(G.b[i],12))}</em></button>`;
  const draw=()=>{$('sheetIn').innerHTML=`<div class="row" style="justify-content:space-between;align-items:center"><h3>🟤 Oware vs ${esc(who)}</h3><b>You ${G.st[0]} · ${G.st[1]} ${esc(who)}</b></div>
      <p style="font-size:13px;margin:4px 0 8px">${G.last||'Pick one of your pits (bottom row). Seeds go anticlockwise; if your last seed makes 2 or 3 in their row, you capture them (and the 2s/3s just before).'}</p>
      <div class="owb"><div class="owr">${[11,10,9,8,7,6].map(i=>pit(i,false)).join('')}</div><div class="owr">${[0,1,2,3,4,5].map(i=>pit(i,true)).join('')}</div></div>
      <p style="font-size:12px;opacity:.7;margin:6px 0 0">First to 25 seeds wins.</p><button class="ghost sm" id="oQuit" style="margin-top:6px">Quit</button>`;
    $('oQuit').onclick=closeSheet;$('sheetIn').querySelectorAll('.ow.my:not([disabled])').forEach(b=>b.onclick=()=>move(+b.dataset.p,0))};
  const over=()=>{if(G.st[0]>=25||G.st[1]>=25)return true;const pl=G.turn;if(!legal(G.b,pl).length){/* no moves: the other player takes what's left on their side */const own=pl?[0,1,2,3,4,5]:[6,7,8,9,10,11];own.forEach(i=>{G.st[pl?0:1]+=G.b[i];G.b[i]=0});return true}return false};
  const finish=()=>{const [a,b]=G.st;G.last=`<b>${a>b?'You win! 🏆':a<b?`${esc(who)} wins.`:'Draw!'}</b> Final: ${a} – ${b}`;G.busy=true;draw();setTimeout(()=>{closeSheet();mgEnd(n,a>b,a===b,'oware')},1600)};
  const move=(i,pl)=>{const r=sim(G.b,i,pl);G.b=r.b;G.st[pl]+=r.cap;G.last=(pl?`${esc(who)} played. `:'')+(r.cap?(pl?`They captured ${r.cap} 😩`:`You captured ${r.cap}! 🎉`):'');G.turn=1-pl;
    if(over())return finish();draw();if(G.turn===1){G.busy=true;draw();setTimeout(()=>{G.busy=false;ai()},900)}};
  const ai=()=>{const ms=legal(G.b,1);if(!ms.length){if(over())finish();return}
    /* the computer looks one move ahead: take the most, give away the least (with a little randomness so it's beatable) */
    let best=null,bs=-1e9;ms.forEach(m=>{const r=sim(G.b,m,1);const rep=legal(r.b,0).reduce((mx,q)=>Math.max(mx,sim(r.b,q,0).cap),0);const sc=r.cap*1.2-rep*.9+Math.random()*1.4;if(sc>bs){bs=sc;best=m}});move(best,1)};
  draw()}

/* where you can play */
{const _ra=roomActions;roomActions=function(){const a=_ra.apply(this,arguments);try{const n=mgOpponent();
  if(IS&&IS.kind==='room'){if(n)a.unshift([`🟤 Play Oware with ${n.name.split(' ')[0]}`,()=>owareGame(),null,'b']);
    if(P().items.includes('console')||(!IS.mine&&IS.owner&&IS.owner!=='me'&&typeof npcConsole==='function'&&npcConsole(IS.owner)))a.unshift([`⚽ FIFA penalty shootout${n?' vs '+n.name.split(' ')[0]:''} (you play)`,()=>penaltyGame(),null,'b'])}}catch(e){}return a}}
{const _sa=socialAct;socialAct=function(n,a,shared,draw){if(a==='oware'){closeSheet();n.with=Math.max(n.with||0,S.min+60);setTimeout(()=>owareGame(n),150);return null}return _sa.apply(this,arguments)}}
