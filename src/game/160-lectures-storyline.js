/* ================= lectures & harassment storyline ================= */
function lecture(L){
  const p=P(),[c,st]=L,dk=day()+'-'+c;
  if(S['att'+dk])return toast('You already attended this lecture.');S['att'+dk]=1;
  const late=hour()>st+.25;startBusy(`${courseName(c)} lecture`,{pose:'sitWrite',spot:IS&&IS.spots.seat,mins:Math.max(15,day()*1440+(st+2)*60-S.min)},0,()=>lectureDone(c,st,late))}
function lectureDone(c,st,late){const p=P();S.min=Math.max(S.min,day()*1440+(st+2)*60);hourly();p.att[c]++;try{ev('lecture',c)}catch(e){}
  const g=(late?6:9)+(p.office&&p.office.startsWith('Course Rep')?2:0);p.study+=g;p.needs.energy=clamp(p.needs.energy-8);p.needs.fun=clamp(p.needs.fun-6);
  const cb=IS&&IS.buddy;if(cb){togetherBonus(cb,4);p.study+=1}
  toast(`${courseName(c)} with ${lecturerOf(c)}${late?' (you came late)':''} · Study +${g+(cb?1:0)}${cb?` · you sat with ${cb.name} and shared notes 📝`:''}`);
  if(c===1&&S.flags.hx===0&&day()>=S.semStart+2&&S.sem===1)setTimeout(harassStart,600);
  hud();acts(true);
}
function harassStart(){S.flags.hx=1;S.flags.hxDay=day();
  story(`<div class="eyebrow">After ${esc(courseName(1))}</div><h3>"See me in my office."</h3>
   <p class="scene">As everyone packs up, ${BADLEC} calls your name. In his office, he closes the door and pulls up your continuous assessment.</p>
   <p class="scene">"Your marks are not good at all. You could fail my course." He leans back. "But you are a smart student. If you come and see me privately at my house this weekend, I can make sure you pass. Nobody needs to know."</p>`,
   [['Quietly start recording on your phone','m',()=>harass2(true)],['"No. That\'s not okay."','',()=>harass2(false)],['Walk out immediately','',()=>harassEnd()]])}
function harass2(rec){if(rec)S.flags.evidence=true;
  story(`<h3>${rec?'Your phone is recording.':'He narrows his eyes.'}</h3><p class="scene">${rec?`You ask him to repeat what he means. "You heard me. Come to my house on Saturday and your grade is sorted. If you refuse, don't expect to pass." It's all on your phone.`:`"Think about it carefully. Grades are in my hands. If you refuse, don't expect to pass."`}</p>`,
   [['"No. I\'m going to earn my grade."','',()=>harassEnd()],['Leave the office','',()=>harassEnd()]])}
function harassEnd(){story(`<h3>You're out of the office.</h3><p class="scene">Your hands are shaking. None of this is your fault.</p><p>You can report this confidentially at <strong>Student Affairs & SRC</strong>${S.flags.evidence?'. Your recording will help.':'.'} Talking to a friend you trust can help too.</p>`,[['OK','',()=>{}]])}
function report(){const backers=S.npcs.filter(n=>n.friend>=45);
  story(`<div class="eyebrow">Student Affairs</div><h3>Confidential report</h3><p class="scene">A calm officer from the anti-sexual harassment committee takes you to a quiet room. "You did the right thing coming here. Tell us what happened, in your own words."</p>
   <p>${S.flags.evidence?'You play the recording.':'You have no recording, but you explain everything clearly.'} ${backers.length>=2?`${backers[0].name} and ${backers[1].name} came with you for support.`:''}</p><p>The committee will investigate. Your ${esc(courseName(1))} papers will be marked by an independent examiner in the meantime.</p>`,
   [['Submit the report','g',()=>{S.flags.reported=true;S.flags.repDay=day();S.flags.backers=backers.length;advance(45)}]])}
function resolveReport(){S.flags.resolved=true;const strong=S.flags.evidence||S.flags.backers>=2;S.flags.outcome=strong?'suspended':'pending';
  msg('Student Affairs',strong?`Update on your report: ${BADLEC} has been suspended pending a disciplinary hearing. Your course will be marked independently. Thank you for your courage.`:`Update on your report: the committee has taken statements and the investigation continues. Your course will be marked independently, so your grade is protected.`);
  if(strong)S.lecs[1].gone=true}
