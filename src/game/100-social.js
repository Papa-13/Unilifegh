/* ================= social ================= */
const LINES={
 chat:{good:['Chale, this campus is something else. How are you finding it?','Ei, you be fresher too? Welcome o!','I like your vibe. We should link up more.','Have you been to the Night Market yet? Their kelewele is top.'],
       mid:['Yeah, I\'m fine. Just tired from lectures.','Hmm, okay. Nice to meet you.','Sorry, I\'m a bit busy, but hi.'],bad:['Please, I\'m rushing to somewhere.','Sorry, do I know you?']},
 joke:{good:['😂😂 Stop it! You\'re too funny.','Hahaha! Chale, you no serious at all.','Ei! My stomach. You should do stand-up.'],mid:['Heh. Okay, that one was small.','I don\'t get it, but okay.'],bad:['…that wasn\'t funny.','Wow. Okay.']},
 interest:{good:['You also like %I? Finally, someone who gets it!','No way, %I is my whole life. We need to talk more.'],mid:['%I is cool, I guess.'],bad:['I\'m not really into %I.']},
 compliment:{good:['Aww, thank you! You also look sharp today.','Ei, you noticed? Thank you o.'],mid:['Thanks.'],bad:['Okay… thanks?']},
 flirt:{good:['😳 Are you flirting with me? …Keep going.','You\'re smooth, eh? I like that.','Hmm, I see what you\'re doing. 😊'],mid:['Haha, you\'re funny.','Let\'s just be friends for now, okay?'],bad:['Please, let\'s keep it friendly.','Not interested, sorry.']},
 date:{bad:['Hmm, I\'m not ready for that. Sorry.','Maybe another time.']},
 ask:{good:['Yes! I\'ve been waiting for you to ask. ❤️','Ei, finally! Yes, yes, yes.'],bad:['You\'re a really good friend. I don\'t want to spoil that.','I\'m sorry. I don\'t feel the same way.']},
 tired:['Chale, I have to go. Let\'s talk later.','I need to rest small. Catch you later.']};
