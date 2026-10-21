/* ================= 🕹️ Game Zone Arcade =================
   A new building beside Club Vibes with GamePigeon-style games you actually play:
   🎱 Pool (pool hall), 🏀 Hoops, ⛳ Mini Golf, 🎯 Darts, 🥤 Cup Pong, ⚽ Penalties and 🟤 Oware.
   Every game keeps your best score. GH₵5 a game. Open 09:00 to midnight. */
const ARC_FEE=5;
function arcBest(k){return (S.arc&&S.arc[k])}
function arcRecord(k,v,lower){S.arc=S.arc||{};const b=S.arc[k];const rec=b==null||(lower?v<b:v>b);if(rec)S.arc[k]=v;return rec}
function arcSnd(f,len,vol,type){try{if(typeof SND!=='undefined'&&!SND.on)return;arcSnd.ac=arcSnd.ac||new (window.AudioContext||window.webkitAudioContext)();const ac=arcSnd.ac,o=ac.createOscillator(),g=ac.createGain();o.type=type||'sine';o.frequency.value=f;g.gain.setValueAtTime(vol||.2,ac.currentTime);g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+(len||.15));o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+(len||.15))}catch(e){}}
function arcThud(v){try{if(typeof SND!=='undefined'&&!SND.on)return;arcSnd.ac=arcSnd.ac||new (window.AudioContext||window.webkitAudioContext)();const ac=arcSnd.ac,len=.06,b=ac.createBuffer(1,ac.sampleRate*len,ac.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,4);const s=ac.createBufferSource();s.buffer=b;const g=ac.createGain();g.gain.value=Math.min(1,v||.4);s.connect(g);g.connect(ac.destination);s.start()}catch(e){}}
/* a full-screen game frame: title bar with stats and ✕, a canvas stage, an optional bottom bar */
function arcFrame(title,ic){try{closeSheet()}catch(e){}S.paused=true;
  const ov=document.createElement('div');ov.className='arcX';ov.innerHTML=`<div class="ax-top"><b class="ax-t">${ic} ${title}</b><div class="ax-stats" id="axStats"></div><button class="px-x" id="axX" aria-label="Close">✕</button></div>
    <div class="ax-stage" id="axStage"><canvas></canvas><div class="px-msg" id="axMsg"></div><div class="ax-hint" id="axHint"></div></div><div class="px-end" id="axEnd" hidden></div>`;
  document.body.appendChild(ov);const cv=ov.querySelector('canvas'),ctx=cv.getContext('2d');
  const F={ov,cv,ctx,w:300,h:500,dead:false};
  F.fit=()=>{const st=ov.querySelector('#axStage');const w=st.clientWidth,h=st.clientHeight,dpr=Math.min(2,window.devicePixelRatio||1);cv.width=w*dpr;cv.height=h*dpr;cv.style.width=w+'px';cv.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);F.w=w;F.h=h;F.onFit&&F.onFit()};
  F.stats=html=>{ov.querySelector('#axStats').innerHTML=html};F.hint=t=>{ov.querySelector('#axHint').innerHTML=t||''};
  let mt=0;F.say=(t,ms=1500)=>{const m=ov.querySelector('#axMsg');m.innerHTML=t;m.classList.add('on');clearTimeout(mt);mt=setTimeout(()=>m.classList.remove('on'),ms)};
  F.loop=fn=>{let last=performance.now();const go=now=>{if(F.dead)return;const dt=Math.min(.04,(now-last)/1000);last=now;fn(dt,now/1000);requestAnimationFrame(go)};requestAnimationFrame(go)};
  F.close=()=>{if(F.dead)return;F.dead=true;ov.remove();window.removeEventListener('resize',F.fit);S.paused=false;F.onClose&&F.onClose()};
  F.end=(html,again)=>{const e=ov.querySelector('#axEnd');e.innerHTML=`<div class="px-endc">${html}<div class="row" style="gap:8px;margin-top:12px">${again?`<button class="ghost" id="axAgain" style="flex:1">Play again · ${cedi(ARC_FEE)}</button>`:''}<button class="btn" id="axDone" style="flex:1">Done</button></div></div>`;e.hidden=false;
    ov.querySelector('#axDone').onclick=F.close;if(again)ov.querySelector('#axAgain').onclick=()=>{if(!spend(ARC_FEE))return;F.close();setTimeout(again,60)}};
  let qt=0;ov.querySelector('#axX').onclick=()=>{if(!ov.querySelector('#axEnd').hidden||F.over)return F.close();if(Date.now()-qt<2500)return F.close();qt=Date.now();F.say('Tap ✕ again to quit',2200)};
  window.addEventListener('resize',F.fit);requestAnimationFrame(F.fit);return F}
function arcDone(key,label,score,lower,extra){const rec=arcRecord(key,score,lower),p=P();p.needs.fun=clamp(p.needs.fun+22);advance(15);try{ev('game',{kind:key,score});window.track&&window.track('arcade_played',{game:key,score})}catch(e){}hud();
  return `<div style="font-size:44px">${rec?'🏆':'🎮'}</div><h3>${label}</h3>${extra||''}<p>${rec?'<b>New personal best!</b>':`Your best: <b>${arcBest(key)}</b>`}</p>`}

