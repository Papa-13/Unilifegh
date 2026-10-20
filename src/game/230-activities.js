/* ================= activities (play an animation, then apply) ================= */
function animFor(label){const L=label.toLowerCase(),sp=(IS&&IS.spots)||{};
  if(/tidying/.test(L))return{pose:'sweep'};
  if(/scrolling in bed/.test(L))return{pose:'lie',spot:sp.bed};
  if(/beanbag/.test(L))return{pose:'sit',spot:sp.bean};
  if(/fifa/.test(L))return{pose:'type',spot:(IS&&IS.tv&&sp.bean)||sp.desk};
  if(/watching (tv|a movie)/.test(L))return tvAct(sp);
  if(/novel|past questions|reading/.test(L))return{pose:(sp.bean||sp.desk||sp.seat)?'sitRead':'read',spot:sp.bean||sp.desk||sp.seat};
  if(/cold drink/.test(L))return{pose:'drink'};
  if(/in the office/.test(L))return{pose:'sitTalk',spot:sp.seat};
  if(/at the concert/.test(L))return{pose:'cheer',spot:concertSpot()};
  if(/recording the show/.test(L))return{pose:'phone'};
  if(/jama/.test(L))return{pose:'dance2',path:'parade'};
  if(/laps of the parade/.test(L))return{pose:'run',path:'parade'};
  if(/tug of war/.test(L))return{pose:'pull'};
  if(/sack race/.test(L))return{pose:'hop'};
  if(/pageant|hostel games/.test(L))return{pose:'cheer'};
  if(/selling at the bazaar/.test(L))return{pose:'talk'};
  if(/shower/.test(L))return{pose:'shower',spot:sp.shower,water:1};
  if(/bucket bath/.test(L))return{pose:'shower',spot:sp.bucket||sp.shower};
  if(/bathtub/.test(L))return{pose:'lie',spot:sp.tub};
  if(/brushing/.test(L))return{pose:'brush',spot:sp.sink};
  if(/cooking/.test(L))return{pose:'cook',spot:sp.stove};
  if(/dancing at/.test(L))return{pose:'dance2',spot:sp.dance};
  if(/at the bar/.test(L))return{pose:'sitDrink',spot:sp.bar};
  if(/lounge/.test(L))return{pose:'sit',spot:sp.lounge};
  if(/^swimming$/i.test(L)&&!IS)return{pose:'idle',game:'swim'};
  if(/swimming/.test(L))return{pose:'swim',path:'pool'};
  if(/by the pool/.test(L))return{pose:'sit',spot:Object.assign(TA('pool',1320,1447),{ry:Math.PI,ly:-.24})};
  if(/foodstuff/.test(L))return{pose:'talk',spot:Object.assign(TA('market',980,1394),{ry:Math.PI})};
  if(/study|tutor/.test(L))return{pose:'sitWrite',spot:sp.seat||sp.desk};
  if(/eating/.test(L))return{pose:(sp.seat||sp.desk)?'sitEat':'eat',spot:sp.seat||sp.desk};
  if(/playing football|practising football/i.test(L)&&!IS)return{pose:'idle',game:'football'};
  if(/playing basketball|shooting hoops/i.test(L)&&!IS)return{pose:'idle',game:'basketball'};
  if(/football/.test(L))return{pose:'kick'};
  if(/basketball/.test(L))return{pose:'dribble'};
  if(/playing volleyball/.test(L)&&!IS)return{pose:'cheer',spot:(()=>{const b=BID.volley;return{x:b.x+b.w*.3,y:b.y+b.h*.5,ry:-Math.PI/2}})()};
  if(/watching volleyball/.test(L)&&!IS)return{pose:'sit',spot:(()=>{const b=BID.volley;return{x:b.x+b.w*.22,y:b.y+b.h-18,ry:0,ly:.2}})()};
  if(/jogging/.test(L))return{pose:'run',path:'track'};
  if(/walking by the lake/.test(L))return{pose:'walk',path:'lake'};
  if(/working out/.test(L))return{pose:'lift',spot:sp.lift};
  if(/treadmill/.test(L))return{pose:'run',spot:sp.tread};
  if(/at the terminal/.test(L))return{pose:'sit',spot:Object.assign(TA('terminal',520,1322),{ry:0,ly:-.12})};
  if(/relaxing|sitting/.test(L))return{pose:'sit',spot:IS?sp.seat:/bench/.test(L)?Object.assign(TA('square',470,1080),{ry:0,ly:-.12}):Object.assign(TA('garden',150,418),{ry:0,ly:-.12})};
  if(/hanging out|visiting/.test(L))return{pose:'talk'};
  if(/service|quiet time/.test(L))return{pose:'pray',spot:sp.seat};
  if(/check-up/.test(L))return{pose:'lie',spot:sp.bed};
  if(/hair|cut/.test(L))return{pose:'sit',spot:sp.seat};
  if(/typing|printing/.test(L))return{pose:'type',spot:sp.seat};
  if(/counsellor/.test(L))return{pose:'sit',spot:sp.seat};
  if(/vibing/.test(L))return{pose:'dance'};
  if(/watching tv/.test(L))return tvAct(sp);
  if(/sharing flyers|serving/.test(L))return{pose:'talk'};
  if(/rally/.test(L))return{pose:'cheer'};
  if(/nap/.test(L))return{pose:'lie',spot:sp.bed};
  if(/drink|vitamins/.test(L))return{pose:'drink'};
  if(/cooking|shower|shopping|buying/.test(L))return{pose:'idle'};
  return{pose:'idle'}}
