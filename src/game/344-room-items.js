/* ================= tap your stuff: move it, sell it, and a TV with channels =================
   In your room, tap anything you've placed (or pick it from "Arrange or sell your stuff") to move it or
   sell it second-hand for half what you paid. The TV now has channels: a remote appears when it's on,
   and the screen actually shows the channel (news, football, music videos, a movie, cartoons, a telenovela). */
const roomItemInfo=id=>{const s=SHOP.find(x=>x.id===id);if(s)return{name:s.name,desc:s.desc,cash:s.price};const d=typeof DRIP!=='undefined'&&DRIP.room.find(x=>x.id===id);return d?{name:d.name,desc:d.desc,gems:d.g}:null};
const sellValue=id=>{const i=roomItemInfo(id);return !i?null:i.cash!=null?{cash:Math.round(i.cash*.5)}:{gems:Math.floor(i.gems*.5)}};
const sellLabel=v=>v.cash!=null?cedi(v.cash):`💎 ${v.gems}`;
function sellItem(id){const p=P(),v=sellValue(id),i=roomItemInfo(id);if(!v)return;if(S.busy)return toast('Finish what you\'re doing first.');
  story(`<div class="eyebrow">💰 Sell second-hand</div><h3>Sell your ${esc(i.name.toLowerCase())}?</h3><p class="scene">A student from the next block wants it for ${sellLabel(v)}. Once it's gone, it's gone.</p>`,
    [[`💰 Sell for ${sellLabel(v)}`,'g',()=>{p.items=p.items.filter(x=>x!==id);if(p.place)delete p.place[id];p.boxed=(p.boxed||[]).filter(x=>x!==id);
        if(v.cash!=null)p.money+=v.cash;else{S.gems=(S.gems||0)+v.gems;try{gemPop(v.gems)}catch(e){}}
        if(id==='tv')tvPower(false);S.decoChanged=1;hud();refreshRoom();toast(`🤝 Sold your ${i.name.toLowerCase()} for ${sellLabel(v)}.`);try{ev('act',{l:'Selling'})}catch(e){}}],['Keep it','',()=>{}]])}
/* the menu you get when you tap one of your things */
function itemMenu(id){const p=P(),i=roomItemInfo(id)||{name:itemName(id),desc:''},v=sellValue(id),boxed=(p.boxed||[]).includes(id),opts=[];
  if(id==='tv'&&!boxed){opts.push([`📺 Watch ${TV_CH[tvCh()].name} (1h)`,'g',()=>{doAct('Watching TV',60,{fun:18,energy:3})}]);opts.push(['📡 Change channel','',()=>tvChannelSheet()]);opts.push([TV.on?'⏻ Turn the TV off':'⏻ Turn the TV on','',()=>tvPower(!TV.on)])}
  if(MOVABLE[id])opts.push([boxed?'📦 Unpack and place it':'🛠️ Move it','',()=>startPlace(id,boxed)]);
  if(v)opts.push([`💰 Sell it (${sellLabel(v)})`,'',()=>sellItem(id)]);opts.push(['Close','',()=>{}]);
  story(`<div class="eyebrow">🛋️ Your stuff${boxed?' · still in its box':''}</div><h3>${esc(i.name)}</h3>${i.desc?`<p class="scene">${esc(i.desc)}</p>`:''}`,opts)}
/* everything you own for your room, in one list */
arrangeSheet=function(){const p=P(),own=p.items.filter(id=>roomItemInfo(id));if(!own.length)return toast('Buy something for your room on HomeMart first.');
  placeSheet('🛠️ Your stuff: tap one to move or sell it',own.map(id=>`${(p.boxed||[]).includes(id)?'📦 ':''}${itemName(id)}${(p.boxed||[]).includes(id)?' · in its box':MOVABLE[id]?(MOVABLE[id].wall?' · on the wall':''):' · on your desk'}`),i=>{closeSheet();setTimeout(()=>itemMenu(own[i]),50)})};
{const _ra=roomActions;roomActions=function(){const a=_ra.apply(this,arguments);try{const k=a.findIndex(x=>/^🛠️ Arrange your room/.test(x[0]));if(k>=0)a[k]=['🛠️ Arrange or sell your stuff',()=>arrangeSheet()];
  else if(inMyRoomNow()&&!S.busy&&P().items.some(id=>roomItemInfo(id)))a.push(['🛠️ Arrange or sell your stuff',()=>arrangeSheet()]);
  if(IS&&IS.tv&&!S.busy)a.push([TV.on?'📡 Change TV channel':'📺 Turn on the TV',()=>TV.on?tvChannelSheet():tvPower(true)])}catch(e){}return a}}
