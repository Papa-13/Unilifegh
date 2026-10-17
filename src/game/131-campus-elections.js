/* ================= SRC elections between real students (online campuses, website) =================
   Every real week a campus elects its SRC President. Any real student can run (GH₵300 fee and a
   slogan), campaign on campus chat, and every real student gets one vote. Votes stay secret until
   the week ends; then the winner is SRC President for the next week, with a 👑 on their card.
   Firestore: cands/{term}_{uid} = {c, uid, nm, slogan, at} · votes/{term}_{uid} = {c, by, for, at}
   (term = campus id + week number). Only you can write your own candidacy and your own vote. */
const SRC_FEE=300,WEEK_MS=7*86400e3;
const srcWeek=()=>Math.floor((Date.now()+(window.__srvOff||0))/WEEK_MS);
const srcTerm=(w=srcWeek())=>(MP.campus||'')+'-w'+w;
const srcEndsIn=()=>WEEK_MS-((Date.now()+(window.__srvOff||0))%WEEK_MS);
const SRC={cache:{},pres:{}};
const srcOn=()=>typeof MP!=='undefined'&&!!MP.campus&&!!MP.db&&!!MP.uid&&!!window.fbIdToken;
async function srcLoad(term,force){const c=SRC.cache[term];if(c&&!force&&Date.now()-c.t<30000)return c;
  const out={t:Date.now(),cands:[],votes:[]};try{
    const [cs,vs]=await Promise.all([MP.db.collection('cands').where('c','==',term).get(),MP.db.collection('votes').where('c','==',term).get()]);
    out.cands=cs.docs.map(d=>d.data()).filter(Boolean);out.votes=vs.docs.map(d=>d.data()).filter(Boolean)}catch(e){out.err=1}
  SRC.cache[term]=out;return out}
function srcTally(L){const n={};L.votes.forEach(v=>{if(L.cands.some(c=>c.uid===v.for))n[v.for]=(n[v.for]||0)+1});return n}
/* last week's winner is this week's president */
async function srcPresident(){const key=srcTerm(srcWeek()-1);if(SRC.pres[key]!==undefined)return SRC.pres[key];const L=await srcLoad(key);if(L.err)return null;
  const n=srcTally(L);const win=L.cands.slice().sort((a,b)=>(n[b.uid]||0)-(n[a.uid]||0)||a.at-b.at)[0];SRC.pres[key]=win&&n[win.uid]?{uid:win.uid,nm:win.nm,votes:n[win.uid]}:null;return SRC.pres[key]}
