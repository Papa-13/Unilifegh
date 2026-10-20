/* ================= street food sellers =================
   Hawkers set up at the roadside at the times they would in real life: waakye and koko in the
   morning, fruit at midday, kelewele by the coal pot at night, and a pure water seller walking the
   hostel road. Walk up to one and buy from the Actions menu. */
const HAWKERS0=[
 {id:'waakye',name:'Auntie Adjoa',x:4790,y:473,g:'f',from:6,to:11,label:'🍛 Waakye',buy:[['Waakye with egg & wele',18,{hunger:55,fun:8}],['Waakye special (gari, spaghetti, fish)',28,{hunger:72,fun:12}]],prop:'bowls'},
 {id:'koko',name:'Hajia Fati',x:2425,y:473,g:'f',from:5.5,to:10.5,label:'🥣 Koko & koose',buy:[['Koko with koose',8,{hunger:28,fun:5}],['Hausa koko, bread & groundnuts',10,{hunger:34,fun:6}]],prop:'pot',
   menu:{what:'koko',base:['Hausa koko (a big cup)',4,22],adds:[['Koose ×3',3,10],['Bofrot ×2',2,8],['Tea bread',3,10],['Groundnuts',2,6],['Extra sugar & milk',1,2]]}},
 {id:'wjoint',name:'Auntie Muni',x:1800,y:2943,g:'f',from:6,to:14,label:'🍛 Waakye Joint',buy:[],prop:'joint',sign:'AUNTIE MUNI WAAKYE JOINT',
   menu:{what:'waakye',base:['Waakye (rice & beans)',10,40],adds:[['Wele',5,8],['Boiled egg',4,8],['Fried fish',8,12],['Gari',2,6],['Spaghetti (talia)',3,8],['Avocado',5,6],['Beef',10,12],['Fried plantain',5,8],['Shito',1,2],['Salad',3,3]]}},
 {id:'gob3',name:'Auntie Ama',x:1350,y:2943,g:'f',from:10,to:19.5,label:'🫘 Gob3 joint',buy:[],prop:'joint',sign:'GOB3 SPOT · GARI & BEANS',
   menu:{what:'gob3',base:['Gari & beans with red oil (gob3)',8,38],adds:[['Fried ripe plantain',5,12],['Boiled egg',4,8],['Avocado',5,6],['Fried fish',6,10],['Extra gari',2,6],['Shito',1,2]]}},
 {id:'fruit',name:'Maame Esi',x:2400,y:880,south:1,g:'f',from:9,to:17,label:'🍍 Cut fruits',buy:[['Pineapple & watermelon',10,{hunger:20,fun:6,energy:4}],['Fresh coconut',8,{hunger:12,fun:6,energy:6}]],prop:'fruit'},
 {id:'kelewele',name:'Kwame Kelewele',x:2450,y:2943,g:'m',from:17.5,to:23.5,label:'🔥 Kelewele',buy:[['Kelewele & groundnuts',12,{hunger:30,fun:10}],['Roasted plantain (kofi brokeman)',8,{hunger:26,fun:6}]],prop:'coal'},
 {id:'indomie',name:'Bra Kojo',x:1040,y:2943,g:'m',from:18,to:24,label:'🍜 Indomie joint',buy:[['Indomie & egg',15,{hunger:40,fun:6}],['Fried rice & chicken',30,{hunger:60,fun:8}]],prop:'pot'},
 {id:'kenkey',name:'Auntie Akos',x:960,y:473,g:'f',from:11,to:19,label:'🐟 Kenkey & fish',buy:[['Ga kenkey, fish & shito',15,{hunger:50,fun:6}],['Fanti kenkey & fried fish',18,{hunger:55,fun:7}]],prop:'bowls'},
 {id:'water',name:'Pure water boy',walk:[[700,2935],[5300,2935]].map(([x,y])=>{const q=KR(x,y);return[q.x,q.y]}),g:'m',from:10,to:18,label:'💧 Pure water',buy:[['Pure water sachet',1,{hunger:3,energy:3,fun:1}],['Ice cream',7,{hunger:8,fun:10}]],prop:'cooler'}];
