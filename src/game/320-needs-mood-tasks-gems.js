/* ================= Sims-style needs, mood, tasks, gems ================= */
const NEEDN={hunger:['🍛','hungry','Hungry','Starving'],energy:['😴','tired','Tired','Exhausted'],hygiene:['🚿','smelly','Stinky','Filthy'],social:['💬','lonely','Lonely','Very lonely'],fun:['🎉','bored','Bored','Miserably bored']};
const BUFFS={fresh:['🧼','Fresh from the shower','happy',180],fed:['😋','Well fed','happy',180],won:['🏆','Won the match','energized',240],inspired:['✨','Inspired by the show','inspired',300],
  amused:['😂','Had a good laugh','happy',90],embarrassed:['😳','Embarrassed','tense',90],shaken:['😨','Nearly got hit by a car','tense',120],honked:['😤','Shouted at by a driver','angry',90],
  rested:['😌','Well rested','energized',360],groggy:['🥱','Groggy','tense',180],tidy:['🧹','Organised room','focused',240],messy:['😖','Messy room','tense',120],studied:['📚','Productive study','focused',180],
  loved:['❤️','Feeling loved','flirty',240],reflective:['🧠','Deep in thought','focused',180],gisted:['😆','Great gist with friends','happy',150],music:['🎶','Vibing to music','happy',90],raged:['😠','Road rage','angry',60]};
function addBuff(k){if(!S||!BUFFS[k])return;S.buffs=(S.buffs||[]).filter(b=>b.k!==k);S.buffs.push({k,until:S.min+BUFFS[k][3]});}
function buffsNow(){if(!S)return[];S.buffs=(S.buffs||[]).filter(b=>b.until>S.min);return S.buffs}
const EMO={happy:['😄','Happy',1.12],energized:['⚡','Energized',1.15],inspired:['✨','Inspired',1.22],focused:['🧠','Focused',1.25],flirty:['😍','Flirty',1.05],tense:['😬','Tense',.85],angry:['😠','Angry',.8]};
function moodInfo(){const p=P(),n=p.needs,ks=Object.keys(NEEDN),low=ks.filter(k=>n[k]<30),crit=ks.filter(k=>n[k]<12),avg=ks.reduce((a,k)=>a+n[k],0)/5;
  {const bs=buffsNow();if(!crit.length&&bs.length){const sc={};bs.forEach(b=>{const e=BUFFS[b.k][2];sc[e]=(sc[e]||0)+1});const neg=(sc.angry||0)+(sc.tense||0);
    const top=Object.keys(sc).sort((a,b)=>sc[b]-sc[a]||(['angry','tense'].includes(a)?-1:1))[0];if(top&&(low.length<2||neg)){const E=EMO[top];if(!(low.length&&!['angry','tense'].includes(top)))return{ic:E[0],name:E[1],study:E[2],key:['angry','tense'].includes(top)?'bad':'good',why:low,buff:true}}}}
  if(crit.length)return{ic:'😫',name:NEEDN[crit[0]][3],study:.65,key:'bad',why:crit};
  if(low.length>=2)return{ic:'😣',name:'Uncomfortable',study:.8,key:'bad',why:low};
  if(low.length)return{ic:'😕',name:NEEDN[low[0]][2],study:.88,key:'meh',why:low};
  if(p.partner&&n.social>65&&n.fun>60)return{ic:'😍',name:'Flirty',study:1.05,key:'good',why:[]};
  if(n.energy>65&&n.fun>45&&S.lastStudyDay===day())return{ic:'🧠',name:'Focused',study:1.25,key:'good',why:[]};
  if(avg>72)return{ic:'😄',name:'Happy',study:1.12,key:'good',why:[]};
  if(n.fun>80&&n.social>70)return{ic:'🤪',name:'Playful',study:.95,key:'good',why:[]};
  return{ic:'🙂',name:'Fine',study:1,key:'ok',why:[]}}
