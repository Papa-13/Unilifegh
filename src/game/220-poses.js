/* ================= poses & animation ================= */
function posePerson(c,moving,dt){
  const t=performance.now()/1000+(c.id||0)*1.7,g=c.mesh;
  let pose=moving&&c.pose!=='dive'&&c.pose!=='climb'?(c.pose==='swim'?'swim':(c.pose==='run'||c.fast)?'run':'walk'):(c.pose||'idle');
  if(!moving&&(pose==='run'||pose==='walk'))c.phase+=dt*(pose==='run'?14:9);
  let L=[0,0],K=[0,0],A=[0,0],Az=[0,0],E=[-.12,-.12],y=0,rz=0,hx=null,lean=0;const sw=Math.sin(c.phase),amp=moving?clamp((c._v||1.7)/2.6,.75,1.15):1;
  switch(pose){
    case 'idle':{const q=Math.sin(t*.8);L=[q*.03,-q*.03];A=[.03+Math.sin(t*1.1)*.03,.03-Math.sin(t*1.1)*.03];Az=[.07,-.07];E=[-.14,-.14];rz=q*.012;break}
    case 'walk':L=[sw*.5*amp,-sw*.5*amp];K=[Math.max(0,sw)*.75,Math.max(0,-sw)*.75];A=[-sw*.5*amp,sw*.5*amp];Az=[.06,-.06];E=[-.3,-.3];y=Math.abs(sw)*.025;rz=sw*.02;break;
    case 'run':L=[sw*.95,-sw*.95];K=[Math.max(0,sw)*1.3+.2,Math.max(0,-sw)*1.3+.2];A=[-sw,sw];Az=[.1,-.1];E=[-1.5,-1.5];y=Math.abs(sw)*.09;break;
    case 'sit':case 'sitWrite':case 'sitEat':case 'type':case 'sitDrink':case 'sitTalk':L=[-1.5,-1.5];K=[1.5,1.5];y=-.34;A=[-.35,-.35];E=[-.7,-.7];
      if(pose==='sitWrite'){A=[-.55,-.7];E=[-1,-1.1+Math.sin(t*9)*.08]}
      if(pose==='type'){A=[-.6,-.6];E=[-.95+Math.sin(t*12)*.06,-.95+Math.cos(t*11)*.06]}
      if(pose==='sitEat'){const k=(Math.sin(t*2.2)+1)/2;A=[-.5,-.45-.5*k];E=[-.9,-1.2-.9*k]}
      if(pose==='sitTalk'){A=[-.4+Math.sin(t*3)*.22,-.55+Math.sin(t*2.3+1)*.3];Az=[.1,-.1-Math.sin(t*2.6)*.1];E=[-.9+Math.sin(t*3.3)*.2,-1.1+Math.sin(t*2.1)*.3];rz=Math.sin(t*1.3)*.012}
      if(pose==='sitDrink'){const k=(Math.sin(t*1.4)+1)/2;A=[-.35,-.5-.45*k];E=[-.7,-1.7-.7*k]}break;
    case 'eat':{const k=(Math.sin(t*2.2)+1)/2;A=[-.5,-.45-.5*k];E=[-1.1,-1.2-.9*k];break}
    case 'drink':{const k=(Math.sin(t*1.4)+1)/2;A=[0,-.5-.45*k];E=[-.1,-1.7-.7*k];break}
    case 'phone':A=[-.2,-.7];E=[-.3,-1.5];rz=Math.sin(t*.7)*.01;break;
    case 'talk':A=[-.35+Math.sin(t*3)*.25,-.5+Math.sin(t*2.3+1)*.35];Az=[.1+Math.sin(t*2)*.1,-.12-Math.sin(t*2.6)*.12];E=[-.8+Math.sin(t*3.3)*.2,-1+Math.sin(t*2.1)*.3];rz=Math.sin(t*1.3)*.015;break;
    case 'pray':A=[-1,-1];Az=[.32,-.32];E=[-1.25,-1.25];break;
    case 'dance':A=[-2.6+Math.sin(t*5)*.5,-2.6+Math.sin(t*5+3)*.5];E=[-.5,-.5];L=[Math.sin(t*5)*.2,-Math.sin(t*5)*.2];K=[.25,.25];y=Math.abs(Math.sin(t*5))*.08;rz=Math.sin(t*2.5)*.05;break;
    case 'dance2':{const q=Math.sin(t*4.2);L=[q*.35,-q*.35];K=[.3+Math.max(0,q)*.45,.3+Math.max(0,-q)*.45];A=[-.6+q*.35,-.6-q*.35];Az=[.25,-.25];E=[-1.4,-1.4];y=-.04+Math.abs(q)*.04;rz=q*.06;break}
    case 'dance3':{const q=Math.sin(t*3);A=[-2.8,-2.8];Az=[.2+q*.3,-.2+q*.3];E=[-.25,-.25];K=[.25+Math.abs(q)*.2,.25+Math.abs(q)*.2];L=[-.1,-.1];y=-.04+Math.abs(Math.sin(t*6))*.05;rz=q*.08;break}
    case 'cheer':A=[-2.8,-2.8+Math.sin(t*6)*.3];E=[-.3,-.3];y=Math.abs(Math.sin(t*6))*.05;break;
    case 'kick':{const k=Math.max(0,Math.sin(t*3));L=[-k*1.2,Math.sin(t*6)*.1];K=[k*.25,.1];A=[k*.6,-k*.6];E=[-.4,-.4];break}
    case 'dribble':A=[-.2,-.6+Math.sin(t*9)*.25];E=[-.4,-.6];L=[.15,-.15];K=[.35,.35];y=-.05;break;
    case 'lift':{const k=(Math.sin(t*2.5)+1)/2;A=[-1.4-k*1.6,-1.4-k*1.6];E=[-(1-k)*1.7,-(1-k)*1.7];break}
    case 'swim':{const q=t*4.5;A=[-(q%6.2832),-((q+3.1416)%6.2832)];Az=[.15,-.15];E=[-.15,-.15];L=[Math.sin(t*9)*.28,-Math.sin(t*9)*.28];K=[.12,.12];hx=-.9;break}
    case 'shower':A=[-2.5+Math.sin(t*3)*.25,-2.35+Math.cos(t*3.3)*.25];Az=[.25,-.25];E=[-1.7,-1.6];hx=-.25;rz=Math.sin(t*1.5)*.02;break;
    case 'brush':A=[-.15,-1.15];E=[-.2,-1.9+Math.sin(t*14)*.12];hx=.1;break;
    case 'cook':A=[-.55,-.85];Az=[.05,-.12+Math.sin(t*4)*.15];E=[-1.1,-.9+Math.sin(t*4)*.18];hx=.35;rz=Math.sin(t*2)*.015;break;
    case 'sing':{const q=Math.sin(t*4);A=[-2.1+Math.sin(t*3)*.6,-.95];Az=[.35,-.1];E=[-.4,-2.05];L=[q*.15,-q*.15];K=[.15,.15];y=Math.abs(q)*.05;rz=Math.sin(t*2)*.05;hx=-.08;break}
    case 'pull':A=[-1.3,-1.35];E=[-.25,-.25];L=[-.55,.35];K=[.55,.25];lean=-.32;y=-.04;break;
    case 'hop':{const q=Math.abs(Math.sin(t*5));A=[-.4,-.4];E=[-1.3,-1.3];K=[.2+q*.3,.2+q*.3];y=q*.22;break}
    case 'sweep':{const q=Math.sin(t*5);lean=.2;A=[-.95+q*.35,-.7+q*.35];Az=[-.15,.15];E=[-.35,-.5];hx=.25;K=[.25,.25];break}
    case 'dive':A=[-3.05,-3.05];Az=[.12,-.12];E=[0,0];L=[.05,.05];K=[0,0];break;
    case 'climb':{const q=Math.sin(t*6);A=[-2.3+q*.35,-2.3-q*.35];E=[-.6,-.6];L=[-.9-q*.5,-.9+q*.5];K=[1.1,1.1];break}
    case 'dj':A=[-.75,-.6+Math.sin(t*6)*.15];E=[-1.05,-1.2];hx=Math.sin(t*8)*.15+.15;y=Math.abs(Math.sin(t*4))*.02;break;
  }
  let hy=null;const now=performance.now()/1000;
  if(c.gest&&now>c.gest.end){c.gest=null}
  if(!c.gest&&!moving&&dt&&(pose==='talk'||pose==='sitTalk')&&Math.random()<dt*.22)setGest(c,pick(['nod','nod','laugh','shrug','point','explain','think']),R(1.4,2.4));
  if(!c.gest&&!moving&&dt&&pose==='idle'&&Math.random()<dt*.05)setGest(c,pick(['scratch','stretch','checkwatch','pockets','lookaround']),R(1.6,2.6));
  if(c.gest&&!c.lying&&pose!=='swim'){const G=c.gest,u=now-G.t0,q=Math.sin(u*10),fade=Math.min(1,u*4,(G.end-now)*4);
    switch(G.k){
      case 'wave':A[1]=-2.65;Az[1]=-.25+q*.32;E[1]=-.35;break;
      case 'nod':hx=Math.sin(u*9)*.2+.05;break;
      case 'no':hy=Math.sin(u*9)*.38;break;
      case 'laugh':A=[-.45,-.45];Az=[-.05,.05];E=[-1.5,-1.5];hx=-.28+Math.sin(u*16)*.06;y+=Math.abs(Math.sin(u*12))*.02;lean=-.06;break;
      case 'shrug':A=[-.15,-.15];Az=[.5,-.5];E=[-1.55,-1.55];rz=.06;hx=.05;break;
      case 'handshake':A[0]=-1.05;Az[0]=-.1;E[0]=-.35+Math.sin(u*11)*.12;break;
      case 'dap':{const k=u<.5?u*2:1;A[0]=-1.1-(u>.7?.5:0);E[0]=-.4-(u>.7?1:0);Az[0]=-.1;if(u>.7&&u<.85)hx=.08;break}
      case 'hug':A=[-1.45,-1.45];Az=[-.42,.42];E=[-1.15,-1.15];hy=.25;lean=.06;break;
      case 'facepalm':A[0]=-1.5;Az[0]=-.32;E[0]=-2.25;hx=.32;break;
      case 'point':A[1]=-1.5;Az[1]=-.05;E[1]=-.08;break;
      case 'explain':A=[-.75+Math.sin(u*5)*.15,-.85+Math.sin(u*4+1)*.2];Az=[.15,-.15];E=[-1.1,-1.25+Math.sin(u*6)*.2];break;
      case 'clap':A=[-1.15,-1.15];Az=[-.32+Math.abs(Math.sin(u*13))*.22,.32-Math.abs(Math.sin(u*13))*.22];E=[-.95,-.95];break;
      case 'think':A=[-.45,-.95];Az=[-.2,.05];E=[-1.45,-2.35];hx=-.12;hy=.15;break;
      case 'cross':A=[-.55,-.55];Az=[-.5,.5];E=[-1.95,-1.95];break;
      case 'checkwatch':A[0]=-.95;Az[0]=-.35;E[0]=-1.45;hx=.32;hy=-.2;break;
      case 'scratch':A[1]=-2.4;Az[1]=-.4;E[1]=-2+Math.sin(u*14)*.12;hx=.1;break;
      case 'stretch':A=[-2.9,-2.9];Az=[.12,-.12];E=[-.15,-.15];hx=-.25;y+=.02;break;
      case 'pockets':A=[.12,.12];Az=[.1,-.1];E=[-.35,-.35];rz=.03;break;
      case 'lookaround':hy=Math.sin(u*1.6)*.75;break;
      case 'celebrate':A[1]=-2.9+Math.sin(u*12)*.25;Az[1]=-.1;E[1]=-.2;A[0]=-.6;E[0]=-1.3;y+=Math.abs(Math.sin(u*6))*.05;break;
      case 'bow':lean=.35*fade;A=[.1,.1];hx=.25;break;
      case 'sad':hx=.32;A=[.05,.05];E=[-.2,-.2];lean=.04;break;
      case 'cheer':A=[-2.8,-2.8+Math.sin(u*6)*.3];E=[-.3,-.3];y+=Math.abs(Math.sin(u*6))*.05;break;
      case 'dance':{const w=Math.sin(u*5);A=[-1+w*.6,-1-w*.6];E=[-1.2,-1.2];L=[w*.25,-w*.25];K=[.25+Math.max(0,w)*.3,.25+Math.max(0,-w)*.3];y+=-.03+Math.abs(w)*.04;rz=w*.06;break}
      case 'phonecall':A[1]=-.55;Az[1]=-.4;E[1]=-2.35;hy=.15;break;
      case 'kiss':lean=.1;hx=.1;break;
      case 'hungry':A=[-.55,-.5];Az=[-.15,.15];E=[-1.35,-1.3];hx=.35;lean=.12;break;
      case 'yawn':A[1]=-1.25;E[1]=-2.3;Az[1]=-.1;hx=-.35;A[0]=-.15;break;
      case 'sniff':A[0]=-1.6;Az[0]=.9;E[0]=-1.4;hy=-.6;hx=.2;break;
      case 'strike':{const k=Math.sin(Math.min(1,u/.35)*Math.PI);L[1]=.5-k*1.7;K[1]=.6*(1-k);A=[-.5*k,.6*k];Az=[.35,-.35];lean=-.08*k;break}
      case 'save':{const sd=G.side||1;A=[-2.7,-2.7];Az=[.4*sd,.4*sd];E=[-.2,-.2];rz=-.55*sd*Math.min(1,u*4);y+=-.1;K=[.4,.4];break}
      case 'shoot':{const k=Math.sin(Math.min(1,u/.6)*Math.PI);A=[-2.75,-2.55];E=[-1.4+k*1.2,-.6+k*.4];Az=[.05,-.05];y+=k*.32;K=[.5*(1-k),.5*(1-k)];break}
      case 'guard':A=[-.9,-.9];Az=[.9,-.9];E=[-.3,-.3];K=[.45,.45];y-=.06;break;
      case 'dribbleArm':{A[1]=-.35;Az[1]=-.12;E[1]=-.8+Math.abs(Math.sin(u*7.5))*.45;break}
      case 'ready':K=[.35,.35];A=[-.25,-.25];E=[-.6,-.6];Az=[.15,-.15];y-=.04;lean=.12;break;
      case 'keeper':K=[.55,.55];L=[-.2,-.2];A=[-.55,-.55];Az=[.55,-.55];E=[-.5,-.5];y-=.08;lean=.15;break;
      case 'shake':rz=Math.sin(u*22)*.06;hy=Math.sin(u*18)*.3;A=[-.2,-.2];Az=[.35+Math.sin(u*20)*.15,-.35-Math.sin(u*20)*.15];break;
    }}
  const pv=c._pv||(c._pv={L:[0,0],K:[0,0],A:[0,0],Az:[0,0],E:[-.12,-.12],y:0,rz:0});
  const k=(!dt||pose==='swim'||pose==='dive')?1:Math.min(1,dt*(moving?18:8)),lp=(a,b)=>{a[0]+=(b[0]-a[0])*k;a[1]+=(b[1]-a[1])*k};
  lp(pv.L,L);lp(pv.K,K);lp(pv.A,A);lp(pv.Az,Az);lp(pv.E,E);pv.y+=(y-pv.y)*k;pv.rz+=(rz-pv.rz)*k;
  if(c.legs){c.legs[0].rotation.x=pv.L[0];c.legs[1].rotation.x=pv.L[1]}
  if(c.knees){c.knees[0].rotation.x=pv.K[0];c.knees[1].rotation.x=pv.K[1]}
  c.arms[0].rotation.x=pv.A[0];c.arms[1].rotation.x=pv.A[1];c.arms[0].rotation.z=pv.Az[0];c.arms[1].rotation.z=pv.Az[1];
  if(c.elbows){c.elbows[0].rotation.x=pv.E[0];c.elbows[1].rotation.x=pv.E[1]}
  if(c.lying){g.rotation.x=-Math.PI/2;g.rotation.y=0;g.rotation.z=0;g.position.y=c.spotY||0}
  else if(pose==='dive'){g.rotation.x=c.diveRot||0;g.rotation.z=0;g.position.y=c.diveY||0}
  else if(pose==='swim'){g.rotation.x=1.55;g.rotation.z=0;g.position.y=.06+Math.sin(t*9)*.012}
  else{g.rotation.x=lean;g.rotation.z=pv.rz;g.position.y=pv.y+(c.spotY||0)}
  const tt=performance.now()/1000,cid=c.id||0;
  if(c.lids){const bt=(tt*.8+cid*1.3)%4.2;const cl=c.lying||bt<.13||(c.expr&&c.expr.e==='sleep');c.lids.forEach(l=>l.rotation.x=cl?.95:-.55)}
  if(c.head){const hy0=c.lookY!=null?c.lookY:(pose==='idle'||pose==='phone'||pose==='sit')?Math.sin(tt*.35+cid)*.25:0;const hyT=hy!=null?hy:hy0;c.head.rotation.y+=(hyT-c.head.rotation.y)*(dt?Math.min(1,dt*7):1);c.head.rotation.x=hx!=null?hx:pose==='phone'?.35:(pose==='sitWrite'||pose==='type')?.22:c.lying?0:Math.sin(tt*.5+cid)*.03}
  if(c.torso)c.torso.scale.y=1+Math.sin(tt*1.7+cid)*.01;
  faceExpr(c,pose,tt,dt);if(g.userData.ring){const rg=g.userData.ring;rg.visible=!(pose==='swim'||pose==='dive'||c.lying);rg.rotation.x=-Math.PI/2-g.rotation.x;rg.rotation.y=-g.rotation.z;rg.position.y=.03-(g.position.y-(c.spotY||0))}
  setProp(c,c.gest&&c.gest.k==='phonecall'?'phone':pose,t);
}
const EXPR_OF={hungry:'sad',yawn:'surprised',sniff:'frown',laugh:'laugh',facepalm:'frown',sad:'sad',cross:'frown',no:'frown',celebrate:'laugh',cheer:'laugh',dance:'smile',hug:'smile',dap:'smile',handshake:'smile',wave:'smile',clap:'smile',think:'think',shrug:'meh',kiss:'smile'};
function setGest(c,k,dur=2.2,expr){if(!c)return;const now=performance.now()/1000;c.gest={k,t0:now,end:now+dur};const e=expr||EXPR_OF[k];if(e)setExpr(c,e,dur+.6)}
function setExpr(c,e,dur=3){if(!c)return;c.expr={e,end:performance.now()/1000+dur}}
function faceExpr(c,pose,tt,dt){const F=c.mesh&&c.mesh.userData.face;if(!F)return;
  if(c.expr&&tt>c.expr.end)c.expr=null;
  let e=c.expr?c.expr.e:null;
  if(!e){if(['dance','dance2','dance3','cheer','sing','hop'].includes(pose))e=pose==='sing'?'sing':'smile';else if(pose==='talk'||pose==='sitTalk')e='talk';else if(c.lying)e='sleep';else if(c.mood!=null)e=c.mood<35?'sad':c.mood>70?'content':null}
  const talk=e==='talk'||e==='sing'?Math.max(0,Math.sin(tt*11+(c.id||0))*Math.sin(tt*4.3)):0;
  let open=0,smile=0,frown=0,brow=0,browIn=0;
  if(e==='smile'||e==='content'){smile=e==='smile'?1:.6}
  if(e==='laugh'){smile=1;open=.55+Math.abs(Math.sin(tt*14))*.35;brow=.004}
  if(e==='talk'){open=talk*.55;smile=.25}
  if(e==='sing'){open=.4+talk*.5;brow=.005}
  if(e==='frown'){frown=1;browIn=.22;brow=-.003}
  if(e==='sad'){frown=.7;browIn=-.25;brow=.002}
  if(e==='surprised'){open=.85;brow=.009}
  if(e==='think'){browIn=.12;brow=.002}
  if(e==='meh'){brow=.006;frown=.3}
  F.mo.scale.y=.1+open*.95;F.mo.position.y=-.067-open*.008;F.mo.visible=open>.04;F.teeth.visible=open>.3&&smile>.4;
  F.ul.position.y=-.06+open*.004+smile*.001;F.ll.position.y=-.073-open*.02+smile*.002;F.ll.position.z=.109-open*.003;
  F.smA.visible=false;F.frA.visible=false;F.mline.visible=open<.04;
  F.ul.scale.x=1.55+smile*.28;F.ll.scale.x=1.4+smile*.3-frown*.1;
  if(F.corners)F.corners.forEach(c=>{const s=c.userData.s;c.position.x=s*(.031+smile*.007);c.position.y=-.066+smile*.009-frown*.009;c.scale.setScalar(1+smile*.25)});
  if(F.cheeks)F.cheeks.forEach(c=>{c.visible=smile>.3;c.position.y=-.037+smile*.006;c.position.z=.084+smile*.006;c.scale.set(.6+smile*.35,.45+smile*.3,.45+smile*.2)});
  F.brows.forEach(b=>{const s=b.userData.s;b.position.y=.018+brow*1.6-(browIn>0?browIn*.012:0);b.rotation.z=s*browIn*1.4})}
