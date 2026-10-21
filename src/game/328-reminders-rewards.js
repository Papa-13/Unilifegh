/* ================= lecture reminders, daily reward, scarcer gems =================
   • Lecture reminders: the night before, an hour before (with a "Go to class" button), and a nudge
     when the lecture has started and you're not there.
   • Daily reward: once every 24 REAL hours, a 7-day streak (1,1,2,2,3,3,6 💎). Skip more than 48 hours
     and the streak restarts. Signed-in players claim through the gem bank (server clock, can't be cheated);
     guests keep it on this device.
   • Task gems: only the first 3 tasks per real day pay a gem; after that tasks pay a little cash. */
const TASK_GEMS_DAY=3,TASK_CASH=15,DAILY_TABLE=[1,1,2,2,3,3,6],DAY_MS=24*3600e3,KEEP_MS=48*3600e3;
const realDay=()=>new Date().toISOString().slice(0,10);
const LSM={};/* falls back to memory where the browser blocks storage */
function lsGet(k,d){let v=null;try{v=JSON.parse(localStorage.getItem(k))}catch(e){v=LSM[k]}return v==null?(LSM[k]!=null?LSM[k]:d):v}
function lsSet(k,v){LSM[k]=v;try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function taskGemsLeft(){const t=lsGet('ulgh-taskgems',{});return t.d===realDay()?Math.max(0,TASK_GEMS_DAY-t.n):TASK_GEMS_DAY}
function taskReward(W,type){const p=P(),left=taskGemsLeft();
  if(left>0){const t=lsGet('ulgh-taskgems',{});lsSet('ulgh-taskgems',{d:realDay(),n:(t.d===realDay()?t.n:0)+1});
    gemsEarn('task',`${W.id}:${day()}:${MP.campus||'solo'}:${p.name}`,1);setTimeout(()=>toast(`🎯 Task complete: ${W.t} · +1 💎${left===1?' (that\'s today\'s last task gem)':''}`),type==='act'?1200:200);gemPop(1)}
  else{p.money+=TASK_CASH;setTimeout(()=>toast(`🎯 Task complete: ${W.t} · +${cedi(TASK_CASH)}`),type==='act'?1200:200);try{hud()}catch(e){}}}

/* ---------- lecture reminders ---------- */
function lecReminders(){const p=P();if(!S||!p||p.grad)return;const d=day(),h=Math.floor(hour()),sd=d-S.semStart,r=S.lr||(S.lr={});
  if(sd<0||sd>=EXAMS[0][0]||S.semesterDone)return;
  const off=(c)=>{const R=S.rl&&S.rl.cancel;return R&&R[d+'|'+c]};
  /* tonight: tomorrow's timetable */
  if(h===21&&!r['n'+d]){const T=(TT[(d+1)%7]||[]).filter(()=>d+1-S.semStart<EXAMS[0][0]);r['n'+d]=1;if(T.length)msg('📅 Timetable',`Tomorrow: ${T.map(([c,st])=>`${courseName(c)} at ${String(st).padStart(2,'0')}:00`).join(', ')}. Set your alarm 😴`)}
  (TT[wd()]||[]).forEach(([c,st])=>{if(off(c))return;const k=d+'|'+c,here=IS&&IS.kind==='bld'&&IS.bid===p.col,done=S['att'+d+'-'+c];
    if(h===st-1&&!r['h'+k]){r['h'+k]=1;if(!done&&!here)lecNote(`📚 ${courseName(c)} starts at ${String(st).padStart(2,'0')}:00 at ${BID[p.col].name}. Leave in good time, the shuttle can be slow.`,true)}
    if(h===st&&!r['s'+k]){r['s'+k]=1;if(!done&&!here)lecNote(`⏰ ${courseName(c)} has started! ${lecturerOf(c)} is taking attendance. Go now: more than 15 minutes late and you could be sent out.`,true)}
    if(h===st+2&&!r['m'+k]){r['m'+k]=1;if(!S['att'+d+'-'+c]){const f=S.npcs.find(n=>n.prog===p.prog&&n.contact)||null;msg(f?f.name:'Class rep',pick([`You missed ${courseName(c)} today 👀 ${lecturerOf(c)} took attendance. Attendance counts o.`,`Where were you? ${courseName(c)} was serious today. I'll send you my notes, but don't make it a habit 😅`]))}}})}
/* a small banner with a "Go to class" button that doesn't stop the game */
function lecNote(text,go){let el=$('lecNote');if(!el){el=document.createElement('div');el.id='lecNote';el.setAttribute('role','status');document.body.appendChild(el)}
  el.innerHTML=`<span>${esc(text)}</span><div class="ln-b">${go?'<button class="btn sm" id="lnGo">🚶 Go to class</button>':''}<button class="ghost sm" id="lnX">Later</button></div>`;el.hidden=false;el.classList.remove('in');void el.offsetWidth;el.classList.add('in');
  const close=()=>{el.hidden=true;clearTimeout(lecNote.t)};$('lnX').onclick=close;if($('lnGo'))$('lnGo').onclick=()=>{close();if(S.busy)return toast('Finish what you\'re doing first, or tap ⚡ to finish now.');walkTo(BID[P().col]);toast(`Heading to ${BID[P().col].name} 🚶`)};
  clearTimeout(lecNote.t);lecNote.t=setTimeout(close,25000);try{navigator.vibrate&&navigator.vibrate([120,80,120])}catch(e){}}
{const _h=hourly;hourly=function(){const r=_h.apply(this,arguments);try{const hk=day()*24+Math.floor(hour());if(S&&S._lrh!==hk){S._lrh=hk;lecReminders()}}catch(e){console.error(e)}return r}}
/* note when you actually attended, so the reminders know */
{const _l=lecture;lecture=function(L){const r=_l.apply(this,arguments);try{S['att'+day()+'-'+L[0]]=1}catch(e){}return r}}

/* ---------- daily reward ---------- */
const DLY={st:null,busy:false};
async function dailyState(){if(typeof GB!=='undefined'&&GB.on){const j=await gbCall({op:'daily',peek:true});if(j&&!j.error)return{server:1,ready:!!j.ready,day:j.day,streak:j.streak,nextAt:j.nextAt}}
  const L=lsGet('ulgh-daily',{at:0,streak:0}),now=Date.now(),alive=L.at&&now-L.at<KEEP_MS;return{server:0,ready:!L.at||now>=L.at+DAY_MS,day:(alive?L.streak%7:0)+1,streak:alive?L.streak:0,nextAt:L.at?L.at+DAY_MS:0}}
async function dailyClaim(){if(DLY.busy)return;DLY.busy=true;try{const s=await dailyState();if(!s.ready)return dailySheet(s);let added=0,dayN=s.day;
    if(s.server){const j=await gbCall({op:'daily'});if(!j||j.error||j.early)return toast(j&&j.early?'Not yet. Come back later 🙂':'Couldn\'t reach the gem bank. Try again.');added=j.added;dayN=j.day;GB.bal=j.gems;S.gems=j.gems}
    else{added=DAILY_TABLE[s.day-1];S.gems=(S.gems||0)+added;lsSet('ulgh-daily',{at:Date.now(),streak:s.streak+1})}
    if(dayN===7){P().money+=100}gemPop(added);hud();try{window.track&&window.track('daily_reward',{day:dayN})}catch(e){}
    story(`<div class="eyebrow">🎁 Daily reward · day ${dayN} of 7</div><h3>+${added} 💎${dayN===7?` and ${cedi(100)}`:''}</h3><p class="scene">${dayN===7?'A full week! Your streak starts again tomorrow.':`Come back in 24 hours for day ${dayN+1} (+${DAILY_TABLE[dayN]} 💎). Miss a day and your streak restarts.`}</p>${streakRow(dayN,true)}`,[['Nice 🙌','g',()=>{}]]);DLY.st=null;dailyDot()}
  finally{DLY.busy=false}}
function streakRow(cur,claimed){return `<div class="dstreak">${DAILY_TABLE.map((g,i)=>`<div class="${i<cur-(claimed?0:1)?'got':i===cur-1?'now':''}"><small>Day ${i+1}</small><b>${g}💎</b></div>`).join('')}</div>`}
function waitTxt(ms){const t=Math.max(1,Math.ceil(ms/60e3)),h=Math.floor(t/60),m=t%60;return h?`${h}h ${m}m`:`${m}m`}
async function dailySheet(s){s=s||await dailyState();if(s.ready)return dailyClaim();S.paused=true;openSheet();
  $('sheetIn').innerHTML=`<h3>🎁 Daily reward</h3><p style="font-size:14px">Your next reward (day ${s.day}, +${DAILY_TABLE[s.day-1]} 💎) is ready in <b>${waitTxt(s.nextAt-Date.now())}</b>. Rewards come once every 24 real hours. Come back within 48 hours to keep your ${s.streak}-day streak.</p>${streakRow(s.day,false)}<button class="btn" id="dsShop" style="margin-top:10px">💎 Need gems now? From GH₵1</button> <button class="ghost sm" id="bye">Close</button>`;
  $('bye').onclick=closeSheet;$('dsShop').onclick=()=>{closeSheet();gemShop()}}
async function dailyDot(){try{const s=DLY.st=await dailyState();const b=$('gemBtn');if(b)b.classList.toggle('daily',!!s.ready)}catch(e){}}
/* check when the game opens and every few minutes while it's open */
{const _sg=showGame;showGame=function(){const r=_sg.apply(this,arguments);setTimeout(async()=>{await dailyDot();if(DLY.st&&DLY.st.ready&&$('story').hidden)toast('🎁 Your daily reward is ready! Tap 💎 to claim it.')},4500);return r}}
setInterval(()=>{if(S&&S.p&&!document.hidden)dailyDot()},180000);
