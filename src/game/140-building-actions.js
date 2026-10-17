/* ================= places ================= */
function placeActions(b,inside){
  const p=P(),h=hour(),w=wd(),a=[];
  if(!b)return a;
  if(b.id==='club'&&!inside){const open=h>=20||h<3,paid=S.clubPaid===clubNight();a.push([paid?'Go back inside Club Vibes':'Enter Club Vibes · GH₵30',open?()=>{if(!paid){if(!spend(30))return;S.clubPaid=clubNight()}enterBuilding('club')}:null,open?null:'open 20:00–03:00','b']);return a}
  if(b.deco){if(!inside&&BLD[b.id])a.push([`Go inside ${b.name}`,()=>enterBuilding(b.id),null,'b']);({phonehub:[['📶 Buy a data bundle · GH₵10',()=>{if(spend(10))doAct('Scrolling TikTok on fresh data',20,{fun:10,social:6})}],['🔧 Fix a cracked phone screen · GH₵120',()=>{if(spend(120)){doAct('Waiting for your phone screen to be fixed',40,{});setTimeout(()=>toast('Phone screen fixed. It looks brand new 📱'),2700)}}]],
      pharm:[['💊 Buy painkillers · GH₵15',()=>{if(spend(15))doAct('Taking painkillers',5,{energy:8,fun:2})}],['🧴 Buy toiletries · GH₵25',()=>{if(spend(25)){p.needs.hygiene=clamp(p.needs.hygiene+10);toast('Soap, sponge, toothpaste and deodorant. Fresh! 🧼');hud()}}]],
      shawarma:[['🌯 Shawarma · GH₵55',()=>eat(55,50,'shawarma')],['🍕 Pizza slice & Coke · GH₵45',()=>eat(45,45,'pizza',8)]],
      books:[['📘 Past questions booklet · GH₵30',S.pq===S.sem?null:()=>{if(!spend(30))return;S.pq=S.sem;doAct('Going through past questions',60,{study:8})},S.pq===S.sem?'bought this semester':null],['📗 Buy a novel · GH₵40',()=>{if(spend(40))doAct('Reading a novel',60,{fun:15,energy:4})}]],
      pavilion:[['🏟️ Watch training from the stands (30m)',()=>doAct('Watching training from the stands',30,{fun:8,energy:4})]],
      hall:[['🏐 Watch an inter-college volleyball match (1h)',()=>{doAct('Watching volleyball at the sports hall',60,{fun:16,social:8});meetRandom('hall')}]],
      heights:[['🏢 Private hostel · residents only',null]],kotei:[['🏢 Private hostel · residents only',null]],
      senate:[['📄 Collect your course registration slip',()=>{advance(20);toast(`Registry: ${p.prog}, ${COLLEGES[p.col].name}. Lectures and exams are in ${BID[p.col].name}. 📄`)}],['📜 Check your academic record',()=>{advance(10);toast(`Attendance ${p.att.join('/')} · Grade forecast ${forecast()}${S.sem>1?' · Semester '+S.sem:''}`)}]],
      greathall:[['🎤 Attend a public lecture (1h)',()=>doAct('Listening to a public lecture at the Great Hall',60,{fun:6,social:5})]]}[b.id]||[]).forEach(x=>a.push(x));return a}
  if(!b.open&&!b.home&&!inside){a.push([`Go inside ${b.name}`,()=>enterBuilding(b.id),null,'b']);if(b.id==='bank'||b.id==='unity')a.push(['🏧 Use the ATM',()=>atm()]);
    if(['canteen','mall'].includes(b.id)||COLLEGES[b.id]){if(p.flyers>=10)a.push(['Share 10 flyers',()=>shareFlyers(b),null,'b']);if(p.race&&!p.race.done)a.push(['Hold a campaign rally (45m)',()=>rally(b),null,'b'])}
    if(b.id===p.col&&examNow())a.push([`📝 Your ${courseName(examNow()[2])} exam is on now · go inside`,null]);else if(b.id===p.col&&lectureNow())a.push([`📚 Your ${courseName(lectureNow()[0])} lecture is on now · go inside`,null]);else if(b.id===p.col)a.push(['🎓 Your college',null,nextLecture()]);return a}
  if(b.id===p.home)a.push([`Enter your room (${roomOf().name})`,()=>enterRoom('me'),null,'b']);
  if(b.home&&typeof MP!=='undefined'&&MP.campus)visitList().filter(([ck,v])=>v.home===b.id).forEach(([ck,v])=>a.push([`🚪 Go to ${v.nm}'s room 🌐`,()=>visitEnter(ck),null,'b']));
  if(b.home){const fr=S.npcs.filter(n=>n.home===b.id&&!n.mate&&n.friend>=30),vh=hour()>=8&&hour()<22;fr.forEach(n=>{const ok=n.visitOK===day(),pt=P().partner===n;if(ok)a.push([`🚪 Go to ${n.name}'s room`,vh||pt?()=>visitRoom(n):null,vh||pt?`${n.name} said yes`:'visiting hours 08–22','b']);else if(n.visitNo===day())a.push([`${n.name} said not today`,null]);else if(n.contact)a.push([`📱 Text ${n.name}: "Can I come over?"`,vh||pt?()=>askVisitText(n):null,vh||pt?null:'visiting hours 08–22']);else a.push([`Ask ${n.name} in person to visit`,null,'get their number first'])});if(b.id!==p.home&&!fr.length)a.push(['🔒 Residents only',null,`make friends (30+) with someone who lives here to visit`])}
  if(b.id===p.home&&!inside)a.push(['📱 Invite a friend over',()=>inviteSheet()]);
  if(b.id===p.home&&!inside){const rt=roomOf();if(!rt.kitchen)a.push(['🍳 Shared kitchen',()=>enterBuilding('hkitchen')])}
  if(b.id==='hkitchen')a.push(['🍳 Cook something',()=>cookSheet('kitchen'),null,'b']);
  if(b.id==='hbath'){const wOff=IS&&IS.waterOff;a.push([wOff?'Shower (no water today 😩)':'Take a shower (20m)',wOff?null:()=>doAct('Taking a shower',20,{hygiene:100,fun:5,energy:4})]);
    if(p.home==='lodge')a.push(['Bucket bath with poly tank water (30m)',()=>doAct('Bucket bath with water from the poly tank',30,{hygiene:90,energy:-3})]);
    if(IS&&IS.spots.tub)a.push(['Soak in the bathtub (45m)',()=>doAct('Relaxing in the bathtub',45,{hygiene:100,fun:15,energy:10})]);
    a.push(['Brush & freshen up (10m)',()=>doAct('Brushing and freshening up',10,{hygiene:20})])}
  if(b.id==='club'&&inside)a.push(['🎧 See the DJ\'s set',()=>djSongs()]);
  if(b.id==='club'&&inside){a.push(['💃 Dance (1h)',()=>{S.clubDay=clubNight();doAct('Dancing at the club',60,{fun:30,social:15,energy:-15,hygiene:-10});meetRandom('club')},null,'b']);
    a.push(['Buy a drink at the bar · GH₵20',()=>{if(spend(20))doAct('Having a drink at the bar',20,{fun:8,hunger:3})}]);
    a.push(['Chill in the lounge (30m)',()=>doAct('Chilling in the lounge',30,{energy:6,social:6,fun:5})]);
    a.push(['📣 Ask the DJ for a shout-out · GH₵10',()=>{if(!spend(10))return;p.needs.fun=clamp(p.needs.fun+8);toast(`DJ Kwaku Flames: "Shout out to ${p.name==='You'?'my fresher':p.name}! This one's for you!" 🎧🔥`)}])}
  if(b.id==='market'){if(h>=6&&h<19){a.push(['🧺 Buy foodstuff',()=>marketSheet(),null,'b']);a.push(['Buy a provisions pack · GH₵50',()=>{if(!spend(50))return;p.prov+=6;doAct('Buying foodstuff at the market',15,{})}])}else a.push(['Market closed (06:00–19:00)',null])}
  if(b.id==='pool'&&h>=6&&h<19&&typeof MP!=='undefined'&&MP.campus)sgRealHere('pool').slice(0,3).forEach(rp=>a.push([`🏊 Race ${rp.nm} (real student)`,()=>sgInvite(rp,'sw'),null,'b']));
  if(b.id==='pool'){if(h>=6&&h<19){const free=p.home==='royal';a.push([free?'🏊 Swim (45m, free for Royal Crest)':'🏊 Swim (45m) · GH₵15',()=>{if(!free&&!spend(15))return;p.fit++;doAct('Swimming',45,{fun:22,energy:-10,hygiene:8});meetRandom('pool')},null,'b']);a.push(['Chill by the pool (30m)',()=>doAct('Chilling by the pool',30,{fun:10,energy:5})])}else a.push(['Pool closed (06:00–19:00)',null])}
  if(b.id==='parade'){const ev=eventNow();
    if(!ev){const nx=nextEvent();a.push(['No event right now',null,nx?`Next: ${nx.name}, ${DAYS[(S.semStart+nx.sd)%7]} ${hm(nx.from*60)}`:'SRC Week is over this semester']);
      a.push(['Hang out on the grounds (30m)',()=>{doAct('Hanging out on the parade grounds',30,{social:10,fun:8});meetRandom('parade')}]);a.push(['Jog laps (30m)',()=>{p.fit++;doAct('Jogging laps of the parade grounds',30,{fun:10,energy:-8,hygiene:-8})}])}
    else if(ev.id==='fair'){a.push(['🎪 Visit the club stands',()=>clubFair(),null,'b'])}
    else if(ev.id==='jama'){a.push(['🥁 Join the jama health walk (1h)',()=>{doAct('Jama health walk',60,{fun:22,social:15,energy:-12,hygiene:-10});meetRandom('parade')},null,'b'])}
    else if(ev.id==='games'){a.push(['🏆 Tug of war for your hostel (30m)',()=>hostelGame('tug'),null,'b']);a.push(['Sack race (30m)',()=>hostelGame('sack')]);a.push(['Cheer for your hostel (30m)',()=>{doAct('Cheering at the hostel games',30,{fun:15,social:10})}])}
    else if(ev.id==='bazaar'){a.push(['🍢 Kebab & sobolo · GH₵25',()=>eat(25,35,'kebab & sobolo at the bazaar',10),null,'b']);a.push(['👑 Watch Mr & Miss Freshers (1h)',()=>{doAct('Watching the Mr & Miss Freshers pageant',60,{fun:20,social:10});meetRandom('parade')}]);
      if(p.biz&&!BIZ[p.biz.type].service&&p.biz.stock>0)a.push(['💼 Sell at the bazaar (2h)',()=>{const z=p.biz,bz=BIZ[z.type],n=Math.min(z.stock,RI(5,12)),pay=n*bz.sell[z.price];z.stock-=n;z.sold+=n;z.earned+=pay;p.money+=pay;z.rep=clamp(z.rep+3);doAct('Selling at the bazaar',120,{social:12,energy:-8});setTimeout(()=>toast(`Bazaar sales: ${n} ${bz.label} · +${cedi(pay)} 💸`),3000)}])}
    else if(ev.id==='concert'){const tk=myTicket(),art=ARTISTS[curArtist()];
      if(!tk){a.push(['🎟️ Ticket at the gate · GH₵60',()=>{if(spend(60)){S.ticket={sem:S.sem,vip:false};toast('Ticket scanned. Enjoy the show! 🎤');acts(true)}},null,'b']);a.push(['🎟️ VIP at the gate · GH₵180',()=>{if(spend(180)){S.ticket={sem:S.sem,vip:true};toast('VIP wristband on. Front of the stage! ✨');acts(true)}}])}
      else{a.push([`🎤 Watch ${art.name} (1h)`,()=>watchConcert(),null,'b']);
        a.push(['📱 Record it for your status',()=>{doAct('Recording the show for your status',10,{social:10,fun:5});setTimeout(()=>{const f=bestFriend();if(f&&f.met)msg(f.name,pick([`Ei! You're at the concert?? ${art.name} 🔥🔥`,'Your status is giving me FOMO 😭 save me a spot!']))},3500)}]);
        if(tk.vip&&curSlot()===2&&S.metStar!==S.sem)a.push(['✨ VIP meet & greet backstage',()=>meetStar(),null,'b'])}}}
  if(b.id==='square'&&fnight())a.push(["Join Freshers' Night! 🎉",()=>freshersNight()]);
  if(b.id==='square'&&p.race&&!p.race.done&&day()-S.semStart===7&&h>=17&&h<19&&!p.race.manifesto)a.push(['Read your manifesto 🎤',()=>manifesto()]);
  if(b.id===p.col&&inside){const L=TT[w]&&TT[w].find(([c,st])=>h>=st-.5&&h<=st+.75);if(L)a.push([`Attend ${courseName(L[0])} (${lecturerOf(L[0])})`,()=>lecture(L)]);else a.push(['No lecture now',null,nextLecture()]);
    const ex=examNow();if(ex&&inside){const [ed,est,ec]=ex,done=p.exams&&p.exams[ec];a.unshift([done?`✅ ${courseName(ec)} exam done`:`📝 Write the ${courseName(ec)} exam (2h)`,done?null:()=>examQuiz(ec,est),null,'b'])}
    else if(ex)a.push([`📝 ${courseName(ex[2])} exam is on now · go inside`,null]);
    if(inside&&!ex)[0,1].forEach(li=>{const nm=li?BADLEC:GOODLEC,ln=lectureNow(),teaching=ln&&lecturerOf(ln[0])===nm,open=w<5&&h>=10&&h<16&&!teaching;
      a.push([`🚪 Visit ${nm}'s office`,open?()=>{S.lecIdx=li;enterBuilding('lecoff')}:null,open?null:teaching?'teaching now':'office hours Mon–Fri 10:00–16:00'])})}
  if(COLLEGES[b.id]&&inside&&!lectureNow()&&!examNow()){const mine=p.col===b.id,okT=w<5&&h>=10&&h<16;
    a.push([mine?'📚 Study in the reading room (2h, +11)':'📚 Study here (2h, +8)',()=>doAct('Studying in the college reading room',120,{study:mine?11:8,energy:-10,fun:-6}),null,'b']);
    if(mine)a.push(['👥 Departmental tutorial (1h)',okT?()=>{doAct('Departmental tutorial',60,{study:6,social:6});S.npcs.filter(n=>n.prog===p.prog).forEach(n=>{n.met=true;n.friend=clamp(n.friend+3)})}:null,okT?null:'Mon–Fri 10:00–16:00']);
    a.push(['📌 Read the notice board',()=>{advance(5);toast(mine?pick([`Notice: Exam timetable: ${EXAMS.map(([ed,eh,c])=>courseName(c)+' '+DAYS[(S.semStart+ed)%7]).join(', ')}.`,'Notice: Past questions are on sale at the Campus Bookshop 📘','Notice: Departmental football gala on Saturday at the Sports Field ⚽']):`Notice: ${COLLEGES[b.id].name} welcomes all visitors. Keep quiet in the reading room.`)}])}
  if((b.id==='bank'||b.id==='unity')&&inside){const open=(w<5&&h>=8&&h<16)||(w===5&&h>=9&&h<13),hrs='banking hours Mon–Fri 08–16, Sat 09–13';
    if(!p.acct)a.push(['🏦 Open a student savings account',open?()=>{p.acct=b.id;p.savings=0;doAct('Opening a bank account',30,{});setTimeout(()=>toast(`${b.name}: Your student account is open. You earn 1.5% interest every week 🏦`),2900)}:null,open?null:hrs,'b']);
    else if(p.acct===b.id){a.push([`💰 Deposit (savings ${cedi(p.savings)})`,open?()=>bankSheet('dep'):null,open?null:hrs,'b']);a.push(['💵 Withdraw from savings',open?()=>bankSheet('wd'):null,open?null:'use the ATM'])}
    else a.push([`Your account is at ${BID[p.acct].name}`,null]);
    a.push(['🏧 Use the ATM',()=>atm()])}
  if(b.id==='lecoff'){const li=S.lecIdx||0,nm=li?BADLEC:GOODLEC,with_=IS&&IS.buddy;
    const ofv=()=>{S.offv=S.offv||{};(li?[1]:[0,2]).forEach(c=>S.offv[c]=(S.offv[c]||0)+1)};
    a.push(['❓ Ask questions about the course (30m)',()=>ofv()||doAct('Asking questions in the office',30,{study:(li?4:7)+(with_?2:0)}),null,'b']);
    a.push(['📝 Get help with your assignment (1h)',()=>ofv()||doAct('Getting help in the office',60,{study:(li?6:11)+(with_?2:0),energy:-5})]);
    a.push(['📊 Ask how you\'re doing',()=>{const f=forecast();advance(10);toast(`${nm}: "${f>=70?'You are doing very well. Keep it up!':f>=55?'You are average. Attend every lecture and read your handouts.':'You are struggling. Come to office hours every week and join a study group.'}" (forecast ${f})`)}])}
  if(b.id==='lib'){a.push(['Study (2h, +10)',()=>doAct('Studying at the library',120,{study:10,energy:-10,fun:-8})]);if(p.job==='tutor'&&h>=15&&h<20)a.push(['Tutor a junior (2h, +GH₵100)',()=>work(120,100,'Tutoring')])}
  if(b.id==='canteen'){if(h>=7&&h<20){a.push(['Waakye with egg · GH₵30',()=>eat(30,45,'Waakye with egg')]);a.push(['Banku & tilapia · GH₵60',()=>eat(60,70,'Banku & tilapia')]);a.push(['Kenkey & fish · GH₵25',()=>eat(25,40,'Kenkey & fried fish')])}else a.push(['Closed (opens 07:00)',null])}
  if(b.id==='night'){if(h>=18||h<1){a.push(['Indomie & egg · GH₵30',()=>eat(30,45,'Indomie & egg')]);a.push(['Kelewele · GH₵15',()=>eat(15,20,'Kelewele',8)]);a.push(['Fried rice & chicken · GH₵55',()=>eat(55,65,'Fried rice & chicken')]);
      if(p.job==='stall'&&h>=18&&h<21)a.push(["Work at Auntie Esi's stall (3h, +GH₵80)",()=>work(180,80,'Serving at the stall',{hunger:30})])}else a.push(['Stalls open at 18:00',null])}
  if(b.id==='print'){if(h>=8&&h<18){a.push(['Print lecture handouts · GH₵10',()=>{if(p.printed===day())return toast('You already printed today\'s handouts.');if(!spend(10))return;p.printed=day();p.study+=4;toast('Handouts printed. Study +4')}]);
      a.push(['Print 50 flyers · GH₵25',()=>{if(!spend(25))return;p.flyers+=50;p.flyersFor=p.race&&!p.race.done&&!p.biz?'race':p.flyersFor;doAct('Printing flyers',20,{});toast(`50 flyers printed. You have ${p.flyers}.`)}]);
      if(p.race&&!p.race.done)a.push(['Print campaign posters · GH₵40',()=>{if(!spend(40))return;p.race.posters++;doAct('Printing and pasting posters',40,{energy:-5});toast(`Your face is on ${p.race.posters*20} noticeboards now. 🗳️`)}]);
      if(p.job==='print'&&h<17&&w<5)a.push(['Work a shift (3h, +GH₵60)',()=>work(180,60,'Typing and printing')])}else a.push(['Closed (08:00–18:00)',null])}
  if(['night','square','field','court','parade'].includes(b.id)){if(p.flyers>=10)a.push(['Share 10 flyers',()=>shareFlyers(b),null,'b']);if(p.race&&!p.race.done)a.push(['Hold a campaign rally (45m)',()=>rally(b),null,'b'])}
  if(b.id==='court')a.push(['🏀 Play basketball (1h)',()=>sportAsk('basketball')]);
  if(b.id==='night'&&(h>=18||h<1))a.push(['Buy a chilled Malta · GH₵10',()=>{if(!spend(10))return;doAct('Having a drink',15,{fun:6,hunger:5})}]);
  if(b.id==='square')a.push(['Sit on a bench (30m)',()=>doAct('Sitting on a bench',30,{fun:6,energy:5})]);
  try{hallWeekActs(b,a)}catch(e){console.error(e)}
  if(b.id==='field'){a.push(['⚽ Play football (1h)',()=>sportAsk('football')]);a.push(['Jog (30m)',()=>{p.fit++;doAct('Jogging',30,{fun:10,energy:-8,hygiene:-8})}])}
  if(b.id==='garden')a.push(['Relax by the pond (1h)',()=>doAct('Relaxing in the garden',60,{fun:18,energy:6})]);
  if(b.id==='lake')a.push(['Walk around the lake (1h)',()=>doAct('Walking by the lake',60,{fun:20,energy:4})]);
  if(b.id==='square'&&!fnight())a.push(['Hang out at the square (1h)',()=>{doAct('Hanging out at Akwaaba Square',60,{social:18,fun:12});meetRandom('square')}]);
  if(b.id==='office'){const cE=EVENTS.find(e=>e.id==='concert');if(day()-S.semStart<=cE.sd&&!myTicket())a.push(['🎟️ SRC Week concert tickets',()=>ticketSheet(),null,'b']);if(srcOn())a.push(['🗳️ SRC election (real students)',()=>srcSheet(),null,'b']);a.push([srcOn()?'🗳️ Course rep & college elections':'🗳️ Elections',()=>elections(),null,'b']);a.push(['💼 Business desk',()=>bizStart(),null,'b']);a.push(['Job board',()=>jobBoard()]);a.push(['Housing desk',()=>housing()]);a.push(['💰 Loans & bursaries',()=>finance()]);
    a.push(['Talk to a counsellor (30m)',()=>{doAct('Talking with a counsellor',30,{fun:8,social:5});toast('"University is a lot. Sleep, eat, and ask for help early." 💬')}]);
    if(S.flags.hx===1&&!S.flags.reported)a.push(['Report harassment confidentially',()=>report()])}
  if(b.id==='chapel'){if(w===6&&h>=8.5&&h<12)a.push(['Attend Sunday service (2h)',()=>{doAct('At Sunday service',120,{social:20,fun:10,energy:4});S.npcs.filter(n=>n.ints.includes('Church')).forEach(n=>{n.met=true;n.friend=clamp(n.friend+5)});toast('The choir was 🔥. You met the church crowd. Friendship +5')}]);else a.push(['Pray quietly (20m)',()=>doAct('Quiet time in the chapel',20,{fun:6,energy:3})])}
  if(b.id==='clinic'){a.push(['See the nurse (1h, free)',()=>{doAct('Check-up at the Health Centre',60,{energy:15});toast('Nurse: "You need more sleep and real food, not just indomie." 🩺')}]);a.push(['Buy multivitamins · GH₵25',()=>{if(spend(25))doAct('Taking vitamins',5,{energy:10})}])}
  if(b.id==='gym'){if(h>=6&&h<21)a.push(['Run on the treadmill (30m)',()=>{p.fit++;doAct('Treadmill run',30,{fun:8,energy:-10,hygiene:-8})}]);if(h>=6&&h<21)a.push([p.home==='royal'?'Work out (free for Royal Crest)':'Work out (1h) · GH₵10',()=>{if(p.home!=='royal'&&!spend(10))return;p.fit+=2;doAct('Working out',60,{fun:15,energy:-15,social:5,hygiene:-12});meetRandom('gym')}]);else a.push(['Closed (06:00–21:00)',null])}
  if(b.id==='mall'){if(h>=9&&h<21){a.push(['Shop at the mall',()=>mall()]);if(p.biz&&!BIZ[p.biz.type].service)a.push([`Buy stock here (pricier) · ${cedi(Math.round(BIZ[p.biz.type].unit*1.35)*BIZ[p.biz.type].pack)}`,()=>buyStock('mall')])}else a.push(['Closed (09:00–21:00)',null])}
  if(b.id==='salon'){if(h>=8&&h<20)a.push([p.look.gender==='f'?'Get your hair done':'Get a haircut',()=>salon()]);else a.push(['Closed (08:00–20:00)',null])}
  if(b.id==='taxi')a.push(['🚕 Take a taxi',()=>taxiMenu(),null,'b']);
  if(b.id==='terminal'){a.push(['See the shuttle route',()=>story(`<div class="eyebrow">Campus Shuttle Terminal</div><h3>Free shuttles, all day</h3><p class="scene">Two buses loop around campus and stop at every 🚌 shelter. Walk to any shelter and wait.</p><p>${SH_STOPS.map(x=>esc(x.name)).join(' → ')} → back again</p>`,[['Got it','g',()=>{}]])]);a.push(['Sit on a bench at the terminal (30m)',()=>doAct('Sitting on a bench at the terminal',30,{energy:6,fun:3})])}
  if(b.id==='trotro'){a.push(['Trotro to Madina Market: provisions (3h)',()=>{if(!spend(14+50))return;p.prov+=8;doAct('Shopping at Madina Market',180,{fun:15,energy:-12});toast('Bought 8 provisions for GH₵50. Fare GH₵14.')}]);
    if(p.biz&&!BIZ[p.biz.type].service)a.push([`Buy business stock at Madina · ${cedi(BIZ[p.biz.type].unit*BIZ[p.biz.type].pack)}`,()=>buyStock('madina')]);
    if(w===5&&h<14)a.push(['Go home for the weekend',()=>goHome()])}
  return a;
}
function nextLecture(){for(let k=0;k<7*48;k++){const m=S.min+k*30,d=Math.floor(m/1440)%7,h=(m%1440)/60,L=TT[d]&&TT[d].find(([c,st])=>Math.abs(h-st)<.01);if(L)return `Next: ${courseName(L[0])}, ${DAYS[d]} ${String(L[1]).padStart(2,'0')}:00`}return ''}
function spend(n){if(P().money<n){toast(`Not enough on MoMo (${cedi(P().money)}).`);return false}P().money-=n;return true}
function eat(cost,food,name,fun=4){if(!spend(cost))return;doAct(`Eating ${name}`,25,{hunger:food,fun})}
function buffFromAct(l,fx){if(/shower|bath/i.test(l))addBuff('fresh');if(/^eating|cooking/i.test(l)&&(fx.hunger||0)>=30)addBuff('fed');if(/concert|watch .*(show|perform)/i.test(l))addBuff('inspired');if(/tidying/i.test(l))addBuff('tidy');if(fx&&fx.study>=8)addBuff('studied');if(/vibing|music|club|dancing/i.test(l))addBuff('music')}
function applyAct(label,mins,fx){const p=P();const timed=S.timedDone;try{buffFromAct(label,fx||{})}catch(e){}S.timedDone=false;if(!timed)advance(mins);try{ev('act',{l:label,mins,fx})}catch(e){}
  if(timed){if(IS&&IS.mine&&/eating|cooking|fifa|cold drink/i.test(label))p.mess=clamp((p.mess||0)+4);toast(`✓ ${label}`+(fx.study?` · Study +${Math.round(fx.study*moodInfo().study)}`:''));hud();acts(true);return}
  if(IS&&IS.mine&&/eating|cooking|fifa|cold drink/i.test(label))p.mess=clamp((p.mess||0)+4);Object.entries(fx).forEach(([k,v])=>{if(k==='study')p.study+=v;else p.needs[k]=clamp(p.needs[k]+v)});
  toast(`${label} · ${mins>=60?(mins/60)+'h':mins+'m'}`+(fx.study?` · Study +${fx.study}`:''));hud();acts(true)}
