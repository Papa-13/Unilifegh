/* ================= friendship stages ================= */
const STG=[[0,'Stranger'],[15,'Acquaintance'],[30,'Friend'],[50,'Close friend'],[75,'Best friend']];
const stIdx=n=>STG.reduce((a,[v],i)=>n.friend>=v?i:a,0),stName=n=>STG[stIdx(n)][1];
function stageCheck(){S.npcs.forEach(n=>{const i=stIdx(n);if(n.stg===undefined)n.stg=i;if(i>n.stg&&n.met)toast(`${n.name} is now your ${STG[i][1].toLowerCase()} 🤝`);n.stg=i})}

/* ================= doing things with friends ================= */
const buddy=()=>S&&S.npcs.find(n=>n.with>S.min&&!n.hidden&&(IS||dist(n,P())<260))||null;
const BENCHES=[];
(function benches(){const mk=(x0,y0,ry,name,area)=>{const q=area?TA(area,x0,y0):{x:x0,y:y0},x=q.x,y=q.y;const g=new THREE.Group();g.position.set(wx(x),0,wz(y));g.rotation.y=ry;box(1.3,.07,.42,0x7a5a3a,0,.43,0,g);box(1.3,.38,.06,0x6b4a2e,0,.68,-.2,g);[-.55,.55].forEach(dx=>box(.06,.42,.38,0x444444,dx,.21,0,g));scene.add(g);
    const ax=Math.abs(Math.sin(ry))>.5;solidBox(x,y,ax?16:48,ax?48:16);BENCHES.push({x,y,ry,ly:-.15,ax,name})};
  mk(2100,700,-Math.PI/2,'Parade Grounds','parade');mk(2100,830,-Math.PI/2,'Parade Grounds','parade');mk(1985,1185,Math.PI,'Parade Grounds','parade');mk(1868,800,Math.PI/2,'Parade Grounds','parade');
  mk(1262,1222,Math.PI,'Campus Lake','lake');mk(1428,1222,Math.PI,'Campus Lake','lake');mk(1640,1222,Math.PI,'Basketball Court','court');
  [[470,1080],[690,1080],[470,1200],[690,1200]].forEach(([x,y])=>BENCHES.push(Object.assign(TA('square',x,y),{ry:0,ly:-.31,ax:false,name:'Akwaaba Square'})));
  BENCHES.push(Object.assign(TA('garden',150,420),{ry:0,ly:-.26,ax:false,name:'Botanical Garden'}));[[460,1322],[530,1322]].forEach(([x,y])=>BENCHES.push(Object.assign(TA('terminal',x,y),{ry:0,ly:-.12,ax:false,name:'Shuttle Terminal'})))})();
const benchSeats=b=>[{x:b.x-(b.ax?0:16),y:b.y-(b.ax?16:0),ry:b.ry,ly:b.ly},{x:b.x+(b.ax?0:16),y:b.y+(b.ax?16:0),ry:b.ry,ly:b.ly}];
const WALKS=[['lake','Campus Lake'],['parade','Parade Grounds'],['track','Sports Field track'],['garden','Botanical Garden']];
function pathPos(k,t){const th=t*Math.PI*2;return k==='track'?TA('field',1000+150*Math.cos(th),790+86*Math.sin(th)):k==='parade'?TA('parade',1980+120*Math.cos(th),760+160*Math.sin(th)):k==='pool'?TA('pool',1320+70*Math.cos(th*2),1375+30*Math.sin(th*2)):k==='garden'?TA('garden',190+80*Math.cos(th),470+64*Math.sin(th)):TA('lake',1340+125*Math.cos(th),1140+70*Math.sin(th))}
function placeSheet(title,items,fn){S.paused=true;openSheet();$('sheetIn').innerHTML=`<h3>${title}</h3><div class="list">${items.map((t,i)=>`<button class="ghost" data-pl="${i}" style="text-align:left">${esc(t)}</button>`).join('')}</div><button class="ghost sm" id="bye">Cancel</button>`;
  $('sheetIn').querySelectorAll('[data-pl]').forEach(b=>b.onclick=()=>{closeSheet();fn(+b.dataset.pl)});$('bye').onclick=closeSheet}
function travelTo(x,y){const p=P();if(IS)leaveRoom(true);const d=Math.hypot(x-p.x,y-p.y);if(d>150)advance(Math.round(Math.min(25,d/70)))}
function walkWith(n){placeSheet(`🚶 Walk with ${esc(n.name)}`,WALKS.map(w=>'Around the '+w[1]),i=>{const [k,nm]=WALKS[i],q=pathPos(k,0);travelTo(q.x,q.y);const p=P();p.x=q.x;p.y=q.y;n.with=Math.max(n.with,S.min+120);n.x=p.x+18;n.y=p.y+6;n.hidden=false;
  const lbl=`Walking with ${n.name} around the ${nm}`;startBusy(lbl,Object.assign({pose:'walk',path:k},{mins:45,fx:{social:18,fun:12,energy:-4}}),0,()=>{applyAct(lbl,45,{social:18,fun:12,energy:-4});togetherBonus(n,5);memTogether(n,nm)})})}
