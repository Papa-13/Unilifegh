/* ================= side hustles (Phone → Apps → 💼 Hustles) =================
   Ways to make money besides a job or a business. Each hustle has a level that grows as you do it,
   so you earn more over time:
   🎬 TikTok skits: grow followers. Brand deals at 1k / 5k / 20k / 100k, and creator pay every Monday.
   🎨 Design gigs: needs a laptop (HomeMart) or the library computers.
   🧺 Laundry for hostel mates: in your hostel.
   📚 Pasco (past questions): sell them at the library or Print & Type in the 4 days before exams.
   🎤 MC at campus events: when an event is on at the Parade Grounds. */
const HU_MILES=[[1000,150,'A phone accessories shop'],[5000,500,'A campus food delivery app'],[20000,1500,'A telecom brand'],[100000,5000,'A big drinks brand']];
function hu(){const p=P();p.hustle=p.hustle||{content:{xp:0,f:0,miles:0},design:{xp:0},laundry:{xp:0},pasco:{xp:0},mc:{xp:0}};return p.hustle}
const huLv=h=>Math.min(6,1+Math.floor((h.xp||0)/4));
function huWhere(){const p=P();if(IS)return IS.kind==='bld'?IS.bid:IS.mine?'myroom':'room';const b=locOf(p.x,p.y);return b?b.id:'out'}
function huExamSoon(){if(!S)return false;const sd=day()-S.semStart,first=EXAMS[0][0];return sd>=first-4&&sd<=EXAMS[EXAMS.length-1][0]}
const HUSTLES=[
 {id:'content',icon:'🎬',name:'Film a TikTok skit',mins:45,
  can(){return true},
  desc(h){return `${h.f.toLocaleString('en-GB')} followers · level ${huLv(h)}${h.f>=500?` · creator pay ${cedi(Math.min(3000,Math.floor(h.f/50)))} every Monday`:''}`},
  run(h){const p=P(),lv=huLv(h),vibe=(p.needs.fun+p.needs.social)/200,viral=Math.random()<.04+lv*.006;let gain=Math.round((30+lv*25)*(.5+vibe)*R(.6,1.5));if(viral)gain*=RI(25,60);
    doAct('Filming a TikTok skit',45,{fun:10,energy:-8,social:4});h.xp++;h.f+=gain;
    toast(viral?`🔥 Your skit went VIRAL! +${gain.toLocaleString('en-GB')} followers`:`🎬 Skit posted · +${gain} followers (${h.f.toLocaleString('en-GB')} total)`);
    while(h.miles<HU_MILES.length&&h.f>=HU_MILES[h.miles][0]){const [n,pay,who]=HU_MILES[h.miles];h.miles++;p.money+=pay;
      story(`<div class="eyebrow">🎬 ${n.toLocaleString('en-GB')} followers!</div><h3>Brand deal: ${esc(who)}</h3><p class="scene">${esc(who)} slid into your DMs. They want you to promote them in your next skits. You negotiate like a pro.</p><div class="big">+${cedi(pay)}</div>`,[['🤑 Let\'s go','g',()=>{}]])}}},
 {id:'design',icon:'🎨',name:'Do a design gig (2h)',mins:120,
  can(){const p=P(),w=huWhere();return p.items.includes('laptop')?(w==='myroom'||w==='lib'?true:'Do it in your room or the library'):w==='lib'?true:'Needs a laptop (Phone → HomeMart) or the library computers'},
  desc(h){return `Flyers, logos and church programmes · level ${huLv(h)} · about ${cedi(60+huLv(h)*30)} a gig`},
  run(h){const p=P(),lv=huLv(h),lab=!p.items.includes('laptop'),pay=Math.round((60+lv*30)*R(.8,1.3))-(lab?10:0),who=pick(['a church harvest programme','a hall week flyer','a chop bar logo','a wedding invite','a course rep\'s campaign poster','an Instagram thrift shop']);
    doAct('Designing on the laptop',120,{energy:-12,fun:-2});h.xp++;p.money+=pay;toast(`🎨 You designed ${who}${lab?' (library computer GH₵10)':''} · +${cedi(pay)}${huLv(h)>lv?` · ⬆️ level ${huLv(h)}!`:''}`)}},
 {id:'laundry',icon:'🧺',name:'Wash clothes for hostel mates (1.5h)',mins:90,
  can(){const w=huWhere();return w==='myroom'||w===P().home?true:'Do it in your hostel'},
  desc(h){return `Level ${huLv(h)} · ${cedi(35+huLv(h)*6)} a bucket`},
  run(h){const p=P(),lv=huLv(h),pay=35+lv*6;doAct('Washing clothes for hostel mates',90,{energy:-10,fun:-4,hygiene:-3});h.xp++;p.money+=pay;toast(`🧺 ${pick(['Kojo','Esi','Abena','Fiifi','Nana Yaa'])} paid you ${cedi(pay)} for washing their clothes`)}},
 {id:'pasco',icon:'📚',name:'Sell pasco (past questions)',mins:60,
  can(){const w=huWhere();if(!huExamSoon())return 'Only in the 4 days before exams';return w==='lib'||w==='print'?true:'Sell at the library or Print & Type'},
  desc(h){return `Exam season money · level ${huLv(h)} · printing costs GH₵30 once a semester`},
  run(h){const p=P(),lv=huLv(h);if(h.sem!==S.sem){if(!spend(30))return;h.sem=S.sem;toast('🖨️ You printed a stack of pasco booklets (GH₵30)')}const n=RI(5,10)+lv*2,pay=n*8;
    doAct('Selling pasco booklets',60,{social:6,energy:-5});h.xp++;p.money+=pay;toast(`📚 You sold ${n} pasco booklets · +${cedi(pay)}`)}},
 {id:'mc',icon:'🎤',name:'MC the event (2h)',mins:120,
  can(){const e=eventNow();return e&&huWhere()==='parade'?true:e?`${e.name} is on · go to the Parade Grounds`:'Only when an event is on (SRC Week, hall week)'},
  desc(h){return `Hype the crowd · level ${huLv(h)} · ${cedi(150+huLv(h)*50)}+`},
  run(h){const p=P(),lv=huLv(h),e=eventNow(),pay=Math.round((150+lv*50)*R(.9,1.4));doAct('MCing on the mic',120,{social:15,fun:12,energy:-14});h.xp++;p.money+=pay;
    toast(`🎤 You hyped ${e?e.name:'the event'}! The crowd chanted your name · +${cedi(pay)}`)}}];