/* remember the 3D group of each thing you placed, so tapping it works */
{const _pi=putItem;putItem=function(id,x,z,ry,ghost){const g=_pi.apply(this,arguments);try{if(!ghost&&IS){(IS.itemG=IS.itemG||{})[id]=g}}catch(e){}return g}}
const tapRay=new THREE.Raycaster();
window.addEventListener('pointerdown',e=>{if(e.target!==cv||PLACE.on||!S||S.paused||S.busy||!inMyRoomNow()||!e.isPrimary)return;tvFind();const G=Object.assign({},IS.itemG||{});if(TV.g&&!G.tv)G.tv=TV.g;
  const r=cv.getBoundingClientRect();tapRay.setFromCamera({x:((e.clientX-r.left)/r.width)*2-1,y:-((e.clientY-r.top)/r.height)*2+1},IS.cam);let best=null;
  for(const id in G){if(!P().items.includes(id)||(MOVABLE[id]&&MOVABLE[id].flat))continue;const h=tapRay.intersectObject(G[id],true)[0];if(h&&(!best||h.distance<best.d))best={id,d:h.distance}}
  if(!best)return;const pm=P().mesh;if(pm&&pm.visible){const hp=tapRay.intersectObject(pm,true)[0];if(hp&&hp.distance<best.d)return}
  e.stopImmediatePropagation();e.preventDefault();itemMenu(best.id)},true);

/* ---------------- the TV and its channels ---------------- */
const TV_CH=[{k:'news',name:'UniNews 24',ic:'📰'},{k:'sport',name:'SportsMax GH',ic:'⚽'},{k:'music',name:'AfroBeat TV',ic:'🎵'},{k:'movie',name:'Kumawood Classics',ic:'🎬'},{k:'toon',name:'Toon Town',ic:'🧸'},{k:'novela',name:'Novela Gold',ic:'💔'}];
const TV={on:false,auto:false,g:null,scr:null,mat0:null,tex:null,cv:null,t0:0,timer:null,ch:null};
const tvCh=()=>{const c=P().tvCh|0;return ((c%TV_CH.length)+TV_CH.length)%TV_CH.length};
const TV_NEWS=['Students rush to the library as exams draw near','Trotro fares unchanged this semester, union says','Black Stars name squad for Saturday\'s qualifier','Heavy rain expected across the south this weekend','Campus Wi-Fi upgrade "almost done", says IT office','Jollof prices steady at the night market'];
const TV_FILM=['"You think you can just walk back into my life?"','"Akosua, the money is not the problem."','"Our families will never accept this…"','"Then we leave tonight. Together."','"Wait. Who sent you?"'];
const TV_NOV=['"¡Mentiroso!" … "Liar!"','"She is my twin sister?!"','"I lost my memory, but not my love."','"Leave this hacienda at once!"','"The baby… is yours."'];
const TV_SONG=['Kofi Vibes · Sunday Jollof','Ama Gold · Odo Bebree','DJ Kwabs · Campus Anthem','Efya Rose · Slow Whine'];
/* find the TV and its screen in the room (works for the auto-placed TV and one you placed yourself) */
function tvFind(){if(!IS||!IS.tv){TV.g=TV.scr=null;return null}if(TV.scr&&TV.scr.parent&&TV._is===IS)return TV.scr;TV.scr=null;TV._is=IS;
  IS.scene.traverse(o=>{const gp=o.geometry&&o.geometry.parameters;if(!TV.scr&&gp&&Math.abs(gp.width-1.2)<.001&&Math.abs(gp.height-.66)<.001&&Math.abs(gp.depth-.01)<.001)TV.scr=o});
  if(TV.scr){TV.g=TV.scr.parent;TV.mat0=TV.scr.material;if(!TV.on){TV.scr.material=basic(0x0e1318)}}return TV.scr}
