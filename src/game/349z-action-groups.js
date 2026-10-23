/* ================= tidy room actions into categories =================
   When there are lots of things to do in your room, the Actions list shows a few urgent ones on top,
   then categories (Home & furniture, TV & music, Food, People, Rest, Study & hustles). Tap a category
   to see what's inside, and ‹ Back to return. Small lists stay as they are. */
const ACT_CATS=[
  ['tv','📺 TV & music',/TV|music|song|Karaoke|Sing along|Dance to|FIFA|movie|channel|speaker|Watch /i],
  ['food','🍳 Food & drinks',/Cook|Eat |eat |gari|Indomie|kitchen|kettle|fridge|drink|provisions|🥫|🍳|🍱|breakfast|snack/i],
  ['people','👥 People',/Invite|Offer .* seat|sleep over|stay the night|Hang out|Study together|Say bye|👋|Oware|Knock|Play .* with|Talk|guest|Ask .* to/i],
  ['rest','🛏️ Rest & self-care',/Sleep|Nap|nap|Shower|bath|Bucket|Scroll|beanbag|Chill|Relax|Sit on|Soak|lights|💡/i],
  ['study','📚 Study & hustles',/Study|study|laptop|design|Wash .*clothes|laundry|TikTok|Film|hustle|Read|assignment/i],
  ['home','🛋️ Home & furniture',/Decorate|shop|Arrange|Move your|Turn your|LED|Unpack|cupboard|desk|Clean|tidy|📦/i]];
const ACT_TOP=/^(📦 Unpack|🧺 Wash|🧺 .*laundry|🚪|Knock|💃 Dance|🎤|⏹ Stop|🪑 Offer|Leave the room|🌙 Ask)/;
let ACT_CAT=null;
function actCatOf(label){for(const [k,,r] of ACT_CATS)if(r.test(label))return k;return 'more'}
{const _ra=roomActions;roomActions=function(){const a=_ra.apply(this,arguments);try{
  if(!IS||IS.kind!=='room'||a.length<=7){ACT_CAT=null;return a}
  const wrap=it=>{if(!it[1])return it;const f=it[1],c=it.slice();c[1]=function(){ACT_CAT=null;return f.apply(this,arguments)};return c};
  if(ACT_CAT){const sub=a.filter(it=>!ACT_TOP.test(it[0])&&actCatOf(it[0])===ACT_CAT).map(wrap);
    if(sub.length){const nm=(ACT_CATS.find(c=>c[0]===ACT_CAT)||[0,'➕ More'])[1];return [[`‹ Back · ${nm}`,()=>{ACT_CAT=null;setTimeout(()=>{PIE=true;acts(true)},0)},null,'']].concat(sub)}ACT_CAT=null}
  const top=a.filter(it=>ACT_TOP.test(it[0])&&!/^Leave the room/.test(it[0])),rest=a.filter(it=>!ACT_TOP.test(it[0])),groups={};
  rest.forEach(it=>{const k=actCatOf(it[0]);(groups[k]=groups[k]||[]).push(it)});
  const out=top.slice();[...ACT_CATS.map(c=>c[0]),'more'].forEach(k=>{const g=groups[k];if(!g||!g.length)return;
    if(g.length===1){out.push(g[0]);return}const nm=k==='more'?'➕ More':ACT_CATS.find(c=>c[0]===k)[1];
    out.push([`${nm} (${g.length})`,()=>{ACT_CAT=k;setTimeout(()=>{PIE=true;acts(true)},0)},null,'']);});
  const lv=a.find(it=>/^Leave the room/.test(it[0]));if(lv)out.push(lv);return out}catch(e){console.warn(e);return a}}}
/* closing the actions panel forgets the open category */
{const _pl=pieLayout;pieLayout=function(){if(!PIE&&ACT_CAT&&!S.busy){const was=ACT_CAT;setTimeout(()=>{if(!PIE&&ACT_CAT===was){ACT_CAT=null;try{acts0(true)}catch(e){}}},400)}return _pl.apply(this,arguments)}}
