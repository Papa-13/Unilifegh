/* ================= campus realities =================
   The things every Ghanaian student knows:
   1 light off (dumsor)   2 water shortage   3 lecture life   4 exam season   5 the money cycle
   6 admin stress   7 hall & hostel culture (morale nights, visitors)   8 faith life   9 health   10 departmental week
   11 data, campus WiFi, phone battery and "seen, no reply".
   State lives in S.rl (saved with the game). Hooks: realityHourly() each game hour, realityTick() each
   frame indoors, realityActs() for the action list, rlPlaceActs() for buildings, and a few small wrappers. */
const rlR=(d,salt)=>{const x=Math.sin(d*127.1+salt*311.7)*43758.5453;return x-Math.floor(x)};
const RLS=()=>S.rl||(S.rl={});
const sdNow=()=>day()-S.semStart;
/* ---------- 1. light off ---------- */
function lightOffSpan(d){if(rlR(d,1)>.42)return null;const night=rlR(d,2)<.55,from=night?18+Math.floor(rlR(d,3)*4):8+Math.floor(rlR(d,4)*8),len=2+Math.floor(rlR(d,5)*4);return[from,from+len]}
function lightOff(){if(!S)return false;const h=hour(),sp=lightOffSpan(day()),y=lightOffSpan(day()-1);return!!(sp&&h>=sp[0]&&h<sp[1])||!!(y&&y[1]>24&&h<y[1]-24)}
const GEN_BLD=['lib','senate','mall','bank','unity','clinic','greathall','phonehub','club'];
function hasPower(){if(!lightOff())return true;const p=P();if(IS){if(IS.kind==='room'){const t=HT(IS.mine?p.home:(IS.owner&&IS.owner.home));return t==='royal'||t==='bayview'}return GEN_BLD.includes(IS.bid)}return false}
/* ---------- 9. health ---------- */
BUFFS.sick=['🤒','Sick (go to the Health Centre)','tense',90];BUFFS.hot=['🥵','Hot room, no light','tense',90];BUFFS.blessed=['🙏','Spiritually refreshed','happy',300];
BUFFS.dressed=['🕺','Dressed to impress','happy',240];BUFFS.broke=['🪙','Broke till allowance','tense',120];
{const _d=decay;decay=function(mins){_d(mins);const r=S&&S.rl;if(r&&r.sick){const n=P().needs;n.energy=clamp(n.energy-mins*.03);n.fun=clamp(n.fun-mins*.02)}}}
/* ---------- 11. phone battery & data ---------- */
function phoneInit(){const p=P();if(p.batt==null)p.batt=85;if(p.data==null)p.data=1500}
const onWifi=()=>IS&&['lib','senate','greathall'].includes(IS.bid);
const dataStr=()=>{const p=P();return onWifi()?'📶 WiFi':p.data<=0?'📵 No data':p.data>=1000?'📶 '+(p.data/1000).toFixed(1)+'GB':'📶 '+Math.round(p.data)+'MB'};
function useData(mb,what){phoneInit();if(onWifi())return true;const p=P();if(p.data<mb){toast(`📵 No data for ${what}. Buy a bundle in MoMo, or use the campus WiFi at the library.`);return false}p.data-=mb;if(p.data<150&&!RLS()['dl'+day()]){RLS()['dl'+day()]=1;toast(`📶 Data low: ${Math.round(p.data)}MB left`)}return true}
function chargePlace(){const p=P();return IS&&((IS.kind==='room'&&IS.mine)||GEN_BLD.includes(IS.bid)||(IS.kind==='room'&&!IS.mine))}
/* ---------- the hourly clock ---------- */
function realityHourly(){if(!S||!S.p)return;const r=RLS(),d=day(),h=Math.floor(hour()),key=d*24+h;if(r.lh===key)return;const first=r.lh==null;r.lh=key;if(first)return;const p=P(),sd=sdNow();phoneInit();
  /* 1. light off: announcements */
  const off=lightOff();if(off&&!r.loOn){r.loOn=1;toast('⚡ Light off! ECG has taken the light. Fans stop, no charging. The library and Great Hall have generators.');const m=S.mates[0];if(m&&IS&&IS.mine)setTimeout(()=>toast(`${m.name}: "Ei, dumsor again 😩"`),2500)}
  if(!off&&r.loOn){r.loOn=0;toast('💡 Light is back! "Ayeeee!" 🎉 Everyone cheers.')}
  if(off&&IS&&IS.kind==='room'&&!hasPower())addBuff('hot');
  /* 11. battery & data */
  const charging=chargePlace()&&hasPower();p.batt=clamp(p.batt+(charging?28:-(4+(MUS.phone&&MUS.phone.on?3:0))));
  if(p.batt<=15&&!charging&&!r['lb'+d]){r['lb'+d]=1;toast(`🪫 Phone battery ${Math.round(p.batt)}%. Charge it in your room (if there's light) or at the library.`)}
  if(h===12)p.data=Math.max(0,p.data-30);
  /* 2. water: bucket fetched resets daily */
  /* 3. lecture life */
  if(h===6&&!r['lc'+d]){r['lc'+d]=1;const T=TT[wd()]||[];T.forEach(([c,st])=>{if(rlR(d,10+c)<.14){(r.cancel=r.cancel||{})[d+'|'+c]=1;msg('Class rep',pick([`📢 ${lecturerOf(c)} says there's no ${courseName(c)} lecture today at ${st}:00. He's travelling. Read chapter 3 o.`,`No ${courseName(c)} today! Lecturer has a meeting. Make good use of the time 😅`]))}})}
  /* group assignment */
  if(sd===2&&h===10&&!r['ga'+S.sem]){r['ga'+S.sem]={n:0,due:S.semStart+7};msg('Class rep',`📚 Group assignment for ${courseName(0)}: your group meets at the library. Due ${DAYS[(S.semStart+7)%7]}. Every member must contribute!`);
    const g=S.npcs.filter(n=>n.col===p.col)[0];if(g)setTimeout(()=>msg(g.name,"Chale I'll send my part later, I'm a bit busy 😅"),4000)}
  {const G=r['ga'+S.sem];if(G&&!G.done&&d===G.due&&h===18){G.done=G.n>=2?'ok':'late';msg('Class rep',G.n>=2?'✅ Group assignment submitted. Lecturer was impressed with your part.':'⚠️ Our group assignment was submitted late and incomplete. Marks will be deducted 😬')}}
  /* 4. exam season */
  if(sd===8&&h===9&&!r['es'+S.sem]){r['es'+S.sem]=1;msg('SRC','📖 Exam season! The library is open 24 hours from today. Pasco is at the Campus Bookshop. Sleep a little, eat well. You go pass! 🙏')}
  /* 5. money cycle */
  if(p.money<80&&!r['br'+week()]){r['br'+week()]=1;addBuff('broke');toast('🪙 Broke mode: gari soakings and Indomie until allowance comes. You can cook cheap food in your room.')}
  if(h>=10&&h<=20&&!r['sc'+week()]&&rlR(d*24+h,20)<.05){r['sc'+week()]=1;momoScam()}
  /* 6. admin */
  if(sd===0&&h===14&&!r['reg'+S.sem+'m']){r['reg'+S.sem+'m']=1;msg('Administration',`📋 Course registration closes ${DAYS[(S.semStart+4)%7]} 17:00. Register at the Administration (bring your slip). Late registration attracts a GH₵100 fine.`)}
  if(sd===4&&h===17&&!r['reg'+S.sem]&&!r['regx'+S.sem]){r['regx'+S.sem]=1;p.money-=100;msg('Administration','You missed the registration deadline. GH₵100 late fine has been charged. Please register immediately.')}
  if(sd===12&&h===10&&!r['rs'+S.sem]&&rlR(d,30)<.35){r['rs'+S.sem]='missing';msg('Class rep',"Have you checked your results? Some people's grades are not showing 😩 Go to the Administration if yours is missing.")}
  /* 9. health: malaria (no net), hits in the morning */
  if(h===6&&!r['ml'+d]&&!r.sick&&!p.items.includes('net')){r['ml'+d]=1;const wet=weatherAt?((weatherAt(S.min)||{}).rain||0)>.3:false;if(rlR(d,40)<(wet?.07:.04)){r.sick={k:'malaria',since:d};addBuff('sick');story('<div class="eyebrow">🦟 Morning</div><h3>You wake up with chills and a headache</h3><p class="scene">Your body is weak, your head is pounding. It looks like malaria. Go to the Health Centre for treatment. Next time, sleep under a mosquito net (the pharmacy sells them).</p>',[['Okay','',()=>{}]])}}
  if(r.sick){addBuff('sick');if(d-r.sick.since>=3&&!r.sick.rushed){r.sick.rushed=1;p.money-=80;r.sick=null;const f=bestFriend();story(`<div class="eyebrow">🏥 Health Centre</div><h3>${f?esc(f.name):'Your roommate'} rushed you to the Health Centre</h3><p class="scene">You waited too long. The nurse put you on a drip and gave you medicine. GH₵80 for the treatment. You feel better, but you lost a whole day.</p>`,[['Thank you','',()=>{advance(8*60)}]])}}
  /* 10. departmental week */
  if(sd===5&&h===8&&!r['dj'+S.sem]){r['dj'+S.sem]=1;msg('Class rep',`👕 Departmental week! Today is jersey day, wear your jersey or Hall Week tee. Dinner & awards night is ${DAYS[(S.semStart+6)%7]} 19:00 at the Great Hall (GH₵60). Dress well! 🕺`);if(['jersey','halltee'].includes(p.look.outfit)){p.needs.fun=clamp(p.needs.fun+8);toast('You wore your jersey for jersey day. The whole department is in colours! 🎉')}}
  if(wd()===4&&h===17&&!r['mn'+d]){r['mn'+d]=1;const hb=BID[p.home]&&BID[p.home].hall;msg(hb?'Hall JCR':`${homeB().name} group`,hb?'📣 MORALE NIGHT tonight from 20:30! Come out with your hall colours, drums and vuvuzelas. Oyiii! 🔥':'🎶 Friday night! Gist and music on the balcony from 20:30. Bring your speaker 🔊')}
  /* 8. faith reminders */
  if(wd()===3&&h===16&&!r['fl'+d])r['fl'+d]=1,msg('Fellowship','🙏 Fellowship tonight at the University Chapel, 18:30. Come with a friend!');
  if(wd()===4&&h===11&&!r['jm'+d])r['jm'+d]=1,BID.mosque&&msg('Campus Muslim Students','🕌 Jumu\'ah prayer today at the mosque, 12:30.');
  if(sd===9&&wd()===4&&h===19&&!r['an'+S.sem])r['an'+S.sem]=1,msg('Fellowship','🔥 All-night prayer meeting tonight before exams, 22:00 at the chapel. Bring your Bible and a friend.')}
