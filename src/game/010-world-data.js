/* ================= world data ================= */
const MW=4000,MH=2800,U=0.028,MINPS=1,SPEEDS=[0,1,3,8];
const wx=x=>(x-MW/2)*U, wz=y=>(y-MH/2)*U;
const B=[
 /* FACULTY AREA (north) */
 {id:'coe',name:'CoE · Engineering',x:470,y:100,w:260,h:170,ht:3.4,c:0xd6d2c8,roof:0x8e2a3a,door:[600,288],zone:'f'},
 {id:'senate',name:'Senate & Registry',x:820,y:100,w:300,h:170,ht:3.6,c:0xe6dcc6,roof:0x2f4e6b,door:[970,288],zone:'f',deco:1},
 {id:'lib',name:'University Library',x:1220,y:100,w:280,h:170,ht:3.6,c:0xcfc3a5,roof:0x5b4636,door:[1360,288],zone:'f'},
 {id:'canr',name:'CANR · Agriculture',x:1700,y:100,w:240,h:170,ht:3,c:0xd8d0b4,roof:0x3c7a3a,door:[1820,288],zone:'f'},
 {id:'cos',name:'CoS · Science',x:2060,y:100,w:260,h:180,ht:3.8,c:0xd2dce2,roof:0x2a5f8b,door:[2190,298],zone:'f'},
 {id:'cohss',name:'CoHSS · Humanities',x:2680,y:100,w:240,h:180,ht:3.4,c:0xe2d8c8,roof:0x7a4a2a,door:[2800,298],zone:'f'},
 {id:'cabe',name:'CABE · Built Env.',x:3060,y:100,w:240,h:180,ht:3.4,c:0xd8d8d8,roof:0x4a4a6a,door:[3180,298],zone:'f'},
 {id:'garden',name:'Botanical Garden',x:470,y:540,w:260,h:200,open:1,c:0x4f8a3e,door:[600,640],zone:'f'},
 {id:'office',name:'Student Affairs & SRC',x:840,y:560,w:220,h:150,ht:2.4,c:0xe9e3d6,roof:0x3c6e58,door:[950,542],zone:'f'},
 {id:'canteen',name:'Bush Canteen',x:1180,y:560,w:180,h:150,ht:2.2,c:0xc9a27a,roof:0x7a5a2a,door:[1270,542],zone:'f'},
 {id:'print',name:'Print & Type',x:1700,y:560,w:160,h:150,ht:2.2,c:0xd8e1e6,roof:0x2a6f9b,door:[1780,542],zone:'f'},
 {id:'clinic',name:'Health Centre',x:1960,y:560,w:200,h:150,ht:2.6,c:0xf3f3f0,roof:0xb83a3a,door:[2060,542],zone:'f'},
 {id:'chs',name:'CHS · Health Sciences',x:2680,y:560,w:260,h:150,ht:3.2,c:0xeef0ee,roof:0x2a7b7b,door:[2810,542],zone:'f'},
 {id:'greathall',name:'Great Hall',x:3060,y:550,w:300,h:180,ht:4.2,c:0xe9dfc9,roof:0x8e2a3a,door:[3210,532],zone:'f',deco:1},
 /* CENTRAL PARK */
 {id:'lake',name:'Campus Lake',x:1930,y:1000,w:290,h:200,open:1,c:0x6f9a4c,door:[2070,1100],zone:'p'},
 {id:'parade',name:'Parade Grounds',x:1935,y:1290,w:280,h:870,open:1,c:0x6f9e4f,door:[2075,1520],zone:'p'},
 /* COMMERCIAL AREA (west) */
 {id:'taxi',name:'Taxi Station',x:60,y:1000,w:260,h:150,open:1,c:0x6d665e,door:[190,1075],zone:'c'},
 {id:'trotro',name:'Trotro Station',x:60,y:1300,w:260,h:170,open:1,c:0x7a7166,door:[190,1385],zone:'c'},
 {id:'terminal',name:'Shuttle Terminal',x:5,y:1660,w:320,h:150,open:1,c:0x8a8378,door:[165,1735],zone:'c'},
 {id:'mall',name:'Campus Mall',x:480,y:1000,w:260,h:155,ht:3.4,c:0xece4d8,roof:0x9b4a2e,door:[610,982],zone:'c'},
 {id:'unity',name:'Unity Bank',x:850,y:1000,w:260,h:170,ht:3.2,c:0xe8e4da,roof:0x1f4f8b,door:[980,982],zone:'c'},
 {id:'bank',name:'Akwaaba Savings Bank',x:1220,y:1000,w:250,h:150,ht:3,c:0xf2efe6,roof:0x2f6b3a,door:[1345,982],zone:'c'},
 {id:'salon',name:'Barber & Salon',x:480,y:1300,w:200,h:150,ht:2.4,c:0xf0d6e2,roof:0x9b3a6e,door:[580,1468],zone:'c'},
 {id:'phonehub',name:'Phone & Laptop Hub',x:780,y:1300,w:180,h:150,ht:2.4,c:0xdfe6ee,roof:0x2a2a2a,door:[870,1468],zone:'c',deco:1},
 {id:'pharm',name:'Campus Pharmacy',x:1060,y:1300,w:230,h:150,ht:2.4,c:0xf3f3f0,roof:0x2f8a4a,door:[1175,1468],zone:'c',deco:1},
 {id:'shawarma',name:'Shawarma & Pizza Spot',x:480,y:1660,w:260,h:150,ht:2.4,c:0xf0e2c8,roof:0xc2572e,door:[610,1642],zone:'c',deco:1},
 {id:'books',name:'Campus Bookshop',x:840,y:1660,w:280,h:150,ht:2.6,c:0xe6dcc8,roof:0x5b4636,door:[980,1642],zone:'c',deco:1},
 {id:'club',name:'Club Vibes',x:1220,y:1660,w:240,h:150,ht:3.4,c:0x221d2e,roof:0x7a2ea0,door:[1340,1642],zone:'c'},
 {id:'market',name:'Campus Market',x:480,y:1960,w:320,h:150,open:1,c:0x8a7458,door:[640,2050],zone:'c'},
 {id:'night',name:'Night Market',x:840,y:1950,w:320,h:200,open:1,c:0x6b5a46,door:[1000,2050],zone:'c'},
 {id:'square',name:'Akwaaba Square',x:1210,y:1950,w:320,h:200,open:1,c:0xbfae90,door:[1370,2050],zone:'c'},
 /* SPORTS COMPLEX (east) */
 {id:'field',name:'Sports Field',x:2700,y:1000,w:360,h:240,open:1,c:0x3f8a3a,door:[2880,1120],zone:'s'},
 {id:'pavilion',name:'Sports Pavilion',x:3140,y:1050,w:170,h:140,ht:2.6,c:0xe9e3d6,roof:0x8e2a3a,door:[3225,1208],zone:'s',deco:1},
 {id:'court',name:'Basketball Court',x:3420,y:1000,w:240,h:200,open:1,c:0xb5653a,door:[3540,1100],zone:'s'},
 {id:'pool',name:'Swimming Pool',x:2700,y:1420,w:240,h:150,open:1,c:0xd9d4c7,door:[2820,1428],zone:'s'},
 {id:'gym',name:'Campus Gym',x:3040,y:1420,w:240,h:170,ht:2.8,c:0x9aa3ab,roof:0x2b2b2b,door:[3160,1608],zone:'s'},
 {id:'hall',name:'Indoor Sports Hall',x:3400,y:1420,w:280,h:170,ht:4,c:0xc9d2d8,roof:0x2a6f9b,door:[3540,1608],zone:'s',deco:1},
 /* RESIDENTIAL AREA (south) */
 {id:'lodge',name:'Akwaaba Lodge',x:480,y:2460,w:260,h:170,ht:3.2,c:0xd9c9a8,roof:0x8a5a2a,door:[610,2442],home:1,zone:'r'},
 {id:'sunrise',name:'Sunrise Hostel',x:850,y:2460,w:300,h:170,ht:4,c:0xf0dcc4,roof:0xc2572e,door:[1000,2442],home:1,zone:'r'},
 {id:'royal',name:'Royal Crest Towers',x:1260,y:2460,w:240,h:170,ht:6.4,c:0x2f3640,roof:0xd9a537,door:[1380,2442],home:1,zone:'r'},
 {id:'bayview',name:'Bay View Hostel',x:1720,y:2460,w:320,h:180,ht:4.6,c:0xdfe9ee,roof:0x1f6f8b,door:[1880,2442],home:1,zone:'r'},
 {id:'chapel',name:'University Chapel',x:2160,y:2460,w:220,h:170,ht:4,c:0xf2efe8,roof:0x4a3a6a,door:[2270,2442],zone:'r'},
 {id:'heights',name:'Ayeduase Heights (private)',x:2700,y:2460,w:310,h:175,ht:5,c:0xe8d8c4,roof:0x6b4a2e,door:[2855,2442],home:1,zone:'r',deco:1},
 {id:'kotei',name:'Kotei Court (private)',x:3140,y:2460,w:300,h:175,ht:4.4,c:0xdfe2d8,roof:0x3c6e58,door:[3290,2442],home:1,zone:'r',deco:1}];
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
const SKINS=['#3b2216','#4e2e1c','#6a3f26','#7f4d2e','#946039'];
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
 batik:{name:'Blue batik',a:'#1f3b73',b:'#7fb0d8',pat:'batik'}};
