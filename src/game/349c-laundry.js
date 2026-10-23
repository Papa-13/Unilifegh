/* ================= laundry hustle, for real =================
   You only wash for someone when someone has actually asked ("I'm looking for someone to wash my clothes").
   Requests come by text from roommates, hostel mates and friends, and last two days. You do the washing in
   your bathroom: a basin of soapy water, a bucket and their clothes, and you scrubbing away. They pay
   you when you're done. */
const WASH_LINES=[n=>`Please, I'm looking for someone to wash my clothes 🙏 One bucket. I'll pay ${cedi(n)}. Can you help?`,
  n=>`Chale, my clothes have piled up 😩 Anybody washing for people? I'll give you ${cedi(n)} for one bucket.`,
  n=>`Are you still washing for people? I have a bucket of clothes, ${cedi(n)} 🧺`];
function washReq(){const r=S.washReq;if(!r)return null;if(S.min>r.until){S.washReq=null;return null}const n=npcById(r.id);if(!n){S.washReq=null;return null}return Object.assign({n},r)}
function washAsk(){if(!S||!S.p||NOBOTS||S.washReq)return;const p=P(),h=hour();if(h<8||h>=20)return;if(S.washNext&&S.min<S.washNext)return;
  const pool=S.npcs.filter(n=>!n.hidden&&!n.ex&&(n.mate||(n.contact&&n.friend>=20)||(n.home===p.home&&n.met)));if(!pool.length)return;
  const n=pick(pool),lv=huLv(hu().laundry),pay=35+lv*6+RI(0,10);S.washReq={id:n.id,pay,until:S.min+2*1440};S.washNext=S.min+RI(1,3)*1440;
  const t=pick(WASH_LINES)(pay);S.msgs.unshift({from:n.name,chat:n.name,text:t,at:S.min,read:false});S.unread=unreadN();toast(`📱 ${n.name.split(' ')[0]}: ${t}`);try{hud()}catch(e){}}
{const _h=hourly;hourly=function(){const r=_h.apply(this,arguments);try{const hk=day()*24+Math.floor(hour());if(S&&S._wah!==hk){S._wah=hk;if(Math.random()<.14)setTimeout(washAsk,1500)}}catch(e){}return r}}
/* where in your bathroom you wash: the open floor between the shower and the door */
function washSpot(){const W=IS.W,D=IS.D,x0=IS.xmin,x1=-W/2;if(x0==null)return null;const cx=(x0+x1)/2,z=-D/4+.35;return{x:cx,z,ry:Math.PI,bx:cx,bz:z-.48}}
function washProps(on){if(!IS)return;if(IS._wash){IS.scene.remove(IS._wash);IS._wash=null}if(!on)return;const s=washSpot();if(!s)return;const g=new THREE.Group();
  const basin=mesh(cyl(.3,.22,.16,20),lam(0x2f8f5b),0,.08,0,g);void basin;mesh(cyl(.27,.27,.02,20),new THREE.MeshLambertMaterial({color:0xcfefff,transparent:true,opacity:.85}),0,.15,0,g);
  const foam=new THREE.Group();for(let i=0;i<9;i++)mesh(sph(.05+Math.random()*.03,8,6),lam(0xffffff),R(-.18,.18),.17,R(-.18,.18),foam);g.add(foam);
  mesh(cyl(.17,.14,.34,14),lam(0x3b78c2),.48,.17,.05,g);mesh(cyl(.16,.16,.02,14),new THREE.MeshLambertMaterial({color:0xcfefff,transparent:true,opacity:.8}),.48,.33,.05,g);
  [[-.52,.02,0xc8102e],[-.5,.07,0xf2c230],[-.55,.12,0x2a7b7b],[-.48,.16,0xffffff]].forEach(([x,y,c],i)=>{const b=box(.34,.05,.26,lam(c),x,y,-.05+i*.02,g);b.rotation.y=i*.5});
  box(.1,.05,.06,lam(0xf7e27a),.2,.17,.24,g);g.position.set(s.bx,0,s.bz);IS.scene.add(g);IS._wash=g;
  const t0=performance.now();(function bob(){if(IS&&IS._wash===g){const t=(performance.now()-t0)/1000;foam.children.forEach((f,i)=>{f.position.y=.17+Math.abs(Math.sin(t*4+i))*.03;f.scale.setScalar(.85+Math.sin(t*3+i*1.7)*.15)});requestAnimationFrame(bob)}})()}
