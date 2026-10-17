/* ================= campus nature & street kit =================
   Nicer trees (mango, neem, flame trees in bloom), palms, royal palms, street lamps, bushes and
   benches. Each prop is ONE mesh with vertex colours built from a cached template, so the scene
   stays cheap to draw while looking much richer. */
const ENV={T:{},M:{}};
function envMat(k){return ENV.M[k]||(ENV.M[k]=k==='leafD'?new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}):k==='glow'?new THREE.MeshBasicMaterial({color:0xfff1c2}):new THREE.MeshLambertMaterial({vertexColors:true,flatShading:k==='flat'}))}
function mergeColored(list){let n=0;const parts=list.map(({geo,m,c,j})=>{const g=(geo.index?geo.toNonIndexed():geo.clone());if(m)g.applyMatrix4(m);n+=g.attributes.position.count;return{g,c:new THREE.Color(c),j:j||0}});
  const pos=new Float32Array(n*3),nor=new Float32Array(n*3),col=new Float32Array(n*3);let o=0;
  parts.forEach(({g,c,j},pi)=>{const P=g.attributes.position;if(!g.attributes.normal)g.computeVertexNormals();pos.set(P.array,o*3);nor.set(g.attributes.normal.array,o*3);
    for(let i=0;i<P.count;i++){const v=j?1+(Math.sin(i*12.9898+pi*78.233)*43758.5453%1)*j:1;col[(o+i)*3]=c.r*v;col[(o+i)*3+1]=c.g*v;col[(o+i)*3+2]=c.b*v}o+=P.count;g.dispose()});
  const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(pos,3));G.setAttribute('normal',new THREE.BufferAttribute(nor,3));G.setAttribute('color',new THREE.BufferAttribute(col,3));G.computeBoundingSphere();return G}
const M4=(x,y,z,rx=0,ry=0,rz=0,sx=1,sy=sx,sz=sx)=>new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz)),new THREE.Vector3(sx,sy,sz));
function lumpGeo(seed){const g=new THREE.IcosahedronGeometry(1,1),p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),n=1+.16*Math.sin(x*5.1+seed)*Math.sin(y*4.3+seed*2)*Math.sin(z*4.7+seed*3);p.setXYZ(i,x*n,y*n*.82,z*n)}g.computeVertexNormals();return g}
/* broadleaf trees: a trunk that forks, and a canopy of several lumps in two or three shades */
const TREE_KINDS={mango:{leaf:[0x2c5e2a,0x356d30,0x24502a],h:1.5,w:1.25,lumps:7},neem:{leaf:[0x4c8a3a,0x5a9a44,0x3f7a34],h:1.9,w:1.05,lumps:6},
  flame:{leaf:[0xd8422a,0xe8602c,0x3a7a34],h:1.6,w:1.45,lumps:7,flat:1},shea:{leaf:[0x3a6e30,0x4a7e36,0x2f5e2a],h:1.7,w:1.15,lumps:6}};
function treeTpl(kind,v){const k=kind+v;if(ENV.T[k])return ENV.T[k];const K=TREE_KINDS[kind],L=[],bark=0x5e4430,r=(i)=>((Math.sin(i*91.7+v*13.1)*43758.5453)%1+1)%1;
  L.push({geo:new THREE.CylinderGeometry(.09,.17,K.h,7),m:M4(0,K.h/2,0),c:bark});
  [[-1,.5],[1,.35]].forEach(([s,a],i)=>L.push({geo:new THREE.CylinderGeometry(.05,.08,.8,6),m:M4(s*.18,K.h-.05,0,0,r(i)*3,-s*a*1.2),c:bark}));
  for(let i=0;i<K.lumps;i++){const a=i/K.lumps*Math.PI*2+r(i)*.6,rr=i?K.w*(.45+r(i+3)*.25):0,sz=(i?.55+r(i+7)*.3:.8)*K.w;
    L.push({geo:lumpGeo(i+v*7),m:M4(Math.cos(a)*rr,K.h+.35+(i?r(i+9)*.45:.55),Math.sin(a)*rr,0,r(i)*6,0,sz,sz*.85,sz),c:K.leaf[i%K.leaf.length],j:.12})}
  if(kind==='flame')for(let i=0;i<10;i++){const a=r(i+20)*6.3,rr=K.w*(.4+r(i+30)*.6);L.push({geo:new THREE.IcosahedronGeometry(.22,0),m:M4(Math.cos(a)*rr,K.h+.6+r(i+40)*.6,Math.sin(a)*rr),c:0xf2a03a})}
  return ENV.T[k]=mergeColored(L)}
function niceTree(par,x,y,sz=1,kind){kind=kind||(()=>{const h=(Math.sin(x*12.9+y*78.2)*43758.5)%1,q=Math.abs(h);return q<.16?'flame':q<.45?'mango':q<.75?'neem':'shea'})();
  const v=Math.abs(Math.round(x*7+y*3))%3,m=new THREE.Mesh(treeTpl(kind,v),envMat(kind==='flame'?'flat':'tree'));m.position.set(wx(x),0,wz(y));m.scale.setScalar(sz);m.rotation.y=(x*.37+y*.11)%6.3;m.castShadow=SHADOWS;m.receiveShadow=false;par.add(m);return m}
/* coconut palm: a gently curved, ringed trunk and drooping fronds */
function frondGeo(len,w,droop){const g=new THREE.PlaneGeometry(w,len,2,8),p=g.attributes.position;
  for(let i=0;i<p.count;i++){const x0=p.getX(i),t=(p.getY(i)+len/2)/len,wid=Math.sin(Math.PI*Math.min(1,t*1.1+.05))*(1-t*.3),X=x0*wid;p.setXYZ(i,X,-droop*t*t-Math.abs(X)*.35,t*len)}
  g.computeVertexNormals();return g}
