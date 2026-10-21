/* ================= 3D helpers & humans ================= */
let GFX=(()=>{try{return localStorage.getItem('freshers-gfx')||(matchMedia('(pointer:coarse)').matches?'medium':'high')}catch(e){return 'high'}})();
const SHADOWS=GFX==='high',PBR=GFX!=='low';
{const _CT=THREE.CanvasTexture;THREE.CanvasTexture=function(...a){const t=new _CT(...a);t.anisotropy=4;return t};THREE.CanvasTexture.prototype=_CT.prototype}
const lam=c=>PBR?new THREE.MeshStandardMaterial({color:c,roughness:.82,metalness:0}):new THREE.MeshLambertMaterial({color:c});
const basic=(c,o=1)=>new THREE.MeshBasicMaterial({color:c,transparent:o<1,opacity:o});
function mesh(geo,mat,x,y,z,parent){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);if(SHADOWS){const t=geo.type;m.receiveShadow=!(mat&&mat.transparent);m.castShadow=!(t==='PlaneGeometry'||t==='CircleGeometry'||t==='RingGeometry')}parent.add(m);return m}
function box(w,h,d,c,x,y,z,parent){return mesh(new THREE.BoxGeometry(w,h,d),(c&&c.isMaterial)?c:lam(c),x,y,z,parent)}
const cyl=(rt,rb,h,s=16)=>new THREE.CylinderGeometry(rt,rb,h,s);
const sph=(r,a=16,b=12)=>new THREE.SphereGeometry(r,a,b);
function textTex(text,{w=512,h=96,font='700 44px system-ui, sans-serif',color='#f6f0e8',stroke=true,bg=null}={}){
  const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');
  if(bg){g.fillStyle=bg;g.fillRect(0,0,w,h)}
  g.font=font;g.textAlign='center';g.textBaseline='middle';
  if(stroke){g.lineWidth=10;g.strokeStyle='rgba(0,0,0,.75)';g.strokeText(text,w/2,h/2)}
  g.fillStyle=color;g.fillText(text,w/2,h/2);return new THREE.CanvasTexture(c)}
function sprite(text,color,scale=1){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:textTex(text,{color}),transparent:true,depthWrite:false}));s.scale.set(2.6*scale,.49*scale,1);return s}
const MC={};
function clothMat(key){
  if(MC[key])return MC[key];const p=PAL[key];
  const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.fillStyle=p.a;g.fillRect(0,0,128,128);
  if(p.pat==='diag'){g.strokeStyle=p.b;g.lineWidth=8;for(let k=-128;k<256;k+=26){g.beginPath();g.moveTo(k,0);g.lineTo(k+128,128);g.stroke()}}
  else if(p.pat==='stripe'){g.fillStyle=p.b;for(let y=0;y<128;y+=32)g.fillRect(0,y,128,6)}
  else if(p.pat==='kente'){const cols=[p.a,p.b,'#b3261e',p.a,'#111'];for(let x=0;x<128;x+=32)for(let y=0;y<128;y+=8){g.fillStyle=cols[(x/32+y/8)%cols.length];g.fillRect(x,y,32,8)}g.fillStyle='#111';for(let x=0;x<128;x+=32)g.fillRect(x,0,3,128)}
  else if(p.pat==='ghana'){g.fillStyle=p.a;g.fillRect(0,0,128,43);g.fillStyle=p.b;g.fillRect(0,43,128,42);g.fillStyle='#006b3f';g.fillRect(0,85,128,43);g.fillStyle='#111';g.beginPath();for(let i=0;i<10;i++){const r=i%2?7:17,a=-Math.PI/2+i*Math.PI/5;g.lineTo(64+Math.cos(a)*r,64+Math.sin(a)*r)}g.closePath();g.fill()}
  else if(p.pat==='camo'){const cs=[p.b,'#8a8a5a','#2f3a22',p.a];for(let i=0;i<46;i++){g.fillStyle=cs[i%4];g.beginPath();g.ellipse(Math.random()*128,Math.random()*128,8+Math.random()*14,5+Math.random()*9,Math.random()*3,0,7);g.fill()}}
  else if(p.pat==='tiedye'){for(let r=96;r>0;r-=8){g.fillStyle=(r/8)%2?p.a:p.b;g.beginPath();g.arc(64,64,r+Math.sin(r)*4,0,7);g.fill()}g.globalAlpha=.25;g.fillStyle='#e04a7a';g.fillRect(0,0,64,64);g.fillRect(64,64,64,64);g.globalAlpha=1}
  else if(p.pat==='batik'){g.strokeStyle=p.b;g.lineWidth=3;for(let x=0;x<128;x+=32)for(let y=0;y<128;y+=32){g.beginPath();g.arc(x+16,y+16,10,0,7);g.stroke();g.beginPath();g.moveTo(x+16,y+4);g.lineTo(x+16,y+28);g.moveTo(x+4,y+16);g.lineTo(x+28,y+16);g.stroke()}}
  else if(p.pat==='dots'){for(let x=16;x<128;x+=32)for(let y=16;y<128;y+=32){g.fillStyle=p.b;g.beginPath();g.arc(x,y,9,0,7);g.fill();g.fillStyle='#f4c542';g.beginPath();g.arc(x,y,3.5,0,7);g.fill()}}
  else if(p.pat==='wax'){/* Dutch-wax style: big swirls and leaves (Ankara Friday wear) */const cs=[p.b,'#1f3b73','#f4ead2'];for(let i=0;i<9;i++){const x=(i%3)*43+21,y=Math.floor(i/3)*43+21;g.strokeStyle=cs[i%3];g.lineWidth=5;g.beginPath();for(let a=0;a<11;a+=.25){const r=2+a*1.6;g.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r)}g.stroke();g.fillStyle=cs[(i+1)%3];g.beginPath();g.ellipse(x+18,y-16,7,3,.7,0,7);g.fill()}}
  else if(p.pat==='adinkra'){/* repeated adinkra-like stamps (gye nyame / sankofa shapes, simplified) */g.fillStyle=p.b;g.strokeStyle=p.b;g.lineWidth=3;for(let x=0;x<128;x+=32)for(let y=0;y<128;y+=32){const k=((x+y)/32)%2;g.save();g.translate(x+16,y+16);if(k){g.beginPath();g.arc(0,0,9,0,7);g.stroke();g.beginPath();g.arc(0,0,3,0,7);g.fill();for(let a=0;a<4;a++){g.rotate(Math.PI/2);g.fillRect(-1.5,9,3,5)}}else{g.beginPath();g.moveTo(-8,8);g.quadraticCurveTo(-10,-10,4,-8);g.quadraticCurveTo(10,-6,6,2);g.stroke();g.fillRect(-9,9,18,2.5)}g.restore()}g.fillStyle='rgba(0,0,0,.25)';for(let x=0;x<128;x+=32)g.fillRect(x,0,1.5,128)}
  else if(p.pat==='mud'){/* bogolan-style mud cloth: dashes, crosses, zigzags */g.strokeStyle=p.b;g.fillStyle=p.b;g.lineWidth=2.5;for(let y=0;y<128;y+=32){g.fillRect(0,y+2,128,2);g.beginPath();for(let x=0;x<=128;x+=8)g.lineTo(x,y+(x%16?10:16));g.stroke();for(let x=4;x<128;x+=16){g.fillRect(x,y+22,6,2);g.fillRect(x+2,y+20,2,6)}}}
  else{g.fillStyle='rgba(0,0,0,.06)';for(let y=0;y<128;y+=4)g.fillRect(0,y,128,1)}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2,2);
  return MC[key]=new THREE.MeshLambertMaterial({map:t})}
const cm=c=>MC['c'+c]||(MC['c'+c]=lam(c));
function texMat(key,draw,rep=[4,4]){if(MC['t'+key])return MC['t'+key];const c=document.createElement('canvas');c.width=c.height=128;draw(c.getContext('2d'));const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(...rep);return MC['t'+key]=PBR?new THREE.MeshStandardMaterial({map:t,roughness:.8}):new THREE.MeshLambertMaterial({map:t})}

/* ---------- realistic characters (smooth bodies, standard materials) ---------- */
const SM={},GC={};
const stdM=(c,r=.85,o={})=>{const k='s'+c+r+(o.side||'');return SM[k]||(SM[k]=new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:r,metalness:0},o)))};
function skinM(hex){const k='sk'+hex;return SM[k]||(SM[k]=new THREE.MeshStandardMaterial({color:hex,roughness:.48,metalness:0}))}
function clothStd(key,side){const k='cs'+key+(side?'d':'');if(SM[k])return SM[k];return SM[k]=new THREE.MeshStandardMaterial({map:clothMat(key).map,roughness:.92,side:side?THREE.DoubleSide:THREE.FrontSide})}
function hairStd(grey){const k='hair'+grey;if(SM[k])return SM[k];const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');
  g.fillStyle=grey?'#8f8a82':'#15100c';g.fillRect(0,0,128,128);
  for(let i=0;i<700;i++){g.strokeStyle=grey?`rgba(225,220,212,${Math.random()*.3})`:`rgba(${70+Math.random()*40},${50+Math.random()*25},38,${Math.random()*.35})`;g.lineWidth=Math.random()*1.4;const x=Math.random()*128,y=Math.random()*128;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+(Math.random()-.5)*6,y+5,x+(Math.random()-.5)*4,y+10+Math.random()*8);g.stroke()}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3,3);return SM[k]=new THREE.MeshStandardMaterial({map:t,roughness:.82,side:THREE.DoubleSide})}
