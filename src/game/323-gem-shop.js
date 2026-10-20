/* ================= 💎 Gem Shop: buy gems with MoMo or card (Paystack) =================
   From GH₵1. The player picks a pack, pays on Paystack's page (MTN MoMo, Telecel Cash, AirtelTigo Money or card),
   comes back to the game, and the server checks the payment with Paystack before adding the gems
   (api/pay.js; a webhook also credits them if the player never comes back). Needs a signed-in account,
   because gems live on the server. If the shop isn't set up yet it shows "coming soon". */
const SHOP_G={packs:null,on:null};
async function payCall(body,auth){const h={'Content-Type':'application/json'};if(auth){let t=null;try{t=window.fbIdToken&&await fbIdToken()}catch(e){}if(!t)return{error:'Sign in first.',signin:1};h.Authorization='Bearer '+t}
  try{const r=await fetch('/api/pay',{method:'POST',headers:h,body:JSON.stringify(body)});if(r.status===404)return{error:'The gem shop is coming soon.',off:1};return await r.json().catch(()=>({error:'Something went wrong.'}))}catch(e){return{error:'No connection. Check your data.',offline:1}}}
async function gemShop(){S&&(S.paused=true);openSheet();const close=()=>{if(S)closeSheet();else $('sheet').hidden=true};
  $('sheetIn').innerHTML='<h3>💎 Gem Shop</h3><p>Loading…</p>';
  if(!SHOP_G.packs){const j=await payCall({op:'packs'});SHOP_G.on=!!(j&&j.on);SHOP_G.packs=(j&&j.packs)||{p1:{cedis:1,gems:5},p2:{cedis:2,gems:11},p5:{cedis:5,gems:30,name:'Multipack'},p10:{cedis:10,gems:65,cash:1000},p20:{cedis:20,gems:140,cash:3000},p50:{cedis:50,gems:380,cash:10000}}}
  const acc=window.fbAccount&&fbAccount.info(),signed=!!(acc&&window.fbIdToken),best='p5';
  $('sheetIn').innerHTML=`<div class="row" style="justify-content:space-between"><h3>💎 Gem Shop</h3><button class="ghost sm" id="bye">Close</button></div>
   <p style="font-size:13px;margin:0 0 8px">You have <b>💎 ${S?S.gems||0:'…'}</b>. Spend them on limited prints, room flex, gifts for your person, or <b>⚡ Finish now</b>. Pay with MTN MoMo, Telecel Cash, AirtelTigo Money or card.</p>
   <div class="say" style="margin:0 0 8px">🎉 <b>First top-up doubles your gems.</b> Your first pack on this account gives 2× the gems.</div><button class="ghost sm" id="gsDrip" style="margin-bottom:6px">✨ See what gems buy</button>
   ${!SHOP_G.on?'<p class="tag y" style="display:inline-block">🚧 Coming soon: buying gems opens shortly. You can still earn them free from 🎯 tasks.</p>':!signed?`<p style="font-size:13px">Sign in first so your gems are saved to your account.</p>${window.fbAccount?'<button class="btn sm" id="gsG">Continue with Google</button>':''}`:acc&&!acc.google?'<p style="font-size:12px;opacity:.75">Tip: link Google (💾 Backup) so bought gems are never lost if you clear this phone.</p>':''}
   <div class="list" style="margin-top:8px">${Object.entries(SHOP_G.packs).map(([k,p])=>`<div class="item"><span style="font-size:26px">${p.gems>=300?'💰':p.gems>=100?'🎁':p.gems>=30?'💎💎':'💎'}</span><div class="grow"><b>${p.gems} gems${p.cash?` + ${cedi(p.cash)} cash`:''}</b>${k===best?' <span class="tag g">Best start</span>':''}<small>${p.name||''}${p.gems/p.cedis>5.5?` · ${Math.round((p.gems/p.cedis/5-1)*100)}% bonus`:''}</small></div><button class="btn sm" data-pk="${k}" ${SHOP_G.on&&signed?'':'disabled'}>GH₵${p.cedis}</button></div>`).join('')}</div>
   <p id="gsMsg" style="font-size:13px;min-height:18px"></p><p style="font-size:11px;opacity:.6">Payments are handled by Paystack. Gems are for use in Unilife GH only and can't be cashed out.</p>`;
  $('bye').onclick=close;if($('gsDrip'))$('gsDrip').onclick=()=>dripStore();if($('gsG'))$('gsG').onclick=async()=>{try{if(S&&S.p){saveGame.force=true;await saveGame()}await fbAccount.google()}catch(e){toast('Google sign-in did not finish.')}};
  $('sheetIn').querySelectorAll('[data-pk]').forEach(b=>b.onclick=async()=>{b.disabled=true;$('gsMsg').textContent='Opening Paystack…';
    if(S&&S.p){saveGame.force=true;try{await saveGame()}catch(e){}}
    const j=await payCall({op:'start',pack:b.dataset.pk,back:location.origin+location.pathname},true);
    if(!j||!j.url){b.disabled=false;$('gsMsg').textContent='❌ '+((j&&j.error)||'Could not start the payment.');return}
    try{localStorage.setItem('chale-pay',j.ref)}catch(e){}location.href=j.url})}
/* coming back from Paystack (?reference=…): check the payment and add the gems */
async function payReturn(){let ref=null;try{const u=new URL(location.href);ref=u.searchParams.get('reference')||u.searchParams.get('trxref');if(ref){u.searchParams.delete('reference');u.searchParams.delete('trxref');history.replaceState(null,'',u.pathname+(u.search||'')+u.hash)}}catch(e){}
  if(!ref)try{ref=localStorage.getItem('chale-pay')}catch(e){}if(!ref)return;
  for(let i=0;i<6;i++){const j=await payCall({op:'check',ref},true);
    if(j&&typeof j.gems==='number'&&!j.error){try{localStorage.removeItem('chale-pay')}catch(e){}if(typeof GB!=='undefined'){GB.bal=j.gems;GB.on=true}if(S)S.gems=j.gems;try{hud()}catch(e){}
      if(j.added)try{const PR={p1:1,p2:2,p5:5,p10:10,p20:20,p50:50};window.track&&window.track('purchase',{currency:'GHS',value:PR[j.pack]||0,items:[{item_name:(j.pack||'')+' '+j.added+' gems'}]})}catch(e){}
      if(j.added)toast(`💎 Payment received! +${j.added} gems${j.first?' (first top-up: doubled! 🎉)':''}${j.cash?` and ${cedi(j.cash)} cash`:''}. Thank you 🙏`);setTimeout(payClaim,1500);return}
    if(j&&j.pending){await new Promise(r=>setTimeout(r,4000));continue}
    if(j&&(j.signin||j.offline)){await new Promise(r=>setTimeout(r,3000));continue}
    try{localStorage.removeItem('chale-pay')}catch(e){}if(j&&j.error&&!/not found/i.test(j.error))toast('💎 '+j.error);return}}
setTimeout(()=>mpWhenReady(()=>setTimeout(payReturn,1200)),0);

/* the bigger packs come with in-game cedis: collect them into this student once (they wait on the server until then) */
async function payClaim(){if(!S||!S.p||payClaim.busy||!window.fbIdToken)return;payClaim.busy=true;try{const j=await payCall({op:'claim'},true);
  if(j&&j.cash>0){P().money+=j.cash;try{if(j.bank&&typeof mbSync==='function')await mbSync()}catch(e){}if(typeof saveGame==='function'){saveGame.force=true;saveGame()}hud();toast(`💸 ${cedi(j.cash)} from your gem pack is on your MoMo!`)}}finally{payClaim.busy=false}}
