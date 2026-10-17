/* ================= proper dates with a real partner =================
   From a real student's card, plan a date at a venue. If they say yes, you both head there.
   When you are both at the venue you get date actions (share a meal, deep talk, couple photo,
   slow dance, watch the sunset). Each one builds romance for both of you, and your partner sees
   what you did. After 4 moments the date ends with a rating.
   Live messages: dt invite (venue) · da yes · dn no · dx a date moment / end. */
const DATE_KINDS=['dt','da','dn','dx'];
const DATE_VENUES={shawarma:{n:'Shawarma & Pizza Spot',ic:'🍕',meal:45},lake:{n:'Campus Lake',ic:'🌅',meal:0},night:{n:'Night Market',ic:'🌃',meal:30},club:{n:'Club Vibes',ic:'💃',meal:0}};
const DATE_MOMENTS={meal:['🍽️','shared a meal with you',8],talk:['💬','had a deep talk with you',6],photo:['📸','took a couple photo of you two',5],dance:['💃','slow danced with you',7],sunset:['🌅','watched the sunset with you',10]};
function datePlan(ck,nm){S.paused=true;openSheet();$('sheetIn').innerHTML=`<h3>🌹 Plan a date with ${esc(nm)}</h3><p style="font-size:14px">Pick a place. If ${esc(nm)} says yes, you both go there now.</p>
  <div class="list">${Object.entries(DATE_VENUES).map(([k,v])=>`<div class="item"><div class="grow"><b>${v.ic} ${esc(v.n)}</b><small>${k==='lake'?'Romantic at sunset (17:00–19:00)':k==='club'?'Open at night':k==='night'?'Street food & lights in the evening':'Pizza, shawarma, a quiet table'}</small></div><button class="btn sm" data-dv="${k}">Invite</button></div>`).join('')}</div><button class="ghost sm" id="bye">Cancel</button>`;
  $('bye').onclick=closeSheet;$('sheetIn').querySelectorAll('[data-dv]').forEach(b=>b.onclick=()=>{if(!mpSend(ck,'dt',b.dataset.dv))return toast(`${nm} needs to be online on this campus.`);closeSheet();toast(`🌹 You invited ${nm} to ${DATE_VENUES[b.dataset.dv].n}. Waiting for an answer…`)})}
