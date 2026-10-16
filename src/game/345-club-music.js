/* ================= Club Vibes DJ: real Ghanaian hits inside the club =================
   Songs play from the artists' official YouTube videos through YouTube's own player, which stays
   visible on screen (that's how YouTube allows other sites to play its videos, and the artists keep
   the views). If YouTube can't load (no internet, or a page that blocks it), the DJ plays an original
   Afrobeats beat made in the browser instead. To add a song, add its official video id below. */
const CLUB_TRACKS=[
  {id:'GIDiI5kyBDQ',t:'Kwaku the Traveller',a:'Black Sherif'},
  {id:'jFdD3Y8mqPI',t:'Second Sermon',a:'Black Sherif'},
  {id:'NPCC02SaJVg',t:'Terminator ft. Young Jonn',a:'King Promise'},
  {id:'BZjCr_ABHCE',t:'Odo Bi ft. Sarkodie',a:'Stonebwoy'},
  {id:'BppzVnoLygQ',t:'Touch It ft. Tyga',a:'KiDi'}];
const DJ={on:false,off:false,i:0,mode:null,player:null,ytState:'idle',queue:null};

/* start/stop by itself when you walk into or out of the club */
function djTick(){const inClub=!!(S&&IS&&IS.bid==='club'&&$('game')&&!$('game').hidden);
  if(inClub&&!DJ.on&&!DJ.off)djStart();else if(!inClub&&(DJ.on||DJ.off)){djStop();DJ.off=false}}
setInterval(djTick,700);

function djStart(i){DJ.on=true;DJ.off=false;if(i==null){i=DJ.queue!=null?DJ.queue:Math.floor(Math.random()*CLUB_TRACKS.length);DJ.queue=null}DJ.i=i;djCard();
  ytReady().then(ok=>{if(!DJ.on)return;if(ok)djYT();else djBeatMode()})}
function djStop(){DJ.on=false;beatStop();try{DJ.player&&DJ.player.destroy()}catch(e){}DJ.player=null;DJ.mode=null;const c=$('djCard');if(c)c.remove()}
function djPlay(i){if(!(S&&IS&&IS.bid==='club')){DJ.queue=i;toast(`🎧 The DJ will play ${CLUB_TRACKS[i].t} when you get to Club Vibes`);return}
  DJ.i=i;if(DJ.mode==='yt'&&DJ.player&&DJ.player.loadVideoById){DJ.player.loadVideoById(CLUB_TRACKS[i].id);djMeta()}else{djStop();djStart(i)}}
const djNext=()=>djPlay((DJ.i+1)%CLUB_TRACKS.length);

/* the "now playing" card: YouTube's player plus the song, artist and controls */
function djCard(){let c=$('djCard');if(!c){c=document.createElement('div');c.id='djCard';c.setAttribute('role','region');c.setAttribute('aria-label','Club music');document.body.appendChild(c)}
  c.innerHTML=`<div class="dj-screen" id="djScreen"><div id="djYT"></div><div class="dj-eq" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div></div>
    <div class="dj-meta"><small>🎧 DJ Kwaku Flames</small><b id="djT"></b><span id="djA"></span></div>
    <div class="dj-btns"><button id="djNx" aria-label="Next song">⏭ Next</button><button id="djRq">🎵 Songs</button><button id="djX" aria-label="Stop the music">✕</button></div>`;
  $('djNx').onclick=()=>DJ.mode==='beat'?toast('YouTube isn\'t available here, so the DJ is playing his own beat.'):djNext();
  $('djRq').onclick=()=>djSongs();
  $('djX').onclick=()=>{djStop();DJ.off=true;djPill()};djMeta()}
