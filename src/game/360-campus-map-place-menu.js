/* ================= places: icons, categories, tap-a-building menu, campus map ================= */
const PCAT={learn:['🎓','Study','#5aa9e6'],food:['🍛','Food','#e8823a'],shop:['🛍️','Shops & money','#c58be0'],fun:['🎉','Hangouts','#ff6fae'],sport:['⚽','Sports','#4fb87a'],home:['🏠','Hostels','#f2c230'],go:['🚌','Transport','#9aa7b3'],care:['⛪','Health & faith','#e05a5a']};
const PINFO={coe:['⚙️','learn'],senate:['🏛️','learn'],lib:['📚','learn'],canr:['🌾','learn'],cos:['🔬','learn'],cohss:['📖','learn'],cabe:['📐','learn'],chs:['🩺','learn'],office:['🗳️','learn'],print:['🖨️','learn'],greathall:['🎤','learn'],
  canteen:['🍛','food'],shawarma:['🌯','food'],market:['🧺','food'],night:['🌙','food'],mall:['🛍️','shop'],unity:['🏦','shop'],bank:['🏦','shop'],salon:['💈','shop'],phonehub:['📱','shop'],pharm:['💊','shop'],books:['📘','shop'],
  club:['🪩','fun'],square:['🌳','fun'],parade:['🎪','fun'],lake:['🦆','fun'],garden:['🌺','fun'],field:['⚽','sport'],pavilion:['🏟️','sport'],court:['🏀','sport'],pool:['🏊','sport'],gym:['🏋️','sport'],hall:['🏐','sport'],
  lodge:['🏠','home'],sunrise:['🏠','home'],royal:['🏠','home'],bayview:['🏠','home'],heights:['🏠','home'],kotei:['🏠','home'],taxi:['🚕','go'],trotro:['🚐','go'],terminal:['🚌','go'],clinic:['🏥','care'],chapel:['⛪','care'],mosque:['🕌','care']};
HOSTELS.forEach(h=>{if(!PINFO[h.id])PINFO[h.id]=[BID[h.id]&&BID[h.id].hall?'🏛️':'🏠','home']});['adinkra','yaa'].forEach(k=>PINFO[k]=['🏛️','home']);
const PSHORT={mosque:'Mosque',coe:'CoE',senate:'Admin',lib:'Library',canr:'CANR',cos:'CoS',cohss:'CoHSS',cabe:'CABE',chs:'CHS',office:'SRC Office',print:'Print & Type',greathall:'Great Hall',canteen:'Canteen',shawarma:'Shawarma',market:'Market',night:'Night Market',mall:'Mall',unity:'Unity Bank',bank:'Savings Bank',salon:'Salon',phonehub:'Phone Hub',pharm:'Pharmacy',books:'Bookshop',club:'Club Vibes',square:'Square',parade:'Parade',lake:'Lake',garden:'Garden',field:'Field',pavilion:'Pavilion',court:'Court',pool:'Pool',gym:'Gym',hall:'Sports Hall',lodge:'Akwaaba Lodge',sunrise:'Sunrise',royal:'Royal Crest',bayview:'Bay View',heights:'Ayeduase',kotei:'Kotei Court',taxi:'Taxis',trotro:'Trotro',terminal:'Shuttle',clinic:'Clinic',chapel:'Chapel'};
const pIcon=b=>(PINFO[b.id]||['📍'])[0],pCat=b=>(PINFO[b.id]||[0,'learn'])[1];
const doorPt=b=>({x:b.door[0],y:b.door[1]+(b.door[1]>b.y?10:-10)});
function myXY(){const p=P();if(IS){const b=insideB();return b?doorPt(b):{x:p.x,y:p.y}}return{x:p.x,y:p.y}}
const walkMins=b=>{const m=myXY(),d=Math.hypot(doorPt(b).x-m.x,doorPt(b).y-m.y);return Math.max(1,Math.round(d/110))};
/* Sims-style: tap a building, pick what to do, and your Sim walks there and does it */
function placeMenu(b){if(!S||!b)return;S.paused=true;openSheet();const p=P(),here=!IS&&Math.hypot(doorPt(b).x-p.x,doorPt(b).y-p.y)<110,acts_=placeActions(b,false),C=PCAT[pCat(b)];
  const ride=!here&&!IS&&walkMins(b)>=6&&!S.ride;
  $('sheetIn').innerHTML=`<div class="who"><i class="av" style="display:grid;place-items:center;font-size:22px;font-style:normal;background:${C[2]}33;border-color:${C[2]}">${pIcon(b)}</i><div><h3>${esc(b.name)}</h3><div class="tags"><span class="tag">${C[0]} ${C[1]}</span><span class="tag ${here?'g':''}">${here?'You are here':`🚶 about ${walkMins(b)} min walk`}</span>${b.id===p.home?'<span class="tag y">⭐ Your hostel</span>':''}${b.id===p.col?'<span class="tag y">⭐ Your college</span>':''}</div></div></div>
    <div class="list" style="margin-top:8px">${acts_.map(([t,fn,sub],i)=>`<button class="${fn?'ghost':'ghost'}" data-pm="${i}" ${fn?'':'disabled'} style="text-align:left;display:flex;justify-content:space-between;gap:8px"><span>${esc(t)}</span>${sub?`<small style="opacity:.7">${esc(sub)}</small>`:fn&&!here?'<small style="opacity:.6">🚶 go</small>':''}</button>`).join('')||'<p style="font-size:14px">Nothing to do here right now.</p>'}</div>
    <div class="grid2">${here?'':`<button class="btn" id="pmWalk">🚶 Walk there</button>`}${ride?`<button class="ghost" id="pmRide">🚕 Book a ride</button>`:''}<button class="ghost" id="pmMap">🗺 Show on map</button></div><button class="ghost sm" id="bye">Close</button>`;
  $('sheetIn').querySelectorAll('[data-pm]').forEach(x=>x.onclick=()=>{const [t,fn]=acts_[+x.dataset.pm];closeSheet();if(here){fn();return}goDo(b,t)});
  if($('pmWalk'))$('pmWalk').onclick=()=>{closeSheet();goDo(b,null)};if($('pmRide'))$('pmRide').onclick=()=>{closeSheet();phoneRide(b)};
  $('pmMap').onclick=()=>{closeSheet();campusMap(b.id)};$('bye').onclick=closeSheet}