/* northern smock (fugu / batakari): narrow hand-woven strips sewn side by side, so vertical stripes */
function fuguStd(pal){const k='fugu'+pal;if(SM[k])return SM[k];const P=PAL[pal]||PAL.maroon,c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');
  const cs=[P.a,'#efe6d2',P.a,'#141414',P.a,'#efe6d2','#2b3f7a'];for(let x=0,i=0;x<128;i++){const w=[6,3,8,2,5,3,4][i%7];g.fillStyle=cs[i%cs.length];g.fillRect(x,0,w,128);x+=w}
  for(let y=0;y<128;y+=2){g.fillStyle=`rgba(0,0,0,${.05+Math.random()*.06})`;g.fillRect(0,y,128,1)}for(let x=0;x<128;x+=16){g.fillStyle='rgba(0,0,0,.3)';g.fillRect(x,0,1,128)}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3,2);return SM[k]=new THREE.MeshStandardMaterial({map:t,roughness:.95,side:THREE.DoubleSide})}
/* short hair (low cut, fade): tiny curls stippled, with a crisp barber line-up at the front */
function fadeM(grey,blond){const k='fade'+grey+blond;if(SM[k])return SM[k];const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');
  g.fillStyle=blond?'#b98a3c':grey?'#8f8a82':'#1b1511';g.fillRect(0,0,128,128);for(let i=0;i<1800;i++){const v=Math.random();g.fillStyle=blond?`rgba(240,200,120,${v*.4})`:grey?`rgba(230,225,215,${v*.35})`:`rgba(${60+v*40},${45+v*25},${35+v*15},${v*.45})`;g.fillRect(Math.random()*128,Math.random()*128,1.4,1.4)}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(4,4);return SM[k]=new THREE.MeshStandardMaterial({map:t,roughness:.95})}
function irisM(){if(SM.iris)return SM.iris;const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');
  const gr=g.createRadialGradient(32,32,4,32,32,31);gr.addColorStop(0,'#000');gr.addColorStop(.32,'#0b0705');gr.addColorStop(.36,'#4a2c18');gr.addColorStop(.75,'#2e1a0d');gr.addColorStop(.95,'#140b05');gr.addColorStop(1,'#0a0604');
  g.fillStyle=gr;g.beginPath();g.arc(32,32,31,0,7);g.fill();for(let i=0;i<40;i++){const a=Math.random()*7;g.strokeStyle='rgba(120,80,40,.25)';g.beginPath();g.moveTo(32+Math.cos(a)*12,32+Math.sin(a)*12);g.lineTo(32+Math.cos(a)*28,32+Math.sin(a)*28);g.stroke()}
  g.fillStyle='rgba(255,255,255,.85)';g.beginPath();g.arc(24,23,3.4,0,7);g.fill();g.fillStyle='rgba(255,255,255,.4)';g.beginPath();g.arc(39,39,1.6,0,7);g.fill();
  return SM.iris=new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c),roughness:.15})}
function shadowM(){if(SM.shadow)return SM.shadow;const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');const gr=g.createRadialGradient(32,32,2,32,32,32);gr.addColorStop(0,'rgba(0,0,0,.45)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);
  return SM.shadow=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false})}
const lathe=(key,pts,seg=24)=>GC[key]||(GC[key]=new THREE.LatheGeometry(pts.map(([r,y])=>new THREE.Vector2(r,y)),seg));
function tcap(r1,r2,len,seg=14){const key=`tc${r1}_${r2}_${len}_${seg}`;if(GC[key])return GC[key];const pts=[];
  for(let i=0;i<=6;i++){const a=-Math.PI/2+i/6*Math.PI/2;pts.push([Math.max(.0005,r2*Math.cos(a)),-len+r2+r2*Math.sin(a)])}
  for(let i=0;i<=6;i++){const a=i/6*Math.PI/2;pts.push([Math.max(.0005,r1*Math.cos(a)),-r1+r1*Math.sin(a)])}
  return GC[key]=new THREE.LatheGeometry(pts.map(([r,y])=>new THREE.Vector2(r,y)),seg)}
function headGeo(f,hi){const key='head'+f+(hi?'h':'');if(GC[key])return GC[key];const R0=f?.121:.126,g=new THREE.SphereGeometry(R0,hi?96:36,hi?76:28),p=g.attributes.position;
  for(let i=0;i<p.count;i++){let x=p.getX(i),y=p.getY(i),z=p.getZ(i);
    if(y<0){const t=-y/R0;x*=1-(f?.28:.32)*t*t;z*=1-.06*t;if(z>0)z*=1+.06*t}
    if(z>0){z*=.92;const cheek=Math.exp(-((y+.005)**2)/.0012)*Math.exp(-((Math.abs(x)-.055)**2)/.0015);x*=1+cheek*.06}else z*=1.07;
    y*=1.16;
    /* sculpt: chin, jaw, soft muzzle, eye sockets, brow ridge, nose root and cheekbones */
    if(z>0){const G=(a,s)=>Math.exp(-a*a/s),fr=Math.min(1,z/.06),ax=Math.abs(x);
      z+=fr*(.011*G(y+.113,.0005)*G(x,.0016)+.007*G(y+.062,.0011)*G(x,.0028)-.0065*G(y-.012,.00045)*G(ax-.043,.0005)+.0045*G(y-.04,.00025)*G(ax-.04,.002)+.009*G(y-.008,.0011)*G(x,.0001)+.004*G(y+.012,.0006)*G(ax-.066,.0006));
      if(!f){const jw=G(y+.088,.0009)*G(ax-.075,.0012);x+=Math.sign(x)*jw*.008}}
    p.setXYZ(i,x,y,z)}
  g.computeVertexNormals();return GC[key]=g}
function bumpySphere(r,key){if(GC[key])return GC[key];const g=new THREE.SphereGeometry(r,28,20),p=g.attributes.position;
  for(let i=0;i<p.count;i++){const v=new THREE.Vector3(p.getX(i),p.getY(i),p.getZ(i));const n=1+.05*Math.sin(v.x*90)*Math.sin(v.y*85)*Math.sin(v.z*95)+.03*Math.sin(v.x*160+v.z*140);v.multiplyScalar(n);p.setXYZ(i,v.x,v.y,v.z)}
  g.computeVertexNormals();return GC[key]=g}
const TORSO={m:[[.001,.80],[.13,.80],[.163,.84],[.17,.90],[.162,.97],[.155,1.03],[.163,1.10],[.186,1.18],[.203,1.26],[.204,1.31],[.172,1.36],[.095,1.40],[.055,1.43]],
             f:[[.001,.80],[.14,.80],[.18,.85],[.186,.91],[.163,.98],[.136,1.04],[.14,1.10],[.158,1.17],[.17,1.24],[.166,1.30],[.142,1.35],[.08,1.40],[.05,1.43]]};
