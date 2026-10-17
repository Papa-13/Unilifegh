/* ================= weather and sound =================
   Weather follows the campus clock and the campus name, so everyone on the same campus sees the
   same rain at the same time. Semester 1 is the rainy season (afternoon storms, thunder);
   semester 2 is harmattan (dusty haze in the mornings, almost no rain).
   Sound is made in the browser (no audio files): birds by day, crickets at night, rain, thunder,
   distant traffic, footsteps and soft taps on buttons. 🔊 on the right turns it on and off. */
const WX={ri:0,haze:0,flash:0,thunderAt:0,was:0,umbT:0,rainG:null,base:{near:34,far:100}};
function wxHash(s){let h=2166136261;s=String(s);for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return (h>>>0)/4294967296}
function wxSeed(){return (typeof MP!=='undefined'&&MP.campus)||'solo'}
/* how hard it is raining (0–1) and how hazy it is at a campus minute */
function weatherAt(min){if(!S)return{rain:0,haze:0,storm:false};const d=Math.floor(min/1440),h=(min%1440)/60,seed=wxSeed()+':'+d,sem=S.sy||1;
  const r=wxHash(seed+'r'),chance=sem===1?.45:.07;let rain=0,storm=false;
  for(const dd of [0,-1]){const sd=wxSeed()+':'+(d+dd);if(wxHash(sd+'r')>=chance)continue;
    const st=10+wxHash(sd+'s')*10+dd*24,dur=1+wxHash(sd+'d')*2.5,pk=.45+wxHash(sd+'k')*.55,e=st+dur;
    if(h>st-.33&&h<e+.33){const k=Math.min(1,(h-(st-.33))/.33,(e+.33-h)/.33);rain=Math.max(rain,pk*Math.max(0,k));storm=storm||wxHash(sd+'t')<.55}}
  void r;let haze=0;if(sem===2){haze=h>=5&&h<12?.85-Math.abs(h-8)*.12:h>=12&&h<18?.3:.15;haze*=.7+wxHash(seed+'h')*.3}
  return{rain,haze:Math.max(0,haze),storm:storm&&rain>.55}}
function wxIcon(){return WX.ri>.55?(WX.storm?'⛈️ ':'🌧️ '):WX.ri>.08?'🌦️ ':WX.haze>.45?'🌫️ ':''}

/* ---- rain streaks around the camera ---- */
const RAIN=(()=>{const N=900,pos=new Float32Array(N*6),sp=new Float32Array(N);const W=34,H=9;
  for(let i=0;i<N;i++){const x=R(-W/2,W/2),y=R(0,H),z=R(-W/2,W/2);pos.set([x,y,z,x-.08,y-.8,z-.04],i*6);sp[i]=R(15,21)}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const ln=new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color:0xe4eef8,transparent:true,opacity:.0,depthWrite:false}));ln.frustumCulled=false;ln.visible=false;scene.add(ln);
  return{ln,step(dt,on,k){ln.visible=on;if(!on)return;ln.material.opacity=.3+.45*k;const n=Math.floor(N*(.25+.75*k));geo.setDrawRange(0,n*2);
    for(let i=0;i<n;i++){const o=i*6,dy=sp[i]*dt;pos[o+1]-=dy;pos[o+4]-=dy;if(pos[o+4]<0){const x=R(-W/2,W/2),z=R(-W/2,W/2),y=H+R(0,1);pos[o]=x;pos[o+1]=y;pos[o+2]=z;pos[o+3]=x-.08;pos[o+4]=y-.8;pos[o+5]=z-.04}}
    geo.attributes.position.needsUpdate=true;ln.position.set(camT.x,0,camT.z)}}})();

/* ---- umbrellas for everyone walking outside in the rain ---- */
const UMB_COL=[0x8e2a3a,0x2f6bb5,0xf4c430,0x2fa84f,0x111111,0xc8322b,0x6a3f8a];
function umbrellaFor(m){if(m.userData.umb)return m.userData.umb;const g=new THREE.Group(),col=UMB_COL[Math.floor(Math.random()*UMB_COL.length)];
  const can=new THREE.Mesh(new THREE.ConeGeometry(.62,.26,10,1,true),lam(col));can.material.side=THREE.DoubleSide;can.position.y=1.98;g.add(can);
  const pole=new THREE.Mesh(cyl(.014,.014,.95,5),lam(0x222222));pole.position.y=1.48;g.add(pole);g.position.set(.12,0,.1);g.visible=false;m.add(g);m.userData.umb=g;return g}
