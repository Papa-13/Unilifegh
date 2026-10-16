/* ================= academic years: Level 100 → final year → graduation =================
   Like a Ghanaian university: two semesters a year, four years for most programmes
   (six for Medicine and Pharmacy). Courses change every semester. Failed courses become
   trails you must resit; a year average below 40 means repeating the year. When the final
   year is done with no trails, you graduate with a class of degree from your cumulative CWA. */
const PROG_YEARS={'Human Biology (Medicine)':6,'Pharmacy':6};
const yearsFor=prog=>PROG_YEARS[prog]||4;
const ROMAN=['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
const levelOf=p=>(p.yr||1)*100;
const lvlLabel=()=>{const p=P();return p.grad?'Graduate':`L${levelOf(p)}`};
const isFinalYear=p=>(p.yr||1)>=(p.years||yearsFor(p.prog));
/* a second and third course for each college, changing by semester */
const COLX={
  coe:['Engineering Mathematics','Strength of Materials','Thermodynamics','Fluid Mechanics','Engineering Economics','Instrumentation & Control','Numerical Methods','Engineering Ethics','Project Management','Entrepreneurship for Engineers'],
  cos:['Calculus','Linear Algebra','Probability','Research Methods','Scientific Computing','Data Analysis','Philosophy of Science','Laboratory Techniques','Science Communication','Entrepreneurship'],
  chs:['Human Anatomy','Physiology','Pathology','Pharmacology','Microbiology','Community Health','Medical Ethics','Epidemiology','Health Policy','Research Methods'],
  cohss:['Logic & Critical Thinking','Research Methods','Social Statistics','African Studies','Public Policy','Development Studies','Ethics','Academic Writing','Entrepreneurship','Leadership'],
  cabe:['Building Science','History of Architecture','Construction Materials','Surveying','Land Law','Design Studio','Project Management','Property Valuation','Urban Studies','Entrepreneurship'],
  canr:['Soil Science','Crop Science','Animal Science','Agricultural Economics','Farm Management','Agro-forestry','Extension Methods','Food Science','Climate & Agriculture','Agribusiness']};
const MEDROT=['Internal Medicine rotation','Surgery rotation','Paediatrics rotation','Obstetrics & Gynaecology rotation','Psychiatry rotation','Community Health rotation'];
function mainCourseBase(prog){const i=INTRO[prog];if(i&&/ I$/.test(i))return i.replace(/ I$/,'');return prog.replace(/\s*\(.*\)/,'')}
/* the three courses for a given year and semester (index 0 is the main course of your programme) */
function coursesFor(prog,col,yr=1,sy=1){
  if(yr===1&&sy===1)return[INTRO[prog]||`Introduction to ${prog.replace(/\s*\(.*\)/,'')}`,...COLLEGES[col].common];
  const n=(yr-1)*2+sy,years=yearsFor(prog),X=COLX[col]||COLX.cos,base=mainCourseBase(prog);
  if(prog==='Human Biology (Medicine)'&&yr>3)return['Clinical Medicine '+ROMAN[n-6],MEDROT[(n-7)%MEDROT.length],MEDROT[(n-6)%MEDROT.length]];
  const main=`${base} ${ROMAN[Math.min(n,12)]}`,second=`${X[0]} ${ROMAN[Math.min(n,12)]}`;
  if(yr>=years)return[main,second,sy===1?'Final Year Project I: Proposal':'Final Year Project II: Thesis & Defence'];
  return[main,second,X[(n-1)%(X.length-1)+1]];
}
/* old saves from before academic years: fill in what's missing */
function ensureAcad(){const p=P();if(!p)return;
  if(p.yr==null){p.yr=Math.floor(((S.sem||1)-1)/2)+1;S.sy=((S.sem||1)-1)%2+1}
  if(S.sy==null)S.sy=1;if(p.years==null)p.years=yearsFor(p.prog);if(!p.trans)p.trans=[];if(!p.trails)p.trails=[];if(p.prob==null)p.prob=0}
const cumCWA=p=>{const t=p.trans.filter(x=>!x.void);return t.length?t.reduce((a,x)=>a+x.cwa,0)/t.length:null};
const classOf=c=>c>=70?'First Class':c>=60?'Second Class Upper':c>=50?'Second Class Lower':c>=40?'Pass':'Fail';
const yearAvg=(p,yr)=>{const t=p.trans.filter(x=>x.yr===yr&&!x.void);return t.length?t.reduce((a,x)=>a+x.cwa,0)/t.length:null};

/* called from results(): records the semester, resits old trails, and decides what comes next */
function acadAfterSemester(scores){const p=P();ensureAcad();
  const cwa=scores.reduce((a,b)=>a+b,0)/scores.length,form=cwa;
  const resits=p.trails.map(t=>{const s=Math.round(clamp(form*.85+R(-6,14)));return{...t,score:s,ok:s>=40}});
  p.trails=p.trails.filter((t,i)=>!resits[i].ok);
  if(!S.extra)scores.forEach((s,c)=>{if(s<40)p.trails.push({name:courseName(c),yr:p.yr,sy:S.sy})});
  p.trans.push({yr:p.yr,sy:S.sy,names:p.courses.slice(),scores:scores.slice(),cwa,void:!!S.extra,resit:!!S.extra});
  const cum=cumCWA(p);let next,note='';
  if(S.extra){S.extra=false;if(p.trails.length){next='extra';note=`You still have ${p.trails.length} trail${p.trails.length>1?'s':''} to clear before you can graduate.`}else next='graduate'}
  else if(S.sy===1)next='sem2';
  else{const ya=yearAvg(p,p.yr);
    if(ya<40){p.prob++;next='repeat';p.trans.filter(x=>x.yr===p.yr).forEach(x=>x.void=true);p.trails=p.trails.filter(t=>t.yr!==p.yr);note=`Your Level ${levelOf(p)} average was ${ya.toFixed(1)}, below 40. The Academic Board says you must repeat the year.`}
    else if(isFinalYear(p)){if(p.trails.length){next='extra';note=`Final year done, but you have ${p.trails.length} trail${p.trails.length>1?'s':''}. You need an extra semester to resit before you can graduate.`}else next='graduate'}
    else next='newyear'}
  S.nextKind=next;return{cwa,cum:cumCWA(p),resits,next,note}}

/* where the "continue" button on the results screen leads */
function acadContinue(){const k=S.nextKind,p=P();
  if(k==='graduate')return graduation();
  if(k==='newyear'||k==='repeat')return vacation(()=>hostelPick(true));
  return nextSemester(null)}
function acadButtonLabel(){const k=S.nextKind,p=P();
  return k==='graduate'?'🎓 Go to the graduation ceremony':k==='newyear'?`☀️ Long vacation, then Level ${levelOf(p)+100}`:k==='repeat'?`Long vacation, then repeat Level ${levelOf(p)}`:k==='extra'?'Start the resit semester':`Start semester 2 of Level ${levelOf(p)}`}

/* moves the student's year/semester forward when the next semester starts */
function acadAdvance(){const p=P(),k=S.nextKind;ensureAcad();
  if(k==='sem2')S.sy=2;else if(k==='newyear'){p.yr++;S.sy=1}else if(k==='repeat'){S.sy=1}else if(k==='extra'){S.sy=2;S.extra=true}
  S.nextKind=null;p.courses=coursesFor(p.prog,p.col,p.yr,S.sy);
  if((k==='newyear'||k==='repeat')&&p.feePaying){p.money-=3500;msg('Accounts Office',`Academic fees for Level ${levelOf(p)}: ${cedi(3500)} charged. MoMo: ${cedi(p.money)}.`)}
  if(k==='newyear'&&isFinalYear(p))msg('Department',`Welcome to your final year! Pick a project supervisor and start your proposal. Final Year Project counts every semester. 💪🏾`)}

/* ---- long vacation between academic years (going home) ---- */
function vacation(then){const p=P(),home=BG[p.bg];
  const opts=[
    ['🏠 Rest at home and eat mum\'s food',{energy:100,hunger:100,fun:80,social:60},0,'You slept, ate fufu every Sunday and watched too much TV. Fully recharged.'],
    ['💼 Do a vacation internship',{energy:70,fun:50,social:60},R(600,1200),'You interned at a company in town. Long days, but you earned money and something for your CV.'],
    ['🛍️ Help with the family business',{energy:75,fun:60,social:80},R(250,500),'You sold at the family shop and learned how to talk to customers. Your parents gave you something small.'],
    ['📚 Do a holiday course',{energy:80,fun:45,social:50},0,'You took a short course in town. You go back sharper: +5 study for the new year.']];
  story(`<div class="eyebrow">Long vacation · going home</div><h3>Exams are over. Time to go home! 🚌</h3>
    <p class="scene">You pack your things, say bye to your hostel mates and take the bus home. The campus will be waiting for you when you come back for Level ${levelOf(p)+(S.nextKind==='newyear'?100:0)}.</p>
    <p class="hint">Coming soon: live your vacation on a home map with your family and neighbourhood.</p><p><strong>How do you spend the vacation?</strong></p>`,
    opts.map(([l,fx,pay,txt],i)=>[l,i?'':'g',()=>{const n=p.needs;for(const k in fx)n[k]=Math.max(n[k],fx[k]);if(pay){p.money+=pay}if(i===3)p.study=(p.study||0)+5;
      story(`<div class="eyebrow">Vacation</div><h3>${esc(l.replace(/^\S+\s/,''))}</h3><p class="scene">${txt}</p>${pay?`<p>You made <strong>${cedi(pay)}</strong>. MoMo: ${cedi(p.money)}</p>`:''}`,[['Back to campus','g',then]])}]))}

/* ---- graduation (KNUST calls it congregation) ---- */
function graduation(){const p=P(),cum=cumCWA(p),cls=classOf(cum);p.grad=cls;p.gradDay=day();try{ev('grad',{cls})}catch(e){}
  const yrs=[...new Set(p.trans.filter(t=>!t.void).map(t=>t.yr))];
  story(`<div class="eyebrow">Congregation · Great Hall · ${esc(COLLEGES[p.col].name)}</div><h3>Congratulations, graduate! 🎓</h3>
    <p class="scene">Your name is called. You walk across the stage in your gown, shake the Vice-Chancellor's hand and hold up your certificate. Your family is screaming from the back. ${p.bg==='poor'?'Mum is crying. The whole family contributed, and you did it.':'Dad is filming everything on his phone.'}</p>
    <div class="big">${cum.toFixed(2)}</div><h3>${esc(p.prog)} · ${cls}</h3>
    <table><tr><th>Level</th><th>Average</th></tr>${yrs.map(y=>`<tr><td>Level ${y*100}</td><td class="n">${yearAvg(p,y).toFixed(1)}</td></tr>`).join('')}</table>
    <p>Friends: <strong>${friendsN()}</strong>${p.office?` · Held office: <strong>${esc(p.office)}</strong>`:''}${p.biz?` · Business earned <strong>${cedi(p.biz.earned)}</strong>`:''} · MoMo <strong>${cedi(p.money)}</strong></p>
    <p class="hint">Next in Ghana: National Service. Coming soon.</p>`,
    [['Keep living on campus as a graduate','g',()=>{toast(`🎓 ${p.name}, ${cls}. Lectures are over, enjoy campus life!`)}],['Start a new student (Level 100)','',()=>{saveGame();maker()}]])}

/* academics card for the phone */
function acadHTML(){const p=P();ensureAcad();const cum=cumCWA(p);
  return `<div class="say" style="margin:4px 0 8px">🎓 <b>${p.grad?`Graduated · ${esc(p.grad)}`:`Level ${levelOf(p)} · Semester ${S.sy}${S.extra?' (resits)':''}`}</b> · Year ${Math.min(p.yr,p.years)} of ${p.years}<br>
    Cumulative CWA: <b>${cum==null?'–':cum.toFixed(2)+' · '+classOf(cum)}</b>${p.trails.length?`<br>Trails to resit: <b style="color:var(--red)">${p.trails.map(t=>esc(t.name)).join(', ')}</b>`:''}</div>
    ${p.trans.length?`<details><summary style="cursor:pointer;font-size:14px">📜 Transcript</summary><table><tr><th>Semester</th><th>CWA</th></tr>${p.trans.map(t=>`<tr><td>L${t.yr*100} · Sem ${t.sy}${t.resit?' (resit semester)':t.void?' (repeated)':''}</td><td class="n">${t.cwa.toFixed(1)}</td></tr>`).join('')}</table></details>`:''}`}
