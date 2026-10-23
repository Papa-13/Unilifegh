/* ================= light off (dumsor): nothing electric works =================
   When ECG takes the light and your hostel has no generator, anything that runs on mains power can't be
   used: TV (and FIFA, music videos), fridge, microwave, kettle, rice cooker, water dispenser, ring light,
   LED lights, iron, the AC. Their actions show "no light". If the TV was on it goes off when the light
   goes. Things with batteries still work: your phone, your laptop and your Bluetooth speaker.
   Indomie on the gas stove is fine. */
const POWER_ACTS=/TV|FIFA|movie|channel|music videos|Karaoke|fridge|cold drink|microwave|Warm up|kettle|Milo|tea|rice cooker|Cook with the rice|dispenser|cold water|Film a TikTok|ring light|LED|iron|Press|AC\b|air con|Switch the lights/i;
const noLight=()=>!!(IS&&IS.kind==='room'&&typeof lightOff==='function'&&lightOff()&&!hasPower());
function powerGate(list){if(!noLight())return;for(let i=0;i<list.length;i++){const it=list[i];if(!it||!it[1]||!POWER_ACTS.test(it[0])||/speaker|gas stove|phone/i.test(it[0]))continue;
  if(MUS.via!=='tv'&&/music|song/i.test(it[0])&&!/TV/.test(it[0]))continue;list[i]=[it[0].replace(/\s*\(\d+h?m?\)$/,''),null,'no light ⚡']}}
{const _rA=realityActs;realityActs=function(list){const r=_rA.apply(this,arguments);try{powerGate(list)}catch(e){console.warn(e)}return r}}
/* the TV won't turn on, and goes off when the light goes */
{const _tp=tvPower;tvPower=function(on){if(on&&noLight()){toast('⚡ No light. The TV won\'t come on.');return}return _tp.apply(this,arguments)}}
setInterval(()=>{try{if(!S||!S.p||!noLight())return;let msg='';
  if(typeof TV!=='undefined'&&TV.on){tvPower(false);msg='📺 The TV just went off'}
  if(MUS.via==='tv'&&MUS.room){speakerStop();msg=msg||'🎵 The music on the TV stopped'}
  if(S.busy&&POWER_ACTS.test(S.busy.label||'')&&!/speaker/i.test(S.busy.label)){S.busy.cancel=true;finishBusy();msg=msg||'⚡ It stopped working'}
  if(msg)toast(`⚡ Light off! ${msg}.`)}catch(e){}},1500);
{const _rm=roomMusicStart;roomMusicStart=function(via){if(via==='tv'&&noLight())return toast('⚡ No light, so the TV can\'t play music. Your Bluetooth speaker runs on battery.');return _rm.apply(this,arguments)}}
