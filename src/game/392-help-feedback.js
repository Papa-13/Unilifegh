/* ================= 💡 Help & feedback =================
   In the phone (Help app) and on the main menu: quick how-to answers, Terms and Privacy, and a form that
   sends bugs, ideas and payment problems straight to the developer (/api/feedback → Firestore "feedback"). */
const GAME_VER='1.0.0';
const HELP_FAQ=[['How do I earn gems?','Finish daily tasks (up to 3 gems a day), claim the 🎁 Daily Gift every 24 hours, reach milestones and life-goal steps, or buy them in the 💎 Gem Shop.'],
  ['My progress disappeared','Guests are saved on that phone only. Sign in with Google from the main menu so your student follows you to any phone, or use 💾 Backup to copy a backup code.'],
  ['I paid but didn\'t get my gems','Wait a minute and reopen the Gem Shop. If they still don\'t show, send a "Payment problem" below with your Paystack reference (from your receipt) and we\'ll fix it.'],
  ['How do I date someone?','Get to know them, become friends, then flirt. When the romance is high enough you can ask them on a date to Akwaaba Grill, Kente Cinemas, the Night Market or the lake.'],
  ['Where can I play games?','The 🕹️ Game Zone Arcade (pool, hoops, mini golf, darts, cup pong, penalties), and Oware in the hostel rooms.']];
function helpSheet(){let cat='bug';const draw=(note='')=>{openSheet();$('sheetIn').innerHTML=`<div class="eyebrow">💡 Help & feedback</div><h3>How can we help?</h3>
  <div class="list">${HELP_FAQ.map(([q,a],i)=>`<details class="item" style="display:block"><summary style="cursor:pointer;font-weight:700">${esc(q)}</summary><small style="display:block;margin-top:6px">${esc(a)}</small></details>`).join('')}</div>
  <h3 style="margin-top:14px">Send us a message</h3><div class="chips">${[['bug','🐞 Bug'],['idea','💡 Idea'],['pay','💳 Payment problem'],['other','💬 Other']].map(([k,l])=>`<button class="chip${cat===k?' on':''}" data-c="${k}">${l}</button>`).join('')}</div>
  <textarea id="fbTx" maxlength="1500" rows="5" style="width:100%;margin-top:8px;box-sizing:border-box;border-radius:12px;padding:10px;background:rgba(255,255,255,.06);color:inherit;border:1px solid rgba(255,255,255,.15);font:inherit" placeholder="${cat==='bug'?'What happened, and what were you doing just before?':cat==='pay'?'What did you buy, when, and the Paystack reference from your receipt':cat==='idea'?'What would make the game better?':'Tell us anything'}"></textarea>
  ${cat==='pay'?'<input id="fbRef" maxlength="80" placeholder="Paystack reference (optional)" style="width:100%;margin-top:6px;box-sizing:border-box;border-radius:10px;padding:9px;background:rgba(255,255,255,.06);color:inherit;border:1px solid rgba(255,255,255,.15)">':''}
  <input id="fbCt" maxlength="120" placeholder="Your email or WhatsApp, if you'd like a reply (optional)" style="width:100%;margin-top:6px;box-sizing:border-box;border-radius:10px;padding:9px;background:rgba(255,255,255,.06);color:inherit;border:1px solid rgba(255,255,255,.15)">
  ${note?`<div class="say" style="margin-top:8px">${note}</div>`:''}<button class="btn" id="fbSend" style="width:100%;margin-top:10px">Send</button>
  <p style="font-size:12px;opacity:.7;margin:10px 0 0"><a href="/terms.html" target="_blank">Terms of Use</a> · <a href="/privacy.html" target="_blank">Privacy Policy</a> · Version ${GAME_VER}</p>`;
  $('sheetIn').querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{const t=$('fbTx').value;cat=b.dataset.c;draw();$('fbTx').value=t});
  $('fbSend').onclick=async()=>{const text=$('fbTx').value.trim();if(text.length<3)return toast('Write a little more so we can help 🙂');const btn=$('fbSend');btn.disabled=true;btn.textContent='Sending…';
    try{const tok=window.fbIdToken?await window.fbIdToken().catch(()=>null):null;const r=await fetch('/api/feedback',{method:'POST',headers:Object.assign({'Content-Type':'application/json'},tok?{Authorization:'Bearer '+tok}:{}),
      body:JSON.stringify({cat,text,contact:$('fbCt').value,ref:$('fbRef')?$('fbRef').value:'',ver:GAME_VER,where:(()=>{try{return S&&S.p?(IS?IS.title:zoneName(P().x,P().y))+' · day '+day():'menu'}catch(e){return ''}})(),ua:navigator.userAgent})});
      const j=await r.json().catch(()=>({}));if(!r.ok){const er=new Error(j.error||'Could not send');er.srv=1;throw er}closeSheet();toast('✅ Thanks! Your message has been sent.');try{window.track&&window.track('feedback_sent',{cat})}catch(e){}}
    catch(e){btn.disabled=false;btn.textContent='Send';toast('😕 '+(e.srv&&e.message?e.message:'Could not send right now. Check your connection and try again.'))}}};draw()}
