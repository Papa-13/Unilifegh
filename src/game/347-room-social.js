/* ================= your room, more like home =================
   - The umbrella closes itself when you go indoors, when the rain has stopped, or when you leave the game.
   - Your desk can be moved (and turned) like any other furniture.
   - Chairs and a sofa on HomeMart. Sit on them yourself, or offer a visitor a seat: you suggest the
     chair, the sofa or your bed, and they decide where they actually sit.
   - A close friend (not just your partner) can sleep over if they agree: on your sofa if you have one,
     otherwise on a spare mattress on the floor. */

/* ---------------- umbrella ---------------- */
{const st=document.createElement('style');st.textContent='body:not(.playing) #umbB,body:not(.playing) #tvRemote,body:not(.playing) #placeBar{display:none!important}';document.head.appendChild(st)}
const umbClose=why=>{const p=P();if(!p||!p.umbOpen)return;p.umbOpen=false;S._dryT=0;if(why)toast(why);try{umbrellasTick(false)}catch(e){}};
{const _ub=umbBtn;umbBtn=function(ri){try{const p=P();if(p&&p.umbOpen){if(IS)umbClose('☂️ You shake off your umbrella and close it.');
  else if(ri<.12){const now=performance.now();if(!S._dryT)S._dryT=now;else if(now-S._dryT>12000)umbClose('🌤️ The rain has stopped, so you close your umbrella.')}else S._dryT=0}}catch(e){}return _ub.apply(this,arguments)}}
{const _w=welcome;welcome=function(){try{if(S&&P())umbClose();const b=$('umbB');if(b)b.hidden=true}catch(e){}return _w.apply(this,arguments)}}

/* ---------------- chairs and a sofa ---------------- */
SHOP.push({id:'chair',name:'Plastic chair',price:45,desc:'An extra seat for visitors'},{id:'sofa',name:'Two-seater sofa',price:850,desc:'Comfy seats for you and a guest. A friend can crash on it for a sleepover'});
MOVABLE.chair={w:.5,d:.5,obj:{id:'chair',label:'Chair',r:.75},seats:[{dx:0,dz:.03,y:0}],build:g=>{const c=lam(0xc8302e);box(.46,.04,.44,c,0,.45,0,g);[[-.19,-.18],[.19,-.18],[-.19,.18],[.19,.18]].forEach(([x,z])=>mesh(cyl(.022,.03,.45,6),c,x,.225,z,g));const b=box(.46,.4,.04,c,0,.68,-.21,g);b.rotation.x=-.12;box(.3,.05,.045,lam(0xa82422),0,.8,-.23,g)}};
MOVABLE.sofa={w:1.5,d:.8,obj:{id:'sofa',label:'Sofa',r:1.05},seats:[{dx:-.36,dz:.1,y:-.04},{dx:.36,dz:.1,y:-.04}],build:g=>{const f=lam(0x3d5a80),cu=lam(0x4d6d96);box(1.5,.26,.75,f,0,.2,0,g);[-.36,.36].forEach(x=>box(.68,.12,.6,cu,x,.39,.06,g));box(1.5,.48,.18,f,0,.58,-.29,g);[-.69,.69].forEach(x=>box(.14,.5,.75,f,x,.33,0,g));
  [[-.66,-.3],[.66,-.3],[-.66,.3],[.66,.3]].forEach(([x,z])=>box(.06,.08,.06,lam(0x2b1d12),x,.04,z,g));box(.32,.24,.1,lam(0xe8b24a),-.5,.58,-.15,g).rotation.z=.15}};
/* seats where you (or a guest) can sit */
const seatWorld=(x,z,ry,s)=>({x:x+s.dx*Math.cos(ry)+s.dz*Math.sin(ry),z:z-s.dx*Math.sin(ry)+s.dz*Math.cos(ry),ry,ly:s.y});
{const _pi=putItem;putItem=function(id,x,z,ry,ghost){const g=_pi.apply(this,arguments);try{const M=MOVABLE[id];if(!ghost&&IS&&M&&M.seats){IS.seatsX=(IS.seatsX||[]).filter(s=>s.id!==id);M.seats.forEach((s,i)=>IS.seatsX.push(Object.assign(seatWorld(x,z,ry||0,s),{id,i,label:id==='sofa'?'the sofa':'the chair'})))}}catch(e){}return g}}
const seatFree=s=>!IS.people.some(q=>q.mesh&&Math.hypot(q.mesh.position.x-s.x,q.mesh.position.z-s.z)<.32&&!q.mov)&&!(S.busy&&S.busy.a&&S.busy.a.spot&&Math.hypot(S.busy.a.spot.x-s.x,S.busy.a.spot.z-s.z)<.3);
function bedSeat(){try{const sl=IS.slots&&IS.slots[0];if(!sl||sl.y>.7)return null;const c=bedPos(sl),o=IS.objs.find(o=>o.id==='bed')||{x:c.x+1,z:c.z+1};
  if(sl.rot){const sg=Math.sign(o.z-c.z)||1;return{x:c.x,z:c.z+sg*.34,ry:sg>0?0:Math.PI,ly:sl.y-.13,label:'your bed',id:'bed'}}
  const sg=Math.sign(o.x-c.x)||1;return{x:c.x+sg*.34,z:c.z,ry:sg>0?Math.PI/2:-Math.PI/2,ly:sl.y-.13,label:'your bed',id:'bed'}}catch(e){return null}}
