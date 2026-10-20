/* ================= 💎 Drip & Flex: what gems buy =================
   Fair by design: gems never buy grades, exam passes or a better story. They buy looks, room flex,
   gifts and saved time, so free players can still get everything that matters, and paying players
   get to show off. A weekly drop rotates three items at 25% off (changes every Monday, real time). */
const DRIP={
  prints:['gold','royalkente','neon','chrome','sunset','blackgold'].map(k=>({id:'pal:'+k,k,kind:'print',name:PAL[k].name,g:12,ic:'👕',desc:'A limited print you can wear on any outfit you own'})),
  room:[{id:'ps5',kind:'room',name:'PS5 + FIFA 26',g:45,ic:'🎮',desc:'Friends say yes to FIFA nights more often, and FIFA is more fun'},
    {id:'ac',kind:'room',name:'Air conditioner',g:35,ic:'❄️',desc:'Sleep cool: you wake up better rested'},
    {id:'ringlight',kind:'room',name:'Ring light',g:25,ic:'💡',desc:'Film TikToks in your room. One might go viral and bring a brand deal'},
    {id:'neon',kind:'room',name:'Neon name sign',g:20,ic:'✨',desc:'Your name glowing on the wall. Visitors are impressed'},
    {id:'gchair',kind:'room',name:'Gaming chair',g:18,ic:'🪑',desc:'Comfy desk sessions: +8% study at your desk'}],
  gifts:[{id:'roses',kind:'gift',name:'Roses & chocolate',g:4,ic:'🌹',love:12,fr:5},{id:'cake',kind:'gift',name:'Surprise cake',g:6,ic:'🎂',love:6,fr:12},
    {id:'teddy',kind:'gift',name:'Giant teddy bear',g:8,ic:'🧸',love:20,fr:6},{id:'kicks',kind:'gift',name:'Fresh sneakers for them',g:15,ic:'👟',love:18,fr:18}]};
const dripAll=()=>[...DRIP.prints,...DRIP.room];
function dripWeek(){const d=new Date(),day=(d.getUTCDay()+6)%7,mon=Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()-day);return{n:Math.floor(mon/(7*864e5)),ends:mon+7*864e5}}
function dripDrop(){const {n}=dripWeek(),all=dripAll(),out=[];let h=n*2654435761>>>0;while(out.length<3){h=(h*1103515245+12345)>>>0;const it=all[h%all.length];if(!out.includes(it))out.push(it)}return out}
const dripPrice=it=>dripDrop().includes(it)?Math.ceil(it.g*.75):it.g;
const dripOwned=it=>it.kind==='print'?(P().prem||[]).includes(it.k):it.kind==='room'?P().items.includes(it.id):false;
function dripStore(tab){S.paused=true;openSheet();const p=P();tab=tab||'drop';const {ends}=dripWeek(),left=ends-Date.now(),dd=Math.floor(left/864e5),hh=Math.floor(left%864e5/36e5);
  const row=it=>{const own=dripOwned(it),pr=dripPrice(it),sale=pr<it.g;return `<div class="item"><span style="font-size:24px">${it.kind==='print'?`<i class="sw2" style="display:inline-block;width:26px;height:26px;border-radius:8px;background:linear-gradient(135deg,${PAL[it.k].a} 50%,${PAL[it.k].b} 50%)"></i>`:it.ic}</span><div class="grow"><b>${esc(it.name)}</b><small>${esc(it.desc||'')}</small></div>${own?'<span class="tag g">Yours</span>':`<button class="btn sm" data-dp="${it.id}">${sale?`<s style="opacity:.6">${it.g}</s> `:''}${pr} 💎</button>`}</div>`};
  const tabs=[['drop','🔥 This week'],['print','👕 Prints'],['room','🏠 Room'],['gift','🎁 Gifts']];
  let body='';
  if(tab==='drop')body=`<p style="font-size:13px;margin:0 0 6px">Three items, 25% off. New drop in <b>${dd}d ${hh}h</b>.</p><div class="list">${dripDrop().map(row).join('')}</div>`;
  if(tab==='print')body=`<p style="font-size:13px;margin:0 0 6px">Limited prints nobody gets for free. Wear them on any outfit from your wardrobe.</p><div class="list">${DRIP.prints.map(row).join('')}</div>`;
  if(tab==='room')body=`<p style="font-size:13px;margin:0 0 6px">Delivered to your room straight away.</p><div class="list">${DRIP.room.map(row).join('')}</div>`;
  if(tab==='gift'){const ppl=S.npcs.filter(n=>n.met&&(n.contact||n===p.partner||n.side)&&!n.ex).sort((a,b)=>(isLove(b)-isLove(a))||b.romance-a.romance||b.friend-a.friend).slice(0,12);
    body=`<p style="font-size:13px;margin:0 0 6px">Send something to your person (or your guy). They'll get it today.</p><div class="list">${DRIP.gifts.map(g=>`<div class="item"><span style="font-size:24px">${g.ic}</span><div class="grow"><b>${g.name}</b><small>${g.love>=g.fr?'Big romance boost':'Big friendship boost'}</small></div><button class="btn sm" data-gf="${g.id}" ${ppl.length?'':'disabled'}>${g.g} 💎</button></div>`).join('')}</div>${ppl.length?'':'<p style="font-size:13px">Get someone\'s number first.</p>'}`}
  $('sheetIn').innerHTML=`<div class="row" style="justify-content:space-between;align-items:center"><h3>✨ Drip & Flex</h3><span class="tag y" style="font-size:15px">💎 ${S.gems||0}</span></div>
    <div class="tabs">${tabs.map(([k,l])=>`<button class="pick" aria-pressed="${k===tab}" data-t="${k}">${l}</button>`).join('')}</div>${body}
    <div class="row" style="gap:8px;margin-top:10px"><button class="btn sm" id="dsGems">💎 Get gems from GH₵1</button><button class="ghost sm" id="bye">Close</button></div>`;
  $('sheetIn').querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>dripStore(b.dataset.t));$('bye').onclick=closeSheet;$('dsGems').onclick=()=>{closeSheet();gemShop()};
  $('sheetIn').querySelectorAll('[data-dp]').forEach(b=>b.onclick=()=>dripBuy(dripAll().find(x=>x.id===b.dataset.dp),tab));
  $('sheetIn').querySelectorAll('[data-gf]').forEach(b=>b.onclick=()=>giftPick(DRIP.gifts.find(x=>x.id===b.dataset.gf),ppl=>0))}
