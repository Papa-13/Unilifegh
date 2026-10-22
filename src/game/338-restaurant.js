/* ================= Akwaaba Grill: a real restaurant =================
   Inside: get a table and order from the menu (main + drink + dessert), the waitress brings it and
   the plate appears on your table while you eat. Takeaway for a quick bite. And date night: have a
   dinner date with whoever you came with, or text someone to join you. */
const RESTO_MENU={mains:[['🍛','Jollof & grilled chicken',80,70],['🐟','Banku & grilled tilapia',95,75],['🍲','Fufu & light soup with goat',75,78],['🍚','Fried rice & chicken',85,70],['🫘','Red-red & fried plantain',50,60],['🥗','Grilled chicken salad',65,50]],
  drinks:[['🥤','Sobolo',15],['🍹','Asaana',15],['🥭','Fresh mango juice',20],['🥤','Coke',12],['💧','Water',5]],
  sweets:[['🍨','Ice cream',25],['🍩','Bofrot (3)',12],['🥞','Pancakes & honey',30]]};
function restoOpen(){const h=hour();return h>=11&&h<22}
/* a plate of food on the table you're sitting at */
function restoPlate(on){if(!IS||IS.bid!=='resto')return;if(IS._plate){IS.scene.remove(IS._plate);IS._plate=null}if(!on)return;const sp=IS.spots.seat;if(!sp)return;
  const g=new THREE.Group(),tx=sp.x+(sp.ry>0?.75:-.75)*.62,tz=sp.z;mesh(cyl(.17,.15,.02,18),lam(0xffffff),0,0,0,g);mesh(sph(.09,10,6),lam(0xe0602a),0,.04,0,g).scale.set(1,.45,1);mesh(sph(.05,8,5),lam(0x8a5a2b),.06,.05,.04,g);
  mesh(cyl(.035,.03,.12,10),lam(0x9b2a3a),.2,.06,-.1,g);g.position.set(tx,.79,tz);IS.scene.add(g);IS._plate=g}
function restoOrder(guest){const p=P(),sel={m:0,d:0,s:-1},two=!!guest;openSheet();
  const total=()=>{const M=RESTO_MENU,m=M.mains[sel.m][2],d=M.drinks[sel.d][2],s=sel.s>=0?M.sweets[sel.s][2]:0;return (m+d+s)*(two?2:1)};
  const row=(k,list,cur,opt)=>list.map((x,i)=>`<button class="chip${cur===i?' on':''}" data-k="${k}" data-i="${i}">${x[0]} ${x[1]} · ${cedi(x[2])}</button>`).join('')+(opt?`<button class="chip${cur<0?' on':''}" data-k="${k}" data-i="-1">No thanks</button>`:'');
  const draw=()=>{$('sheetIn').innerHTML=`<div class="eyebrow">🍽️ Akwaaba Grill${two?` · dinner with ${esc(guest.name.split(' ')[0])}`:''}</div><h3>Waitress Efua: "What can I get you?"</h3>
    <p style="font-size:13px;opacity:.8">${two?'Two of everything you pick, one for each of you.':'Pick a main, a drink and maybe something sweet.'}</p>
    <b style="font-size:13px">Main</b><div class="chips">${row('m',RESTO_MENU.mains,sel.m)}</div><b style="font-size:13px">Drink</b><div class="chips">${row('d',RESTO_MENU.drinks,sel.d)}</div><b style="font-size:13px">Dessert</b><div class="chips">${row('s',RESTO_MENU.sweets,sel.s,true)}</div>
    <div class="row" style="justify-content:space-between;align-items:center;margin-top:10px"><b>Total ${cedi(total())}</b><small>MoMo ${cedi(p.money)}</small></div>
    <button class="btn" id="roGo" style="width:100%;margin-top:8px">Order</button>`;
    $('sheetIn').querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{sel[b.dataset.k]=+b.dataset.i;draw()});
    $('roGo').onclick=()=>{const t=total();if(p.money<t)return toast(`That's ${cedi(t)}. Not enough on MoMo.`);p.money-=t;closeSheet();hud();const M=RESTO_MENU,m=M.mains[sel.m],dr=M.drinks[sel.d],sw=sel.s>=0?M.sweets[sel.s]:null;
      toast(`Efua: "Coming right up!" 📝`);setTimeout(()=>{restoPlate(true);toast(`Your ${m[1].toLowerCase()} is here. Enjoy! 😋`)},2100);
      if(two&&!romOK(guest))setTimeout(()=>{guest.friend=clamp(guest.friend+8);doAct(`Eating ${m[1].toLowerCase()} with ${guest.name.split(' ')[0]}`,45,{hunger:m[3],fun:14,social:18});toast(`${guest.name.split(' ')[0]} is gisting you about everything 😂`)},1500);
      else if(two)setTimeout(()=>restoDate(guest,{m,dr,sw,t}),1500);else setTimeout(()=>doAct(`Eating ${m[1].toLowerCase()} at Akwaaba Grill`,sw?40:30,{hunger:m[3]+(sw?10:0),fun:sw?12:8,social:3}),1500)}};draw()}