function tvPower(on,auto){if(on&&!tvFind())return;TV.on=!!on;TV.auto=!!(on&&auto);clearInterval(TV.timer);TV.timer=null;
  if(TV.on){if(!TV.cv){TV.cv=document.createElement('canvas');TV.cv.width=256;TV.cv.height=144;TV.tex=new THREE.CanvasTexture(TV.cv)}TV.scr.material=new THREE.MeshBasicMaterial({map:TV.tex});TV.t0=performance.now();
    tvDraw();TV.timer=setInterval(()=>{if(!IS||!TV.scr||!TV.scr.parent||TV._is!==IS){tvPower(false);return}tvDraw()},110);if(!auto)toast(`📺 ${TV_CH[tvCh()].ic} ${TV_CH[tvCh()].name}`)}
  else if(TV.scr)TV.scr.material=basic(0x0e1318);tvRemote()}
function tvSet(c){const p=P();p.tvCh=((c%TV_CH.length)+TV_CH.length)%TV_CH.length;TV.t0=performance.now();if(!TV.on)tvPower(true);else{tvDraw();tvRemote()}
  const C=TV_CH[p.tvCh];toast(`📺 ${C.ic} ${C.name}`);try{if(S.busy&&/^Watching TV|movie/.test(S.busy.label)&&C.k==='news'&&Math.random()<.4)toast(`🗞️ ${pick(TV_NEWS)}`)}catch(e){}}
function tvChannelSheet(){placeSheet('📡 Pick a channel',TV_CH.map((c,i)=>`${c.ic} ${c.name}${i===tvCh()&&TV.on?' · on now':''}`),i=>{closeSheet();tvSet(i)})}
/* the little remote while the TV is on */
function tvRemote(){let el=$('tvRemote');const show=TV.on&&IS&&IS.tv&&!PLACE.on;if(!show){if(el)el.hidden=true;return}
  if(!el){el=document.createElement('div');el.id='tvRemote';el.style.cssText='position:fixed;left:50%;transform:translateX(-50%);bottom:122px;z-index:30;background:rgba(14,18,24,.88);color:#fff;border-radius:16px;padding:8px 10px;display:flex;align-items:center;gap:6px;font:600 12px system-ui;box-shadow:0 4px 14px rgba(0,0,0,.35)';document.body.appendChild(el)}
  const C=TV_CH[tvCh()],bs='background:#2a3240;color:#fff;border:0;border-radius:10px;min-width:34px;height:34px;font-size:15px;cursor:pointer';
  el.innerHTML=`<button id="tvPrev" style="${bs}" aria-label="Previous channel">◀</button><span style="min-width:96px;text-align:center;line-height:1.15">${C.ic} ${esc(C.name)}<br><small style="opacity:.6">CH ${tvCh()+1}</small></span><button id="tvNext" style="${bs}" aria-label="Next channel">▶</button><button id="tvOff" style="${bs};background:#7a2330" aria-label="Turn TV off">⏻</button>`;el.hidden=false;
  $('tvPrev').onclick=e=>{e.stopPropagation();tvSet(tvCh()-1)};$('tvNext').onclick=e=>{e.stopPropagation();tvSet(tvCh()+1)};$('tvOff').onclick=e=>{e.stopPropagation();tvPower(false)}}
