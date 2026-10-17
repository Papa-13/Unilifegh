/* ================= campus scene ================= */
const cv=$('cv');
const renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true});renderer.setPixelRatio(Math.min(GFX==='high'?2:1.5,window.devicePixelRatio||1));
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
if(SHADOWS){renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap}
const scene=new THREE.Scene();scene.fog=new THREE.Fog(0x9fd3f0,34,100);
const camera=new THREE.PerspectiveCamera(42,16/10,.1,260);
const hemi=new THREE.HemisphereLight(0xdff1ff,0x5a4630,.8);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff0d0,.9);sun.position.set(6,14,8);scene.add(sun);scene.add(sun.target);
if(SHADOWS){sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);const c=sun.shadow.camera;c.left=-24;c.right=24;c.top=24;c.bottom=-24;c.near=1;c.far=90;sun.shadow.bias=-.0004;sun.shadow.normalBias=.03}
/* sky dome with sun, moon, stars and drifting clouds */
const SKY=(()=>{const u={top:{value:new THREE.Color(0x3d8fd6)},hor:{value:new THREE.Color(0xbfe3f5)},bot:{value:new THREE.Color(0x8fa88a)}};
  const m=new THREE.ShaderMaterial({uniforms:u,side:THREE.BackSide,depthWrite:false,fog:false,
    vertexShader:'varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:'uniform vec3 top;uniform vec3 hor;uniform vec3 bot;varying vec3 vP;void main(){float h=vP.y;vec3 c=h>0.0?mix(hor,top,pow(clamp(h,0.0,1.0),0.55)):mix(hor,bot,clamp(-h*4.0,0.0,1.0));gl_FragColor=vec4(c,1.0);}'});
  const dome=new THREE.Mesh(new THREE.SphereGeometry(200,32,16),m);dome.renderOrder=-10;scene.add(dome);
  const glow=(col,sz)=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),gr=g.createRadialGradient(64,64,4,64,64,64);gr.addColorStop(0,col);gr.addColorStop(.25,col);gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);
    const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false,fog:false,blending:THREE.AdditiveBlending}));sp.scale.set(sz,sz,1);scene.add(sp);return sp};
  const sunS=glow('rgba(255,244,214,1)',26),moonS=glow('rgba(220,230,255,1)',12);
  const sg=new THREE.BufferGeometry(),sp=[];for(let i=0;i<500;i++){const a=Math.random()*Math.PI*2,e=Math.acos(Math.random()*.95),r=190;sp.push(Math.sin(e)*Math.cos(a)*r,Math.cos(e)*r,Math.sin(e)*Math.sin(a)*r)}
  sg.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));const stars=new THREE.Points(sg,new THREE.PointsMaterial({color:0xffffff,size:1.1,sizeAttenuation:false,transparent:true,opacity:0,fog:false,depthWrite:false}));scene.add(stars);
  const cc=document.createElement('canvas');cc.width=256;cc.height=128;{const g=cc.getContext('2d');for(let i=0;i<14;i++){const x=40+Math.random()*176,y=50+Math.random()*30,r=22+Math.random()*26,gr=g.createRadialGradient(x,y,2,x,y,r);gr.addColorStop(0,'rgba(255,255,255,.95)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,256,128)}}
  const cm=new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cc),transparent:true,depthWrite:false,fog:false,opacity:.85});
  const clouds=[];for(let i=0;i<16;i++){const c=new THREE.Sprite(cm);const sc=30+Math.random()*30;c.scale.set(sc,sc*.45,1);c.userData={ox:(Math.random()-.5)*300,oz:-60-Math.random()*120,y:45+Math.random()*30};scene.add(c);clouds.push(c)}
  return{u,dome,sunS,moonS,stars,clouds,cm}})();
const WINLIT=PBR?new THREE.MeshStandardMaterial({color:0x34495e,roughness:.25,metalness:.2,emissive:0x000000}):new THREE.MeshLambertMaterial({color:0x34495e,emissive:0x000000}),
  WINDARK=PBR?new THREE.MeshStandardMaterial({color:0x34495e,roughness:.25,metalness:.2}):lam(0x34495e),WINROY=PBR?new THREE.MeshStandardMaterial({color:0x9fd3f0,roughness:.15,metalness:.3,emissive:0x000000}):lam(0x9fd3f0);
