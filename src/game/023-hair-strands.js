/* ================= hair that hangs and hair that stands =================
   Long styles (braids, locs, twists) are built from curved strands that start along the hairline
   all round the head, frame the face at the sides and fall over the back and shoulders.
   Short coily styles (twists, sponge curls) are built from little coils that stand out of the scalp.
   Geometry is merged and cached per style, so a crowd of NPCs costs almost nothing extra. */
const HH=(i,k)=>{const x=Math.sin(i*127.1+k*311.7)*43758.5453;return x-Math.floor(x)};
/* o: n strands per row, r radius, len (how far down, head-local), rows (start heights),
   wave (amplitude), front (how far the side strands come forward), fullFront (bangs-free face) */
function strandsGeo(key,o){if(GC[key])return GC[key];const L=[],ends=[],V=(x,y,z)=>new THREE.Vector3(x,y,z);
  const n=o.n||28,r=o.r||.011,len=o.len||.4,rows=o.rows||[.055,.0],a0=o.a0??-.2,a1=1-a0,wave=o.wave||0;
  rows.forEach((y0,k)=>{for(let i=0;i<n;i++){const t=(i+(k%2)*.5+HH(i,k)*.3)/n,a=Math.PI*(a0+(a1-a0)*t),dx=Math.cos(a),dz=-Math.sin(a);
    const fr=dz>.25,side=!fr&&dz>-.35,ln=len*(.88+HH(i,k+7)*.24)*(fr?.92:1),sy=y0+(fr?-.01:0);
    /* where the strand ends up: over the chest (front pieces), behind the shoulders (sides), down the back */
    const ex=fr?dx*.14:side?dx*.16:dx*.15,ez=fr?.165:side?-.11-(1-Math.abs(dx))*.02:dz*.15;
    const pts=[V(dx*.12,sy,dz*.11),fr?V(dx*.138,sy-.06,dz*.122):V(dx*.15,sy-.05,dz*.142),V(dx*.168,-.13,dz*.15+(fr?.01:0))];
    const mid=-.13-(ln-.13)*.45,low=-ln;
    if(ln>.2){pts.push(V(fr?dx*.17:dx*.19,Math.max(mid,-.24),fr?.13:side?Math.min(dz*.15,-.04):dz*.16));pts.push(V(ex,low,ez))}
    else pts.push(V(dx*.15,low,dz*.14));
    if(wave)pts.forEach((p,j)=>{if(j>1){p.x+=Math.sin(j*2.1+i)*wave;p.z+=Math.cos(j*1.7+i)*wave}});
    const c=new THREE.CatmullRomCurve3(pts),g=new THREE.TubeGeometry(c,ln>.25?12:7,r*(.9+HH(i,k+3)*.25),5,false);
    L.push({geo:g,m:new THREE.Matrix4()});ends.push(pts[pts.length-1].clone())}});
  const G=mergeGeos(L);G.userData.ends=ends;return GC[key]=G}
/* coils standing out of the scalp (two-strand twists, sponge curls, short twists) */
function coilsGeo(key,o){if(GC[key])return GC[key];const L=[],n=o.n||70,up=new THREE.Vector3(0,1,0),down=new THREE.Vector3(0,-1,0);
  for(let i=0;i<n*3&&L.length<n;i++){const y=1-(i+.5)/(n*3)*2,rr=Math.sqrt(1-y*y),ph=i*2.39996,u=new THREE.Vector3(Math.cos(ph)*rr,y,Math.sin(ph)*rr);
    if(u.y<(u.z<-.25?-.3:(o.ymin??.08)))continue;if(u.z>.5&&u.y<.42)continue;           // keep the forehead clear
    const d=u.clone().addScaledVector(up,o.lift??.6).normalize(),ln=(o.len||.07)*(.8+HH(i,1)*.4),q=new THREE.Quaternion().setFromUnitVectors(down,d);
    const p=new THREE.Vector3(u.x*.124,.02+u.y*.135,-.012+u.z*.124);
    const geo=o.ball?new THREE.SphereGeometry(o.r||.02,7,6):tcap(o.r||.016,(o.r||.016)*.75,ln,6);
    L.push({geo,m:new THREE.Matrix4().compose(o.ball?p.clone().addScaledVector(d,.01):p,q,new THREE.Vector3(1,1,1))})}
  return GC[key]=mergeGeos(L)}