function phoneRide(b){const q=rideQuote(b.id);S.paused=true;openSheet();$('sheetIn').innerHTML=`<div class="eyebrow">🚕 Ride to ${esc(b.name)}</div><h3>Pick an app</h3><div class="list"><div class="item"><div class="grow"><b>Ryde</b><small>${carDesc('ryde')} · ~${q.mins} min</small></div><button class="btn sm" id="rR">${cedi(q.ryde)}</button></div><div class="item"><div class="grow"><b>Dash</b><small>${carDesc('dash')} · ~${q.mins} min</small></div><button class="btn sm" id="rD">${cedi(q.dash)}</button></div></div><button class="ghost sm" id="bye">Cancel</button>`;
  $('rR').onclick=()=>callRide(b.id,'ryde');$('rD').onclick=()=>callRide(b.id,'dash');$('bye').onclick=closeSheet}
function goDo(b,label){const p=P();if(IS)leaveRoom(true);S.goDo={b:b.id,label,t:S.min};S.auto=null;p.target=doorPt(b);p.path=null;toast(`🚶 Heading to ${b.name}${label?` to ${label.replace(/^[^\w]+/u,'').toLowerCase().slice(0,40)}`:''}…`);acts(true)}
function goDoTick(){const G=S.goDo,p=P();if(!G||IS||S.busy||S.paused)return;const b=BID[G.b],d=doorPt(b),dd=Math.hypot(d.x-p.x,d.y-p.y);
  if(dd<60||(!p.target&&dd<120)){S.goDo=null;p.target=null;if(!G.label){acts(true);PIE=true;acts(true);return}
    const A=placeActions(b,false),m=A.find(x=>x[0]===G.label)||A.find(x=>x[0].slice(0,14)===G.label.slice(0,14));if(m&&m[1])m[1]();else{toast(`You're at ${b.name}.`);PIE=true;acts(true)}return}
  if(!p.target){if(S.min-G.t<240){p.target={...d};p.path=null}else S.goDo=null}}
/* the big readable campus map */
const CM={s:1,ox:0,oy:0,sel:null,cat:null,drag:null,pts:new Map()};
function campusMap(focus){const m=$('cmap');if(!m)return;m.hidden=false;S._cmPause=S.paused;S.paused=true;const cv2=$('cmc'),r=cv2.parentElement.getBoundingClientRect();
  const dpr=Math.min(2,devicePixelRatio||1);cv2.width=r.width*dpr;cv2.height=r.height*dpr;cv2.style.width=r.width+'px';cv2.style.height=r.height+'px';CM.dpr=dpr;CM.W=r.width;CM.H=r.height;
  CM.s=Math.max(r.width/MW,Math.min(r.height/MH,r.width/MW*2.2));const c=focus?doorPt(BID[focus]):myXY();cmCenter(c.x,c.y);CM.sel=focus||null;cmChips();cmCard();cmDraw()}