/* draw a frame of the current channel */
function tvDraw(){const c=TV.cv.getContext('2d'),W=256,H=144,t=(performance.now()-TV.t0)/1000,fifa=S.busy&&/FIFA/.test(S.busy.label),k=fifa?'sport':TV_CH[tvCh()].k;c.save();
  const txt=(s,x,y,f,col,al)=>{c.font=f;c.fillStyle=col;c.textAlign=al||'left';c.fillText(s,x,y)};
  if(k==='news'){c.fillStyle='#0d2a52';c.fillRect(0,0,W,H);c.fillStyle='#1d4f8a';for(let i=0;i<6;i++)c.fillRect(150+i*18,10,10,90);c.fillStyle='#e9eef5';c.fillRect(0,96,W,8);
    c.fillStyle='#2b1d12';c.beginPath();c.arc(90,52,17,0,7);c.fill();c.fillStyle='#1a1a2e';c.fillRect(66,70,48,32);c.fillStyle='#c8102e';c.fillRect(86,72,8,14);c.fillStyle='#55432f';c.fillRect(30,90,130,14);
    if(Math.sin(t*9)>0){c.fillStyle='#3a2414';c.fillRect(84,58,12,3)}
    c.fillStyle='#c8102e';c.fillRect(0,110,64,20);txt('BREAKING',32,124,'800 11px system-ui','#fff','center');c.fillStyle='#fff';c.fillRect(64,110,W,20);
    const head=TV_NEWS.join('   •   '),wd=head.length*6.2,off=(t*45)%(wd+W);c.beginPath();c.rect(64,110,W,20);c.clip();txt(head,W-off,124,'600 11px system-ui','#111');c.restore();c.save();
    txt('UNINEWS 24',8,18,'900 13px system-ui','#fff');c.fillStyle='#c8102e';c.fillRect(8,22,30,3);txt('LIVE',W-8,18,'800 10px system-ui','#ff5a5a','right');txt(`${String(Math.floor(hour())).padStart(2,'0')}:${String(Math.floor(S.min%60)).padStart(2,'0')}`,W-8,H-4,'700 10px system-ui','#ccd','right')}
  else if(k==='sport'){for(let i=0;i<8;i++){c.fillStyle=i%2?'#2f8f3c':'#2a8236';c.fillRect(i*32,0,32,H)}c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=1.5;c.strokeRect(8,10,W-16,H-20);c.beginPath();c.moveTo(W/2,10);c.lineTo(W/2,H-10);c.stroke();c.beginPath();c.arc(W/2,H/2,18,0,7);c.stroke();c.strokeRect(8,H/2-25,26,50);c.strokeRect(W-34,H/2-25,26,50);
    const bx=W/2+Math.sin(t*.9)*80+Math.sin(t*2.3)*20,by=H/2+Math.sin(t*1.3)*35;for(let i=0;i<11;i++){const ph=i*1.7;const tx=(i<6?bx-30:bx+30)+Math.sin(t*1.1+ph)*40+(i%3-1)*30,ty=H/2+Math.cos(t*.8+ph)*45+(i%4-1.5)*12;c.fillStyle=i<6?'#d63a3a':'#f2f2f2';c.beginPath();c.arc(clamp(tx,12,W-12),clamp(ty,14,H-14),4,0,7);c.fill()}
    c.fillStyle='#fff';c.beginPath();c.arc(bx,by,2.6,0,7);c.fill();const m=Math.floor(t/2)%90+1;c.fillStyle='rgba(0,0,0,.7)';c.fillRect(6,4,118,16);txt(`${fifa?'FIFA':'GHA'} 1 - 0 ${fifa?'CPU':'NGA'}   ${m}'`,12,16,'800 10px system-ui','#fff');txt(fifa?'🎮 FIFA':'SPORTSMAX',W-8,16,'800 10px system-ui','#fff','right')}
  else if(k==='music'){const hu=(t*40)%360,g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,`hsl(${hu},80%,30%)`);g.addColorStop(1,`hsl(${(hu+120)%360},80%,18%)`);c.fillStyle=g;c.fillRect(0,0,W,H);
    for(let i=0;i<20;i++){const h=12+Math.abs(Math.sin(t*6+i*.7)*Math.cos(t*2.1+i))*70;c.fillStyle=`hsl(${(hu+i*12)%360},90%,62%)`;c.fillRect(14+i*11.5,112-h,8,h)}
    const dx=W/2+Math.sin(t*3)*18;c.fillStyle='#120a08';c.beginPath();c.arc(dx,46,11,0,7);c.fill();c.fillRect(dx-9,56,18,26);c.save();c.translate(dx,60);c.rotate(Math.sin(t*6)*.7);c.fillRect(-2,0,4,22);c.restore();c.save();c.translate(dx,60);c.rotate(-Math.sin(t*6)*.7+3.14);c.fillRect(-2,0,4,22);c.restore();
    c.fillStyle='rgba(0,0,0,.55)';c.fillRect(0,118,W,26);txt('♪ '+TV_SONG[Math.floor(t/8)%TV_SONG.length],8,135,'700 11px system-ui','#fff');txt('AFROBEAT TV',W-8,16,'900 11px system-ui','#fff','right')}
  else if(k==='movie'){const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#f6a35b');g.addColorStop(.6,'#c4486a');g.addColorStop(1,'#2a1630');c.fillStyle=g;c.fillRect(0,0,W,H);c.fillStyle='#ffd88a';c.beginPath();c.arc(W/2,84,20,0,7);c.fill();
    c.fillStyle='#1a0e14';c.fillRect(0,92,W,40);[[W/2-40+Math.sin(t*.5)*4,1],[W/2+40-Math.sin(t*.5)*4,0]].forEach(([x,f])=>{c.beginPath();c.arc(x,60,9,0,7);c.fill();c.fillRect(x-8,68,16,26)});
    c.fillStyle='#000';c.fillRect(0,0,W,14);c.fillRect(0,H-14,W,14);txt(TV_FILM[Math.floor(t/4)%TV_FILM.length],W/2,H-18,'italic 600 10px system-ui','#fff','center')}
  else if(k==='toon'){c.fillStyle='#8fd6ff';c.fillRect(0,0,W,H);c.fillStyle='#6cc04a';c.fillRect(0,104,W,40);c.fillStyle='#fff';[[40,26],[170,20]].forEach(([x,y])=>{const xx=(x+t*12)%(W+60)-30;c.beginPath();c.arc(xx,y,10,0,7);c.arc(xx+12,y-4,12,0,7);c.arc(xx+24,y,10,0,7);c.fill()});
    [['#ff7a3d',70,0],['#b36bff',150,1.4],['#ffd23d',210,2.6]].forEach(([col,x,ph])=>{const y=92-Math.abs(Math.sin(t*3+ph))*44,sq=1+Math.max(0,.25-Math.abs(Math.sin(t*3+ph)))*1.2;c.save();c.translate(x,y);c.scale(sq,1/sq);c.fillStyle=col;c.beginPath();c.arc(0,0,13,0,7);c.fill();
      c.fillStyle='#fff';c.beginPath();c.arc(-5,-3,4,0,7);c.arc(5,-3,4,0,7);c.fill();c.fillStyle='#111';c.beginPath();c.arc(-4,-3,2,0,7);c.arc(6,-3,2,0,7);c.fill();c.restore()});txt('TOON TOWN',8,16,'900 12px system-ui','#1b3a8a')}
  else{const z=1+((t%5)/5)*.15;c.fillStyle='#4a1030';c.fillRect(0,0,W,H);c.save();c.translate(W/2,H/2);c.scale(z,z);c.translate(-W/2,-H/2);c.fillStyle='#7a2048';c.fillRect(0,0,W,H);
    c.fillStyle='#d9a0b0';c.fillRect(30,20,70,100);c.fillStyle='#3a1a0e';c.beginPath();c.arc(84,62,26,0,7);c.fill();c.beginPath();c.arc(176,62,26,0,7);c.fill();c.fillStyle='#2b1206';c.fillRect(66,32,36,16);c.fillRect(156,34,40,12);c.restore();
    txt(TV_NOV[Math.floor(t/4)%TV_NOV.length],W/2,H-12,'italic 700 11px system-ui','#ffe1ec','center');txt('NOVELA GOLD',8,16,'900 11px system-ui','#ffb3cf')}
  c.restore();TV.tex.needsUpdate=true}