/* scalp with box-braid partings */
function braidCapM(){if(SM.bcap)return SM.bcap;const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.fillStyle='#120d0a';g.fillRect(0,0,128,128);
  for(let y=0;y<128;y+=16)for(let x=0;x<128;x+=16){const o=(y/16)%2*8;g.fillStyle='#1d1612';g.fillRect(x+o+1,y+1,14,14);g.strokeStyle='rgba(110,85,65,.28)';g.lineWidth=1;g.beginPath();for(let k=2;k<14;k+=3){g.moveTo(x+o+2,y+k);g.lineTo(x+o+14,y+k+2)}g.stroke()}
  g.fillStyle='#2e2119';for(let y=0;y<128;y+=16){g.fillRect(0,y,128,1.2);for(let x=0;x<128;x+=16)g.fillRect(x+(y/16)%2*8,y,1.2,16)}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(5,3);return SM.bcap=new THREE.MeshStandardMaterial({map:t,roughness:.85})}
/* long styles: returns true if handled */
const LONGHAIR={braids:{n:30,r:.0105,len:.52},knotless:{n:28,r:.011,len:.36},bobbraids:{n:26,r:.011,len:.2},fulani:{n:22,r:.0105,len:.44,rows:[.03]},
  passion:{n:24,r:.016,len:.46,wave:.012},goddess:{n:22,r:.015,len:.46,wave:.016},locsf:{n:20,r:.019,len:.42},locsm:{n:17,r:.019,len:.22},halfup:{n:24,r:.011,len:.42,rows:[.0]},locbunf:{n:18,r:.018,len:.3,rows:[.0]},locbunm:{n:16,r:.018,len:.2,rows:[.0]}};
function longHair(H,L,f,head,hair,gold){let k=H==='locs'||H==='locbun'?H+(f?'f':'m'):H;const o=LONGHAIR[k];if(!o)return false;
  const capM=['locs','locbun','passion','goddess'].includes(H)?hair:braidCapM();
  scalpMesh(head,f,capM,{t:.01});
  const G=strandsGeo('st'+k,o);mesh(G,hair,0,0,0,head);
  if(H==='fulani'){const cr=mesh(cornrowGeo(),hair,0,.02,-.012,head);cr.scale.set(1,1.12,1.07);cr.rotation.x=-.52;G.userData.ends.forEach((e,i)=>{if(i%2)return;const b=mesh(cyl(.014,.014,.028,8),gold,e.x,e.y+.05,e.z,head);void b})}
  if(H==='goddess'||H==='passion')G.userData.ends.forEach((e,i)=>{if(i%3)return;mesh(sph(.02,7,6),hair,e.x,e.y,e.z,head)});
  if(H==='halfup')mesh(bumpySphere(.065,'hbun'),hair,0,.19,-.05,head);
  if(H==='locbun'){mesh(bumpySphere(.07,'locbun'),hair,0,.19,-.06,head);if(!hatOn(L))for(let i=0;i<8;i++){const a=i/8*Math.PI*2;const t=mesh(tcap(.018,.015,.1,6),hair,Math.cos(a)*.045,.24,-.06+Math.sin(a)*.045,head);t.rotation.set(Math.sin(a)*2.4,0,-Math.cos(a)*2.4)}}
  return true}
function coilHair(H,L,f,head,hair){const k={twists:{n:80,len:.055,r:.017,lift:.2},twists2:{n:120,len:.07,r:.0135,lift:.15},burst:{n:95,ball:1,r:.024,lift:.1,ymin:.05}}[H];if(!k)return false;
  scalpMesh(head,f,scalpM(shortKind(L),1),{t:.007,fade:1});
  if(!hatOn(L))mesh(coilsGeo('co'+H,k),hair,0,0,0,head);return true}
