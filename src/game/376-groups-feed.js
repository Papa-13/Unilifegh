/* ================= group chats and the campus feed (online campuses, website) =================
   👥 Group chats: everyone in your hostel, and everyone in your programme and level on this campus,
   share a group chat (Phone → Chats). Messages are kept, so you can catch up later.
   📸 Campus feed: take a photo of what's on your screen and post it with a caption for the whole
   campus. Others can like it ❤️. (Phone → Apps → Campus feed.) Stored in the Realtime Database
   under groups/ and feed/ (see firebase/database.rules.json). */
const GF={unsub:null,view:null,lastPost:0};
const gfOn=()=>typeof MP!=='undefined'&&!!MP.campus&&!!window.fbRT&&!!MP.uid;
const gfSlug=s=>{let h=0;for(const c of String(s))h=(h*31+c.charCodeAt(0))>>>0;return h.toString(36)};
function myGroups(){const p=P(),c=MP.campus;return[{id:`${c}-h-${p.home}`,name:`🏠 ${BID[p.home]?BID[p.home].name:'Hostel'} residents`,sub:'Everyone living in your hostel'},
  {id:`${c}-p-${gfSlug(p.prog)}-${levelOf(p)}`,name:`📚 ${p.prog} · L${levelOf(p)}`,sub:'Your course mates'}]}
function gfStop(){if(GF.unsub){try{GF.unsub()}catch(e){}GF.unsub=null}GF.view=null}
const gfOnce=path=>new Promise(r=>{let u=null,done=false;u=window.fbRT.watch(path,v=>{if(done)return;done=true;r(v);setTimeout(()=>{try{u&&u()}catch(e){}},0)})});
function gfHTML(){return gfOn()?`<div class="row" style="gap:6px;margin:0 0 8px">${myGroups().map(g=>`<button class="ghost sm" data-gc="${esc(g.id)}" style="flex:1">${esc(g.name)}</button>`).join('')}</div>`:''}
function gfWire(){document.querySelectorAll('[data-gc]').forEach(b=>b.onclick=()=>groupChat(b.dataset.gc))}
function groupChat(gid){const g=myGroups().find(x=>x.id===gid);if(!g)return;gfStop();S.paused=true;openSheet();GF.view=gid;const msgs=[];
  $('sheetIn').innerHTML=`<div class="eyebrow">Group chat · ${esc(campName(MP.campus))}</div><h3>${esc(g.name)}</h3><p style="font-size:12px;opacity:.75;margin:0 0 6px">${esc(g.sub)}. Be kind. Swear words are hidden.</p>
    <div id="gcM" style="max-height:46vh;overflow:auto;display:flex;flex-direction:column;gap:6px;padding:4px 0"></div>
    <div class="row" style="margin-top:8px"><input id="gcT" maxlength="240" placeholder="Message the group…" style="flex:1" autocomplete="off"><button class="btn sm" id="gcS">Send</button></div><button class="ghost sm" id="gcBack" style="margin-top:6px">Close</button>`;
  const draw=()=>{const M=$('gcM');if(!M)return;const atEnd=M.scrollTop+M.clientHeight>M.scrollHeight-40;
    M.innerHTML=msgs.length?msgs.map(m=>`<div style="align-self:${m.by===MP.uid?'flex-end':'flex-start'};max-width:82%;background:${m.by===MP.uid?'#2f5f3f':'rgba(255,255,255,.07)'};border-radius:12px;padding:6px 10px"><small style="opacity:.75;font-weight:700">${m.by===MP.uid?'You':esc(m.nm)} · ${new Date(m.at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</small><div>${esc(mpClean(m.tx,240))}</div></div>`).join(''):'<p style="font-size:13px;opacity:.7">No messages yet. Say hi 👋</p>';
    if(atEnd||msgs.length<3)M.scrollTop=M.scrollHeight};
  draw();
  GF.unsub=window.fbRT.listen('groups/'+gid+'/msgs',60,(k,v)=>{if(GF.view!==gid||$('sheet').hidden){gfStop();return}if(!v||MP.blocked[v.by])return;msgs.push(v);msgs.sort((a,b)=>a.at-b.at);draw()});
  const send=async()=>{const t=$('gcT'),v=mpClean(t.value,240);if(!v)return;t.value='';try{await window.fbRT.push('groups/'+gid+'/msgs',{by:MP.uid,nm:mpClean(P().name,16),tx:v,at:Date.now()})}catch(e){toast('Couldn\'t send. The game owner may need to update the database rules.')}};
  $('gcS').onclick=send;$('gcT').onkeydown=e=>{if(e.key==='Enter')send();e.stopPropagation()};$('gcBack').onclick=()=>{gfStop();closeSheet()}}

/* ---- campus feed ---- */
function feedShot(){try{render(0,true)}catch(e){}const src=cv,w=src.width,h=src.height,s=Math.min(w,h),c=document.createElement('canvas');c.width=c.height=360;
  c.getContext('2d').drawImage(src,(w-s)/2,(h-s)/2,s,s,0,0,360,360);let q=.62,d=c.toDataURL('image/jpeg',q);while(d.length>68000&&q>.25){q-=.1;d=c.toDataURL('image/jpeg',q)}return d}
