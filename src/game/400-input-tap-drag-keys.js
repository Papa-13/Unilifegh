const ray=new THREE.Raycaster(),ground=new THREE.Plane(new THREE.Vector3(0,1,0),0),hitV=new THREE.Vector3();
function toWorld(e){const r=cv.getBoundingClientRect();ray.setFromCamera({x:((e.clientX-r.left)/r.width)*2-1,y:-((e.clientY-r.top)/r.height)*2+1},IS?IS.cam:camera);
  if(!ray.ray.intersectPlane(ground,hitV))return null;return IS?{x:hitV.x,z:hitV.z}:{x:hitV.x/U+MW/2,y:hitV.z/U+MH/2}}
let dragging=false;
const setT=e=>{let t=toWorld(e);if(!t)return;S.auto=null;S.idleT=0;if(!S.pendTalk||!S.pendTalk._lock)S.pendTalk=null;if(IS){P().itarget=t;return}if(S.shuttleWait!=null&&!S.pBoard){S.shuttleWait=null;P().pose=null}const b=obstacle(t.x,t.y);if(b&&e.type==='pointerdown'){placeMenu(b);dragging=false;return}if(b)t={x:b.door[0],y:b.door[1]+(b.door[1]>b.y?8:-8)};S.goDo=null;if(S.follow&&e.type==='pointerdown'){const rp=MP.peers.get(S.follow);S.follow=null;if(rp){mpSend(mpKey(rp),'act','stopwalk');toast(`You went your own way.`)}}P().target=t};
function pickSim(e){const r=cv.getBoundingClientRect();ray.setFromCamera({x:((e.clientX-r.left)/r.width)*2-1,y:-((e.clientY-r.top)/r.height)*2+1},IS?IS.cam:camera);const p=P();
  if(p.mesh.visible&&!p.inCar&&ray.intersectObject(p.mesh,true).length){PIE=true;acts(true);return true}
  if(IS){for(const q of IS.people){if(q.mp&&ray.intersectObject(q.mesh,true).length){mpCard(q.mp);return true}if(q.n&&!q.lying&&ray.intersectObject(q.mesh,true).length){talkMenu(q.n);return true}}return false}
  for(const rp of MP.peers.values()){if(!rp.mesh||!rp.mesh.visible)continue;if(ray.intersectObject(rp.mesh,true).length){mpCard(rp);return true}}
  for(const n of S.npcs){if(n.hidden||!n.mesh.visible||dist(n,p)>650)continue;if(ray.intersectObject(n.mesh,true).length){if(dist(n,p)<95)talkMenu(n);else{p.target={x:n.x,y:n.y};p.path=null;S.pendTalk=n;toast(`Walking over to ${n.name}…`)}return true}}return false}