const WHIMS=[
 {id:'meal',t:'Eat a proper meal',g:1,ic:'🍛',ev:(e,d)=>e==='act'&&/eating|cooking|having a drink|cold drink/i.test(d.l),pri:()=>P().needs.hunger<50},
 {id:'lecture',t:'Attend a lecture',g:2,ic:'📚',ev:e=>e==='lecture',when:()=>{const t=TT[day()%7];return t&&t.some(([c,st])=>st+2>hour())}},
 {id:'chat3',t:'Chat with 3 people',g:2,ic:'💬',n:3,ev:e=>e==='talk',pri:()=>P().needs.social<45},
 {id:'joke',t:'Make someone laugh with a joke',g:2,ic:'😂',ev:(e,d)=>e==='talk'&&d.a==='joke'&&d.good},
 {id:'shower',t:'Take a shower or bath',g:1,ic:'🚿',ev:(e,d)=>e==='act'&&/shower|bath/i.test(d.l),pri:()=>P().needs.hygiene<50},
 {id:'workout',t:'Work out, jog or run on the treadmill',g:2,ic:'🏋️',ev:(e,d)=>e==='act'&&/working out|treadmill|jogging/i.test(d.l)},
 {id:'ball',t:'Play football or basketball',g:2,ic:'⚽',ev:(e,d)=>e==='game'&&d.kind!=='swim'},
 {id:'win',t:'Win a pickup game',g:3,ic:'🏆',ev:(e,d)=>e==='game'&&d.win>0},
 {id:'swim',t:'Go for a swim',g:2,ic:'🏊',ev:(e,d)=>e==='game'&&d.kind==='swim',when:()=>hour()<17},
 {id:'study',t:'Study for 2 hours in total',g:3,ic:'📖',n:120,ev:(e,d)=>e==='act'&&d.fx&&d.fx.study?d.mins:0},
 {id:'night',t:'Visit the Night Market',g:1,ic:'🌙',ev:(e,d)=>e==='at'&&d==='night',when:()=>hour()>=14},
 {id:'lib',t:'Visit the library',g:1,ic:'🏛️',ev:(e,d)=>e==='at'&&d==='lib'},
 {id:'vn',t:'Send someone a voice note',g:1,ic:'🎙️',ev:(e,d)=>e==='chat'&&d.vn,when:()=>!NOBOTS},
 {id:'mum',t:'Text home',g:1,ic:'🏠',ev:(e,d)=>e==='chat'&&d.fam},
 {id:'friend',t:'Introduce yourself to someone new',g:2,ic:'🤝',ev:(e,d)=>e==='talk'&&(d.a==='intro'||d.a==='hi')},
 {id:'hang',t:'Walk or sit with a friend',g:2,ic:'🪑',ev:(e,d)=>(e==='act'&&/^walking with|sitting with/i.test(d.l))||e==='walkreal',when:()=>friendsN()>0},
 {id:'clean',t:'Tidy up your room',g:2,ic:'🧹',ev:(e,d)=>e==='act'&&/tidying/i.test(d.l),when:()=>(P().mess||0)>=30},
 {id:'sleep',t:'Get a full night\'s sleep (7h+)',g:2,ic:'😴',ev:(e,d)=>e==='sleep'&&d>=7,when:()=>hour()>=12},
 {id:'dance',t:'Dance where people can see you',g:1,ic:'💃',ev:(e,d)=>e==='emote'&&d.k==='dance'&&d.n>0},
 {id:'club',t:'Dance at Club Vibes',g:2,ic:'🪩',ev:(e,d)=>e==='act'&&/dancing at/i.test(d.l),when:()=>hour()>=16},
 {id:'cook',t:'Cook your own food',g:2,ic:'🍳',ev:(e,d)=>e==='act'&&/^cooking/i.test(d.l)},
 {id:'fun',t:'Get your Fun above 80',g:1,ic:'🎉',ev:()=>P().needs.fun>=80,state:1},
 {id:'happy',t:'Be in a Happy mood',g:2,ic:'😄',ev:()=>['Happy','Focused','Playful','Flirty'].includes(moodInfo().name),state:1},
 {id:'emote',t:'Wave at someone',g:1,ic:'👋',ev:(e,d)=>e==='emote'&&d.k==='wave'&&d.n>0}];
const MILES=[
 ['Make 3 friends',4,()=>friendsN()>=3],['Attend 5 lectures',4,()=>P().att.reduce((a,b)=>a+b,0)>=5],['Complete 5 daily tasks',4,()=>S.tasksDone>=5],
 ['Decorate your room with 4 items',5,()=>P().items.length>=4],['Win a pickup game',4,()=>S.wins>=1],['Have GH₵2,000 on MoMo',5,()=>P().money>=2000],
 ['Make 10 friends',8,()=>friendsN()>=10],['Get into a relationship',6,()=>!!P().partner||!!relGet()],['Score 70+ in an exam',8,()=>Object.values(P().exams||{}).some(r=>r.score>=70)],
 ['Reach Level 200',6,()=>(P().yr||1)>=2],['Complete 20 daily tasks',10,()=>S.tasksDone>=20],['Reach your final year',10,()=>isFinalYear(P())],['Graduate',20,()=>!!P().grad],['Graduate with First Class',30,()=>P().grad==='First Class'],['Win 5 pickup games',8,()=>S.wins>=5],['Attend 20 lectures',10,()=>P().att.reduce((a,b)=>a+b,0)>=20]];
function fillWhims(){if(!S||!S.whims)return;S.whims=S.whims.filter(w=>!w.done||performance.now()-w.doneT<6000);
  while(S.whims.filter(w=>!w.done).length<3){const have=new Set(S.whims.map(w=>w.id)),pool=WHIMS.filter(w=>!have.has(w.id)&&(!w.when||w.when()));if(!pool.length)break;
    const pri=pool.filter(w=>w.pri&&w.pri()),W=pick(pri.length&&Math.random()<.7?pri:pool);S.whims.push({id:W.id,prog:0,done:false})}}
function ev(type,d){if(!S||!S.whims)return;let changed=false;S.whims.forEach(w=>{if(w.done)return;const W=WHIMS.find(x=>x.id===w.id);if(!W)return;let r=false;try{r=W.ev(type,d)}catch(e){}
    if(!r)return;w.prog+=typeof r==='number'?r:1;changed=true;if(w.prog>=(W.n||1)){w.done=true;w.doneT=performance.now();gemsEarn('task',`${W.id}:${day()}:${MP.campus||'solo'}:${P().name}`,W.g);S.tasksDone++;P().needs.fun=clamp(P().needs.fun+4);
      setTimeout(()=>toast(`🎯 Task complete: ${W.t} · +${W.g} 💎`),type==='act'?1200:200);gemPop(W.g)}});if(changed&&$('taskSheet'))taskSheet()}
