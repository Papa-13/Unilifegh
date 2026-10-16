/* ================= MoMo between real players: send money, borrow, lend, pay back =================
   For online students on the website, cedis are checked by the server (api/momo.js): your game
   reports your balance every 15 s, and the bank only lets it rise as fast as a real student could
   earn, so faked money can't be sent to anyone. Money sent to you arrives on the next check.
   Loans: the borrower asks (amount, days, reason); the lender sees the borrower's record and
   decides; the bank moves the money and tracks the loan for both. Paying back late marks a
   "⚠️ late" on the borrower's record, which every player can see on their card.
   Messages: lq ask to borrow · la lent · ln said no · mo "money sent, check your MoMo". */
const MB={on:false,ack:[],shown:new Set(),last:null,busy:false,reminded:{},rep:{}};
const LOAN_KINDS=['lq','la','ln','mo'];
const mbOK=()=>!!(window.fbIdToken&&typeof MP!=='undefined'&&MP.campus&&MP.uid&&S&&S.p);
async function mbCall(body){let tok=null;try{tok=await window.fbIdToken()}catch(e){}if(!tok)return null;let r;
  try{r=await fetch('/api/momo',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+tok},body:JSON.stringify(body)})}catch(e){return {offline:true}}
  if(r.status===404||r.status===503){MB.on=false;return null}const j=await r.json().catch(()=>null);if(j&&typeof j.money==='number')mbApply(j);return j}
/* the bank's answer is the truth: set the balance, show money that arrived, remind about loans */
function mbApply(j){if(!S||!S.p)return;MB.on=true;MB.last=j;P().money=j.money;
  for(const c of j.credits||[]){if(MB.shown.has(c.id))continue;MB.shown.add(c.id);MB.ack.push(c.id);
    const t=c.kind==='loan'?`💸 ${c.nm} lent you ${cedi(c.amt)}`:c.kind==='repay'?`💸 ${c.nm} paid you back ${cedi(c.amt)}`:`💸 ${c.nm} sent you ${cedi(c.amt)}${c.note?` · "${c.note}"`:''}`;
    toast(t);try{mpSys(c.from,t);mpPing()}catch(e){}}
  for(const [id,L] of Object.entries(j.loansIn||{})){if(L.done)continue;const left=L.due-Date.now(),k=id+(left<0?'late':left<86400e3?'soon':'');
    if(left<86400e3&&!MB.reminded[k]){MB.reminded[k]=1;toast(left<0?`⚠️ Your loan from ${L.nm} is overdue. Pay ${cedi(L.amt-L.paid)} back in Phone → MoMo.`:`⏰ Your loan from ${L.nm} is due ${mbWhen(L.due)}. Owe ${cedi(L.amt-L.paid)}.`)}}
  try{hud()}catch(e){}}
async function mbSync(reset){if(!mbOK()||MB.busy)return;MB.busy=true;try{const j=await mbCall({op:reset?'reset':'sync',money:Math.round(P().money),ack:MB.ack.splice(0)});if(j&&j.clamped&&!reset)toast('💸 The MoMo bank corrected your balance.')}finally{MB.busy=false}}
setInterval(()=>{if(S&&S.p&&$('game')&&!$('game').hidden)mbSync(false)},15000);
const mbWhen=t=>{const d=t-Date.now();if(d<0)return 'overdue';if(d<3600e3)return 'within the hour';if(d<86400e3)return `in ${Math.ceil(d/3600e3)} h`;return `in ${Math.round(d/86400e3)} day${Math.round(d/86400e3)>1?'s':''}`};
async function mbRep(uid){if(MB.rep[uid]&&Date.now()-MB.rep[uid].t<60000)return MB.rep[uid];let r={late:0,repaid:0};try{const s=await MP.db.doc('rep/'+uid).get();if(s.exists)r=Object.assign(r,s.data()||{})}catch(e){}r.t=Date.now();MB.rep[uid]=r;return r}
const mbRepTxt=r=>r?`${r.repaid?`✅ paid back ${r.repaid} loan${r.repaid>1?'s':''}`:'No loans paid back yet'}${r.late?` · ⚠️ ${r.late} late`:''}`:'';

