/* ================= Hall Week and graduation with friends =================
   Hall Week Jams (night party at the Parade Grounds) and the Inter-Hall Football Final at the
   Sports Field: play for your hostel (5-a-side with your hostel mates) and win the trophy.
   When you graduate, real friends get an invitation to your congregation and can send
   congratulations (and a gift on MoMo, on the website). Message kinds: gi (invite), gc (congrats). */
const HALL_KINDS=['gi','gc'];
function hallFinalPlay(){const p=P(),mates=S.npcs.filter(n=>n.home===p.home&&!n.hidden&&!n.mirror&&!n.mate).slice(0,3);
  if(S.hallFinal&&S.hallFinal.d===day())return toast('You already played the final today.');
  S.hallFinal={d:day(),home:p.home,opp:pick(Object.keys(BID).filter(k=>['lodge','sunrise','royal','bayview','heights','kotei'].includes(k)&&k!==p.home))};
  story(`<div class="eyebrow">⚽ Inter-Hall Football Final</div><h3>${esc(BID[p.home].name)} vs ${esc(BID[S.hallFinal.opp].name)}</h3><p class="scene">The whole hostel is at the touchline with drums, vuvuzelas and a giant flag. Your captain hands you a jersey: "Today we bring the trophy home."</p>`,
    [['⚽ Kick off!','g',()=>{S.sportRoster=mates;doAct('Playing football',60,{fun:25,energy:-15,social:12,hygiene:-12})}],['Maybe next time','',()=>{S.hallFinal=null}]])}
function hallFinalResult(r){const H=S.hallFinal;if(!H||H.done)return;H.done=1;const p=P(),win=r.win>0,draw=r.win===0;
  if(draw)H.pens=Math.random()<.5+Math.min(.2,(p.fit||0)*.01);const won=win||(draw&&H.pens);
  if(won){p.money+=200;p.needs.fun=clamp(p.needs.fun+20);S.trophies=(S.trophies||0)+1;try{addBuff('won')}catch(e){}}
  setTimeout(()=>story(`<div class="eyebrow">⚽ Inter-Hall Final · full time</div><h3>${won?`🏆 ${esc(BID[H.home].name)} are CHAMPIONS!`:`${esc(BID[H.opp].name)} win the trophy 😩`}</h3>
    <p class="scene">${draw?(H.pens?'It went to penalties. You stepped up for the last kick and sent the keeper the wrong way!':'It went to penalties. Their keeper saved the last one. So close.'):won?'The final whistle blows and the whole hostel storms the pitch. They lift you onto their shoulders.':'You fought until the last minute. Your hostel mates still sing your name on the walk home.'}</p>
    ${won?'<div class="big">+GH₵200</div><p>Prize money from the SRC, and bragging rights for a whole year.</p>':''}`,[[won?'🎉 Celebrate':'Next year','g',()=>{}]]),1500)}
/* Hall Week actions (added to the place menus) */
function hallWeekActs(b,a){const e=eventNow();if(!e)return;
  if(b.id==='field'&&e.id==='hallfb'){a.unshift(['⚽ Play for your hostel in the final',()=>hallFinalPlay(),null,'b']);a.push(['📣 Cheer from the touchline (1h)',()=>{doAct('Cheering at the inter-hall final',60,{fun:18,social:12});meetRandom('field')}])}
  if(b.id==='parade'&&e.id==='hallnite'){a.unshift(['🎉 Dance at the Hall Week Jams (1h)',()=>{doAct('Dancing at the Hall Week Jams',60,{fun:28,social:15,energy:-12,hygiene:-6});meetRandom('parade')},null,'b']);a.push(['🥤 Sobolo & kebab at the jams · GH₵20',()=>eat(20,30,'sobolo & kebab at the jams',8)])}}
/* ---- graduation with friends ---- */
function gradInvite(){if(typeof MP==='undefined'||!MP.campus)return;const fr=Object.keys(MP.friends||{}).filter(k=>!MP.blocked[k]);if(!fr.length)return;const p=P();
  fr.forEach(k=>{try{relSend(k,'gi',`${p.prog}|${p.grad}`)}catch(e){}});toast(`🎓 Invitations sent to ${fr.length} friend${fr.length>1?'s':''}. They'll be told you graduated.`)}
function hallIn(ck,nm,k,tx,id){const seen=relSeen();if(id){if(seen.has(id))return;seen.add(id);mpStore.set('relSeen',[...seen].slice(-300))}if(MP.blocked[ck])return;nm=mpClean(nm,16)||'A friend';
  if(k==='gi'){const [prog,cls]=String(tx).split('|');relShow(`<div class="eyebrow">🎓 Congregation · Great Hall</div><h3>${esc(nm)} just graduated!</h3><p class="scene">${esc(nm)} walked across the stage today: <b>${esc(prog||'')}</b>, ${esc(cls||'')}. The family is taking a hundred photos outside the Great Hall.</p>`,
    [['🎉 Send congratulations','g',()=>{relSend(ck,'gc','🎉');mpSys(ck,`You congratulated ${nm} on graduating 🎓`);toast('🎉 Congratulations sent!');P().needs.social=clamp(P().needs.social+6)}],
     ...(typeof MB!=='undefined'&&MB.on?[['💸 Send a gift on MoMo','',()=>{relSend(ck,'gc','🎉');mbSendSheet(ck,nm)}]]:[]),['Later','',()=>{}]]);return}
  if(k==='gc'){toast(`🎉 ${nm} congratulated you on graduating!`);mpSys(ck,`${nm} congratulated you on graduating 🎓`);P().needs.social=clamp(P().needs.social+5)}}