function sitWith(n){const names=[...new Set(BENCHES.map(b=>b.name))];placeSheet(`🪑 Sit somewhere with ${esc(n.name)}`,names,i=>{const p=P(),opts=BENCHES.filter(b=>b.name===names[i]).sort((a,c)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(c.x-p.x,c.y-p.y)),b=opts[0],[s1,s2]=benchSeats(b);
  travelTo(b.x,b.y);n.with=Math.max(n.with,S.min+120);P().x=s1.x;P().y=s1.y+20;n.x=s2.x;n.y=s2.y+20;n.hidden=false;const lbl=`Sitting with ${n.name} at the ${b.name}`;
  startBusy(lbl,Object.assign({pose:'sitTalk',spot:s1,buddySpot:s2},{mins:40,fx:{social:20,fun:10,energy:6}}),0,()=>{applyAct(lbl,40,{social:20,fun:10,energy:6});togetherBonus(n,5);memTogether(n,b.name);if(Math.random()<.5)setTimeout(()=>toast(`${n.name}: "${pick(['This place is so peaceful 😌','We should do this more often','Chale, tell me more gist 😂','I needed this break, honestly'])}"`),2600)})})}
function togetherBonus(n,f){const p=P(),k='tg'+n.id+day();S[k]=(S[k]||0)+1;if(S[k]<=4){n.friend=clamp(n.friend+f);n.met=true;if(p.partner===n||(n.romance>25&&n.chem>.5))n.romance=clamp(n.romance+3)}}
/* meetups arranged over the phone */
const MEETP=[['parade','Parade Grounds'],['night','Night Market'],['lib','University Library'],['canteen','Bush Canteen'],['lake','Campus Lake'],['square','Akwaaba Square'],['court','Basketball Court'],['field','Sports Field'],['mall','Campus Mall'],['pool','Swimming Pool'],['market','Campus Market'],['club','Club Vibes'],['arcade','Game Zone Arcade'],['resto','Akwaaba Grill']];
const OPENH={arcade:[9,24],resto:[11,22],market:[6,19],pool:[6,19],night:[18,25],club:[20,27],canteen:[7,20],lib:[7,22],mall:[9,21]};
function meetOk(b,at){let h=(at%1440)/60;const [o,c]=OPENH[b]||[7,23];if(c>24&&h<3)h+=24;return h>=o&&h<c}
function proposeMeet(chat,bi,at,tl){const n=S.npcs.find(x=>x.name===chat),p=P(),[b,nm]=MEETP[bi];
  S.msgs.unshift({from:'You',chat,text:`Let's meet at the ${nm} ${tl}? 📍`,at:S.min,mine:true,read:true});S.typing={chat};drawChat();
  setTimeout(()=>{S.typing=null;const m=S.msgs.find(x=>x.chat===chat&&x.mine);if(m)m.seen=true;
    const busy=(S.meets||[]).some(x=>x.n===n&&!x.done&&Math.abs(x.at-at)<120);
    if(!meetOk(b,at))msg(chat,`Ei, the ${nm} won't be open then 😅 Another time?`);
    else if(busy)msg(chat,'I already have plans with you around then 😂');
    else if((n.friend>=25||p.partner===n)&&Math.random()<.85+(n.friend-25)/200){(S.meets=S.meets||[]).push({n,b,at,nm});msg(chat,pick([`Okay! See you at the ${nm} ${tl} 👍`,`Deal! ${nm}, ${tl}. Don't be late o 😂`,`I'll be there 🙌`]));
      S.msgs.unshift({from:chat,chat,text:`📍 Meetup: ${nm} · ${DAYS[Math.floor(at/1440)%7]} ${hm(at)}`,at:S.min,sys:true,read:true});if(CHAT===chat)drawChat()}
    else msg(chat,pick(['I can\'t make it then 😩 Another time?','Hmm, I\'m busy then. Sorry!']))},R(1500,3000))}
function meetsCheck(){if(!S.meets)return;const p=P();S.meets.forEach(m=>{if(m.done)return;const n=m.n,b=BID[m.b];
  if(!m.going&&S.min>=m.at-40){m.going=true;n.with=0;n.lastPlan=-1;msg(n.name,pick([`On my way to the ${m.nm} 🏃🏾`,`Leaving now. See you at the ${m.nm}!`]))}
  if(m.going&&S.min<=m.at+90){const arrived=!n.path&&!n.needPath&&n.plan&&n.plan.meet===m,here=IS?(IS.kind==='bld'&&IS.bid===m.b):Math.hypot(p.x-n.x,p.y-n.y)<130;
    if(arrived&&here){m.done=true;n.with=S.min+120;n.friend=clamp(n.friend+5);n.met=true;p.needs.social=clamp(p.needs.social+10);if(IS)IS.buddy=n;toast(`🤝 You met up with ${n.name} at the ${m.nm}! They'll hang with you for a while.`)}}
  if(!m.done&&S.min>m.at+90){m.done=true;n.friend=clamp(n.friend-6);n.lastPlan=-1;msg(n.name,`I waited for you at the ${m.nm} for over an hour 😒`)}})}
function meetsHTML(){const up=(S.meets||[]).filter(m=>!m.done);return up.length?`<p><strong>📍 Meetups</strong></p><div class="list">${up.map(m=>`<div class="item"><div class="grow"><b>${esc(m.n.name)} · ${m.nm}</b><small>${DAYS[Math.floor(m.at/1440)%7]} ${hm(m.at)}</small></div></div>`).join('')}</div>`:''}
