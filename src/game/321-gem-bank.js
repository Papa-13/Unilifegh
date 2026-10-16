/* ================= the gem bank: 💎 kept on the server, so nobody can fake them =================
   On the website, gems live in your account on the server (api/gems.js), not on your phone:
   earning (daily tasks, milestones) and spending (⚡ Finish now) go through the server, which
   checks the rules (once per task, daily cap, enough gems to spend). Your gems belong to your
   account, so a new student keeps them. If the server isn't set up or can't be reached (or in
   the claude.ai version), gems work locally like before. */
const GB={on:false,bal:null,checked:false,busy:false};
async function gbCall(body){if(!window.fbIdToken)return null;let tok=null;try{tok=await window.fbIdToken()}catch(e){}if(!tok)return null;
  let r;try{r=await fetch('/api/gems',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+tok},body:JSON.stringify(body)})}catch(e){return {offline:true}}
  if(r.status===404||r.status===503){GB.on=false;return null}
  const j=await r.json().catch(()=>null);if(j&&typeof j.gems==='number'){GB.bal=j.gems;if(GB.on&&S)S.gems=j.gems;try{hud()}catch(e){}}return j}
/* called whenever the game screen opens: switch to server gems if the bank answers */
async function gbSync(){if(GB.on){if(S&&GB.bal!=null)S.gems=GB.bal;return}if(GB.checked)return;GB.checked=true;
  const j=await gbCall({op:'get'});if(j&&typeof j.gems==='number'){GB.on=true;GB.bal=j.gems;if(S)S.gems=j.gems;try{hud()}catch(e){}}else GB.checked=!!(j&&!j.offline)}
/* earning: shows straight away, the server confirms (and corrects it if a rule says no) */
function gemsEarn(kind,id,amt){S.gems=(S.gems||0)+amt;if(!GB.on)return;gbCall({op:'earn',kind,id:String(id),amt}).then(j=>{if(j&&j.capped)toast('💎 You\'ve earned all the task gems you can today. More tomorrow!')})}
/* spending waits for the server's yes */
async function gemsSpend(amt){if(!GB.on){if((S.gems||0)<amt)return false;S.gems-=amt;return true}
  if(GB.busy)return false;GB.busy=true;try{const j=await gbCall({op:'spend',amt});if(!j||j.offline){toast('💎 Couldn\'t reach the gem bank. Check your connection.');return false}if(j.error){toast('💎 '+j.error);return false}return true}finally{GB.busy=false}}
