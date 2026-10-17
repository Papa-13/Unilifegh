/* ================= world data ================= */
const MW=5400,MH=4000,U=0.028,MINPS=1,SPEEDS=[0,1,3,8];
const wx=x=>(x-MW/2)*U, wz=y=>(y-MH/2)*U;
/* the road grid: h = [y, from x, to x] (y=330 is the Accra–Kumasi Road, 2800 the Ayeduase–Kotei Road, 3400 the town road), v = x of full-height roads */
const MAPR={h:[[330,0,MW],[1000,600,MW],[2150,600,MW],[2800,0,MW],[3400,0,MW]],v:[600,2000,3400,4400]};
const B=[
 /* KNUST-style: Accra–Kumasi Road on top; Tech Junction & Commercial Area (west), Administration, halls and Parade Grounds (centre),
    Faculty Area (east, next to Ayeduase), sports (south); hostels spread over Bomso, Ayigya, Kentinkrono, Ayeduase, Gaza, Boadi, Kotei and Gyinyaase */
 {id:'taxi',name:'Tech Junction Taxi Rank',x:680,y:475,w:260,h:150,open:1,c:0x6d665e,door:[810,550],zone:'c'},
 {id:'trotro',name:'Tech Junction Trotro Station',x:980,y:475,w:260,h:170,open:1,c:0x7a7166,door:[1110,560],zone:'c'},
 {id:'terminal',name:'Main Gate Shuttle Terminal',x:1280,y:475,w:320,h:150,open:1,c:0x8a8378,door:[1440,550],zone:'c'},
 {id:'mall',name:'Campus Mall',x:680,y:700,w:260,h:155,ht:3.4,c:0xece4d8,roof:0x9b4a2e,door:[810,873],zone:'c'},
 {id:'unity',name:'Unity Bank',x:980,y:685,w:260,h:170,ht:3.2,c:0xe8e4da,roof:0x1f4f8b,door:[1110,873],zone:'c'},
 {id:'bank',name:'Akwaaba Savings Bank',x:1280,y:705,w:250,h:150,ht:3,c:0xf2efe6,roof:0x2f6b3a,door:[1405,873],zone:'c'},
 {id:'books',name:'Campus Bookshop',x:1570,y:705,w:280,h:150,ht:2.6,c:0xe6dcc8,roof:0x5b4636,door:[1710,873],zone:'c',deco:1},
 {id:'phonehub',name:'Phone & Laptop Hub',x:680,y:1145,w:180,h:150,ht:2.4,c:0xdfe6ee,roof:0x2a2a2a,door:[770,1127],zone:'c',deco:1},
 {id:'salon',name:'Barber & Salon',x:900,y:1145,w:200,h:150,ht:2.4,c:0xf0d6e2,roof:0x9b3a6e,door:[1000,1127],zone:'c'},
 {id:'pharm',name:'Campus Pharmacy',x:1140,y:1145,w:230,h:150,ht:2.4,c:0xf3f3f0,roof:0x2f8a4a,door:[1255,1127],zone:'c',deco:1},
 {id:'shawarma',name:'Shawarma & Pizza Spot',x:1410,y:1145,w:260,h:150,ht:2.4,c:0xf0e2c8,roof:0xc2572e,door:[1540,1127],zone:'c',deco:1},
 {id:'market',name:'Campus Market',x:700,y:1450,w:320,h:150,open:1,c:0x8a7458,door:[860,1540],zone:'c'},
 {id:'club',name:'Club Vibes',x:700,y:1855,w:240,h:150,ht:3.4,c:0x221d2e,roof:0x7a2ea0,door:[820,2023],zone:'c'},
 {id:'senate',name:'Senate & Registry',x:2100,y:475,w:300,h:170,ht:3.6,c:0xe6dcc6,roof:0x2f4e6b,door:[2250,457],zone:'f',deco:1},
 {id:'greathall',name:'Great Hall',x:2450,y:475,w:300,h:180,ht:4.2,c:0xe9dfc9,roof:0x8e2a3a,door:[2600,457],zone:'f',deco:1},
 {id:'lib',name:'University Library',x:2100,y:685,w:280,h:170,ht:3.6,c:0xcfc3a5,roof:0x5b4636,door:[2240,873],zone:'f'},
 {id:'office',name:'Student Affairs & SRC',x:2420,y:705,w:220,h:150,ht:2.4,c:0xe9e3d6,roof:0x3c6e58,door:[2530,873],zone:'f'},
 {id:'chapel',name:'University Chapel',x:2680,y:685,w:220,h:170,ht:4,c:0xf2efe8,roof:0x4a3a6a,door:[2790,873],zone:'f'},
 {id:'coe',name:'CoE · Engineering',x:3480,y:475,w:260,h:170,ht:3.4,c:0xd6d2c8,roof:0x8e2a3a,door:[3610,457],zone:'f'},
 {id:'cos',name:'CoS · Science',x:3760,y:475,w:260,h:180,ht:3.8,c:0xd2dce2,roof:0x2a5f8b,door:[3890,457],zone:'f'},
 {id:'canr',name:'CANR · Agriculture',x:4040,y:475,w:240,h:170,ht:3,c:0xd8d0b4,roof:0x3c7a3a,door:[4160,457],zone:'f'},
 {id:'cohss',name:'CoHSS · Humanities',x:3480,y:675,w:240,h:180,ht:3.4,c:0xe2d8c8,roof:0x7a4a2a,door:[3600,873],zone:'f'},
 {id:'cabe',name:'CABE · Built Env.',x:3740,y:675,w:240,h:180,ht:3.4,c:0xd8d8d8,roof:0x4a4a6a,door:[3860,873],zone:'f'},
 {id:'chs',name:'CHS · Health Sciences',x:4000,y:705,w:260,h:150,ht:3.2,c:0xeef0ee,roof:0x2a7b7b,door:[4130,873],zone:'f'},
 {id:'clinic',name:'Health Centre',x:3480,y:1145,w:200,h:150,ht:2.6,c:0xf3f3f0,roof:0xb83a3a,door:[3580,1127],zone:'f'},
 {id:'canteen',name:'Bush Canteen',x:3720,y:1145,w:180,h:150,ht:2.2,c:0xc9a27a,roof:0x7a5a2a,door:[3810,1127],zone:'f'},
 {id:'print',name:'Print & Type',x:3940,y:1145,w:160,h:150,ht:2.2,c:0xd8e1e6,roof:0x2a6f9b,door:[4020,1127],zone:'f'},
 {id:'lake',name:'Campus Lake',x:3480,y:1450,w:290,h:200,open:1,c:0x6f9a4c,door:[3620,1550],zone:'p'},
 {id:'parade',name:'Parade Grounds',x:2050,y:1135,w:280,h:870,open:1,c:0x6f9e4f,door:[2190,1365],zone:'p'},
 {id:'garden',name:'Botanical Garden',x:700,y:2300,w:260,h:200,open:1,c:0x4f8a3e,door:[830,2400],zone:'p'},
 {id:'night',name:'Night Market',x:1050,y:2300,w:320,h:200,open:1,c:0x6b5a46,door:[1210,2400],zone:'c'},
 {id:'square',name:'Akwaaba Square',x:1450,y:2300,w:320,h:200,open:1,c:0xbfae90,door:[1610,2400],zone:'c'},
 {id:'field',name:'Sports Field',x:2050,y:2250,w:360,h:240,open:1,c:0x3f8a3a,door:[2230,2370],zone:'s'},
 {id:'court',name:'Basketball Court',x:2450,y:2250,w:240,h:200,open:1,c:0xb5653a,door:[2570,2350],zone:'s'},
 {id:'pool',name:'Swimming Pool',x:2750,y:2250,w:240,h:150,open:1,c:0xd9d4c7,door:[2870,2258],zone:'s'},
 {id:'pavilion',name:'Sports Pavilion',x:2050,y:2515,w:170,h:140,ht:2.6,c:0xe9e3d6,roof:0x8e2a3a,door:[2135,2673],zone:'s',deco:1},
 {id:'gym',name:'Campus Gym',x:2450,y:2485,w:240,h:170,ht:2.8,c:0x9aa3ab,roof:0x2b2b2b,door:[2570,2673],zone:'s'},
 {id:'hall',name:'Indoor Sports Hall',x:2750,y:2485,w:280,h:170,ht:4,c:0xc9d2d8,roof:0x2a6f9b,door:[2890,2673],zone:'s',deco:1},
 {id:'lodge',name:'Akwaaba Lodge · Ayeduase',x:4500,y:475,w:260,h:170,ht:3.2,c:0xd9c9a8,roof:0x8a5a2a,door:[4630,457],home:1,zone:'r'},
 {id:'heights',name:'Ayeduase Heights',x:4500,y:680,w:310,h:175,ht:5,c:0xe8d8c4,roof:0x6b4a2e,door:[4655,873],home:1,zone:'r'},
 {id:'sunrise',name:'Sunrise Hostel · Kotei',x:2100,y:2945,w:300,h:170,ht:4,c:0xf0dcc4,roof:0xc2572e,door:[2250,2927],home:1,zone:'r'},
 {id:'kotei',name:'Kotei Court',x:2500,y:2945,w:300,h:175,ht:4.4,c:0xdfe2d8,roof:0x3c6e58,door:[2650,2927],home:1,zone:'r'},
 {id:'royal',name:'Royal Crest Towers · Tech Junction',x:200,y:15,w:240,h:170,ht:6.4,c:0x2f3640,roof:0xd9a537,door:[320,203],home:1,zone:'r'},
 {id:'bayview',name:'Bay View Hostel · Bomso',x:750,y:5,w:320,h:180,ht:4.6,c:0xdfe9ee,roof:0x1f6f8b,door:[910,203],home:1,zone:'r'},
 {id:'sankofa',name:'Sankofa Hall',x:2400,y:1145,w:300,h:180,ht:4.8,c:0xe8dcc0,roof:0x8e2a3a,door:[2550,1127],zone:'r',home:1,hall:1},
 {id:'adinkra',name:'Adinkra Hall',x:2760,y:1145,w:300,h:180,ht:4.4,c:0xdfe6ea,roof:0x1f4f8b,door:[2910,1127],zone:'r',home:1,hall:1},
 {id:'volta',name:'Volta Hall',x:2400,y:1825,w:300,h:180,ht:5,c:0xf0e4cc,roof:0x2f6b3a,door:[2550,2023],zone:'r',home:1,hall:1},
 {id:'yaa',name:'Queen Yaa Asantewaa Hall',x:2760,y:1825,w:300,h:180,ht:4.6,c:0xf3e1e6,roof:0x9b3a6e,door:[2910,2023],zone:'r',home:1,hall:1},
 {id:'grace',name:'Grace Court · Ayeduase',x:4820,y:475,w:300,h:170,ht:4,c:0xf2e2c8,roof:0x9a5a32,door:[4970,457],zone:'r',home:1},
 {id:'execs',name:'Executive Suites · Ayeduase',x:4500,y:1145,w:300,h:175,ht:6,c:0x2f3a44,roof:0xd9a537,door:[4650,1127],zone:'r',home:1},
 {id:'newsite',name:'New Site Residence · Ayeduase',x:4500,y:2945,w:300,h:170,ht:4.4,c:0xe6efe9,roof:0x2f6b3a,door:[4650,2927],zone:'r',home:1},
 {id:'gaza',name:'Gaza Annex',x:4880,y:2945,w:280,h:165,ht:3.2,c:0xe9d9b8,roof:0x8a4a2a,door:[5020,2927],zone:'r',home:1},
 {id:'peace',name:'Peace Villa · Kotei',x:2900,y:2945,w:300,h:175,ht:4.6,c:0xdfe9ee,roof:0x1f6f8b,door:[3050,2927],zone:'r',home:1},
 {id:'boadi',name:'Boadi Executive Hostel',x:3500,y:2945,w:300,h:175,ht:4.8,c:0xe8e0d0,roof:0x5b3a7a,door:[3650,2927],zone:'r',home:1},
 {id:'gyin',name:'Gyinyaase Gardens',x:700,y:2945,w:300,h:175,ht:3.8,c:0xe9e0d0,roof:0x2f6b3a,door:[850,2927],zone:'r',home:1},
 {id:'hilltop',name:'Hilltop Hostel · Gyinyaase',x:1100,y:2945,w:280,h:165,ht:3.2,c:0xf0d9b5,roof:0x8a4a2a,door:[1240,2927],zone:'r',home:1},
 {id:'morning',name:'Morning Glory Hostel · Bomso',x:1250,y:20,w:280,h:165,ht:3.2,c:0xe9c9a9,roof:0x8a4a2a,door:[1390,203],zone:'r',home:1},
 {id:'canaan',name:'Canaan Lodge · Bomso',x:1700,y:15,w:300,h:170,ht:4,c:0xd8e4d0,roof:0xc2572e,door:[1850,203],zone:'r',home:1},
 {id:'ayigya',name:'Ayigya Grace Hostel',x:2600,y:20,w:280,h:165,ht:3.2,c:0xf2e6d8,roof:0x7b7f84,door:[2740,203],zone:'r',home:1},
 {id:'nyamedua',name:'Nyame Dua Hostel · Ayigya',x:3100,y:15,w:300,h:170,ht:4,c:0xcfd8e8,roof:0x9a5a32,door:[3250,203],zone:'r',home:1},
 {id:'kent',name:'Kentinkrono Gardens',x:4600,y:15,w:300,h:170,ht:4,c:0xe6c8c8,roof:0x2f6b3a,door:[4750,203],zone:'r',home:1}];
