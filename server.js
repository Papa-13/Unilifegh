/* Unilife GH web server for hosts that run Node.js (Namecheap cPanel "Setup Node.js App", a VPS, Render, ...).
   Serves the built game from dist/ and runs the same /api functions that Vercel runs (gem shop, gem bank,
   MoMo bank, Paystack webhook). No extra packages: only Node's own http module plus firebase-admin.
   Settings come from environment variables:
     PAYSTACK_SECRET_KEY              your Paystack live secret key (sk_live_...)
     FIREBASE_SERVICE_ACCOUNT         the service-account JSON on one line, or instead:
     FIREBASE_SERVICE_ACCOUNT_FILE    the path to that JSON file (keep it OUTSIDE public_html)
     PORT                             set by the host (Passenger sets it for you) */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
const ROOT = path.dirname(fileURLToPath(import.meta.url)), DIST = path.join(ROOT, 'dist');
if (!process.env.FIREBASE_SERVICE_ACCOUNT && process.env.FIREBASE_SERVICE_ACCOUNT_FILE) {
  try { process.env.FIREBASE_SERVICE_ACCOUNT = fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_FILE, 'utf8'); } catch (e) { console.error('Unilife GH: cannot read FIREBASE_SERVICE_ACCOUNT_FILE', e.message); }
}
const ZCACHE = new Map(); // compressed copies of files, built once per file per server start
const API = { gems: './api/gems.js', momo: './api/momo.js', pay: './api/pay.js', feedback: './api/feedback.js', 'paystack-webhook': './api/paystack-webhook.js' }, loaded = {};
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon', '.glb': 'model/gltf-binary', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain; charset=utf-8' };
/* the small part of Vercel's req/res helpers that the api files use */
function wrap(res) {
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (o) => { if (!res.getHeader('Content-Type')) res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(o)); return res; };
  return res;
}
const readBody = (req) => new Promise((ok, no) => { let d = ''; req.on('data', (c) => { d += c; if (d.length > 1e6) { no(new Error('too big')); req.destroy(); } }); req.on('end', () => ok(d)); req.on('error', no); });
async function api(name, req, res) {
  const file = API[name]; if (!file) { res.statusCode = 404; return res.end('Not found'); }
  try {
    const mod = loaded[name] || (loaded[name] = await import(file));
    wrap(res);
    if (name !== 'paystack-webhook') { const t = await readBody(req); try { req.body = t ? JSON.parse(t) : {}; } catch (e) { req.body = {}; } }
    await mod.default(req, res);
  } catch (e) { console.error('api', name, e); if (!res.headersSent) { res.statusCode = 500; res.end(JSON.stringify({ error: 'Server error' })); } }
}
function serveFile(req, res, p) {
  fs.stat(p, (err, st) => {
    if (err || !st.isFile()) { if (path.extname(p)) { res.statusCode = 404; return res.end('Not found'); } return serveFile(req, res, path.join(DIST, 'index.html')); }
    const ext = path.extname(p).toLowerCase();
    res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
    res.setHeader('Cache-Control', p.includes(`${path.sep}assets${path.sep}`) ? 'public, max-age=31536000, immutable' : p.includes(`${path.sep}models${path.sep}`) ? 'public, max-age=604800' : 'no-cache');
    res.setHeader('X-Content-Type-Options', 'nosniff');res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');res.setHeader('Vary', 'Accept-Encoding');
    if (req.method === 'HEAD') return res.end();
    /* compress text files (JS, CSS, HTML, JSON): the game's code goes from ~2.7 MB to ~0.8 MB on the wire */
    const ae = String(req.headers['accept-encoding'] || ''), zip = /\.(js|css|html|json|svg|txt|webmanifest)$/.test(ext) && /gzip|br/.test(ae);
    if (!zip) return fs.createReadStream(p).pipe(res);
    const enc = /\bbr\b/.test(ae) ? 'br' : 'gzip', key = p + '|' + enc + '|' + st.mtimeMs;
    const send = (buf) => { res.setHeader('Content-Encoding', enc); res.setHeader('Content-Length', buf.length); res.end(buf); };
    if (ZCACHE.has(key)) return send(ZCACHE.get(key));
    fs.readFile(p, (e2, raw) => { if (e2) { res.statusCode = 500; return res.end(); }
      const buf = enc === 'br' ? zlib.brotliCompressSync(raw, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 9 } }) : zlib.gzipSync(raw, { level: 9 });
      ZCACHE.set(key, buf); send(buf); });
  });
}
const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x'), parts = u.pathname.split('/').filter(Boolean);
  if (parts[0] === 'api') return api(parts[1], req, res);
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.statusCode = 405; return res.end(); }
  const p = path.normalize(path.join(DIST, decodeURIComponent(u.pathname)));
  if (!p.startsWith(DIST)) { res.statusCode = 403; return res.end(); }
  serveFile(req, res, u.pathname === '/' ? path.join(DIST, 'index.html') : p);
});
server.listen(process.env.PORT || 3000, () => console.log('Unilife GH running on port', process.env.PORT || 3000));