function setProp(c,pose,t){
  c._props=c._props||{};const want={drink:'bottle',sitDrink:'bottle',phone:'phone',kick:'ball',dribble:'bball',lift:'bar',sitEat:'plate',eat:'plate',brush:'brush',cook:'spoon',sing:'mic',sweep:'broom'}[pose]||null;
  for(const k in c._props)c._props[k].visible=k===want;
  if(!want)return;let pr=c._props[want];
  if(!pr){
    if(want==='bottle'){pr=new THREE.Group();mesh(cyl(.03,.032,.17,10),lam(0x3a7a2a),0,0,0,pr);mesh(cyl(.012,.02,.05,8),lam(0xd9a537),0,.1,0,pr);pr.position.set(0,-.36,.06);c.elbows[1].add(pr)}
    else if(want==='mic'){pr=new THREE.Group();mesh(cyl(.014,.011,.15,8),cm('#111111'),0,0,0,pr);mesh(sph(.028,10,8),cm('#9a9a9a'),0,.09,0,pr);pr.position.set(0,-.33,.06);pr.rotation.x=-.9;c.elbows[1].add(pr)}
    else if(want==='broom'){pr=new THREE.Group();mesh(cyl(.015,.015,.95,6),cm('#8a6a4a'),0,-.2,0,pr);const hd=box(.06,.2,.05,cm('#d9b56a'),0,-.7,0,pr);pr.position.set(0,-.3,.06);pr.rotation.x=-.3;c.elbows[1].add(pr)}
    else if(want==='brush'){pr=box(.014,.17,.014,cm('#e8f2ff'),0,-.36,.05,c.elbows[1]);pr.rotation.x=-.4}
    else if(want==='spoon'){pr=box(.016,.32,.022,cm('#8a6a4a'),0,-.4,.07,c.elbows[1]);pr.rotation.x=-.5}
    else if(want==='phone'){pr=box(.075,.14,.012,cm('#111111'),0,-.36,.06,c.elbows[1]);pr.rotation.x=-.6}
    else if(want==='plate'){pr=new THREE.Group();mesh(cyl(.13,.11,.025,16),lam(0xf4f4f0),0,0,0,pr);mesh(sph(.08,10,6),lam(0xd9542b),0,.03,0,pr).scale.set(1,.35,1);pr.position.set(0,-.36,.1);c.elbows[0].add(pr)}
    else if(want==='ball'){pr=mesh(sph(.11,12,10),lam(0xf4f4f4),0,.11,.3,c.mesh)}
    else if(want==='bball'){pr=mesh(sph(.12,12,10),lam(0xd9661f),.3,.5,.22,c.mesh)}
    else if(want==='bar'){pr=new THREE.Group();const b=mesh(cyl(.02,.02,1.1,8),lam(0x888888),0,0,0,pr);b.rotation.z=Math.PI/2;[-.5,.5].forEach(x=>{const w=mesh(cyl(.13,.13,.06,14),lam(0x222222),x,0,0,pr);w.rotation.z=Math.PI/2});c.mesh.add(pr)}
    c._props[want]=pr}
  if(want==='ball'){const k=Math.max(0,Math.sin(t*3));pr.position.set(.1,.11,.32+k*.6);pr.rotation.x+=.15}
  if(want==='bball')pr.position.set(.3,.13+.55*Math.abs(Math.sin(t*4.5)),.22);
  if(want==='bar'){const k=(Math.sin(t*2.5)+1)/2;pr.position.set(0,1.3+.62*k,.14)}
}
function ambientPose(b){if(b==='parade'){const e=eventNow();return !e?['idle','phone','talk']:e.id==='concert'?['cheer','dance','dance3','phone','cheer']:e.id==='games'?['cheer','cheer','talk']:e.id==='jama'?['dance','dance2','cheer']:['eat','talk','phone']}return({field:['kick','kick','cheer','idle'],court:['dribble','dribble','cheer'],night:['eat','drink','talk','phone'],square:['talk','talk','phone','dance'],canteen:['eat','talk','phone'],lake:['phone','idle','talk'],garden:['phone','idle','talk'],trotro:['phone','idle'],taxi:['phone','talk','idle'],terminal:['phone','talk','idle'],market:['talk','phone','idle','talk'],pool:['phone','idle','talk'],square2:[]}[b]||['idle','phone','talk','talk'])}