function talkMenu(n){
  S.paused=true;openSheet();const p=P();S.talkN=n;n.pose='talk';n.vibe=0;n.know=n.know||{};p.pose='talk';if(!IS){n.face=Math.atan2(p.x-n.x,p.y-n.y);p.face=Math.atan2(n.x-p.x,n.y-p.y)}
  const q=IS&&IS.people.find(q=>q.n===n);if(q&&!q.lying){q.pose='talk';q.mesh.rotation.y=Math.atan2(p.ix-q.x,p.iz-q.z);p.face=Math.atan2(q.x-p.ix,q.z-p.iz)}
  {const T=(IS&&IS.people.find(q=>q.n===n))||n,gk=p.partner===n||n.friend>=70?'hug':n.friend>=35?'dap':n.met?'handshake':null;if(gk==='hug')hugPair(p,T,2.2);else if(gk){setGest(T,gk,1.7);setGest(p,gk,1.7)}else setExpr(T,'surprised',.8)}
  const shared=n.ints.filter(i=>p.interests.includes(i));const role=n.gender==='f'?'girlfriend':'boyfriend';
  const draw=(said)=>{
    const K=n.know;let opts=[];
    /* small talk the way it really goes: names first, then "are you new here?", course, hostel, where you're from */
    if(!n.met)opts=[['intro','🙋 "Hi, I\'m '+esc((p.name||'').split(' ')[0])+'"'],['hi','👋 "Hey, how far?"'],['wave','Smile and wave']];
    else{if(!K.lvl)opts.push(['q_new','"Are you new here?"']);if(!K.course)opts.push(['q_course','"What course do you do?"']);if(K.course&&!K.hostel)opts.push(['q_hostel','"Which hostel are you in?"']);if(K.course&&!K.from)opts.push(['q_from','"Where are you from?"']);
      opts.push(['chat','Chat'],['joke','Tell a joke'],['interest',`Talk about ${shared[0]||n.ints[0]}`],['compliment','Compliment their style'])}
    if(!n.contact&&n.met&&n.friend>=15&&n.numNo!==day())opts.push(['number','📱 Ask for their number']);
    const here=!IS&&locOf(p.x,p.y);
    if(n.friend>=25&&here&&here.id==='lib')opts.push(['study','Study together (2h)']);
    if(n.met&&n.friend>=20&&IS&&IS.kind==='room')opts.push(['oware','🟤 "Let\'s play Oware"']);
    if(!IS&&n.met){if(n.with>S.min){opts.push(['walk','🚶 Take a walk together'],['sitw','🪑 Sit somewhere together'],['bye','👋 "See you later"'])}else if(n.friend>=15)opts.push(['come','🚶 "Do you mind taking a walk with me?"'])}
    if(!IS&&n.friend>=30&&!n.mate&&hour()>=8&&hour()<22)opts.push(['visit','🏠 Visit their room']);
    if(n.friend>=50&&!p.debts.some(x=>x.n===n&&!x.done&&x.kind==='owe'))opts.push(['borrow','Ask to borrow money']);
    const owe=p.debts.find(x=>x.n===n&&!x.done&&x.kind==='owe');if(owe)opts.push(['repay',`Pay back ${cedi(owe.amt)}`]);
    if(n.met&&p.biz&&!n.customer)opts.push(['sell',`Tell them about your ${BIZ[p.biz.type].name.toLowerCase()}`]);
    if(p.race&&!p.race.done&&!p.race.endorse.includes(n)&&n.friend>=30)opts.push(['vote',`Ask for their vote (${p.race.title})`]);
    const opp=romOK(n);
    if(opp&&n.met&&n.friend>=30&&p.partner!==n)opts.push(['flirt','Flirt']);
    if(opp&&n.romance>=35&&p.partner!==n&&!n.side)opts.push(['date','Ask on a date']);
    if(opp&&n.romance>=65&&n.dates>=2&&p.partner!==n&&!n.side)opts.push(['ask',p.partner?`🤫 Ask to be your ${role} (you're with ${esc(p.partner.name)})`:`Ask to be your ${role}`]);
    if(opp&&n.side&&!p.partner)opts.push(['ask','💍 Make it official']);
    if(opp&&(p.partner===n||n.side))opts.push(['date','Go on a date']);
    if(opp&&n.met&&(p.partner===n||n.side||n.romance>=55))opts.push(['kiss','😘 Kiss']);
    if(p.partner===n||n.side)opts.push(['breakup','💔 Break up']);
    try{memTellOpts(n).forEach(o=>opts.push(o))}catch(e){}
    $('sheetIn').innerHTML=`<div class="who"><i class="av" style="background:${PAL[n.look.pal].a};border-color:${PAL[n.look.pal].b}"></i><div><h3>${n.met||n.mate?esc(n.name):(n.gender==='f'?'A girl you don\'t know':'A guy you don\'t know')}${p.partner===n?' ❤️':n.side?' 🤫':''}</h3>
      <div class="tags"><span class="tag y">${relStage(n)}</span>${knowsCourse(n)?`<span class="tag">${esc(n.prog)}</span>`:''}${n.mate?'<span class="tag">Your roommate</span>':knowsHostel(n)?`<span class="tag">${BID[n.home].name}</span>`:''}${n.talks>=2||n.friend>=25?n.ints.map(i=>`<span class="tag ${p.interests.includes(i)?'g':''}">${i}</span>`).join(''):''}${n.friend>=20?`<span class="tag y">${n.pers}</span>`:''}${knowsCourse(n)&&n.prog===p.prog?'<span class="tag g">coursemate</span>':''}</div></div></div>
      <div class="rel"><span>Friendship</span><div class="bar"><i style="width:${n.friend}%"></i></div><span>Romance</span><div class="bar"><i class="rom" style="width:${n.romance}%"></i></div></div>
      ${said?`<div class="say">${said}</div>`:''}
      <div class="grid2">${opts.map(([k,t])=>`<button class="ghost sm" data-a="${k}">${t}</button>`).join('')}</div>
      <button class="btn sm" id="bye">Walk away</button>`;
    $('sheetIn').querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{const r=socialAct(n,b.dataset.a,shared,draw);if(r!==null&&r!==undefined)draw(r)});
    $('bye').onclick=closeSheet;hud();
  };
  draw(n.met?'':`<span style="color:var(--muted)">You don't know ${n.gender==='f'?'her':'him'} yet.</span>`);
}
function socialAct(n,a,shared,draw){const b4={f:n.friend,r:n.romance};const r=socialAct0(n,a,shared,draw);try{const dd=(n.friend-b4.f)+(n.romance-b4.r);n.vibe=(n.vibe||0)+(dd>4?1:dd<0?-1:0);ev('talk',{a,good:dd>4});if(a==='joke')addBuff(dd>4?'amused':dd<0?'embarrassed':'');if(a==='ask'&&P().partner===n||a==='flirt'&&dd>6)addBuff('loved')}catch(e){}try{reactTalk(n,a,b4)}catch(e){}return r}
function talkBody(n){return (IS&&IS.people.find(q=>q.n===n))||n}
function reactTalk(n,a,b4){const p=P(),T=talkBody(n),d=(n.friend-b4.f)+(n.romance-b4.r),G=(k,dur,e)=>setGest(T,k,dur,e),Me=(k,dur,e)=>setGest(p,k,dur,e),later=(f,ms=650)=>setTimeout(f,ms);
  if(['walk','sitw','visit','date'].includes(a))return;
  if(a==='intro'){Me('handshake',1.8);G('handshake',1.8);return}
  if(a==='wave'){Me('wave',1.6);n.pers==='shy'?G('nod',1.2,'smile'):later(()=>G('wave',1.6),300);return}
  if(a==='bye'){Me('wave',1.6);later(()=>G('wave',1.6),250);return}
  if(a==='number'){Me('phonecall',1.6,'smile');G('nod',1.3,'smile');return}
  if(a==='come'){d>=0&&n.with>S.min?G('nod',1.3,'smile'):G('shrug',1.6);return}
  if(a==='ask'){if(p.partner===n){hugPair(p,T,3.2);later(()=>{setExpr(T,'laugh',2);setExpr(p,'laugh',2)},900)}else{G('no',2,'sad');Me('sad',2.4)}return}
  if(a==='study'){Me('explain',2);later(()=>G('think',2.2));return}
  Me(a==='joke'?'explain':pick(['explain','explain','point']),1.5);
  later(()=>{if(a==='joke'){d>4?(G('laugh',2.6),setExpr(p,'laugh',2.4)):d<0?G('facepalm',2.2):G('shrug',1.7);return}
    if(a==='flirt'){d>6?(G('lookaround',1.4,'smile'),setExpr(T,'smile',5)):d<0?G('cross',2.6):G('shrug',1.6);return}
    if(a==='compliment'&&d>4){G('celebrate',1.6);return}
    if(d>=8)G(pick(['laugh','nod','clap']),2.2);else if(d>0)G('nod',1.6,'smile');else if(d<0)G(pick(['cross','no','facepalm']),2.2);else G('shrug',1.6)},700)}
