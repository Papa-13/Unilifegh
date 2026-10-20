/* ================= UI ================= */
const toastEl=$('toast');let toastT=0;
function toast(t){toastEl.textContent=t;toastEl.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>toastEl.hidden=true,3200)}
function openSheet(){$('sheet').hidden=false}
const EMOTES=[['wave','👋 Wave'],['dance','💃 Dance'],['laugh','😂 Laugh'],['clap','👏 Clap'],['celebrate','🙌 Celebrate'],['shrug','🤷 Shrug'],['facepalm','🤦 Facepalm'],['think','🤔 Think'],['cross','😤 Cross arms'],['checkwatch','⌚ Check the time'],['point','👉 Point'],['stretch','🙆 Stretch'],['phonecall','📞 Fake a call'],['bow','🙇 Bow'],['sad','😔 Sulk'],['hug','🤗 Hug someone']];
function emoteSheet(){openSheet();$('sheetIn').innerHTML=`<h3>Emote</h3><p style="font-size:13px;color:var(--muted)">People nearby notice and react.</p><div class="grid2">${EMOTES.map(([k,t])=>`<button class="ghost sm" data-e="${k}">${t}</button>`).join('')}</div><button class="btn sm" id="bye">Close</button>`;
  $('sheetIn').querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>{closeSheet();doEmote(b.dataset.e)});$('bye').onclick=closeSheet}
function nearPeople(r){const p=P();if(IS)return IS.people.filter(q=>q.n&&!q.lying&&Math.hypot(q.x-p.ix,q.z-p.iz)<r/40).map(q=>({b:q,n:q.n}));return S.npcs.filter(n=>!n.hidden&&dist(n,p)<r).map(n=>({b:n,n}))}
function doEmote(k){const p=P(),dur={dance:7,hug:2.6,stretch:2.4,think:3,cross:3.2,sad:3.5,phonecall:4}[k]||2.2;setGest(p,k,dur);
  const near=nearPeople(110).sort((a,b)=>(IS?0:dist(a.n,p)-dist(b.n,p)));const td=day();try{ev('emote',{k,n:near.length})}catch(e){}
  near.slice(0,4).forEach(({b,n},i)=>setTimeout(()=>{const fr=n.friend||0,met=n.met;
    if(k==='wave'){if(met||Math.random()<.5){setGest(b,n.pers==='shy'?'nod':'wave',1.6);if(n._wv!==td){n._wv=td;n.friend=clamp(fr+1);if(!met&&Math.random()<.4)n.met=true}}}
    else if(k==='dance'){setGest(b,fr>40?'dance':pick(['clap','laugh','cheer']),3.5);if(i===0)p.needs.fun=clamp(p.needs.fun+6)}
    else if(k==='laugh'||k==='celebrate')setExpr(b,'smile',3);
    else if(k==='hug'&&i===0){if(fr>=55||p.partner===n){hugPair(p,b,2.6);n.friend=clamp(fr+2);p.needs.social=clamp(p.needs.social+6);toast(`You hug ${n.name} 🤗`)}else{setGest(b,'cross',2.4);n.friend=clamp(fr-2);toast(`${n.name} steps back. "Ehh, we're not there yet 😅"`)}}
    else if(k==='facepalm'||k==='sad'){if(fr>35){setGest(b,'pockets',1.5,'sad');if(i===0&&k==='sad')toast(`${n.name}: "Ei, what's wrong? You good?"`)}}
    else if(k==='point')setGest(b,'lookaround',1.6,'surprised');
    else if(k==='bow')setGest(b,'nod',1.4,'smile');
    else if(Math.random()<.5)setGest(b,'nod',1.2)},500+i*250));
  if(k==='hug'&&!near.length){toast('Nobody close enough to hug 🫂');}}
function closeSheet(){$('sheet').hidden=true;MP.view=null;S.paused=false;CHAT=null;stopRec();stopVN();if(S.talkN){S.talkN.pose=null;S.talkN.face=null;const q=IS&&IS.people.find(q=>q.n===S.talkN);if(q&&!q.lying)q.pose=IS.kind==='bld'?q.pose0||'sit':'sit';S.talkN=null;if(!S.busy){P().pose=null;P().face=null}}acts(true);hud()}
function story(html,choices){S.paused=true;$('story').hidden=false;
  $('storyIn').innerHTML=html+`<div class="choice">${choices.map(([t,cls],i)=>`<button class="${cls==='g'?'btn g':cls==='m'?'btn m':'ghost'}" data-i="${i}">${t}</button>`).join('')}</div>`;
  $('storyIn').querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{$('story').hidden=true;S.paused=false;choices[+b.dataset.i][2]();hud();acts(true)})}
