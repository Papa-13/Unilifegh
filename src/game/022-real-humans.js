/* ================= realistic characters (made in Blender with MPFB, exported as .glb) =================
   public/models/student_male.glb and student_female.glb are loaded at start (website only).
   Once they are in, makeHuman() builds people from them instead of the simple shapes:
   - the game's poses still drive them: our pose values are turned into rotations of the model's bones
     (thigh, calf, upper arm, forearm, spine, head), with the model's A-pose straightened first
   - skin tone is tinted to the chosen one, and the game's own hairstyles, beards, caps and glasses
     are fitted onto the model's head (the model's own hair is hidden)
   On "low" graphics, in the claude.ai version, or if the files fail to load, the simple shapes are used. */
const REAL={ok:false,loading:false,src:{},info:{},mats:{}};
const realOn=()=>REAL.ok&&(typeof GFX==='undefined'||GFX!=='low');
const REAL_HAIR=/short\d|ponytail|hair|bob\d|braid|afro|long\d|curly/i;
function realLoad(){if(REAL.loading||typeof THREE.GLTFLoader!=='function'||!THREE.SkeletonUtils||typeof THREE.SkeletonUtils.clone!=='function'||location.protocol==='file:')return;REAL.loading=true;
  const ld=new THREE.GLTFLoader();let n=0;
  [['m','student_male'],['f','student_female']].forEach(([g,file])=>ld.load(`/models/${file}.glb`,gl=>{try{realPrep(g,gl.scene)}catch(e){console.error(e);return}
    if(++n===2){REAL.ok=true;try{realRebuildAll()}catch(e){console.error(e)}}},undefined,e=>console.warn('character model',file,e)))}
