/* ================= class life: lecturers with moods, lateness, phones, rejoining =================
   - Step out of a lecture (or get interrupted) and you can come back and sit down again.
   - Each lecturer has a mood every day. On a bad day, walking in more than 15 minutes late can get
     you sent out ("Get out of my class!"). On a good day they pardon you. You can try to beg.
   - Using your phone in class can get you caught: a warning, or on a bad day, sent out.
   - Sometimes the lecturer points at you with a question. */
BUFFS.sacked=['🚪','Sent out of class','tense',150];BUFFS.praised=['🌟','Praised in class','focused',180];
function lecMood(c){const h=wxHash('mood'+day()+'-'+c+(S.sem||1)),bad=c===1?.5:.2,good=c===1?.15:.45;return h<bad?'bad':h>1-good?'good':'ok'}
const LEC_SAY={bad:['is not in a good mood today','looks like someone stepped on their toes this morning','is already shouting at the front row'],ok:['looks tired but calm','is in a normal mood','is sipping a coffee'],good:['is smiling and cracking jokes','is in a great mood today','greets everyone warmly']};
function lecSack(c,why){const p=P(),R=S.lecR;if(R){R.sacked=1;R.done=1}S.sackN=(S.sackN||0)+1;p.needs.fun=clamp(p.needs.fun-10);p.needs.social=clamp(p.needs.social-6);addBuff('sacked');
  if(S.busy&&/lecture$/.test(S.busy.label)){S.busy.cancel=true;finishBusy()}try{window.track&&window.track('sent_out_of_class',{why})}catch(e){}hud();acts(true)}
function lecSackStory(c,lateMin,why){const nm=lecturerOf(c),R=S.lecR;
  const line=why==='phone'?pick([`"You! Yes, you with the phone. If your phone is more interesting than my lecture, take it outside."`,`"Phones in my class? Pack your things and go. Now."`]):pick([`"${lateMin} minutes late and you walk in like you own the place? Get out of my class!"`,`"Look at the time. Come back when you're serious. Out!"`,`"No, no, no. You can't come in ${lateMin} minutes late. Out."`]);
  story(`<div class="eyebrow">📚 ${esc(courseName(c))}</div><h3>${esc(nm)} stops the lecture.</h3><p class="scene">${line}</p><p>The whole class turns to look at you. 😳</p>`,
    [['🙏 "Please, I\'m sorry. It won\'t happen again."','g',()=>{const ok=Math.random()<(why==='phone'?.3:.38)+(P().study>60?.1:0);
        if(ok){toast(`${nm.split(' ').slice(-1)[0]} sighs: "Sit down. Last warning." 😮‍💨`);if(R)R.warned=(R.warned||0)+1;lecSeat(true)}
        else{story(`<p class="scene">"I said OUT." Someone at the back laughs. You pick up your bag and leave. 🚶</p>`,[['Leave','',()=>lecSack(c,why)]])}}],
     ['🚶 Leave quietly','',()=>lecSack(c,why)]])}
/* sit (or sit back) in your lecture */
function lecSeat(again){const R=S.lecR;if(!R||R.done)return;const end=day()*1440+(R.st+2)*60;if(S.min>=end-2){R.done=1;return}
  if(again)toast(R.back?'You slip back into your seat 🪑':'You sit down and open your notes 📒');R.back=1;
  startBusy(`${courseName(R.c)} lecture`,{pose:'sitWrite',spot:IS&&IS.spots.seat,mins:Math.max(5,end-S.min)},0,()=>{R.done=1;lectureDone(R.c,R.st,R.late)})}
