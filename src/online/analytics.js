/* Player numbers with Google Analytics (through Firebase). Only runs on the website, after Google Analytics
   is switched on for the Firebase project. Game scripts call window.track(name, params); calls made before
   analytics is ready wait in a queue. */
import {isSupported,getAnalytics,logEvent,setUserProperties} from 'firebase/analytics';
export async function initAnalytics(app){
  try{if(!(await isSupported()))return;const an=getAnalytics(app);
    const send=(n,p)=>{try{logEvent(an,n,p||{})}catch(e){}};
    window.track=send;(window.__tq||[]).splice(0).forEach(([n,p])=>send(n,p));
    window.trackUser=props=>{try{setUserProperties(an,props)}catch(e){}};
  }catch(e){console.warn('Chale: analytics off',e&&e.message)}}