function socialAct0(n,a,shared,draw){
  const p=P(),say=t=>`<b>${esc(n.name)}:</b> ${t}`;if(a.startsWith('tell:'))return memTell(n,a.slice(5));
  if(a==='intro'||a==='hi'){advance(2);const cold=n.pers==='shy'&&Math.random()<.35||Math.random()<.08;
    if(a==='hi'&&!n.met){n.friend=clamp(n.friend+2);return say(cold?'Hi. 🙂':pick(['I dey o! You?','Hey! Fine, and you? 😄','Hi hi 👋']))+'<br><span style="color:var(--muted)">You still don\'t know their name.</span>'}
    n.met=true;n.know.name=1;n.friend=clamp(n.friend+(cold?3:7));if(cold){n.vibe--;return say(`Oh, hi. I'm ${n.name.split(' ')[0]}. 🙂`)+'<br><span style="color:var(--muted)">They seem a bit reserved.</span>'}
    return say(pick([`Hi ${(p.name||'').split(' ')[0]}! I'm ${n.name}. Nice to meet you 😊`,`Ah, nice to meet you! I'm ${n.name}. Are you new here?`,`Akwaaba! I'm ${n.name.split(' ')[0]} 👋 First time I'm seeing you around.`]))}
  if(a==='q_new'){advance(2);n.know.lvl=1;const L=npcLevel(n),you=(P().yr||1)*100;n.friend=clamp(n.friend+2);
    return say(L===you?pick([`Yes o! Level ${L} too. Everything is still confusing 😂`,`I'm also new, Level ${L}. We'll find our way 🙏`]):L>you?pick([`No, I'm in Level ${L}. Welcome to campus! If you need help, ask me 😄`,`Level ${L} now, chale. Time flies. You'll enjoy it here`]):`I'm Level ${L}. You're my senior then 😅`)}
  if(a==='q_course'){advance(2);n.know.course=1;const same=n.prog===P().prog;n.friend=clamp(n.friend+(same?6:2));if(same)n.vibe++;
    return say(same?pick([`${n.prog}! Same as you? Ei, coursemates! 🤝`,`I do ${n.prog}. Wait, you too?! We'll be suffering together 😂`]):pick([`I do ${n.prog}. It's hard paa but I like it.`,`${n.prog}. Don't ask me about it, my head is full 😅 What about you?`,`${n.prog} at ${COLLEGES[n.col]?COLLEGES[n.col].short:'my college'}. And you?`]))}
  if(a==='q_hostel'){advance(2);n.know.hostel=1;const b=BID[n.home],same=n.home===P().home;n.friend=clamp(n.friend+(same?5:2));
    return say(same?`${b.name}! We're neighbours then 😄 Which room?`:pick([`${b.name}. It's not bad, the water flows sometimes 😂`,`I stay at ${b.name}. Come and visit some time.`]))}
  if(a==='q_from'){advance(2);n.know.from=1;const t=npcTown(n);n.friend=clamp(n.friend+2);return say(pick([`I'm from ${t}. Born and bred 😄`,`${t}! You've been there?`,`My family is in ${t}. I miss home food small 😩`]))}
  if(a==='wave'){n.friend=clamp(n.friend+2);return n.pers==='shy'?'<span style="color:var(--muted)">They give a small wave back and look away.</span>':say('Hey! 👋')}
  if(a==='number'){advance(2);const ok=n.friend>=35||(n.vibe>=1&&Math.random()<.55+n.friend/150)||(n.vibe>=0&&Math.random()<.25+n.friend/120);
    if(!ok){n.numNo=day();n.friend=clamp(n.friend-2);return say(pick(['Hmm, let\'s get to know each other first 😅','I don\'t really give my number out like that, sorry.','Ah, maybe next time. 🙂','Haha, slow down. We just met 😂']))}
    n.contact=true;return say(pick(['Sure! Here, put it in. Don\'t flash me o.','Okay, add me on WhatsApp too.']))+'<br><span class="tag g">Added to your phone</span>'}
  if(a==='visit'){closeSheet();visitRoom(n);return null}
  if(a==='come'){advance(1);const busy=n.plan&&(COLLEGES[n.plan.b]&&lectureNow()||n.plan.b==='lib');if(!busy&&n.vibe>=0&&Math.random()<.3+n.friend/100&&!(hour()<6.5||hour()>=23)){n.with=S.min+120;n.pose=null;return say(pick(['Sure, why not! 🚶🏾','Okay, I have small time. Let\'s go.','Yes o, I was bored anyway 😂']))+'<br><span class="tag g">'+esc(n.name)+' is walking with you now</span>'}return say(busy?pick(['Ah, I\'m going for lectures now 😩 Another time?','I\'m heading to the library, exams are coming. Next time!']):pick(['Sorry, I\'m in a hurry now. Later?','Hmm, not today. Maybe another time 🙂','I have somewhere to be, sorry 😅']))}
  if(a==='walk'){closeSheet();walkWith(n);return null}
  if(a==='sitw'){closeSheet();sitWith(n);return null}
  if(a==='bye'){n.with=0;n.lastPlan=-1;return say(pick(['Okay, see you later! 👋','Bye o! Text me 📱','Later! That was fun 😄']))}
  if(a==='borrow'){$('sheetIn').querySelector('.grid2').innerHTML=[50,100,200,400].map(v=>`<button class="ghost sm" data-b="${v}">Borrow ${cedi(v)}</button>`).join('');
    $('sheetIn').querySelectorAll('[data-b]').forEach(b=>b.onclick=()=>{const amt=+b.dataset.b;advance(10);
      const ok=Math.random()<n.friend/100+({rich:.35,avg:.1,poor:-.25}[n.wealth])-amt/600;
      if(ok){p.money+=amt;p.debts.push({n,amt,due:day()+7,kind:'owe'});draw(say(pick([`No wahala. I'll send it on MoMo now. Pay me by next ${DAYS[(day()+7)%7]}, okay?`,`Okay, but please don't let me chase you o. ${DAYS[(day()+7)%7]}.`]))+`<br><span class="tag y">+${cedi(amt)} · repay in 7 days</span>`)}
      else draw(say(n.wealth==='poor'?'Chale, I\'m broke myself. Sorry 😩':pick(['Hmm, that\'s too much for me right now. Sorry.','I can\'t do that one, sorry.'])))});return undefined}
  if(a==='repay'){const x=p.debts.find(x=>x.n===n&&!x.done&&x.kind==='owe');if(!spend(x.amt))return say('Ah, you don\'t even have it. Next time then.');x.done=true;n.friend=clamp(n.friend+(day()<=x.due?6:1));return say(day()<=x.due?'Thank you! You\'re a person of your word. 🙏':'Finally! Thank you.')}
  if(a==='sell'){n.customer=true;advance(10);p.biz.aware+=6;n.friend=clamp(n.friend+2);return say(pick(['Oh nice! Send me your price list.','I\'ll definitely buy. Support your own!','Okay, I\'ll tell my roommates too.']))}
  if(a==='vote'){p.race.endorse.push(n);advance(15);const yes=n.friend>=45||Math.random()<.6;if(yes){p.race.support+=4;return say(pick(['You have my vote, and my whole room\'s. 🗳️','Of course! I\'ll share your flyer on my status.']))}return say('Hmm, I\'ll see. The other candidate is also my friend.')}
  if(n.talks>=5&&a!=='date')return say(pick(LINES.tired));
  n.talks++;advance(4);p.needs.social=clamp(p.needs.social+8);
  const mood=((p.needs.energy<20||p.needs.hunger<15)?-.15:0)-(p.needs.hygiene<25?.2:0);
  const persB={friendly:.15,funny:a==='joke'?.25:.05,shy:-.1,serious:a==='joke'?-.2:0}[n.pers]||0;
  const base={chat:.6,joke:.5,interest:shared.length?.85:.3,compliment:.55,flirt:.2+n.chem*.5+n.friend/250,date:.2+n.romance/120,study:.8,ask:.15+n.romance/150+n.dates*.08}[a];
  const roll=Math.random(),score=base+persB+mood+(n.mate?.08:0)+(n.prog===p.prog?.05:0);
  const out=roll<score?'good':roll<score+.25?'mid':'bad';
  if(a==='study'){S.groupStudy=(S.groupStudy||0)+1;advance(105);p.study+=12;n.friend=clamp(n.friend+8);p.needs.energy=clamp(p.needs.energy-10);return say(pick(['That was helpful! You explained it better than the lecturer.','We should do this every week.']))+' <span class="tag g">Study +12</span>'}
  if(a==='date'){if(out==='bad'&&p.partner!==n){n.romance=clamp(n.romance-5);return say(pick(LINES.date.bad))}closeSheet();dateScene(n);return null}
  if(a==='ask'){if(roll<score){p.partner=n;n.romance=100;msg(n.name,'❤️ Can\'t believe we\'re official now. Good morning text tomorrow, okay?');return say(pick(LINES.ask.good))}n.romance=clamp(n.romance-20);return say(pick(LINES.ask.bad))}
  const t=pick(LINES[a][out]).replace('%I',shared[0]||n.ints[0]);const gain={good:9,mid:3,bad:-4}[out];
  if(a==='flirt'){n.romance=clamp(n.romance+(out==='good'?12:out==='mid'?2:-8));n.friend=clamp(n.friend+(out==='bad'?-3:2))}
  else{n.friend=clamp(n.friend+gain+(a==='interest'&&shared.length?6:0));if(n.friend>40&&n.chem>.6&&out==='good')n.romance=clamp(n.romance+2)}
  if(out==='good')p.needs.fun=clamp(p.needs.fun+4);
  return say(t);
}
/* friends decide whether you can come over; once they say yes you can walk in for the rest of the day */
function visitYes(n){const p=P(),h=hour();if(n.visitOK===day())return true;if(n.visitNo===day())return false;
  const ok=Math.random()<.25+n.friend/110+(p.partner===n?.35:0)-(h>=21?.2:0)+(n.pers==='friendly'?.1:n.pers==='shy'?-.1:0);if(ok)n.visitOK=day();else n.visitNo=day();return ok}