const OSPEC={
 m_tee:{sl:1,legs:'pants',pc:'#5e5b3c',cargo:1,belt:1,loose:1},
 m_swim:{sl:0,legs:'shorts',pc:'#1f5f9b',bare:1},f_swim:{sl:0,legs:'skin',solid:1,neck:2},
 m_hoodie:{sl:3,legs:'jog',pc:'#8d8f93',hood:1,pocket:1,long:1},
 m_polo:{sl:1,legs:'pants',pc:'#c2ae86',collar:1,placket:1,belt:1},
 m_shirt:{sl:2,legs:'pants',pc:'#2f4a73',collar:1,buttons:1,belt:1},
 m_jersey:{sl:1,legs:'shorts',pc:'#f2f0ea',socks:1},
 m_smock:{sl:1,legs:'pants',pc:'#1d1916',over:'smock',loose:1},
 m_jacket:{sl:2,legs:'pants',pc:'#2d3f5c',denim:1,jacket:'#4a6d99',jdenim:1,belt:1},
 m_varsity:{sl:2,legs:'jog',pc:'#8d8f93',jacket:'pal',slc:'#f1ece3',rib:1},
 m_track:{sl:2,legs:'jog',match:1,solid:1,stripes:1,zip:1},
 m_kaftan:{sl:2,legs:'pants',match:1,over:'kaftan',emb:1},
 f_twopiece:{sl:1,legs:'pants',match:1,crop:1,wide:1},
 f_jumpsuit:{sl:0,legs:'pants',match:1,solid:1,belt:1,wide:1,neck:2},
 f_blazer:{sl:2,legs:'pants',match:1,solid:1,jacket:'pal',tee:'#f4f1ea',wide:1},
 f_athleisure:{sl:0,legs:'tights',pc:'#1c1c1c',crop:1,solid:1,tee:'#1c1c1c',jacket:'pal',zipj:1},
 f_kente:{sl:0,legs:'skin',over:'maxi',neck:2,kente:1},
 f_jeans:{sl:1,legs:'pants',pc:'#5d7fa8',crop:1,wide:1,belt:1},
 f_hoodie:{sl:3,legs:'tights',pc:'#1c1c1c',hood:1,pocket:1,long:1},
 f_bodycon:{sl:0,legs:'skin',solid:1,neck:1,over:'bodycon'},
 f_tank:{sl:0,legs:'pants',pc:'#b9a582',cargo:1,neck:2,crop:1},
 f_skirt:{sl:1,legs:'skin',over:'mini',oc:'#3d5f8f',belt:1,loose:1},
 f_kaba:{sl:1,legs:'skin',over:'kaba',puff:1},
 f_dress:{sl:0,legs:'skin',neck:1,over:'sundress'},
 m_unitee:{sl:1,legs:'pants',pc:'#2b2b2b',loose:1,print:'AKWAABA U'},
 m_rugby:{sl:2,legs:'pants',pc:'#7aa0c8',collar:1,placket:1,loose:1},
 m_suit:{sl:2,legs:'pants',match:1,solid:1,jacket:'pal',tee:'#f4f1ea',collar:1},
 m_cargo2:{sl:1,legs:'pants',pc:'#2b2b2b',cargo:1,loose:1},
 f_dskirt:{sl:1,legs:'skin',crop:1,over:'dskirt'},
 f_formal:{sl:2,legs:'pants',pc:'#cdbb9a',tee:'#ffffff',collar:1,buttons:1,wide:1},
 f_cargo:{sl:0,legs:'pants',pc:'#5b6b3a',cargo:1,neck:2,crop:1,wide:1},
 f_unitee:{sl:1,legs:'pants',pc:'#5d7fa8',wide:1,print:'AKWAABA U'},
 m_faculty:{sl:2,legs:'pants',pc:'#151515',collar:1,buttons:1,belt:1,solid:1},
 f_faculty:{sl:1,legs:'skin',collar:1,buttons:1,solid:1,over:'pencil'},
 m_friday:{sl:1,legs:'pants',pc:'#1a1a1a',collar:1,buttons:1,loose:1},
 m_baggy:{sl:1,legs:'pants',pc:'#4a6d99',loose:1,wide:1,solid:1},
 m_jorts:{sl:1,legs:'jorts',pc:'#5d7fa8',loose:1,solid:1},
 m_halltee:{sl:1,legs:'jog',pc:'#2b2b2b',loose:1,solid:1,print:'HALL WEEK'},
 f_corset:{sl:0,legs:'pants',pc:'#5d7fa8',neck:2,wide:1,solid:1,corset:1},
 f_halltee:{sl:1,legs:'jorts',pc:'#5d7fa8',loose:1,solid:1,print:'HALL WEEK'},
 f_friday:{sl:1,legs:'skin',tee:'#f4f1ea',over:'wrap'},
 m_coord:{sl:1,legs:'jog',match:1,solid:1,loose:1},f_coord:{sl:1,legs:'jog',match:1,solid:1,loose:1,crop:1},
 m_bjersey:{sl:1,legs:'pants',pc:'#4a6d99',denim:1,loose:1,wide:1,collar:1,stripes:1,solid:1},f_fjersey:{sl:1,legs:'jorts',pc:'#5d7fa8',loose:1,solid:1,collar:1,stripes:1},
 m_bomber:{sl:2,legs:'pants',pc:'#5e5b3c',cargo:1,loose:1,jacket:'pal',tee:'#1c1c1c',rib:1},m_work:{sl:2,legs:'pants',pc:'#3f5f86',denim:1,wide:1,loose:1,jacket:'#8a6a3e',tee:'#f4f1ea'},
 m_overshirt:{sl:2,legs:'pants',pc:'#3a3a3a',wide:1,loose:1,jacket:'pal',tee:'#f4f1ea'},m_mesh:{sl:1,legs:'shorts',pc:'#1c1c1c',loose:1,solid:1,socks:1},
 f_cardigan:{sl:2,legs:'skin',jacket:'pal',tee:'#f8f1f4',over:'mini',oc:'#2b2b2b',crop:1},f_leather:{sl:2,legs:'pants',pc:'#5b6b3a',cargo:1,wide:1,jacket:'#161616',tee:'#f4f1ea',crop:1},
 f_ftrack:{sl:2,legs:'jog',match:1,solid:1,stripes:1,zip:1,wide:1}};
const ospec=(f,O)=>OSPEC[(f?'f_':'m_')+O]||OSPEC[(f?'m_':'f_')+O]||OSPEC.m_tee;
const hexN=c=>new THREE.Color(c).getHex();
function torsoMat(L,f){const O=L.outfit,sp=ospec(f,O),k='to'+(f?'f':'m')+O+L.pal+L.skin;if(SM[k])return SM[k];
  const c=document.createElement('canvas');c.width=128;c.height=256;const g=c.getContext('2d'),row=i=>Math.round((1-i/12)*256);
  if(sp.bare){g.fillStyle=L.skin;g.fillRect(0,0,128,256)}
  else if(sp.solid){g.fillStyle=PAL[L.pal].a;g.fillRect(0,0,128,256);g.fillStyle='rgba(0,0,0,.08)';for(let x=0;x<128;x+=16)g.fillRect(x,0,1,256)}
  else{const img=clothMat(L.pal).map.image;for(let y=0;y<256;y+=64)for(let x=0;x<128;x+=64)g.drawImage(img,x,y,64,64)}
  const band=(i1,i2,col)=>{g.fillStyle=col;g.fillRect(0,row(i2),128,row(i1)-row(i2))};
  const front=(i1,i2,w,col,cx=0)=>{g.fillStyle=col;const y=row(i2),h=row(i1)-row(i2);if(cx){g.fillRect(cx-w,y,w*2,h)}else{g.fillRect(0,y,w,h);g.fillRect(128-w,y,w,h)}};
  if(sp.legs!=='skin'){const top=sp.crop?4.5:sp.long?2.6:4;band(0,top,sp.pc);g.fillStyle='rgba(0,0,0,.3)';g.fillRect(0,row(top),128,3)}
  else if(sp.over==='mini')band(0,4.5,sp.oc);
  if(sp.crop)band(4.5,6,L.skin);
  if(sp.neck===1)front(10.7,12,20,L.skin);
  if(sp.neck===2){band(11.2,12,L.skin);front(10.3,11.3,22,L.skin);front(10.3,11.3,22,L.skin,64)}
  if(sp.pocket){front(4.4,6.1,24,'rgba(0,0,0,.22)');g.fillStyle='rgba(255,255,255,.18)';g.fillRect(0,row(6.1),24,2);g.fillRect(104,row(6.1),24,2)}
  if(sp.buttons){g.fillStyle='rgba(255,255,255,.7)';for(let y=row(11.5);y<row(4.2);y+=22){g.beginPath();g.arc(2,y,2,0,7);g.fill();g.beginPath();g.arc(126,y,2,0,7);g.fill()}}
  if(sp.placket){g.fillStyle='rgba(255,255,255,.6)';[row(11.3),row(10.6)].forEach(y=>{g.beginPath();g.arc(2,y,2,0,7);g.fill()})}
  const t=new THREE.CanvasTexture(c);return SM[k]=new THREE.MeshStandardMaterial({map:t,roughness:sp.solid?.7:.9})}

const smooth=(e0,e1,x)=>{const t=Math.max(0,Math.min(1,(x-e0)/(e1-e0)));return t*t*(3-2*t)};
const pick2=(L,a)=>a[[...(L.pal+L.skin+L.outfit)].reduce((h,c)=>h*31+c.charCodeAt(0)&65535,7)%a.length];
function fabricT(kind){const k='fab'+kind;if(SM[k])return SM[k];const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,64,64);
  if(kind==='denim'){for(let i=-64;i<128;i+=3){g.strokeStyle=`rgba(0,0,30,${.08+Math.random()*.1})`;g.beginPath();g.moveTo(i,0);g.lineTo(i+64,64);g.stroke()}for(let i=0;i<120;i++){g.fillStyle=`rgba(255,255,255,${Math.random()*.25})`;g.fillRect(Math.random()*64,Math.random()*64,3,1)}}
  else{for(let y=0;y<64;y+=2){g.fillStyle=`rgba(0,0,0,${.04+Math.random()*.04})`;g.fillRect(0,y,64,1)}for(let x=0;x<64;x+=2){g.fillStyle='rgba(0,0,0,.03)';g.fillRect(x,0,1,64)}}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(4,4);return SM[k]=t}
