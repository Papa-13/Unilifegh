/* ================= life happens: random campus events with choices =================
   About once every few in-game hours, if you're free, something happens to you: good luck, bad luck,
   drama, opportunities. Each has real choices with consequences (money, grades, friends, mood).
   Every event has its own cool-down so you don't see the same thing twice in a row. */
const LE_FX=(fx)=>{const p=P();for(const k in fx){const v=fx[k];if(k==='money')p.money=Math.max(0,p.money+v);else if(k==='study')p.study=Math.max(0,p.study+v);else if(p.needs[k]!=null)p.needs[k]=clamp(p.needs[k]+v)}hud()};
const leFriend=(f=20)=>pick(S.npcs.filter(n=>n.met&&!n.ex&&n.friend>=f&&!n.hidden&&n!==P().partner))||null;
const leAny=()=>pick(S.npcs.filter(n=>!n.mate))||S.npcs[0];
const leMate=()=>S.mates&&S.mates[0];
const leOut=()=>!IS&&!P().inCar&&!P().onBus,leRoom=()=>IS&&IS.kind==='room'&&IS.mine,leH=()=>hour();

function leStory(ic,title,scene,choices){story(`<div class="eyebrow">${ic} Life happens</div><h3>${title}</h3><p class="scene">${scene}</p>`,choices)}
function leDone(txt){setTimeout(()=>toast(txt),400)}
const LIFE_EVENTS=[
 {id:'snatch',gap:6,when:()=>leOut()&&leH()>=19&&leH()<23,run:()=>leStory('📱','"Ei! My phone!"','You\'re texting while you walk past the Night Market. An okada slows down beside you and a hand grabs for your phone.',[
   ['💪 Hold on tight','g',()=>{if(Math.random()<.6){LE_FX({fun:-6});leDone('You held on! The okada speeds off empty-handed. Your heart is racing 😮‍💨')}else{LE_FX({money:-250,fun:-15});addBuff('shaken');leDone('You held on but it fell. Cracked screen: GH₵250 to fix at the Phone Hub 😩')}}],
   ['😨 Let go','',()=>{LE_FX({money:-120,fun:-12});addBuff('shaken');leDone('They got away with it. A cheap replacement phone cost you GH₵120. Walk with your phone in your pocket at night.')}]])},
 {id:'strike',gap:60,when:()=>!S['lestrike'+S.sem]&&day()-S.semStart>=2&&day()-S.semStart<=7,run:()=>{S['lestrike'+S.sem]=1;const r=S.rl||(S.rl={});r.cancel=r.cancel||{};for(let d=day()+1;d<=day()+3;d++)[0,1,2].forEach(c=>r.cancel[d+'|'+c]=1);
   msg('Class rep','📢 UTAG has declared a strike! No lectures for the next 3 days. Don\'t celebrate too much o 😅');
   leStory('✊','Lecturers are on strike!','UTAG has called a strike over unpaid allowances. No lectures for three days. The whole hostel is cheering.',[
    ['📚 Use the time to study','g',()=>{LE_FX({study:10,fun:-5});leDone('While everyone partied, you covered two weeks of notes. Your grades will thank you 📚')}],
    ['🎉 Strike holiday!','',()=>{LE_FX({fun:25,social:15,study:-4});leDone('Movies, FIFA and Night Market every night. Back to reality soon 😂')}]])}},
 {id:'roommate2am',gap:7,when:()=>leRoom()&&(leH()>=23||leH()<3)&&!!leMate(),run:()=>{const m=leMate();leStory('🌙',`${esc(m.name)} came in with friends at 2am`,`They're laughing loudly and playing music while you're trying to sleep.`,[
   ['😤 "Please, some of us have lectures!"','',()=>{m.friend=clamp(m.friend-5);LE_FX({energy:5});leDone(`${m.name}: "Ah, sorry o 😬" The room goes quiet.`)}],
   ['🎧 Earphones and sleep','g',()=>{LE_FX({energy:-8});leDone('You slept badly, but there\'s no beef in the room.')}],
   ['😂 Join them','',()=>{m.friend=clamp(m.friend+6);LE_FX({fun:15,social:12,energy:-15});leDone(`Best night of the semester with ${m.name} and the guys. Tomorrow will be rough 🥱`)}]])}},
 {id:'lostid',gap:20,when:()=>leOut()&&leH()>=8&&leH()<17,run:()=>leStory('🪪','Where is your student ID?','You reach into your bag at the library entrance and your student ID is gone.',[
   ['🏛️ Replace it at Administration · GH₵50','g',()=>{LE_FX({money:-50});advance(30);leDone('New ID printed. GH₵50 and 30 minutes of queueing 😮‍💨')}],
   ['🔎 Retrace your steps','',()=>{advance(45);if(Math.random()<.55)leDone('Found it on the bench outside the canteen! 🙌');else{LE_FX({money:-50,fun:-5});leDone('No luck. You had to replace it anyway (GH₵50).')}}]])},
 {id:'blackstars',gap:10,when:()=>leH()>=16&&leH()<19,run:()=>leStory('⚽','Black Stars play tonight!','Ghana vs Nigeria at 7pm. The whole hall is gathering at the common room TV.',[
   ['🇬🇭 Watch with everyone','g',()=>{const w=Math.random();LE_FX({fun:w<.5?30:8,social:20});S.npcs.filter(n=>n.home===P().home).forEach(n=>n.friend=clamp(n.friend+3));advance(120);leDone(w<.5?'Ghana wins 2–1!! The whole hostel is jumping 🎉🇬🇭':'1–1 draw. Everybody blames the referee 😂')}],
   ['📚 Study instead','',()=>{LE_FX({study:6,fun:-6});leDone('You hear screaming from downstairs every few minutes 😅')}]])},
 {id:'foodpoison',gap:12,when:()=>S._ateStreet&&S.min-S._ateStreet<180,run:()=>{S._ateStreet=0;leStory('🤢','Your stomach is not happy…','That roadside food is fighting back. You\'re running to the washroom every 20 minutes.',[
   ['💊 Buy medicine at the pharmacy · GH₵30','g',()=>{LE_FX({money:-30,energy:-10});leDone('The pharmacist gave you ORS and tablets. You feel human again in a few hours.')}],
   ['😴 Sleep it off','',()=>{LE_FX({energy:-25,hunger:-20,fun:-10});addBuff('cold');leDone('Rough night. Maybe stick to Auntie Muni\'s waakye 😅')}]])}},
 {id:'surprisequiz',gap:6,when:()=>leH()>=17&&leH()<22&&!P().grad,run:()=>leStory('📝','"Quiz tomorrow. It counts."','Your course rep just posted on the class page: surprise quiz tomorrow morning, 10% of your grade.',[
   ['📚 Study tonight','g',()=>{LE_FX({study:8,fun:-8,energy:-8});advance(120);leDone('You know this topic now. Bring it on 💪')}],
   ['🎲 Risk it','',()=>{if(Math.random()<.5){LE_FX({fun:6});leDone('The quiz was easy. Lucky you 😏')}else{LE_FX({study:-6,fun:-10});leDone('The quiz destroyed you 😭 Lesson learnt.')}}]])},
 {id:'wallet',gap:15,when:()=>leOut()&&leH()>=8&&leH()<20,run:()=>{const n=leAny();leStory('👛','You find a wallet on the ground',`GH₵200 inside and a student ID: ${esc(n.name)}, ${esc(n.prog)}.`,[
   ['🤝 Return it','g',()=>{n.met=true;n.friend=clamp(n.friend+20);n.contact=true;LE_FX({fun:8});msg(n.name,'You found my wallet?! God bless you 🙏🙏 Let me buy you food some time');leDone(`${n.name} is so grateful. New friend unlocked 🤝`)}],
   ['💰 Keep the money','',()=>{LE_FX({money:200});addBuff('guilty');leDone('GH₵200 richer… but you can\'t stop thinking about it 😬')}]])}},
 {id:'groupwork',gap:10,when:()=>leH()>=9&&leH()<20&&!P().grad,run:()=>{const n=leAny();leStory('👥','Your group member isn\'t doing anything',`The group assignment is due Friday. ${esc(n.name)} hasn't replied in the group chat for four days.`,[
   ['😮‍💨 Do their part yourself','',()=>{LE_FX({study:6,energy:-15,fun:-8});leDone('Done. You did the work of two people. Again.')}],
   ['📲 Call them out in the group chat','g',()=>{n.friend=clamp(n.friend-6);LE_FX({fun:4});msg(n.name,'Ah sorry sorry, I\'ve been sick 😩 I\'ll do my part tonight');leDone('They finally replied. Work is moving.')}],
   ['📧 Tell the lecturer','',()=>{n.friend=clamp(n.friend-15);LE_FX({study:3});leDone('The lecturer split the marks fairly. The group chat is very quiet now 😶')}]])}},
 {id:'deptparty',gap:14,when:()=>leH()>=12&&leH()<18&&[3,4].includes(wd()),run:()=>leStory('🎉','Departmental party this Friday!','Your department is throwing a party at the Great Hall forecourt. Tickets are GH₵40, food and DJ included.',[
   ['🎟️ Buy a ticket · GH₵40','g',()=>{if(P().money<40)return leDone('Not enough money 😩');LE_FX({money:-40,fun:28,social:25,energy:-10});S.npcs.filter(n=>n.prog===P().prog).forEach(n=>{n.met=true;n.friend=clamp(n.friend+6)});leDone('What a night! You danced with half your class 💃🏾')}],
   ['🏠 Save the money','',()=>{LE_FX({fun:-4});leDone('Everyone\'s posting party pictures 😩')}]])},
 {id:'bday',gap:8,when:()=>!!leFriend(35),run:()=>{const n=leFriend(35);if(!n)return;leStory('🎂',`It's ${esc(n.name)}'s birthday!`,'The group chat is planning a surprise. Everyone is contributing for cake and drinks.',[
   ['💸 Contribute GH₵50','g',()=>{if(P().money<50)return leDone('You can\'t afford it right now 😩');LE_FX({money:-50,fun:15,social:15});n.friend=clamp(n.friend+12);msg(n.name,'You people surprised me paa 😭❤️ Thank you!');leDone(`${n.name} cried happy tears 🎂`)}],
   ['📲 Just send a birthday text','',()=>{n.friend=clamp(n.friend+2);msg(n.name,'Thank you 😊');leDone('A simple "HBD 🎉" it is.')}]])}},
 {id:'funeral',gap:40,when:()=>leH()>=9&&leH()<20,run:()=>{const fam=P().bg==='rich'?'Dad':'Mum';leStory('🖤','A call from home','Your grand-aunt passed away. The family is contributing towards the funeral this weekend.',[
   ['🙏 Send GH₵200','g',()=>{if(P().money<200)return leDone('You don\'t have it. Your family understands.');LE_FX({money:-200,fun:-6});msg(fam,'Thank you, my child. God bless you 🙏');leDone('Your family appreciates it.')}],
   ['📞 Call and send condolences','',()=>{LE_FX({fun:-8});msg(fam,'Thank you for calling. Focus on your books 🙏');leDone('You called home. It\'s good to hear their voices.')}]])}},
 {id:'scholar',gap:45,when:()=>P().study>=40&&!S.scholar,run:()=>leStory('📧','Scholarship opportunity','An email from the Students\' Financial Aid Office: applications are open for a GH₵1,500 merit scholarship.',[
   ['✍️ Apply (2h)','g',()=>{advance(120);S.scholar=1;const ok=P().study>=70||Math.random()<.4;if(ok){(S.pending=S.pending||[]).push({due:S.min+1440*2,fn:()=>{P().money+=1500;msg('Financial Aid Office','🎉 Congratulations! You have been awarded the GH₵1,500 merit scholarship.');hud()}});leDone('Application submitted. Fingers crossed 🤞')}else{(S.pending=S.pending||[]).push({due:S.min+1440*2,fn:()=>msg('Financial Aid Office','Thank you for applying. Unfortunately you were not selected this time.')});leDone('Application submitted 🤞')}}],
   ['Not now','',()=>{}]])},
 {id:'viral',gap:30,when:()=>Math.random()<.5,run:()=>{const p=P();p.tt=(p.tt||0)+RI(800,3000);leStory('📈','You went viral!',`A video of you dancing at the parade grounds is everywhere. ${p.tt.toLocaleString()} followers and counting.`,[
   ['😎 Enjoy the fame','g',()=>{LE_FX({fun:25,social:20});S.npcs.forEach(n=>{if(Math.random()<.3)n.friend=clamp(n.friend+3)});leDone('People are stopping you on campus for pictures 📸')}],
   ['🙈 Ask them to take it down','',()=>{LE_FX({fun:-4});leDone('Too late. It\'s on every status already 😂')}]])}},
 {id:'flood',gap:20,when:()=>WX.ri>.4,run:()=>{const m=leMate();leStory('🌊','The hostel is flooding!','The heavy rain has flooded the ground floor. Water is coming under the door and everyone is moving things off the floor.',[
   ['🪣 Help everyone bail water','g',()=>{LE_FX({energy:-15,hygiene:-20,social:15});S.npcs.filter(n=>n.home===P().home).forEach(n=>n.friend=clamp(n.friend+5));leDone('Your hostel mates won\'t forget you helped 💪')}],
   ['📦 Just save your own things','',()=>{LE_FX({energy:-5});if(m)m.friend=clamp(m.friend-3);leDone('Your stuff is safe. Some people noticed you didn\'t help…')}]])}},
 {id:'leak',gap:30,when:()=>{const sd=day()-S.semStart;return sd>=7&&sd<10},run:()=>leStory('🤫','"Leaked questions. GH₵100."','A guy in your hostel says he has the leaked exam questions for next week.',[
   ['💸 Buy them','',()=>{LE_FX({money:-100});if(Math.random()<.65){addBuff('embarrassed');leDone('They were fake 🤦🏾 GH₵100 gone and you wasted a night memorising nonsense.')}else{addBuff('guilty');S['leak'+S.sem]=1;leDone('They look real… but if anyone finds out, you\'re in serious trouble 😬')}}],
   ['🚫 Report him','',()=>{LE_FX({fun:-3});leDone('Student Affairs thanked you. Your hostel mates are side-eyeing you 👀')}],
   ['📚 Ignore it and study','g',()=>{LE_FX({study:4});leDone('Good choice. The "leak" turned out to be fake anyway 😂')}]])},
 {id:'secretadmirer',gap:20,when:()=>!P().partner,run:()=>{const g=P().look.gender==='f'?'m':'f',n=pick(S.npcs.filter(x=>x.gender===g&&!x.mate&&!x.side&&!x.ex&&x.romance<40))||null;if(!n)return;
   leStory('💌','"I see you every day 👀"','An unknown number texts you: "I see you at the library every day and I\'ve been too shy to say hi 🙈"',[
    ['😏 "Who is this?"','g',()=>{n.contact=true;n.met=true;n.romance=clamp(n.romance+25);n.friend=clamp(n.friend+10);n.know=n.know||{};n.know.name=1;msg(n.name,`It's ${n.name} 🙈 ${n.prog}. Can we talk some time?`);addBuff('crushing');leDone(`It's ${n.name}! 🦋`)}],
    ['🚫 Block the number','',()=>{leDone('Blocked. You\'ll never know 🤷🏾')}]])}},
 {id:'lecturerhelp',gap:15,when:()=>leH()>=8&&leH()<16&&!P().grad,run:()=>leStory('📚','A lecturer needs a hand','Your lecturer is struggling to carry a box of scripts to their office.',[
   ['🙋 "Let me help you, sir/madam"','g',()=>{LE_FX({energy:-4,study:3});advance(15);leDone('"Thank you, my dear. What is your name again?" They\'ll remember you 😉')}],
   ['🚶 Keep walking','',()=>{}]])},
 {id:'preacher',gap:12,when:()=>leOut()&&leH()>=7&&leH()<18,run:()=>leStory('📢','A preacher at Akwaaba Square','A campus preacher with a speaker is preaching loudly about exams and repentance. A small crowd has gathered.',[
   ['🙏 Listen for a while','',()=>{LE_FX({fun:4});addBuff('reflective');advance(20);leDone('"Your exams shall be easy, in Jesus\' name!" "Amen!" 😂🙏')}],
   ['🎧 Earphones in, keep walking','g',()=>{}]])},
 {id:'crash',gap:20,when:()=>leH()>=10&&leH()<23&&!P().grad,run:()=>leStory('💻','Your phone died before the deadline','Your phone suddenly won\'t switch on, and your assignment is due at midnight.',[
   ['🔧 Phone Hub repair · GH₵150','g',()=>{LE_FX({money:-150});advance(60);leDone('Fixed! You submitted with 20 minutes to spare 😮‍💨')}],
   ['🤝 Borrow a friend\'s phone','',()=>{const n=leFriend(30);if(n){n.friend=clamp(n.friend+3);LE_FX({study:2});leDone(`${n.name} saved you 🙏 Submitted on time.`)}else{LE_FX({study:-5,fun:-10});leDone('Nobody could help. Late submission, marks deducted 😭')}}]])},
 {id:'talent',gap:25,when:()=>leH()>=14&&leH()<20,run:()=>leStory('🎤','SRC talent show auditions','The SRC is auditioning for the talent show at the Great Hall. First prize: GH₵500.',[
   ['🎶 Audition','g',()=>{advance(60);const w=Math.random()<.35+P().needs.fun/300;if(w){LE_FX({money:500,fun:30,social:25});S.npcs.forEach(n=>{if(Math.random()<.4){n.friend=clamp(n.friend+4)}});leDone('You WON! GH₵500 and the whole campus is talking about you 🏆')}else{LE_FX({fun:-6,social:8});leDone('You didn\'t make it, but people loved the energy 👏')}}],
   ['👀 Just watch','',()=>{LE_FX({fun:10});advance(60);leDone('Some people are really talented. Some… are brave 😂')}]])},
 {id:'deanslist',gap:60,when:()=>P().study>=90&&!S['dean'+S.sem],run:()=>{S['dean'+S.sem]=1;P().money+=300;leStory('🏅','Dean\'s List!','Your name is on the Dean\'s List notice board. Your parents are calling everyone they know.',[['😁 Proud moment','g',()=>{LE_FX({fun:25});msg(P().bg==='rich'?'Dad':'Mum','We saw it! We are so proud of you 🎉🙏 Here is GH₵300 for you');leDone('+GH₵300 from home 🎉')}]])}},
 {id:'jollof',gap:6,when:()=>leRoom()&&!!leMate()&&leH()>=17&&leH()<22,run:()=>{const m=leMate();leStory('🍛',`${esc(m.name)} cooked jollof`,`The whole room smells amazing. ${esc(m.name)} offers you a plate.`,[
   ['😋 "Thank you!"','g',()=>{LE_FX({hunger:45,fun:10});m.friend=clamp(m.friend+5);leDone('Best jollof on campus. Don\'t argue 🍛🔥')}],
   ['🙅🏾 "I\'m okay, thanks"','',()=>{m.friend=clamp(m.friend-1)}]])}},
 {id:'bedbugs',gap:25,when:()=>leRoom()&&(leH()>=21||leH()<6),run:()=>leStory('🪲','Bedbugs!','Something has been biting you all night. You lift your mattress… bedbugs.',[
   ['🧴 Buy spray and fumigate · GH₵40','g',()=>{LE_FX({money:-40,energy:-5});leDone('Sprayed and sunned the mattress. Peace at last 😮‍💨')}],
   ['🤷🏾 Ignore it','',()=>{LE_FX({energy:-20,fun:-10});addBuff('groggy');leDone('Another itchy, sleepless night 😩')}]])},
 {id:'nearmiss',gap:15,when:()=>leOut()&&leH()>=7&&leH()<21,run:()=>leStory('🏍️','That okada almost hit you!','An okada zooms past inches from you as you cross the road. The rider doesn\'t even look back.',[
   ['😤 Shout after him','',()=>{LE_FX({fun:-4});addBuff('raged');leDone('"Ei! Are you mad?!" He\'s long gone 😤')}],
   ['😮‍💨 Breathe and look both ways next time','g',()=>{addBuff('shaken')}]])},
 {id:'matric',gap:400,when:()=>!S.matric&&day()-S.semStart>=1&&day()-S.semStart<=4&&(P().yr||1)===1,run:()=>{S.matric=1;leStory('🎓','Matriculation day!','Today you officially become a student. Gowns, family pictures and speeches at the Great Hall.',[
   ['📸 Attend in your gown','g',()=>{LE_FX({fun:25,social:20});advance(180);S.npcs.filter(n=>(n.yr||1)===1||Math.random()<.3).forEach(n=>{n.met=n.met||Math.random()<.3});leDone('Pictures with your coursemates. Your mum has already posted them everywhere 🎓📸')}],
   ['😴 Skip it','',()=>{LE_FX({fun:-6})}]])}}];