function visitRoom(n){if(hour()<8||hour()>=22&&P().partner!==n)return toast(`${n.name}: "It's too late o, visiting hours are 08:00–22:00 😅"`);
  if(n.visitOK===day()||visitYes(n)){n.with=S.min+90;toast(`${n.name}: "${pick(['Sure, come! Excuse the mess o.','Yes! Come, I\'m in my room 🏠','Okay, come through. Bring gist 😂'])}" 🏠`);travelTo(BID[n.home].door[0],BID[n.home].door[1]);enterRoom(n)}
  else toast(`${n.name}: "${pick(['Not today, my room is a mess. Another time!','Ah, I\'m about to sleep small. Tomorrow?','My roommates have visitors already 😩'])}"`)}
function askVisitText(n){const yes=visitYes(n);toast(`📱 You text ${n.name}: "Can I come over?"`);
  setTimeout(()=>{msg(n.name,yes?pick(['Yes o, come! Room door is open 🚪','Sure, come through 😄','Come, I\'m bored anyway 😂']):pick(['Not today please, I\'m busy with assignment 😩','Ah, my room is a mess. Next time!','I\'m not in my room now, sorry']));acts(true)},1400)}
/* invite friends to your room: they reply, then turn up a little later */
function inviteReal(){const p=P(),seen=new Set(),L=[];Object.keys(MP.friends).filter(k=>!MP.blocked[k]).forEach(k=>{seen.add(k);L.push({k,nm:threadName(k),on:onlineInfo(k).on,fr:1})});mpOnline().forEach(rp=>{const k=mpKey(rp);if(!seen.has(k)){seen.add(k);L.push({k,nm:rp.nm,on:1,fr:0})}});L.sort((a,b)=>b.on-a.on||b.fr-a.fr);
  $('sheetIn').innerHTML=`<div class="eyebrow">📱 Invite someone over</div><h3>Invite a real student to your room</h3><p style="font-size:13px;opacity:.8">They get a message with where you live. Only real students live on this campus.</p>
    <div class="list">${L.length?L.slice(0,15).map((r,i)=>`<div class="item"><div class="grow"><b>${esc(r.nm)}${r.fr?' 🤝':''}</b><small>${r.on?'🟢 online':'⚪ offline · they\'ll see it later'}</small></div><button class="btn sm" data-ri="${i}">Invite</button></div>`).join(''):'<p style="font-size:14px">No one to invite yet. Say hi to students who come online, add them as friends, then invite them over.</p>'}</div><button class="ghost sm" id="bye">Close</button>`;
  $('sheetIn').querySelectorAll('[data-ri]').forEach(b=>b.onclick=async()=>{const r=L[+b.dataset.ri],v=`🏠 Come and visit me! I'm in ${roomOf().name} at ${homeB().name}${MP.rn>1?' (room '+MP.rn+')':''}. Knock when you get here 😄`;let ok=false;
    if(MP.db&&MP.uid&&!r.k.startsWith('p:')){ok=await mailSend(r.k,'m',v);if(ok)await mailSend(r.k,'vo',myRoomCard())}else{ok=!!mpSend(r.k,'m',v);if(ok)mpSend(r.k,'vis','ok|'+myRoomCard())}b.disabled=true;b.textContent=ok?'Sent ✓':'Failed';if(ok)toast(`📨 Invite sent to ${r.nm}`)});$('bye').onclick=closeSheet}
