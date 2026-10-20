/* ================= building interiors ================= */
const BLD={lt:{W:10,D:7.6,wall:0xe7e1d4,floor:1},lib:{W:10,D:7.6,wall:0xe9e0cc,floor:2},canteen:{W:9.2,D:7,wall:0xf0e2c8,floor:0},print:{W:7,D:5.6,wall:0xdfe8ee,floor:1},
  clinic:{W:7.6,D:5.6,wall:0xeef3f2,floor:1},gym:{W:9.2,D:7,wall:0xc9ced3,floor:3},salon:{W:7,D:5.6,wall:0xf3dde6,floor:1},chapel:{W:10,D:8,wall:0xf4f0e6,floor:2},mall:{W:10,D:7.6,wall:0xf2ede4,floor:1},office:{W:9.2,D:6.6,wall:0xe6efe9,floor:1},
  club:{W:10,D:7.6,wall:0x1b1724,floor:3},lecoff:{W:6.4,D:5.2,wall:0xe9e1d0,floor:2},hkitchen:{W:7.6,D:5.6,wall:0xe9e4d8,floor:1},hbath:{W:7.4,D:5,wall:0xd8e6ea,floor:1},bank:{W:9,D:6.6,wall:0xeee8dc,floor:2},unity:{W:9,D:6.6,wall:0xe4e9ef,floor:2},
  senate:{W:10,D:7.6,wall:0xeee6d2,floor:2},greathall:{W:12,D:9,wall:0xe9dfc9,floor:2},hall:{W:12,D:9,wall:0xd7dde2,floor:3},phonehub:{W:7,D:5.6,wall:0xdfe6ee,floor:1},pharm:{W:7,D:5.6,wall:0xeef5ee,floor:1},shawarma:{W:7.6,D:5.6,wall:0xf3e3c8,floor:0},books:{W:7.6,D:5.6,wall:0xefe6d6,floor:2},mosque:{W:9,D:7,wall:0xf4f1e8,floor:2}};
Object.keys(COLLEGES).forEach(c=>BLD[c]={W:10,D:7.6,wall:0xe6e1d4,floor:1});
function addInPerson(look,label,x,z,ry,pose,o={}){const h=makeHuman(look,{label,labelColor:o.color||'#f6f0e8'});h.g.position.set(x,0,z);h.g.rotation.y=ry;IS.scene.add(h.g);
  if(!o.lie&&!o.noObst)IS.obst.push({x1:x-.17,x2:x+.17,z1:z-.17,z2:z+.17});const q={n:o.n||null,mesh:h.g,legs:h.legs,knees:h.knees,arms:h.arms,elbows:h.elbows,head:h.head,lids:h.lids,torso:h.torso,pose,phase:Math.random()*6,id:Math.random()*9,x,z,sleeping:!!o.lie,lying:!!o.lie,spotY:o.y||0};IS.people.push(q);return q}