/* send money: a gift, a loan (after they asked) or paying back */
async function mbSend(ck,nm,amt,kind,extra={}){if(!MB.on)return toast('Sending money works on the YOLO website, on an online campus.');
  const j=await mbCall({op:'send',to:ck,amt,kind,nm:P().name,toNm:nm,money:Math.round(P().money),ack:MB.ack.splice(0),...extra});
  if(!j||j.offline){toast('💸 Couldn\'t reach the MoMo bank. Check your connection.');return null}if(j.error){toast('💸 '+j.error);return null}
  try{mpSend(ck,'mo',kind)}catch(e){}const t=kind==='loan'?`You lent ${nm} ${cedi(amt)} 💸`:kind==='repay'?`You paid ${nm} back ${cedi(amt)} 💸`:`You sent ${nm} ${cedi(amt)} 💸`;mpSys(ck,t);toast('✅ '+t);return j}

/* the sheets: send, ask to borrow */
function mbSendSheet(ck,nm){S.paused=true;openSheet();$('sheetIn').innerHTML=`<h3>📲 Send money to ${esc(nm)}</h3><p style="font-size:14px">Your MoMo: <b>${cedi(P().money)}</b></p>
  <div class="row"><input id="mbAmt" type="number" min="1" max="5000" inputmode="numeric" placeholder="Amount (GH₵)" style="flex:1"><input id="mbNote" maxlength="16" placeholder="Note (optional)" style="flex:1"></div>
  <div class="row" style="margin-top:8px"><button class="btn" id="mbGo">Send</button><button class="ghost" id="bye">Cancel</button></div>`;
  $('bye').onclick=closeSheet;$('mbGo').onclick=async()=>{const a=Math.floor(+$('mbAmt').value||0);if(a<1)return toast('Enter an amount.');if(!confirm(`Send ${cedi(a)} to ${nm}?`))return;$('mbGo').disabled=true;const j=await mbSend(ck,nm,a,'gift',{note:mpClean($('mbNote').value,16)});if(j)closeSheet();else $('mbGo').disabled=false}}
function mbBorrowSheet(ck,nm){S.paused=true;openSheet();$('sheetIn').innerHTML=`<h3>🤝 Ask ${esc(nm)} to lend you money</h3><p style="font-size:13px;opacity:.85">${esc(nm)} sees your request and your record of paying back. If you pay back late, everyone sees ⚠️ late on your card.</p>
  <div class="row"><input id="mbAmt" type="number" min="1" max="5000" inputmode="numeric" placeholder="Amount (GH₵)" style="flex:1"><select id="mbDays" style="flex:1;font:inherit;background:var(--bg);color:var(--fg);border:1.5px solid var(--line);border-radius:10px;padding:10px">${[1,2,3,5,7].map(d=>`<option value="${d}" ${d===3?'selected':''}>Pay back in ${d} day${d>1?'s':''}</option>`).join('')}</select></div>
  <input id="mbWhy" maxlength="40" placeholder="What's it for? e.g. textbook, transport" style="width:100%;margin-top:8px">
  <div class="row" style="margin-top:8px"><button class="btn" id="mbGo">🤝 Ask</button><button class="ghost" id="bye">Cancel</button></div>`;
  $('bye').onclick=closeSheet;$('mbGo').onclick=()=>{const a=Math.floor(+$('mbAmt').value||0);if(a<1||a>5000)return toast('Ask for between GH₵1 and GH₵5,000.');const days=+$('mbDays').value,why=mpClean($('mbWhy').value,40);
    const id=(MP.uid||'x').slice(0,6)+Date.now().toString(36);relSend(ck,'lq',[id,a,days,why].join('|'));mpSys(ck,`You asked ${nm} to lend you ${cedi(a)} for ${days} day${days>1?'s':''} 🤝`);closeSheet();toast(`🤝 You asked ${nm}. Waiting for their answer…`)}}

