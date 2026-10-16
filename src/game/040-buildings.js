/* ================= architecture: merged, detailed buildings ================= */
const AG={box:new THREE.BoxGeometry(1,1,1),cyl:new THREE.CylinderGeometry(.5,.5,1,16),cyl8:new THREE.CylinderGeometry(.5,.5,1,8),hip:(()=>{const g=new THREE.ConeGeometry(.7071,1,4,1);g.rotateY(Math.PI/4);return g})(),
  gable:(()=>{const sh=new THREE.Shape();sh.moveTo(-.5,0);sh.lineTo(.5,0);sh.lineTo(0,1);sh.lineTo(-.5,0);const g=new THREE.ExtrudeGeometry(sh,{depth:1,bevelEnabled:false});g.translate(0,0,-.5);return g})(),
  barrel:(()=>{const g=new THREE.CylinderGeometry(.5,.5,1,20,1,false,0,Math.PI);g.rotateZ(Math.PI/2);return g})(),
  sph:new THREE.IcosahedronGeometry(.5,1),half:(()=>{const g=new THREE.CylinderGeometry(.5,.5,1,14,1,false,0,Math.PI);g.rotateX(Math.PI/2);g.rotateZ(Math.PI/2);return g})()};
function mergeGeos(list){let n=0;const parts=list.map(({geo,m})=>{const g=(geo.index?geo.toNonIndexed():geo.clone());g.applyMatrix4(m);n+=g.attributes.position.count;return g});
  const pos=new Float32Array(n*3),nor=new Float32Array(n*3),uv=new Float32Array(n*2);let o=0;
  parts.forEach(g=>{pos.set(g.attributes.position.array,o*3);nor.set(g.attributes.normal.array,o*3);if(g.attributes.uv)uv.set(g.attributes.uv.array,o*2);o+=g.attributes.position.count;g.dispose()});
  const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(pos,3));G.setAttribute('normal',new THREE.BufferAttribute(nor,3));G.setAttribute('uv',new THREE.BufferAttribute(uv,2));G.computeBoundingSphere();return G}
const ATEX={};function atex(k,draw,rep){const key=k+rep;if(ATEX[key])return ATEX[key];const c=document.createElement('canvas');c.width=c.height=128;draw(c.getContext('2d'));const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep,rep);return ATEX[key]=t}
const brickT=()=>atex('brick',g=>{g.fillStyle='#b0563a';g.fillRect(0,0,128,128);g.fillStyle='#d9c9b0';for(let y=0;y<128;y+=16){g.fillRect(0,y,128,2);for(let x=(y/16%2)*16;x<128;x+=32)g.fillRect(x,y,2,16)}for(let i=0;i<60;i++){g.fillStyle=`rgba(${80+Math.random()*60|0},30,20,.18)`;g.fillRect(Math.random()*128,Math.random()*128,14,6)}},2);
const metalT=()=>atex('metal',g=>{g.fillStyle='#aeb5bb';g.fillRect(0,0,128,128);for(let x=0;x<128;x+=10){g.fillStyle='rgba(0,0,0,.18)';g.fillRect(x,0,3,128);g.fillStyle='rgba(255,255,255,.25)';g.fillRect(x+4,0,2,128)}},2);
const corrT=c=>atex('corr'+c,g=>{g.fillStyle=c;g.fillRect(0,0,128,128);for(let x=0;x<128;x+=8){g.fillStyle='rgba(0,0,0,.22)';g.fillRect(x,0,3,128)}},3);
const stripeT=(a,b)=>atex('str'+a+b,g=>{for(let x=0;x<128;x+=32){g.fillStyle=a;g.fillRect(x,0,16,128);g.fillStyle=b;g.fillRect(x+16,0,16,128)}},1);
function amats(b){const L=c=>new THREE.MeshStandardMaterial({color:c,roughness:.85}),tc=new THREE.Color(b.c).lerp(new THREE.Color(0xffffff),.55).getHex(),
  rh='#'+b.roof.toString(16).padStart(6,'0');
  return{wall:L(b.c),trim:L(tc),stone:L(0x9a9184),roof:L(b.roof),accent:L(b.roof),dark:L(0x2a2522),wood:L(0x6b4a2e),white:L(0xf4f1ea),soil:L(0x5a3e28),plant:L(0x3f7f3a),plant2:L(0x2f6a32),
    flowerA:L(pick([0xe0483a,0xe8b24a,0xe58fb0,0xffffff])),flowerB:L(pick([0xb44cff,0xf2c230,0xff7a3a])),metal:new THREE.MeshStandardMaterial({color:0xc9ced2,map:metalT(),roughness:.5,metalness:.4}),
    tank:L(0x1d1d1d),brick:new THREE.MeshStandardMaterial({map:brickT(),roughness:.9}),corr:new THREE.MeshStandardMaterial({map:corrT(rh),roughness:.6,metalness:.3}),
    awning:new THREE.MeshStandardMaterial({map:stripeT(rh,'#f4f1ea'),roughness:.8,side:THREE.DoubleSide}),cloth:L(pick([0x2f6bb5,0xe0483a,0xf2c230,0x4fb87a])),cloth2:L(pick([0xffffff,0xe58fb0,0x8e2a3a])),
    gold:new THREE.MeshStandardMaterial({color:0xd9a537,roughness:.3,metalness:.8}),neon:new THREE.MeshBasicMaterial({color:0xff3cac}),neon2:new THREE.MeshBasicMaterial({color:0x3cd4ff}),
    stain:new THREE.MeshStandardMaterial({color:0x3a6fd0,emissive:0x1a3a90,emissiveIntensity:.5,roughness:.2}),stain2:new THREE.MeshStandardMaterial({color:0xd04a3a,emissive:0x7a1a10,emissiveIntensity:.5,roughness:.2}),
    glassL:WINLIT,glassD:WINDARK,glassR:WINROY,cur:(()=>{const m=new THREE.MeshStandardMaterial({color:0x9fd3f0,roughness:.05,metalness:.6,transparent:true,opacity:.75});m.userData.op=.75;return m})()}}
