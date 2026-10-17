/* ================= exams you actually write =================
   When you sit an exam you answer 5 real questions (20 s each) from your college's subjects plus
   general knowledge. Each right answer adds 3 marks, each wrong one takes 1 away. If you studied
   well, you "remember from lectures" and one wrong option is crossed out for you. */
const QBANK={
 coe:[['What is the SI unit of electrical resistance?',['Ohm','Volt','Ampere','Watt'],0],['Ohm\'s law says V equals…',['I × R','I ÷ R','R ÷ I','I² × R'],0],['d/dx of x² is…',['2x','x','x²/2','2'],0],
  ['Which material is a good electrical conductor?',['Copper','Rubber','Glass','Wood'],0],['A force of 10 N acts on a 2 kg mass. Acceleration?',['5 m/s²','20 m/s²','12 m/s²','0.2 m/s²'],0],['In technical drawing, a view from the top is the…',['Plan','Elevation','Section','Isometric'],0],
  ['Power is work done per unit…',['Time','Distance','Mass','Force'],0],['Which is a renewable source of energy?',['Solar','Coal','Diesel','Natural gas'],0]],
 cos:[['What is the chemical symbol for sodium?',['Na','S','So','Sd'],0],['The powerhouse of the cell is the…',['Mitochondrion','Nucleus','Ribosome','Cell wall'],0],['∫ 2x dx =',['x² + C','2x² + C','x + C','2 + C'],0],
  ['Which is a prime number?',['13','15','21','27'],0],['pH of pure water at 25 °C is…',['7','0','14','1'],0],['DNA stands for deoxyribo… acid',['Nucleic','Amino','Citric','Folic'],0],
  ['The mean of 2, 4 and 9 is…',['5','4','6','15'],0],['In programming, a loop that never ends is called…',['An infinite loop','A function','A variable','A compiler'],0]],
 chs:[['The largest organ of the human body is the…',['Skin','Liver','Heart','Brain'],0],['Red blood cells carry oxygen using…',['Haemoglobin','Insulin','Keratin','Melanin'],0],['Normal adult body temperature is about…',['37 °C','32 °C','40 °C','35 °C'],0],
  ['Which vitamin does sunlight help the body make?',['Vitamin D','Vitamin C','Vitamin A','Vitamin K'],0],['The femur is found in the…',['Thigh','Arm','Skull','Chest'],0],['Malaria is spread by the…',['Female Anopheles mosquito','Housefly','Tsetse fly','Male mosquito'],0],
  ['Insulin is made in the…',['Pancreas','Kidney','Lungs','Stomach'],0],['How many chambers does the human heart have?',['4','2','3','6'],0]],
 cohss:[['Ghana gained independence in…',['1957','1960','1945','1966'],0],['Who was Ghana\'s first president?',['Kwame Nkrumah','J. B. Danquah','J. J. Rawlings','K. A. Busia'],0],['"All men are mortal; Kofi is a man; so Kofi is mortal" is a…',['Syllogism','Metaphor','Hypothesis','Fallacy'],0],
  ['The arm of government that makes laws is the…',['Legislature','Executive','Judiciary','Police'],0],['Supply and demand meet at the…',['Equilibrium price','Ceiling price','Floor price','Cost price'],0],['Ghana\'s 1992 Constitution created the…',['Fourth Republic','First Republic','Third Republic','Second Republic'],0],
  ['A noun names a…',['Person, place or thing','Action','Feeling only','Number'],0],['GDP stands for Gross Domestic…',['Product','Profit','Price','Population'],0]],
 cabe:[['A building\'s floor plan is drawn to…',['Scale','Colour','Size 1:1 always','Feel'],0],['Concrete is mainly cement, water, sand and…',['Aggregate (stones)','Clay','Glass','Steel only'],0],['The primary colours (painting) are red, yellow and…',['Blue','Green','White','Orange'],0],
  ['A beam mainly resists…',['Bending','Rust','Fire','Sound'],0],['Laterite is a common building material in…',['Ghana and the tropics','Antarctica only','The desert only','Space'],0],['Kente weaving is famous in…',['Bonwire','Tamale','Axim','Ho'],0],
  ['1 metre equals… millimetres',['1000','100','10','10 000'],0],['A quantity surveyor mainly estimates…',['Building costs','Rainfall','Soil pH','Traffic'],0]],
 canr:[['Plants make food by…',['Photosynthesis','Respiration','Digestion','Fermentation'],0],['Ghana is one of the world\'s top producers of…',['Cocoa','Wheat','Apples','Rice only'],0],['Soil with lots of clay holds… water',['More','Less','No','Only salt'],0],
  ['Which nutrient makes leaves green and helps growth?',['Nitrogen','Gold','Calcium carbonate','Sodium'],0],['Cassava is a…',['Root crop','Cereal','Legume','Fruit tree'],0],['Removing weeds by hand is…',['Hand weeding','Irrigation','Grafting','Fumigation'],0],
  ['Animals that chew the cud are called…',['Ruminants','Rodents','Reptiles','Raptors'],0],['Agroforestry combines crops with…',['Trees','Fish only','Cars','Factories'],0]],
 gen:[['The capital of Ghana is…',['Accra','Kumasi','Tamale','Takoradi'],0],['Ghana\'s currency is the…',['Cedi','Naira','Shilling','Rand'],0],['Lake Volta was made by the…',['Akosombo Dam','Bui Dam','Kpong Dam','Weija Dam'],0],
  ['How many regions does Ghana have?',['16','10','12','18'],0],['The Black Star on Ghana\'s flag sits on a… band',['Gold','Red','Green','Black'],0],['25% of 200 is…',['50','25','75','40'],0],
  ['The opposite of "ancient" is…',['Modern','Old','Antique','Historic'],0],['Which is the largest planet?',['Jupiter','Earth','Mars','Venus'],0],['Water boils at… °C at sea level',['100','90','50','212'],0],
  ['Adinkra symbol "Gye Nyame" means…',['Except God','Wisdom','Unity','Go back and get it'],0],['A paragraph should have one main…',['Idea','Comma','Picture','Rhyme'],0],['If a shirt costs GH₵80 with 10% off, you pay…',['GH₵72','GH₵70','GH₵78','GH₵88'],0]]};
