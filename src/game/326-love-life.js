/* ================= love life & friendships that work like real life =================
   • Stages: stranger → acquaintance → friend → crush → talking stage → partner (and maybe a secret link).
   • You can have more than one partner, but people talk: a partner can see you, hear the gist from a
     friend, check your phone, or turn up at your room unannounced. Getting caught has consequences.
   • Other students hit on you too; you decide whether to take it further.
   • Texts get answers that fit the question, the time of day and who is answering. */
BUFFS.heartbroken=['💔','Heartbroken','tense',720];BUFFS.guilty=['😬','Guilty conscience','tense',240];BUFFS.crushing=['🦋','Butterflies','flirty',240];
const sides=()=>S.npcs.filter(n=>n.side&&n!==P().partner);
const lovers=()=>[P().partner,...sides()].filter(Boolean);
const gfbf=n=>n.gender==='f'?'girlfriend':'boyfriend';
const hisHer=n=>n.gender==='f'?'her':'his',himHer=n=>n.gender==='f'?'her':'him',heShe=n=>n.gender==='f'?'she':'he';
function relStage(n){const p=P();if(p.partner===n)return '❤️ Your '+gfbf(n);if(n.side)return '🤫 Secret link';if(n.ex)return '💔 Your ex';if(n.met&&n.romance>=60)return '🦋 Talking stage';if(n.met&&n.romance>=35)return '😏 Crush';return n.met?stName(n):'Stranger'}
const ROMW={flirt:'flirting with',date:'on a date with',kiss:'kissing',visit:'in your room with',text:'texting',hit:'flirting with'};
const placeName=()=>{if(IS)return IS.kind==='room'?'your room':(BID[IS.bid]&&BID[IS.bid].name)||'inside';const b=locOf(P().x,P().y);return b?b.name:'campus'};
/* run something once the current story card has been closed */
function afterStory(fn,tries=0){if(!S)return;if(!$('story').hidden&&tries<400){setTimeout(()=>afterStory(fn,tries+1),500);return}setTimeout(fn,700)}
/* does this lover see what you're doing right now? */
function sees(L){const p=P();if(!L||L.hidden&&!IS)return false;if(IS)return IS.people.some(q=>q.n===L&&q.mesh&&q.mesh.parent);return dist(L,p)<360}

/* ---- every romantic moment has a risk if you're with someone else ---- */
function cheatRisk(n,kind){const p=P();S.cheat=S.cheat||{n:0,sus:0};
  for(const L of lovers()){if(L===n)continue;if(sees(L)){afterStory(()=>caught(L,n,kind,'saw',placeName()));return}}
  if(!p.partner||p.partner===n)return;
  addBuff('guilty');S.cheat.sus=Math.min(100,S.cheat.sus+(kind==='date'?12:kind==='kiss'?10:5));
  const wit=IS?IS.people.filter(q=>q.n&&q.n!==n&&q.n.met).length:S.npcs.filter(x=>x!==n&&x!==p.partner&&!x.hidden&&x.met&&dist(x,p)<260).length;
  const ch=(kind==='date'?.22:kind==='kiss'?.2:.07)+wit*.06+(n.home===p.partner.home?.1:0);
  if(Math.random()<Math.min(.6,ch)){const L=p.partner,where=placeName(),tell=pick(S.npcs.filter(x=>x!==n&&x!==L&&x.met))||null;
    (S.pending=S.pending||[]).push({due:S.min+RI(60,540),fn:()=>{if(P().partner!==L)return;msg(L.name,pick([`Someone told me they saw you ${ROMW[kind]} ${n.name} at ${where}. Is it true? 😡`,`So you were ${ROMW[kind]} ${n.name} at ${where}? Call me NOW.`,`${tell?tell.name+' said':'People are saying'} you were ${ROMW[kind]} ${n.name}. Explain yourself 😤`]));afterStory(()=>caught(L,n,kind,'gossip',where,tell))}})}}

