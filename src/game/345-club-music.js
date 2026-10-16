/* ================= music: the club DJ, your room speaker, and your phone =================
   Three places music comes from, in this order of priority:
   1. 📱 Phone: songs you pick on your phone, in your earphones. Only you hear them, anywhere.
   2. 🪩 Club Vibes: DJ Kwaku Flames runs the music. His set comes from the shared clock, so everyone
      in the club hears the same song at the same moment. Players can only mute.
   3. 🔊 Your room: if you have a Bluetooth speaker, you pick the songs. Real roommates in the room
      with you hear the same song at the same point (it travels in your presence). Whoever picked a
      song last controls the speaker.
   Songs play from the artists' official YouTube videos through YouTube's own player, which stays
   visible (that's how YouTube lets other sites play its videos; the artists keep the views).
   If YouTube can't load, an original beat made in the browser plays instead, in sync.
   To add a song, add its official video id below. */
const CLUB_TRACKS=[
  {id:'GIDiI5kyBDQ',t:'Kwaku the Traveller',a:'Black Sherif'},
  {id:'jFdD3Y8mqPI',t:'Second Sermon',a:'Black Sherif'},
  {id:'NPCC02SaJVg',t:'Terminator ft. Young Jonn',a:'King Promise'},
  {id:'BZjCr_ABHCE',t:'Odo Bi ft. Sarkodie',a:'Stonebwoy'},
  {id:'BppzVnoLygQ',t:'Touch It ft. Tyga',a:'KiDi'}];
const DJ_SLOT=180; // seconds per song in the club DJ's set (he mixes into the next one at 3 minutes)
const MUS={src:null,key:'',mode:null,player:null,muted:false,bad:{},phone:{on:false,i:0,s:0},room:null};
const DJ=MUS; // older name used by tests and the club menu
const musNowMs=()=>Date.now()+(window.__srvOff||0),djNowMs=musNowMs;