function denimStd(col){const k='dn'+col;return SM[k]||(SM[k]=new THREE.MeshStandardMaterial({color:col,map:fabricT('denim'),roughness:.9,side:THREE.DoubleSide}))}
function bodyMats(L,f,sp){const key='bm'+(f?'f':'m')+L.outfit+L.pal+L.skin;if(SM[key])return SM[key];
  const sc=new THREE.Color(L.skin),skin=new THREE.MeshStandardMaterial({color:sc,roughness:.52,emissive:sc.clone().multiplyScalar(.07),skinning:true});
  const pat=!sp.solid&&!sp.tee,P=PAL[L.pal];
  const top=sp.over==='smock'?new THREE.MeshStandardMaterial({map:fuguStd(L.pal).map,roughness:.95,skinning:true}):pat?new THREE.MeshStandardMaterial({map:clothMat(L.pal).map,roughness:.9,skinning:true}):new THREE.MeshStandardMaterial({color:hexN(sp.tee||P.a),map:fabricT('w'),roughness:.8,skinning:true});
  const bcol=sp.match?(pat?null:hexN(P.a)):hexN(sp.pc||'#333333');
  const bot=sp.match&&pat?new THREE.MeshStandardMaterial({map:clothMat(L.pal).map,roughness:.9,skinning:true}):new THREE.MeshStandardMaterial({color:bcol,map:fabricT(sp.denim||/^#[2-5][0-9a-f][4-7]/i.test(sp.pc||'')?'denim':'w'),roughness:sp.legs==='tights'?.5:.88,skinning:true});
  const accC=sp.jacket?(sp.jacket==='pal'?P.a:sp.jacket):sp.slc||(sp.stripes?'#f4f2ec':sp.socks?P.b:P.b);
  const acc=new THREE.MeshStandardMaterial({color:hexN(accC),map:fabricT(sp.jdenim?'denim':'w'),roughness:.8,skinning:true});
  bot.userData.plain=stdM(bcol||hexN(P.a),.88);return SM[key]=[skin,top,bot,acc]}
function handGeo(f,s){const key='hand'+f+s;if(GC[key])return GC[key];const M=new THREE.Matrix4(),L=[],put=(geo,x,y,z,rx=0,rz=0,sx=1,sy=1,sz=1)=>{const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,0,rz));L.push({geo,m:new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),q,new THREE.Vector3(sx,sy,sz))})};
  const k=f?.9:1;put(new THREE.SphereGeometry(.036*k,12,10),0,-.025*k,.004,0,0,.85,1.15,.55);
  for(let i=0;i<4;i++)put(tcap(.0095*k,.0085*k,(.055-Math.abs(i-1.5)*.007)*k,8),(-.017+i*.0115)*k*s,-.055*k,.008,.25,0);
  put(tcap(.011*k,.0095*k,.05*k,8),-s*.03*k,-.012*k,.018,-.35,s*.65);
  return GC[key]=mergeGeos(L)}
function VGEO2(k){if(GC[k])return GC[k];const sph2=(sx,sy,sz,x,y,z,r=.05)=>{const g=new THREE.SphereGeometry(r,18,12);g.scale(sx,sy,sz);g.translate(x,y,z);return g};let g;
  if(k==='snkU')g=mergeGeos([{geo:sph2(1.12,.95,2.25,0,.008,0),m:new THREE.Matrix4()},{geo:sph2(.9,.9,1,0,.035,-.07,.035),m:new THREE.Matrix4()}]);
  if(k==='snkS')g=sph2(1.22,.42,2.42,0,-.026,0);
  if(k==='snkT'){g=new THREE.BoxGeometry(.118,.018,.12);g.translate(0,-.005,-.01)}
  if(k==='lthU')g=sph2(1.08,.78,2.4,0,0,.005);
  if(k==='lthS')g=sph2(1.12,.3,2.45,0,-.027,.005);
  return GC[k]=g}
function bodyGeo(f,O){const key='body'+(f?'f':'m')+O;if(GC[key])return GC[key];const sp=ospec(f,O),N=20;
  const P=[],UV=[],SI=[],SW=[],IDX=[[],[],[],[]];
  const pushW=w=>{const a=w.filter(q=>q[1]>1e-3).sort((x,y)=>y[1]-x[1]).slice(0,4),t=a.reduce((s,q)=>s+q[1],0)||1;while(a.length<4)a.push([0,0]);SI.push(...a.map(q=>q[0]));SW.push(...a.map(q=>q[1]/t))};
  function tube(rows,region,def,capT,capB){const base=P.length/3;
    rows.forEach(r=>{for(let k=0;k<=N;k++){const a=k/N*Math.PI*2;let x=r.x+Math.sin(a)*r.rx,y=r.y,z=r.z+Math.cos(a)*r.rz;if(def)[x,y,z]=def(x,y,z,a,r);P.push(x,y,z);UV.push(k/N*2,y*3);pushW(r.w)}});
    for(let ri=0;ri<rows.length-1;ri++)for(let k=0;k<N;k++){const a=base+ri*(N+1)+k,b=a+N+1,c=a+1,d=b+1,m=region((rows[ri].y+rows[ri+1].y)/2,(k+.5)/N*Math.PI*2);IDX[m].push(a,b,c,c,b,d)}
    const cap=(ri,up)=>{const r=rows[ri],ci=P.length/3;P.push(r.x,r.y+(up?.004:-.004),r.z);UV.push(.5,r.y*3);pushW(r.w);const st=base+ri*(N+1),m=region(r.y,0);for(let k=0;k<N;k++)up?IDX[m].push(st+k,st+k+1,ci):IDX[m].push(st+k+1,st+k,ci)};
    if(capT)cap(0,true);if(capB)cap(rows.length-1,false)}
  const H=0,SP=1,CH=2,NK=3,HD=4,AL=5,EL=6,AR=7,ER=8,LL=9,KL=10,LR=11,KR=12;
  const legsT=sp.legs,topHem=sp.long?.9:sp.crop?1.08:(legsT==='skin'?.8:.985),waist=sp.crop?1.0:.985,bare=sp.bare;
  const isTopY=y=>!bare&&y>=topHem,isBotY=y=>legsT!=='skin'&&y<waist+.002;
  // torso
  const ty=[1.47,1.445,1.42,1.385,1.345,1.3,1.24,1.18,1.12,1.06,1.0,.95,.9,.85,.8],
    trx=f?[.05,.085,.13,.162,.17,.166,.158,.148,.132,.13,.148,.166,.166,.135,.05]:[.055,.09,.145,.185,.198,.195,.186,.172,.156,.149,.152,.161,.159,.128,.05],
    trz=f?[.045,.055,.08,.098,.102,.104,.1,.094,.088,.092,.1,.108,.105,.09,.05]:[.05,.06,.085,.105,.112,.116,.114,.108,.102,.1,.102,.106,.104,.09,.05];
  const trows=ty.map((y,i)=>{const hw=1-smooth(.96,1.06,y),cw=smooth(1.15,1.25,y),nw=smooth(1.41,1.47,y);let w=[[H,hw],[SP,Math.max(0,1-hw-cw)],[CH,cw*(1-nw)],[NK,cw*nw]];
    const lo=(isTopY(y)?.006:0)+(isBotY(y)&&sp.loose?.006:0)+(sp.long&&y<1.06&&y>.88?.014:0);return{x:0,y,z:0,rx:trx[i]+lo,rz:trz[i]+lo*.8,w}});
  const tdef=(x,y,z,a)=>{if(f){const b=Math.exp(-((y-1.215)**2)/.0016)*Math.max(0,Math.cos(a))**1.6*Math.exp(-((Math.abs(Math.sin(a))-.42)**2)/.09);z+=b*.05;y-=b*.006}
    const gl=Math.exp(-((y-.92)**2)/.0018)*Math.max(0,-Math.cos(a))**2;z-=gl*(f?.03:.018);return[x,y,z]};
  const neckLow=sp.neck===2?1.33:sp.neck===1?1.37:1.41;
  tube(trows,(y,a)=>{const front=Math.cos(a)>.6;
    if(bare)return y<waist?2:0;
    if(isBotY(y)&&!(sp.long&&y>.9))return sp.match?2:2;
    if(y<topHem)return 0;
    if(sp.neck===2&&y>1.33&&(Math.abs(Math.cos(a))>.45||y>1.38))return 0;
    if(y>neckLow+(sp.neck===1&&!front?.04:0))return y>1.43?0:(sp.collar||sp.hood||sp.rib||sp.zip?1:0);
    if(sp.stripes&&y<1.36&&Math.abs(Math.sin(a))>.95)return 3;
    return 1},tdef,false,true);
  // neck
  tube([[1.665,.043],[1.6,.045],[1.54,.047],[1.48,.052],[1.43,.062]].map(([y,r])=>({x:0,y,z:y>1.5?.004:-.004,rx:r*(f?.9:1),rz:r*.95*(f?.9:1),w:[[HD,smooth(1.56,1.64,y)],[NK,1-smooth(1.56,1.64,y)-(1-smooth(1.43,1.48,y))],[CH,1-smooth(1.43,1.48,y)]]})),()=>0,null,true,false);
  // arms
  const ay=[1.425,1.41,1.385,1.35,1.3,1.24,1.17,1.11,1.07,1.03,.96,.88,.82,.795],ar=[.02,.042,.056,.062,.061,.057,.051,.046,.043,.045,.041,.033,.029,.02],ak=f?.86:1,ain=[.55,.72,.87,.96,1,1,1,1,1,1,1,1,1,1];
  [[-1,AL,EL],[1,AR,ER]].forEach(([s,ab,eb])=>{const x0=s*(f?.205:.225);
    const sleeveEnd=sp.sl===0?9:sp.sl===1?(sp.puff?1.17:sp.loose?1.13:1.2):.83,sleeveM=sp.jacket||sp.slc?3:1,puff=sp.puff?.016:0;
    const rows=ay.map((y,i)=>{const t=smooth(1.02,1.1,y),cw=smooth(1.34,1.42,y)*.55;const sl=sp.sl>0&&y>=sleeveEnd;const ex=sl?(.006+(sp.loose?.008:0)+(sp.sl===1?puff*Math.exp(-((y-1.28)**2)/.004):0)+(sp.jacket?.008:0)):0;
      return{x:x0*ain[i]+s*Math.max(0,1.35-y)*.012,y,z:0,rx:ar[i]*ak+ex,rz:ar[i]*ak*.94+ex,w:[[CH,cw],[ab,t*(1-cw)],[eb,(1-t)*(1-cw)]]}});
    tube(rows,(y,a)=>{if(bare||sp.sl===0)return 0;if(y<sleeveEnd)return 0;if(sp.stripes&&Math.abs(Math.sin(a))>.9&&Math.sign(Math.sin(a))===s)return 3;if(sp.sl===3&&y<.88)return 1;return sleeveM},null,true,true)});
  // legs
  const ly=[.99,.95,.9,.84,.76,.67,.58,.51,.47,.43,.38,.31,.24,.16,.09,.05,.025],lr=f?[.082,.1,.106,.102,.094,.082,.069,.057,.051,.049,.054,.055,.047,.038,.031,.03,.024]:[.078,.094,.098,.095,.089,.081,.072,.061,.055,.054,.06,.061,.052,.042,.034,.033,.026];
  [[-1,LL,KL],[1,LR,KR]].forEach(([s,lb,kb])=>{const hx=s*(f?.088:.095);
    const hem=legsT==='pants'?.06:legsT==='jog'?.07:legsT==='tights'?.05:legsT==='shorts'?.58:legsT==='jorts'?.4:2,flare=sp.wide?.022:sp.cargo||sp.loose?.01:.004;
    const rows=ly.map((y,i)=>{const t=smooth(.39,.47,y),hw=smooth(.9,1.0,y)*.6;const inB=legsT!=='skin'&&y>=hem&&legsT!=='tights';const ex=inB?(.005+(y<.47?flare*(1-y/.47)*1.6:flare*.5)):legsT==='tights'&&y>=hem?.002:0;
      const xc=hx*(y>.47?(.9+.1*(y-.47)/.52):(.84+.06*y/.47));const sq=legsT==='skin'&&sp.over&&y>.62?.8:1;return{x:xc*(sq<1?.92:1),y,z:y<.4&&y>.22?-.006:0,rx:(lr[i]+ex)*sq,rz:(lr[i]*.95+ex)*sq,w:[[H,hw],[lb,t*(1-hw)],[kb,(1-t)*(1-hw)]]}});
    tube(rows,(y,a)=>{if(sp.socks&&y<.26&&y>.06)return 3;if(legsT==='skin'||y<hem)return 0;if(legsT==='jog'&&y<.12)return 3===3&&sp.stripes?2:1===1?2:2;if(sp.stripes&&Math.abs(Math.sin(a))>.93&&Math.sign(Math.sin(a))===s)return 3;return 2},null,true,true)});
  const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(P,3));G.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2));
  G.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(SI,4));G.setAttribute('skinWeight',new THREE.Float32BufferAttribute(SW,4));
  const all=[];IDX.forEach((ix,m)=>{G.addGroup(all.length,ix.length,m);all.push(...ix)});G.setIndex(all);G.computeVertexNormals();G.computeBoundingSphere();G.boundingSphere.radius*=1.6;return GC[key]=G}