function checkMiles(){MILES.forEach(([t,g,f],i)=>{if(S.miles[i])return;let ok=false;try{ok=f()}catch(e){}if(ok){S.miles[i]=1;gemsEarn('mile',i,g);setTimeout(()=>toast(`🏅 Milestone: ${t} · +${g} 💎`),1800);gemPop(g)}});if(S.whims.length)ev('tick')}
function gemPop(g){const b=$('gemBtn');if(!b)return;b.classList.remove('pop');void b.offsetWidth;b.classList.add('pop')}
function gemCost(){const b=S.busy;if(!b||!b.timed)return 0;const rem=b.timed.start+b.timed.mins-S.min;return Math.max(1,Math.ceil(rem/60))}
async function gemFinish(){const b=S.busy;if(!b||!b.timed)return;const c=gemCost();if((S.gems||0)<c){toast(`You need ${c} 💎 to finish this now. Earn them from 🎯 tasks, or tap 💎 to get more from GH₵1.`);return}if(!(await gemsSpend(c))||S.busy!==b)return;b.skip=true;busyStep(0);if(S.busy===b&&b.game){b.timed.ap=1;finishBusy()}hud()}
function busyHud(){const b=S.busy;if(!b||!b.timed)return;const T=b.timed,k=clamp((S.min-T.start)/T.mins,0,1),rem=Math.max(0,Math.ceil(T.start+T.mins-S.min));
  const bar=$('busyBar');if(bar)bar.style.width=(k*100).toFixed(1)+'%';const r=$('busyRem');if(r)r.textContent=rem>=60?`${Math.floor(rem/60)}h ${rem%60}m left`:`${rem}m left`;
  const g=$('gemSkip');if(g){const c=gemCost();g.textContent=innerWidth<700?`⚡ Finish · 💎${c}`:`⚡ Finish now · 💎${c}`;g.classList.toggle('dim',(S.gems||0)<c)}}