/* MoMo scam text (5) */
function momoScam(){const amt=pick([350,480,520,650]);msg('MoMo',`Y'ello. You have received GH₵${amt}.00 from KWAME ASANTE. Transaction ID: ${RI(10000000,99999999)}. Your new balance is GH₵${amt+RI(3,40)}.00`);
  setTimeout(()=>{msg('+233 24 •••• 871',`Please my brother/sister, I sent GH₵${amt} to your number by mistake 🙏 It's my school fees. Kindly send it back to me. God bless you.`);
    story(`<div class="eyebrow">📱 MoMo</div><h3>"Please send back my money"</h3><p class="scene">A text says you received GH₵${amt}. Now a stranger is begging you to send it back. Your real MoMo balance is <b>${cedi(P().money)}</b>.</p>`,
      [['🔎 Check my real balance first','g',()=>{RLS().scamWise=(RLS().scamWise||0)+1;S.gems=(S.gems||0)+1;toast(`Your balance never changed. It's a scam! You blocked the number. 💎 +1 for being street-smart`)}],
       [`Send back GH₵${amt}`,'',()=>{const p=P();const lost=Math.min(p.money,amt);p.money-=lost;toast(`😭 You sent ${cedi(lost)}. Your balance had not changed… it was a scam. Always check your balance first.`)}],
       ['Ignore it','',()=>toast('You ignored it. Smart.')]])},3500)}
