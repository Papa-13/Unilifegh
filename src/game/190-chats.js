/* ================= chats, replies & voice notes ================= */
let CHAT=null,REC=null,VNP=null;
const FAMILY=['Mum','Dad'];
function avCol(c){const n=S.npcs.find(x=>x.name===c);return n?PAL[n.look.pal].a:FAMILY.includes(c)?'#8e2a3a':'#2a6f9b'}
const canReply=c=>FAMILY.includes(c)||S.npcs.some(n=>n.name===c);
const INTENTS=[['how',/how are you|how (be|dey|you dey)|wassup|what'?s up|how'?s it/i],['greet',/\b(hi+|hey+|hello|yo|chale|how far|good (morning|evening|afternoon|night))\b/i],['sorry',/sorry|apolog|forgive/i],['thanks',/thank|thx|medaase|appreciate/i],
  ['love',/love|miss you|cute|beautiful|handsome|date|crush|❤|😍|😘|sweet/i],['money',/money|borrow|lend|cedi|momo|broke|cash|send me|allowance/i],['food',/food|chop|eat|hungry|waakye|jollof|kelewele|indomie|canteen|banku/i],
  ['study',/study|lecture|assignment|exam|quiz|handout|library|read|class/i],['party',/party|club|concert|dance|vibes|jam|night market|freshers/i],['link',/link|come over|meet|where are you|hang|visit|let'?s go|outside/i],['laugh',/lol|😂|haha|🤣|lmao/i],['q',/\?\s*$/]];
const intentOf=t=>(INTENTS.find(([k,r])=>r.test(t))||['def'])[0];
const RB={greet:['Heyy! How far? 😄','Chale! I dey o. You?','Hi hi 👋 what\'s up?'],how:['I\'m good o, just tired from lectures. You?','Fine paa! Campus life sweet die 😂','Hmm, I dey manage. Assignment wan kill me 😩'],
  food:['Chale I\'m hungry too 😩 Night Market later?','Waakye or nothing! Canteen tomorrow?','Buy me kelewele and I\'ll love you forever 😂'],study:['Library at 4? Let\'s grind 📚','Abeg send me your handout when you finish 🙏','Which lecturer? Dr. Ofori-Kuma? Ei, be careful o.'],
  party:['I\'m in!! 💃🏾','Club Vibes this weekend? Let\'s go!','Only if you\'re dancing with me 😂'],money:['Chale I\'m broke too 😭','Hmm, how much? Talk to me in person.','Allowance hasn\'t come o 😩'],
  love:['Awww 🥺❤️','Stop it, you\'re making me blush 🙈','Hmm, is it me you\'re saying this to? 😏'],sorry:['It\'s fine, no wahala 🤗','Okay, I forgive you. But buy me food 😂','Hmm. I\'ll think about it 😒'],
  thanks:['Anytime! 🙏','No wahala 😊','You\'re welcome, my person!'],laugh:['😂😂😂','You\'re mad 🤣','Ei, stop it 😂'],q:['Hmm, good question 🤔','Yes o!','I don\'t know paa, let\'s talk later.','Why are you asking? 😂'],
  def:['😂 okay','Hmm, I hear you','Seen 👀','Lol okay 😄','Tell me more!']};
const VNT=[['hi','👋 Say hi','Hey {n}! Just checking on you. Hope your day is going well 😊','greet'],['gist','🗣️ Gist about today','Chale {n}, you won\'t believe what happened on campus today. Let me tell you…','laugh'],
  ['link','🤝 Ask to link up','Where are you? Let\'s link up later, I\'m bored 😂','link'],['study','📚 Study plans','Abeg, let\'s study together for the quiz this week.','study'],['sing','🎶 Sing for them','(you sing a few lines of your favourite Afrobeats song)','laugh'],
  ['sorry','🙏 Apologise','I\'m sorry about the other day. Please don\'t be vexed with me.','sorry'],['flirt','😏 Sweet talk','Your voice dey sweet me paa, you know that? 😏','love'],
  ['fine','🙏 Tell them you\'re fine','I\'m fine o. Eating well and learning hard. Greet everybody for me.','how'],['money','🥺 Beg for money','Please, my money has finished… I need small something for food 🥺','money']];
function npcReply(n,intent,vn){const p=P();let lines=RB[intent]||RB.def;
  if(n.friend<15&&!n.mate)return{text:pick(['Who is this please? 😅','Hmm, sorry, who is this?','Ah, hi… do I know you? 😅']),gain:1};
  if(intent==='love'){if(p.partner===n||n.romance>40||(n.chem>.55&&n.friend>=40)){n.romance=clamp(n.romance+(vn?6:3))}else{n.romance=clamp(n.romance-2);lines=['Ei, slow down 😅','Hmm 😂 you\'re funny','Okay… 🙂']}}
  if(intent==='link'){const h=hour();if(n.friend>=30&&h>=7&&h<22&&!IS&&Math.random()<.75){n.with=S.min+60;n.x=clamp(p.x+R(-200,200),20,MW-20);n.y=clamp(p.y+R(-200,200),20,MH-20);n._fT=0;return{text:pick(['Coming! Give me small time 🏃🏾','I dey come. Where exactly?','Okay, I\'m on my way 😄']),gain:3}}
    return{text:pick(['Not now o, I\'m busy. Later?','I\'m in my room, tired paa 😩','Tomorrow, I promise!']),gain:1}}
  if(intent==='money'&&n.wealth==='rich')lines=['How much? Come and see me, I might help.','Ei, you too 😂 talk to me in person.'];
  if(n.pers==='shy'&&Math.random()<.35)return{text:pick(['🙂','Okay 😊','Hehe 🙈']),gain:2};
  return{text:pick(lines),gain:intent==='def'?1:2}}
function famReply(intent,vn){const p=P(),k='fam'+week();
  if(intent==='money'){if(!S[k]&&Math.random()<({poor:.35,avg:.55,rich:.85}[p.bg])+(vn?.15:0)){S[k]=1;const amt={poor:50,avg:100,rich:300}[p.bg];p.money+=amt;return `I've sent ${cedi(amt)} to your MoMo. Don't waste it o! 🙏`}
    return pick(['Your allowance comes on Monday. Manage it well.','Again?! What are you doing with the money? 🤨','We don\'t have now, my child. Be patient.'])}
  if(intent==='love'||intent==='thanks')return pick(['We love you too. Make us proud ❤️','God bless you, my child 🙏']);
  if(intent==='how'||intent==='greet')return pick(['We are fine. Are you eating well?','Thank God. Have you been going to church?','Fine o. Your sister says hi. How are your studies?']);
  if(intent==='study')return 'Good. Learn hard, that is why you are there 📚';
  if(intent==='party')return 'Party?! Hmm. Be careful with these university friends o 🤨';
  return pick(['Okay my dear.','Hmm, I hear you.','Call me when you are free.'])}
function sendChat(chat,text,vn){try{ev('chat',{vn:!!vn,fam:/mum|dad|auntie|uncle|sis|bro/i.test(chat)})}catch(e){}const p=P(),n=S.npcs.find(x=>x.name===chat),m={from:'You',chat,text,at:S.min,mine:true,read:true,vn};S.msgs.unshift(m);
  const k='cg'+chat+day();S[k]=(S[k]||0)+1;const intent=vn?vn.intent:intentOf(text);
  const reply=()=>{let t,gainSoc=vn?7:4;if(n){const r=npcReply(n,intent,!!vn);t=r.text;if(S[k]<=4)n.friend=clamp(n.friend+r.gain+(vn?1:0));else gainSoc=1}else{t=famReply(intent,!!vn);p.needs.fun=clamp(p.needs.fun+3)}
    p.needs.social=clamp(p.needs.social+gainSoc);m.seen=true;S.typing=null;msg(chat,t,(vn?Math.random()<.55:Math.random()<.15)?{secs:RI(4,18)}:null);if(CHAT===chat&&!$('sheet').hidden)drawChat();hud()};
  const asleep=(hour()<6||hour()>=23.5)&&!(n&&p.partner===n)&&!FAMILY.includes(chat);
  if(asleep){(S.pending=S.pending||[]).push({due:(hour()>=23.5?day()+1:day())*1440+6*60+RI(10,90),fn:reply});drawChat();return}
  if(n&&p.partner!==n&&!(n.mate&&Math.random()<.5)&&Math.random()<.14){drawChat();setTimeout(()=>{m.seen=true;if(CHAT===chat&&!$('sheet').hidden)drawChat();toast(`✓✓ ${chat} has seen your message… no reply 🙄`)},R(1800,3500));return}
  S.typing={chat,vn:vn?Math.random()<.55:false};drawChat();setTimeout(reply,R(1500,3400))}
function chatChips(n,p){const h=hour(),L=n&&(p.partner===n||n.side),q=['Hey! 👋','How are you?','Where are you?','What are you doing?','Are you free?'];
  if(h>=6&&h<11)q.push('Let\'s go and buy waakye 🍛');else if(h>=11&&h<18)q.push('Gob3 later? 😋');else if(h>=17&&h<22)q.push('Kelewele at the Night Market? 🔥');
  if(h>=15&&h<18)q.push('Ball at the field? ⚽');if(h>=8&&h<23)q.push(p.items.includes('console')?'Come and play FIFA in my room 🎮':'FIFA in your room? 🎮');
  q.push('Let\'s study together','😂😂');if(L)q.push('I miss you ❤️','I love you ❤️');if(h>=21||h<2)q.push('Good night 😴');else if(h<11)q.push('Good morning ☀️');q.push('Thank you 🙏');return q}
function openChat(c){CHAT=c;stopRec();drawChat()}
function stopRec(){if(REC){clearInterval(REC.iv);REC=null}}
function waveBars(m){let h=(m.at*7+m.text.length*13)%97,out='';for(let i=0;i<26;i++){h=(h*31+17)%97;out+=`<i style="height:${5+(h%19)}px"></i>`}return out}
function drawChat(){const p=P(),chat=CHAT;if(!chat)return;const n=S.npcs.find(x=>x.name===chat),fam=FAMILY.includes(chat),ok=canReply(chat);
  S.msgs.forEach(m=>{if(m.chat===chat&&!m.mine)m.read=true});S.unread=unreadN();
  const th=S.msgs.filter(m=>m.chat===chat).slice().reverse();
  const status=n?((n.plan&&n.plan.sleep&&n.hidden)?'last seen last night':'online'):fam?'online':'broadcast · only admins can send';
  const bub=m=>m.sys?`<div class="sysm">${esc(m.text)}</div>`:`<div class="bub ${m.mine?'bout':'bin'}">${m.vn?`<div class="vn"><button data-play="${S.msgs.indexOf(m)}" aria-label="Play voice note">▶</button><div class="wave">${waveBars(m)}</div><span style="font-size:12px">0:${String(m.vn.secs).padStart(2,'0')}</span></div><div class="vt">“${esc(m.text)}”</div>`:esc(m.text)}<time>${hm(m.at)}${m.mine?` <span class="tick${m.seen?' seen':''}">✓✓</span>`:''}</time></div>`;
  const last=th.filter(m=>!m.mine).pop(),qs=fam?['I\'m fine 🙏','Please send me money 🥺','I love you ❤️','I\'m studying hard 📚']:
    (last&&/\?\s*$/.test(last.text)||n&&n.pend?['Yes 👍','No o 😅']:[]).concat(chatChips(n,p));
  const ty=S.typing&&S.typing.chat===chat?`<div class="typing">${S.typing.vn?'🎤 recording audio…':'typing…'}</div>`:'';
  $('sheetIn').innerHTML=`<div class="row" style="gap:10px;align-items:center;justify-content:space-between"><button class="ghost sm" id="back" aria-label="Back to chats">‹ Chats</button><span class="av" style="background:${avCol(chat)}">${esc(chat[0])}</span><div class="grow" style="min-width:0"><b>${esc(chat)}</b><small style="display:block;color:var(--muted)">${status}</small></div><button class="ghost sm" id="bye">Close</button></div>
    <div class="thread" id="thread">${th.map(bub).join('')}${ty}</div>
    ${ok?`<div id="comp"><div class="qr">${qs.map((q,i)=>`<button class="ghost sm" data-q="${i}">${esc(q)}</button>`).join('')}</div>
      <div class="composer"><input id="msgin" maxlength="160" placeholder="Message" autocomplete="off"><button class="round" id="sendb" aria-label="Send">➤</button><button class="round" id="micb" aria-label="Record a voice note" style="background:#2a6f9b">🎤</button>${n?'<button class="round" id="meetb" aria-label="Plan a meetup" style="background:#8e2a3a">📍</button>':''}</div></div>`:`<p style="font-size:13px;color:var(--muted);text-align:center">Only admins can send messages here.</p>`}`;
  const thr=$('thread');thr.scrollTop=thr.scrollHeight;
  $('back').onclick=()=>{CHAT=null;stopRec();phone('msgs')};$('bye').onclick=()=>{CHAT=null;stopRec();closeSheet()};
  thr.querySelectorAll('[data-play]').forEach(b=>b.onclick=()=>playVN(S.msgs[+b.dataset.play],b));
  if(!ok)return;const inp=$('msgin');
  const send=t=>{t=(t||'').trim();if(!t)return;sendChat(chat,t)};
  $('sendb').onclick=()=>send(inp.value);inp.onkeydown=e=>{if(e.key==='Enter')send(inp.value)};
  $('comp').querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>send(qs[+b.dataset.q]));
  const mb=$('meetb');if(mb)mb.onclick=()=>{$('comp').innerHTML=`<p style="font-size:13px;margin:6px 0">📍 Where do you want to meet ${esc(n.name)}?</p><div class="qr" style="flex-wrap:wrap">${MEETP.map(([b,nm],i)=>`<button class="ghost sm" data-mp="${i}">${nm}</button>`).join('')}<button class="ghost sm" id="mcancel">Cancel</button></div>`;
    $('mcancel').onclick=drawChat;$('comp').querySelectorAll('[data-mp]').forEach(b=>b.onclick=()=>{const bi=+b.dataset.mp,now=Math.ceil(S.min/10)*10,today=day()*1440,h=hour(),T=[['in 1 hour',now+60],['in 2 hours',now+120]];
      if(h<18)T.push(['today at 19:00',today+19*60]);if(h<20.5)T.push(['tonight at 21:00',today+21*60]);T.push(['tomorrow at 10:00',today+1440+600],['tomorrow at 16:00',today+1440+960]);
      $('comp').innerHTML=`<p style="font-size:13px;margin:6px 0">⏰ When? (${MEETP[bi][1]})</p><div class="qr" style="flex-wrap:wrap">${T.map(([t],i)=>`<button class="ghost sm" data-mt="${i}">${t}</button>`).join('')}<button class="ghost sm" id="mcancel">Cancel</button></div>`;
      $('mcancel').onclick=drawChat;$('comp').querySelectorAll('[data-mt]').forEach(x=>x.onclick=()=>{const [tl,at]=T[+x.dataset.mt];proposeMeet(chat,bi,at,tl)})})};
  $('micb').onclick=()=>{const opts=VNT.filter(([id])=>fam?['hi','fine','money','sing'].includes(id):id!=='fine'&&id!=='money'&&(id!=='flirt'||p.partner===n||(n&&(n.romance>20||n.friend>=40))));
    $('comp').innerHTML=`<p style="font-size:13px;margin:6px 0">🎤 What's your voice note about?</p><div class="qr" style="flex-wrap:wrap">${opts.map((o,i)=>`<button class="ghost sm" data-vt="${i}">${o[1]}</button>`).join('')}<button class="ghost sm" id="vcancel">Cancel</button></div>`;
    $('vcancel').onclick=drawChat;$('comp').querySelectorAll('[data-vt]').forEach(b=>b.onclick=()=>record(opts[+b.dataset.vt]))};
  function record(o){const t0=performance.now();$('comp').innerHTML=`<div class="rec"><span class="dot"></span><b id="rect">0:01</b><div class="wave" id="recw">${'<i style="height:6px"></i>'.repeat(22)}</div><button class="ghost sm" id="rdel" aria-label="Delete">🗑</button><button class="round" id="rsend" aria-label="Send voice note">➤</button></div>`;
    stopRec();REC={iv:setInterval(()=>{const e=$('rect');if(!e)return stopRec();const secs=1+Math.floor((performance.now()-t0)/1000*2.5);e.textContent='0:'+String(Math.min(59,secs)).padStart(2,'0');$('recw').querySelectorAll('i').forEach(i=>i.style.height=(4+Math.random()*20)+'px')},180)};
    $('rdel').onclick=()=>{stopRec();drawChat()};
    $('rsend').onclick=()=>{const secs=Math.max(3,Math.min(59,1+Math.floor((performance.now()-t0)/1000*2.5)));stopRec();const name=n?n.name.split(' ')[0]:(chat==='Mum'?'Mummy':'Daddy');sendChat(chat,o[2].replace('{n}',name).replace('Please,','Please '+(fam?(chat==='Mum'?'Mummy':'Daddy')+',':',')),{secs,intent:o[3],topic:o[0]})}}}
function playVN(m,btn){if(!m||!m.vn)return;stopVN();const bars=[...btn.parentNode.querySelectorAll('.wave i')],dur=Math.min(9,Math.max(2.5,m.vn.secs*.45)),t0=performance.now();btn.textContent='❚❚';
  const g=m.mine?P().look.gender:(S.npcs.find(n=>n.name===m.chat)||{gender:m.chat==='Dad'?'m':'f'}).gender;
  VNP={btn,iv:setInterval(()=>{const k=(performance.now()-t0)/1000/dur;bars.forEach((b,i)=>b.classList.toggle('on',i/bars.length<k));if(k>=1)stopVN()},80)};
  const clean=m.text.replace(/\(.*?\)/g,'').replace(/[^\p{L}\p{N}\s.,!?'’-]/gu,'').trim();
  try{if(clean&&'speechSynthesis' in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(clean);u.pitch=g==='f'?1.35:.72;u.rate=1.03;const vs=speechSynthesis.getVoices().filter(v=>/^en/i.test(v.lang));if(vs.length)u.voice=vs[(m.chat.length+(m.mine?3:0))%vs.length];speechSynthesis.speak(u)}else babble(dur,g,!clean)}catch(e){babble(dur,g,!clean)}}
function stopVN(){if(VNP){clearInterval(VNP.iv);if(VNP.btn)VNP.btn.textContent='▶';VNP=null}try{speechSynthesis.cancel()}catch(e){}}
let ACX=null;function babble(dur,g,sing){try{ACX=ACX||new (window.AudioContext||window.webkitAudioContext)();const now=ACX.currentTime,base=g==='f'?230:130,notes=[0,2,4,7,9,12];
  for(let t=0;t<dur;t+=sing?.32:.13){const o=ACX.createOscillator(),gn=ACX.createGain(),f=ACX.createBiquadFilter();o.type=sing?'triangle':'sawtooth';o.frequency.value=sing?base*2*Math.pow(2,pick(notes)/12):base*R(.85,1.35);f.type='lowpass';f.frequency.value=sing?2400:1100;
    gn.gain.setValueAtTime(0,now+t);gn.gain.linearRampToValueAtTime(.08,now+t+.03);gn.gain.linearRampToValueAtTime(0,now+t+(sing?.3:.11));o.connect(f);f.connect(gn);gn.connect(ACX.destination);o.start(now+t);o.stop(now+t+(sing?.32:.13))}}catch(e){}}
