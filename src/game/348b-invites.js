/* ================= inviting someone over, properly =================
   You text them (it shows in your chat), they answer for sure (yes or no, never lost), and if they're coming
   an "on the way" bar shows who's coming and how many minutes are left, with a heads-up when they're close.
   When they get there: knock knock, you let them in (or not), and they walk in through your door.
   The arrival time is saved, so it still happens after you reload. */
function invNote(n,text){S.msgs.unshift({from:n.name,chat:n.name,text,at:S.min,read:CHAT===n.name&&!$('sheet').hidden});S.unread=unreadN();if(CHAT===n.name&&!$('sheet').hidden)drawChat();toast(`📱 ${n.name.split(' ')[0]}: ${text}`);try{hud()}catch(e){}}
inviteOver=function(n){const p=P(),h=hour(),late=h>=22||h<7,fn=n.name.split(' ')[0],where=homeB().name;
  S.msgs.unshift({from:'You',chat:n.name,text:`Come to my room, let's hang out! 🏠 I'm at ${where}`,at:S.min,mine:true,read:true});toast(`📱 Invite sent to ${fn}…`);
  const yes=Math.random()<(late?(p.partner===n?.75:.1):.35+n.friend/110+(p.partner===n?.35:0)),busy=n.plan&&n.plan.sleep;
  setTimeout(()=>{if(!yes||busy){invNote(n,busy?'Sorry, I was sleeping 😴 Tomorrow?':pick(['Ah, not today o. Next time! 🙏','I\'m in the library now, sorry 😩','Chale, I\'m tired. Tomorrow?','I have a group meeting now 😩 Another time!']));return}
    const eta=RI(10,25);invNote(n,pick([`Okay! I'm coming. Give me ${eta} minutes 🚶🏾`,`On my way! ${eta} mins 😄`,`Yes! Coming in ${eta} 👍`]));
    S.guestId=n.id;S.guestHere=false;S.guestEta=S.min+eta;S.guestNear=0;S.guestUntil=S.min+eta+180;guestBar()},1400)};
/* the "on the way" bar */
{const st=document.createElement('style');st.textContent='#guestBar{position:fixed;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 112px);z-index:31;background:rgba(14,18,24,.9);color:#fff;border-radius:999px;padding:7px 14px;font:600 13px system-ui;box-shadow:0 4px 14px rgba(0,0,0,.35);white-space:nowrap;pointer-events:none}body:not(.playing) #guestBar{display:none!important}';document.head.appendChild(st)}
function guestBar(){let el=$('guestBar');const n=S&&S.guestId!=null&&!S.guestHere&&S.guestEta?npcById(S.guestId):null;if(!n){if(el)el.hidden=true;return}
  if(!el){el=document.createElement('div');el.id='guestBar';document.body.appendChild(el)}const left=Math.max(0,Math.ceil(S.guestEta-S.min));
  el.textContent=`🚶 ${n.name.split(' ')[0]} is on the way · ${left<=1?'almost there':left+' min'}`;el.hidden=false}
function guestKnock(n){S.guestEta=0;try{arcThud(.5);setTimeout(()=>arcThud(.5),180);setTimeout(()=>arcThud(.5),360)}catch(e){}
  if(!(IS&&IS.kind==='room'&&IS.mine)){S.guestHere=true;n.with=S.guestUntil;invNote(n,`I'm at ${homeB().name}. Where are you? 😅 I'll wait in your room.`);return}
  if(!$('story').hidden||S.busy){S.guestHere=true;n.with=S.guestUntil;toast(`🚪 ${n.name} let themselves in.`);refreshRoom();setTimeout(()=>guestWalkIn(n),800);return}
  story(`<div class="eyebrow">🚪 Knock knock</div><h3>${esc(n.name)} is at your door</h3><p class="scene">"It's me o! 😄"</p>`,
    [['🚪 Let them in','g',()=>{S.guestHere=true;n.with=S.guestUntil;n.friend=clamp(n.friend+2);refreshRoom();setTimeout(()=>guestWalkIn(n),800)}],
     ['🙅 "Sorry, not now"','',()=>{S.guestId=null;S.guestHere=false;n.friend=clamp(n.friend-6);invNote(n,pick(['You invited me and now you\'re sending me away?? 😒','Wow. Okay 🙄'])) }]])}
/* they come in through the door and walk over to you */
function guestWalkIn(n){try{const q=IS&&IS.people.find(q=>q.n===n),d=IS&&IS.objs.find(o=>o.id==='door');if(!q||!d)return;const p=P();
  q.mesh.position.set(d.x+.35,0,d.z);q.x=d.x+.35;q.z=d.z;const A=q.ai||(q.ai={next:0,path:null,goal:null});const a=Math.atan2(d.x-p.ix,d.z-p.iz);
  startWalk(q,A,{k:'chat',x:p.ix-Math.sin(a)*.9,z:p.iz-Math.cos(a)*.9,pose:'wave',y:0,face:1});A.next=performance.now()/1000+25;
  setTimeout(()=>toast(`${n.name.split(' ')[0]}: "${pick(['Your room is nice o! 😍','Ei, it\'s cosy in here 😄','So this is where you hide 😂'])}"`),2500)}catch(e){console.warn(e)}}
/* keep time: heads-up when close, knock when they arrive (works after reloading too) */
setInterval(()=>{try{if(!S||!S.p||$('game').hidden)return guestBar();if(S.guestId!=null&&!S.guestHere&&S.guestEta){const n=npcById(S.guestId);if(!n){S.guestEta=0;return guestBar()}
  if(!S.guestNear&&S.guestEta-S.min<=4&&S.guestEta-S.min>0){S.guestNear=1;toast(`🚶 ${n.name.split(' ')[0]}: "I'm almost at ${homeB().name} 🏃"`)}
  if(S.min>=S.guestEta)guestKnock(n)}guestBar()}catch(e){}},700);
/* the old way (a timer that didn't survive a reload) is replaced by the saved arrival time */
{const _ga=guestArrive;guestArrive=function(n){if(S.guestEta)return;return _ga.apply(this,arguments)}}
{const _fc=fifaComing;fifaComing=function(n){const r=_fc.apply(this,arguments);try{if(S.guestId===n.id&&!S.guestHere&&!S.guestEta){S.guestEta=S.guestUntil-180;S.guestNear=0;guestBar()}}catch(e){}return r}}
