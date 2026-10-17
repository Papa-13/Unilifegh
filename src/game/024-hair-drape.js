/* ================= braids, locs and twists that drape like real hair =================
   Each braid/loc/twist grows from its own root on the scalp (spread over the whole head, like
   partings), lies over the head, then falls with gravity: it slides over the skull, frames the face,
   rests on the shoulders, chest and back. Braids get a plaited texture, twists a spiral, locs are
   lumpy and matte; ends taper. Built once per style and shared by everyone with that style. */
const DR={headC:new THREE.Vector3(0,.0,-.006),hr:[.137,.158,.138]},drZ=z=>z>DR.headC.z?.128:.147;
function plaitM(kind,grey){const k='plait'+kind+grey;if(SM[k])return SM[k];const c=document.createElement('canvas');c.width=64;c.height=32;const g=c.getContext('2d');
  g.fillStyle=grey?'#6f6a63':'#120d0a';g.fillRect(0,0,64,32);const hi=grey?'rgba(220,215,205,':'rgba(120,92,70,';
  if(kind==='braid'){/* two offset rows of slanted lobes = a three-strand plait */for(let x=0;x<64;x+=16){[[0,1],[16,-1]].forEach(([y0,s])=>{const gr=g.createLinearGradient(x,y0,x+16,y0+16);gr.addColorStop(0,hi+'.05)');gr.addColorStop(.5,hi+'.55)');gr.addColorStop(1,hi+'.05)');g.fillStyle=gr;g.beginPath();g.ellipse(x+8+(y0?8:0),y0+8,9,5.5,s*.6,0,7);g.fill()})}
    g.strokeStyle='rgba(0,0,0,.6)';g.lineWidth=1.2;for(let x=0;x<64;x+=8){g.beginPath();g.moveTo(x,0);g.lineTo(x+4,16);g.lineTo(x,32);g.stroke()}}
  else if(kind==='twist'){/* two strands wrapped round each other: diagonal bands */for(let x=-32;x<96;x+=12){const gr=g.createLinearGradient(x,0,x+12,0);gr.addColorStop(0,hi+'.0)');gr.addColorStop(.5,hi+'.6)');gr.addColorStop(1,hi+'.0)');g.fillStyle=gr;g.beginPath();g.moveTo(x,0);g.lineTo(x+12,0);g.lineTo(x+28,32);g.lineTo(x+16,32);g.fill()}}
  else{/* locs: matted, lumpy, a few stray fibres */for(let i=0;i<500;i++){g.fillStyle=hi+(Math.random()*.4)+')';g.beginPath();g.arc(Math.random()*64,Math.random()*32,Math.random()*2.2,0,7);g.fill()}for(let i=0;i<14;i++){g.fillStyle='rgba(0,0,0,.35)';g.fillRect(Math.random()*64,0,1.5,32)}}
  for(let i=0;i<250;i++){g.fillStyle=hi+(Math.random()*.18)+')';g.fillRect(Math.random()*64,Math.random()*32,1.5,.8)}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return SM[k]=new THREE.MeshStandardMaterial({map:t,roughness:kind==='loc'?.95:.75})}
/* push a point out of the head, keep the face open, rest on neck/shoulders/torso */
function drapeFix(p,o){const c=DR.headC,[ax,ay,az]=DR.hr,rr=o.r||.01;
  const zr=drZ(p.z);let x=(p.x-c.x)/(ax+rr),y=(p.y-c.y)/(ay+rr),z=(p.z-c.z)/(zr+rr),d=Math.sqrt(x*x+y*y+z*z);if(d<1){p.x=c.x+x/d*(ax+rr);p.y=c.y+y/d*(ay+rr);p.z=c.z+z/d*(zr+rr)}
  /* face window: in front, below the bang line, strands slide to the side of the face */
  const bang=o.bang??.075;if(p.z>.02&&p.y<bang&&p.y>-.15&&Math.abs(p.x)<.118){const s=Math.sign(p.x)||1;p.x=s*(.118+rr)}
  if(p.y<-.12&&p.y>=-.2){const nr=Math.hypot(p.x,p.z+.01),need=.075+rr;if(nr<need){const k=need/(nr||1e-4);p.x*=k;p.z=(p.z+.01)*k-.01}}
  if(p.y<-.2){const ex=(p.y>-.3?(o.f?.215:.235):(o.f?.19:.2))+rr,ez=(o.f?.165:.15)+rr,e=(p.x/ex)**2+(p.z/ez)**2;if(e<1){const k=1/Math.sqrt(e||1e-4);p.x*=k;p.z*=k}}
  if(p.y<-.1&&Math.abs(p.x)>.25)p.x=Math.sign(p.x)*.25;
  return p}