function cmCenter(x,y){CM.ox=CM.W/2-x*CM.s;CM.oy=CM.H/2-y*CM.s;cmClamp()}
function cmClamp(){const w=MW*CM.s,h=MH*CM.s;CM.ox=w<CM.W?(CM.W-w)/2:Math.min(0,Math.max(CM.W-w,CM.ox));CM.oy=h<CM.H?(CM.H-h)/2:Math.min(0,Math.max(CM.H-h,CM.oy))}
function cmZoom(k,cx=CM.W/2,cy=CM.H/2){const s0=CM.s,s1=Math.max(CM.W/MW*.95,Math.min(.6,s0*k));CM.ox=cx-(cx-CM.ox)*s1/s0;CM.oy=cy-(cy-CM.oy)*s1/s0;CM.s=s1;cmClamp();cmDraw()}
function closeMap(){$('cmap').hidden=true;S.paused=!$('sheet').hidden||!$('story').hidden;acts(true)}
function cmChips(){$('cmchips').innerHTML=Object.entries(PCAT).map(([k,[ic,nm,col]])=>`<button class="cmchip ${CM.cat===k?'on':''}" data-cc="${k}" style="--cc:${col}">${ic} ${nm}</button>`).join('');
  $('cmchips').querySelectorAll('[data-cc]').forEach(x=>x.onclick=()=>{CM.cat=CM.cat===x.dataset.cc?null:x.dataset.cc;cmChips();cmList();cmDraw()});cmList()}
function cmList(){const q=($('cmq').value||'').trim().toLowerCase(),L=$('cmlist');if(!q&&!CM.cat){L.hidden=true;return}
  const R=B.filter(b=>(!CM.cat||pCat(b)===CM.cat)&&(!q||b.name.toLowerCase().includes(q)||(PCAT[pCat(b)][1].toLowerCase().includes(q)))).slice(0,12);
  L.hidden=false;L.innerHTML=R.map(b=>`<button data-cl="${b.id}">${pIcon(b)} ${esc(b.name)} <small>${walkMins(b)} min</small></button>`).join('')||'<small style="padding:6px">No places found</small>';
  L.querySelectorAll('[data-cl]').forEach(x=>x.onclick=()=>{CM.sel=x.dataset.cl;const d=doorPt(BID[CM.sel]);if(CM.s<.18)CM.s=.2;cmCenter(d.x,d.y);cmCard();cmDraw();if(innerWidth<700)L.hidden=true})}
function cmCard(){const C=$('cmcard'),b=CM.sel&&BID[CM.sel];if(!b){C.hidden=true;return}const p=P(),here=!IS&&Math.hypot(doorPt(b).x-p.x,doorPt(b).y-p.y)<110,cat=PCAT[pCat(b)];
  C.hidden=false;C.innerHTML=`<div class="row" style="gap:10px;align-items:center"><span style="font-size:26px">${pIcon(b)}</span><div class="grow"><b>${esc(b.name)}</b><small style="display:block;opacity:.75">${cat[0]} ${cat[1]} · ${here?'you are here':`🚶 ~${walkMins(b)} min walk`}${b.id===p.home?' · ⭐ your hostel':''}${b.id===p.col?' · ⭐ your college':''}</small></div><button class="ghost sm" id="cmcx">✕</button></div>
    <div class="grid2" style="margin-top:8px"><button class="btn" id="cmGo">${here?'📋 What\'s here':'🚶 Go here'}</button><button class="ghost" id="cmDo">📋 Things to do</button></div>`;
  $('cmcx').onclick=()=>{CM.sel=null;cmCard();cmDraw()};$('cmGo').onclick=()=>{closeMap();here?placeMenu(b):goDo(b,null)};$('cmDo').onclick=()=>{closeMap();placeMenu(b)}}