/* where open areas and decorated places used to be (their props are built there, then moved) */
const ORIG={garden:[60,370,260,200],night:[420,690,320,200],field:[820,690,360,240],trotro:[60,1040,260,170],square:[420,1040,320,200],lake:[1200,1040,290,200],court:[1520,1040,240,200],
  taxi:[60,1310,260,150],terminal:[420,1310,320,150],market:[820,1310,320,150],pool:[1200,1310,240,150],parade:[1840,370,280,870],club:[1520,1310,240,150]};
function areaOf(x,y){let best=null,bd=71;for(const k in ORIG){const [ox,oy,w,h]=ORIG[k],dx=Math.max(ox-x,0,x-ox-w),dy=Math.max(oy-y,0,y-oy-h),d=Math.hypot(dx,dy);if(d<bd){bd=d;best=k}}return best}
const delta=id=>[BID[id].x-ORIG[id][0],BID[id].y-ORIG[id][1]];
function TA(id,x,y){const d=delta(id);return{x:x+d[0],y:y+d[1]}}
function T(x,y){const id=areaOf(x,y);return id?TA(id,x,y):{x,y}}
const BID=Object.fromEntries(B.map(b=>[b.id,b]));
const outDir=b=>b.door[1]>b.y?1:-1;
const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const SEM_DAYS=12;
/* KNUST-style colleges, programmes and cut-off aggregates (6 is best) */
const COLLEGES={
 coe:{name:'College of Engineering',short:'CoE',common:['Engineering Mathematics I','Technical Drawing'],progs:[['Electrical/Electronic Engineering',7],['Petroleum Engineering',7],['Computer Engineering',9],['Mechanical Engineering',10],['Civil Engineering',10],['Telecommunication Engineering',11]]},
 cos:{name:'College of Science',short:'CoS',common:['Calculus I','Communication Skills'],progs:[['Computer Science',11],['Biological Science',12],['Statistics',16],['Mathematics',18],['Chemistry',18],['Physics',21]]},
 chs:{name:'College of Health Sciences',short:'CHS',common:['Human Anatomy I','Biochemistry I'],progs:[['Human Biology (Medicine)',6],['Pharmacy',6],['Physician Assistantship',7],['Nursing',9],['Midwifery',10],['Physiotherapy & Sports Science',14]]},
 cohss:{name:'College of Humanities and Social Sciences',short:'CoHSS',common:['Communication Skills','Logic & Critical Thinking'],progs:[['Law (LLB)',6],['Business Administration',10],['Political Studies',11],['Economics',13],['History',18],['English',20]]},
 cabe:{name:'College of Art and Built Environment',short:'CABE',common:['Drawing & Visual Thinking','Building Science I'],progs:[['Real Estate',13],['Construction Technology & Management',14],['Quantity Surveying',14],['Communication Design',14],['Human Settlement Planning',16],['Painting & Sculpture',20]]},
 canr:{name:'College of Agriculture & Natural Resources',short:'CANR',common:['General Agriculture','Soil Science I'],progs:[['Agribusiness Management',15],['Packaging Technology',15],['Agricultural Biotechnology',17],['Natural Resources Management',18],['Agriculture',20],['Forest Resources Technology',24]]}};
