/* ================= footwear: smooth, rounded shoes you can recolour =================
   Every shoe is built from soft shapes: a foot-shaped sole with rounded edges, a padded upper that slopes
   down to a rounded toe, rolled collars and smooth straps. No boxes. Each style has a sensible default
   colour, and look.shoeCol (any colour from SHOE_COLS) recolours the main part. */
const SHOE_COLS={'#f4f2ec':'White','#1c1c1c':'Black','#e8dcc4':'Cream','#c8a27a':'Tan','#6b4426':'Brown','#c8102e':'Red','#1f3a68':'Navy',
  '#2f7bd9':'Blue','#2fa36b':'Green','#f2c230':'Yellow','#e86a9a':'Pink','#7a4bd1':'Purple','#8d8f93':'Grey','#ff7a3d':'Orange'};
const SHOE_DEF={sneakers:'#f4f2ec',chunky:'#f6f4ee',hightops:'#c8102e',runners:'#2f7bd9',canvas:'#1c1c1c',boots:'#b5823c',crocs:'#f2c230',socks:'#1c1c1c',sandals:'#6b4426',
  ahenema:'#5a3220',slides:'#1c1c1c',loafers:'#5a3220',shoes:'#3a2214',heels:'#1c1c1c',flats:'#1c1c1c',mules:'#c8a27a'};
/* the outline of a foot seen from above: round heel, wide ball, round toe. Length along +z (toe at +z) */
function footShape(len=.25,w=.1){const s=new THREE.Shape(),h=len/2,hw=w*.42,bw=w/2,tw=w*.44;
  s.moveTo(0,-h);s.bezierCurveTo(hw*1.1,-h,hw,-h*.55,hw*.98,-h*.25);s.bezierCurveTo(bw*.98,h*.05,bw,h*.35,bw*.92,h*.55);s.bezierCurveTo(tw*.95,h*.88,tw*.5,h,0,h);
  s.bezierCurveTo(-tw*.5,h,-tw*.95,h*.88,-bw*.92,h*.55);s.bezierCurveTo(-bw,h*.35,-bw*.98,h*.05,-hw*.98,-h*.25);s.bezierCurveTo(-hw,-h*.55,-hw*1.1,-h,0,-h);return s}
/* extrude the outline upward with soft bevels; optional shaping (toe slope, heel lift) */
function shoeGeo(key,o){const k='shoe:'+key;if(GC[k])return GC[k];const sc=o.sc||1,g=new THREE.ExtrudeGeometry(footShape(.25*sc*(o.ls||1),.1*sc*(o.ws||1)),{depth:o.h,bevelEnabled:true,bevelThickness:o.bt,bevelSize:o.bs,bevelSegments:o.seg||5,curveSegments:20,steps:1});
  g.rotateX(-Math.PI/2);g.translate(0,o.y||0,0);const p=g.attributes.position,v=new THREE.Vector3();g.computeBoundingBox();const bb=g.boundingBox,z0=bb.min.z,z1=bb.max.z,y0=bb.min.y,y1=bb.max.y;
  for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);const t=(v.z-z0)/(z1-z0),up=(v.y-y0)/Math.max(1e-4,y1-y0);
    if(o.toe){const s2=smooth(o.toe[0],1,t);v.y=y0+(v.y-y0)*(1-s2*o.toe[1])}         // the upper slopes down to the toe
    if(o.lift){v.y+=o.lift*(1-smooth(.2,.62,t))}                                     // heel raised (heels)
    if(o.puff)v.x*=1+o.puff*Math.sin(Math.PI*up)*.5;
    p.setXYZ(i,v.x,v.y,v.z)}
  g.computeVertexNormals();return GC[k]=g}