/* ---- the club DJ's set ---- */
function djOrder(round){const n=CLUB_TRACKS.length,a=[...Array(n).keys()];let s=(round*2654435761)>>>0;
  for(let i=n-1;i>0;i--){s=(s*1103515245+12345)>>>0;const j=s%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function djAt(ms){const sec=ms/1000,slot=Math.floor(sec/DJ_SLOT),n=CLUB_TRACKS.length;return{slot,off:sec-slot*DJ_SLOT,i:djOrder(Math.floor(slot/n))[slot%n]}}

/* ---- what should be playing for me right now? ---- */
const inClub=()=>!!(S&&IS&&IS.bid==='club'&&$('game')&&!$('game').hidden);
const inMyRoom=()=>!!(S&&IS&&IS.kind==='room'&&IS.mine&&$('game')&&!$('game').hidden);
function musWant(){if(!S||!S.p||$('game').hidden)return null;const now=musNowMs();
  if(MUS.phone.on)return{kind:'phone',i:MUS.phone.i,s:MUS.phone.s,key:`p${MUS.phone.i}:${MUS.phone.s}`};
  if(inClub()){const d=djAt(now);return{kind:'club',i:d.i,s:now-d.off*1000,key:'c'+d.slot}}
  if(inMyRoom()){const k=myRoomKey();let best=MUS.room&&MUS.room.key===k?{i:MUS.room.i,s:MUS.room.s,by:null}:null;
    for(const rp of (typeof MP!=='undefined'?MP.peers.values():[]))if(!rp.isMe&&rp.in===k&&rp.mu&&(!best||rp.mu.s>best.s))best={i:rp.mu.i,s:rp.mu.s,by:rp.nm};
    if(best)return{kind:'room',i:best.i,s:best.s,by:best.by,key:`r${best.i}:${best.s}`}}
  return null}

function musTick(){const w=musWant();
  if(!w){if(MUS.src)musStop();return}
  if(!MUS.src||w.key!==MUS.key){const first=!MUS.src,was=MUS.src;MUS.src=w;MUS.key=w.key;musCard();musMeta();
    if(!first&&w.kind==='club'&&was.kind==='club'&&MUS.mode==='yt')toast(`🎧 DJ Kwaku Flames: "Next one: ${CLUB_TRACKS[w.i].t}!"`);
    if(w.kind==='room'&&w.by&&(!was||was.key!==w.key))toast(`🔊 ${w.by} is playing ${CLUB_TRACKS[w.i].t} on the speaker`);
    musLoad();return}
  MUS.src=w;musDrift()}
setInterval(musTick,1000);

function musStop(){beatStop();try{MUS.player&&MUS.player.destroy()}catch(e){}MUS.player=null;MUS.mode=null;MUS.src=null;MUS.key='';const c=$('djCard');if(c)c.remove()}
const musOff=()=>{const w=MUS.src;return w?Math.max(0,(musNowMs()-w.s)/1000):0};

function musLoad(){const w=MUS.src;if(!w)return;
  ytReady().then(ok=>{if(MUS.src!==w&&MUS.key!==w.key)return;
    if(!ok){MUS.mode='beat';musMeta();beatOn();return}
    if(MUS.bad[w.i]){beatOn();return}
    if(MUS.player&&MUS.player.loadVideoById){beatStop();MUS.player.loadVideoById({videoId:CLUB_TRACKS[w.i].id,startSeconds:musOff()});return}
    musYT()})}

/* keeps your song on the shared timing; handles a song ending */
function musDrift(){const w=MUS.src;if(MUS.mode!=='yt'||!MUS.player||!MUS.player.getCurrentTime||MUS.bad[w.i])return;
  const st=MUS.player.getPlayerState?MUS.player.getPlayerState():-1,cur=MUS.player.getCurrentTime(),off=musOff();
  if(w.kind!=='phone'&&st===1&&Math.abs(cur-off)>2.5)MUS.player.seekTo(off,true);
  if(st===0)musEnded();
  const tap=$('djTap');if(tap)tap.hidden=!(st===-1||st===2||st===5)||off<1.5}
function musEnded(){const w=MUS.src,n=CLUB_TRACKS.length;
  if(w.kind==='phone'){MUS.phone.i=(MUS.phone.i+1)%n;MUS.phone.s=musNowMs()}
  else if(w.kind==='room'&&!w.by&&MUS.room){MUS.room.i=(MUS.room.i+1)%n;MUS.room.s=musNowMs()}
  else if(w.kind==='club'&&BEAT.t==null)beatOn()}   // song shorter than the DJ's slot: his beat fills the gap

/* ---- start music from your speaker or your phone ---- */
function speakerPlay(i){if(!inMyRoom())return toast('Your speaker is in your room.');MUS.room={key:myRoomKey(),i,s:musNowMs()};MUS.phone.on=false;musTick();
  try{if(!S.busy)doAct(`Vibing to ${CLUB_TRACKS[i].t}`,45,{fun:20,social:5});S.mates.forEach(n=>{if(IS.people.some(q=>q.n===n&&!q.sleeping))n.friend=clamp(n.friend+4)})}catch(e){}}
function speakerStop(){MUS.room=null;musTick()}
function phonePlay(i){MUS.phone={on:true,i,s:musNowMs()};musTick()}
function phoneStop(){MUS.phone.on=false;musTick()}
function musNext(){const w=MUS.src;if(!w)return;const n=CLUB_TRACKS.length;if(w.kind==='phone')phonePlay((w.i+1)%n);else if(w.kind==='room')speakerPlay((w.i+1)%n)}

/* ---- the "now playing" card ---- */
function musCard(){const w=MUS.src;let c=$('djCard');if(!c){c=document.createElement('div');c.id='djCard';c.setAttribute('role','region');c.setAttribute('aria-label','Music');document.body.appendChild(c)}
  const canCtl=w.kind==='phone'||(w.kind==='room'&&P().items.includes('speaker'));c.dataset.kind=w.kind;
  c.innerHTML=`<div class="dj-screen" id="djScreen"><div id="djYT"></div><div class="dj-eq" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
      <button class="dj-tap" id="djTap" hidden>▶ Tap to hear the music</button></div>
    <div class="dj-meta"><small id="djWho"></small><b id="djT"></b><span id="djA"></span></div>
    <div class="dj-btns">${canCtl?`<button id="djNx" aria-label="Next song">⏭</button><button id="djRq">🎵 Songs</button><button id="djSt" aria-label="Stop the music">⏹</button>`
      :`<button id="djMute" aria-pressed="${MUS.muted}">${MUS.muted?'🔇 Unmute':'🔊 Mute'}</button>${w.kind==='club'?'<button id="djUp">⏱ Next up</button>':''}`}</div>`;
  if($('djMute'))$('djMute').onclick=()=>{MUS.muted=!MUS.muted;musVol();$('djMute').textContent=MUS.muted?'🔇 Unmute':'🔊 Mute';$('djMute').setAttribute('aria-pressed',MUS.muted)};
  if($('djUp'))$('djUp').onclick=()=>{const now=djAt(musNowMs()),nx=djAt((now.slot+1)*DJ_SLOT*1000+500),left=Math.ceil(DJ_SLOT-now.off);toast(`⏱ Next up in ${Math.floor(left/60)}:${String(left%60).padStart(2,'0')}: ${CLUB_TRACKS[nx.i].t} · ${CLUB_TRACKS[nx.i].a}`)};
  if($('djNx'))$('djNx').onclick=musNext;
  if($('djRq'))$('djRq').onclick=()=>musSongs(w.kind);
  if($('djSt'))$('djSt').onclick=()=>w.kind==='phone'?phoneStop():speakerStop();
  $('djTap').onclick=()=>{try{ACX&&ACX.resume&&ACX.resume()}catch(e){}if(MUS.player&&MUS.player.playVideo){MUS.player.seekTo(musOff(),true);MUS.player.playVideo()}$('djTap').hidden=true}}
function musMeta(){const w=MUS.src,t=$('djT'),a=$('djA'),who=$('djWho');if(!t||!w)return;
  who.textContent=w.kind==='club'?'🎧 DJ Kwaku Flames is playing':w.kind==='phone'?'📱 Your phone · only you hear this':w.by?`🔊 ${w.by}'s speaker`:'🔊 Your speaker';
  if(MUS.mode==='beat'){t.textContent=w.kind==='club'?'Club beat':'Afrobeats mix';a.textContent='Original mix · YouTube unavailable here'}else{const k=CLUB_TRACKS[w.i];t.textContent=k.t;a.textContent=k.a}}
function musVol(){try{MUS.player&&MUS.player.setVolume&&MUS.player.setVolume(MUS.muted?0:80)}catch(e){}if(BEAT.bus)BEAT.bus.gain.value=MUS.muted?0:.32}

/* song picker for the speaker or phone; for the club it shows the DJ's set */
function musSongs(kind){if(kind==='club')return djSongs();S.paused=true;openSheet();const w=MUS.src,on=w&&w.kind===kind?w.i:-1;
  $('sheetIn').innerHTML=`<h3>${kind==='phone'?'📱 Music · only you hear it':'🔊 Play on your speaker'}</h3><p style="font-size:13px;opacity:.8">${kind==='phone'?'Plays in your earphones wherever you go.':'Real roommates in the room with you hear the same song.'} Official videos from the artists' YouTube channels.</p>
  <div class="list">${CLUB_TRACKS.map((k,i)=>`<button class="item" data-tr="${i}" style="text-align:left;cursor:pointer"><div class="grow"><b>${esc(k.t)}</b><small>${esc(k.a)}</small></div>${i===on?'<span class="tag g">Playing</span>':''}</button>`).join('')}</div>
  <div class="row">${on>=0?'<button class="ghost sm" id="musOff">⏹ Stop</button>':''}<button class="ghost sm" id="bye">Close</button></div>`;
  $('sheetIn').querySelectorAll('[data-tr]').forEach(b=>b.onclick=()=>{closeSheet();const i=+b.dataset.tr;kind==='phone'?phonePlay(i):speakerPlay(i)});
  if($('musOff'))$('musOff').onclick=()=>{closeSheet();kind==='phone'?phoneStop():speakerStop()};$('bye').onclick=closeSheet}
function djSongs(){S.paused=true;openSheet();const now=djAt(musNowMs()),up=[0,1,2,3].map(k=>djAt((now.slot+k)*DJ_SLOT*1000+500));
  $('sheetIn').innerHTML=`<h3>🎧 DJ Kwaku Flames' set</h3><p style="font-size:13px;opacity:.8">Everyone in Club Vibes hears the same song. Official videos from the artists' YouTube channels.</p>
  <div class="list">${up.map((u,k)=>{const tr=CLUB_TRACKS[u.i],left=Math.ceil(DJ_SLOT-now.off)+(k-1)*DJ_SLOT;return `<div class="item"><div class="grow"><b>${esc(tr.t)}</b><small>${esc(tr.a)}</small></div><span class="tag${k?'':' g'}">${k?`in ${Math.floor(left/60)}:${String(left%60).padStart(2,'0')}`:'Now'}</span></div>`}).join('')}</div>
  <button class="ghost sm" id="bye">Close</button>`;$('bye').onclick=closeSheet}

/* ---- YouTube's player ---- */
let YTP=null;function ytReady(){if(YTP)return YTP;YTP=new Promise(res=>{if(window.YT&&YT.Player)return res(true);
  const prev=window.onYouTubeIframeAPIReady;window.onYouTubeIframeAPIReady=()=>{try{prev&&prev()}catch(e){}res(true)};
  const s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';s.async=true;s.onerror=()=>res(false);document.head.appendChild(s);setTimeout(()=>res(!!(window.YT&&YT.Player)),7000)});
  YTP.then(ok=>{if(!ok)YTP=null});return YTP}
function musYT(){const w=MUS.src;MUS.mode='yt';musMeta();const host=$('djYT');if(!host)return;
  MUS.player=new YT.Player(host,{width:200,height:200,videoId:CLUB_TRACKS[w.i].id,host:'https://www.youtube-nocookie.com',
    playerVars:{autoplay:1,playsinline:1,rel:0,modestbranding:1,controls:0,disablekb:1,fs:0,iv_load_policy:3,start:Math.floor(musOff())},
    events:{onReady:e=>{try{musVol();e.target.seekTo(musOff(),true);e.target.playVideo()}catch(x){}},
      onStateChange:e=>{const sc=$('djScreen');if(sc)sc.classList.toggle('live',e.data===1);if(e.data===1){beatStop();if(sc)sc.classList.remove('beat')}},
      onError:()=>{if(MUS.src){MUS.bad[MUS.src.i]=1;beatOn()}}}})}

/* ---- original beat made in the browser, locked to the clock so it's in sync too ---- */
const BEAT={t:null,bus:null,last:-1};const BEAT_STEP=60/112/4;
function beatOn(){const sc=$('djScreen');if(sc)sc.classList.add('beat','live');beatStart()}
function beatStart(){try{ACX=ACX||new (window.AudioContext||window.webkitAudioContext)();ACX.resume&&ACX.resume()}catch(e){return}if(BEAT.t)return;
  BEAT.bus=ACX.createGain();BEAT.bus.gain.value=MUS.muted?0:.32;BEAT.bus.connect(ACX.destination);BEAT.last=-1;
  if(!BEAT.noise){const len=ACX.sampleRate*.4,nb=ACX.createBuffer(1,len,ACX.sampleRate),d=nb.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;BEAT.noise=nb}
  BEAT.t=setInterval(beatSched,40)}
function beatStop(){if(BEAT.t){clearInterval(BEAT.t);BEAT.t=null}if(BEAT.bus){try{BEAT.bus.gain.setTargetAtTime(0,ACX.currentTime,.05);const b=BEAT.bus;setTimeout(()=>b.disconnect(),400)}catch(e){}BEAT.bus=null}}
function beatSched(){const ahead=.18,nowS=musNowMs()/1000,ctx=ACX.currentTime;
  for(let k=Math.floor(nowS/BEAT_STEP);k*BEAT_STEP<nowS+ahead;k++){if(k<=BEAT.last)continue;BEAT.last=k;const at=ctx+(k*BEAT_STEP-nowS);if(at>=ctx-.01)beatStep(k%32,Math.max(at,ctx))}}
function beatStep(s,t){const k=s%16,bar=Math.floor(s/16);
  if(k===0||k===7||k===10)drum(t,'kick');if(k===4||k===12)drum(t,'clap');drum(t,'shk',k%2?1:.45);
  if(k===3||k===11||k===14)drum(t,'conga');
  const LOG={0:55,3:55,6:65.4,10:49,13:58.3},n=LOG[k];if(n)logDrum(t,bar?n*1.122:n)}
function drum(t,kind,acc=1){const g=ACX.createGain();g.connect(BEAT.bus);
  if(kind==='kick'){const o=ACX.createOscillator();o.frequency.setValueAtTime(130,t);o.frequency.exponentialRampToValueAtTime(42,t+.12);g.gain.setValueAtTime(.9,t);g.gain.exponentialRampToValueAtTime(.001,t+.3);o.connect(g);o.start(t);o.stop(t+.32)}
  else if(kind==='conga'){const o=ACX.createOscillator();o.type='sine';o.frequency.setValueAtTime(330,t);o.frequency.exponentialRampToValueAtTime(240,t+.08);g.gain.setValueAtTime(.25,t);g.gain.exponentialRampToValueAtTime(.001,t+.16);o.connect(g);o.start(t);o.stop(t+.18)}
  else{const src=ACX.createBufferSource();src.buffer=BEAT.noise;const f=ACX.createBiquadFilter();f.type=kind==='clap'?'bandpass':'highpass';f.frequency.value=kind==='clap'?1500:7000;src.connect(f);f.connect(g);
    const v=kind==='clap'?.55:.09*acc,dur=kind==='clap'?.14:.045;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);src.start(t);src.stop(t+dur+.02)}}
function logDrum(t,f){const o=ACX.createOscillator(),g=ACX.createGain();o.type='sine';o.frequency.setValueAtTime(f*1.9,t);o.frequency.exponentialRampToValueAtTime(f,t+.06);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.7,t+.012);g.gain.exponentialRampToValueAtTime(.001,t+.42);o.connect(g);g.connect(BEAT.bus);o.start(t);o.stop(t+.45)}
