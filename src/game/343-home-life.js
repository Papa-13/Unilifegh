/* ================= home life: pyjamas, towels, and placing your own furniture =================
   - Going to sleep (or a nap) you change into pyjamas; you get dressed again when you wake up.
   - Showering or bathing you wrap a towel round yourself, and shower curtains / frosted glass hide you.
     Roommates sleeping or bathing do the same.
   - Furniture you buy for your room (rug, plant, fan, mirror, beanbag, fridge, gaming chair, ring light,
     water dispenser) is placed by you, Sims-style: drag it around the floor, rotate it, and put it down
     anywhere it fits. You can rearrange your room any time. */
const PJ_PAL=['sky','lilac','pink','navy','maroon','olive','heather'];
function pjLook(L,seed){return Object.assign({},L,{outfit:'pj',pal:PJ_PAL[Math.abs(Math.floor(seed||0))%PJ_PAL.length],shoes:'slides',bag:'none',extra:'none'})}
function towelLook(L){return Object.assign({},L,{outfit:'towel',pal:'white',shoes:'slides',bag:'none',extra:'none'})}
const SLEEPY=/^Sleeping|nap\b|Napping|Taking a nap/i,BATHY=/shower|bucket bath|bathtub/i;
/* you */
{const _sb=startBusy;startBusy=function(label,a,dur,done){const r=_sb.apply(this,arguments);try{const p=P(),b=S.busy;if(b&&b.label===label&&!p._lookBak){
  const k=SLEEPY.test(label)?'pj':BATHY.test(label)?'towel':null;if(k){p._lookBak=p.look;p.look=k==='pj'?pjLook(p.look,(p.name||'').length+3):towelLook(p.look);rebuildPlayer();p.noTurn=false;if(k==='pj')p.sleepStyle=null}}}catch(e){console.warn(e)}return r}}
{const _fb=finishBusy;finishBusy=function(){const p=P();const r=_fb.apply(this,arguments);try{if(p._lookBak&&!S.busy){p.look=p._lookBak;p._lookBak=null;rebuildPlayer()}}catch(e){console.warn(e)}return r}}
/* roommates and friends in the room */
{const _ai=addInPerson;addInPerson=function(look,label,x,z,ry,pose,o){o=o||{};try{if(o.lie&&o.n)look=pjLook(look,o.n.id||label.length);else if(pose==='shower')look=towelLook(look)}catch(e){}return _ai.call(this,look,label,x,z,ry,pose,o)}}
function swapLook(q,look){if(!q||!q.mesh||!IS)return;const old=q.mesh,h=makeHuman(look,{label:q.n&&(q.n.met||q.n.mate)?q.n.name:'',labelColor:'#f6f0e8'});h.g.position.copy(old.position);h.g.rotation.copy(old.rotation);
  IS.scene.remove(old);try{disposeTree(old)}catch(e){}IS.scene.add(h.g);Object.assign(q,{mesh:h.g,legs:h.legs,knees:h.knees,arms:h.arms,elbows:h.elbows,head:h.head,lids:h.lids,torso:h.torso});q._pv=null}
{const _ar=arrive;arrive=function(q,g){const r=_ar.apply(this,arguments);try{if(g&&g.lie&&q.n&&!q._pj){q._pj=1;swapLook(q,pjLook(q.n.look,q.n.id||1))}}catch(e){}return r}}
{const _sw=startWalk;startWalk=function(q,A,g){try{if(q._pj&&q.n&&!(g&&g.lie)){q._pj=0;swapLook(q,q.n.look)}}catch(e){}return _sw.apply(this,arguments)}}

