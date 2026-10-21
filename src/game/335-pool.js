/* ================= 🎱 pool (8-ball), GamePigeon style =================
   Full-screen, portrait table. Real physics: solid cushions with proper pocket jaws (balls rattle and
   bounce out if you're not accurate), rolling friction, and cue-ball spin (follow, draw and side).
   Controls: drag on the table to swing the aim (tap to snap), fine-tune with the ridged wheel on the
   right, set spin with the cue-ball button, then pull the cue down on the left and let go to shoot.
   Rules: 8-ball. Claim solids or stripes, clear them, call your pocket and sink the black.
   Fouls (scratch, wrong ball first, nothing hit, shot clock) give ball in hand.
   The opponent tests its shots in a physics simulation before playing them, so it plays properly. */
const POOL_COL=['#f7f4ea','#f2c230','#1f4fc4','#d8352a','#6a2fa0','#f07a1e','#1f8a4c','#7a1f2a','#111111'];
const PW_=100,PL_=200,PR_=2.25,PC_=6.6,PSM_=5.4,PJ_=3.2;
const P_SEG=[[PC_,0,PW_-PC_,0],[PC_,PL_,PW_-PC_,PL_],[0,PC_,0,PL_/2-PSM_],[0,PL_/2+PSM_,0,PL_-PC_],[PW_,PC_,PW_,PL_/2-PSM_],[PW_,PL_/2+PSM_,PW_,PL_-PC_],
  [PC_,0,PC_-PJ_,-PJ_],[0,PC_,-PJ_,PC_-PJ_],[PW_-PC_,0,PW_-PC_+PJ_,-PJ_],[PW_,PC_,PW_+PJ_,PC_-PJ_],[PC_,PL_,PC_-PJ_,PL_+PJ_],[0,PL_-PC_,-PJ_,PL_-PC_+PJ_],[PW_-PC_,PL_,PW_-PC_+PJ_,PL_+PJ_],[PW_,PL_-PC_,PW_+PJ_,PL_-PC_+PJ_],
  [0,PL_/2-PSM_,-PJ_,PL_/2-PSM_+1.3],[0,PL_/2+PSM_,-PJ_,PL_/2+PSM_-1.3],[PW_,PL_/2-PSM_,PW_+PJ_,PL_/2-PSM_+1.3],[PW_,PL_/2+PSM_,PW_+PJ_,PL_/2+PSM_-1.3]];
const P_PK=[[-2.1,-2.1,4.3],[PW_+2.1,-2.1,4.3],[-3.1,PL_/2,4.5],[PW_+3.1,PL_/2,4.5],[-2.1,PL_+2.1,4.3],[PW_+2.1,PL_+2.1,4.3]];
/* one physics step for a set of balls (also used by the opponent to test shots) */
function poolStep(B,ev){const R=PR_,lb=B.filter(b=>!b.in);let mv=false;
  for(const b of lb){if(!b.vx&&!b.vy)continue;b.x+=b.vx;b.y+=b.vy;if(b.x>R+3.5&&b.x<PW_-R-3.5&&b.y>R+3.5&&b.y<PL_-R-3.5)continue;
    for(const s of P_SEG){const dx=s[2]-s[0],dy=s[3]-s[1],l2=dx*dx+dy*dy,t=Math.max(0,Math.min(1,((b.x-s[0])*dx+(b.y-s[1])*dy)/l2)),cx=s[0]+t*dx,cy=s[1]+t*dy,ex=b.x-cx,ey=b.y-cy,d=Math.hypot(ex,ey);
      if(d<R&&d>1e-6){const nx=ex/d,ny=ey/d,vn=b.vx*nx+b.vy*ny;b.x=cx+nx*R;b.y=cy+ny*R;if(vn<0){const tx=-ny,ty=nx,vt=b.vx*tx+b.vy*ty;let nvt=vt*.95;
        if(b.id===0&&ev.side&&!ev.sideDone){nvt+=ev.side*Math.abs(vn)*.55;ev.sideDone=true}b.vx=-vn*.7*nx+nvt*tx;b.vy=-vn*.7*ny+nvt*ty;ev.hit&&ev.hit('rail',-vn);ev.rails=(ev.rails||0)+1}}}
    for(let k=0;k<6;k++){const p=P_PK[k];if(Math.hypot(b.x-p[0],b.y-p[1])<p[2]){b.in=true;b.pk=k;b.vx=b.vy=0;ev.potted.push(b.id);ev.pk[b.id]=k;ev.hit&&ev.hit('pocket',1);break}}
    if(!b.in&&(b.x<-3.5||b.x>PW_+3.5||b.y<-3.5||b.y>PL_+3.5)){let bk=0,bd=1e9;P_PK.forEach((p,k)=>{const d=Math.hypot(b.x-p[0],b.y-p[1]);if(d<bd){bd=d;bk=k}});b.in=true;b.pk=bk;b.vx=b.vy=0;ev.potted.push(b.id);ev.pk[b.id]=bk;ev.hit&&ev.hit('pocket',1)}}
  for(let i=0;i<lb.length;i++){const a=lb[i];if(a.in)continue;for(let j=i+1;j<lb.length;j++){const b=lb[j];if(b.in)continue;const dx=b.x-a.x,dy=b.y-a.y;if(Math.abs(dx)>2*R||Math.abs(dy)>2*R)continue;const d=Math.hypot(dx,dy);
    if(d<2*R&&d>1e-6){const nx=dx/d,ny=dy/d,ov=(2*R-d)/2;a.x-=nx*ov;a.y-=ny*ov;b.x+=nx*ov;b.y+=ny*ov;const vn=(a.vx-b.vx)*nx+(a.vy-b.vy)*ny;
      if(vn>0){const k=vn*.975,cueA=a.id===0,cueB=b.id===0,sp0=cueA?Math.hypot(a.vx,a.vy):cueB?Math.hypot(b.vx,b.vy):0;a.vx-=k*nx;a.vy-=k*ny;b.vx+=k*nx;b.vy+=k*ny;ev.hit&&ev.hit('ball',vn);
        if(ev.first==null&&(cueA||cueB)){ev.first=cueA?b.id:a.id;const c=cueA?a:b;/* follow / draw */if(ev.fol){c.vx+=ev.dx*ev.fol*.62*sp0;c.vy+=ev.dy*ev.fol*.62*sp0}}}}}}
  for(const b of lb){if(b.in||(!b.vx&&!b.vy))continue;const s=Math.hypot(b.vx,b.vy),s2=s-.0019-s*.0007;if(s2<=0){b.vx=b.vy=0}else{b.vx*=s2/s;b.vy*=s2/s;mv=true}}
  return mv}
