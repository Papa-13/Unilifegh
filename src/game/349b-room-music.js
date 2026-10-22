/* ================= music in your room: Bluetooth speaker or the TV, then dance or sing =================
   Play music from your Bluetooth speaker or as music videos on your TV. While it's playing you can dance
   or sing along (karaoke on the TV). Roommates and guests who are awake may join in. */
MUS.via=MUS.via||null;
const roomMusicOn=()=>!!(MUS.room&&inMyRoom()&&MUS.src&&MUS.src.kind==='room');
function roomMusicStart(via){MUS.via=via;if(via==='tv'){try{tvPower(true,false)}catch(e){}}musSongs('room')}
/* speakerPlay checks for your room; the TV works even without a speaker */
{const _sp=speakerPlay;speakerPlay=function(i){const r=_sp.apply(this,arguments);try{if(S.busy&&/^Vibing to/.test(S.busy.label||'')){S.busy.cancel=true;finishBusy();P().needs.fun=clamp(P().needs.fun+6)}setTimeout(()=>{try{PIE=true;acts(true)}catch(e){}},400);if(MUS.via==='tv'){tvPower(true,false);toast(`📺 Music videos on the TV: ${CLUB_TRACKS[i].t}`)}else if(!MUS.via)MUS.via='bt'}catch(e){}return r}}
{const _ss=speakerStop;speakerStop=function(){const r=_ss.apply(this,arguments);try{if(MUS.via==='tv'&&TV.on)tvPower(false);MUS.via=null}catch(e){}return r}}
/* the TV shows the song you're playing, with a karaoke banner while you sing (no lyrics, just the vibe) */
{const _td=tvDraw;tvDraw=function(){const tvm=MUS.via==='tv'&&roomMusicOn();if(!tvm)return _td.apply(this,arguments);const p=P(),bak=p.tvCh,songs=TV_SONG.slice(),tr=CLUB_TRACKS[MUS.src.i]||{t:'',a:''};
  p.tvCh=2;TV_SONG.length=0;TV_SONG.push(`${tr.t} · ${tr.a}`);try{_td.apply(this,arguments)}finally{p.tvCh=bak;TV_SONG.length=0;songs.forEach(x=>TV_SONG.push(x))}
  if(S.busy&&/^Singing/.test(S.busy.label||'')){const c=TV.cv.getContext('2d'),t=performance.now()/1000;c.fillStyle='rgba(0,0,0,.55)';c.fillRect(0,0,256,26);c.font='900 13px system-ui';c.textAlign='center';c.fillStyle=`hsl(${(t*80)%360},90%,65%)`;c.fillText('🎤 KARAOKE MODE',128,18);
    c.font='700 16px system-ui';c.fillStyle='#fff';c.fillText(['♪  ♫  ♪','♫  ♪  ♫'][Math.floor(t*2)%2],128,64);TV.tex.needsUpdate=true}}}
/* dancing / singing, and the people in the room joining in */
function roomJoin(kind){const now=performance.now()/1000,who=IS.people.filter(q=>q.n&&q.life&&!q.sleeping&&!q.lying&&!q.mp&&q.pose!=='shower'&&Math.random()<(q.visitor?.85:.6));
  who.forEach(q=>{const A=q.ai||(q.ai={next:0,path:null,goal:null});A.path=null;A.goal=null;A.next=now+(kind==='dance'?70:50);q.pose=kind==='dance'?pick(['dance','dance2','dance3']):'sing';q.n.friend=clamp((q.n.friend||0)+3)});
  if(who.length)setTimeout(()=>toast(`${who.map(q=>q.n.name.split(' ')[0]).join(' & ')} ${who.length>1?'join':'joins'} in ${kind==='dance'?'💃🕺':'🎤'}`),1200);return who}
function roomDance(){const tr=CLUB_TRACKS[MUS.src.i]||{t:'the music'},who=roomJoin('dance');
  startBusy(`Dancing to ${tr.t}`,{pose:pick(['dance','dance2','dance3']),mins:20,fx:{fun:16,social:who.length?8:0,energy:-6}},0,()=>{addBuff('music');toast(who.length?'That was a whole party in here 😂🔥':'You danced like nobody was watching 💃')})}
function roomSing(){const tr=CLUB_TRACKS[MUS.src.i]||{t:'the song'},who=roomJoin('sing'),tv=MUS.via==='tv';
  startBusy(`Singing ${tr.t}${tv?' (karaoke)':''}`,{pose:'sing',mins:15,fx:{fun:14,social:who.length?8:0,energy:-3}},0,()=>{addBuff('music');
    toast(pick(who.length?['Everyone sang the chorus together 🎤😂','Your roommates say you can actually sing o 👀🎤']:['You hit that high note… almost 😂🎤','Shower-singer energy 🎤🔥']))})}
{const _ra=roomActions;roomActions=function(){const a=_ra.apply(this,arguments);try{if(!inMyRoom()||S.busy)return a;const p=P(),bt=p.items.includes('speaker'),tv=!!IS.tv;
  if(roomMusicOn()){a.unshift(['💃 Dance to the music (20m)',()=>roomDance(),null,'b'],[MUS.via==='tv'?'🎤 Karaoke on the TV (15m)':'🎤 Sing along (15m)',()=>roomSing()]);
    a.push([`🎵 Change the song (${MUS.via==='tv'?'TV':'speaker'})`,()=>musSongs('room')],['⏹ Stop the music',()=>speakerStop()])}
  else if(bt||tv){const go=()=>{if(bt&&tv)return placeSheet('🎵 Play music on…',['🔊 Bluetooth speaker','📺 The TV (music videos)'],i=>{closeSheet();setTimeout(()=>roomMusicStart(i?'tv':'bt'),60)});roomMusicStart(tv?'tv':'bt')};
    a.push([`🎵 Play music${bt&&tv?'':tv?' on the TV':' on your speaker'}`,go])}}catch(e){console.warn(e)}return a}}
/* the speaker action on the desk only existed if you had a speaker; with only a TV, musSongs still plays */
{const _ir=speakerPlay;speakerPlay=function(i){if(!P().items.includes('speaker')&&MUS.via!=='tv'&&!(IS&&IS.tv))return toast('Buy a Bluetooth speaker on HomeMart, or a TV, to play music in your room.');return _ir.apply(this,arguments)}}
