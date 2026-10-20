/* ================= stop a taxi or trotro by the roadside, like in Ghana =================
   Stand by a public road (the roads around campus or in the towns), wave, say where you're going,
   and a taxi or trotro pulls over beside you. Trotros are shared and cheap (flat fare);
   a taxi "dropping" is yours alone and priced by distance. Neither enters campus: they drop you
   at the nearest road outside it. */
const TROTRO_FARE=5,TROTRO_CALLS=['"Tech! Tech! Tech Junction!"','"Ayeduase! Ayeduase! Kotei!"','"Kumasi! Kejetia! One more seat!"','"Bomso! Ayigya! Let\'s go!"'];
function hailSpot(){if(!S||IS||S.ride||S.busy)return null;const p=P(),q=pubProject(p.x,p.y);return q&&q.d<150?q:null}
/* you can only stop a taxi or trotro that is actually coming down the road towards you (like in real life).
   Some are already full and drive past. Wave one down: it pulls over beside you, then you tell the driver where you're going. */
const carLap=c=>Math.floor((c.d||0)/Math.max(1,perim(c.route)));
const carFull=c=>{const h=Math.abs(Math.sin((c.vid||1)*12.9898+carLap(c)*78.233)*43758.5453)%1;return c.kind===3?h<.25:h<.35};
function passingCar(kind){const p=P();let best=null,bd=1e9;TRAFFIC.forEach(c=>{if(c.kind!==kind||c.hired||c.px==null||c.dx==null)return;const vx=p.x-c.px,vy=p.y-c.py,ahead=vx*c.dx+vy*c.dy,side=Math.abs(vx*c.dy-vy*c.dx);
    if(ahead>25&&ahead<420&&side<RHW+60&&ahead<bd){bd=ahead;best=c}});return best}
function hailKey(){if(!hailSpot())return'';const t=passingCar(1),r=passingCar(3);return(t?(carFull(t)?'tf':'t'):'')+(r?(carFull(r)?'rf':'r'):'')}
function hailActs(list){const h=hailSpot();if(!h)return;const hr=hour(),t=passingCar(1),r=hr>=5.5&&hr<22?passingCar(3):null;
  list.push(t?(carFull(t)?['🚕 A taxi is coming… it\'s full',null,'full, wait for the next one']:['✋ Wave down the taxi coming',()=>hailWave(1),null,'b']):['🚕 No taxi passing yet · watch the road',null,'wait by the road']);
  if(hr>=5.5&&hr<22)list.push(r?(carFull(r)?['🚐 A trotro is coming… no seats',null,'full, wait for the next one']:[`✋ Stop the trotro · ${cedi(TROTRO_FARE)}`,()=>hailWave(3),null,'b']):['🚐 No trotro passing yet',null,'wait by the road'])}
function hailWave(k){const kind=k===1?'taxi':'trotro',c=passingCar(k),h=hailSpot();if(!c||!h||carFull(c))return toast('It drove past. Wait for the next one.');const sg=h.sg,horiz=sg[1]===sg[3],pk={x:h.x,y:h.y,ax:horiz?'h':'v'};
  c.hired=true;const L=Math.hypot(sg[2]-sg[0],sg[3]-sg[1])||1,ux=(sg[2]-sg[0])/L,uy=(sg[3]-sg[1])/L,al=(c.px-pk.x)*ux+(c.py-pk.y)*uy,start={x:pk.x+ux*al,y:pk.y+uy*al};
  S.ride={app:kind,hail:1,fromCar:c,dest:null,price:0,mins:0,phase:'pickup',pts:[start,pk],i:0,pos:{...start},dir:{x:c.dx,y:c.dy},g:c.g,sp:kind==='taxi'?300:260,drive:null,door:null,shared:kind==='trotro',t:0,side:0};
  const p=P();p.target=null;try{setGest(p,'wave',2.5)}catch(e){}toast(kind==='taxi'?'✋ You wave. The taxi flashes its lights and pulls over 🚕':`✋ You wave. The mate leans out: ${pick(TROTRO_CALLS)}`);acts(true)}
/* a hailed car goes back into traffic (far down the road) when the ride is over or cancelled */
function hailRelease(){TRAFFIC.forEach(c=>{if(!c.hired||(S.ride&&S.ride.fromCar===c))return;c.hired=false;c.d=(c.d||0)+perim(c.route)/2;c.g=c.kind===3?makeTrotro():makeCar(0xf4c430,true)})}
function hailSheet(kind){const R=S.ride,pend=R&&R.hail&&!R.dest;if(!pend)return toast('Wave down a taxi or trotro that is coming first.');S.paused=true;openSheet();const p=P();
  const places=B.filter(b=>!b.open||['taxi','trotro','terminal','market','night','square'].includes(b.id)).map(b=>{const door={x:b.door[0],y:b.door[1]},RP=ringPath({x:p.x,y:p.y},door),len=pathLen([RP.from,...RP.mid,RP.to]),walk=Math.round(Math.hypot(RP.to.x-door.x,RP.to.y-door.y));
    return{b,len,walk,price:kind==='trotro'?TROTRO_FARE:Math.round(15+len*.011)}}).filter(o=>o.len>350).sort((a,b)=>a.b.name.localeCompare(b.b.name));
  $('sheetIn').innerHTML=`<div class="eyebrow">${kind==='taxi'?'🚕 Taxi':'🚐 Trotro'} · by the roadside</div><h3>✋ Where are you going?</h3><p style="font-size:13px;opacity:.85">${kind==='taxi'?'A "dropping" is just for you, priced by distance.':`Shared with other passengers. Flat fare ${cedi(TROTRO_FARE)}.`} They don't enter campus, so campus places mean a short walk from the road.</p>
   <input id="hlQ" placeholder="🔎 Search: Ayeduase, Library, Kotei…" style="width:100%;margin-bottom:6px"><div class="list" id="hlL"></div><button class="ghost sm" id="bye">Cancel</button>`;
  const draw=q=>{$('hlL').innerHTML=places.filter(o=>!q||o.b.name.toLowerCase().includes(q)).map(o=>`<div class="item"><div class="grow"><b>${esc(o.b.name)}</b><small>${o.walk>200?`then ~${Math.max(1,Math.round(o.walk/110))} min walk`:'right by the road'}</small></div><button class="btn sm" data-hl="${o.b.id}">${cedi(o.price)}</button></div>`).join('');
    $('hlL').querySelectorAll('[data-hl]').forEach(x=>x.onclick=()=>{const o=places.find(y=>y.b.id===x.dataset.hl);if(p.money<o.price)return toast(`Not enough on MoMo (${cedi(o.price)}).`);closeSheet();hailSet(o)})};
  draw('');$('hlQ').oninput=e=>draw(e.target.value.trim().toLowerCase());$('hlQ').onkeydown=e=>e.stopPropagation();$('bye').onclick=closeSheet}
function hailSet(o){const r=S.ride;if(!r||!r.hail)return;const pk=r.pts[r.pts.length-1],b=o.b,door={x:b.door[0],y:b.door[1]+(b.door[1]>b.y?22:-22)},RP=ringPath(pk,door);
  r.dest=b.id;r.price=o.price;r.mins=Math.round(2+o.len/320);r.drive=[{x:r.pos.x,y:r.pos.y},...RP.mid,RP.to];r.door=door;
  toast(r.app==='taxi'?`"${b.name}? Okay, enter." 🚕 ${cedi(o.price)}`:`The mate: "${b.name.split(' ')[0]}! Enter, enter!" 🚐`);acts(true)}
