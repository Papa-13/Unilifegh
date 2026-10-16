/* ================= splash FX, ripples, sport & swim simulations ================= */
const FXP=(()=>{const N=280,pos=new Float32Array(N*3),vel=new Float32Array(N*3),life=new Float32Array(N);for(let i=0;i<N;i++)pos[i*3+1]=-60;
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d'),gr=g.createRadialGradient(16,16,1,16,16,16);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(1,'rgba(220,240,255,0)');g.fillStyle=gr;g.fillRect(0,0,32,32);
  const pts=new THREE.Points(geo,new THREE.PointsMaterial({map:new THREE.CanvasTexture(c),size:.14,transparent:true,depthWrite:false,color:0xeaf7ff}));pts.frustumCulled=false;scene.add(pts);
  const rings=[];for(let i=0;i<22;i++){const m=new THREE.Mesh(new THREE.RingGeometry(.82,1,40),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.5,depthWrite:false}));m.rotation.x=-Math.PI/2;m.visible=false;scene.add(m);rings.push({m,t:0,life:1,size:1})}
  let ni=0,ri=0;
  return{splash(X,Y,Z,n=24,pow=1){for(let k=0;k<n;k++){const i=ni;ni=(ni+1)%N;pos[i*3]=X+R(-.15,.15);pos[i*3+1]=Y;pos[i*3+2]=Z+R(-.15,.15);const a=Math.random()*6.283,sp=R(.3,1.5)*pow;vel[i*3]=Math.cos(a)*sp;vel[i*3+1]=R(1.2,3.6)*pow;vel[i*3+2]=Math.sin(a)*sp;life[i]=R(.5,1.1)}},
    ring(X,Y,Z,size=1,lf=1.4){const r=rings[ri];ri=(ri+1)%rings.length;r.m.position.set(X,Y,Z);r.t=0;r.life=lf;r.size=size;r.m.visible=true},
    step(dt){for(let i=0;i<N;i++){if(life[i]<=0)continue;life[i]-=dt;vel[i*3+1]-=9.8*dt;pos[i*3]+=vel[i*3]*dt;pos[i*3+1]+=vel[i*3+1]*dt;pos[i*3+2]+=vel[i*3+2]*dt;if(life[i]<=0||pos[i*3+1]<.1){pos[i*3+1]=-60;life[i]=0}}
      geo.attributes.position.needsUpdate=true;
      rings.forEach(r=>{if(!r.m.visible)return;r.t+=dt;const k=r.t/r.life;if(k>=1){r.m.visible=false;return}const sc=r.size*(.25+k*1.5);r.m.scale.set(sc,sc,sc);r.m.material.opacity=.5*(1-k)*(1-k)})}}})();
let SWIMT=0;
function swimFX(dt){SWIMT+=dt;if(SWIMT<.32)return;SWIMT=0;const L=[P(),...S.npcs,...DECOR];if(S.busy&&S.busy.game&&S.busy.game.swimmers)L.push(...S.busy.game.swimmers);
  L.forEach(c=>{if(c&&c.pose==='swim'&&c.mesh&&c.mesh.visible&&!c.hidden){const m=c.mesh.position,ry=c.mesh.rotation.y;FXP.ring(m.x,.285,m.z,.55,1.6);if(Math.random()<.6)FXP.splash(m.x-Math.sin(ry)*.75,.3,m.z-Math.cos(ry)*.75,5,.45);if(Math.random()<.35)FXP.splash(m.x+Math.sin(ry)*.2,.3,m.z+Math.cos(ry)*.2,3,.35)}})}
function makeBall(kind){const c=document.createElement('canvas');c.width=256;c.height=128;const x=c.getContext('2d');
  if(kind==='foot'){x.fillStyle='#f7f7f3';x.fillRect(0,0,256,128);x.fillStyle='#161616';for(let i=0;i<16;i++){const cx=(i%8)*32+16+(i>7?16:0),cy=i>7?92:36;x.beginPath();for(let k=0;k<5;k++){const a=k/5*6.283-1.57;x.lineTo(cx+Math.cos(a)*10,cy+Math.sin(a)*10)}x.fill()}}
  else{x.fillStyle='#d9661f';x.fillRect(0,0,256,128);x.strokeStyle='#1a120c';x.lineWidth=3;[0,64,128,192].forEach(v=>{x.beginPath();x.moveTo(v,0);x.lineTo(v,128);x.stroke()});x.beginPath();x.moveTo(0,64);x.lineTo(256,64);x.stroke()}
  const r=kind==='foot'?.11:.12,m=new THREE.Mesh(new THREE.SphereGeometry(r,20,14),new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c),roughness:kind==='foot'?.45:.75}));m.castShadow=SHADOWS;scene.add(m);
  const sh=new THREE.Mesh(new THREE.PlaneGeometry(.4,.4),shadowM());sh.rotation.x=-Math.PI/2;scene.add(sh);return{m,sh,r}}