/* dinner date at the table: a few moments to choose, then the bill */
function restoDate(n,o){const p=P(),fn=n.name.split(' ')[0];n.with=Math.max(n.with||0,S.min+120);if(IS)IS.buddy=n;
  const moments=[[`${fn} tastes your ${o.m[1].toLowerCase()} and closes ${n.gender==='f'?'her':'his'} eyes. "Okay, you chose well." 😋`,[['😏 "I always choose well."',4],['😂 Steal some of theirs too',5],['🥺 "Only the best for you"',6]]],
    [`The highlife band starts playing softly. ${fn} catches you looking and smiles.`,[['💬 Ask about their dreams',6],['😂 Tell your funniest story',5],['📱 Check your phone',-6]]],
    [`${fn}: "So… what are we doing? Like, you and me?"`,[['❤️ "I really like you."',8],['😅 "Let\'s see where it goes"',3],['🤐 Change the subject',-3]]]];
  let i=0,gain=0;const next=()=>{if(i>=moments.length)return bill();const [txt,opts]=moments[i++];story(`<div class="eyebrow">🕯️ Dinner date · Akwaaba Grill</div><h3>You and ${esc(n.name)}</h3><p class="scene">${txt}</p>`,opts.map(([l,g])=>[l,g>5?'g':'',()=>{gain+=g;n.romance=clamp(n.romance+g);next()}]))};
  const bill=()=>{const share=Math.round(o.t/2);story(`<div class="eyebrow">🧾 The bill</div><h3>${cedi(o.t)}</h3><p class="scene">Efua puts the bill on the table between you. ${fn} looks at it, then at you.</p>`,
      [[`💳 "I've got this" (paid)`,'g',()=>finish(10,'You already paid. '+fn+' is impressed. 🥰')],[`🤝 Split it (${fn} sends you ${cedi(share)})`,'',()=>{p.money+=share;hud();finish(3,`${fn} sends you ${cedi(share)} on MoMo. Fair is fair.`)}]])};
  const finish=(g2,line)=>{n.romance=clamp(n.romance+g2);n.friend=clamp(n.friend+6);n.dates=(n.dates||0)+1;const tot=gain+g2+Math.round((n.chem||.5)*10);
    p.needs.hunger=clamp(p.needs.hunger+o.m[3]);p.needs.fun=clamp(p.needs.fun+28);p.needs.social=clamp(p.needs.social+28);addBuff('loved');advance(90);restoPlate(false);try{memAdd('date',[n],'Akwaaba Grill','us');ev('date',{n:n.id,where:'resto'})}catch(e){}
    story(`<div class="eyebrow">🕯️ Dinner date</div><h3>What a night</h3><p class="scene">${line}</p><p>Romance +${tot}</p>`,[['Lovely ❤️','g',()=>{}]]);hud()};
  doAct(`Eating dinner with ${fn}`,60,{});setTimeout(()=>{restoPlate(true);next()},900)}
function restoInvite(){const list=S.npcs.filter(n=>n.contact&&((romOK(n)&&n.romance>=15)||n.friend>=35)).sort((a,b)=>(b.romance||0)-(a.romance||0)).slice(0,8);
  if(!list.length)return toast('No one in your contacts close enough to invite to dinner yet.');
  placeSheet('📲 Who do you want to invite to dinner?',list.map(n=>`${n.name}${n.romance>=40?' ❤️':''}`),i=>{const n=list[i],ok=Math.random()<.35+(n.romance||0)/150+(n.friend||0)/250;
    toast(`📲 You text ${n.name.split(' ')[0]}: "I'm at Akwaaba Grill. Join me? 🍽️"`);setTimeout(()=>{if(ok){toast(`${n.name.split(' ')[0]}: "Omw! 🏃" … 15 minutes later they walk in 😍`);advance(15);restoOrder(n)}else toast(`${n.name.split(' ')[0]}: "Aww, I can't right now 😩 Next time!"`)},1600)})}
{const _pa=placeActions;placeActions=function(b,inside){const a=_pa.apply(this,arguments);try{if(b&&b.id==='resto'&&inside){const add=[];
  if(!restoOpen())add.push(['🍽️ Closed · open 11:00 to 22:00',null]);else{const bd=buddy()||(IS&&IS.buddy);
    if(bd)add.push(romOK(bd)?[`🕯️ Dinner date with ${bd.name.split(' ')[0]}`,()=>restoOrder(bd),null,'b']:[`🍽️ Eat together with ${bd.name.split(' ')[0]}`,()=>restoOrder(bd),null,'b']);
    add.push(['🍽️ Get a table and order',()=>restoOrder(null),null,bd?undefined:'b'],['🥡 Takeaway: jollof & chicken · GH₵70',()=>eat(70,65,'takeaway jollof',6)],['📲 Text someone to join you for dinner',()=>restoInvite()],['🥤 Just a drink at the bar · GH₵15',()=>eat(15,8,'a cold sobolo at the bar',6)])}
  a.unshift(...add)}}catch(e){}return a}}
{const _lr=leaveRoom;leaveRoom=function(){try{if(IS&&IS._plate){IS._plate=null}}catch(e){}return _lr.apply(this,arguments)}}