function work(mins,pay,label,fx={}){P().money+=pay;doAct(label,mins,Object.assign({energy:-18,fun:-6},fx));toast(`${label} · earned ${cedi(pay)} 💸`)}
function sleep(){const h=hour();if(!(h>=20||h<5))return toast('It\'s too early to sleep. Take a nap instead.');
  if(sharedClock()){const until=Math.round((h>=20?24-h+6:6-h)*60);startBusy('Sleeping',{pose:'lie',spot:IS&&IS.spots.bed,mins:until,fx:{energy:Math.round(70*roomMult())}},0,()=>{try{addBuff('rested')}catch(e){}toast('☀️ Good morning! Everyone on campus woke up to the same sunrise.')});return}
  startBusy('Sleeping',{pose:'lie',spot:IS&&IS.spots.bed},3200,sleepNow)}
function sleepNow(){const p=P(),h=hour();
  if(h>=20||h<5){const target=(h>=20?(day()+1)*1440:day()*1440)+6*60;const mins=target-S.min;S.min=target;const n=p.needs;
    S.lastSleep={day:day(),h:mins/60};try{ev('sleep',mins/60);addBuff(mins/60>=7?'rested':mins/60<5?'groggy':'')}catch(e){}const q=roomMult()*(p.items.includes('fan')&&!roomOf().ac?1.12:1);n.energy=clamp(55+45*q);n.hunger=clamp(n.hunger-mins*.03);n.social=clamp(n.social-(S.mates.length?2:10));n.fun=clamp(n.fun-5);n.hygiene=clamp(n.hygiene-8);hourly();
    toast(q<.8?`You slept, but ${S.mates[0]?S.mates[0].name+' was on the phone till 2am':'it was noisy'}. Energy ${Math.round(n.energy)} 😴`:`You slept well. Good morning! ☀️ Energy ${Math.round(n.energy)}`);refreshRoom()}
  else toast('It\'s too early to sleep. Take a nap instead.')}
