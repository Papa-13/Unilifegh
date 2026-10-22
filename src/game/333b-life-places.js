/* ================= life events happen in the right place =================
   Things that happen to you in person only happen where they make sense: a lecturer needing a hand only at
   (or right outside) your department on a weekday, the phone snatcher only near the Night Market, the preacher
   only at Akwaaba Square, hostel drama only at your hostel, and so on. Things that reach you by phone
   (a call from home, an email, the class group chat) can come anywhere, but never in the middle of a film,
   a game or a lecture. */
const leAt=()=>{try{if(IS)return IS.kind==='room'?'room':IS.bid;const b=locOf(P().x,P().y);return b?b.id:null}catch(e){return null}};
const leNear=(...ids)=>ids.includes(leAt());
const leHostel=()=>leAt()==='room'||leAt()===P().home;
const leDept=()=>{const a=leAt();return !!a&&a===P().col};
const leWeekday=()=>{try{return wd()>=1&&wd()<=5}catch(e){return true}};
const leAcad=()=>{const a=leAt();return !!a&&(a===P().col||!!COLLEGES[a]||a==='lib'||a==='senate')};
const lePublic=()=>{const a=leAt();return a!=='room'&&!['cinema','club','resto','arcade'].includes(a)};
const lePlaceTxt=()=>{const a=leAt();if(!a||!BID[a])return'on campus';return'at '+BID[a].name.split(' · ')[0]};
/* fixed places for things that only happen there; everything else can happen wherever you happen to be */
const LE_PLACE={
  blackstars:()=>leHostel(),
  flood:()=>leHostel(),
  leak:()=>leHostel(),
  lecturerhelp:()=>leAcad()&&leWeekday(),
  snatch:()=>leOut(),
  lostid:()=>lePublic(),
  preacher:()=>leOut(),
  wallet:()=>leOut(),
  nearmiss:()=>leOut()&&!leNear('lib','field','lake','garden')};
/* the story names the place you're actually at */
let LE_CUR=null;
{const _ls=leStory;leStory=function(ic,title,scene,ch){try{const w=lePlaceTxt();if(LE_CUR==='snatch')scene=scene.replace('while you walk past the Night Market',`while you're walking ${w}`);
  if(LE_CUR==='lostid')scene=scene.replace('at the library entrance',w);if(LE_CUR==='preacher'){title=`A preacher ${w}`;scene=scene.replace('A campus preacher','A campus preacher')}}catch(e){}return _ls.call(this,ic,title,scene,ch)}}
LIFE_EVENTS.forEach(e=>{const r=e.run;e.run=function(){LE_CUR=e.id;try{return r.apply(this,arguments)}finally{LE_CUR=null}}});
BUFFS.confident=BUFFS.confident||['😎','Feeling confident','happy',120];
/* two more things that can happen anywhere */
LIFE_EVENTS.push(
 {id:'oldfriend',gap:12,when:()=>lePublic()&&leH()>=8&&leH()<21,run:()=>{const nm=pick(['Kwame','Abena','Yaw','Efua','Kojo','Adwoa','Nana','Akua']),w=lePlaceTxt();
   leStory('🙌',`"Ei! ${esc(P().name.split(' ')[0])}!"`,`Someone shouts your name ${w}. It's ${nm}, your old classmate from SHS! You haven't seen each other since WASSCE.`,[
    ['🤗 Catch up for a bit','g',()=>{LE_FX({social:18,fun:10});advance(25);leDone(`You and ${nm} gist about old teachers and who's dating who now 😂 You swap numbers.`)}],
    ['👋 "Let\'s talk later, I\'m in a hurry"','',()=>{LE_FX({social:3});leDone(`${nm}: "Okay o, don't forget me!" 😅`)}]])}},
 {id:'promo',gap:10,when:()=>leOut()&&leH()>=9&&leH()<18,run:()=>{const w=lePlaceTxt();
   leStory('📣','Free data giveaway!',`A telecom promo team ${w} is giving free data bundles to anyone who dances to their jingle on camera.`,[
    ['💃 Dance for it','g',()=>{LE_FX({fun:12,social:6});addBuff('confident');leDone('You killed it 😂 2GB free data, and the crowd cheered you on!')}],
    ['🙈 No way, keep walking','',()=>{}]])}});
LIFE_EVENTS.forEach(e=>{const w=LE_PLACE[e.id];if(!w)return;const _w=e.when;e.when=()=>{try{return w()&&_w()}catch(x){return false}}});
/* the lecturer: your own lecturer, at your own department */
{const e=LIFE_EVENTS.find(e=>e.id==='lecturerhelp');if(e)e.run=()=>{const nm=lecturerOf(0),dep=(BID[leAt()]||BID[P().col]||{}).name||'your department';
  leStory('📚',`${esc(nm)} needs a hand`,`As you pass ${esc(dep)}, ${esc(nm)} is struggling up the stairs with a big box of exam scripts.`,[
    ['🙋 "Let me help you"','g',()=>{LE_FX({energy:-4,study:3});advance(15);S.lecHelped=(S.lecHelped||0)+1;leDone(`${nm}: "Thank you, my dear. What is your name again?" They'll remember you 😉`)}],
    ['🚶 Keep walking','',()=>{}]])}}
/* no life events in the middle of a film, a full-screen game or a lecture */
{const _lt=lifeTick;lifeTick=function(){try{if(FSGAME.on>0||$('cinemaFS')||(S.busy&&/lecture|exam|watching .*film|movie/i.test(S.busy.label||'')))return}catch(e){}return _lt.apply(this,arguments)}}
