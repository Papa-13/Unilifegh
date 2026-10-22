/* ================= chats that make sense =================
   Replies follow the conversation: if someone texted you first they never ask "who is this?", they answer
   "how did you get my number?", and when they asked you something ("Have you eaten?", "Can we talk?") your
   yes/no/answer gets a reply that fits. People don't repeat the exact same line twice in a row. */
INTENTS.unshift(['number',/(how|where) (did|do) (you|u) get my (number|digits|contact)|who gave (you|u) my (number|contact)/i],['name',/what'?s your name|what is your name|your name\??$/i],
  ['course',/what (do|are) (you|u) (study|studying|read|offer)|which (course|programme|program)|what course|your course/i],['hostel',/which hostel|where do (you|u) (stay|live)|your hostel|where you dey stay/i],
  ['fine',/^\s*(i'?m |am |i am )?(fine|good(?! ?(morning|night|evening|afternoon))|great|alright|not bad|i dey|i'?m doing (well|good))\b/i],['ate',/^\s*(i (have )?(already )?(eaten|ate)|i chop(ped)?|yes i ate)/i],['bored',/\bbored\b/i]);
const lastFrom=n=>S.msgs.find(m=>m.chat===n.name&&!m.mine&&!m.sys);
const theyStarted=n=>{const th=S.msgs.filter(m=>m.chat===n.name&&!m.sys);return th.length&&!th[th.length-1].mine};
/* what they asked you last, and how to answer your reply */
const CTX=[[/can we talk|let'?s talk|saved my number/i,{yes:['Yay 🙈 So tell me about yourself. Which hostel are you in?','Okay 😊 I\'m happy you replied. How\'s campus treating you?'],no:['Oh… okay 😕 Sorry for disturbing.','Ah okay, no wahala 🙂'],any:['Haha okay 😅 So how\'s your day going?']}],
  [/have you eaten|did you eat/i,{yes:['Nice 😋 what did you eat?','Okay good, I was worried 😂'],no:['Ei! Go and eat something 😩','You haven\'t eaten?? Let\'s go and buy waakye 🍛'],ate:['Nice 😋 I\'m still hungry myself 😩']}],
  [/lecture tomorrow/i,{yes:['Okay, save me a seat 🙏','Good. I\'ll see you there then 😄'],no:['Ei, you\'ll miss attendance o 😂','Hmm, then send me the notes later? 😂']}],
  [/assignment|have you started/i,{yes:['Ei you\'re serious 😭 send me yours to check small 🙏','Okay oo, top student 😂'],no:['Same 😭 let\'s do it together tomorrow','Chale we are finished 😂😭']}],
  [/what happened at the canteen/i,{any:['Someone\'s jollof fell on the lecturer\'s shoe 😂😂 the whole canteen went quiet','A guy proposed in front of everybody and she said NO 😭😂']}],
  [/you dey\?|are you there/i,{yes:['Ah good 😂 I was bored. What are you doing?','Okay I\'m here too 👀 what\'s up?'],any:['Okay 😂 I was just checking on you']}],
  [/what are you doing\?|what you dey do/i,{any:['Okay 😄 I\'m just here, bored','Nice. Don\'t forget me o 😂','Hmm okay, enjoy 😄']}],
  [/where are you\?/i,{any:['Okay 👍 I might pass by later','Oh nice, I\'m not far from there 👀']}],
  [/i'?m so bored/i,{any:['Same 😩 come and let\'s do something','😂 okay, entertain me then']}],
  [/how are you\?|you\?$/i,{fine:['Nice 😊','Good to hear! 🙌','Okay, thank God 🙏'],any:['Hmm okay 😅']}],
  [/which hostel|how'?s campus/i,{any:['Oh nice! We should link up some time 😊','Okay, I know there 😄']}]];
function ctxReply(n,intent){const lf=lastFrom(n);if(!lf||S.min-lf.at>360)return null;const c=CTX.find(([r])=>r.test(lf.text));if(!c)return null;const o=c[1];
  const k=intent==='yes'||intent==='ate'&&!o.ate?'yes':intent==='no'?'no':intent==='fine'&&o.fine?'fine':intent==='ate'?'ate':null;
  const L=(k&&o[k])||(intent==='def'||intent==='q'||intent==='laugh'||intent==='fine'||intent==='yes'||intent==='no'?o.any:null);return L?{text:pick(L),gain:2}:null}
const PROG_SHORT=n=>(n.prog||'my course').replace(/^BSc\.? |^BA\.? /,'');
{const _nr=npcReply;npcReply=function(n,intent,vn){const p=P(),started=theyStarted(n),fn=n.name.split(' ')[0];let r=null;
  /* they texted you first, so they obviously know who you are */
  if(intent==='number'){if(started)r={text:n.hitOn?pick(['You gave it to me yourself 😂 Have you forgotten already?','Ehh, you gave me 😂']):pick(['I asked around in your hostel 🙈 Don\'t be vexed','A friend gave it to me 🙈 I hope that\'s okay','I have my ways 😏']),gain:2};
    else r={text:n.met?'You gave it to me, remember? 😅':'Who is this please? 😅',gain:1}}
  else if(intent==='name')r={text:started||n.met?pick([`It's ${fn} 😊`,`${n.name}! Save my number o 😂`]):'You texted me, so you tell me who you are first 😂',gain:1};
  else if(intent==='course')r={text:pick([`I'm doing ${PROG_SHORT(n)}. It's stressful paa 😩`,`${PROG_SHORT(n)} 📚 What about you?`]),gain:2};
  else if(intent==='hostel')r={text:pick([`I'm in ${BID[n.home]?BID[n.home].name:'my hostel'} 🏠`,`${BID[n.home]?BID[n.home].name:'Campus'}. Come and visit some time 😊`]),gain:2};
  else if(intent==='bored')r={text:pick(['Same 😩 let\'s do something','Come out then! 😂','Bored people club 🙋'])},r&&(r.gain=2);
  if(!r&&!n.pend)r=ctxReply(n,intent);
  if(!r){const low=n.friend<15&&!n.mate;let bump=false;if(low&&(started||n.met)){n.friend+=15;bump=true}
    try{r=_nr.apply(this,arguments);
      /* don't say exactly the same thing twice in a row */
      for(let i=0;i<4&&r&&n._lastReply===r.text;i++){const r2=_nr.apply(this,arguments);if(r2)r=r2}}finally{if(bump)n.friend-=15}}
  if(r&&r.gain==null)r.gain=1;if(r)n._lastReply=r.text;return r}}