/* measure the model once: height, head, bones and the corrections that turn its A-pose into our standing pose */
function realPrep(g,src){src.updateMatrixWorld(true);
  /* face +z like our own people */
  {const bl=src.getObjectByName('ball_l'),fl=src.getObjectByName('foot_l');if(bl&&fl&&bl.getWorldPosition(new THREE.Vector3()).z<fl.getWorldPosition(new THREE.Vector3()).z){src.rotation.y+=Math.PI;src.updateMatrixWorld(true)}}
  /* lift dark textures a little under the game's lighting */
  src.traverse(o=>{if(o.isMesh&&o.material&&o.material.map){const m=o.material;m.emissiveMap=m.map;m.emissive=new THREE.Color(.16,.16,.16);m.needsUpdate=true}});const I={},v=new THREE.Vector3(),q=new THREE.Quaternion();
  let body=null;src.traverse(o=>{if(o.isSkinnedMesh&&/^(base|Human)$/i.test(o.name))body=o;if(o.isMesh){o.frustumCulled=false;o.castShadow=SHADOWS}});
  if(!body)src.traverse(o=>{if(!body&&o.isSkinnedMesh)body=o});
  const B=n=>src.getObjectByName(n),wp=n=>B(n).getWorldPosition(new THREE.Vector3()),wq=o=>o.getWorldQuaternion(new THREE.Quaternion());
  /* measure the skinned rest pose (vertex positions after the skeleton is applied), so any export scale works */
  const hy=wp('head').y,pos=body.geometry.attributes.position;let minX=1e9,maxX=-1e9,maxY=-1e9,minZ=1e9,maxZ=-1e9,lo=1e9,hi=-1e9;body.skeleton.update();
  for(let i=0;i<pos.count;i+=2){v.fromBufferAttribute(pos,i);body.boneTransform(i,v);v.applyMatrix4(body.matrixWorld);lo=Math.min(lo,v.y);hi=Math.max(hi,v.y);
    if(v.y>hy+.02*(hi-lo>0?1:1)){minX=Math.min(minX,v.x);maxX=Math.max(maxX,v.x);maxY=Math.max(maxY,v.y);minZ=Math.min(minZ,v.z);maxZ=Math.max(maxZ,v.z)}}
  /* clothes can hide parts of the body mesh (e.g. leggings remove the legs), so the feet come from the shoes/clothes */
  src.traverse(o=>{if(!o.isSkinnedMesh||o===body||REAL_HAIR.test(o.name))return;const p2=o.geometry.attributes.position;for(let i=0;i<p2.count;i+=3){v.fromBufferAttribute(p2,i);o.boneTransform(i,v);v.applyMatrix4(o.matrixWorld);lo=Math.min(lo,v.y)}});
  I.height=hi-lo;I.minY=lo;
  I.head={halfW:(maxX-minX)/2,top:maxY,cy:(maxY+hy)/2+.005,cz:(minZ+maxZ)/2+.004};
  /* left/right: index 0 is the side with negative x, like our own rig */
  const side=(a,b)=>wp(a).x<wp(b).x?[a,b]:[b,a];
  const roles={legs:side('thigh_l','thigh_r'),knees:side('calf_l','calf_r'),arms:side('upperarm_l','upperarm_r'),elbows:side('lowerarm_l','lowerarm_r'),head:['head'],torso:['spine_03']};
  const corr={};
  /* straighten the arms (A-pose → hanging) and bring the legs together */
  const fix=(a,b,out)=>{const d=wp(b).sub(wp(a)).normalize(),t=new THREE.Vector3(Math.sign(d.x)*out,-1,0).normalize();corr[a]=new THREE.Quaternion().setFromUnitVectors(d,t)};
  roles.arms.forEach((a,i)=>fix(a,roles.elbows[i],.1));roles.legs.forEach((a,i)=>fix(a,roles.knees[i],.03));
  /* then straighten the forearms and shins so they line up with the (corrected) upper arm/thigh, like our standing pose.
     corr[] holds the total correction for that bone (its own on top of its parent's) */
  const child=n=>B(n).children.find(x=>x.isBone);
  [[roles.elbows,roles.arms,.1],[roles.knees,roles.legs,.03]].forEach(([lows,ups,out])=>lows.forEach((nm,i)=>{const c=child(nm);if(!c)return;const Cu=corr[ups[i]];
    const d=c.getWorldPosition(new THREE.Vector3()).sub(wp(nm)).normalize().applyQuaternion(Cu),t=new THREE.Vector3(Math.sign(d.x||1)*out,-1,0).normalize();
    corr[nm]=new THREE.Quaternion().setFromUnitVectors(d,t).multiply(Cu)}));
  /* a correction applies to the bone and everything below it (straightening the upper arm also straightens the forearm) */
  const Kof=o=>{for(let x=o;x&&x!==src;x=x.parent)if(corr[x.name])return corr[x.name];return new THREE.Quaternion()};
  I.bones={};Object.entries(roles).forEach(([role,names])=>names.forEach((nm,i)=>{const b=B(nm),P=wq(b.parent),q0=b.quaternion.clone();
    const Cp=Kof(b.parent),C=Kof(b);
    I.bones[nm]={role,i,A:Cp.clone().multiply(P).invert(),Bq:C.clone().multiply(P).multiply(q0),W:wq(b)}}));
  I.roles=roles;I.corr=corr;I.K={};roles.elbows.forEach(nm=>I.K[nm]=Kof(B(nm)));
  I.fwd=Math.sign(wp('ball_l').z-wp('foot_l').z)||1;
  /* average skin colour of the texture, to tint other skin tones from it */
  const m=body.material,img=m.map&&m.map.image;I.skinAvg=new THREE.Color(.36,.23,.16);
  try{if(img){const c=document.createElement('canvas');c.width=c.height=32;const x=c.getContext('2d');x.drawImage(img,0,0,32,32);const d=x.getImageData(0,0,32,32).data;let r=0,gg=0,bl=0,n=0;
    for(let i=0;i<d.length;i+=4){const l=d[i]+d[i+1]+d[i+2];if(d[i+3]>200&&l>40&&l<600){r+=d[i];gg+=d[i+1];bl+=d[i+2];n++}}if(n>20)I.skinAvg.setRGB(r/n/255,gg/n/255,bl/n/255)}}catch(e){}
  I.bodyName=body.name;REAL.src[g]=src;REAL.info[g]=I}
function realSkinMat(g,base,hex){const k=g+hex;if(REAL.mats[k])return REAL.mats[k];const m=base.clone(),I=REAL.info[g],t=new THREE.Color(hex);
  const f=c=>Math.max(.35,Math.min(2.2,c));const mid=new THREE.Color('#5a321e');m.color.setRGB(f(t.r/mid.r),f(t.g/mid.g),f(t.b/mid.b));m.emissive=m.emissive.clone().multiply(m.color);return REAL.mats[k]=m}