const ALLPROGS=Object.entries(COLLEGES).flatMap(([c,v])=>v.progs.map(([n,cut])=>({name:n,cut,col:c})));
const INTRO={'Law (LLB)':'Ghana Legal System','Human Biology (Medicine)':'Cell Biology for Medicine','Pharmacy':'Pharmaceutical Chemistry I','Computer Science':'Programming I','Computer Engineering':'Intro to Programming in C','Economics':'Principles of Economics I','Business Administration':'Principles of Management','Nursing':'Foundations of Nursing'};
const TT={0:[[0,8],[1,14]],1:[[2,8],[0,14]],2:[[1,8],[2,14]],3:[[0,8],[1,14]],4:[[2,8]]};
const GOODLEC='Prof. Adjoa Sarpong',BADLEC='Dr. Ofori-Kuma';
const INTERESTS=['Afrobeats','Football','Fashion','Tech','Church','Business','Books','Dance','Gaming'];
const SKINS=['#2b170d','#3b2216','#4a2a18','#5a321e','#6a3f26','#7f4d2e','#946039'];
const PAL={
 maroon:{name:'Maroon',a:'#8e2a3a',b:'#e8b24a',pat:'stripe'},
 ankara:{name:'Orange Ankara',a:'#e0652a',b:'#1f3b73',pat:'dots'},
 kente:{name:'Kente',a:'#e0a526',b:'#1d7a45',pat:'kente'},
 denim:{name:'Denim blue',a:'#40618f',b:'#2d466b',pat:'plain'},
 white:{name:'White',a:'#f1ece3',b:'#d6cdc0',pat:'plain'},
 black:{name:'Black',a:'#1c1c1c',b:'#333333',pat:'plain'},
 green:{name:'Green print',a:'#2f7a4a',b:'#f1d9b5',pat:'diag'},
 pink:{name:'Pink',a:'#e58fb0',b:'#ffffff',pat:'plain'},
 olive:{name:'Olive',a:'#6b6b3a',b:'#3f3f22',pat:'plain'},
 beige:{name:'Beige',a:'#d8c7a6',b:'#8a6d4a',pat:'plain'},
 lilac:{name:'Lilac',a:'#b9a3d6',b:'#ffffff',pat:'plain'},
 heather:{name:'Heather grey',a:'#9a9ca0',b:'#2b2b2b',pat:'plain'},
 ghana:{name:'Black Stars',a:'#c8102e',b:'#fcd116',pat:'ghana'},
 camo:{name:'Camo',a:'#5b6b3a',b:'#3a2f22',pat:'camo'},
 tiedye:{name:'Tie-dye',a:'#7a3fa0',b:'#f4a41c',pat:'tiedye'},
 batik:{name:'Blue batik',a:'#1f3b73',b:'#7fb0d8',pat:'batik'},
 rugby:{name:'Green rugby stripes',a:'#1f5f3a',b:'#f1ece3',pat:'stripe'},
 navy:{name:'Navy',a:'#1f2a44',b:'#3a4a6a',pat:'plain'},
 khaki:{name:'Khaki',a:'#8a7d5a',b:'#5a5038',pat:'plain'}};
