/* ================= roadside billboards (advertising) =================
   Big double-sided boards on steel legs beside the road at Tech Junction (main gate), the trotro
   station, Akwaaba Square and the sports field & pool. The ad art is AD_IMG (a data: image, set in
   012-ad-art.js); until it's set the boards show an "Advertise here" placeholder.
   Each board finds its own free spot next to the nearest road so it never blocks a road, door or path. */
const BB_SITES=['terminal','trotro','square','pool'];
const BB_SPOTS=[];
function bbPlaceholder(){const c=document.createElement('canvas');c.width=1024;c.height=512;const g=c.getContext('2d');
  const gr=g.createLinearGradient(0,0,1024,512);gr.addColorStop(0,'#14110d');gr.addColorStop(1,'#3b2a12');g.fillStyle=gr;g.fillRect(0,0,1024,512);
  ['#ce1126','#fcd116','#006b3f'].forEach((col,i)=>{g.fillStyle=col;g.fillRect(0,440+i*24,1024,24)});
  g.fillStyle='#e8b24a';g.font='900 98px system-ui,sans-serif';g.textAlign='center';g.fillText('YOUR BRAND HERE',512,200);
  g.fillStyle='#f6f0e8';g.font='600 46px system-ui,sans-serif';g.fillText('Advertise on Unilife GH',512,290);g.font='500 30px system-ui,sans-serif';g.fillStyle='rgba(246,240,232,.7)';g.fillText('Thousands of students see this board every day',512,350);
  return new THREE.CanvasTexture(c)}
function bbTexture(cb){const src=typeof AD_IMG==='string'&&AD_IMG?AD_IMG:null;if(!src){cb(bbPlaceholder());return}
  const im=new Image();im.onload=()=>{const t=new THREE.Texture(im);t.needsUpdate=true;t.anisotropy=4;cb(t)};im.onerror=()=>cb(bbPlaceholder());im.src=src}
(function billboards(){
  const onRd=(x,y,m)=>ROADS.some(([rx,ry,w,h])=>x>rx-m&&x<rx+w+m&&y>ry-m&&y<ry+h+m);
  const inBd=(x,y,m)=>B.some(b=>x>b.x-m&&x<b.x+b.w+m&&y>b.y-m&&y<b.y+b.h+m||Math.hypot(b.door[0]-x,b.door[1]-y)<m+60);
  const nearJ=(x,y)=>typeof JUNCS!=='undefined'&&JUNCS.some(J=>Math.hypot(J.x-x,J.y-y)<RHW+90);
  /* nearest point on any road edge */
  const roadNear=(x,y)=>{let best=null;ROADS.forEach(([rx,ry,w,h])=>{const px=Math.max(rx,Math.min(rx+w,x)),py=Math.max(ry,Math.min(ry+h,y)),d=Math.hypot(px-x,py-y);if(!best||d<best.d)best={d,px,py}});return best};
  const HALF=2.3/U;/* half the panel width in map units */
  BB_SITES.forEach(id=>{const b=BID[id];if(!b)return;let best=null;
    for(let m=40;m<=200;m+=20)for(let t=0;t<64;t++){const a=t/64*Math.PI*2,cx=b.x+b.w/2,cy=b.y+b.h/2,x=cx+Math.cos(a)*(b.w/2+m),y=cy+Math.sin(a)*(b.h/2+m);
      const rn=roadNear(x,y);if(!rn||rn.d<34||rn.d>120)continue;
      /* the panel runs along the road: check both legs and the middle */
      const nx=(rn.px-x)/rn.d,ny=(rn.py-y)/rn.d,tx=-ny,ty=nx,pts=[[x,y],[x+tx*HALF*.8,y+ty*HALF*.8],[x-tx*HALF*.8,y-ty*HALF*.8]];
      if(pts.some(([px,py])=>onRd(px,py,14)||inBd(px,py,8)||solidAt(px,py,16)||nearJ(px,py)))continue;
      if(BB_SPOTS.some(q=>Math.hypot(q.x-x,q.y-y)<250))continue;
      const sc=rn.d+Math.hypot(b.door[0]-x,b.door[1]-y)*.35;if(!best||sc<best.sc)best={sc,x,y,nx,ny,tx,ty,id}}
    if(best)BB_SPOTS.push(best)});
  const steel=lam(0x6f747a),dark=lam(0x23262a),frame=lam(0x1b1d20),boards=[];
  BB_SPOTS.forEach(s=>{const g=new THREE.Group();g.position.set(wx(s.x),0,wz(s.y));g.rotation.y=Math.atan2(s.nx,s.ny);scene.add(g);
    /* two legs, a catwalk, the frame and the ad on both faces, plus two lamps that come on at night */
    [-1.5,1.5].forEach(dx=>{mesh(cyl(.13,.16,3.2,10),steel,dx,1.6,0,g);mesh(cyl(.32,.4,.25,10),lam(0x9a958c),dx,.12,0,g);SOLIDS.push({t:0,x:s.x+s.tx*dx/U,y:s.y+s.ty*dx/U,r:9})});
    box(4.9,.08,.55,dark,0,3.12,-.1,g);box(4.86,2.46,.18,frame,0,4.35,0,g);
    const lamps=[];[-1.4,1.4].forEach(dx=>{box(.05,.05,.6,dark,dx,5.62,.3,g);const l=box(.32,.1,.16,0xfff3c4,dx,5.6,.6,g);lamps.push(l)});
    const mk=side=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(4.6,2.3),new THREE.MeshBasicMaterial({color:0xdddddd}));m.position.set(0,4.35,side*.1);if(side<0)m.rotation.y=Math.PI;g.add(m);return m};
    boards.push(mk(1),mk(-1));g.userData.bb=s.id});
  bbTexture(t=>boards.forEach(m=>{m.material.map=t;m.material.color.set(0xffffff);m.material.needsUpdate=true}));
  window.bbRefresh=()=>bbTexture(t=>boards.forEach(m=>{m.material.map=t;m.material.needsUpdate=true}));
})();