function caught(L,n,kind,how,where,tell){const p=P();if(!L||!n||$('game').hidden)return;S.cheat=S.cheat||{n:0,sus:0};const main=p.partner===L;
  if(L.romance<1&&!main&&!L.side)return;
  const scene={saw:`${esc(L.name)} was right there at ${esc(where)} and saw you ${ROMW[kind]} ${esc(n.name)} with ${hisHer(L)} own eyes.`,
    gossip:`${tell?esc(tell.name)+' told':'Somebody told'} ${esc(L.name)} everything. ${heShe(L)[0].toUpperCase()+heShe(L).slice(1)} is calling you nonstop.`,
    visit:`${esc(L.name)} came to your room without telling you, knocked once and opened the door. ${esc(n.name)} was sitting on your bed.`,
    phone:`You went to the washroom. When you came back, ${esc(L.name)} was holding your phone, reading your chat with ${esc(n.name)}.`,
    date:`Halfway through your date, you look up and ${esc(L.name)} is standing there with ${hisHer(L)} friends, staring at you and ${esc(n.name)}.`}[how]||'';
  S.cheat.n++;const lieOK=how==='gossip'||how==='phone';
  const forgive=()=>Math.random()<.2+L.romance/260-(S.cheat.n-1)*.15+(L.pers==='friendly'?.1:0);
  const sideAlso=()=>{if(n===p.partner||!(n.side||n.romance>=40))return;if(how==='saw'||how==='visit'||how==='date'){n.knowsTaken=true;if(Math.random()<.55){n.side=false;n.romance=clamp(10);n.friend=clamp(n.friend-15);setTimeout(()=>msg(n.name,pick([`So you have a ${gfbf(L)}?! Don't ever call me again 😤`,`You lied to me. Lose my number.`,`I can't believe I fell for you. Bye.`])),2600)}else setTimeout(()=>msg(n.name,pick([`That was so awkward 😬 Are you still with ${hisHer(L)==='her'?'her':'him'} or what?`,`Hmm. We need to talk o 🙄`])),2600)}};
  const gossipHit=()=>{S.npcs.filter(x=>x!==L&&x!==n&&x.met&&(x.home===L.home||x.friend>=50&&x.gender===L.gender)).slice(0,6).forEach(x=>x.friend=clamp(x.friend-3));p.needs.fun=clamp(p.needs.fun-25);p.needs.social=clamp(p.needs.social-10)};
  const ch=[['🙏 Beg for forgiveness','g',()=>{sideAlso();gossipHit();if(forgive()){L.romance=clamp(L.romance-30);S.cheat.sus=75;msg(L.name,pick(['I\'m forgiving you this ONE time. Don\'t try me again 😤','Fine. But I\'m checking your phone from now on 🙄','I still love you… but I\'m really hurt 💔']));toast(`${L.name} forgave you… barely 😬`)}else breakUp(L,true)}]];
  if(lieOK)ch.push(['🤥 "It\'s not what you think"','',()=>{if(Math.random()<(how==='gossip'?.5:.25)){S.cheat.sus=Math.min(100,S.cheat.sus+25);L.romance=clamp(L.romance-8);msg(L.name,'Hmm. Okay. I\'ll believe you… for now 🤨');toast('They believed you this time 😮‍💨')}else{gossipHit();toast(`${L.name} doesn't believe a word 😡`);breakUp(L,true)}}]);
  if(n.romance>=50&&n!==L)ch.push([`💔 End it and choose ${n.name}`,'',()=>{gossipHit();breakUp(L,false);if(!p.partner){p.partner=n;n.side=false;n.romance=clamp(Math.max(n.romance,80));msg(n.name,'So it\'s just us now? 🥺❤️')}}]);
  ch.push(['💔 "Then let\'s break up"','',()=>{sideAlso();gossipHit();breakUp(L,false)}]);
  if(!main)ch[0][2]=()=>{sideAlso();if(Math.random()<.35+L.romance/300){L.romance=clamp(L.romance-25);msg(L.name,pick(['So I\'m just your side chick? Hmm. Don\'t lie to me again 😒','I knew it… but I\'m still here. Don\'t take me for granted.']))}else breakUp(L,true)};
  story(`<div class="eyebrow">💔 Caught</div><h3>${esc(L.name)} caught you ${ROMW[kind]||'with'} ${esc(n.name)}</h3><p class="scene">${scene}</p><p class="scene">"${esc(pick(main?['Is this what you do behind my back?!','After everything? Wow. Just wow.','So all those "I love you"s were lies?']:['So I\'m not the only one?','You told me you were single!','Wow. So this is how it is?']))}"</p>`,ch)}