function dateStart(ck,nm,v){S.date={ck,nm,v,t0:S.min,acts:0,score:0,done:{}};const V=DATE_VENUES[v];toast(`🌹 Date on! Meet ${nm} at ${V.n} ${V.ic}`);try{if(IS&&IS.bid===v)return;walkTo(BID[v])}catch(e){}}
function dateIn(ck,nm,k,tx){if(MP.blocked[ck])return;nm=mpClean(nm,16)||'Someone';
  if(k==='dt'){const V=DATE_VENUES[tx];if(!V)return;const r=relGet(),other=r&&r.ck!==ck;
    relShow(`<div class="eyebrow">🌹 Date invitation</div><h3>${esc(nm)} wants to take you on a date</h3><p class="scene">At <b>${V.ic} ${esc(V.n)}</b>, right now.${other?` (You're dating ${esc(r.nm)}… people talk 👀)`:''}</p>`,
      [['😍 Yes, let\'s go','g',()=>{mpSend(ck,'da',tx);dateStart(ck,nm,tx)}],['Not today','',()=>mpSend(ck,'dn',tx)]]);return}
  if(k==='da'){dateStart(ck,nm,tx);return}
  if(k==='dn'){toast(`🌹 ${nm} can't make it today.`);return}
  if(k==='dx'){if(tx==='end'){if(S.date&&S.date.ck===ck)dateEnd(true);return}const M=DATE_MOMENTS[tx];if(!M)return;romAdd(ck,Math.round(M[2]/2));toast(`${M[0]} ${nm} ${M[1]} ❤️`);try{const rp=[...MP.peers.values()].find(r=>mpKey(r)===ck);if(rp&&rp.mesh)setGest({mesh:rp.mesh},'wave',1.5)}catch(e){}}}
function datePartnerHere(){const D=S.date;if(!D)return false;const rp=[...MP.peers.values()].find(r=>mpKey(r)===D.ck);if(!rp)return false;
  if(IS)return rp.in===myInKey();const p=P();return !rp.in&&Math.hypot((rp.tx??rp.x)-p.x,(rp.ty??rp.y)-p.y)<230}
function dateAtVenue(){const D=S.date;if(!D)return false;if(IS)return IS.kind==='bld'&&IS.bid===D.v;const b=locOf(P().x,P().y);return !!b&&b.id===D.v}
function dateDo(k){const D=S.date,M=DATE_MOMENTS[k];if(!D||!M)return;const p=P(),V=DATE_VENUES[D.v];
  if(k==='meal'){if(V.meal&&!spend(V.meal))return;doAct('Sharing a meal on your date',40,{hunger:45,fun:10,social:10})}
  else if(k==='talk')doAct('Deep talk on your date',30,{social:15,fun:6});
  else if(k==='dance')doAct('Slow dancing on your date',20,{fun:15,social:8});
  else if(k==='sunset')doAct('Watching the sunset together',30,{fun:14,social:10});
  else if(k==='photo'){try{if(typeof feedPost==='function'&&gfOn())feedPost(`On a date with ${D.nm} ❤️ ${V.ic}`);else toast('📸 Cute couple photo saved!')}catch(e){}}
  D.done[k]=1;D.acts++;D.score+=M[2];romAdd(D.ck,M[2]);mpSend(D.ck,'dx',k);try{setGest(p,k==='dance'?'dance':'hug',2)}catch(e){}
  if(D.acts>=4)setTimeout(()=>dateEnd(false),1200);acts(true)}
function dateEnd(theyEnded){const D=S.date;if(!D)return;S.date=null;if(!theyEnded)mpSend(D.ck,'dx','end');const stars=Math.max(1,Math.min(5,Math.round(D.score/6)));
  if(D.score>=20)romAdd(D.ck,6);P().needs.fun=clamp(P().needs.fun+8);
  story(`<div class="eyebrow">🌹 Date with ${esc(D.nm)} · ${esc(DATE_VENUES[D.v].n)}</div><h3>${'⭐'.repeat(stars)}${'☆'.repeat(5-stars)}</h3><p class="scene">${stars>=4?`You both didn't want it to end. ${esc(D.nm)} texts you "I had the best time 🥰" before you even get home.`:stars>=2?'It was sweet. A few awkward silences, but lots of laughs.':'Short and a bit awkward. Maybe next time will be better.'}</p>`,[['❤️','g',()=>{}]]);acts(true)}
function dateActs(list){const D=S.date;if(!D)return;if(S.min-D.t0>300){dateEnd(false);return}
  if(!dateAtVenue()){list.unshift([`🌹 Go to ${DATE_VENUES[D.v].n} for your date with ${D.nm}`,()=>walkTo(BID[D.v]),null,'b']);list.push(['💔 Cancel the date',()=>dateEnd(false)]);return}
  if(!datePartnerHere()){list.unshift([`🌹 Waiting for ${D.nm} to arrive…`,null]);list.push(['💔 Cancel the date',()=>dateEnd(false)]);return}
  const V=DATE_VENUES[D.v],h=hour(),opts=[['meal',V.meal?`🍽️ Share a meal (${cedi(V.meal)})`:null],['talk','💬 Have a deep talk'],['photo','📸 Take a couple photo'],['dance',D.v==='shawarma'?null:'💃 Slow dance'],['sunset',D.v==='lake'&&h>=17&&h<19.3?'🌅 Watch the sunset together':null]];
  opts.filter(o=>o[1]&&!D.done[o[0]]).reverse().forEach(([k,t])=>list.unshift([`${t} with ${D.nm}`,()=>dateDo(k),null,'b']));list.push(['👋 End the date',()=>dateEnd(false)])}
