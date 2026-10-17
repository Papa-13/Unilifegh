/* ================= street food sellers =================
   Hawkers set up at the roadside at the times they would in real life: waakye and koko in the
   morning, fruit at midday, kelewele by the coal pot at night, and a pure water seller walking the
   hostel road. Walk up to one and buy from the Actions menu. */
const HAWKERS=[
 {id:'waakye',name:'Auntie Adjoa',x:4790,y:473,g:'f',from:6,to:11,label:'🍛 Waakye',buy:[['Waakye with egg & wele',18,{hunger:55,fun:8}],['Waakye special (gari, spaghetti, fish)',28,{hunger:72,fun:12}]],prop:'bowls'},
 {id:'koko',name:'Hajia Fati',x:2425,y:473,g:'f',from:6,to:10,label:'🥣 Koko & koose',buy:[['Koko with koose',8,{hunger:28,fun:5}],['Hausa koko, bread & groundnuts',10,{hunger:34,fun:6}]],prop:'pot'},
 {id:'fruit',name:'Maame Esi',x:2400,y:880,south:1,g:'f',from:9,to:17,label:'🍍 Cut fruits',buy:[['Pineapple & watermelon',10,{hunger:20,fun:6,energy:4}],['Fresh coconut',8,{hunger:12,fun:6,energy:6}]],prop:'fruit'},
 {id:'kelewele',name:'Kwame Kelewele',x:2450,y:2943,g:'m',from:17.5,to:23.5,label:'🔥 Kelewele',buy:[['Kelewele & groundnuts',12,{hunger:30,fun:10}],['Roasted plantain (kofi brokeman)',8,{hunger:26,fun:6}]],prop:'coal'},
 {id:'indomie',name:'Bra Kojo',x:1040,y:2943,g:'m',from:18,to:24,label:'🍜 Indomie joint',buy:[['Indomie & egg',15,{hunger:40,fun:6}],['Fried rice & chicken',30,{hunger:60,fun:8}]],prop:'pot'},
 {id:'kenkey',name:'Auntie Akos',x:960,y:473,g:'f',from:11,to:19,label:'🐟 Kenkey & fish',buy:[['Ga kenkey, fish & shito',15,{hunger:50,fun:6}],['Fanti kenkey & fried fish',18,{hunger:55,fun:7}]],prop:'bowls'},
 {id:'water',name:'Pure water boy',walk:[[700,2935],[5300,2935]],g:'m',from:10,to:18,label:'💧 Pure water',buy:[['Pure water sachet',1,{hunger:3,energy:3,fun:1}],['Ice cream',7,{hunger:8,fun:10}]],prop:'cooler'}];
const hawkOn=k=>()=>{const h=hour();return h>=k.from&&h<k.to};
(function(){HAWKERS.forEach(k=>{const look=staffLook(k.g,k.g==='f'?{hair:'duku',outfit:pick(['kaba','dress']),pal:pick(['ankara','kente','olive'])}:{hair:'fade',outfit:'tee',pal:pick(['black','olive','maroon']),extra:'cap'});
  const start=k.walk?k.walk[0]:[k.x,k.y],q=T(start[0],start[1]),h=makeHuman(look,{label:k.label,labelColor:'#ffd27a'});scene.add(h.g);
  const path=k.walk&&(t=>{const [a,b]=k.walk,u=(Math.sin(t*.035)+1)/2,r=T(a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u);return r});
  const v={mesh:h.g,legs:h.legs,knees:h.knees,arms:h.arms,elbows:h.elbows,head:h.head,lids:h.lids,torso:h.torso,x:q.x,y:q.y,face:k.walk?0:k.south?0:Math.PI,pose:k.walk?'walk':'idle',phase:0,id:Math.random()*9,when:hawkOn(k),path,spotY:0,crowd:false};
  DECOR.push(v);k.v=v;h.g.rotation.y=v.face;
  /* their stall */
  const P_=new THREE.Group();k.props=P_;scene.add(P_);
  if(k.prop==='cooler'){const c=box(.42,.3,.32,0x2f6bb5,0,1.92,0,h.g);void c;k.props=null;return}
  P_.position.set(wx(q.x),0,wz(q.y)+(k.south?.75:-.75));
  if(k.prop!=='coal')box(1.1,.06,.6,0x8a6a44,0,.78,0,P_),[[-.5,-.25],[.5,-.25],[-.5,.25],[.5,.25]].forEach(([x,z])=>box(.05,.78,.05,0x5a4632,x,.39,z,P_));
  if(k.prop==='bowls'){mesh(cyl(.32,.22,.28,14),lam(0x3c7a3a),-.2,.95,0,P_);mesh(cyl(.22,.16,.2,12),lam(0xd8d8d8),.3,.91,0,P_);box(.5,.02,.3,0x2fa84f,0,1.1,0,P_)}
  if(k.prop==='pot'){mesh(cyl(.26,.3,.36,14),lam(0x7a7a7a),-.15,.99,0,P_);for(let i=0;i<6;i++)mesh(sph(.06,8,6),lam(0xb8742a),.25+(i%3)*.12,.85,(i<3?-.08:.08),P_)}
  if(k.prop==='fruit'){for(let i=0;i<3;i++){const pn=mesh(sph(.12,8,6),lam(0xd9a537),-.35+i*.18,.92,-.1,P_);pn.scale.y=1.5}mesh(sph(.2,10,8),lam(0x2f7a4a),.3,.98,.05,P_);for(let i=0;i<4;i++)box(.12,.1,.04,0xc8322b,.05+i*.08,.86,.18,P_)}
  if(k.prop==='coal'){mesh(cyl(.3,.22,.35,12),lam(0x2a2a2a),0,.18,0,P_);const coals=mesh(cyl(.27,.27,.04,12),new THREE.MeshBasicMaterial({color:0xff6a1a}),0,.36,0,P_);
    box(.7,.05,.5,0x8a6a44,.8,.7,0,P_);mesh(cyl(.22,.18,.14,12),lam(0xd9a537),.8,.79,0,P_);const glow=new THREE.PointLight(0xff8a3a,1.2,6,1.6);glow.position.set(0,.8,0);P_.add(glow);k.glow=glow;k.coals=coals}
})})();
function hawkerTick(){const h=hour();HAWKERS.forEach(k=>{const on=!IS&&h>=k.from&&h<k.to;if(k.props)k.props.visible=on;if(k.glow){k.glow.visible=on;k.glow.intensity=1+Math.sin(performance.now()/180)*.25}})}
function hawkerNear(){if(!S||IS)return null;const p=P(),h=hour();return HAWKERS.find(k=>h>=k.from&&h<k.to&&k.v&&!(NOBOTS&&k.walk)&&Math.hypot(p.x-k.v.x,p.y-k.v.y)<70)||null}
function hawkerActs(list){const k=hawkerNear();if(!k)return;const greet=k.g==='f'?'Auntie':'Chale';
  k.buy.slice().reverse().forEach(([what,price,fx])=>list.unshift([`${k.label.split(' ')[0]} Buy ${what} · ${cedi(price)}`,()=>{if(!spend(price))return;
    toast(`${k.name}: "${pick([`Thank you, my dear!`,`Enjoy, ${greet}!`,`Come back tomorrow o!`,`Eii, you will like it!`])}"`);try{ev('eat',k.id)}catch(e){}doAct(`Eating ${what.toLowerCase()}`,price<3?5:20,fx)},null,'b']))}