const WATER=[];
const nightLights=[];
const RHW=65,LANE=30,CURB=52,BUSDOCK=40,CS=1.6,BS=1.4;/* road half-width, lane centre offset (drive on the right), pulled-over offset */
const ROADS=MAPR.h.map(([y,a,b])=>[a,y-RHW,b-a,RHW*2]).concat(MAPR.v.map(x=>[x-RHW,0,RHW*2,MH]));
const laneOf=(x,y,dx,dy,o=LANE)=>({x:x-dy*o,y:y+dx*o});
const VMAT={};const vmat=(k,f)=>VMAT[k]||(VMAT[k]=f());
const paint=c=>vmat('p'+c,()=>new THREE.MeshStandardMaterial({color:c,roughness:.32,metalness:.45}));
const VGLASS=()=>vmat('glass',()=>new THREE.MeshStandardMaterial({color:0x16202a,roughness:.08,metalness:.7,transparent:true,opacity:.88}));
const VDARK=()=>vmat('dark',()=>new THREE.MeshStandardMaterial({color:0x1a1a1a,roughness:.7}));
const VCHROME=()=>vmat('chrome',()=>new THREE.MeshStandardMaterial({color:0xcfd3d6,roughness:.2,metalness:.9}));
const VSEAT=()=>vmat('seat',()=>new THREE.MeshStandardMaterial({color:0x2b2622,roughness:.9}));
const VHEAD=()=>vmat('head',()=>new THREE.MeshStandardMaterial({color:0xfff6dc,emissive:0xfff1c8,emissiveIntensity:.6,roughness:.2}));
const VTAIL=()=>vmat('tail',()=>new THREE.MeshStandardMaterial({color:0xc0201a,emissive:0x900000,emissiveIntensity:.5,roughness:.3}));
const VGEO={};
function vprof(key,pts,depth,bev){if(VGEO[key])return VGEO[key];const sh=new THREE.Shape();pts.forEach(([x,y],i)=>i?sh.lineTo(x,y):sh.moveTo(x,y));
  const g=new THREE.ExtrudeGeometry(sh,{depth,bevelEnabled:!!bev,bevelThickness:bev||0,bevelSize:bev||0,bevelSegments:3,curveSegments:6});g.translate(0,0,-depth/2);g.computeVertexNormals();return VGEO[key]=g}
function wheel(g,x,z,r=.17,w=.13){const t=new THREE.Mesh(VGEO['tyre'+r]||(VGEO['tyre'+r]=new THREE.CylinderGeometry(r,r,w,18)),VDARK());t.rotation.x=Math.PI/2;t.position.set(x,r,z);g.add(t);
  const rim=new THREE.Mesh(VGEO['rim'+r]||(VGEO['rim'+r]=new THREE.CylinderGeometry(r*.62,r*.62,w+.012,14)),VCHROME());rim.rotation.x=Math.PI/2;rim.position.set(x,r,z);g.add(rim);
  const hub=new THREE.Mesh(VGEO.hub||(VGEO.hub=new THREE.CylinderGeometry(.03,.03,w+.02,8)),VDARK());hub.rotation.x=Math.PI/2;hub.position.set(x,r,z);g.add(hub);t.castShadow=SHADOWS}
