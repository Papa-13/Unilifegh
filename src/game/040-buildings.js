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
/* painted plaster: fine grain plus faint rain streaks under the windows, like real tropical walls */
function plasterT(){if(plasterT.t)return plasterT.t;const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle='#f2f0ec';g.fillRect(0,0,256,256);
  for(let i=0;i<5000;i++){const v=Math.random();g.fillStyle=v<.5?`rgba(0,0,0,${Math.random()*.05})`:`rgba(255,255,255,${Math.random()*.08})`;g.fillRect(Math.random()*256,Math.random()*256,2,2)}
  for(let i=0;i<26;i++){const x=Math.random()*256,y=Math.random()*200,h=30+Math.random()*90,gr=g.createLinearGradient(0,y,0,y+h);gr.addColorStop(0,'rgba(60,55,45,.13)');gr.addColorStop(1,'rgba(60,55,45,0)');g.fillStyle=gr;g.fillRect(x,y,3+Math.random()*6,h)}
  const gb=g.createLinearGradient(0,200,0,256);gb.addColorStop(0,'rgba(90,70,50,0)');gb.addColorStop(1,'rgba(90,70,50,.22)');g.fillStyle=gb;g.fillRect(0,200,256,56);
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return plasterT.t=t}
function roofT(){if(roofT.t)return roofT.t;const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.fillStyle='#e9e6e0';g.fillRect(0,0,128,128);
  for(let i=0;i<1500;i++){g.fillStyle=`rgba(0,0,0,${Math.random()*.07})`;g.fillRect(Math.random()*128,Math.random()*128,2,2)}for(let i=0;i<8;i++){g.fillStyle=`rgba(60,70,50,${.05+Math.random()*.06})`;g.beginPath();g.ellipse(Math.random()*128,Math.random()*128,6+Math.random()*16,4+Math.random()*10,Math.random()*3,0,7);g.fill()}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return roofT.t=t}
function deckT(){if(deckT.t)return deckT.t;const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.fillStyle='#d8d4cc';g.fillRect(0,0,128,128);
  for(let i=0;i<1600;i++){g.fillStyle=`rgba(0,0,0,${Math.random()*.08})`;g.fillRect(Math.random()*128,Math.random()*128,2,2)}g.fillStyle='rgba(0,0,0,.12)';for(let x=0;x<128;x+=32){g.fillRect(x,0,1,128);g.fillRect(0,x,128,1)}
  for(let i=0;i<6;i++){g.fillStyle=`rgba(70,60,45,${.06+Math.random()*.08})`;g.beginPath();g.ellipse(Math.random()*128,Math.random()*128,8+Math.random()*20,5+Math.random()*12,Math.random()*3,0,7);g.fill()}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3,3);return deckT.t=t}
function solarT(){if(solarT.t)return solarT.t;const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.fillStyle='#c9ced4';g.fillRect(0,0,64,64);
  for(let y=0;y<4;y++)for(let x=0;x<6;x++){const gr=g.createLinearGradient(0,y*16,0,y*16+15);gr.addColorStop(0,'#2a4a8a');gr.addColorStop(1,'#16295a');g.fillStyle=gr;g.fillRect(x*10.6+1,y*16+1,9.6,14)}
  const t=new THREE.CanvasTexture(c);return solarT.t=t}