const HAIR={m:{short:'Short',fade:'Low cut',waves:'360 waves',afro:'Afro',locs:'Locs',twists:'Twists',cornrows:'Cornrows',dyed:'Blonde low cut',frohawk:'Frohawk',burst:'Twist sponge curls',hightop:'High top fade',mdesign:'Braided designs',twists2:'Two-strand twists',locbun:'Half-up tied locs'},f:{braids:'Knotless braids',afro:'Afro',puffs:'Afro puffs',bun:'Bun',locs:'Locs',cornrows:'Cornrows',wig:'Straight wig',duku:'Headwrap',bantu:'Bantu knots',ponytail:'Sleek ponytail',bob:'Bob wig',lowcut:'Low cut',blonde:'Blonde wig',puff:'High puff',knotless:'Knotless braids (medium)',fulani:'Fulani braids',passion:'Passion twists',goddess:'Goddess locs',bobbraids:'Bob braids',halfup:'Half up half down',curlywig:'Curly wig',locbun:'Half-up tied locs'}};
const HAIRPRICE={short:20,fade:25,waves:30,afro:30,puffs:40,cornrows:90,locs:180,twists:120,braids:150,bun:40,wig:250,duku:30,dyed:60,frohawk:45,burst:70,bantu:80,ponytail:90,bob:200,lowcut:20,blonde:280,hightop:35,mdesign:110,twists2:90,locbun:200,puff:40,knotless:130,fulani:170,passion:160,goddess:220,bobbraids:120,halfup:150,curlywig:260};
const OUTFIT={m:{tee:'Oversized tee & cargos',hoodie:'Hoodie & joggers',polo:'Polo & chinos',shirt:'Shirt & jeans',jacket:'Denim jacket & jeans',varsity:'Varsity jacket',track:'Tracksuit',kaftan:'Kaftan set',jersey:'Jersey & shorts',smock:'Fugu smock',unitee:'AKWAABA U campus tee',rugby:'Rugby stripe shirt & jeans',cargo2:'Tee & black cargos',suit:'Suit (presentations)'},
  f:{jeans:'Crop top & jeans',hoodie:'Hoodie & leggings',bodycon:'Bodycon dress',tank:'Tank top & cargos',skirt:'Tee & mini skirt',twopiece:'Print two-piece',jumpsuit:'Jumpsuit',blazer:'Blazer suit',athleisure:'Athleisure set',kente:'Kente maxi dress',kaba:'Ankara two-piece',dress:'Sundress',unitee:'AKWAABA U campus tee',dskirt:'Crop top & denim maxi skirt',cargo:'Tank & cargo pants',formal:'Shirt & trousers (presentations)'}};