/* watching TV, movie night and FIFA turn the TV on, and off again when you're done (unless you'd already turned it on) */
{const _sb=startBusy;startBusy=function(label){const r=_sb.apply(this,arguments);try{if(IS&&IS.tv&&/^Watching TV|Watching a movie|FIFA/.test(label||'')){if(/movie/.test(label)&&!TV.on)P().tvCh=3;if(!TV.on)tvPower(true,true);else tvDraw()}}catch(e){}return r}}
{const _fb=finishBusy;finishBusy=function(){const lb=S.busy&&S.busy.label;const r=_fb.apply(this,arguments);try{if(TV.on&&TV.auto&&/^Watching TV|Watching a movie|FIFA/.test(lb||''))tvPower(false)}catch(e){}return r}}
{const _lr=leaveRoom;leaveRoom=function(){try{if(TV.on){clearInterval(TV.timer);TV.timer=null;TV.on=false}TV.scr=TV.g=null;const el=$('tvRemote');if(el)el.hidden=true}catch(e){}return _lr.apply(this,arguments)}}
{const _sp=startPlace;startPlace=function(){try{const el=$('tvRemote');if(el)el.hidden=true}catch(e){}return _sp.apply(this,arguments)}}
{const _er=enterRoom0;enterRoom0=function(){const r=_er.apply(this,arguments);try{TV.scr=null;tvFind()}catch(e){}return r}}