function amats(b){const L=c=>new THREE.MeshStandardMaterial({color:c,roughness:.85}),LP=c=>new THREE.MeshStandardMaterial({color:c,roughness:.9,map:plasterT()}),tc=new THREE.Color(b.c).lerp(new THREE.Color(0xffffff),.55).getHex(),
  rh='#'+b.roof.toString(16).padStart(6,'0');
  return{wall:LP(b.c),trim:L(tc),stone:L(0x9a9184),roof:new THREE.MeshStandardMaterial({color:b.roof,roughness:.8,map:roofT()}),accent:L(b.roof),dark:L(0x2a2522),wood:L(0x6b4a2e),white:L(0xf4f1ea),soil:L(0x5a3e28),plant:L(0x3f7f3a),plant2:L(0x2f6a32),
    flowerA:L(pick([0xe0483a,0xe8b24a,0xe58fb0,0xffffff])),flowerB:L(pick([0xb44cff,0xf2c230,0xff7a3a])),metal:new THREE.MeshStandardMaterial({color:0xc9ced2,map:metalT(),roughness:.5,metalness:.4}),
    tank:L(0x1d1d1d),brick:new THREE.MeshStandardMaterial({map:brickT(),roughness:.9}),corr:new THREE.MeshStandardMaterial({map:corrT(rh),roughness:.6,metalness:.3}),
    awning:new THREE.MeshStandardMaterial({map:stripeT(rh,'#f4f1ea'),roughness:.8,side:THREE.DoubleSide}),deck:new THREE.MeshStandardMaterial({color:0x8f8b84,map:deckT(),roughness:.95}),solar:new THREE.MeshStandardMaterial({color:0xffffff,map:solarT(),roughness:.3,metalness:.4}),cloth:L(pick([0x2f6bb5,0xe0483a,0xf2c230,0x4fb87a])),cloth2:L(pick([0xffffff,0xe58fb0,0x8e2a3a])),
    gold:new THREE.MeshStandardMaterial({color:0xd9a537,roughness:.3,metalness:.8}),neon:new THREE.MeshBasicMaterial({color:0xff3cac}),neon2:new THREE.MeshBasicMaterial({color:0x3cd4ff}),
    stain:new THREE.MeshStandardMaterial({color:0x3a6fd0,emissive:0x1a3a90,emissiveIntensity:.5,roughness:.2}),stain2:new THREE.MeshStandardMaterial({color:0xd04a3a,emissive:0x7a1a10,emissiveIntensity:.5,roughness:.2}),
    glassL:WINLIT,glassD:WINDARK,glassR:WINROY,cur:(()=>{const m=new THREE.MeshStandardMaterial({color:0x9fd3f0,roughness:.05,metalness:.6,transparent:true,opacity:.75});m.userData.op=.75;return m})()}}
