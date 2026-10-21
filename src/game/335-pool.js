/* ================= 🎱 pool (8-ball) =================
   Real 8-ball on a 2:1 table: drag on the table to aim, set your power, shoot.
   Pot a ball from the open table to claim solids or stripes, clear your group, then sink the black.
   Fouls (scratching, hitting the wrong ball first, hitting nothing) give the other player ball in hand.
   Tables at the Campus Mall games corner (day) and Club Vibes (night). */
const POOL_COL=['#f7f4ea','#f2c230','#2456c8','#d8352a','#6a2fa0','#f07a1e','#1f8a4c','#7a1f2a','#111111'];
function poolGame(nOpt,opt){opt=opt||{};const n=nOpt===undefined?mgOpponent():nOpt,who=n?n.name.split(' ')[0]:(opt.who||'Kojo');
  S.paused=true;openSheet();
  const L=200,Wd=100,R=3.1,RAIL=9,PK=[[-.6,-.6,5.8],[L/2,-1.6,5.2],[L+.6,-.6,5.8],[-.6,Wd+.6,5.8],[L/2,Wd+1.6,5.2],[L+.6,Wd+.6,5.8]];
  const B=[];const add=(id,x,y)=>B.push({id,x,y,vx:0,vy:0,in:false});add(0,50,Wd/2);
  [[1],[9,2],[10,8,3],[11,4,12,5],[6,13,14,7,15]].forEach((row,i)=>row.forEach((id,j)=>add(id,150+i*(2*R*.87+.06),Wd/2+(j-i/2)*(2*R+.06)+(Math.random()-.5)*.04)));
  const G={turn:opt.theyBreak?1:0,grp:[null,null],brk:true,moving:false,first:null,potted:[],ang:0,pw:60,bih:false,placing:false,over:false,msg:'',skill:.012+Math.random()*.02,dead:false,auto:false};
  window._pool=G;
  const cue=()=>B[0],live=()=>B.filter(b=>!b.in),grpOf=id=>id<8?'s':id>8?'t':'8',GN={s:'Solids',t:'Stripes'};
  const left=pl=>G.grp[pl]?B.filter(b=>!b.in&&b.id&&b.id!==8&&grpOf(b.id)===G.grp[pl]).length:7;
  const okFirst=(pl,id)=>{if(id==null)return false;if(G.brk)return true;if(!G.grp[pl])return id!==8;return left(pl)>0?grpOf(id)===G.grp[pl]:id===8};
  const name=pl=>pl?esc(who):'You';
  /* ---------- physics ---------- */
  const nearPk=b=>PK.some(p=>Math.hypot(b.x-p[0],b.y-p[1])<p[2]+3.4);
  const step=()=>{const lb=live();let mv=false;
    lb.forEach(b=>{if(!b.vx&&!b.vy)return;b.x+=b.vx;b.y+=b.vy;
      for(const p of PK)if(Math.hypot(b.x-p[0],b.y-p[1])<p[2]){b.in=true;b.vx=b.vy=0;G.potted.push(b.id);return}
      if(!nearPk(b)){if(b.y<R){b.y=R;b.vy=Math.abs(b.vy)*.78}if(b.y>Wd-R){b.y=Wd-R;b.vy=-Math.abs(b.vy)*.78}if(b.x<R){b.x=R;b.vx=Math.abs(b.vx)*.78}if(b.x>L-R){b.x=L-R;b.vx=-Math.abs(b.vx)*.78}}
      else if(b.y<-4||b.y>Wd+4||b.x<-4||b.x>L+4){b.in=true;b.vx=b.vy=0;G.potted.push(b.id);return}
      const s=Math.hypot(b.vx,b.vy),s2=Math.max(0,s*.9935-.0022);if(s2<.004){b.vx=b.vy=0}else{b.vx*=s2/s;b.vy*=s2/s;mv=true}});
    for(let i=0;i<lb.length;i++)for(let j=i+1;j<lb.length;j++){const a=lb[i],b=lb[j];if(a.in||b.in)continue;const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);
      if(d<2*R&&d>0){const nx=dx/d,ny=dy/d,ov=(2*R-d)/2;a.x-=nx*ov;a.y-=ny*ov;b.x+=nx*ov;b.y+=ny*ov;const vn=(a.vx-b.vx)*nx+(a.vy-b.vy)*ny;
        if(vn>0){const k=vn*.97;a.vx-=k*nx;a.vy-=k*ny;b.vx+=k*nx;b.vy+=k*ny;mv=true}
        if(G.first==null){if(a.id===0)G.first=b.id;else if(b.id===0)G.first=a.id}}}
    return mv||lb.some(b=>b.vx||b.vy)};
  const free=(x,y,skip)=>live().every(b=>b===skip||Math.hypot(b.x-x,b.y-y)>2*R+.3);
  const spotCue=(x=50,y=Wd/2)=>{const c=cue();c.in=false;c.vx=c.vy=0;for(let k=0;k<40;k++){const tx=x+(k?(Math.random()-.5)*k*2:0),ty=y+(k?(Math.random()-.5)*k*2:0);if(tx>R&&tx<L-R&&ty>R&&ty<Wd-R&&free(tx,ty,c)){c.x=tx;c.y=ty;return}}c.x=x;c.y=y};
  const shoot=(ang,pw)=>{const v=.25+pw/100*2.15,c=cue();c.vx=Math.cos(ang)*v;c.vy=Math.sin(ang)*v;G.first=null;G.potted=[];G.leftBefore=[left(0),left(1)];G.moving=true;G.placing=false;
    try{typeof sfx==='function'&&sfx('tap')}catch(e){}const go=()=>{if(G.dead)return;let mv=false;for(let k=0;k<5;k++)mv=step()||mv;draw();if(mv)requestAnimationFrame(go);else{G.moving=false;endShot()}};requestAnimationFrame(go)};
  /* ---------- rules ---------- */
  const endShot=()=>{if(G.dead)return;const pl=G.turn,op=1-pl,P8=G.potted,cueIn=P8.includes(0),eight=P8.includes(8),wasBrk=G.brk;
    let foul=null;if(cueIn)foul='the cue ball went down';else if(G.first==null)foul='no ball was hit';else if(!okFirst(pl,G.first))foul=`${G.first===8?'the black':'the wrong ball'} was hit first`;
    if(eight){if(wasBrk){const e=B[B.findIndex(b=>b.id===8)];e.in=false;e.x=150;e.y=Wd/2;if(!free(150,Wd/2,e))e.x=158;G.msg='The black went down on the break, so it\'s back on the spot.'}
      else{const cleared=G.grp[pl]&&G.leftBefore[pl]===0;return finish(cleared&&!foul?pl:op,cleared&&!foul?`${name(pl)} sunk the black! 🎱`:foul?`Black potted on a foul (${foul}).`:`${name(pl)} potted the black too early!`)}}
    const mine=P8.filter(id=>id&&id!==8);
    if(!G.grp[pl]&&!wasBrk&&!foul&&mine.length){G.grp[pl]=grpOf(mine[0]);G.grp[op]=G.grp[pl]==='s'?'t':'s'}
    const cont=!foul&&mine.some(id=>!G.grp[pl]||grpOf(id)===G.grp[pl]);
    if(cueIn)spotCue();G.brk=false;
    const potTxt=mine.length?`${name(pl)} potted ${mine.length>1?mine.length+' balls':'one'}${G.grp[pl]&&!wasBrk?` (${GN[G.grp[pl]]})`:''}. `:'';
    G.msg=foul?`${potTxt}Foul: ${foul}. ${op?esc(who)+' has':'You have'} ball in hand.`:cont?`${potTxt}${pl?esc(who)+' goes again.':'Your shot again!'}`:(eight?G.msg+' ':'')+`${potTxt||(pl?esc(who)+' missed. ':'No pot. ')}${op?esc(who)+'\'s turn.':'Your turn.'}`;
    G.turn=cont?pl:op;G.bih=!!foul;if(G.bih&&G.turn===0)G.placing=true;ui();if(G.turn===1)aiTurn()};
  const finish=(win,txt)=>{G.over=true;G.msg=`${txt} <b>${win?esc(who)+' wins.':'You win! 🏆'}</b>`;ui();setTimeout(()=>{if(G.dead)return;G.dead=true;closeSheet();
    if(opt.stake&&!win){P().money+=opt.stake*2;toast(`💰 You won the ${cedi(opt.stake)} money game: +${cedi(opt.stake*2)}`)}mgEnd(n,win===0,false,'pool',who)},1900)};
  /* ---------- the opponent ---------- */
  const segClear=(x1,y1,x2,y2,skip)=>live().every(b=>{if(skip.includes(b))return true;const dx=x2-x1,dy=y2-y1,l2=dx*dx+dy*dy||1,t=Math.max(0,Math.min(1,((b.x-x1)*dx+(b.y-y1)*dy)/l2));return Math.hypot(b.x-(x1+t*dx),b.y-(y1+t*dy))>2*R-.2});
  const bestShot=(cx,cy)=>{let best=null;live().filter(b=>b.id&&okFirst(1,b.id)).forEach(t=>PK.forEach(p=>{const tx=p[0]-t.x,ty=p[1]-t.y,dt=Math.hypot(tx,ty),ux=tx/dt,uy=ty/dt,gx=t.x-ux*2*R,gy=t.y-uy*2*R,
    vx=gx-cx,vy=gy-cy,dc=Math.hypot(vx,vy);if(dc<.5)return;const cs=(vx*ux+vy*uy)/dc;if(cs<.3)return;if(!segClear(cx,cy,gx,gy,[cue(),t])||!segClear(t.x,t.y,p[0],p[1],[t]))return;
    const sc=cs*2-(dc+dt)/260;if(!best||sc>best.sc)best={sc,t,p,gx,gy,dc,dt,ang:Math.atan2(vy,vx)}}));return best};
  const aiTurn=()=>{G.aiAim=true;setTimeout(()=>{if(G.dead||G.over)return;const c=cue();
    if(G.brk){G.ang=Math.atan2(Wd/2-c.y,150-c.x)+(Math.random()-.5)*.02;G.pw=100}
    else{if(G.bih){/* ball in hand: put the cue ball behind the easiest shot */let bp=null;live().filter(b=>b.id&&okFirst(1,b.id)).forEach(t=>PK.forEach(p=>{const tx=p[0]-t.x,ty=p[1]-t.y,dt=Math.hypot(tx,ty),ux=tx/dt,uy=ty/dt,x=t.x-ux*(2*R+22),y=t.y-uy*(2*R+22);
        if(x>R+1&&x<L-R-1&&y>R+1&&y<Wd-R-1&&free(x,y,c)&&segClear(t.x,t.y,p[0],p[1],[t])&&(!bp||dt<bp.dt))bp={x,y,dt}}));if(bp){c.x=bp.x;c.y=bp.y}G.bih=false}
      const s=bestShot(c.x,c.y);if(s){G.ang=s.ang+gauss()*G.skill;G.pw=Math.max(28,Math.min(92,26+(s.dc+s.dt*1.5)/3.6))}
      else{const t=live().filter(b=>b.id&&okFirst(1,b.id)).sort((a,b)=>Math.hypot(a.x-c.x,a.y-c.y)-Math.hypot(b.x-c.x,b.y-c.y))[0]||live().find(b=>b.id);G.ang=Math.atan2(t.y-c.y,t.x-c.x)+gauss()*.03;G.pw=45+Math.random()*25}}
    G.msg=`${esc(who)} is lining up a shot…`;ui();setTimeout(()=>{if(G.dead)return;G.aiAim=false;shoot(G.ang,G.pw)},950)},700)};
  const gauss=()=>(Math.random()+Math.random()+Math.random()-1.5)*1.4;
  /* ---------- drawing ---------- */
  let cv,cx2,k=1;
  const rayHit=()=>{const c=cue(),dx=Math.cos(G.ang),dy=Math.sin(G.ang);let tb=null,tm=1e9;live().forEach(b=>{if(!b.id&&b===c)return;if(b===c)return;const fx=b.x-c.x,fy=b.y-c.y,t=fx*dx+fy*dy;if(t<=0)return;const d2=fx*fx+fy*fy-t*t,r2=4*R*R;if(d2>r2)return;const th=t-Math.sqrt(r2-d2);if(th<tm){tm=th;tb=b}});
    if(!tb){/* rail */const tx=dx>0?(L-R-c.x)/dx:dx<0?(R-c.x)/dx:1e9,ty=dy>0?(Wd-R-c.y)/dy:dy<0?(R-c.y)/dy:1e9;tm=Math.min(tx,ty)}return{tb,tm,gx:c.x+dx*tm,gy:c.y+dy*tm}};
  const draw=()=>{if(!cv||!cv.isConnected)return;const X=x=>(x+RAIL)*k,Y=y=>(y+RAIL)*k,ctx=cx2;ctx.clearRect(0,0,cv.width,cv.height);
    ctx.fillStyle='#5a3417';rr(ctx,0,0,(L+2*RAIL)*k,(Wd+2*RAIL)*k,10*k);ctx.fill();ctx.fillStyle='#3d220e';rr(ctx,3*k,3*k,(L+2*RAIL-6)*k,(Wd+2*RAIL-6)*k,8*k);ctx.fill();
    const gr=ctx.createRadialGradient(X(L/2),Y(Wd/2),10,X(L/2),Y(Wd/2),L*k*.6);gr.addColorStop(0,'#1f8a4c');gr.addColorStop(1,'#126434');ctx.fillStyle=gr;ctx.fillRect(X(0)-2*k,Y(0)-2*k,(L+4)*k,(Wd+4)*k);
    ctx.fillStyle='rgba(255,255,255,.6)';[[50,-RAIL+4.5],[100,-RAIL+4.5],[150,-RAIL+4.5],[50,Wd+RAIL-4.5],[100,Wd+RAIL-4.5],[150,Wd+RAIL-4.5]].forEach(([x,y])=>{ctx.beginPath();ctx.arc(X(x),Y(y),.9*k,0,7);ctx.fill()});
    ctx.strokeStyle='rgba(255,255,255,.14)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(X(50),Y(0));ctx.lineTo(X(50),Y(Wd));ctx.stroke();ctx.fillStyle='rgba(255,255,255,.25)';ctx.beginPath();ctx.arc(X(150),Y(Wd/2),.8*k,0,7);ctx.fill();
    PK.forEach(p=>{ctx.fillStyle='#0b0b0b';ctx.beginPath();ctx.arc(X(p[0]),Y(p[1]),p[2]*k*.92,0,7);ctx.fill()});
    const yourGo=G.turn===0&&!G.moving&&!G.over;
    if((yourGo&&!G.placing)||G.aiAim){const c=cue(),h=rayHit();if(yourGo){ctx.setLineDash([4,4]);ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(X(c.x),Y(c.y));ctx.lineTo(X(h.gx),Y(h.gy));ctx.stroke();ctx.setLineDash([]);
      ctx.strokeStyle='rgba(255,255,255,.8)';ctx.beginPath();ctx.arc(X(h.gx),Y(h.gy),R*k,0,7);ctx.stroke();
      if(h.tb){const nx=h.tb.x-h.gx,ny=h.tb.y-h.gy,d=Math.hypot(nx,ny)||1;ctx.strokeStyle=okFirst(0,h.tb.id)?'rgba(120,255,160,.9)':'rgba(255,90,80,.9)';ctx.beginPath();ctx.moveTo(X(h.tb.x),Y(h.tb.y));ctx.lineTo(X(h.tb.x+nx/d*22),Y(h.tb.y+ny/d*22));ctx.stroke()}}
      const back=R+2+G.pw/100*9,dx=Math.cos(G.ang),dy=Math.sin(G.ang);ctx.lineCap='round';ctx.strokeStyle='#e9d2a0';ctx.lineWidth=1.5*k;ctx.beginPath();ctx.moveTo(X(c.x-dx*back),Y(c.y-dy*back));ctx.lineTo(X(c.x-dx*(back+75)),Y(c.y-dy*(back+75)));ctx.stroke();
      ctx.strokeStyle='#3a2414';ctx.lineWidth=2*k;ctx.beginPath();ctx.moveTo(X(c.x-dx*(back+45)),Y(c.y-dy*(back+45)));ctx.lineTo(X(c.x-dx*(back+75)),Y(c.y-dy*(back+75)));ctx.stroke();ctx.strokeStyle='#5aa9e6';ctx.lineWidth=1.5*k;ctx.beginPath();ctx.moveTo(X(c.x-dx*back),Y(c.y-dy*back));ctx.lineTo(X(c.x-dx*(back+1.2)),Y(c.y-dy*(back+1.2)));ctx.stroke()}
    live().forEach(b=>{const x=X(b.x),y=Y(b.y),r=R*k;ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.arc(x+.5*k,y+.7*k,r,0,7);ctx.fill();
      const col=POOL_COL[b.id>8?b.id-8:b.id];ctx.fillStyle=b.id>8?'#f7f4ea':col;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();
      if(b.id>8){ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.clip();ctx.fillStyle=col;ctx.fillRect(x-r,y-r*.55,2*r,r*1.1);ctx.restore()}
      if(b.id){ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x,y,r*.42,0,7);ctx.fill();if(r>5){ctx.fillStyle='#111';ctx.font=`800 ${Math.round(r*.62)}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(b.id,x,y+.3)}}
      ctx.fillStyle='rgba(255,255,255,.45)';ctx.beginPath();ctx.arc(x-r*.35,y-r*.4,r*.28,0,7);ctx.fill()});
    if(G.placing){const c=cue();ctx.strokeStyle='#ffd34d';ctx.lineWidth=2;ctx.setLineDash([3,3]);ctx.beginPath();ctx.arc(X(c.x),Y(c.y),(R+2.5)*k,0,7);ctx.stroke();ctx.setLineDash([])}};
  const rr=(c,x,y,w,h,r)=>{c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()};
  const dots=pl=>{const g=G.grp[pl];if(!g)return '<small style="opacity:.6">open table</small>';return B.filter(b=>b.id&&b.id!==8&&grpOf(b.id)===g).map(b=>`<i class="pb${b.in?' gone':''}${b.id>8?' st':''}" style="--c:${POOL_COL[b.id>8?b.id-8:b.id]}"></i>`).join('')+`<i class="pb${left(pl)?' gone':''}" style="--c:#111"></i>`};
  /* ---------- the sheet ---------- */
  const ui=()=>{if(G.dead||(cv&&!cv.isConnected)){G.dead=true;return}const yours=G.turn===0&&!G.moving&&!G.over;
    $('sheetIn').innerHTML=`<div class="row" style="justify-content:space-between;align-items:center"><h3>🎱 Pool vs ${esc(who)}</h3>${opt.stake?`<span class="chip">💰 ${cedi(opt.stake)} game</span>`:''}</div>
      <div class="plrow${G.turn===0?' on':''}"><b>You${G.grp[0]?' · '+GN[G.grp[0]]:''}</b><span>${dots(0)}</span></div><div class="plrow${G.turn===1?' on':''}"><b>${esc(who)}${G.grp[1]?' · '+GN[G.grp[1]]:''}</b><span>${dots(1)}</span></div>
      <p class="pmsg">${G.msg||(G.brk?(G.turn?esc(who)+' breaks.':'<b>Your break!</b> Drag on the table to aim, set the power, then shoot.'):'')}${yours&&G.placing?'<br><b>✋ Ball in hand:</b> tap where you want the cue ball, then aim.':''}</p>
      <canvas id="poolCv"></canvas>
      <div class="ppow"><span>Power</span><input type="range" id="pPw" min="5" max="100" value="${Math.round(G.pw)}" ${yours?'':'disabled'}><b id="pPwV">${Math.round(G.pw)}%</b></div>
      <div class="row" style="gap:8px">${yours&&G.bih?`<button class="ghost sm" id="pPlace" style="flex:1">${G.placing?'✔ Done placing':'✋ Move cue ball'}</button>`:''}<button class="btn" id="pGo" style="flex:2" ${yours&&!G.placing?'':'disabled'}>Shoot 🎱</button></div>
      <button class="ghost sm" id="pQ" style="margin-top:8px">${G.over?'Close':'Quit game'}</button>`;
    cv=$('poolCv');const wpx=Math.min($('sheetIn').clientWidth||340,720),dpr=Math.min(2,window.devicePixelRatio||1);k=wpx/(L+2*RAIL);cv.style.width=wpx+'px';cv.style.height=(Wd+2*RAIL)*k+'px';cv.width=wpx*dpr;cv.height=(Wd+2*RAIL)*k*dpr;cx2=cv.getContext('2d');cx2.setTransform(dpr,0,0,dpr,0,0);
    const toT=e=>{const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)/k-RAIL,y:(e.clientY-r.top)/k-RAIL}};let down=false;
    const aimAt=e=>{if(!(G.turn===0&&!G.moving&&!G.over))return;const t=toT(e),c=cue();if(G.placing){const head=G.brk;if(t.x>R&&t.x<L-R&&t.y>R&&t.y<Wd-R&&free(t.x,t.y,c)){c.x=t.x;c.y=t.y}draw();return}if(Math.hypot(t.x-c.x,t.y-c.y)>1)G.ang=Math.atan2(t.y-c.y,t.x-c.x);draw()};
    cv.onpointerdown=e=>{down=true;cv.setPointerCapture&&cv.setPointerCapture(e.pointerId);aimAt(e)};cv.onpointermove=e=>{if(down)aimAt(e)};cv.onpointerup=()=>{down=false;if(G.placing&&G.turn===0){G.placing=false;G.bih=false;ui()}};
    const pw=$('pPw');pw.oninput=()=>{G.pw=+pw.value;$('pPwV').textContent=pw.value+'%';draw()};
    $('pGo').onclick=()=>{if(!(G.turn===0&&!G.moving&&!G.over))return;G.bih=false;G.msg='';ui();shoot(G.ang,G.pw)};
    if($('pPlace'))$('pPlace').onclick=()=>{G.placing=!G.placing;if(!G.placing)G.bih=false;ui()};
    $('pQ').onclick=()=>{const was=G.over;G.dead=true;closeSheet();if(!was){toast(`You walked away from the table. ${esc(who)} takes the game.`);mgEnd(n,false,false,'pool',who)}};
    draw()};
  G.ang=0;ui();if(G.turn===1)aiTurn();return G}

/* ---------- a real table in the Campus Mall games corner and at Club Vibes ---------- */
function poolTable3D(s,x,z,obst){const g=new THREE.Group();g.position.set(x,0,z);s.add(g);const wood=lam(0x5a3417),dark=lam(0x2a170a);
  [[-.82,-.4],[.82,-.4],[-.82,.4],[.82,.4]].forEach(([a,b])=>box(.12,.68,.12,dark,a,.34,b,g));box(1.9,.14,1.04,wood,0,.72,0,g);box(1.72,.03,.86,0x1d7a40,0,.8,0,g);
  [[0,-.47,1.9,.1],[0,.47,1.9,.1]].forEach(([a,b,w,d])=>box(w,.07,d,wood,a,.83,b,g));[-.9,.9].forEach(a=>box(.1,.07,1.04,wood,a,.83,0,g));
  [[-.86,-.44],[0,-.46],[.86,-.44],[-.86,.44],[0,.46],[.86,.44]].forEach(([a,b])=>mesh(cyl(.05,.05,.02,10),lam(0x080808),a,.82,b,g));
  const cols=[0xf2c230,0x2456c8,0xd8352a,0x6a2fa0,0xf07a1e,0x1f8a4c,0x7a1f2a,0x111111,0xf2c230,0x2456c8,0xd8352a,0x6a2fa0,0xf07a1e,0x1f8a4c,0x7a1f2a];let q=0;
  for(let i=0;i<5;i++)for(let j=0;j<=i;j++){mesh(new THREE.SphereGeometry(.028,10,8),lam(cols[q++%15]),.35+i*.05,.845,(j-i/2)*.058,g)}mesh(new THREE.SphereGeometry(.028,10,8),lam(0xf7f4ea),-.45,.845,0,g);
  const cu=box(1.3,.02,.02,0xe9d2a0,-.1,.855,.25,g);cu.rotation.y=.12;
  const shade=box(1.2,.12,.3,0x1f6b3a,0,2.1,0,g);mesh(cyl(.01,.01,.5,4),lam(0x333333),0,2.4,0,g);const lt=new THREE.PointLight(0xfff1c8,.7,3.5,1.6);lt.position.set(0,1.9,0);g.add(lt);
  if(obst)obst.push({x1:x-.95,x2:x+.95,z1:z-.52,z2:z+.52});return g}
const POOL_AT={mall:[-.3,2.75],club:[.6,2.95]};
{const _eb=enterBuilding;enterBuilding=function(id){const r=_eb.apply(this,arguments);try{if(IS&&IS.kind==='bld'&&POOL_AT[IS.bid]){const [x,z]=POOL_AT[IS.bid];poolTable3D(IS.scene,x,z,IS.obst);IS.spots.pool={x:x-1.15,z,ry:Math.PI/2}}}catch(e){console.warn(e)}return r}}
{const _pa=placeActions;placeActions=function(b,inside){const a=_pa.apply(this,arguments);try{if(b&&inside&&POOL_AT[b.id]){const h=hour(),open=b.id==='mall'?h>=9&&h<21:true;
  if(open){const bd=buddy(),fee=b.id==='mall'?10:0,pay=()=>!fee||spend(fee);
    const reg=pick(['Kojo','Nana Yaw','Fiifi','Selasi','Abena','Kwame']);
    a.unshift([`🎱 Play pool with a regular${fee?' · '+cedi(fee):''}`,()=>{if(pay())poolGame(null,{who:reg,theyBreak:Math.random()<.5})},null,'b']);
    a.unshift([`💰 Money game: GH₵20 stake vs a regular${fee?' + '+cedi(fee)+' table':''}`,()=>{if(P().money<20+fee)return toast('You need GH₵'+(20+fee)+' on MoMo for that.');P().money-=20+fee;hud();poolGame(null,{who:reg,stake:20,theyBreak:Math.random()<.5})},null,'b'])
    if(bd)a.unshift([`🎱 Play pool with ${bd.name.split(' ')[0]}${fee?' · '+cedi(fee):''}`,()=>{if(pay())poolGame(bd)},null,'b']);
    else{const mets=(IS&&IS.people||[]).map(q=>q.n).filter(x=>x&&x.met&&x.friend>=15);const f=mets[0];
      if(f)a.unshift([`🎱 Play pool with ${f.name.split(' ')[0]}${fee?' · '+cedi(fee):''}`,()=>{if(pay())poolGame(f)},null,'b'])}
}}}catch(e){}return a}}
