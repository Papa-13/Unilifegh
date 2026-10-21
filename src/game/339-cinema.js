/* ================= 🎬 Kente Cinemas =================
   A cinema in the commercial strip. Pick a film and a showtime, grab snacks, and watch it in a
   full-screen theatre: the film plays on the big screen with subtitles while you munch popcorn.
   On a movie date you can share popcorn, hold hands, whisper, and (if things are going well) kiss.
   Horror films make your date grab your arm. Open 12:00 to midnight. */
const CINE_PRICE=h=>h>=18?50:40;
const FILMS=[
  {id:'kn',t:'Kumasi Nights',g:'Romance',ic:'💞',times:[14,20],pal:['#2a1240','#ff7aa8','#ffd3a1'],beats:[['city','Ama has one week left in Kumasi before she moves abroad.'],['night','Then she meets Kojo, a taxi driver who knows every street in the city.'],['road','"Show me the real Kumasi," she says.'],['city','Kejetia at dawn. Fufu at midnight. They talk until the sun comes up.'],['rain','Her flight is tomorrow. He never told her how he feels.'],['night','At the airport gate, she turns around. 💞']]},
  {id:'ar',t:'Ananse Returns',g:'Animation',ic:'🕷️',times:[12,16],pal:['#103a2a','#f2c230','#7dff8a'],beats:[['forest','Kwaku Ananse has stolen all the stories in the world… again.'],['forest','Little Efua has to get them back before the village forgets how to dream.'],['night','She tricks the python, the leopard and the hornets, just like Ananse once did.'],['chase','But Ananse has one last trick up all eight of his sleeves.'],['forest','"A story shared is a story that never dies."'],['city','The village laughs again. 🕷️']]},
  {id:'lt',t:'The Last Trotro',g:'Action',ic:'🚐',times:[18,22],pal:['#1d1d1d','#ff5a1a','#ffd34d'],beats:[['road','Mate Kofi just wants to finish his last trip from Circle to Kaneshie.'],['chase','Then three men with a briefcase jump in. "Drive!"'],['road','Police on the left. Okadas on the right. No brakes.'],['chase','The trotro jumps the overpass. The whole cinema screams.'],['city','The briefcase holds… stolen exam papers.'],['road','Kofi drives them straight to the police station. 🚐']]},
  {id:'as',t:'Asamando',g:'Horror',ic:'👻',times:[21,23],pal:['#05070c','#7a1f2a','#9aa7b3'],beats:[['night','Four students dare each other to spend a night in the old hall.'],['ghost','The lights go off. Someone is knocking from inside the wall.'],['rain','"Who wrote our names on the mirror?"'],['ghost','A figure in white stands at the end of the corridor.'],['night','Only three of them come out in the morning.'],['ghost','The end…? 👻']]},
  {id:'cc',t:'Cedi Chase',g:'Comedy',ic:'😂',times:[13,17,19],pal:['#1a2a4a','#4fb87a','#f2e6c9'],beats:[['city','Two broke roommates find a winning lottery ticket… in a dead man\'s jacket.'],['room','The only problem: they gave the jacket to their landlady.'],['chase','A wedding, a funeral and a goat. Don\'t ask.'],['room','The landlady has already used the ticket to wrap kelewele.'],['city','They win anyway. Kind of.'],['city','"Next time, we check the pockets." 😂']]},
  {id:'lo',t:'Love in Osu',g:'Rom-com',ic:'🌇',times:[15,19,21],pal:['#2a1f3a','#ffb02e','#ff6fae'],beats:[['city','Fashion designer Abena hates dating apps.'],['room','Then her worst match ever becomes her new business partner.'],['night','They argue. They design. They argue more.'],['rain','A rainy night on Oxford Street changes everything.'],['city','Fashion week. One dress. One question.'],['night','"Yes." 🌇']]}];