function sitMe(s,watch){const spot={x:s.x,z:s.z,ry:s.ry,ly:s.ly};if(watch)return startBusy('Watching TV',{pose:'sit',spot,mins:60,fx:{fun:18,energy:5}},0,()=>{});
  startBusy(`Relaxing on ${s.label}`,{pose:'sit',spot,mins:30,fx:{energy:5,fun:4}},0,()=>{})}
{const _ra=roomActions;roomActions=function(){const a=_ra.apply(this,arguments);try{if(!IS||IS.kind!=='room'||S.busy)return a;const p=P();
  (IS.seatsX||[]).filter(s=>Math.hypot(s.x-p.ix,s.z-p.iz)<1.1).forEach(s=>{if(a.some(x=>x._seat===s.id))return;const fr=(IS.seatsX||[]).filter(t=>t.id===s.id).find(seatFree);if(!fr)return;
    const it=[`🪑 Sit on ${s.label} (30m)`,()=>sitMe(fr)];it._seat=s.id;a.push(it);if(IS.tv)a.push([`📺 Watch TV from ${s.label} (1h)`,()=>sitMe(fr,true)])});
  /* visitors: offer a seat, sleepovers */
  const n=IS.guest,q=n&&IS.people.find(q=>q.n===n);if(IS.mine&&q){const fn=n.name.split(' ')[0];a.unshift([`🪑 Offer ${fn} a seat`,()=>offerSeat(q),null,'b']);
    const night=hour()>=19||hour()<4,pt=p.partner===n;if(!pt&&night&&(n.friend||0)>=55&&!(S.sleepover&&S.sleepover.day===day()))a.push([`🌙 Ask ${fn} to sleep over`,()=>friendSleepover(n,q),null,'b'])}}catch(e){console.warn(e)}return a}}
/* you suggest where, they decide */
function offerSeat(q){const n=q.n,fn=n.name.split(' ')[0],seats=(IS.seatsX||[]).filter(seatFree),bs=bedSeat(),bean=IS.spots.bean,opts=[];
  const add=(lbl,k)=>opts.push([lbl,k]);if(seats.some(s=>s.id==='sofa'))add('🛋️ "Sit on the sofa"','sofa');if(seats.some(s=>s.id==='chair'))add('🪑 "Take the chair"','chair');if(bs&&seatFree(bs))add('🛏️ "Sit on my bed"','bed');if(bean&&seatFree(bean))add('🫘 "Try the beanbag"','bean');add('🤷 "Sit wherever you like"','any');
  placeSheet(`🪑 Where should ${esc(fn)} sit?`,opts.map(o=>o[0]),i=>{closeSheet();guestDecides(q,opts[i][1])})}
function guestDecides(q,want){const n=q.n,fn=n.name.split(' ')[0],p=P(),pt=p.partner===n,close=(n.friend||0)>=60||pt,C=[];
  const seats=(IS.seatsX||[]).filter(seatFree),bs=bedSeat(),bean=IS.spots.bean,meSofa=S.busy&&/sofa/.test(S.busy.label||'');
  seats.forEach(s=>C.push({s,k:s.id,w:s.id==='sofa'?(meSofa?5:3):2}));if(bs&&seatFree(bs))C.push({s:bs,k:'bed',w:pt?4:close?1.5:.25});if(bean&&seatFree(bean))C.push({s:Object.assign({label:'the beanbag'},bean),k:'bean',w:1.5});
  if(!C.length){toast(`${fn}: "I'm fine standing, don't worry 😊"`);return}
  /* they mostly go with your suggestion, unless it's your bed and you're not that close */
  const sug=C.filter(c=>c.k===want),takeIt=sug.length&&Math.random()<(want==='bed'?(pt?.9:close?.6:.15):.85);let pickC;
  if(takeIt)pickC=sug[0];else{const tot=C.reduce((a,c)=>a+c.w,0);let r=Math.random()*tot;pickC=C.find(c=>(r-=c.w)<0)||C[0]}
  const where=pickC.s.label||'there',line=takeIt?pick(['Thanks 😊','Okay, thank you!','Ah, nice. Thanks 🙏']):want==='bed'&&!takeIt?pick([`Eh, your bed? 😅 I'll take ${where}.`,`I'll just sit on ${where}, it's fine 😂`]):want==='any'?pick([`I'll take ${where} 😌`,`Ooh, ${where} looks comfy.`]):pick([`Actually, I'll sit on ${where} 😄`,`Can I take ${where} instead?`]);
  toast(`${fn}: "${line}"`);if(pickC.k==='bed'&&pt){n.romance=clamp((n.romance||0)+2)}else n.friend=clamp((n.friend||0)+1);
  const A=q.ai||(q.ai={next:0,path:null,goal:null}),s=pickC.s;startWalk(q,A,{k:'seat',x:s.x,z:s.z,ry:s.ry,pose:'sit',y:s.ly||0});A.next=performance.now()/1000+150;
  if(meSofa&&pickC.k==='sofa')setTimeout(()=>toast(`${fn} sits down next to you on the sofa 🛋️`),2200)}