function nap(){doAct('Taking a nap',120,{energy:Math.round(30*roomMult())})}
function meetRandom(where){const n=pick(S.npcs.filter(n=>n.plan&&n.plan.b===where))||pick(S.npcs);if(!n)return toast(NOBOTS?'🌐 No one else is around yet. Real students will show up as they join your campus.':'Nobody around right now.');n.met=true;n.friend=clamp(n.friend+5);toast(`You got talking with ${n.name}. Friendship +5`)}
function freshersNight(){if(S.fnDone)return toast('You already partied tonight. Your legs need rest. 😅');S.fnDone=true;advance(180);const p=P();p.needs.fun=100;p.needs.social=clamp(p.needs.social+40);p.needs.energy=clamp(p.needs.energy-25);
  const met=shuffle(S.npcs).slice(0,4);met.forEach(n=>{n.met=true;n.friend=clamp(n.friend+10)});
  story(`<div class="eyebrow">Freshers' Night · Akwaaba Square</div><h3>The whole campus is outside. 🔥</h3><p class="scene">The DJ plays back-to-back Afrobeats and amapiano. Every hostel chants its name when the bass drops. You dance with ${met.slice(0,3).map(n=>n.name).join(', ')} and ${met[3].name} until the SRC president begs everyone to go home.</p><p>Fun maxed · 4 new friendships</p>`,[['What a night','g',()=>{}]])}
