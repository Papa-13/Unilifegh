/* ================= elections ================= */
function racesFor(){const p=P(),c=COLLEGES[p.col];return[
  {id:'course',title:`Course Rep · ${p.prog} L${levelOf(p)}`,fee:0,need:0,opp:35,oppName:pick(S.npcs.filter(n=>n.prog===p.prog).map(n=>n.name).concat(['Kwame Asare'])),perk:'Lecturers share exam tips with you first (+study), and your coursemates know you.'},
  {id:'college',title:`President · ${c.short} Students' Association`,fee:150,need:55,opp:48,oppName:'Ivy Osei-Bonsu',perk:`GH₵300 honorarium per semester and a lot of respect in ${c.short}.`},
  {id:'src',title:'SRC President',fee:600,need:62,opp:62,oppName:'Daniel "DK" Kumi',perk:'GH₵800 honorarium, your face on every noticeboard, and real power to change campus.'}]}
function elections(){
  S.paused=true;openSheet();const p=P(),sd=day()-S.semStart;
  if(p.race&&!p.race.done){const r=p.race;$('sheetIn').innerHTML=`<div class="eyebrow">Your campaign</div><h3>${esc(r.title)}</h3>
    <table><tr><td>Your support</td><td class="n">${Math.round(supportScore())}</td></tr><tr><td>Opponent: ${esc(r.oppName)}</td><td class="n">~${r.opp}</td></tr><tr><td>Endorsements from friends</td><td class="n">${r.endorse.length}</td></tr><tr><td>Campaign posters</td><td class="n">${r.posters}</td></tr><tr><td>Rallies</td><td class="n">${r.rallies}</td></tr></table>
    <p style="font-size:14px">Election day is ${DAYS[(S.semStart+9)%7]} (day 10). Manifesto reading is on day 8, 17:00 at Akwaaba Square. Print posters at Print & Type, hold rallies where students gather, and ask friends for their votes.</p><button class="ghost sm" id="bye">Close</button>`;$('bye').onclick=closeSheet;return}
  const done=p.race&&p.race.done;
  $('sheetIn').innerHTML=`<div class="eyebrow">SRC Electoral Commission</div><h3>Run for office</h3>${p.office?`<div class="say">You are currently <b>${esc(p.office)}</b>.</div>`:''}
   <p style="font-size:14px">Nominations close on day 5 of the semester. Candidates are vetted on their grade forecast (now ${forecast()}).</p>
   <div class="list">${racesFor().map(r=>`<div class="item"><div class="grow"><b>${esc(r.title)}</b><small>Filing fee ${cedi(r.fee)} · needs grade forecast ${r.need}+ · ${esc(r.perk)}</small></div><button class="btn sm" data-e="${r.id}" ${done||sd>4?'disabled':''}>File</button></div>`).join('')}</div>
   ${sd>4&&!done?'<p>Nominations for this semester are closed. Try next semester.</p>':''}<button class="ghost sm" id="bye">Close</button>`;
  $('sheetIn').querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>{const r=racesFor().find(x=>x.id===b.dataset.e);
    if(forecast()<r.need)return toast(`Vetting committee: your grade forecast must be ${r.need}+.`);if(!spend(r.fee))return;
    p.race=Object.assign(r,{support:0,posters:0,rallies:0,endorse:[],manifesto:0,done:false});advance(30);closeSheet();
    msg('SRC Electoral Commission',`You have been cleared to contest for ${r.title}. Your opponent is ${r.oppName}. Campaign well!`)});
  $('bye').onclick=closeSheet;
}
function supportScore(){const p=P(),r=p.race;return 12+friendsN()*3+r.endorse.length*3+Math.min(r.posters,6)*4+r.rallies*5+r.manifesto+r.support+(r.id==='course'?S.npcs.filter(n=>n.prog===p.prog&&n.friend>=30).length*6:0)}
function rally(b){const p=P(),r=p.race;r.rallies++;const crowd=S.npcs.filter(n=>!n.hidden&&dist(n,p)<260);crowd.forEach(n=>{n.met=true;n.friend=clamp(n.friend+2)});
  doAct('Holding a campaign rally',45,{social:12,energy:-10});toast(`"Vote for change!" ${crowd.length+RI(8,25)} students stopped to listen. 📣`)}
function manifesto(){const p=P(),r=p.race;
  const promises=[['Fix water and Wi-Fi in hostels',8],['Push Rent Control to cap hostel fees',10],['Free printing for exam handouts',6],['More security lights from the Night Market to the hostels',7],['Monthly "Meet the Lecturers" town halls',5],['Free shuttle buses to Kejetia on weekends',7]];
  const pickd=[];
  const draw=()=>story(`<div class="eyebrow">Manifesto reading · Akwaaba Square</div><h3>The microphone is yours.</h3><p class="scene">Hundreds of students are watching. Pick two promises to lead with.</p>${pickd.length?`<p>So far: <strong>${pickd.map(x=>x[0]).join(' · ')}</strong></p>`:''}`,
    promises.filter(x=>!pickd.includes(x)).map(x=>[x[0],'',()=>{pickd.push(x);if(pickd.length<2)setTimeout(draw,10);else{const v=pickd.reduce((a,x)=>a+x[1],0)+(p.needs.energy>40?5:0)+(p.needs.fun>50?3:0)+RI(-3,6);r.manifesto=v;advance(120);
      story(`<h3>${v>=20?'The crowd goes wild. 🔥':v>=14?'Solid applause.':'Polite clapping…'}</h3><p class="scene">You close with "${pickd[0][0]}". ${v>=20?'Students start chanting your name.':v>=14?'People are talking about your ideas.':'Your opponent\'s supporters are louder tonight.'}</p><p>Support +${v}</p>`,[['Step off stage','g',()=>{}]])}}]));
  draw();
}
function electionResult(){const p=P(),r=p.race;r.done=true;const you=supportScore()+RI(-8,8),them=r.opp+RI(-8,8),won=you>them;
  const total=r.id==='src'?RI(9000,16000):r.id==='college'?RI(1200,2600):RI(80,140);const yv=Math.round(total*you/(you+them));
  if(won){p.office=r.title;if(r.id==='college')p.money+=300;if(r.id==='src')p.money+=800;p.needs.social=100;S.npcs.forEach(n=>n.friend=clamp(n.friend+(r.id==='src'?8:3)))}
  if(IS)leaveRoom(true);
  story(`<div class="eyebrow">Election results · ${esc(r.title)}</div><div class="big">${yv.toLocaleString('en-GB')} – ${(total-yv).toLocaleString('en-GB')}</div><h3>${won?`You won! 🎉`:`${esc(r.oppName)} won this time.`}</h3>
    <p class="scene">${won?`Your friends lift you onto their shoulders. ${r.id==='src'?'The whole campus is talking about you.':'Congratulations messages flood your phone.'} ${esc(r.perk)}`:'You fought hard. Your supporters say you should run again next semester, and they mean it.'}</p>`,[[won?'Let\'s get to work':'Next time','g',()=>{}]])}
