/* ================= SoundCloud tracks (campus artists) =================
   Some songs come from SoundCloud instead of YouTube. They play through SoundCloud's own embedded player
   (the artist's plays count on SoundCloud), in sync like the others. If SoundCloud can't load, the
   original browser beat plays instead. To add one: push {sc:'<soundcloud track url>', t, a}. */
CLUB_TRACKS.push({sc:'https://soundcloud.com/valerie-and-emberlyn-vibes/lets-get-the-party-started',t:'Let\'s Get the Party Started',a:'Nana · 🎙️ Campus artist',campus:1});
/* more Ghanaian hits (official videos) and long CULTUR FM Afrobeats mixes */
CLUB_TRACKS.push(
  {id:'6unnNvyupos',t:'Forever',a:'Gyakie'},
  {id:'tEVWPBxEx3Y',t:'Sugarcane (Remix) ft. Mayorkun, King Promise & Darkoo',a:'Camidoh'},
  {id:'zdKpIM9VwGM',t:'Soja',a:'Black Sherif'},
  {id:'4S9ma6z_Y70',t:'Monica',a:'Kuami Eugene'},
  {id:'TK7k8vKLGi4',t:'Enjoyment',a:'KiDi'},
  {id:'QqmxpTbOHX4',t:'Non Living Thing ft. Oxlade',a:'Sarkodie'},
  {id:'VzgkY78sh0I',t:'Paris',a:'King Promise'},
  {id:'hvf_K273XIY',t:'Live Afrobeats Mix by DJames',a:'CULTUR FM · 🎧 mix',mix:1},
  {id:'ym5qWlk-5dw',t:'Live Afrobeats Mix by P Smoov (DC)',a:'CULTUR FM · 🎧 mix',mix:1},
  {id:'3ezu_1lPyFI',t:'Live Afrobeats Mix by ICERAGE',a:'CULTUR FM · 🎧 mix',mix:1},
  {id:'GzYYPZCoEb8',t:'Live Afrobeats Mix by DJ Ehnny (Houston)',a:'CULTUR FM · 🎧 mix',mix:1});
let SCP=null;function scReady(){if(SCP)return SCP;SCP=new Promise(res=>{if(window.SC&&SC.Widget)return res(true);const s=document.createElement('script');s.src='https://w.soundcloud.com/player/api.js';s.async=true;
  s.onload=()=>res(!!(window.SC&&SC.Widget));s.onerror=()=>res(false);document.head.appendChild(s);setTimeout(()=>res(!!(window.SC&&SC.Widget)),7000)});SCP.then(ok=>{if(!ok)SCP=null});return SCP}
/* a fresh, empty spot for the player inside the music card */
function musHost(){const sc=$('djScreen');if(!sc)return null;let h=$('djYT');if(h)h.remove();h=document.createElement('div');h.id='djYT';sc.prepend(h);return h}
function musSC(w){const k=CLUB_TRACKS[w.i];try{MUS.player&&MUS.player.destroy()}catch(e){}MUS.player=null;const host=musHost();if(!host)return;MUS.mode='yt';musMeta();
  const f=document.createElement('iframe');f.allow='autoplay';f.width='200';f.height='200';f.style.border='0';f.title=`${k.t} on SoundCloud`;
  f.src=`https://w.soundcloud.com/player/?url=${encodeURIComponent(k.sc)}&auto_play=true&visual=true&hide_related=true&show_comments=false&show_reposts=false&show_teaser=false&buying=false&sharing=false&download=false`;host.appendChild(f);
  const W=SC.Widget(f),P={sc:true,pos:0,state:-1,
    destroy(){try{W.pause()}catch(e){}f.remove();musHost()},getCurrentTime(){return this.pos/1000},getPlayerState(){return this.state},
    seekTo(s){try{W.seekTo(s*1000)}catch(e){}},setVolume(v){try{W.setVolume(v)}catch(e){}},playVideo(){try{W.play()}catch(e){}}};
  MUS.player=P;const E=SC.Widget.Events,live=on=>{const s=$('djScreen');if(s){s.classList.toggle('live',on);if(on)s.classList.remove('beat')}};
  W.bind(E.READY,()=>{if(MUS.player!==P)return;musVol();W.seekTo(musOff()*1000);W.play()});
  W.bind(E.PLAY,()=>{P.state=1;beatStop();live(true)});W.bind(E.PAUSE,()=>{P.state=2});W.bind(E.PLAY_PROGRESS,e=>{P.pos=e.currentPosition||0});
  W.bind(E.FINISH,()=>{P.state=0;if(MUS.player===P)musEnded()});W.bind(E.ERROR,()=>{if(MUS.player===P&&MUS.src){MUS.bad[MUS.src.i]=1;beatOn()}})}
{const _ml=musLoad;musLoad=function(){const w=MUS.src;if(!w)return;const k=CLUB_TRACKS[w.i];
  if(k&&k.sc){if(MUS.bad[w.i]){beatOn();return}scReady().then(ok=>{if(MUS.src!==w&&MUS.key!==w.key)return;if(!ok){MUS.mode='beat';musMeta();beatOn();return}beatStop();musSC(w)});return}
  /* back to a YouTube song after a SoundCloud one: drop the SoundCloud player first */
  if(MUS.player&&MUS.player.sc){try{MUS.player.destroy()}catch(e){}MUS.player=null}return _ml.apply(this,arguments)}}