function goHome(){const p=P();const t=(day()+1)*1440+18*60;S.min=t;S.lastHour=-1;
  const gift={rich:600,avg:150,poor:40}[p.bg];p.needs.energy=100;p.needs.hunger=95;p.needs.fun=clamp(p.needs.fun+25);p.needs.social=clamp(p.needs.social-10);p.money+=gift;p.prov+=6;hourly();
  const b=homeB();p.x=b.door[0];p.y=b.door[1]+22*outDir(b);
  const scene={rich:'The driver picks you up at the trotro station. At home there is jollof, chicken and a long lecture from Dad about your grades.',avg:'You sleep in your own bed, eat fufu and light soup, and listen to Mum warn you about "these university boys and girls".',poor:'You help Mum at the market on Saturday. On Sunday she cooks palm nut soup and packs your provisions with gari and shito.'}[p.bg];
  story(`<div class="eyebrow">Weekend at home</div><h3>Home is home.</h3><p class="scene">${scene} Before you leave, ${p.bg==='rich'?'Dad':'Mum'} slips you ${cedi(gift)}.</p><p>Energy full · +6 provisions · +${cedi(gift)}</p>`,[['Back to campus','g',()=>{}]])}

const clubNight=()=>hour()<3?day()-1:day();
function atm(){const p=P();if(!p.acct)return toast(`ATM: MoMo balance ${cedi(p.money)}. Open a bank account to save money 🏦`);bankSheet('wd',true)}
function bankSheet(kind,atmMode){S.paused=true;openSheet();const p=P();
  const draw=(note='')=>{$('sheetIn').innerHTML=`<div class="eyebrow">${atmMode?'🏧 ATM':BID[p.acct].name}</div><h3>${kind==='dep'?'💰 Deposit to savings':'💵 Withdraw from savings'}</h3><p style="font-size:14px">MoMo ${cedi(p.money)} · Savings ${cedi(p.savings)} · 1.5% interest every Monday</p>${note?`<div class="say">${note}</div>`:''}
    <div class="row" style="flex-wrap:wrap">${[50,100,200,500].map(v=>`<button class="btn sm" data-v="${v}">${cedi(v)}</button>`).join('')}<button class="ghost sm" data-v="all">All</button></div>${!atmMode?`<button class="ghost sm" id="sw2">${kind==='dep'?'Withdraw instead':'Deposit instead'}</button>`:''}<button class="ghost sm" id="bye">Done</button>`;
    $('sheetIn').querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{const v=b.dataset.v,amt=Math.floor(v==='all'?(kind==='dep'?p.money:p.savings):+v);if(amt<=0)return draw('Nothing to move.');
      if(kind==='dep'){if(p.money<amt)return draw('Not enough on MoMo.');p.money-=amt;p.savings+=amt}else{if(p.savings<amt)return draw('Not enough savings.');p.savings-=amt;p.money+=amt}draw(`Done. ${kind==='dep'?'Deposited':'Withdrew'} ${cedi(amt)}.`);hud()});
    const s2=$('sw2');if(s2)s2.onclick=()=>{kind=kind==='dep'?'wd':'dep';draw()};$('bye').onclick=closeSheet};draw()}
