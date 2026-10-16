/* ================= Club Vibes DJ: real Ghanaian hits, the same song for everyone in the club =================
   The DJ runs the music, not the players. His set is worked out from the clock: every SLOT seconds he
   moves to the next song, in an order everyone's game calculates the same way. So whoever is in the club,
   on any phone, hears the same song at the same moment. Walk in mid-song and you join where it is.
   Songs play from the artists' official YouTube videos through YouTube's own player, which stays visible
   (that's how YouTube allows other sites to play its videos, and the artists keep the views).
   If YouTube can't load, the DJ plays an original beat made in the browser, also in sync.
   To add a song, add its official video id below. */
const CLUB_TRACKS=[
  {id:'GIDiI5kyBDQ',t:'Kwaku the Traveller',a:'Black Sherif'},
  {id:'jFdD3Y8mqPI',t:'Second Sermon',a:'Black Sherif'},
  {id:'NPCC02SaJVg',t:'Terminator ft. Young Jonn',a:'King Promise'},
  {id:'BZjCr_ABHCE',t:'Odo Bi ft. Sarkodie',a:'Stonebwoy'},
  {id:'BppzVnoLygQ',t:'Touch It ft. Tyga',a:'KiDi'}];
const DJ_SLOT=180; // seconds per song in the DJ's set (he mixes into the next one at the 3-minute mark)
const DJ={on:false,slot:-1,mode:null,player:null,muted:false,bad:{}};

