/* ================= okadas and trotros in the campus traffic =================
   Some of the cars on the roads are now okadas (motorbike + rider) and trotros (minibus with a
   painted slogan and a mate hanging out of the door). They drive with the same traffic brain as cars.
   Models face +x like makeCarModel, so placeCar() works for them too. */
const TROTRO_SAYINGS=["GOD'S TIME IS THE BEST",'NO CONDITION IS PERMANENT','SANKOFA','FEAR WOMEN','ONIPA NYE','ABUSUA DO','BLESS UP','NYAME BEKYE','EYE ADOM','AYEKOO','OBI NNIM BEBREE','SUNSUM','JESUS NEVER FAILS','ALL DIE BE DIE'];
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
/* a Kumasi trotro: a white Sprinter-style high-roof minibus with a short nose, painted stripes, a destination
   board over the windscreen, a big slogan on the back, an Ashanti (AS) number plate, a loaded roof rack,
   a ladder, a little rust, and the mate hanging out of the open sliding door */
function makeTrotro(){const g=new THREE.Group(),van=new THREE.Group();g.add(van);
  const base=pick([0xf2efe8,0xf2efe8,0xeae3d2,0xf4c430]),cols=pick([[0xc8102e,0xfcd116,0x006b3f],[0x1f4fa0,0xf4c430],[0x8e2a3a,0xe8b24a],[0x111111,0xc8322b],[0x2fa84f,0xf4c430]]);
  const pb=lam(base),glass=lam(0x1d2a35),dark=lam(0x161616),chrome=stdM?stdM(0xcfd3d6,.3,{metalness:.85}):lam(0xcfd3d6),rust=lam(0x7a4a26);
  box(3.0,1.0,1.6,pb,-.35,.95,0,van);                                                    // body
  box(.72,.56,1.56,pb,1.5,.73,0,van);box(.06,.34,1.2,dark,1.87,.72,0,van);box(.3,.45,1.56,pb,1.3,1.23,0,van);[-1,1].forEach(sd=>box(.24,.3,.02,glass,1.3,1.25,sd*.79,van));   // nose, grille, cab               // short nose + grille
  for(let k=0;k<3;k++)box(.02,.03,1.0,chrome,1.9,.62+k*.1,0,van);
  const ws=box(.04,.54,1.44,glass,1.6,1.23,0,van);ws.rotation.z=.6;                    // raked windscreen
  const roof=box(3.0,.6,1.6,pb,-.35,1.75,0,van);                                         // high roof (hidden when you're inside)
  const roofTop=box(2.9,.06,1.5,lam(0xd8d2c4),-.4,2.07,0,van);
  cols.forEach((c,k)=>box(3.02,.08,1.62,lam(c),-.35,.66+k*.1,0,van));                     // painted stripes
  box(.74,.08,1.58,lam(cols[0]),1.5,.66,0,van);
  [-1,1].forEach(sd=>{for(let k=0;k<5;k++){const x=-1.55+k*.58;if(sd>0&&k===4)continue;box(.46,.4,.02,glass,x,1.62,sd*.81,van)}
    box(.02,.3,.02,dark,1.2,1.5,sd*.86,van);box(.06,.22,.14,dark,1.24,1.55,sd*.95,van);   // side mirrors
    [[-1.15],[1.15]].forEach(([x])=>box(.62,.18,.03,dark,x,.62,sd*.81,van));              // wheel arches
    box(.12,.1,.02,rust,-.8+sd*.3,.55,sd*.81,van);box(.08,.06,.02,rust,.6,.98+sd*.05,sd*.81,van)});
  box(.62,.92,.03,dark,.82,.95,.81,van);box(.6,.4,.03,glass,.82,1.62,.81,van);           // open sliding door (right side)
  box(.06,.12,1.62,chrome,1.88,.48,0,van);box(.06,.12,1.62,chrome,-1.86,.48,0,van);       // bumpers
  [-1,1].forEach(sd=>{box(.04,.1,.22,0xfff2c0,1.88,.86,sd*.6,van);box(.04,.16,.12,0xc8322b,-1.86,.95,sd*.7,van)});
  const plate=(x,ry)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(.42,.12),new THREE.MeshBasicMaterial({map:textTex('AS '+RI(1000,9999)+'-'+pick(['19','20','21','22','23']),{w:256,h:72,font:'900 40px system-ui',color:'#111',stroke:false,bg:'#f4f4f4'})}));m.position.set(x,.6,0);m.rotation.y=ry;van.add(m)};
  plate(1.915,Math.PI/2);plate(-1.885,-Math.PI/2);
  const say=pick(TROTRO_SAYINGS),stex=textTex(say,{w:512,h:96,font:'900 50px system-ui',color:'#fff',stroke:false,bg:'#'+cols[0].toString(16).padStart(6,'0')});
  const back=new THREE.Mesh(new THREE.PlaneGeometry(1.45,.3),new THREE.MeshBasicMaterial({map:stex}));back.position.set(-1.865,1.78,0);back.rotation.y=-Math.PI/2;van.add(back);
  const rearGlass=box(.03,.36,1.2,glass,-1.86,1.3,0,van);void rearGlass;
  const dest=new THREE.Mesh(new THREE.PlaneGeometry(1.35,.22),new THREE.MeshBasicMaterial({map:textTex(pick(['TECH - KEJETIA','AYEDUASE - ADUM','KOTEI - KEJETIA','BOMSO - TECH']),{w:512,h:80,font:'900 46px system-ui',color:'#111',stroke:false,bg:'#f4c430'})}));
  dest.position.set(1.16,1.8,0);dest.rotation.y=Math.PI/2;van.add(dest);
  for(let k=0;k<4;k++)box(.03,.03,.5,chrome,-1.9,.75+k*.3,-.55,van);[-.75,-.35].forEach(z=>box(.03,1.2,.03,chrome,-1.9,1.25,z,van));   // rear ladder
  [-1,1].forEach(sd=>box(.02,.22,.28,dark,-1.45,.42,sd*.62,van));                         // mudflaps
  const rack=[box(2.6,.05,1.4,lam(0x3a3a3a),-.45,2.16,0,van),box(.7,.32,.55,lam(pick([0x2f6bb5,0x8e2a3a,0xd9a537,0x2f7a4a])),-1.0,2.34,.25,van),
    box(.5,.28,.45,lam(0xe8d4a8),-.2,2.32,-.3,van),box(.22,.34,.16,lam(0xf4c430),.45,2.34,.35,van),box(.6,.22,.5,lam(0x6b4a2e),.6,2.3,-.25,van)];   // roof rack: bags, a jerry can, a box
  [[-1.15,.74],[1.15,.74],[-1.15,-.74],[1.15,-.74]].forEach(([x,z])=>wheel(van,x,z,.3,.2));
  /* the mate hangs out of the sliding door */
  const mate=makeHuman(Object.assign(randomLook('m'),{outfit:'tee',bag:'none',extra:pick(['none','cap'])}),{});mate.g.position.set(.82,.32,.86);mate.g.rotation.y=.4;mate.arms[0].rotation.x=-2.6;van.add(mate.g);
  van.scale.setScalar(.95);g.userData.trotro=true;g.userData.inner=van;g.userData.roofParts=[roof,roofTop,...rack];g.userData.seatY=.55;g.userData.scale=.95;
  g.userData.seats=[[1.0,-.4],[1.0,.35],[.3,-.4],[.3,.35],[-.45,-.4],[-.45,0],[-.45,.4],[-1.25,-.4],[-1.25,.4]];scene.add(g);return g}