function doAct(label,mins,fx){if(!S||S.busy){applyAct(label,mins,fx);return}const a=Object.assign({},animFor(label),{mins,fx});startBusy(label,a,0,()=>{const r=S.lastGame;applyAct(label,mins,fx);if(r){S.lastGame=null;ev('game',r);try{if(S.hallFinal&&!S.hallFinal.done&&r.kind==='football')hallFinalResult(r)}catch(e){console.error(e)}if(r.win>0){S.wins++;addBuff('won');P().needs.fun=clamp(P().needs.fun+8)}setTimeout(()=>toast(r.txt),60)}})}
function startBusy(label,a,dur,done){
  if(IS&&a&&a.spot&&!a._walked&&typeof freeAlt==='function'){const f=freeAlt(a.spot);if(f!==a.spot){a=Object.assign({},a,{spot:f});if(a.spot===f&&IS.spots.seat&&IS.seatList&&IS.seatList.includes(f))IS.spots.seat=f}}
  if(walkFirst(label,a,dur,done))return;
  const p=P();S.busy={label,a,dur,t0:performance.now(),done};$('needCard').hidden=true;if(a.mins)S.busy.timed={mins:Math.max(1,a.mins),fx:a.fx||{},start:S.min,ap:0};S.idleT=0;p.target=null;p.itarget=null;p.pose=a.pose;
  const sp=a.spot;if(sp){if(IS){S.busy.glide={k:'i',x0:p.ix,z0:p.iz,x1:sp.x,z1:sp.z,t:0};p.ix=sp.x;p.iz=sp.z}else{S.busy.glide={k:'o',x0:p.x,z0:p.y,x1:sp.x,z1:sp.y,t:0};p.x=sp.x;p.y=sp.y}p.face=sp.ry??null;p.spotY=sp.ly||0}
  if(a.water&&IS&&IS.water)IS.water.visible=true;
  p.lying=a.pose==='lie';if(p.lying&&!sp){p.lying=false;p.pose='idle'}
  if(!IS&&!a.path)S.npcs.filter(n=>!n.hidden&&dist(n,p)<180&&!(n.with>S.min)).slice(0,3).forEach(n=>n.face=Math.atan2(p.x-n.x,p.y-n.y));
  if(a.game){S.busy.game=GAMES[a.game]();S.busy.gT=performance.now();acts(true);return}
  const bd=buddy();
  if(bd&&!IS&&a.pose!=='lie'){bd.mirror=true;bd.pose=a.pose;bd.path=null;S.busy.buddy=bd;
    if(a.buddySpot){bd.x=a.buddySpot.x;bd.y=a.buddySpot.y;bd.face=a.buddySpot.ry;bd.spotY=a.buddySpot.ly}else if(!a.path){bd.x=p.x+(a.spot?22:28);bd.y=p.y+(a.spot?0:10);bd.face=a.spot?a.spot.ry:p.face;bd.spotY=p.spotY||0}}
  if(IS&&IS.buddy&&a.pose!=='lie'){const q=IS.people.find(q=>q.n===IS.buddy);if(q){S.busy.bq=q;S.busy.bq0={pose:q.pose,x:q.mesh.position.x,z:q.mesh.position.z};const seated=/^sit|type/.test(q.pose);
    if(/^sit|type/.test(a.pose)){if(seated)q.pose=a.pose}else if(a.spot){q.mesh.position.set(a.spot.x+.75,0,a.spot.z+.1);q.mesh.rotation.y=a.spot.ry??q.mesh.rotation.y;q.pose=a.pose;q.spotY=0}}}
  acts(true)}
