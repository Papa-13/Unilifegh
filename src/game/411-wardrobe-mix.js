/* ================= mix and match in your wardrobe =================
   Besides full outfits, pick your bottoms (jeans, cargo, skirts…) and your shoes separately, any time,
   from the wardrobe in your room. */
{const _w=wardrobe;wardrobe=function(){const r=_w.apply(this,arguments);try{const p=P(),L=p.look,g=L.gender,box=$('sheetIn');if(!box)return r;
  const full=FULL_OUTFITS.includes(L.outfit),bb=Object.entries(BOTTOMS[g]).map(([k,v])=>`<button class="chip${(L.bottom||'match')===k?' on':''}" data-wb="${k}">${esc(v)}</button>`).join(''),
    ss=Object.entries(SHOES).filter(([k])=>g==='f'||!SHOES_F_ONLY.includes(k)).map(([k,v])=>`<button class="chip${L.shoes===k?' on':''}" data-ws="${k}">${esc(v)}</button>`).join('');
  const sw=(key,obj)=>`<button class="chip${!L[key]?' on':''}" data-wc="${key}" data-v="">Default</button>`+Object.entries(obj).map(([c,n])=>`<button class="sw" data-wc="${key}" data-v="${c}" title="${n}" aria-label="${n}" aria-pressed="${L[key]===c}" style="background:${c};width:28px;height:28px;border-radius:50%"></button>`).join('');
  const d=document.createElement('div');d.innerHTML=`<h4 style="margin:14px 0 6px">👖 Bottoms</h4>${full?'<p style="font-size:13px;margin:0">Your outfit is a one-piece. Change into a top to mix and match.</p>':`<div class="chips">${bb}</div><div class="chips" style="margin-top:6px">${sw('botCol',BOT_COLS)}</div>`}<h4 style="margin:14px 0 6px">👟 Shoes</h4><div class="chips">${ss}</div><div class="chips" style="margin-top:6px">${sw('shoeCol',SHOE_COLS)}</div>`;
  const bye=$('bye');box.insertBefore(d,bye||null);
  d.querySelectorAll('[data-wb]').forEach(b=>b.onclick=()=>{L.bottom=b.dataset.wb;rebuildPlayer();closeSheet();toast(`👖 ${BOTTOMS[g][L.bottom]==='✨ Goes with the top'?'Back to the full outfit':BOTTOMS[g][L.bottom]} on ✨`)});
  d.querySelectorAll('[data-wc]').forEach(b=>b.onclick=()=>{L[b.dataset.wc]=b.dataset.v||undefined;if(!b.dataset.v)delete L[b.dataset.wc];rebuildPlayer();closeSheet();toast('🎨 Colour changed ✨')});
  d.querySelectorAll('[data-ws]').forEach(b=>b.onclick=()=>{L.shoes=b.dataset.ws;rebuildPlayer();closeSheet();toast(`👟 ${SHOES[L.shoes]} on ✨`)})}catch(e){console.warn(e)}return r}}