/* roots spread over the scalp inside the hairline (golden-angle spiral) */
function drapeRoots(o){const R=[],N=o.n*4;for(let i=0;i<N&&R.length<o.n;i++){const y=1-(i+.5)/N*2,rr=Math.sqrt(1-y*y),ph=i*2.39996+(o.seed||0),u=new THREE.Vector3(Math.cos(ph)*rr,y,Math.sin(ph)*rr);
    const hp=new THREE.Vector3(u.x*.126,u.y*.146,u.z*.12);if(!hairlineOK(hp.x,hp.y,hp.z,o.f))continue;if(hp.y<(o.ymin??-.2))continue;if(o.skip&&o.skip(u))continue;R.push(u)}return R}
function drapeGeo(key,o){if(GC[key])return GC[key];const L=[],ends=[],down=new THREE.Vector3(0,-1,0),c=DR.headC;
  drapeRoots(o).forEach((u,i)=>{const n=u.clone(),p=new THREE.Vector3(c.x+u.x*DR.hr[0],c.y+u.y*DR.hr[1],c.z+u.z*drZ(u.z));
    /* which way it flows from the top: centre part (to the sides) or all round from the crown */
    const flow=o.flow==='part'?(u.z>-.25?new THREE.Vector3(Math.sign(u.x||.01),0,-.25):new THREE.Vector3(u.x*.4,0,-1).normalize()):new THREE.Vector3(u.x,0,u.z).normalize();
    let d=n.clone().multiplyScalar(o.lift??.35).add(flow.clone().multiplyScalar(.6)).add(down.clone().multiplyScalar(.3)).normalize();
    const len=o.len*(.85+HH(i,5)*.3)*(o.lenF?o.lenF(u):1),step=.016,pts=[p.clone()],nS=Math.max(3,Math.round(len/step));
    for(let s=0;s<nS;s++){const g=down.clone().add(flow.clone().multiplyScalar(Math.max(0,.5-s*.08)));
      if(o.wave){const w=Math.sin(s*.9+i*1.7)*o.wave*SS(.02,-.08,p.y);g.x+=w*Math.cos(i);g.z+=w*Math.sin(i)}
      if(p.y<-.12&&Math.abs(p.z)<.07&&Math.abs(p.x)>.1)g.z-=.6;                        // side strands go behind the shoulders
      d.multiplyScalar(o.stiff??.55).addScaledVector(g.normalize(),1-(o.stiff??.55)).normalize();p.addScaledVector(d,step);const q0=p.clone();drapeFix(p,o);if(q0.distanceToSquared(p)>1e-8&&p.y<-.12){d.x*=.25;d.z*=.25;d.y=Math.min(d.y,-.5);d.normalize()}pts.push(p.clone())}
    const curve=new THREE.CatmullRomCurve3(pts),seg=pts.length,rad=5,r0=o.r*(.85+HH(i,9)*.3),tube=new THREE.TubeGeometry(curve,seg,r0,rad,false);
    /* taper the ends, lumps for locs, uv along the strand scaled to its real length */
    const P=tube.attributes.position,UV=tube.attributes.uv,cv=new THREE.Vector3(),tmp=new THREE.Vector3();
    for(let a=0;a<=seg;a++){const t=a/seg;curve.getPointAt(t,cv);let s=1;if(t>.86)s*=1-(t-.86)/.14*(o.taper??.55);if(t<.04)s*=.75;if(o.lumps)s*=1+o.lumps*Math.sin(t*len*90+i);
      for(let b=0;b<=rad;b++){const k=a*(rad+1)+b;tmp.fromBufferAttribute(P,k).sub(cv).multiplyScalar(s).add(cv);P.setXYZ(k,tmp.x,tmp.y,tmp.z);UV.setX(k,UV.getX(k)*len/(o.r*2.6))}}
    tube.computeVertexNormals();L.push({geo:tube,m:new THREE.Matrix4()});ends.push(pts[pts.length-1].clone())});
  const G=mergeGeos(L);G.userData.ends=ends;G.computeBoundingSphere();return GC[key]=G}
