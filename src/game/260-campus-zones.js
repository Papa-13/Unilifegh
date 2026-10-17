/* ================= campus zones ================= */
const ZONES={f:{name:'Academic Area',col:'#9fb2a7',mini:'rgba(120,160,230,.55)',rects:[[600,330,4100,670]]},
  c:{name:'Commercial Area',col:'#c8a57e',mini:'rgba(230,150,70,.55)',rects:[[600,1000,1400,1150]]},
  p:{name:'Central Park',col:'#79a85a',mini:'rgba(140,220,140,.45)',rects:[[2000,1000,1400,1150]]},
  s:{name:'Sports Complex',col:'#5f9447',mini:'rgba(70,170,70,.55)',rects:[[3400,1000,1300,1150]]},
  r:{name:'Halls of Residence',col:'#8db368',mini:'rgba(240,210,90,.55)',rects:[[600,2150,4100,650]]},
  /* the towns around campus where most students live */
  t:{name:'Tech Junction',col:'#a8997a',mini:'rgba(200,170,120,.45)',town:1,rects:[[0,0,600,330]]},
  b:{name:'Bomso',col:'#a3956c',mini:'rgba(200,170,120,.45)',town:1,rects:[[600,0,2800,330]]},
  n:{name:'Kentinkrono',col:'#a3956c',mini:'rgba(200,170,120,.45)',town:1,rects:[[3400,0,MW-3400,330]]},
  y:{name:'Ayigya',col:'#a3956c',mini:'rgba(200,170,120,.45)',town:1,rects:[[0,330,600,2470]]},
  o:{name:'Boadi',col:'#a3956c',mini:'rgba(200,170,120,.45)',town:1,rects:[[4700,330,MW-4700,2470]]},
  g:{name:'Gyinyaase',col:'#a89170',mini:'rgba(220,160,110,.45)',town:1,rects:[[0,2800,2000,MH-2800]]},
  k:{name:'Kotei',col:'#a89170',mini:'rgba(220,160,110,.45)',town:1,rects:[[2000,2800,1400,MH-2800]]},
  a:{name:'Ayeduase',col:'#a89170',mini:'rgba(220,160,110,.45)',town:1,rects:[[3400,2800,MW-3400,MH-2800]]}};