const SHOES={sneakers:'Sneakers',sandals:'Sandals',slides:'Slides',shoes:'Leather shoes'};
const EXTRA={none:'Nothing',specs:'Glasses',headphones:'Headphones',cap:'Cap',chain:'Chain',earrings:'Hoop earrings',studs:'Stud earrings'};
const BEARDS={none:'Clean shaven',goatee:'Goatee',full:'Full beard'};
const BAGS={backpack:'Backpack',tote:'Tote bag',none:'No bag'};
/* family background */
const BG={
 rich:{name:'Wealthy home',emoji:'🏡',fund:20000,allow:800,momo:8000,agg:[6,13],story:'Your dad runs a construction company in East Legon and your mum is a pharmacist. You went to a top boarding school. Money is not the problem. Making real friends might be.'},
 avg:{name:'Average home',emoji:'🏠',fund:7000,allow:350,momo:2500,agg:[7,18],story:'Your mum is a teacher and your dad works at the district assembly. They saved for years for your university fees. They will support you, but every cedi counts.'},
 poor:{name:'Struggling home',emoji:'🛖',fund:4800,allow:200,momo:1200,agg:[7,22],story:'Your mum sells tomatoes at the market and you have three younger siblings. The whole family contributed for your hostel. You will have to hustle, and you qualify for the student loan.'}};
/* hostels: prices per academic year (2 semesters), inspired by real rates around KNUST */
const HOSTEL_TPL={0:[{beds:4,price:3900},{beds:3,price:4700},{beds:3,price:5400,kitchen:true}],
  1:[{beds:2,price:5800},{beds:2,price:6300,large:true},{beds:2,price:6600,kitchen:true},{beds:1,price:6400},{beds:1,price:7400,kitchen:true}],
  2:[{beds:2,price:7900,ac:true},{beds:2,price:8800,ac:true,kitchen:true},{beds:1,price:10400,ac:true},{beds:1,price:11600,ac:true,kitchen:true},{beds:1,price:12600,ac:true,kitchen:true,large:true}],
  3:[{beds:2,price:12400,ac:true,tv:true,kitchen:true},{beds:1,price:17500,ac:true,tv:true,kitchen:true},{beds:1,price:20500,ac:true,tv:true,kitchen:true,large:true}]};
/* hostels and halls, spread over the towns around campus like at KNUST. [id, name, town, tier, price factor, blurb]
   Closer to lectures costs more; halls on campus are cheapest but basic. */
