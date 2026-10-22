/* romance is always between a guy and a girl: flirting, dates, kisses, relationships and crushes only
   happen with someone of the opposite gender. Same-gender characters are friends (dinner, movies and
   hangouts as mates). A sanitizer also clears any romance an older save gave to a same-gender character. */
function romOK(n){try{const g=n&&(n.gender||(n.look&&n.look.gender)),me=S&&S.p&&P().look&&P().look.gender;return !!g&&!!me&&g!==me}catch(e){return false}}
function romanceSanitize(){try{if(!S||!S.p||!S.npcs)return;const p=P();S.npcs.forEach(n=>{if(romOK(n))return;if(n.romance)n.romance=0;if(n.side)n.side=false;
  if(p.partner===n){p.partner=null;n.friend=Math.max(n.friend||0,80)}})}catch(e){}}