function poolNewEv(ang,spin){return{first:null,potted:[],pk:{},dx:Math.cos(ang),dy:Math.sin(ang),fol:spin?spin.f:0,side:spin?spin.s:0,sideDone:false,rails:0}}
function poolShoot(B,ang,pw){const c=B[0],v=.1+pw*1.5;c.vx=Math.cos(ang)*v;c.vy=Math.sin(ang)*v}

function poolGame(nOpt,opt){opt=opt||{};const n=nOpt===undefined?mgOpponent():nOpt,who=n?n.name.split(' ')[0]:(opt.who||'Kojo');
  try{closeSheet()}catch(e){}S.paused=true;
  const W=PW_,L=PL_,R=PR_,RAIL=8,KITCHEN=L*.75;
  const B=[];const add=(id,x,y)=>B.push({id,x,y,vx:0,vy:0,in:false});add(0,W/2,L*.8);
  [[1],[9,2],[10,8,3],[11,4,12,5],[6,13,14,7,15]].forEach((row,i)=>row.forEach((id,j)=>add(id,W/2+(j-i/2)*(2*R+.03)+(Math.random()-.5)*.03,L*.25-i*(2*R*.866+.03))));
  const G={turn:opt.theyBreak?1:0,grp:[null,null],brk:true,moving:false,ang:-Math.PI/2,pw:0,spin:{f:0,s:0},bih:true,over:false,dead:false,msg:'',call:null,clock:0,aiSd:.0035+Math.random()*.005,ev:null};
  window._pool=G;G.B=B;G._shoot=(a,p)=>shoot(a,p,G.spin);
  const cue=()=>B[0],live=()=>B.filter(b=>!b.in),grpOf=id=>id<8?'s':id>8?'t':'8',GN={s:'Solids',t:'Stripes'};
  const left=pl=>G.grp[pl]?B.filter(b=>!b.in&&b.id&&b.id!==8&&grpOf(b.id)===G.grp[pl]).length:7;
  const okFirst=(pl,id,brk=G.brk)=>{if(id==null)return false;if(brk)return true;if(!G.grp[pl])return id!==8;return left(pl)>0?grpOf(id)===G.grp[pl]:id===8};
  const onEight=pl=>!!G.grp[pl]&&left(pl)===0;
  const free=(x,y,skip)=>x>R&&x<W-R&&y>R&&y<L-R&&live().every(b=>b===skip||Math.hypot(b.x-x,b.y-y)>2*R+.2);
  const gauss=()=>(Math.random()+Math.random()+Math.random()+Math.random()-2)*1.22;
  /* ---------- sound: real clacks ---------- */
  let AC=null,lastS=0;const snd=(kind,v)=>{try{if(typeof SND!=='undefined'&&!SND.on)return;const now=performance.now();if(now-lastS<18)return;lastS=now;AC=AC||new (window.AudioContext||window.webkitAudioContext)();
    const len=kind==='pocket'?.12:.035,buf=AC.createBuffer(1,AC.sampleRate*len,AC.sampleRate),d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,kind==='pocket'?2:6);
    const src=AC.createBufferSource();src.buffer=buf;const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=kind==='ball'?2600:kind==='cue'?1500:kind==='pocket'?220:700;f.Q.value=kind==='ball'?3:1;
    const g=AC.createGain();g.gain.value=Math.min(1,(kind==='pocket'?.9:.25+v*1.6));src.connect(f);f.connect(g);g.connect(AC.destination);src.start()}catch(e){}};
  /* ---------- DOM ---------- */
  const ov=document.createElement('div');ov.id='poolX';document.body.appendChild(ov);
  const ini=s=>esc(String(s||'?').trim()[0]||'?').toUpperCase();
  ov.innerHTML=`<div class="px-top"><div class="px-pl" id="pxP0"><div class="px-av">${ini(P().name||'You')}</div><div class="px-info"><b>You</b><div class="px-balls" id="pxB0"></div><div class="px-tm"><i id="pxT0"></i></div></div></div>
    <div class="px-mid8">${opt.stake?`<span>💰 ${cedi(opt.stake*2)}</span>`:'<span>8-BALL</span>'}</div>
    <div class="px-pl them" id="pxP1"><div class="px-info"><b>${esc(who)}</b><div class="px-balls" id="pxB1"></div><div class="px-tm"><i id="pxT1"></i></div></div><div class="px-av">${ini(who)}</div></div><button class="px-x" id="pxX">✕</button></div>
    <div class="px-main"><div class="px-pow" id="pxPow"><div class="px-pfill" id="pxPf"></div><div class="px-pcue" id="pxPc"></div><span>PULL</span></div>
      <div class="px-tab"><canvas id="pxCv"></canvas><div class="px-msg" id="pxMsg"></div></div>
</div>
    <div class="px-bot"><div class="px-hint" id="pxHint"></div><div class="px-ctl"><button class="px-spin" id="pxSpin" title="Spin"><i id="pxSpinDot"></i></button><div class="px-fine" id="pxFine"><span>◀ FINE AIM ▶</span></div></div></div>
    <div class="px-spinpop" id="pxSpinPop" hidden><div class="px-bigball" id="pxBig"><i id="pxBigDot"></i></div><p>Tap where to hit the cue ball.<br><b>Top</b> = follow · <b>Bottom</b> = draw back · <b>Sides</b> = side spin</p><div class="row" style="gap:8px;justify-content:center"><button class="ghost sm" id="pxSpin0">Reset</button><button class="btn sm" id="pxSpinOk">Done</button></div></div>
    <div class="px-end" id="pxEnd" hidden></div>`;
  const cv=ov.querySelector('#pxCv'),ctx=cv.getContext('2d');let k=1,dpr=1;
  const layout=()=>{const top=ov.querySelector('.px-top').offsetHeight,bot=ov.querySelector('.px-bot').offsetHeight,aw=ov.clientWidth-38-10-20,ah=ov.clientHeight-top-bot-24;
    k=Math.max(1,Math.min(aw/(W+2*RAIL),ah/(L+2*RAIL)));dpr=Math.min(2,window.devicePixelRatio||1);const cw=(W+2*RAIL)*k,ch=(L+2*RAIL)*k;cv.style.width=cw+'px';cv.style.height=ch+'px';cv.width=cw*dpr;cv.height=ch*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    ov.querySelector('#pxPow').style.height=Math.min(ch*.8,440)+'px';draw()};
  const X=x=>(x+RAIL)*k,Y=y=>(y+RAIL)*k;
  /* ---------- drawing ---------- */
  const rr=(x,y,w,h,r)=>{ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()};
  const rayHit=(ang)=>{const c=cue(),dx=Math.cos(ang),dy=Math.sin(ang);let tb=null,tm=1e9;live().forEach(b=>{if(b===c)return;const fx=b.x-c.x,fy=b.y-c.y,t=fx*dx+fy*dy;if(t<=0)return;const d2=fx*fx+fy*fy-t*t,r2=4*R*R;if(d2>r2)return;const th=t-Math.sqrt(r2-d2);if(th<tm){tm=th;tb=b}});
    if(!tb){const tx=dx>0?(W-R-c.x)/dx:dx<0?(R-c.x)/dx:1e9,ty=dy>0?(L-R-c.y)/dy:dy<0?(R-c.y)/dy:1e9;tm=Math.min(tx,ty)}return{tb,tm,gx:c.x+dx*tm,gy:c.y+dy*tm,dx,dy}};
  const ballDraw=(b,x,y,r)=>{const col=POOL_COL[b.id>8?b.id-8:b.id];ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(x+r*.25,y+r*.35,r,r*.92,0,0,7);ctx.fill();
    ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.clip();ctx.fillStyle=b.id>8?'#f7f4ea':col;ctx.fillRect(x-r,y-r,2*r,2*r);if(b.id>8){ctx.fillStyle=col;ctx.fillRect(x-r,y-r*.56,2*r,r*1.12)}
    if(b.id){ctx.fillStyle='#fbfaf5';ctx.beginPath();ctx.arc(x,y,r*.46,0,7);ctx.fill();if(r>=4.5){ctx.fillStyle='#111';ctx.font=`800 ${Math.max(6,Math.round(r*.66))}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(b.id,x,y+.4)}}
    const g=ctx.createRadialGradient(x-r*.4,y-r*.45,r*.1,x,y,r*1.05);g.addColorStop(0,'rgba(255,255,255,.55)');g.addColorStop(.35,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(0,0,0,.42)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,2*r,2*r);ctx.restore()};
  function draw(){if(G.dead)return;const tw=(W+2*RAIL)*k,th=(L+2*RAIL)*k;ctx.clearRect(0,0,tw,th);
    let g=ctx.createLinearGradient(0,0,tw,0);g.addColorStop(0,'#4a2a14');g.addColorStop(.5,'#6b3e1e');g.addColorStop(1,'#4a2a14');ctx.fillStyle=g;rr(0,0,tw,th,7*k);ctx.fill();
    ctx.fillStyle='#e9d7a8';[[W*.25,-RAIL/2],[W*.5,-RAIL/2],[W*.75,-RAIL/2],[W*.25,L+RAIL/2],[W*.5,L+RAIL/2],[W*.75,L+RAIL/2]].concat([1,2,3,5,6,7].flatMap(i=>[[-RAIL/2,L*i/8],[W+RAIL/2,L*i/8]])).forEach(([x,y])=>{ctx.beginPath();ctx.arc(X(x),Y(y),.75*k,0,7);ctx.fill()});
    /* cushions */ctx.fillStyle='#164a86';ctx.fillRect(X(-2.2),Y(-2.2),(W+4.4)*k,(L+4.4)*k);
    g=ctx.createRadialGradient(X(W/2),Y(L/2),10,X(W/2),Y(L/2),L*k*.62);g.addColorStop(0,'#2f7fd0');g.addColorStop(1,'#1a5aa3');ctx.fillStyle=g;ctx.fillRect(X(0),Y(0),W*k,L*k);
    ctx.strokeStyle='rgba(255,255,255,.12)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(X(0),Y(KITCHEN));ctx.lineTo(X(W),Y(KITCHEN));ctx.stroke();ctx.fillStyle='rgba(255,255,255,.25)';ctx.beginPath();ctx.arc(X(W/2),Y(L*.25),.8*k,0,7);ctx.fill();
    /* pocket jaws (cushion noses) */ctx.strokeStyle='#103a6b';ctx.lineWidth=2.2*k;ctx.lineCap='round';P_SEG.slice(6).forEach(s=>{ctx.beginPath();ctx.moveTo(X(s[0]),Y(s[1]));ctx.lineTo(X(s[2]),Y(s[3]));ctx.stroke()});
    P_PK.forEach((p,i)=>{const gg=ctx.createRadialGradient(X(p[0]),Y(p[1]),1,X(p[0]),Y(p[1]),p[2]*k);gg.addColorStop(0,'#000');gg.addColorStop(.8,'#0b0b0b');gg.addColorStop(1,'#2a2a2a');ctx.fillStyle=gg;ctx.beginPath();ctx.arc(X(p[0]),Y(p[1]),p[2]*k,0,7);ctx.fill();
      if(G.turn===0&&onEight(0)&&!G.moving&&!G.over){ctx.strokeStyle=G.call===i?'#ffd34d':'rgba(255,211,77,.35)';ctx.lineWidth=G.call===i?3:1.5;ctx.beginPath();ctx.arc(X(p[0]),Y(p[1]),(p[2]+1.6)*k,0,7);ctx.stroke();if(G.call===i){ctx.fillStyle='#ffd34d';ctx.font=`900 ${11}px system-ui`;ctx.textAlign='center';ctx.fillText('8',X(p[0]),Y(p[1])+4)}}});
    const yours=G.turn===0&&!G.moving&&!G.over,aiming=yours||G.aiAim;
    if(aiming&&!G.dragCue){const c=cue(),h=rayHit(G.ang);if(yours){ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(X(c.x),Y(c.y));ctx.lineTo(X(h.gx),Y(h.gy));ctx.stroke();
        ctx.beginPath();ctx.arc(X(h.gx),Y(h.gy),R*k,0,7);ctx.stroke();
        if(h.tb){const nx=h.tb.x-h.gx,ny=h.tb.y-h.gy,d=Math.hypot(nx,ny)||1,ux=nx/d,uy=ny/d,cs=Math.abs(ux*h.dx+uy*h.dy),ok=okFirst(0,h.tb.id);
          if(!ok){ctx.strokeStyle='#ff4d4d';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(X(h.gx-2),Y(h.gy-2));ctx.lineTo(X(h.gx+2),Y(h.gy+2));ctx.moveTo(X(h.gx+2),Y(h.gy-2));ctx.lineTo(X(h.gx-2),Y(h.gy+2));ctx.stroke()}
          else{const ol=6+22*cs;ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(X(h.tb.x),Y(h.tb.y));ctx.lineTo(X(h.tb.x+ux*ol),Y(h.tb.y+uy*ol));ctx.stroke();
            let tx=h.dx-ux*cs*Math.sign(ux*h.dx+uy*h.dy),ty=h.dy-uy*cs*Math.sign(ux*h.dx+uy*h.dy);const tl=Math.hypot(tx,ty);if(tl>.02){tx/=tl;ty/=tl;const cl=4+14*Math.sqrt(1-cs*cs);ctx.strokeStyle='rgba(255,255,255,.45)';ctx.beginPath();ctx.moveTo(X(h.gx),Y(h.gy));ctx.lineTo(X(h.gx+tx*cl),Y(h.gy+ty*cl));ctx.stroke()}}}}
      const back=R+1.2+G.pw*22,dx=Math.cos(G.ang),dy=Math.sin(G.ang),len=150;const sx=X(c.x-dx*back),sy=Y(c.y-dy*back),ex=X(c.x-dx*(back+len)),ey=Y(c.y-dy*(back+len));
      ctx.lineCap='butt';ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=2.4*k;ctx.beginPath();ctx.moveTo(sx+3,sy+4);ctx.lineTo(ex+3,ey+4);ctx.stroke();
      const cg=ctx.createLinearGradient(sx,sy,ex,ey);cg.addColorStop(0,'#f5f1e6');cg.addColorStop(.012,'#f5f1e6');cg.addColorStop(.013,'#3a8ad6');cg.addColorStop(.03,'#3a8ad6');cg.addColorStop(.031,'#f0dcae');cg.addColorStop(.62,'#d8b57a');cg.addColorStop(.63,'#1c1c1c');cg.addColorStop(.7,'#c9a227');cg.addColorStop(.71,'#2b1a10');cg.addColorStop(1,'#140c07');
      ctx.strokeStyle=cg;ctx.lineWidth=1.5*k;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(X(c.x-dx*(back+len*.62)),Y(c.y-dy*(back+len*.62)));ctx.stroke();ctx.lineWidth=2.1*k;ctx.beginPath();ctx.moveTo(X(c.x-dx*(back+len*.62)),Y(c.y-dy*(back+len*.62)));ctx.lineTo(ex,ey);ctx.stroke()}
    live().forEach(b=>ballDraw(b,X(b.x),Y(b.y),R*k));
    if(yours&&G.bih){const c=cue();ctx.strokeStyle='#ffd34d';ctx.lineWidth=2;ctx.setLineDash([3,3]);ctx.beginPath();ctx.arc(X(c.x),Y(c.y),(R+2.2)*k,0,7);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle='#ffd34d';ctx.font='700 10px system-ui';ctx.textAlign='center';ctx.fillText('✋ drag',X(c.x),Y(c.y)-(R+4)*k)}}
  const ballsRow=pl=>{const g=G.grp[pl];if(!g)return '<small>open table</small>';return B.filter(b=>b.id&&b.id!==8&&grpOf(b.id)===g).map(b=>`<i class="pb${b.in?' gone':''}${b.id>8?' st':''}" style="--c:${POOL_COL[b.id>8?b.id-8:b.id]}"></i>`).join('')+`<i class="pb${left(pl)?' gone':''}" style="--c:#111"></i>`};
  const hud2=()=>{if(G.dead)return;[0,1].forEach(pl=>{ov.querySelector('#pxP'+pl).classList.toggle('on',G.turn===pl&&!G.over);ov.querySelector('#pxB'+pl).innerHTML=ballsRow(pl)+(G.grp[pl]?` <small>${GN[G.grp[pl]]}</small>`:'')});
    const yours=G.turn===0&&!G.moving&&!G.over;ov.querySelector('#pxHint').innerHTML=G.over?'':yours?(G.bih?'<b>Ball in hand</b> · drag the cue ball, then aim':onEight(0)&&G.call==null?'<b>Call your pocket:</b> tap the pocket for the 8':'Drag to aim · fine-tune on the right · pull the cue to shoot'):G.moving?'':`${esc(who)} is thinking…`;
    const sd=ov.querySelector('#pxSpinDot');sd.style.left=50+G.spin.s*38+'%';sd.style.top=50-G.spin.f*38+'%'};
  let msgT=0;const say=(t,ms=2200)=>{const m=ov.querySelector('#pxMsg');m.innerHTML=t;m.classList.add('on');clearTimeout(msgT);msgT=setTimeout(()=>m.classList.remove('on'),ms)};
  /* ---------- shooting ---------- */
  const shoot=(ang,pw,spin)=>{if(G.moving||G.over)return;G.moving=true;G.bih=false;G.clock=0;const c=cue();G.leftBefore=[left(0),left(1)];
    G.ev=poolNewEv(ang,spin);G.ev.hit=(kind,v)=>snd(kind,Math.min(1,v/1.6));snd('cue',pw);poolShoot(B,ang,pw);G.pw=0;setPow(0);hud2();
    let last=performance.now();const go=now=>{if(G.dead)return;const steps=Math.min(24,Math.max(4,Math.round((now-last)/1000*240)));last=now;let mv=false;for(let i=0;i<steps;i++)mv=poolStep(B,G.ev)||mv;draw();if(mv)requestAnimationFrame(go);else{G.moving=false;endShot()}};requestAnimationFrame(go)};
  const endShot=(timeout)=>{if(G.dead)return;const pl=G.turn,op=1-pl,ev=G.ev||{potted:[],pk:{},first:null},P8=ev.potted,cueIn=P8.includes(0),eight=P8.includes(8),wasBrk=G.brk;
    let foul=null;if(timeout)foul='out of time';else if(cueIn)foul='scratch';else if(ev.first==null)foul='no ball hit';else if(!okFirst(pl,ev.first,wasBrk))foul=ev.first===8?'hit the 8 first':'wrong ball first';
    const nm=pl?esc(who):'You';
    if(eight&&!timeout){if(wasBrk){const e=B.find(b=>b.id===8);e.in=false;e.x=W/2;e.y=L*.25;while(!free(e.x,e.y,e))e.y-=2*R;say('8 on the break, it gets re-spotted')}
      else{const cleared=G.grp[pl]&&G.leftBefore[pl]===0,rightPk=G.call==null||ev.pk[8]===G.call,good=cleared&&!foul&&rightPk;
        return finish(good?pl:op,good?`${nm} sank the 8! 🎱`:!cleared?`${nm} potted the 8 too early!`:foul?`8 went down with a ${foul}.`:'8 went in the wrong pocket!')}}
    const mine=P8.filter(id=>id&&id!==8);
    if(!G.grp[pl]&&!wasBrk&&!foul&&mine.length){G.grp[pl]=grpOf(mine[0]);G.grp[op]=G.grp[pl]==='s'?'t':'s';say(`${nm} ${pl?'is':'are'} ${GN[G.grp[pl]]}`)}
    const cont=!foul&&mine.some(id=>!G.grp[pl]||grpOf(id)===G.grp[pl]);
    if(cueIn){const c=cue();c.in=false;c.vx=c.vy=0;c.x=W/2;c.y=L*.8;while(!free(c.x,c.y,c))c.x+=(Math.random()-.5)*10}
    G.brk=false;G.call=null;G.turn=cont?pl:op;G.bih=!!foul;
    if(foul)say(`Foul: ${foul}! ${G.turn?esc(who)+' has':'You have'} ball in hand`,2600);else if(cont&&!P8.length)0;else if(!cont)say(G.turn?`${esc(who)}'s turn`:'Your turn',1400);
    if(G.turn===0)G.spin={f:0,s:0};hud2();draw();if(G.turn===1&&!G.over)setTimeout(aiTurn,650)};
  const finish=(win,txt)=>{G.over=true;hud2();draw();const e=ov.querySelector('#pxEnd');const won=win===0;
    e.innerHTML=`<div class="px-endc"><div style="font-size:46px">${won?'🏆':'🎱'}</div><h3>${won?'You win!':esc(who)+' wins'}</h3><p>${txt}</p>${opt.stake?`<p><b>${won?'+'+cedi(opt.stake*2):'-'+cedi(opt.stake)}</b></p>`:''}<button class="btn" id="pxDone" style="width:100%">Continue</button></div>`;e.hidden=false;
    ov.querySelector('#pxDone').onclick=()=>close(won,true);snd('pocket',1)};
  const close=(won,played)=>{if(G.dead)return;G.dead=true;ov.remove();window.removeEventListener('resize',layout);S.paused=false;
    if(opt.stake&&won){P().money+=opt.stake*2;toast(`💰 You won the money game: +${cedi(opt.stake*2)}`)}mgEnd(n,won,false,'pool',who)};
  /* ---------- the opponent: think in simulation ---------- */
  const clone=()=>B.map(b=>({id:b.id,x:b.x,y:b.y,vx:0,vy:0,in:b.in}));
  const segClear=(x1,y1,x2,y2,skip,bs)=>bs.every(b=>{if(b.in||skip.includes(b.id))return true;const dx=x2-x1,dy=y2-y1,l2=dx*dx+dy*dy||1,t=Math.max(0,Math.min(1,((b.x-x1)*dx+(b.y-y1)*dy)/l2));return Math.hypot(b.x-(x1+t*dx),b.y-(y1+t*dy))>2*R-.15});
  const shotsFrom=(bs,pl,cx,cy)=>{const out=[];bs.filter(b=>!b.in&&b.id&&okFirst(pl,b.id,false)).forEach(t=>P_PK.forEach((p,pi)=>{const ax=p[0]+(p[0]<0?2.4:p[0]>W?-2.4:0),ay=p[1]+(p[1]<0?2.4:p[1]>L?-2.4:0),tx=ax-t.x,ty=ay-t.y,dt=Math.hypot(tx,ty),ux=tx/dt,uy=ty/dt,gx=t.x-ux*2*R,gy=t.y-uy*2*R,vx=gx-cx,vy=gy-cy,dc=Math.hypot(vx,vy);
    if(dc<.5)return;const cs=(vx*ux+vy*uy)/dc;if(cs<.2)return;if(!segClear(cx,cy,gx,gy,[0,t.id],bs)||!segClear(t.x,t.y,ax,ay,[t.id],bs))return;out.push({t:t.id,pi,ang:Math.atan2(vy,vx),dc,dt,cs,ez:cs*2-(dc+dt)/220})}));return out.sort((a,b)=>b.ez-a.ez)};
  const simulate=(ang,pw,spin)=>{const bs=clone(),ev=poolNewEv(ang,spin);poolShoot(bs,ang,pw);for(let i=0;i<6000;i++)if(!poolStep(bs,ev))break;return{bs,ev}};
  const aiPlan=()=>{const c=cue(),pl=1,brk=G.brk;
    if(brk)return{ang:Math.atan2(L*.25-c.y,W/2-c.x)+gauss()*.006,pw:1,spin:{f:0,s:0},call:null,ex:true};
    const eightNow=onEight(1);const cands=shotsFrom(B,1,c.x,c.y).slice(0,6);let best=null;
    const judge=(s,pw,spin)=>{const {bs,ev}=simulate(s.ang,pw,spin);const cueIn=ev.potted.includes(0),first=ev.first,foul=cueIn||first==null||!okFirst(1,first,false);
      let sc=0;if(ev.potted.includes(8)){if(!eightNow||foul||ev.pk[8]!==s.pi)return -100;return 100}
      if(foul)sc-=30;const mineIn=ev.potted.filter(id=>id&&id!==8&&(!G.grp[1]||grpOf(id)===G.grp[1]));if(!foul&&mineIn.length){sc+=20+mineIn.length*3;const cb=bs[0];const nx=shotsFrom(bs,1,cb.x,cb.y);sc+=nx.length?Math.min(8,nx[0].ez*5+nx.length):-4}
      else{const cb=bs[0];if(!cueIn){const theirs=shotsFrom(bs,0,cb.x,cb.y);sc-=theirs.length*1.5}}return sc};
    cands.forEach(s=>{const base=Math.max(.22,Math.min(.85,.18+(s.dc+s.dt*1.6)/320));[[base,{f:0,s:0}],[base*1.25,{f:.5,s:0}],[base*1.15,{f:-.5,s:0}]].forEach(([pw,sp])=>{pw=Math.min(.95,pw);const sc=judge(s,pw,sp);if(!best||sc>best.sc)best={ang:s.ang,pw,spin:sp,sc,call:s.pi}})});
    if(!best||best.sc<5){/* no makeable pot: play a safety: hit your own ball softly, leave them nothing */
      B.filter(b=>!b.in&&b.id&&okFirst(1,b.id,false)).forEach(t=>{[0,-.03,.03].forEach(off=>{const a=Math.atan2(t.y-c.y,t.x-c.x)+off;[.25,.4].forEach(pw=>{const sc=judge({ang:a,pi:-1},pw,{f:0,s:0});if(!best||sc>best.sc)best={ang:a,pw,spin:{f:0,s:0},sc,call:null}})})})}
    return best||{ang:Math.random()*6.28,pw:.5,spin:{f:0,s:0}}};
  const aiTurn=()=>{if(G.dead||G.over)return;hud2();
    if(G.bih){/* ball in hand: try spots behind the easiest pots */const c=cue();let bp=null;B.filter(b=>!b.in&&b.id&&okFirst(1,b.id,G.brk)).forEach(t=>P_PK.forEach(p=>{const tx=p[0]-t.x,ty=p[1]-t.y,dt=Math.hypot(tx,ty),ux=tx/dt,uy=ty/dt;[16,26].forEach(back=>{const x=t.x-ux*(2*R+back),y=t.y-uy*(2*R+back);
      if(free(x,y,c)&&(!G.brk||y>KITCHEN)&&segClear(t.x,t.y,p[0],p[1],[t.id],B)&&(!bp||dt+back*.4<bp.s))bp={x,y,s:dt+back*.4}})}));if(G.brk){c.x=W/2+(Math.random()-.5)*30;c.y=L*.8}else if(bp){c.x=bp.x;c.y=bp.y}G.bih=false;draw()}
    setTimeout(()=>{if(G.dead||G.over)return;const pl=aiPlan();G.ang=pl.ang;G.aiAim=true;G.call=pl.call;draw();
      /* the cue pulls back like a real stroke, then fires with a little human error */
      let t=0;const pull=()=>{if(G.dead)return;t+=.06;G.pw=Math.min(pl.pw,t*pl.pw);draw();if(t<1)requestAnimationFrame(pull);else setTimeout(()=>{if(G.dead)return;G.aiAim=false;const err=gauss()*(G.aiSd+pl.pw*.004);shoot(pl.ang+err,pl.pw,pl.spin)},260)};
      setTimeout(pull,500)},350)};
  /* ---------- your controls ---------- */
  const yours=()=>G.turn===0&&!G.moving&&!G.over;
  const toT=e=>{const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)/k-RAIL,y:(e.clientY-r.top)/k-RAIL}};
  let dn=null;
  cv.addEventListener('pointerdown',e=>{if(!yours())return;cv.setPointerCapture&&cv.setPointerCapture(e.pointerId);const t=toT(e),c=cue();
    if(onEight(0)){const pi=P_PK.findIndex(p=>Math.hypot(t.x-p[0],t.y-p[1])<p[2]+6);if(pi>=0){G.call=pi;hud2();draw();return}}
    if(G.bih&&Math.hypot(t.x-c.x,t.y-c.y)<R*3.2){G.dragCue=true;dn={cue:1};return}
    dn={x:e.clientX,y:e.clientY,a:Math.atan2(t.y-c.y,t.x-c.x),moved:false,t}});
  cv.addEventListener('pointermove',e=>{if(!dn||!yours())return;const t=toT(e),c=cue();
    if(dn.cue){const y=G.brk?Math.max(KITCHEN+R,t.y):t.y;if(free(t.x,y,c)){c.x=t.x;c.y=y}draw();return}
    if(!dn.moved&&Math.hypot(e.clientX-dn.x,e.clientY-dn.y)<5)return;dn.moved=true;const a=Math.atan2(t.y-c.y,t.x-c.x);let d=a-dn.a;if(d>Math.PI)d-=2*Math.PI;if(d<-Math.PI)d+=2*Math.PI;G.ang+=d;dn.a=a;draw()});
  cv.addEventListener('pointerup',()=>{if(dn&&!dn.cue&&!dn.moved&&yours()){const c=cue();G.ang=Math.atan2(dn.t.y-c.y,dn.t.x-c.x)}if(dn&&dn.cue)G.dragCue=false;dn=null;draw()});
  /* fine-tune wheel */
  const fine=ov.querySelector('#pxFine');let fy=null;fine.addEventListener('pointerdown',e=>{if(!yours())return;fy=e.clientX;fine.setPointerCapture&&fine.setPointerCapture(e.pointerId)});
  fine.addEventListener('pointermove',e=>{if(fy==null)return;const d=e.clientX-fy;fy=e.clientX;G.ang+=d*.0011;fine.style.backgroundPositionX=(parseFloat(fine.style.backgroundPositionX)||0)+d+'px';draw()});fine.addEventListener('pointerup',()=>fy=null);
  /* power: pull the cue down and release */
  const pow=ov.querySelector('#pxPow');let py=null;const setPow=v=>{G.pw=v;ov.querySelector('#pxPf').style.height=v*100+'%';ov.querySelector('#pxPc').style.transform=`translateY(${v*(pow.clientHeight-40)}px)`};
  pow.addEventListener('pointerdown',e=>{if(!yours()||G.bih&&G.dragCue)return;if(onEight(0)&&G.call==null){say('Call your pocket first: tap a pocket');return}py=e.clientY;pow.setPointerCapture&&pow.setPointerCapture(e.pointerId)});
  pow.addEventListener('pointermove',e=>{if(py==null)return;setPow(Math.max(0,Math.min(1,(e.clientY-py)/(pow.clientHeight*.85))));draw()});
  const rel=()=>{if(py==null)return;py=null;if(G.pw<.03){setPow(0);draw();return}const pw=G.pw,err=gauss()*.0012*pw*pw;shoot(G.ang+err,pw,G.spin)};pow.addEventListener('pointerup',rel);pow.addEventListener('pointercancel',rel);
  /* spin */
  const pop=ov.querySelector('#pxSpinPop'),big=ov.querySelector('#pxBig');const showSpin=()=>{const d=ov.querySelector('#pxBigDot');d.style.left=50+G.spin.s*40+'%';d.style.top=50-G.spin.f*40+'%'};
  ov.querySelector('#pxSpin').onclick=()=>{if(!yours())return;pop.hidden=false;showSpin()};
  big.addEventListener('pointerdown',e=>{const r=big.getBoundingClientRect();let sx=((e.clientX-r.left)/r.width-.5)*2,sy=-((e.clientY-r.top)/r.height-.5)*2;const m=Math.hypot(sx,sy);if(m>.8){sx*=.8/m;sy*=.8/m}G.spin={f:sy,s:sx};showSpin();hud2()});
  ov.querySelector('#pxSpinOk').onclick=()=>{pop.hidden=true};ov.querySelector('#pxSpin0').onclick=()=>{G.spin={f:0,s:0};showSpin();hud2()};
  /* quit: tap twice */
  let qt=0;ov.querySelector('#pxX').onclick=()=>{if(G.over)return close(false,true);if(Date.now()-qt<2500){toast(`You walked away from the table. ${esc(who)} takes the game.`);close(false,false)}else{qt=Date.now();say('Tap ✕ again to forfeit',2400)}};
  /* shot clock: 40 seconds */
  let lt=performance.now();const tick=now=>{if(G.dead)return;const dt=(now-lt)/1000;lt=now;if(G.turn===0&&!G.moving&&!G.over){G.clock+=dt;if(G.clock>=40){G.clock=0;G.ev=null;G.leftBefore=[left(0),left(1)];endShot(true)}}
    [0,1].forEach(pl=>{const el=ov.querySelector('#pxT'+pl);if(el)el.style.width=(G.turn===pl&&!G.over&&!G.moving?Math.max(0,100-(pl?0:G.clock/40*100)):0)+'%'});requestAnimationFrame(tick)};requestAnimationFrame(tick);
  window.addEventListener('resize',layout);requestAnimationFrame(layout);hud2();
  say(G.turn?`${esc(who)} breaks`:'<b>Your break!</b> Place the cue ball, aim, pull the cue',2600);if(G.turn===1)setTimeout(aiTurn,1200);
  return G}
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