const HOSTELS=[
 ['sankofa','Sankofa Hall','On campus',0,.62,'A traditional hall on campus, next to the Parade Grounds. Basic and loud, the cheapest option, with hall week, a JCR and five minutes to lectures.'],
 ['volta','Volta Hall','On campus',0,.66,'A traditional hall on campus with a proud hall spirit. Shared bathrooms on each floor. Walk to lectures and the Commercial Area.'],
 ['lodge','Akwaaba Lodge','Ayeduase',0,1,'Budget, in busy Ayeduase just outside the Ayeduase Gate. Bunk beds and ceiling fans. Water sometimes goes off.'],
 ['grace','Grace Court','Ayeduase',1,1.02,'Mid-range in Ayeduase, a short walk to the Faculty Area. Generator, tiled bathrooms, street food at the gate.'],
 ['heights','Ayeduase Heights','Ayeduase',2,1,'Comfortable, AC and Wi-Fi, on the main Ayeduase road near the Faculty Area.'],
 ['execs','Executive Suites','Ayeduase',3,.95,'Premium apartments in Ayeduase: AC, smart TV, kitchenette, en-suite.'],
 ['newsite','New Site Residence','Ayeduase New Site',1,.92,'Ayeduase New Site: newer and cheaper, but a longer walk to campus.'],
 ['gaza','Gaza Annex','Gaza',0,.85,'Far out in Gaza, cheap and quiet. You will need the shuttle or an okada.'],
 ['sunrise','Sunrise Hostel','Kotei',1,1,'Mid-range in Kotei, surrounded by campus on three sides. Generator and tiled bathrooms.'],
 ['kotei','Kotei Court','Kotei',0,.94,'Budget in Kotei. Shared kitchen, lively compound, chop bars outside.'],
 ['peace','Peace Villa','Kotei',2,.96,'Comfortable in Kotei: AC, Wi-Fi and your own bathroom.'],
 ['boadi','Boadi Executive Hostel','Boadi',2,.9,'Comfortable and calm in Boadi, south of campus. Cheaper for the comfort, a longer trip in.'],
 ['gyin','Gyinyaase Gardens','Gyinyaase',1,.9,'Mid-range in Gyinyaase, south-west of campus near the Botanical Garden road.'],
 ['hilltop','Hilltop Hostel','Gyinyaase',0,.86,'Budget in Gyinyaase. Cheap, but you will walk or take the shuttle.'],
 ['bayview','Bay View Hostel','Bomso',2,1,'Comfortable in Bomso, across the Accra–Kumasi Road from the Commercial Area.'],
 ['morning','Morning Glory Hostel','Bomso',0,.96,'Budget in Bomso, close to Tech Junction and the Commercial Area.'],
 ['canaan','Canaan Lodge','Bomso',1,1,'Mid-range in Bomso. Ayigya market is a short walk away.'],
 ['ayigya','Ayigya Grace Hostel','Ayigya',0,.92,'Budget in Ayigya by the market. Busy, cheap food everywhere.'],
 ['nyamedua','Nyame Dua Hostel','Ayigya',1,.95,'Mid-range in Ayigya, across the highway from campus.'],
 ['kent','Kentinkrono Gardens','Kentinkrono',1,.9,'Mid-range in Kentinkrono, quiet and leafy, far from lectures.'],
 ['royal','Royal Crest Towers','Tech Junction',3,1,'Premium tower right at Tech Junction by the main gate: AC, smart TV, kitchenette, bathtub, free gym and pool.']
].map(([id,name,town,tier,f,blurb])=>({id,name,town,tier,blurb,rooms:HOSTEL_TPL[tier].map(r=>Object.assign({},r,{price:Math.round(r.price*f/50)*50}))}));
const HT=id=>{const h=HOSTELS.find(x=>x.id===id);return h?['lodge','sunrise','bayview','royal'][h.tier]:id};

const ROOMS={};HOSTELS.forEach(h=>h.rooms.forEach(r=>{r.id=h.id+r.beds+(r.kitchen?'k':'')+(r.large?'L':'');r.hostel=h.id;r.tier=h.tier;r.name=`${r.large?(r.beds===1?'Large single room':r.beds+' in a large room'):r.beds===1?'Single room':r.beds+' in a room'}${r.kitchen?' + kitchenette':''}`;
  r.W=+((r.beds>=4?6.9:r.beds===3?6.4:r.beds===2?5.8:5.1)+h.tier*.3+(r.kitchen?.5:0)+(r.large?1.2:0)).toFixed(2);r.D=+(4.9+h.tier*.2+(r.large?.7:0)+(r.beds>=3?.3:0)).toFixed(2);r.m2=Math.round(r.W*r.D*.92);ROOMS[r.id]=r}));
const SHOP=[
 {id:'fan',name:'Standing fan',price:180,desc:'Better sleep in the heat'},
 {id:'cooker',name:'Rice cooker',price:220,desc:'Cook jollof in your room (uses provisions)'},
 {id:'speaker',name:'Bluetooth speaker',price:150,desc:'Play music: fun, and your roommates like you more'},
 {id:'lamp',name:'Study lamp',price:90,desc:'+25% study at your desk'},
 {id:'poster',name:'Afrobeats poster',price:30,desc:'Makes the room feel like yours'},
 {id:'rug',name:'Kente-pattern rug',price:120,desc:'Cosy floor. A little fun every night'},
 {id:'plant',name:'Potted plant',price:60,desc:'Life in the room'},
 {id:'mirror',name:'Standing mirror',price:110,desc:'Look sharp before you leave'},
 {id:'led',name:'LED strip lights',price:140,desc:'Colour-changing glow along the ceiling. Vibes at night'},
 {id:'fairy',name:'Fairy lights',price:70,desc:'Warm little bulbs across the wall'},
 {id:'photos',name:'Framed photos',price:50,desc:'Memories on your wall'},
 {id:'clock',name:'Wall clock',price:45,desc:'Shows the real time. Never miss a lecture'},
 {id:'shelf',name:'Wall bookshelf',price:200,desc:'Read novels for fun, +10% study at your desk'},
 {id:'beanbag',name:'Beanbag',price:160,desc:'A comfy spot to chill or game'},
 {id:'fridge',name:'Mini fridge',price:380,desc:'Cold drinks any time'},
 {id:'console',name:'Game console',price:900,desc:'Play FIFA alone or with roommates and guests'},
 {id:'tv',name:'32" flat-screen TV',price:1200,desc:'Watch shows and movies, play FIFA on the big screen'},
 {id:'kettle',name:'Electric kettle',price:120,desc:'Tea, Milo and quick noodles any time'},
 {id:'microwave',name:'Microwave',price:520,desc:'Warm up leftovers and food from your cupboard'},
 {id:'laptop',name:'Laptop',price:3200,desc:'Do design gigs from your room (Phone → Hustles) and study online'},
 {id:'cupboard',name:'Kitchen cupboard',price:260,desc:'More space: stores up to 16 provision packs'},
 {id:'iron',name:'Pressing iron',price:90,desc:'Neat clothes: a little confidence boost before class'},
 {id:'dispenser',name:'Water dispenser',price:450,desc:'Cold and hot water. Refreshing on hot afternoons'}];
