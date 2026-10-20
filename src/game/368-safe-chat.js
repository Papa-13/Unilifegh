/* ================= safer chat: swear filter and reporting =================
   Everything real players type (messages, campus chat, names, speech bubbles) passes through
   mpClean(), which now also hides swear words and slurs: "f***", "k*****". It covers English,
   Ghanaian Pidgin and Twi insults. Add words to SWEAR (lowercase); the filter matches whole
   words and common spellings with repeated letters or symbols in between ("f.u.c.k", "fuuuck").
   🚩 Report (on a player card or in a chat) saves a report the game's owner can read in
   Firebase → Firestore → reports, and can also block the player. */
const SWEAR=['fuck','fucking','fucker','motherfucker','shit','bullshit','bitch','bastard','asshole','arsehole','dick','pussy','cunt','whore','slut','nigga','nigger','faggot','fag','retard','cock','wanker','twat','porn','rape',
  // Ghanaian Pidgin / Twi
  'kwasia','kwasea','gyimi','gyimii','aboa','etwe','twe','kote','shua','ashawo','ashewo','kurasini','mumu','buulu','foolish','idiot','stupid'];
const SWEAR_RE=new RegExp('(^|[^\\p{L}\\p{N}])('+SWEAR.map(w=>[...w].map(ch=>ch.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'+').join('[\\s._*\\-]*')).join('|')+')(?:s|es|ed|er|ers|ing|y|ty|head|face)?(?=$|[^\\p{L}\\p{N}])','giu');
function swearMask(t){if(!t||typeof t!=='string')return t;return t.replace(SWEAR_RE,(all,pre)=>{const ch=[...all.slice(pre.length)];return pre+ch[0]+ch.slice(1).map(c=>/[\s._\-]/.test(c)?c:'*').join('')})}

/* 🚩 report a player */
function mpReport(ck,nm){S.paused=true;openSheet();const msgs=(typeof thread==='function'?thread(ck):[]).filter(m=>!m.me&&!m.sys&&m.k==='m').slice(-10).map(m=>({tx:mpClean(m.tx,240),t:+m.t||0}));
  const R=[['harass','Bullying or harassment'],['sexual','Sexual messages or behaviour'],['hate','Hate or slurs'],['scam','Scam or asking for money / numbers'],['spam','Spam'],['other','Something else']];
  $('sheetIn').innerHTML=`<h3>🚩 Report ${esc(nm)}</h3><p style="font-size:13px;opacity:.85">Reports go to the people who run Chale. ${msgs.length?`Their last ${msgs.length} message${msgs.length>1?'s':''} to you will be included.`:''} ${esc(nm)} won't know who reported them.</p>
    <div class="list">${R.map(([k,l],i)=>`<label class="item" style="cursor:pointer"><input type="radio" name="rr" value="${k}" ${i?'':'checked'}> <span class="grow">${l}</span></label>`).join('')}</div>
    <textarea id="rNote" maxlength="300" rows="3" placeholder="What happened? (optional)" style="width:100%;border-radius:12px;padding:10px;font:inherit;background:var(--bg);color:var(--fg);border:1.5px solid var(--line)"></textarea>
    <label style="display:flex;gap:8px;align-items:center;font-size:14px"><input type="checkbox" id="rBlock" checked> Also block ${esc(nm)}</label>
    <div class="row"><button class="btn" id="rSend">🚩 Send report</button><button class="ghost" id="bye">Cancel</button></div>`;
  $('bye').onclick=closeSheet;
  $('rSend').onclick=async()=>{const reason=(document.querySelector('input[name=rr]:checked')||{}).value||'other',note=mpClean($('rNote').value,300),blk=$('rBlock').checked;$('rSend').disabled=true;
    const rep={by:MP.uid||('p:'+(MP.peer||'')),about:ck,nm:mpClean(nm,16),reason,note,msgs,campus:MP.campus||'',at:Date.now()};let ok=false;
    try{if(MP.db){await MP.db.collection('reports').add(rep);ok=true}}catch(e){}
    if(!ok){const L=mpStore.get('reports',[]);L.push(rep);mpStore.set('reports',L.slice(-20))}
    if(blk){MP.blocked[ck]=1;mpStore.set('blocked',MP.blocked);if(S.follow&&[...MP.peers.values()].some(r=>r.peer===S.follow&&mpKey(r)===ck))S.follow=null}
    closeSheet();toast(ok?`🚩 Report sent. Thank you.${blk?` ${nm} is blocked.`:''}`:`🚩 Report saved.${blk?` ${nm} is blocked.`:''}`)}}
