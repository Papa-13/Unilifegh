/* ================= business ================= */
function bizStart(){
  S.paused=true;openSheet();const p=P();
  if(p.biz)return bizSheet();
  const types=Object.entries(BIZ);
  $('sheetIn').innerHTML=`<div class="eyebrow">Student Affairs · business desk</div><h3>Start a small business</h3><p style="font-size:14px">Register your business, buy stock (Madina Market at the Trotro Station is cheapest), print flyers at Print & Type, and share them where students gather. Sales happen every evening from your room.</p>
   <div class="list">${types.map(([k,b])=>`<div class="item"><div class="grow"><b>${k==='hair'?(P().look.gender==='f'?'Braiding in your room':'Barbering in your room'):b.name}</b><small>${b.service?`Service · ${cedi(b.sell.normal)} a client · 2–3h per client`:`Buy at ${cedi(b.unit)}, sell at ${cedi(b.sell.normal)} each`} · setup ${cedi(b.setup)}</small></div><button class="btn sm" data-z="${k}">Start · ${cedi(b.setup)}</button></div>`).join('')}</div><button class="ghost sm" id="bye">Close</button>`;
  $('sheetIn').querySelectorAll('[data-z]').forEach(b=>b.onclick=()=>{const k=b.dataset.z;if(!spend(BIZ[k].setup))return;p.biz={type:k,stock:0,price:'normal',aware:4,rep:50,sold:0,earned:0,bookings:0,days:0};advance(30);
    msg('Student Affairs',`Your business "${k==='hair'?(p.look.gender==='f'?'Braids by '+p.name:'Fresh Cuts by '+p.name):BIZ[k].name}" is registered. Print flyers and get the word out!`);bizSheet()});
  $('bye').onclick=closeSheet;
}
function bizSheet(note=''){
  S.paused=true;openSheet();const p=P(),z=p.biz,b=BIZ[z.type];
  $('sheetIn').innerHTML=`<div class="row" style="justify-content:space-between"><h3>💼 ${z.type==='hair'?(p.look.gender==='f'?'Braids by '+esc(p.name):'Fresh Cuts by '+esc(p.name)):b.name}</h3><span class="tag y">${cedi(p.money)}</span></div>
   ${note?`<div class="say">${note}</div>`:''}
   <table><tr><td>People who know about you</td><td class="n">${Math.round(z.aware)}</td></tr><tr><td>Reputation</td><td class="n">${Math.round(z.rep)}/100</td></tr>
   <tr><td>${b.service?'Bookings waiting':'Stock in your room'}</td><td class="n">${b.service?z.bookings:z.stock}</td></tr><tr><td>Sold so far</td><td class="n">${z.sold} ${b.label}</td></tr><tr><td>Total earned</td><td class="n">${cedi(z.earned)}</td></tr><tr><td>Flyers on hand</td><td class="n">${p.flyers}</td></tr></table>
   <div class="opt"><span class="eyebrow">Your price</span><div class="chips">${['low','normal','high'].map(k=>`<button class="pick" data-pr="${k}" aria-pressed="${z.price===k}">${k[0].toUpperCase()+k.slice(1)} · ${cedi(b.sell[k])}</button>`).join('')}</div></div>
   <p style="font-size:13px">Low prices sell more and build reputation. High prices earn more per sale but fewer people buy. ${b.service?'Clients book during the day; serve them in your room.':'Buy stock at the Trotro Station (Madina, cheapest) or the mall.'} Share flyers at the canteen, Night Market, square, lecture theatre or field. Post on your WhatsApp status from your phone once a day.</p>
   <button class="ghost sm" id="bye">Close</button>`;
  $('sheetIn').querySelectorAll('[data-pr]').forEach(x=>x.onclick=()=>{z.price=x.dataset.pr;bizSheet(`Price set to ${cedi(b.sell[z.price])}.`)});
  $('bye').onclick=closeSheet;
}
function buyStock(where){const p=P(),z=p.biz,b=BIZ[z.type];const unit=where==='mall'?Math.round(b.unit*1.35):b.unit,cost=unit*b.pack;
  if(!spend(cost+(where==='madina'?14:0)))return;z.stock+=b.pack;doAct(where==='madina'?'Buying stock at Madina Market':'Buying stock at the mall',where==='madina'?180:40,{energy:-8});toast(`Bought ${b.pack} ${b.label} for ${cedi(cost)}. Stock: ${z.stock}`)}
function shareFlyers(b){const p=P();if(p.flyers<10)return toast('You need flyers. Print them at Print & Type.');p.flyers-=10;
  const crowd=S.npcs.filter(n=>!n.hidden&&dist(n,p)<260).length;const gain=8+crowd*3+({night:6,canteen:4,square:5,lt:5,field:3}[b.id]||2);
  if(p.biz)p.biz.aware+=gain;if(p.race&&!p.race.done&&p.flyersFor==='race')p.race.support+=Math.round(gain/4);
  S.npcs.filter(n=>dist(n,p)<260).forEach(n=>{n.met=true;if(p.biz&&Math.random()<.3)n.customer=true});
  doAct('Sharing flyers',20,{social:6});toast(`You handed out 10 flyers. About ${gain} more people know about you.`)}
function bizDay(d){const p=P(),z=p.biz,b=BIZ[z.type];S['bz'+d]=1;z.days++;
  const pm={low:1.35,normal:1,high:.62}[z.price];const loyal=S.npcs.filter(n=>n.customer&&n.friend>=30).length;
  let demand=(z.aware*.16*pm*(z.rep/50)+loyal*.5)*R(.7,1.3);
  if(b.service){const nb=Math.min(3,Math.round(demand/2));const missed=z.bookings;z.bookings=nb;if(missed)z.rep=clamp(z.rep-missed*3);
    msg('Business',nb?`${nb} new client${nb>1?'s':''} booked for tomorrow at ${cedi(b.sell[z.price])}. Serve them in your room.${missed?` You missed ${missed} booking${missed>1?'s':''} today 😬`:''}`:'No new bookings today. Share more flyers!')}
  else{const sold=Math.min(z.stock,Math.round(demand));const rev=sold*b.sell[z.price];z.stock-=sold;z.sold+=sold;z.earned+=rev;p.money+=rev;
    if(sold<Math.round(demand))z.rep=clamp(z.rep-4);else z.rep=clamp(z.rep+(z.price==='low'?3:z.price==='normal'?1:-1));
    msg('Business',sold?`Today you sold ${sold} ${b.label} and made ${cedi(rev)}. Stock left: ${z.stock}.${z.stock===0?' You are out of stock!':''}`:z.stock?'No sales today. More people need to know about you.':'You had no stock to sell today. Restock at Madina Market.')}
  z.aware*=.92}
function serveClient(){const p=P(),z=p.biz,b=BIZ.hair;z.bookings--;const pay=b.sell[z.price];p.money+=pay;z.earned+=pay;z.sold++;z.rep=clamp(z.rep+2);
  const n=pick(S.npcs)||{name:'a customer'};n.met=true;n.friend=clamp((n.friend||0)+4);doAct(`Doing ${n.name}'s hair`,p.look.gender==='f'?180:60,{energy:-12,social:10});toast(`${n.name} loves it! You earned ${cedi(pay)} 💸`)}