function taskSheet(){S.paused=true;openSheet();const p=P(),M=moodInfo();
  const rows=S.whims.map(w=>{const W=WHIMS.find(x=>x.id===w.id);if(!W)return'';const n=W.n||1;return `<div class="task${w.done?' done':''}"><span class="tic">${W.ic}</span><div class="grow"><b>${esc(W.t)}</b>${n>1?`<div class="bar"><i style="width:${Math.min(100,w.prog/n*100)}%"></i></div><small>${Math.min(n,Math.round(w.prog))}/${n}${W.id==='study'?' min':''}</small>`:''}</div><span class="tag y">${w.done?'✓':'+'+W.g+' 💎'}</span></div>`}).join('');
  const nextM=MILES.map((m,i)=>[m,i]).filter(([m,i])=>!S.miles[i]).slice(0,4);
  $('sheetIn').innerHTML=`<div id="taskSheet"></div><div class="row" style="justify-content:space-between;align-items:center"><h3>🎯 Tasks</h3><span class="tag y" style="font-size:15px">💎 ${S.gems}</span></div>
   <p style="font-size:13px;color:var(--muted);margin:6px 0 10px">Finish tasks to earn gems. Spend gems on <b>⚡ Finish now</b> to complete any activity instantly. New tasks arrive each morning. <a href="#" id="tsShop" style="color:var(--gold,#e8b24a);font-weight:700">💎 Get more gems from GH₵1</a></p>
   <div class="eyebrow">Today</div><div class="tasks">${rows}</div>
   <button class="ghost sm" id="swapT" ${S.swapDay===day()?'disabled':''}>🎲 Swap one task${S.swapDay===day()?' (used today)':' (free once a day)'}</button>
   <div class="eyebrow" style="margin-top:14px">Campus Legend milestones</div><div class="tasks">${nextM.map(([m])=>`<div class="task"><span class="tic">🏅</span><div class="grow"><b>${esc(m[0])}</b></div><span class="tag">+${m[1]} 💎</span></div>`).join('')||'<p>All milestones complete. Legend! 👑</p>'}</div>
   <div class="eyebrow" style="margin-top:14px">You</div><p style="font-size:14px;margin:4px 0">Mood: <b>${M.ic} ${M.name}</b>${M.why.length?` · because you're ${M.why.map(k=>NEEDN[k][1]).join(' and ')}`:''}. Study power ×${M.study.toFixed(2)}.<br>Grade forecast: <b>${day()<=S.semStart?'–':forecast()}</b> · Friends: <b>${friendsN()}</b></p>
   <div class="chips" style="margin:4px 0 8px">${buffsNow().map(b=>{const B=BUFFS[b.k];const m=Math.round(b.until-S.min);return `<span class="tag ${['angry','tense'].includes(B[2])?'':'g'}">${B[0]} ${B[1]} · ${m>=60?Math.round(m/60)+'h':m+'m'}</span>`}).join('')||'<span class="tag">No moodlets right now</span>'}</div>
   <label class="row" style="gap:8px;font-size:14px;margin:8px 0"><input type="checkbox" id="fwT" ${S.freeWill?'checked':''}> Free will: your Sim takes care of urgent needs on their own when you leave them idle</label>
   <button class="btn sm" id="bye">Close</button>`;
  $('swapT').onclick=()=>{const i=S.whims.findIndex(w=>!w.done);if(i<0)return;S.whims.splice(i,1);S.swapDay=day();fillWhims();taskSheet()};
  $('fwT').onchange=e=>{S.freeWill=e.target.checked};$('bye').onclick=closeSheet;if($('tsShop'))$('tsShop').onclick=e=>{e.preventDefault();closeSheet();gemShop()}}
function moodSheet(){taskSheet()}
/* prompts when needs get low, thought bubble, and free will */
const THOUGHT=(()=>{const cache={};const make=ic=>{if(cache[ic])return cache[ic];const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.fillStyle='rgba(255,255,255,.95)';g.beginPath();g.ellipse(64,56,50,44,0,0,7);g.fill();g.beginPath();g.arc(40,108,9,0,7);g.fill();g.beginPath();g.arc(26,122,5,0,7);g.fill();g.font='54px system-ui, Apple Color Emoji, Segoe UI Emoji';g.textAlign='center';g.textBaseline='middle';g.fillText(ic,64,58);return cache[ic]=new THREE.CanvasTexture(c)};
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:make('🍛'),depthTest:false,transparent:true}));sp.scale.set(.6,.6,1);sp.renderOrder=999;sp.visible=false;return{sp,make,ic:null}})();
function thoughtTick(){const p=P();if(!p||!p.mesh)return;const sp=THOUGHT.sp,host=IS?IS.scene:scene;if(sp.parent!==host){if(sp.parent)sp.parent.remove(sp);host.add(sp)}
  const n=p.needs,worst=Object.keys(NEEDN).sort((a,b)=>n[a]-n[b])[0],show=n[worst]<28&&!(S.busy&&S.busy.timed&&Object.keys(S.busy.timed.fx).some(k=>k===worst&&S.busy.timed.fx[k]>0));
  sp.visible=show&&p.mesh.visible;if(!show)return;const ic=NEEDN[worst][0];if(THOUGHT.ic!==ic){THOUGHT.ic=ic;sp.material.map=THOUGHT.make(ic);sp.material.needsUpdate=true}
  const t=performance.now()/1000;sp.position.set(p.mesh.position.x+.35,p.mesh.position.y+(IS?2.3:2.55)+Math.sin(t*2.4)*.05,p.mesh.position.z);const sc=(IS?.5:.75)*(n[worst]<12?1+Math.sin(t*6)*.06:1);sp.scale.set(sc,sc,1)}
function foodPlaces(){const h=hour();return [['canteen',h>=7&&h<20],['night',h>=18||h<1],['shawarma',h>=10&&h<23],['mall',h>=9&&h<21]].filter(([id,o])=>o&&BID[id]).map(([id])=>BID[id]).sort((a,b)=>Math.hypot(a.door[0]-P().x,a.door[1]-P().y)-Math.hypot(b.door[0]-P().x,b.door[1]-P().y))}
function walkTo(b){if(IS)leaveRoom(true);const p=P();p.target={x:b.door[0],y:b.door[1]+(b.door[1]>b.y+b.h/2?14:-14)};acts(true)}
function needFixes(k){const p=P(),a=[],mine=IS&&IS.mine;
  if(k==='hunger'){if(mine&&p.prov>0)a.push([`🥣 Eat from your food cupboard (${p.prov} left)`,()=>{p.prov--;doAct('Eating gari, sugar and milk',20,{hunger:28})}]);
    const f=foodPlaces()[0];if(f)a.push([`🚶 Get food at ${f.name}`,()=>walkTo(f)]);a.push(['🛵 Order food to you',()=>phone('apps')])}
  if(k==='energy'){if(mine){a.push(['😴 Sleep',()=>sleep()]);a.push(['💤 Nap (2h)',()=>nap()])}else a.push(['🏠 Go home to rest',()=>walkTo(homeB())]);if(BID.pharm)a.push(['☕ Grab an energy drink (pharmacy)',()=>walkTo(BID.pharm)])}
  if(k==='hygiene'){if(mine)a.push(['🚿 Take a shower',()=>doAct('Taking a shower',20,{hygiene:100,fun:5,energy:4})]);else a.push(['🏠 Go home and shower',()=>walkTo(homeB())])}
  if(k==='social'){const n=!IS&&nearNPC();if(n)a.push([`💬 Talk to ${n.name}`,()=>talkMenu(n)]);a.push(['📱 Text a friend',()=>phone()]);if(BID.parade)a.push(['🚶 Go where people are (Parade Grounds)',()=>walkTo(BID.parade)])}
  if(k==='fun'){a.push(['💃 Dance a little',()=>doEmote('dance')]);if(!IS){a.push(['⚽ Go to the Sports Field',()=>walkTo(BID.field)])}else if(mine&&p.items.includes('console'))a.push(['🎮 Play FIFA',()=>playFifa()])}
  return a}
function showNeedCard(k,lvl){const p=P(),el=$('needCard'),N=NEEDN[k],fx=needFixes(k);S.cardK=k;
  el.innerHTML=`<div class="nc ${lvl}"><span class="nci">${N[0]}</span><div class="grow"><b>${p.name&&p.name!=='You'?esc(p.name)+' is':'You are'} ${lvl==='crit'?N[3].toLowerCase():'getting '+N[1]}</b><small>${{hunger:lvl==='crit'?'Stomach is growling loudly. Focus and mood are dropping.':'A snack or a meal soon would help.',energy:lvl==='crit'?'Can barely keep their eyes open. Walking slowly, studying badly.':'Starting to feel sleepy.',hygiene:'People can tell. Friends will start avoiding you.',social:'Needs to talk to someone.',fun:'Everything feels boring right now.'}[k]}</small>
    <div class="ncb">${fx.map(([t],i)=>`<button class="ghost sm" data-nf="${i}">${esc(t)}</button>`).join('')}</div></div><button class="ncx" aria-label="Dismiss">✕</button></div>`;
  el.hidden=false;el.querySelectorAll('[data-nf]').forEach(b=>b.onclick=()=>{el.hidden=true;fx[+b.dataset.nf][1]()});el.querySelector('.ncx').onclick=()=>{el.hidden=true;S.alerts[k+'x']=S.min}}
let NW=0;
function needWatch(dt){NW+=dt;
  if(S.pendTalk&&!IS){const n=S.pendTalk,p=P();if(n.hidden){S.pendTalk=null}else if(dist(n,p)<80){S.pendTalk=null;p.target=null;p.path=null;talkMenu(n)}else if(!p.target||Math.hypot(p.target.x-n.x,p.target.y-n.y)>30){p.target={x:n.x,y:n.y};p.path=null}}if(NW<.5)return;const ndt=NW;NW=0;const p=P(),n=p.needs,A=S.alerts;
  Object.keys(NEEDN).forEach(k=>{const v=n[k],lvl=v<12?'crit':v<28?'low':null,prev=A[k];
    if(lvl&&lvl!==prev&&!(A[k+'x']&&S.min-A[k+'x']<90&&lvl!=='crit')&&!S.busy&&!S.paused){A[k]=lvl;showNeedCard(k,lvl)}
    if(!lvl&&prev){A[k]=null;if(S.cardK===k)$('needCard').hidden=true}});
  if(!S.busy&&!S.paused&&!p.target&&!p.itarget){S.idleT=(S.idleT||0)+ndt;
    const crit=Object.keys(NEEDN).filter(k=>n[k]<15);if(crit.length&&Math.random()<.18){const k=crit[0];setGest(p,{hunger:'hungry',energy:'yawn',hygiene:'sniff',social:'sad',fun:'sad'}[k],2.2)}
    if(S.freeWill&&S.idleT>18)freeWill()}else S.idleT=0;
  if(S.auto&&!p.target&&!S.busy){const a=S.auto;S.auto=null;if(a.k==='eat'&&!IS){const b=locOf(p.x,p.y);if(b&&b.id===a.b){const L=placeActions(b,false).filter(x=>x[1]&&/·\s*GH₵\s*(\d+)/.test(x[0])&&/waakye|kenkey|banku|indomie|rice|shawarma|pizza|kelewele|jollof|food|meal|eat/i.test(x[0])).sort((x,y)=>+x[0].match(/GH₵\s*(\d+)/)[1]-+y[0].match(/GH₵\s*(\d+)/)[1]);if(L[0]&&p.money>=+L[0][0].match(/GH₵\s*(\d+)/)[1]){toast(`${simN()} orders ${L[0][0].split('·')[0].trim()} (free will)`);L[0][1]()}}}
    if(a.k==='sleep'&&!IS){const b=homeB();if(dist(p,{x:b.door[0],y:b.door[1]})<80){enterRoom('me');setTimeout(()=>{if(IS&&IS.mine&&!S.busy){const h=hour();h>=20||h<5?sleep():nap()}},300)}}}}
const simN=()=>{const n=P().name;return n&&n!=='You'?n:'Your Sim'};
function freeWill(){const p=P(),n=p.needs;S.idleT=0;
  if(n.hunger<15){if(IS&&IS.mine&&p.prov>0){toast(`${simN()} is starving and grabs something from the food cupboard (free will)`);p.prov--;doAct('Eating gari, sugar and milk',20,{hunger:28});return}
    const f=foodPlaces()[0];if(f&&p.money>=15){toast(`${simN()} is hungry and heads to ${f.name} (free will). Tap anywhere to take over.`);walkTo(f);S.auto={k:'eat',b:f.id};return}}
  if(n.energy<12){if(IS&&IS.mine){const h=hour();toast(`${simN()} is exhausted and lies down (free will)`);h>=20||h<5?sleep():nap();return}if(!IS){toast(`${simN()} is exhausted and walks home (free will). Tap anywhere to take over.`);walkTo(homeB());S.auto={k:'sleep'};return}}
  if(n.hygiene<12&&IS&&IS.mine&&!IS.bathBusy){toast(`${simN()} can't stand the smell any more and showers (free will)`);doAct('Taking a shower',20,{hygiene:100,fun:5,energy:4})}}
function hud(){if(!S)return;const p=P();
  $('hDayL').textContent=`${typeof wxIcon==='function'?wxIcon():''}${DAYS[wd()].slice(0,3)} · ${p.grad?'Graduate 🎓':`L${levelOf(p)} · Sem ${S.sy||1}`}`;$('hTime').textContent=hm(S.min);$('hMoney').textContent=cedi(p.money).replace('GH₵','');
  $('hCwa').textContent=day()<=S.semStart?'–':forecast();$('hFr').textContent=friendsN();
  $('needs').innerHTML=[['hunger','🍛','Hunger'],['energy','⚡','Energy'],['social','💬','Social'],['fun','🎉','Fun'],['hygiene','🚿','Hygiene']].map(([k,ic,l])=>{const v=Math.round(p.needs[k]),c=v<15?'#ff5a4e':v<35?'#ffc24a':'#5fe08f';return `<div class="nrow"><span class="nring${v<15?' crit':''}" style="--v:${v};--c:${c}" title="${l} ${v}"><em>${ic}</em></span><span class="nlab"><b>${l}</b><span class="bar"><i style="width:${v}%;background:${c}"></i></span></span></div>`}).join('');
  const M=moodInfo();$('hMood').textContent=M.name;$('hMoodI').textContent=M.ic;$('hGems').textContent='💎 '+(S.gems||0);fillWhims();$('hTasks').textContent=S.whims.filter(w=>!w.done).length||'';
  {const av=$('hAv');av.style.background=`linear-gradient(145deg,${PAL[p.look.pal].a},${PAL[p.look.pal].b})`;av.style.setProperty('--moodc',M.key==='bad'?'#ff5a4e':M.key==='good'?'#5fe08f':'#ffc24a');$('hAvI').textContent=(p.name&&p.name!=='You'?p.name:'You')[0].toUpperCase();$('hName').textContent=p.name&&p.name!=='You'?p.name:'You';$('dUnread').textContent=S.unread||''}
  document.querySelectorAll('.speed button').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.sp===(S.speed??1)));
  checkMiles();if(S.busy&&S.busy.timed)busyHud();
}
function heldSoFar(){let n=0;for(let d=S.semStart;d<=day();d++){const t=TT[d%7];if(t)t.forEach(([c,st])=>{if(d<day()||hour()>st+2)n++})}return n}
let actKey='';
let PIE=false;
function acts(force){acts0(force);try{pieLayout()}catch(e){}}
let WIDEV=false;const updWide=()=>{WIDEV=matchMedia('(min-width:1024px) and (min-height:560px)').matches};updWide();addEventListener('resize',()=>{updWide();try{acts(true)}catch(e){}});
function pieLayout(){const A=$('acts'),it=$('interact');if(!A||!it)return;const status=!!A.querySelector('.busy,.eyebrow,#vehL');A.classList.toggle('status',status);
  const items=[...A.children].filter(b=>b.tagName==='BUTTON'&&b.id!=='phoneBtn'&&b.id!=='emoBtn');
  if(WIDEV&&!status){PIE=false;A.classList.remove('pie');A.classList.toggle('docked',!!S&&!S.paused&&items.length>0);it.hidden=true;[...A.children].forEach(b=>{if(b.style)b.style.cssText=''});const hb=A.querySelector('.pie-hub');if(hb)hb.remove();return}
  A.classList.remove('docked');
  if(status||!S||S.paused&&!PIE){if(status)PIE=false;A.classList.remove('pie');it.hidden=status||!items.length;[...A.children].forEach(b=>{b.style.cssText=''});return}
  it.hidden=!items.length;$('intN').textContent=items.filter(b=>!b.disabled).length||'';const tk=items.find(b=>b.id==='talkBtn');$('intL').textContent=tk?tk.textContent.replace('Talk to ','💬 '):'Actions';
  A.classList.toggle('pie',PIE);if(!PIE){items.forEach(b=>b.style.cssText='');const h=A.querySelector('.pie-hub');if(h)h.remove();return}
  const R=$('game').getBoundingClientRect(),W=R.width,H=R.height;let cx=W/2,cy=H*.46;{const v=P().mesh.position.clone();v.y+=1.1;v.project(IS?IS.cam:camera);if(Math.abs(v.x)<1.2&&Math.abs(v.y)<1.2){cx=clamp((v.x+1)/2*W,W*.4,W*.6);cy=clamp((1-v.y)/2*H,H*.3,H*.62)}}A.style.setProperty('--px',cx+'px');A.style.setProperty('--py',cy+'px');
  let hub=A.querySelector('.pie-hub');if(!hub){hub=document.createElement('div');hub.className='pie-hub';A.appendChild(hub)}const p=P();hub.innerHTML=`<span class="avatar" style="background:linear-gradient(145deg,${PAL[p.look.pal].a},${PAL[p.look.pal].b})"><i>✦</i></span>`;hub.style.left=cx+'px';hub.style.top=cy+'px';
  const half=Math.ceil(items.length/2),Lc=items.slice(0,half),Rc=items.slice(half),rowH=Math.max(34,Math.min(50,(H-250)/Math.max(1,half))),fs=rowH<40?12:13.5,mw=Math.max(120,cx-58);
  [[Lc,-1],[Rc,1]].forEach(([arr,sd])=>arr.forEach((b,i)=>{const dy=(i-(arr.length-1)/2)*rowH,cv2=Math.pow(Math.abs(dy)/Math.max(1,rowH*half/2),2)*22;
    b.style.cssText=`top:${cy+dy}px;font-size:${fs}px;max-width:${mw}px;animation-delay:${i*22}ms;`+(sd<0?`right:${W-cx+40+cv2}px;left:auto;`:`left:${cx+40+cv2}px;right:auto;`)}))}