function buildArch(b,s,cx,cz,w,d,f){
  const B={},M=new THREE.Matrix4(),Q=new THREE.Quaternion(),E=new THREE.Euler(),V=new THREE.Vector3(),SC=new THREE.Vector3();
  const add=(k,geo,x,y,z,ry,sx,sy,sz,rx=0,rz=0)=>{E.set(rx,ry,rz,'YXZ');Q.setFromEuler(E);M.compose(V.set(x,y,z),Q,SC.set(sx,sy,sz));(B[k]=B[k]||[]).push({geo,m:M.clone()})};
  const bx=(k,sx,sy,sz,x,y,z,ry=0)=>add(k,AG.box,x,y,z,ry,sx,sy,sz);
  const H=b.ht,id=b.id,zone=b.zone,home=!!b.home;
  const style=id==='senate'?'senate':id==='lib'?'library':id==='greathall'?'hall':id==='chapel'?'chapel':id==='mosque'?'mosque':id==='club'||id==='arcade'?'club':id==='mall'?'mall':(id==='unity'||id==='bank')?'bank':HT(id)==='royal'?'tower':
    id==='gym'?'sports':home?'hostel':zone==='c'?'shop':'college';
  const roofT={hostel:HT(id)==='lodge'?'corr':'hip',chapel:'gable',sports:'flat',college:['canteen','office','print','clinic'].includes(id)?'hip':'flat'}[style]||'flat';
  const floors=style==='mosque'?2:Math.max(1,Math.round((H-.2)/1.2)),fh=(H-.2)/floors;
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
  F.forEach((Fc,fi)=>{const sp=style==='hall'||style==='mosque'?1.35:1.05,n=Math.max(1,Math.floor((Fc.L-.9)/sp)),a0=-(n-1)*sp/2;
    for(let r=0;r<floors;r++){const y=.2+r*fh+fh*.55;
      if(style==='tower'){fb(Fc,'glassR',Fc.L-.3,fh*.62,.05,0,y,0);fb(Fc,'trim',Fc.L+.05,.09,.18,0,.2+r*fh+.04,0);continue}
      if((Fc.front||(fi===1&&f<0))&&r===0&&(style==='shop'||style==='mall'||style==='bank'||style==='club'))continue;
      if(Fc.front&&style==='library'){continue}
      for(let i=0;i<n;i++){const a=a0+i*sp;if(Fc.front&&r===0&&Math.abs(a-aD)<1.15)continue;if(Fc.front&&style==='senate'&&r===0&&Math.abs(a-aD)<2.2)continue;
        const wh=style==='hall'||style==='mosque'?fh*.7:.62;
        fb(Fc,'trim',.64,wh+.14,.05,a,y,0);fb(Fc,style==='chapel'?(i%2?'stain':'stain2'):style==='mosque'?'stain2':lit(),.5,wh,.05,a,y,.02);fb(Fc,'trim',.74,.05,.12,a,y-wh/2-.06,0);
        if(style==='hall'||style==='chapel'||style==='mosque')fa(Fc,'trim',AG.half,.64,.32,.07,a,y+wh/2,0.0);
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
    if(HT(id)!=='lodge')[F[0],F[1]].forEach(Fc=>{for(let r=1;r<floors;r++){const y=.2+r*fh;fb(Fc,'stone',Fc.L-.5,.08,.5,0,y,0);fb(Fc,'trim',Fc.L-.5,.05,.04,0,y+.42,.48);for(let a=-Fc.L/2+.3;a<Fc.L/2-.2;a+=.22)fb(Fc,'trim',.025,.42,.025,a,y+.21,.48);for(let a=-Fc.L/2+1;a<Fc.L/2-.5;a+=1.6)if(Math.random()<.5)fb(Fc,Math.random()<.5?'cloth':'cloth2',.32,.34,.02,a,y+.62,.4)}})
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
  if(style==='mosque'){bx('trim',w+.4,.18,d+.4,cx,H+.09,cz);bx('white',w+.1,.3,d+.1,cx,H+.3,cz);ent();beds();signY=H-.45}
  if(style==='sports'){{fb(FR,'cur',FR.L-.6,1.0,.05,0,H-.9,.02);bx('trim',w+.3,.15,d+.3,cx,H+.07,cz)}ent();signY=id==='hall'?H-.25:H-.4}
  if(roofT==='hip'&&style==='college'){bx('trim',w+.6,.12,d+.6,cx,H+.02,cz);add('roof',AG.hip,cx,H+.45,cz,0,w+.6,.85,d+.6)}
  if(id==='mosque'){add('accent',AG.sph,cx,H+.5,cz,0,w*.42,w*.36,w*.42);add('gold',AG.cyl8,cx,H+.5+w*.2,cz,0,.06,.5,.06);[-1,1].forEach(sx=>[-1,1].forEach(sz=>{const mx=cx+sx*(w/2-.4),mz=cz+sz*(d/2-.4);if(sz>0&&sx<0||sz<0&&sx>0)return;add('white',AG.cyl,mx,(H+3)/2,mz,0,.45,H+3,.45);bx('trim',.62,.12,.62,mx,H+2.2,mz);add('accent',AG.sph,mx,H+3.1,mz,0,.5,.6,.5);add('gold',AG.cyl8,mx,H+3.55,mz,0,.04,.4,.04)}));[-1,1].forEach(sx=>add('accent',AG.sph,cx+sx*w*.3,H+.35,cz,0,w*.14,w*.12,w*.14))}
  if(id==='clinic'){fb(FR,'white',.5,.15,.05,FR.L/2-.6,H-.4,.04);fb(FR,'white',.15,.5,.05,FR.L/2-.6,H-.4,.04);fb(FR,'stain2',.42,.1,.04,FR.L/2-.6,H-.4,.06);fb(FR,'stain2',.1,.42,.04,FR.L/2-.6,H-.4,.065)}
  /* flat roofs: a darker concrete deck inside the parapet, AC condensers, a stair head and solar panels
     (what you actually see from above on Ghanaian campus buildings) */
  {const top={college:roofT==='flat'&&id!=='mosque'?[H+.39,w+.1,d+.1]:null,senate:[H+.46,w+.16,d+.16],library:[H+.7,w-1.4,d-1.4],shop:[H+.475,w+.1,d+.1],mall:[H+.475,w+.1,d+.1],bank:[H+.475,w+.1,d+.1],club:[H+.475,w+.1,d+.1],sports:id==='gym'?[H+.145,w+.3,d+.3]:null}[style];
    if(top){const [ty,tw,td]=top,iw=tw-.32,idp=td-.32,hs=(Math.abs(Math.sin(b.x*.37+b.y*.11))*1000)|0;bx('deck',iw,.03,idp,cx,ty+.005,cz);
      const fz=cz+f*idp*.18;if(iw>2.2){for(let i=0;i<Math.min(4,Math.floor(iw/1.6));i++){const x=cx-iw/2+.6+i*.9;bx('white',.55,.38,.42,x,ty+.2,fz);add('dark',AG.cyl,x,ty+.4,fz,0,.3,.02,.3)}}
      bx(style==='sports'?'metal':'wall',.9,.75,.8,cx+iw/2-.7,ty+.38,cz+f*(idp/2-.6));bx('dark',.4,.6,.02,cx+iw/2-.7,ty+.32,cz+f*(idp/2-.6)+f*.41);bx('trim',1,.06,.9,cx+iw/2-.7,ty+.78,cz+f*(idp/2-.6));
      if(hs%2===0&&iw>3){const rows=Math.min(2,Math.max(1,Math.floor((idp-1.2)/1.1)));for(let r=0;r<rows;r++)for(let x=cx-iw/2+.8;x<Math.min(cx+iw/2-1.9,cx-iw/2+.8+6.4);x+=1.05){const z=cz-f*(idp/2-.75-r*1.1);if(Math.abs(z-(cz-f*(d/2-.8)))<.5&&Math.abs(x-cx+w/2-1.1)<1.2)continue;add('solar',AG.box,x,ty+.22,z,0,.95,.04,.62,f*.32);add('metal',AG.box,x,ty+.1,z,0,.05,.18,.05)}}}}
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
   const CX=MAPR.v,CY=MAPR.h.map(r=>r[0]),edgeM=basic(0xe9e6df),curbM=lam(0xb9b2a6);
   const seg=(a,b,cross,fn)=>{const cuts=cross.filter(c=>c>a&&c<b).sort((p,q)=>p-q);let s0=a;cuts.concat([b+RHW]).forEach(c=>{const e=Math.min(b,c-RHW);if(e-s0>20)fn(s0,e);s0=c+RHW})};
   const strip=(x1,y1,x2,y2,mat,h=0)=>{const w=x2-x1,d=y2-y1;if(h){box(w*U,h,d*U,mat,wx(x1+w/2),h/2,wz(y1+d/2),s)}else{const m=mesh(new THREE.PlaneGeometry(w*U,d*U),mat,wx(x1+w/2),.006,wz(y1+d/2),s);m.rotation.x=-Math.PI/2;return m}};
   ROADS.forEach(([x,y,w,h])=>{const hz=w>h;if(hz){const cy=y+h/2;seg(x,x+w,CX,(a,b)=>{const m=strip(a,cy-1.5,b,cy+1.5,new THREE.MeshBasicMaterial({map:(()=>{const t=dash.clone();t.needsUpdate=true;t.repeat.set((b-a)/70,1);return t})(),transparent:true}));
        [-1,1].forEach(sd=>{strip(a,cy+sd*(RHW-6)-1.2,b,cy+sd*(RHW-6)+1.2,edgeM);strip(a,sd<0?y-5:y+h,b,sd<0?y:y+h+5,curbM,.07)})})}
     else{const cx=x+w/2;seg(y,y+h,MAPR.h.filter(r=>x+w/2>=r[1]&&x+w/2<=r[2]).map(r=>r[0]),(a,b)=>{const t=dash.clone();t.needsUpdate=true;t.repeat.set((b-a)/70,1);const m=mesh(new THREE.PlaneGeometry((b-a)*U,3*U),new THREE.MeshBasicMaterial({map:t,transparent:true}),wx(cx),.006,wz((a+b)/2),s);m.rotation.x=-Math.PI/2;m.rotation.z=Math.PI/2;
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
  const tree=(x,y,sz=1)=>{solidC(x,y,11*sz);niceTree(s,x,y,sz*.95)};
  const palm=(x,y)=>{solidC(x,y,8);nicePalm(s,x,y)};
  [[90,400],[270,400],[110,540],[260,540],[60,470]].forEach(([x,y])=>tree(x,y,1.1));
  {const p=mesh(new THREE.CircleGeometry(1.4,30),new THREE.MeshLambertMaterial({color:0x3a8fb0,emissive:0x0b3446}),wx(190),.02,wz(470),s);p.rotation.x=-Math.PI/2;box(1.6,.35,.5,0x7a5a3a,wx(150),.18,wz(420),s)}
  for(let i=0;i<5;i++){const x=450+i*60,y=720;box(.9,.8,.6,0x5a3c24,wx(x),.4,wz(y),s);const cn=mesh(new THREE.ConeGeometry(.75,.45,4),lam([0xe0483a,0xe8b24a,0x2f7a4a,0x5aa9e6,0xe58fb0][i]),wx(x),1.55,wz(y),s);cn.rotation.y=Math.PI/4;mesh(cyl(.02,.02,1.4,5),lam(0xdddddd),wx(x),.7,wz(y)+.25,s)}
  for(let i=0;i<4;i++){const x=450+i*82,y=850;box(1.2,.75,.5,0x8a6a4a,wx(x),.38,wz(y),s);mesh(cyl(.25,.25,.05,10),lam(0xd9a537),wx(x),.78,wz(y),s)}
  const bulbs=new THREE.Group();for(let i=0;i<24;i++)mesh(sph(.06,6,6),basic([0xffd27a,0xff8a6a,0x9ad7ff][i%3]),wx(430+i*13),1.95+Math.sin(i*.6)*.08,wz(775),bulbs);s.add(bulbs);
  const line=(x,y,w,h)=>{const l=mesh(new THREE.PlaneGeometry(w*U,h*U),basic(0xf2f2f2),wx(x+w/2),.012,wz(y+h/2),s);l.rotation.x=-Math.PI/2};
  /* football pitch, drawn straight on the (stretched) Sports Field so the lines and goals match the match game */
  {const NS=o=>{o.userData.noShift=1;return o},R=(x,y,w,h)=>{const a=TA('field',x,y),b=TA('field',x+w,y+h);return[a.x,a.y,b.x-a.x,b.y-a.y]},L=(x,y,w,h,t)=>{const [X,Y,W,H]=R(x,y,w,h);const l=NS(mesh(new THREE.PlaneGeometry(Math.max(W,t)*U,Math.max(H,t)*U),basic(0xf2f2f2),wx(X+Math.max(W,t)/2),.012,wz(Y+Math.max(H,t)/2),s));l.rotation.x=-Math.PI/2};
   const t=4;L(830,700,340,0,t);L(830,878,340,0,t);L(830,700,0,180,t);L(1167,700,0,180,t);L(998,700,0,180,t);
   {const c=TA('field',1000,790),cr=NS(mesh(new THREE.RingGeometry(1.7,1.82,40),basic(0xf2f2f2),wx(c.x),.013,wz(c.y),s));cr.rotation.x=-Math.PI/2}
   [[830,1],[1170,-1]].forEach(([x,sd])=>{L(sd>0?x:x-50,750,50,0,t);L(sd>0?x:x-50,830,50,0,t);L(sd>0?x+50:x-50,750,0,80,t);
     const g=TA('field',x,790),X=wx(g.x)+sd*.05,Z=wz(g.y);[-1.6,1.6].forEach(dz=>NS(box(.09,1.5,.09,0xffffff,X,.75,Z+dz,s)));NS(box(.09,.09,3.3,0xffffff,X,1.5,Z,s));
     const net=NS(mesh(new THREE.PlaneGeometry(3.2,1.5),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.25,side:THREE.DoubleSide,depthWrite:false}),X-sd*.6,.75,Z,s));net.rotation.y=Math.PI/2})}
  /* stands along the side of the pitch */
  {const NS=o=>{o.userData.noShift=1;return o},a=TA('field',840,903),b=TA('field',1160,903),y=a.y,x0=a.x+60,x1=b.x-60;for(let r=0;r<3;r++){NS(box((x1-x0)*U,.25,.55,[0xf4f1ea,0x8e2a3a,0xf4f1ea][r],wx((x0+x1)/2),.15+r*.3,wz(y)+r*.5,s))}const sr={t:1,x1:x0,x2:x1,y1:y-12,y2:y+60,noShift:1};SOLIDS.push(sr)}
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
  // Swimming pool (drawn on the stretched pool area): raised rim, lanes, translucent water, a diving board at the deep end
  {const NS=o=>{o.userData.noShift=1;return o},P0=TA('pool',1235,1330),P1=TA('pool',1405,1420),PX=(P0.x+P1.x)/2,PY=(P0.y+P1.y)/2,X=wx(PX),Z=wz(PY),W2=(P1.x-P0.x)*U,D2=(P1.y-P0.y)*U,rimM=lam(0xf2efe8);
   SOLIDS.push({t:1,x1:P0.x-6,y1:P0.y-6,x2:P1.x+6,y2:P1.y+6,noShift:1});
   const bot=NS(mesh(new THREE.PlaneGeometry(W2,D2),lam(0x2a8db8),X,.012,Z,s));bot.rotation.x=-Math.PI/2;
   const nL=Math.max(4,Math.round(D2/1.3));for(let i=1;i<nL;i++){const ln=NS(mesh(new THREE.PlaneGeometry(W2-.6,.07),basic(0x174a7a),X,.016,Z-D2/2+i*D2/nL,s));ln.rotation.x=-Math.PI/2}
   const wat=NS(mesh(new THREE.PlaneGeometry(W2,D2),new THREE.MeshStandardMaterial({color:0x58c8ec,emissive:0x0d4f6a,transparent:true,opacity:.6,depthWrite:false,roughness:.05,metalness:.2}),X,.27,Z,s));wat.userData.water=1;wat.rotation.x=-Math.PI/2;
   NS(box(W2+.5,.3,.25,rimM,X,.15,Z-D2/2-.125,s));NS(box(W2+.5,.3,.25,rimM,X,.15,Z+D2/2+.125,s));NS(box(.25,.3,D2,rimM,X-W2/2-.125,.15,Z,s));NS(box(.25,.3,D2,rimM,X+W2/2+.125,.15,Z,s));
   /* lane ropes */for(let i=1;i<nL;i++)NS(box(W2-.3,.04,.04,[0xe0483a,0xf4f1ea,0x2f6bb5][i%3],X,.29,Z-D2/2+i*D2/nL,s));
   [-.18,.18].forEach(dx=>{const r=NS(mesh(new THREE.TorusGeometry(.18,.02,6,12,Math.PI),lam(0xcccccc),X+W2/2-.6+dx,.32,Z+D2/2,s));r.rotation.y=Math.PI/2});
   /* diving board (jump board) on the deep end: concrete stand, ladder, springboard over the water */
   {const dx=X-W2/2-1.0,dz=wz(TA('pool',0,1363).y),st=lam(0xd8d4cc),blue=lam(0x1f6f8b);NS(box(1.1,1.2,1.1,st,dx,.6,dz,s));for(let k=0;k<5;k++)NS(box(.5,.05,.18,0xbbbbbb,dx-.62,.15+k*.22,dz,s));[-.25,.25].forEach(o=>NS(box(.05,1.3,.05,0xbbbbbb,dx-.72,.65,dz+o,s)));
     NS(box(2.6,.08,.5,blue,dx+1.5,1.24,dz,s));NS(box(.25,.2,.55,0x333333,dx+.45,1.12,dz,s));[-.27,.27].forEach(o=>NS(box(.04,.5,.04,0xcccccc,dx-.2,1.45,dz+o,s)));NS(box(.04,.04,.8,0xcccccc,dx-.2,1.7,dz,s));
     SOLIDS.push({t:0,x:(dx/U)+MW/2,y:(dz/U)+MH/2,r:24,noShift:1})}
   /* sun loungers and an umbrella along the side */
   for(let i=0;i<5;i++){const lx=TA('pool',1250+i*35,0).x,ly=TA('pool',0,1440).y;SOLIDS.push({t:1,x1:lx-25,x2:lx+25,y1:ly-10,y2:ly+10,noShift:1});NS(box(1.3,.08,.5,0xf4f4f4,wx(lx),.32,wz(ly),s));[-.55,.55].forEach(d=>NS(box(.05,.3,.45,0xbbbbbb,wx(lx)+d,.15,wz(ly),s)));const br=NS(box(.45,.06,.5,0xf4f4f4,wx(lx)+.6,.5,wz(ly),s));br.rotation.z=.7}
   {const ux=P0.x-40,uy=TA('pool',0,1440).y;SOLIDS.push({t:0,x:ux,y:uy,r:6,noShift:1});NS(mesh(cyl(.03,.03,2.1,6),lam(0x888888),wx(ux),1.05,wz(uy),s));NS(mesh(new THREE.ConeGeometry(.9,.4,10),lam(0xe0483a),wx(ux),2.1,wz(uy),s))}
   /* lifeguard chair */{const gx=P1.x+18,gy=P0.y+20;SOLIDS.push({t:1,x1:gx-13,x2:gx+13,y1:gy-13,y2:gy+13,noShift:1});[-.25,.25].forEach(a=>[-.25,.25].forEach(b=>NS(box(.05,1.3,.05,0xffffff,wx(gx)+a,.65,wz(gy)+b,s))));NS(box(.6,.06,.6,0xe0483a,wx(gx),1.3,wz(gy),s));NS(box(.6,.5,.06,0xe0483a,wx(gx),1.55,wz(gy)+.28,s))}
   const sp=TA('pool',1260,1316),sg=NS(mesh(new THREE.PlaneGeometry(2.6,.45),new THREE.MeshBasicMaterial({map:textTex('SWIMMING POOL',{font:'900 44px system-ui',color:'#ffffff',stroke:false,bg:'#1f6f8b'})}),wx(sp.x),1.4,wz(sp.y),s));
   [-1.2,1.2].forEach(dx=>{NS(mesh(cyl(.04,.04,1.6,6),lam(0x555555),wx(sp.x)+dx,.8,wz(sp.y)-.02,s));SOLIDS.push({t:0,x:sp.x+dx/U,y:sp.y,r:5,noShift:1})})}
  /* outdoor beach-volleyball court on sand: lines, posts, a net, benches for watchers */
  {const NS=o=>{o.userData.noShift=1;return o},b=BID.volley,X=wx(b.x+b.w/2),Z=wz(b.y+b.h/2),L=Math.min(b.w*U-2.4,16),Dd=Math.min(b.h*U-2.6,8),wm=basic(0xf4f1ea),ln=(w,d,x,z)=>{const m=NS(mesh(new THREE.PlaneGeometry(w,d),wm,x,.012,z,s));m.rotation.x=-Math.PI/2};
   ln(L,.08,X,Z-Dd/2);ln(L,.08,X,Z+Dd/2);ln(.08,Dd,X-L/2,Z);ln(.08,Dd,X+L/2,Z);
   [-1,1].forEach(k=>{const pz=Z+k*(Dd/2+.5);NS(mesh(cyl(.05,.05,2.5,8),lam(0x777777),X,1.25,pz,s));SOLIDS.push({t:0,x:b.x+b.w/2,y:(pz/U)+MH/2,r:5,noShift:1})});
   NS(box(.02,.8,Dd+1,new THREE.MeshLambertMaterial({color:0x222222,transparent:true,opacity:.35,depthWrite:false}),X,2.05,Z,s));NS(box(.03,.07,Dd+1,0xf4f4f4,X,2.44,Z,s));NS(box(.03,.05,Dd+1,0xf4f4f4,X,1.66,Z,s));
   const ball=NS(mesh(sph(.13,12,8),lam(0xf2d23a),X-2,.13,Z+.6,s));ball.userData.vball=1;
   [-1,1].forEach(k=>{const bz=b.y+b.h-18,bx=b.x+b.w/2+k*b.w*.28;NS(box(2.2,.08,.45,0x8a6a4a,wx(bx),.45,wz(bz),s));[-.9,.9].forEach(d=>NS(box(.08,.45,.4,0x555555,wx(bx)+d,.22,wz(bz),s)));SOLIDS.push({t:1,x1:bx-40,x2:bx+40,y1:bz-9,y2:bz+9,noShift:1})})}
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
    const lx=px/U+MW/2,ly=pz/U+MH/2,id=areaOf(lx,ly);if(!id){o.visible=false;continue}const n=TA(id,lx,ly);o.position.x+=(n.x-lx)*U;o.position.z+=(n.y-ly)*U}
  for(let i=S0;i<SOLIDS.length;i++){const o=SOLIDS[i];if(o.noShift)continue;const cx=o.t===1?(o.x1+o.x2)/2:o.x,cy=o.t===1?(o.y1+o.y2)/2:o.y,id=areaOf(cx,cy);if(!id)continue;const n=TA(id,cx,cy),dx=n.x-cx,dy=n.y-cy;
    if(o.t===1){o.x1+=dx;o.x2+=dx;o.y1+=dy;o.y2+=dy}else{o.x+=dx;o.y+=dy}}
  {const lx=STAGE.sx/U+MW/2,ly=STAGE.sz/U+MH/2,n=TA('parade',lx,ly),dx=(n.x-lx)*U,dz=(n.y-ly)*U;STAGE.sx+=dx;STAGE.sz+=dz;STAGE.lights.forEach(o=>o.x+=dx)}
})();
function fadeBuildings(px,py){B.forEach(b=>{if(b.open)return;const block=px>b.x-60&&px<b.x+b.w+60&&b.y>py-40&&b.y<py+320;if(block===b.faded)return;b.faded=block;
  b.meshes.forEach(m=>{if(m.material===WINLIT||m.material===WINDARK||m.material===WINROY){m.visible=!block;return}if(m._cs===undefined)m._cs=m.castShadow;m.castShadow=block?false:m._cs;const op0=m.material.userData.op??1;m.material.transparent=block||op0<1;m.material.opacity=block?.18:op0;m.material.depthWrite=!block;m.material.needsUpdate=true})})}
function obstacle(x,y){return B.find(b=>!b.open&&x>b.x-6&&x<b.x+b.w+6&&y>b.y-6&&y<b.y+b.h+6)}
function pushOut(p){const b=obstacle(p.x,p.y);if(!b)return;
  const dl=p.x-(b.x-6),dr=b.x+b.w+6-p.x,dt=p.y-(b.y-6),db=b.y+b.h+6-p.y,m=Math.min(dl,dr,dt,db);
  if(m===dl)p.x=b.x-6;else if(m===dr)p.x=b.x+b.w+6;else if(m===dt)p.y=b.y-6;else p.y=b.y+b.h+6}
const locOf=(x,y)=>{let best=null,bd=95;B.forEach(b=>{const d=Math.hypot(b.door[0]-x,b.door[1]-y);if(d<bd){bd=d;best=b}});return best||B.find(b=>b.open&&x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h)||null};
const zoneName=(x,y)=>{const n=locOf(x,y);if(n&&(!n.open||(x>=n.x&&x<=n.x+n.w&&y>=n.y&&y<=n.y+n.h)||Math.hypot(n.door[0]-x,n.door[1]-y)<95))return n.name;const st=typeof SH_STOPS!=='undefined'&&SH_STOPS.find(q=>Math.hypot(q.sx-x,q.sy-y)<70);if(st)return `🚌 ${st.name} stop`;const o=B.find(b=>b.open&&x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h);return o?o.name:zoneOf(x,y)};