lecture=function(L){const p=P(),[c,st]=L,dk=day()+'-'+c,lateMin=Math.round((hour()-st)*60);let R=S.lecR&&S.lecR.k===dk?S.lecR:null;
  if(!R&&S['att'+dk])return toast('You already attended this lecture.');
  if(R&&R.sacked)return toast(`${lecturerOf(c)} sent you out today. You can't go back in until the next lecture.`);
  if(R&&R.done)return toast('You already attended this lecture.');
  if(R){lecSeat(true);return}
  R=S.lecR={k:dk,c,st,late:lateMin>15,warned:0};S['att'+dk]=1;const mood=lecMood(c),nm=lecturerOf(c);
  if(lateMin>15){const sack=mood==='bad'?(lateMin>40?1:.7):mood==='ok'?(lateMin>40?.4:.1):0;
    if(Math.random()<sack)return lecSackStory(c,lateMin,'late');
    if(mood==='good')toast(`${nm} smiles: "Ah, you're late. Sit down quickly, we're on slide 4." 😅`);else toast(`${nm} glares at you as you walk in ${lateMin} minutes late. 😬`)}
  else if(Math.random()<.5)toast(`${nm} ${pick(LEC_SAY[mood])}.`);
  lecSeat(false)};
/* the phone: lecturers notice */
{const _ph=phone;phone=function(tab){const r=_ph.apply(this,arguments);try{const R=S.lecR;if(S.busy&&/lecture$/.test(S.busy.label)&&R&&!R.done){const mood=lecMood(R.c),ch=(mood==='bad'?.42:mood==='ok'?.25:.12)+(R.warned||0)*.1;
  if(Math.random()<ch)setTimeout(()=>{if(!S.busy||!/lecture$/.test(S.busy.label))return;closeSheet();
    if(mood==='bad'||(R.warned||0)>=1)lecSackStory(R.c,0,'phone');else{R.warned=(R.warned||0)+1;story(`<div class="eyebrow">📚 ${esc(courseName(R.c))}</div><h3>"Whoever is on their phone, put it away."</h3><p class="scene">${esc(lecturerOf(R.c))} is looking straight at you. Next time you're out.</p>`,[['📵 Put it away','g',()=>{}]])}},900+Math.random()*1500)}}catch(e){}return r}}
/* the lecturer asks you a question, now and then */
const LEC_Q=[['What does GPA stand for?',['Grade Point Average','General Pass Average','Graded Paper Assessment'],0],['Which is the capital of the Ashanti Region?',['Tamale','Kumasi','Cape Coast'],1],
  ['If an assignment is due Friday and today is Wednesday, how many days do you have?',['Two','Three','One'],0],['What does "plagiarism" mean?',['Copying someone\'s work as your own','Working in a group','Citing your sources'],0],
  ['Which comes first in a research report?',['Conclusion','Abstract','References'],1],['What is 15% of 200?',['20','30','45'],1],['Who was Ghana\'s first President?',['Kwame Nkrumah','J. B. Danquah','Kofi Annan'],0]];
{const _hp=hourly;hourly=function(){const r=_hp.apply(this,arguments);try{const hk=day()*24+Math.floor(hour());if(S&&S._lqH!==hk){S._lqH=hk;const R=S.lecR;
  if(S.busy&&/lecture$/.test(S.busy.label)&&R&&!R.done&&!R.asked&&Math.random()<.4&&$('story').hidden){R.asked=1;const [q,opts,ok]=pick(LEC_Q),nm=lecturerOf(R.c);
    story(`<div class="eyebrow">📚 ${esc(courseName(R.c))}</div><h3>${esc(nm)} points at you.</h3><p class="scene">"You there. ${esc(q)}"</p>`,opts.map((o,i)=>[o,'',()=>{const p=P();
      if(i===ok){p.study+=3;addBuff('praised');toast(`"Correct! Very good." ${nm} nods at you. Study +3 🌟`)}else{p.needs.fun=clamp(p.needs.fun-4);addBuff('embarrassed');toast('"No. Anybody else?" A few people giggle. 😳')}hud()}]))}}}catch(e){}return r}}
/* the "lecture is starting" banner goes away once you're actually at class */
{const _eb=enterBuilding;enterBuilding=function(id){const r=_eb.apply(this,arguments);try{if(id===P().col&&$('lecNote'))$('lecNote').hidden=true}catch(e){}return r}}
{const _lc=lecture;lecture=function(){try{if($('lecNote'))$('lecNote').hidden=true}catch(e){}return _lc.apply(this,arguments)}}