function examNow(){if(!S||P().grad)return null;const sd=day()-S.semStart,h=hour();return EXAMS.find(([d,st])=>d===sd&&h>=st-.75&&h<st+1)||null}
function heldOf(c){let n=0;for(let d=S.semStart;d<=day();d++){const t=TT[d%7];if(t)t.forEach(([cc,st])=>{if(cc===c&&(d<day()||hour()>st+2))n++})}return n}
function examScore(c,late){const p=P(),L=[];let s=30;
  const held=heldOf(c),a=Math.round((held?Math.min(1,p.att[c]/held):0)*22);s+=a;L.push([`Attended ${p.att[c]} of ${held} lectures`,a]);
  const st=Math.round(Math.min(1,p.study/140)*24);s+=st;L.push([st>=18?'You studied a lot':st>=9?'You studied a bit':'You barely studied',st]);
  const ov=Math.min(2,(S.offv||{})[c]||0)*3;if(ov){s+=ov;L.push(['Visited the lecturer in office hours',ov])}
  const gs=Math.min(3,S.groupStudy||0)*2;if(gs){s+=gs;L.push(['Studied with friends',gs])}
  const sl=S.lastSleep&&S.lastSleep.day===day()?S.lastSleep.h:0,sv=sl>=7?5:sl>=5?1:sl>0?-5:-10;s+=sv;L.push([sl?`Slept ${Math.round(sl)}h last night`:'No proper sleep last night',sv]);
  const n=p.needs;if(n.energy<25){s-=6;L.push(['Exhausted in the exam hall',-6])}if(n.hunger<20){s-=4;L.push(['Wrote on an empty stomach',-4])}if(n.fun<15){s-=3;L.push(['Stressed out',-3])}
  if(S.clubDay===day()-1){s-=4;L.push(['Partied at the club last night',-4])}if(late){s-=6;L.push(['Came in late',-6])}
  const qx=(S.quizX||{})[c+'|'+S.sem];if(qx){s+=qx.bonus;L.push([`Questions you answered: ${qx.right} of ${qx.n} right`,qx.bonus])}
  s+=R(-5,5);return{score:Math.round(clamp(s)),lines:L}}