function cmDraw(){const cv2=$('cmc'),g=cv2.getContext('2d'),k=CM.s,X=x=>CM.ox+x*k,Y=y=>CM.oy+y*k,p=P();g.setTransform(CM.dpr,0,0,CM.dpr,0,0);g.clearRect(0,0,CM.W,CM.H);
  g.fillStyle='#4d6b3a';g.fillRect(X(0),Y(0),MW*k,MH*k);
  Object.values(ZONES).forEach(z=>{g.fillStyle=z.mini;z.rects.forEach(([x,y,w,h])=>g.fillRect(X(x),Y(y),w*k,h*k))});
  g.fillStyle='#6f6a62';ROADS.forEach(([x,y,w,h])=>g.fillRect(X(x),Y(y),w*k,h*k));g.strokeStyle='rgba(255,220,120,.6)';g.setLineDash([6,6]);g.lineWidth=1;
  HROADS.forEach(([y,a,b2])=>{g.beginPath();g.moveTo(X(a),Y(y));g.lineTo(X(b2),Y(y));g.stroke()});VX.forEach(x=>{g.beginPath();g.moveTo(X(x),Y(0));g.lineTo(X(x),Y(MH));g.stroke()});g.setLineDash([]);
  // zone names
  g.textAlign='center';g.textBaseline='middle';g.font=`800 ${Math.max(11,Math.min(22,k*140))}px Figtree, system-ui`;g.fillStyle='rgba(255,255,255,.22)';
  [['ACCRA–KUMASI ROAD',2700,265],['TECH JUNCTION',300,600],['BOMSO',1500,90],['AYIGYA',3200,90],['KENTINKRONO',4700,90],['COMMERCIAL AREA',1300,1700],['ADMINISTRATION',2700,940],['HALLS',2700,1600],['FACULTY AREA',3900,1300],['SPORTS',2700,2700],['BOTANICAL GARDEN',1000,2700],['AYEDUASE',4900,1600],['GYINYAASE',1000,3700],['KOTEI',2700,3700],['BOADI',3900,3700],['GAZA · NEW SITE',4900,3700]].forEach(([t,x,y])=>g.fillText(t,X(x),Y(y)));
  // shuttle stops
  SH_STOPS.forEach(st=>{g.fillStyle='#fff';g.beginPath();g.arc(X(st.sx),Y(st.sy),Math.max(2.5,k*14),0,7);g.fill();g.fillStyle='#8e2a3a';g.beginPath();g.arc(X(st.sx),Y(st.sy),Math.max(1.5,k*9),0,7);g.fill()});
  // buildings
  const fs=Math.max(10,Math.min(15,k*70));
  B.forEach(b=>{const cat=pCat(b),col=PCAT[cat][2],dim=CM.cat&&CM.cat!==cat,sel=CM.sel===b.id;g.globalAlpha=dim?.25:1;
    g.fillStyle=b.open?col+'55':col+'cc';g.strokeStyle=sel?'#fff':'rgba(0,0,0,.35)';g.lineWidth=sel?3:1;const rx=X(b.x),ry=Y(b.y),rw=b.w*k,rh=b.h*k;
    g.beginPath();g.roundRect?g.roundRect(rx,ry,rw,rh,Math.min(8,rw/6)):g.rect(rx,ry,rw,rh);g.fill();g.stroke();
    const ic=Math.max(11,Math.min(24,Math.min(rw,rh)*.42));g.font=`${ic}px Apple Color Emoji, Segoe UI Emoji, system-ui`;g.fillText(pIcon(b),rx+rw/2,ry+rh/2-ic*.35);
    {const t=rw>150||sel?b.name.replace(/ \(private\)/,''):(PSHORT[b.id]||b.name),f2=Math.max(9,Math.min(fs,rw/5.2+3));g.font=`800 ${f2}px Figtree, system-ui`;
      g.lineWidth=3;g.strokeStyle='rgba(0,0,0,.7)';g.strokeText(t,rx+rw/2,ry+rh/2+ic*.62,rw+8);g.fillStyle='#fff';g.fillText(t,rx+rw/2,ry+rh/2+ic*.62,rw+8)}
    if(b.id===p.home||b.id===p.col){g.font=`${Math.max(12,fs)}px system-ui`;g.fillText('⭐',rx+rw-8,ry+8)}
    g.globalAlpha=1});
  // people
  const pt=(x,y,c,r)=>{g.fillStyle=c;g.beginPath();g.arc(X(x),Y(y),r,0,7);g.fill()};
  S.npcs.forEach(n=>{if(!n.hidden&&n.friend>=30)pt(n.x,n.y,'rgba(255,255,255,.8)',3)});
  if(p.partner&&!p.partner.hidden){g.font='14px system-ui';g.fillText('❤️',X(p.partner.x),Y(p.partner.y))}
  for(const rp of MP.peers.values()){if(rp.isMe||rp.lobby)continue;const q=rp.in&&BID[rp.in]?doorPt(BID[rp.in]):rp;pt(q.x,q.y,'#7fd8ff',5);g.font='800 11px Figtree, system-ui';g.lineWidth=3;g.strokeStyle='#06202b';g.strokeText(rp.nm,X(q.x),Y(q.y)-12);g.fillStyle='#bfefff';g.fillText(rp.nm,X(q.x),Y(q.y)-12)}
  const me=myXY(),t=performance.now()/600;g.fillStyle='rgba(255,210,90,.35)';g.beginPath();g.arc(X(me.x),Y(me.y),10+4*Math.sin(t),0,7);g.fill();pt(me.x,me.y,'#ffd25a',6);g.strokeStyle='#1b1206';g.lineWidth=2;g.stroke();
  g.font='900 12px Figtree, system-ui';g.lineWidth=3;g.strokeStyle='#1b1206';g.strokeText('YOU',X(me.x),Y(me.y)-15);g.fillStyle='#ffd25a';g.fillText('YOU',X(me.x),Y(me.y)-15);
  if(p.target&&!IS){g.strokeStyle='rgba(255,210,90,.9)';g.setLineDash([4,4]);g.lineWidth=2;g.beginPath();g.moveTo(X(me.x),Y(me.y));g.lineTo(X(p.target.x),Y(p.target.y));g.stroke();g.setLineDash([])}}