const HAWKERS=HAWKERS0.map(k=>{if(k.x!=null){const q=KR(k.x,k.y);k.x=q.x;k.y=q.y}return k});
const hawkOn=k=>()=>{const h=hour();return h>=k.from&&h<k.to};
(function(){HAWKERS.forEach(k=>{const look=staffLook(k.g,k.g==='f'?{hair:'duku',outfit:pick(['kaba','dress']),pal:pick(['ankara','kente','olive'])}:{hair:'fade',outfit:'tee',pal:pick(['black','olive','maroon']),extra:'cap'});
  const start=k.walk?k.walk[0]:[k.x,k.y],q=T(start[0],start[1]),h=makeHuman(look,{label:k.label,labelColor:'#ffd27a'});scene.add(h.g);
  const path=k.walk&&(t=>{const [a,b]=k.walk,u=(Math.sin(t*.035)+1)/2,r=T(a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u);return r});
  const v={look,label:k.label,labelColor:'#ffd27a',mesh:h.g,legs:h.legs,knees:h.knees,arms:h.arms,elbows:h.elbows,head:h.head,lids:h.lids,torso:h.torso,x:q.x,y:q.y,face:k.walk?0:k.south?0:Math.PI,pose:k.walk?'walk':'idle',phase:0,id:Math.random()*9,when:hawkOn(k),path,spotY:0,crowd:false};
  DECOR.push(v);k.v=v;h.g.rotation.y=v.face;
  /* their stall */
  const P_=new THREE.Group();k.props=P_;scene.add(P_);
  if(k.prop==='cooler'){const c=box(.42,.3,.32,0x2f6bb5,0,1.92,0,h.g);void c;k.props=null;return}
  P_.position.set(wx(q.x),0,wz(q.y)+(k.south?.75:-.75));
  if(k.prop!=='coal')box(1.1,.06,.6,0x8a6a44,0,.78,0,P_),[[-.5,-.25],[.5,-.25],[-.5,.25],[.5,.25]].forEach(([x,z])=>box(.05,.78,.05,0x5a4632,x,.39,z,P_));
  if(k.prop==='joint'){P_.position.z=wz(q.y)+(k.south?.8:-.8);box(2.2,.08,.6,0x8a6a44,0,.8,0,P_);[[-1,-.35],[1,-.35],[-1,.35],[1,.35]].forEach(([x,z])=>box(.06,.8,.06,0x5a4632,x,.4,z,P_));
    [-.7,-.15,.45].forEach((x,i)=>mesh(cyl(.3,.24,.4,14),lam([0x3c7a3a,0x9a9a9a,0xc8322b][i]),x,1.02,0,P_));mesh(cyl(.25,.25,.03,14),lam(0x6b3a1a),-.7,1.22,0,P_);mesh(cyl(.25,.25,.03,14),lam(0xf0e6c8),-.15,1.22,0,P_);
    [-1.05,1.05].forEach(x=>box(.06,2.3,.06,0x5a4632,x,1.15,k.south?.3:-.3,P_));const sg=mesh(new THREE.PlaneGeometry(2.2,.42),new THREE.MeshBasicMaterial({map:textTex(k.sign||k.label,{font:'900 34px system-ui',color:'#fff',stroke:false,bg:'#2f7a4a'}),side:THREE.DoubleSide}),0,2.25,k.south?.3:-.3,P_);if(!k.south)sg.rotation.y=Math.PI;
    box(2.6,.06,1.0,0x2f6bb5,0,2.5,k.south?-.1:.1,P_);[[-1.5,.85],[1.5,.85]].forEach(([x,z])=>{box(1.2,.06,.35,0x6b4a2e,x,.42,z,P_);[-.5,.5].forEach(d=>box(.05,.42,.3,0x444444,x+d,.21,z,P_))});
    solidBox(q.x,q.y+(k.south?1:-1)*.8/U,2.3/U,.7/U)}
  if(k.prop==='bowls'){mesh(cyl(.32,.22,.28,14),lam(0x3c7a3a),-.2,.95,0,P_);mesh(cyl(.22,.16,.2,12),lam(0xd8d8d8),.3,.91,0,P_);box(.5,.02,.3,0x2fa84f,0,1.1,0,P_)}
  if(k.prop==='pot'){mesh(cyl(.26,.3,.36,14),lam(0x7a7a7a),-.15,.99,0,P_);for(let i=0;i<6;i++)mesh(sph(.06,8,6),lam(0xb8742a),.25+(i%3)*.12,.85,(i<3?-.08:.08),P_)}
  if(k.prop==='fruit'){for(let i=0;i<3;i++){const pn=mesh(sph(.12,8,6),lam(0xd9a537),-.35+i*.18,.92,-.1,P_);pn.scale.y=1.5}mesh(sph(.2,10,8),lam(0x2f7a4a),.3,.98,.05,P_);for(let i=0;i<4;i++)box(.12,.1,.04,0xc8322b,.05+i*.08,.86,.18,P_)}
  if(k.prop==='coal'){mesh(cyl(.3,.22,.35,12),lam(0x2a2a2a),0,.18,0,P_);const coals=mesh(cyl(.27,.27,.04,12),new THREE.MeshBasicMaterial({color:0xff6a1a}),0,.36,0,P_);
    box(.7,.05,.5,0x8a6a44,.8,.7,0,P_);mesh(cyl(.22,.18,.14,12),lam(0xd9a537),.8,.79,0,P_);const glow=new THREE.PointLight(0xff8a3a,1.2,6,1.6);glow.position.set(0,.8,0);P_.add(glow);k.glow=glow;k.coals=coals}
})})();
function hawkerTick(){const h=hour();HAWKERS.forEach(k=>{const on=!IS&&h>=k.from&&h<k.to;if(k.props)k.props.visible=on;if(k.glow){k.glow.visible=on;k.glow.intensity=1+Math.sin(performance.now()/180)*.25}})}
function hawkerNear(){if(!S||IS)return null;const p=P(),h=hour();return HAWKERS.find(k=>h>=k.from&&h<k.to&&k.v&&!(NOBOTS&&k.walk)&&Math.hypot(p.x-k.v.x,p.y-k.v.y)<70)||null}
function hawkerOrder(k){const m=k.menu,sel=new Set();S.paused=true;openSheet();const greet=k.g==='f'?'Auntie':'Chale';
  const draw=()=>{const tot=m.base[1]+[...sel].reduce((a,i)=>a+m.adds[i][1],0);
    $('sheetIn').innerHTML=`<div class="eyebrow">${k.label}</div><h3>${esc(k.name)}: "${esc(pick(['What will you take, my dear?','Yes please, how much own?','Give me your order 😊']))}"</h3>
      <div class="item"><div class="grow"><b>${esc(m.base[0])}</b><small>base</small></div><b>${cedi(m.base[1])}</b></div>
      <p style="font-size:13px;margin:8px 0 4px">Add to your ${m.what}:</p><div class="grid2">${m.adds.map(([t,pr],i)=>`<button class="${sel.has(i)?'btn':'ghost'} sm" data-ad="${i}">${sel.has(i)?'✓ ':''}${esc(t)} · ${cedi(pr)}</button>`).join('')}</div>
      <div class="row" style="justify-content:space-between;align-items:center;margin-top:10px"><b>Total ${cedi(tot)}</b><span><button class="ghost sm" id="bye">Cancel</button> <button class="btn sm" id="ordB">Buy</button></span></div>`;
    $('sheetIn').querySelectorAll('[data-ad]').forEach(b=>b.onclick=()=>{const i=+b.dataset.ad;sel.has(i)?sel.delete(i):sel.add(i);draw()});$('bye').onclick=closeSheet;
    $('ordB').onclick=()=>{if(!spend(tot))return;closeSheet();const hunger=Math.min(95,m.base[2]+[...sel].reduce((a,i)=>a+m.adds[i][2],0)),parts=[...sel].map(i=>m.adds[i][0].toLowerCase());
      toast(`${k.name}: "${pick([`Here, enjoy! I added small extra for you 😉`,`Thank you, ${greet}! Come again tomorrow`,`Eat well o!`])}"`);try{ev('eat',k.id)}catch(e){}
      doAct(`Eating ${m.what}${parts.length?' with '+parts.slice(0,3).join(', '):''}`,20,{hunger,fun:6+parts.length*2})}};draw()}
function hawkerActs(list){const k=hawkerNear();if(!k)return;const greet=k.g==='f'?'Auntie':'Chale';if(k.menu)list.unshift([`${k.label.split(' ')[0]} Order ${k.menu.what} at ${k.name}'s`,()=>hawkerOrder(k),null,'b']);
  k.buy.slice().reverse().forEach(([what,price,fx])=>list.unshift([`${k.label.split(' ')[0]} Buy ${what} · ${cedi(price)}`,()=>{if(!spend(price))return;
    toast(`${k.name}: "${pick([`Thank you, my dear!`,`Enjoy, ${greet}!`,`Come back tomorrow o!`,`Eii, you will like it!`])}"`);try{ev('eat',k.id)}catch(e){}doAct(`Eating ${what.toLowerCase()}`,price<3?5:20,fx)},null,'b']))}