function acts0(force){
  if(!S)return;const p=P();
  const inside=!!IS,b=inside?null:locOf(p.x,p.y),n=inside?nearInterior():nearNPC();
  const near=inside?IS.objs.filter(o=>Math.hypot(o.x-p.ix,o.z-p.iz)<o.r).map(o=>o.id).join(','):'';
  const key=[typeof hailKey==='function'&&!inside&&hailKey(),typeof hawkerNear==='function'&&(hawkerNear()||{}).id,S.date&&[S.date.acts,typeof dateAtVenue==='function'&&dateAtVenue(),typeof datePartnerHere==='function'&&datePartnerHere(),Math.floor(hour()*4)].join(),S.ride&&S.ride.phase+(S.ride.phase==='wait'&&Math.hypot(p.x-S.ride.pos.x,p.y-S.ride.pos.y)<110),S.del&&S.del.phase+(S.del.rider&&dist(p,S.del.rider)<60),S.buddyKey=(buddy()||{}).id,inside,!inside&&nearStop()&&nearStop().i,IS&&IS.bid,p.food&&p.food.length,b&&b.id,near,n&&n.id,Math.floor(hour()*2),p.job,S.flags.hx,S.flags.reported,S.unread>0,p.prov,p.items.length,p.flyers,!!p.race,p.biz&&p.biz.bookings].join('|');if(key===actKey&&!force)return;actKey=key;
  if(b&&b.id!==S._atB){S._atB=b.id;try{ev('at',b.id)}catch(e){}}
  $('where').textContent=inside?IS.title:zoneName(p.x,p.y);$('mini').hidden=inside;
  if(S.shuttleWait!=null&&!p.onBus){const ah=S.Q?Math.max(0,S.Q.list.indexOf('P')):0,wk='wait'+ah+S.pBoard;if(actKey!==wk){actKey=wk;$('acts').innerHTML=`<span class="eyebrow">🚌 ${S.pBoard?'Getting on the shuttle…':`In the queue at ${esc(SH_STOPS[S.shuttleWait].name)} · ${ah?ah+' ahead of you':'you\'re first in line'}`}</span>${S.pBoard?'':'<button class="ghost sm" id="sw">Leave the queue</button>'}`;const sw=$('sw');if(sw)sw.onclick=()=>{S.shuttleWait=null;p.pose=null;p.face=null;acts(true)}}return}
  if(S.busy&&S.busy.timed){const B=S.busy,k='T'+B.label;$('where').textContent=inside?IS.title:zoneName(p.x,p.y);if(S._busyK!==k||!$('busyBar')){S._busyK=k;
      $('acts').innerHTML=`<div class="busy"><div class="busyTop"><span id="busyL">${esc(B.game?B.game.hud():B.label)}</span><small id="busyRem"></small></div><div class="bar"><i id="busyBar" style="width:0%"></i></div></div><button class="btn sm gemb" id="gemSkip">⚡ Finish now</button><button class="ghost sm" id="stopB" aria-label="Stop">✖<span class="mn"> Stop</span></button>`;
      $('gemSkip').onclick=()=>gemFinish();$('stopB').onclick=()=>{const b=S.busy;if(!b)return;b.cancel=true;finishBusy();toast('Stopped. You keep what you got so far.')}}busyHud();return}
  const VV=curVeh();if(VV&&!S.busy){$('where').textContent=zoneName(p.x,p.y);const k='V'+VV.kind+VIN.on+(S.radio?1:0);if(S._vk!==k||!$('vehL')){S._vk=k;
      const btns=VV.kind==='car'?[['💬 Chat with the driver','vchat'],[S.radio?'🔉 Music down':'🎵 Ask for some Afrobeats','vradio'],['📱 Text the group chat','vphone']]:[['💬 Talk to the student beside you','bchat'],['😴 Doze off','bdoze'],['📱 Scroll TikTok','vphone']];
      $('acts').innerHTML=`<span class="eyebrow" id="vehL">${VV.kind==='car'?`🚗 Riding to ${esc(BID[S.ride.dest].name)}`:`🚌 Shuttle to ${esc(SH_STOPS[p.onBus.dest].name)}`}</span>`+btns.map(([t,kk])=>`<button class="ghost sm" data-v="${kk}">${t}</button>`).join('');
      $('acts').querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>vehAct(b.dataset.v))}actKey='veh';return}
  if(S.busy||rideBusy()||p.onBus){$('where').textContent=inside?IS.title:zoneName(p.x,p.y);const ph=S.ride&&S.ride.phase;$('acts').innerHTML=`<span class="eyebrow">⏳ ${esc(S.busy?S.busy.label+'…':p.onBus?`On the shuttle to ${SH_STOPS[p.onBus.dest].name}…`:ph==='board'?'Opening the door and getting in…':ph==='fill'?(S.ride.app==='trotro'?'Waiting for the trotro to fill up…':'Waiting for the taxi to fill up…'):ph==='drop'?'Getting out…':`Riding to ${BID[S.ride.dest].name}…`)}</span>`;actKey='busy';return}
  const list=inside?(IS.kind==='bld'?placeActions(BID[IS.bid]||{id:IS.bid},true):roomActions()):placeActions(b,false);
  try{memActs(list,inside,b)}catch(e){console.error(e)}
  if(!inside)try{hawkerActs(list)}catch(e){console.error(e)}
  try{dateActs(list)}catch(e){console.error(e)}
  if(!inside)try{hailActs(list)}catch(e){console.error(e)}
  try{realityActs(list)}catch(e){console.error(e)}
  {const rp=mpNear();if(rp)list.unshift([`🌐 ${rp.nm} (real student)`,()=>mpCard(rp),null,'b']);if(!inside&&MP.room&&mpOnline().length)list.push(['🗨️ Say something out loud',()=>mpSay()])}
  const stp=!inside&&nearStop();if(stp)list.unshift([`🚌 Wait for the free shuttle (${stp.name})`,()=>waitShuttle(stp),null,'b']);
  if(p.food&&p.food.length)list.unshift([`🍱 Eat your ${p.food[0].name}`,()=>{const f=p.food.shift();doAct(`Eating ${f.name}`,25,{hunger:f.food,fun:8})},null,'b']);
  const R_=S.ride;if(R_&&!inside){if(R_.phase==='pickup'){list.unshift([`🚗 ${R_.app==='taxi'?'Taxi':R_.app==='ryde'?'Ryde':'Dash'} driver on the way`,null]);list.push(['✖ Cancel ride',()=>cancelRide(false)])}
    if(R_.phase==='wait'&&R_.hail&&!R_.dest){list.unshift(['📍 Tell the driver where you\'re going',()=>hailSheet(R_.app),null,'b']);list.push(['✖ Never mind',()=>cancelRide(false)])}
    else if(R_.phase==='wait'){const near=Math.hypot(p.x-R_.pos.x,p.y-R_.pos.y)<110;list.unshift(near?['🚗 Open the door & get in',()=>boardRide(),null,'b']:[`🚗 Your ${carDesc(R_.app)} is waiting · walk to it`,()=>{p.target={x:R_.pos.x,y:R_.pos.y}},null,'b']);list.push(['✖ Cancel ride',()=>cancelRide(false)])}}
  const D_=S.del;if(D_&&D_.phase==='wait'&&D_.rider&&!inside){list.unshift(dist(p,D_.rider)<60?[`🛍️ Collect your ${D_.item.name}`,()=>collectFood(),null,'b']:[`🛵 Rider waiting · walk to collect`,()=>{p.target={x:D_.rider.x,y:D_.rider.y}},null,'b'])}
  else if(D_&&D_.phase==='wait'&&inside)list.unshift([`🛵 Rider is outside with your food`,null]);
  const bdy=!inside&&!S.busy&&buddy();if(bdy){list.unshift([`🪑 Sit with ${bdy.name}`,()=>sitWith(bdy),null,'b'],[`🚶 Walk with ${bdy.name}`,()=>walkWith(bdy),null,'b']);
    if(!bdy.mate&&hour()>=8&&hour()<22)list.push([`🏠 Go to ${bdy.name}'s room`,()=>{advance(15);visitRoom(bdy)}]);list.push([`👋 Bye, ${bdy.name}`,()=>{bdy.with=0;bdy.lastPlan=-1;toast(`${bdy.name}: "Later! 👋"`);acts(true)}])}
  if(inside&&!list.some(x=>x[0]==='Leave the room'))list.push([IS.kind==='bld'?(IS.back==='room'?'Back to your room':`Leave ${IS.title}`):'Leave the room',()=>leaveRoom(),null,'']);
  $('acts').innerHTML=`<button class="btn m" id="phoneBtn">📱 Phone${S.unread?` (${S.unread})`:''}</button>`+(p.biz?`<button class="ghost sm" id="bizBtn">💼 Business</button>`:'')+(n?`<button class="btn" id="talkBtn">Talk to ${esc(n.name)}</button>`:'')+(!S.busy&&!rideBusy()&&!p.onBus?`<button class="ghost sm" id="emoBtn">😀 Emote</button>`:'')+
    list.map(([t,fn,sub,cls],i)=>`<button class="${fn?(cls==='b'?'btn b':cls===''?'ghost':'btn g'):'ghost'} sm" data-x="${i}" ${fn?'':'disabled'}>${esc(t)}${sub?` · ${esc(sub)}`:''}</button>`).join('');
  $('phoneBtn').onclick=()=>phone();if(n)$('talkBtn').onclick=()=>talkMenu(n);if($('emoBtn'))$('emoBtn').onclick=()=>emoteSheet();if(p.biz)$('bizBtn').onclick=()=>bizSheet();
  $('acts').querySelectorAll('[data-x]').forEach(bt=>bt.onclick=()=>{const f=list[+bt.dataset.x][1];if(f)f()});
}
function nearNPC(){const L=S.lastNear;if(L&&!L.hidden&&dist(L,P())<95)return L;let best=null,bd=75;S.npcs.forEach(n=>{if(n.hidden)return;const d=dist(n,P());if(d<bd){bd=d;best=n}});S.lastNear=best;return best}
