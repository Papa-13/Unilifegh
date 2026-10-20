/* ================= time ================= */
function decay(mins){const n=P().needs;n.hunger=clamp(n.hunger-mins*.06);n.energy=clamp(n.energy-mins*(S.busy&&/sleep|nap/i.test(S.busy.label)?0:.045));n.social=clamp(n.social-mins*(S.mates.length&&IS&&IS.mine?.016:.03));n.fun=clamp(n.fun-mins*.035);n.hygiene=clamp((n.hygiene??80)-mins*.022)}
function advance(mins){if(sharedClock()){decay(Math.min(mins,30)*.5);hourly();return}S.min+=mins;decay(mins);hourly()}
function hourly(){
  const d=day(),h=Math.floor(hour());const key=d*24+h;if(key===S.lastHour)return;
  const prevDay=Math.floor(S.lastHour/24);S.lastHour=key;const p=P(),sd=d-S.semStart;
  if(h===6&&!S['wh'+d]){S['wh'+d]=1;S.whims=S.whims.filter(w=>w.pin);S.swapDay=-1;fillWhims();if(d>0)toast('🎯 New daily tasks are in. Complete them to earn 💎 gems')}
  if(h===13&&!S['ms'+d]){S['ms'+d]=1;p.mess=clamp((p.mess||0)+9)}
  if(h===6&&!S['wo'+d]){S['wo'+d]=1;if(Math.random()<.3){S.waterOffDay=d;if(['lodge','sunrise'].includes(HT(p.home)))msg(`${homeB().name} manager`,'Good morning. No water flowing today, the pump is spoilt. Use the gallons of water in your bathroom. Sorry 🙏')}}
  if(p.needs.hygiene<22&&h>=8&&h<=21&&!S['hy'+d]){S['hy'+d]=1;const m=S.mates[0]||bestFriend();if(m)msg(m.name,pick(['Chale… please go and bath 😅 I say it with love.','Ei, when did you last shower? Just asking o 🫣']))}
  if(IS&&IS.bid==='club'&&h>=3&&h<20){leaveRoom(true);toast('Lights on! Club Vibes is closed. Time to go home. 🥱');acts(true)}
  if(h>=9&&h<=22&&!S['op'+d+h]&&Math.random()<.14){S['op'+d+h]=1;const f=shuffle(S.npcs.filter(n=>(n.contact||n.mate)&&n.friend>=25))[0];
    if(f)msg(f.name,pick(['Chale, you dey? 👀','Did you see what happened at the canteen today? 😂','Are you going for the lecture tomorrow?','I\'m so bored 😩 what are you doing?','Have you eaten? 🍛','This assignment eh 😭 have you started?','Where are you?']),Math.random()<.25?{secs:RI(5,15)}:null)}
  if(h===7&&wd()===0&&p.savings>0&&!S['int'+d]){S['int'+d]=1;const it=Math.max(1,Math.round(p.savings*.015));p.savings+=it;msg(BID[p.acct].name,`Weekly interest of ${cedi(it)} added. Savings: ${cedi(p.savings)} 🏦`)}
  if(h===6){S.npcs.forEach(n=>n.talks=0);if(p.items.includes('rug'))p.needs.fun=clamp(p.needs.fun+3)}
  if(h>=6&&d>0&&d%14===0&&!S['allow'+d]){S['allow'+d]=1;const a=BG[p.bg].allow;p.money+=a;msg(p.bg==='rich'?'Dad':'Mum',`I sent your allowance for the next two weeks, ${cedi(a)}. ${p.bg==='poor'?'It is small, but it is what we have. Make it last.':'Make it last two weeks o. Have you eaten?'}`)}
  if(sd===1&&h===10&&!S['sw'+S.sem]){S['sw'+S.sem]=1;msg('SRC',`🎉 SRC WEEK at the Parade Grounds! ${EVENTS.map(e=>`${e.emoji} ${e.name} (${DAYS[(S.semStart+e.sd)%7]})`).join(' · ')}. Concert headliner: ${ARTISTS[lineup()[2]].name}! Early tickets at Student Affairs & SRC.`)}
  EVENTS.forEach(e=>{if(sd===e.sd&&h===Math.max(6,Math.floor(e.from)-2)&&!S['ev'+e.id+d]){S['ev'+e.id+d]=1;const f=bestFriend();
    if(e.id==='concert'&&f&&f.met)msg(f.name,`Tonight!!! ${ARTISTS[lineup()[2]].name} at the Parade Grounds 🔥 You dey come? I go stand for front.`);else msg('SRC',`${e.emoji} ${e.name} starts at ${hm(e.from*60)} at the Parade Grounds. Come out!`)}});
  if(sd===4&&h===17&&!S.fn){S.fn=1;msg('SRC',"Freshers' Night is tonight at Akwaaba Square, 19:00! DJ, food, dance-off. 🔥")}
  if(sd===2&&h===20&&!S.m1){S.m1=1;const f=bestFriend();if(f||!NOBOTS)msg(f?f.name:'Kwabena','Chale, are you coming to the Night Market? Indomie dey.')}
  if(sd===5&&h===18&&!S.m5){S.m5=1;msg('Church fellowship','Sunday service at the University Chapel, 09:00. All are welcome! 🙏')}
  if(sd===8&&h===9&&!S.m2){S.m2=1;msg('Class rep',`📝 Exam timetable: ${EXAMS.map(([ed,eh,c])=>`${courseName(c)} · ${DAYS[(S.semStart+ed)%7]} ${eh}:00`).join(' · ')}. All in our college building, ${BID[p.col].name}. Don't be late o!`)}
  EXAMS.forEach(([ed,eh,c])=>{if(sd===ed-1&&h===20&&!S['exr'+c+S.sem]&&!EXAMS.some(([d2,h2,c2])=>d2===ed-1&&c2!==c&&false)){S['exr'+c+S.sem]=1;msg('Class rep',`Reminder: ${courseName(c)} exam tomorrow at ${eh}:00. Sleep early, eat something, and bring your pen and ID 🙏`)}
    if(sd===ed&&h>=eh+1&&!(p.exams&&p.exams[c])&&!S['exm'+c+S.sem]){S['exm'+c+S.sem]=1;p.exams=p.exams||{};p.exams[c]={score:0,absent:true,lines:[]};msg('Exams Office',`You were absent for the ${courseName(c)} exam. You will have to write a resit 😬`)}});
  if(S.flags.hx===1&&d>=S.flags.hxDay+1&&!S.m3){S.m3=1;const f=bestFriend()||S.npcs[1];if(f)msg(f.name,`I heard ${BADLEC} called you to his office. He did that to my coursemate last year. You can report it at Student Affairs. They keep it confidential.`)}
  if(S.flags.reported&&!S.flags.resolved&&d>=S.flags.repDay+2&&h>=9)resolveReport();
  // family emergency top-up when you're broke
  if(h===9&&p.money<60&&!S['em'+week()]){S['em'+week()]=1;const amt={poor:150,avg:250,rich:700}[p.bg];p.money+=amt;msg(p.bg==='rich'?'Dad':'Mum',`Your sibling said you're broke. I've sent ${cedi(amt)}. Manage it well o.`)}
  // friends ask to borrow
  if(h===11&&!S['lr'+d]){S['lr'+d]=1;const f=shuffle(S.npcs.filter(n=>n.friend>=35&&!p.debts.some(x=>x.n===n)&&!p.requests.some(x=>x.n===n)))[0];
    if(f&&Math.random()<.35){const amt=pick([50,80,100,150,200]);p.requests.push({n:f,amt,due:d+5});msg(f.name,pick([`Chale, please can you lend me ${cedi(amt)}? I'll pay you back by ${DAYS[(d+5)%7]}. My allowance delayed 😩`,`Please I need ${cedi(amt)} for handouts and food. I'll refund ${DAYS[(d+5)%7]}, I promise.`]))}}
  // debts due
  p.debts.forEach(x=>{if(x.kind==='lent'&&!x.done&&d>=x.due&&h===10&&!x['c'+d]){x['c'+d]=1;
      if(x.n.reliable||Math.random()<.25){x.done=true;p.money+=x.amt;x.n.friend=clamp(x.n.friend+6);msg(x.n.name,`Sent your ${cedi(x.amt)} back. Thank you for helping me, I won't forget it. 🙏`)}
      else if(d>=x.due+4){x.done=true;x.lost=true;x.n.friend=clamp(x.n.friend-10);msg(x.n.name,'…');toast(`${x.n.name} has stopped replying about your ${cedi(x.amt)}. 😤`)}
      else msg(x.n.name,pick(['Please give me small time, by weekend I\'ll pay.','Chale, I haven\'t forgotten. Allowance hasn\'t come.']))}
    if(x.kind==='owe'&&!x.done&&d>x.due&&h===10&&!x['c'+d]){x['c'+d]=1;x.n.friend=clamp(x.n.friend-4);msg(x.n.name,pick([`Hello, my ${cedi(x.amt)} o. It's past ${DAYS[x.due%7]}.`,`Please, I need my money. ${cedi(x.amt)}.`,`Ei, you've gone quiet. My ${cedi(x.amt)} please.`]))}});
  // business day close at 21:00
  if(h===21&&p.biz&&!S['bz'+d])bizDay(d);
  // elections
  if(p.race&&!p.race.done){if(sd===7&&h===16&&!S.mr){S.mr=1;msg('SRC Electoral Commission','Manifesto reading is today, 17:00–19:00 at Akwaaba Square. All candidates must attend.')}
    if(sd===9&&h>=12)electionResult()}
  if(d>=S.semEnd&&h>=8&&!S.semesterDone&&!p.grad){S.semesterDone=true;if(IS)leaveRoom();results()}
}
function bestFriend(){return S.npcs.slice().sort((a,b)=>b.friend-a.friend)[0]}