function photoTex(i){const c=document.createElement('canvas');c.width=64;c.height=80;const g=c.getContext('2d');const sky=[['#7fb8e0','#f6d9a8'],['#f0a070','#3a2a50'],['#9ad7a0','#e8f2d0']][i%3];const gr=g.createLinearGradient(0,0,0,80);gr.addColorStop(0,sky[0]);gr.addColorStop(1,sky[1]);g.fillStyle=gr;g.fillRect(0,0,64,80);
  const sk=['#5a3a25','#7a4e30','#3e2617','#8a5a3a'];for(let k=0;k<(i%3)+1;k++){const x=16+k*16+(i%2)*4;g.fillStyle=['#e8b24a','#2f6bb5','#d9542b','#4fb87a'][(k+i)%4];g.fillRect(x-7,46,14,34);g.fillStyle=sk[(k+i)%4];g.beginPath();g.arc(x,38,7,0,7);g.fill();g.fillStyle='#1a120c';g.beginPath();g.arc(x,34,7,Math.PI,0);g.fill()}
  g.strokeStyle='#fff';g.lineWidth=4;g.strokeRect(2,2,60,76);return new THREE.CanvasTexture(c)}
const DECO={wall:{cream:['Cream','#e9dcc3'],sky:['Sky blue','#bcd7ea'],mint:['Mint','#cfe6d3'],blush:['Blush pink','#f0cfd6'],gold:['Warm gold','#f0d79a'],grey:['Cool grey','#d4d6d9']},
  sheet:{gold:['Gold','#e8b24a'],blue:['Blue','#5aa9e6'],green:['Green','#4fb87a'],pink:['Pink','#e58fb0'],kente:['Kente','kente'],white:['White','#f4f1ea']},
  curtain:{none:['No curtains',null],maroon:['Maroon','#8e2a3a'],teal:['Teal','#2a7b7b'],ankara:['Ankara','ankara'],white:['White','#f1ece3']}};
const DECOPRICE={wall:80,sheet:45,curtain:60};
const MINPOCKET=600;
/* SRC Week at the Parade Grounds (sd = day of the semester) */
const EVENTS=[
 {sd:2,from:16,to:19,id:'fair',name:'Clubs & Societies Fair',emoji:'🎪'},
 {sd:3,from:19,to:23.5,id:'hallnite',name:'Hall Week Jams',emoji:'🎉'},
 {sd:5,from:6.5,to:9.5,id:'jama',name:'SRC Week Health Walk & Jama',emoji:'🥁'},
 {sd:6,from:14,to:18,id:'games',name:'Inter-Hostel Games',emoji:'🏆'},
 {sd:7,from:15,to:18,id:'hallfb',name:'Inter-Hall Football Final',emoji:'⚽'},
 {sd:8,from:15,to:21,id:'bazaar',name:'Food Bazaar & Mr & Miss Freshers',emoji:'🍢'},
 {sd:10,from:19,to:23.5,id:'concert',name:'SRC Week Grand Concert',emoji:'🎤'}];
/* fictional Ghanaian stars */
const ARTISTS={
 blaze:{name:'Ohene Blaze',style:'Afro-dancehall',look:{gender:'m',hair:'locs',outfit:'tee',pal:'white',extra:'chain',shoes:'sneakers',bag:'none',skin:'#4e2e1c'},
   scene:'The lights go out. A siren. Then Ohene Blaze runs onto the stage and the whole Parade Grounds jumps at once. He pulls a fresher up to dance, throws his towel into the crowd and closes with his biggest hit while fireworks burst over the stage.'},
 tundra:{name:'Yaw Tundra',style:'Kumasi drill',look:{gender:'m',hair:'twists',outfit:'hoodie',pal:'black',extra:'chain',shoes:'sneakers',bag:'none',skin:'#3b2216'},
   scene:'Yaw Tundra walks out slowly with his hood up and the bass shakes your chest. Every student knows every word. When he stops the beat, the crowd raps the whole verse back to him in Twi. Fireworks, smoke, chaos.'},
 abrewa:{name:'Lady Abrewa',style:'Afropop',look:{gender:'f',hair:'braids',outfit:'bodycon',pal:'pink',extra:'earrings',shoes:'sneakers',bag:'none',skin:'#6a3f26'},
   scene:'Lady Abrewa floats onto the stage with her dancers and the girls in front scream every lyric. She slows it down for a love song, phone lights fill the field, then she switches to her party anthem and the dust rises off the grounds.'},
 mantse:{name:'Kofi Mantse',style:'Hiplife legend',look:{gender:'m',hair:'fade',outfit:'smock',pal:'kente',extra:'specs',shoes:'shoes',bag:'none',skin:'#4e2e1c',grey:true},
   scene:'Kofi Mantse performs the hiplife classics your parents still play on Sundays, and somehow every student knows them. He calls the SRC president on stage to dance and the whole field loses it. Fireworks to close.'},
 akos:{name:'Akosua Vibez',style:'Amapiano & Afrobeats',look:{gender:'f',hair:'afro',outfit:'jeans',pal:'olive',extra:'earrings',shoes:'sneakers',bag:'none',skin:'#7f4d2e'},
   scene:'Akosua Vibez brings the log drums and the whole field starts to shuffle together. She brings a dance-off winner on stage and ends with the song everyone has on their status.'}};