function breakUp(n,byThem){const p=P();if(p.partner===n)p.partner=null;n.side=false;n.ex=true;n.exDay=day();n.romance=clamp(Math.min(n.romance,15));n.friend=clamp(n.friend-25);n.with=0;
  if(S.guestId===n.id){S.guestId=null;S.guestHere=false}
  addBuff('heartbroken');p.needs.fun=clamp(p.needs.fun-30);p.needs.social=clamp(p.needs.social-10);
  setTimeout(()=>msg(n.name,byThem?pick(['We\'re done. Don\'t call me.','I deserve better. Goodbye 💔','Delete my number.']):pick(['Okay. If that\'s what you want 💔','Wow. Okay. Take care of yourself.','I hope it was worth it.'])),1500);
  toast(byThem?`💔 ${n.name} broke up with you`:`💔 You and ${n.name} broke up`);const s=sides();if(!p.partner&&s.length)setTimeout(()=>toast(`You're single now. ${s[0].name} might want to make it official 🤔`),3500);try{if(IS&&IS.mine)refreshRoom()}catch(e){}}

/* ---- talking face to face: asking someone out while taken, kissing, breaking up ---- */
{const _sa=socialAct;socialAct=function(n,a,shared,draw){const p=P(),say=t=>`<b>${esc(n.name)}:</b> ${t}`;
  if(a==='breakup'){closeSheet();story(`<div class="eyebrow">💔</div><h3>Break up with ${esc(n.name)}?</h3><p class="scene">${esc(n.name)} goes quiet. "${esc(pick(['Are you serious right now?','Is it because of somebody else?','Wow… okay. Say it.']))}"</p>`,[['💔 Yes, it\'s over','g',()=>breakUp(n,false)],['No, I didn\'t mean it','',()=>{n.romance=clamp(n.romance-6)}]]);return null}
  if(a==='kiss'){advance(5);const ok=p.partner===n||n.side||Math.random()<n.romance/110;
    if(!ok){n.romance=clamp(n.romance-10);n.friend=clamp(n.friend-5);setGest(talkBody(n),'cross',2.2);return say(pick(['Ehh! Slow down 😳','Not here, people are watching 😅','We\'re not there yet o.']))}
    n.romance=clamp(n.romance+6);addBuff('loved');hugPair(p,talkBody(n),2.6,'kiss');cheatRisk(n,'kiss');return say(pick(['😳❤️','Mmm… you\'re trouble 😏','Okay, that was nice 🙈']))}
  if(a==='ask'&&n.side&&!p.partner){p.partner=n;n.side=false;n.romance=100;addBuff('loved');msg(n.name,'Official official?! 🥺❤️ Finally.');return say('Finally! No more hiding 🥰')}
  if(a==='ask'&&p.partner&&p.partner!==n){advance(15);const knows=n.knowsTaken||(n.home===p.partner.home||n.prog===p.partner.prog)&&Math.random()<.5;
    if(knows){n.knowsTaken=true;n.romance=clamp(n.romance-15);return say(pick([`Don't you have a ${gfbf(p.partner)}? ${p.partner.name}, abi? Abeg 🙄`,`Ah! And ${p.partner.name}? You think I don't know? 😒`]))}
    if(Math.random()<.2+n.romance/170+n.dates*.06){n.side=true;n.romance=100;cheatRisk(n,'kiss');msg(n.name,'Our little secret then 🤫❤️');return say(pick(['Yes 🙈… but you\'re all mine, okay?','Hmm, okay. Don\'t make me regret it 😏']))+'<br><span class="tag y">🤫 Secret link · careful, people talk</span>'}
    n.romance=clamp(n.romance-20);return say(pick(LINES.ask.bad))}
  const r=_sa(n,a,shared,draw);
  if(a==='flirt')cheatRisk(n,'flirt');
  if(a==='flirt'&&n.romance>=35&&!isLove(n))addBuff('crushing');
  return r}}
const isLove=n=>P().partner===n||n.side;