function cineNext(f){const h=hour();return f.times.find(t=>t>=h-.25)}
function cinemaShowtimes(){const h=hour(),p=P(),bd=buddy()||(IS&&IS.buddy);openSheet();const price=CINE_PRICE(h);
  $('sheetIn').innerHTML=`<div class="eyebrow">🎬 Kente Cinemas</div><h3>Now showing</h3><p style="font-size:13px;opacity:.8">Tickets ${cedi(price)}${bd?` each · for you and ${esc(bd.name.split(' ')[0])}`:''}. Snacks at the counter.</p>
    <div class="list">${FILMS.map((f,i)=>{const nx=cineNext(f);return `<div class="item"><span style="font-size:26px">${f.ic}</span><div class="grow"><b>${f.t}</b><small>${f.g} · ${f.times.map(t=>`<span style="${t===nx?'color:#ffd34d;font-weight:800':t<h-.25?'opacity:.4;text-decoration:line-through':''}">${t}:00</span>`).join(' · ')}</small></div>${nx!=null?`<button class="btn sm" data-f="${i}">${nx<=h?'Now':nx+':00'}</button>`:'<small style="opacity:.6">Done today</small>'}</div>`}).join('')}</div>`;
  $('sheetIn').querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>cinemaSnacks(FILMS[+b.dataset.f],bd))}
function cinemaSnacks(f,bd){const p=P(),sel={pop:1,drink:1},PR={pop:[0,20,30],drink:[0,12,15]};openSheet();const n=bd?2:1,tk=CINE_PRICE(hour())*n;
  const draw=()=>{const tot=tk+(PR.pop[sel.pop]+PR.drink[sel.drink])*(bd?1:1);$('sheetIn').innerHTML=`<div class="eyebrow">🎬 ${esc(f.t)} · ${cineNext(f)}:00</div><h3>Snacks?</h3>
    <b style="font-size:13px">Popcorn${bd?' (to share 😉)':''}</b><div class="chips">${['None','🍿 Regular · GH₵20','🍿 Large · GH₵30'].map((x,i)=>`<button class="chip${sel.pop===i?' on':''}" data-p="${i}">${x}</button>`).join('')}</div>
    <b style="font-size:13px">Drink</b><div class="chips">${['None','🥤 Coke · GH₵12','🧃 Sobolo · GH₵15'].map((x,i)=>`<button class="chip${sel.drink===i?' on':''}" data-d="${i}">${x}</button>`).join('')}</div>
    <div class="row" style="justify-content:space-between;margin-top:10px"><b>Total ${cedi(tot)}</b><small>${n} ticket${n>1?'s':''} · MoMo ${cedi(p.money)}</small></div><button class="btn" id="cnGo" style="width:100%;margin-top:8px">🎟️ Buy and go in</button>`;
    $('sheetIn').querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{sel.pop=+b.dataset.p;draw()});$('sheetIn').querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{sel.drink=+b.dataset.d;draw()});
    $('cnGo').onclick=()=>{let tot=tk+PR.pop[sel.pop]+PR.drink[sel.drink],treat=false;if(bd&&(bd.romance||0)>=45&&Math.random()<.3){treat=true;tot-=tk/2}
      if(p.money<tot)return toast(`That's ${cedi(tot)}. Not enough on MoMo.`);p.money-=tot;hud();closeSheet();if(treat)toast(`${bd.name.split(' ')[0]} already bought their own ticket 🥰`);
      const st=cineNext(f);if(st>hour()+.05){toast(`You wait in the lobby until ${st}:00 🛋️`);S.min=Math.max(S.min,day()*1440+st*60)}setTimeout(()=>cinemaWatch(f,bd,{pop:sel.pop,drink:sel.drink}),300)}};draw()}