function lifeTick(){if(!S||!S.p||NOBOTS)return;const h=hour();if(h<7||h>=24)return;if(S.busy||!$('story').hidden||!$('sheet').hidden||$('game').hidden)return;
  const L=S.le||(S.le={last:0,seen:{}});if(S.min-L.last<180)return;if(Math.random()>.32)return;
  const ok=LIFE_EVENTS.filter(e=>{const s=L.seen[e.id];if(s!=null&&day()-s<e.gap)return false;try{return e.when()}catch(x){return false}});if(!ok.length)return;
  const e=pick(ok);L.last=S.min;L.seen[e.id]=day();try{e.run();window.track&&window.track('life_event',{id:e.id})}catch(x){console.error(x)}}
{const _h=hourly;hourly=function(){const r=_h.apply(this,arguments);try{const hk=day()*24+Math.floor(hour());if(S&&S._leh!==hk){S._leh=hk;setTimeout(lifeTick,800)}}catch(e){}return r}}
/* street food can upset your stomach */
{const _ev=ev;ev=function(type,d){try{if(type==='eat'&&typeof d==='string'&&['waakye','kelewele','indomie','gob3','kenkey','koko','wjoint'].includes(d)&&Math.random()<.08)S._ateStreet=S.min}catch(e){}return _ev.apply(this,arguments)}}
