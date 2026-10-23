/* ================= ROOM INTERIORS ================= */
function floorMat(tier){return texMat('floor'+tier,g=>{
  if(tier>=2){g.fillStyle=tier===3?'#7a5536':'#a77a4e';g.fillRect(0,0,128,128);g.fillStyle=tier===3?'#5f4129':'#8f6640';for(let y=0;y<128;y+=16){g.fillRect(0,y,128,2);g.fillRect((y*7)%128,y,2,16)}}
  else if(tier===1){g.fillStyle='#e6e1d6';g.fillRect(0,0,128,128);g.strokeStyle='#cfc8ba';g.lineWidth=2;for(let i=0;i<=128;i+=32){g.beginPath();g.moveTo(i,0);g.lineTo(i,128);g.moveTo(0,i);g.lineTo(128,i);g.stroke()}}
  else{g.fillStyle='#cfc6b6';g.fillRect(0,0,128,128);g.fillStyle='#b9af9e';g.fillRect(0,0,64,64);g.fillRect(64,64,64,64);g.fillStyle='rgba(0,0,0,.1)';for(let i=0;i<60;i++)g.fillRect(Math.random()*128,Math.random()*128,2,2)}},[4,4])}
function sheetMat(k){const v=DECO.sheet[k][1];return v==='kente'?clothMat('kente'):lam(v)}
/* where someone lies on a bed: feet at one end, head at the pillow (sideways beds: head against the right wall) */
function bedPos(sl,dx=0){return sl.rot?{x:sl.x-.85,z:sl.z+dx,yaw:-Math.PI/2}:{x:sl.x+dx,z:sl.z+.85,yaw:0}}
function bedSlots(n,W,tier,singles,D){const xr=W/2-.62,s=[];
  const bunk=z=>{s.push({x:xr,y:.5,z,bunk:true});s.push({x:xr,y:1.5,z,bunk:true})};
  /* single beds: two rows of beds side by side along the right of a bigger room, a gap between them */
  if(singles&&n>=3){const Dd=D||5.6,x=W/2-1.1,gap=(Dd-1.3)/n;for(let i=0;i<n;i++)s.push({x,y:.5,z:-Dd/2+.75+gap*(i+.5)-.05,rot:true});return s}
  if(n===4){bunk(-1.15);bunk(1.05)}else if(n===3){bunk(-1.15);s.push({x:xr,y:.5,z:1.05})}else if(n===2){s.push({x:xr,y:.5,z:-1.15});s.push({x:xr,y:.5,z:1.05})}
  else s.push(tier>=1?{x:xr-.25,y:.5,z:-.6,dbl:true}:{x:xr,y:.5,z:-.6});
  return s}