/* ---------- each frame indoors: no light, no fan ---------- */
function realityTick(dt){if(!IS||!S)return;const dark=!hasPower();IS.dark=dark&&IS.kind==='room';if(IS.dark&&IS.fan)IS.fan.rotation.y-=dt*8}
/* ---------- the action list (outdoors and indoors) ---------- */
function realityActs(list){if(!S||!S.p)return;const p=P(),r=RLS(),inside=!!IS,h=hour();phoneInit();
  /* 5. cheap food in your room when broke (or any time) */
  if(inside&&IS.kind==='room'&&IS.mine){list.push(['🥣 Soak gari with sugar & groundnut · GH₵4',()=>{if(spend(4))doAct('Eating gari soakings',15,{hunger:32,fun:-1})}]);
    list.push([`🍜 Cook Indomie & egg · GH₵10${hasPower()?'':' (gas stove)'}`,()=>{if(spend(10))doAct('Cooking Indomie',20,{hunger:45,fun:4})}]);
    if(h>=21||h<5){const es=sdNow()>=8&&sdNow()<=11;list.push([`🌙 Night cram${hasPower()?'':' by phone torchlight'} (2h)`,()=>{p.study+=hasPower()?(es?14:9):(es?8:5);doAct('Night cramming',120,{energy:-18,fun:-8})}])}
    if(lightOff()&&!hasPower())list.unshift(['⚡ Light off · it\'s hot and dark',null,'go to the library (generator)'])}
  /* 9. sick: reminder */
  if(r.sick)list.unshift([r.sick.k==='malaria'?'🤒 You have malaria · go to the Health Centre':'🤢 Running stomach · get ORS at the pharmacy',null,'get treated'])}