function buildArch(b,s,cx,cz,w,d,f){
  const B={},M=new THREE.Matrix4(),Q=new THREE.Quaternion(),E=new THREE.Euler(),V=new THREE.Vector3(),SC=new THREE.Vector3();
  const add=(k,geo,x,y,z,ry,sx,sy,sz,rx=0,rz=0)=>{E.set(rx,ry,rz,'YXZ');Q.setFromEuler(E);M.compose(V.set(x,y,z),Q,SC.set(sx,sy,sz));(B[k]=B[k]||[]).push({geo,m:M.clone()})};
  const bx=(k,sx,sy,sz,x,y,z,ry=0)=>add(k,AG.box,x,y,z,ry,sx,sy,sz);
  const H=b.ht,id=b.id,zone=b.zone,home=!!b.home;
  const style=id==='senate'?'senate':id==='lib'?'library':id==='greathall'?'hall':id==='chapel'?'chapel':id==='club'?'club':id==='mall'?'mall':(id==='unity'||id==='bank')?'bank':id==='royal'?'tower':
    (id==='gym'||id==='hall')?'sports':id==='pavilion'?'pavilion':home?'hostel':zone==='c'?'shop':'college';
  const roofT={hostel:id==='lodge'?'corr':'hip',chapel:'gable',sports:id==='hall'?'barrel':'flat',college:['canteen','office','print','clinic'].includes(id)?'hip':'flat',pavilion:'flat'}[style]||'flat';
  const floors=Math.max(1,Math.round((H-.2)/1.2)),fh=(H-.2)/floors;
  const F=[{n:[0,f],ry:f>0?0:Math.PI,L:w,o:d/2,front:1},{n:[0,-f],ry:f>0?Math.PI:0,L:w,o:d/2},{n:[1,0],ry:Math.PI/2,L:d,o:w/2},{n:[-1,0],ry:-Math.PI/2,L:d,o:w/2}];
  const fp=(Fc,a,out)=>[cx+Fc.n[0]*(Fc.o+out)+Math.cos(Fc.ry)*a,cz+Fc.n[1]*(Fc.o+out)-Math.sin(Fc.ry)*a];
  const fb=(Fc,k,sw,sh,sd,a,y,out=0)=>{const [x,z]=fp(Fc,a,out+sd/2);bx(k,sw,sh,sd,x,y,z,Fc.ry)};
  const fa=(Fc,k,geo,sw,sh,sd,a,y,out=0,rx=0)=>{const [x,z]=fp(Fc,a,out);add(k,geo,x,y,z,Fc.ry,sw,sh,sd,rx);if(geo===AG.cyl&&y<2.5&&out>.2&&sw<.4)solidC(x/U+MW/2,z/U+MH/2,9);if(geo===AG.sph&&k==='plant'&&out>.3)solidC(x/U+MW/2,z/U+MH/2,10)};
  const FR=F[0],aD=(b.door[0]-(b.x+b.w/2))*U*(f>0?1:-1);
  // base, body, bands, cornice
  bx('stone',w+.34,.24,d+.34,cx,.12,cz);
  const wallK=style==='sports'&&id==='gym'?'metal':'wall';bx(wallK,w,H-.2,d,cx,.2+(H-.2)/2,cz);
  if(style==='college'||style==='library'){F.forEach(Fc=>{[-1,1].forEach(sd=>fb(Fc,'brick',.7,H-.25,.05,sd*(Fc.L/2-.35),.2+(H-.25)/2,0))})}
  for(let i=1;i<floors;i++)bx('trim',w+.08,.07,d+.08,cx,.2+i*fh,cz);
  // windows
  const lit=()=>Math.random()<.42?'glassL':'glassD';
  F.forEach((Fc,fi)=>{const sp=style==='hall'?1.35:1.05,n=Math.max(1,Math.floor((Fc.L-.9)/sp)),a0=-(n-1)*sp/2;
    for(let r=0;r<floors;r++){const y=.2+r*fh+fh*.55;
      if(style==='tower'){fb(Fc,'glassR',Fc.L-.3,fh*.62,.05,0,y,0);fb(Fc,'trim',Fc.L+.05,.09,.18,0,.2+r*fh+.04,0);continue}
      if((Fc.front||(fi===1&&f<0))&&r===0&&(style==='shop'||style==='mall'||style==='bank'||style==='club'))continue;
      if(Fc.front&&style==='library'){continue}
      for(let i=0;i<n;i++){const a=a0+i*sp;if(Fc.front&&r===0&&Math.abs(a-aD)<1.15)continue;if(Fc.front&&style==='senate'&&r===0&&Math.abs(a-aD)<2.2)continue;
        const wh=style==='hall'?fh*.7:.62;
        fb(Fc,'trim',.64,wh+.14,.05,a,y,0);fb(Fc,style==='chapel'?(i%2?'stain':'stain2'):lit(),.5,wh,.05,a,y,.02);fb(Fc,'trim',.74,.05,.12,a,y-wh/2-.06,0);
        if(style==='hall'||style==='chapel')fa(Fc,'trim',AG.half,.64,.32,.07,a,y+wh/2,0.0);
        if(style==='college'&&r>=1){fb(Fc,'trim',.78,.05,.28,a,y+wh/2+.1,0);fb(Fc,'trim',.05,wh+.2,.28,a+.43,y,0)}
        if(home&&r>=1&&Fc.front&&Math.random()<.25)fb(Fc,Math.random()<.5?'cloth':'cloth2',.4,.3,.02,a+(Math.random()-.5)*.2,y-.12,.42);
        if(home&&!Fc.front&&fi>=2&&Math.random()<.35)fb(Fc,'metal',.38,.26,.22,a,y-.42,0)}}});
  // style specifics
  const ent=()=>{fb(FR,'dark',1.1,1.45,.08,aD,.2+.73,0);fb(FR,'glassD',.42,.9,.02,aD-.25,.2+.85,.08);fb(FR,'glassD',.42,.9,.02,aD+.25,.2+.85,.08);fb(FR,'gold',.03,.18,.04,aD,.2+.75,.09);
    fb(FR,'trim',2,.09,1.1,aD,1.82,0);fb(FR,'stone',2.2,.1,.55,aD,.05,.2);fb(FR,'stone',2,.1,.3,aD,.15,.05);
    [-1,1].forEach(sd=>{fb(FR,'stone',.5,.36,.5,aD+sd*1.45,.18,.25);fa(FR,'plant',AG.sph,.55,.5,.55,aD+sd*1.45,.62,.5)})};
  const beds=()=>{const L=FR.L;[[-L/2+.4,aD-1.8],[aD+1.8,L/2-.4]].forEach(([a1,a2])=>{if(a2-a1<.6)return;const m=(a1+a2)/2,wl=a2-a1;fb(FR,'stone',wl,.2,.42,m,.1,.05);fb(FR,'soil',wl-.06,.04,.36,m,.21,.08);
    for(let t=a1+.15;t<a2-.1;t+=.22)fa(FR,(t*7|0)%2?'flowerA':'flowerB',AG.sph,.13,.15,.13,t,.3,.26);for(let t=a1+.3;t<a2-.2;t+=.7)fa(FR,'plant2',AG.sph,.32,.38,.3,t,.36,.13)})};
  let signY=H-.45,signOut=.16,signW=4.2,signBg=null;
  if(style==='college'){ent();beds();[-1,1].forEach(sd=>{fb(FR,'accent',.32,Math.min(1.6,H-1.4),.04,aD+sd*1.4,H-.95,.01);fb(FR,'gold',.36,.04,.05,aD+sd*1.4,H-.12,.01)});
    if(roofT==='flat'){bx('trim',w+.5,.14,d+.5,cx,H+.05,cz);bx('wall',w+.1,.28,d+.1,cx,H+.25,cz);for(let i=0;i<2;i++)add('tank',AG.cyl,cx-w/2+.8+i*.75,H+.62,cz-f*(d/2-.8),0,.55,.75,.55)}}
  if(style==='library'){fb(FR,'cur',FR.L-1.4,H-.85,.06,0,.2+(H-.85)/2+.15,.02);for(let a=-FR.L/2+.7;a<=FR.L/2-.6;a+=.6)fb(FR,'trim',.05,H-.85,.1,a,.2+(H-.85)/2+.15,.02);for(let y=1.3;y<H-.4;y+=1.1)fb(FR,'trim',FR.L-1.4,.05,.1,0,y,.02);
    fb(FR,'dark',1.2,1.5,.08,aD,.95,.06);bx('trim',w+1.2,.2,d+1.2,cx,H+.1,cz);bx('wall',w-1.4,.5,d-1.4,cx,H+.45,cz);beds();[-1,1].forEach(sd=>fa(FR,'white',AG.cyl,.22,H-.2,.22,sd*(FR.L/2+.35),.2+(H-.2)/2,.35))}
  if(style==='senate'){bx('trim',w+.4,.16,d+.4,cx,H+.08,cz);bx('wall',w+.16,.32,d+.16,cx,H+.3,cz);const cw=4.4,ch=H-.35;
    for(let i=0;i<6;i++){const a=aD-cw/2+i*cw/5;fa(FR,'white',AG.cyl,.28,ch-.2,.28,a,.2+(ch-.2)/2+.1,1.25);fb(FR,'white',.36,.12,.36,a,.26,1.07);fb(FR,'white',.38,.1,.38,a,ch+.02,1.06)}
    fb(FR,'white',cw+.7,.32,1.55,aD,ch+.22,0);fa(FR,'white',AG.gable,cw+.9,.85,1.5,aD,ch+.38,.78);fb(FR,'stone',cw+1.2,.12,1.9,aD,.06,0);fb(FR,'stone',cw+.9,.12,1.5,aD,.18,0);fb(FR,'dark',1.2,1.7,.08,aD,1.05,0);
    [-1,1].forEach(sd=>{fa(FR,'metal',AG.cyl8,.06,3.2,.06,aD+sd*(cw/2+1.1),1.6,1.9);fb(FR,sd<0?'stain2':'accent',.7,.42,.02,aD+sd*(cw/2+1.1)+.35,2.95,1.9)});beds();signY=ch+.22;signOut=1.6;signW=cw}
  if(style==='hall'){bx('trim',w+.4,.18,d+.4,cx,H+.09,cz);const tw=2.4;fb(FR,'wall',tw,H+1.4,1.2,aD,(H+1.4)/2,-.6);fb(FR,'trim',tw+.2,.15,1.4,aD,H+1.45,-.7);fa(FR,'roof',AG.hip,tw+.1,1.1,1.3,aD,H+2.05,-.6);
    fb(FR,'white',1.0,1.0,.05,aD,H+.6,.02);fa(FR,'gold',AG.cyl,.7,.03,.7,aD,H+.6,.06,Math.PI/2);ent();beds();signY=H-.3;signW=3.4}
  if(style==='chapel'){add('roof',AG.gable,cx,H,cz,Math.PI/2*(f>0?1:1),d+.35,1.7,w+.35);const tx=-FR.L/2+.7;fb(FR,'wall',1.1,H+2.2,1.1,tx,(H+2.2)/2,-.4);add('roof',AG.hip,...(()=>{const [x,z]=fp(FR,tx,-.95);return[x,H+2.75,z]})(),0,1.2,1.1,1.2);
    {const [x,z]=fp(FR,tx,-.4);bx('white',.08,.7,.08,x,H+3.6,z);bx('white',.4,.08,.08,x,H+3.75,z)}fb(FR,'stain',.5,.9,.05,tx,H+1.2,.15);ent();beds();signY=H-.5;signW=3}
  if(style==='hostel'){
    if(id!=='lodge')[F[0],F[1]].forEach(Fc=>{for(let r=1;r<floors;r++){const y=.2+r*fh;fb(Fc,'stone',Fc.L-.5,.08,.5,0,y,0);fb(Fc,'trim',Fc.L-.5,.05,.04,0,y+.42,.48);for(let a=-Fc.L/2+.3;a<Fc.L/2-.2;a+=.22)fb(Fc,'trim',.025,.42,.025,a,y+.21,.48);for(let a=-Fc.L/2+1;a<Fc.L/2-.5;a+=1.6)if(Math.random()<.5)fb(Fc,Math.random()<.5?'cloth':'cloth2',.32,.34,.02,a,y+.62,.4)}})
    const stx=FR.L/2-.45;fb(FR,'accent',.9,H+.4,.2,stx,(H+.4)/2,0);for(let r=0;r<floors;r++)fb(FR,'glassD',.18,fh*.6,.02,stx,.2+r*fh+fh*.5,.2);
    if(roofT==='corr'){add('corr',AG.gable,cx,H,cz,f>0?Math.PI/2:Math.PI/2,d+.6,.9,w+.6);bx('trim',w+.6,.08,d+.6,cx,H,cz)}
    else{bx('trim',w+.7,.12,d+.7,cx,H+.02,cz);add('roof',AG.hip,cx,H+.48,cz,0,w+.7,.9,d+.7)}
    for(let i=0;i<3;i++)add('tank',AG.cyl,cx+w/2-.7-i*.7,roofT==='corr'?H+.25:H+.75,cz-f*(d/2-.6),0,.5,.65,.5);ent();beds();signY=Math.min(H-.45,1.6+fh*.4);signOut=.22}
  if(style==='tower'){bx('trim',w+.3,.2,d+.3,cx,H+.1,cz);bx('gold',w*.5,.6,d*.5,cx,H+.5,cz);F.forEach(Fc=>{for(let a=-Fc.L/2+.2;a<=Fc.L/2-.1;a+=.95)fb(Fc,'gold',.07,H-.2,.12,a,.2+(H-.2)/2,0)});
    fb(FR,'gold',2.6,.12,1.6,aD,1.9,0);[-1,1].forEach(sd=>fa(FR,'gold',AG.cyl,.12,1.8,.12,aD+sd*1.1,1.0,1.3));fb(FR,'stone',3,.1,1.8,aD,.05,.1);fb(FR,'glassR',1.4,1.5,.05,aD,.95,0);beds();signY=2.25;signOut=.9;signW=2.6;signBg=0x1b1f26}
  if(style==='shop'||style==='mall'||style==='bank'||style==='club'){
    const gl=style==='club'?'dark':'cur';(f<0?[FR,F[1]]:[FR]).forEach((SF,si)=>{fb(SF,gl,SF.L-.5,1.35,.05,0,.95,.01);for(let a=-SF.L/2+.25;a<=SF.L/2-.2;a+=SF.L>6?1.2:.9)fb(SF,'dark',.06,1.4,.08,a,.95,.02);
    fb(SF,'dark',1.1,1.45,.06,si?0:aD,.93,.03);
    if(style==='shop'){fa(SF,'awning',AG.box,SF.L-.3,.05,.9,0,1.85,.4,.32);for(let a=-SF.L/2+.3;a<SF.L/2;a+=1.8)fb(SF,'metal',.04,.6,.04,a,1.55,.75);fb(SF,'accent',SF.L-.2,.6,.12,0,2.25,0)}
    if(si&&style!=='shop'){fb(SF,'trim',3,.1,1.2,0,1.9,0);fb(SF,'accent',SF.L-.2,.5,.12,0,2.35,0)}if(si){const L=SF.L;[[-L/2+.4,-.9],[.9,L/2-.4]].forEach(([a1,a2])=>{const m=(a1+a2)/2;fb(SF,'stone',a2-a1,.2,.42,m,.1,.05);for(let t=a1+.15;t<a2-.1;t+=.22)fa(SF,(t*7|0)%2?'flowerA':'flowerB',AG.sph,.13,.15,.13,t,.3,.26)})}});
    if(style==='mall'){fb(FR,'cur',2.6,H-.2,.6,aD,.2+(H-.2)/2,-.1);for(let y=.8;y<H;y+=.7)fb(FR,'trim',2.62,.04,.62,aD,y,-.1);fb(FR,'trim',3.6,.1,1.6,aD,1.9,0);[-1,1].forEach(sd=>fa(FR,'metal',AG.cyl8,.08,1.8,.08,aD+sd*1.6,.95,1.5));fb(FR,'accent',FR.L-.2,.5,.12,-2.2*Math.sign(aD||1),2.4,0)}
    if(style==='bank'){for(let i=0;i<4;i++)fa(FR,'white',AG.cyl,.24,H-.5,.24,aD-1.8+i*1.2,.2+(H-.5)/2,.5);fb(FR,'white',4.4,.3,.8,aD,H-.15,.1);fb(FR,'stone',4.4,.12,1.1,aD,.06,.1)}
    if(style==='club'){F.forEach(Fc=>{fb(Fc,'neon',Fc.L+.02,.05,.03,0,H-.1,0);fb(Fc,'neon2',Fc.L+.02,.05,.03,0,.32,0)});fb(FR,'neon',.05,1.6,.03,aD-.65,1.05,.06);fb(FR,'neon',.05,1.6,.03,aD+.65,1.05,.06);fb(FR,'neon2',1.35,.05,.03,aD,1.85,.06)}
    bx('trim',w+.3,.15,d+.3,cx,H+.07,cz);bx('wall',w+.1,.35,d+.1,cx,H+.3,cz);for(let i=0;i<2;i++)bx('metal',.6,.35,.5,cx-1+i*1.4,H+.62,cz-f*(d/2-.8));beds()}
  if(style==='sports'){if(id==='hall'){add('roof',AG.barrel,cx,H,cz,0,w+.3,1.6,d+.2);fb(FR,'cur',FR.L-1,1.1,.05,0,H-.8,.02)}else{fb(FR,'cur',FR.L-.6,1.0,.05,0,H-.9,.02);bx('trim',w+.3,.15,d+.3,cx,H+.07,cz)}ent();signY=id==='hall'?H-.25:H-.4}
  if(style==='pavilion'){bx('trim',w+.4,.15,d+.4,cx,H+.07,cz);fb(FR,'roof',FR.L+.4,.12,1.8,0,H+.05,0);for(let a=-FR.L/2+.3;a<=FR.L/2;a+=1.4)fa(FR,'white',AG.cyl8,.1,H-.2,.1,a,.2+(H-.2)/2,1.65);ent()}
  if(roofT==='hip'&&style==='college'){bx('trim',w+.6,.12,d+.6,cx,H+.02,cz);add('roof',AG.hip,cx,H+.45,cz,0,w+.6,.85,d+.6)}
  if(id==='clinic'){fb(FR,'white',.5,.15,.05,FR.L/2-.6,H-.4,.04);fb(FR,'white',.15,.5,.05,FR.L/2-.6,H-.4,.04);fb(FR,'stain2',.42,.1,.04,FR.L/2-.6,H-.4,.06);fb(FR,'stain2',.1,.42,.04,FR.L/2-.6,H-.4,.065)}
  // merge into one mesh per material
  const mats=amats(b),out=[];for(const k in B){const m=new THREE.Mesh(mergeGeos(B[k]),mats[k]);m.castShadow=SHADOWS&&!/glass|cur|neon/.test(k);m.receiveShadow=SHADOWS;s.add(m);out.push(m)}
  return{signY,signOut,signW,signBg,meshes:out}}
