/* ================= keep your progress =================
   Three ways your student survives:
   - this phone: saved in the browser every 30 s (always on)
   - your Google account: saved to the cloud every 5 min and when you leave, continue on any device
   - a backup code / file: copy it into WhatsApp or download it, restore it on any phone (no account needed) */
const saveWhere=()=>{const a=window.fbAccount&&fbAccount.info();return a&&a.google?{k:'google',t:`☁️ Saved to Google${a.email?' · '+a.email:''}`}:a?{k:'guest',t:'📱 Guest: saved on this phone only'}:{k:'local',t:'📱 Saved on this phone only'}};
async function packSave(sv){const js=JSON.stringify(sv);try{const cs=new Blob([js]).stream().pipeThrough(new CompressionStream('gzip'));const buf=new Uint8Array(await new Response(cs).arrayBuffer());let b='';for(let i=0;i<buf.length;i+=8192)b+=String.fromCharCode.apply(null,buf.subarray(i,i+8192));return 'CHALE1:'+btoa(b)}catch(e){return 'CHALE0:'+btoa(unescape(encodeURIComponent(js)))}}
async function unpackSave(code){code=String(code||'').trim().replace(/\s+/g,'');try{if(code.startsWith('CHALE1:')){const bin=atob(code.slice(7)),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
    const ds=new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'));return JSON.parse(await new Response(ds).text())}if(code.startsWith('CHALE0:'))return JSON.parse(decodeURIComponent(escape(atob(code.slice(7)))));return JSON.parse(code)}catch(e){return null}}
const saveOK=x=>x&&x.v===1&&x.p&&x.pre&&x.look&&ROOMS[x.pre.room];
async function progressSheet(){S&&(S.paused=true);openSheet();const close=()=>{if(S)closeSheet();else $('sheet').hidden=true};const w=saveWhere(),sv=S&&S.p?makeSave():await findSave(),on=!!window.fbAccount;
  $('sheetIn').innerHTML=`<div class="row" style="justify-content:space-between"><h3>💾 Your progress</h3><button class="ghost sm" id="bye">Close</button></div>
   <p style="margin:0 0 10px"><b>${w.t}</b>${saveGame.cloudOK&&w.k!=='local'?`<br><small style="opacity:.75">Last cloud save ${hmAgo(saveGame.cloudOK)}</small>`:''}</p>
   ${w.k!=='google'?(on?`<div class="item" style="display:block"><b>☁️ Keep your student safe with Google</b><p style="font-size:13px;margin:4px 0 8px">Free. Continue on any phone or computer, and your 💎 gems stay with you.</p><button class="btn sm" id="pgG">Continue with Google</button></div>`:`<p style="font-size:13px;opacity:.8">Cloud save needs the Chale website (sign in with Google there).</p>`):''}
   <div class="item" style="display:block;margin-top:10px"><b>🔐 Back up your student</b><p style="font-size:13px;margin:4px 0 8px">Copy the code into WhatsApp or download the file. Restore it on any phone, no account needed.</p>
     <div class="row"><button class="btn sm" id="pgCopy" ${sv?'':'disabled'}>📋 Copy backup code</button><button class="ghost sm" id="pgFile" ${sv?'':'disabled'}>⬇️ Download file</button></div><p id="pgMsg" style="font-size:13px;min-height:18px"></p></div>
   <div class="item" style="display:block"><b>♻️ Restore a student</b><p style="font-size:13px;margin:4px 0 8px">Paste a backup code, or open a backup file. It replaces the student on this phone.</p>
     <textarea id="pgCode" rows="3" placeholder="CHALE1:…" style="width:100%;box-sizing:border-box;font:12px monospace;background:var(--bg);color:var(--fg);border:1.5px solid var(--line);border-radius:10px;padding:8px"></textarea>
     <div class="row" style="margin-top:6px"><button class="btn sm" id="pgRest">Restore</button><label class="ghost sm" style="cursor:pointer;padding:8px 12px;border:1.5px solid var(--line);border-radius:999px">📂 Open file<input type="file" id="pgIn" accept=".chale,.txt,application/json,text/plain" hidden></label></div><p id="pgMsg2" style="font-size:13px;min-height:18px"></p></div>`;
  $('bye').onclick=close;
  if($('pgG'))$('pgG').onclick=async()=>{try{if(S&&S.p){saveGame.force=true;await saveGame()}await fbAccount.google()}catch(e){toast('Google sign-in did not finish. Try again.')}};
  const code=async()=>packSave(S&&S.p?makeSave():sv);
  $('pgCopy').onclick=async()=>{const c=await code();try{await navigator.clipboard.writeText(c);$('pgMsg').textContent=`✅ Copied (${Math.round(c.length/1024)} KB). Paste it in WhatsApp "Message yourself".`}catch(e){$('pgCode').value=c;$('pgMsg').textContent='Copy the code from the box below.'}};
  $('pgFile').onclick=async()=>{const c=await code(),nm=((sv&&sv.p&&sv.p.name)||'student').replace(/[^\w]+/g,'-');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([c],{type:'text/plain'}));a.download=`chale-${nm}-${new Date().toISOString().slice(0,10)}.chale`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500);$('pgMsg').textContent='✅ Backup file downloaded.'};
  const restore=async txt=>{const x=await unpackSave(txt);if(!saveOK(x)){$('pgMsg2').textContent='❌ That backup is not valid. Check you copied all of it.';return}
    if(!confirm(`Restore ${mpClean(x.p.name,16)} (${x.p.prog||''})? This replaces the student on this phone.`))return;x.ts=Date.now();try{localStorage.setItem('freshers-save',JSON.stringify(x))}catch(e){}
    if(MP.db&&MP.uid)try{await MP.db.doc('data/users/'+MP.uid+'/save').set(x)}catch(e){}close();toast(`♻️ ${mpClean(x.p.name,16)} is back!`);setTimeout(()=>location.reload(),900)};
  $('pgRest').onclick=()=>restore($('pgCode').value);
  $('pgIn').onchange=async e=>{const f=e.target.files&&e.target.files[0];if(f)restore(await f.text())}}
function hmAgo(t){const s=(Date.now()-t)/1000;return s<90?'just now':s<3600?Math.round(s/60)+' min ago':Math.round(s/3600)+' h ago'}