/* building actions (wraps placeActions) */
{const _pa=placeActions;placeActions=function(b,inside){const a=_pa(b,inside);try{rlPlaceActs(b,inside,a)}catch(e){console.error(e)}return a}}
function rlPlaceActs(b,inside,a){if(!b||!S||!S.p)return;const p=P(),r=RLS(),h=hour(),w=wd(),sd=sdNow(),es=sd>=8&&sd<=11;
  /* 2. water */
  if(b.id==='hbath'&&IS&&IS.waterOff){if(r.fetched===day())a.unshift(['🪣 Bucket bath (15m)',()=>{r.fetched=-1;doAct('Taking a bucket bath',15,{hygiene:95,fun:2})},null,'b']);
    else{a.unshift(['🪣 Fetch water from the polytank (15m)',()=>{r.fetched=day();doAct('Fetching water in a bucket',15,{energy:-6});toast('You queue at the polytank and fill your bucket. Now you can bath. 🪣')},null,'b']);a.push(['💧 Buy a bucket of water from the water seller · GH₵3',()=>{if(spend(3)){r.fetched=day();toast('"Ei, today water is gold o!" You got a bucket. 🪣')}}])}}
  /* 3. group assignment */
  const G=r['ga'+S.sem];if(G&&!G.done&&(b.id==='lib'||b.id===p.col)&&inside)a.push([`👥 Work on the group assignment (${G.n}/2 sessions)`,()=>{G.n++;doAct('Working on the group assignment',90,{study:6,social:6,fun:-3});if(G.n===1)setTimeout(()=>toast('Only two people from your group showed up. You did most of the work 😤'),1500)}]);
  /* 4. exam season: library all night */
  if(b.id==='lib'&&inside&&es)a.push(['📚 Night cram in the library (2h)',()=>{p.study+=12;doAct('Cramming in the library',120,{energy:-15,fun:-6,social:3})}]);
  /* 6. administration */
  if(b.id==='senate'&&inside){if(!r['reg'+S.sem])a.unshift(['📋 Register your courses (queue ~1.5h)',()=>{r['reg'+S.sem]=1;doAct('Queueing at the Administration',90,{energy:-8,fun:-8});setTimeout(()=>toast('Finally! "Next!" Your courses are registered. ✅'),1200)},null,'b']);
    if(!r.idc)a.push(['🪪 Collect your student ID card',()=>{r.idc=1;advance(30);toast('Your student ID card is ready. Smile like the photo 😅🪪')}]);
    if(r['rs'+S.sem]==='missing')a.unshift(['📄 Fix your missing results (1h)',()=>{r['rs'+S.sem]='fixed';doAct('Sorting out missing results',60,{fun:-6});setTimeout(()=>toast('The officer found your script. Your grade now shows. Phew 😮‍💨'),1200)},null,'b'])}
  /* 7. hall morale night (Friday nights) for your own hall/hostel */
  if(b.id===p.home&&!inside&&w===4&&h>=20.5&&h<23.9)a.unshift([BID[p.home].hall?'📣 Join the hall morale night (1h)':'🎶 Hostel gist night on the balcony (1h)',()=>{doAct(BID[p.home].hall?'Singing hall chants at morale night':'Gisting with hostel mates',60,{fun:20,social:18,energy:-6});toast(BID[p.home].hall?'"Oyiii!" The whole hall chants, drums and all. Goosebumps 🔥':'Jokes, music and gist till late 😂')},null,'b']);
  /* 8. faith */
  if(b.id==='chapel'){if(w===3&&h>=18&&h<20.5)a.unshift(['🙏 Campus fellowship (1.5h)',()=>{doAct('At fellowship',90,{social:14,fun:8});addBuff('blessed')},null,'b']);
    if(es&&w===4&&(h>=21.5||h<5))a.unshift(['🔥 All-night prayer meeting (3h)',()=>{doAct('At the all-night prayer meeting',180,{social:12,energy:-20});addBuff('blessed');r['ap'+S.sem]=1},null,'b'])}
  if(b.id==='mosque'){if(w===4&&h>=12&&h<14)a.unshift(["🕌 Jumu'ah prayer (1h)",()=>{doAct("At Jumu'ah prayer",60,{social:12,fun:4});addBuff('blessed')},null,'b']);else a.push(['🕌 Pray (20m)',()=>{doAct('Praying at the mosque',20,{fun:3});addBuff('blessed')}])}
  /* 9. health */
  if(b.id==='clinic'&&r.sick&&r.sick.k==='malaria')a.unshift(['🩺 Get treated for malaria · GH₵40 (2h)',()=>{if(!spend(40))return;r.sick=null;S.buffs=(S.buffs||[]).filter(x=>x.k!=='sick');doAct('Getting treated for malaria',120,{energy:10});setTimeout(()=>toast('The nurse gave you antimalarials. Take them for 3 days and rest. 💊'),1200)},null,'b']);
  if(b.id==='pharm'){if(!p.items.includes('net'))a.push(['🦟 Buy a mosquito net · GH₵45',()=>{if(spend(45)){p.items.push('net');toast('Mosquito net bought. Sleep under it, no more malaria worries. 🦟❌')}}]);
    if(r.sick&&r.sick.k==='stomach')a.unshift(['💊 ORS & medicine for your stomach · GH₵20',()=>{if(!spend(20))return;r.sick=null;S.buffs=(S.buffs||[]).filter(x=>x.k!=='sick');doAct('Taking ORS',20,{energy:4})},null,'b'])}
  /* 10. departmental dinner */
  if(b.id==='greathall'&&sd===6&&h>=18.5&&h<23&&!r['dd'+S.sem])a.unshift(['🍽️ Departmental dinner & awards · GH₵60 (3h)',()=>{if(!spend(60))return;r['dd'+S.sem]=1;const smart=['suit','formal','faculty','kente','kaftan','kaba','blazer','smock','friday'].includes(p.look.outfit);
    doAct('At the departmental dinner',180,{fun:24,social:22,hunger:40});if(smart)addBuff('dressed');setTimeout(()=>story(`<div class="eyebrow">🏆 Departmental dinner</div><h3>${smart?'You won Best Dressed!':'What a night!'}</h3><p class="scene">${smart?'They called your name and everybody screamed. You walked up in your outfit like a celebrity. 📸':'Jollof, chicken, a live band and awards for everyone except you 😂 Next year, dress to impress!'}</p>`,[[smart?'🕺 Take a bow':'Next year!','g',()=>{if(smart)S.gems=(S.gems||0)+2}]]),1600)},null,'b'])}