const solidC=(x,y,r)=>SOLIDS.push({t:0,x,y,r}),solidR=(x1,y1,x2,y2)=>SOLIDS.push({t:1,x1,y1,x2,y2}),solidE=(x,y,rx,ry)=>SOLIDS.push({t:2,x,y,rx,ry}),solidBox=(x,y,w,h)=>solidR(x-w/2,y-h/2,x+w/2,y+h/2);
(function build(){
  const s=scene;
  const ground=mesh(new THREE.PlaneGeometry(MW*U+40,MH*U+40),lam(0x6f9a4c),0,-.02,0,s);ground.rotation.x=-Math.PI/2;
  const road=(x,y,w,h,c=0x56514b)=>{const r=mesh(new THREE.PlaneGeometry(w*U,h*U),lam(c),wx(x+w/2),0,wz(y+h/2),s);r.rotation.x=-Math.PI/2};
  ROADS.forEach(r=>road(...r));
  {const dash=(()=>{const c=document.createElement('canvas');c.width=64;c.height=8;const g=c.getContext('2d');g.fillStyle='#f2c230';g.fillRect(0,0,36,8);const t=new THREE.CanvasTexture(c);t.wrapS=THREE.RepeatWrapping;return t})();
   const CX=[400,1600,2550,3850],CY=[420,900,2350,1560],edgeM=basic(0xe9e6df),curbM=lam(0xb9b2a6);
   const seg=(a,b,cross,fn)=>{const cuts=cross.filter(c=>c>a&&c<b).sort((p,q)=>p-q);let s0=a;cuts.concat([b+RHW]).forEach(c=>{const e=Math.min(b,c-RHW);if(e-s0>20)fn(s0,e);s0=c+RHW})};
   const strip=(x1,y1,x2,y2,mat,h=0)=>{const w=x2-x1,d=y2-y1;if(h){box(w*U,h,d*U,mat,wx(x1+w/2),h/2,wz(y1+d/2),s)}else{const m=mesh(new THREE.PlaneGeometry(w*U,d*U),mat,wx(x1+w/2),.006,wz(y1+d/2),s);m.rotation.x=-Math.PI/2;return m}};
   ROADS.forEach(([x,y,w,h])=>{const hz=w>h;if(hz){const cy=y+h/2;seg(x,x+w,CX,(a,b)=>{const m=strip(a,cy-1.5,b,cy+1.5,new THREE.MeshBasicMaterial({map:(()=>{const t=dash.clone();t.needsUpdate=true;t.repeat.set((b-a)/70,1);return t})(),transparent:true}));
        [-1,1].forEach(sd=>{strip(a,cy+sd*(RHW-6)-1.2,b,cy+sd*(RHW-6)+1.2,edgeM);strip(a,sd<0?y-5:y+h,b,sd<0?y:y+h+5,curbM,.07)})})}
     else{const cx=x+w/2;seg(y,y+h,CY.filter(c=>c<1600||x<1600),(a,b)=>{const t=dash.clone();t.needsUpdate=true;t.repeat.set((b-a)/70,1);const m=mesh(new THREE.PlaneGeometry((b-a)*U,3*U),new THREE.MeshBasicMaterial({map:t,transparent:true}),wx(cx),.006,wz((a+b)/2),s);m.rotation.x=-Math.PI/2;m.rotation.z=Math.PI/2;
        [-1,1].forEach(sd=>{strip(cx+sd*(RHW-6)-1.2,a,cx+sd*(RHW-6)+1.2,b,edgeM);strip(sd<0?x-5:x+w,a,sd<0?x:x+w+5,b,curbM,.07)})})}})}
  B.forEach(b=>{if(b.open)return;const [dx,dy]=b.door;const bot=dy>b.y+b.h/2;let y1=bot?b.y+b.h:dy-8,y2=bot?dy+10:b.y;
    ROADS.forEach(([rx,ry,rw,rh])=>{if(rw<rh||dx<rx||dx>rx+rw)return;if(bot&&ry>=y2&&ry-y2<160)y2=ry;if(!bot&&ry+rh<=y1&&y1-(ry+rh)<160)y1=ry+rh});road(dx-20,y1,40,y2-y1,0x8a8378)});
  B.forEach(b=>{
    const c0=s.children.length;
    const cx=wx(b.x+b.w/2),cz=wz(b.y+b.h/2),w=b.w*U,d=b.h*U;
    if(b.open){if(b.id!=='lake'){const f=mesh(new THREE.PlaneGeometry(w,d),lam(b.c),cx,.005,cz,s);f.rotation.x=-Math.PI/2}}
    else{solidR(b.x-3,b.y-3,b.x+b.w+3,b.y+b.h+3);
      const front=b.door[1]>b.y+b.h/2?1:-1,fz=cz+front*(d/2+.01);
      const so=buildArch(b,s,cx,cz,w,d,front);
      const sw=Math.min(w-.6,so.signW||4.2),sign=mesh(new THREE.PlaneGeometry(sw,.55),new THREE.MeshBasicMaterial({map:textTex(b.name,{font:'800 46px system-ui, sans-serif',color:'#f6f0e8',stroke:false,bg:'#'+(so.signBg||b.roof).toString(16).padStart(6,'0')})}),cx,so.signY,cz+front*(d/2+so.signOut),s);
      if(front<0){sign.rotation.y=Math.PI;const s2=sign.clone();s2.rotation.y=0;s2.position.z=cz+(d/2+(b.zone==='c'?.2:.16));s2.position.y=b.zone==='c'&&!b.home?2.35:Math.min(so.signY,b.ht-.45);s.add(s2)}
    }
    const t=sprite(b.name,'#ffffff',.8);t.position.set(cx,(b.ht||0)+1.2,cz);s.add(t);
    b.meshes=b.open?[]:s.children.slice(c0).filter(m=>m.material&&!m.isSprite);b.faded=false;
  });
  const D0=s.children.length,S0=SOLIDS.length;
  const tree=(x,y,sz=1)=>{solidC(x,y,11*sz);mesh(cyl(.12*sz,.18*sz,1.6*sz,8),lam(0x6b4a2e),wx(x),.8*sz,wz(y),s);mesh(sph(.9*sz,12,10),lam(0x2f6a32),wx(x),2*sz,wz(y),s)};
  const palm=(x,y)=>{solidC(x,y,8);mesh(cyl(.1,.15,2.4,8),lam(0x7a5a3a),wx(x),1.2,wz(y),s);for(let i=0;i<7;i++){const l=box(1.1,.04,.28,0x3f8a3a,wx(x)+Math.cos(i)*.4,2.4,wz(y)+Math.sin(i)*.4,s);l.rotation.y=i;l.rotation.z=-.35}};
  [[90,400],[270,400],[110,540],[260,540],[60,470]].forEach(([x,y])=>tree(x,y,1.1));
  {const p=mesh(new THREE.CircleGeometry(1.4,30),new THREE.MeshLambertMaterial({color:0x3a8fb0,emissive:0x0b3446}),wx(190),.02,wz(470),s);p.rotation.x=-Math.PI/2;box(1.6,.35,.5,0x7a5a3a,wx(150),.18,wz(420),s)}
  for(let i=0;i<5;i++){const x=450+i*60,y=720;box(.9,.8,.6,0x5a3c24,wx(x),.4,wz(y),s);const cn=mesh(new THREE.ConeGeometry(.75,.45,4),lam([0xe0483a,0xe8b24a,0x2f7a4a,0x5aa9e6,0xe58fb0][i]),wx(x),1.55,wz(y),s);cn.rotation.y=Math.PI/4;mesh(cyl(.02,.02,1.4,5),lam(0xdddddd),wx(x),.7,wz(y)+.25,s)}
  for(let i=0;i<4;i++){const x=450+i*82,y=850;box(1.2,.75,.5,0x8a6a4a,wx(x),.38,wz(y),s);mesh(cyl(.25,.25,.05,10),lam(0xd9a537),wx(x),.78,wz(y),s)}
  const bulbs=new THREE.Group();for(let i=0;i<24;i++)mesh(sph(.06,6,6),basic([0xffd27a,0xff8a6a,0x9ad7ff][i%3]),wx(430+i*13),1.95+Math.sin(i*.6)*.08,wz(775),bulbs);s.add(bulbs);
  const line=(x,y,w,h)=>{const l=mesh(new THREE.PlaneGeometry(w*U,h*U),basic(0xf2f2f2),wx(x+w/2),.012,wz(y+h/2),s);l.rotation.x=-Math.PI/2};
  line(830,700,340,3);line(830,917,340,3);line(830,700,3,220);line(1167,700,3,220);line(998,700,3,220);
  [[835,810],[1165,810]].forEach(([x,y])=>{box(.06,.9,.06,0xffffff,wx(x),.45,wz(y)-.9,s);box(.06,.9,.06,0xffffff,wx(x),.45,wz(y)+.9,s);box(.06,.06,1.86,0xffffff,wx(x),.9,wz(y),s)});
  [[110,1090,0xf2c230],[230,1100,0x3a7bd5]].forEach(([x,y,c])=>{box(2.6,1.1,1.1,c,wx(x),.75,wz(y),s);box(2.5,.4,1.12,0x24323f,wx(x),1.05,wz(y),s);[-.8,.8].forEach(dx=>[-.5,.5].forEach(dz=>{const w=mesh(cyl(.2,.2,.12,10),lam(0x111111),wx(x)+dx,.2,wz(y)+dz,s);w.rotation.x=Math.PI/2}))});
  box(3,.1,1,0x8e2a3a,wx(190),1.8,wz(1180),s);[-1.3,1.3].forEach(dx=>mesh(cyl(.04,.04,1.8,6),lam(0x666666),wx(190)+dx,.9,wz(1180),s));
  mesh(cyl(.8,.9,.4,16),lam(0xcfc3a5),wx(580),.2,wz(1140),s);mesh(cyl(.2,.25,1.4,10),lam(0x9a8a6a),wx(580),1.1,wz(1140),s);mesh(sph(.3,12,10),lam(0x9a8a6a),wx(580),2,wz(1140),s);
  [[470,1080],[690,1080],[470,1200],[690,1200]].forEach(([x,y])=>box(1.4,.3,.45,0x7a5a3a,wx(x),.15,wz(y),s));
  {const l=mesh(new THREE.CircleGeometry(1,40),new THREE.MeshStandardMaterial({color:0x2f7fa6,emissive:0x0b3446,roughness:.08,metalness:.25}),wx(1345),.02,wz(1140),s);l.userData.water=1;l.scale.set(2.8,1.5,1);l.rotation.x=-Math.PI/2;
   const g2=mesh(new THREE.PlaneGeometry(290*U,200*U),lam(0x5f8a40),wx(1345),.004,wz(1140),s);g2.rotation.x=-Math.PI/2;
   [[1535,1140,1],[1745,1140,-1]].forEach(([x,y,dr])=>{mesh(cyl(.06,.06,2.8,8),lam(0x555555),wx(x),1.4,wz(y),s);box(.06,.8,1.2,0xffffff,wx(x)+dr*.15,2.6,wz(y),s);const r=mesh(new THREE.TorusGeometry(.22,.025,6,16),lam(0xe0652a),wx(x)+dr*.42,2.35,wz(y),s);r.rotation.x=Math.PI/2});
   const cl=(x,y,w,h)=>{const q=mesh(new THREE.PlaneGeometry(w*U,h*U),basic(0xf2f2f2),wx(x+w/2),.012,wz(y+h/2),s);q.rotation.x=-Math.PI/2};cl(1525,1045,230,3);cl(1525,1232,230,3);cl(1640,1045,3,190);cl(1525,1045,3,190);cl(1752,1045,3,190)}
  [[110,1340],[110,1395],[250,1340],[250,1395]].forEach(([x,y])=>{const c=makeCarStatic(0xf4c430,true);c.position.set(wx(x),0,wz(y))});
  box(2.4,.1,1,0x222222,wx(185),1.9,wz(1440),s);[-1,1].forEach(dx=>mesh(cyl(.04,.04,1.9,6),lam(0x666666),wx(185)+dx,.95,wz(1440),s));box(2,.08,.35,0x7a5a3a,wx(185),.45,wz(1440),s);
  {const sg=mesh(new THREE.PlaneGeometry(2.6,.45),new THREE.MeshBasicMaterial({map:textTex('TAXI RANK',{font:'900 44px system-ui',color:'#1b1206',stroke:false,bg:'#f4c430'})}),wx(185),2.3,wz(1440)-.52,s);sg.rotation.y=Math.PI}
  box(8,.14,1.6,0x8e2a3a,wx(580),2.4,wz(1330),s);for(let i=0;i<6;i++)mesh(cyl(.06,.06,2.4,8),lam(0xbbbbbb),wx(440+i*56),1.2,wz(1345),s);
  for(let i=0;i<4;i++)box(1.3,.08,.4,0x7a5a3a,wx(460+i*70),.45,wz(1322),s);
  [[500,1420],[680,1420]].forEach(([x,y])=>{const b=makeBusStatic();b.position.set(wx(x),0,wz(y))});
  {const bd=mesh(new THREE.PlaneGeometry(3.4,1),new THREE.MeshBasicMaterial({map:textTex('CAMPUS SHUTTLE TERMINAL · FREE',{w:1024,h:300,font:'900 64px system-ui',color:'#f6f0e8',stroke:false,bg:'#2f2a26'})}),wx(580),3.2,wz(1330),s);bd.rotation.y=Math.PI}
  solidC(190,470,50);solidBox(150,420,60,20);
  for(let i=0;i<5;i++)solidBox(450+i*60,720,34,24);for(let i=0;i<4;i++)solidBox(450+i*82,850,45,20);
  [[835,810],[1165,810]].forEach(([x,y])=>{solidC(x,y-32,4);solidC(x,y+32,4)});
  [[110,1090],[230,1100]].forEach(([x,y])=>solidBox(x,y,95,42));[-1,1].forEach(k=>solidC(190+k*46,1180,5));
  solidC(580,1140,33);[[470,1080],[690,1080],[470,1200],[690,1200]].forEach(([x,y])=>solidBox(x,y,52,18));
  solidE(1345,1140,101,55);solidC(1535,1140,6);solidC(1745,1140,6);
  [[110,1340],[110,1395],[250,1340],[250,1395]].forEach(([x,y])=>solidBox(x,y,90,44));solidBox(185,1440,74,14);[-1,1].forEach(k=>solidC(185+k*36,1440,5));
  for(let i=0;i<6;i++)solidC(440+i*56,1345,5);for(let i=0;i<4;i++)solidBox(460+i*70,1322,48,16);[[500,1420],[680,1420]].forEach(([x,y])=>solidBox(x,y,123,43));
  [[580,775],[190,300],[1000,620],[1400,640],[960,990]].forEach(([x,y])=>{const L=new THREE.PointLight(0xffc77a,0,10,1.6);L.position.set(wx(x),2.6,wz(y));s.add(L);nightLights.push(L)});
  // Campus Market: stalls with produce
  {const stallC=[0xe0483a,0x2f7a4a,0xe8b24a,0x5aa9e6];
   for(let i=0;i<4;i++){const x=865+i*80,y=1365,X=wx(x),Z=wz(y);solidBox(x,y,64,34);
     box(1.7,.08,.8,0x8a6a4a,X,.82,Z,s);[-.78,.78].forEach(dx=>[-.33,.33].forEach(dz=>box(.06,.82,.06,0x5a3e28,X+dx,.41,Z+dz,s)));
     [-.8,.8].forEach(dx=>mesh(cyl(.03,.03,2.1,6),lam(0x777777),X+dx,1.05,Z-.38,s));const cn=box(2.0,.06,1.25,stallC[i],X,2.12,Z-.05,s);cn.rotation.x=.14;
     if(i===0)for(let k=0;k<18;k++)mesh(sph(.065,8,6),lam(k%5?0xd9301e:0x3f8a3a),X-.7+(k%6)*.26,.92,Z-.25+Math.floor(k/6)*.25,s);
     if(i===1){for(let k=0;k<5;k++){const y2=mesh(cyl(.07,.09,.5,8),lam(0x6b4a2e),X-.6+k*.18,.93,Z-.1,s);y2.rotation.z=Math.PI/2;y2.rotation.y=k*.3}for(let k=0;k<6;k++){const pl=mesh(cyl(.035,.03,.38,6),lam(0xe8c23a),X+.3+(k%3)*.13,.9,Z+.1+Math.floor(k/2)*.06,s);pl.rotation.z=Math.PI/2.3}}
     if(i===2){for(let k=0;k<3;k++)box(.32,.4,.25,0xf1ece3,X-.6+k*.36,1.06,Z-.15,s);for(let k=0;k<2;k++){box(.3,.06,.3,0xd9c39a,X+.45+k*.32,.89,Z+.15,s);for(let e=0;e<6;e++)mesh(sph(.035,6,5),lam(0xf3e6cc),X+.36+k*.32+(e%3)*.08,.94,Z+.08+Math.floor(e/3)*.12,s)}}
     if(i===3){for(let k=0;k<4;k++){const f=mesh(sph(.12,10,6),lam(0xaab4b8),X-.55+k*.3,.9,Z-.1,s);f.scale.set(1.6,.35,.6)}for(let k=0;k<5;k++)box(.2,.05,.14,0xe36a1e,X+.1+k*.12,.89+(k%2)*.05,Z+.2,s)}}
   const sg=mesh(new THREE.PlaneGeometry(3.2,.5),new THREE.MeshBasicMaterial({map:textTex('CAMPUS MARKET · FOODSTUFF',{font:'900 40px system-ui',color:'#1b1206',stroke:false,bg:'#e8b24a'})}),wx(980),2.9,wz(1318),s);
   [-1.5,1.5].forEach(dx=>{mesh(cyl(.04,.04,2.9,6),lam(0x555555),wx(980)+dx,1.45,wz(1318)-.02,s);solidC(980+dx/U,1318,5)})}
  // Swimming pool: raised rim, translucent water so swimmers show through
  {const X=wx(1320),Z=wz(1375),W2=170*U,D2=90*U,rimM=lam(0xf2efe8);solidR(1229,1324,1411,1426);
   const bot=mesh(new THREE.PlaneGeometry(W2,D2),lam(0x2a8db8),X,.012,Z,s);bot.rotation.x=-Math.PI/2;
   for(let i=1;i<4;i++){const ln=mesh(new THREE.PlaneGeometry(W2-.4,.06),basic(0x174a7a),X,.016,Z-D2/2+i*D2/4,s);ln.rotation.x=-Math.PI/2}
   const wat=mesh(new THREE.PlaneGeometry(W2,D2),new THREE.MeshStandardMaterial({color:0x58c8ec,emissive:0x0d4f6a,transparent:true,opacity:.6,depthWrite:false,roughness:.05,metalness:.2}),X,.27,Z,s);wat.userData.water=1;wat.rotation.x=-Math.PI/2;
   box(W2+.3,.3,.15,rimM,X,.15,Z-D2/2-.075,s);box(W2+.3,.3,.15,rimM,X,.15,Z+D2/2+.075,s);box(.15,.3,D2,rimM,X-W2/2-.075,.15,Z,s);box(.15,.3,D2,rimM,X+W2/2+.075,.15,Z,s);
   [-.18,.18].forEach(dx=>{const r=mesh(new THREE.TorusGeometry(.18,.02,6,12,Math.PI),lam(0xcccccc),X+W2/2-.5+dx,.32,Z+D2/2,s);r.rotation.y=Math.PI/2});
   [1265,1320,1375].forEach(x=>{solidBox(x,1446,50,20);box(1.3,.08,.5,0xf4f4f4,wx(x),.32,wz(1446),s);[-.55,.55].forEach(dx=>box(.05,.3,.45,0xbbbbbb,wx(x)+dx,.15,wz(1446),s));const br=box(.45,.06,.5,0xf4f4f4,wx(x)+.6,.5,wz(1446),s);br.rotation.z=.7});
   solidC(1218,1442,6);mesh(cyl(.03,.03,2.1,6),lam(0x888888),wx(1218),1.05,wz(1442),s);mesh(new THREE.ConeGeometry(.9,.4,10),lam(0xe0483a),wx(1218),2.1,wz(1442),s);
   solidBox(1424,1342,26,26);[-.25,.25].forEach(dx=>[-.25,.25].forEach(dz=>box(.05,1.3,.05,0xffffff,wx(1424)+dx,.65,wz(1342)+dz,s)));box(.6,.06,.6,0xe0483a,wx(1424),1.3,wz(1342),s);box(.6,.5,.06,0xe0483a,wx(1424),1.55,wz(1342)+.28,s);
   const sg=mesh(new THREE.PlaneGeometry(2.6,.45),new THREE.MeshBasicMaterial({map:textTex('SWIMMING POOL',{font:'900 44px system-ui',color:'#ffffff',stroke:false,bg:'#1f6f8b'})}),wx(1260),1.4,wz(1316),s);
   [-1.2,1.2].forEach(dx=>{mesh(cyl(.04,.04,1.6,6),lam(0x555555),wx(1260)+dx,.8,wz(1316)-.02,s);solidC(1260+dx/U,1316,5)})}
  const C1=s.children.length,SC1=SOLIDS.length;
  // Club Vibes: neon facade, velvet rope, purple glow at night
  {const b=BID.club,cx=wx(b.x+b.w/2),fz=wz(b.y)-.03;b.meshes.push(box(b.w*U,.07,.05,basic(0xd16bff),cx,.3,fz,s),box(b.w*U,.07,.05,basic(0x45e0ff),cx,b.ht-.9,fz,s));
   [-.9,-1.6].forEach(dx=>{mesh(cyl(.04,.05,.8,8),lam(0xd9a537),wx(b.door[0])+dx,.4,fz-.5,s);solidC(b.door[0]+dx/U,b.y-18,4)});box(.7,.04,.04,0x8e2a3a,wx(b.door[0])-1.25,.65,fz-.5,s);
   const L=new THREE.PointLight(0xc04bff,0,9,1.6);L.position.set(wx(b.door[0]),2.2,fz-1);s.add(L);nightLights.push(L)}
  for(let i=C1;i<s.children.length;i++)s.children[i].userData.noShift=1;for(let i=SC1;i<SOLIDS.length;i++)SOLIDS[i].noShift=1;
  // Parade Grounds: concert stage, LED screen, lights, tents, flags
  {const P0={x:1840,y:370,w:280,h:870},line=(x,y,w,h)=>{const q=mesh(new THREE.PlaneGeometry(w*U,h*U),basic(0xf2f2f2),wx(x+w/2),.012,wz(y+h/2),s);q.rotation.x=-Math.PI/2};
   line(P0.x+10,P0.y+10,P0.w-20,3);line(P0.x+10,P0.y+P0.h-13,P0.w-20,3);line(P0.x+10,P0.y+10,3,P0.h-20);line(P0.x+P0.w-13,P0.y+10,3,P0.h-20);
   const sx=wx(1980),sz=wz(432);STAGE.sx=sx;STAGE.sz=sz;solidR(1884,396,2076,470);
   box(5.3,1.0,2.0,0x2b2b2b,sx,.5,sz,s);box(5.4,.06,2.1,0x111111,sx,1.03,sz,s);box(.8,.5,.5,0x333333,sx+2.25,.25,sz+1.2,s);
   const c=document.createElement('canvas');c.width=512;c.height=256;STAGE.c=c;STAGE.tex=new THREE.CanvasTexture(c);
   box(4.9,2.5,.15,0x111111,sx,2.3,sz-.95,s);mesh(new THREE.PlaneGeometry(4.6,2.2),new THREE.MeshBasicMaterial({map:STAGE.tex}),sx,2.3,sz-.86,s);
   [-.8,.8].forEach(dz=>{[-2.75,2.75].forEach(dx=>box(.14,4.3,.14,0x8a8a8a,sx+dx,2.15,sz+dz,s));box(5.64,.14,.14,0x8a8a8a,sx,4.25,sz+dz,s)});
   [-2.75,2.75].forEach(dx=>box(.14,.14,1.6,0x8a8a8a,sx+dx,4.25,sz,s));
   mesh(new THREE.PlaneGeometry(5.4,.55),new THREE.MeshBasicMaterial({map:textTex('SRC WEEK · AKWAABA UNIVERSITY',{w:1024,h:110,font:'900 58px system-ui',color:'#1b1206',stroke:false,bg:'#e8b24a'})}),sx,4.62,sz+.82,s);
   [-3.35,3.35].forEach(dx=>{box(.8,2.4,.7,0x111111,sx+dx,1.2,sz+.3,s);[.6,1.3,2.0].forEach(y=>{const w=mesh(cyl(.22,.22,.04,14),lam(0x333333),sx+dx,y,sz+.66,s);w.rotation.x=Math.PI/2})});
   solidBox(1980-120,443,32,28);solidBox(1980+120,443,32,28);
   box(.9,.9,.5,0x111018,wx(2045),1.48,wz(418),s);box(.92,.04,.52,0x7a2ea0,wx(2045),1.94,wz(418),s);
   STAGE.lights=[0xff3cac,0x3cd4ff,0xffd23c,0xb44cff].map((col,i)=>{const x=sx-2+i*1.33,l=new THREE.PointLight(col,0,14,1.4);l.position.set(x,4,sz+1.6);s.add(l);
     const cone=mesh(new THREE.ConeGeometry(.9,4,18,1,true),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.16,depthWrite:false,side:THREE.DoubleSide}),x,2.15,sz+.9,s);cone.visible=false;return{l,cone,x}});
   STAGE.fw=[];for(let i=0;i<30;i++){const m=mesh(sph(.07,6,5),new THREE.MeshBasicMaterial({color:[0xffd23c,0xff3cac,0x3cd4ff,0xffffff][i%4]}),sx,5,sz,s);m.visible=false;STAGE.fw.push(m)}
   box(5.6,.85,.05,0xa0a0a0,sx,.43,wz(500),s);solidR(1880,497,2080,503);
   [[1890,960],[1980,960],[2070,960],[1890,1080],[2070,1080]].forEach(([x,y],i)=>{solidBox(x,y,60,34);const X=wx(x),Z=wz(y);box(1.6,.06,.8,0xe6e1d6,X,.8,Z,s);[-.75,.75].forEach(dx=>[-.35,.35].forEach(dz=>box(.05,.8,.05,0x666666,X+dx,.4,Z+dz,s)));
     [-.85,.85].forEach(dx=>[-.5,.5].forEach(dz=>mesh(cyl(.03,.03,2,6),lam(0xdddddd),X+dx,1,Z+dz,s)));const r=mesh(new THREE.ConeGeometry(1.35,.6,4),lam([0xffffff,0x8e2a3a,0xffffff,0x1f6f8b,0xe8b24a][i]),X,2.25,Z,s);r.rotation.y=Math.PI/4;r.scale.set(1,1,.62)});
   [1900,1980,2060].forEach(x=>{solidC(x,1215,5);mesh(cyl(.035,.035,4,6),lam(0xdddddd),wx(x),2,wz(1215),s);const f=new THREE.Group();[0xce1126,0xfcd116,0x006b3f].forEach((c,k)=>box(.9,.18,.02,c,.45,-k*.18,0,f));box(.11,.11,.03,0x111111,.45,-.18,0,f);f.position.set(wx(x),3.85,wz(1215));s.add(f)})}
  // move every prop to where its area now is
  const bx=new THREE.Box3(),cv3=new THREE.Vector3();
  for(let i=D0;i<s.children.length;i++){const o=s.children[i];if(o.userData.noShift)continue;let px=o.position.x,pz=o.position.z;
    if(!o.isLight){bx.setFromObject(o);if(!bx.isEmpty()){bx.getCenter(cv3);px=cv3.x;pz=cv3.z}}
    const id=areaOf(px/U+MW/2,pz/U+MH/2);if(!id){o.visible=false;continue}const d=delta(id);o.position.x+=d[0]*U;o.position.z+=d[1]*U}
  for(let i=S0;i<SOLIDS.length;i++){const o=SOLIDS[i];if(o.noShift)continue;const cx=o.t===1?(o.x1+o.x2)/2:o.x,cy=o.t===1?(o.y1+o.y2)/2:o.y,id=areaOf(cx,cy);if(!id)continue;const d=delta(id);
    if(o.t===1){o.x1+=d[0];o.x2+=d[0];o.y1+=d[1];o.y2+=d[1]}else{o.x+=d[0];o.y+=d[1]}}
  {const d=delta('parade');STAGE.sx+=d[0]*U;STAGE.sz+=d[1]*U;STAGE.lights.forEach(o=>o.x+=d[0]*U)}
})();
function fadeBuildings(px,py){B.forEach(b=>{if(b.open)return;const block=px>b.x-60&&px<b.x+b.w+60&&b.y>py-40&&b.y<py+320;if(block===b.faded)return;b.faded=block;
  b.meshes.forEach(m=>{if(m.material===WINLIT||m.material===WINDARK||m.material===WINROY){m.visible=!block;return}if(m._cs===undefined)m._cs=m.castShadow;m.castShadow=block?false:m._cs;const op0=m.material.userData.op??1;m.material.transparent=block||op0<1;m.material.opacity=block?.18:op0;m.material.depthWrite=!block;m.material.needsUpdate=true})})}
