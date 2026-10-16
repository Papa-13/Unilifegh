/* ================= collision & pathfinding ================= */
function solidAt(x,y,r=6){if(x<8||y<8||x>MW-8||y>MH-8)return true;
  for(const o of SOLIDS){if(o.t===0){const dx=x-o.x,dy=y-o.y,R=o.r+r;if(dx*dx+dy*dy<R*R)return true}
    else if(o.t===1){if(x>o.x1-r&&x<o.x2+r&&y>o.y1-r&&y<o.y2+r)return true}
    else{const a=(x-o.x)/(o.rx+r),b=(y-o.y)/(o.ry+r);if(a*a+b*b<1)return true}}return false}
function makeGrid(x0,y0,w,h,cs,solid){const nx=Math.ceil(w/cs),ny=Math.ceil(h/cs),bl=new Uint8Array(nx*ny);for(let j=0;j<ny;j++)for(let i=0;i<nx;i++)bl[j*nx+i]=solid(x0+(i+.5)*cs,y0+(j+.5)*cs)?1:0;return{x0,y0,cs,nx,ny,bl}}
const gIdx=(G,x,y)=>clamp(Math.floor((y-G.y0)/G.cs),0,G.ny-1)*G.nx+clamp(Math.floor((x-G.x0)/G.cs),0,G.nx-1);
const gPt=(G,k)=>({x:G.x0+(k%G.nx+.5)*G.cs,y:G.y0+(Math.floor(k/G.nx)+.5)*G.cs});
function gNearest(G,k){if(!G.bl[k])return k;const i0=k%G.nx,j0=(k-i0)/G.nx;
  for(let r=1;r<80;r++){let best=-1,bd=1e9;for(let dj=-r;dj<=r;dj++)for(let di=-r;di<=r;di++){if(Math.abs(di)!==r&&Math.abs(dj)!==r)continue;const i=i0+di,j=j0+dj;if(i<0||j<0||i>=G.nx||j>=G.ny)continue;const q=j*G.nx+i;if(!G.bl[q]){const d=di*di+dj*dj;if(d<bd){bd=d;best=q}}}if(best>=0)return best}return k}
function gLOS(G,a,b){const d=Math.hypot(b.x-a.x,b.y-a.y),n=Math.max(1,Math.ceil(d/(G.cs*.35)));for(let i=1;i<n;i++){const t=i/n;if(G.bl[gIdx(G,a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t)])return false}return true}
function findPath(G,sx,sy,tx,ty){
  const si=gIdx(G,sx,sy),ti=gIdx(G,tx,ty),s=gNearest(G,si),t=gNearest(G,ti),end=G.bl[ti]?gPt(G,t):{x:tx,y:ty},out=[];
  let cur={x:sx,y:sy};if(G.bl[si]){cur=gPt(G,s);out.push(cur)}
  if(s===t||gLOS(G,cur,end)){out.push(end);return out}
  const N=G.nx*G.ny,gs=new Float32Array(N).fill(1e9),fr=new Int32Array(N).fill(-1),cl=new Uint8Array(N),hf=[],hk=[];
  const tI=t%G.nx,tJ=(t-tI)/G.nx,h=k=>{const i=k%G.nx,dx=Math.abs(i-tI),dy=Math.abs((k-i)/G.nx-tJ);return Math.max(dx,dy)+.414*Math.min(dx,dy)};
  const sw=(a,b)=>{let x=hf[a];hf[a]=hf[b];hf[b]=x;x=hk[a];hk[a]=hk[b];hk[b]=x};
  const push=(f,k)=>{let i=hf.length;hf.push(f);hk.push(k);while(i>0){const q=(i-1)>>1;if(hf[q]<=hf[i])break;sw(q,i);i=q}};
  const pop=()=>{const k=hk[0],lf=hf.pop(),lk=hk.pop();if(hf.length){hf[0]=lf;hk[0]=lk;let i=0;for(;;){const l=2*i+1,r=l+1;let m=i;if(l<hf.length&&hf[l]<hf[m])m=l;if(r<hf.length&&hf[r]<hf[m])m=r;if(m===i)break;sw(m,i);i=m}}return k};
  gs[s]=0;push(h(s),s);let found=false;
  while(hf.length){const k=pop();if(cl[k])continue;cl[k]=1;if(k===t){found=true;break}
    const i=k%G.nx,j=(k-i)/G.nx;
    for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const a=i+di,b=j+dj;if(a<0||b<0||a>=G.nx||b>=G.ny)continue;const q=b*G.nx+a;if(G.bl[q]||cl[q])continue;
      if(di&&dj&&(G.bl[j*G.nx+a]||G.bl[b*G.nx+i]))continue;const ng=gs[k]+(di&&dj?1.414:1);if(ng<gs[q]){gs[q]=ng;fr[q]=k;push(ng+h(q),q)}}}
  if(!found){out.push(end);return out}
  const cells=[];for(let k=t;k!==s&&k!==-1;k=fr[k])cells.push(k);cells.reverse();
  const pts=cells.map(k=>gPt(G,k));pts[pts.length-1]=end;
  let i=0;while(i<pts.length){let j=pts.length-1;while(j>i&&!gLOS(G,cur,pts[j]))j--;out.push(pts[j]);cur=pts[j];i=j+1}
  return out}