function wavesM(){if(SM.waves)return SM.waves;const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.fillStyle='#1d1612';g.fillRect(0,0,128,128);
  for(let r=6;r<180;r+=7){g.strokeStyle='rgba(90,70,55,.55)';g.lineWidth=2.2;g.beginPath();for(let a=0;a<6.3;a+=.12){const rr=r+Math.sin(a*9)*2.2;g.lineTo(64+Math.cos(a)*rr,30+Math.sin(a)*rr)}g.stroke()}
  return SM.waves=new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c),roughness:.7})}
function braidsGeo(){if(GC.braids)return GC.braids;const L=[];for(let i=0;i<30;i++){const a=Math.PI*(.06+i*.031),r=.123,x=Math.cos(a)*r,z=-Math.sin(a)*.112;const len=.42+((i*7)%5)*.025;
    const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(.18+.1*Math.sin(i),0,-Math.cos(a)*.16));L.push({geo:tcap(.011,.008,len,6),m:new THREE.Matrix4().compose(new THREE.Vector3(x,.02,z),q,new THREE.Vector3(1,1,1))})}
  for(let i=0;i<10;i++){const a=Math.PI*(.25+i*.05);L.push({geo:tcap(.01,.008,.1,6),m:new THREE.Matrix4().compose(new THREE.Vector3(Math.cos(a)*.1,.13,Math.sin(a)*.04-.02),new THREE.Quaternion().setFromEuler(new THREE.Euler(-1.1,0,0)),new THREE.Vector3(1,1,1))})}
  return GC.braids=mergeGeos(L)}
function afroGeo(key,R,cx,cy,cz,hairY){if(GC[key])return GC[key];const g=new THREE.SphereGeometry(R,36,26),p=g.attributes.position,sc=new THREE.Vector3(0,.02,-.012),v=new THREE.Vector3(),w=new THREE.Vector3();
  const ss=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)};
  for(let i=0;i<p.count;i++){v.set(p.getX(i),p.getY(i),p.getZ(i));const n=1+.045*Math.sin(v.x*90)*Math.sin(v.y*85)*Math.sin(v.z*95)+.025*Math.sin(v.x*160+v.z*140);v.multiplyScalar(n);v.x*=1.06;v.add(w.set(cx,cy,cz));
    // keep the face open: below the hairline at the front the hair hugs the scalp instead of hanging over the eyes
    const k=ss(.16,.115,Math.abs(v.x))*ss(hairY+.025,hairY-.03,v.y);if(k>0){const zt=Math.min(v.z,.015+.25*Math.max(0,Math.abs(v.x)-.06));v.z+=(zt-v.z)*k}
    v.sub(w.set(cx,cy,cz));p.setXYZ(i,v.x,v.y,v.z)}
  g.computeVertexNormals();return GC[key]=g}
function cornrowGeo(){if(GC.corn)return GC.corn;const L=[];for(let i=-3;i<=3;i++){const x=i*.034;for(let k=0;k<15;k++){const t=k/14,ang=-1.3+t*2.55,xx=x*Math.max(.55,Math.cos(ang*.6)),rr=Math.sqrt(.135*.135-xx*xx),y=Math.cos(ang)*rr,z=Math.sin(ang)*rr;
    L.push({geo:new THREE.SphereGeometry(.0125,8,6),m:new THREE.Matrix4().compose(new THREE.Vector3(xx,y,z),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),-ang),new THREE.Vector3(1,.75,1.7))})}}return GC.corn=mergeGeos(L)}