function writeExam(c,st){const p=P(),late=hour()>st+.25;p.exams=p.exams||{};
  startBusy(`Writing the ${courseName(c)} exam`,{pose:'sitWrite',spot:IS&&IS.spots.seat,mins:Math.max(20,day()*1440+(st+2)*60-S.min)},0,()=>{const r=examScore(c,late);p.exams[c]=r;S.min=Math.max(S.min,day()*1440+(st+2)*60);hourly();p.needs.energy=clamp(p.needs.energy-15);p.needs.fun=clamp(p.needs.fun-5);
    const feel=r.score>=70?'You walk out smiling. That paper was yours 😎':r.score>=55?'Some questions were tough, but you managed.':r.score>=40?'You struggled. Some questions looked like they came from another course 😩':'Your mind went blank. This one might be a trail 😰';
    story(`<div class="eyebrow">📝 Exam · ${esc(courseName(c))}</div><h3>"Pens down! Stop writing."</h3><p class="scene">${feel}</p><table>${r.lines.map(([t,v])=>`<tr><td>${esc(t)}</td><td class="n" style="color:${v>=0?'#6fd08c':'#e0897a'}">${v>=0?'+':''}${v}</td></tr>`).join('')}</table><p style="font-size:13px;color:var(--muted)">How you live affects how you write. Your final score comes out on results day.</p>`,[['OK','g',()=>{}]]);hud();acts(true)})}