cv.addEventListener('pointerdown',e=>{if(!S||S.paused)return;if(PIE){PIE=false;acts(true);return}if(e.isPrimary&&!S.busy&&pickSim(e)){dragging=false;return}dragging=true;setT(e)});
cv.addEventListener('pointermove',e=>{if(dragging&&S&&!S.paused&&e.isPrimary)setT(e)});
addEventListener('pointerup',()=>dragging=false);
cv.addEventListener('wheel',e=>{e.preventDefault();zoom=clamp(zoom*(e.deltaY>0?1.1:.9),.55,1.8)},{passive:false});
$('gfxB').onclick=()=>{const o=['high','medium','low'];const was=GFX;GFX=o[(o.indexOf(GFX)+1)%3];try{localStorage.setItem('freshers-gfx',GFX)}catch(e){}applyGfx();toast(GFX==='high'?'Graphics: High (soft shadows, sharp)':GFX==='medium'?'Graphics: Medium (no shadows, smoother on phones)':'Graphics: Low (fastest). Simpler materials apply next time you open the game.')};applyGfx();
document.querySelectorAll('.speed button').forEach(b=>b.onclick=()=>{if(!S)return;if(sharedClock()){toast('🌐 Campus time is shared by everyone online, so it can\'t be paused or sped up here.');return}S.speed=+b.dataset.sp;hud();toast(['⏸ Paused','▶ Normal speed','▶▶ Fast (3×)','▶▶▶ Fastest (8×)'][S.speed])});
$('gemBtn').onclick=()=>gemShop();$('moodBtn').onclick=()=>taskSheet();$('taskBtn').onclick=()=>taskSheet();
addEventListener('keydown',e=>{if(!S||$('game').hidden||e.target.tagName==='INPUT'||sharedClock())return;if(e.key===' '){e.preventDefault();S.speed=S.speed?0:1;hud()}if(['1','2','3'].includes(e.key)){S.speed=+e.key;hud()}});
{const pts=new Map();let d0=0,z0=1;cv.addEventListener('pointerdown',e=>{pts.set(e.pointerId,e);if(pts.size===2){const [a,b]=[...pts.values()];d0=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);z0=zoom;dragging=false}});
  cv.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,e);if(pts.size===2&&d0){const [a,b]=[...pts.values()];const d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);zoom=clamp(z0*d0/d,.55,1.8);dragging=false}});
  const up=e=>{pts.delete(e.pointerId);if(pts.size<2)d0=0};addEventListener('pointerup',up);addEventListener('pointercancel',up)}
$('interact').onclick=()=>{if(!S)return;PIE=!PIE;acts(true)};
$('dPhone').onclick=()=>{if(S)phone()};$('dEmote').onclick=()=>{if(S&&!S.busy)emoteSheet()};$('dMood').onclick=()=>{if(S)taskSheet()};
$('mapB').onclick=()=>campusMap();$('mpB').onclick=()=>{if(S)mpPanel(allThreads().some(k=>unreadOf(k))?'chats':'online')};if(innerWidth>=900)$('game').classList.add('mapon');
$('acts').addEventListener('click',e=>{const A=$('acts');if(!PIE)return;if(e.target===A||e.target.closest('.pie-hub')){PIE=false;pieLayout();return}if(e.target.closest('button')){PIE=false;setTimeout(()=>acts(true),0)}});
$('needs').addEventListener('click',()=>$('needs').classList.toggle('open'));
addEventListener('resize',()=>{if(PIE)pieLayout()});
$('zin').onclick=()=>zoom=clamp(zoom*.85,.55,1.8);$('zout').onclick=()=>zoom=clamp(zoom*1.15,.55,1.8);
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;const k=e.key.length===1?e.key.toLowerCase():e.key;if(S&&!$('game').hidden&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(k))e.preventDefault();keys[k]=true});
addEventListener('keyup',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;keys[k]=false});

/* 🏠 back to the main menu: saves your student, steps out of any building, leaves the live campus
   (so other players don't see you standing still), and shows the welcome screen with Continue */
function goHome(){if(!S||!S.p)return welcome();if(SG){try{mpSend(SG.opp.ck,'sg',`quit|${SG.gid}`)}catch(e){}sgEnd(true)}
  closeSheet();$('story').hidden=true;try{saveGame()}catch(e){}if(IS)leaveRoom(true);S.follow=null;try{musStop()}catch(e){}
  if(MP.croom){try{MP.croom.leave()}catch(e){}MP.croom=null;for(const rp of MP.peers.values())if(rp.mesh){scene.remove(rp.mesh);disposeTree(rp.mesh)}MP.peers.clear();MP.campus=null}
  welcome()}
$('homeB').onclick=()=>{if(!S)return;S.paused=true;openSheet();$('sheetIn').innerHTML=`<h3>🏠 Go to the main menu?</h3><p style="font-size:14px">Your student is saved. Tap <b>Continue</b> on the main menu to carry on where you left off.</p>
  <div class="row"><button class="btn" id="homeGo">🏠 Main menu</button><button class="ghost" id="bye">Keep playing</button></div>`;$('homeGo').onclick=goHome;$('bye').onclick=closeSheet};