/* ---------------- sleepovers with a close friend ---------------- */
function friendSleepover(n,q){const fn=n.name.split(' ')[0];
  const yes=Math.random()<.3+(n.friend||0)/180+(hour()>=22||hour()<4?.15:0);
  if(!yes){n.friend=clamp((n.friend||0)-1);toast(`${fn}: "${pick(['I wish, but I have an 8am lecture 😩','Not tonight, my roommate is waiting for me. Next time!','Ah, I didn\'t bring my things. Another day 🙏'])}"`);return}
  const sofa=(IS.seatsX||[]).filter(s=>s.id==='sofa'),onSofa=sofa.length===2;
  story(`<div class="eyebrow">🌙 Sleepover</div><h3>${esc(n.name)} is staying the night!</h3><p class="scene">${onSofa?`You grab a spare pillow and a cloth for ${esc(fn)} on the sofa.`:`You pull out a spare mattress and lay it on the floor for ${esc(fn)}.`} You gist and laugh until late, then the lights go off.</p><p style="font-size:13px;color:var(--muted)">Friendship +6 · Social +25</p>`,[['Goodnight 😴','g',()=>{
    n.friend=clamp((n.friend||0)+6);P().needs.social=clamp(P().needs.social+25);S.sleepover={id:n.id,day:day(),friend:1};S.guestId=n.id;S.guestHere=true;S.guestUntil=(hour()>=12?day()+1:day())*1440+10*60;
    let x,z,y,yaw;if(onSofa){const a=sofa[0],b=sofa[1];x=(a.x+b.x)/2;z=(a.z+b.z)/2;y=.46;yaw=a.ry+Math.PI/2}else{const m=matSpot();S.sleepover.mat=m;drawMat(m);x=m.x;z=m.z;y=.12;yaw=m.yaw}
    IS.people.filter(o=>o.n===n).forEach(o=>IS.scene.remove(o.mesh));IS.people=IS.people.filter(o=>o.n!==n);addInPerson(n.look,n.name,x,z,0,'lie',{n,lie:true,y,yaw});
    if(S.mates.some(m=>homeNow(m)))setTimeout(()=>toast(`${S.mates[0].name}: "Welcome o, ${fn}! Don't snore 😂"`),900);
    sleep();const b=S.busy;if(b){const d=b.done;b.done=()=>{d();setTimeout(()=>toast(`☀️ Morning! ${fn}: "${pick(['Thanks for having me 🙏','Your room is so cosy','I slept like a baby 😴','Breakfast is on me today'])}"`),600)}}}]])}
function matSpot(){const D=IS.D,W=IS.W,x0=IS.xmin??-W/2,door=IS.objs.find(o=>o.id==='door');for(let z=D/2-.6;z>-D/2+.8;z-=.25)for(let x=W/2-1.1;x>x0+1;x-=.25){const r={x1:x-.95,x2:x+.95,z1:z-.45,z2:z+.45};
    if(r.x1<x0+.1||r.x2>W/2-.1||r.z1<-D/2+.1||r.z2>D/2-.1)continue;if(door&&Math.hypot(x-door.x,z-door.z)<1.3)continue;if(!IS.obst.some(o=>r.x1<o.x2&&r.x2>o.x1&&r.z1<o.z2&&r.z2>o.z1))return{x,z,yaw:-Math.PI/2}}return{x:0,z:D/2-.7,yaw:-Math.PI/2}}
function drawMat(m){const g=new THREE.Group();box(1.85,.12,.85,lam(0x6f8fb5),0,.06,0,g);box(1.8,.02,.8,lam(0xeef2f6),0,.13,0,g);box(.4,.08,.5,lam(0xffffff),-.68,.17,0,g);g.position.set(m.x,0,m.z);IS.scene.add(g);IS.obst.push({x1:m.x-.95,x2:m.x+.95,z1:m.z-.45,z2:m.z+.45});IS.grid=null}