function eventNow(){if(!S)return null;const sd=day()-S.semStart,h=hour();return EVENTS.find(e=>e.sd===sd&&h>=e.from&&h<e.to)||null}
function nextEvent(){return EVENTS.find(e=>S.semStart+e.sd>day()||(S.semStart+e.sd===day()&&hour()<e.from))}
const lineup=()=>LINEUPS[(S.sem-1)%LINEUPS.length];
function curSlot(){const e=eventNow();if(!e||e.id!=='concert')return -1;const h=hour();return h<20.25?0:h<21.6?1:2}
const curArtist=()=>{const k=curSlot();return k<0?null:lineup()[k]};
const myTicket=()=>S.ticket&&S.ticket.sem===S.sem?S.ticket:null;
const concertSpot=()=>Object.assign(TA('parade',1980,myTicket()&&myTicket().vip?486:522),{ry:Math.PI});
function srcWeekHTML(){const L=lineup(),tk=myTicket();return `<p><strong>🎉 SRC Week · Parade Grounds</strong></p><table><tr><th>Day</th><th>Event</th><th>Time</th></tr>${EVENTS.map(e=>{const d=S.semStart+e.sd;return `<tr${day()>d?' style="opacity:.5"':''}><td>${DAYS[d%7]}</td><td>${e.emoji} ${esc(e.name)}</td><td>${hm(e.from*60)}</td></tr>`}).join('')}</table><p style="font-size:13px">Concert lineup: ${L.map(k=>esc(ARTISTS[k].name)).join(', ')}${tk?` · 🎟️ you have a ${tk.vip?'VIP ':''}ticket`:''}</p>`}
function ticketSheet(){S.paused=true;openSheet();const L=lineup(),c=EVENTS.find(e=>e.id==='concert');
  $('sheetIn').innerHTML=`<div class="eyebrow">SRC Week · ${DAYS[(S.semStart+c.sd)%7]} ${hm(c.from*60)} · Parade Grounds</div><h3>🎤 Grand Concert tickets</h3><div class="list">${L.map((k,i)=>`<div class="item"><div class="grow"><b>${esc(ARTISTS[k].name)}</b><small>${ARTISTS[k].style} · ${['Opening act','Special guest','Headliner'][i]}</small></div></div>`).join('')}</div><p style="font-size:14px">Early tickets are cheaper than at the gate. VIP gets you to the front of the stage and a chance to meet the headliner backstage.</p><div class="row"><button class="btn" id="tr">Regular · GH₵50</button><button class="btn m" id="tv">VIP · GH₵150</button><button class="ghost sm" id="bye">Close</button></div>`;
  const buy=(vip,pr)=>{if(!spend(pr))return;S.ticket={sem:S.sem,vip};closeSheet();toast(vip?'VIP ticket bought! Front of the stage ✨':'Ticket bought! See you at the Parade Grounds 🎤')};
  $('tr').onclick=()=>buy(false,50);$('tv').onclick=()=>buy(true,150);$('bye').onclick=closeSheet}
const SOCS=[['drama','Drama Club','Books'],['debate','Debate Society','Business'],['tech','Tech & Coding Club','Tech'],['dance','Dance Crew','Dance'],['fellowship','Christian Fellowship','Church'],['football','Hostel Football Team','Football'],['gaming','Gaming & Esports','Gaming'],['fashion','Fashion & Modelling Club','Fashion']];
function clubFair(){S.paused=true;openSheet();const p=P();p.socs=p.socs||[];
  const draw=(note='')=>{$('sheetIn').innerHTML=`<div class="eyebrow">Clubs & Societies Fair · Parade Grounds</div><h3>🎪 Join a club</h3><p style="font-size:14px">Every stand is shouting for new members. Joining a club is the easiest way to meet people who like what you like.</p>${note?`<div class="say">${note}</div>`:''}<div class="list">${SOCS.map(([id,nm,int])=>`<div class="item"><div class="grow"><b>${nm}</b><small>Meet the ${int} crowd</small></div>${p.socs.includes(id)?'<span class="tag g">Member</span>':`<button class="btn sm" data-s="${id}">Join</button>`}</div>`).join('')}</div><button class="ghost sm" id="bye">Done</button>`;
    $('sheetIn').querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{const [id,nm,int]=SOCS.find(x=>x[0]===b.dataset.s);p.socs.push(id);advance(20);const ms=S.npcs.filter(n=>n.ints.includes(int));ms.forEach(n=>{n.met=true;n.friend=clamp(n.friend+6)});p.needs.social=clamp(p.needs.social+10);draw(`You joined the ${nm}. ${ms.length?`You met ${ms.slice(0,3).map(n=>n.name).join(', ')}. Friendship +6`:'New faces, new group chat.'}`)});
    $('bye').onclick=closeSheet};draw()}