/* ---- dates with someone who isn't your partner can go very wrong ---- */
{const _ds=dateGo;dateGo=function(n,k){const p=P(),L=p.partner,bid=k,where=BID[k]?BID[k].name:'the date';_ds(n,k);
  if(!L||L===n||!S.npcs.includes(n))return;S.cheat=S.cheat||{n:0,sus:0};S.cheat.sus=Math.min(100,S.cheat.sus+10);addBuff('guilty');
  if(Math.random()<.45)setTimeout(()=>msg(L.name,pick(['Babe where are you? I\'ve been calling you 🙄','You\'re not picking my calls. Everything okay?','Why is your phone off? 🤨'])),900);
  const ch=.1+(L.plan&&L.plan.b===bid?.45:0)+S.cheat.sus/400;if(Math.random()<ch)afterStory(()=>caught(L,n,'date','date',where));else cheatRisk(n,'date')}}

/* ---- someone walks up and shoots their shot ---- */
function hitOnYou(){const p=P();if(!S||IS||S.busy||!$('story').hidden||!$('sheet').hidden||$('game').hidden)return;
  const c=S.npcs.filter(n=>!n.hidden&&!n.mate&&n!==p.partner&&!n.side&&!n.ex&&!n.rejected&&n.gender!==p.look.gender&&n.chem>.45&&n.romance<35&&dist(n,p)<600&&!(n.with>S.min)).sort((a,b)=>b.chem-a.chem)[0];if(!c)return;
  S.hitDay=day();const where=placeName(),a=Math.atan2(c.x-p.x,c.y-p.y);c.x=p.x+Math.sin(a)*34;c.y=p.y+Math.cos(a)*34;c.path=null;c.needPath=false;c.face=Math.atan2(p.x-c.x,p.y-c.y);p.face=Math.atan2(c.x-p.x,c.y-p.y);setGest(c,'wave',1.6,'smile');
  const open=pick([`Hi… sorry to disturb you. I've been seeing you around ${where==='campus'?'campus':'the '+where} and I just had to say, you look really nice 😊`,`Excuse me, please. I don't usually do this, but you're too fine to just walk past 🙈`,`Hey! Are you always this good-looking or today is special? 😏`,`Sorry, can I get your name? I've been trying to find a way to talk to you for weeks 😅`]);
  const after=()=>{c.met=true;c.hitOn=day()};
  const ch=[['📱 Give them your number','g',()=>{after();c.contact=true;c.friend=clamp(c.friend+10);c.romance=clamp(c.romance+16);if(p.partner)cheatRisk(c,'hit');
      (S.pending=S.pending||[]).push({due:S.min+RI(40,200),fn:()=>{msg(c.name,pick([`Hey, it's ${c.name} from the ${where} 😊 Hope I'm not disturbing`,`Hi! ${c.name} here 🙈 Saved my number?`]));c.pend=null;
        (S.pending=S.pending||[]).push({due:S.min+RI(120,600),fn:()=>{if(c.side||P().partner===c)return;msg(c.name,pick(['Are you free this weekend? Let\'s go and eat kelewele at the Night Market 😏','Let me take you out sometime. Night Market, 7pm? 😊']));c.pend={kind:'date',ts:S.min}}})}});toast(`📱 You and ${c.name} swap numbers`)}],
    ['😏 Flirt back','',()=>{after();c.contact=true;c.friend=clamp(c.friend+8);c.romance=clamp(c.romance+24);addBuff('crushing');setGest(c,'laugh',2,'smile');toast(`${c.name}: "${pick(['Hmm, I like you already 😏','You\'re smooth o. Let\'s go out sometime 😊'])}"`);cheatRisk(c,'flirt')}]];
  if(p.partner)ch.push([`🙂 "Thanks, but I'm with someone"`,'',()=>{after();c.knowsTaken=true;c.friend=clamp(c.friend+3);p.partner.romance=clamp(p.partner.romance+2);toast(`${c.name}: "Ah, the lucky one 😅 Okay, no wahala."`)}]);
  ch.push(['🙂 "Thank you, but I\'m not interested"','',()=>{after();c.rejected=true;c.friend=clamp(c.friend+2);setGest(c,'shrug',1.6);toast(`${c.name}: "Okay, no wahala. Have a nice day 🙂"`)}]);
  story(`<div class="eyebrow">😳 Someone is shooting their shot</div><h3>${esc(c.name)} walks up to you</h3><p class="scene">${esc(c.prog)}, ${esc(BID[c.home].name)}.</p><p class="scene">"${esc(open)}"</p>`,ch)}