function inviteSheet(){S.paused=true;openSheet();if(NOBOTS)return inviteReal();const p=P(),L=S.npcs.filter(n=>n.met&&!n.mate&&(n.contact||n===p.partner)&&n.friend>=20).sort((a,b)=>(b===p.partner)-(a===p.partner)||b.friend-a.friend).slice(0,10);
  const g=S.guestId!=null&&S.guestUntil>S.min?npcById(S.guestId):null;
  $('sheetIn').innerHTML=`<div class="eyebrow">📱 Invite someone over</div><h3>Who do you want to invite to your room?</h3>${g?`<div class="say">${esc(g.name)} is already ${S.guestHere?'here':'on the way'}.</div>`:''}
    <div class="list">${L.length?L.map(n=>`<div class="item"><div class="grow"><b>${esc(n.name)}${n===p.partner?' ❤️':''}</b><small>${stName(n)} · ${BID[n.home].name}</small></div><button class="btn sm" data-inv="${n.id}" ${g?'disabled':''}>Invite</button></div>`).join(''):'<p style="font-size:14px">Make some friends and get their numbers first.</p>'}</div><button class="ghost sm" id="bye">Close</button>`;
  $('sheetIn').querySelectorAll('[data-inv]').forEach(b=>b.onclick=()=>{const n=npcById(b.dataset.inv);closeSheet();inviteOver(n)});$('bye').onclick=closeSheet}
