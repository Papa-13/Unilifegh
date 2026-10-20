/* ================= state ================= */
let S=null,last=0,keys={},zoom=1,IS=null,PRE=null;
const P=()=>S.p;
const day=()=>Math.floor(S.min/1440),hour=()=>(S.min%1440)/60,wd=()=>day()%7,week=()=>Math.floor(day()/7)+1;
const hm=m=>{const h=Math.floor((m%1440)/60),mi=Math.floor(m%60);return `${String(h).padStart(2,'0')}:${String(mi).padStart(2,'0')}`};
const courseName=i=>P().courses[i];
const lecturerOf=i=>i===1?BADLEC:GOODLEC;
let myLook=Object.assign(randomLook('f'),{name:'',interests:['Afrobeats','Tech']});
try{const s=JSON.parse(localStorage.getItem('freshers-look')||'null');if(s&&s.gender&&s.bag)myLook=Object.assign(myLook,s)}catch(e){}
const roomOf=()=>ROOMS[P().room];
const homeB=()=>BID[P().home];
const roomMult=()=>({4:.62,3:.75,2:.88,1:1}[roomOf().beds])*(roomOf().ac?1.06:1)*(1+roomOf().tier*.02)*((S&&S.p&&(S.p.mess||0)>60)?.9:1);
const forecast=()=>Math.round(36+30*Math.min(1,P().study/150)+16*(P().att.reduce((a,b)=>a+b,0)/Math.max(1,heldSoFar())));
const friendsN=()=>S.npcs.filter(n=>n.met&&n.friend>=30).length+(NOBOTS?Object.keys(MP.friends).filter(k=>!MP.blocked[k]).length:0);