/* ---- the DJ's set: which song is on right now, and how far into it ---- */
const djNowMs=()=>Date.now()+(window.__srvOff||0);
function djOrder(round){const n=CLUB_TRACKS.length,a=[...Array(n).keys()];let s=(round*2654435761)>>>0;
  for(let i=n-1;i>0;i--){s=(s*1103515245+12345)>>>0;const j=s%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function djAt(ms){const sec=ms/1000,slot=Math.floor(sec/DJ_SLOT),n=CLUB_TRACKS.length;return{slot,off:sec-slot*DJ_SLOT,i:djOrder(Math.floor(slot/n))[slot%n]}}

/* starts when you walk into the club and stops when you leave */
function djTick(){const inClub=!!(S&&IS&&IS.bid==='club'&&$('game')&&!$('game').hidden);
  if(inClub&&!DJ.on)djStart();else if(!inClub&&DJ.on)djStop();else if(DJ.on)djSync()}
setInterval(djTick,1000);

function djStart(){DJ.on=true;DJ.slot=-1;djCard();const now=djAt(djNowMs());djMeta(now.i);
  ytReady().then(ok=>{if(!DJ.on)return;if(ok)djYT();else djBeatMode()})}
function djStop(){DJ.on=false;beatStop();try{DJ.player&&DJ.player.destroy()}catch(e){}DJ.player=null;DJ.mode=null;DJ.slot=-1;const c=$('djCard');if(c)c.remove()}

/* keeps your player on the DJ's song and timing */
function djSync(){const now=djAt(djNowMs());
  if(now.slot!==DJ.slot){const first=DJ.slot<0;DJ.slot=now.slot;djMeta(now.i);if(!first&&DJ.mode==='yt')toast(`🎧 DJ Kwaku Flames: "Next one: ${CLUB_TRACKS[now.i].t}!"`);
    if(DJ.mode==='yt'&&DJ.player&&DJ.player.loadVideoById){if(DJ.bad[now.i]){djBeatOn()}else{beatStop();DJ.player.loadVideoById({videoId:CLUB_TRACKS[now.i].id,startSeconds:now.off})}}}
  else if(DJ.mode==='yt'&&DJ.player&&DJ.player.getCurrentTime&&!DJ.bad[now.i]){
    const st=DJ.player.getPlayerState?DJ.player.getPlayerState():-1,cur=DJ.player.getCurrentTime();
    if(st===1&&Math.abs(cur-now.off)>2.5)DJ.player.seekTo(now.off,true);
    if(st===0&&BEAT.t==null)djBeatOn();   // song was shorter than the DJ's slot: he fills with his beat until the next one
    $('djTap')&&($('djTap').hidden=!(st===-1||st===2||st===5)||now.off<1)}}

/* ---- the "now playing" card: YouTube's player and the song; your only control is your own volume ---- */
function djCard(){let c=$('djCard');if(!c){c=document.createElement('div');c.id='djCard';c.setAttribute('role','region');c.setAttribute('aria-label','Club music');document.body.appendChild(c)}
  c.innerHTML=`<div class="dj-screen" id="djScreen"><div id="djYT"></div><div class="dj-eq" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
      <button class="dj-tap" id="djTap" hidden>▶ Tap to hear the music</button></div>
    <div class="dj-meta"><small>🎧 DJ Kwaku Flames is playing</small><b id="djT"></b><span id="djA"></span></div>
    <div class="dj-btns"><button id="djMute" aria-pressed="${DJ.muted}">${DJ.muted?'🔇 Unmute':'🔊 Mute'}</button><button id="djUp" title="What's coming up">⏱ Next up</button></div>`;
  $('djMute').onclick=()=>{DJ.muted=!DJ.muted;djVol();$('djMute').textContent=DJ.muted?'🔇 Unmute':'🔊 Mute';$('djMute').setAttribute('aria-pressed',DJ.muted)};
  $('djUp').onclick=()=>{const now=djAt(djNowMs()),nx=djAt((now.slot+1)*DJ_SLOT*1000+500),left=Math.ceil(DJ_SLOT-now.off);toast(`⏱ Next up in ${Math.floor(left/60)}:${String(left%60).padStart(2,'0')}: ${CLUB_TRACKS[nx.i].t} · ${CLUB_TRACKS[nx.i].a}`)};
  $('djTap').onclick=()=>{try{ACX&&ACX.resume&&ACX.resume()}catch(e){}if(DJ.player&&DJ.player.playVideo){DJ.player.seekTo(djAt(djNowMs()).off,true);DJ.player.playVideo()}$('djTap').hidden=true}}
function djMeta(i){const t=$('djT'),a=$('djA');if(!t)return;if(DJ.mode==='beat'){t.textContent='Club beat';a.textContent='Original mix · YouTube unavailable here'}else{const k=CLUB_TRACKS[i];t.textContent=k.t;a.textContent=k.a}}
function djVol(){try{DJ.player&&DJ.player.setVolume&&DJ.player.setVolume(DJ.muted?0:80)}catch(e){}if(BEAT.bus)BEAT.bus.gain.value=DJ.muted?0:.32}

/* club menu: shows the DJ's set (no skipping: the DJ decides) */
function djSongs(){S.paused=true;openSheet();const now=djAt(djNowMs()),up=[0,1,2,3].map(k=>djAt((now.slot+k)*DJ_SLOT*1000+500));
  $('sheetIn').innerHTML=`<h3>🎧 DJ Kwaku Flames' set</h3><p style="font-size:13px;opacity:.8">Everyone in Club Vibes hears the same song. Official videos from the artists' YouTube channels.</p>
  <div class="list">${up.map((u,k)=>{const tr=CLUB_TRACKS[u.i],left=Math.ceil(DJ_SLOT-now.off)+(k-1)*DJ_SLOT;return `<div class="item"><div class="grow"><b>${esc(tr.t)}</b><small>${esc(tr.a)}</small></div><span class="tag${k?'':' g'}">${k?`in ${Math.floor(left/60)}:${String(left%60).padStart(2,'0')}`:'Now'}</span></div>`}).join('')}</div>
  <button class="ghost sm" id="bye">Close</button>`;$('bye').onclick=closeSheet}

/* ---- YouTube's player ---- */
let YTP=null;function ytReady(){if(YTP)return YTP;YTP=new Promise(res=>{if(window.YT&&YT.Player)return res(true);
  const prev=window.onYouTubeIframeAPIReady;window.onYouTubeIframeAPIReady=()=>{try{prev&&prev()}catch(e){}res(true)};
  const s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';s.async=true;s.onerror=()=>res(false);document.head.appendChild(s);setTimeout(()=>res(!!(window.YT&&YT.Player)),7000)});
  YTP.then(ok=>{if(!ok)YTP=null});return YTP}
function djYT(){DJ.mode='yt';const now=djAt(djNowMs());DJ.slot=now.slot;djMeta(now.i);const host=$('djYT');if(!host)return;
  DJ.player=new YT.Player(host,{width:200,height:200,videoId:CLUB_TRACKS[now.i].id,host:'https://www.youtube-nocookie.com',
    playerVars:{autoplay:1,playsinline:1,rel:0,modestbranding:1,controls:0,disablekb:1,fs:0,iv_load_policy:3,start:Math.floor(now.off)},
    events:{onReady:e=>{try{djVol();e.target.seekTo(djAt(djNowMs()).off,true);e.target.playVideo()}catch(x){}},
      onStateChange:e=>{const sc=$('djScreen');if(sc)sc.classList.toggle('live',e.data===1);if(e.data===1){beatStop();if(sc)sc.classList.remove('beat')}},
      onError:()=>{const i=djAt(djNowMs()).i;DJ.bad[i]=1;djBeatOn()}}})}

/* ---- the DJ's own beat (original, made in the browser), locked to the clock so it's in sync too ---- */
const BEAT={t:null,bus:null,last:-1};const BEAT_STEP=60/112/4;
function djBeatMode(){DJ.mode='beat';djMeta(0);djBeatOn()}
function djBeatOn(){const sc=$('djScreen');if(sc)sc.classList.add('beat','live');beatStart()}
function beatStart(){try{ACX=ACX||new (window.AudioContext||window.webkitAudioContext)();ACX.resume&&ACX.resume()}catch(e){return}if(BEAT.t)return;
  BEAT.bus=ACX.createGain();BEAT.bus.gain.value=DJ.muted?0:.32;BEAT.bus.connect(ACX.destination);BEAT.last=-1;
  if(!BEAT.noise){const len=ACX.sampleRate*.4,nb=ACX.createBuffer(1,len,ACX.sampleRate),d=nb.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;BEAT.noise=nb}
  BEAT.t=setInterval(beatSched,40)}
function beatStop(){if(BEAT.t){clearInterval(BEAT.t);BEAT.t=null}if(BEAT.bus){try{BEAT.bus.gain.setTargetAtTime(0,ACX.currentTime,.05);const b=BEAT.bus;setTimeout(()=>b.disconnect(),400)}catch(e){}BEAT.bus=null}}
/* step numbers come from the shared clock, so two phones play the same step at the same time */
function beatSched(){const ahead=.18,nowS=djNowMs()/1000,ctx=ACX.currentTime;
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