/* ---------------- move your desk ---------------- */
MOVABLE.desk={w:1.1,d:1.3,build:g=>{const t=lam(0x8a6a4a),l=lam(0x6a4f37),c=lam(0x2b2b2b);box(1,.06,.6,t,0,.76,-.3,g);[-.45,.45].forEach(a=>box(.05,.74,.5,l,a,.37,-.3,g));box(.42,.05,.42,c,0,.47,.25,g);box(.42,.45,.05,c,0,.72,.45,g)}};
/* the desk you built with the room is a bunch of meshes; gather them (desk, chair, books and whatever sits on it) so they move together */
function deskGather(){const o=IS.objs.find(o=>o.id==='desk');if(!o)return null;const dx=o.x,D=IS.D,z0=-D/2,skip=new Set(IS.people.map(q=>q.mesh));try{skip.add(P().mesh)}catch(e){}const G=[];
  IS.scene.children.forEach(m=>{if(!m.isMesh||skip.has(m))return;const p=m.position,gp=m.geometry&&m.geometry.parameters||{};if((gp.width||0)>1.05||(gp.height||0)>1.05&&(gp.depth||0)>1.05)return;
    if(p.x>dx-.62&&p.x<dx+.62&&p.z>=z0+.13&&p.z<z0+1.3&&p.y<1.3)G.push(m)});return{o,dx,ox:dx,oz:z0+.75,G}}
{const _er=enterRoom0;enterRoom0=function(owner){const r=_er.apply(this,arguments);try{if(owner==='me'&&IS&&IS.mine){const p=P(),q=p.place&&p.place.desk,hide=PLACE.hideId==='desk';
  if(q||hide){const d=deskGather();if(d){const oi=IS.obst.findIndex(b=>Math.abs((b.x1+b.x2)/2-d.dx)<.02&&Math.abs((b.z1+b.z2)/2-(IS.D*-.5+.45))<.02);if(oi>=0)IS.obst.splice(oi,1);IS.grid=null;
    if(hide){d.G.forEach(m=>IS.scene.remove(m))}else{const g=new THREE.Group();g.position.set(q.x,0,q.z);g.rotation.y=q.ry||0;IS.scene.add(g);d.G.forEach(m=>{m.position.x-=d.ox;m.position.z-=d.oz;g.add(m)});(IS.itemG=IS.itemG||{}).desk=g;
      const f=footprint('desk',q.x,q.z,q.ry||0);IS.obst.push(f);const W=(dx,dz)=>seatWorld(q.x,q.z,q.ry||0,{dx,dz,y:0});
      const ob=W(0,.5);d.o.x=ob.x;d.o.z=ob.z;const sd=W(0,.27);IS.spots.desk={x:sd.x,z:sd.z,ry:Math.PI+(q.ry||0)};
      const co=IS.objs.find(o=>o.id==='cooker');if(co){const c1=W(.32,.4);co.x=c1.x;co.z=c1.z;const c2=W(.32,.3);IS.spots.cooker={x:c2.x,z:c2.z,ry:Math.PI+(q.ry||0)}}}}}
  if(S.sleepover&&S.sleepover.mat&&S.sleepover.day>=day()-1&&S.guestHere)drawMat(S.sleepover.mat)}}catch(e){console.warn(e)}return r}}
{const _ui=placeUI;placeUI=function(){const r=_ui.apply(this,arguments);try{if(PLACE.id==='desk'){const b=$('placeBar').querySelector('b');if(b)b.textContent='🛠️ Your desk'}}catch(e){}return r}}
{const _sp=startPlace;startPlace=function(id){if(id==='desk'&&IS&&IS.mine&&!(P().place&&P().place.desk)){const d=IS.objs.find(o=>o.id==='desk');if(d){PLACE._deskInit={x:d.x,z:-IS.D/2+.75,ry:0}}}return _sp.apply(this,arguments)}}
{const _pc=placeCheck;placeCheck=function(){if(PLACE._deskInit&&PLACE.id==='desk'){Object.assign(PLACE,PLACE._deskInit);PLACE._deskInit=null;if(PLACE.ghost){PLACE.ghost.position.set(PLACE.x,0,PLACE.z)}}return _pc.apply(this,arguments)}}
{const _im=itemMenu;itemMenu=function(id){if(id!=='desk')return _im.apply(this,arguments);story(`<div class="eyebrow">🛋️ Your stuff</div><h3>Your desk</h3><p class="scene">Where you study, type and eat when nobody is looking.</p>`,
  [['🛠️ Move it','g',()=>startPlace('desk')],['Close','',()=>{}]])}}
{const _ra=roomActions;roomActions=function(){const a=_ra.apply(this,arguments);try{if(inMyRoomNow()&&!S.busy)a.push(['🪑 Move your desk',()=>startPlace('desk')])}catch(e){}return a}}