/* =============== 🏀 HOOPS: swipe up to shoot, 60 seconds =============== */
function hoopsGame(){const F=arcFrame('Hoops','🏀');const G={score:0,t:60,streak:0,made:0,ball:null,hx:0,hv:0,run:false,shots:0};F.G=G;window._arcF=F;
  const RIM={h:3.05,r:.23,z:4.6},BR=.12,CAM={y:1.95,z:-1.7};let f=500,cy=250;
  F.onFit=()=>{f=F.h*1.0;cy=F.h*.47};
  const pj=(x,y,z)=>{const d=z-CAM.z;return{x:F.w/2+x*f/d,y:cy-(y-CAM.y)*f/d,s:f/d}};
  const newBall=()=>{G.ball={x:0,y:1.45,z:.25,vx:0,vy:0,vz:0,fly:false,t:0,scored:false,rimmed:false,spin:0}};newBall();
  const stats=()=>F.stats(`<span>🏀 <b>${G.score}</b></span><span>⏱ <b>${Math.ceil(G.t)}</b></span><span>Best ${arcBest('hoops')??'-'}</span>`);stats();
  F.hint('Swipe up on the ball to shoot. Faster swipe = further.');F.say('<b>60 seconds!</b> Swipe up to shoot',1800);
  /* swipe */let sw=null;F.cv.addEventListener('pointerdown',e=>{if(G.ball.fly||F.over)return;sw={x:e.clientX,y:e.clientY,t:performance.now()}});
  F.cv.addEventListener('pointerup',e=>{if(!sw||G.ball.fly||F.over)return;const dx=e.clientX-sw.x,dy=e.clientY-sw.y;sw=null;if(-dy<25)return;G.run=true;
    const p=Math.min(1.25,-dy/(F.h*.5)),v=5.2+p*4,a=52*Math.PI/180,vz=v*Math.cos(a),b=G.ball;b.vz=vz;b.vy=v*Math.sin(a);b.vx=dx/(-dy)*vz*.9;b.fly=true;b.spin=-8;G.shots++;F.hint('')});
  const step=dt=>{const b=G.ball;if(!b.fly)return;const py=b.y,pz=b.z;b.vy-=9.8*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.z+=b.vz*dt;b.t+=dt;
    /* backboard */const bz=RIM.z+RIM.r+.15;if(pz+BR<=bz&&b.z+BR>bz&&Math.abs(b.x-G.hx)<.9&&b.y>RIM.h-.2&&b.y<RIM.h+1.05){b.z=bz-BR;b.vz=-Math.abs(b.vz)*.5;b.vx*=.8;arcThud(.5)}
    /* rim: a ring; bounce off the nearest point */const rx=b.x-G.hx,rz=b.z-RIM.z,d=Math.hypot(rx,rz)||1e-6,nx=G.hx+rx/d*RIM.r,nz=RIM.z+rz/d*RIM.r,ex=b.x-nx,ey=b.y-RIM.h,ez=b.z-nz,dd=Math.hypot(ex,ey,ez);
    if(dd<BR+.02){const ux=ex/dd,uy=ey/dd,uz=ez/dd,vn=b.vx*ux+b.vy*uy+b.vz*uz;if(vn<0){b.vx-=1.4*vn*ux;b.vy-=1.4*vn*uy;b.vz-=1.4*vn*uz;b.x=nx+ux*(BR+.02);b.y=RIM.h+uy*(BR+.02);b.z=nz+uz*(BR+.02);b.rimmed=true;arcThud(.3)}}
    /* through the hoop */if(!b.scored&&py>RIM.h&&b.y<=RIM.h&&Math.hypot(b.x-G.hx,b.z-RIM.z)<RIM.r-.03){b.scored=true;G.streak++;const pts=G.streak>=4?3:2;G.score+=pts;G.made++;b.vx*=.3;b.vz*=.3;arcSnd(880,.12,.15);setTimeout(()=>arcSnd(1320,.15,.12),90);
      F.say(G.streak>=4?`🔥 ON FIRE +${pts}`:b.rimmed?'+2':'SWISH! +2',900);if(G.made===5)F.say('The hoop starts moving! 👀',1400)}
    if(b.y<BR&&b.vy<0){b.y=BR;b.vy=-b.vy*.5;b.vx*=.7;b.vz*=.7;arcThud(.2)}
    if(b.t>2.6||b.z>8||Math.abs(b.x)>5){if(!b.scored)G.streak=0;newBall()}};
  F.step=step;F.loop((dt,now)=>{if(G.run&&!F.over){G.t-=dt;if(G.t<=0){G.t=0;F.over=true;setTimeout(()=>F.end(arcDone('hoops','Time!',G.score,false,`<p style="font-size:30px;margin:4px 0"><b>${G.score}</b> points</p><small>${G.made}/${G.shots} baskets</small>`),hoopsGame),500)}}
    if(G.made>=5){const sp=Math.min(1.6,.5+(G.made-5)*.08);G.hx=Math.sin(now*sp)*Math.min(1,.35+(G.made-5)*.05)}
    for(let i=0;i<4;i++)step(dt/4);stats();draw()});
  const draw=()=>{const c=F.ctx,W=F.w,H=F.h;let g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1b2440');g.addColorStop(.55,'#2b3a63');g.addColorStop(.56,'#a8733f');g.addColorStop(1,'#6e4524');c.fillStyle=g;c.fillRect(0,0,W,H);
    c.strokeStyle='rgba(255,255,255,.08)';for(let i=0;i<14;i++){const a=pj(-3+i*.5,0,0),b2=pj(-3+i*.5,0,9);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b2.x,b2.y);c.stroke()}
    const lp=pj(0,0,RIM.z-1.2),lr=1.8*lp.s;c.strokeStyle='rgba(255,255,255,.5)';c.lineWidth=2;c.beginPath();c.ellipse(lp.x,lp.y,lr,lr*.12,0,0,Math.PI*2);c.stroke();
    /* backboard + pole */const bz=RIM.z+RIM.r+.15,p1=pj(G.hx-.9,RIM.h+1.05,bz),p2=pj(G.hx+.9,RIM.h-.2,bz),pole=pj(G.hx,0,bz+.6),pt=pj(G.hx,RIM.h+.5,bz+.6);
    c.fillStyle='#555';c.fillRect(pole.x-5,pt.y,10,pole.y-pt.y);c.fillStyle='rgba(255,255,255,.92)';c.fillRect(p1.x,p1.y,p2.x-p1.x,p2.y-p1.y);c.strokeStyle='#d33';c.lineWidth=3;c.strokeRect(p1.x+2,p1.y+2,p2.x-p1.x-4,p2.y-p1.y-4);
    const q1=pj(G.hx-.3,RIM.h+.45,bz),q2=pj(G.hx+.3,RIM.h,bz);c.strokeRect(q1.x,q1.y,q2.x-q1.x,q2.y-q1.y);
    const b=G.ball,rc=pj(G.hx,RIM.h,RIM.z),rw=RIM.r*rc.s,behind=b.z>RIM.z;
    const ball=()=>{const p=pj(b.x,b.y,b.z),r=BR*p.s,sh=pj(b.x,0,b.z);c.fillStyle='rgba(0,0,0,.25)';c.beginPath();c.ellipse(sh.x,sh.y,r,r*.3,0,0,7);c.fill();
      c.save();c.translate(p.x,p.y);c.rotate(b.t*b.spin);const gg=c.createRadialGradient(-r*.35,-r*.35,r*.1,0,0,r);gg.addColorStop(0,'#ffab5c');gg.addColorStop(1,'#c4561a');c.fillStyle=gg;c.beginPath();c.arc(0,0,r,0,7);c.fill();
      c.strokeStyle='#3a1a08';c.lineWidth=Math.max(1,r*.07);c.beginPath();c.moveTo(-r,0);c.lineTo(r,0);c.moveTo(0,-r);c.lineTo(0,r);c.stroke();c.beginPath();c.arc(-r*1.35,0,r*.95,-.8,.8);c.stroke();c.beginPath();c.arc(r*1.35,0,r*.95,Math.PI-.8,Math.PI+.8);c.stroke();c.restore()};
    const net=()=>{c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=1;const n2=pj(G.hx,RIM.h-.42,RIM.z),nw=RIM.r*.6*n2.s;for(let i=0;i<10;i++){const a=i/10*Math.PI*2;c.beginPath();c.moveTo(rc.x+Math.cos(a)*rw,rc.y+Math.sin(a)*rw*.3);c.lineTo(n2.x+Math.cos(a+.3)*nw,n2.y+Math.sin(a+.3)*nw*.3);c.stroke()}
      c.beginPath();c.ellipse(n2.x,n2.y,nw,nw*.3,0,0,7);c.stroke()};
    if(behind)ball();c.strokeStyle='#ff6a1a';c.lineWidth=Math.max(2,rw*.12);c.beginPath();c.ellipse(rc.x,rc.y,rw,rw*.3,0,Math.PI,2*Math.PI);c.stroke();net();c.beginPath();c.ellipse(rc.x,rc.y,rw,rw*.3,0,0,Math.PI);c.stroke();if(!behind)ball()};
  return F}