function inviteOver(n){const p=P(),h=hour(),late=h>=22||h<7;toast(`📱 You text ${n.name}: "Come to my room, let's hang out!"`);
  const yes=Math.random()<(late?(p.partner===n?.75:.1):.3+n.friend/120+(p.partner===n?.35:0));
  setTimeout(()=>{if(!yes){msg(n.name,pick(['Ah, not today o. Next time! 🙏','I\'m in the library now, sorry 😩','Chale, I\'m tired. Tomorrow?']));return}
    const eta=RI(15,40);msg(n.name,pick([`Okay! I'm coming. Give me ${eta} minutes 🚶🏾`,`On my way! ${eta} mins 😄`,`Yes! Coming in ${eta} 👍`]));S.guestId=n.id;S.guestHere=false;S.guestUntil=S.min+eta+180;
    (S.pending=S.pending||[]).push({due:S.min+eta,fn:()=>guestArrive(n)})},1300)}
function guestArrive(n){if(S.guestId!==n.id)return;S.guestHere=true;n.with=S.guestUntil;
  if(IS&&IS.kind==='room'&&IS.mine){toast(`🚪 Knock knock! ${n.name} is here.`);refreshRoom()}else msg(n.name,`I'm at ${homeB().name}. Where are you? 😅 I'll wait in your room.`)}