async function feedPost(cap,shot){if(!gfOn())return toast('The campus feed works on online campuses on the YOLO website.');if(Date.now()-GF.lastPost<90000)return toast('📸 Wait a minute before posting again.');
  const img=shot||feedShot(),c=MP.campus;try{const id=await window.fbRT.push('feed/'+c+'/posts',{by:MP.uid,nm:mpClean(P().name,16),cap:mpClean(cap||'',120),at:Date.now()});await window.fbRT.set('feed/'+c+'/img/'+id,img);GF.lastPost=Date.now();toast('📸 Posted to the campus feed!');try{ev('post',1)}catch(e){}P().needs.social=clamp(P().needs.social+5);return id}
  catch(e){toast('Couldn\'t post. The game owner may need to update the database rules.');return null}}
function feedSheet(){if(!gfOn()){S.paused=true;openSheet();$('sheetIn').innerHTML='<h3>📸 Campus feed</h3><p>The campus feed works on online campuses on the YOLO website.</p><button class="ghost sm" id="bye">Close</button>';$('bye').onclick=closeSheet;return}
  gfStop();S.paused=true;openSheet();GF.view='feed';const c=MP.campus,posts=[],imgs={};let likes={};
  $('sheetIn').innerHTML=`<div class="eyebrow">${esc(campName(MP.campus))}</div><h3>📸 Campus feed</h3><div class="row" style="gap:6px"><button class="btn sm" id="fdNew">📸 Post a photo</button><button class="ghost sm" id="fdBye">Close</button></div><div id="fdL" style="margin-top:8px;display:flex;flex-direction:column;gap:12px"></div>`;
  const draw=()=>{const L=$('fdL');if(!L)return;const me=MP.uid;L.innerHTML=posts.length?posts.map(p=>{const lk=likes[p.id]||{},n=Object.keys(lk).length,mine=!!lk[me];
      return `<div style="background:rgba(255,255,255,.05);border-radius:14px;overflow:hidden"><div style="padding:8px 10px;font-weight:700">${esc(p.by===me?'You':p.nm)} <small style="opacity:.6;font-weight:400">· ${new Date(p.at).toLocaleString([],{weekday:'short',hour:'2-digit',minute:'2-digit'})}</small></div>
        ${imgs[p.id]?`<img src="${imgs[p.id]}" alt="" style="width:100%;display:block;aspect-ratio:1">`:'<div style="aspect-ratio:1;display:grid;place-items:center;opacity:.5">Loading photo…</div>'}
        <div style="padding:8px 10px;display:flex;gap:10px;align-items:center"><button class="ghost sm" data-like="${esc(p.id)}">${mine?'❤️':'🤍'} ${n||''}</button><span class="grow">${esc(mpClean(p.cap,120))}</span></div></div>`}).join(''):'<p style="opacity:.7">No posts yet. Be the first to post a photo! 📸</p>';
    L.querySelectorAll('[data-like]').forEach(b=>b.onclick=async()=>{const id=b.dataset.like,mine=!!(likes[id]||{})[MP.uid];try{await window.fbRT.set(`feed/${c}/likes/${id}/${MP.uid}`,mine?null:true)}catch(e){}})};
  const u1=window.fbRT.listen('feed/'+c+'/posts',30,(id,v)=>{if(GF.view!=='feed'||$('sheet').hidden){gfStop();return}if(!v||MP.blocked[v.by])return;posts.push(Object.assign({id},v));posts.sort((a,b)=>b.at-a.at);draw();
    gfOnce('feed/'+c+'/img/'+id).then(d=>{if(typeof d==='string'&&d.startsWith('data:image/jpeg')){imgs[id]=d;draw()}})});
  const u2=window.fbRT.watch('feed/'+c+'/likes',v=>{likes=v||{};draw()});GF.unsub=()=>{try{u1()}catch(e){}try{u2()}catch(e){}};draw();
  $('fdBye').onclick=()=>{gfStop();closeSheet()};
  $('fdNew').onclick=()=>{gfStop();closeSheet();setTimeout(()=>{const shot=feedShot();S.paused=true;openSheet();
    $('sheetIn').innerHTML=`<h3>📸 New post</h3><img src="${shot}" alt="" style="width:100%;border-radius:12px;aspect-ratio:1"><input id="fdCap" maxlength="120" placeholder="Write a caption…" style="width:100%;margin-top:8px"><div class="row" style="margin-top:8px"><button class="btn" id="fdGo">Post</button><button class="ghost" id="fdNo">Cancel</button></div>
      <p style="font-size:12px;opacity:.7">Tip: close this, move the camera to a nice spot, then post again.</p>`;
    $('fdNo').onclick=()=>feedSheet();$('fdGo').onclick=async()=>{$('fdGo').disabled=true;const id=await feedPost($('fdCap').value,shot);if(id)feedSheet();else $('fdGo').disabled=false}},350)}}