/* ---------- 3. lecture life: cancellations, late lecturers, attendance sheet, surprise quiz ---------- */
{const _lec=lecture;lecture=function(L){const r=RLS(),[c]=L,k=day()+'|'+c;if(r.cancel&&r.cancel[k]){if(!r['cx'+k]){r['cx'+k]=1;P().att[c]++}return toast('The lecture was cancelled today (the class rep sent a message). Use the time to read. 📖')}
  if(rlR(day(),50+c)<.22)setTimeout(()=>toast(`⏳ ${lecturerOf(c)} is 30 minutes late… everyone is on their phones.`),1200);return _lec(L)}}
{const _ld=lectureDone;lectureDone=function(c,st,late){_ld(c,st,late);const d=day();setTimeout(()=>toast('📝 The attendance sheet came round. You signed. ✍️'),2200);
  if(rlR(d,60+c)<.16)setTimeout(()=>{const q=quizQuestions(P().col)[0];story(`<div class="eyebrow">📝 Surprise quiz · ${esc(courseName(c))}</div><h3>${esc(q.q)}</h3><p class="scene">"Bring out a sheet. One question, two minutes!"</p>`,q.opts.map((o,i)=>[o,'',()=>{const X=S.quizX=S.quizX||{},k=c+'|'+S.sem,e=X[k]||(X[k]={right:0,n:0,bonus:0});e.n++;if(i===q.a){e.right++;e.bonus+=2;toast('✅ Correct! The lecturer nods. +2 towards your exam.')}else toast(`❌ Wrong. The answer was "${q.opts[q.a]}".`)}]))},3600)}}
