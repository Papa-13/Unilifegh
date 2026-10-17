/* ================= pre-game: background → programmes → admission → hostel ================= */
function rollBackground(){
  const r=Math.random(),bg=r<.2?'rich':r<.7?'avg':'poor';const b=BG[bg];const agg=RI(...b.agg);
  PRE={bg,agg};
  document.body.classList.remove('playing');document.body.classList.add('setup');panelMode('form');$('game').hidden=true;$('top').hidden=true;$('panel').hidden=false;
  const order=['poor','avg','rich'],reel=Array.from({length:18},(_,i)=>order[i%3]);
  $('panel').innerHTML=`<div class="fam">${stepBar(1)}<h2 class="it">Your family</h2><div class="reel"><div class="reel-in" style="--to:${15+order.indexOf(bg)}">${reel.map(k=>`<div><em>${BG[k].emoji}</em>${BG[k].name}</div>`).join('')}</div></div><p class="story">Where you come from decides your allowance, your rent money and your exam results. Let's see…</p></div>`;
  setTimeout(()=>{$('panel').innerHTML=`<div class="fam">${stepBar(1)}<div class="badge">${b.emoji}</div><h2 class="it">You come from ${bg==='avg'?'an':'a'} ${b.name.toLowerCase()}</h2>
    <p class="story">${b.story}</p>
    <div class="receipt"><h4><span>Family support</span><span>MoMo</span></h4><div class="ln"><span>Toward rent, each year</span><i></i><b>${cedi(b.fund)}</b></div><div class="ln"><span>Allowance, every Monday</span><i></i><b>${cedi(b.allow)}</b></div><div class="ln"><span>On your MoMo now</span><i></i><b>${cedi(b.momo)}</b></div>
      <div class="agg"><strong>${agg}</strong><small><b>Your WASSCE aggregate.</b><br>6 is the best possible. It decides which programmes you can get.</small></div></div>
    <button class="sbtn sm" id="nx">Choose your programmes</button></div>`;$('nx').onclick=programmes},2700);
}
function programmes(){
  const sel=[];let cur=Object.keys(COLLEGES)[0];
  panelMode('form');const draw=()=>{$('panel').innerHTML=`<div class="scr">${stepBar(2)}<h2 class="it">Apply for 4 programmes</h2><p class="ilead" style="font-size:14px">Your aggregate is <b>${PRE.agg}</b>. A green number means the cut-off is ${PRE.agg} or higher, so you qualify. The university tries your first choice first.</p>
    <div class="slots">${[0,1,2,3].map(i=>`<button class="slot${sel[i]?' on':''}" data-rm="${i}" ${sel[i]?'':'disabled'}><i>${i+1}</i><span>${sel[i]?esc(sel[i].name):'Empty'}</span></button>`).join('')}</div>
    <div class="coltabs">${Object.entries(COLLEGES).map(([c,v])=>`<button class="pick" data-col="${c}" aria-pressed="${c===cur}">${v.short}</button>`).join('')}</div>
    <p class="colname">${COLLEGES[cur].name}</p>
    <div class="proglist">${COLLEGES[cur].progs.map(([n,cut])=>{const i=sel.findIndex(x=>x.name===n),ok=cut>=PRE.agg;return `<button class="pick prog${ok?' ok':''}" data-pg="${esc(n)}" aria-pressed="${i>=0}">${i>=0?`<i>${i+1}</i>`:''}<span>${esc(n)}</span><small>${cut}</small></button>`}).join('')}</div>
    <div class="row"><button class="sbtn sm" id="nx" ${sel.length<4?'disabled':''}>${sel.length<4?`Pick ${4-sel.length} more`:'Submit application'}</button><button class="ghost" id="clr">Clear</button></div></div>`;
    $('panel').querySelectorAll('[data-col]').forEach(b=>b.onclick=()=>{cur=b.dataset.col;draw()});
    $('panel').querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{sel.splice(+b.dataset.rm,1);draw()});
    $('panel').querySelectorAll('[data-pg]').forEach(b=>b.onclick=()=>{const pg=ALLPROGS.find(x=>x.name===b.dataset.pg);const i=sel.indexOf(pg);if(i>=0)sel.splice(i,1);else if(sel.length<4)sel.push(pg);draw()});
    $('clr').onclick=()=>{sel.length=0;draw()};$('nx').onclick=()=>admit(sel)};
  draw();
}
function admit(sel){
  const agg=PRE.agg;let got=null,how='';
  for(let i=0;i<4&&!got;i++)if(agg<=sel[i].cut){got=sel[i];how=i===0?'your first choice':`your ${['','second','third','fourth'][i]} choice`}
  if(!got&&PRE.bg==='rich'){const f=sel.find(x=>agg<=x.cut+3);if(f){got=f;how='a fee-paying place (your family pays an extra GH₵3,500)';PRE.feePaying=true}}
  if(!got){const same=ALLPROGS.filter(x=>x.col===sel[0].col&&x.cut>=agg).sort((a,b)=>a.cut-b.cut)[0];got=same||ALLPROGS.filter(x=>x.cut>=agg).sort((a,b)=>a.cut-b.cut)[0];how=`none of your choices, so the university offered you another programme`}
  PRE.prog=got.name;PRE.col=got.col;
  const who=(myLook.name||'').trim()||'Student',date=new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});panelMode('form');
  $('panel').innerHTML=`<div class="letter-wrap">${stepBar(3)}<div class="letter" role="article" aria-label="Admission letter"><div class="lh"><svg class="lcrest" viewBox="0 0 46 52" aria-hidden="true"><path d="M3 3h40v22c0 14-10 22-20 25C13 47 3 39 3 25z" fill="#2a1a14"/><path d="M8 8h30v16c0 10-7 16-15 19C15 40 8 34 8 24z" fill="#f5b41f"/><path d="M8 28h30v5H8z" fill="#1e9a57"/><polygon points="23,11 25.2,16.6 31,16.8 26.4,20.3 28,26 23,22.7 18,26 19.6,20.3 15,16.8 20.8,16.6" fill="#d93a2b"/></svg><div><b>Akwaaba University</b><small>Office of the Registrar, Admissions</small></div></div>
   <p style="text-align:right;font-size:13px">${date}</p><p>Dear ${esc(who)},</p><p><b>Offer of admission: ${esc(got.name)}</b></p>
   <p>We are pleased to offer you admission to read <b>${esc(got.name)}</b> in the ${COLLEGES[got.col].name}, starting at Level 100. With an aggregate of ${agg}, you got ${how}. The cut-off was ${got.cut}.</p>
   <p>The programme runs for ${yearsFor(got.name)} years. Your first-semester courses are:</p><div class="crs">${coursesFor(got.name,got.col).map(c=>`<span>${esc(c)}</span>`).join('')}</div>
   <p>Congratulations, and akwaaba.</p><p class="sig">A. Owusu-Mensah</p><p class="sigl">Registrar</p><div class="stamp${PRE.feePaying?' fee':''}">${PRE.feePaying?'Fee-paying':'Admitted'}</div></div>
   <button class="sbtn sm" id="nx" style="align-self:flex-start">Find a hostel</button></div>`;
  $('nx').onclick=()=>hostelPick(false);
}
function hostelPick(next){
  if(next){S.paused=true;if(IS)leaveRoom(true)}
  document.body.classList.remove('playing');document.body.classList.add('setup');panelMode('form');$('game').hidden=true;$('top').hidden=true;$('story').hidden=true;$('sheet').hidden=true;$('panel').hidden=false;
  const bg=BG[next?P().bg:PRE.bg],have=next?P().money:bg.momo-(PRE.feePaying?3500:0);
  let hi=HOSTELS.findIndex(h=>h.id==='lodge');if(hi<0)hi=0;const TOWNS=[...new Set(HOSTELS.map(h=>h.town))];const draw=()=>{const h=HOSTELS[hi];
  $('panel').innerHTML=`<div class="scr">${next?'':stepBar(4)}<h2 class="it">${next?`Level ${levelOf(P())+(S.nextKind==='newyear'?100:0)}: choose a hostel`:'Choose a hostel'}</h2>
   <div class="sum"><span>Family pays <b>${cedi(bg.fund)}</b></span><span>Your MoMo <b>${cedi(have)}</b></span><span>Keep at least <b>${cedi(MINPOCKET)}</b></span></div>
   <p style="font-size:13px;opacity:.85;margin:0 0 4px">Like at KNUST, most students live in the towns around campus. Closer to lectures costs more.</p>
   <div class="htabs" style="margin-bottom:6px">${TOWNS.map(t=>`<button class="pick" data-town="${esc(t)}" aria-pressed="${t===h.town}"><b>📍 ${esc(t)}</b><small>${HOSTELS.filter(x=>x.town===t).length} place${HOSTELS.filter(x=>x.town===t).length>1?'s':''}</small></button>`).join('')}</div>
   <div class="htabs">${HOSTELS.map((x,i)=>x.town!==h.town?'':`<button class="pick" data-h="${i}" aria-pressed="${i===hi}"><b>${x.name.replace(' Hostel','').replace(' Towers','')}</b><small>${'★'.repeat(x.tier+1)} · from ${cedi(Math.min(...x.rooms.map(r=>r.price)))}</small></button>`).join('')}</div>
   <div class="hcard"><div class="hhead"><b>${h.name} <small style="opacity:.7">· ${esc(h.town)}</small></b><span class="tag y">${['Budget','Mid-range','Comfortable','Premium'][h.tier]}</span></div><p class="hblurb">${h.blurb}</p>
   <div class="rooms">${h.rooms.map(r=>{const left=have+bg.fund-r.price,bl=next?null:bedsLeft(r.id);return `<button class="room" data-r="${r.id}" ${left<MINPOCKET||bl===0?'disabled':''}>
     <span class="rt"><b>${r.large?'Large ':''}${r.beds===1?'Single':r.beds+' in a room'}</b><span class="beds">${'<i></i>'.repeat(r.beds)}</span></span><span class="price">${cedi(r.price)}<small> /yr</small></span>
     <span class="feats">${[`📐 ${r.m2} m²`,r.ac?'❄️ AC':'🌀 Fan',h.tier>=2?'🚿 Own bath':'🚿 Bath',r.kitchen?'🍳 Kitchenette':'🍳 Shared kitchen',r.tv?'📺 TV':null].filter(Boolean).map(x=>`<i>${x}</i>`).join('')}</span>
     ${bl!=null?`<small class="left" style="color:${bl?'#7fd8ff':'var(--red)'}">${bl?`🛏 ${bl} bed${bl>1?'s':''} left on ${esc(campName(MP.campus))}`:'Full on this campus'}</small>`:''}<small class="left" style="color:${left<MINPOCKET?'var(--red)':'#9be3b6'}">${left<0?`Need ${cedi(-left)} more`:left<MINPOCKET?`Leaves only ${cedi(left)}`:`Left after rent: ${cedi(left)}`}</small></button>`}).join('')}</div></div></div>`;
  $('panel').querySelectorAll('[data-h]').forEach(b=>b.onclick=()=>{hi=+b.dataset.h;draw()});$('panel').querySelectorAll('[data-town]').forEach(b=>b.onclick=()=>{hi=HOSTELS.findIndex(x=>x.town===b.dataset.town);draw()});
  $('panel').querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{const id=b.dataset.r;
    if(next)nextSemester(id);else{PRE.room=id;if(MP.campus)MP.rn=pickRoomNo(id);start()}})};
  draw();
}
function showGame(){try{gbSync()}catch(e){}try{if(srcOn())srcPresident()}catch(e){}setTimeout(()=>{try{const r=!!S.mbReset;S.mbReset=0;mbSync(r)}catch(e){}},1200);document.body.classList.add('playing');document.body.classList.remove('setup');panelMode('');if(S&&!S.introTip){S.introTip=1;setTimeout(()=>toast('🎯 Tap Tasks for today\'s goals and earn 💎 gems. ▶▶ speeds up time, ❚❚ pauses.'),2500)}$('panel').hidden=true;$('game').hidden=false;$('top').hidden=false;S.paused=false;hud();acts(true);requestAnimationFrame(()=>render(0,true))}
function start(){
  NOBOTS=!!MP.campus;newGame();S.mbReset=1;if(MP.campus){campusAlign(0);mpSyncMates();mpWriteMember()}showGame();const rt=roomOf(),p=P();setTimeout(saveGame,1500);const RM=realMates();
  story(`<div class="eyebrow">Move-in day · ${homeB().name}</div><h3>Akwaaba, ${esc(p.name==='You'?'fresher':p.name)}!</h3>
    <p class="scene">${esc(p.prog)}, ${COLLEGES[p.col].short}. You're in a <strong>${esc(rt.name.toLowerCase())}</strong> at ${homeB().name}. ${S.mates.length||RM.length?`Your roommate${S.mates.length+RM.length>1?'s are':' is'} ${S.mates.map(n=>n.name).concat(RM.map(m=>m.nm+' (a real student 🌐)')).join(', ')}.`:'You have the whole room to yourself'+(MP.campus?' for now. Real students who pick the same room will move in with you.':'.')} Classes start today.${MP.campus?` You live on <strong>${esc(campName(MP.campus))}</strong> with other real students. There are no computer players here: every student you meet is a real person. If it's quiet, invite friends to join this campus. Tap 🌐 to see who's online.`:''}</p>
    <p><strong>Getting around:</strong> 🚐 Tech Junction & the Commercial Area (west, by the main gate on the Accra–Kumasi Road), 🏛️ Administration, Library & Great Hall, 🏠 the halls and Parade Grounds (centre), 🎓 the Faculty Area (east, by the Ayeduase Gate), ⚽ sports (south). Most hostels are in the towns: Ayeduase, Kotei, Bomso, Ayigya, Gyinyaase and more. Use the free shuttle, taxis, trotros or an okada.</p><p><strong>How to play:</strong> tap the ground (or the map) to walk. Walk up to buildings to see what you can do. Go into your room to sleep, study, eat and decorate. Walk up to people to talk, borrow money or ask for votes. Buy foodstuff at the Campus Market and cook in your hostel kitchen, bath to stay fresh, swim at the pool and party at Club Vibes at night. Walk, sit, play, study and go to class with friends; plan meetups from your chats with 📍. Check your phone timetable for SRC Week events at the Parade Grounds, ending with a big concert. Student Affairs & SRC has elections, a business desk, jobs, loans and housing. Check your 📱 phone.</p>`,[["Let's go",'g',()=>{}]]);
}