/* the theatre: a full-screen view with the film on the big screen */
function cinemaWatch(f,date,snack){const F=arcFrame(f.t,f.ic);F.ov.classList.add('cine');const p=P(),dn=date?date.name.split(' ')[0]:null;
  const G={t:0,dur:52,beat:-1,pop:snack.pop?(snack.pop===2?14:9):0,held:false,leaned:0,jump:0,shh:0,kiss:false,rom:0,events:[],pops:[]};F.G=G;window._arcF=F;
  F.stats(`<span>${f.g}</span>${date?`<span>❤️ with ${esc(dn)}</span>`:''}`);
  const bar=document.createElement('div');bar.className='cn-bar';F.ov.appendChild(bar);
  const btns=()=>{bar.innerHTML=[G.pop>0?['pop',`🍿 Popcorn (${G.pop})`]:null,date&&!G.held?['hold','🤝 Hold hands']:null,date?['wh','💬 Whisper']:null,date&&G.held&&!G.kiss?['kiss','😘 Lean in']:null,['skip','⏩ Skip to the end']].filter(Boolean).map(([k,l])=>`<button class="ghost sm" data-c="${k}">${l}</button>`).join('');
    bar.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>act(b.dataset.c))};btns();
  const romance=d=>{if(!date)return;date.romance=clamp((date.romance||0)+d);G.rom+=d};
  const act=k=>{if(F.over)return;if(k==='pop'){G.pop--;p.needs.hunger=clamp(p.needs.hunger+2);G.pops.push({t:0});if(date&&Math.random()<.4)F.say(`${dn} reaches into your popcorn too 😏`,1300);arcThud(.1)}
    if(k==='hold'){const ok=(date.romance||0)>=25||Math.random()<.35;if(ok){G.held=true;romance(5);F.say(`${dn} holds your hand back 🥺`,1500)}else{romance(-2);F.say(`${dn} moves ${date.gender==='f'?'her':'his'} hand away… awkward 😬`,1500)}}
    if(k==='wh'){if(Math.random()<.3){G.shh=1;F.say('Someone behind you: "Shhh!" 🤫',1300)}else{romance(2);date.friend=clamp(date.friend+2);F.say(pick([`${dn} giggles at your joke 🤭`,`${dn} whispers: "I knew it was him!"`,`${dn}: "This is nice." 🥰`]),1400)}}
    if(k==='kiss'){if((date.romance||0)>=55){G.kiss=true;G.leaned=1;romance(8);F.say(`💋 A quiet kiss in the dark…`,1800);try{addBuff('loved')}catch(e){}}else{romance(-4);G.leaned=-1;F.say(`${dn} turns back to the screen 😅`,1500)}}
    if(k==='skip')G.t=G.dur;btns()};
  const end=()=>{F.over=true;bar.remove();const stars=Math.max(2,Math.min(5,Math.round(3+arcGauss()*.9)));p.needs.fun=clamp(p.needs.fun+30);if(date)p.needs.social=clamp(p.needs.social+25);
    const buff={Horror:'shaken',Comedy:'amused',Romance:'loved','Rom-com':'loved',Action:'inspired',Animation:'amused'}[f.g];try{addBuff(date&&buff==='shaken'?'amused':buff)}catch(e){}
    if(date){romance(6);date.friend=clamp(date.friend+5);date.dates=(date.dates||0)+1;try{memAdd('date',[date],'Kente Cinemas','us')}catch(e){}}advance(115);hud();try{ev('act',{l:'Watching a movie'});window.track&&window.track('cinema',{film:f.id,date:!!date})}catch(e){}
    F.end(`<div style="font-size:40px">${f.ic}</div><h3>${esc(f.t)}</h3><p>${'⭐'.repeat(stars)}${'☆'.repeat(5-stars)}</p><p class="scene" style="font-size:14px">${date?pick([`Walking out, ${dn} can't stop talking about the ending.`,`${dn}: "Same time next week?" 😊`,`${dn} is still holding your arm as you leave.`]):pick(['Worth every cedi.','You\'ll be thinking about that ending all night.','Not bad at all.'])}</p>${date?`<p>Romance ${G.rom+6>=0?'+':''}${G.rom+6}</p>`:''}`)};
  /* the film itself: procedural scenes per beat, with subtitles */
  const scene=(c,x,y,w,h,kind,tt,pal)=>{const g=c.createLinearGradient(0,y,0,y+h);g.addColorStop(0,pal[0]);g.addColorStop(1,'#000');c.fillStyle=g;c.fillRect(x,y,w,h);c.save();c.beginPath();c.rect(x,y,w,h);c.clip();
    const ox=Math.sin(tt*.2)*w*.04;
    if(kind==='city'||kind==='rain'){for(let i=0;i<14;i++){const bw=w*.09,bh=h*(.25+((i*37)%10)/20),bx=x+i*w*.075+ox-w*.05;c.fillStyle='#0b0b12';c.fillRect(bx,y+h-bh,bw,bh);c.fillStyle=pal[2];for(let k=0;k<8;k++)if((i*7+k*3)%4)c.fillRect(bx+bw*.2+(k%2)*bw*.4,y+h-bh+8+Math.floor(k/2)*bh*.18,bw*.18,bh*.06)}}
    if(kind==='night'||kind==='ghost'){c.fillStyle=pal[2];c.beginPath();c.arc(x+w*.75+ox,y+h*.25,h*.1,0,7);c.fill();for(let i=0;i<40;i++){c.fillStyle=`rgba(255,255,255,${.3+.3*Math.sin(tt*3+i)})`;c.fillRect(x+((i*97)%w),y+((i*53)%(h*.6)),2,2)}c.fillStyle='#050505';c.beginPath();c.moveTo(x,y+h);for(let i=0;i<=10;i++)c.lineTo(x+i*w/10,y+h*(.75+.08*Math.sin(i*1.7)));c.lineTo(x+w,y+h);c.fill()}
    if(kind==='forest'){for(let i=0;i<9;i++){const tx=x+i*w*.12+ox,th2=h*(.45+(i%3)*.1);c.fillStyle='#1b3a20';c.beginPath();c.moveTo(tx,y+h);c.lineTo(tx+w*.06,y+h-th2);c.lineTo(tx+w*.12,y+h);c.fill()}c.fillStyle=pal[1];c.beginPath();c.arc(x+w*.5+Math.sin(tt)*w*.2,y+h*.4+Math.cos(tt*1.3)*h*.1,4,0,7);c.fill()}
    if(kind==='road'||kind==='chase'){c.fillStyle='#222';c.beginPath();c.moveTo(x+w*.42,y+h*.45);c.lineTo(x+w*.58,y+h*.45);c.lineTo(x+w,y+h);c.lineTo(x,y+h);c.fill();c.strokeStyle=pal[2];c.lineWidth=3;for(let i=0;i<6;i++){const k=((tt*(kind==='chase'?1.6:.6)+i/6)%1),yy=y+h*.45+k*k*h*.55;c.beginPath();c.moveTo(x+w/2,yy);c.lineTo(x+w/2,yy+k*h*.08);c.stroke()}
      if(kind==='chase'){c.strokeStyle='rgba(255,255,255,.25)';for(let i=0;i<12;i++){const a=i/12*Math.PI*2,r1=((tt*2+i*.3)%1)*w*.5;c.beginPath();c.moveTo(x+w/2+Math.cos(a)*r1,y+h/2+Math.sin(a)*r1*.6);c.lineTo(x+w/2+Math.cos(a)*(r1+20),y+h/2+Math.sin(a)*(r1+20)*.6);c.stroke()}}
      c.fillStyle=pal[1];c.fillRect(x+w*.44+Math.sin(tt*1.5)*w*.03,y+h*.7,w*.12,h*.12)}
    if(kind==='room'){c.fillStyle='#3a2a1a';c.fillRect(x,y+h*.75,w,h*.25);c.fillStyle=pal[2];c.fillRect(x+w*.6,y+h*.2,w*.22,h*.3);c.fillStyle='#111';[.3,.45].forEach((px,i)=>{c.beginPath();c.arc(x+w*px+Math.sin(tt+i)*4,y+h*.5,h*.06,0,7);c.fill();c.fillRect(x+w*px-h*.05+Math.sin(tt+i)*4,y+h*.56,h*.1,h*.2)})}
    if(kind==='rain'){c.strokeStyle='rgba(180,200,255,.35)';for(let i=0;i<60;i++){const rx=x+((i*53+tt*300)%w),ry=y+((i*91+tt*600)%h);c.beginPath();c.moveTo(rx,ry);c.lineTo(rx-3,ry+12);c.stroke()}}
    if(kind==='ghost'){const a=(Math.sin(tt*2)+1)/2;c.fillStyle=`rgba(230,235,240,${.25+a*.4})`;c.beginPath();c.ellipse(x+w*.5,y+h*.55,w*.05,h*.22,0,0,7);c.fill();c.fillStyle='#000';c.fillRect(x+w*.49,y+h*.42,3,3);c.fillRect(x+w*.51,y+h*.42,3,3)}
    c.restore()};
  F.loop(dt=>{if(F.over){draw();return}G.t+=dt;G.jump=Math.max(0,G.jump-dt*2);G.pops.forEach(q=>q.t+=dt);G.pops=G.pops.filter(q=>q.t<1);
    const bi=Math.min(f.beats.length-1,Math.floor(G.t/G.dur*f.beats.length));if(bi!==G.beat){G.beat=bi;
      if(f.g==='Horror'&&(bi===1||bi===3)){G.jump=1;arcThud(.9);if(date){romance(3);F.say(`😱 ${dn} grabs your arm!`,1500)}else F.say('😱 The whole cinema screams',1300)}
      if(bi===2&&Math.random()<.35)setTimeout(()=>{if(!F.over)F.say(pick(['📱 Someone\'s phone rings. "Hello? I\'m at the cinema!" 🙄','👶 A baby starts crying two rows back','😂 The guy beside you laughs at the wrong moment']),1800)},2500)}
    if(G.t>=G.dur)end();draw()});
  const draw=()=>{const c=F.ctx,W=F.w,H=F.h;c.fillStyle='#07060a';c.fillRect(0,0,W,H);const sw=W*.92,sh=Math.min(sw*.58,H*.42),sx=(W-sw)/2,sy=H*.06,tt=G.t;
    const glow=c.createRadialGradient(W/2,sy+sh/2,10,W/2,sy+sh/2,W*.8);glow.addColorStop(0,f.pal[1]+'33');glow.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=glow;c.fillRect(0,0,W,H);
    const kind=f.beats[Math.max(0,G.beat)][0];scene(c,sx,sy,sw,sh,kind,tt,f.pal);if(G.jump>0){c.fillStyle=`rgba(255,255,255,${G.jump*.6})`;c.fillRect(sx,sy,sw,sh)}
    const fade=(G.t/G.dur*f.beats.length)%1;if(fade<.08||fade>.95){c.fillStyle=`rgba(0,0,0,${fade<.08?1-fade/.08:(fade-.95)/.05})`;c.fillRect(sx,sy,sw,sh)}
    c.strokeStyle='rgba(255,255,255,.08)';c.strokeRect(sx,sy,sw,sh);
    const sub=f.beats[Math.max(0,G.beat)][1];c.font='600 13px system-ui';c.textAlign='center';const lines=[];let ln='';sub.split(' ').forEach(w=>{const t2=ln?ln+' '+w:w;if(c.measureText(t2).width>sw-36&&ln){lines.push(ln);ln=w}else ln=t2});if(ln)lines.push(ln);
    lines.forEach((L2,i)=>{const yy=sy+sh-12-(lines.length-1-i)*18,tw=c.measureText(L2).width+14;c.fillStyle='rgba(0,0,0,.65)';c.fillRect(W/2-tw/2,yy-13,tw,18);c.fillStyle='#fff';c.fillText(L2,W/2,yy)});
    /* the seats and heads in front, then you and your date from behind */
    for(let r=0;r<3;r++){const yy=sy+sh+H*.08+r*H*.09,n=7+r;for(let i=0;i<n;i++){const hx=(i+.5)/n*W+(r%2)*12,hr=H*(.022+r*.006);c.fillStyle='#4a0f17';c.fillRect(hx-hr*1.7,yy+hr*.6,hr*3.4,hr*2.4);if((i*3+r)%4)c.fillStyle='#1a161d',c.beginPath(),c.arc(hx,yy,hr,0,7),c.fill()}}
    const by=H*.82,hr=H*.055,lean=G.leaned>0?hr*.35:0;c.fillStyle='#5a1420';c.fillRect(W/2-hr*4.5,by+hr*.4,hr*9,hr*3);c.fillStyle='#141216';c.beginPath();c.arc(W/2-hr*1.3+lean,by,hr,0,7);c.fill();c.fillRect(W/2-hr*2.3+lean,by+hr*.8,hr*2,hr*2.4);
    if(date){c.beginPath();c.arc(W/2+hr*1.3-lean,by-(G.leaned<0?0:0),hr*.95,0,7);c.fill();c.fillRect(W/2+hr*.35-lean,by+hr*.8,hr*1.9,hr*2.4);if(G.held){c.fillStyle='#ff6fae';c.font='16px system-ui';c.fillText('❤️',W/2,by+hr*2.2-Math.sin(G.t*3)*3)}}
    if(G.kiss&&G.leaned>0){c.font='22px system-ui';c.fillText('💋',W/2,by-hr*1.2)}
    G.pops.forEach(q=>{c.globalAlpha=1-q.t;c.font='18px system-ui';c.fillText('🍿',W/2-hr*1.3+q.t*12,by-hr-q.t*30);c.globalAlpha=1});
    const pr=G.t/G.dur;c.fillStyle='rgba(255,255,255,.12)';c.fillRect(0,H-3,W,3);c.fillStyle=f.pal[1];c.fillRect(0,H-3,W*pr,3)};
  return F}
function cinemaInvite(){const list=S.npcs.filter(n=>n.contact&&(n.romance>=15||n.friend>=35)).sort((a,b)=>(b.romance||0)-(a.romance||0)).slice(0,8);if(!list.length)return toast('No one in your contacts close enough to invite to a movie yet.');
  placeSheet('📲 Who do you want to take to the movies?',list.map(n=>`${n.name}${n.romance>=40?' ❤️':''}`),i=>{const n=list[i],ok=Math.random()<.4+(n.romance||0)/150+(n.friend||0)/250;toast(`📲 You text ${n.name.split(' ')[0]}: "Movie tonight? 🍿"`);
    setTimeout(()=>{if(ok){toast(`${n.name.split(' ')[0]}: "Yesss! I'm coming 🏃" … they arrive 15 minutes later 😍`);advance(15);n.with=Math.max(n.with||0,S.min+180);if(IS)IS.buddy=n;cinemaShowtimes()}else toast(`${n.name.split(' ')[0]}: "Not tonight 😩 Another time?"`)},1600)})}
/* the building */
BLD.cinema={W:11,D:9,wall:0x1a1418,floor:3};
{const _eb=enterBuilding;enterBuilding=function(id){const r=_eb.apply(this,arguments);try{if(IS&&IS.kind==='bld'&&IS.bid==='cinema')cinemaInterior(IS)}catch(e){console.warn(e)}return r}}
function cinemaInterior(I){const s=I.scene,W=I.W,D=I.D;
  const cv=document.createElement('canvas');cv.width=512;cv.height=256;const g=cv.getContext('2d'),f=pick(FILMS);const gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,f.pal[0]);gr.addColorStop(1,'#000');g.fillStyle=gr;g.fillRect(0,0,512,256);g.fillStyle=f.pal[1];g.font='900 54px system-ui';g.textAlign='center';g.fillText(f.t.toUpperCase(),256,140);g.font='600 22px system-ui';g.fillStyle='#fff';g.fillText('NOW SHOWING',256,180);
  const scr=new THREE.Mesh(new THREE.PlaneGeometry(6.4,2.4),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv)}));scr.position.set(0,1.9,-D/2+.08);s.add(scr);const l=new THREE.PointLight(0xaabbff,.8,7,1.6);l.position.set(0,1.6,-D/2+1.5);s.add(l);
  const seats=[];for(let r=0;r<4;r++){const z=-D/2+2.6+r*1.15,y=r*.18;box(W-2.6,y+.02,1.1,0x2a1418,0,y/2,z,s);for(let i=0;i<7;i++){const x=-3.3+i*1.1;box(.6,.5,.55,0x9b1b2a,x,y+.25,z,s);box(.6,.55,.12,0x7a1420,x,y+.55,z+.28,s);seats.push({x,z:z-.05,ry:Math.PI,ly:y})}
    I.obst.push({x1:-3.8,x2:3.8,z1:z-.35,z2:z+.4})}
  box(2.6,1,.7,0x3a2a1a,W/2-1.8,.5,D/2-1.6,s);I.obst.push({x1:W/2-3.1,x2:W/2-.5,z1:D/2-2,z2:D/2-1.2});box(.6,1.4,.5,0xe8b24a,W/2-.8,.7,D/2-2.4,s);
  addInPerson(staffLook('m',{outfit:'polo',pal:'maroon'}),'Ticket counter',W/2-1.8,D/2-2.3,0,'talk');
  FILMS.slice(0,4).forEach((ff,i)=>{const t=new THREE.Mesh(new THREE.PlaneGeometry(.9,1.3),new THREE.MeshBasicMaterial({map:textTex(ff.ic+' '+ff.t,{w:256,h:360,font:'800 26px system-ui',color:ff.pal[2],stroke:false,bg:ff.pal[0]})}));t.position.set(i<2?-W/2+.06:W/2-.06,1.5,-1+(i%2)*1.6);t.rotation.y=i<2?Math.PI/2:-Math.PI/2;s.add(t)});
  I.seatList=seats;I.spots.seat=seats[10]}
{const _pa=placeActions;placeActions=function(b,inside){const a=_pa.apply(this,arguments);try{if(b&&b.id==='cinema'){const h=hour(),open=h>=12;
  if(inside){if(!open)a.unshift(['🎬 Opens at 12:00',null]);else{const bd=buddy()||(IS&&IS.buddy);a.unshift(['🎟️ See what\'s showing',()=>cinemaShowtimes(),null,'b'],...(bd?[]:[['📲 Invite someone to a movie',()=>cinemaInvite()]]),['🍿 Just buy popcorn · GH₵20',()=>eat(20,15,'popcorn',8)])}}
  else if(!open){const i=a.findIndex(x=>/^Go inside/.test(x[0]));if(i>=0)a[i]=['Kente Cinemas opens at 12:00',null]}}}catch(e){}return a}}
/* dates: the cinema is now one of the places you can take someone */
{const _ds=dateScene;dateScene=function(n){const h=hour();if(h<12)return _ds.apply(this,arguments);const o=[];if(h>=11&&h<22)o.push(['resto',`🍽️ Dinner at Akwaaba Grill · ${cedi(150)}`]);o.push(['cinema',`🎬 A movie at Kente Cinemas · ${cedi(CINE_PRICE(h)*2)}+`]);if(h>=17)o.push(['night',`🌙 Night Market street food · ${cedi(60)}`]);o.push(['lake','🦆 A walk by the Campus Lake · free']);
  placeSheet(`❤️ Where do you want to take ${esc(n.name)}?`,o.map(x=>x[1]),i=>{const k=o[i][0];if(k==='cinema'){n.with=Math.max(n.with||0,S.min+180);enterBuilding('cinema');setTimeout(()=>{if(IS)IS.buddy=n;cinemaShowtimes()},700)}else dateGo(n,k)})}}
