/* ================= main menu: continue, join a campus, or play solo ================= */
let MENU=null;
function mpRefreshMenus(){const sig=MENU+'|'+(MP.lobby?JSON.stringify(campList()):'')+'|'+MP.lobbyPeers.length+'|'+(welcome.sv===undefined?'u':welcome.sv?1:0);if(sig===mpRefreshMenus.sig)return;mpRefreshMenus.sig=sig;if(MENU==='welcome')welcome(true);else if(MENU==='campus')campusPick(true)}
async function welcome(soft){MENU='welcome';document.body.classList.remove('playing');document.body.classList.add('setup');$('game').hidden=true;$('top').hidden=true;$('panel').hidden=false;$('story').hidden=true;$('sheet').hidden=true;
  if(!soft){welcome.sv=undefined;welcome.tok=(welcome.tok||0)+1;const tok=welcome.tok;mpWhenReady(async()=>{const sv=await findSave();if(tok!==welcome.tok)return;welcome.sv=sv;if(MENU==='welcome')welcome(true)})}
  const sv=welcome.sv,on=MP.lobbyPeers.length,cl=MP.lobby?campList():[];panelMode('intro');
  if(sv&&sv.campus&&sv.cn&&String(sv.campus)[0]==='u'&&!MP.cnames[sv.campus])MP.cnames[sv.campus]=mpClean(sv.cn,24);const svPal=sv&&sv.p&&sv.p.look&&PAL[sv.p.look.pal],svLvl=sv&&sv.p?(sv.p.grad?'Graduate':'Level '+((sv.p.yr||1)*100)):'';
  $('panel').innerHTML=`${introScene()}<div class="iw wl">
    <div class="wl-top"><h1 class="yolo" aria-label="Chale"><span>C</span><span>H</span><span>A</span><span>L</span><span>E</span></h1><p class="tagl">a ghanaian student life</p>
    <p class="ilead">From Level 100 to graduation day: lectures, hostel life, friends, love and hustles.${window.__onlineOff?' Pass your exams, find your people and make it to graduation.':' Online, every student you meet is a real person.'}</p></div>
    <div class="acts">
      ${sv===undefined?'<p class="looking">Looking for your saved student…</p>':sv?`<button class="sbtn" id="wCont"><span class="ph" style="background:${svPal?svPal.a:'#fbf3e2'};border:3px solid #120a12;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;font:400 20px var(--sign);flex:none">${esc((mpClean(sv.p.name,16)||'Y')[0])}</span><span>Continue as ${esc(mpClean(sv.p.name,16))}<small>${esc(sv.p.prog||'')} · ${svLvl}${sv.campus?' · 🌐 '+esc(campName(sv.campus)):' · solo'}</small></span></button>`:''}
      <button class="sbtn${window.__onlineOff?' dim':sv?' alt':''}" id="wOn" ${MP.lobby?'':'disabled'} style="${window.__onlineOff?'order:3':''}"><span class="ic">🌐</span><span>${sv?'New student, online':'Play online'}<small>${window.__onlineOff?'🚧 Coming soon: real students on your campus':MP.lobby?`${on} student${on===1?'':'s'} online now · ${cl.length} campus${cl.length===1?'':'es'} with space`:MP.ready?'Online play isn\'t available here':'Connecting…'}</small></span></button>
      <button class="sbtn${window.__onlineOff?(sv?' alt':''):' dim'}" id="wSolo" style="${window.__onlineOff?'order:2':''}"><span class="ic">🎮</span><span>${sv?'New student, solo':'Play solo'}<small>${window.__onlineOff?'With computer-run classmates · works offline':'Offline, with computer-run classmates'}</small></span></button>
      <button class="ghost sm" id="wProg" style="align-self:flex-start;margin-top:4px;${window.__onlineOff?'display:none':''}">💾 ${(()=>{try{return saveWhere().t}catch(e){return 'Your progress'}})()} · Back up / restore</button>
    </div></div>`;
  if($('wCont'))$('wCont').onclick=()=>{MENU=null;loadGame(sv)};
  if($('wProg'))$('wProg').onclick=()=>progressSheet();
  $('wOn').onclick=()=>{if(sv&&!confirm('Start a new student? Your saved student will be replaced.'))return;campusPick()};
  $('wSolo').onclick=()=>{if(sv&&!confirm('Start a new student? Your saved student will be replaced.'))return;MENU=null;MP.campus=null;if(MP.croom){MP.croom.leave().catch(()=>{});MP.croom=null}maker()}}