/* =============== ⛳ MINI GOLF: 6 holes, drag back from the ball to putt =============== */
const GOLF=[
  {par:2,poly:[[30,8],[70,8],[70,165],[30,165]],tee:[50,150],cup:[50,26]},
  {par:3,poly:[[15,165],[45,165],[45,60],[90,60],[90,8],[15,8]],tee:[30,150],cup:[76,30]},
  {par:3,poly:[[12,8],[88,8],[88,165],[12,165]],tee:[50,152],cup:[50,24],bump:[[33,92,7],[67,92,7],[50,64,7],[50,120,5]]},
  {par:3,poly:[[12,8],[88,8],[88,165],[12,165]],tee:[28,152],cup:[30,26],water:[[12,78,58,18]],sand:[[48,20,26,22]]},
  {par:3,poly:[[25,8],[75,8],[75,165],[25,165]],tee:[50,152],cup:[50,24],walls:[[25,88,42,88],[58,88,75,88]],mill:{x:50,y:88,len:13,spd:1.7}},
  {par:4,poly:[[10,8],[90,8],[90,168],[10,168]],tee:[24,152],cup:[72,26],walls:[[10,120,66,120],[34,70,90,70]],sand:[[66,126,24,20]],bump:[[22,40,6]]}];
function golfGame(){const F=arcFrame('Mini Golf','⛳');const G={hole:0,strokes:0,card:[],b:null,last:null,aim:null,sink:0,moving:false};F.G=G;window._arcF=F;let k=3,ox=0,oy=0;
  F.onFit=()=>{k=Math.min(F.w/104,F.h/178);ox=(F.w-100*k)/2;oy=(F.h-176*k)/2};const X=x=>ox+x*k,Y=y=>oy+y*k;const BR=2.1,CR=3.3;
  const H=()=>GOLF[G.hole];const segs=()=>{const h=H(),s=[];h.poly.forEach((p,i)=>{const q=h.poly[(i+1)%h.poly.length];s.push([p[0],p[1],q[0],q[1]])});(h.walls||[]).forEach(w=>s.push(w));return s};
  const start=()=>{const h=H();G.b={x:h.tee[0],y:h.tee[1],vx:0,vy:0};G.last={x:h.tee[0],y:h.tee[1]};G.strokes=0;G.sink=0;G.moving=false;stats();F.say(`Hole ${G.hole+1} · Par ${h.par}`,1300)};
  const stats=()=>F.stats(`<span>Hole <b>${G.hole+1}</b>/6</span><span>Strokes <b>${G.strokes}</b></span><span>Total ${G.card.reduce((a,c)=>a+c,0)}</span>`);
  F.hint('Drag back from the ball and let go to putt.');
  const inR=(r,x,y)=>x>r[0]&&x<r[0]+r[2]&&y>r[1]&&y<r[1]+r[3];
  const toT=e=>{const r=F.cv.getBoundingClientRect();return{x:(e.clientX-r.left-ox)/k,y:(e.clientY-r.top-oy)/k}};
  F.cv.addEventListener('pointerdown',e=>{if(G.moving||G.sink||F.over)return;G.aim=toT(e);G.aim.cur=G.aim;F.cv.setPointerCapture&&F.cv.setPointerCapture(e.pointerId)});
  F.cv.addEventListener('pointermove',e=>{if(G.aim)G.aim.cur=toT(e)});
  F.cv.addEventListener('pointerup',()=>{if(!G.aim)return;const a=G.aim;G.aim=null;const dx=a.x-a.cur.x,dy=a.y-a.cur.y,l=Math.hypot(dx,dy);if(l<2)return;const p=Math.min(1,l/45),v=p*150;
    G.b.vx=dx/l*v;G.b.vy=dy/l*v;G.last={x:G.b.x,y:G.b.y};G.strokes++;G.moving=true;arcThud(.25+p*.4);stats();F.hint('')});
  const step=(dt,t)=>{const b=G.b,h=H();if(F.over)return;if(G.sink){G.sink-=dt;if(G.sink<=0)nextHole();return}if(!G.moving)return;
    b.x+=b.vx*dt;b.y+=b.vy*dt;
    const collideSeg=(s,e,push)=>{const dx=s[2]-s[0],dy=s[3]-s[1],l2=dx*dx+dy*dy,tt=Math.max(0,Math.min(1,((b.x-s[0])*dx+(b.y-s[1])*dy)/l2)),cx=s[0]+tt*dx,cy=s[1]+tt*dy,ex=b.x-cx,ey=b.y-cy,d=Math.hypot(ex,ey);
      if(d<BR+.8&&d>1e-6){const nx=ex/d,ny=ey/d,vn=b.vx*nx+b.vy*ny;b.x=cx+nx*(BR+.8);b.y=cy+ny*(BR+.8);if(vn<0){b.vx-=(1+e)*vn*nx;b.vy-=(1+e)*vn*ny;if(push){b.vx+=push[0];b.vy+=push[1]}arcThud(Math.min(.6,-vn/150))}}};
    segs().forEach(s=>collideSeg(s,.75));
    (h.bump||[]).forEach(([x,y,r])=>{const dx=b.x-x,dy=b.y-y,d=Math.hypot(dx,dy);if(d<r+BR){const nx=dx/d,ny=dy/d,vn=b.vx*nx+b.vy*ny;b.x=x+nx*(r+BR);b.y=y+ny*(r+BR);if(vn<0){b.vx-=1.9*vn*nx;b.vy-=1.9*vn*ny;arcSnd(520,.08,.12,'triangle')}}});
    if(h.mill){const m=h.mill,a=t*m.spd;[0,Math.PI].forEach(o=>{const ca=Math.cos(a+o),sa=Math.sin(a+o);collideSeg([m.x,m.y,m.x+ca*m.len,m.y+sa*m.len],.6,[-sa*m.spd*m.len*.6,ca*m.spd*m.len*.6])})}
    let fr=55;(h.sand||[]).forEach(r=>{if(inR(r,b.x,b.y))fr=260});const s=Math.hypot(b.vx,b.vy),s2=Math.max(0,s-(fr+s*.5)*dt);
    if(s2<1.5){b.vx=b.vy=0}else{b.vx*=s2/s;b.vy*=s2/s}
    for(const r of (h.water||[]))if(inR(r,b.x,b.y)){F.say('💦 Splash! +1 stroke',1300);arcSnd(200,.3,.2);G.strokes++;b.x=G.last.x;b.y=G.last.y;b.vx=b.vy=0;stats();break}
    const cd=Math.hypot(b.x-h.cup[0],b.y-h.cup[1]),sp=Math.hypot(b.vx,b.vy);
    if(cd<CR){if(sp<95){G.sink=1.1;G.moving=false;b.x=h.cup[0];b.y=h.cup[1];b.vx=b.vy=0;arcSnd(660,.1,.18);setTimeout(()=>arcSnd(990,.18,.16),110);const d=G.strokes-h.par;F.say(G.strokes===1?'⛳ HOLE IN ONE!':d<=-2?'🦅 Eagle!':d===-1?'🐦 Birdie!':d===0?'Par':d===1?'Bogey':`+${d}`,1100)}
      else{const nx=(b.x-h.cup[0])/cd,ny=(b.y-h.cup[1])/cd;b.vx+=-ny*sp*.35;b.vy+=nx*sp*.35;b.vx*=.75;b.vy*=.75;arcThud(.3)}}
    if(!b.vx&&!b.vy&&!G.sink){G.moving=false;if(G.strokes>=8){F.say('Max strokes, picking it up',1200);G.strokes=9;G.sink=1.2}}};
  const nextHole=()=>{G.sink=0;G.card.push(G.strokes);if(G.hole>=GOLF.length-1){F.over=true;const tot=G.card.reduce((a,c)=>a+c,0),par=GOLF.reduce((a,h)=>a+h.par,0),d=tot-par;
      F.end(arcDone('golf','Round complete',tot,true,`<p style="font-size:26px;margin:4px 0"><b>${tot}</b> strokes · ${d===0?'even par':d>0?'+'+d:d}</p><div class="gcard">${G.card.map((c,i)=>`<span><small>${i+1}</small><b class="${c<GOLF[i].par?'u':c>GOLF[i].par?'o':''}">${c}</b></span>`).join('')}</div>`),golfGame);return}
    G.hole++;start()};
  F.step=step;F.loop((dt,t)=>{for(let i=0;i<4;i++)step(dt/4,t);draw(t)});
  const draw=t=>{const c=F.ctx,h=H();c.fillStyle='#173d22';c.fillRect(0,0,F.w,F.h);c.fillStyle='rgba(255,255,255,.03)';for(let i=0;i<F.w;i+=18)c.fillRect(i,0,9,F.h);
    c.save();c.beginPath();h.poly.forEach((p,i)=>c[i?'lineTo':'moveTo'](X(p[0]),Y(p[1])));c.closePath();c.fillStyle='#3fae4a';c.fill();c.clip();for(let y=0;y<180;y+=12){c.fillStyle='rgba(255,255,255,.05)';c.fillRect(0,Y(y),F.w,6*k)}
    (h.sand||[]).forEach(r=>{c.fillStyle='#e6d39a';c.beginPath();c.ellipse(X(r[0]+r[2]/2),Y(r[1]+r[3]/2),r[2]/2*k,r[3]/2*k,0,0,7);c.fill()});
    (h.water||[]).forEach(r=>{c.fillStyle='#2a83c9';c.fillRect(X(r[0]),Y(r[1]),r[2]*k,r[3]*k);c.strokeStyle='rgba(255,255,255,.35)';for(let i=0;i<4;i++){c.beginPath();const yy=Y(r[1]+3+i*4);for(let x=0;x<=r[2];x+=2)c.lineTo(X(r[0]+x),yy+Math.sin(x*.5+t*3+i)*1.5);c.stroke()}});c.restore();
    c.strokeStyle='#8b5a2b';c.lineWidth=2.4*k;c.lineCap='round';c.beginPath();h.poly.forEach((p,i)=>c[i?'lineTo':'moveTo'](X(p[0]),Y(p[1])));c.closePath();c.stroke();(h.walls||[]).forEach(w=>{c.beginPath();c.moveTo(X(w[0]),Y(w[1]));c.lineTo(X(w[2]),Y(w[3]));c.stroke()});
    (h.bump||[]).forEach(([x,y,r])=>{c.fillStyle='#d8352a';c.beginPath();c.arc(X(x),Y(y),r*k,0,7);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(X(x),Y(y),r*k*.55,0,7);c.fill();c.fillStyle='#d8352a';c.beginPath();c.arc(X(x),Y(y),r*k*.25,0,7);c.fill()});
    if(h.mill){const m=h.mill,a=t*m.spd;c.strokeStyle='#5b3a1e';c.lineWidth=2.2*k;[0,Math.PI].forEach(o=>{c.beginPath();c.moveTo(X(m.x),Y(m.y));c.lineTo(X(m.x+Math.cos(a+o)*m.len),Y(m.y+Math.sin(a+o)*m.len));c.stroke()});c.fillStyle='#e8b24a';c.beginPath();c.arc(X(m.x),Y(m.y),2*k,0,7);c.fill()}
    c.fillStyle='#0b0b0b';c.beginPath();c.arc(X(h.cup[0]),Y(h.cup[1]),CR*k,0,7);c.fill();c.strokeStyle='#ddd';c.lineWidth=1.5;c.beginPath();c.moveTo(X(h.cup[0]),Y(h.cup[1]));c.lineTo(X(h.cup[0]),Y(h.cup[1]-16));c.stroke();
    c.fillStyle='#e0483a';c.beginPath();c.moveTo(X(h.cup[0]),Y(h.cup[1]-16));c.lineTo(X(h.cup[0]+9+Math.sin(t*4)),Y(h.cup[1]-13));c.lineTo(X(h.cup[0]),Y(h.cup[1]-10));c.fill();
    const b=G.b;if(G.aim&&G.aim.cur){const dx=G.aim.x-G.aim.cur.x,dy=G.aim.y-G.aim.cur.y,l=Math.hypot(dx,dy),p=Math.min(1,l/45);if(l>2){const ux=dx/l,uy=dy/l;c.setLineDash([4,5]);c.strokeStyle=`rgba(255,255,255,.9)`;c.lineWidth=2;c.beginPath();c.moveTo(X(b.x),Y(b.y));c.lineTo(X(b.x+ux*(8+p*38)),Y(b.y+uy*(8+p*38)));c.stroke();c.setLineDash([]);
      c.fillStyle=`hsl(${120-p*120},80%,55%)`;c.fillRect(X(b.x)-14,Y(b.y)+5*k,28*p,4)}}
    if(!(G.sink&&G.sink<.8)){const r=BR*k*(G.sink?Math.max(.3,G.sink):1);c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.arc(X(b.x)+1.5,Y(b.y)+2,r,0,7);c.fill();const gg=c.createRadialGradient(X(b.x)-r*.4,Y(b.y)-r*.4,r*.1,X(b.x),Y(b.y),r);gg.addColorStop(0,'#fff');gg.addColorStop(1,'#cfcfcf');c.fillStyle=gg;c.beginPath();c.arc(X(b.x),Y(b.y),r,0,7);c.fill()}
    c.fillStyle='rgba(255,255,255,.85)';c.font='800 12px system-ui';c.textAlign='left';c.fillText(`Par ${h.par}`,8,F.h-10)};
  start();return F}