/* messages about loans (live or from the mailbox) */
function loanIn(ck,nm,k,tx,id){const seen=relSeen();if(id){if(seen.has(id))return;seen.add(id);mpStore.set('relSeen',[...seen].slice(-300))}if(MP.blocked[ck])return;nm=mpClean(nm,16)||'Someone';
  if(k==='mo'){mbSync(false);return}
  if(k==='lq'){const [lid,a,days,why]=String(tx).split('|');const amt=Math.floor(+a||0),d=Math.floor(+days||0);if(!(amt>0)||!(d>0))return;
    mbRep(ck).then(r=>relShow(`<div class="eyebrow">🤝 Loan request</div><h3>${esc(nm)} wants to borrow ${cedi(amt)}</h3><p class="scene">They'll pay you back in <b>${d} day${d>1?'s':''}</b>${why?` · for “${esc(why)}”`:''}.</p><p style="font-size:14px">${esc(nm)}'s record: <b>${esc(mbRepTxt(r))}</b><br>Your MoMo: <b>${cedi(P().money)}</b></p>`,
      [[`💸 Lend ${cedi(amt)}`,'g',async()=>{const j=await mbSend(ck,nm,amt,'loan',{days:d,id:lid});if(j)relSend(ck,'la',[lid,amt,j.due].join('|'))}],
       ['Not now','',()=>{relSend(ck,'ln',lid);mpSys(ck,`You said no to lending ${cedi(amt)}`)}]]));return}
  if(k==='la'){const [lid,a,due]=String(tx).split('|');mbSync(false);relShow(`<div class="eyebrow">🤝 Loan</div><h3>${esc(nm)} lent you ${cedi(+a||0)}!</h3><p class="scene">Pay it back by ${due?new Date(+due).toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'short'}):'the due date'} in Phone → MoMo. Paying on time builds your record.</p>`,[['👍 Thanks','g',()=>{}]]);return}
  if(k==='ln'){toast(`🤝 ${nm} can't lend you money right now.`);mpSys(ck,`${nm} said no to your loan request`);return}}

/* Phone → MoMo: loans with real players */
function mbLoansHTML(){if(!MB.on||!MB.last)return '';const I=Object.entries(MB.last.loansIn||{}).filter(([,L])=>!L.done),O=Object.entries(MB.last.loansOut||{}).filter(([,L])=>!L.done);
  return `<h3>🌐 Loans with real students</h3>${I.length||O.length?'':'<p style="font-size:13px">No loans. Ask a real friend from their player card (🤝 Ask to borrow).</p>'}
  <div class="list">${I.map(([id,L])=>`<div class="item"><div class="grow"><b>You owe ${esc(L.nm)} ${cedi(L.amt-L.paid)}</b><small>${L.due<Date.now()?'⚠️ overdue':'due '+mbWhen(L.due)}${L.paid?` · paid ${cedi(L.paid)} so far`:''}</small></div><button class="btn sm" data-repay="${esc(id)}">Pay back</button></div>`).join('')}
  ${O.map(([id,L])=>`<div class="item"><div class="grow"><b>${esc(L.nm)} owes you ${cedi(L.amt-L.paid)}</b><small>${L.due<Date.now()?'⚠️ overdue':'due '+mbWhen(L.due)}</small></div><button class="ghost sm" data-remind="${esc(L.to)}|${esc(L.nm)}|${L.amt-L.paid}">⏰ Remind</button></div>`).join('')}</div>`}
function mbLoansWire(redraw){document.querySelectorAll('[data-repay]').forEach(b=>b.onclick=async()=>{const L=MB.last.loansIn[b.dataset.repay];if(!L)return;const left=L.amt-L.paid;
    if(P().money<left)return toast(`You need ${cedi(left)} on MoMo to pay ${L.nm} back.`);b.disabled=true;const j=await mbSend(L.from,L.nm,left,'repay',{loanId:b.dataset.repay});redraw()});
  document.querySelectorAll('[data-remind]').forEach(b=>b.onclick=()=>{const [to,nm,amt]=b.dataset.remind.split('|');relSend(to,'m',`⏰ Friendly reminder: you owe me ${cedi(+amt)}. Pay me back when you can 🙏`);mpSys(to,'You sent a reminder ⏰');b.disabled=true;toast(`⏰ Reminder sent to ${nm}`)})}