/* ---------- 4. the cheat-sheet temptation before an exam, and reality lines in the exam score ---------- */
{const _eq=examQuiz;examQuiz=function(c,st){const r=RLS(),k='ch'+c+'|'+S.sem;if(r[k]===undefined&&rlR(day(),70+c)<.5){r[k]=null;
    return story(`<div class="eyebrow">📝 Outside the exam hall</div><h3>A coursemate whispers: "I have a microchip. You want a copy?"</h3><p class="scene">A tiny folded cheat sheet with formulas. Invigilators are walking around. If you're caught, it's a disciplinary case.</p>`,
      [['No, I trust my preparation','g',()=>{r[k]='no';_eq(c,st)}],['Take it 🤫','',()=>{r[k]=Math.random()<.3?'caught':'used';_eq(c,st)}]])}return _eq(c,st)}}
{const _es=examScore;examScore=function(c,late){const o=_es(c,late),r=RLS(),add=(t,v)=>{o.lines.push([t,v]);o.score=Math.round(clamp(o.score+v))};
  const ch=r['ch'+c+'|'+S.sem];if(ch==='used')add('Used a cheat sheet (not caught… this time)',6);if(ch==='caught'){o.lines.push(['Caught with a cheat sheet: paper cancelled',-o.score]);o.score=0;setTimeout(()=>msg('Exams Office',`You were caught with unauthorised material in the ${courseName(c)} exam. Your paper has been cancelled and you will appear before the disciplinary committee.`),1500)}
  const G=r['ga'+S.sem];if(c===0&&G&&G.done)add(G.done==='ok'?'Group assignment done well':'Group assignment late / incomplete',G.done==='ok'?4:-4);
  if(r.sick)add('Wrote the exam while sick',-6);if(r['ap'+S.sem])add('Prayed all night before exams (tired but calm)',1);return o}}