/* ---- your partner turns up at your room without warning ---- */
function partnerKnock(){const p=P(),L=p.partner;if(!L||!IS||IS.kind!=='room'||!IS.mine||S.busy||!$('story').hidden)return;
  const g=S.guestId!=null&&S.guestHere?npcById(S.guestId):null;
  if(g===L)return;
  if(g&&(g.side||g.romance>=40||S.sleepover&&S.sleepover.id===g.id)){caught(L,g,'visit','visit','your room');return}
  const food=pick(['a pack of waakye','two bowls of koko','kelewele and groundnuts','fried rice from the Night Market','a bottle of Malta and meat pies']);
  story(`<div class="eyebrow">🚪 Knock knock</div><h3>${esc(L.name)} came to surprise you</h3><p class="scene">"Surprise! 🥰 I was passing by your hostel so I brought you ${food}."${g?` ${esc(L.name)} looks at ${esc(g.name)}, then at you. "Oh… hi."`:''}</p>`,
    [['🥰 Let them in','g',()=>{L.romance=clamp(L.romance+6);addBuff('loved');p.needs.hunger=clamp(p.needs.hunger+30);if(!g){S.guestId=L.id;S.guestHere=true;S.guestUntil=S.min+150;L.with=S.guestUntil;refreshRoom()}else{L.romance=clamp(L.romance-2);toast(`${L.name} leaves the food and says ${heShe(L)}'ll come back later 😐`)}}],
     ['😅 "I\'m busy now, babe"','',()=>{L.romance=clamp(L.romance-5);S.cheat=S.cheat||{n:0,sus:0};S.cheat.sus=Math.min(100,S.cheat.sus+8);toast(`${L.name}: "Busy with what? Hmm 🤨"`)}]])}

/* ---- your partner goes through your phone ---- */
function phoneSnoop(){const p=P(),L=p.partner;if(!L||S.guestId!==L.id||!S.guestHere||!IS||!IS.mine)return;
  const other=sides()[0]||S.npcs.find(n=>n!==L&&n.romance>=45&&S.msgs.some(m=>m.chat===n.name&&m.at>S.min-2880));if(!other)return;
  if(Math.random()<.18+(S.cheat?S.cheat.sus:0)/300)caught(L,other,'text','phone','your room')}

/* ---- friends, crushes and partners text you first ---- */
function npcTextsYou(){const p=P(),h=hour();if(h<7||h>=23)return;const L=p.partner;
  if(L&&h>=7&&h<9&&S.gmDay!==day()&&Math.random()<.6){S.gmDay=day();msg(L.name,pick(['Good morning babe ❤️ Did you sleep well?','Morning sunshine ☀️ Don\'t forget to eat before lectures o','Gm ❤️ I dreamt about you 🙈']));return}
  if(L&&h>=21&&S.gnDay!==day()&&Math.random()<.5){S.gnDay=day();msg(L.name,pick(['Goodnight ❤️ Text me when you wake up','I\'m sleeping o. Love you 😘','Gn babe. Don\'t stay up too late 😴']));return}
  if(L&&S.cheat&&S.cheat.sus>55&&Math.random()<.12){msg(L.name,pick(['Who were you with today? 🤨','Why do you keep hiding your phone?','Be honest with me. Is there someone else?']));return}
  const s=sides()[0];if(s&&Math.random()<.08){msg(s.name,pick([`When are you going to leave ${L?L.name:'that person'}? 😒`,'I miss you 🤫 come and see me','Text me when you\'re free 🙈']));s.pend={kind:'see',ts:S.min};return}
  if(Math.random()>.22)return;
  const fr=S.npcs.filter(n=>n.contact&&n.met&&n.friend>=35&&n!==L&&!n.side&&!n.ex&&!(n.with>S.min)&&!(n.plan&&n.plan.sleep));const n=pick(fr);if(!n)return;
  const T=[];
  if(h>=6&&h<12)T.push(['Chale, I\'m going to buy waakye. You dey come? 🍛',{kind:'meet',b:'canteen',nm:'Bush Canteen',in:30}],['Koko and koose this morning? 🥣',{kind:'meet',b:'canteen',nm:'Bush Canteen',in:25}]);
  if(h>=11&&h<19)T.push(['Let\'s go and buy gob3 😋 I\'m hungry paa',{kind:'meet',b:'canteen',nm:'Bush Canteen',in:30}]);
  if(h>=15&&h<19)T.push(['We\'re playing ball at the field, you dey? ⚽',{kind:'meet',b:'field',nm:'Sports Field',in:40}]);
  if(h>=17&&h<23)T.push([npcConsole(n)?'FIFA in my room tonight? Come and lose 😂🎮':'Can I come to your room for FIFA? 🎮',npcConsole(n)?{kind:'visit'}:{kind:'come'}],['Night Market later? Kelewele on me 🔥',{kind:'meet',b:'night',nm:'Night Market',in:60}]);
  if(h>=8&&h<20)T.push(['Library later? This assignment is killing me 📚',{kind:'meet',b:'lib',nm:'University Library',in:60}]);
  if(n.romance>=35)T.push(['Hey you 😊 what are you doing?',null],['I was just thinking about you 🙈',null]);
  T.push(['How far? You\'ve gone quiet o 😂',null]);
  const [t,pd]=pick(T);if(pd&&pd.kind==='come'&&!p.items.includes('console'))return;msg(n.name,t);n.pend=pd?Object.assign({ts:S.min},pd):null}