function palmTpl(royal,v){const k='palm'+(royal?'R':'')+v;if(ENV.T[k])return ENV.T[k];const L=[],H=royal?3.7:3.0,lean=royal?0:.12+v*.04;
  for(let i=0;i<6;i++){const t0=i/6,y0=H*t0;L.push({geo:new THREE.CylinderGeometry(royal?.14:.1,royal?(i?.15:.2):.13,H/6+.02,8),m:M4(Math.sin(t0*1.4)*lean*H*.25,y0+H/12,0,0,0,-lean*(.6+t0)),c:royal?(i%2?0xb9b3a6:0xc9c3b6):(i%2?0x7a5e44:0x8a6c50)})}
  const top=new THREE.Vector3(Math.sin(1.4)*lean*H*.25,H,0);if(royal)L.push({geo:new THREE.CylinderGeometry(.12,.15,.7,8),m:M4(top.x,H+.3,0),c:0x5e8a3a});
  const nF=royal?11:9;for(let i=0;i<nF;i++){const a=i/nF*Math.PI*2+v,up=royal?.35:.15;L.push({geo:frondGeo(royal?1.5:1.45,royal?.42:.5,royal?1.0:.85),m:M4(top.x,H+(royal?.6:0),0,-up,a,0),c:i%2?0x3f8a3a:0x4e9a40,j:.1})}
  if(!royal)for(let i=0;i<4;i++)L.push({geo:new THREE.SphereGeometry(.09,6,5),m:M4(top.x+Math.cos(i*1.6)*.14,H-.12,Math.sin(i*1.6)*.14),c:0x6a7a2a});
  return ENV.T[k]=mergeColored(L)}
function nicePalm(par,x,y,royal){const v=Math.abs(Math.round(x+y))%3,m=new THREE.Mesh(palmTpl(royal,v),envMat('leafD'));m.position.set(wx(x),0,wz(y));m.rotation.y=(x*.21+y*.17)%6.3;m.castShadow=SHADOWS;par.add(m);return m}
/* street lamp: tapered pole, curved arm and a lamp head that glows at night */
function lampTpl(){if(ENV.T.lamp)return ENV.T.lamp;const L=[],c=0x3a3d40;L.push({geo:new THREE.CylinderGeometry(.035,.07,2.9,8),m:M4(0,1.45,0),c});L.push({geo:new THREE.CylinderGeometry(.11,.13,.25,8),m:M4(0,.12,0),c:0x55595d});
  L.push({geo:new THREE.TorusGeometry(.32,.025,5,10,Math.PI/2),m:M4(.32,2.9,0,0,0,Math.PI/2),c});L.push({geo:new THREE.BoxGeometry(.42,.07,.2),m:M4(.62,3.2,0,0,0,-.08),c:0x2a2c2e});return ENV.T.lamp=mergeColored(L)}
function niceLamp(par,x,y,face){const g=new THREE.Group();g.position.set(wx(x),0,wz(y));g.rotation.y=face||0;const m=new THREE.Mesh(lampTpl(),envMat('tree'));g.add(m);
  const h=new THREE.Mesh(ENV.T.lampG||(ENV.T.lampG=new THREE.BoxGeometry(.34,.03,.15)),envMat('glow'));h.position.set(.62,3.15,0);g.add(h);par.add(g);return g}
/* bushes: hibiscus / bougainvillea in bloom, or a clipped hedge */
function bushTpl(kind,v){const k='bush'+kind+v;if(ENV.T[k])return ENV.T[k];const L=[],fl={boug:0xd8358a,hib:0xe0402a,ixora:0xf0602a,hedge:0}[kind];
  if(kind==='hedge'){L.push({geo:new THREE.BoxGeometry(1.6,.55,.5,4,2,2),m:M4(0,.28,0),c:0x3c7a34,j:.15})}
  else{for(let i=0;i<4;i++){const a=i*1.7+v;L.push({geo:lumpGeo(i+v),m:M4(Math.cos(a)*.22,.32,Math.sin(a)*.22,0,a,0,.32,.36,.32),c:i%2?0x3a7a34:0x2f6a2c,j:.12})}
    for(let i=0;i<12;i++){const a=i*2.4+v,r=.25+(i%3)*.06;L.push({geo:new THREE.IcosahedronGeometry(.07,0),m:M4(Math.cos(a)*r,.3+(i%4)*.09,Math.sin(a)*r),c:fl})}}
  return ENV.T[k]=mergeColored(L)}
function niceBush(par,x,y,kind,sc=1,ry=0){kind=kind||['boug','hib','ixora','boug'][Math.abs(Math.round(x*3+y))%4];const m=new THREE.Mesh(bushTpl(kind,Math.abs(Math.round(x+y*2))%3),envMat('tree'));m.position.set(wx(x),0,wz(y));m.scale.setScalar(sc);m.rotation.y=ry;par.add(m);return m}
/* round bench around a tree trunk (students sit in the shade) */
function treeBenchTpl(){if(ENV.T.tb)return ENV.T.tb;const L=[],wood=0x8a5a34;for(let i=0;i<8;i++){const a=i/8*Math.PI*2;L.push({geo:new THREE.BoxGeometry(.5,.06,.26),m:M4(Math.cos(a)*.55,.45,Math.sin(a)*.55,0,-a+Math.PI/2,0),c:wood});L.push({geo:new THREE.BoxGeometry(.06,.45,.06),m:M4(Math.cos(a)*.62,.22,Math.sin(a)*.62),c:0x444444})}
  return ENV.T.tb=mergeColored(L)}