/* =============== 🎯 DARTS: hold to steady your hand, let go to throw. 9 darts =============== */
const DART_N=[20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5];
function dartsGame(){const F=arcFrame('Darts','🎯');const G={darts:[],score:0,hold:null,aim:{x:0,y:0},fly:null,t:0,steady:0};F.G=G;window._arcF=F;let cx=0,cy=0,R=100;
  F.onFit=()=>{R=Math.min(F.w*.44,F.h*.36);cx=F.w/2;cy=F.h*.42;G.aim={x:cx,y:cy}};
  const stats=()=>F.stats(`<span>🎯 <b>${G.score}</b></span><span>Dart <b>${Math.min(9,G.darts.length+1)}</b>/9</span><span>Best ${arcBest('darts')??'-'}</span>`);stats();
  F.hint('Touch and hold to aim (your hand steadies). Let go to throw.');
  const scoreAt=(x,y)=>{const dx=x-cx,dy=y-cy,d=Math.hypot(dx,dy)/R*170;if(d>170)return[0,'Miss'];if(d<6.35)return[50,'BULL'];if(d<15.9)return[25,'25'];let a=Math.atan2(dx,-dy)*180/Math.PI;a=(a+360+9)%360;const n=DART_N[Math.floor(a/18)];
    if(d>=99&&d<=107)return[n*3,'T'+n];if(d>=162)return[n*2,'D'+n];return[n,''+n]};
  const toP=e=>{const r=F.cv.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}};
  F.cv.addEventListener('pointerdown',e=>{if(G.fly||F.over||G.darts.length>=9)return;G.hold={p:toP(e),t:0};F.cv.setPointerCapture&&F.cv.setPointerCapture(e.pointerId)});
  F.cv.addEventListener('pointermove',e=>{if(G.hold)G.hold.p=toP(e)});
  F.cv.addEventListener('pointerup',()=>{if(!G.hold)return;G.hold=null;const tx=G.aim.x+(Math.random()-.5)*R*.03,ty=G.aim.y+(Math.random()-.5)*R*.03;G.fly={x:tx,y:ty,t:0};arcSnd(300,.08,.08,'triangle')});
  F.loop(dt=>{G.t+=dt;if(G.hold){G.hold.t+=dt;const ht=G.hold.t,amp=R*(ht<1.3?.28-ht*.17:ht<3?.06:.06+(ht-3)*.12),p=G.hold.p,bx=p.x,by=p.y-R*.35;
      G.aim.x=bx+amp*(Math.sin(G.t*1.9)+.6*Math.sin(G.t*3.3+1));G.aim.y=by+amp*(Math.cos(G.t*1.5)+.5*Math.sin(G.t*2.7))}
    if(G.fly){G.fly.t+=dt;if(G.fly.t>.22){const [pts,lab]=scoreAt(G.fly.x,G.fly.y);G.darts.push({x:G.fly.x,y:G.fly.y,pts,lab});G.score+=pts;G.fly=null;arcThud(.6);stats();F.say(pts?`<b>${lab}</b> · ${pts}`:'Miss!',800);
      if(G.darts.length%3===0&&G.darts.length<9)setTimeout(()=>{if(!F.dead)F.say(`Round ${G.darts.length/3+1}`,900)},850);
      if(G.darts.length>=9){F.over=true;setTimeout(()=>F.end(arcDone('darts','Nine darts done',G.score,false,`<p style="font-size:30px;margin:4px 0"><b>${G.score}</b> points</p><small>${G.darts.map(d=>d.lab||'0').join(' · ')}</small>`),dartsGame),900)}}}
    draw()});
  const draw=()=>{const c=F.ctx;c.fillStyle='#16233a';c.fillRect(0,0,F.w,F.h);c.fillStyle='#24344f';c.fillRect(0,0,F.w,F.h*.82);
    c.fillStyle='#111';c.beginPath();c.arc(cx,cy,R*1.18,0,7);c.fill();
    for(let i=0;i<20;i++){const a0=(i*18-9-90)*Math.PI/180,a1=a0+18*Math.PI/180,dark=i%2===0;[[170,162,dark?'#d8352a':'#1f8a4c'],[162,107,dark?'#111':'#f2e6c9'],[107,99,dark?'#d8352a':'#1f8a4c'],[99,15.9,dark?'#111':'#f2e6c9']].forEach(([ro,ri,col])=>{c.fillStyle=col;c.beginPath();c.arc(cx,cy,ro/170*R,a0,a1);c.arc(cx,cy,ri/170*R,a1,a0,true);c.closePath();c.fill()})}
    c.fillStyle='#1f8a4c';c.beginPath();c.arc(cx,cy,15.9/170*R,0,7);c.fill();c.fillStyle='#d8352a';c.beginPath();c.arc(cx,cy,6.35/170*R,0,7);c.fill();
    c.fillStyle='#fff';c.font=`700 ${Math.round(R*.1)}px system-ui`;c.textAlign='center';c.textBaseline='middle';DART_N.forEach((n,i)=>{const a=(i*18-90)*Math.PI/180;c.fillText(n,cx+Math.cos(a)*R*1.09,cy+Math.sin(a)*R*1.09)});
    G.darts.forEach((d,i)=>{if(i<Math.floor((G.darts.length-1)/3)*3)return;dart(d.x,d.y,1)});
    if(G.fly){const s=1+ (1-G.fly.t/.22)*1.5;dart(G.fly.x,G.fly.y+(1-G.fly.t/.22)*R*.6,s)}
    if(G.hold||!G.fly&&!F.over){const a=G.aim;c.strokeStyle=G.hold?'#ffd34d':'rgba(255,255,255,.5)';c.lineWidth=2;c.beginPath();c.arc(a.x,a.y,9,0,7);c.moveTo(a.x-15,a.y);c.lineTo(a.x-4,a.y);c.moveTo(a.x+4,a.y);c.lineTo(a.x+15,a.y);c.moveTo(a.x,a.y-15);c.lineTo(a.x,a.y-4);c.moveTo(a.x,a.y+4);c.lineTo(a.x,a.y+15);c.stroke()}};
  const dart=(x,y,s)=>{const c=F.ctx;c.save();c.translate(x,y);c.scale(s,s);c.strokeStyle='#bbb';c.lineWidth=2;c.beginPath();c.moveTo(0,0);c.lineTo(9,14);c.stroke();c.fillStyle='#333';c.fillRect(8,13,4,12);c.fillStyle='#e0483a';c.beginPath();c.moveTo(11,24);c.lineTo(4,34);c.lineTo(18,34);c.fill();c.restore()};
  return F}

