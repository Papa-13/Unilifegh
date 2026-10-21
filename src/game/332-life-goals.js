/* ================= life goals: pick what your uni life is about =================
   Like a Sims aspiration. Each goal is a ladder of steps; each step pays a reward and the next one
   shows in Tasks, so there's always something to aim for. You can switch goals (progress restarts). */
const ASP={
  first:{ic:'🎓',name:'First Class',why:'Top grades, the library and study groups.',steps:[
    ['Attend 3 lectures',()=>P().att.reduce((a,b)=>a+b,0)>=3],['Study with a friend',()=>(S.groupStudy||0)>=1],['Reach 60 study points',()=>P().study>=60],
    ['Score 70+ in an exam',()=>Object.values(P().exams||{}).some(r=>r.score>=70)],['Attend 25 lectures',()=>P().att.reduce((a,b)=>a+b,0)>=25],['Graduate with First Class',()=>P().grad==='First Class']]},
  src:{ic:'👑',name:'SRC President',why:'Popularity, campaigns and power.',steps:[
    ['Make 5 friends',()=>friendsN()>=5],['Become close friends with 3 people',()=>S.npcs.filter(n=>n.friend>=50).length>=3],['Make 15 friends',()=>friendsN()>=15],
    ['Run for any office',()=>!!P().race||!!P().office],['Win an election',()=>!!P().office],['Become SRC President',()=>/president/i.test(P().office||'')]]},
  hustle:{ic:'💼',name:'Campus Hustler',why:'Make money moves before graduation.',steps:[
    ['Start a business',()=>!!P().biz],['Sell to 20 customers',()=>(P().biz&&P().biz.sold||0)>=20],['Earn GH₵1,000 from your business',()=>(P().biz&&P().biz.earned||0)>=1000],
    ['Have GH₵5,000 on MoMo',()=>P().money>=5000],['Earn GH₵5,000 from your business',()=>(P().biz&&P().biz.earned||0)>=5000],['Have GH₵15,000 on MoMo',()=>P().money>=15000]]},
  love:{ic:'❤️',name:'Campus Couple',why:'Find your person and survive the drama.',steps:[
    ['Get 3 people\'s numbers',()=>S.npcs.filter(n=>n.contact).length>=3],['Go on your first date',()=>S.npcs.some(n=>n.dates>=1)],['Get into a relationship',()=>!!P().partner],
    ['Go on 4 dates with your partner',()=>!!P().partner&&P().partner.dates>=4],['Stay together for 30 days',()=>!!P().partner&&S.relSince!=null&&day()-S.relSince>=30],['Max out romance with your partner',()=>!!P().partner&&P().partner.romance>=100]]},
  icon:{ic:'🌟',name:'Campus Icon',why:'Everybody knows your name.',steps:[
    ['Make 5 friends',()=>friendsN()>=5],['Win a pickup game',()=>(S.wins||0)>=1],['Party at Club Vibes',()=>!!S.clubbed],
    ['Make 15 friends',()=>friendsN()>=15],['Become best friends with someone',()=>S.npcs.some(n=>n.friend>=75)],['Make 30 friends',()=>friendsN()>=30]]}};
const ASP_PAY=[[150,1],[200,1],[300,2],[400,2],[600,3],[1500,8]];
function aspPick(first){const keys=Object.keys(ASP);
  story(`<div class="eyebrow">🎯 Your life goal</div><h3>${first?'What do you want from uni?':'Choose a new goal'}</h3><p class="scene">Pick one. Each goal has six steps with cash and 💎 rewards, and the next step always shows in 🎯 Tasks.${first?'':' Switching restarts your progress.'}</p>
    <div class="list">${keys.map(k=>`<div class="item"><span style="font-size:24px">${ASP[k].ic}</span><div class="grow"><b>${ASP[k].name}</b><small>${ASP[k].why}</small></div></div>`).join('')}</div>`,
    keys.map(k=>[`${ASP[k].ic} ${ASP[k].name}`,k===keys[0]?'g':'',()=>{S.asp={k,step:0,t:day()};toast(`🎯 Goal set: ${ASP[k].name}. First step: ${ASP[k].steps[0][0]}`);try{window.track&&window.track('pick_goal',{goal:k})}catch(e){}}]))}