function hustleSheet(note=''){S.paused=true;openSheet();const H=hu();
  $('sheetIn').innerHTML=`<div class="eyebrow">Side hustles</div><h3>💼 Make extra money</h3><p style="font-size:13px;opacity:.85">The more you do a hustle, the better you get and the more you earn.</p>${note?`<div class="say">${note}</div>`:''}
   <div class="list">${HUSTLES.map(x=>{const ok=x.can(),h=H[x.id];return `<div class="item"><div class="grow"><b>${x.icon} ${esc(x.name)}</b><small>${esc(x.desc(h))}${ok===true?'':` · <i>${esc(ok)}</i>`}</small></div><button class="${ok===true?'btn':'ghost'} sm" data-hu="${x.id}" ${ok===true?'':'disabled'}>Go</button></div>`}).join('')}</div>
   <button class="ghost sm" id="bye">Close</button>`;
  $('bye').onclick=closeSheet;$('sheetIn').querySelectorAll('[data-hu]').forEach(b=>b.onclick=()=>{const x=HUSTLES.find(y=>y.id===b.dataset.hu);if(S.busy)return hustleSheet('Finish what you\'re doing first.');closeSheet();x.run(H[x.id])})}
/* creator pay every Monday morning */
function hustleTick(){if(!S||!S.p||!P().hustle)return;const h=P().hustle.content;if(!h||h.f<500)return;const k=week();if(wd()===0&&hour()>=8&&h.paid!==k){h.paid=k;const pay=Math.min(3000,Math.floor(h.f/50));P().money+=pay;toast(`🎬 Creator pay for this week: +${cedi(pay)} (${h.f.toLocaleString('en-GB')} followers)`)}}