function hostelGame(kind){const p=P(),win=Math.random()<.45+Math.min(.3,p.fit*.02),lbl=kind==='tug'?'Pulling in the tug of war':'Hopping in the sack race';
  startBusy(lbl,Object.assign(animFor(lbl),{mins:30,fx:{fun:18,social:10,energy:-12,hygiene:-8}}),0,()=>{applyAct(lbl,30,{fun:18,social:10,energy:-12,hygiene:-8});
    if(win){S.npcs.filter(n=>n.home===p.home).forEach(n=>{n.met=true;n.friend=clamp(n.friend+5)});toast(`${homeB().name} WINS! Your hostel-mates lift you up 🏆 Friendship +5`)}else toast(`${homeB().name} lost this one. "Next year!" 😤`)})}
function watchConcert(){const p=P(),slot=curSlot(),art=ARTISTS[curArtist()],lbl=`Jamming to ${art.name} at the concert`;
  startBusy(lbl,Object.assign(animFor(lbl),{mins:60,fx:{fun:30,social:14,energy:-12,hygiene:-6}}),0,()=>{applyAct(lbl,60,{fun:30,social:14,energy:-12,hygiene:-6});S.npcs.filter(n=>n.plan&&n.plan.b==='parade').slice(0,2).forEach(n=>{n.met=true;n.friend=clamp(n.friend+4)});
    if(slot===2&&S.sawHead!==S.sem){S.sawHead=S.sem;story(`<div class="eyebrow">SRC Week Grand Concert · Parade Grounds</div><h3>${esc(art.name)} shuts the place down. 🔥</h3><p class="scene">${art.scene}</p><p>Fun maxed · the whole campus will talk about this for weeks</p>`,[['What a night!','g',()=>{p.needs.fun=100}]])}})}
function meetStar(){const p=P(),art=ARTISTS[curArtist()];S.metStar=S.sem;advance(20);p.needs.social=100;p.needs.fun=100;
  story(`<div class="eyebrow">Backstage · VIP</div><h3>You met ${esc(art.name)}! 🤳</h3><p class="scene">Security checks your wristband and waves you behind the stage. ${esc(art.name)} is sweating, laughing and taking selfies with everyone. "Akwaaba University, you people get energy paaa!" They sign your ticket and take a picture with you.</p><p>Social and fun maxed · your selfie is going round every group chat</p>`,
    [['Post it 📸','g',()=>{S.npcs.forEach(n=>{if(n.met)n.friend=clamp(n.friend+3)});const f=bestFriend();if(f&&f.met)msg(f.name,`HOW DID YOU MEET ${art.name.toUpperCase()}?!?! 😭😭`)}]])}
function pantryText(){const p=P();return Object.entries(p.pantry).filter(([k,v])=>v>0).map(([k,v])=>`${ING[k].name} ×${v}`).join(', ')}
function cookSheet(where){S.paused=true;openSheet();const p=P();
  const rs=RECIPES.filter(r=>where!=='cooker'||r.pot);
  $('sheetIn').innerHTML=`<div class="eyebrow">${where==='kitchen'?'Shared hostel kitchen':where==='cooker'?'Rice cooker':'Your kitchenette'}</div><h3>🍳 What are you cooking?</h3><p style="font-size:14px">In your foodstuff box: ${esc(pantryText()||'nothing yet')}. Buy foodstuff at the Campus Market.</p>
    <div class="list">${rs.map(r=>{const miss=Object.entries(r.need).filter(([k,v])=>(p.pantry[k]||0)<v);return `<div class="item"><div class="grow"><b>${r.name}</b><small>${Object.entries(r.need).map(([k,v])=>`${v>1?v+'× ':''}${ING[k].name}`).join(' · ')} · ${r.mins} min · Hunger +${r.hunger}${miss.length?` · <span style="color:#e0897a">need ${miss.map(([k])=>ING[k].name.toLowerCase()).join(', ')}</span>`:''}</small></div><button class="btn sm" data-r="${r.id}" ${miss.length?'disabled':''}>Cook</button></div>`}).join('')}</div><button class="ghost sm" id="bye">Close</button>`;
  $('sheetIn').querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{const r=RECIPES.find(x=>x.id===b.dataset.r);Object.entries(r.need).forEach(([k,v])=>p.pantry[k]-=v);closeSheet();cook(r,where)});$('bye').onclick=closeSheet}
function cook(r,where){if(where==='cooker'&&IS&&IS.spots.cooker)IS.spots.stove=IS.spots.cooker;
  const label=`Cooking ${r.name}`,others=IS?IS.people.filter(q=>q.n&&!q.sleeping):[];
  startBusy(label,Object.assign(animFor(label),{mins:r.mins,fx:{hunger:r.hunger,fun:r.fun,hygiene:-3}}),0,()=>{applyAct(label,r.mins,{hunger:r.hunger,fun:r.fun,hygiene:-3});
    if(others.length){others.forEach(q=>q.n.friend=clamp(q.n.friend+(r.id==='jollof'?6:4)));toast(`You shared your ${r.name} with ${others.map(q=>q.n.name).join(' & ')}. Friendship up 🍲`)}})}
function marketSheet(){S.paused=true;openSheet();const p=P();let bought=0;
  const draw=(note='')=>{$('sheetIn').innerHTML=`<div class="row" style="justify-content:space-between"><h3>🧺 Campus Market</h3><span class="tag y">${cedi(p.money)}</span></div><p style="font-size:14px">"My customer, come! Fresh tomatoes, fresh fish!" Buy foodstuff here, then cook it in your kitchen.</p>${note?`<div class="say">${note}</div>`:''}
    <div class="list">${Object.entries(ING).map(([k,it])=>`<div class="item"><div class="grow"><b>${it.name}</b><small>${it.n} serving${it.n>1?'s':''} · you have ${p.pantry[k]||0}</small></div><button class="btn sm" data-i="${k}">${cedi(it.price)}</button></div>`).join('')}</div><button class="ghost sm" id="bye">Done</button>`;
    $('sheetIn').querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{const k=b.dataset.i,it=ING[k];if(!spend(it.price))return draw('Not enough money on MoMo.');p.pantry[k]=(p.pantry[k]||0)+it.n;bought++;draw(`Bought ${it.name.toLowerCase()}. Market woman: "God bless you, my dear!"`)});
    $('bye').onclick=()=>{closeSheet();if(bought)doAct('Buying foodstuff at the market',Math.min(40,10+bought*5),{fun:3})}};draw()}