function cmHit(cx,cy){const x=(cx-CM.ox)/CM.s,y=(cy-CM.oy)/CM.s;return B.find(b=>x>=b.x-12&&x<=b.x+b.w+12&&y>=b.y-12&&y<=b.y+b.h+12)}
(function cmInit(){const m=document.createElement('div');m.id='cmap';m.hidden=true;m.innerHTML=`<div class="cm-top"><b>🗺 Campus map</b><input id="cmq" placeholder="🔎 Search: library, food, bank…" autocomplete="off"><button class="glass" id="cmx" aria-label="Close map">✕</button></div><div id="cmchips"></div><div class="cm-wrap"><canvas id="cmc"></canvas><div id="cmlist" hidden></div><div class="cm-zoom"><button class="glass" id="cmzi">+</button><button class="glass" id="cmzo">−</button><button class="glass" id="cmme" aria-label="Find me">◎</button></div><div class="cm-legend">⭐ yours · <span style="color:#ffd25a">●</span> you · <span style="color:#7fd8ff">●</span> real players · ❤️ partner · <span style="color:#fff">•</span> friends · <span style="color:#d0546a">●</span> shuttle stop</div></div><div id="cmcard" hidden></div>`;document.body.appendChild(m);
  const cv2=m.querySelector('#cmc');m.querySelector('#cmx').onclick=closeMap;m.querySelector('#cmzi').onclick=()=>cmZoom(1.4);m.querySelector('#cmzo').onclick=()=>cmZoom(1/1.4);m.querySelector('#cmme').onclick=()=>{const c=myXY();cmCenter(c.x,c.y);cmDraw()};
  m.querySelector('#cmq').oninput=()=>cmList();
  cv2.addEventListener('pointerdown',e=>{cv2.setPointerCapture(e.pointerId);CM.pts.set(e.pointerId,{x:e.offsetX,y:e.offsetY});CM.moved=0;if(CM.pts.size===2){const [a,b]=[...CM.pts.values()];CM.pd=Math.hypot(a.x-b.x,a.y-b.y);CM.ps=CM.s}});
  cv2.addEventListener('pointermove',e=>{const q=CM.pts.get(e.pointerId);if(!q)return;const dx=e.offsetX-q.x,dy=e.offsetY-q.y;q.x=e.offsetX;q.y=e.offsetY;
    if(CM.pts.size===2){const [a,b]=[...CM.pts.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(CM.pd){cmZoom(d/CM.pd,(a.x+b.x)/2,(a.y+b.y)/2);CM.pd=d}CM.moved=99;return}
    CM.moved+=Math.abs(dx)+Math.abs(dy);CM.ox+=dx;CM.oy+=dy;cmClamp();cmDraw()});
  const up=e=>{if(!CM.pts.has(e.pointerId))return;CM.pts.delete(e.pointerId);if(CM.pts.size<2)CM.pd=0;if(CM.moved<8&&CM.pts.size===0){const b=cmHit(e.offsetX,e.offsetY);CM.sel=b?b.id:null;cmCard();cmDraw()}};
  cv2.addEventListener('pointerup',up);cv2.addEventListener('pointercancel',up);cv2.addEventListener('wheel',e=>{e.preventDefault();cmZoom(e.deltaY>0?1/1.15:1.15,e.offsetX,e.offsetY)},{passive:false});
  setInterval(()=>{if(!m.hidden)cmDraw()},120)})();