/* =============== 🥤 CUP PONG vs an opponent: swipe to throw, 2 throws a turn, first to sink all 6 =============== */
function pongGame(nOpt){const n=nOpt===undefined?mgOpponent():nOpt,who=n?n.name.split(' ')[0]:pick(['Kojo','Esi','Yaw','Ama']);
  const F=arcFrame('Cup Pong','🥤');const CR=.062,CH=.13,BR=.022,TZ=1.8,CAM={y:.72,z:-.32};let f=500,cy=100;
  F.onFit=()=>{f=F.h*.95;cy=F.h*.16};const pj=(x,y,z)=>{const d=z-CAM.z;return{x:F.w/2+x*f/d,y:cy-(y-CAM.y)*f/d,s:f/d}};
  const rack=z0=>{const o=[];[[0],[-.5,.5],[-1,0,1]].forEach((row,r)=>row.forEach(c=>o.push({x:c*CR*2.1,z:z0-r*CR*1.85,in:true})));return o};
  const G={mine:rack(.0),theirs:rack(TZ-.12).map(c=>({...c,z:TZ-.12-(TZ-.12-c.z)*-1})),turn:0,left:2,b:null,over:false};
  F.G=G;window._arcF=F;G.theirs=[[0],[-.5,.5],[-1,0,1]].flatMap((row,r)=>row.map(c=>({x:c*CR*2.1,z:TZ-.36+r*CR*1.85,in:true})));
  const cnt=a=>a.filter(c=>c.in).length;
  const stats=()=>F.stats(`<span>You <b>${cnt(G.theirs)}</b> left</span><span>${esc(who)} <b>${cnt(G.mine)}</b> left</span>`);stats();
  F.hint('Swipe up to throw. 2 throws a turn. Sink all 6 of their cups to win.');
  const newBall=()=>{G.b={x:0,y:.32,z:.05,vx:0,vy:0,vz:0,fly:false,t:0}};newBall();
  let sw=null;F.cv.addEventListener('pointerdown',e=>{if(G.turn!==0||G.b.fly||G.over)return;sw={x:e.clientX,y:e.clientY}});
  F.cv.addEventListener('pointerup',e=>{if(!sw||G.b.fly)return;const dx=e.clientX-sw.x,dy=e.clientY-sw.y;sw=null;if(-dy<25)return;const p=Math.min(1.3,-dy/(F.h*.5)),v=3.0+p*2.6,a=Math.PI/4,vz=v*Math.cos(a);
    G.b.vz=vz;G.b.vy=v*Math.sin(a);G.b.vx=dx/(-dy)*vz*.55;G.b.fly=true;F.hint('')});
  const step=dt=>{const b=G.b;if(!b.fly)return;const py=b.y;b.vy-=9.8*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.z+=b.vz*dt;b.t+=dt;
    for(const c of G.theirs){if(!c.in)continue;const d=Math.hypot(b.x-c.x,b.z-c.z);if(py>CH&&b.y<=CH){if(d<CR-BR*.6){c.in=false;b.fly=false;arcSnd(520,.1,.15);setTimeout(()=>arcSnd(780,.16,.13),100);F.say('💦 IN THE CUP!',900);stats();return afterThrow(true)}
      if(d<CR+BR){const nx=(b.x-c.x)/d,nz=(b.z-c.z)/d;b.vx=nx*1.2+b.vx*.3;b.vz=nz*1.2+b.vz*.3;b.vy=Math.abs(b.vy)*.45;b.y=CH+.001;arcThud(.25);F.say('Rim! 😩',600)}}}
    if(b.y<BR&&b.vy<0&&Math.abs(b.x)<.45&&b.z<TZ+.05&&b.z>-.1){b.y=BR;b.vy=-b.vy*.62;b.vx*=.85;b.vz*=.85;arcThud(.2)}
    if(b.y<-.6||b.t>3){b.fly=false;afterThrow(false)}};
  const afterThrow=made=>{G.left--;if(!cnt(G.theirs))return finish(true);setTimeout(()=>{if(F.dead)return;newBall();if(G.left<=0){G.turn=1;G.left=2;aiTurn()}},made?700:400)};
  const aiTurn=()=>{F.say(`${esc(who)}'s turn`,900);let k=0;const one=()=>{if(F.dead||G.over)return;const live=G.mine.filter(c=>c.in);if(!live.length)return finish(false);const made=Math.random()<.36+Math.random()*.12;
      setTimeout(()=>{if(F.dead||G.over)return;if(made){pick(live).in=false;arcSnd(330,.12,.12);F.say(`💦 ${esc(who)} sinks one!`,900)}else F.say(`${esc(who)} misses`,800);stats();k++;
        if(!cnt(G.mine))return setTimeout(()=>finish(false),700);if(k<2)setTimeout(one,1000);else setTimeout(()=>{G.turn=0;F.say('Your turn',800)},1000)},700)};setTimeout(one,900)};
  const finish=won=>{if(G.over)return;G.over=true;F.over=true;const p=P();p.needs.fun=clamp(p.needs.fun+20);if(n){n.friend=clamp(n.friend+(won?3:4))}if(won)S.wins=(S.wins||0)+1;
    const rec=won&&arcRecord('pong',cnt(G.mine),false);advance(20);try{ev('game',{kind:'pong',win:won})}catch(e){}hud();
    setTimeout(()=>F.end(`<div style="font-size:44px">${won?'🏆':'🥤'}</div><h3>${won?'You win!':esc(who)+' wins'}</h3><p>${won?`You won with ${cnt(G.mine)} of your cups still standing.`:`You sank ${6-cnt(G.theirs)} of 6.`}</p>${rec?'<p><b>New personal best!</b></p>':''}`,()=>pongGame(nOpt)),600)};
  F.step=step;F.loop(dt=>{for(let i=0;i<4;i++)step(dt/4);draw()});
  const cup=(c,col)=>{const x=F.ctx,t=pj(c.x,CH,c.z),bo=pj(c.x,0,c.z),r=CR*t.s,rb=CR*.7*bo.s;x.fillStyle=col;x.beginPath();x.moveTo(t.x-r,t.y);x.lineTo(bo.x-rb,bo.y);x.lineTo(bo.x+rb,bo.y);x.lineTo(t.x+r,t.y);x.fill();
    x.fillStyle='rgba(255,255,255,.18)';x.fillRect(t.x-r*.55,t.y,r*.18,bo.y-t.y);x.fillStyle='#f4f4f4';x.beginPath();x.ellipse(t.x,t.y,r,r*.32,0,0,7);x.fill();x.fillStyle='#3a8ad6';x.beginPath();x.ellipse(t.x,t.y+r*.04,r*.86,r*.26,0,0,7);x.fill()};
  const draw=()=>{const c=F.ctx;let g=c.createLinearGradient(0,0,0,F.h);g.addColorStop(0,'#251a35');g.addColorStop(1,'#0f0b16');c.fillStyle=g;c.fillRect(0,0,F.w,F.h);
    const a=pj(-.45,0,TZ+.05),b=pj(.45,0,TZ+.05),d2=pj(.45,0,-.05),e=pj(-.45,0,-.05);c.fillStyle='#1d5c9e';c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.lineTo(d2.x,d2.y);c.lineTo(e.x,e.y);c.fill();
    c.strokeStyle='rgba(255,255,255,.6)';c.lineWidth=2;c.stroke();const m1=pj(0,0,TZ+.05),m2=pj(0,0,-.05);c.beginPath();c.moveTo(m1.x,m1.y);c.lineTo(m2.x,m2.y);c.stroke();
    const ball=()=>{const B=G.b,p=pj(B.x,B.y,B.z),r=Math.max(2,BR*p.s),sh=pj(B.x,0,B.z);c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(sh.x,sh.y,r,r*.35,0,0,7);c.fill();const gg=c.createRadialGradient(p.x-r*.3,p.y-r*.3,1,p.x,p.y,r);gg.addColorStop(0,'#fff');gg.addColorStop(1,'#f0c890');c.fillStyle=gg;c.beginPath();c.arc(p.x,p.y,r,0,7);c.fill()};
    const cups=G.theirs.filter(q=>q.in).sort((p,q)=>q.z-p.z);let drawn=false;cups.forEach(q=>{if(!drawn&&G.b.z>q.z+CR){ball();drawn=true}cup(q,'#d8352a')});if(!drawn)ball();
    /* your rack, shown small at the bottom */const bx=78,by=40;c.fillStyle='rgba(255,255,255,.08)';c.beginPath();c.roundRect?c.roundRect(bx-70,by-26,140,50,12):c.rect(bx-70,by-26,140,50);c.fill();c.fillStyle='rgba(255,255,255,.6)';c.font='700 9px system-ui';c.textAlign='center';c.fillText('YOUR CUPS',bx,by-14);
    G.mine.forEach((q,i)=>{const row=i===0?0:i<3?1:2,col=[0,-.5,.5,-1,0,1][i];c.fillStyle=q.in?'#2456c8':'rgba(255,255,255,.12)';c.beginPath();c.arc(bx+col*22,by+4+(row-1)*-0+row*6-6+row*4,8,0,7);c.fill()});
    if(G.turn===1&&!G.over){c.fillStyle='rgba(255,255,255,.75)';c.font='700 13px system-ui';c.fillText(`${who} is throwing…`,F.w/2,F.h*.62)}};
  return F}