let CGRID=null;function campusGrid(){if(CGRID)return CGRID;const cs=14,nx=Math.ceil(MW/cs),ny=Math.ceil(MH/cs),bl=new Uint8Array(nx*ny),r=9;
  for(let i=0;i<nx;i++){bl[i]=1;bl[(ny-1)*nx+i]=1}for(let j=0;j<ny;j++){bl[j*nx]=1;bl[j*nx+nx-1]=1}
  for(const o of SOLIDS){let x1,y1,x2,y2;if(o.t===1){x1=o.x1;y1=o.y1;x2=o.x2;y2=o.y2}else if(o.t===0){x1=o.x-o.r;x2=o.x+o.r;y1=o.y-o.r;y2=o.y+o.r}else{x1=o.x-o.rx;x2=o.x+o.rx;y1=o.y-o.ry;y2=o.y+o.ry}
    const i1=Math.max(0,Math.floor((x1-r)/cs)),i2=Math.min(nx-1,Math.floor((x2+r)/cs)),j1=Math.max(0,Math.floor((y1-r)/cs)),j2=Math.min(ny-1,Math.floor((y2+r)/cs));
    for(let j=j1;j<=j2;j++)for(let i=i1;i<=i2;i++){const k=j*nx+i;if(bl[k])continue;const cx=(i+.5)*cs,cy=(j+.5)*cs;let hit;
      if(o.t===0){const dx=cx-o.x,dy=cy-o.y,R=o.r+r;hit=dx*dx+dy*dy<R*R}else if(o.t===1)hit=cx>o.x1-r&&cx<o.x2+r&&cy>o.y1-r&&cy<o.y2+r;else{const a=(cx-o.x)/(o.rx+r),b=(cy-o.y)/(o.ry+r);hit=a*a+b*b<1}if(hit)bl[k]=1}}
  return CGRID={x0:0,y0:0,cs,nx,ny,bl}}
function freeSpot(x,y){const G=campusGrid(),k=gIdx(G,x,y);return G.bl[k]?gPt(G,gNearest(G,k)):{x,y}}
function dynHit(x,y){for(const v of DECOR)if(v.crowd&&v.vis&&Math.abs(v.x-x)<14&&Math.abs(v.y-y)<14)return true;return vehHit(x,y,7)}
function vehList(){const L=[];if(typeof TRAFFIC!=='undefined')TRAFFIC.forEach(c=>{if(c.px!=null)L.push([c.px,c.py,c.dx,c.dy,VH.car[0],VH.car[1],c.v??c.sp])});if(typeof BUSES!=='undefined')BUSES.forEach(b=>{if(b.x!=null)L.push([b.x,b.y,b.dx??1,b.dy??0,VH.bus[0],VH.bus[1],b.wait>0?0:(b.v??220)])});
  const r=S&&S.ride;if(r&&r.lp&&r.dir)L.push([r.lp.x,r.lp.y,r.dir.x,r.dir.y,VH.car[0],VH.car[1],['pickup','drive','leave'].includes(r.phase)?(r.sp||200)*(r.rv??1):0]);const d=S&&S.del;if(d&&d.lp&&d.dir)L.push([d.lp.x,d.lp.y,d.dir.x,d.dir.y,17,7,['ride','leave'].includes(d.phase)?(d.sp||150):0]);return L}
const VH={car:[55,26],bus:[86,30]};
let VEH=[],VEHT=-1;
function inRoad(x,y){return ROADS.some(([rx,ry,w,h])=>x>rx&&x<rx+w&&y>ry&&y<ry+h)}
function trafficDanger(x,y){if(!S)return false;const L=vehList();for(const [cx,cy,dx,dy,hl,hw,v] of L){if(!(v>15))continue;const ox=x-cx,oy=y-cy,a=ox*dx+oy*dy,l=-ox*dy+oy*dx;if(a>-hl-6&&a<hl+Math.max(70,v*2.1)&&Math.abs(l)<hw+26)return true}return false}
function crossWait(o,tx,ty){const d=Math.hypot(tx-o.x,ty-o.y)||1,ux=(tx-o.x)/d,uy=(ty-o.y)/d;
  if(inRoad(o.x,o.y)){o.crossing=0;o.hurry=trafficDanger(o.x,o.y)||trafficDanger(o.x+ux*40,o.y+uy*40);return false}o.hurry=false;
  const pts=[14,45,85,130,170].map(k=>({x:o.x+ux*Math.min(k,d+20),y:o.y+uy*Math.min(k,d+20)})).filter(q=>inRoad(q.x,q.y));if(!pts.length){o.crossing=0;return false}
  if(pts.some(q=>trafficDanger(q.x,q.y))){const now=performance.now();if(!o.crossing){o.crossing=1;o.cw0=now;setGest(o,'lookaround',2.4)}if(now-o.cw0>9000)return false;return true}
  if(o.crossing===1){o.crossing=2;setGest(o,'lookaround',.9)}return false}