function vest(c,col){const v=new THREE.Mesh(new THREE.CylinderGeometry(.212,.196,.4,18,1,true),new THREE.MeshStandardMaterial({color:col,roughness:.8,side:THREE.DoubleSide}));v.position.y=1.15;v.scale.z=.8;c.mesh.add(v);return v}
function borrowNPCs(n,near){const p=P(),bd=buddy();const pool=S.npcs.filter(x=>x!==bd&&!x.mirror&&!(x.with>S.min)&&!x.mate).sort((a,b)=>dist(a,near)-dist(b,near)).slice(0,n);
  return pool.map(x=>{x._save={x:x.x,y:x.y,hidden:x.hidden,pose:x.pose,face:x.face,spotY:x.spotY};x.mirror=true;x.hidden=false;x.pose=null;x.face=null;x.spotY=0;x.path=null;return x})}
function returnNPCs(L){L.forEach(x=>{const s=x._save;if(!s)return;x.mirror=false;x.fast=false;x.gest=null;x.pose=null;x.face=null;x.spotY=0;x.x=s.x;x.y=s.y;x.hidden=s.hidden;x.path=null;x.needPath=true;delete x._save;unstick(x)})}
function stepToward(c,tx,ty,spd,dt){const dx=tx-c.x,dy=ty-c.y,d=Math.hypot(dx,dy);if(d<3){c.fast=false;return d}const st=Math.min(d,spd*dt);c.x+=dx/d*st;c.y+=dy/d*st;c.fast=d>14;return d}
function sportGame(kind){
  const FB=kind==='football',p=P(),id=FB?'field':'court',T=(x,y)=>TA(id,x,y);
  const a0=FB?T(835,702):T(1527,1047),a1=FB?T(1165,918):T(1753,1233),X0=a0.x+4,X1=a1.x-4,Y0=a0.y+4,Y1=a1.y-4,CX=(X0+X1)/2,CY=(Y0+Y1)/2;
  const hoop=[T(1745-15,1140),T(1535+15,1140)]; // hoop each team attacks: team0 -> right
  const bd=buddy(),fit=p.fit||0;let per=FB?4:3;
  const RO=S.sportRoster;S.sportRoster=null;const solo=!!RO&&!RO.length&&!bd;
  const team0=[p];if(bd&&!IS){team0.push(bd);bd.mirror=true;bd._save={x:bd.x,y:bd.y,hidden:false,pose:bd.pose,face:bd.face,spotY:bd.spotY}}
  const take=L=>L.map(x=>{x._save={x:x.x,y:x.y,hidden:x.hidden,pose:x.pose,face:x.face,spotY:x.spotY};x.mirror=true;x.hidden=false;x.pose=null;x.face=null;x.spotY=0;x.path=null;return x});
  if(RO){per=Math.max(1,Math.min(FB?4:3,Math.ceil((RO.length+team0.length)/2)))}
  const borrowed=RO?take(RO.slice(0,per*2-team0.length)):borrowNPCs(per*2-team0.length,{x:CX,y:CY});const lent=[...borrowed];
  while(team0.length<per&&borrowed.length)team0.push(borrowed.shift());const team1=borrowed.slice(0,per);
  const pls=[];team0.forEach((c,i)=>pls.push({c,t:0,i,keeper:FB&&per>=3&&i===per-1&&c!==p&&c!==bd}));team1.forEach((c,i)=>pls.push({c,t:1,i,keeper:FB&&(per>=3||solo)&&i===per-1}));
  if(FB&&per>=3&&!pls.some(q=>q.t===0&&q.keeper)){const k=pls.filter(q=>q.t===0&&q.c!==p).pop();if(k)k.keeper=true}
  const vests=pls.map(q=>vest(q.c,q.t?0x2f6bb5:0xf2c230));
  const B=makeBall(FB?'foot':'basket'),ball={x:CX,y:CY,z:FB?0:1,vx:0,vy:0,vz:0,owner:null,last:null,fly:null};
  const score=[0,0];let pause=0,clock=0,kick=0,info='Kick-off',shots=0,myGoals=0;
  const home=q=>{const dir=q.t?-1:1,w=(X1-X0)/2;if(q.keeper)return{x:q.t?X1-14:X0+14,y:CY};const slots=FB?[[-.45,-.35],[-.1,.35],[.35,0],[-.3,.1]]:[[-.15,-.45],[.25,.3],[-.35,.35]];const s=slots[q.i%slots.length];return{x:CX+dir*s[0]*w,y:CY+s[1]*(Y1-Y0)/2}};
  pls.forEach(q=>{const h=home(q);q.c.x=h.x+R(-8,8);q.c.y=h.y+R(-8,8);q.cd=0;q.c.fast=false;q.c.pose=null;q.c.gest=null});
  p.pose=null;p.face=null;p.spotY=0;
  const kickoff=t=>{ball.x=CX;ball.y=CY;ball.z=FB?0:1;ball.vx=ball.vy=ball.vz=0;ball.fly=null;ball.owner=null;pause=.9;
    if(!FB){const q=pls.filter(q=>q.t===t).sort((a,b)=>Math.hypot(a.c.x-CX,a.c.y-CY)-Math.hypot(b.c.x-CX,b.c.y-CY))[0];if(q){q.c.x=CX-(t?-12:12);q.c.y=CY;ball.owner=q}}};
  kickoff(Math.random()<.5?0:1);
  const spd=q=>(q.c===p?165+fit*1.5:q.c===bd?160:150)*(q.keeper?.75:1);
  const nameOf=c=>c===p?'You':c.name||'Someone';
  const goal=(t,who,pts=1)=>{score[t]+=pts;const mine=t===0;if(who&&who.c===p)myGoals++;const nm=who?nameOf(who.c):'Someone';info=FB?`⚽ GOAL! ${nm} ${who&&who.c===p?'score':'scores'}`:`🏀 ${nm} ${who&&who.c===p?'score':'scores'}`;
    pls.forEach(q=>{if(q.t===t)setGest(q.c,q===who?'celebrate':pick(['cheer','clap','celebrate']),FB?2.2:1.3);else if(FB)setGest(q.c,pick(['sad','facepalm','cross']),1.8)});
    if(FB){pause=2.6;ball.vx*=.2;ball.vy*=.2}else pause=.4;if(FB)toast(`${info}. ${score[0]}–${score[1]}`)};
  const g={kind,score,hud:()=>solo?`${FB?'🥅 Shooting practice':'🏀 Shooting hoops'} · ${myGoals} ${FB?(myGoals===1?'goal':'goals'):(myGoals===1?'basket':'baskets')}${pause>0&&info?` · ${info}`:''}`:`${FB?'⚽':'🏀'} ${FB?'Pickup football':per===3?'3-on-3 basketball':`${per}-a-side basketball`} · Gold ${score[0]} – ${score[1]} Blue${pause>0&&info?` · ${info}`:''}`,
    focus:()=>({x:ball.x*.6+p.x*.4,y:ball.y*.6+p.y*.4}),zoomOut:1.3,dbg:()=>pls,
    step(dt){clock+=dt;kick-=dt;
      const bx=ball.x,by=ball.y;
      if(pause>0){pause-=dt;if(pause<=0&&ball.reset!=null){kickoff(ball.reset);ball.reset=null}}
      // ---- ball ----
      if(ball.fly){const f=ball.fly;f.t+=dt;const k=Math.min(1,f.t/f.T);ball.x=f.x0+(f.x1-f.x0)*k;ball.y=f.y0+(f.y1-f.y0)*k;ball.z=f.z0+(f.z1-f.z0)*k+4*f.h*k*(1-k);
        if(k>=1){ball.fly=null;if(f.make){ball.vx=R(-5,5);ball.vy=R(-5,5);ball.vz=-1;ball.z=2.2;goal(f.team,f.by,f.pts);ball.reset=1-f.team;pause=1.1}
          else if(f.pass){const tq=f.to;if(tq&&Math.hypot(tq.c.x-ball.x,tq.c.y-ball.y)<16){ball.owner=tq;}else{ball.vx=(f.x1-f.x0)/f.T*.3;ball.vy=(f.y1-f.y0)/f.T*.3;ball.vz=0}}
          else{ball.vx=R(-90,90);ball.vy=R(-90,90);ball.vz=R(1.5,3);setExpr(f.by.c,'frown',1.5)}}}
      else if(ball.owner){const o=ball.owner.c,ry=o.mesh.rotation.y;ball.x=o.x+Math.sin(ry+.9)*11;ball.y=o.y+Math.cos(ry+.9)*11;ball.z=FB?0:Math.abs(Math.sin(clock*7.5))*.85;ball.vx=ball.vy=0;if(!o.gest||o.gest.k!=='dribbleArm')setGest(o,'dribbleArm',60)}
      else{ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;ball.z+=ball.vz*dt;ball.vz-=9.8*dt;if(ball.z<=0){ball.z=0;if(ball.vz<-1.2)ball.vz=-ball.vz*.5;else ball.vz=0}
        const fr=Math.exp(-(ball.z>0?.25:FB?1.1:1.6)*dt);ball.vx*=fr;ball.vy*=fr;
        if(ball.y<Y0||ball.y>Y1){ball.vy=-ball.vy*.6;ball.y=clamp(ball.y,Y0,Y1)}
        if(FB&&(ball.x>X1||ball.x<X0)){const t=ball.x>X1?0:1;if(Math.abs(ball.y-CY)<30&&ball.z<.85&&pause<=0){goal(t,ball.last&&ball.last.t===t?ball.last:null);ball.reset=1-t;ball.vx*=.1}else{ball.vx=-ball.vx*.5;const kp=pls.find(q=>q.keeper&&q.t===(ball.x>X1?1:0));if(kp&&pause<=0){ball.x=kp.c.x+(kp.t?-8:8);ball.y=kp.c.y;ball.vx=ball.vy=0}}ball.x=clamp(ball.x,X0-4,X1+4)}
        if(!FB)ball.x=clamp(ball.x,X0,X1)}
      // ---- players ----
      if(pause<=0||FB)(Math.random()<.5?pls:[...pls].reverse()).forEach(q=>{const c=q.c,dir=q.t?-1:1;q.cd-=dt;const free=clock-(ball.kt??-9)>.3;let tx,ty,sp=spd(q);
        if(FB){
          const myTeam=pls.filter(o=>o.t===q.t&&!o.keeper),chaser=myTeam.sort((a,b)=>Math.hypot(a.c.x-ball.x,a.c.y-ball.y)-Math.hypot(b.c.x-ball.x,b.c.y-ball.y))[0];
          if(q.keeper){tx=q.t?X1-12:X0+12;ty=clamp(ball.y,CY-26,CY+26);const d2=Math.hypot(ball.x-c.x,ball.y-c.y);
            if(d2<20&&Math.sign(ball.vx)===-dir&&Math.abs(ball.vx)>60&&q.cd<=0){q.cd=1;ball.kt=clock;if(Math.random()<.55){ball.vx=-ball.vx*.45;ball.vy=R(-120,120);setGest(c,'save',.9);c.gest.side=ball.y>c.y?1:-1;info=`🧤 Save by ${nameOf(c)}!`;pause=Math.max(pause,0)}}
            if(d2<10&&Math.hypot(ball.vx,ball.vy)<50&&q.cd<=0&&free){q.cd=.8;ball.kt=clock;const tg=pick(myTeam);const a=Math.atan2(tg.c.y-ball.y,tg.c.x-ball.x);ball.vx=Math.cos(a)*380;ball.vy=Math.sin(a)*380;ball.vz=3;ball.last=q;setGest(c,'strike',.4)}
            if(!c.gest||c.gest.end-performance.now()/1000<.05)setGest(c,'keeper',.6,null)}
          else if(q===chaser&&pause<=0){tx=ball.x+ball.vx*.25-dir*6;ty=ball.y+ball.vy*.25;
            if(Math.hypot(ball.x-c.x,ball.y-c.y)<12&&ball.z<.6&&q.cd<=0&&free){q.cd=.55;ball.kt=clock;
              const gx=q.t?X0:X1,dg=Math.abs(gx-ball.x),mates=pls.filter(o=>o.t===q.t&&o!==q&&!o.keeper&&(o.c.x-ball.x)*dir>10);
              let ax,ay,pw,lob=0;
              if(dg>150&&mates.length&&Math.random()<.5){const m=pick(mates);ax=m.c.x+dir*20;ay=m.c.y;pw=Math.min(430,160+Math.hypot(ax-ball.x,ay-ball.y)*1.4)}
              else if(dg<190){ax=gx;ay=CY+R(-26,26);pw=520+fit*3;shots++}
              else{ax=ball.x+dir*90;ay=clamp(ball.y+R(-40,40),Y0+10,Y1-10);pw=200}
              if(dg>230&&Math.random()<.3)lob=3.4;
              const a=Math.atan2(ay-ball.y,ax-ball.x)+R(-.1,.1)*(q.c===p?.7:1);ball.vx=Math.cos(a)*pw;ball.vy=Math.sin(a)*pw;ball.vz=lob;ball.last=q;setGest(c,'strike',.38,null)}}
          else{const h=home(q),push=(ball.x-CX)*.55;tx=h.x+push;ty=h.y+(ball.y-CY)*.3;sp*=.8}
        }else{
          const atk=q.t===(ball.owner?ball.owner.t:-1),hp=hoop[q.t],ownH=hoop[1-q.t];
          if(ball.owner===q){const dh=Math.hypot(hp.x-c.x,hp.y-c.y),def=pls.filter(o=>o.t!==q.t).sort((a,b)=>dist(a.c,c)-dist(b.c,c))[0],press=def&&dist(def.c,c)<16;
            tx=hp.x-dir*70;ty=CY+(q.i-1)*40;
            if(q.cd<=0&&((dh<170&&Math.random()<dt*1.6)||dh<60)){q.cd=1.2;shots++;const d3=dh,pr=clamp(.6-d3/700+fit*.01+(c===p?.05:0)-(press?.15:0),.12,.85),make=Math.random()<pr;
              setGest(c,'shoot',.7,null);ball.owner=null;c.gest=null;setGest(c,'shoot',.7);ball.fly={x0:c.x,y0:c.y,z0:2.1,x1:hp.x+(make?0:R(-6,6)),y1:hp.y+(make?0:R(-6,6)),z1:make?2.3:2.4,h:1.1+d3*.004,T:.75+d3/700,t:0,make,team:q.t,by:q,pts:d3>200?3:2}}
            else if(press&&q.cd<=0&&Math.random()<dt*1.4){const m=pick(pls.filter(o=>o.t===q.t&&o!==q));if(m){q.cd=.8;ball.owner=null;c.gest=null;ball.fly={x0:c.x,y0:c.y,z0:1.1,x1:m.c.x,y1:m.c.y,z1:1.1,h:.25,T:.45,t:0,pass:true,to:m,by:q}}}}
          else if(!ball.owner&&!ball.fly){tx=ball.x;ty=ball.y;if(Math.hypot(ball.x-c.x,ball.y-c.y)<10&&ball.z<2.2){ball.owner=q;ball.vz=0}}
          else if(atk){const k2=q.i;tx=hp.x-dir*(60+k2*30);ty=CY+(k2-1)*55;sp*=.85}
          else{const mk=pls.filter(o=>o.t!==q.t)[q.i%per];if(mk){const tgt=mk===ball.owner?.82:.6;tx=mk.c.x+(ownH.x-mk.c.x)*(1-tgt)*.5;ty=mk.c.y+(ownH.y-mk.c.y)*(1-tgt)*.5;
            if(mk===ball.owner&&dist(mk.c,c)<20){if(!c.gest||c.gest.k!=='guard')setGest(c,'guard',.8,null);if(Math.random()<dt*.18&&ball.owner){ball.owner.c.gest=null;ball.owner=q;info=`🔁 Steal by ${nameOf(c)}`}}}}
          if(ball.owner!==q&&c.gest&&c.gest.k==='dribbleArm')c.gest=null}
        if(tx!=null){tx=clamp(tx,X0-2,X1+2);ty=clamp(ty,Y0,Y1);const d=stepToward(c,tx,ty,sp,dt);if(d<3)c.face=Math.atan2(ball.x-c.x,ball.y-c.y);else c.face=null}});
      // ---- meshes ----
      const X=wx(ball.x),Z=wz(ball.y);B.m.position.set(X,ball.z+B.r,Z);B.sh.position.set(X,.02,Z);const s2=Math.max(.4,1-ball.z*.25);B.sh.scale.set(s2,s2,1);
      const mvx=(ball.x-bx)*U,mvz=(ball.y-by)*U;B.m.rotation.x+=mvz/B.r;B.m.rotation.z-=mvx/B.r;
      if(!FB&&ball.owner&&ball.z<.06&&Math.random()<.5){}},
    end(){B.m.parent.remove(B.m);B.sh.parent.remove(B.sh);vests.forEach(v=>v.parent&&v.parent.remove(v));pls.forEach(q=>{q.c.gest=null;q.c.fast=false;q.c.face=null});
      returnNPCs(lent);if(bd){bd.fast=false;bd.gest=null;bd.mirror=false;bd.x=p.x+22;bd.y=p.y+8;bd.face=null;bd.pose=null;unstick(bd);bd.path=null}
      const w=score[0]>score[1]?1:score[0]<score[1]?-1:0;team0.forEach(c=>{if(c!==p&&c.friend!=null)c.friend=clamp(c.friend+(w>0?5:2))});
      if(solo)return{win:0,solo:1,txt:`Practice done · ${myGoals} ${FB?'goals':'baskets'}. Your touch is getting better 💪`};
      return{win:w,txt:`Full time · Gold (your side) ${score[0]} – ${score[1]} Blue${w>0?' · You won! 🎉':w<0?' · You lost 😩':' · Draw'}${myGoals?` · you scored ${myGoals}`:''}`}}};
  return g}
