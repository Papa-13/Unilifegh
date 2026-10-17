/* ================= stop a taxi or trotro by the roadside, like in Ghana =================
   Stand by a public road (the roads around campus or in the towns), wave, say where you're going,
   and a taxi or trotro pulls over beside you. Trotros are shared and cheap (flat fare);
   a taxi "dropping" is yours alone and priced by distance. Neither enters campus: they drop you
   at the nearest road outside it. */
const TROTRO_FARE=5,TROTRO_CALLS=['"Tech! Tech! Tech Junction!"','"Ayeduase! Ayeduase! Kotei!"','"Kumasi! Kejetia! One more seat!"','"Bomso! Ayigya! Let\'s go!"'];
function hailSpot(){if(!S||IS||S.ride||S.busy)return null;const p=P(),q=pubProject(p.x,p.y);return q&&q.d<150?q:null}
function hailActs(list){const h=hailSpot();if(!h)return;const hr=hour();
  list.push(['✋ Stop a taxi',()=>hailSheet('taxi'),null,'']);if(hr>=5.5&&hr<22)list.push([`✋ Stop a trotro · ${cedi(TROTRO_FARE)}`,()=>hailSheet('trotro'),null,''])}
function hailSheet(kind){const h=hailSpot();if(!h)return toast('Stand by the road outside campus to stop one.');S.paused=true;openSheet();const p=P();
  const places=B.filter(b=>!b.open||['taxi','trotro','terminal','market','night','square'].includes(b.id)).map(b=>{const door={x:b.door[0],y:b.door[1]},RP=ringPath({x:p.x,y:p.y},door),len=pathLen([RP.from,...RP.mid,RP.to]),walk=Math.round(Math.hypot(RP.to.x-door.x,RP.to.y-door.y));
    return{b,len,walk,price:kind==='trotro'?TROTRO_FARE:Math.round(15+len*.011)}}).filter(o=>o.len>350).sort((a,b)=>a.b.name.localeCompare(b.b.name));
  $('sheetIn').innerHTML=`<div class="eyebrow">${kind==='taxi'?'🚕 Taxi':'🚐 Trotro'} · by the roadside</div><h3>✋ Where are you going?</h3><p style="font-size:13px;opacity:.85">${kind==='taxi'?'A "dropping" is just for you, priced by distance.':`Shared with other passengers. Flat fare ${cedi(TROTRO_FARE)}.`} They don't enter campus, so campus places mean a short walk from the road.</p>
   <input id="hlQ" placeholder="🔎 Search: Ayeduase, Library, Kotei…" style="width:100%;margin-bottom:6px"><div class="list" id="hlL"></div><button class="ghost sm" id="bye">Cancel</button>`;
  const draw=q=>{$('hlL').innerHTML=places.filter(o=>!q||o.b.name.toLowerCase().includes(q)).map(o=>`<div class="item"><div class="grow"><b>${esc(o.b.name)}</b><small>${o.walk>200?`then ~${Math.max(1,Math.round(o.walk/110))} min walk`:'right by the road'}</small></div><button class="btn sm" data-hl="${o.b.id}">${cedi(o.price)}</button></div>`).join('');
    $('hlL').querySelectorAll('[data-hl]').forEach(x=>x.onclick=()=>{const o=places.find(y=>y.b.id===x.dataset.hl);if(p.money<o.price)return toast(`Not enough on MoMo (${cedi(o.price)}).`);closeSheet();hailGo(kind,o)})};
  draw('');$('hlQ').oninput=e=>draw(e.target.value.trim().toLowerCase());$('hlQ').onkeydown=e=>e.stopPropagation();$('bye').onclick=closeSheet}
function hailGo(kind,o){const p=P(),h=hailSpot();if(!h)return;const sg=h.sg,horiz=sg[1]===sg[3],pk={x:h.x,y:h.y,ax:horiz?'h':'v'};
  /* the vehicle comes along the same road from up to 650 back */
  const L=Math.hypot(sg[2]-sg[0],sg[3]-sg[1]),ux=(sg[2]-sg[0])/L,uy=(sg[3]-sg[1])/L,fromEnd=h.t*L>200?-1:1,back=Math.min(650,fromEnd<0?h.t*L:(1-h.t)*L);
  const start={x:pk.x+ux*back*fromEnd,y:pk.y+uy*back*fromEnd},RP0={mid:[]};
  const b=o.b,door={x:b.door[0],y:b.door[1]+(b.door[1]>b.y?22:-22)},RP=ringPath(pk,door);
  /* the nearest real taxi/trotro on the road is the one that stops for you */
  const tr=TRAFFIC.filter(c=>c.kind===(kind==='taxi'?1:3)&&c.px!=null).sort((a,z)=>Math.hypot(a.px-pk.x,a.py-pk.y)-Math.hypot(z.px-pk.x,z.py-pk.y));if(tr.length){const c=tr[0];c.d+=perim(c.route)/2}
  const g=kind==='taxi'?makeCar(0xf4c430,true):makeTrotro();
  S.ride={app:kind,hail:1,dest:b.id,price:o.price,mins:Math.round(3+o.len/90),phase:'pickup',pts:[start,...RP0.mid,pk],i:0,pos:{...start},dir:{x:Math.sign(pk.x-start.x)||0,y:Math.sign(pk.y-start.y)||0},g,sp:kind==='taxi'?340:300,drive:[pk,...RP.mid,RP.to],door,shared:kind==='trotro',t:0,side:0};
  
  p.target=null;try{setGest(p,'wave',2.5)}catch(e){}toast(kind==='taxi'?'✋ You wave at a taxi… it flashes its lights and pulls over 🚕':`✋ You wave at a trotro. The mate leans out: ${pick(TROTRO_CALLS)}`);acts(true)}