function fadeIn(){const f=$('fade');if(!f)return;f.classList.add('on');requestAnimationFrame(()=>requestAnimationFrame(()=>f.classList.remove('on')))}
function enterRoom(owner){setTimeout(()=>{try{roomTalk(owner)}catch(e){console.error(e)}},1600);return enterRoom0(owner)}
function enterRoom0(owner){fadeIn();
  const mine=owner==='me';
  const rt=mine?roomOf():owner.real&&ROOMS[owner.room]?ROOMS[owner.room]:ROOMS[(HOSTELS.find(h=>h.id===owner.home)||HOSTELS[0]).rooms[0].id];
  const tier=rt.tier,beds=rt.beds,W=rt.W||(beds>=3?6.8:5.6),D=rt.D||5.2,deco=mine?P().deco:owner.real&&owner.deco?owner.deco:{wall:pick(['cream','sky','mint','grey']),sheet:pick(['blue','green','white']),curtain:pick(['none','teal','white'])};
  const s=new THREE.Scene();s.background=new THREE.Color(0x14110f);
  const rh=new THREE.HemisphereLight(0xfff4e6,0x40302a,.8);s.add(rh);
  const bulb=new THREE.PointLight(0xffe2b0,.8,14,1.4);bulb.position.set(0,2.6,.5);s.add(bulb);
  const dl=new THREE.DirectionalLight(0xffffff,.35);dl.position.set(3,6,5);s.add(dl);s.add(dl.target);
  if(SHADOWS&&GFX==='high'){dl.castShadow=true;dl.shadow.mapSize.set(1024,1024);const c=dl.shadow.camera;c.left=-6;c.right=6;c.top=6;c.bottom=-6;c.near=.5;c.far=20;dl.shadow.bias=-.0005;dl.shadow.normalBias=.02}
  const roomL={rh,bulb,dl};
  const cam=new THREE.PerspectiveCamera(42,16/10,.1,60);
  IS={kind:'room',scene:s,cam,W,D,obst:[],objs:[],people:[],spots:{},mine,owner,tier,beds,rt,L:roomL,lightsOn:true};
  const fl=mesh(new THREE.PlaneGeometry(W,D),floorMat(tier),0,0,0,s);fl.rotation.x=-Math.PI/2;
  const wallM=lam(DECO.wall[deco.wall][1]),trim=lam(tier>=2?0x5c6b73:0x7a5a3a);
  box(W,2.7,.12,wallM,0,1.35,-D/2,s);box(.12,2.7,D/2,wallM,-W/2,1.35,D/4,s);
  box(W,.15,.12,trim,0,.075,-D/2+.07,s);box(.12,.15,D/2,trim,-W/2+.07,.075,D/4,s);
  box(W,.12,.06,lam(0x3a2f28),0,.06,D/2,s);box(.06,.12,D,lam(0x3a2f28),W/2,.06,0,s);
  if(tier===0){box(W,.9,.02,lam(0xa9c7b0),0,.45,-D/2+.07,s);for(let i=0;i<6;i++)box(R(.1,.3),R(.05,.15),.01,lam(0xbfb39a),R(-W/2+.5,W/2-.5),R(1,2.3),-D/2+.075,s)}
  const winX=beds>=3?.4:.1;IS.winX=winX;box(1.5,1.1,.05,lam(0x5a4a3a),winX,1.65,-D/2+.07,s);
  IS.win=mesh(new THREE.PlaneGeometry(1.3,.92),basic(0x9fd3f0),winX,1.65,-D/2+.1,s);
  if(tier===0)for(let i=-2;i<=2;i++)box(.025,.92,.02,lam(0x333333),winX+i*.26,1.65,-D/2+.12,s);
  const cur=DECO.curtain[deco.curtain][1];if(cur){const cmat=cur==='ankara'?clothMat('ankara'):lam(cur);[-1,1].forEach(sd=>box(.4,1.4,.04,cmat,winX+sd*.85,1.6,-D/2+.15,s));box(2.2,.05,.05,lam(0x333333),winX,2.32,-D/2+.15,s)}
  const dz=D/2-.75;box(.06,2.05,.95,lam(0x6b4a2e),-W/2+.08,1.03,dz,s);mesh(sph(.04),lam(0xd9a537),-W/2+.13,1,dz-.35,s);
  IS.objs.push({id:'door',label:'Door',x:-W/2+.55,z:dz,r:.8});
  // en-suite bathroom in every room (cut-away walls so you can see inside)
  {const BW=tier>=3?2.6:2.2,BX0=-W/2-BW,BX1=-W/2,bz=-D/2,cx=(BX0+BX1)/2,tileM=lam(tier>=2?0xf2f0ea:0xbfe0ea),white=lam(0xf7f7f4),OB=(x1,x2,z1,z2)=>IS.obst.push({x1,x2,z1,z2});
    IS.xmin=BX0;IS.camW=W+BW;IS.cx0=.3-BW*.35;
    const bf=mesh(new THREE.PlaneGeometry(BW,D/2),texMat('btile'+tier,g=>{g.fillStyle=tier>=2?'#e9e6df':'#cfd8dc';g.fillRect(0,0,128,128);g.strokeStyle=tier>=2?'#d2cdc4':'#a9b6bb';g.lineWidth=2;for(let i=0;i<=128;i+=21){g.beginPath();g.moveTo(i,0);g.lineTo(i,128);g.moveTo(0,i);g.lineTo(128,i);g.stroke()}},[3,3]),cx,.003,bz/2,s);bf.rotation.x=-Math.PI/2;
    box(BW,2.7,.12,tileM,cx,1.35,bz,s);box(.12,2.7,D/2,tileM,BX0,1.35,bz/2,s);box(BW+.12,.9,.1,tileM,cx,.45,0,s);
    box(.12,.9,-.95-bz,wallM,BX1,.45,(bz-.95)/2,s);box(.12,.9,.05,wallM,BX1,.45,-.025,s);
    OB(BX0-.1,BX1+.06,-.06,D/2);OB(BX1-.06,BX1+.06,bz,-.95);OB(BX0,BX1,-.06,.06);
    const lt=new THREE.PointLight(0xfff4e0,.5,6,1.5);lt.position.set(cx,2.4,bz/2);s.add(lt);
    // shower with frosted glass
    const SD=tier>=3?.85:.95,glass=new THREE.MeshStandardMaterial({color:0xe8f1f3,transparent:true,opacity:.97,roughness:.6,side:THREE.DoubleSide});
    box(SD,.04,SD,white,BX0+SD/2,.02,bz+SD/2,s);const g1=mesh(new THREE.PlaneGeometry(SD,1.25),glass,BX0+SD/2,.95,bz+SD,s);const g2=mesh(new THREE.PlaneGeometry(SD,1.25),glass,BX0+SD,.95,bz+SD/2,s);g2.rotation.y=Math.PI/2;
    mesh(cyl(.08,.05,.04,12),lam(0xbbbbbb),BX0+.3,2.05,bz+.2,s);box(.03,.03,.25,0xaaaaaa,BX0+.3,2.08,bz+.08,s);OB(BX0,BX0+SD+.02,bz,bz+SD+.02);
    const water=new THREE.Group(),wm=new THREE.MeshBasicMaterial({color:0xd6f3ff,transparent:true,opacity:.6});for(let i=0;i<8;i++)mesh(cyl(.006,.006,1.9,4),wm,R(-.12,.12),1.05,R(-.12,.12),water);water.position.set(BX0+SD/2,0,bz+SD/2);water.visible=false;s.add(water);IS.water=water;
    IS.spots.shower={x:BX0+SD/2,z:bz+SD/2,ry:Math.PI/4};
    // sink + mirror, toilet
    const sx=BX0+SD+.42;box(.6,.85,.45,lam(tier>=2?0x7a5536:0xf4f4f0),sx,.43,bz+.25,s);box(.42,.06,.32,white,sx,.88,bz+.25,s);box(.5,.65,.03,lam(0xcfe3f0),sx,1.5,bz+.08,s);OB(sx-.32,sx+.32,bz,bz+.5);IS.spots.sink={x:sx,z:bz+.85,ry:Math.PI};
    const tx=BX1-.32;box(.38,.4,.52,white,tx,.2,bz+.4,s);box(.4,.42,.16,white,tx,.6,bz+.1,s);OB(tx-.22,tx+.22,bz,bz+.68);
    if(tier>=3){const ux=BX0+.42,uz=-.88;box(.8,.1,1.68,white,ux,.05,uz,s);[-.36,.36].forEach(dx=>box(.08,.55,1.68,white,ux+dx,.28,uz,s));[-.8,.8].forEach(dz=>box(.8,.55,.08,white,ux,.28,uz+dz,s));
      const tw=mesh(new THREE.PlaneGeometry(.64,1.52),new THREE.MeshLambertMaterial({color:0x9fdcf0,transparent:true,opacity:.55,depthWrite:false}),ux,.4,uz,s);tw.rotation.x=-Math.PI/2;OB(BX0,ux+.42,uz-.86,uz+.86);IS.spots.tub={x:ux,z:uz+.72,ly:.24}}
    else{box(.04,.04,.6,0xaaaaaa,BX0+.08,1.3,-.6,s);box(.03,.55,.5,lam([0xe8b24a,0x5aa9e6,0xe58fb0][tier]||0xe8b24a),BX0+.09,1.05,-.6,s)}
    if(HT(mine?P().home:owner.home)==='lodge'){[0,.3].forEach((dz,i)=>mesh(cyl(.13,.13,.42,12),lam(i?0x9fd3f0:0xf2c230),BX0+.25,.21,-.95+dz,s));mesh(cyl(.17,.14,.3,12),lam(0x2f6bb5),BX0+.65,.15,-.35,s);OB(BX0,BX0+.85,-1.15,-.15)}
    IS.waterOff=mine&&['lodge','sunrise'].includes(HT(P().home))&&S.waterOffDay===day();
    IS.objs.push({id:'bath',label:'Bathroom',x:cx,z:bz/2-.1,r:1.35})}
  const slots=bedSlots(beds,W,tier,rt.singles,D);IS.slots=slots;
  const others=[0x5aa9e6,0x4fb87a,0xe58fb0,0xf4f1ea];const drawn={};
  slots.forEach((sl,i)=>{
    const key=sl.x+'_'+sl.z,frameM=lam(tier>=1?0x6b4a2e:0x5d6670),len=2.05,wid=sl.dbl?1.5:.95;
    if(!drawn[key]){drawn[key]=1;
      if(sl.rot){[-1,1].forEach(a=>[-1,1].forEach(b=>box(.06,.5,.06,frameM,sl.x+b*len/2,.25,sl.z+a*wid/2,s)));if(tier>=1)box(.08,.7,wid+.06,frameM,sl.x+len/2,.6,sl.z,s);IS.obst.push({x1:sl.x-len/2-.05,x2:sl.x+len/2+.05,z1:sl.z-wid/2-.05,z2:sl.z+wid/2+.05})}
      else if(sl.bunk){[-1,1].forEach(a=>[-1,1].forEach(b=>box(.06,2.1,.06,frameM,sl.x+a*wid/2,1.05,sl.z+b*len/2,s)));box(.06,.06,.6,frameM,sl.x-wid/2,1.2,sl.z+len/2-.2,s);box(.06,.06,.6,frameM,sl.x-wid/2,.85,sl.z+len/2-.2,s)}
      else{[-1,1].forEach(a=>[-1,1].forEach(b=>box(.06,.5,.06,frameM,sl.x+a*wid/2,.25,sl.z+b*len/2,s)));if(tier>=1)box(wid+.06,.7,.08,frameM,sl.x,.6,sl.z-len/2,s)}
      if(!sl.rot)IS.obst.push({x1:sl.x-wid/2-.05,x2:sl.x+wid/2+.05,z1:sl.z-len/2-.05,z2:sl.z+len/2+.05})}
    const shM=mine&&i===0?sheetMat(deco.sheet):i===0?sheetMat(deco.sheet):lam(others[i%4]);
    if(sl.rot){box(2.05,.08,wid+.05,frameM,sl.x,sl.y-.04,sl.z,s);box(1.95,.16,wid-.04,lam(0xf4f1ea),sl.x,sl.y+.08,sl.z,s);box(1.3,.04,wid-.06,shM,sl.x-.3,sl.y+.18,sl.z,s);box(.32,.1,wid*.6,lam(0xffffff),sl.x+.78,sl.y+.21,sl.z,s)}
    else{box(wid+.05,.08,2.05,frameM,sl.x,sl.y-.04,sl.z,s);box(wid-.04,.16,1.95,lam(0xf4f1ea),sl.x,sl.y+.08,sl.z,s);
    box(wid-.06,.04,1.3,shM,sl.x,sl.y+.18,sl.z+.3,s);
    box(wid*.6,.1,.32,lam(0xffffff),sl.x,sl.y+.21,sl.z-.78,s)}
  });
  const n=beds,deskX=i=>-W/2+.95+i*Math.min(1.25,(W-2.6)/Math.max(1,n-1));
  for(let i=0;i<n;i++){const x=n===1?-.6:deskX(i),z=-D/2+.45;
    box(1,.06,.6,lam(tier>=2?0x7a5536:0x8a6a4a),x,.76,z,s);[-.45,.45].forEach(a=>box(.05,.74,.5,lam(tier>=2?0x5a3e28:0x6a4f37),x+a,.37,z,s));
    box(.42,.05,.42,lam(tier>=3?0x8e2a3a:0x2b2b2b),x,.47,z+.55,s);box(.42,.45,.05,lam(tier>=3?0x8e2a3a:0x2b2b2b),x,.72,z+.75,s);
    box(.25,.12,.2,lam([0xb83a3a,0x2f6b9b,0x3c8a4a][i%3]),x-.3,.85,z-.05,s);
    if(i===0&&mine){box(.38,.02,.26,lam(0x333333),x+.1,.8,z,s);const sc=box(.38,.24,.02,basic(0x6fa8dc),x+.1,.92,z-.12,s);sc.rotation.x=-.2}
    IS.obst.push({x1:x-.55,x2:x+.55,z1:z-.35,z2:z+.35})}
  IS.objs.push({id:'desk',label:'Desk',x:n===1?-.6:deskX(0),z:-D/2+1.25,r:.8});
  if(tier>=1){box(1,2,.55,lam(tier>=2?0x7a5536:0x9a7a55),-W/2+.4,1,-D/2+1.4,s);IS.obst.push({x1:-W/2,x2:-W/2+.7,z1:-D/2+1.1,z2:-D/2+1.7});IS.objs.push({id:'wardrobe',label:'Wardrobe',x:-W/2+1.1,z:-D/2+1.4,r:.8})}
  else{for(let i=0;i<Math.min(n,4);i++){const x=-W/2+.33+(i%2)*.52,z=.32+Math.floor(i/2)*.5;box(.5,1.8,.48,lam(0x8a949c),x,.9,z,s);box(.02,.4,.02,lam(0x333333),x+.15,1,z+.25,s)}
    IS.obst.push({x1:-W/2,x2:-W/2+1.1,z1:.07,z2:1.07});IS.objs.push({id:'wardrobe',label:'Locker',x:-W/2+1.45,z:.6,r:.8})}
  if(rt.ac)box(.9,.28,.22,lam(0xf4f4f4),-.6,2.35,-D/2+.2,s);
  else{const fan=new THREE.Group();fan.position.set(0,2.55,0);for(let i=0;i<3;i++){const pv=new THREE.Group();box(.9,.02,.12,lam(0xf0ebe0),.45,0,0,pv);pv.rotation.y=i*2.1;fan.add(pv)}mesh(cyl(.08,.08,.1,10),lam(0xf0ebe0),0,0,0,fan);s.add(fan);IS.fan=fan}
  IS.tv=!!(rt.tv||(mine&&P().items.includes('tv')));
  /* TV: find a stretch of wall with nothing in front of it, so you can stand or sit and watch
     (right wall first, then the back wall, then the left wall away from the door) */
  if(IS.tv){const clear=(x1,x2,z1,z2)=>x1>-W/2-.01&&x2<W/2+.01&&z1>-D/2-.01&&z2<D/2+.01&&!IS.obst.some(o=>x1<o.x2+.05&&x2>o.x1-.05&&z1<o.z2+.05&&z2>o.z1-.05);
    const C2=[];for(let z=D/2-.75;z>-D/2+.7;z-=.2)C2.push({wx:W/2,z,nx:-1});for(let x=W/2-.8;x>-W/2+.8;x-=.2)C2.push({wz:-D/2,x,nz:1});for(let z=-D/2+.75;z<D/2-.7;z+=.2)if(Math.abs(z-dz)>1.2)C2.push({wx:-W/2,z,nx:1});
    let T=null;for(const c of C2){if(c.wx!=null){const x0=c.wx,vx=x0+c.nx*1.45;const fx1=Math.min(x0,x0+c.nx*.5),fx2=Math.max(x0,x0+c.nx*.5);if(clear(fx1,fx2,c.z-.6,c.z+.6)&&clear(Math.min(vx,x0+c.nx*.5)-.25,Math.max(vx,x0+c.nx*.5)+.25,c.z-.3,c.z+.3)){T={x:x0,z:c.z,ry:c.nx<0?-Math.PI/2:Math.PI/2,vx,vz:c.z};break}}
      else{const z0=c.wz,vz=z0+1.45;if(clear(c.x-.6,c.x+.6,z0,z0+.5)&&clear(c.x-.3,c.x+.3,z0+.5-.25,vz+.25)){T={x:c.x,z:z0,ry:0,vx:c.x,vz};break}}}
    T=T||{x:W/2,z:1.9,ry:-Math.PI/2,vx:W/2-1.45,vz:1.9};const G=new THREE.Group();G.position.set(T.x,0,T.z);G.rotation.y=T.ry;s.add(G);
    box(1.3,.75,.05,lam(0x111111),0,1.45,.05,G);box(1.2,.66,.01,basic(0x1d3a5a),0,1.45,.085,G);if(!rt.tv){box(1.1,.5,.4,lam(0x3a2a20),0,.25,.22,G)}
    const wv=new THREE.Vector3(.55,0,0).applyAxisAngle(new THREE.Vector3(0,1,0),T.ry),dv=new THREE.Vector3(0,0,.45).applyAxisAngle(new THREE.Vector3(0,1,0),T.ry);
    if(!rt.tv)IS.obst.push({x1:Math.min(T.x-wv.x,T.x+wv.x+dv.x),x2:Math.max(T.x-wv.x,T.x+wv.x+dv.x),z1:Math.min(T.z-wv.z,T.z+wv.z+dv.z),z2:Math.max(T.z-wv.z,T.z+wv.z+dv.z)});
    IS.tvAt={x:T.x,z:T.z};IS.keep=[{x1:Math.min(T.vx,T.x)-.3,x2:Math.max(T.vx,T.x)+.3,z1:Math.min(T.vz,T.z)-.3,z2:Math.max(T.vz,T.z)+.3}];IS.tvSpot={x:T.vx,z:T.vz,ry:Math.atan2(T.x-T.vx,T.z-T.vz)};IS.objs.push({id:'tv',label:'TV',x:(T.x+T.vx)/2,z:(T.z+T.vz)/2,r:1})}else IS.tvSpot=null;
  if(mine){
    const cb=slots[0].rot?{x:.4,z:D/2-1.75}:slots[0],cupb=tier>=1||P().items.includes('cupboard');
    if(!mine){if(cupb){box(.7,.9,.42,lam(tier>=2?0x7a5536:0x9a7a55),cb.x-.2,.45,cb.z+1.35,s);box(.02,.7,.36,lam(0x5a3e28),cb.x-.2,.47,cb.z+1.35,s);[-.08,.08].forEach(dx=>mesh(sph(.02),lam(0xd9a537),cb.x-.2+dx,.6,cb.z+1.57,s));box(.5,.06,.34,lam(0xe8b24a),cb.x-.2,.93,cb.z+1.35,s)}
    else{const bag=mesh(sph(.24,12,10),lam(0x2f6b3a),cb.x-.2,.2,cb.z+1.3,s);bag.scale.set(1.3,.85,.9);mesh(cyl(.06,.09,.1,10),lam(0x2f6b3a),cb.x-.2,.4,cb.z+1.3,s);box(.3,.04,.02,lam(0xe8b24a),cb.x-.2,.22,cb.z+1.52,s)}
    IS.obst.push({x1:cb.x-.55,x2:cb.x+.15,z1:cb.z+1.12,z2:cb.z+1.58});IS.objs.push({id:'chop',label:cupb?'Food cupboard':'Provisions bag',x:cb.x-.95,z:cb.z+1.35,r:.75});}IS.provLbl=cupb?'food cupboard':'provisions bag';IS.cupb=cupb;
    IS.objs.push(slots[0].rot?{id:'bed',label:'Your bed',x:slots[0].x-.4,z:slots[0].z+.95,r:.8}:{id:'bed',label:'Your bed',x:cb.x-.9,z:cb.z-.3,r:.8});
    if(rt.kitchen){const kx=-W/2+.34;box(.6,.9,1.15,lam(0xe6e2da),kx,.45,.72,s);box(.62,.04,1.17,lam(0x6b6560),kx,.92,.72,s);box(.4,.03,.45,lam(0x222222),kx,.95,.45,s);[-.1,.1].forEach(dz=>{const r=mesh(new THREE.TorusGeometry(.07,.01,6,14),lam(0x555555),kx,.97,.45+dz*1.5,s);r.rotation.x=Math.PI/2});mesh(cyl(.1,.09,.13,12),lam(0x9a9a9a),kx,1.03,.4,s);box(.5,.42,.4,lam(0xf4f4f4),kx,1.15,1.05,s);
      IS.obst.push({x1:-W/2,x2:-W/2+.66,z1:.12,z2:1.32});IS.objs.push({id:'kitchen',label:'Kitchenette',x:-W/2+1.05,z:.72,r:.85});IS.spots.stove={x:-W/2+.9,z:.48,ry:-Math.PI/2}}
    const it=P().items,dx=n===1?-.6:deskX(0),dzz=-D/2+.45;
    if(it.includes('fan')){mesh(cyl(.18,.2,.04,12),lam(0xeeeeee),dx+.9,.02,dzz+.7,s);mesh(cyl(.02,.02,1.1,6),lam(0xcccccc),dx+.9,.57,dzz+.7,s);mesh(cyl(.22,.22,.08,16),lam(0xdddddd),dx+.9,1.15,dzz+.7,s).rotation.x=Math.PI/2}
    if(it.includes('cooker')){mesh(cyl(.13,.13,.18,14),lam(0xf0f0f0),dx+.32,.88,dzz+.05,s);IS.objs.push({id:'cooker',label:'Rice cooker',x:dx+.32,z:dzz+.85,r:.6});IS.spots.cooker={x:dx+.32,z:dzz+.75,ry:Math.PI}}
    if(it.includes('speaker'))box(.12,.22,.12,lam(0x1a1a1a),dx-.08,.9,dzz-.12,s);
    if(it.includes('lamp')){mesh(cyl(.02,.02,.4,6),lam(0x333333),dx+.42,.98,dzz-.15,s);mesh(new THREE.ConeGeometry(.12,.14,12),lam(0xe8b24a),dx+.42,1.2,dzz-.12,s)}
    if(it.includes('poster'))mesh(new THREE.PlaneGeometry(.8,1),new THREE.MeshBasicMaterial({map:textTex('AFROBEATS',{w:256,h:320,font:'900 46px system-ui',color:'#1b1206',stroke:false,bg:'#e8b24a'})}),dx,1.75,-D/2+.08,s);
    if(it.includes('rug')){const r=mesh(new THREE.PlaneGeometry(1.8,1.2),clothMat('kente'),-.3,.01,.8,s);r.rotation.x=-Math.PI/2}
    if(it.includes('plant')){mesh(cyl(.15,.12,.3,10),lam(0xb5653a),W/2-1.4,.15,D/2-.5,s);mesh(sph(.3,10,8),lam(0x3f8a3a),W/2-1.4,.55,D/2-.5,s)}
    if(it.includes('mirror')){box(.5,1.5,.05,lam(0xcfe3f0),W/2-2.2,.95,D/2-.3,s);IS.obst.push({x1:W/2-2.5,x2:W/2-1.9,z1:D/2-.4,z2:D/2-.2})}
    if(P().biz&&!BIZ[P().biz.type].service&&P().biz.stock>0){for(let i=0;i<Math.min(6,Math.ceil(P().biz.stock/5));i++)box(.35,.25,.3,lam(P().biz.type==='snacks'?0xd9a537:P().biz.type==='thrift'?0x8e2a3a:0x2f6b9b),-.2+(i%3)*.38,.13+Math.floor(i/3)*.26,D/2-.45,s);IS.objs.push({id:'stock',label:'Stock',x:.2,z:D/2-1,r:.7})}
    // ---- extra decor, appliances and mess ----
    const it2=P().items,C=[];for(let zz=D/2-.45;zz>-.6;zz-=.4)for(let xx=-W/2+1.15;xx<W/2-.35;xx+=.4)C.push([+xx.toFixed(2),+zz.toFixed(2)]);
    const free=(w,d)=>{for(const [x,z] of C){const r={x1:x-w/2,x2:x+w/2,z1:z-d/2,z2:z+d/2};if(Math.abs(x-(-W/2+.6))<1&&Math.abs(z-dz)<1)continue;if(!IS.obst.concat(IS.keep||[]).some(o=>r.x1<o.x2+.18&&r.x2>o.x1-.18&&r.z1<o.z2+.18&&r.z2>o.z1-.18))return{x,z}}return null};
    IS.extraL=[];
    if(it2.includes('led')){const col=P().ledCol||0x8a4bff,m=new THREE.MeshBasicMaterial({color:col});box(W,.035,.035,m,0,2.63,-D/2+.1,s);box(.035,.035,D/2,m,-W/2+.1,2.63,D/4,s);const l=new THREE.PointLight(col,0,9,1.3);l.position.set(0,2.35,-.4);l.userData={base:1.15,alwaysOn:1};s.add(l);IS.extraL.push(l);IS.ledM=m;IS.ledL=l}
    if(it2.includes('fairy')){const fl=new THREE.Group();for(let i=0;i<28;i++){const k=i/27,x=-W/2+.35+k*(W-.7),y=2.53-Math.pow(Math.sin(k*Math.PI*3),2)*.12;mesh(sph(.022,6,5),basic([0xffe3a3,0xfff1c9,0xffd27a][i%3]),x,y,-D/2+.11,fl)}s.add(fl);const l=new THREE.PointLight(0xffc982,0,7,1.4);l.position.set(0,2.2,-D/2+.7);l.userData={base:.75,alwaysOn:1};s.add(l);IS.extraL.push(l)}
    /* 💎 flex items from the Drip & Flex store */
    if(it2.includes('neon')){const nm=(P().name||'UNILIFE').split(' ')[0].toUpperCase().slice(0,10),sg=mesh(new THREE.PlaneGeometry(1.5,.42),new THREE.MeshBasicMaterial({map:textTex(nm+' ✦',{font:'900 64px system-ui',color:'#ff4fd8',stroke:false,bg:'rgba(0,0,0,0)'}),transparent:true}),W/2-.07,2.05,-.2,s);sg.rotation.y=-Math.PI/2;const gl=new THREE.PointLight(0xff4fd8,.7,3.2,1.8);gl.position.set(W/2-.4,2.05,-.2);s.add(gl)}
    if(it2.includes('ac')){box(.85,.28,.2,lam(0xf4f4f4),-W/2+.12,2.32,-D/2+1.1,s).rotation.y=Math.PI/2;box(.02,.04,.7,basic(0x9ad8ff),-W/2+.23,2.22,-D/2+1.1,s)}
    if(it2.includes('ringlight')){const q=free(.45,.45);if(q){mesh(cyl(.02,.02,1.5,6),lam(0x222222),q.x,.75,q.z,s);const rl=mesh(new THREE.TorusGeometry(.2,.03,8,24),new THREE.MeshBasicMaterial({color:0xfff6e0}),q.x,1.55,q.z,s);void rl;[-1,0,1].forEach(k=>box(.02,.02,.3,lam(0x222222),q.x+k*.12,.02,q.z,s).rotation.y=k);
      IS.obst.push({x1:q.x-.2,x2:q.x+.2,z1:q.z-.2,z2:q.z+.2});IS.objs.push({id:'ringlight',label:'Ring light',x:q.x,z:q.z+.6,r:.65})}}
    if(it2.includes('gchair')){const q=free(.6,.6);if(q){box(.55,.12,.55,lam(0x1b1b1b),q.x,.48,q.z,s);box(.55,.8,.1,lam(0xc8102e),q.x,.95,q.z-.24,s);box(.4,.5,.11,lam(0x1b1b1b),q.x,.95,q.z-.235,s);mesh(cyl(.04,.04,.42,6),lam(0x555555),q.x,.24,q.z,s);
      IS.obst.push({x1:q.x-.3,x2:q.x+.3,z1:q.z-.3,z2:q.z+.3})}}
    if(it2.includes('ps5')){const q=free(.4,.3);if(q){box(.12,.42,.3,lam(0xf4f4f4),q.x,.21,q.z,s);box(.04,.42,.3,lam(0x111111),q.x,.21,q.z,s);IS.obst.push({x1:q.x-.15,x2:q.x+.15,z1:q.z-.18,z2:q.z+.18})}}
    if(it2.includes('photos'))for(let i=0;i<3;i++){const z=.38+i*.4,y=2.08+(i%2)*.14;box(.03,.34,.28,lam(0x2b1d12),-W/2+.08,y,z,s);const ph=mesh(new THREE.PlaneGeometry(.22,.28),new THREE.MeshBasicMaterial({map:photoTex(i)}),-W/2+.1,y,z,s);ph.rotation.y=Math.PI/2}
    if(it2.includes('clock')){const G=new THREE.Group();G.position.set(-W/2+.08,2.33,dz);G.rotation.y=Math.PI/2;s.add(G);const fc=mesh(cyl(.16,.16,.03,28),lam(0xf7f4ec),0,0,0,G);fc.rotation.x=Math.PI/2;const rim=mesh(new THREE.TorusGeometry(.16,.014,6,28),lam(0x1e1e1e),0,0,.012,G);
      for(let i=0;i<12;i++){const a=i/12*Math.PI*2;box(.008,i%3?.02:.035,.004,basic(0x333333),Math.sin(a)*.13,Math.cos(a)*.13,.02,G)}
      const hand=(len,w,c)=>{const h=new THREE.Group();h.position.z=.024+(len>.1?.003:0);box(w,len,.004,basic(c),0,len/2-.015,0,h);G.add(h);return h};IS.clock={hh:hand(.08,.012,0x111111),mh:hand(.12,.008,0x111111),sh:hand(.13,.003,0xc0392b)}}
    if(it2.includes('shelf')){const sx=Math.min(W/2-.7,winX+1.3),sz=-D/2+.17;[1.82,2.18].forEach(y=>{box(.95,.03,.22,lam(0x6b4a2e),sx,y,sz,s);let x=sx-.42;for(let i=0;i<9&&x<sx+.4;i++){const w=R(.04,.07),h=R(.16,.27);const b=box(w,h,.16,lam(pick([0x8e2a3a,0x2f4e6b,0xe8b24a,0x2a7b7b,0x3a3a3a,0xd9542b,0xf1ece3])),x+w/2,y+.015+h/2,sz,s);if(i===6){b.rotation.z=.35;b.position.x+=.05}x+=w+.01}});[-.47,.47].forEach(dx=>box(.02,.12,.18,lam(0x333333),sx+dx,1.76,sz,s))}
    if(it2.includes('beanbag')){const tq=IS.tvSpot&&!IS.obst.some(o=>IS.tvSpot.x-.4<o.x2+.1&&IS.tvSpot.x+.4>o.x1-.1&&IS.tvSpot.z-.4<o.z2+.1&&IS.tvSpot.z+.4>o.z1-.1)?{x:IS.tvSpot.x,z:IS.tvSpot.z}:null;const q=tq||free(.8,.8);if(q){const bb=mesh(sph(.42,18,12),stdM(P().ledCol?0x3b2a6a:0x8e2a3a,.95),q.x,.22,q.z,s);bb.scale.set(1,.55,1);const top=mesh(sph(.3,14,10),stdM(0x000000,1),q.x,.42,q.z-.05,s);top.visible=false;
      IS.obst.push({x1:q.x-.38,x2:q.x+.38,z1:q.z-.38,z2:q.z+.38});IS.objs.push({id:'beanbag',label:'Beanbag',x:q.x,z:q.z+.65,r:.75});IS.spots.bean={x:q.x,z:q.z,ry:IS.tvAt?Math.atan2(IS.tvAt.x-q.x,IS.tvAt.z-q.z):0,ly:-.2}}}
    if(it2.includes('fridge')){const q=free(.55,.55);if(q){const fw=lam(0xe9ecef);box(.5,.82,.5,fw,q.x,.41,q.z,s);box(.5,.01,.5,lam(0x777777),q.x,.6,q.z+.001,s);box(.03,.22,.03,lam(0x9a9a9a),q.x+.2,.5,q.z+.26,s);mesh(cyl(.07,.08,.16,12),lam(0xd9542b),q.x-.08,.9,q.z,s);
      IS.obst.push({x1:q.x-.28,x2:q.x+.28,z1:q.z-.28,z2:q.z+.28});IS.objs.push({id:'fridge',label:'Mini fridge',x:q.x,z:q.z+.65,r:.7})}}
    if(it2.includes('kettle')){const kx=(n===1?-.6:deskX(0))+.3,kz=-D/2+.3;mesh(cyl(.07,.08,.2,12),lam(0xd8d8d8),kx,.89,kz,s);box(.02,.1,.06,lam(0x222222),kx+.08,.92,kz,s)}
    if(it2.includes('microwave')){const q=free(.6,.45);if(q){box(.55,.32,.4,lam(0xf1f1f1),q.x,.66,q.z,s);box(.36,.24,.01,basic(0x222222),q.x-.06,.66,q.z+.205,s);box(.5,.5,.42,lam(0x6b4a2e),q.x,.25,q.z,s);IS.obst.push({x1:q.x-.3,x2:q.x+.3,z1:q.z-.24,z2:q.z+.24});IS.objs.push({id:'chop',label:'Microwave',x:q.x,z:q.z+.6,r:.6})}}
    if(it2.includes('dispenser')){const q=free(.4,.4);if(q){box(.34,.9,.34,lam(0xf4f4f4),q.x,.45,q.z,s);mesh(cyl(.13,.13,.35,14),new THREE.MeshLambertMaterial({color:0x8fd3ff,transparent:true,opacity:.7}),q.x,1.07,q.z,s);[-.06,.06].forEach((dx,i)=>box(.04,.04,.03,lam(i?0x3b78c2:0xd9542b),q.x+dx,.7,q.z+.18,s));IS.obst.push({x1:q.x-.2,x2:q.x+.2,z1:q.z-.2,z2:q.z+.2});IS.objs.push({id:'dispenser',label:'Water dispenser',x:q.x,z:q.z+.55,r:.6})}}
    if(it2.includes('iron')){const q=free(.9,.35);if(q){box(.9,.04,.3,lam(0x5a8fbf),q.x,.8,q.z,s);[-.3,.3].forEach(dx=>box(.03,.78,.03,lam(0x888888),q.x+dx,.4,q.z,s));box(.16,.08,.09,lam(0x3a3a3a),q.x+.2,.85,q.z,s);IS.obst.push({x1:q.x-.45,x2:q.x+.45,z1:q.z-.16,z2:q.z+.16})}}
    if(it2.includes('console')){const cx2=(n===1?-.6:deskX(0))-.33,cz2=-D/2+.35;box(.26,.06,.2,lam(0x111111),cx2,.82,cz2,s);box(.27,.008,.02,basic(0x3a8fff),cx2,.85,cz2+.1,s);const pad=box(.14,.035,.08,lam(0x222222),cx2+.12,.81,cz2+.18,s);pad.rotation.y=.4}
    const mess=P().mess||0,nC=Math.floor(mess/11);let seed=11;const rnd=()=>(seed=(seed*9301+49297)%233280)/233280;
    for(let i=0;i<nC;i++){const c=C[Math.floor(rnd()*C.length)];if(!c)break;const [x,z]=c;if(IS.obst.some(o=>x>o.x1-.12&&x<o.x2+.12&&z>o.z1-.12&&z<o.z2+.12))continue;const k=i%4;
      if(k===0){const cl=box(.42,.05,.32,lam([0x2f6bb5,0xd9542b,0xf2f0ea,0x333333][i%4]),x,.03,z,s);cl.rotation.y=rnd()*3}
      else if(k===1){mesh(cyl(.11,.09,.02,12),lam(0xf4f4f0),x,.012,z,s);const f=mesh(sph(.05,8,6),lam(0xb8732a),x+.02,.03,z,s);f.scale.y=.4}
      else if(k===2){const b=mesh(cyl(.035,.035,.24,8),lam(0x3a7a2a),x,.035,z,s);b.rotation.z=Math.PI/2;b.rotation.y=rnd()*3}
      else{const a=box(.12,.06,.26,lam(0x1a1a1a),x,.03,z,s);a.rotation.y=rnd()*3;box(.12,.06,.26,lam(0x1a1a1a),x+.16,.03,z+.05,s)}}
    IS.objs.push({id:'room',label:'Room',x:0,z:0,r:9});
    if(mess>70)addBuff('messy');if(mess>70&&S.mates.length&&S['mc'+day()]!==1){S['mc'+day()]=1;const m=S.mates[0];m.friend=clamp(m.friend-2);setTimeout(()=>toast(`${m.name}: "Chale, this room is getting messy o. Let's clean small 🧹"`),400)}
  }else IS.objs.push({id:'hang',label:'Hang out',x:-.4,z:.6,r:9});
  IS.spots=Object.assign(IS.spots,{bed:Object.assign(bedPos(slots[0]),{ly:slots[0].y+.3}),desk:{x:n===1?-.6:deskX(0),z:-D/2+1.02,ry:Math.PI}});
  const placePerson=(who,slotIdx,sleeping)=>{const sl=slots[slotIdx]||slots[0],lbl=who.name+(who.mate?' · roommate':''),dk={x:n===1?-.6:deskX(Math.min(Math.max(who.bed,0),beds-1)),z:-D/2+1.02,ry:Math.PI};let q;
    const bp=bedPos(sl);if(sleeping)q=addInPerson(who.look,lbl,bp.x,bp.z,0,'lie',{n:who,lie:true,y:sl.y+.32,yaw:bp.yaw});
    else if(who===owner)q=addInPerson(who.look,lbl,-.5,.3,.4,'talk',{n:who});
    else q=addInPerson(who.look,lbl,dk.x,dk.z,Math.PI,pick(['sitWrite','type','sit']),{n:who});
    q.deskSpot=who===owner&&!mine?null:dk;q.bedSpot={x:bp.x,z:bp.z,y:sl.y+.32,yaw:bp.yaw};q.life=1;q.nightSleep=!!sleeping};
  IS.lightsOn=!(hour()>=23.5||hour()<5.5);
  const night=hour()<7||hour()>=22;
  const gst=mine?(S.guestId!=null&&S.guestHere&&S.guestUntil>S.min?npcById(S.guestId):(()=>{const b=S.npcs.find(n=>n.with>S.min&&!n.mate&&!n.hidden&&dist(n,P())<300);return b})()):null;
  if(gst){IS.guest=gst;setTimeout(()=>toast(`🛂 ${gst.name} signed the visitors' book at the porter's lodge.`),900);const gq=addInPerson(gst.look,gst.name+' · visiting',-.5,.4,.5,'talk',{n:gst});gq.life=1;gq.visitor=1;IS.objs.push({id:'hang',label:'Hang out',x:-.4,z:.6,r:9})}
  let bm=null;const hh=hour();if(mine&&tier<=1&&!night&&((hh>=5.5&&hh<9)||(hh>=18&&hh<22))&&Math.random()<.4)bm=S.mates.find(m=>homeNow(m));
  if(bm){IS.bathBusy=addInPerson(bm.look,bm.name+' · bathing',IS.spots.shower.x,IS.spots.shower.z,Math.PI/4,'shower',{n:bm,noObst:1});IS.water.visible=true}
  if(mine)S.mates.forEach(m=>{if(m!==bm&&(homeNow(m)||night))placePerson(m,m.bed,night)});else if(!owner.real)placePerson(owner,0,false);
  const p=P();if(p.mesh.parent)p.mesh.parent.remove(p.mesh);s.add(p.mesh);p.ix=-W/2+.7;p.iz=dz;p.itarget=null;if(IS.guest)IS.buddy=IS.guest;else if(!mine&&!owner.real)IS.buddy=owner;
  IS.title=mine?`Your room · ${homeB().name}`:`${owner.name}'s room · ${BID[owner.home].name}`;
  render(0,true);acts(true);setTimeout(()=>{try{mpRoomSync()}catch(e){}},50);
}
function insideB(){return IS.kind==='bld'?(BID[IS.bid]||BID[IS.exitId]||homeB()):IS.mine?homeB():BID[IS.owner.home]}
function leaveRoom(silent){if(IS)fadeIn();
  if(!IS)return;const p=P(),back=IS.back;IS.scene.remove(p.mesh);scene.add(p.mesh);
  IS.scene.traverse(o=>{if(o.geometry)o.geometry.dispose()});
  p.inCar=false;p.pose=null;p.face=null;p.lying=false;p.spotY=0;const b=insideB();p.x=b.door[0];p.y=b.door[1]+(b.door[1]>b.y?22:-22);p.target=null;p.path=null;p.itarget=null;p.ipath=null;const bdd=IS.buddy;IS=null;unstick(p);
  if(bdd&&bdd.with>S.min-1){bdd.with=Math.max(bdd.with,S.min+60);bdd.x=p.x+20;bdd.y=p.y+6;unstick(bdd);bdd.path=null;bdd.needPath=false;bdd.pose=null;bdd.hidden=false}
  if(back==='room'&&!silent){enterRoom('me');return}
  if(!silent){render(0,true);acts(true)}
}
function refreshRoom(){if(IS&&IS.mine){leaveRoom(true);enterRoom('me')}}
function interiorPush(p){IS.obst.forEach(o=>{if(p.ix>o.x1-.22&&p.ix<o.x2+.22&&p.iz>o.z1-.22&&p.iz<o.z2+.22){
  const dl=p.ix-(o.x1-.22),dr=o.x2+.22-p.ix,dt=p.iz-(o.z1-.22),db=o.z2+.22-p.iz,m=Math.min(dl,dr,dt,db);
  if(m===dl)p.ix=o.x1-.22;else if(m===dr)p.ix=o.x2+.22;else if(m===dt)p.iz=o.z1-.22;else p.iz=o.z2+.22}})}
