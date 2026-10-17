/* ================= more Ghanaian student hairstyles =================
   Called from makeHuman() for the newer styles (the older ones are built there).
   Guys: high top fade, braided designs, two-strand twists, half-up tied locs.
   Ladies: high puff, knotless (medium), Fulani braids with gold beads, passion twists, goddess locs,
   bob braids, half up half down, curly wig. Also beards for guys. */
function hairMore(H,L,f,head,hair,gold){const capG=new THREE.SphereGeometry(.134,30,18,0,Math.PI*2,0,Math.PI*.54);
  const cap=(m,sy=1.07)=>{const c=mesh(capG,m||hair,0,.02,-.012,head);c.scale.set(.99,sy,1.03);c.rotation.x=-.52;return c};
  const fade=()=>cap(stdM(L.grey?0xa9a49b:0x2a221c,.9),1.04);
  const capOK=L.extra!=='cap';
  if(H==='hightop'){fade();if(capOK){mesh(new THREE.CylinderGeometry(.126,.128,.075,22),hair,0,.165,-.012,head);const top=mesh(bumpySphere(.126,'htop'),hair,0,.2,-.012,head);top.scale.set(1,.28,1)}}
  if(H==='mdesign'){fade();const cr=mesh(cornrowGeo(),hair,0,.02,-.012,head);cr.scale.set(1,1.1,1.06);cr.rotation.x=-.52;cr.rotation.z=.28;
    for(let i=0;i<3;i++){const z=mesh(new THREE.TorusGeometry(.13,.0035,4,24,.9),stdM(0x15100c,.9),0,.03+i*.03,-.01,head);z.rotation.set(Math.PI/2,0,1.9+i*.3)}}
  if(H==='twists2'){cap(hair,1.08);if(capOK)for(let i=0;i<46;i++){const a=i*2.399,r=.03+Math.sqrt(i/46)*.09;const t=mesh(tcap(.017,.012,.1+((i*7)%3)*.015,6),hair,Math.cos(a)*r,.16-r*.5,Math.sin(a)*r-.01,head);t.rotation.z=-Math.cos(a)*r*9;t.rotation.x=Math.sin(a)*r*9}}
  if(H==='locbun'){cap(hair,1.08);mesh(bumpySphere(.07,'locbun'),hair,0,.19,-.06,head);for(let i=0;i<14;i++){const a=Math.PI*(.2+i*.045);mesh(tcap(.02,.016,f?.3:.2,7),hair,Math.cos(a)*.122,.01,-Math.sin(a)*.11,head)}}
  if(H==='puff'){cap(hair,1.06);if(capOK){const pf=mesh(bumpySphere(.105,'puffhi'),hair,0,.2,-.07,head);pf.scale.set(1,.9,1);mesh(new THREE.TorusGeometry(.06,.01,6,16),stdM(0x1a1a1a,.6),0,.14,-.06,head).rotation.x=1.1}}
  if(H==='knotless'||H==='bobbraids'){cap(hair,1.1);const b=mesh(braidsGeo(),hair,0,0,0,head);b.scale.y=H==='bobbraids'?.42:.7}
  if(H==='fulani'){cap(hair,1.1);const cr=mesh(cornrowGeo(),hair,0,.02,-.012,head);cr.scale.set(1,1.12,1.07);cr.rotation.x=-.52;mesh(braidsGeo(),hair,0,0,0,head);
    for(let i=0;i<10;i++){const a=Math.PI*(.08+i*.09),x=Math.cos(a)*.126,z=-Math.sin(a)*.114;[.18,.3].forEach(dy=>mesh(cyl(.014,.014,.025,8),gold,x*1.05,-dy,z*1.05,head))}}
  if(H==='passion'){cap(hair,1.1);for(let i=0;i<34;i++){const a=Math.PI*(.04+i*.028),r=.13;const t=mesh(tcap(.017,.013,.36+((i*5)%4)*.03,7),hair,Math.cos(a)*r,.03,-Math.sin(a)*.118,head);t.rotation.set(.16+.12*Math.sin(i*1.7),0,-Math.cos(a)*.2+.06*Math.sin(i*2.3))}}
  if(H==='goddess'){cap(hair,1.1);for(let i=0;i<26;i++){const a=Math.PI*(.05+i*.036),x=Math.cos(a)*.128,z=-Math.sin(a)*.116;const t=mesh(tcap(.019,.015,.4,7),hair,x,.02,z,head);t.rotation.set(.14,0,-Math.cos(a)*.18);
      for(let k=1;k<4;k++)mesh(sph(.017,6,5),hair,x+Math.sin(i+k)*.012,.02-k*.1,z-.01,head)}}
  if(H==='halfup'){cap(hair,1.1);mesh(bumpySphere(.06,'hbun'),hair,0,.2,-.04,head);const b=mesh(braidsGeo(),hair,0,0,0,head);b.scale.set(1.02,.85,1.02);
    for(let i=0;i<12;i++){const a=Math.PI*(.15+i*.06);mesh(sph(.024,7,6),hair,Math.cos(a)*.13,-.2-((i*3)%4)*.03,-Math.sin(a)*.12,head)}}
  if(H==='curlywig'){const hm=hair;mesh(new THREE.CylinderGeometry(.15,.19,.4,24,1,true,Math.PI*.56,Math.PI*.88),hm,0,-.13,-.01,head);const fr=mesh(new THREE.SphereGeometry(.144,24,12,0,Math.PI*2,0,Math.PI*.32),hm,0,.03,.012,head);fr.rotation.x=.35;cap(hm,1.1);
    for(let i=0;i<22;i++){const a=Math.PI*(.05+i*.04),k=(i*7)%3;mesh(sph(.036,7,6),hm,Math.cos(a)*(.16+k*.012),-.12-k*.08,-Math.sin(a)*.15,head)}}
  /* beards for guys: a neat moustache and chin beard, or a full beard along the jaw */
  if(!f&&(L.beard==='goatee'||L.beard==='full')){const bm=stdM(0x16100c,.95);const mu=mesh(sph(.024,12,8),bm,0,-.049,.113,head);mu.scale.set(1.25,.2,.42);
    const ch=mesh(sph(.026,12,10),bm,0,-.1,.093,head);ch.scale.set(1.05,.62,.42);
    if(L.beard==='full'){const jaw=mesh(new THREE.TorusGeometry(.098,.011,6,20,Math.PI*.9),bm,0,-.045,.02,head);jaw.rotation.set(Math.PI/2+.25,0,Math.PI*1.05);jaw.scale.set(1.12,1.12,.9)}}
  if(L.extra==='studs')[-1,1].forEach(s=>mesh(sph(.009,8,6),stdM(0xe8eef2,.15,{metalness:.9}),s*.124,-.035,.005,head))}