/* ---------------- place your own furniture ---------------- */
const MOVABLE={
  rug:{w:1.8,d:1.2,flat:1,build:(g,c)=>{const r=mesh(new THREE.PlaneGeometry(1.8,1.2),clothMat('kente'),0,.012,0,g);r.rotation.x=-Math.PI/2}},
  plant:{w:.6,d:.6,build:g=>{mesh(cyl(.15,.12,.3,10),lam(0xb5653a),0,.15,0,g);mesh(sph(.3,10,8),lam(0x3f8a3a),0,.55,0,g)}},
  fan:{w:.5,d:.5,build:g=>{mesh(cyl(.18,.2,.04,12),lam(0xeeeeee),0,.02,0,g);mesh(cyl(.02,.02,1.1,6),lam(0xcccccc),0,.57,0,g);const h=mesh(cyl(.22,.22,.08,16),lam(0xdddddd),0,1.15,.02,g);h.rotation.x=Math.PI/2}},
  mirror:{w:.6,d:.25,build:g=>{box(.55,1.55,.06,lam(0x6b4a2e),0,.8,0,g);box(.45,1.4,.02,lam(0xcfe3f0),0,.82,.04,g)}},
  beanbag:{w:.8,d:.8,obj:{id:'beanbag',label:'Beanbag',r:.75},spot:'bean',build:g=>{const bb=mesh(sph(.42,18,12),stdM(P().ledCol?0x3b2a6a:0x8e2a3a,.95),0,.22,0,g);bb.scale.set(1,.55,1)}},
  fridge:{w:.55,d:.55,obj:{id:'fridge',label:'Mini fridge',r:.7},build:g=>{box(.5,.82,.5,lam(0xe9ecef),0,.41,0,g);box(.5,.01,.5,lam(0x777777),0,.6,.001,g);box(.03,.22,.03,lam(0x9a9a9a),.2,.45,.26,g)}},
  gchair:{w:.6,d:.6,build:g=>{box(.55,.12,.55,lam(0x1b1b1b),0,.48,0,g);box(.55,.8,.1,lam(0xc8102e),0,.95,-.24,g);box(.4,.5,.11,lam(0x1b1b1b),0,.95,-.235,g);mesh(cyl(.04,.04,.42,6),lam(0x555555),0,.24,0,g)}},
  ringlight:{w:.45,d:.45,obj:{id:'ringlight',label:'Ring light',r:.65},build:g=>{mesh(cyl(.02,.02,1.5,6),lam(0x222222),0,.75,0,g);mesh(new THREE.TorusGeometry(.2,.03,8,24),new THREE.MeshBasicMaterial({color:0xfff6e0}),0,1.55,0,g)}},
  dispenser:{w:.4,d:.4,obj:{id:'dispenser',label:'Water dispenser',r:.6},build:g=>{box(.34,.9,.34,lam(0xf4f4f4),0,.45,0,g);mesh(cyl(.13,.13,.35,14),new THREE.MeshLambertMaterial({color:0x8fd3ff,transparent:true,opacity:.7}),0,1.07,0,g);[-.06,.06].forEach((dx,i)=>box(.04,.04,.03,lam(i?0x3b78c2:0xd9542b),dx,.7,.18,g))}}};
const itemName=id=>{const a=SHOP.find(x=>x.id===id)||(typeof DRIP!=='undefined'&&DRIP.room.find(x=>x.id===id));return a?a.name:id};
const footprint=(id,x,z,ry)=>{const M=MOVABLE[id],sw=Math.abs(Math.round(Math.sin(ry)))===1,w=sw?M.d:M.w,d=sw?M.w:M.d;return{x1:x-w/2,x2:x+w/2,z1:z-d/2,z2:z+d/2}};
/* when the room is built: items you placed yourself are drawn where you put them, the rest where the game puts them */
{const _er=enterRoom0;enterRoom0=function(owner){const p=P(),mine=owner==='me',hide=mine&&p.place?Object.keys(p.place).filter(id=>p.items.includes(id)&&MOVABLE[id]):[],skip=PLACE.hideId?[PLACE.hideId]:[];
  const all=[...new Set(hide.concat(skip))],bak=p.items.slice();if(mine&&all.length)p.items=p.items.filter(i=>!all.includes(i));let r;
  try{r=_er.apply(this,arguments)}finally{if(mine&&all.length)p.items=bak}
  try{if(mine&&IS)hide.filter(id=>id!==PLACE.hideId).forEach(id=>{const q=p.place[id];putItem(id,q.x,q.z,q.ry)})}catch(e){console.warn(e)}
  try{if(mine)setTimeout(placeNewOnes,900)}catch(e){}return r}}
function putItem(id,x,z,ry,ghost){const M=MOVABLE[id],g=new THREE.Group();M.build(g);g.position.set(x,0,z);g.rotation.y=ry||0;IS.scene.add(g);
  if(ghost){g.traverse(o=>{if(o.material){o.material=o.material.clone();o.material.transparent=true;o.material.opacity=.55;o.material.depthWrite=false}});return g}
  const f=footprint(id,x,z,ry||0);if(!M.flat)IS.obst.push(f);IS.grid=null;
  if(M.obj){const fx=Math.sin(ry||0),fz=Math.cos(ry||0);IS.objs=IS.objs.filter(o=>o.id!==M.obj.id);IS.objs.push({id:M.obj.id,label:M.obj.label,x:x+fx*.62,z:z+fz*.62,r:M.obj.r})}
  if(M.spot==='bean')IS.spots.bean={x,z,ry:ry||0,ly:-.2};return g}
/* new furniture you haven't placed yet: offer to place it as soon as you're in your room */
function placeNewOnes(){const p=P();if(!IS||!IS.mine||S.busy||PLACE.on)return;p.place=p.place||{};S.placeSeen=S.placeSeen||p.items.slice();
  const fresh=p.items.filter(id=>MOVABLE[id]&&!p.place[id]&&!S.placeSeen.includes(id));if(!fresh.length)return;S.placeSeen.push(fresh[0]);
  story(`<div class="eyebrow">📦 Delivered</div><h3>Where should your ${esc(itemName(fresh[0]).toLowerCase())} go?</h3><p class="scene">Drag it around your room, turn it, and put it down wherever you like.</p>`,[['🛠️ Place it now','g',()=>startPlace(fresh[0])],['Later (it stays where it is)','',()=>{}]])}