function playFifa(){const mates=IS.people.filter(q=>q.n&&!q.lying&&!/bathing/.test(q.n.name||'')).map(q=>q.n);doAct(mates.length?`Playing FIFA with ${mates.map(n=>n.name).join(' & ')}`:'Playing FIFA',60,{fun:28,energy:-4,social:mates.length?12:0});
  if(mates.length){mates.forEach(n=>n.friend=clamp(n.friend+4));const t=S.busy;if(t){const d=t.done;t.done=()=>{d();const w=Math.random();toast(w<.45?`You beat ${mates[0].name} 3–1. Trash talk activated 😂`:w<.8?`${mates[0].name} beat you on penalties 😩 Rematch tomorrow`:'2–2 draw. Nobody is sleeping tonight 🎮')}}}}
function roomActions(){
  const p=P(),near=IS.objs.filter(o=>Math.hypot(o.x-p.ix,o.z-p.iz)<o.r),a=[];
  if(IS.mine)a.push(['🎨 Decorate & shop for your room',()=>decorate(),null,'b']);
  if(IS.mine&&!IS.guest)a.push(['📱 Invite a friend over',()=>inviteSheet()]);
  if(IS.mine&&!IS.rt.kitchen)a.push(['🍳 Go to the shared kitchen',()=>enterBuilding('hkitchen','room'),null,'b']);
  near.forEach(o=>{
    if(o.id==='bed'){a.push(['Sleep',()=>sleep()]);a.push(['Nap (2h)',()=>nap()]);if(IS.mine)a.push(['📱 Scroll on your phone in bed (30m)',()=>doAct('Scrolling in bed',30,{fun:9,energy:2,social:3})])}
    if(o.id==='ringlight')a.push(['📸 Film a TikTok (30m)',()=>filmTikTok(),null,'b']);
    if(o.id==='beanbag'){a.push(['🛋️ Chill on the beanbag (30m)',()=>doAct('Chilling on the beanbag',30,{fun:9,energy:6})]);if(p.items.includes('console')&&IS.tv)a.push(['🎮 Play FIFA on the TV (1h)',()=>playFifa()])}
    if(o.id==='fridge'){const ok=!(p.fridgeT>S.min);a.push([ok?'🥤 Grab a cold drink':'🥤 Fridge is empty, restocking',ok?()=>{p.fridgeT=S.min+180;doAct('Having a cold drink',10,{hunger:6,fun:5,energy:3})}:null])}
    if(o.id==='room'&&IS.mine){if((p.mess||0)>=30)a.push([`🧹 Clean & tidy your room (30m)${p.mess>70?' · it\'s really messy':''}`,()=>{doAct('Cleaning and tidying your room',30,{energy:-5,fun:-2});const t=S.busy;if(t){const d=t.done;t.done=()=>{d();p.mess=0;refreshRoom();toast('Room is spotless now ✨')}}},null,'b']);
      if(IS.ledL)a.push(['🌈 Change LED colour',()=>{const L=[0x8a4bff,0x2fd4ff,0xff3c9a,0x3cff8a,0xffb03c,0xffffff];const i=(L.indexOf(p.ledCol||0x8a4bff)+1)%L.length;p.ledCol=L[i];IS.ledM.color.setHex(L[i]);IS.ledL.color.setHex(L[i])}])}
    if(o.id==='desk'&&IS.mine){const m=roomMult()*(p.items.includes('lamp')?1.25:1)*(p.items.includes('shelf')?1.1:1)*(p.items.includes('gchair')?1.08:1);a.push([`Study at your desk (2h, +${Math.round(9*m)})`,()=>doAct('Studying at your desk',120,{study:Math.round(9*m),energy:-8,fun:-6})]);
      if(p.items.includes('speaker'))a.push([MUS.src&&MUS.src.kind==='room'?'🔊 Speaker: change the song':'🔊 Play music on your speaker',()=>musSongs('room')]);
      if(IS.tv)a.push(['Watch TV (1h)',()=>doAct('Watching TV',60,{fun:18})]);
      if(p.items.includes('kettle'))a.push(['☕ Make tea or Milo (10m)',()=>doAct('Sipping hot Milo',10,{hunger:6,energy:5,fun:3})]);
      if(p.items.includes('iron'))a.push(['👔 Iron your clothes (15m)',()=>{doAct('Ironing your clothes',15,{fun:-1});P().ironed=day();setTimeout(()=>toast('Sharp! You look neat today 👔✨'),1800)}]);
      if(p.items.includes('console'))a.push(['🎮 Play FIFA (1h)',()=>playFifa()]);
      if(p.items.includes('shelf'))a.push(['📖 Read a novel from your shelf (1h)',()=>doAct('Reading a novel',60,{fun:14,energy:3})])}
    if(o.id==='wardrobe'&&IS.mine)a.push(['Change clothes',()=>wardrobe()]);
    if(o.id==='bath'&&IS.mine){const bq=IS.bathBusy;
      if(bq){a.push([`Shower · ${bq.n.name} is bathing`,null]);a.push(['Knock: "Are you done?"',()=>knockBath()])}
      else{a.push([IS.waterOff?'Shower (no water today 😩)':'🚿 Take a shower (20m)',IS.waterOff?null:()=>doAct('Taking a shower',20,{hygiene:100,fun:5,energy:4}),null,'b']);if(IS.waterOff)try{rlWaterActs(a)}catch(e){}
        if(HT(p.home)==='lodge')a.push(['Bucket bath with gallon water (30m)',()=>doAct('Bucket bath with water from the gallons',30,{hygiene:90,energy:-3})])}
      if(IS.spots.tub)a.push(['🛁 Soak in the bathtub (45m)',()=>doAct('Relaxing in the bathtub',45,{hygiene:100,fun:15,energy:10})]);
      a.push(['Brush & freshen up (10m)',()=>doAct('Brushing and freshening up',10,{hygiene:20})])}
    if(o.id==='chop'){const F=[['Gari soakings with sugar & milk',28],['Bread, butter & Milo',24],['Cornflakes & Peak milk',22],['Groundnut paste on bread',26]];a.push([`🥫 Eat from your ${IS.provLbl||'food cupboard'} (${p.prov} left)`,p.prov>0?()=>{p.prov--;const f=pick(F);doAct(`Eating ${f[0].toLowerCase()}`,20,{hunger:f[1]})}:null]);
      if(p.items.includes('microwave'))a.push(['🍲 Warm up a proper meal in the microwave (15m)',p.prov>=2?()=>{p.prov-=2;doAct('Eating warmed-up jollof from the microwave',15,{hunger:40,fun:4})}:null,p.prov>=2?null:'needs 2 provision packs']);
      if(p.items.includes('kettle'))a.push(['🍜 Make noodles with the kettle (15m)',p.prov>0?()=>{p.prov--;doAct('Eating Indomie made with the kettle',15,{hunger:30,fun:3})}:null])}
    if(o.id==='tv'){a.push(['📺 Watch TV (1h)',()=>doAct('Watching TV',60,{fun:18,energy:3})]);a.push(['🎬 Movie night (2h)',()=>{const ppl=IS.people.filter(q=>q.n&&!q.lying).map(q=>q.n);doAct(ppl.length?`Watching a movie with ${ppl.map(n=>n.name).join(' & ')}`:'Watching a movie',120,{fun:32,social:ppl.length?14:0,energy:4});ppl.forEach(n=>n.friend=clamp(n.friend+4));if(ppl.includes(P().partner)){P().partner.romance=clamp(P().partner.romance+4);addBuff('loved')}}]);if(p.items.includes('console'))a.push(['🎮 Play FIFA on the TV (1h)',()=>playFifa()])}
    if(o.id==='dispenser')a.push(['💧 Get some cold water',()=>doAct('Drinking cold water from the dispenser',5,{energy:4,fun:2})]);
    if(o.id==='cooker')a.push(['🍳 Cook with the rice cooker',()=>cookSheet('cooker')]);
    if(o.id==='kitchen')a.push(['🍳 Cook in your kitchenette',()=>cookSheet('room')]);
    if(o.id==='stock')a.push([`Check stock (${p.biz.stock} ${BIZ[p.biz.type].label})`,()=>bizSheet()]);
    if(o.id==='hang'&&IS.owner&&IS.owner.real){const o2=IS.owner,bump=v=>{const f=MP.friends[o2.ck];if(f)f.lv=Math.min(100,(f.lv||20)+v)};
      a.push([`Hang out in ${o2.name}'s room (1h)`,()=>{doAct(`Hanging out in ${o2.name}'s room`,60,{social:22,fun:15});bump(6)}]);a.push(['Study together (2h)',()=>{S.groupStudy=(S.groupStudy||0)+1;doAct('Studying together',120,{study:11,energy:-8});bump(4)}])}
    else if(o.id==='hang'){const n=IS.guest||IS.owner,night=hour()>=20||hour()<4;
      if(n===p.partner&&night&&!(S.sleepover&&S.sleepover.day===day()))a.push([IS.mine?`🌙 Ask ${n.name} to stay the night`:`🌙 Ask to stay the night`,()=>sleepoverAsk(n,IS.mine),null,'b']);
      if(IS.mine&&IS.guest)a.push([`👋 Say bye to ${n.name}`,()=>byeGuest()]);a.push(['Hang out (1h)',()=>{doAct(`Hanging out in ${n.name}'s room`,60,{social:22,fun:15});n.friend=clamp(n.friend+8);memTogether(n,`${n.name}'s room`)}]);
      a.push(['Study together (2h)',()=>{S.groupStudy=(S.groupStudy||0)+1;doAct('Studying together',120,{study:11,energy:-8});n.friend=clamp(n.friend+6)}])}
    if(o.id==='door'){a.push(['Leave the room',()=>leaveRoom()]);if(IS.L)a.push([IS.lightsOn?'💡 Switch the lights off':'💡 Switch the lights on',()=>{IS.lightsOn=!IS.lightsOn;acts(true)}])}
  });
  if(IS.mine&&p.biz&&BIZ[p.biz.type].service&&p.biz.bookings>0)a.push([`Serve a client (${p.biz.bookings} booked)`,()=>serveClient()]);
  return a;
}
function knockBath(){const q=IS&&IS.bathBusy;if(!q)return;const nm=q.n.name;
  if(Math.random()<.6){IS.scene.remove(q.mesh);IS.people=IS.people.filter(x=>x!==q);IS.bathBusy=null;IS.water.visible=false;addInPerson(q.n.look,nm+' · roommate',.3,.5,.7,'talk',{n:q.n});IS.grid=null;q.n.friend=clamp(q.n.friend-1);toast(`${nm}: "Sorry sorry, I'm done! The bathroom is yours." 🧼`)}
  else toast(`${nm}: "Two minutes! I'm rinsing!" 🫧`);acts(true)}