function makeRealHuman(L,{label=null,labelColor='#f6f0e8',ring=false}={}){const f=L.gender==='f',gk=f?'f':'m',I=REAL.info[gk];
  const g=new THREE.Group();g.rotation.order='YXZ';const model=THREE.SkeletonUtils.clone(REAL.src[gk]);const k=(f?1.68:1.77)/I.height;model.scale.setScalar(k);model.position.y=-I.minY*k;g.add(model);
  const sh=mesh(new THREE.PlaneGeometry(.95,.95),shadowM(),0,.012,0,g);sh.rotation.x=-Math.PI/2;
  model.traverse(o=>{if(!o.isMesh)return;o.frustumCulled=false;if(o.name===I.bodyName)o.material=realSkinMat(gk,o.material,L.skin);if(REAL_HAIR.test(o.name)||REAL_HAIR.test(o.material&&o.material.name||''))o.visible=false});
  model.updateMatrixWorld(true);
  const bone=n=>model.getObjectByName(n),R=I.roles;
  /* our own hairstyles on the model's head */
  const hb=bone('head'),hg=new THREE.Group(),hs=I.head.halfW/.128;hg.position.set(0,I.head.cy,I.head.cz);hg.scale.setScalar(hs);model.add(hg);
  try{hairBlock(Object.assign({},L),f,hg,hairStd(!!L.grey),clothStd(L.pal),stdM(0xd9a537,.3,{metalness:.8}))}catch(e){console.error(e)}
  model.updateMatrixWorld(true);hb.attach(hg);
  /* stand-ins the pose code writes to; realApply turns them into bone rotations */
  const o3=()=>new THREE.Object3D(),legs=[o3(),o3()],knees=[o3(),o3()],arms=[o3(),o3()],head=o3(),torso=o3();
  /* the forearms carry a socket for held things (phone, bottle, mic…), lined up with the model's axes */
  const elbows=R.elbows.map(nm=>{const b=bone(nm),s=o3();b.add(s);const W=I.bones[nm].W.clone(),Cp=I.K[nm]||new THREE.Quaternion();s.quaternion.copy(Cp.clone().multiply(W).invert());s.scale.setScalar(1/k);s.userData.q=s.quaternion.clone();return s});
  const rg=mesh(new THREE.RingGeometry(.36,.44,32),basic(0xe8b24a),0,.03,0,g);rg.rotation.x=-Math.PI/2;rg.visible=ring;g.userData.ring=ring?rg:null;
  let tag=null;if(label){tag=sprite(label,labelColor,.7);tag.position.y=2.05;g.add(tag)}g.userData.tag=tag;
  g.userData.real={bones:Object.fromEntries(Object.keys(I.bones).map(nm=>[nm,bone(nm)])),I,elbows};
  return {g,legs,knees,arms,elbows,tag,head,lids:[],torso}}
/* every frame, after the pose is worked out: pose values → bone rotations */
const _rq=new THREE.Quaternion(),_re=new THREE.Euler();
function realApply(c){const RD=c.mesh.userData.real,pv=c._pv;if(!RD||!pv)return;const I=RD.I,R=I.roles;
  const set=(nm,x,y,z)=>{const b=RD.bones[nm],d=I.bones[nm];if(!b)return;_re.set(x,y,z,'XYZ');_rq.setFromEuler(_re);b.quaternion.copy(d.A).multiply(_rq).multiply(d.Bq)};
  for(let i=0;i<2;i++){set(R.legs[i],pv.L[i],0,0);set(R.knees[i],pv.K[i],0,0);set(R.arms[i],pv.A[i],0,pv.Az[i]);set(R.elbows[i],pv.E[i],0,0)}
  set('head',c.head?c.head.rotation.x:0,c.head?c.head.rotation.y:0,0);set('spine_03',0,c.torso?c.torso.rotation.y:0,0);
  RD.elbows.forEach(s=>s.quaternion.copy(s.userData.q))}
/* when the models arrive after people were already made, rebuild them */
function realRebuildHuman(o,look,opts){if(!o||!o.mesh||!look)return;const par=o.mesh.parent,pos=o.mesh.position.clone(),rot=o.mesh.rotation.clone(),vis=o.mesh.visible;if(par)par.remove(o.mesh);try{disposeTree(o.mesh)}catch(e){}
  const h=makeHuman(look,opts||{});Object.assign(o,{mesh:h.g,legs:h.legs,knees:h.knees,arms:h.arms,elbows:h.elbows,head:h.head,lids:h.lids,torso:h.torso,_pv:null,_props:null});h.g.position.copy(pos);h.g.rotation.copy(rot);h.g.visible=vis;(par||scene).add(h.g)}
function realRebuildAll(){if(typeof DECOR!=='undefined')DECOR.forEach(v=>{if(v.look)realRebuildHuman(v,v.look,{label:v.label,labelColor:v.labelColor})});
  if(typeof S==='undefined'||!S||!S.p)return;try{rebuildPlayer()}catch(e){}
  S.npcs.forEach(n=>realRebuildHuman(n,n.look,{label:n.name}));if(S.lecs)S.lecs.forEach(l=>realRebuildHuman(l,l.look,{label:l.name,labelColor:'#cfe3ff'}));
  try{if(typeof MP!=='undefined')for(const rp of MP.peers.values())if(rp.lookV)mpMesh(rp,rp.lookV)}catch(e){}}
