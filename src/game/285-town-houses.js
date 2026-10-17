/* ================= the towns: houses, compounds and little shops =================
   Fills Bomso, Kentinkrono, Ayigya, Boadi, Gyinyaase, Kotei and Ayeduase with compound houses
   (painted walls, rusty roofing sheets), a few roadside shops with hand-painted signs, and
   collision so you walk around them. Drawn as two instanced meshes, so it stays fast. */
const TOWN_SHOPS=['GOD\'S TIME PROVISIONS','MAMA\'S CHOP BAR','FRESH FUFU JOINT','KOFI BARBERING SHOP','BLESSED WIFI & PRINTING','ADOM PHARMACY','JESUS IS LORD ELECTRICALS','SIKA MOBILE MONEY','NYAME NE HENE BOUTIQUE','ODO MOBILE PHONES','HAJIA\'S WAAKYE','FINE GIRL BEAUTY SALON'];
(function buildTowns(){let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
  const walls=[0xe8dcc4,0xf0d9b5,0xdfe6ea,0xe9c9a9,0xd8e4d0,0xf2e6d8,0xcfd8e8,0xe6c8c8,0xd9c9a8],roofs=[0x8a4a2a,0x9a5a32,0x7b7f84,0x6d5a48,0xa0643a,0x5f6a72];
  const spots=[],pad=34,near=(x,y,w,h)=>B.some(b=>x+w/2>b.x-pad-30&&x-w/2<b.x+b.w+pad+30&&y+h/2>b.y-pad-40&&y-h/2<b.y+b.h+pad+40);
  const roadNear=(x,y,w,h)=>ROADS.some(([rx,ry,rw,rh])=>x+w/2>rx-pad&&x-w/2<rx+rw+pad&&y+h/2>ry-pad&&y-h/2<ry+rh+pad);
  Object.values(ZONES).filter(z=>z.town).forEach(z=>z.rects.forEach(([zx,zy,zw,zh])=>{
    for(let y=zy+70;y<zy+zh-50;y+=135)for(let x=zx+70;x<zx+zw-50;x+=150){const w=78+rnd()*40,h=58+rnd()*30,cx=x+rnd()*26-13,cy=y+rnd()*20-10;
      if(rnd()<.14)continue;if(cx-w/2<15||cy-h/2<15||cx+w/2>MW-15||cy+h/2>MH-15)continue;if(near(cx,cy,w,h)||roadNear(cx,cy,w,h))continue;
      if(typeof SH_STOPS!=='undefined'&&SH_STOPS.some(s=>Math.hypot(s.sx-cx,s.sy-cy)<90))continue;spots.push({x:cx,y:cy,w,h,ht:1.25+rnd()*.7+(rnd()<.12?1.3:0)})}}));
  const N=spots.length,dummy=new THREE.Object3D(),col=new THREE.Color();
  const wallM=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial(),N),roofM=new THREE.InstancedMesh(new THREE.ConeGeometry(.75,1,4),new THREE.MeshLambertMaterial(),N);
  spots.forEach((s,i)=>{const X=wx(s.x),Z=wz(s.y),W=s.w*U,D=s.h*U;
    dummy.position.set(X,s.ht/2,Z);dummy.rotation.set(0,0,0);dummy.scale.set(W,s.ht,D);dummy.updateMatrix();wallM.setMatrixAt(i,dummy.matrix);wallM.setColorAt(i,col.setHex(walls[Math.floor(rnd()*walls.length)]));
    dummy.position.set(X,s.ht+.28,Z);dummy.rotation.set(0,Math.PI/4,0);dummy.scale.set(W*.97,.56,D*.97);dummy.updateMatrix();roofM.setMatrixAt(i,dummy.matrix);roofM.setColorAt(i,col.setHex(roofs[Math.floor(rnd()*roofs.length)]));
    solidBox(s.x,s.y,s.w,s.h)});
  [wallM,roofM].forEach(m=>{m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;m.castShadow=false;m.receiveShadow=SHADOWS;scene.add(m)});
  /* doors and windows on the side facing the nearest road, and some shop signs */
  const dark=lam(0x3a2a1e),glass=lam(0x2a3540);let shop=0;
  spots.forEach((s,i)=>{const toRoad=ROADS.map(([rx,ry,rw,rh])=>rw>rh?{d:Math.abs(ry+rh/2-s.y),f:ry+rh/2>s.y?1:-1}:{d:9e9,f:1}).sort((a,b)=>a.d-b.d)[0],f=toRoad.f,X=wx(s.x),Z=wz(s.y+f*s.h/2)+f*.01;
    box(.3,.62,.02,dark,X-s.w*U*.2,.31,Z,scene);box(.32,.26,.02,glass,X+s.w*U*.18,.78,Z,scene);
    if(toRoad.d<230&&rnd()<.22&&shop<TOWN_SHOPS.length){const t=TOWN_SHOPS[shop++],p=new THREE.Mesh(new THREE.PlaneGeometry(Math.min(s.w*U*.95,2.2),.34),new THREE.MeshBasicMaterial({map:textTex(t,{w:512,h:80,font:'900 38px system-ui',color:'#ffffff',stroke:false,bg:pick(['#8e2a3a','#1f4f8b','#2f6b3a','#c2572e','#5b3a7a'])})}));
      p.position.set(X,s.ht+.12,Z+f*.02);if(f<0)p.rotation.y=Math.PI;scene.add(p)}})})();
