/* Unilife GH service worker: makes the game load fast the second time, even on slow data.
   - /assets/* (hashed files), 3D models, icons and fonts: kept on the phone after the first download.
   - The page itself: always fetched fresh when online (so updates show straight away), from the phone when offline.
   - Old files from previous updates are cleared out automatically. /api/* is never cached. */
const C='unilifegh-v1';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil((async()=>{for(const k of await caches.keys())if(k!==C)await caches.delete(k);await self.clients.claim()})()));
const STATIC=p=>p.startsWith('/assets/')||p.startsWith('/models/')||/\.(png|ico|jpg|jpeg|webp|woff2?|glb)$/.test(p);
self.addEventListener('fetch',e=>{const q=e.request,u=new URL(q.url);if(q.method!=='GET'||u.origin!==location.origin||u.pathname.startsWith('/api/'))return;
  if(STATIC(u.pathname)){e.respondWith(caches.open(C).then(async c=>{const hit=await c.match(q);if(hit)return hit;const r=await fetch(q);if(r.ok)c.put(q,r.clone());return r}));return}
  if(q.mode==='navigate'&&(u.pathname==='/'||u.pathname==='/index.html')){e.respondWith(fetch(q).then(r=>{const cp=r.clone();
      e.waitUntil(caches.open(C).then(async c=>{await c.put('/',cp.clone());const html=await cp.text(),keep=new Set((html.match(/\/assets\/[^"' )]+/g)||[]));
        for(const k of await c.keys()){const p=new URL(k.url).pathname;if(p.startsWith('/assets/')&&!keep.has(p))await c.delete(k)}}));return r}).catch(()=>caches.match('/')))}});