/* ---------- the arcade menu ---------- */
const ARC_GAMES=[
  ['pool','🎱','Pool','8-ball vs the pool hall players. Levels, stakes and XP.'],
  ['hoops','🏀','Hoops','60 seconds. Swipe up, sink as many as you can. The hoop starts moving!'],
  ['golf','⛳','Mini Golf','6 holes: bumpers, water, sand and a windmill.'],
  ['darts','🎯','Darts','Nine darts. Hold to steady your hand, let go to throw.'],
  ['pong','🥤','Cup Pong','Swipe to throw. First to sink all 6 cups.'],
  ['pens','⚽','Penalties','Best of five shootout.'],
  ['oware','🟤','Oware','Ghana\'s classic seed game.']];
function arcadeMenu(){const p=P();openSheet();const bestTxt=k=>{const b=arcBest(k);return b==null?'':k==='golf'?` · best ${b} strokes`:k==='pong'?'':` · best ${b}`};
  $('sheetIn').innerHTML=`<div class="eyebrow">🕹️ Game Zone Arcade</div><h3>Pick a game</h3><p style="font-size:13px;opacity:.75">${cedi(ARC_FEE)} a game · MoMo ${cedi(p.money)}</p>
    <div class="list">${ARC_GAMES.map(([k,ic,nm,why])=>`<div class="item"><span style="font-size:26px">${ic}</span><div class="grow"><b>${nm}</b><small>${why}${bestTxt(k)}${k==='pool'?` · level ${poolLevel().l}`:''}</small></div><button class="btn sm" data-g="${k}">Play</button></div>`).join('')}</div>`;
  $('sheetIn').querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{const k=b.dataset.g;if(k==='pool')return poolHall(ARC_FEE);if(!spend(ARC_FEE))return;closeSheet();
    setTimeout(()=>({hoops:hoopsGame,golf:golfGame,darts:dartsGame,pong:()=>pongGame(),pens:()=>penaltyGame(),oware:()=>owareGame()})[k](),80)})}