function vehHit(x,y,r){if(IS||!S)return false;const f=performance.now();if(f-VEHT>30){VEH=vehList();VEHT=f}
  for(const [cx,cy,dx,dy,hl,hw] of VEH){const ox=x-cx,oy=y-cy;if(Math.abs(ox)>90||Math.abs(oy)>90)continue;const a=ox*dx+oy*dy,l=-ox*dy+oy*dx;if(Math.abs(a)<hl+r&&Math.abs(l)<hw+r)return true}return false}
function vehAt(x,y,r){for(const V of VEH){const [cx,cy,dx,dy,hl,hw]=V,ox=x-cx,oy=y-cy;if(Math.abs(ox)>120||Math.abs(oy)>120)continue;const a=ox*dx+oy*dy,l=-ox*dy+oy*dx;if(Math.abs(a)<hl+r&&Math.abs(l)<hw+r)return V}return null}
/* walk round a stopped car or bus instead of giving up: go past whichever end is clearer */
function vehDetour(o,V,tx,ty){const [cx,cy,dx,dy,hl,hw]=V,nx=-dy,ny=dx,side=Math.sign((o.x-cx)*nx+(o.y-cy)*ny)||1;let best=null;
  for(const e of [1,-1]){const m=hl+22,w=hw+20,A={x:cx+dx*m*e+nx*w*side,y:cy+dy*m*e+ny*w*side},Bp={x:cx+dx*m*e-nx*w*side,y:cy+dy*m*e-ny*w*side};
    if(vehHit(A.x,A.y,8)||vehHit(Bp.x,Bp.y,8)||solidAt(A.x,A.y,6)||solidAt(Bp.x,Bp.y,6))continue;
    const c=Math.hypot(A.x-o.x,A.y-o.y)+Math.hypot(Bp.x-A.x,Bp.y-A.y)+Math.hypot(tx-Bp.x,ty-Bp.y);if(!best||c<best.c)best={c,pts:[A,Bp]}}
  return best&&best.pts}
function vehOut(o,r){for(const [cx,cy,dx,dy,hl,hw] of VEH){const ox=o.x-cx,oy=o.y-cy;if(Math.abs(ox)>90||Math.abs(oy)>90)continue;const a=ox*dx+oy*dy,l=-ox*dy+oy*dx;
  if(Math.abs(a)<hl+r&&Math.abs(l)<hw+r){const pa=hl+r-Math.abs(a),pl=hw+r-Math.abs(l);if(pl<pa){const s=Math.sign(l)||1;o.x+=-dy*s*(pl+.5);o.y+=dx*s*(pl+.5)}else{const s=Math.sign(a)||1;o.x+=dx*s*(pa+.5);o.y+=dy*s*(pa+.5)}}}}
function vehPush(){if(IS||!S)return;VEH=vehList();VEHT=performance.now();const p=P();if(!p.inCar&&!p.onBus&&!S.pBoard&&!(S.ride&&['board','drop'].includes(S.ride.phase)))vehOut(p,6);S.npcs.forEach(n=>{if(!n.hidden&&!n.mirror)vehOut(n,6)});if(QF)QF.forEach(f=>{if(f.on&&!f.board)vehOut(f,5)})}
function slideMove(o,mx,my,r=6){const bl=(x,y)=>solidAt(x,y,r)||dynHit(x,y);if(bl(o.x,o.y)||!bl(o.x+mx,o.y+my)){o.x+=mx;o.y+=my;return true}
  if(Math.abs(mx)>1e-4&&!bl(o.x+mx,o.y)){o.x+=mx;return true}if(Math.abs(my)>1e-4&&!bl(o.x,o.y+my)){o.y+=my;return true}return false}
function iSolid(x,z,r){if(!IS)return false;if(x<(IS.xmin??-IS.W/2)+.3||x>IS.W/2-.3||z<-IS.D/2+.3||z>IS.D/2-.25)return true;for(const o of IS.obst)if(x>o.x1-r&&x<o.x2+r&&z>o.z1-r&&z<o.z2+r)return true;return false}
const iGrid=()=>IS.grid||(IS.grid=makeGrid(IS.xmin??-IS.W/2,-IS.D/2,IS.W/2-(IS.xmin??-IS.W/2),IS.D,.1,(x,z)=>iSolid(x,z,.2)));
function slideI(p,mx,mz,r=.16){const x=p.ix,z=p.iz;if(iSolid(x,z,r)||!iSolid(x+mx,z+mz,r)){p.ix+=mx;p.iz+=mz;return true}if(!iSolid(x+mx,z,r)){p.ix+=mx;return true}if(!iSolid(x,z+mz,r)){p.iz+=mz;return true}return false}
function unstick(p){if(IS){if(iSolid(p.ix,p.iz,.16)){const G=iGrid(),q=gPt(G,gNearest(G,gIdx(G,p.ix,p.iz)));p.ix=q.x;p.iz=q.y}}else if(solidAt(p.x,p.y,6)){const q=freeSpot(p.x,p.y);p.x=q.x;p.y=q.y}}