function umbrellasTick(on){const show=(c,ok)=>{const m=c&&c.mesh;if(!m)return;if(!on&&!m.userData.umb)return;const u=umbrellaFor(m);u.visible=on&&ok};
  const sit=c=>/^sit|type|swim|dive|lie|sleep/.test(c.pose||'')||c.lying;
  try{const p=P();show(p,!p.inCar&&!p.onBus&&!sit(p))}catch(e){}
  if(S&&S.npcs)S.npcs.forEach(n=>show(n,!n.hidden&&!sit(n)));
  try{if(typeof MP!=='undefined')for(const rp of MP.peers.values())show(rp,!rp.in)}catch(e){}}

/* ---- called from lighting() every frame ---- */
function weatherTick(dt){if(!S||!S.p)return;const w=weatherAt(S.min);
  WX.ri+=(w.rain-WX.ri)*Math.min(1,dt*.8);WX.haze+=(w.haze-WX.haze)*Math.min(1,dt*.5);WX.storm=w.storm;const ri=WX.ri,hz=WX.haze;
  const grey=new THREE.Color(0x66717d),dust=new THREE.Color(0xd8c29a);
  if(ri>.01||hz>.01){sky.lerp(grey,.65*ri).lerp(dust,.45*hz*(1-ri));scene.fog.color.copy(sky);SKY.u.top.value.lerp(grey,.7*ri).lerp(dust,.3*hz);SKY.u.hor.value.copy(sky);
    hemi.intensity*=1-.4*ri;sun.intensity*=Math.max(.05,1-.88*ri-.25*hz);if(ri>.45)SKY.sunS.visible=false;SKY.cm.opacity=Math.min(1,SKY.cm.opacity+.5*ri);SKY.cm.color.lerp(grey,.6*ri)}
  scene.fog.near=WX.base.near*(1-.45*ri-.35*hz);scene.fog.far=WX.base.far*(1-.45*ri-.4*hz);
  /* thunder: a flash, then the rumble a moment later */
  const now=performance.now();if(WX.storm&&now>WX.thunderAt){WX.thunderAt=now+R(9000,26000);if(WX.thunderAt>0&&ri>.6){WX.flash=1;setTimeout(()=>SND.thunder(),R(400,1800))}}
  if(WX.flash>0){hemi.intensity+=WX.flash*1.6;WX.flash=Math.max(0,WX.flash-dt*5)}
  RAIN.step(dt,!IS&&ri>.03,ri);
  WX.umbT-=dt;if(WX.umbT<=0){WX.umbT=.5;umbrellasTick(ri>.25&&!IS)}
  /* it started raining */
  const on=ri>.35;if(on&&!WX.was){toast(WX.storm?'⛈️ A storm is coming! Get indoors or grab your umbrella.':'🌧️ It\'s raining on campus.')}WX.was=on;
  if(on&&!IS){const p=P();if(p.spd>20&&!p.inCar&&!p.onBus)p.needs.hygiene=clamp((p.needs.hygiene??80)-dt*.25*ri)}
  try{hawkerTick()}catch(e){}
  SND.tick(dt)}

/* ---- sound ---- */
const SND={on:true,ready:false,nodes:null,stepT:0,birdT:2,crickT:0,ui:true};
try{SND.on=localStorage.getItem('yolo-sound')!=='off'}catch(e){}
SND.ctx=()=>{try{ACX=ACX||new (window.AudioContext||window.webkitAudioContext)();return ACX}catch(e){return null}};
SND.init=function(){if(this.ready)return;const A=this.ctx();if(!A)return;this.ready=true;A.resume&&A.resume();
  const len=A.sampleRate*2,buf=A.createBuffer(1,len,A.sampleRate),d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
  const brown=A.createBuffer(1,len,A.sampleRate),b=brown.getChannelData(0);let l=0;for(let i=0;i<len;i++){l=(l+.02*(Math.random()*2-1))/1.02;b[i]=l*3.5}
  this.noise=buf;const master=A.createGain();master.gain.value=this.on?1:0;master.connect(A.destination);
  const loop=(bf,type,f,q)=>{const s=A.createBufferSource();s.buffer=bf;s.loop=true;const fl=A.createBiquadFilter();fl.type=type;fl.frequency.value=f;if(q)fl.Q.value=q;const g=A.createGain();g.gain.value=0;s.connect(fl);fl.connect(g);g.connect(master);s.start();return{g,fl}};
  this.nodes={master,rain:loop(buf,'lowpass',1400),drops:loop(buf,'bandpass',3200,2.5),wind:loop(brown,'lowpass',380),hum:loop(brown,'lowpass',160)}};
