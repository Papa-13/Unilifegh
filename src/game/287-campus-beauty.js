/* ================= a nicer campus =================
   Paved walkways with open drains along every road (like Ghanaian streets), royal palm avenues on
   the main campus drives, flowering bushes in front of buildings, shady trees with round benches on
   the lawns, and polytanks on stands behind hostels. All static and cheap: walkways and drains are
   two merged meshes for the whole map. */
(function campusBeauty(){const sc=scene,R=(()=>{let s=11;return()=>(s=(s*16807)%2147483647)/2147483647})();
  const tex=(draw,rep)=>{const c=document.createElement('canvas');c.width=c.height=128;draw(c.getContext('2d'));const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t};
  /* interlocking concrete pavers */
  const paveT=tex(g=>{g.fillStyle='#9d978c';g.fillRect(0,0,128,128);for(let y=0;y<128;y+=16)for(let x=0;x<128;x+=16){const o=(y/16)%2*8;g.fillStyle=Math.random()<.12?'#9b5a46':Math.random()<.5?'#aaa499':'#a29c91';g.fillRect(x+o+1,y+1,14,14)}
    g.fillStyle='rgba(50,45,40,.3)';for(let y=0;y<128;y+=16)g.fillRect(0,y,128,1);for(let i=0;i<300;i++){g.fillStyle=`rgba(0,0,0,${Math.random()*.06})`;g.fillRect(Math.random()*128,Math.random()*128,2,2)}});
  /* open concrete drain: dark channel with light lips */
  const drainT=tex(g=>{g.fillStyle='#4a4743';g.fillRect(0,0,128,128);g.fillStyle='#2e2c29';g.fillRect(0,26,128,76);g.fillStyle='#b9b3a8';g.fillRect(0,0,128,14);g.fillRect(0,114,128,14);
    for(let x=0;x<128;x+=32){g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x,0,2,128)}for(let i=0;i<60;i++){g.fillStyle=`rgba(70,90,50,${Math.random()*.25})`;g.fillRect(Math.random()*128,40+Math.random()*50,3,2)}});
  const walkL=[],drainL=[],WW=25,DW=8;
  const plane=(L,x1,y1,x2,y2,vert)=>{const w=x2-x1,d=y2-y1;if(w<=1||d<=1)return;const g=new THREE.PlaneGeometry(w*U,d*U);g.rotateX(-Math.PI/2);const uv=g.attributes.uv,len=vert?d:w,wid=vert?w:d;
    for(let i=0;i<uv.count;i++){const u=uv.getX(i),v=uv.getY(i);if(vert)uv.setXY(i,v*len/(L===walkL?40:60),u*(L===walkL?wid/40:1));else uv.setXY(i,u*len/(L===walkL?40:60),v*(L===walkL?wid/40:1))}
    L.push({geo:g,m:new THREE.Matrix4().makeTranslation(wx(x1+w/2),0,wz(y1+d/2))})};
  /* driveways cross the walkway in front of buildings: leave a gap there */
  const drives=B.filter(b=>!b.open).map(b=>b.door[0]);
  const split=(a,b,gaps,fn)=>{let s0=a;gaps.filter(g=>g>a-22&&g<b+22).sort((p,q)=>p-q).forEach(g=>{if(g-22>s0)fn(s0,g-22);s0=Math.max(s0,g+22)});if(b>s0)fn(s0,b)};
  const seg=(a,b,cross,fn)=>{const cuts=cross.filter(c=>c>a&&c<b).sort((p,q)=>p-q);let s0=a;cuts.concat([b+RHW]).forEach(c=>{const e=Math.min(b,c-RHW-WW-DW);if(e-s0>20)fn(s0,e);s0=c+RHW+WW+DW})};
  const CX=MAPR.v,CY=MAPR.h.map(r=>r[0]);
  ROADS.forEach(([x,y,w,h])=>{const hz=w>h;
    if(hz){seg(x,x+w,CX,(a,b)=>split(a,b,drives,(p,q)=>{[-1,1].forEach(sd=>{const e=sd<0?y-5:y+h+5;plane(walkL,p,sd<0?e-WW:e,q,sd<0?e:e+WW);plane(drainL,p,sd<0?e-WW-DW:e+WW,q,sd<0?e-WW:e+WW+DW)})}))}
    else seg(y,y+h,MAPR.h.filter(r=>x+w/2>=r[1]&&x+w/2<=r[2]).map(r=>r[0]),(a,b)=>{[-1,1].forEach(sd=>{const e=sd<0?x-5:x+w+5;plane(walkL,sd<0?e-WW:e,a,sd<0?e:e+WW,b,1);plane(drainL,sd<0?e-WW-DW:e+WW,a,sd<0?e-WW:e+WW+DW,b,1)})})});
  const wm=new THREE.Mesh(mergeGeos(walkL),new THREE.MeshLambertMaterial({map:paveT}));wm.position.y=.004;wm.receiveShadow=SHADOWS;wm.userData.noShift=1;sc.add(wm);
  const dm=new THREE.Mesh(mergeGeos(drainL),new THREE.MeshLambertMaterial({map:drainT}));dm.position.y=.005;dm.userData.noShift=1;sc.add(dm);
  const onRoad=(x,y,m)=>ROADS.some(([rx,ry,w,h])=>x>rx-m&&x<rx+w+m&&y>ry-m&&y<ry+h+m);
  const inB=(x,y,m)=>B.some(b=>x>b.x-m&&x<b.x+b.w+m&&y>b.y-m&&y<b.y+b.h+m||(!b.open&&Math.hypot(b.door[0]-x,b.door[1]-y)<m+50));
  const nearStop=(x,y)=>typeof SH_STOPS!=='undefined'&&SH_STOPS.some(st=>Math.hypot(st.sx-x,st.sy-y)<80);
  const campus=(x,y)=>{const z=zoneOf(x,y);return!Object.values(ZONES).some(Z=>Z.town&&Z.name===z)};
  const free=(x,y,r)=>!onRoad(x,y,RHW*0+8)&&!inB(x,y,r)&&!nearStop(x,y)&&!solidAt(x,y,r)&&!JUNCS.some(J=>Math.hypot(J.x-x,J.y-y)<RHW+70);
  /* royal palm avenues along the main campus drives (just outside the drains) */
  const avenue=(fixed,from,to,horiz)=>{for(let t=from;t<=to;t+=120)[-1,1].forEach(sd=>{const off=RHW+5+WW+DW+12,x=horiz?t:fixed+sd*off,y=horiz?fixed+sd*off:t;if(!free(x,y,10)||drives.some(d=>Math.abs(d-x)<40&&horiz))return;solidC(x,y,7);nicePalm(sc,x,y,true)})};
  avenue(2000,420,2080,false);avenue(1000,2080,4320,true);avenue(3400,420,2080,false);avenue(2150,2080,3320,true);
  /* flowering bushes along the front of campus buildings */
  B.forEach(b=>{if(b.open||!campus(b.door[0],b.door[1]))return;const fy=b.door[1]>b.y+b.h/2?b.y+b.h+14:b.y-14;
    for(let x=b.x+14;x<b.x+b.w-10;x+=34){if(Math.abs(x-b.door[0])<44)continue;if(onRoad(x,fy,4)||solidAt(x,fy,4))continue;niceBush(sc,x,fy,null,.9+R()*.3,R()*6)}});
  /* shady trees with round benches on the campus lawns */
  let nB=0;for(let i=0;i<500&&nB<22;i++){const x=650+R()*3700,y=380+R()*2380;if(!campus(x,y)||!free(x,y,40))continue;solidC(x,y,16);niceTree(sc,x,y,1.15,R()<.45?'flame':'mango');
    const bm=new THREE.Mesh(treeBenchTpl(),envMat('tree'));bm.position.set(wx(x),0,wz(y));sc.add(bm);nB++}
  /* bushes scattered on lawns and road verges */
  for(let i=0,n=0;i<900&&n<140;i++){const x=40+R()*(MW-80),y=40+R()*(MH-80);if(!free(x,y,18))continue;niceBush(sc,x,y,campus(x,y)?null:'hib',.8+R()*.5,R()*6);n++}
  /* black polytanks on steel stands behind hostels and halls */
  B.forEach(b=>{if(b.open||!(b.home||/hostel|hall|lodge|annex|villa|residence/i.test(b.name)))return;const back=b.door[1]>b.y+b.h/2?b.y-16:b.y+b.h+16,x=b.x+b.w-22;if(onRoad(x,back,10)||solidAt(x,back,8))return;
    const g=new THREE.Group();g.position.set(wx(x),0,wz(back));[-1,1].forEach(a=>[-1,1].forEach(c=>box(.04,1.1,.04,0x555a5e,a*.28,.55,c*.28,g)));box(.7,.05,.7,0x555a5e,0,1.1,0,g);
    mesh(new THREE.CylinderGeometry(.34,.36,.85,16),new THREE.MeshLambertMaterial({color:0x1c1c1c}),0,1.56,0,g);mesh(new THREE.CylinderGeometry(.12,.12,.06,10),lam(0x2a2a2a),0,2.01,0,g);solidC(x,back,10);sc.add(g)});
})();
