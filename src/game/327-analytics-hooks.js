/* ================= what gets counted (anonymous) =================
   Sent to Google Analytics on the website: starting the game, finishing a character, and the main things
   people do (dates, eating, FIFA, lectures, gem purchases). Nothing personal: no names, messages or chats. */
window.track=window.track||function(n,p){const q=window.__tq=window.__tq||[];if(q.length<200)q.push([n,p])};
const _trT={};
function trk(n,p,every=60){const t=Date.now();if(every&&_trT[n]&&t-_trT[n]<every*1000)return;_trT[n]=t;try{window.track(n,p||{})}catch(e){}}
{const _sg=showGame;showGame=function(){const r=_sg.apply(this,arguments);try{trk('game_start',{in_game_day:day(),hostel:P().home,gfx:typeof GFX!=='undefined'?GFX:''},0);window.trackUser&&window.trackUser({hostel:P().home,gender:P().look.gender})}catch(e){}return r}}
{const _ng=newGame;newGame=function(){const r=_ng.apply(this,arguments);trk('character_created',{},0);return r}}
{const _ev=ev;ev=function(type,d){try{const M={talk:'socialize',chat:'text_message',eat:'eat',game:'minigame',lecture:'attend_lecture',sleep:'sleep',grad:'graduate',vote:'vote',post:'post'};
  if(M[type])trk(M[type],type==='eat'&&typeof d==='string'?{item:d}:type==='game'&&d&&d.kind?{kind:d.kind}:{},type==='grad'?0:90)}catch(e){}return _ev.apply(this,arguments)}}
{const _dg=dateGo;dateGo=function(n,k){trk('date',{place:k},0);return _dg.apply(this,arguments)}}
{const _c=caught;caught=function(L,n,kind,how){trk('caught_cheating',{how},0);return _c.apply(this,arguments)}}
{const _b=breakUp;breakUp=function(){trk('break_up',{},0);return _b.apply(this,arguments)}}
{const _f=playFifa;playFifa=function(){trk('play_fifa',{},0);return _f.apply(this,arguments)}}
{const _g=gemShop;gemShop=function(){trk('open_gem_shop',{},0);return _g.apply(this,arguments)}}
/* how long people actually play: one ping every 5 minutes while the game is open and visible */
setInterval(()=>{if(S&&S.p&&!document.hidden&&!$('game').hidden)trk('playing_5min',{in_game_day:day()},0)},300000);