function quizQuestions(col){const own=shuffle(QBANK[col]||QBANK.cos).slice(0,3),g=shuffle(QBANK.gen).slice(0,2);
  return shuffle(own.concat(g)).map(([q,opts,a])=>{const ord=shuffle(opts.map((o,i)=>i));return{q,opts:ord.map(i=>opts[i]),a:ord.indexOf(a)}})}
function examQuiz(c,st){const p=P(),Q=quizQuestions(p.col),res=[];let i=0,timer=null,left=20,lock=false;S.paused=true;openSheet();
  const help=Math.min(1,p.study/120);   // how much you remember from lectures
  const show=()=>{clearInterval(timer);if(i>=Q.length)return done();const q=Q[i];left=20;lock=false;
    const struck=Math.random()<help?shuffle([0,1,2,3].filter(k=>k!==q.a))[0]:-1;
    $('sheetIn').innerHTML=`<div class="eyebrow">📝 ${esc(courseName(c))} exam · question ${i+1} of ${Q.length}</div><div class="bar" style="margin:6px 0 10px"><i id="qT" style="width:100%"></i></div>
      <h3 style="line-height:1.35">${esc(q.q)}</h3><div class="list">${q.opts.map((o,k)=>`<button class="item" data-q="${k}" style="text-align:left;cursor:pointer;${k===struck?'opacity:.45;text-decoration:line-through':''}"><b style="margin-right:8px">${'ABCD'[k]}</b><span class="grow">${esc(o)}</span></button>`).join('')}</div>
      ${struck>=0?'<p style="font-size:12px;opacity:.75">💡 You remember from lectures that the crossed-out one is wrong.</p>':''}`;
    $('sheetIn').querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>answer(+b.dataset.q));
    timer=setInterval(()=>{left-=.25;const bar=$('qT');if(bar)bar.style.width=Math.max(0,left/20*100)+'%';if(left<=0)answer(-1)},250)};
  const answer=k=>{if(lock)return;lock=true;clearInterval(timer);const q=Q[i],ok=k===q.a;res.push(ok);try{SND.blip(ok?880:220,.18,.05,ok?'sine':'square',ok?1320:160)}catch(e){}
    $('sheetIn').querySelectorAll('[data-q]').forEach(b=>{const n=+b.dataset.q;b.disabled=true;if(n===q.a)b.style.boxShadow='inset 0 0 0 2px #3ecf8e';else if(n===k)b.style.boxShadow='inset 0 0 0 2px #ff6b6b'});
    i++;setTimeout(show,k<0?900:650)};
  const done=()=>{const right=res.filter(Boolean).length,bonus=right*3-(res.length-right);S.quizX=S.quizX||{};S.quizX[c+'|'+S.sem]={right,n:res.length,bonus};closeSheet();
    toast(`📝 You answered ${right} of ${res.length} questions correctly. Now finish the rest of the paper…`);writeExam(c,st)};
  show()}
