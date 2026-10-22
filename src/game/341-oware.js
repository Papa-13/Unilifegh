/* ================= 🟤 Oware, played properly in the hostel room =================
   Full-screen wooden board. You see every seed: pick a pit, the seeds are scooped up and dropped one
   at a time into the next pits (anticlockwise) with a running count, and captured seeds fly into
   your store with a "+3". Abapa rules: skip the starting pit on big sows, capture 2s and 3s on the
   other side (and the 2s/3s just before), no grand slam, and you must feed an empty opponent.
   Only played in hostel rooms, against whoever is in the room with you. */
owareGame=function(nOpt){if(!(IS&&IS.kind==='room'))return toast('Oware is played in the hostel rooms. Find someone in a room to play with.');
  const n=nOpt||mgOpponent(),who=n?n.name.split(' ')[0]:'Roommate';const F=arcFrame(`Oware vs ${who}`,'🟤');
  const G={b:Array(12).fill(4),st:[0,0],turn:0,anim:null,flies:[],pops:[],over:false,last:-1,think:0};F.G=G;window._arcF=F;
  const OWN=pl=>pl?[6,7,8,9,10,11]:[0,1,2,3,4,5];
  const sow=(b0,i)=>{const b=b0.slice(),path=[];let s=b[i];b[i]=0;let j=i;while(s>0){j=(j+1)%12;if(j===i)continue;b[j]++;s--;path.push(j)}return{b,path,end:j}};
  const caps=(b,end,pl)=>{const opp=k=>pl?k<6:k>=6;let k=end;const c=[];while(opp(k)&&(b[k]===2||b[k]===3)){c.push(k);k=(k+11)%12}
    const oppAll=OWN(1-pl).reduce((a,x)=>a+b[x],0),sum=c.reduce((a,x)=>a+b[x],0);return sum&&sum<oppAll?c:[]};
  const sim=(b0,i,pl)=>{const r=sow(b0,i),c=caps(r.b,r.end,pl),b=r.b.slice();let cap=0;c.forEach(x=>{cap+=b[x];b[x]=0});return{b,cap,path:r.path,caps:c,end:r.end}};
  const legal=(b,pl)=>{let m=OWN(pl).filter(i=>b[i]>0);if(OWN(1-pl).every(i=>!b[i]))m=m.filter(i=>OWN(1-pl).some(j=>sim(b,i,pl).b[j]>0));return m};
  /* layout: their row on top (right to left), yours along the bottom, stores above and below */
  /* on a tall phone screen the board stands upright (your pits up the right side, theirs down the left) so pits and seeds are big */
  let L={};F.onFit=()=>{const vert=F.h>F.w*1.25;if(vert){const pr=Math.min(F.w*.17,F.h*.53/12.6),cy=F.h*.48,cx=F.w/2;L={vert,pr,cx,cy,colR:cx+pr*1.3,colL:cx-pr*1.3,x0:cx-pr*3,W:pr*6,store:[cy+pr*6.3+pr*1.9,cy-pr*6.3-pr*1.9]}}
    else{const W=Math.min(F.w-16,620),pr=W/12*.86,x0=(F.w-W)/2,cy=F.h*.47,gap=pr*2.5;L={vert,W,pr,x0,cy,top:cy-gap/2,bot:cy+gap/2,store:[cy+gap/2+pr*3.1,cy-gap/2-pr*3.1]}}};
  const pitXY=i=>{if(L.vert){const r=i<6?i:11-i;return{x:i<6?L.colR:L.colL,y:L.cy+L.pr*2.1*(2.5-r)}}const col=i<6?i:11-i;return{x:L.x0+L.W/12*(col*2+1),y:i<6?L.bot:L.top}};
  const labXY=(i,p)=>L.vert?{x:p.x+(i<6?1:-1)*L.pr*1.55,y:p.y}:{x:p.x,y:i<6?p.y+L.pr*1.35:p.y-L.pr*1.35};
  const seedXY=(cx,cy,k,r)=>{const a=k*2.399,d=Math.sqrt(k+.6)*r*.24;return{x:cx+Math.cos(a)*Math.min(d,r*.78),y:cy+Math.sin(a)*Math.min(d,r*.78)*.9}};
  const SEEDC=['#6b4b33','#7d5a3c','#5a3f2a','#8a6a4a','#4e3626'];
  const stats=()=>F.stats(`<span>You <b>${G.st[0]}</b></span><span>${esc(who)} <b>${G.st[1]}</b></span><span>First to 25</span>`);stats();
  F.hint('Tap one of your pits (gold ring). Seeds go anticlockwise.');
  const move=(i,pl)=>{const r=sim(G.b,i,pl);G.anim={pl,from:i,path:r.path,caps:r.caps,step:-1,t:0,hand:G.b[i],phase:'lift'};G.last=i;arcThud(.3)};
  F.cv.addEventListener('pointerdown',e=>{if(G.over||G.anim||G.turn!==0)return;const r=F.cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
    const i=OWN(0).find(k=>{const p=pitXY(k);return Math.hypot(x-p.x,y-p.y)<L.pr*1.15});if(i==null)return;if(!legal(G.b,0).includes(i))return F.say(G.b[i]?'You have to give them seeds: pick a pit that reaches their side':'That pit is empty',1500);F.hint('');move(i,0)});
  const ai=()=>{const ms=legal(G.b,1);if(!ms.length)return endCheck(true);let best=null,bs=-1e9;ms.forEach(m=>{const r=sim(G.b,m,1),rep=legal(r.b,0).reduce((mx,q)=>Math.max(mx,sim(r.b,q,0).cap),0),sc=r.cap*1.2-rep*.9+Math.random()*1.4;if(sc>bs){bs=sc;best=m}});move(best,1)};
  const endCheck=(stuck)=>{const pl=G.turn;if(G.st[0]>=25||G.st[1]>=25||stuck||!legal(G.b,pl).length){if(!legal(G.b,pl).length){/* no moves: the other side keeps what's left on theirs */OWN(1-pl).forEach(i=>{G.st[1-pl]+=G.b[i];G.b[i]=0});stats()}
      G.over=true;F.over=true;const [a,b]=G.st,won=a>b,draw=a===b;setTimeout(()=>{mgEnd(n,won,draw,'oware');F.end(`<div style="font-size:44px">${won?'🏆':draw?'🤝':'🟤'}</div><h3>${won?'You win!':draw?'Draw!':esc(who)+' wins'}</h3><p style="font-size:22px"><b>${a}</b> – <b>${b}</b></p>`)},700);return true}return false};
  F.loop(dt=>{const A=G.anim;G.flies.forEach(f=>f.t+=dt*2.2);G.flies=G.flies.filter(f=>{if(f.t>=1){G.st[f.pl]++;stats();return false}return true});G.pops.forEach(p=>p.t+=dt);G.pops=G.pops.filter(p=>p.t<1.2);
    if(A){A.t+=dt;if(A.phase==='lift'&&A.t>.35){A.phase='sow';A.t=0;G.b[A.from]=0}
      else if(A.phase==='sow'&&A.t>.2){A.t=0;A.step++;if(A.step<A.path.length){G.b[A.path[A.step]]++;A.hand--;arcSnd(500+A.step*25,.05,.08,'triangle')}else{A.phase='cap';A.ci=0}}
      else if(A.phase==='cap'&&A.t>.35){A.t=0;if(A.ci<A.caps.length){const k=A.caps[A.ci++],c=G.b[k];G.b[k]=0;const p=pitXY(k);for(let s=0;s<c;s++)G.flies.push({x:p.x,y:p.y,pl:A.pl,t:-s*.06});G.pops.push({x:p.x,y:p.y,txt:'+'+c,pl:A.pl,t:0});arcSnd(880,.12,.12)}
        else if(!G.flies.length){G.anim=null;G.turn=1-A.pl;if(!endCheck()){if(G.turn===1){F.say(`${esc(who)}'s turn`,700);setTimeout(()=>{if(!F.dead&&!G.over)ai()},900)}else F.hint('Your turn: tap a pit')}}}}
    draw()});
  const draw=()=>{const c=F.ctx,W=F.w,H=F.h;F.layer('bg',x=>{x.fillStyle='#1b120c';x.fillRect(0,0,W,H);const g=x.createRadialGradient(W/2,L.cy,20,W/2,L.cy,W*.9);g.addColorStop(0,'rgba(232,178,74,.12)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,W,H);
      const bx=L.vert?L.colL-L.pr*1.35:L.x0-12,bw=L.vert?L.colR-L.colL+L.pr*2.7:L.W+24,by=L.vert?L.cy-L.pr*6.5:L.top-L.pr*1.45,bh=L.vert?L.pr*13:L.bot-L.top+L.pr*2.9;const wg=x.createLinearGradient(0,by,0,by+bh);wg.addColorStop(0,'#8a5a2e');wg.addColorStop(.5,'#a06a36');wg.addColorStop(1,'#7a4c26');x.fillStyle=wg;x.beginPath();x.roundRect?x.roundRect(bx,by,bw,bh,24):x.rect(bx,by,bw,bh);x.fill();
      x.strokeStyle='rgba(0,0,0,.25)';x.lineWidth=1;for(let i=0;i<14;i++){x.beginPath();x.moveTo(bx+8,by+bh*(i+.5)/14);x.bezierCurveTo(bx+bw*.3,by+bh*(i+.3)/14,bx+bw*.7,by+bh*(i+.8)/14,bx+bw-8,by+bh*(i+.5)/14);x.stroke()}
      for(let i=0;i<12;i++){const p=pitXY(i),pg=x.createRadialGradient(p.x-L.pr*.2,p.y-L.pr*.3,L.pr*.1,p.x,p.y,L.pr);pg.addColorStop(0,'#3a2412');pg.addColorStop(1,'#5e3a1c');x.fillStyle=pg;x.beginPath();x.ellipse(p.x,p.y,L.pr,L.pr*.9,0,0,7);x.fill();x.strokeStyle='rgba(255,220,160,.18)';x.lineWidth=2;x.stroke()}
      [0,1].forEach(pl=>{const y=L.store[pl];x.fillStyle='rgba(122,76,38,.85)';x.beginPath();x.roundRect?x.roundRect(L.x0+L.W*.2,y-L.pr*.8,L.W*.6,L.pr*1.6,L.pr*.8):x.rect(L.x0+L.W*.2,y-L.pr*.8,L.W*.6,L.pr*1.6);x.fill();x.fillStyle='rgba(255,255,255,.55)';x.font='800 10px system-ui';x.textAlign='center';x.fillText(pl?String(who).toUpperCase()+'\'S STORE':'YOUR STORE',W/2,y-L.pr*.95)})});
    const myTurn=G.turn===0&&!G.anim&&!G.over,lg=myTurn?legal(G.b,0):[];
    for(let i=0;i<12;i++){const p=pitXY(i),cnt=G.b[i];if(lg.includes(i)){c.strokeStyle='rgba(255,211,77,.8)';c.lineWidth=2.5;c.beginPath();c.ellipse(p.x,p.y,L.pr*1.05,L.pr*.95,0,0,7);c.stroke()}
      if(G.anim&&G.anim.phase==='sow'&&G.anim.path[G.anim.step]===i){c.fillStyle='rgba(255,211,77,.18)';c.beginPath();c.ellipse(p.x,p.y,L.pr,L.pr*.9,0,0,7);c.fill()}
      for(let k=0;k<Math.min(cnt,22);k++){const s=seedXY(p.x,p.y,k,L.pr);seed(c,s.x,s.y,L.pr*.17,SEEDC[(i*7+k)%5])}
      c.font=`800 ${Math.round(L.pr*.55)}px system-ui`;c.textAlign='center';c.textBaseline='middle';const lb=labXY(i,p);
      c.fillStyle='rgba(0,0,0,.45)';c.beginPath();c.arc(lb.x,lb.y,L.pr*.42,0,7);c.fill();c.fillStyle=cnt?'#ffe8b8':'rgba(255,255,255,.35)';c.fillText(cnt,lb.x,lb.y+1)}
    [0,1].forEach(pl=>{const y=L.store[pl],n2=G.st[pl];for(let k=0;k<Math.min(n2,48);k++){const col=k%16,row=Math.floor(k/16);seed(c,L.x0+L.W*.24+col*(L.W*.52/15),y-L.pr*.35+row*L.pr*.35,L.pr*.15,SEEDC[k%5])}
      c.fillStyle='#ffe8b8';c.font=`900 ${Math.round(L.pr*.7)}px system-ui`;c.textAlign='left';c.fillText(n2,L.x0+L.W*.83,y+2)});
    /* the hand: seeds being carried round, with the count left */
    const A=G.anim;if(A&&A.hand>0){const prev=A.step<0?A.from:A.path[A.step],next=A.path[Math.min(A.path.length-1,A.step+1)],a=pitXY(prev),b=pitXY(next),t=A.phase==='lift'?0:Math.min(1,A.t/.2),hx=a.x+(b.x-a.x)*t,hy=a.y+(b.y-a.y)*t-L.pr*1.1;
      for(let k=0;k<Math.min(A.hand,12);k++){const s=seedXY(hx,hy,k,L.pr*.8);seed(c,s.x,s.y,L.pr*.17,SEEDC[k%5])}c.fillStyle='#ffd34d';c.font=`900 ${Math.round(L.pr*.6)}px system-ui`;c.textAlign='center';c.fillText(A.hand,hx,hy-L.pr*.85)}
    G.flies.forEach(f=>{if(f.t<0)return;const t=Math.min(1,f.t),tx=L.x0+L.W*.5,ty=L.store[f.pl],x=f.x+(tx-f.x)*t,y=f.y+(ty-f.y)*t-Math.sin(t*Math.PI)*L.pr*1.5;seed(c,x,y,L.pr*.17,'#7d5a3c')});
    G.pops.forEach(p=>{c.globalAlpha=Math.max(0,1-p.t);c.fillStyle=p.pl?'#ff8a7d':'#7dff8a';c.font=`900 ${Math.round(L.pr*.8)}px system-ui`;c.textAlign='center';c.fillText(p.txt,p.x,p.y-L.pr-p.t*30);c.globalAlpha=1});
    if(G.turn===1&&!G.anim&&!G.over){c.fillStyle='rgba(255,255,255,.7)';c.font='700 13px system-ui';c.textAlign='center';c.fillText(`${who} is thinking…`,W/2,L.store[1]-L.pr*1.6)}};
  const seed=(c,x,y,r,col)=>{c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(x+r*.25,y+r*.35,r,r*.8,0,0,7);c.fill();const g=c.createRadialGradient(x-r*.35,y-r*.4,r*.1,x,y,r);g.addColorStop(0,'#c9a27a');g.addColorStop(1,col);c.fillStyle=g;c.beginPath();c.ellipse(x,y,r,r*.85,.4,0,7);c.fill()};
  return F};
/* Oware lives in the rooms: no more Oware at the arcade, and "Let's play Oware" only in a room */
ARC_GAMES.splice(ARC_GAMES.findIndex(g=>g[0]==='oware'),1);
/* (romance rules) keep romance opposite-gender only: after every chat, every hour and on load */
{const _sa=socialAct;socialAct=function(){const r=_sa.apply(this,arguments);romanceSanitize();return r}}
{const _hr=hourly;hourly=function(){const r=_hr.apply(this,arguments);try{const hk=day()*24+Math.floor(hour());if(S&&S._rsH!==hk){S._rsH=hk;romanceSanitize()}}catch(e){}return r}}
{const _sg=showGame;showGame=function(){romanceSanitize();return _sg.apply(this,arguments)}}
{const _ds=dateScene;dateScene=function(n){if(!romOK(n))return toast(`${n.name.split(' ')[0]} is your friend. Dates are for someone you like 😉`);return _ds.apply(this,arguments)}}
