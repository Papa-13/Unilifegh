/* ================= character maker ================= */
let PVHOLD=0,PVLOOK=null,pvOn=false,pvR=null,pvScene,pvCam,pvModel=null,pvAngle=.5,faceZoom=false;
function setupPreview(c){
  if(pvR){pvR.dispose();pvR.forceContextLoss()}
  pvR=new THREE.WebGLRenderer({canvas:c,antialias:true});pvR.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
  pvScene=new THREE.Scene();{const c=document.createElement('canvas');c.width=4;c.height=256;const g=c.getContext('2d'),gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,'#6a2a45');gr.addColorStop(.5,'#341638');gr.addColorStop(1,'#160b19');g.fillStyle=gr;g.fillRect(0,0,4,256);pvScene.background=new THREE.CanvasTexture(c)}
  pvCam=new THREE.PerspectiveCamera(28,3/4,.1,50);pvCam.position.set(0,1.3,4.6);pvCam.lookAt(0,1.15,0);
  pvScene.add(new THREE.HemisphereLight(0xeef2ff,0x3a2a18,.85));
  const key=new THREE.DirectionalLight(0xffe6c0,.8);key.position.set(2,3,3);pvScene.add(key);
  const rim=new THREE.DirectionalLight(0xe8b24a,.45);rim.position.set(-3,2,-2);pvScene.add(rim);
  const floor=mesh(new THREE.CylinderGeometry(.85,.9,.08,48),new THREE.MeshStandardMaterial({color:0x2c1530,roughness:.4,metalness:.2}),0,-.04,0,pvScene);const ring=mesh(new THREE.TorusGeometry(.86,.012,8,64),new THREE.MeshBasicMaterial({color:0xf5b41f}),0,0,0,pvScene);ring.rotation.x=Math.PI/2;
  pvModel=null;rebuildPreview();pvOn=true}
function rebuildPreview(){if(!pvScene)return;if(pvModel){pvScene.remove(pvModel);disposeTree(pvModel)}const h=makeHuman(myLook);pvModel=h.g;pvModel.rotation.y=pvAngle;pvScene.add(pvModel);window.pvC={mesh:h.g,legs:h.legs,knees:h.knees,arms:h.arms,elbows:h.elbows,head:h.head,lids:h.lids,torso:h.torso,phase:0,id:1,pose:'idle'}}
function renderPreview(dt){const c=$('pv');if(!c||!pvR)return;fitR(pvR,pvCam,c);const manual=performance.now()<PVHOLD;if(!manual)pvAngle+=dt*.5;const footZoom=CASTAB==='shoes'&&!faceZoom;if(pvModel)pvModel.rotation.y=manual?pvAngle:faceZoom?Math.sin(performance.now()/1200)*.6:footZoom?.35+Math.sin(performance.now()/1400)*.75:pvAngle;if(window.pvC&&pvC.mesh===pvModel){const r=pvModel.rotation.y;try{posePerson(pvC,false,dt)}catch(e){}pvModel.rotation.y=r;pvModel.position.set(0,0,0)}
  const wide=pvCam.aspect>1.1;pvCam.position.y+=((faceZoom?1.56:footZoom?.55:1.3)-pvCam.position.y)*.1;pvCam.position.z+=((faceZoom?1.15:footZoom?1.55:wide?3.9:4.6)-pvCam.position.z)*.1;pvCam.position.x+=((wide&&!faceZoom&&!footZoom?.35:0)-pvCam.position.x)*.1;PVLOOK=(PVLOOK??1.1)+((faceZoom?1.52:footZoom?.12:1.1)-(PVLOOK??1.1))*.12;pvCam.lookAt(0,PVLOOK,0);pvR.render(pvScene,pvCam)}