function washClothes(){const r=washReq();if(!r)return toast('Nobody has asked you to wash their clothes right now.');if(!(IS&&IS.kind==='room'&&IS.mine))return toast('Do the washing in your bathroom at home.');
  const s=washSpot();if(!s)return toast('Your room has no bathroom for washing.');if(IS.waterOff&&!P().items.includes('dispenser'))toast('💧 No running water today, so you use the gallons.');const h=hu().laundry,fn=r.n.name.split(' ')[0];
  washProps(true);startBusy(`Washing ${fn}'s clothes`,{pose:'sweep',spot:{x:s.x,z:s.z,ry:s.ry},mins:90,fx:{energy:-10,fun:-4,hygiene:-3}},0,()=>{const p=P();washProps(false);S.washReq=null;h.xp=(h.xp||0)+1;p.money+=r.pay;r.n.friend=clamp((r.n.friend||0)+3);
    const t=pick([`Thank you so much! 🙏 Sent ${cedi(r.pay)} to your MoMo`,`Ei, they smell so fresh 😍 ${cedi(r.pay)} sent!`,`You're a lifesaver 🙌 Here's your ${cedi(r.pay)}`]);S.msgs.unshift({from:r.n.name,chat:r.n.name,text:t,at:S.min,read:false});S.unread=unreadN();
    toast(`🧺 Done! ${fn}: ${t}`);hud()})}
{const _fb=finishBusy;finishBusy=function(){const lb=S.busy&&S.busy.label;const r=_fb.apply(this,arguments);try{if(/^Washing .*clothes$/.test(lb||''))washProps(false)}catch(e){}return r}}
{const _lr=leaveRoom;leaveRoom=function(){try{if(IS&&IS._wash){IS._wash=null}}catch(e){}return _lr.apply(this,arguments)}}
/* the hustle only shows as available when someone asked; it sends you to your bathroom */
{const L=HUSTLES.find(x=>x.id==='laundry');if(L){L.name='Wash clothes for someone (1.5h)';
  L.can=function(){const r=washReq();if(!r)return 'Nobody has asked yet. Hostel mates text you when they need someone';return IS&&IS.kind==='room'&&IS.mine?true:`${r.n.name.split(' ')[0]} wants a bucket washed · go to your room's bathroom`};
  L.desc=function(h){const r=washReq();return r?`${r.n.name} · ${cedi(r.pay)} a bucket · level ${huLv(h)}`:`Level ${huLv(h)} · about ${cedi(35+huLv(h)*6)} a bucket`};
  L.run=function(){washClothes()}}}
/* in your bathroom */
{const _ra=roomActions;roomActions=function(){const a=_ra.apply(this,arguments);try{const r=washReq();if(r&&IS&&IS.kind==='room'&&IS.mine&&!S.busy){const p=P(),b=IS.objs.find(o=>o.id==='bath');
  if(b&&Math.hypot(b.x-p.ix,b.z-p.iz)<b.r+.3)a.unshift([`🧺 Wash ${r.n.name.split(' ')[0]}'s clothes (1.5h) · ${cedi(r.pay)}`,()=>washClothes(),null,'b']);
  else a.push([`🧺 ${r.n.name.split(' ')[0]}'s laundry is waiting · do it in the bathroom`,()=>washClothes()])}}catch(e){}return a}}