function makeHuman(L,o){return realOn()?makeRealHuman(L,o):makeHumanProc(L,o)}
function makeHumanProc(L,{label=null,labelColor='#f6f0e8',ring=false}={}){
  const f=L.gender==='f',g=new THREE.Group(),O=L.outfit;g.rotation.order='YXZ';
  if(typeof HAIR!=='undefined'&&HAIR[f?'f':'m']&&!HAIR[f?'f':'m'][L.hair])L.hair=f?'knotless':'fade';   // retired styles (e.g. half up half down)
  const skin=skinM(L.skin),cloth=clothStd(L.pal),hair=hairStd(!!L.grey),gold=stdM(0xd9a537,.3,{metalness:.8});
  const sp=ospec(f,O),topM=sp.solid?stdM(hexN(PAL[L.pal].a),.7):cloth;
  const pantsM=sp.legs==='skin'?null:stdM(hexN(sp.pc),sp.legs==='tights'?.55:.9);
  const sk=new THREE.Color(L.skin),lipC=sk.clone().lerp(new THREE.Color(f?0x5a2230:0x3e1d1c),f?.5:.42).getHex(),darkSkin=sk.clone().multiplyScalar(.75).getHex();
  // contact shadow
  const sh=mesh(new THREE.PlaneGeometry(.95,.95),shadowM(),0,.012,0,g);sh.rotation.x=-Math.PI/2;
  // ---- skeleton (same joint positions the poses were tuned for) ----
  const Bn=()=>new THREE.Bone();
  const hips=Bn();hips.position.set(0,.84,0);g.add(hips);const spine=Bn();spine.position.set(0,.2,0);hips.add(spine);
  const chest=Bn();chest.position.set(0,.2,0);spine.add(chest);const neckB=Bn();neckB.position.set(0,.22,0);chest.add(neckB);const headB=Bn();headB.position.set(0,.125,0);neckB.add(headB);
  const sw=f?.185:.205,arms=[],elbows=[],legs=[],knees=[];
  [-1,1].forEach(s=>{const a=Bn();a.position.set(s*(sw+.02),.09,0);chest.add(a);arms.push(a);const e=Bn();e.position.set(0,-.27,0);a.add(e);elbows.push(e)});
  [-1,1].forEach(s=>{const l=Bn();l.position.set(s*(f?.088:.095),0,0);hips.add(l);legs.push(l);const k=Bn();k.position.set(0,-.41,0);l.add(k);knees.push(k)});
  const bones=[hips,spine,chest,neckB,headB,arms[0],elbows[0],arms[1],elbows[1],legs[0],knees[0],legs[1],knees[1]];
  const body=new THREE.SkinnedMesh(bodyGeo(f,O),bodyMats(L,f,sp));body.castShadow=SHADOWS;body.receiveShadow=SHADOWS;g.add(body);g.updateMatrixWorld(true);body.bind(new THREE.Skeleton(bones));
  const torso=chest;
  if(sp.print){const k='prt'+sp.print+L.pal;const tm=SM[k]||(SM[k]=new THREE.MeshBasicMaterial({map:textTex(sp.print,{w:256,h:72,font:'900 34px system-ui',color:new THREE.Color(PAL[L.pal].a).getHSL({}).l>.6?'#1c1c1c':'#ffffff',stroke:false}),transparent:true,depthWrite:false}));const d=new THREE.Mesh(new THREE.PlaneGeometry(.3,.084),tm);d.position.set(0,-.015,f?.168:.192);chest.add(d)}
  const at=(bone,absY)=>absY-new THREE.Vector3().setFromMatrixPosition(bone.matrixWorld).y;
  const topM2=sp.solid?stdM(hexN(sp.tee||PAL[L.pal].a),.75):cloth,accC=sp.jacket?(sp.jacket==='pal'?PAL[L.pal].a:sp.jacket):sp.slc||PAL[L.pal].b;
  // ---- garments that hang (rigid, follow the hips or chest) ----
  const shell=(bone,key,pts,m,sz=.8,ph)=>{const k=mesh(ph?new THREE.LatheGeometry(pts.map(([r,y])=>new THREE.Vector2(r,y)),28,ph[0],ph[1]):lathe(key,pts,28),m,0,-new THREE.Vector3().setFromMatrixPosition(bone.matrixWorld).y,0,bone);k.scale.z=sz;return k};
  if(sp.over==='sundress')shell(hips,'sundress',[[.3,.47],[.255,.62],[.212,.78],[.172,.95],[.152,1.03]],clothStd(L.pal,1));
  if(sp.over==='bodycon')shell(hips,'bodycon',[[.172,.55],[.19,.66],[.2,.78],[.19,.88],[.166,.97],[.146,1.03]],stdM(hexN(PAL[L.pal].a),.6,{side:THREE.DoubleSide}));
  if(sp.over==='dskirt')shell(hips,'dskirt',[[.24,.06],[.222,.3],[.205,.6],[.195,.82],[.168,.96],[.152,1.0]],denimStd(0x4a6d99));
  if(sp.over==='mini')shell(hips,'mini',[[.228,.6],[.207,.72],[.18,.88],[.158,.99]],stdM(hexN(sp.oc),.85,{side:THREE.DoubleSide}));
  if(sp.over==='kaba'){shell(hips,'kabaS',[[.21,.07],[.195,.3],[.19,.6],[.2,.82],[.165,.96],[.15,1.0]],clothStd(L.pal,1));shell(spine,'pep',[[.235,.86],[.2,.93],[.163,.99]],clothStd(L.pal,1))}
  if(sp.over==='smock'){shell(spine,'smock2',[[.33,.68],[.29,.8],[.24,.95],[.212,1.1],[.218,1.26],[.21,1.33],[.15,1.4]],fuguStd(L.pal),.78);const em=stdM(0xe9dcb8,.6);[-1,1].forEach(sd=>{const v=box(.012,.13,.01,em,sd*.032,at(chest,1.37),f?.13:.15,chest);v.rotation.z=sd*.38});for(let i=0;i<3;i++)mesh(sph(.007,6,5),em,0,at(chest,1.27-i*.04),f?.135:.155,chest)}
  if(sp.over==='pencil')shell(hips,'pencil',[[.158,.4],[.17,.5],[.188,.66],[.197,.8],[.172,.95],[.153,1.0]],stdM(0x161616,.7,{side:THREE.DoubleSide}));
  if(sp.over==='wrap'){shell(hips,'wrap',[[.245,.06],[.226,.3],[.207,.6],[.198,.82],[.17,.96],[.153,1.0]],clothStd(L.pal,1));const kn=mesh(sph(.035,10,8),clothStd(L.pal),.12,at(hips,.97),.1,hips);kn.scale.set(1,.8,.7);const tl=mesh(tcap(.02,.012,.14,6),clothStd(L.pal),.13,at(hips,.95),.11,hips);tl.rotation.z=.2}
  if(sp.corset){const cm2=stdM(0x111111,.5);for(let i=-2;i<=2;i++){if(!i)continue;const bn=box(.006,.2,.006,cm2,i*.045,at(chest,1.2),(f?.105:.12)-Math.abs(i)*.012,chest);bn.rotation.y=i*.18}for(let i=0;i<5;i++)box(.03,.003,.004,stdM(0xf1ece3,.5),0,at(chest,1.13+i*.04),f?.104:.12,chest)}
  if(sp.over==='kaftan'){shell(spine,'kaftan',[[.215,.56],[.2,.7],[.185,.85],[.172,1.0],[.19,1.18],[.205,1.3],[.19,1.37],[.12,1.42]],clothStd(L.pal,1),.74);const e=mesh(new THREE.TorusGeometry(.068,.009,6,24),stdM(0xd9a537,.35,{metalness:.6}),0,at(chest,1.43),.012,chest);e.rotation.x=Math.PI/2.1;
    for(let i=0;i<5;i++)mesh(sph(.008,6,5),gold,0,at(chest,1.36-i*.045),f?.128:.142,chest)}
  if(sp.over==='maxi'){shell(hips,'maxi',[[.25,.03],[.215,.3],[.19,.6],[.18,.82],[.17,.98],[.16,1.12],[.168,1.22],[.15,1.3]],clothStd('kente',1));const sash=mesh(new THREE.TorusGeometry(.2,.03,6,24,Math.PI*1.2),clothStd('kente',1),0,at(chest,1.22),0,chest);sash.rotation.set(Math.PI/2,0,.6);sash.scale.set(1,.72,1)}
  if(sp.jacket){const jm=sp.jdenim?denimStd(hexN(accC)):stdM(hexN(accC),.7,{side:THREE.DoubleSide});const pts=f?[[.172,.92],[.166,1.0],[.152,1.08],[.162,1.16],[.18,1.24],[.188,1.3],[.17,1.36],[.11,1.41]]:[[.18,.93],[.17,1.0],[.166,1.08],[.178,1.16],[.198,1.24],[.21,1.3],[.192,1.36],[.12,1.42]];
    shell(spine,'jk'+f,pts.map(([r,y])=>[r+.012,y]),jm,.76,[.5,Math.PI*2-1]);[-1,1].forEach(sd=>{const lp=box(.05,.2,.012,jm,sd*.07,at(chest,1.31),f?.125:.14,chest);lp.rotation.z=sd*.45;lp.rotation.y=sd*.3});
    if(sp.rib||sp.zipj)mesh(new THREE.TorusGeometry(f?.15:.168,.014,6,24),stdM(hexN(sp.rib?'#f1ece3':'#222222'),.8),0,at(spine,.93),0,spine).rotation.x=Math.PI/2}
  if(sp.zip)box(.006,.36,.006,stdM(0xd8d8d8,.3,{metalness:.7}),0,at(chest,1.18),f?.13:.148,chest);
  if(sp.belt){const bt=mesh(new THREE.TorusGeometry(f?.15:.158,.012,6,28),stdM(0x2a1c12,.5),0,at(hips,sp.crop?1.0:.97),0,hips);bt.rotation.x=Math.PI/2;bt.scale.y=.76;box(.04,.03,.01,gold,0,at(hips,sp.crop?1.0:.97),f?.115:.122,hips)}
  if(sp.hood){const hd=mesh(sph(.13,18,12),topM2,0,at(chest,1.44),-.1,chest);hd.scale.set(1.3,.6,.85);const fz=f?.122:.146;[-1,1].forEach(s=>{const st=mesh(cyl(.005,.005,.17,5),stdM(0xf2f0ea,.6),s*.035,at(chest,1.32),fz,chest);st.rotation.x=-.12})}
  if(sp.collar){const cl=mesh(new THREE.TorusGeometry(f?.06:.07,f?.013:.017,6,20),topM2,0,at(chest,1.445),.004,chest);cl.rotation.x=Math.PI/2.15;cl.scale.y=.92}
  if(sp.buttons||sp.placket)for(let i=0;i<(sp.buttons?5:2);i++)mesh(sph(.0065,6,5),stdM(0xf4f1ea,.4),0,at(chest,1.38-i*.07),f?.128:.145,chest);
  if(sp.pocket)box(.16,.07,.012,topM2,0,at(spine,1.0),f?.125:.14,spine);
  if(sp.cargo)[0,1].forEach(i=>{const s=i?1:-1;box(.03,.11,.1,bodyMats(L,f,sp)[2].userData.plain,s*.088,-.2,0,legs[i])});
  // ---- hands (one merged mesh each) and shoes ----
  [0,1].forEach(i=>{const s=i?1:-1,h=new THREE.Mesh(handGeo(f,s),skin);h.position.set(0,-.27,0);h.castShadow=false;elbows[i].add(h)});
  const S=L.shoes;[0,1].forEach(i=>{const kn=knees[i],F=new THREE.Group();F.position.set(0,-.405,.045);kn.add(F);
    if(S==='chunky'){F.scale.set(1.05,1.1,1.04);const up=new THREE.Mesh(VGEO2('snkU'),stdM(0xf6f4ee,.5));F.add(up);const so=new THREE.Mesh(VGEO2('snkS'),stdM(0xfbfaf6,.7));so.scale.set(1.04,1.7,1.02);so.position.y=-.006;F.add(so);const sw=mesh(sph(.02,8,6),stdM(0xe6e2d8,.5),(i?1:-1)*.05,.0,-.01,F);sw.scale.set(.2,.7,1.8)}
    else if(S==='socks'){const sock=mesh(cyl(.036,.034,.13,12),stdM(0xf4f2ec,.9),0,.05,-.035,F);void sock;const ft=mesh(sph(.045,14,10),stdM(0xf4f2ec,.9),0,0,.005,F);ft.scale.set(1.1,.55,2.3);box(.1,.02,.25,stdM(0x151515,.8),0,-.027,.005,F);box(.108,.03,.07,stdM(0x151515,.6),0,.004,.025,F)}
    else if(S==='sneakers'){const up=new THREE.Mesh(VGEO2('snkU'),stdM(hexN(pick2(L,['#f4f2ec','#f4f2ec','#1c1c1c',PAL[L.pal].a])),.55));F.add(up);const so=new THREE.Mesh(VGEO2('snkS'),stdM(0xf7f5ef,.7));F.add(so);const st=new THREE.Mesh(VGEO2('snkT'),stdM(hexN(PAL[L.pal].b==='#ffffff'?PAL[L.pal].a:PAL[L.pal].b),.5));st.position.x=(i?1:-1)*.001;F.add(st)}
    else if(S==='shoes'){F.add(new THREE.Mesh(VGEO2('lthU'),stdM(0x3a2214,.3)));F.add(new THREE.Mesh(VGEO2('lthS'),stdM(0x1a110a,.6)))}
    else{const ft=mesh(sph(.045,14,10),skin,0,0,.005,F);ft.scale.set(1.1,.55,2.3);box(.1,.02,.25,stdM(S==='sandals'?0x6b4426:0x151515,.8),0,-.027,.005,F);box(.105,.025,.05,S==='slides'?cloth:stdM(0x6b4426,.8),0,0,.03,F)}});
  if(L.extra==='watch'){const band=mesh(new THREE.TorusGeometry(.037,.008,6,16),stdM(0x1a1a1a,.4),0,-.235,0,elbows[0]);band.rotation.x=Math.PI/2;const fc=mesh(cyl(.02,.02,.012,14),stdM(0xd8dde2,.2,{metalness:.9}),-.0,-.235,.04,elbows[0]);fc.rotation.x=Math.PI/2}
  if(L.extra==='beads')[0,1].forEach(i=>[-.225,-.24].forEach((y,j)=>{const bd=mesh(new THREE.TorusGeometry(.036,.007,5,14),stdM([0xc8322b,0xe8b24a,0x1d7a45,0x1a1a1a][(i*2+j)%4],.5),0,y,0,elbows[i]);bd.rotation.x=Math.PI/2}));
  if(L.bag==='sling'){const sg=new THREE.Group();sg.position.set(0,at(chest,1.2),0);sg.rotation.z=.62;chest.add(sg);const strap=mesh(new THREE.TorusGeometry(f?.24:.262,.009,5,30),stdM(0x1a1a1a,.7),0,0,0,sg);strap.rotation.x=Math.PI/2;strap.scale.set(1,.52,1);
    const sb=mesh(sph(.075,14,10),stdM(hexN(pick2(L,['#1a1a1a','#1a1a1a','#3a4a2a','#8a6d4a',PAL[L.pal].b])),.6),f?-.09:-.1,at(chest,1.08),f?.13:.15,chest);sb.scale.set(1.25,.62,.45);box(.1,.004,.004,stdM(0xd8d8d8,.3,{metalness:.8}),f?-.09:-.1,at(chest,1.1),f?.165:.185,chest)}
  if(L.bag==='backpack'){const bp=mesh(sph(.15,16,12),stdM(0x2b3a4a,.85),0,at(chest,1.12),-.175-(sp.hood?.02:0),chest);bp.scale.set(1,1.2,.42);[-1,1].forEach(s=>{const st=mesh(tcap(.018,.018,.34,6),stdM(0x1d1916,.8),s*.12,at(chest,1.34),-.05,chest);st.rotation.x=.25})}
  if(L.bag==='tote'){const tb=box(.05,.3,.26,stdM(0xd9c39a,.9),-.04,-.22,0,elbows[0])}
  // neck & head
  if(L.extra==='chain'){const t=mesh(new THREE.TorusGeometry(.088,.008,6,24),gold,0,at(chest,1.385),.02,chest);t.rotation.x=Math.PI/2.4}
  const head=new THREE.Group();headB.add(head);head.scale.setScalar(1.06);head.position.set(0,.062,.004);
  mesh(headGeo(f),skin,0,0,0,head);
  // eyes with iris, lids and lashes
  const lids=[],brows=[];
  [-1,1].forEach(s=>{const ex=s*.043,ey=.014,ez=.093;
    const sc=mesh(sph(.0205,16,12),stdM(0xe9dfd0,.25),ex,ey,ez,head);sc.scale.set(1.12,.86,1);
    const ir=mesh(new THREE.CircleGeometry(.0122,20),irisM(),ex,ey-.0005,ez+.0193,head);
    const lp=new THREE.Group();lp.position.set(ex,ey,ez);head.add(lp);
    const lid=mesh(new THREE.SphereGeometry(.0222,16,8,0,Math.PI*2,0,Math.PI*.5),skin,0,0,0,lp);lp.rotation.x=-.78;lids.push(lp);
    const lash=mesh(new THREE.TorusGeometry(.0212,f?.0026:.0016,4,14,Math.PI),stdM(0x0a0806,.6),0,.0005,.004,lp);lash.rotation.x=Math.PI/2+.1;lash.rotation.y=0;
    const bp=new THREE.Group();bp.position.set(ex+s*.002,ey+.01,ez+.014);head.add(bp);bp.userData.s=s;brows.push(bp);const br=mesh(new THREE.TorusGeometry(.03,f?.0042:.0058,5,12,Math.PI*.42),stdM(0x120d0a,.9),0,0,0,bp);br.rotation.z=Math.PI/2-Math.PI*.21+s*.12;br.scale.set(1,.5,1)});
  // nose, lips, ears
  const brg=mesh(tcap(.007,.011,.046,10),skin,0,.03,.106,head);brg.rotation.x=.26;
  const tip=mesh(sph(.0155,14,10),skin,0,-.023,.117,head);tip.scale.set(1.5,.88,.78);
  [-1,1].forEach(s=>{const al=mesh(sph(.0118,10,8),skin,s*.019,-.027,.107,head);al.scale.set(1,.85,.9);mesh(sph(.0045,8,6),stdM(0x1a0e08,.9),s*.0095,-.0325,.1195,head)});
  const ul=mesh(sph(.021,16,10),stdM(new THREE.Color(lipC).multiplyScalar(.82).getHex(),.45),0,-.0605,.113,head);ul.scale.set(1.58,.38,.5);
  const ll=mesh(sph(.021,16,10),stdM(lipC,.36),0,-.072,.1115,head);ll.scale.set(1.48,.52,.54);
  const mline=box(.048,.002,.004,stdM(new THREE.Color(lipC).multiplyScalar(.45).getHex(),.9),0,-.0665,.1225,head);
  const mo=mesh(sph(.02,14,10),stdM(0x3a0f0c,.8),0,-.067,.112,head);mo.scale.set(1.15,.05,.4);const teeth=box(.034,.008,.004,stdM(0xf4f1ea,.3),0,-.06,.118,head);teeth.visible=false;
  const arcM=stdM(0x2a1410,.9),smA=mesh(new THREE.TorusGeometry(.028,.0024,4,14,Math.PI*.55),arcM,0,-.044,.119,head);smA.rotation.z=Math.PI+Math.PI*.225;smA.visible=false;
  const frA=mesh(new THREE.TorusGeometry(.028,.0024,4,14,Math.PI*.5),arcM,0,-.09,.117,head);frA.rotation.z=Math.PI*.25;frA.visible=false;
  const lipM=ul.material,corners=[-1,1].map(s=>{const c=mesh(sph(.004,8,6),lipM,s*.03,-.066,.112,head);c.userData.s=s;return c});
  const cheeks=[-1,1].map(s=>{const c=mesh(sph(.022,10,8),skin,s*.052,-.035,.093,head);c.scale.set(1,.8,.6);c.visible=false;return c});
  mo.position.z=.113;mo.scale.set(1.25,.05,.55);teeth.position.set(0,-.0625,.1185);
  g.userData.face={brows,ul,ll,mline,mo,teeth,smA,frA,corners,cheeks};
  [-1,1].forEach(s=>{const e=mesh(sph(.03,12,10),skin,s*.119,.002,-.004,head);e.scale.set(.42,1,.72);const ei=mesh(sph(.017,10,8),skinM(darkSkin),s*.126,0,0,head);ei.scale.set(.3,.8,.6);
    if(L.extra==='earrings'){mesh(sph(.012,8,6),gold,s*.124,-.035,.005,head);mesh(new THREE.TorusGeometry(.016,.003,6,14),gold,s*.124,-.055,.005,head)}});
  hairBlock(L,f,head,hair,cloth,gold);
  const rg=mesh(new THREE.RingGeometry(.36,.44,32),basic(0xe8b24a),0,.03,0,g);rg.rotation.x=-Math.PI/2;rg.visible=ring;g.userData.ring=ring?rg:null;
  let tag=null;if(label){tag=sprite(label,labelColor,.7);tag.position.y=2.05;g.add(tag)}g.userData.tag=tag;
  if(SHADOWS)g.traverse(o=>{if(o.isMesh){if(!o.geometry.boundingSphere)o.geometry.computeBoundingSphere();const r=o.geometry.boundingSphere.radius*Math.max(o.scale.x,o.scale.y,o.scale.z);if(r<.07||o.parent===head&&o!==head.children[0]){o.castShadow=false;o.receiveShadow=false}}});
  return {g,legs,knees,arms,elbows,tag,head,lids,torso};
}