function swimGame(){const p=P(),T=(x,y)=>TA('pool',x,y),bd=buddy();
  const lanes=[1341,1363,1386,1408],L0=T(1226,lanes[1]),ent=T(1262,lanes[1]),ladder=T(1391,1408),out=T(1391,1432),Xa=T(1250,0).x,Xb=T(1392,0).x;
  const sw=[{c:p,lane:T(0,lanes[1]).y,off:0}];if(bd&&!IS){bd.mirror=true;bd._save={x:bd.x,y:bd.y,hidden:false,pose:bd.pose,face:bd.face,spotY:bd.spotY};sw.push({c:bd,lane:T(0,lanes[2]).y,off:.35})}
  sw.forEach((o,i)=>swimSuit(o.c,true,i===0));
  const st=sw.map(o=>({x0:o.c.x,y0:o.c.y,dir:1,ph:'walk',x:0}));let t=0,DUR=1e9,outT=0;const prog=()=>S.busy&&S.busy.timed?clamp((S.min-S.busy.timed.start)/S.busy.timed.mins,0,1):0;
  const g={kind:'swim',swimmers:sw.map(o=>o.c),hud:()=>'🏊 Swimming laps'+(t>DUR-2.6?' · climbing out':''),focus:()=>({x:p.x,y:p.y}),zoomOut:1.05,
    step(dt){t+=dt;if(DUR>1e8&&prog()>=.86)DUR=t+2.6;sw.forEach((o,i)=>{const c=o.c,s=st[i],k=t-o.off,y0=o.lane,sx=L0.x,ex=ent.x;
      if(k<0)return;
      if(k<.8){const f=k/.8;c.x=s.x0+(sx-s.x0)*f;c.y=s.y0+(y0-s.y0)*f;c.pose=null;c.fast=false;c.face=Math.PI/2;return}
      if(k<1.55){const f=(k-.8)/.75;if(s.ph!=='dive'){s.ph='dive';setExpr(c,'surprised',.8)}c.pose='dive';c.x=sx+(ex-sx)*f;c.y=y0;c.face=Math.PI/2;c.mesh.rotation.y=Math.PI/2;c.diveY=.15+1.0*Math.sin(Math.PI*f)-f*.2;c.diveRot=f*2.0;return}
      if(s.ph==='dive'){s.ph='swim';const m=c.mesh.position;FXP.splash(m.x,.3,m.z,46,1.25);FXP.ring(m.x,.285,m.z,1.1,1.8);FXP.ring(m.x,.285,m.z,.6,1.2);c.diveRot=0;c.diveY=0;s.x=ex}
      if(k<DUR-2.6){c.pose='swim';c.face=null;s.x+=s.dir*92*dt;if(s.x>Xb){s.x=Xb;s.dir=-1;const m=c.mesh.position;FXP.splash(m.x,.3,m.z,14,.7)}if(s.x<Xa){s.x=Xa;s.dir=1;const m=c.mesh.position;FXP.splash(m.x,.3,m.z,14,.7)}c.x=s.x;c.y=y0;return}
      if(k<DUR-1.4){c.pose='swim';const tx=ladder.x-(i?24:0),ty=ladder.y;stepToward(c,tx,ty,95,dt);return}
      if(k<DUR-.5){const f=(k-(DUR-1.4))/.9;if(s.ph!=='climb'){s.ph='climb'}c.pose='climb';c.face=0;c.x=ladder.x-(i?24:0);c.y=ladder.y+(out.y-ladder.y)*f;c.spotY=-.75+f*.75;return}
      if(s.ph!=='out'){s.ph='out';c.spotY=0;c.pose=null;setGest(c,'shake',.7,'smile');const m=c.mesh.position;FXP.splash(m.x,1.2,m.z,10,.3)}})},
    end(){sw.forEach((o,i)=>swimSuit(o.c,false,i===0));sw.forEach(o=>{o.c.pose=null;o.c.diveRot=0;o.c.diveY=0;o.c.spotY=0;o.c.fast=false;o.c.face=null;o.c.gest=null});const q=out;p.x=q.x;p.y=q.y+8;if(bd){bd.fast=false;bd.mirror=false;bd.x=p.x+22;bd.y=p.y+4;unstick(bd);bd.path=null}return{txt:'You climb out dripping and grab your towel 🏊'}}};
  return g}