SND.set=function(n,v,t=.6){if(!this.nodes)return;const A=ACX,g=this.nodes[n].g.gain;g.cancelScheduledValues(A.currentTime);g.setTargetAtTime(v,A.currentTime,t)};
SND.blip=function(f,dur,vol,type='sine',f2){if(!this.ready||!this.on)return;const A=ACX,t=A.currentTime,o=A.createOscillator(),g=A.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(this.nodes.master);o.start(t);o.stop(t+dur+.02)};
SND.burst=function(dur,vol,type,f,q){if(!this.ready||!this.on)return;const A=ACX,t=A.currentTime,s=A.createBufferSource();s.buffer=this.noise;const fl=A.createBiquadFilter();fl.type=type;fl.frequency.value=f;if(q)fl.Q.value=q;const g=A.createGain();
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(fl);fl.connect(g);g.connect(this.nodes.master);s.start(t,Math.random()*1.5);s.stop(t+dur+.05)};
SND.thunder=function(){if(!this.ready||!this.on)return;const A=ACX,t=A.currentTime,s=A.createBufferSource();s.buffer=this.noise;s.loop=true;const fl=A.createBiquadFilter();fl.type='lowpass';fl.frequency.setValueAtTime(900,t);fl.frequency.exponentialRampToValueAtTime(90,t+2.5);
  const g=A.createGain();const v=IS?.35:.7;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.06);g.gain.setTargetAtTime(v*.5,t+.3,.4);g.gain.exponentialRampToValueAtTime(.0001,t+4);s.connect(fl);fl.connect(g);g.connect(this.nodes.master);s.start(t);s.stop(t+4.2)};
SND.bird=function(){const f=R(2200,3800),n=RI(2,5);for(let i=0;i<n;i++)setTimeout(()=>this.blip(f*R(.9,1.15),R(.06,.12),.035,'sine',f*R(1.2,1.6)),i*R(90,160))};
SND.cricket=function(){const f=R(4300,4900);for(let i=0;i<3;i++)setTimeout(()=>this.blip(f,.035,.018,'triangle'),i*55)};
SND.step=function(wet,inside){this.burst(wet?.09:.05,wet?.09:inside?.05:.06,wet?'lowpass':'highpass',wet?900:inside?1200:1800)};
SND.tick=function(dt){if(!this.ready)return;const live=this.on&&!document.hidden&&!$('game').hidden&&S&&!S.paused;const h=hour(),night=h>=19||h<5.5,out=!IS,ri=WX.ri;
  if(!this.nodes)return;
  this.set('rain',live?(out?.32:.1)*ri:0);this.nodes.rain.fl.frequency.value=out?1400:520;this.set('drops',live&&out?.06*ri:0);
  this.set('wind',live?(out?.05+.08*WX.haze+.06*ri:.015):0);this.set('hum',live&&out&&!night?.05:live&&out?.025:0);
  if(!live)return;
  if(out&&ri<.3&&!night){this.birdT-=dt;if(this.birdT<=0){this.birdT=R(2.5,7);this.bird()}}
  if(night&&ri<.5){this.crickT-=dt;if(this.crickT<=0){this.crickT=R(.25,.9)*(out?1:2.5);if(out||Math.random()<.4)this.cricket()}}
  const p=P(),mv=IS?(p.spd||0)>.3:(p.spd||0)>40&&!p.inCar&&!p.onBus&&!S.busy;if(mv){this.stepT-=dt;if(this.stepT<=0){this.stepT=IS?.38:(p.hurry?.26:.33);this.step(out&&ri>.3,!out)}}else this.stepT=.05};
SND.toggle=function(){this.on=!this.on;try{localStorage.setItem('yolo-sound',this.on?'on':'off')}catch(e){}if(this.nodes)this.nodes.master.gain.value=this.on?1:0;const b=$('sndB');if(b)b.textContent=this.on?'🔊':'🔇';toast(this.on?'🔊 Sound on':'🔇 Sound off')};
/* browsers only allow sound after a tap: start on the first one */
addEventListener('pointerdown',e=>{SND.init();if(SND.ui&&e.target&&e.target.closest&&e.target.closest('button,.item[data-x],.chip'))SND.blip(760,.05,.035,'sine',520)},true);
addEventListener('keydown',()=>SND.init(),{once:true});
{const b=$('sndB');if(b){b.textContent=SND.on?'🔊':'🔇';b.onclick=()=>SND.toggle()}}