function obstacle(x,y){return B.find(b=>!b.open&&x>b.x-6&&x<b.x+b.w+6&&y>b.y-6&&y<b.y+b.h+6)}
function pushOut(p){const b=obstacle(p.x,p.y);if(!b)return;
  const dl=p.x-(b.x-6),dr=b.x+b.w+6-p.x,dt=p.y-(b.y-6),db=b.y+b.h+6-p.y,m=Math.min(dl,dr,dt,db);
  if(m===dl)p.x=b.x-6;else if(m===dr)p.x=b.x+b.w+6;else if(m===dt)p.y=b.y-6;else p.y=b.y+b.h+6}
const locOf=(x,y)=>{let best=null,bd=95;B.forEach(b=>{const d=Math.hypot(b.door[0]-x,b.door[1]-y);if(d<bd){bd=d;best=b}});return best||B.find(b=>b.open&&x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h)||null};
const zoneName=(x,y)=>{const n=locOf(x,y);if(n&&(!n.open||(x>=n.x&&x<=n.x+n.w&&y>=n.y&&y<=n.y+n.h)||Math.hypot(n.door[0]-x,n.door[1]-y)<95))return n.name;const st=typeof SH_STOPS!=='undefined'&&SH_STOPS.find(q=>Math.hypot(q.sx-x,q.sy-y)<70);if(st)return `🚌 ${st.name} stop`;const o=B.find(b=>b.open&&x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h);return o?o.name:zoneOf(x,y)};