/* ---------- the scalp: hair that covers the whole head like real hair ----------
   Built from the head itself, pushed out a little, and cut along a real hairline: straight across the
   forehead, a soft corner at the temples, sideburns in front of the ears, round the ears and down to
   the nape. Fade styles thin out towards the bottom (a stippled taper) the way a barber's fade does. */
const SS=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)};
function hairlineOK(x,y,z,f){const th=Math.atan2(Math.abs(x),z);
  const H=(f?.074:.08)-.016*SS(.3,.55,th)-.074*SS(.8,1.35,th)-.088*SS(1.75,2.6,th);
  if(y<H)return false;if(Math.abs(x)>.08&&Math.hypot(y-.002,z+.004)<.043)return false;return true}
function scalpGeo(f,t,fade){const key='scalp'+f+t+fade;if(GC[key])return GC[key];const B=headGeo(f,1),P=B.attributes.position,N=B.attributes.normal,UV=B.attributes.uv,ix=B.index.array;
  const pos=new Float32Array(P.count*3);for(let i=0;i<P.count;i++){const y=P.getY(i),tt=fade?t*(.35+.65*SS(-.06,.05,y)):t;pos[i*3]=P.getX(i)+N.getX(i)*tt;pos[i*3+1]=y+N.getY(i)*tt;pos[i*3+2]=P.getZ(i)+N.getZ(i)*tt}
  const ok=[];for(let i=0;i<P.count;i++)ok.push(hairlineOK(P.getX(i),P.getY(i),P.getZ(i),f));
  const idx=[];for(let k=0;k<ix.length;k+=3){const a=ix[k],b=ix[k+1],c=ix[k+2];if(ok[a]+ok[b]+ok[c]>=2)idx.push(a,b,c)}
  const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(pos,3));G.setAttribute('normal',N.clone());G.setAttribute('uv',UV.clone());G.setIndex(idx);G.computeBoundingSphere();return GC[key]=G}
/* short hair material on the scalp: stippled coils; with fade, the stipple thins out lower down */
function scalpM(kind,fade){const k='scm'+kind+fade;if(SM[k])return SM[k];const c=document.createElement('canvas');c.width=512;c.height=256;const g=c.getContext('2d');
  const base={black:'#16110d',grey:'#8f8a82',blond:'#b98a3c'}[kind]||'#16110d';g.fillStyle=base;g.fillRect(0,0,512,256);
  if(kind==='waves'){for(let y=0;y<256;y+=7){g.strokeStyle='rgba(95,75,60,.6)';g.lineWidth=2.4;g.beginPath();for(let x=0;x<=512;x+=4)g.lineTo(x,y+Math.sin(x/512*Math.PI*18)*2.2);g.stroke()}}
  else for(let i=0;i<9000;i++){const v=Math.random();g.fillStyle=kind==='blond'?`rgba(240,200,120,${v*.4})`:kind==='grey'?`rgba(230,225,215,${v*.35})`:`rgba(${60+v*40},${45+v*25},${35+v*15},${v*.4})`;g.fillRect(Math.random()*512,Math.random()*256,1.6,1.6)}
  const map=new THREE.CanvasTexture(c);map.wrapS=THREE.RepeatWrapping;const o={map,roughness:kind==='waves'?.6:.95};
  if(fade){const a=document.createElement('canvas');a.width=512;a.height=256;const h=a.getContext('2d');h.fillStyle='#000';h.fillRect(0,0,512,256);
    /* v=1 at the crown (canvas top) down to v=0 under the chin (canvas bottom); the taper sits around the ears */
    for(let y=0;y<256;y++){const v=1-y/256,dens=SS(.27,.46,v);for(let x=0;x<512;x+=2)if(Math.random()<dens){h.fillStyle='#fff';h.fillRect(x,y,2,1)}}
    o.alphaMap=new THREE.CanvasTexture(a);o.alphaTest=.5}
  return SM[k]=new THREE.MeshStandardMaterial(o)}
function scalpMesh(head,f,mat,o={}){const m=mesh(scalpGeo(f,o.t||.007,!!o.fade),mat,0,0,0,head);m.castShadow=false;return m}
const shortKind=L=>L.hair==='dyed'?'blond':L.grey?'grey':'black';
