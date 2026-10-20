/* ================= intro art: campus skyline, progress strip, launch animation =================
   Used by the welcome screen, the campus list and the screens before move-in (styles: 095-intro.css). */

/* a dusk silhouette of campus: hills, the Great Hall dome, the clock tower, hostels with lit windows,
   palms, and a trotro on the road. Drawn once and reused. */
const SKYLINE=(()=>{const S='#1d0d22',W='#f5b41f';let win='';
  const blk=(x,y,w,h,cols,rows,seed)=>{let s=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${S}"/>`;const cw=w/cols;
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const k=(c*7+r*13+seed)%5,on=k<2;if(on||k===4)win+=`<rect class="${on?'w':'w tw'}" x="${(x+c*cw+cw*.28).toFixed(1)}" y="${y+10+r*16}" width="${(cw*.44).toFixed(1)}" height="7" rx="1" fill="${W}" opacity="${on?.55+((c+r+seed)%3)*.15:.8}" style="animation-delay:${((c*3+r*5+seed*7)%23)/2}s"/>`}return s};
  const palm=(x,h,flip)=>{const t=`<path d="M${x} 300 C ${x+(flip?-6:6)} ${300-h*.5}, ${x+(flip?8:-8)} ${300-h*.8}, ${x+(flip?4:-4)} ${300-h}" stroke="${S}" stroke-width="6" fill="none"/>`,cx=x+(flip?4:-4),cy=300-h;
    return t+[[-46,-6],[-30,-26],[0,-34],[30,-24],[46,-4],[22,14],[-24,14]].map(([dx,dy])=>`<path d="M${cx} ${cy} Q ${cx+dx*.5} ${cy+dy-14} ${cx+dx} ${cy+dy+10}" stroke="${S}" stroke-width="5" fill="none" stroke-linecap="round"/>`).join('')};
  const b=[
    `<path d="M0 230 Q 150 170 320 215 T 640 200 T 960 190 T 1200 210 V320 H0Z" fill="#4a1d3d" opacity=".75"/>`,
    blk(40,205,110,95,5,5,1),blk(160,180,70,120,3,7,2),
    `<rect x="250" y="235" width="190" height="65" fill="${S}"/><path d="M262 238 A 83 70 0 0 1 428 238Z" fill="${S}"/><rect x="341" y="150" width="8" height="22" fill="${S}"/>`,
    `<rect x="520" y="120" width="42" height="180" fill="${S}"/><path d="M514 124 L541 88 L568 124Z" fill="${S}"/><circle cx="541" cy="146" r="11" fill="${W}" opacity=".9"/><path d="M541 146 V139 M541 146 H547" stroke="${S}" stroke-width="2"/>`,
    blk(600,195,130,105,6,6,3),blk(745,170,80,130,4,8,4),blk(880,210,120,90,6,5,5),blk(1040,185,100,115,5,7,6),
    palm(470,120,false),palm(845,100,true),palm(1015,130,false),palm(1170,95,true),
    `<rect x="0" y="296" width="1200" height="24" fill="#140914"/>`,
    /* a painted trotro drives past with a different slogan on each trip */
    `<g class="tro"><g class="bob"><g transform="translate(0 242)"><rect x="0" y="0" width="200" height="50" rx="10" fill="#f6efe6"/><rect x="0" y="30" width="200" height="12" fill="#d93a2b"/><rect x="0" y="42" width="200" height="4" fill="#1e9a57"/>
      ${[0,1,2,3,4].map(i=>`<rect x="${14+i*30}" y="7" width="24" height="17" rx="3" fill="#2b3a4a"/>`).join('')}<rect x="168" y="6" width="26" height="20" rx="4" fill="#2b3a4a"/><rect x="194" y="30" width="6" height="6" fill="#ffd34d"/>
      ${['SEM ONE NO EASY','WAAKYE IS LIFE','NO CONDITION IS PERMANENT','LEVEL 100 TO THE WORLD'].map((t,i)=>`<text class="sl sl${i}" x="96" y="40" text-anchor="middle" font-family="Bungee,Arial Black,sans-serif" font-size="9" fill="#fff">${t}</text>`).join('')}
      <circle cx="40" cy="52" r="11" fill="#140914"/><circle cx="160" cy="52" r="11" fill="#140914"/><circle cx="40" cy="52" r="4" fill="#777"/><circle cx="160" cy="52" r="4" fill="#777"/></g></g></g>`];
  return `<svg viewBox="0 0 1200 320" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${b.join('')}${win}</svg>`})();
const introScene=()=>`<div class="sunball"></div><div class="cloud c1"></div><div class="cloud c2"></div><div class="skyline">${SKYLINE}</div>`;

/* the five steps before move-in day; i = the current one (0-4) */
const STEPS=['You','Family','Apply','Admission','Hostel'];
const stepBar=i=>`<div class="steps" aria-label="Step ${i+1} of ${STEPS.length}: ${STEPS[i]}">${STEPS.map((s,k)=>`<div class="st${k<i?' done':k===i?' on':''}"><i></i><span>${s}</span></div>`).join('')}</div>`;

/* the launch animation lives in index.html so it shows while the game downloads.
   It stays at least until its letters have landed, then wipes up. Tap to skip once the logo is in. */
function splashDone(){const sp=$('splash');if(!sp||sp.dataset.go)return;sp.dataset.go=1;
  const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches,wait=Math.max(0,(reduce?600:4300)-performance.now());
  const out=()=>{sp.classList.add('out');setTimeout(()=>sp.remove(),800)};
  const t=setTimeout(out,wait);sp.addEventListener('click',()=>{if(performance.now()>500){clearTimeout(t);out()}})}

/* which look the full-screen panel uses: 'intro' (sunset + skyline), 'form' (plain dusk), 'bleed' (character creator) or '' */
function panelMode(m){const c=$('panel').classList;c.remove('intro','form','bleed');if(m)c.add(m)}