const HAIR={m:{short:'Short',fade:'Low cut',waves:'360 waves',afro:'Afro',locs:'Locs',twists:'Twists',cornrows:'Cornrows',dyed:'Blonde low cut',frohawk:'Frohawk',burst:'Burst fade & sponge twists'},f:{braids:'Knotless braids',afro:'Afro',puffs:'Afro puffs',bun:'Bun',locs:'Locs',cornrows:'Cornrows',wig:'Straight wig',duku:'Headwrap',bantu:'Bantu knots',ponytail:'Sleek ponytail',bob:'Bob wig',lowcut:'Low cut',blonde:'Blonde wig'}};
const HAIRPRICE={short:20,fade:25,waves:30,afro:30,puffs:40,cornrows:90,locs:180,twists:120,braids:150,bun:40,wig:250,duku:30,dyed:60,frohawk:45,burst:70,bantu:80,ponytail:90,bob:200,lowcut:20,blonde:280};
const OUTFIT={m:{tee:'Oversized tee & cargos',hoodie:'Hoodie & joggers',polo:'Polo & chinos',shirt:'Shirt & jeans',jacket:'Denim jacket & jeans',varsity:'Varsity jacket',track:'Tracksuit',kaftan:'Kaftan set',jersey:'Jersey & shorts',smock:'Fugu smock',unitee:'AKWAABA U campus tee'},
  f:{jeans:'Crop top & jeans',hoodie:'Hoodie & leggings',bodycon:'Bodycon dress',tank:'Tank top & cargos',skirt:'Tee & mini skirt',twopiece:'Print two-piece',jumpsuit:'Jumpsuit',blazer:'Blazer suit',athleisure:'Athleisure set',kente:'Kente maxi dress',kaba:'Ankara two-piece',dress:'Sundress',unitee:'AKWAABA U campus tee'}};