function aspCheck(){if(!S||!S.asp||!S.p)return;const A=ASP[S.asp.k];if(!A)return;let st=S.asp.step;if(st>=A.steps.length)return;
  let ok=false;try{ok=A.steps[st][1]()}catch(e){}if(!ok)return;const [cash,gems]=ASP_PAY[st];P().money+=cash;gemsEarn('mile',60+Object.keys(ASP).indexOf(S.asp.k)*6+st,gems);gemPop(gems);S.asp.step=++st;
  const done=st>=A.steps.length;setTimeout(()=>{if(done){addBuff('loved');story(`<div class="eyebrow">${A.ic} Goal complete</div><h3>${A.name}!</h3><p class="scene">You did it. Everyone on campus knows what you're about now.</p><p>+${cedi(cash)} and ${gems} 💎</p>`,[['🎉 Choose another goal','g',()=>aspPick(false)],['Later','',()=>{}]])}
    else toast(`${A.ic} Step done: ${A.steps[st-1][0]} · +${cedi(cash)} +${gems}💎 · Next: ${A.steps[st][0]}`)},600)}
function aspCard(){if(!S.asp)return `<div class="say" style="margin:0 0 10px">🎯 <b>No life goal yet.</b> <a href="#" id="aspGo" style="color:var(--gold,#e8b24a);font-weight:800">Choose one</a></div>`;
  const A=ASP[S.asp.k],st=S.asp.step;return `<div class="say" style="margin:0 0 10px"><div class="row" style="justify-content:space-between;align-items:center"><b>${A.ic} ${A.name}</b><a href="#" id="aspGo" style="font-size:12px;color:var(--muted)">Change</a></div>
    <div class="bar" style="margin:6px 0"><i style="width:${st/A.steps.length*100}%"></i></div><small>${st>=A.steps.length?'Complete! 🎉':`Step ${st+1} of ${A.steps.length}: <b>${esc(A.steps[st][0])}</b> · reward ${cedi(ASP_PAY[st][0])} + ${ASP_PAY[st][1]}💎`}</small></div>`}
/* show the goal at the top of Tasks, check progress with the milestones, ask new players to pick */
{const _ts=taskSheet;taskSheet=function(){const r=_ts.apply(this,arguments);try{const el=$('sheetIn').querySelector('p')||$('taskSheet');if(el){el.insertAdjacentHTML('afterend',aspCard());const g=$('aspGo');if(g)g.onclick=e=>{e.preventDefault();closeSheet();aspPick(!S.asp)}}}catch(e){}return r}}
{const _cm=checkMiles;checkMiles=function(){const r=_cm.apply(this,arguments);try{aspCheck()}catch(e){}return r}}
{const _sg=showGame;showGame=function(){const r=_sg.apply(this,arguments);const tryAsk=(n=0)=>{if(!S||S.asp||NOBOTS&&false)return;if(!$('story').hidden||!$('sheet').hidden||S.busy){if(n<40)setTimeout(()=>tryAsk(n+1),3000);return}aspPick(true)};setTimeout(tryAsk,9000);return r}}
/* small trackers the goals need */
{const _ev=ev;ev=function(type,d){try{if(type==='act'&&d&&/club vibes|dancing at/i.test(d.l||''))S.clubbed=1}catch(e){}return _ev.apply(this,arguments)}}
{const _hp=hourly;hourly=function(){const r=_hp.apply(this,arguments);try{if(S&&S.p){if(P().partner&&S.relSince==null)S.relSince=day();if(!P().partner)S.relSince=null}}catch(e){}return r}}