/* ---------- 9. food poisoning from cheap roadside food ---------- */
{const _e=eat;eat=function(cost,food,name,fun){const before=P().money;_e(cost,food,name,fun);if(P().money<before&&cost<=20&&!RLS().sick&&Math.random()<.03){RLS().sick={k:'stomach',since:day()};setTimeout(()=>{addBuff('sick');toast('🤢 Ei… your stomach is running after that food. Get ORS at the pharmacy.')},4000)}}}
/* ---------- 11. phone: battery dead, data for apps ---------- */
{const _ph=phone;phone=function(tab){phoneInit();if(P().batt<=0){S.paused=true;openSheet();$('sheetIn').innerHTML=`<div class="phOut"><button class="ghost sm" id="bye">Close</button></div><div class="ph"><div style="min-height:420px;display:grid;place-items:center;text-align:center;padding:30px;background:#000"><div><div style="font-size:54px">🪫</div><p style="opacity:.8">Your phone is dead.<br>Charge it in your room (when there's light) or at the library.</p></div></div></div>`;$('bye').onclick=closeSheet;return}return _ph(tab)}}
{const w=(name,mb,what)=>{const f=window[name];if(typeof f!=='function')return;window[name]=function(){if(!useData(mb,what))return;return f.apply(this,arguments)}};
  w('feedSheet',25,'the Campus Feed');w('callRide',3,'booking a ride');w('orderFood',3,'ordering food');
  const ms=musSongs;musSongs=function(kind){if(kind==='phone'&&!useData(15,'streaming music'))return;return ms(kind)}}
{const _h=hourly;hourly=function(){const r=_h.apply(this,arguments);try{realityHourly()}catch(e){console.error(e)}return r}}
/* 2. water helper for private bathrooms in rooms */
function rlWaterActs(a){const r=RLS();if(r.fetched===day())a.unshift(['🪣 Bucket bath (15m)',()=>{r.fetched=-1;doAct('Taking a bucket bath',15,{hygiene:95,fun:2})},null,'b']);
  else{a.unshift(['🪣 Fetch water from the polytank (15m)',()=>{r.fetched=day();doAct('Fetching water in a bucket',15,{energy:-6});toast('You fill your bucket at the polytank. Now you can bath. 🪣')},null,'b']);a.push(['💧 Buy a bucket of water · GH₵3',()=>{if(spend(3)){r.fetched=day();toast('You bought a bucket of water. 🪣')}}])}}
/* 11. data bundles (MoMo app) */
function bundleHTML(){phoneInit();const p=P();return `<h3 style="margin-top:12px">📶 Data bundles</h3><p style="font-size:13px;margin:0 0 6px">You have <b>${p.data>=1000?(p.data/1000).toFixed(1)+'GB':Math.round(p.data)+'MB'}</b> · battery ${Math.round(p.batt)}%. Campus WiFi is free at the library.</p><div class="row">${[[5,400],[10,1000],[20,2500]].map(([c,mb])=>`<button class="ghost sm" data-bun="${c}|${mb}">${mb>=1000?mb/1000+'GB':mb+'MB'} · GH₵${c}</button>`).join('')}</div>`}
function bundleWire(redraw){document.querySelectorAll('[data-bun]').forEach(b=>b.onclick=()=>{const [c,mb]=b.dataset.bun.split('|').map(Number);if(!spend(c))return;P().data+=mb;toast(`📶 ${mb>=1000?mb/1000+'GB':mb+'MB'} data bundle activated.`);redraw&&redraw()})}