const DRAPE={
 braids:{n:120,r:.0088,len:.68,flow:'part',kind:'braid'},
 knotless:{n:115,r:.0084,len:.5,flow:'part',kind:'braid'},
 bobbraids:{n:100,r:.0088,len:.3,flow:'part',kind:'braid',taper:.3},
 fulani:{n:80,r:.0085,len:.58,flow:'crown',kind:'braid',skip:u=>u.z>.05&&u.y>.15},
 passion:{n:90,r:.013,len:.6,flow:'part',kind:'twist',wave:.55,stiff:.5},
 goddess:{n:80,r:.012,len:.62,flow:'part',kind:'loc',wave:.8,stiff:.45,lumps:.08},
 locsf:{n:60,r:.017,len:.5,flow:'part',kind:'loc',lumps:.12},
 locsm:{n:62,r:.017,len:.3,flow:'crown',kind:'loc',lumps:.14,bang:.04,lift:.5,stiff:.62},
 halfup:{n:85,r:.0088,len:.55,flow:'crown',kind:'braid',skip:u=>u.y>.5},
 locbunf:{n:50,r:.016,len:.42,flow:'crown',kind:'loc',lumps:.12,skip:u=>u.y>.45},
 locbunm:{n:45,r:.016,len:.28,flow:'crown',kind:'loc',lumps:.12,skip:u=>u.y>.45},
 twists:{n:85,r:.0125,len:.12,flow:'crown',kind:'twist',lift:.9,stiff:.8,bang:.06,ymin:.02,taper:.3},
 twists2:{n:120,r:.0105,len:.14,flow:'crown',kind:'twist',lift:.85,stiff:.78,bang:.06,ymin:.0,taper:.3}};
function drapeHair(H,L,f,head,grey){const k=(H==='locs'||H==='locbun')?H+(f?'f':'m'):H,o=DRAPE[k];if(!o)return null;
  const G=drapeGeo('dr'+k+f,Object.assign({f},o));const m=mesh(G,plaitM(o.kind,grey),0,0,0,head);m.castShadow=false;return G}
/* cornrows: real plaited rows lying flat on the scalp from the front hairline back to the nape.
   o.rows rows, o.sp spacing, o.zig (braided designs: curved rows), o.tEnd (stop part-way, for Fulani) */
function cornrowTubes(key,o){if(GC[key])return GC[key];const L=[],c=DR.headC,rx=DR.hr[0]-.004,ry=DR.hr[1]-.004,n=o.rows||9;
  for(let i=0;i<n;i++){const x0=(i-(n-1)/2)*(o.sp||.026),pts=[];const a0=.42+Math.abs(x0)*2.2,a1=(o.tEnd??1)*(Math.PI+.62-Math.abs(x0)*1.2-a0)+a0;
    for(let k=0;k<=24;k++){const t=k/24,a=a0+(a1-a0)*t;let x=x0*(1-(o.fan||0)*SS(.5,1,t));if(o.zig)x+=Math.sin(t*Math.PI*2.2+(o.zigP||0))*o.zig*(.4+.6*t);
      const zr0=Math.cos(a)>0?.124:.143,sh=Math.sqrt(Math.max(.05,1-(x/rx)**2)),y=c.y+Math.sin(a)*ry*sh,z=c.z+Math.cos(a)*zr0*sh;pts.push(new THREE.Vector3(x,y,z))}
    const cv=new THREE.CatmullRomCurve3(pts),r=o.r||.0095,tube=new THREE.TubeGeometry(cv,40,r,5,false),UV=tube.attributes.uv;for(let k=0;k<UV.count;k++)UV.setX(k,UV.getX(k)*cv.getLength()/(r*2.4));
    L.push({geo:tube,m:new THREE.Matrix4()})}
  return GC[key]=mergeGeos(L)}
function cornrowMesh(head,o,key,grey){const m=mesh(cornrowTubes(key,o),plaitM('braid',grey),0,0,0,head);m.castShadow=false;return m}
DRAPE.cornrowsf={n:50,r:.0088,len:.5,flow:'crown',kind:'braid',skip:u=>u.y>-.15||u.z>-.35};
