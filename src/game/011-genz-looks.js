/* Gen Z everyday looks: NPCs never pick occasion wear for a normal day, prints show up less, and old
   saves move anyone still in a removed outfit (ankara two-piece, kaba, kente, smock, kaftan, Friday wear)
   into something current. Lecturers and staff keep their own grown-up clothes. */
const GENZ_DAILY=g=>Object.keys(OUTFIT[g]).filter(o=>!OCCASION.includes(o));
{const _rl=randomLook;randomLook=function(g){const L=_rl(g);if(!GENZ_DAILY(g).includes(L.outfit))L.outfit=pick(GENZ_DAILY(g));if(PRINTS.includes(L.pal)&&Math.random()<.6)L.pal=pick(PLAINS);return fitLook(L)}}
function genzFix(L){if(!L||!L.gender)return false;const g=L.gender;if(OUTFIT[g]&&OUTFIT[g][L.outfit])return false;L.outfit=pick(GENZ_DAILY(g));if(PRINTS.includes(L.pal))L.pal=pick(PLAINS);fitLook(L);return true}
