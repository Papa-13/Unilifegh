/* ================= little home touches =================
   - Going to sleep: you yawn and stretch first, then lie down. Waking up: you sit up, stretch and yawn.
   - Your light stays the way you left it when the room is rebuilt (moving furniture used to switch it off),
     and it's always on while you're arranging furniture so you can see.
   - A bedside table you can buy and move like other furniture. Your lamp sits on it when you have one. */
function sleepPrep(fn){if(!IS||S.busy||S._prep)return fn();S._prep=1;const p=P();try{setGest(p,'yawn',1.5)}catch(e){}toast(pick(['🥱 *yaaawn*… time for bed','🥱 You stretch and yawn. Bed time','😴 Your eyes are closing on their own']));
  setTimeout(()=>{S._prep=0;try{setGest(p,'stretch',1.1)}catch(e){}setTimeout(fn,900)},1500)}
function wakeUp(){const p=P();if(!IS)return;setTimeout(()=>{try{setGest(p,'stretch',2.2)}catch(e){}toast(pick(['☀️ You sit up, rub your eyes and stretch','☀️ *Yaaawn*… you stretch and get out of bed','☀️ You stretch until your back cracks 😮‍💨']));
  setTimeout(()=>{try{setGest(p,'yawn',1.6)}catch(e){}},2300)},700)}
{const _s=sleep;sleep=function(){const h=hour(),a=arguments,t=this;if(!(h>=20||h<5))return _s.apply(t,a);sleepPrep(()=>_s.apply(t,a))}}
{const _n=nap;nap=function(){const a=arguments,t=this;sleepPrep(()=>_n.apply(t,a))}}
{const _sn=sleepNow;sleepNow=function(){const r=_sn.apply(this,arguments);wakeUp();return r}}
{const _fb=finishBusy;finishBusy=function(){const b=S.busy;const r=_fb.apply(this,arguments);try{if(b&&!b.cancel&&(b.label==='Taking a nap'||(b.label==='Sleeping'&&b.timed)))wakeUp()}catch(e){}return r}}
/* your light stays how you left it */
{const _rr=refreshRoom;refreshRoom=function(){const keep=IS&&IS.mine?IS.lightsOn:null;const r=_rr.apply(this,arguments);try{if(keep!=null&&IS&&IS.mine)IS.lightsOn=keep}catch(e){}return r}}
{const _rl=roomLighting;roomLighting=function(){if(PLACE.on&&IS&&!IS.lightsOn){IS.lightsOn=true;try{return _rl.apply(this,arguments)}finally{IS.lightsOn=false}}return _rl.apply(this,arguments)}}
/* bedside table (and the lamp on it) */
SHOP.push({id:'bedside',name:'Bedside table',price:90,desc:'A little table by your bed. Your lamp goes on it'});
MOVABLE.bedside={w:.45,d:.4,build:g=>{const wd=lam(0x7a5536);box(.44,.5,.38,wd,0,.25,0,g);box(.4,.14,.02,lam(0x5e3f26),0,.36,.195,g);box(.08,.02,.02,lam(0xd9a537),0,.36,.21,g);box(.46,.03,.4,lam(0x8a6243),0,.515,0,g);
  if(window._bsLamp||P().items.includes('lamp')){mesh(cyl(.06,.07,.03,12),lam(0x333333),.05,.545,-.02,g);mesh(cyl(.012,.012,.26,6),lam(0x333333),.05,.69,-.02,g);mesh(new THREE.ConeGeometry(.12,.15,14,1,true),new THREE.MeshLambertMaterial({color:0xe8b24a,side:THREE.DoubleSide,emissive:0x3a2a08}),.05,.85,-.02,g);
    const L=new THREE.PointLight(0xffd59a,.55,2.6,1.6);L.position.set(.05,.8,-.02);g.add(L)}else{box(.14,.04,.1,lam(0x2f6b9b),-.08,.55,0,g);mesh(cyl(.04,.04,.1,10),lam(0xffffff),.12,.58,.05,g)}}};
{const _er=enterRoom0;enterRoom0=function(owner){const p=P(),mine=owner==='me',moveLamp=mine&&p.items.includes('lamp')&&p.items.includes('bedside')&&p.place&&p.place.bedside&&!(p.boxed||[]).includes('bedside');
  const bak=p.items.slice();if(moveLamp)p.items=p.items.filter(i=>i!=='lamp');window._bsLamp=moveLamp;let r;try{r=_er.apply(this,arguments)}finally{if(moveLamp)p.items=bak;window._bsLamp=false}return r}}