function nearInterior(){let best=null,bd=1.1;if(!IS)return null;IS.people.forEach(q=>{if(q.sleeping)return;const d=Math.hypot(q.x-P().ix,q.z-P().iz);if(d<bd){bd=d;best=q.n}});return best}
/* decorate from your room: colours, and furniture & appliances ordered on HomeMart (delivered to your room).
   The same shop opens from the phone (Apps → HomeMart). Delivery costs a little; the Campus Mall has no delivery fee. */
const HM_FEE=15;
function decorate(tab){
  S.paused=true;openSheet();const p=P();
  const draw=(t='items',note='')=>{const row=(k,ti)=>`<div class="opt"><span class="eyebrow">${ti} · ${cedi(DECOPRICE[k])}</span><div class="chips">${Object.entries(DECO[k]).map(([id,[nm,c]])=>`<button class="pick pal" data-d="${k}|${id}" aria-pressed="${p.deco[k]===id}"><i style="background:${!c?'transparent':c==='kente'||c==='ankara'?`linear-gradient(135deg,${PAL[c].a} 50%,${PAL[c].b} 50%)`:c};${!c?'border:1px dashed var(--line)':''}"></i>${nm}</button>`).join('')}</div></div>`;
    const items=`<p style="font-size:13px;margin:0">Order on <b>HomeMart</b> and it's delivered to your room. Delivery ${cedi(HM_FEE)}. (No delivery fee if you buy at the Campus Mall.)</p>
      <div class="list">${SHOP.map(it=>`<div class="item"><div class="grow"><b>${it.name}</b><small>${it.desc}</small></div>${p.items.includes(it.id)?'<span class="tag g">In your room</span>':`<button class="btn sm" data-hm="${it.id}">${cedi(it.price+HM_FEE)}</button>`}</div>`).join('')}</div>`;
    $('sheetIn').innerHTML=`<div class="row" style="justify-content:space-between"><h3>🎨 Decorate your room</h3><span class="tag y">${cedi(p.money)}</span></div>
     <div class="tabs">${[['items','🛋️ Furniture & appliances'],['colours','🖌️ Colours']].map(([k,l])=>`<button class="pick" aria-pressed="${k===t}" data-dt="${k}">${l}</button>`).join('')}</div>${note?`<div class="say">${note}</div>`:''}
     ${t==='items'?items:row('wall','Wall colour')+row('sheet','Your bedsheet')+row('curtain','Curtains')}<button class="ghost sm" id="bye">Done</button>`;
    $('sheetIn').querySelectorAll('[data-dt]').forEach(b=>b.onclick=()=>draw(b.dataset.dt));
    $('sheetIn').querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{const [k,id]=b.dataset.d.split('|');if(p.deco[k]===id)return;if(!spend(DECOPRICE[k]))return draw(t,'Not enough money.');p.deco[k]=id;draw(t,`Updated your ${k==='sheet'?'bedsheet':k}.`)});
    $('sheetIn').querySelectorAll('[data-hm]').forEach(b=>b.onclick=()=>{const it=SHOP.find(x=>x.id===b.dataset.hm);if(!it||p.items.includes(it.id))return;if(!spend(it.price+HM_FEE))return draw(t,'Not enough money on MoMo.');p.items.push(it.id);S.decoChanged=1;try{ev('act',{l:'Decorating'})}catch(e){}afterRoomBuy(it.id)});
    $('bye').onclick=()=>{closeSheet();if(IS&&IS.kind==='room'&&IS.mine)refreshRoom()}};
  draw(tab||'items');
}