async function dripBuy(it,tab){const p=P(),pr=dripPrice(it);if((S.gems||0)<pr){closeSheet();toast(`You need ${pr} 💎 for ${it.name}. You have ${S.gems||0}.`);return gemShop()}
  if(!(await gemsSpend(pr)))return toast('Couldn\'t spend gems. Try again.');
  if(it.kind==='print'){(p.prem=p.prem||[]).push(it.k);p.look.pal=it.k;rebuildPlayer();toast(`👕 ${it.name} unlocked and you're wearing it. Switch prints in your wardrobe.`)}
  if(it.kind==='room'){p.items.push(it.id);if(it.id==='ps5'&&!p.items.includes('console'))p.items.push('console');toast(`📦 ${it.name} delivered to your room!`);try{if(IS&&IS.mine)refreshRoom()}catch(e){}}
  try{window.track&&window.track('spend_gems',{item:it.id,gems:pr})}catch(e){}gemPop(-pr);hud();dripStore(tab)}
function giftPick(g){const p=P(),ppl=S.npcs.filter(n=>n.met&&(n.contact||n===p.partner||n.side)&&!n.ex).sort((a,b)=>(isLove(b)-isLove(a))||b.romance-a.romance||b.friend-a.friend).slice(0,12);
  $('sheetIn').innerHTML=`<h3>${g.ic} ${g.name}: who is it for?</h3><div class="list">${ppl.map(n=>`<div class="item"><div class="grow"><b>${esc(n.name)}${n===p.partner?' ❤️':n.side?' 🤫':''}</b><small>${relStage(n)}</small></div><button class="btn sm" data-to="${n.id}">Send · ${g.g} 💎</button></div>`).join('')}</div><button class="ghost sm" id="bye">Back</button>`;
  $('bye').onclick=()=>dripStore('gift');$('sheetIn').querySelectorAll('[data-to]').forEach(b=>b.onclick=()=>giftSend(g,npcById(b.dataset.to)))}
async function giftSend(g,n){if(!n)return;if((S.gems||0)<g.g){closeSheet();toast(`You need ${g.g} 💎 for that gift.`);return gemShop()}if(!(await gemsSpend(g.g)))return;const p=P(),love=isLove(n)||n.romance>=35;
  n.friend=clamp(n.friend+g.fr);if(love)n.romance=clamp(n.romance+g.love);if(g.id==='kicks'){n.look=Object.assign({},n.look,{shoes:'chunky'})}closeSheet();gemPop(-g.g);hud();toast(`${g.ic} Gift sent to ${n.name}!`);
  try{window.track&&window.track('spend_gems',{item:'gift_'+g.id,gems:g.g})}catch(e){}
  setTimeout(()=>msg(n.name,love?pick([`Ei!! ${g.name.toLowerCase()} for me?? 🥺❤️ You're too sweet`,`I'm literally smiling at my phone right now 🙈❤️ Thank you`,`My roommates are jealous 😂❤️ Thank you, babe`]):pick([`Ah, thank you o! 🙏😄 You didn't have to`,`Chale, you're a real one 🙌`,`This made my day, thank you 😊`])),1800);
  if(p.partner&&p.partner!==n&&love)try{cheatRisk(n,'flirt')}catch(e){}}
/* 📸 TikToks from the ring light: fun, followers, and now and then a paid brand deal */
function filmTikTok(){const p=P();doAct('Filming a TikTok',30,{fun:12,social:6});const t=S.busy;if(!t)return;const d=t.done;t.done=()=>{d();p.tt=(p.tt||0)+RI(20,140);const r=Math.random();
  if(r<.08){const pay=pick([150,250,400]);p.money+=pay;msg('Brand deals','🔥 Your video went viral! A sobolo brand paid you '+cedi(pay)+' for a shoutout.');toast(`📈 Viral! ${p.tt} followers now`)}else toast(`📸 Posted! ${p.tt} followers. ${r<.4?'Your coursemates are sharing it 😂':'Small views, but you\'re growing'}`)}}
/* the AC: better sleep; the PS5: friends more willing to come for FIFA */
{const _sl=sleep;sleep=function(){const r=_sl.apply(this,arguments);try{if(P().items.includes('ac')&&IS&&IS.mine){const b=S.busy;if(b){const d=b.done;b.done=()=>{d();addBuff('rested');P().needs.energy=clamp(P().needs.energy+10)}}}}catch(e){}return r}}
{const _f=playFifa;playFifa=function(){const r=_f.apply(this,arguments);try{if(P().items.includes('ps5')){const b=S.busy;if(b&&b.timed&&b.timed.fx)b.timed.fx.fun=Math.round((b.timed.fx.fun||0)*1.3)}}catch(e){}return r}}