const PLACE={on:false,id:null,ghost:null,x:0,z:0,ry:0,hideId:null};
function startPlace(id){if(!IS||!IS.mine||!MOVABLE[id])return toast('Go to your room to arrange your furniture.');
  /* rebuild the room without this item, then carry a see-through copy of it around */
  PLACE.hideId=id;refreshRoom();setTimeout(()=>{if(!IS||!IS.mine){PLACE.hideId=null;return}PLACE.on=true;PLACE.id=id;S.paused=true;const p=P(),q=(p.place&&p.place[id])||{x:0,z:.6,ry:0};PLACE.x=q.x;PLACE.z=q.z;PLACE.ry=q.ry||0;
    PLACE.ghost=putItem(id,PLACE.x,PLACE.z,PLACE.ry,true);placeUI();placeCheck()},700)}
function placeOK(){const f=footprint(PLACE.id,PLACE.x,PLACE.z,PLACE.ry),W=IS.W,D=IS.D,x0=IS.xmin??-W/2;if(f.x1<x0+.08||f.x2>W/2-.08||f.z1<-D/2+.08||f.z2>D/2-.08)return false;
  if(MOVABLE[PLACE.id].flat)return true;const pad=.04;if(IS.obst.some(o=>f.x1<o.x2-pad&&f.x2>o.x1+pad&&f.z1<o.z2-pad&&f.z2>o.z1+pad))return false;
  const door=IS.objs.find(o=>o.id==='door');if(door&&Math.hypot(PLACE.x-door.x,PLACE.z-door.z)<.95)return false;return true}
function placeCheck(){const ok=placeOK();if(PLACE.ghost){PLACE.ghost.position.set(PLACE.x,0,PLACE.z);PLACE.ghost.rotation.y=PLACE.ry;PLACE.ghost.traverse(o=>{if(o.material&&o.material.color&&!o.material._c0)o.material._c0=o.material.color.getHex();if(o.material&&o.material._c0!=null)o.material.color.setHex(ok?o.material._c0:0xff5a4a)})}
  const b=$('plOk');if(b)b.disabled=!ok;const h=$('plHint');if(h)h.textContent=ok?'Looks good. Tap ✔ to put it here.':MOVABLE[PLACE.id].flat?'Keep it inside the room.':'It doesn\'t fit there. Try another spot or turn it.'}
function placeUI(){let el=$('placeBar');if(!el){el=document.createElement('div');el.id='placeBar';document.body.appendChild(el)}
  el.innerHTML=`<b>🛠️ ${esc(itemName(PLACE.id))}</b><small id="plHint">Drag on the floor to move it</small><div class="row" style="gap:8px;justify-content:center"><button class="ghost sm" id="plRot">↻ Turn</button><button class="btn sm" id="plOk">✔ Put it here</button><button class="ghost sm" id="plNo">✖ Cancel</button></div>`;el.hidden=false;
  $('plRot').onclick=()=>{PLACE.ry=(PLACE.ry+Math.PI/2)%(Math.PI*2);placeCheck()};
  $('plOk').onclick=()=>{if(!placeOK())return;const p=P();p.place=p.place||{};p.place[PLACE.id]={x:+PLACE.x.toFixed(2),z:+PLACE.z.toFixed(2),ry:+PLACE.ry.toFixed(3)};endPlace(true);toast(`✨ ${itemName(Object.keys(p.place).pop())} placed!`)};
  $('plNo').onclick=()=>endPlace(false)}
function endPlace(saved){PLACE.on=false;PLACE.id=null;PLACE.ghost=null;PLACE.hideId=null;const el=$('placeBar');if(el)el.hidden=true;S.paused=false;refreshRoom();try{if(saved)ev('act',{l:'Decorating'})}catch(e){}}
/* while placing, finger/mouse on the room moves the item instead of walking */
['pointerdown','pointermove'].forEach(t=>window.addEventListener(t,e=>{if(!PLACE.on||!IS||e.target!==cv)return;if(t==='pointermove'&&!(e.buttons||e.pointerType==='touch'))return;e.stopImmediatePropagation();e.preventDefault();
  const w=toWorld(e);if(!w)return;PLACE.x=Math.round(w.x/.05)*.05;PLACE.z=Math.round(w.z/.05)*.05;placeCheck()},true));
/* "Arrange your room" in your room's actions */
{const _ra=roomActions;roomActions=function(){const a=_ra.apply(this,arguments);try{if(IS&&IS.mine&&!S.busy){const own=P().items.filter(id=>MOVABLE[id]);if(own.length)a.push(['🛠️ Arrange your room (move furniture)',()=>placeSheet('🛠️ What do you want to move?',own.map(id=>`${itemName(id)}${P().place&&P().place[id]?'':' · not placed yet'}`),i=>{closeSheet();startPlace(own[i])})])}}catch(e){}return a}}