function vbox(g,w,h,d,mat,x,y,z){const m=new THREE.Mesh(VGEO['b'+w+h+d]||(VGEO['b'+w+h+d]=new THREE.BoxGeometry(w,h,d)),mat);m.position.set(x,y,z);g.add(m);return m}
function makeCarModel(col,taxi,o={}){const g=new THREE.Group(),car=new THREE.Group();g.add(car);const taxiTop=[];
  const body=new THREE.Mesh(vprof('body',[[-.96,.2],[.94,.2],[.98,.3],[.97,.45],[.85,.52],[.4,.585],[-.62,.6],[-.9,.57],[-.98,.46],[-.98,.28]],.8,.045),paint(col));car.add(body);body.castShadow=SHADOWS;
  const glass=new THREE.Mesh(vprof('glass',[[.42,.58],[.12,.84],[-.48,.86],[-.72,.6]],.74,.02),VGLASS());car.add(glass);
  const roof=new THREE.Mesh(vprof('roof',[[.14,.83],[-.47,.845],[-.5,.885],[.11,.875]],.76,.02),paint(col));car.add(roof);roof.castShadow=SHADOWS;
  [-1,1].forEach(sd=>{const pil=vbox(car,.05,.27,.03,paint(col),.27,.71,sd*.385);pil.rotation.z=.85;vbox(car,.04,.25,.03,paint(col),-.12,.72,sd*.4);
    vbox(car,.012,.27,.012,VDARK(),.33,.38,sd*.447);vbox(car,.012,.27,.012,VDARK(),-.22,.38,sd*.447);vbox(car,.08,.018,.012,VCHROME(),.18,.48,sd*.448);vbox(car,.08,.018,.012,VCHROME(),-.36,.48,sd*.448);
    vbox(car,.07,.045,.07,paint(col),.42,.6,sd*.46);
    vbox(car,.025,.06,.15,VHEAD(),.985,.42,sd*.27);vbox(car,.025,.06,.13,VTAIL(),-1.0,.44,sd*.28)});
  vbox(car,.03,.07,.34,VDARK(),.99,.36,0);vbox(car,.07,.07,.86,VDARK(),.98,.22,0);vbox(car,.07,.07,.86,VDARK(),-.99,.24,0);
  vbox(car,.01,.06,.2,vmat('plate',()=>new THREE.MeshStandardMaterial({color:0xf4f4f0,roughness:.5})),1.02,.3,0);vbox(car,.01,.06,.2,VMAT.plate,-1.03,.32,0);
  [[-.62,.4],[.62,.4],[-.62,-.4],[.62,-.4]].forEach(([x,z])=>wheel(car,x,z));
  if(taxi){[-1,1].forEach(sd=>{vbox(car,.36,.24,.012,paint(0xf4c430),.72,.36,sd*.449);vbox(car,.3,.24,.012,paint(0xf4c430),-.78,.36,sd*.449)});
    const sg=vbox(car,.26,.1,.14,paint(0xf4c430),-.16,.94,0);const t=new THREE.Mesh(new THREE.PlaneGeometry(.24,.08),new THREE.MeshBasicMaterial({map:textTex('TAXI',{w:128,h:48,font:'900 34px system-ui',color:'#1b1206',stroke:false,bg:'#f4c430'})}));t.position.set(-.16,.94,.071);car.add(t);const t2=t.clone();t2.position.z=-.071;t2.rotation.y=Math.PI;car.add(t2);taxiTop.push(sg,t,t2)}
  // interior: seats, dash, wheel (seen in inside view)
  const inn=new THREE.Group();car.add(inn);[-.2,.2].forEach(z=>{vbox(inn,.3,.07,.3,VSEAT(),.02,.33,z);vbox(inn,.06,.32,.3,VSEAT(),-.14,.5,z)});vbox(inn,.3,.07,.72,VSEAT(),-.46,.33,0);vbox(inn,.06,.32,.72,VSEAT(),-.62,.5,0);
  vbox(inn,.14,.12,.72,VDARK(),.36,.55,0);const sw=new THREE.Mesh(new THREE.TorusGeometry(.075,.012,6,16),VDARK());sw.position.set(.27,.6,-.2);sw.rotation.y=Math.PI/2;sw.rotation.x=.4;inn.add(sw);
  vbox(inn,1.6,.02,.76,vmat('floor',()=>new THREE.MeshStandardMaterial({color:0x3a3530,roughness:1})),-.1,.24,0);
  g.userData.doors=[1,-1].map(sd=>{const pv=new THREE.Group();pv.position.set(.34,.42,sd*.455);car.add(pv);vbox(pv,.56,.3,.025,paint(col),-.28,0,0);vbox(pv,.4,.2,.02,VGLASS(),-.27,.24,0);return pv});
  g.userData.roofParts=[glass,roof,...taxiTop];g.userData.seats=[[.02,-.2],[.02,.2],[-.46,-.22],[-.46,.22]];g.userData.seatY=.37;g.userData.scale=o.scale||CS;
  car.scale.setScalar(o.scale||CS);g.userData.inner=car;if(!o.noAdd)scene.add(g);return g}
