/* ================= a close button on every sheet =================
   A ✕ that stays pinned to the top corner while you scroll, so you never have to scroll to the
   bottom to find "Close". Tapping the dark area above a sheet also closes it, and so does Esc.
   Exams hide it (you can't walk out of an exam). */
let SHEET_LOCK=false;
(function sheetCloser(){const inEl=$('sheetIn'),sh=$('sheet');if(!inEl||!sh)return;
  const add=()=>{if(SHEET_LOCK||sh.hidden||inEl.querySelector(':scope > .sheetXw'))return;const w=document.createElement('div');w.className='sheetXw';w.innerHTML='<button class="sheetX" aria-label="Close" title="Close">✕</button>';
    w.firstChild.onclick=e=>{e.stopPropagation();closeSheet()};inEl.prepend(w)};
  new MutationObserver(add).observe(inEl,{childList:true});new MutationObserver(add).observe(sh,{attributes:true,attributeFilter:['hidden']});
  sh.addEventListener('click',e=>{if(e.target===sh&&!SHEET_LOCK)closeSheet()});
  addEventListener('keydown',e=>{if(e.key==='Escape'&&!sh.hidden&&!SHEET_LOCK)closeSheet()})})();
{const _cs=closeSheet;closeSheet=function(){SHEET_LOCK=false;return _cs.apply(this,arguments)}}
{const _eq=examQuiz;examQuiz=function(){const r=_eq.apply(this,arguments);SHEET_LOCK=true;const x=$('sheetIn').querySelector('.sheetXw');if(x)x.remove();return r}}