const tube=(r1,r2,h,seg=20)=>new THREE.CylinderGeometry(r1,r2,h,seg,1,false);
function shoeMat(c,r=.6,o){return stdM(hexN(c),r,o)}
function buildShoe(F,L,i,skin,cloth){const S=L.shoes||'sneakers',col=L.shoeCol||SHOE_DEF[S]||'#f4f2ec',M=shoeMat(col,.55),side=i?1:-1;
  const add=(geo,m,x=0,y=0,z=0)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=false;F.add(o);return o};
  const SOLE=(h,c,sc,key)=>add(shoeGeo('sole'+key+h,{h,bt:.005,bs:.006,seg:3,sc:sc||1.02}),shoeMat(c,.75),0,-.036,.005);
  const UPPER=(key,o,m)=>add(shoeGeo('up'+key,Object.assign({bt:.022,bs:.016,seg:6,y:0},o)),m||M,0,-.03+(o.dy||0),.004);
  const footSkin=()=>{const ft=add(new THREE.SphereGeometry(.045,18,12),skin,0,-.006,.006);ft.scale.set(1.08,.5,2.3);return ft};
  const laces=(n,y,z0,c='#f4f2ec')=>{for(let k=0;k<n;k++){const l=add(new THREE.CylinderGeometry(.004,.004,.042,8),shoeMat(c,.6),0,y-k*.006,z0+k*.018);l.rotation.z=Math.PI/2}};
  switch(S){
    case 'sneakers':UPPER('snk',{h:.032,toe:[.45,.5]});SOLE(.01,'#f7f5ef',1.04,'w');laces(4,.032,-.005);add(new THREE.TorusGeometry(.036,.007,8,24),M,0,.03,-.07).rotation.x=Math.PI/2;break;
    case 'chunky':UPPER('chk',{h:.036,toe:[.5,.42],sc:1.06,puff:.1});SOLE(.022,'#fbfaf6',1.1,'c');laces(4,.04,0);add(new THREE.TorusGeometry(.04,.009,8,24),M,0,.035,-.072).rotation.x=Math.PI/2;break;
    case 'hightops':{UPPER('ht',{h:.036,toe:[.45,.5]});SOLE(.012,'#f7f5ef',1.04,'h');laces(5,.04,-.02);const sh=add(tube(.05,.054,.1,24),M,0,.07,-.03);void sh;
      add(new THREE.TorusGeometry(.05,.008,8,24),shoeMat('#f7f5ef',.6),0,.12,-.03).rotation.x=Math.PI/2;break}
    case 'runners':{UPPER('run',{h:.03,toe:[.4,.55],ls:1.02});SOLE(.016,'#ffffff',1.06,'r');laces(4,.03,-.005);const sw=add(new THREE.TorusGeometry(.05,.004,6,20,Math.PI*.8),shoeMat('#ffffff',.4),side*.05,.0,.005);sw.rotation.y=Math.PI/2;break}
    case 'canvas':UPPER('cnv',{h:.026,toe:[.5,.45]});SOLE(.012,'#f4f1ea',1.03,'cv');laces(4,.026,-.005);add(new THREE.SphereGeometry(.03,14,8,0,Math.PI*2,0,Math.PI/2),shoeMat('#f4f1ea',.7),0,-.022,.1).scale.set(1.45,.5,1);break;
    case 'boots':{UPPER('bt',{h:.04,toe:[.55,.38],sc:1.04});SOLE(.016,'#3a2a1c',1.08,'bt');add(tube(.054,.058,.12,24),M,0,.07,-.025);add(new THREE.TorusGeometry(.055,.012,8,24),shoeMat('#6b4426',.7),0,.13,-.025).rotation.x=Math.PI/2;laces(5,.06,-.02,'#e8d7a8');break}
    case 'crocs':{const u=UPPER('crc',{h:.04,toe:[.6,.25],sc:1.1,puff:.15,bt:.026,bs:.02});void u;SOLE(.012,col,1.12,'cr');const st=add(new THREE.TorusGeometry(.05,.009,8,20,Math.PI),M,0,-.005,-.06);st.rotation.y=Math.PI/2;st.rotation.z=Math.PI/2;
      for(let k=0;k<6;k++)add(new THREE.SphereGeometry(.0055,8,6),shoeMat('#222222',.8),(k%2?.022:-.022),.033-Math.floor(k/2)*.004,.02+Math.floor(k/2)*.028);break}
    case 'socks':{add(tube(.036,.035,.07,20),shoeMat('#f4f2ec',.9),0,.02,-.035);const sk=footSkin();sk.material=shoeMat('#f4f2ec',.9);SOLE(.012,col,1.06,'sl');const b=add(new THREE.TorusGeometry(.05,.015,8,24,Math.PI),M,0,-.015,.03);b.rotation.y=Math.PI/2;b.rotation.z=Math.PI/2;b.scale.set(1,1.1,.9);break}
    case 'slides':{footSkin();SOLE(.012,col,1.06,'sd');const b=add(new THREE.TorusGeometry(.05,.016,8,24,Math.PI),L.shoeCol?M:cloth,0,-.015,.03);b.rotation.y=Math.PI/2;b.rotation.z=Math.PI/2;b.scale.set(1,1.1,1);break}
    case 'sandals':{footSkin();SOLE(.012,col,1.05,'sn');[.06,-.03].forEach((z,k)=>{const b=add(new THREE.TorusGeometry(.048,.006,8,20,Math.PI),M,0,-.016,z);b.rotation.y=Math.PI/2;b.rotation.z=Math.PI/2});
      const ank=add(new THREE.TorusGeometry(.042,.005,8,20),M,0,.02,-.07);ank.rotation.x=Math.PI/2;break}
    case 'ahenema':{footSkin();SOLE(.016,col,1.04,'ah');const b=add(new THREE.TorusGeometry(.048,.012,8,24,Math.PI),shoeMat('#2b1d12',.75),0,-.012,.035);b.rotation.y=Math.PI/2;b.rotation.z=Math.PI/2;
      [-.022,0,.022].forEach(x=>add(new THREE.SphereGeometry(.006,8,6),stdM(0xd9a537,.3,{metalness:.8}),x,.034,.035));break}
    case 'loafers':UPPER('lf',{h:.026,toe:[.5,.5]});SOLE(.01,'#1a110a',1.03,'lf');{const s2=add(new THREE.TorusGeometry(.03,.004,6,16,Math.PI),stdM(0xd9a537,.3,{metalness:.7}),0,.02,.05);s2.rotation.x=-Math.PI/2}break;
    case 'shoes':UPPER('lth',{h:.03,toe:[.5,.5],ls:1.03});SOLE(.01,'#1a110a',1.04,'lt');laces(3,.03,0,'#1a110a');break;
    case 'flats':UPPER('fl',{h:.012,toe:[.4,.3],bt:.012,bs:.012});SOLE(.008,'#1a1a1a',1.02,'fl');add(new THREE.SphereGeometry(.012,10,8),M,0,.0,.075).scale.set(1.6,.5,.8);break;
    case 'heels':{UPPER('hp',{h:.016,toe:[.35,.35],lift:.034,bt:.014,bs:.012});add(shoeGeo('hsole',{h:.006,bt:.003,bs:.004,seg:3,sc:1.02,lift:.034}),shoeMat('#1a1a1a',.6),0,-.038,.005);
      add(new THREE.CylinderGeometry(.011,.016,.05,16),M,0,-.018,-.09);break}
    case 'mules':{const ft=footSkin();ft.position.y=.006;ft.rotation.x=.14;add(shoeGeo('msole',{h:.026,bt:.006,bs:.006,seg:3,sc:1.03,lift:.012}),M,0,-.04,.005);
      const st=add(new THREE.TorusGeometry(.048,.022,10,24,Math.PI),M,0,-.006,.045);st.rotation.y=Math.PI/2;st.rotation.z=Math.PI/2;st.scale.set(1,1.05,1.2);break}
    default:UPPER('snk',{h:.032,toe:[.45,.5]});SOLE(.01,'#f7f5ef',1.04,'w')}}
