/* ================= minimap ================= */
const mini=$('mini'),mg=mini.getContext('2d');
function drawMini(){if(!S||IS)return;const k=mini.width/MW;mg.clearRect(0,0,mini.width,mini.height);
  mg.fillStyle='#3f5a2e';mg.fillRect(0,0,mini.width,mini.height);Object.values(ZONES).forEach(z=>{mg.fillStyle=z.mini;z.rects.forEach(([x,y,w,h])=>mg.fillRect(x*k,y*k,w*k,h*k))});mg.fillStyle='#6b665e';ROADS.forEach(([x,y,w,h])=>mg.fillRect(x*k,y*k,w*k,h*k));
  B.forEach(b=>{mg.fillStyle=b.open?(b.id==='lake'?'#3a8fb0':'#5f8a46'):'#'+b.roof.toString(16).padStart(6,'0');mg.fillRect(b.x*k,b.y*k,b.w*k,b.h*k);if(b.id===P().home){mg.strokeStyle='#e8b24a';mg.lineWidth=2;mg.strokeRect(b.x*k,b.y*k,b.w*k,b.h*k)}});
  mg.fillStyle='rgba(255,255,255,.55)';S.npcs.forEach(n=>{if(!n.hidden)mg.fillRect(n.x*k-1,n.y*k-1,2.5,2.5)});
  if(P().partner&&!P().partner.hidden){mg.fillStyle='#e86fa0';mg.fillRect(P().partner.x*k-2,P().partner.y*k-2,4,4)}
  mg.fillStyle='#ffffff';SH_STOPS.forEach(st=>mg.fillRect(st.sx*k-2,st.sy*k-2,4,4));mg.fillStyle='#8e2a3a';BUSES.forEach(b=>{mg.fillRect(b.x*k-4,b.y*k-3,8,6)});
  if(S.ride&&['pickup','wait'].includes(S.ride.phase)){mg.fillStyle='#ffffff';mg.fillRect(S.ride.pos.x*k-3,S.ride.pos.y*k-3,6,6)}if(S.del&&S.del.rider){mg.fillStyle='#25a35a';mg.beginPath();mg.arc(S.del.rider.x*k,S.del.rider.y*k,3.5,0,7);mg.fill()}
  mg.fillStyle='#e8b24a';mg.beginPath();mg.arc(P().x*k,P().y*k,4,0,7);mg.fill();
  if(P().target){mg.strokeStyle='#fff';mg.beginPath();mg.arc(P().target.x*k,P().target.y*k,4,0,7);mg.stroke()}}
mini.addEventListener('pointerdown',e=>{e.stopPropagation();if(!S||S.paused)return;campusMap()});

