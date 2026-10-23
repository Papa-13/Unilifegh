/* ================= getting into and out of bed =================
   Your sim doesn't snap from standing to lying any more. Into bed: sit on the edge of the mattress, then
   swing in and lie down. Top bunk: climb up first. Out of bed: sit up on the edge, then stand (or climb
   down from the top bunk). */
function bedEdge(sp){const yaw=sp.yaw||0,px=Math.cos(yaw),pz=-Math.sin(yaw),ax=Math.sin(yaw),az=Math.cos(yaw),o=IS.objs.find(o=>o.id==='bed')||{x:sp.x+px,z:sp.z+pz},
  sg=Math.sign((o.x-sp.x)*px+(o.z-sp.z)*pz)||1,bedTop=(sp.ly||.8)-.32;
  return{x:sp.x+px*sg*.36,z:sp.z+pz*sg*.36,ry:Math.atan2(px*sg,pz*sg),y:Math.max(0,bedTop-.13),top:bedTop>.9,lx:sp.x+px*sg*.62-ax*.55,lz:sp.z+pz*sg*.62-az*.55,ly:Math.max(0,bedTop-.35)}}
function tweenY(p,from,to,ms,done){const t0=performance.now();(function f(){const k=Math.min(1,(performance.now()-t0)/ms);p.spotY=from+(to-from)*k;if(k<1)requestAnimationFrame(f);else done&&done()})()}
const isBedLie=(a)=>IS&&IS.kind==='room'&&a&&a.pose==='lie'&&a.spot&&IS.spots.bed&&Math.hypot(a.spot.x-IS.spots.bed.x,a.spot.z-IS.spots.bed.z)<.6;
{const _sb=startBusy;startBusy=function(label,a,dur,done){const p=P(),args=arguments,t=this;
  if(!isBedLie(a)||a._climbed||S._climb)return _sb.apply(t,args);
  if(!a._walked&&Math.hypot(p.ix-a.spot.x,p.iz-a.spot.z)>=.55&&!(S.walkTo))return _sb.apply(t,args);   // walk over first; we come back here after
  const e=bedEdge(a.spot),go=()=>{S._climb=0;_sb.call(t,label,Object.assign({},a,{_climbed:1,_walked:1}),dur,done)};S._climb=1;p.itarget=null;p.target=null;p.lying=false;
  if(e.top){p.ix=e.lx;p.iz=e.lz;p.face=e.ry+Math.PI;p.pose='climb';p.spotY=0;tweenY(p,0,e.ly,1300,()=>{p.ix=e.x;p.iz=e.z;p.face=e.ry;p.pose='sit';p.spotY=e.y;setTimeout(go,450)})}
  else{p.ix=e.x;p.iz=e.z;p.face=e.ry;p.pose='sit';p.spotY=e.y;setTimeout(go,750)}}}
{const _fb=finishBusy;finishBusy=function(){const b=S.busy,bed=b&&isBedLie(b.a)?b.a.spot:null;const r=_fb.apply(this,arguments);
  try{if(bed&&IS&&IS.kind==='room'){const p=P(),e=bedEdge(bed);S._climb=1;p.ix=e.x;p.iz=e.z;p.face=e.ry;p.pose='sit';p.spotY=e.y;p.lying=false;
    const stand=()=>{S._climb=0;p.pose=null;p.spotY=0;p.face=e.ry;p.ix=e.x+Math.sin(e.ry)*.45;p.iz=e.z+Math.cos(e.ry)*.45;try{unstick(p)}catch(x){}};
    if(e.top)setTimeout(()=>{p.ix=e.lx;p.iz=e.lz;p.face=e.ry+Math.PI;p.pose='climb';tweenY(p,e.ly,0,1200,()=>{p.ix=e.lx+Math.sin(e.ry)*.4;p.iz=e.lz+Math.cos(e.ry)*.4;stand();p.ix=e.lx+Math.sin(e.ry)*.45;p.iz=e.lz+Math.cos(e.ry)*.45})},900);
    else setTimeout(stand,900)}}catch(x){console.warn(x)}return r}}