function djMeta(){const t=$('djT'),a=$('djA');if(!t)return;if(DJ.mode==='beat'){t.textContent='Club beat';a.textContent='Original mix · YouTube unavailable here'}else{const k=CLUB_TRACKS[DJ.i];t.textContent=k.t;a.textContent=k.a}}
/* after you stop the music, a small button lets you turn it back on */
function djPill(){let c=$('djCard');if(!c){c=document.createElement('div');c.id='djCard';document.body.appendChild(c)}c.className='pill';c.innerHTML='<button id="djOn">🎵 Play music</button>';$('djOn').onclick=()=>{c.className='';djStart(DJ.i)}}
function djSongs(){S.paused=true;openSheet();$('sheetIn').innerHTML=`<h3>🎧 Ask the DJ for a song</h3><p style="font-size:13px;opacity:.8">Official videos from the artists' YouTube channels.</p>
  <div class="list">${CLUB_TRACKS.map((k,i)=>`<button class="item" data-tr="${i}" style="text-align:left;cursor:pointer"><div class="grow"><b>${esc(k.t)}</b><small>${esc(k.a)}</small></div>${DJ.on&&DJ.mode==='yt'&&DJ.i===i?'<span class="tag g">Playing</span>':''}</button>`).join('')}</div><button class="ghost sm" id="bye">Close</button>`;
  $('sheetIn').querySelectorAll('[data-tr]').forEach(b=>b.onclick=()=>{closeSheet();const i=+b.dataset.tr;if(DJ.off){DJ.off=false;const c=$('djCard');if(c)c.className=''}djPlay(i);toast(`🎧 DJ: "${CLUB_TRACKS[i].t}, coming up!"`)});$('bye').onclick=closeSheet}

/* ---- YouTube's player ---- */
let YTP=null;function ytReady(){if(YTP)return YTP;YTP=new Promise(res=>{if(window.YT&&YT.Player)return res(true);
  const prev=window.onYouTubeIframeAPIReady;window.onYouTubeIframeAPIReady=()=>{try{prev&&prev()}catch(e){}res(true)};
  const s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';s.async=true;s.onerror=()=>res(false);document.head.appendChild(s);setTimeout(()=>res(!!(window.YT&&YT.Player)),7000)});
  YTP.then(ok=>{if(!ok)YTP=null});return YTP}
function djYT(){DJ.mode='yt';djMeta();const host=$('djYT');if(!host)return;let fails=0;
  DJ.player=new YT.Player(host,{width:200,height:200,videoId:CLUB_TRACKS[DJ.i].id,host:'https://www.youtube-nocookie.com',
    playerVars:{autoplay:1,playsinline:1,rel:0,modestbranding:1,controls:1},
    events:{onReady:e=>{try{e.target.setVolume(80);e.target.playVideo()}catch(x){}},
      onStateChange:e=>{const st=e.data;$('djScreen')&&$('djScreen').classList.toggle('live',st===1);if(st===0)djNext();if(st===1)fails=0},
      onError:()=>{if(++fails>=CLUB_TRACKS.length){try{DJ.player.destroy()}catch(x){}DJ.player=null;djBeatMode()}else djNext()}}})}

/* ---- the DJ's own beat (original, made in the browser) ---- */
const BEAT={t:null,next:0,step:0,bus:null};
function djBeatMode(){DJ.mode='beat';djMeta();const sc=$('djScreen');if(sc)sc.classList.add('beat','live');beatStart()}
function beatStart(){try{ACX=ACX||new (window.AudioContext||window.webkitAudioContext)();ACX.resume&&ACX.resume()}catch(e){return}if(BEAT.t)return;
  BEAT.bus=ACX.createGain();BEAT.bus.gain.value=.32;BEAT.bus.connect(ACX.destination);BEAT.next=ACX.currentTime+.08;BEAT.step=0;
  const len=ACX.sampleRate*.4,nb=ACX.createBuffer(1,len,ACX.sampleRate),d=nb.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;BEAT.noise=nb;
  BEAT.t=setInterval(beatSched,40)}
function beatStop(){if(BEAT.t){clearInterval(BEAT.t);BEAT.t=null}if(BEAT.bus){try{BEAT.bus.gain.setTargetAtTime(0,ACX.currentTime,.05);const b=BEAT.bus;setTimeout(()=>b.disconnect(),400)}catch(e){}BEAT.bus=null}}
function beatSched(){const spb=60/112/4;while(BEAT.next<ACX.currentTime+.18){beatStep(BEAT.step,BEAT.next);BEAT.next+=spb;BEAT.step=(BEAT.step+1)%32}}
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