const GAMES={football:()=>sportGame('football'),basketball:()=>sportGame('basketball'),swim:swimGame};
/* who actually wants to play? ask the people around; if nobody does, you play on your own */
function sportAsk(kind){const FB=kind==='football',p=P(),id=FB?'field':'court',b=BID[id],c={x:b.x+b.w/2,y:b.y+b.h/2},bd=buddy();
  const around=S.npcs.filter(n=>!n.hidden&&!n.mirror&&!n.mate&&n!==bd&&!(n.with>S.min)&&(dist(n,c)<520||(n.plan&&n.plan.b===id))).sort((a,z)=>dist(a,c)-dist(z,c)).slice(0,9);
  S.paused=true;openSheet();let asked=null;
  const draw=()=>{const yes=asked?asked.filter(x=>x.yes).map(x=>x.n):[],team=(bd?[bd]:[]).concat(yes);
    $('sheetIn').innerHTML=`<div class="eyebrow">${FB?'⚽ Sports Field':'🏀 Basketball Court'}</div><h3>${FB?'Pickup football':'Basketball'}: who's playing?</h3>
      <p style="font-size:14px">${around.length?`${around.length} ${around.length===1?'person is':'people are'} around.`:'Nobody else is here right now.'}${bd?` ${esc(bd.name)} is with you and is ready to play.`:''}</p>
      ${asked?`<div class="list">${asked.map(x=>`<div class="item"><div class="grow"><b>${esc(x.n.name)}</b><small>"${esc(x.say)}"</small></div><span class="tag ${x.yes?'g':''}">${x.yes?'In ✅':'Not now'}</span></div>`).join('')||'<p>No one answered.</p>'}</div>`:''}
      <div class="grid2">${!asked&&around.length?`<button class="btn" id="spAsk">🙋 Ask who wants to play</button>`:''}${team.length?`<button class="btn g" id="spGo">${FB?'⚽':'🏀'} Play with ${team.length} ${team.length===1?'person':'people'}</button>`:''}<button class="ghost" id="spSolo">${FB?'🥅 Practise shooting alone':'🏀 Shoot hoops alone'}</button></div>
      <button class="ghost sm" id="bye">Cancel</button>`;
    if($('spAsk'))$('spAsk').onclick=()=>{asked=around.map(n=>{const keen=(n.ints||[]).includes('Football')?.3:0,y=Math.random()<.22+keen+n.friend/300+(hour()>=16&&hour()<19?.15:0)-(n.pers==='shy'?.1:0);
        return{n,yes:y,say:y?pick(['I\'m in! 🔥','Let\'s go!','Okay, one game','Pass me the ball 😤']):pick(['I\'m tired 😮‍💨','Not today, I have assignment','Maybe later','I\'m just watching'])}});advance(3);draw()};
    if($('spGo'))$('spGo').onclick=()=>{closeSheet();S.sportRoster=yes;doAct(FB?'Playing football':'Playing basketball',60,{fun:25,energy:-15,social:8,hygiene:-12});yes.forEach(n=>{n.met=true;n.friend=clamp(n.friend+3)})};
    $('spSolo').onclick=()=>{closeSheet();S.sportRoster=[];doAct(FB?'Practising football alone':'Shooting hoops alone',60,{fun:16,energy:-14,hygiene:-12})};
    $('bye').onclick=closeSheet};
  draw()}