const SHOES={sneakers:'Sneakers',sandals:'Sandals',slides:'Slides',shoes:'Leather shoes'};
const EXTRA={none:'Nothing',specs:'Glasses',headphones:'Headphones',cap:'Cap',chain:'Chain',earrings:'Earrings'};
const BAGS={backpack:'Backpack',tote:'Tote bag',none:'No bag'};
/* family background */
const BG={
 rich:{name:'Wealthy home',emoji:'🏡',fund:20000,allow:800,momo:8000,agg:[6,13],story:'Your dad runs a construction company in East Legon and your mum is a pharmacist. You went to a top boarding school. Money is not the problem. Making real friends might be.'},
 avg:{name:'Average home',emoji:'🏠',fund:7000,allow:350,momo:2500,agg:[7,18],story:'Your mum is a teacher and your dad works at the district assembly. They saved for years for your university fees. They will support you, but every cedi counts.'},
 poor:{name:'Struggling home',emoji:'🛖',fund:4800,allow:200,momo:1200,agg:[7,22],story:'Your mum sells tomatoes at the market and you have three younger siblings. The whole family contributed for your hostel. You will have to hustle, and you qualify for the student loan.'}};
/* hostels: prices per academic year (2 semesters), inspired by real rates around KNUST */
const HOSTELS=[
 {id:'lodge',name:'Akwaaba Lodge',tier:0,blurb:'Budget. Bunk beds, ceiling fans and a bathroom in every room. Most rooms use the shared kitchen; the 3-in-a-room with a kitchenette costs a bit more. Water sometimes goes off.',rooms:[{beds:4,price:3900},{beds:3,price:4700},{beds:3,price:5400,kitchen:true}]},
 {id:'sunrise',name:'Sunrise Hostel',tier:1,blurb:'Mid-range. Wooden beds, wardrobes, generator and a tiled bathroom in every room. Choose the shared kitchen, or pay a little more for your own kitchenette. The large 2-in-a-room has extra floor space.',rooms:[{beds:2,price:5800},{beds:2,price:6300,large:true},{beds:2,price:6600,kitchen:true},{beds:1,price:6400},{beds:1,price:7400,kitchen:true}]},
 {id:'bayview',name:'Bay View Hostel',tier:2,blurb:'Comfortable. Air conditioning, Wi-Fi and your own bathroom. Rooms with a kitchenette cost a bit more than those that share the hostel kitchen.',rooms:[{beds:2,price:7900,ac:true},{beds:2,price:8800,ac:true,kitchen:true},{beds:1,price:10400,ac:true},{beds:1,price:11600,ac:true,kitchen:true},{beds:1,price:12600,ac:true,kitchen:true,large:true}]},
 {id:'royal',name:'Royal Crest Towers',tier:3,blurb:'Premium. AC, smart TV, kitchenette, en-suite with a bathtub, free gym and pool.',rooms:[{beds:2,price:12400,ac:true,tv:true,kitchen:true},{beds:1,price:17500,ac:true,tv:true,kitchen:true},{beds:1,price:20500,ac:true,tv:true,kitchen:true,large:true}]}];
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
function randomLook(g){return{gender:g,skin:pick(SKINS),hair:pick(Object.keys(HAIR[g])),outfit:pick(Object.keys(OUTFIT[g])),pal:pick(Object.keys(PAL)),shoes:pick(Object.keys(SHOES)),extra:pick(Object.keys(EXTRA).filter(e=>g==='f'||e!=='earrings')),bag:pick(['backpack','backpack','tote','none'])}}