function zoneOf(x,y){for(const k in ZONES)if(ZONES[k].rects.some(([a,b,w,h])=>x>=a&&x<a+w&&y>=b&&y<b+h))return ZONES[k].name;return 'Campus'}
(function buildZones(){
  const pat=(k)=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.fillStyle=ZONES[k].col;g.fillRect(0,0,64,64);
    if(k==='f'){g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=2;for(let i=0;i<=64;i+=32){g.beginPath();g.moveTo(i,0);g.lineTo(i,64);g.moveTo(0,i);g.lineTo(64,i);g.stroke()}}
    if(k==='c'){g.strokeStyle='rgba(90,50,20,.25)';g.lineWidth=2;for(let y=0;y<64;y+=16){g.beginPath();g.moveTo(0,y);g.lineTo(64,y);g.stroke();for(let x=(y/16%2)*16;x<64;x+=32){g.beginPath();g.moveTo(x,y);g.lineTo(x,y+16);g.stroke()}}}
    if(k==='s'||k==='r'){g.fillStyle='rgba(255,255,255,.06)';for(let y=0;y<64;y+=16)g.fillRect(0,y,64,8)}
    if(ZONES[k].town){for(let i=0;i<70;i++){g.fillStyle=`rgba(${Math.random()<.5?'90,60,30':'255,240,210'},${.05+Math.random()*.08})`;g.fillRect(Math.random()*64,Math.random()*64,1+Math.random()*3,1+Math.random()*3)}}return c};
  Object.keys(ZONES).forEach(k=>{const cv2=pat(k);ZONES[k].rects.forEach(([x,y,w,h])=>{const t=new THREE.CanvasTexture(cv2);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(w/70,h/70);
    const m=mesh(new THREE.PlaneGeometry(w*U,h*U),new THREE.MeshLambertMaterial({map:t}),wx(x+w/2),-.012,wz(y+h/2),scene);m.rotation.x=-Math.PI/2})});
  const arch=(x,y,hw,text,col)=>{[-1,1].forEach(sd=>{solidC(x+sd*(hw+9),y,7);mesh(cyl(.16,.2,4,10),lam(0xe8e2d4),wx(x+sd*(hw+9)),2,wz(y),scene);mesh(sph(.24,10,8),lam(col),wx(x+sd*(hw+9)),4.1,wz(y),scene)});
    const w=(hw*2+18)*U+.6;box(w,.5,.3,col,wx(x),3.7,wz(y),scene);[1,-1].forEach(f=>{const p=mesh(new THREE.PlaneGeometry(w-.2,.42),new THREE.MeshBasicMaterial({map:textTex(text,{w:1024,h:90,font:'900 50px system-ui, sans-serif',color:'#ffffff',stroke:false,bg:'#'+col.toString(16).padStart(6,'0')})}),wx(x),3.7,wz(y)+f*.16,scene);if(f<0)p.rotation.y=Math.PI})};
  arch(600,440,RHW,'AKWAABA UNIVERSITY · MAIN GATE',0x8e2a3a);arch(2000,440,RHW,'AKWAABA UNIVERSITY',0x8e2a3a);arch(3400,440,RHW,'AKWAABA UNIVERSITY',0x8e2a3a);
  arch(600,2890,RHW,'WELCOME TO GYINYAASE',0x7a4a2a);arch(2000,2890,RHW,'KOTEI',0x7a4a2a);arch(3400,2890,RHW,'AYEDUASE GATE',0x7a4a2a);arch(4700,2890,RHW,'AYEDUASE',0x7a4a2a);
  arch(2000,230,RHW,'BOMSO',0x7a4a2a);arch(3400,230,RHW,'KENTINKRONO',0x7a4a2a);
  const pylon=(x,y,text,col)=>{solidC(x,y,6);[-.5,.5].forEach(dx=>mesh(cyl(.05,.05,1.6,6),lam(0x666666),wx(x)+dx,.8,wz(y),scene));const p=mesh(new THREE.PlaneGeometry(1.6,.7),new THREE.MeshBasicMaterial({map:textTex(text,{w:512,h:220,font:'900 46px system-ui, sans-serif',color:'#ffffff',stroke:false,bg:'#'+col.toString(16).padStart(6,'0')}),side:THREE.DoubleSide}),wx(x),1.8,wz(y),scene)};
  pylon(460,250,'TECH JUNCTION',0x2a2a2a);pylon(1700,250,'ACCRA–KUMASI ROAD',0x2a5f3a);pylon(3900,250,'ACCRA–KUMASI ROAD',0x2a5f3a);pylon(1950,1090,'COMMERCIAL AREA',0x9b4a2e);pylon(2060,1090,'CENTRAL PARK',0x3c7a3a);pylon(3460,1090,'SPORTS COMPLEX',0x2f7a4a);pylon(660,2240,'HALLS OF RESIDENCE',0x8a5a2a);pylon(2060,2240,'HALLS OF RESIDENCE',0x8a5a2a);pylon(660,520,'ACADEMIC AREA',0x2f4e6b);
})();
(function buildLights(){const tex={},zebra=(len)=>{if(tex[len])return tex[len];const c=document.createElement('canvas');c.width=16;c.height=64;const g=c.getContext('2d');g.fillStyle='#f4f4f0';for(let y=0;y<64;y+=16)g.fillRect(0,y,16,8);
    const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1,len/32);return tex[len]=new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false})};
  const plane=(x,y,w,h,m,rot)=>{const q=mesh(new THREE.PlaneGeometry(w*U,h*U),m,wx(x),.014,wz(y),scene);q.rotation.x=-Math.PI/2;if(rot)q.rotation.z=Math.PI/2};
  const poleM=lam(0x2b2b2b),headM=lam(0x111111);
  JUNCS.forEach(J=>{
    [-1,1].forEach(sd=>{plane(J.x+sd*(J.vhw+15),J.y,13,J.hhw*2,zebra(J.hhw*2));plane(J.x,J.y+sd*(J.hhw+15),13,J.vhw*2,zebra(J.vhw*2),true)});
    J.m={EW:[0x3a1010,0x3a2a08,0x0d3a1a].map(c=>new THREE.MeshBasicMaterial({color:c})),NS:[0x3a1010,0x3a2a08,0x0d3a1a].map(c=>new THREE.MeshBasicMaterial({color:c}))};
    [[-1,-1,'EW'],[1,1,'EW'],[1,-1,'NS'],[-1,1,'NS']].forEach(([sx,sy,ax])=>{const x=J.x+sx*(J.vhw+9),y=J.y+sy*(J.hhw+9),X=wx(x),Z=wz(y);solidC(x,y,5);
      mesh(cyl(.045,.06,2.3,8),poleM,X,1.15,Z,scene);box(.17,.72,.17,headM,X,2.45,Z,scene);J.m[ax].forEach((m,k)=>mesh(sph(.1,12,10),m,X,2.68-k*.23,Z,scene))})});
})();
const TL_ON={red:0xff2a2a,amber:0xffb020,green:0x2aff6a},TL_OFF=[0x3a1010,0x3a2a08,0x0d3a1a];
function updLights(dt){TL_T+=dt;JUNCS.forEach(J=>['EW','NS'].forEach(ax=>{const st=lightState(J,ax),k=['red','amber','green'].indexOf(st);J.m[ax].forEach((m,i)=>m.color.setHex(i===k?TL_ON[st]:TL_OFF[i]))}))}