function makeBusModel(o={}){const g=new THREE.Group(),bus=new THREE.Group();g.add(bus);const white=paint(0xf4f1ea),maroon=paint(0x8e2a3a);
  /* hollow body (skirt + walls) so you can look down into the cabin when the roof is lifted */
  const body=new THREE.Mesh(vprof('buslow',[[-1.7,.24],[1.66,.24],[1.72,.34],[1.73,.4],[-1.73,.4],[-1.73,.36]],1.12,.04),white);bus.add(body);body.castShadow=SHADOWS;
  const upW=[];[-1,1].forEach(sd=>{vbox(bus,3.44,.38,.04,white,0,.58,sd*.56);vbox(bus,3.46,.14,.03,maroon,0,.5,sd*.595);upW.push(vbox(bus,3.3,.18,.04,white,-.02,1.27,sd*.56))});
  vbox(bus,.05,.4,1.12,white,1.71,.58,0);vbox(bus,.05,.4,1.12,white,-1.71,.58,0);upW.push(vbox(bus,.05,.6,1.12,white,-1.71,1.07,0));
  const wsh=vbox(bus,.04,.42,1.08,VGLASS(),1.7,.98,0);wsh.rotation.z=-.08;
  const band=new THREE.Mesh(vprof('busglass',[[-1.62,.76],[1.5,.76],[1.66,1.18],[-1.62,1.18]],1.17,.01),VGLASS());bus.add(band);
  const pil=[];for(let x=-1.4;x<1.3;x+=.42)[-1,1].forEach(sd=>pil.push(vbox(bus,.05,.43,.02,white,x,.97,sd*.6)));
  const roof=vbox(bus,3.3,.09,1.17,white,-.02,1.33,0);const ac=vbox(bus,.8,.14,.6,paint(0xd8d8d8),-.5,1.43,0);
  vbox(bus,.02,.16,.8,VDARK(),1.74,1.18,0);const ds=new THREE.Mesh(new THREE.PlaneGeometry(.75,.12),new THREE.MeshBasicMaterial({map:textTex('CAMPUS SHUTTLE',{w:384,h:64,font:'900 40px system-ui',color:'#ffb020',stroke:false,bg:'#111111'})}));ds.position.set(1.755,1.18,0);ds.rotation.y=Math.PI/2;bus.add(ds);
  [-1,1].forEach(sd=>{vbox(bus,.025,.07,.18,VHEAD(),1.74,.42,sd*.42);vbox(bus,.025,.09,.14,VTAIL(),-1.75,.45,sd*.42)});vbox(bus,.08,.1,1.14,VDARK(),1.73,.28,0);vbox(bus,.08,.1,1.14,VDARK(),-1.74,.28,0);
  [[-1.1,.55],[1.1,.55],[-1.1,-.55],[1.1,-.55]].forEach(([x,z])=>wheel(bus,x,z,.24,.16));
  [[.58,0],[-.58,Math.PI]].forEach(([z,r])=>{const sg=new THREE.Mesh(new THREE.PlaneGeometry(2.4,.2),new THREE.MeshBasicMaterial({map:textTex('CAMPUS SHUTTLE · FREE',{w:768,h:64,font:'900 40px system-ui',color:'#ffffff',stroke:false,bg:'#8e2a3a'})}));sg.position.set(-.3,.5,z*1.06);sg.rotation.y=r;bus.add(sg)});
  const inn=new THREE.Group();bus.add(inn);vbox(inn,3.36,.02,1.08,vmat('bfloor',()=>new THREE.MeshStandardMaterial({color:0x4a4a52,roughness:1})),0,.41,0);
  const seats=[];for(let x=-1.45;x<.9;x+=.42)[-.36,-.16,.18,.38].forEach(z=>{if(x>.5&&z>0)return;vbox(inn,.2,.06,.17,maroon,x,.6,z);vbox(inn,.04,.24,.17,maroon,x-.09,.74,z);seats.push([x,z])});
  vbox(inn,.2,.06,.22,VSEAT(),1.3,.6,-.33);const sw=new THREE.Mesh(new THREE.TorusGeometry(.1,.014,6,16),VDARK());sw.position.set(1.48,.86,-.33);sw.rotation.y=Math.PI/2;sw.rotation.x=.6;inn.add(sw);
  g.userData.door=vbox(bus,.56,.86,.03,VGLASS(),1.2,.78,.585);
  g.userData.roofParts=[band,roof,ac,...pil,...upW];g.userData.seats=seats;g.userData.driver=[1.3,-.33];g.userData.seatY=.63;g.userData.scale=o.scale||BS;
  bus.scale.setScalar(o.scale||BS);g.userData.inner=bus;if(!o.noAdd)scene.add(g);return g}
function makeCarStatic(col,taxi){return makeCarModel(taxi?pick([0x2f6bb5,0x8e2a3a,0x2fa84f,0xd8d8d8]):col,taxi,{scale:1.25})}
function makeCarStatic_old(col,taxi){const g=new THREE.Group();box(1.9,.45,.9,col,0,.42,0,g);box(1.1,.38,.84,0x1d2a36,-.05,.82,0,g);[[-.6,.45],[.6,.45],[-.6,-.45],[.6,-.45]].forEach(([x,z])=>{const w=mesh(cyl(.17,.17,.12,10),lam(0x111111),x,.18,z,g);w.rotation.x=Math.PI/2});if(taxi){box(.3,.12,.18,0xf4c430,0,1.07,0,g);box(1.92,.08,.92,0x222222,0,.55,0,g)}scene.add(g);return g}
function makeBusStatic(){return makeBusModel({scale:1.2})}
function makeBusStatic_old(){const g=new THREE.Group();box(3.4,1.05,1.15,0xf4f1ea,0,.85,0,g);box(3.42,.18,1.17,0x8e2a3a,0,.48,0,g);box(3.1,.42,1.17,0x24323f,0,1.08,0,g);[[-1.1,.58],[1.1,.58],[-1.1,-.58],[1.1,-.58]].forEach(([x,z])=>{const w=mesh(cyl(.24,.24,.14,12),lam(0x111111),x,.25,z,g);w.rotation.x=Math.PI/2});scene.add(g);return g}
const SOLIDS=[],STAGE={};