const EXAMS=[[10,9,0],[11,9,1],[11,14,2]];
const LINEUPS=[['akos','tundra','blaze'],['abrewa','mantse','tundra'],['tundra','abrewa','mantse']];
/* foodstuff and recipes */
const ING={rice:{name:'Rice',price:15,n:2},tomato:{name:'Tomatoes, onion & pepper',price:10,n:1},chicken:{name:'Chicken',price:35,n:2},egg:{name:'Eggs',price:20,n:6},beans:{name:'Beans',price:12,n:2},
  plantain:{name:'Ripe plantain',price:10,n:2},yam:{name:'Yam',price:25,n:2},fish:{name:'Tilapia',price:30,n:1},noodles:{name:'Indomie',price:25,n:5},gari:{name:'Gari',price:10,n:4}};
const RECIPES=[
 {id:'jollof',name:'Jollof rice & chicken',need:{rice:1,tomato:1,chicken:1},mins:60,hunger:75,fun:12,pot:1},
 {id:'waakye',name:'Waakye & stew',need:{rice:1,beans:1,tomato:1},mins:70,hunger:72,fun:10,pot:1},
 {id:'fish',name:'Rice & tilapia stew',need:{rice:1,fish:1,tomato:1},mins:55,hunger:72,fun:10,pot:1},
 {id:'fried',name:'Egg fried rice',need:{rice:1,egg:2},mins:40,hunger:60,fun:6,pot:1},
 {id:'yam',name:'Boiled yam & tomato stew',need:{yam:1,tomato:1},mins:45,hunger:62,fun:5},
 {id:'plantain',name:'Fried plantain & eggs',need:{plantain:1,egg:2},mins:30,hunger:52,fun:8},
 {id:'indomie',name:'Indomie & egg',need:{noodles:1,egg:1},mins:15,hunger:42,fun:6,pot:1},
 {id:'gari',name:'Gari soakings',need:{gari:1},mins:5,hunger:25,fun:2,pot:1}];
/* business */
const BIZ={
 snacks:{name:'Sobolo & meat pies',unit:4,sell:{low:7,normal:9,high:12},setup:150,pack:30,label:'packs'},
 thrift:{name:'Thrift clothes (fose)',unit:25,sell:{low:40,normal:55,high:75},setup:300,pack:12,label:'items'},
 phone:{name:'Phone accessories',unit:30,sell:{low:45,normal:60,high:85},setup:400,pack:10,label:'items'},
 hair:{name:'Hair in your room',service:true,sell:{low:40,normal:60,high:90},setup:120,label:'clients'}};
const NPCS=[
 ['Kwabena','m','royal',['Tech','Gaming'],'funny'],['Adwoa','f','sunrise',['Church','Fashion'],'friendly'],
 ['Selorm','m','lodge',['Afrobeats','Dance'],'funny'],['Nana Yaa','f','royal',['Business','Fashion'],'serious'],
 ['Kojo','m','lodge',['Football','Business'],'friendly'],['Esi','f','sunrise',['Tech','Books'],'shy'],
 ['Yaw','m','sunrise',['Church','Football'],'shy'],['Akua','f','bayview',['Afrobeats','Dance'],'friendly'],
 ['Fiifi','m','lodge',['Gaming','Afrobeats'],'funny'],['Ewurabena','f','sunrise',['Books','Church'],'serious'],
 ['Mawuli','m','bayview',['Football','Fashion'],'friendly'],['Dzifa','f','lodge',['Dance','Fashion'],'funny'],
 ['Kwesi','m','royal',['Business','Tech'],'serious'],['Abena','f','lodge',['Gaming','Books'],'friendly'],
 ['Kofi','m','lodge',['Football','Gaming'],'friendly'],['Efua','f','bayview',['Church','Afrobeats'],'shy']];

const R=(a,b)=>a+Math.random()*(b-a);
const RI=(a,b)=>Math.floor(R(a,b+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const cedi=n=>'GH₵'+Math.round(n).toLocaleString('en-GB');
const $=id=>document.getElementById(id);
function randomLook(g){return{gender:g,skin:pick(SKINS),hair:pick(Object.keys(HAIR[g])),outfit:pick(Object.keys(OUTFIT[g])),pal:pick(Object.keys(PAL)),shoes:pick(Object.keys(SHOES)),extra:pick(Object.keys(EXTRA).filter(e=>g==='f'||e!=='earrings')),bag:pick(['backpack','backpack','tote','none']),beard:g==='m'?pick(['none','none','goatee','goatee','full']):'none'}}