const disposeTree=o=>o.traverse(n=>{if(n.geometry)n.geometry.dispose()});

/* hair, beards, caps, glasses and headphones, built on a head group (also used for the realistic characters) */
const hatOn=L=>['cap','durag','bucket'].includes(L.extra);
function hairBlock(L,f,head,hair,cloth,gold){
  let H=L.hair==='halfup'?'knotless':L.hair;const capG=new THREE.SphereGeometry(.134,30,18,0,Math.PI*2,0,Math.PI*.54);
  try{if(longHair(H,L,f,head,hair,gold)||coilHair(H,L,f,head,hair))H='_'}catch(e){console.error(e)}
  const capOn=['short','braids','bun','locs','twists','wig','fade','waves','cornrows'].includes(H)&&!(H==='afro');
  if(capOn&&!(hatOn(L)&&['short','fade'].includes(H))){if(H==='fade'||H==='short'||H==='waves')scalpMesh(head,f,scalpM(H==='waves'?'waves':shortKind(L),H==='fade'),{t:H==='short'?.009:.006,fade:H==='fade'});else scalpMesh(head,f,H==='braids'?braidCapM():hair,{t:.01})}
  if(H==='afro'&&!hatOn(L))mesh(afroGeo('afro'+(f?'f':'m'),f?.205:.19,0,f?.075:.07,f?-.04:-.035,f?.085:.08),hair,0,f?.075:.07,f?-.04:-.035,head);
  if(H==='bun')mesh(bumpySphere(.072,'bun'),hair,0,.135,-.06,head);
  if(H==='braids')mesh(braidsGeo(),hair,0,0,0,head);
  if(H==='cornrows'){cornrowMesh(head,f?{rows:11,sp:.022,fan:.5,r:.0088}:{rows:11,sp:.0235},'crw'+f,!!L.grey);if(f)drapeHair('cornrowsf',L,f,head,!!L.grey)}
  if(H==='puffs'&&!hatOn(L))[-1,1].forEach(s=>mesh(bumpySphere(.085,'puff'),hair,s*.1,.1,-.03,head));
  if(H==='puffs')scalpMesh(head,f,hair,{t:.01});
  if(H==='locs'){for(let i=0;i<16;i++){const a=Math.PI*(.08+i*.054);mesh(tcap(.021,.017,f?.36:.24,7),hair,Math.cos(a)*.125,.0,-Math.sin(a)*.11,head)}}
  if(H==='twists'){for(let i=0;i<22;i++){const a=i/22*Math.PI*2,r=i%2?.09:.06;const t=mesh(tcap(.02,.014,.085,6),hair,Math.cos(a)*r,.13,Math.sin(a)*r-.015,head);t.rotation.z=-Math.cos(a)*.6;t.rotation.x=Math.sin(a)*.6;t.position.y=.2}}
  if(H==='wig'){mesh(new THREE.CylinderGeometry(.143,.17,.42,24,1,true,Math.PI*.56,Math.PI*.88),hair,0,-.14,-.01,head);const fr=mesh(new THREE.SphereGeometry(.142,24,12,0,Math.PI*2,0,Math.PI*.3),hair,0,.03,.012,head);fr.rotation.x=.35}
  if(H==='duku'){const d=mesh(new THREE.SphereGeometry(.142,26,16,0,Math.PI*2,0,Math.PI*.56),cloth,0,.03,-.01,head);d.scale.set(1.06,1.35,1.1);d.rotation.x=-.32;const top=mesh(sph(.1,16,12),cloth,0,.17,-.05,head);top.scale.set(1.3,.75,1.15);const k=mesh(sph(.05,14,10),cloth,.06,.22,.03,head);k.scale.set(1.4,.8,1)}
  if(['dyed','frohawk','burst','lowcut','bantu','ponytail'].includes(H)&&!(hatOn(L)&&H!=='ponytail')){if(H==='bantu'||H==='ponytail')scalpMesh(head,f,hair,{t:.01});else scalpMesh(head,f,scalpM(shortKind(L),H!=='lowcut'),{t:.007,fade:H!=='lowcut'})}
  if(H==='frohawk'&&!hatOn(L)){const m=mesh(bumpySphere(.07,'froh'),hair,0,.14,-.02,head);m.scale.set(.75,.9,1.9)}
  if(H==='burst'&&!hatOn(L))for(let i=0;i<26;i++){const a=i*2.4,r=.02+(i%5)*.015;mesh(sph(.024,7,6),hair,Math.cos(a)*r,.15+Math.random()*.02,Math.sin(a)*r-.01,head)}
  if(H==='bantu')[[0,.16,-.02],[-.075,.13,.04],[.075,.13,.04],[-.09,.11,-.07],[.09,.11,-.07],[0,.1,-.12]].forEach(([x,y,z])=>{const k=mesh(bumpySphere(.042,'bantu'),hair,x,y,z,head);k.scale.y=.85});
  if(H==='ponytail'){const pt=mesh(tcap(.045,.012,.34,10),hair,0,.12,-.12,head);pt.rotation.x=.55;mesh(new THREE.TorusGeometry(.03,.008,6,12),stdM(0xc8322b,.6),0,.12,-.13,head).rotation.x=1}
  if(H==='bob'||H==='blonde'){const hm=H==='blonde'?stdM(0xd9b06a,.7,{side:THREE.DoubleSide}):hair;const len=H==='bob'?.2:.4;mesh(new THREE.CylinderGeometry(.145,H==='bob'?.16:.17,len,24,1,true,Math.PI*.56,Math.PI*.88),hm,0,.02-len/2+.06,-.01,head);const fr=mesh(new THREE.SphereGeometry(.144,24,12,0,Math.PI*2,0,Math.PI*.32),hm,0,.03,.012,head);fr.rotation.x=.35;const top=mesh(new THREE.SphereGeometry(.142,24,12,0,Math.PI*2,0,Math.PI*.5),hm,0,.02,-.012,head);top.rotation.x=-.3}
  try{hairMore(H,L,f,head,hair,gold)}catch(e){console.error(e)}
  if(L.extra==='cap'){mesh(new THREE.SphereGeometry(.142,24,12,0,Math.PI*2,0,Math.PI*.5),cloth,0,.035,0,head);const b=mesh(cyl(.11,.11,.012,20),cloth,0,.05,.12,head);b.scale.set(1,1,.9)}
  if(L.extra==='durag'){/* satin durag: snug over the head, tied at the back with two long tails */const dc=hexN(pick2(L,['#141414','#141414','#6e1a2a','#1f2f63','#3a2a5a','#0f3a2a'])),dm=new THREE.MeshStandardMaterial({color:dc,roughness:.42,metalness:.1,side:THREE.DoubleSide});
    const d=mesh(new THREE.SphereGeometry(.137,30,18,0,Math.PI*2,0,Math.PI*.56),dm,0,.02,-.012,head);d.scale.set(1,1.08,1.05);d.rotation.x=-.5;mesh(sph(.03,10,8),dm,0,-.02,-.14,head).scale.set(1.2,.8,.7);
    [-1,1].forEach(sd=>{const tl=mesh(new THREE.PlaneGeometry(.055,.32),dm,sd*.025,-.16,-.135,head);tl.rotation.set(.25,0,sd*.08)})}
  if(L.extra==='bucket'){const bc=hexN(pick2(L,['#1c1c1c','#e8e3d8','#5b6b3a','#d8c7a6',PAL[L.pal].a])),bm=stdM(bc,.9,{side:THREE.DoubleSide});
    const cr=mesh(new THREE.CylinderGeometry(.118,.148,.11,24,1,false),bm,0,.12,-.008,head);mesh(new THREE.CircleGeometry(.118,24),bm,0,.176,-.008,head).rotation.x=-Math.PI/2;
    const br=mesh(new THREE.CylinderGeometry(.15,.215,.045,28,1,true),bm,0,.055,-.008,head);void cr;void br}
  if(L.extra==='headphones'){const hb=mesh(new THREE.TorusGeometry(.15,.013,8,22,Math.PI),stdM(0x1a1a1a,.4),0,.02,0,head);[-1,1].forEach(s=>{const cp=mesh(cyl(.045,.045,.04,16),stdM(0x1a1a1a,.4),s*.138,0,0,head);cp.rotation.z=Math.PI/2})}
  if(L.extra==='specs'){const fr=stdM(0x111111,.3);[-1,1].forEach(s=>mesh(new THREE.TorusGeometry(.025,.0028,6,18),fr,s*.044,.014,.122,head));box(.03,.004,.004,fr,0,.02,.124,head);[-1,1].forEach(s=>box(.004,.004,.16,fr,s*.1,.02,.05,head))}
}