const LAMPS={pos:[],pool:[],head:null};
(function streetLamps(){const pts=[],inRoad=(x,y,m)=>ROADS.some(([rx,ry,rw,rh])=>x>rx-m&&x<rx+rw+m&&y>ry-m&&y<ry+rh+m);
  const tryAdd=(x,y,face)=>{if(x<30||y<30||x>MW-30||y>MH-30)return;if(inRoad(x,y,4)||solidAt(x,y,10))return;if(B.some(b=>x>b.x-14&&x<b.x+b.w+14&&y>b.y-14&&y<b.y+b.h+14))return;pts.push({x,y,face})};
  ROADS.forEach(([rx,ry,rw,rh])=>{if(rw>rh){for(let x=rx+80;x<rx+rw;x+=240){tryAdd(x,ry-9,1);tryAdd(x+120,ry+rh+9,-1)}}else{for(let y=ry+80;y<ry+rh;y+=240){tryAdd(rx-9,y,2);tryAdd(rx+rw+9,y+120,-2)}}});
  for(let y=150;y<MH-100;y+=280)for(let x=150;x<MW-100;x+=280){const jx=x+((y/280)%2)*140;if(pts.some(p=>Math.abs(p.x-jx)<170&&Math.abs(p.y-y)<170))continue;tryAdd(jx,y,[1,-1,2,-2][(x+y)%4])}
  const n=pts.length;if(!n)return;const pm=lam(0x3a3f44),hm=new THREE.MeshStandardMaterial({color:0xfff3d6,emissive:0,roughness:.3});LAMPS.head=hm;
  const pole=new THREE.InstancedMesh(cyl(.045,.07,3.4,8),pm,n),arm=new THREE.InstancedMesh(new THREE.BoxGeometry(.7,.05,.05),pm,n),head=new THREE.InstancedMesh(new THREE.BoxGeometry(.34,.08,.18),hm,n);
  const M=new THREE.Matrix4(),Q=new THREE.Quaternion(),E=new THREE.Euler(),V=new THREE.Vector3(),SC=new THREE.Vector3(1,1,1),gp=[];
  pts.forEach((p,i)=>{const X=wx(p.x),Z=wz(p.y),ang=p.face===1?-Math.PI/2:p.face===-1?Math.PI/2:p.face===2?0:Math.PI;const ox=Math.cos(ang)*.33,oz=-Math.sin(ang)*.33;
    E.set(0,ang,0);Q.setFromEuler(E);M.compose(V.set(X,1.7,Z),Q,SC);pole.setMatrixAt(i,M);M.compose(V.set(X+ox,3.38,Z+oz),Q,SC);arm.setMatrixAt(i,M);M.compose(V.set(X+ox*2,3.34,Z+oz*2),Q,SC);head.setMatrixAt(i,M);
    gp.push(X+ox*2,3.22,Z+oz*2);LAMPS.pos.push({x:X+ox*2,y:3.2,z:Z+oz*2});solidC(p.x,p.y,3)});
  if(SHADOWS){pole.castShadow=true}scene.add(pole,arm,head);
  const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),gr=g.createRadialGradient(32,32,1,32,32,32);gr.addColorStop(0,'rgba(255,230,180,1)');gr.addColorStop(.2,'rgba(255,200,120,.55)');gr.addColorStop(1,'rgba(255,180,90,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);
  const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(gp,3));
  SKY.lampGlow=new THREE.Points(gg,new THREE.PointsMaterial({map:new THREE.CanvasTexture(c),size:2.4,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:true}));SKY.lampGlow.visible=false;scene.add(SKY.lampGlow);
  // light pools on the ground under lamps (cheap fake bounce)
  const pc=document.createElement('canvas');pc.width=pc.height=64;{const g2=pc.getContext('2d'),r=g2.createRadialGradient(32,32,1,32,32,32);r.addColorStop(0,'rgba(255,200,130,.55)');r.addColorStop(1,'rgba(255,200,130,0)');g2.fillStyle=r;g2.fillRect(0,0,64,64)}
  const pool=new THREE.InstancedMesh(new THREE.PlaneGeometry(5,5),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(pc),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}),n);
  pts.forEach((p,i)=>{E.set(-Math.PI/2,0,0);Q.setFromEuler(E);M.compose(V.set(LAMPS.pos[i].x,.03,LAMPS.pos[i].z),Q,SC);pool.setMatrixAt(i,M)});pool.visible=false;scene.add(pool);LAMPS.groundPool=pool;
  const NL=GFX==='high'?6:GFX==='medium'?3:0;for(let i=0;i<NL;i++){const l=new THREE.PointLight(0xffc98a,0,13,1.7);scene.add(l);LAMPS.pool.push(l)}})();
const RIPPLE=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d'),im=g.createImageData(256,256);
  for(let y=0;y<256;y++)for(let x=0;x<256;x++){const u=x/256*Math.PI*2,v=y/256*Math.PI*2;let w=Math.sin(u*3+Math.sin(v*2)*1.5)+Math.sin(v*4+Math.sin(u*3)*1.2)+Math.sin((u+v)*5)*.5;w=Math.pow(1-Math.abs(Math.sin(w*1.3)),6);const k=210+w*45,i=(y*256+x)*4;im.data[i]=k;im.data[i+1]=k+8;im.data[i+2]=Math.min(255,k+20);im.data[i+3]=255}
  g.putImageData(im,0,0);return c})();
scene.traverse(o=>{if(o.isMesh&&o.userData.water){const t=new THREE.CanvasTexture(RIPPLE);t.wrapS=t.wrapT=THREE.RepeatWrapping;const big=o.geometry.type==='CircleGeometry';t.repeat.set(big?3:2,big?3:4);o.material.map=t;o.material.needsUpdate=true;WATER.push(o)}});
/* graphics quality switch (applies live; low also simplifies materials next launch) */
function applyGfx(){const hi=GFX==='high';renderer.setPixelRatio(Math.min(hi?2:GFX==='medium'?1.5:1,window.devicePixelRatio||1));renderer.shadowMap.enabled=hi&&SHADOWS_OK;sun.castShadow=hi&&SHADOWS_OK;
  scene.traverse(o=>{if(o.material)[].concat(o.material).forEach(m=>m.needsUpdate=true)});SKY.clouds.forEach(c=>c.visible=GFX!=='low');
  const NL=hi?6:GFX==='medium'?3:0;LAMPS.pool.forEach((l,i)=>{if(i>=NL){l.intensity=0;l.visible=false}else l.visible=true});
  const b=$('gfxB');if(b){b.textContent=hi?'HD':GFX==='medium'?'MED':'LOW';b.setAttribute('aria-label','Graphics quality: '+GFX)}}
const SHADOWS_OK=true;