let NOBOTS=false;
function newGame(){
  if(IS)leaveRoom(true);
  if(S){S.npcs.forEach(n=>{scene.remove(n.mesh);disposeTree(n.mesh)});S.lecs.forEach(l=>{scene.remove(l.mesh);disposeTree(l.mesh)});if(S.p.mesh.parent)S.p.mesh.parent.remove(S.p.mesh);disposeTree(S.p.mesh)}
  const name=(myLook.name||'').trim().slice(0,14)||'You',pre=PRE,bg=BG[pre.bg],rt=ROOMS[pre.room];
  const ph=makeHuman(myLook,{label:name==='You'?'You':name,labelColor:'#e8b24a',ring:true});scene.add(ph.g);
  const d=BID[rt.hostel].door;
  const p={name,look:Object.assign({},myLook),bg:pre.bg,agg:pre.agg,prog:pre.prog,col:pre.col,feePaying:pre.feePaying,courses:coursesFor(pre.prog,pre.col),interests:myLook.interests.slice(0,2),
    home:rt.hostel,room:rt.id,x:d[0],y:d[1]+24*outDir(BID[rt.hostel]),ix:0,iz:0,mesh:ph.g,legs:ph.legs,knees:ph.knees,arms:ph.arms,elbows:ph.elbows,head:ph.head,lids:ph.lids,torso:ph.torso,phase:0,
    needs:{hunger:80,energy:90,social:55,fun:65,hygiene:85},money:bg.momo+Math.max(0,bg.fund-rt.price)-Math.max(0,rt.price-bg.fund)-(pre.feePaying?3500:0),study:0,att:[0,0,0],exams:{},printed:-1,job:null,partner:null,target:null,
    items:[],prov:pre.bg==='poor'?10:4,pantry:{rice:2,tomato:1,egg:pre.bg==='rich'?0:6,gari:pre.bg==='poor'?4:0,noodles:pre.bg==='poor'?0:5},food:[],wardrobe:[{outfit:myLook.outfit,pal:myLook.pal}],fit:0,deco:{wall:'cream',sheet:'gold',curtain:'none'},
    biz:null,flyers:0,posters:0,debts:[],requests:[],loanTaken:false,bursary:false,office:null,race:null};
  if(pre.bg==='rich'){p.items.push('speaker','mirror')}
  const npcs=NOBOTS?[]:NPCS.map(([n,g,home,ints,pers],i)=>{const look=randomLook(g);const pg=pick(ALLPROGS);
    const h=makeHuman(look,{label:n});scene.add(h.g);const dd=BID[home].door;
    return{id:i,name:n,gender:g,prog:pg.name,col:pg.col,home,origHome:home,ints,pers,look,wealth:HT(home)==='royal'?'rich':HT(home)==='lodge'?pick(['poor','avg']):pick(['avg','avg','rich']),reliable:Math.random()<.7,
      x:dd[0]+R(-40,40),y:dd[1]+R(4,30)*outDir(BID[home]),tx:0,ty:0,mesh:h.g,legs:h.legs,knees:h.knees,arms:h.arms,elbows:h.elbows,head:h.head,lids:h.lids,torso:h.torso,phase:Math.random()*6,
      friend:0,romance:0,met:false,talks:0,dates:0,contact:false,chem:R(0,1),plan:null,lastPlan:-1,with:0,mate:false,bed:-1,customer:false}});
  // two coursemates share your programme
  shuffle(npcs).slice(0,3).forEach(n=>{n.prog=p.prog;n.col=p.col});
  const lecs=[['Prof. Adjoa Sarpong','f'],['Dr. Ofori-Kuma','m']].map(([n,g])=>{const look=Object.assign(randomLook(g),{outfit:g==='f'?'kaba':'shirt',pal:g==='f'?'kente':'white',hair:g==='f'?'duku':'fade',extra:'specs',bag:'none',shoes:'shoes',grey:true});
    const h=makeHuman(look,{label:n,labelColor:'#cfe3ff'});scene.add(h.g);return{name:n,look,mesh:h.g,legs:h.legs,knees:h.knees,arms:h.arms,elbows:h.elbows,head:h.head,lids:h.lids,torso:h.torso,phase:0,x:BID[pre.col].door[0]+(g==='f'?-30:30),y:BID[pre.col].door[1]+18}});
  S={min:7*60,p,npcs,lecs,mates:[],msgs:[],unread:0,paused:false,flags:{hx:0,evidence:false,reported:false,resolved:false},semesterDone:false,semStart:0,semEnd:SEM_DAYS,sem:1,lastHour:-1,speed:1,gems:5,whims:[],tasksDone:0,wins:0,freeWill:true,miles:{},alerts:{}};
  ensureAcad();assignMates();
  const bgx=BG[p.bg];
  msg(p.bg==='rich'?'Dad':'Mum',p.bg==='rich'?`Settled in? I paid your hostel. Your allowance is ${cedi(bgx.allow)} every two weeks. Focus on your books, and call your mother.`:p.bg==='avg'?`Akwaaba to university, my dear! We paid what we could for the hostel. ${cedi(bgx.allow)} every two weeks. Budget it well. Eat well and don't follow bad friends. ❤️`:`My child, the whole family contributed for your hostel. I'll send ${cedi(bgx.allow)} when I can. Make us proud. God is with you. 🙏`);
  msg('Admissions Office',`Congratulations! You have been admitted to read ${p.prog} (${COLLEGES[p.col].short})${p.feePaying?' as a fee-paying student':''}.`);
  msg('Class rep',`${p.prog} L100 · Semester 1: first lecture is ${courseName(0)}, today 08:00 in our college building, ${BID[p.col].name}. Don't be late o.`);
  msg('SRC','Freshers! Course rep, college and SRC elections are this semester. Nominations are open at Student Affairs & SRC. 🗳️');
  if(S.mates.length)msg(S.mates[0].name,`Hey roomie! I'm ${S.mates[0].name}. I took the bed by the window, hope that's okay 😅`);
}
function assignMates(){const p=P(),rt=roomOf();
  S.mates.forEach(n=>{n.mate=false;n.home=n.origHome;n.bed=-1});
  const pool=S.npcs.filter(n=>n.gender===p.look.gender);
  const mates=shuffle(pool).slice(0,rt.beds-1);
  mates.forEach((n,i)=>{n.home=p.home;n.mate=true;n.met=true;n.friend=Math.max(n.friend,15);n.bed=i+1;const dd=BID[p.home].door;n.x=dd[0]+R(-40,40);n.y=dd[1]+R(4,30)*outDir(BID[p.home])});S.mates=mates}
function msg(from,text,vn){const open=CHAT===from&&!$('sheet').hidden;S.msgs.unshift({from,chat:from,text,at:S.min,vn,read:open});if(open){drawChat();return}S.unread=unreadN();toast(`📱 ${from}: ${vn?'🎤 Voice note':text.length>60?text.slice(0,58)+'…':text}`)}
const unreadN=()=>S.msgs.filter(m=>!m.read&&!m.mine).length;
