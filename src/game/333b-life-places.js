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
const LE_PLACE={
  snatch:()=>leOut()&&leNear('night','market'),
  lostid:()=>leNear('lib'),
  blackstars:()=>leHostel(),
  flood:()=>leHostel(),
  leak:()=>leHostel(),
  lecturerhelp:()=>leDept()&&leWeekday(),
  preacher:()=>leOut()&&leNear('square'),
  talent:()=>leNear('greathall','square','parade'),
  wallet:()=>leOut(),
  nearmiss:()=>leOut()&&!leNear('lib','field','lake','garden')};
LIFE_EVENTS.forEach(e=>{const w=LE_PLACE[e.id];if(!w)return;const _w=e.when;e.when=()=>{try{return w()&&_w()}catch(x){return false}}});
/* the lecturer: your own lecturer, at your own department */
{const e=LIFE_EVENTS.find(e=>e.id==='lecturerhelp');if(e)e.run=()=>{const nm=lecturerOf(0),dep=(BID[P().col]||{}).name||'your department';
  leStory('📚',`${esc(nm)} needs a hand`,`As you pass ${esc(dep)}, ${esc(nm)} is struggling up the stairs with a big box of exam scripts.`,[
    ['🙋 "Let me help you"','g',()=>{LE_FX({energy:-4,study:3});advance(15);S.lecHelped=(S.lecHelped||0)+1;leDone(`${nm}: "Thank you, my dear. What is your name again?" They'll remember you 😉`)}],
    ['🚶 Keep walking','',()=>{}]])}}
/* no life events in the middle of a film, a full-screen game or a lecture */
{const _lt=lifeTick;lifeTick=function(){try{if(FSGAME.on>0||$('cinemaFS')||(S.busy&&/lecture|exam|watching .*film|movie/i.test(S.busy.label||'')))return}catch(e){}return _lt.apply(this,arguments)}}
