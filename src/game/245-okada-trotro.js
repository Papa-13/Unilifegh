/* ================= okadas and trotros in the campus traffic =================
   Some of the cars on the roads are now okadas (motorbike + rider) and trotros (minibus with a
   painted slogan and a mate hanging out of the door). They drive with the same traffic brain as cars.
   Models face +x like makeCarModel, so placeCar() works for them too. */
const TROTRO_SAYINGS=['GOD IS GREAT','NO TIME TO DIE','SANKOFA','FEAR WOMEN','ONIPA NYE','ABUSUA DO','BLESS UP','MOVE ON','NYAME BEKYE','EYE ADOM'];
function okadaRider(look,o={}){const h=makeHuman(look,{});h.g.rotation.y=Math.PI/2;h.g.position.set(o.x??-.05,o.y??.36,0);
  h.legs[0].rotation.x=h.legs[1].rotation.x=-1.25;h.knees[0].rotation.x=h.knees[1].rotation.x=1.45;
  h.arms[0].rotation.x=h.arms[1].rotation.x=-1.15;h.arms[0].rotation.z=.12;h.arms[1].rotation.z=-.12;if(h.elbows)h.elbows[0].rotation.x=h.elbows[1].rotation.x=-.25;
  h.g.rotation.x=o.lean??.12;return h}
function makeOkada(){const g=new THREE.Group(),bike=new THREE.Group();g.add(bike);
  const col=pick([0xc8322b,0x1f4fa0,0x111111,0xe8e3d8,0x2f7a4a]),body=lam(col),dark=lam(0x1a1a1a),chrome=stdM?stdM(0xcfd3d6,.25,{metalness:.9}):lam(0xcfd3d6);
  [[-.62,0],[.62,0]].forEach(([x])=>{const t=mesh(new THREE.TorusGeometry(.26,.07,8,18),dark,x,.3,0,bike);mesh(cyl(.1,.1,.06,10),chrome,x,.3,0,bike).rotation.x=Math.PI/2;void t});
  box(.85,.18,.22,body,0,.6,0,bike);box(.5,.1,.3,dark,-.22,.76,0,bike);              // tank + seat
  box(.32,.2,.26,0x333333,-.02,.38,0,bike);                                             // engine
  const fork=mesh(cyl(.03,.03,.7,6),chrome,.55,.62,0,bike);fork.rotation.z=.35;
  const bar=mesh(cyl(.025,.025,.62,6),dark,.45,.98,0,bike);bar.rotation.x=Math.PI/2;box(.08,.08,.18,0xfff2c0,.66,.88,0,bike);  // handlebar + headlamp
  box(.42,.04,.26,dark,-.62,.58,0,bike);                                                // rear rack
  const ex=mesh(cyl(.04,.05,.55,8),chrome,-.35,.32,.16,bike);ex.rotation.z=Math.PI/2;      // exhaust
  const rider=okadaRider(Object.assign(randomLook('m'),{outfit:pick(['tee','jersey','shirt']),extra:'cap',bag:'none'}),{x:-.1,y:.24});g.add(rider.g);
  if(Math.random()<.5){const pass=okadaRider(randomLook(pick(['m','f'])),{x:-.75,y:.26,lean:.05});g.add(pass.g)}
  bike.scale.setScalar(1.35);g.userData.okada=true;g.userData.inner=bike;g.userData.roofParts=[];g.userData.seats=[];scene.add(g);return g}
function makeTrotro(){const g=new THREE.Group(),van=new THREE.Group();g.add(van);
  const base=pick([0xe8e3d8,0xf4c430,0xd8d8d8,0x2f6bb5]),stripe=pick([0x8e2a3a,0x2fa84f,0xc8322b,0x111111]),pb=lam(base),ps=lam(stripe);
  box(3.6,1.05,1.55,pb,0,.95,0,van);box(3.6,.18,1.57,ps,0,.72,0,van);                    // body + stripe
  const roof=box(3.4,.45,1.5,pb,-.05,1.66,0,van);                                        // roof
  const glass=lam(0x22323f);[-1,1].forEach(sd=>{for(let x=-1.3;x<1.2;x+=.62)box(.5,.36,.02,glass,x,1.25,sd*.78,van)});
  box(.04,.5,1.4,glass,1.81,1.25,0,van);box(.04,.3,1.3,glass,-1.81,1.3,0,van);           // windscreen, rear glass
  box(.04,.12,1.5,lam(0x111111),1.82,.55,0,van);box(.04,.12,1.5,lam(0x111111),-1.82,.55,0,van);
  [-1,1].forEach(sd=>{box(.04,.1,.22,0xfff2c0,1.82,.78,sd*.55,van);box(.04,.12,.18,0xc8322b,-1.82,.8,sd*.6,van)});
  const rack=[box(1.6,.06,1.3,lam(0x5a4a3a),-.2,1.9,0,van),box(.6,.3,.5,lam(pick([0x2f6bb5,0x8e2a3a,0xd9a537])),-.6,2.08,.2,van),box(.4,.24,.4,lam(0xe8d4a8),.2,2.05,-.25,van)];   // roof rack with load
  [[-1.15,.72],[1.15,.72],[-1.15,-.72],[1.15,-.72]].forEach(([x,z])=>wheel(van,x,z,.3,.2));
  const say=pick(TROTRO_SAYINGS),tex=textTex(say,{w:512,h:96,font:'900 54px system-ui',color:'#fff',stroke:false,bg:'#'+stripe.toString(16).padStart(6,'0')});
  const back=new THREE.Mesh(new THREE.PlaneGeometry(1.3,.24),new THREE.MeshBasicMaterial({map:tex}));back.position.set(-1.83,1.66,0);back.rotation.y=-Math.PI/2;van.add(back);
  const front=back.clone();front.position.set(1.83,1.66,0);front.rotation.y=Math.PI/2;van.add(front);
  /* the mate hangs out of the sliding door */
  const mate=makeHuman(Object.assign(randomLook('m'),{outfit:'tee',bag:'none',extra:'none'}),{});mate.g.position.set(.35,.32,.86);mate.g.rotation.y=.4;mate.arms[0].rotation.x=-2.6;van.add(mate.g);
  van.scale.setScalar(.95);g.userData.trotro=true;g.userData.inner=van;g.userData.roofParts=[roof,...rack];g.userData.seatY=.55;g.userData.scale=.95;
  g.userData.seats=[[1.2,-.4],[1.2,.35],[.35,-.4],[.35,.35],[-.45,-.4],[-.45,0],[-.45,.4],[-1.25,-.4],[-1.25,.4]];scene.add(g);return g}