function srcWhen(ms){const h=Math.floor(ms/3600e3);return h>=24?`${Math.floor(h/24)}d ${h%24}h`:`${h}h ${Math.floor(ms%3600e3/60000)}m`}
async function srcSheet(note=''){if(!srcOn()){elections();return}S.paused=true;openSheet();$('sheetIn').innerHTML='<h3>🗳️ Loading the election…</h3><div class="loading"><i></i></div>';
  const term=srcTerm(),[L,pres]=await Promise.all([srcLoad(term,true),srcPresident()]);if($('sheet').hidden)return;
  if(L.err){$('sheetIn').innerHTML='<h3>🗳️ SRC election</h3><p>Couldn\'t load the election. The game owner may need to update the database rules (docs/DEPLOY.md).</p><div class="row"><button class="ghost sm" id="srcSolo">Play the story election instead</button><button class="ghost sm" id="bye">Close</button></div>';$('bye').onclick=closeSheet;$('srcSolo').onclick=()=>elections();return}
  const me=MP.uid,mine=L.cands.find(c=>c.uid===me),myVote=L.votes.find(v=>v.by===me),turnout=L.votes.length;
  $('sheetIn').innerHTML=`<div class="eyebrow">${esc(campName(MP.campus))} · real students</div><h3>🗳️ SRC Presidential Election</h3>
   ${pres?`<div class="say">👑 Current SRC President: <b>${esc(pres.nm)}</b>${pres.uid===me?' (you!)':''} · won with ${pres.votes} vote${pres.votes>1?'s':''}</div>`:'<div class="say">No SRC President yet. Be the first!</div>'}
   ${note?`<div class="say">${note}</div>`:''}
   <p style="font-size:13px;opacity:.85">Polls close in <b>${srcWhen(srcEndsIn())}</b>. ${turnout} student${turnout===1?' has':'s have'} voted. Results are secret until polls close. One vote per student.</p>
   <div class="list">${L.cands.length?L.cands.map(c=>`<div class="item"><div class="grow"><b>${esc(c.nm)}${c.uid===me?' (you)':''}</b><small>“${esc(c.slogan||'')}”</small></div>${myVote?(myVote.for===c.uid?'<span class="tag g">Your vote ✅</span>':''):c.uid===me?'':`<button class="btn sm" data-vote="${esc(c.uid)}">Vote</button>`}</div>`).join(''):'<p style="font-size:13px">No candidates yet this week.</p>'}</div>
   <div class="row" style="margin-top:8px">${mine?'<button class="btn sm" id="srcCamp">📣 Campaign on campus chat</button>':`<button class="btn sm" id="srcRun">🎤 Run for SRC President · ${cedi(SRC_FEE)}</button>`}<button class="ghost sm" id="bye">Close</button></div>`;
  $('bye').onclick=closeSheet;
  $('sheetIn').querySelectorAll('[data-vote]').forEach(b=>b.onclick=async()=>{const c=L.cands.find(x=>x.uid===b.dataset.vote);if(!confirm(`Vote for ${c.nm}? You can't change your vote.`))return;b.disabled=true;
    try{await MP.db.doc('votes/'+term+'_'+me).set({c:term,by:me,for:c.uid,at:Date.now()});try{ev('vote',1)}catch(e){}P().needs.social=clamp(P().needs.social+4);srcSheet(`✅ You voted for ${esc(c.nm)}.`)}catch(e){srcSheet('Couldn\'t save your vote. Try again.')}});
  if($('srcRun'))$('srcRun').onclick=()=>{$('sheetIn').innerHTML=`<h3>🎤 Run for SRC President</h3><p style="font-size:14px">Fee ${cedi(SRC_FEE)}. Your name and slogan will be shown to every real student on ${esc(campName(MP.campus))} this week.</p>
      <input id="srcSl" maxlength="60" placeholder="Your slogan, e.g. Free WiFi in every hostel!" style="width:100%"><div class="row" style="margin-top:8px"><button class="btn" id="srcGo">Register</button><button class="ghost" id="srcBack">Back</button></div>`;
    $('srcBack').onclick=()=>srcSheet();$('srcGo').onclick=async()=>{const sl=mpClean($('srcSl').value,60);if(sl.length<4)return toast('Write a slogan first.');if(!spend(SRC_FEE))return;$('srcGo').disabled=true;
      try{await MP.db.doc('cands/'+term+'_'+me).set({c:term,uid:me,nm:mpClean(P().name,16),slogan:sl,at:Date.now()});try{mpSend('*all','m',`🗳️ I'm running for SRC President! "${sl}" Vote for me in Student Affairs & SRC or Phone → Apps.`)}catch(e){}srcSheet('🎉 You\'re on the ballot! Now campaign.')}
      catch(e){P().money+=SRC_FEE;srcSheet('Couldn\'t register. Your fee was refunded.')}}};
  if($('srcCamp'))$('srcCamp').onclick=()=>{const k='srcC'+term;if(S[k]&&Date.now()-S[k]<20*60e3)return toast('📣 You just campaigned. Give people a break for a few minutes.');S[k]=Date.now();
    const lines=[`🗳️ Vote ${P().name} for SRC President! "${mine.slogan}"`,`📣 ${P().name} for SRC! ${mine.slogan} 🙌`,`✊ A vote for ${P().name} is a vote for "${mine.slogan}"`];if(mpSend('*all','m',pick(lines))){MP.camp.push({nm:P().name,tx:pick(lines),t:Date.now(),me:1});toast('📣 Campaign message sent to everyone on campus')}}}
/* the president's crown on player cards */
function srcCrown(uid){const pres=SRC.pres[srcTerm(srcWeek()-1)];return pres&&pres.uid===uid?'👑 SRC President':''}
