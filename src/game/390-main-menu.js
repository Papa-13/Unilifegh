/* ================= main menu: continue, join a campus, or play solo ================= */
let MENU=null;
function mpRefreshMenus(){const sig=MENU+'|'+(MP.lobby?JSON.stringify(campList()):'')+'|'+MP.lobbyPeers.length+'|'+(welcome.sv===undefined?'u':welcome.sv?1:0);if(sig===mpRefreshMenus.sig)return;mpRefreshMenus.sig=sig;if(MENU==='welcome')welcome(true);else if(MENU==='campus')campusPick(true)}
async function welcome(soft){MENU='welcome';document.body.classList.remove('playing');document.body.classList.add('setup');$('game').hidden=true;$('top').hidden=true;$('panel').hidden=false;$('story').hidden=true;$('sheet').hidden=true;
  if(!soft){welcome.sv=undefined;welcome.tok=(welcome.tok||0)+1;const tok=welcome.tok;mpWhenReady(async()=>{const sv=await findSave();if(tok!==welcome.tok)return;welcome.sv=sv;if(MENU==='welcome')welcome(true)})}
  const sv=welcome.sv,on=MP.lobbyPeers.length,cl=MP.lobby?campList():[];panelMode('intro');
  const svPal=sv&&sv.p&&sv.p.look&&PAL[sv.p.look.pal],svLvl=sv&&sv.p?(sv.p.grad?'Graduate':'Level '+((sv.p.yr||1)*100)):'';
  $('panel').innerHTML=`${introScene()}<div class="iw wl">
    <div class="wl-top"><h1 class="yolo" aria-label="YOLO"><span>Y</span><span>O</span><span>L</span><span>O</span></h1><p class="tagl">you only live once</p>
    <p class="ilead">From Level 100 to graduation day: lectures, hostel life, friends, love and hustles. Online, every student you meet is a real person.</p></div>
    <div class="acts">
      ${sv===undefined?'<p class="looking">Looking for your saved student…</p>':sv?`<button class="sbtn" id="wCont"><span class="ph" style="background:${svPal?svPal.a:'#fbf3e2'};border:3px solid #120a12;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;font:400 20px var(--sign);flex:none">${esc((mpClean(sv.p.name,16)||'Y')[0])}</span><span>Continue as ${esc(mpClean(sv.p.name,16))}<small>${esc(sv.p.prog||'')} · ${svLvl}${sv.campus?' · 🌐 '+esc(campName(sv.campus)):' · solo'}</small></span></button>`:''}
      <button class="sbtn${sv?' alt':''}" id="wOn" ${MP.lobby?'':'disabled'}><span class="ic">🌐</span><span>${sv?'New student, online':'Play online'}<small>${MP.lobby?`${on} student${on===1?'':'s'} online now · ${cl.length} campus${cl.length===1?'':'es'} with space`:MP.ready?'Online play isn\'t available here':'Connecting…'}</small></span></button>
      <button class="sbtn dim" id="wSolo"><span class="ic">🎮</span><span>${sv?'New student, solo':'Play solo'}<small>Offline, with computer-run classmates</small></span></button>
    </div></div>`;
  if($('wCont'))$('wCont').onclick=()=>{MENU=null;loadGame(sv)};
  $('wOn').onclick=()=>{if(sv&&!confirm('Start a new student? Your saved student will be replaced.'))return;campusPick()};
  $('wSolo').onclick=()=>{if(sv&&!confirm('Start a new student? Your saved student will be replaced.'))return;MENU=null;MP.campus=null;if(MP.croom){MP.croom.leave().catch(()=>{});MP.croom=null}maker()}}
function campusPick(soft){MENU='campus';const cl=campList(),total=MP.lobbyPeers.length;panelMode('intro');
  $('panel').innerHTML=`${introScene()}<div class="iw cmp">
    <div><button class="sbtn dim sm" id="cBack" style="margin-bottom:14px">‹ Back</button><h2 class="it">Join a campus</h2></div>
    <p class="ilead" style="font-size:15px">Each campus holds up to ${CAMP_MAX} students and disappears from this list when it's full. Pick a hostel room there, and real students who pick the same room become your roommates. ${total} student${total===1?'':'s'} online now.</p>
    <div class="list">${cl.map(c=>`<div class="cboard"><div class="grow" style="flex:1;min-width:0"><b>${esc(c.name)}</b><small>${c.on} online now${c.res?'':' · brand new'}</small><div class="cap"><i style="width:${Math.max(3,c.res/CAMP_MAX*100)}%"></i></div></div><div class="num">${c.res}/${CAMP_MAX}<br><button class="sbtn sm" data-jc="${c.id}" style="margin-top:6px">Join</button></div></div>`).join('')}</div>
    ${MP.db?'':'<p class="hint" style="color:#ffe2c4">Resident counts need the game\'s database, which isn\'t available here, so this shows who\'s online now.</p>'}</div>`;
  $('panel').querySelectorAll('[data-jc]').forEach(b=>b.onclick=async()=>{b.disabled=true;b.textContent='Joining…';const id=b.dataset.jc;const c=campList().find(x=>x.id===id);if(!c){toast('That campus just filled up. Pick another.');campusPick();return}
    if(await joinCampus(id)){MENU=null;toast(`🏫 You're joining ${campName(id)}. Create your student!`);maker()}else campusPick()});
  $('cBack').onclick=()=>welcome()}