function finishBusy(){const b=S.busy;if(b.game){try{S.lastGame=b.game.end();if(S.lastGame)S.lastGame.kind=b.game.kind}catch(e){console.error(e)}}S.busy=null;const p=P();if(IS&&IS.water)IS.water.visible=false;
  if(b.buddy){const n=b.buddy;n.mirror=false;n.pose=null;n.spotY=0;n.face=null;n.x=clamp(p.x+22,20,MW-20);n.y=p.y+8;unstick(n);n.path=null;togetherBonus(n,3)}
  if(b.bq){const q=b.bq;q.pose=b.bq0.pose;q.mesh.position.x=b.bq0.x;q.mesh.position.z=b.bq0.z;if(IS&&IS.buddy)togetherBonus(IS.buddy,3)}
  if(b.a.spot&&p.lying&&IS){p.ix=b.a.spot.x-.95;p.iz=b.a.spot.z-.9}
  p.pose=null;p.lying=false;p.spotY=0;p.face=null;unstick(p);if(!b.cancel){S.timedDone=!!b.timed;try{b.done&&b.done()}finally{S.timedDone=false}}const bn=b.buddy||(b.bq&&IS&&IS.buddy);if(bn&&!$('toast').hidden)toast($('toast').textContent+` · with ${bn.name} 🤝`);acts(true);hud()}
function applyFx(fx,f){const p=P();if(f<=0)return;Object.entries(fx).forEach(([k,v])=>{if(k==='study'){p.study+=v*f*(v>0?moodInfo().study:1);S.lastStudyDay=day()}else p.needs[k]=clamp(p.needs[k]+v*f)})}
function busyStep(dt=.016){const b=S.busy;if(!b)return;const p=P();let k;
  if(b.timed){const T=b.timed;if(b.skip){b.skip=false;const rem=T.start+T.mins-S.min;if(rem>0){if(sharedClock())T.start-=rem;else{S.min+=rem;decay(rem);hourly()}}}k=clamp((S.min-T.start)/T.mins,0,1);applyFx(T.fx,k-T.ap);T.ap=k}
  else k=Math.min(1,(performance.now()-b.t0)/b.dur);
  if(b.game){b.game.step(Math.min(.05,dt));const hk=b.game.hud();if(hk!==b.hk){b.hk=hk;const el=$('busyL');if(el)el.textContent=hk}}
  if(b.a.path){const q=pathPos(b.a.path,k);p.x=q.x;p.y=q.y}
  if(b.buddy&&b.a.path){const q=pathPos(b.a.path,Math.max(0,k*(b.a.path==='pool'?1:1)-.03));b.buddy.x=q.x;b.buddy.y=q.y}
  if(k>=1)finishBusy()}

/* ---------- real actions indoors: walk to the thing first, then use it ----------
   Watching TV: sit on the couch/beanbag facing the TV if there is one, otherwise stand in front of it.
   Eating, studying, sleeping, cooking, showering...: the character walks over to the table, desk,
   bed, stove or shower, and only then sits down / lies down / starts. */
function tvAct(sp){if(sp.bean)return{pose:'sit',spot:sp.bean};if(IS&&IS.tv&&IS.tvSpot){let t=IS.tvSpot;try{const G=iGrid();if(G.bl[gIdx(G,t.x,t.z)]){const q=approachPt(t);if(q)t={x:q.x,z:q.z,ry:Math.atan2(IS.W/2-q.x,1.9-q.z)}}}catch(e){}return{pose:'idle',spot:t}}return{pose:'sit',spot:sp.seat||sp.desk}}
function approachPt(sp){const G=iGrid(),free=(x,z)=>!G.bl[gIdx(G,x,z)];if(free(sp.x,sp.z))return{x:sp.x,z:sp.z};const p=P();let best=null,bd=1e9;
  for(const r of[.45,.6,.75,.9])for(let k=0;k<16;k++){const a=k/16*Math.PI*2,x=sp.x+Math.cos(a)*r,z=sp.z+Math.sin(a)*r;if(!free(x,z))continue;const d=Math.hypot(x-p.ix,z-p.iz)+r*.6;if(d<bd){bd=d;best={x,z}}}return best}
function walkFirst(label,a,dur,done){if(!IS||!S||!a||!a.spot||a._walked||a.game)return false;const p=P(),sp=a.spot;if(Math.hypot(p.ix-sp.x,p.iz-sp.z)<.55)return false;
  const ap=approachPt(sp);if(!ap||Math.hypot(p.ix-ap.x,p.iz-ap.z)<.3)return false;
  const t={x:ap.x,z:ap.z};S.walkTo={label,a:Object.assign({},a,{_walked:1}),dur,done,t,t0:performance.now()};p.target=null;p.pose=null;p.lying=false;p.spotY=0;p.face=null;p.itarget=t;return true}
function walkToTick(){const w=S&&S.walkTo;if(!w)return;const p=P();if(!IS){S.walkTo=null;return}
  if(p.itarget&&p.itarget!==w.t){S.walkTo=null;return}                       // the player tapped somewhere else: cancel
  if(!p.itarget||performance.now()-w.t0>9000){S.walkTo=null;p.itarget=null;startBusy(w.label,w.a,w.dur,w.done)}}