function byeGuest(){const n=npcById(S.guestId);S.guestId=null;S.guestHere=false;S.sleepover=null;if(n){n.with=0;toast(`${n.name}: "${pick(['That was fun! See you 👋','Bye o! Text me 📱','Thanks for having me 🙏'])}"`)}refreshRoom()}
function sleepoverAsk(n,mine){const p=P(),yes=Math.random()<(n.romance>=60?.9:.55);
  if(!yes){n.romance=clamp(n.romance-1);toast(`${n.name}: "Not tonight, babe. I have an early lecture 😘"`);return}
  story(`<div class="eyebrow">🌙 Sleepover</div><h3>${esc(n.name)} stays the night</h3><p class="scene">${mine?`You push the beds closer, put on a movie and talk until you both fall asleep halfway through it.`:`${esc(n.name)} finds you an extra pillow. You watch videos on one phone and laugh until midnight.`}</p><p style="font-size:13px;color:var(--muted)">Romance +8 · you'll wake up feeling loved ❤️</p>`,[['Goodnight 😴','g',()=>{
    n.romance=clamp(n.romance+8);n.friend=clamp(n.friend+4);S.sleepover={id:n.id,day:day()};if(mine){S.guestId=n.id;S.guestHere=true;S.guestUntil=(hour()>=12?day()+1:day())*1440+10*60}
    const sl=IS.slots&&IS.slots[0];if(sl){IS.people.filter(q=>q.n===n).forEach(q=>{IS.scene.remove(q.mesh)});IS.people=IS.people.filter(q=>q.n!==n);(bp=>addInPerson(n.look,n.name,bp.x,bp.z,0,'lie',{n,lie:true,y:sl.y+.32,yaw:bp.yaw}))(bedPos(sl,.32))}
    if(mine&&S.mates.some(m=>homeNow(m)))setTimeout(()=>toast(`${S.mates[0].name} (whispering): "Eiii, we are also in this room o 😂"`),900);
    sleep();const b=S.busy;if(b){const d=b.done;b.done=()=>{d();addBuff('loved');setTimeout(()=>toast(`☀️ Good morning! ${n.name}: "${pick(['Morning, sleepyhead ❤️','I made you tea ☕','You snore small o 😂❤️'])}"`),600)}}}]])}

/* things you learn by asking: their level and hometown (fixed per person) */
function npcHash(n,salt){let h=7;for(const c of String(n.id)+salt)h=(h*31+c.charCodeAt(0))%9973;return h}
function npcLevel(n){return [100,100,100,200,200,300,400][npcHash(n,'lvl')%7]}
function npcTown(n){return ['Kumasi','Accra','Tamale','Cape Coast','Ho','Takoradi','Sunyani','Koforidua','Obuasi','Techiman','Tema','Bolgatanga'][npcHash(n,'town')%12]}

/* what you actually know about someone: you learn their course and hostel by asking (or by being friends a while) */
const knowsCourse=n=>!!(n.mate||n.know&&n.know.course||n.friend>=30),knowsHostel=n=>!!(n.mate||n.know&&n.know.hostel||n.friend>=30);
