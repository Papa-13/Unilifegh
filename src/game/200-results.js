/* ================= results ================= */
function results(){
  const p=P();const held=[0,0,0];
  for(let d=S.semStart;d<S.semEnd;d++){const t=TT[d%7];if(t)t.forEach(([c])=>held[c]++)}
  const scores=[0,1,2].map(c=>{const ex=p.exams&&p.exams[c];let s=ex?ex.score:0;
    if(c===1&&S.flags.hx===1&&!S.flags.reported&&S.sem===1)s=Math.min(s,R(32,39));return Math.round(clamp(s))});
  const A=acadAfterSemester(scores),cwa=A.cwa,cls=classOf(A.cum);
  story(`<div class="eyebrow">Exams are over · results day</div><h3>Checking results on the student portal…</h3><div class="loading"><i></i></div><p class="scene">Everyone in your hostel is refreshing the portal at the same time. It's loading slowly. Your heart is beating.</p>`,[]);
  setTimeout(()=>{
    const trail=scores.some(s=>s<40),unfair=S.flags.hx===1&&!S.flags.reported&&S.sem===1;
    story(`<div class="eyebrow">Level ${levelOf(p)} · Semester ${S.sy}${A.next==='graduate'&&S.sy===2?' · final':''} results · ${esc(p.prog)}</div><div class="big">${cwa.toFixed(1)}</div><h3>Cumulative CWA ${A.cum.toFixed(2)} · ${cls}${trail&&!p.trans[p.trans.length-1].resit?' · with a trail 😬':''}</h3>
     <table><tr><th>Course</th><th>Score</th></tr>${scores.map((s,c)=>`<tr><td>${esc(courseName(c))}${c===1&&unfair?' <span class="tag p">unfair mark</span>':''}${c===1&&S.flags.reported&&S.sem===1?' <span class="tag g">independently marked</span>':''}${p.exams&&p.exams[c]&&p.exams[c].absent?' <span class="tag p">absent · resit</span>':''}</td><td class="n" style="color:${s<40?'var(--red)':'inherit'}">${s}</td></tr>`).join('')}</table>
     ${A.resits.length?`<p><strong>Resits:</strong> ${A.resits.map(r=>`${esc(r.name)} ${r.score} ${r.ok?'✅ cleared':'❌ still a trail'}`).join(' · ')}</p>`:''}
     ${A.note?`<div class="say">${esc(A.note)}</div>`:''}
     ${unfair?`<p>${BADLEC} failed you after you refused him. Two days later a coursemate posts that he did the same thing to her. If you had reported him, your paper would have been marked independently.</p>`:''}
     ${S.flags.outcome==='suspended'&&S.sem===1?`<p>Because you reported, ${BADLEC} is suspended and can't do this to anyone else.</p>`:''}
     <p>Friends: <strong>${friendsN()}</strong> · ${p.partner?`Dating <strong>${esc(p.partner.name)}</strong> ❤️ · `:''}${p.office?`<strong>${esc(p.office)}</strong> · `:''}${p.biz?`Business earned <strong>${cedi(p.biz.earned)}</strong> · `:''}MoMo <strong>${cedi(p.money)}</strong></p>`,
     [[acadButtonLabel(),'g',acadContinue],['New character','',()=>maker()]]);
  },2800);
}
function nextSemester(roomId){const p=P();acadAdvance();const start=(Math.floor(day()/7)+1)*7;if(sharedClock())campusAlign(start);else S.min=start*1440+7*60;S.lastHour=-1;S.semStart=start;S.semEnd=start+SEM_DAYS;S.sem++;S.semesterDone=false;S.fn=S.fnDone=S.m1=S.m2=S.m5=S.mr=0;
  p.att=[0,0,0];p.study=0;p.exams={};S.offv={};S.groupStudy=0;if(p.race&&p.race.done)p.race=null;
  if(roomId){const bg=BG[p.bg],rt=ROOMS[roomId];p.money+=bg.fund-rt.price;if(roomId!==p.room)moveRoom(roomId);msg(p.bg==='rich'?'Dad':'Mum',`New academic year! We sent ${cedi(bg.fund)} for your hostel.`)}
  const home=homeB().door;p.x=home[0];p.y=home[1]+22*outDir(homeB());msg('Class rep',`${p.prog} L${levelOf(p)} · Semester ${S.sy}${S.extra?' (resits)':''} begins! Our courses: ${p.courses.join(', ')}. Same lecture times. Nominations for elections are open again.`);
  showGame();story(`<div class="eyebrow">Level ${levelOf(p)} · Semester ${S.sy}</div><h3>${S.sy===1?`Welcome to Level ${levelOf(p)}!`:'Back on campus'}</h3><p class="scene">${S.sy===1&&p.yr>1?'New academic year, new courses, same Night Market.':'New semester, same Night Market.'} New courses: <strong>${p.courses.map(esc).join(', ')}</strong>. ${S.mates.length?`Your roommate${S.mates.length>1?'s are':' is'} ${S.mates.map(n=>n.name).join(', ')}.`:'You have the room to yourself.'}</p>`,[["Let's go",'g',()=>{}]])}