let CASTAB='gender';
function maker(){
  if(IS)leaveRoom(true);
  document.body.classList.remove('playing');document.body.classList.add('setup');$('game').hidden=true;$('top').hidden=true;$('panel').hidden=false;$('story').hidden=true;$('sheet').hidden=true;
  const g=myLook.gender;if(!HAIR[g][myLook.hair])myLook.hair=Object.keys(HAIR[g])[0];if(!OUTFIT[g][myLook.outfit])myLook.outfit=Object.keys(OUTFIT[g])[0];
  if(g==='m'&&myLook.extra==='earrings')myLook.extra='none';if(!myLook.bottom||!BOTTOMS[g][myLook.bottom])myLook.bottom='match';if(g==='m'&&SHOES_F_ONLY.includes(myLook.shoes))myLook.shoes='sneakers';
  const chips=(key,obj)=>Object.entries(obj).map(([k,v])=>`<button class="pick" data-k="${key}" data-v="${k}" aria-pressed="${myLook[key]===k}">${v}</button>`).join('');
  const ex=Object.fromEntries(Object.entries(EXTRA).filter(([k])=>g==='f'||k!=='earrings'));
  const TABS=[['gender','🧍','Body'],['skin','🎨','Skin'],['hair','💇','Hair'],['outfit','👕','Top'],['bottom','👖','Bottom'],['pal','🌈','Colour'],['shoes','👟','Shoes'],['extra','✨','Extras'],['bag','🎒','Bag'],['int','❤️','Likes']];
  const tabBody=t=>t==='gender'?`<div class="chips big">${chips('gender',{f:'👩🏾 Female',m:'👨🏾 Male'})}</div>`:t==='skin'?`<div class="chips">${SKINS.map(x=>`<button class="sw" data-k="skin" data-v="${x}" aria-label="Skin tone" aria-pressed="${myLook.skin===x}" style="background:${x}"></button>`).join('')}</div>`:
    t==='hair'?`<div class="chips">${chips('hair',HAIR[g])}</div>${g==='m'?`<div class="eyebrow" style="margin:10px 0 6px">Beard</div><div class="chips">${chips('beard',BEARDS)}</div>`:''}`:t==='outfit'?`<div class="chips">${chips('outfit',OUTFIT[g])}</div>`:t==='bottom'?(FULL_OUTFITS.includes(myLook.outfit)?`<p style="font-size:14px;margin:4px 0">👗 Your top is a one-piece outfit, so there's no separate bottom. Pick a different top to mix and match.</p>`:`<div class="chips">${chips('bottom',BOTTOMS[g])}</div>`):t==='pal'?`<div class="chips">${Object.entries(PAL).filter(([k,pp])=>!pp.prem).map(([k,pp])=>`<button class="pick pal" data-k="pal" data-v="${k}" aria-pressed="${myLook.pal===k}"><i style="background:linear-gradient(135deg,${pp.a} 50%,${pp.b} 50%)"></i>${pp.name}</button>`).join('')}</div>`:
    t==='shoes'?`<div class="chips">${chips('shoes',Object.fromEntries(Object.entries(SHOES).filter(([k])=>g==='f'||!SHOES_F_ONLY.includes(k))))}</div>`:t==='extra'?`<div class="chips">${chips('extra',ex)}</div>`:t==='bag'?`<div class="chips">${chips('bag',BAGS)}</div>`:
    `<div class="eyebrow" style="margin-bottom:6px">Pick 2 · they shape who you click with</div><div class="chips">${INTERESTS.map(x=>`<button class="pick" data-int="${x}" aria-pressed="${myLook.interests.includes(x)}">${x}</button>`).join('')}</div>`;
  panelMode('bleed');const pp=PAL[myLook.pal]||{a:'#888',b:'#555'};
  $('panel').innerHTML=`<div class="cas">
   <div class="cas-stage"><canvas id="pv" aria-label="Preview of your character"></canvas>
     <div class="cas-top">${stepBar(0)}<h2 class="it">Create your student</h2><p class="cas-sub">Next: your family, your programme, your admission letter and your hostel.</p></div>
     <div class="cas-tools"><div class="row" style="gap:6px;justify-content:flex-end"><button class="glass" id="rotL" aria-label="Turn left">⟲</button><button class="glass" id="rotR" aria-label="Turn right">⟳</button></div><button class="glass" id="face">👁 Face</button><button class="glass" id="rnd">🎲 Surprise</button></div><div class="cas-hint" id="rotHint">👆 Drag to turn your student</div></div>
   <div class="cas-panel">
     <div class="cas-tabs" role="tablist">${TABS.map(([k,ic,l])=>`<button class="cas-tab" role="tab" data-tab="${k}" aria-pressed="${CASTAB===k}">${ic}<span>${l}</span></button>`).join('')}</div>
     <div class="cas-opts" id="casOpts">${tabBody(CASTAB)}</div>
     <div class="cas-foot"><label class="idcard"><span class="ph" id="idPh" style="background:linear-gradient(160deg,${pp.a} 55%,${pp.b} 55%)"></span><span class="f"><small>Akwaaba University student ID · Level 100</small><input type="text" id="nm" maxlength="14" placeholder="Your name, e.g. Ama" aria-label="Your name" value="${esc(myLook.name||'')}" autocomplete="off"></span></label><button class="sbtn" id="go">Continue</button></div>
   </div></div>`;
  $('panel').querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{CASTAB=b.dataset.tab;myLook.name=$('nm').value;maker()});
  $('panel').querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{const k=b.dataset.k;myLook[k]=b.dataset.v;
    if(k==='gender'){myLook.name=$('nm').value;return maker()}
    $('panel').querySelectorAll(`[data-k="${k}"]`).forEach(x=>x.setAttribute('aria-pressed',x===b));rebuildPreview();if(k==='pal'){const q=PAL[myLook.pal];$('idPh').style.background=`linear-gradient(160deg,${q.a} 55%,${q.b} 55%)`}});
  $('panel').querySelectorAll('[data-int]').forEach(b=>b.onclick=()=>{const i=b.dataset.int;let a=myLook.interests.filter(x=>x!==i);if(a.length===myLook.interests.length)a=[...a,i].slice(-2);myLook.interests=a;
    $('panel').querySelectorAll('[data-int]').forEach(x=>x.setAttribute('aria-pressed',myLook.interests.includes(x.dataset.int)))});
  $('nm').oninput=e=>myLook.name=e.target.value;
  $('face').onclick=e=>{faceZoom=!faceZoom;e.target.textContent=faceZoom?'🧍 Body':'👁 Face'};
  $('rnd').onclick=()=>{const keep={name:myLook.name,interests:myLook.interests};myLook=Object.assign(randomLook(pick(['m','f'])),keep);maker()};
  $('go').onclick=()=>{if(myLook.interests.length<1)myLook.interests=['Afrobeats'];try{localStorage.setItem('freshers-look',JSON.stringify(myLook))}catch(e){}
    pvOn=false;faceZoom=false;rollBackground()};
  setupPreview($('pv'));
  /* turn your student yourself: drag on the preview, or the ⟲ ⟳ buttons */
  {const c=$('pv');let dn=null;const hold=()=>{PVHOLD=performance.now()+4000;const h=$('rotHint');if(h)h.style.opacity=0};
    c.style.touchAction='none';c.onpointerdown=e=>{dn={x:e.clientX,a:pvAngle};hold();try{c.setPointerCapture(e.pointerId)}catch(x){}};
    c.onpointermove=e=>{if(!dn)return;pvAngle=dn.a+(e.clientX-dn.x)*.012;hold()};c.onpointerup=c.onpointercancel=()=>{dn=null};
    $('rotL').onclick=()=>{pvAngle-=Math.PI/4;hold()};$('rotR').onclick=()=>{pvAngle+=Math.PI/4;hold()}}
}
