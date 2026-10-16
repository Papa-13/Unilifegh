/* ================= visiting real friends in their rooms =================
   Ask a real student if you can come to their room (or they invite you). Once they say yes,
   go to their hostel and walk in: you get their real room (type, colours) and you both see each
   other inside, because you're both "in" the same room key. Permission lasts 3 hours of real time.
   Live answers travel as 'vis' messages; invites to offline friends go in the mailbox as 'vo'. */
const VISIT_MS=3*3600*1000;
const visMap=()=>MP.visitOK||(MP.visitOK={});
const myRoomCard=()=>{const p=P();return JSON.stringify({h:p.home,r:p.room,n:MP.rn||1,d:p.deco||{}})};
function visParse(ck,nm,json,t){try{const o=JSON.parse(json);if(!BID[o.h]||!ROOMS[o.r])return null;
  const d=o.d||{},deco={wall:DECO.wall[d.wall]?d.wall:'cream',sheet:DECO.sheet&&DECO.sheet[d.sheet]?d.sheet:'blue',curtain:DECO.curtain&&DECO.curtain[d.curtain]?d.curtain:'none'};
  return visMap()[ck]={nm:mpClean(nm,16),home:o.h,room:o.r,rn:Math.max(1,Math.min(99,+o.n||1)),deco,until:(t||Date.now())+VISIT_MS}}catch(e){return null}}
/* is there a yes (live, or an invite in the mailbox) that's still good? */
function visitOKFor(ck){const v=visMap()[ck];if(v&&v.until>Date.now())return v;
  const mi=MP.mailIn&&MP.mailIn[ck];if(mi&&Array.isArray(mi.ms)){const vo=mi.ms.filter(m=>m.k==='vo'&&Date.now()-m.t<VISIT_MS).pop();if(vo)return visParse(ck,mi.nm,vo.tx,vo.t)}return null}
function visitList(){const out=[];for(const ck of new Set([...Object.keys(visMap()),...Object.keys(MP.mailIn||{})])){const v=visitOKFor(ck);if(v)out.push([ck,v])}return out}

/* ask (live, they must be online) */
function visitAsk(rp){const ck=mpKey(rp);if(visitOKFor(ck))return visitGo(ck);mpSend(ck,'vis','req');mpSys(ck,'You asked to visit their room 🏠');toast(`🏠 You asked ${rp.nm} if you can come to their room…`)}
function visIn(rp,ck,tx){const a=String(tx),cmd=a.split('|')[0];
  if(cmd==='req'){if(!S||$('game').hidden)return;mpPing();
    story(`<div class="eyebrow">🏠 Visit request</div><h3>${esc(rp.nm)} wants to come to your room</h3><p class="scene">You're in ${esc(roomOf().name)} at ${esc(homeB().name)}. If you say yes, ${esc(rp.nm)} can walk into your room for the next 3 hours.</p>`,
      [['Yes, come over','g',()=>{mpSend(ck,'vis','ok|'+myRoomCard());mpSys(ck,'You said they can visit your room 🏠');toast(`🏠 ${rp.nm} can come to your room now`)}],['Not now','',()=>mpSend(ck,'vis','no')]]);return}
  if(cmd==='ok'){const v=visParse(ck,rp.nm,a.slice(3));if(!v)return;mpPing();mpSys(ck,'They said you can come to their room 🏠');
    story(`<div class="eyebrow">🏠 ${esc(rp.nm)} said yes!</div><h3>Go to ${esc(rp.nm)}'s room</h3><p class="scene">${esc(rp.nm)} lives at ${esc(BID[v.home].name)}. Walk there and go in.</p>`,[['🚶 Walk there now','g',()=>visitGo(ck)],['Later','',()=>{}]]);return}
  if(cmd==='no'){toast(`🏠 ${rp.nm} said not right now.`);mpSys(ck,'They said not now');return}}
/* walk to their hostel, or walk in if you're already there */
function visitGo(ck){const v=visitOKFor(ck);if(!v)return toast('That invite has expired. Ask again.');const b=BID[v.home],p=P();
  if(!IS&&Math.hypot(b.door[0]-p.x,b.door[1]-p.y)<150)return visitEnter(ck);
  if(IS)leaveRoom(true);walkTo(b);S.goVisit=ck;toast(`🚶 Walking to ${b.name}. Go to ${v.nm}'s room when you arrive.`)}
function visitEnter(ck){const v=visitOKFor(ck);if(!v)return toast('That invite has expired. Ask again.');S.goVisit=null;
  enterRoom({real:true,ck,name:v.nm,home:v.home,room:v.room,rn:v.rn,deco:v.deco})}
/* real owner's room key, the same one they broadcast when they're inside */
const realRoomKey=o=>`r:${o.room}:${o.rn}`;
