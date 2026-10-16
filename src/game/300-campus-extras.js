/* ================= campus extras: vendors, lifeguard, bouncer, swimmers ================= */
const DECOR=[];
(function(){const add=(look,x0,y0,face,pose,when,path0,o={})=>{const q=T(x0,y0),x=q.x,y=q.y,path=path0&&(t=>{const r=path0(t);return T(r.x,r.y)});const h=makeHuman(look,{label:o.label||null,labelColor:o.color});scene.add(h.g);h.g.rotation.y=face||0;
    DECOR.push({mesh:h.g,legs:h.legs,knees:h.knees,arms:h.arms,elbows:h.elbows,head:h.head,lids:h.lids,torso:h.torso,x,y,face,pose,phase:0,id:Math.random()*9,when,path,spotY:o.spotY||0,crowd:!!o.crowd});if(!path&&!o.crowd&&!o.spotY)solidC(x,y,9)};
  const conc=()=>{const e=eventNow();return !!e&&e.id==='concert'},evOn=id=>()=>{const e=eventNow();return !!e&&e.id===id};
  Object.entries(ARTISTS).forEach(([k,a])=>add(Object.assign({},a.look),1980,440,0,'sing',()=>curArtist()===k,null,{label:'🎤 '+a.name,color:'#e8b24a',spotY:1.03}));
  add(staffLook('m',{outfit:'tee',pal:'black',extra:'headphones',hair:'fade'}),2045,402,0,'dj',conc,null,{label:'DJ Kwaku Flames',spotY:1.03});
  for(let i=0;i<16;i++){const row=Math.floor(i/6),x=1900+(i%6)*34+(row%2)*16+R(-5,5),y=532+row*36+R(-6,6);if(Math.abs(x-1980)<22&&row===0)continue;
    add(Object.assign(randomLook(Math.random()<.5?'m':'f'),{bag:'none'}),x,y,Math.PI+R(-.3,.3),pick(['cheer','dance','dance3','cheer','phone']),conc,null,{crowd:1})}
  [[1940,1000],[2020,1000],[1930,1130],[2030,1130],[1980,1060],[1885,1020]].forEach(([x,y],i)=>add(Object.assign(randomLook(i%2?'m':'f'),{bag:'none'}),x,y,R(0,6.28),pick(['talk','eat','phone','cheer']),()=>{const e=eventNow();return !!e&&e.id!=='concert'&&e.id!=='jama'},null,{crowd:1}));
  const day_=()=>hour()>=6&&hour()<19,night_=()=>hour()>=20||hour()<3;
  [[865,'f','ankara','talk'],[1025,'f','green','idle'],[1105,'m','olive','phone']].forEach(([x,g,pal,ps])=>add(staffLook(g,{hair:g==='f'?'duku':'short',outfit:g==='f'?'kaba':'tee',pal}),x,1343,0,ps,day_));
  add(staffLook('m',{outfit:'jersey',pal:'maroon',hair:'fade',extra:'cap'}),1424,1372,-Math.PI/2,'idle',day_);
  add(staffLook('m',{outfit:'tee',pal:'black',hair:'fade'}),1598,1293,Math.PI,'idle',night_);
  [0,2.6].forEach((ph,i)=>add(Object.assign(randomLook(i?'f':'m'),{bag:'none'}),1320,1375,0,'swim',()=>hour()>=7&&hour()<18,t=>({x:1320+45*Math.cos(t*.3+ph),y:1375+20*Math.sin(t*.3+ph)})));
})();

function drawScreen(a,b){const c=STAGE.c,g=c.getContext('2d'),gr=g.createLinearGradient(0,0,512,256);gr.addColorStop(0,'#3a0d4f');gr.addColorStop(1,'#0d2f4f');g.fillStyle=gr;g.fillRect(0,0,512,256);
  g.textAlign='center';g.fillStyle='#e8b24a';g.font='800 26px system-ui, sans-serif';g.fillText(b,256,78);g.fillStyle='#ffffff';g.font='900 54px system-ui, sans-serif';g.fillText(a,256,148,480);g.font='700 22px system-ui, sans-serif';g.fillStyle='#ffd6ff';g.fillText('SRC WEEK · PARADE GROUNDS',256,208);STAGE.tex.needsUpdate=true}
function updStage(){if(!STAGE.c)return;const ev=eventNow(),con=!!ev&&ev.id==='concert',slot=curSlot(),key=(con?'c'+slot:ev?ev.id:'idle')+S.sem;
  if(STAGE.key!==key){STAGE.key=key;drawScreen(con?ARTISTS[curArtist()].name:ev?ev.name:'SRC WEEK',con?['OPENING ACT','SPECIAL GUEST','HEADLINER'][slot]:ev?'HAPPENING NOW':'AKWAABA UNIVERSITY')}
  const t=performance.now()/1000,night=hour()>=18.5||hour()<6;
  STAGE.lights.forEach((o,i)=>{o.l.intensity=con?(night?2.2:.8):0;o.cone.visible=con&&night;const a=t*(1+i*.3)+i;o.cone.rotation.z=Math.sin(a)*.35;o.cone.rotation.x=Math.cos(a*.8)*.25;o.l.position.x=o.x+Math.sin(a)*1.2});
  const fw=con&&slot===2&&night;STAGE.fw.forEach((m,i)=>{if(!fw){m.visible=false;return}const grp=Math.floor(i/10),cyc=(t*.35+grp*.33)%1,ang=i*2.4,r=cyc*1.8;m.visible=cyc>.12;
    m.position.set(STAGE.sx+(grp-1)*2.2+Math.cos(ang)*r,5.2+Math.sin(ang)*r*.8-cyc*cyc*1.2,STAGE.sz+.4);m.scale.setScalar(1.4-cyc)})}