function npcConsole(n){let h=0;String(n.id).split('').forEach(c=>h=(h*31+c.charCodeAt(0))%997);return h%100<45}

/* ---- replies that actually answer what you said ---- */
INTENTS.unshift(['who',/who (is|are) (this|you)/i],['loveyou',/\bi love (you|u)\b|love you/i],['where',/where (are|r) (you|u)|where you dey|\bwya\b|where are u/i],['wyd',/what are you doing|\bwyd\b|wetin you dey do|what you dey do/i],
  ['free',/are (you|u) free|you free|are you busy|you busy/i],['fifa',/fifa|ps5|ps4|playstation|game night|\bpes\b/i],['ball',/football|play ball|basketball|volleyball|\bball\b/i],['gn',/good ?night|\bgn\b|sleep well/i],['gm',/good ?morning|\bgm\b/i],
  ['yes',/^\s*(yes+|yeah|yh|yep|sure|ok(ay)?|i'?m in|let'?s go|deal|i dey come|coming|why not|👍)[\s!.,👍😄😂🙌o]*$/i],['no',/^\s*(no+|nope|not today|i can'?t|maybe later|nah|sorry,? i can'?t|no o)[\s!.,😅😩o]*$/i],['grub',/waakye|gob3|gobe|koko|kelewele|jollof|let'?s (go )?(eat|chop|buy food)/i]);
function npcDoing(n){const p=P(),pl=n.plan||{},b=BID[pl.b];if(n.with>S.min)return['with you','chilling with you 😂'];if(pl.sleep)return['in my room','sleeping 😴'];
  if(COLLEGES[pl.b]&&lectureNow())return[`at ${b.name}`,'in lecture, the lecturer is looking at me 😩'];
  const D={bank:'at the bank sorting out my account 🏦',unity:'at the bank sorting out my account 🏦',clinic:'at the clinic, not feeling too well 🤒',print:'printing my assignment 🖨️',senate:'at Administration chasing my documents 😩',lib:'studying at the library 📚',canteen:'eating at Bush Canteen 🍛',gym:'working out at the gym 💪',field:'playing ball at the field ⚽',court:'shooting hoops at the court 🏀',volley:'playing volleyball 🏐',pool:'swimming 🏊',night:'buying kelewele at the Night Market 🔥',club:'at Club Vibes 🪩',mall:'at the mall, window shopping 😂',market:'at the market buying foodstuff',lake:'chilling by the lake 🦆',chapel:'at church 🙏',mosque:'at the mosque 🙏',salon:'at the salon fixing my hair 💇🏾',square:'at Akwaaba Square with friends',parade:'at the parade grounds'};
  if(pl.b===n.home)return['in my room','in my room chilling, watching movies 🎬'];return[b?`at the ${b.name}`:'around campus',D[pl.b]||(b?`at the ${b.name}`:'just walking around campus')]}
function fifaComing(n){const p=P();if(S.guestId!=null&&S.guestUntil>S.min)return{text:`You already have someone in your room 😂 Another time!`,gain:1};
  const eta=RI(15,35);S.guestId=n.id;S.guestHere=false;S.guestUntil=S.min+eta+180;S.fifaGuest=n.id;(S.pending=S.pending||[]).push({due:S.min+eta,fn:()=>{guestArrive(n);if(S.guestId===n.id)setTimeout(()=>toast(`${n.name}: "Where's the pad? Let me show you how it's done 😂🎮"`),1500)}});
  return{text:pick([`Say less! Coming in ${eta} mins. Prepare to lose 😂🎮`,`On my way! ${eta} mins. I'm picking Madrid o`,`Coming! Charge the pads 🎮`]),gain:3}}
function meetFromPend(n,pd){const at=Math.ceil((S.min+(pd.in||45))/10)*10;if(!BID[pd.b]||(typeof meetOk==='function'&&!meetOk(pd.b,at)))return{text:`Ei, it's closed now 😩 Another time`,gain:1};
  (S.meets=S.meets||[]).push({n,b:pd.b,at,nm:pd.nm});S.msgs.unshift({from:n.name,chat:n.name,text:`📍 Meetup: ${pd.nm} · ${hm(at)}`,at:S.min,sys:true,read:true});return{text:pick([`Okay! ${pd.nm} at ${hm(at)}. Don't be late o 😂`,`Deal 👍 See you at the ${pd.nm} at ${hm(at)}`]),gain:3}}
{const _nr=npcReply;npcReply=function(n,intent,vn){const p=P(),h=hour(),pd=n.pend,L=p.partner;
  if(n.ex&&Math.random()<.7)return{text:pick(['Hmm.','What do you want?','👀','I\'m busy.']),gain:0};
  if(n.friend<15&&!n.mate&&!n.hitOn&&!isLove(n))return _nr(n,intent,vn);
  if(L===n&&S.cheat&&S.cheat.sus>=55&&Math.random()<.45)return{text:pick(['Hmm. Go and text your other person 🙄','K.','I\'m busy.','Now you remember me? 😒']),gain:0};
  if(intent==='yes'&&pd){n.pend=null;if(pd.kind==='meet')return meetFromPend(n,pd);if(pd.kind==='come')return fifaComing(n);
    if(pd.kind==='visit'){n.visitOK=day();return{text:pick([`Come! ${BID[n.home].name}. Door is open 🚪`,'Come through, I\'ve set the game already 🎮']),gain:3}}
    if(pd.kind==='date'){n.romance=clamp(n.romance+8);return meetFromPend(n,{b:'night',nm:'Night Market',in:Math.max(30,(19-h)*60)})}
    if(pd.kind==='see')return meetFromPend(n,{b:'lake',nm:'Campus Lake',in:45})}
  if(intent==='no'&&pd){n.pend=null;if(pd.kind==='date'){n.romance=clamp(n.romance-6);return{text:pick(['Oh… okay 😕','Ah, okay. Another time then 🙂']),gain:0}}return{text:pick(['Ah okay, next time then 😩','No wahala 👍','Hmm, you\'re always busy o 😒']),gain:0}}
  if(intent==='who')return{text:`It's me, ${n.name}! 😒 You didn't save my number?`,gain:0};
  if(intent==='where'){const [w,d]=npcDoing(n);return{text:w==='with you'?'I\'m right here with you 😂':pick([`I'm ${w}. ${d[0].toUpperCase()+d.slice(1)}`,`${w[0].toUpperCase()+w.slice(1)}. Why? 👀`]),gain:2}}
  if(intent==='wyd'){const [,d]=npcDoing(n);return{text:pick([`Nothing much, ${d}`,`I'm ${d}. You?`]),gain:2}}
  if(intent==='free'){const [,d]=npcDoing(n);const busy=/lecture|sleep|studying|church|mosque/.test(d);if(!busy)n.pend={kind:'meet',b:'square',nm:'Akwaaba Square',in:30,ts:S.min};return{text:busy?`Not really, I'm ${d}`:pick(['Yes o, I\'m free. Let\'s link? 😄','Free like air 😂 What\'s up?']),gain:2}}
  if(intent==='fifa'){if(p.items.includes('console')&&(n.friend>=25||isLove(n))&&h>=8&&h<23&&Math.random()<(p.items.includes('ps5')?.97:.85))return fifaComing(n);
    if(npcConsole(n)){n.visitOK=day();return{text:`Come to my room then! ${BID[n.home].name}. I'll beat you 😂🎮`,gain:3}}
    return{text:pick(['Who even has a console? 😂 Buy one and invite me','I don\'t have FIFA o. You buy the PS, I\'ll bring the drinks 😂']),gain:2}}
  if(intent==='ball'){if(h>=6&&h<18&&n.friend>=25)return meetFromPend(n,{b:'field',nm:'Sports Field',in:40});return{text:'It\'s too late for ball now 😂 Tomorrow evening?',gain:1}}
  if(intent==='grub'){if(h>=6&&h<21&&n.friend>=20&&Math.random()<.8){n.pend={kind:'meet',b:h<17?'canteen':'night',nm:h<17?'Bush Canteen':'Night Market',in:30,ts:S.min};return{text:h<11?'Waakye now? 🤤 Let\'s go to the joint, you dey come?':h<17?'Gob3 with plantain 🤤 I\'m in. Shall we go now?':'Kelewele at the Night Market? 🔥 Let\'s go?',gain:2}}return{text:'I\'ve already eaten o 😅',gain:1}}
  if(intent==='gn')return{text:L===n?pick(['Goodnight babe ❤️ dream of me','Night night 😘 Text me when you wake up']):pick(['Goodnight 😴','Sleep well o 🌙','Gn! Don\'t oversleep for lectures 😂']),gain:2};
  if(intent==='gm')return{text:L===n?pick(['Good morning my love ☀️❤️','Gm babe 🥺 did you eat?']):pick(['Morning! 🌞','Gm o. Lectures today? 😩']),gain:2};
  if(intent==='loveyou'){if(L===n)return{text:pick(['I love you more ❤️🥺','Love you too babe 😘','Aww, I love you ❤️']),gain:3};if(n.side)return{text:'Love you too 🤫❤️ but delete these messages o',gain:3};
    if(n.romance>=60){n.romance=clamp(n.romance+6);return{text:pick(['🥺 Are you serious? …I like you too','Stop it 🙈 …me too'])}}
    n.romance=clamp(n.romance-4);return{text:pick(['Ei 😳 love?? We just met o','Hmm 😂 slow down','Haha, you\'re funny 😅']),gain:0}}
  if(intent==='love'&&L===n)return{text:pick(['Aww 🥺 I miss you more','Come and see me then 😘','You\'re so sweet ❤️']),gain:3};
  if(intent==='how'&&h<6)return{text:'Why are you awake? 😂 Go and sleep',gain:1};
  return _nr(n,intent,vn)}}

/* ---- FIFA in a friend's room when they have a console ---- */
{const _ra=roomActions;roomActions=function(){const a=_ra.apply(this,arguments);try{if(IS&&IS.kind==='room'&&!IS.mine&&IS.owner&&IS.owner!=='me'&&!IS.owner.real&&npcConsole(IS.owner))a.unshift([`🎮 Play FIFA with ${IS.owner.name} (1h)`,()=>playFifa(),null,'b'])}catch(e){}return a}}

/* ---- hourly: someone may hit on you, your partner may show up, friends text you ---- */
{const _h=hourly;hourly=function(){const r=_h.apply(this,arguments);try{if(S&&S.p&&!NOBOTS){const h=hour();
  if(!IS&&h>=8&&h<21&&S.hitDay!==day()&&Math.random()<.09)setTimeout(hitOnYou,1200);
  if(P().partner&&IS&&IS.kind==='room'&&IS.mine&&h>=10&&h<22&&Math.random()<.05+(S.cheat?S.cheat.sus:0)/500)setTimeout(partnerKnock,900);
  phoneSnoop();npcTextsYou();
  if(S.cheat&&S.cheat.sus>0)S.cheat.sus=Math.max(0,S.cheat.sus-1)}}catch(e){console.error(e)}return r}}