const staffLook=(g,o)=>Object.assign(randomLook(g),{bag:'none',extra:'none'},o||{});
function lectureNow(){if(S&&S.p&&P().grad)return null;const w=wd(),h=hour();return TT[w]&&TT[w].find(([c,st])=>h>=st-.5&&h<st+2)}
function enterBuilding(id,back){fadeIn();S.shuttleWait=null;const BD=IS?(IS.buddy&&IS.buddy.with>S.min?IS.buddy:null):buddy();
  if(IS)leaveRoom(true);const b=BID[id],tier=roomOf().tier,sp=id==='hbath'&&tier>=2?{W:5.4,D:4.4,wall:0xece8e0,floor:2}:BLD[id],W=sp.W,D=sp.D;
  const s=new THREE.Scene();s.background=new THREE.Color(0x14110f);
  s.add(new THREE.HemisphereLight(0xfff4e6,0x40302a,.9));const dl=new THREE.DirectionalLight(0xffffff,.4);dl.position.set(3,7,5);s.add(dl);
  IS={kind:'bld',bid:id,back,scene:s,cam:new THREE.PerspectiveCamera(42,16/10,.1,90),W,D,obst:[],objs:[],people:[],spots:{},mine:false,title:b?b.name:id==='hkitchen'?`${homeB().name} · Kitchen`:tier>=2?'Your bathroom':`${homeB().name} · Bathroom block`};
  if(id==='club'){s.children[0].intensity=.32;dl.intensity=.12}
  if(id==='lecoff'){IS.exitId=P().col;IS.title=`${(S.lecIdx||0)?BADLEC:GOODLEC}'s office`}
  const fl=mesh(new THREE.PlaneGeometry(W,D),floorMat(sp.floor),0,0,0,s);fl.rotation.x=-Math.PI/2;
  const wallM=lam(sp.wall);box(W,3,.12,wallM,0,1.5,-D/2,s);box(.12,3,D,wallM,-W/2,1.5,0,s);
  box(W,.12,.06,lam(0x3a2f28),0,.06,D/2,s);box(.06,.12,D,lam(0x3a2f28),W/2,.06,0,s);
  const winXs=['club','hbath','phonehub','pharm','shawarma','books','senate','greathall'].includes(id)?[]:COLLEGES[id]&&(lectureNow()||examNow())||id==='chapel'?[3.2]:id==='hkitchen'?[2.6]:[-1.8,2.2];winXs.forEach((x,i)=>{box(1.4,1.1,.05,lam(0x5a4a3a),x,1.9,-D/2+.07,s);const w=mesh(new THREE.PlaneGeometry(1.2,.9),basic(0x9fd3f0),x,1.9,-D/2+.1,s);if(!i)IS.win=w});
  if(!IS.win)IS.win={material:{color:new THREE.Color()}};
  const dz=D/2-.8;box(.06,2.1,1,lam(0x6b4a2e),-W/2+.08,1.05,dz,s);IS.objs.push({id:'door',x:-W/2+.55,z:dz,r:.8});
  const B_=(w,h,d,c,x,y,z,ob)=>{const m=box(w,h,d,c,x,y,z,s);if(ob)IS.obst.push({x1:x-w/2,x2:x+w/2,z1:z-d/2,z2:z+d/2});return m};
  const seats=[];const here=S.npcs.filter(n=>(!n.hidden||id==='club')&&n.plan&&n.plan.b===id&&n!==BD);
  const sign=(t,x,y,z,w=2.4,bg='#2f4e6b')=>mesh(new THREE.PlaneGeometry(w,.42),new THREE.MeshBasicMaterial({map:textTex(t,{font:'800 40px system-ui',color:'#fff',stroke:false,bg})}),x,y,z,s);
  let seatPose='sit';
  const LEC=COLLEGES[id]&&(lectureNow()||examNow()),own=id===P().col;
  if(LEC){const L=lectureNow();
    B_(4.6,1.7,.05,0xf7f7f4,0,1.75,-D/2+.08);sign(own?(examNow()?'EXAM · '+courseName(examNow()[2])+' · NO PHONES':L?courseName(L[0]):'Lecture'):(examNow()?'EXAMINATION IN PROGRESS':COLLEGES[id].short+' LECTURE'),0,2.35,-D/2+.11,4.4,'#2f4e6b');sign(BID[id].name,3.2,2.62,-D/2+.11,2.6,'#5a3e28');
    B_(.6,1.1,.5,0x6b4a2e,-3,.55,-D/2+1.2,true);
    for(let r=0;r<3;r++)for(let c=0;c<4;c++){const x=-3.3+c*2.2,z=-D/2+2.4+r*1.35;B_(1.8,.08,.45,0x8a6a4a,x,.76,z,true);B_(1.8,.06,.38,0x5a3e28,x,.46,z+.5,true);[-.45,.45].forEach(dx=>seats.push({x:x+dx,z:z+.5,ry:Math.PI}))}
    if(own&&L&&!(L[0]===1&&S.lecs[1].gone))addInPerson(S.lecs[L[0]===1?1:0].look,lecturerOf(L[0]),-2.2,-D/2+1.3,0,'talk',{color:'#cfe3ff'});else if(!own||examNow())addInPerson(staffLook(Math.random()<.5?'m':'f',{outfit:'shirt',extra:'specs',grey:true}),examNow()?'Invigilator':'Lecturer',-2.2,-D/2+1.3,0,'talk',{color:'#cfe3ff'});
    seatPose='sitWrite'}
  if(id==='mosque'){/* rows of prayer mats facing the mihrab (the arched niche) on the front wall */
    box(1.4,2.2,.12,lam(0x2f7a4a),0,1.1,-D/2+.08,s);mesh(new THREE.CylinderGeometry(.7,.7,.12,20,1,false,0,Math.PI),lam(0x2f7a4a),0,2.2,-D/2+.08,s).rotation.set(Math.PI/2,0,Math.PI/2);box(1,1.7,.02,lam(0xd9a537),0,1,-D/2+.15,s);
    for(let r=0;r<4;r++)for(let i=0;i<6;i++){const x=-3.2+i*1.28,z=-D/2+1.6+r*1.2;box(1,.02,.6,lam([0x8e2a3a,0x2f6b9b,0x2f7a4a][(r+i)%3]),x,.012,z,s);seats.push({x,z,ry:Math.PI})}
    sign('AYEDUASE CENTRAL MOSQUE',0,2.7,-D/2+.1,4,'#2f7a4a');seatPose='pray'}
  if(id==='lib'){for(let i=0;i<4;i++){const x=-3.6+i*2.3;B_(2,2.3,.45,0x6b4a2e,x,1.15,-D/2+.3,true);for(let r=0;r<4;r++)for(let k=0;k<8;k++)box(.18,.38,.3,[0x8e2a3a,0x2f6b9b,0x3c8a4a,0xd9a537,0x5a3e8a][(i+r+k)%5],x-.8+k*.23,.4+r*.55,-D/2+.42,s)}
    [-2.6,0,2.6].forEach(x=>{B_(1.8,.08,1,0x9a7a55,x,.76,.6,true);[-.45,.45].forEach(dx=>{seats.push({x:x+dx,z:1.45,ry:Math.PI});seats.push({x:x+dx,z:-.25,ry:0})})});
    B_(1.6,.95,.6,0x5a3e28,-3.3,.48,D/2-1.6,true);addInPerson(staffLook('f',{hair:'bun',extra:'specs',outfit:'kaba'}),'Librarian',-3.3,D/2-2.1,0,'type');seatPose='sitWrite'}
  if(id==='canteen'){B_(W-2.2,.95,.7,0x7a5a2a,.6,.48,-D/2+.75,true);for(let i=0;i<6;i++){mesh(cyl(.22,.2,.32,14),lam(0x9a9a9a),-2.6+i*1.05,1.12,-D/2+.75,s);mesh(cyl(.2,.2,.02,14),lam([0xd9542b,0xe8c070,0x6b3a1e,0xf0e6c8,0x3a7a2a,0xd9542b][i]),-2.6+i*1.05,1.29,-D/2+.75,s)}
    addInPerson(staffLook('f',{hair:'duku',outfit:'kaba',pal:'ankara'}),'Auntie Ama',-1.6,-D/2+.25,0,'talk');addInPerson(staffLook('f',{hair:'duku',outfit:'kaba',pal:'green'}),'Auntie Akos',1.6,-D/2+.25,0,'talk');
    sign('BUSH CANTEEN · Waakye · Banku · Kenkey',.6,2.35,-D/2+.1,5,'#7a5a2a');
    [[-2.6,.9],[0,.9],[2.6,.9],[-2.6,2.6],[0,2.6],[2.6,2.6]].forEach(([x,z])=>{B_(1.5,.08,.8,0xc9a27a,x,.76,z,true);B_(1.5,.06,.3,0x5a3e28,x,.46,z+.65,true);B_(1.5,.06,.3,0x5a3e28,x,.46,z-.65,true);[-.4,.4].forEach(dx=>{seats.push({x:x+dx,z:z+.65,ry:Math.PI});seats.push({x:x+dx,z:z-.65,ry:0})})});seatPose='sitEat'}
  if(id==='print'){B_(2.4,1,.6,0x2a6f9b,-1.6,.5,D/2-1.9,true);addInPerson(staffLook('m',{outfit:'shirt'}),'Mr. Boateng',-1.6,D/2-2.5,0,'type');
    for(let i=0;i<3;i++){const x=-1.8+i*1.8;B_(1.4,.06,.6,0xe6e1d6,x,.76,-D/2+.5,true);box(.5,.36,.05,0x111111,x,1.0,-D/2+.35,s);box(.46,.32,.01,basic(0x6fa8dc),x,1.0,-D/2+.38,s);seats.push({x,z:-D/2+1.05,ry:Math.PI})}
    B_(.8,.6,.6,0xdedede,W/2-.8,.3,-D/2+.6,true);sign('PRINT · TYPE · BIND · PHOTOCOPY',.4,2.4,-D/2+.1,4.2,'#2a6f9b');seatPose='type'}
  if(id==='clinic'){B_(1.8,1,.6,0xffffff,-1.8,.5,D/2-1.9,true);addInPerson(staffLook('f',{outfit:'dress',pal:'white',hair:'bun'}),'Nurse Efe',-1.8,D/2-2.5,0,'talk');
    [-.6,1.6].forEach((z,i)=>{B_(1,.55,2,0xf4f4f0,W/2-.9,.28,z,true);box(.06,1.8,2.2,lam(0x7fb3d5),W/2-1.55,.9,z,s);if(!i)IS.spots.bed={x:W/2-.9,z:z+.85-.85,ly:.62,ry:0}});
    IS.spots.bed.z=-.6+.85;sign('HEALTH CENTRE',0,2.4,-D/2+.1,2.6,'#b83a3a');seats.push({x:-2.6,z:0,ry:Math.PI/2},{x:-2.6,z:.8,ry:Math.PI/2});seats.forEach(q=>B_(.45,.05,.45,0x2b2b2b,q.x,.47,q.z,true))}
  if(id==='gym'){box(W-1,1.8,.04,lam(0xbfd8e8),0,1.4,-D/2+.08,s);
    for(let i=0;i<3;i++){const x=-3+i*1.4;B_(.8,.25,1.8,0x2b2b2b,x,.13,-D/2+1.3,true);box(.8,.05,.06,0x888888,x,1.1,-D/2+.45,s)}
    B_(1.6,.45,.5,0x8e2a3a,2.2,.23,.8,true);[-.6,.6].forEach(dx=>box(.06,1.1,.06,0x666666,2.2+dx,.55,.4,s));
    IS.spots.tread={x:-1.6,z:-D/2+1.4,ry:Math.PI};IS.spots.lift={x:2.2,z:1.4,ry:Math.PI};
    [[-3,-D/2+1.4,'run'],[-4.4+2.8,-D/2+1.4,'run'],[0,1.6,'lift']].forEach(([x,z,ps],i)=>{const n=here[i];if(n)addInPerson(n.look,n.name,x,z,Math.PI,ps,{n});else if(hour()>=6&&hour()<21&&Math.random()<.6)addInPerson(Object.assign(randomLook(Math.random()<.5?'m':'f'),{outfit:pick(['track','jersey','athleisure','hoodie']),bag:'none'}),'',x,z,Math.PI,ps,{noObst:1})});sign('CAMPUS GYM · NO PAIN NO GAIN',0,2.6,-D/2+.1,4,'#2b2b2b')}
  if(id==='salon'){for(let i=0;i<3;i++){const x=-2+i*2;box(.9,1.2,.04,lam(0xcfe3f0),x,1.5,-D/2+.08,s);B_(.6,.08,.6,0x222222,x,.5,-D/2+1.1,true);box(.6,.6,.08,0x222222,x,.85,-D/2+1.4,s);seats.push({x,z:-D/2+1.1,ry:Math.PI});if(i)addInPerson(staffLook(i===1?'m':'f',{outfit:i===1?'tee':'dress'}),i===1?'Barber Kobby':'Sister Abena',x+.55,-D/2+1.3,Math.PI*1.1,'talk')}
    sign('BARBER & SALON',0,2.4,-D/2+.1,2.8,'#9b3a6e')}
  if(id==='chapel'){box(.12,1.4,.08,0x8a6a4a,0,2,-D/2+.1,s);box(.7,.12,.08,0x8a6a4a,0,2.3,-D/2+.1,s);B_(2.4,.8,.8,0xf2efe8,0,.4,-D/2+1,true);
    for(let r=0;r<4;r++)[-2.2,2.2].forEach(x=>{const z=-D/2+2.6+r*1.2;B_(3,.08,.45,0x6b4a2e,x,.46,z,true);box(3,.5,.06,0x6b4a2e,x,.75,z+.24,s);[-1,0,1].forEach(dx=>seats.push({x:x+dx,z,ry:Math.PI}))});
    if(wd()===6&&hour()<12){addInPerson(staffLook('m',{outfit:'smock',pal:'kente',grey:true}),'Pastor Yaw',0,-D/2+1.6,0,'talk');[-3.6,-3,-2.4].forEach(x=>addInPerson(staffLook('f',{outfit:'dress',pal:'maroon'}),'Choir',x,-D/2+1.4,0,'dance'))}seatPose='sit'}
  if(id==='mall'){for(let i=0;i<3;i++){const x=-3+i*2.4;B_(1.8,1.6,.5,0xe6e1d6,x,.8,-D/2+.5,true);for(let r=0;r<3;r++)for(let k=0;k<6;k++)box(.22,.28,.28,[0xe8b24a,0x5aa9e6,0xe0483a,0x4fb87a][(r+k+i)%4],x-.65+k*.26,.35+r*.5,-D/2+.55,s)}
    for(let i=0;i<2;i++){const x=-2.4+i*2.8,z=1;box(1.6,.04,.04,0x888888,x,1.6,z,s);for(let k=0;k<6;k++)box(.04,.9,.5,lam(Object.values(PAL)[(k+i*3)%8].a),x-.7+k*.28,1.12,z,s)}
    B_(2,1,.7,0x9b4a2e,2.6,.5,D/2-1.8,true);addInPerson(staffLook('f',{outfit:'jeans'}),'Cashier',2.6,D/2-2.4,0,'type');IS.spots.seat={x:2.6,z:D/2-1,ry:Math.PI};sign('CAMPUS MALL',0,2.6,-D/2+.1,3,'#9b4a2e')}
  if(id==='office'){[['ELECTIONS','#3c6e58'],['BUSINESS & JOBS','#2a6f9b'],['HOUSING & FINANCE','#8e2a3a']].forEach(([t,c],i)=>{const x=-3+i*3;B_(2.2,.95,.7,0x7a5a3a,x,.48,-D/2+1.2,true);sign(t,x,2.3,-D/2+.1,2.6,c);addInPerson(staffLook(i%2?'f':'m',{outfit:i%2?'kaba':'shirt',extra:'specs'}),['Mr. Mensah','Ms. Darko','Mrs. Asante'][i],x,-D/2+.6,0,'type');B_(.45,.05,.45,0x2b2b2b,x,.47,-D/2+2.1,true);seats.push({x,z:-D/2+2.1,ry:Math.PI})})}
  /* ---- interiors for the registry, Great Hall, sports hall and the little shops ---- */
  if(id==='senate'){B_(W-2.6,1.05,.6,0x5a3e28,.5,.53,-D/2+1.2,true);box(W-2.6,.9,.03,new THREE.MeshLambertMaterial({color:0xcfe8f0,transparent:true,opacity:.35}),.5,1.5,-D/2+1.2,s);
    [['ADMISSIONS',-2.4,'#2f4e6b'],['REGISTRATION',.5,'#8e2a3a'],['TRANSCRIPTS',3.1,'#3c6e58']].forEach(([t,x,c],i)=>{sign(t,x,2.25,-D/2+.1,2.2,c);addInPerson(staffLook(i%2?'m':'f',{outfit:i%2?'shirt':'kaba',extra:'specs'}),['Mrs. Owusu','Mr. Tetteh','Ms. Badu'][i],x,-D/2+.6,0,'type')});
    sign('ADMINISTRATION & REGISTRY · ACADEMIC AFFAIRS',.5,2.75,-D/2+.1,5.4,'#2f4e6b');
    box(.05,1.2,1.8,0x8a6a4a,-W/2+.1,1.5,0,s);for(let i=0;i<6;i++)box(.02,.28,.22,[0xf4f1ea,0xe8b24a,0xf4f1ea,0x9fd3f0,0xf4f1ea,0xf3c6c6][i],-W/2+.14,1.25+(i%2)*.4,-.6+Math.floor(i/2)*.55,s);
    [[-1,0xce1126],[0,0xfcd116],[1,0x006b3f]].forEach(([k,c])=>box(.42,.14,.02,c,W/2-1.1,2.3-k*.14,-D/2+.1,s));box(.06,.06,.03,0x111111,W/2-1.1,2.3,-D/2+.11,s);
    for(let r=0;r<2;r++)for(let i=0;i<5;i++){const x=-2.4+i*1.2,z=.9+r*1.3;B_(.48,.05,.45,0x2b2b2b,x,.47,z,true);box(.48,.45,.05,0x2b2b2b,x,.72,z+.22,s);seats.push({x,z,ry:Math.PI})}
    seatPose='sit';IS.spots.seat=seats[0]}
  if(id==='greathall'){B_(6.4,.5,2.2,0x6b3a2a,0,.25,-D/2+1.2,true);box(7,2.6,.08,lam(0x7a1f2b),0,1.8,-D/2+.12,s);for(let i=0;i<8;i++)box(.06,2.6,.1,lam(0x5e1520),-3.3+i*.95,1.8,-D/2+.16,s);
    B_(.6,1.1,.45,0x4a3220,.9,1.05,-D/2+1.3,true);box(.03,.3,.03,0x222222,.9,1.75,-D/2+1.2,s);sign('GREAT HALL · PUBLIC LECTURE SERIES',0,3.25,-D/2+.1,5.6,'#8e2a3a');
    if(hour()>=9&&hour()<20)addInPerson(staffLook(Math.random()<.5?'m':'f',{outfit:'smock',pal:'kente',extra:'specs',grey:true}),'Guest Speaker',.9,-D/2+1.75,0,'talk',{color:'#ffd27a'});
    for(let r=0;r<4;r++)for(let i=0;i<8;i++){const x=-4.2+i*1.2,z=-.4+r*1.2;if(Math.abs(x)<.5)continue;B_(.5,.05,.45,0x8e2a3a,x,.47,z,true);box(.5,.5,.05,0x8e2a3a,x,.75,z+.22,s);seats.push({x,z,ry:Math.PI})}
    seatPose='sit';IS.spots.seat=seats[seats.length-3]}
  if(id==='hall'){const line=(w,d,x,z)=>{const m=mesh(new THREE.PlaneGeometry(w,d),basic(0xf4f1ea),x,.013,z,s);m.rotation.x=-Math.PI/2};
    const cm=mesh(new THREE.PlaneGeometry(7.2,3.8),lam(0xd9893a),-.6,.011,-.6,s);cm.rotation.x=-Math.PI/2;line(7.2,.05,-.6,-2.5);line(7.2,.05,-.6,1.3);line(.05,3.8,-4.2,-.6);line(.05,3.8,3,-.6);line(.05,3.8,-.6,-.6);
    [-2.5,1.3].forEach(z=>mesh(cyl(.04,.04,2.4,8),lam(0x666666),-.6,1.2,z,s));box(.02,.7,3.8,new THREE.MeshLambertMaterial({color:0xffffff,transparent:true,opacity:.45}),-.6,2,-.6,s);box(.03,.06,3.8,0xffffff,-.6,2.35,-.6,s);
    for(let r=0;r<3;r++){B_(W-1,.35,.6,0x8a8f96,0,.18+r*.35,D/2-1.9+r*.6,true);for(let i=0;i<8;i++)seats.push({x:-4.2+i*1.2,z:D/2-1.9+r*.6,ry:Math.PI,ly:.36+r*.35})}
    const ball=mesh(sph(.12,14,10),lam(0xf4f1ea),-1.8,1.6,-.4,s);let bt=0;IS.tick=dt=>{bt+=dt;ball.position.x=-.6+Math.sin(bt*1.6)*2.2;ball.position.y=1.2+Math.abs(Math.sin(bt*3.2))*1.4};
    [[-3,-1.6],[-2,.4],[1.2,-1.4],[2.2,.5]].forEach(([x,z],i)=>addInPerson(staffLook(i%2?'f':'m',{outfit:'jersey',pal:i<2?'ankara':'denim'}),i<2?'Team Gold':'Team Blue',x,z,i<2?Math.PI/2:-Math.PI/2,'celebrate'));
    sign('SPORTS HALL · INTER-COLLEGE VOLLEYBALL',0,3,-D/2+.1,5.6,'#2b6f8e');seatPose='sit';IS.spots.seat=seats[4]}
  if(id==='phonehub'){B_(3.4,.95,.6,0x2a2a2a,0,.48,-D/2+1.6,true);box(3.4,.04,.62,new THREE.MeshLambertMaterial({color:0xbfe3f0,transparent:true,opacity:.5}),0,.98,-D/2+1.6,s);
    for(let r=0;r<3;r++)for(let k=0;k<7;k++){box(.18,.34,.03,0x111111,-1.8+k*.6,1.3+r*.5,-D/2+.1,s);box(.15,.28,.01,basic([0x6fa8dc,0xe8b24a,0x9fe0b0,0xf3a6c8][(r+k)%4]),-1.8+k*.6,1.3+r*.5,-D/2+.12,s)}
    box(.5,.03,.35,0x222222,1.2,1.0,-D/2+1.6,s);const lid=box(.5,.32,.02,0x222222,1.2,1.16,-D/2+1.45,s);lid.rotation.x=-.25;
    addInPerson(staffLook('m',{outfit:'tee',pal:'black',extra:'specs'}),'Kwame · Technician',.4,-D/2+.95,0,'type');sign('PHONE & LAPTOP HUB · REPAIRS · DATA',0,2.75,-D/2+.1,4.4,'#2a2a2a');
    [[-2.4,1],[-1.7,1]].forEach(([x,z])=>{B_(.45,.05,.45,0x9b4a2e,x,.47,z,true);seats.push({x,z,ry:Math.PI})});seatPose='phone';IS.spots.seat=seats[0]}
  if(id==='pharm'){for(let i=0;i<3;i++){const x=-2.2+i*2.2;B_(1.9,2.1,.4,0xf4f4f0,x,1.05,-D/2+.25,true);for(let r=0;r<4;r++)for(let k=0;k<7;k++)box(.2,.22,.2,[0x2f9e5a,0xe8eef4,0xd9542b,0x3b78c2,0xf4c430][(i+r+k)%5],x-.75+k*.25,.4+r*.5,-D/2+.35,s)}
    B_(3.2,1,.6,0xffffff,0,.5,.1,true);box(3.2,.05,.62,0x2f9e5a,0,1.02,.1,s);addInPerson(staffLook('f',{outfit:'dress',pal:'white',hair:'bun',extra:'specs'}),'Pharmacist Esi',0,-.45,0,'talk');
    const cr=new THREE.Group();cr.position.set(W/2-1,2.4,-D/2+.1);s.add(cr);box(.5,.16,.02,basic(0x2fd36a),0,0,0,cr);box(.16,.5,.02,basic(0x2fd36a),0,0,0,cr);sign('CAMPUS PHARMACY',-.6,2.55,-D/2+.1,3,'#2f9e5a');
    [[-2.6,1.6],[-1.9,1.6]].forEach(([x,z])=>{B_(.45,.05,.45,0x2b2b2b,x,.47,z,true);seats.push({x,z,ry:Math.PI})});seatPose='sit';IS.spots.seat=seats[0]}
  if(id==='shawarma'){B_(W-2.4,1,.7,0x8a4a1e,.4,.5,-D/2+1.1,true);box(W-2.4,.05,.72,0x2a2a2a,.4,1.02,-D/2+1.1,s);
    const cone=mesh(cyl(.16,.22,.7,14),lam(0xa8642a),-1.8,1.45,-D/2+.55,s);mesh(cyl(.02,.02,1,6),lam(0x888888),-1.8,1.45,-D/2+.55,s);box(.5,.8,.1,lam(0xd9542b),-1.8,1.45,-D/2+.25,s);IS.tick=dt=>{cone.rotation.y+=dt*1.2};
    addInPerson(staffLook('m',{outfit:'tee',pal:'white',hair:'fade'}),'Chef Musah',-1,-D/2+.55,0,'talk');sign('🌯 SHAWARMA · PIZZA · CHICKEN & CHIPS',.4,2.6,-D/2+.1,5,'#8a4a1e');
    [[-1.6,1.3],[1.6,1.3]].forEach(([x,z])=>{mesh(cyl(.45,.45,.05,18),lam(0xe8e1d4),x,.76,z,s);mesh(cyl(.05,.05,.74,8),lam(0x444444),x,.37,z,s);IS.obst.push({x1:x-.45,x2:x+.45,z1:z-.45,z2:z+.45});[[-.7,0,Math.PI/2],[.7,0,-Math.PI/2]].forEach(([dx,dz,ry])=>{B_(.4,.05,.4,0xd9542b,x+dx,.47,z+dz,true);seats.push({x:x+dx,z:z+dz,ry})})});
    seatPose='sit';IS.spots.seat=seats[0]}
  if(id==='books'){for(let i=0;i<3;i++){const x=-2.4+i*2.1;B_(1.9,2.3,.4,0x6b4a2e,x,1.15,-D/2+.25,true);for(let r=0;r<4;r++)for(let k=0;k<8;k++)box(.18,.36,.28,[0x8e2a3a,0x2f6b9b,0x3c8a4a,0xd9a537,0x5a3e8a][(i+r+k)%5],x-.75+k*.21,.4+r*.55,-D/2+.35,s)}
    B_(1.6,.95,.6,0x5a3e28,W/2-1.3,.48,D/2-1.9,true);addInPerson(staffLook('m',{outfit:'shirt',extra:'specs',grey:true}),'Mr. Addo · Bookseller',W/2-1.3,D/2-2.45,0,'type');
    B_(2.2,.08,.9,0x9a7a55,-1,.76,1,true);[-1.6,-.4].forEach(x=>{seats.push({x,z:1.75,ry:Math.PI});seats.push({x,z:.25,ry:0})});sign('CAMPUS BOOKSHOP · PAST QUESTIONS · NOVELS',-.6,2.75,-D/2+.1,5,'#5a3e28');seatPose='sitWrite';IS.spots.seat=seats[0]}
  if(COLLEGES[id]&&!LEC){const C=COLLEGES[id];
    for(let r=0;r<2;r++)for(let k2=0;k2<3;k2++){const x=-3+k2*2.6,z=-.5+r*2;B_(1.9,.08,.9,0x9a7a55,x,.76,z,true);[-.5,.5].forEach(dx=>{seats.push({x:x+dx,z:z+.75,ry:Math.PI});seats.push({x:x+dx,z:z-.75,ry:0})})}
    C.progs.slice(0,3).forEach(([pn],i)=>{const x=-3.2+i*2.6;box(.9,2,.06,0x6b4a2e,x,1,-D/2+.08,s);sign(pn.length>24?pn.slice(0,22)+'…':pn,x,2.18,-D/2+.1,2.4,'#5a3e28')});
    sign(C.name,.4,2.72,-D/2+.1,6.2,'#2f4e6b');B_(1.6,.95,.6,0x5a3e28,W/2-1.3,.48,D/2-1.9,true);addInPerson(staffLook('f',{outfit:'kaba',extra:'specs'}),'College Secretary',W/2-1.3,D/2-2.45,0,'type');seatPose='sitWrite'}
  if(id==='bank'||id==='unity'){const col=id==='bank'?'#2f6b3a':'#1f4f8b';
    B_(W-2.2,1.05,.6,0x5a3e28,.5,.53,-D/2+1.1,true);box(W-2.2,.9,.03,new THREE.MeshLambertMaterial({color:0xcfe8f0,transparent:true,opacity:.35}),.5,1.5,-D/2+1.1,s);
    [[-1.6,'f','kaba'],[.6,'m','shirt'],[2.8,'f','jeans']].forEach(([x,g,o])=>addInPerson(staffLook(g,{outfit:o,pal:o==='shirt'?'white':'denim'}),'Teller',x,-D/2+.55,0,'type'));
    for(let i=0;i<5;i++){mesh(cyl(.035,.04,.9,8),lam(0xc9a537),-1.6+i*.9,.45,.3,s);if(i<4)box(.9,.04,.04,0x8e2a3a,-1.15+i*.9,.82,.3,s)}IS.obst.push({x1:-1.7,x2:2.1,z1:.25,z2:.35});
    [0,.9].forEach(dz=>{B_(.55,1.5,.5,0x2b2b2b,-W/2+.4,.75,.2+dz,true);box(.04,.3,.36,basic(0x6fa8dc),-W/2+.66,1.15,.2+dz,s)});
    [[W/2-.9,1.0],[W/2-.9,1.8],[W/2-.9,2.6]].forEach(([x,z])=>seats.push({x,z,ry:-Math.PI/2}));
    sign(id==='bank'?'AKWAABA SAVINGS BANK':'UNITY BANK',.5,2.5,-D/2+.1,4,col);IS.spots.seat=seats[0];seatPose='sit'}
  if(id==='lecoff'){const li=S.lecIdx||0,L=S.lecs[li];
    B_(1.9,.08,.85,0x5a3e28,0,.76,-.75,true);[-.85,.85].forEach(dx=>box(.08,.74,.75,0x4a3220,dx,.37,-.75,s));box(.5,.3,.03,0x111111,-.4,.95,-.95,s);box(.46,.26,.01,basic(0x6fa8dc),-.4,.95,-.935,s);for(let i=0;i<4;i++)box(.3,.04,.22,[0xf4f1ea,0xe8b24a,0x2f6b9b,0xf4f1ea][i],.45,.82+i*.04,-.7,s);
    box(.5,.05,.5,0x2b2b2b,0,.47,-1.45,s);box(.5,.6,.06,0x2b2b2b,0,.8,-1.72,s);addInPerson(L.look,li?BADLEC:GOODLEC,0,-1.45,0,'sitTalk',{color:'#cfe3ff'});
    B_(1.5,2.2,.4,0x6b4a2e,-2.2,1.1,-D/2+.25,true);for(let r=0;r<4;r++)for(let k=0;k<6;k++)box(.18,.36,.28,[0x8e2a3a,0x2f6b9b,0x3c8a4a,0xd9a537,0x5a3e8a][(r+k)%5],-2.65+k*.2,.4+r*.52,-D/2+.32,s);
    B_(.6,1.2,.5,0x9aa3ab,2.4,.6,-D/2+.3,true);[[-.6,1.9],[.6,1.9]].forEach(([x,y])=>{box(.55,.42,.03,0x5a3e28,x+.9,y,-D/2+.08,s);box(.47,.34,.01,0xf4f1ea,x+.9,y,-D/2+.1,s)});
    sign(li?'Dr. K. Ofori-Kuma · Dept. Office':'Prof. A. Sarpong · Head of Dept.',.9,2.5,-D/2+.1,3.4,'#2f4e6b');
    [[-.45,.15],[.45,.15]].forEach(([x,z])=>seats.push({x,z,ry:Math.PI}));IS.spots.seat=seats[0];seatPose='sitTalk'}
  if(id==='club'){
    const tiles=[];for(let i=0;i<5;i++)for(let j=0;j<3;j++){const t=mesh(new THREE.PlaneGeometry(.92,.92),new THREE.MeshBasicMaterial({color:0x330044}),-1.0+i*.95,.012,-.45+j*.95,s);t.rotation.x=-Math.PI/2;tiles.push(t)}
    B_(2.2,1.05,.7,0x111018,.9,.53,-D/2+1.1,true);box(2.24,.05,.74,0x7a2ea0,.9,1.07,-D/2+1.1,s);[.4,1.4].forEach(x=>mesh(cyl(.18,.18,.03,16),lam(0x222222),x,1.1,-D/2+1.1,s));
    [-.7,2.5].forEach(x=>{B_(.6,1.6,.5,0x0b0b0e,x,.8,-D/2+.6,true);[.5,1.1].forEach(y=>mesh(cyl(.17,.17,.03,14),lam(0x333333),x,y,-D/2+.86,s).rotation.x=Math.PI/2)});
    addInPerson(staffLook('m',{outfit:'tee',pal:'black',extra:'headphones',hair:'fade'}),'🎧 DJ Kwaku Flames',.9,-D/2+.5,0,'dj',{color:'#d9a6ff'});
    const neon=mesh(new THREE.PlaneGeometry(3,.5),new THREE.MeshBasicMaterial({map:textTex('CLUB VIBES',{font:'900 52px system-ui',color:'#ffd6ff',stroke:false,bg:'#5a1d6e'})}),.9,2.45,-D/2+.1,s);
    B_(.6,1.05,3.2,0x2a1f18,-W/2+1.3,.53,0,true);box(.66,.05,3.24,0xd9a537,-W/2+1.3,1.07,0,s);
    [1.36,1.76].forEach(y=>box(.14,.04,3.2,0x5a3e28,-W/2+.16,y,0,s));for(let i=0;i<12;i++)mesh(cyl(.035,.04,.26,8),lam([0x3a7a2a,0x8e2a3a,0xd9a537,0x2f6b9b][i%4]),-W/2+.16,1.51+(i%2)*.4,-1.45+i*.26,s);
    addInPerson(staffLook('f',{outfit:'bodycon',pal:'black',hair:'wig'}),'Bartender',-W/2+.62,.3,Math.PI/2,'talk');
    const bar=[-1.1,-.3,.5,1.3].map(z=>{B_(.36,.06,.36,0x7a2ea0,-W/2+1.95,.62,z,true);mesh(cyl(.03,.03,.6,6),lam(0x888888),-W/2+1.95,.3,z,s);return{x:-W/2+1.95,z,ry:-Math.PI/2,ly:.16}});
    const lounge=[];[-1.2,1.3].forEach(z=>{B_(.7,.42,1.7,0x5a1d6e,W/2-.8,.21,z,true);box(.25,.55,1.7,0x5a1d6e,W/2-.35,.62,z,s);B_(.55,.35,.8,0x111111,W/2-1.7,.18,z,true);[-.45,.45].forEach(dz=>lounge.push({x:W/2-.85,z:z+dz,ry:-Math.PI/2,ly:-.04}))});
    IS.spots.dance={x:.45,z:.5,ry:0};IS.spots.bar=bar[1];IS.spots.lounge=lounge[0];
    const pls=[0xff3cac,0x3cd4ff,0xb44cff].map(c=>{const l=new THREE.PointLight(c,1.4,9,1.5);l.position.set(0,2.6,0);s.add(l);return l});
    const crowd=here.slice(0,8).map(n=>({look:n.look,name:n.name,n}));while(crowd.length<(wd()>=3&&wd()<=5?8:5))crowd.push({look:randomLook(Math.random()<.5?'m':'f'),name:null});
    crowd.forEach((c,i)=>{const x=-.8+(i%4)*.85+R(-.12,.12),z=(i<4?-.35:1.3)+R(-.1,.1);addInPerson(c.look,c.name,x,z,(i<4?0:Math.PI)+R(-.7,.7),pick(['dance','dance2','dance3','dance2']),{n:c.n})});
    lounge.slice(2).forEach(q=>{if(Math.random()<.6)addInPerson(randomLook(Math.random()<.5?'m':'f'),null,q.x,q.z,q.ry,pick(['sitDrink','sit']),{noObst:1,y:q.ly})});
    let tt=0;IS.tick=dt=>{tt+=dt;tiles.forEach((t,i)=>{const v=(Math.sin(tt*3+i*1.7)+1)/2;t.material.color.setHSL((i*.13+tt*.08)%1,.9,.12+.32*v)});pls.forEach((l,i)=>{const a=tt*(.8+i*.3)+i*2.1;l.position.set(.9+Math.cos(a)*2.6,2.6,.3+Math.sin(a)*1.8)})}}
  if(id==='hkitchen'){
    B_(6.2,.9,.62,0xd9d2c4,-.3,.45,-D/2+.38,true);box(6.24,.05,.66,0x8a8378,-.3,.92,-D/2+.38,s);
    const st=[-2.4,-.7,1.0];st.forEach(x=>{box(.62,.04,.46,0x222222,x,.96,-D/2+.38,s);[-.15,.15].forEach(dx=>{const r=mesh(new THREE.TorusGeometry(.08,.012,6,16),lam(0x555555),x+dx,.985,-D/2+.38,s);r.rotation.x=Math.PI/2});mesh(cyl(.12,.1,.16,14),lam(0x9a9a9a),x-.15,1.06,-D/2+.38,s);mesh(cyl(.17,.17,.4,10),lam(0x2f6bb5),x+.3,.2,-D/2+.85,s)});
    box(.5,.08,.4,0xbfc7cc,2.4,.95,-D/2+.38,s);mesh(cyl(.015,.015,.3,6),lam(0xaaaaaa),2.4,1.1,-D/2+.2,s);
    box(5,.04,.3,0x8a6a4a,-.3,1.6,-D/2+.2,s);for(let i=0;i<12;i++)mesh(cyl(.05,.05,.14,8),lam([0xe0483a,0xe8b24a,0x2f7a4a,0xf4f1ea][i%4]),-2.6+i*.42,1.7,-D/2+.2,s);
    sign('KITCHEN · CLEAN AFTER YOURSELF 🙏',-.3,2.35,-D/2+.1,4.2,'#3c6e58');
    B_(2.2,.08,.9,0xc9a27a,.6,.76,1.0,true);B_(2.2,.06,.3,0x5a3e28,.6,.46,1.7,true);B_(2.2,.06,.3,0x5a3e28,.6,.46,.3,true);[-.9,.9].forEach(dx=>box(.08,.72,.7,0x8a6a4a,.6+dx,.36,1.0,s));
    IS.spots.stove={x:-.7,z:-D/2+1.02,ry:Math.PI};IS.spots.seat={x:.3,z:1.7,ry:Math.PI};
    const cooks=S.npcs.filter(n=>n.home===P().home&&homeNow(n)&&hour()>=6&&hour()<22).slice(0,2);
    cooks.forEach((n,i)=>addInPerson(n.look,n.name,[-2.4,1.0][i],-D/2+1.02,Math.PI,'cook',{n}));
    const puffs=[];st.forEach((x,i)=>{if(i===1||cooks[i>1?1:0])for(let k=0;k<3;k++){const m=mesh(sph(.06,8,6),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.35,depthWrite:false}),x-.15,1.2,-D/2+.38,s);puffs.push({m,x:x-.15,o:k/3})}});
    let tt=0;IS.tick=dt=>{tt+=dt;puffs.forEach(q=>{const f=(tt*.45+q.o)%1;q.m.position.y=1.16+f*.75;q.m.position.x=q.x+Math.sin(f*6+q.o*5)*.05;q.m.material.opacity=.4*(1-f);q.m.scale.setScalar(1+f*1.6)})}}
  if(id==='hbath'){const lodge=HT(P().home)==='lodge',priv=tier>=2;IS.waterOff=['lodge','sunrise'].includes(HT(P().home))&&S.waterOffDay===day();
    const water=new THREE.Group(),wm=new THREE.MeshBasicMaterial({color:0xd6f3ff,transparent:true,opacity:.55});for(let i=0;i<8;i++)mesh(cyl(.006,.006,1.9,4),wm,R(-.13,.13),1.05,R(-.13,.13),water);water.visible=false;s.add(water);IS.water=water;
    const curtM=new THREE.MeshStandardMaterial({color:priv?0xdfeef2:0x7fb3d5,transparent:true,opacity:priv?.8:.9,roughness:.6,side:THREE.DoubleSide});
    if(!priv){box(W,1.5,.04,0xbfe0ea,0,.75,-D/2+.08,s);
      [-2.3,-.7,.9].forEach((x,i)=>{[-.78,.78].forEach(dx=>box(.06,2,1.3,0xe8e8e8,x+dx,1,-D/2+.65,s));mesh(cyl(.07,.05,.05,10),lam(0xaaaaaa),x,2.05,-D/2+.35,s);
        const c=mesh(new THREE.PlaneGeometry(1.45,1.15),curtM,x,1.0,-D/2+1.3,s);box(1.5,.03,.03,0x999999,x,1.6,-D/2+1.3,s);mesh(cyl(.17,.14,.3,12),lam([0x2f6bb5,0xe0483a,0x2f7a4a][i]),x+.45,.15,-D/2+.4,s)});
      IS.obst.push({x1:-3.15,x2:1.75,z1:-D/2,z2:-D/2+1.32});IS.spots.shower={x:-.7,z:-D/2+.66,ry:0};IS.spots.bucket={x:.9,z:-D/2+.66,ry:0};water.position.set(-.7,0,-D/2+.66);
      [2.4,3.05].forEach(x=>{B_(.5,.85,.45,0xf4f4f0,x,.43,-D/2+.3,true);box(.45,.55,.03,0xcfe3f0,x,1.5,-D/2+.1,s)});IS.spots.sink={x:2.7,z:-D/2+.95,ry:Math.PI};
      if(lodge){mesh(cyl(.45,.45,1.2,18),lam(0x1d1d1d),W/2-.9,.6,1.0,s);IS.obst.push({x1:W/2-1.4,x2:W/2-.4,z1:.5,z2:1.5});mesh(cyl(.2,.17,.35,12),lam(0x2f6bb5),W/2-1.7,.18,1.0,s)}
      sign(IS.waterOff?'NO WATER TODAY 😩 USE THE POLY TANK':lodge?'BATHROOM · KEEP IT CLEAN':'BATHROOM BLOCK',-.6,2.3,-D/2+.1,IS.waterOff?4.6:3.2,IS.waterOff?'#b83a3a':'#2a6f9b');
      const m=S.npcs.find(n=>n.home===P().home&&n.gender===P().look.gender&&homeNow(n));if(m&&Math.random()<.6)addInPerson(m.look,m.name,3.05,-D/2+.95,Math.PI,'brush',{n:m})}
    else{box(W,2.2,.04,0xf2f0ea,0,1.1,-D/2+.08,s);
      box(.05,2,1.2,0xdfeef2,-1.0,1,-D/2+.6,s);const gl=mesh(new THREE.PlaneGeometry(1.15,1.1),curtM,-1.6,1.0,-D/2+1.2,s);mesh(cyl(.09,.06,.04,12),lam(0xbbbbbb),-1.6,2.05,-D/2+.3,s);
      IS.obst.push({x1:-W/2,x2:-.95,z1:-D/2,z2:-D/2+1.22});IS.spots.shower={x:-1.6,z:-D/2+.62,ry:0};water.position.set(-1.6,0,-D/2+.62);
      B_(.42,.42,.58,0xffffff,.1,.21,-D/2+.42,true);box(.42,.4,.16,0xffffff,.1,.6,-D/2+.15,s);
      B_(.9,.85,.5,0x7a5536,1.25,.43,-D/2+.3,true);box(.4,.06,.32,0xffffff,1.25,.88,-D/2+.3,s);box(.7,.8,.03,0xcfe3f0,1.25,1.55,-D/2+.1,s);IS.spots.sink={x:1.25,z:-D/2+.95,ry:Math.PI};
      if(HT(P().home)==='royal'){const tx=W/2-.7,tz=.55;box(.8,.1,1.8,0xffffff,tx,.05,tz,s);[-.36,.36].forEach(dx=>box(.08,.55,1.8,0xffffff,tx+dx,.28,tz,s));[-.86,.86].forEach(dz=>box(.8,.55,.08,0xffffff,tx,.28,tz+dz,s));
        const tw=mesh(new THREE.PlaneGeometry(.64,1.64),new THREE.MeshLambertMaterial({color:0x9fdcf0,transparent:true,opacity:.55,depthWrite:false}),tx,.4,tz,s);tw.rotation.x=-Math.PI/2;IS.obst.push({x1:tx-.42,x2:tx+.42,z1:tz-.92,z2:tz+.92});IS.spots.tub={x:tx,z:tz+.8,ly:.24}}}
    IS.tick=()=>{if(water.visible)water.children.forEach((c,i)=>c.position.y=1.05-((performance.now()/250+i*.37)%1)*.12)}}
  // students inside take seats
  if(seats.length){IS.spots.seat=IS.spots.seat||seats.slice().sort((a,c)=>Math.hypot(a.x-.3,a.z-D*.05)-Math.hypot(c.x-.3,c.z-D*.05))[0];
    const free=seats.filter(q=>q!==IS.spots.seat).sort((a,c)=>Math.hypot(a.x-IS.spots.seat.x,a.z-IS.spots.seat.z)-Math.hypot(c.x-IS.spots.seat.x,c.z-IS.spots.seat.z));
    if(BD&&id!=='gym'&&free.length){const q=free.shift();IS.buddy=BD;addInPerson(BD.look,BD.name+' · with you',q.x,q.z,q.ry,seatPose,{n:BD,y:q.ly})}
    if(id!=='gym')here.slice(0,free.length).forEach((n,i)=>{const q=free[i];addInPerson(n.look,n.name,q.x,q.z,q.ry,id==='chapel'&&wd()===6&&hour()<12?pick(['sit','pray','cheer']):seatPose,{n,y:q.ly})});
    /* busy places feel busy: a few other students (no name tags) in the library, canteen, food spots and colleges during the day */
    {const h=hour(),busy={lib:[8,22,5],canteen:[7,20,5],shawarma:[11,23,3],books:[9,18,2],print:[8,19,2]}[id]||(COLLEGES[id]&&!LEC?[8,18,3]:null);
      if(busy&&h>=busy[0]&&h<busy[1]){const rest=free.slice(here.length).sort(()=>Math.random()-.5).slice(0,busy[2]+Math.floor(Math.random()*2));
        rest.forEach(q=>addInPerson(randomLook(Math.random()<.5?'m':'f'),'',q.x,q.z,q.ry,id==='lib'||COLLEGES[id]?pick(['sitWrite','sitWrite','phone','type']):seatPose,{y:q.ly,noObst:1}))}}
    seats.forEach(q=>{if(['mosque','clinic','salon','office','senate','greathall','hall','phonehub','pharm','shawarma'].includes(id))return;if(id==='lecoff'){B_(.45,.05,.45,0x8e2a3a,q.x,.47,q.z,true);box(.45,.45,.05,0x8e2a3a,q.x,.72,q.z+.22,s);return}if(!LEC&&id!=='chapel'&&id!=='canteen')B_(.42,.05,.42,0x2b2b2b,q.x,.47,q.z,true)})}
  if(BD&&!IS.buddy&&id!=='hbath'){IS.buddy=BD;addInPerson(BD.look,BD.name+' · with you',-W/2+1.4,dz-.35,.7,'talk',{n:BD})}
  if(id==='lecoff'){const li=S.lecIdx||0;if(li===1&&S.flags.hx===1&&!S.flags.resolved&&!IS.buddy)setTimeout(()=>story(`<div class="eyebrow">${BADLEC}'s office</div><h3>He looks up slowly.</h3><p class="scene">"Ah, you came alone. Have you thought about what I said?" You don't sit down. You say you just came to ask about the course, and you walk out.</p><p>Next time, bring a friend with you. You can report him confidentially at Student Affairs & SRC.</p>`,[['Leave','',()=>leaveRoom()]]),500);
    else if(IS.buddy)setTimeout(()=>toast(`With ${IS.buddy.name} beside you, ${li?BADLEC:GOODLEC} keeps the meeting professional and helpful.`),400)}
  const p=P();if(p.mesh.parent)p.mesh.parent.remove(p.mesh);s.add(p.mesh);p.ix=-W/2+.75;p.iz=dz;p.itarget=null;
  render(0,true);acts(true);
}