function campusPick(soft){MENU='campus';const cl=campList(),total=MP.lobbyPeers.length;panelMode('intro');
  $('panel').innerHTML=`${introScene()}<div class="iw cmp">
    <div><button class="sbtn dim sm" id="cBack" style="margin-bottom:14px">‹ Back</button><h2 class="it">Choose a campus</h2></div>
    <p class="ilead" style="font-size:15px">Join any campus below, or start your own. Each holds up to ${CAMP_MAX} students and disappears from the list when it's full. Your student lives on one campus at a time: starting on another replaces your current student. Pick a hostel room there, and real students who pick the same room become your roommates. ${total} student${total===1?'':'s'} online now.</p>
    <div class="list">
    <div class="cboard cnew"><div class="grow" style="flex:1;min-width:0"><b>➕ Start a new campus</b><small>Give it a name nobody else has. Friends can join it from this list.</small>
      <div class="cnew-row"><input id="cnName" maxlength="20" placeholder="e.g. Kumasi Stars" autocomplete="off" aria-label="New campus name"><button class="sbtn sm" id="cnGo">Create</button></div><small id="cnErr" class="cn-err"></small></div></div>
    ${cl.map(c=>`<div class="cboard"><div class="grow" style="flex:1;min-width:0"><b>${esc(c.name)}${welcome.sv&&welcome.sv.campus===c.id?' · 🏠 you live here':''}</b><small>${c.on} online now${c.res?'':' · brand new'}${c.mine?' · made by a player':''}</small><div class="cap"><i style="width:${Math.max(3,c.res/CAMP_MAX*100)}%"></i></div></div><div class="num">${c.res}/${CAMP_MAX}<br><button class="sbtn sm" data-jc="${c.id}" style="margin-top:6px">Join</button></div></div>`).join('')}</div>
    ${MP.db?'':'<p class="hint" style="color:#ffe2c4">Resident counts need the game\'s database, which isn\'t available here, so this shows who\'s online now.</p>'}</div>`;
  /* the list refreshes while people come and go: keep what you were typing */
  const ni=$('cnName');ni.value=campusPick.draft||'';if(campusPick.focus){ni.focus();ni.setSelectionRange(ni.value.length,ni.value.length)}
  ni.oninput=()=>{campusPick.draft=ni.value;const e=ni.value.trim()?campNameProblem(ni.value):null;$('cnErr').textContent=e&&ni.value.trim().length>=3?e:''};ni.onfocus=()=>campusPick.focus=true;ni.onblur=()=>campusPick.focus=false;
  ni.onkeydown=e=>{if(e.key==='Enter')$('cnGo').click()};
  $('cnGo').onclick=async()=>{const err=campNameProblem(ni.value);if(err){$('cnErr').textContent=err;return}const b=$('cnGo');b.disabled=true;b.textContent='Creating…';
    if(await createCampus(ni.value)){campusPick.draft='';campusPick.focus=false;MENU=null;maker()}else{b.disabled=false;b.textContent='Create'}};
  $('panel').querySelectorAll('[data-jc]').forEach(b=>b.onclick=async()=>{b.disabled=true;b.textContent='Joining…';const id=b.dataset.jc;const c=campList().find(x=>x.id===id);if(!c){toast('That campus just filled up. Pick another.');campusPick();return}
    if(await joinCampus(id)){MENU=null;toast(`🏫 You're joining ${campName(id)}. Create your student!`);maker()}else campusPick()});
  $('cBack').onclick=()=>welcome()}