/* ---------- the building: inside, and what you can do there ---------- */
BLD.arcade={W:10,D:7.6,wall:0x161a2e,floor:3};
{const _eb=enterBuilding;enterBuilding=function(id){const r=_eb.apply(this,arguments);try{if(IS&&IS.kind==='bld'&&IS.bid==='arcade')arcadeInterior(IS)}catch(e){console.warn(e)}return r}}
function arcadeInterior(I){const s=I.scene,W=I.W,D=I.D;s.children.forEach(o=>{if(o.isHemisphereLight)o.intensity=.55});
  const glow=c=>new THREE.MeshBasicMaterial({color:c});
  /* cabinets along the back wall with glowing screens */[[-3.6,0xff3cac,'HOOPS'],[-2.4,0x3cd4ff,'DARTS'],[-1.2,0xffd34d,'GOLF'],[2.2,0x7dff8a,'PONG'],[3.4,0xb44cff,'RACER']].forEach(([x,col,t])=>{
    const B_=box(.9,1.8,.7,0x15151f,x,.9,-D/2+.45,s);I.obst.push({x1:x-.45,x2:x+.45,z1:-D/2,z2:-D/2+.8});const sc=new THREE.Mesh(new THREE.PlaneGeometry(.66,.5),glow(col));sc.position.set(x,1.32,-D/2+.81);sc.rotation.x=-.2;s.add(sc);
    box(.8,.06,.3,0x2a2a35,x,.95,-D/2+.85,s);const mq=new THREE.Mesh(new THREE.PlaneGeometry(.8,.2),new THREE.MeshBasicMaterial({map:textTex(t,{font:'900 60px system-ui',color:'#fff',stroke:false,bg:'#'+col.toString(16).padStart(6,'0')})}));mq.position.set(x,1.72,-D/2+.81);s.add(mq);
    const l=new THREE.PointLight(col,.6,2.5,2);l.position.set(x,1.3,-D/2+1.2);s.add(l)});
  /* a basketball machine on the right wall */box(.9,2.2,2.4,0x223355,W/2-.5,1.1,-.6,s);I.obst.push({x1:W/2-1,x2:W/2,z1:-1.8,z2:.6});mesh(new THREE.TorusGeometry(.18,.02,6,16),lam(0xff6a1a),W/2-.75,2.0,-.6,s).rotation.y=Math.PI/2;
  /* air hockey in the middle-left */box(1.8,.8,1,0xf2f2f2,-2.6,.4,.6,s);box(1.7,.02,.9,0x3cd4ff,-2.6,.81,.6,s);I.obst.push({x1:-3.5,x2:-1.7,z1:.1,z2:1.1});
  poolTable3D(s,1.4,1.4,I.obst);
  const sg=new THREE.Mesh(new THREE.PlaneGeometry(3.2,.55),new THREE.MeshBasicMaterial({map:textTex('GAME ZONE',{font:'900 56px system-ui',color:'#fff',stroke:false,bg:'#1b6bff'})}));sg.position.set(0,2.55,-D/2+.08);s.add(sg);
  [0xff3cac,0x3cd4ff].forEach((c,i)=>{const l=new THREE.PointLight(c,1,8,1.6);l.position.set(i?2.5:-2.5,2.6,0);s.add(l)});
  I.spots.seat={x:0,z:-D/2+1.3,ry:Math.PI}}
{const _pa=placeActions;placeActions=function(b,inside){const a=_pa.apply(this,arguments);try{if(b&&b.id==='arcade'){const h=hour(),open=h>=9;
  if(inside){if(open)a.unshift(['🕹️ Play a game',()=>arcadeMenu(),null,'b']);else a.unshift(['Closed (09:00 to midnight)',null])}
  else if(!open){const i=a.findIndex(x=>/^Go inside/.test(x[0]));if(i>=0)a[i]=['Game Zone is closed (09:00 to midnight)',null]}}}catch(e){}return a}}
