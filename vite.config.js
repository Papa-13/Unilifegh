import fs from 'node:fs';
import { defineConfig } from 'vite';
import { createHash } from 'node:crypto';
import { transform } from 'esbuild';
import { gameJs, gameCss, threeJs, root } from './tools/game-bundle.js';

/* Serves (npm run dev) and builds (npm run build) the game script, its styles and three.js.
   They are added to index.html automatically; in the build they become hashed files in dist/assets. */
function yoloGame() {
  const files = {
    '/game.js': { type: 'application/javascript', get: gameJs, min: (c) => transform(c, { loader: 'js', minifyWhitespace: true, minifySyntax: true, target: 'es2019' }) },
    '/game.css': { type: 'text/css', get: gameCss, min: (c) => transform(c, { loader: 'css', minify: true }) },
    '/three.min.js': { type: 'application/javascript', get: threeJs, min: null },
  };
  const out = {};
  return {
    name: 'yolo-game',
    configureServer(server) {
      server.watcher.add([root + '/src/game', root + '/src/styles']);
      server.watcher.on('change', (f) => { if (/src[\\/](game|styles)[\\/]/.test(f)) server.ws.send({ type: 'full-reload' }) });
      server.watcher.on('add', (f) => { if (/src[\\/](game|styles)[\\/]/.test(f)) server.ws.send({ type: 'full-reload' }) });
      server.middlewares.use((req, res, next) => {
        const f = files[(req.url || '').split('?')[0]];
        if (!f) return next();
        res.setHeader('Content-Type', f.type + '; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        res.end(f.get());
      });
    },
    async buildStart() {
      for (const [url, f] of Object.entries(files)) {
        let code = f.get();
        if (f.min) code = (await f.min(code)).code;
        const hash = createHash('sha256').update(code).digest('hex').slice(0, 10);
        const base = url.slice(1).replace(/(\.min)?\.(js|css)$/, '');
        out[url] = { code, fileName: `assets/${base}-${hash}${url.endsWith('.css') ? '.css' : '.js'}` };
      }
    },
    /* added after Vite has processed the page, so Vite leaves these plain (non-module) tags alone */
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const u = (k) => (ctx.server ? k : '/' + out[k].fileName);
        return [
          { tag: 'link', attrs: { rel: 'stylesheet', href: u('/game.css') }, injectTo: 'head' },
          { tag: 'script', attrs: { src: u('/three.min.js') }, injectTo: 'body' },
          { tag: 'script', attrs: { src: u('/game.js') }, injectTo: 'body' },
        ];
      },
    },
    generateBundle() {
      for (const o of Object.values(out)) this.emitFile({ type: 'asset', fileName: o.fileName, source: o.code });
    },
  };
}

/* site details (domain, owner, contact email) from site.config.json: filled into the link-preview tags
   and the Privacy / Terms pages (legal/*.html → dist/privacy.html, dist/terms.html) */
function siteMeta() {
  const cfg = JSON.parse(fs.readFileSync(root + '/site.config.json', 'utf8'));
  const url = String(cfg.url || '').replace(/\/+$/, '');
  const fill = (t) => t.replace(/%SITE_URL%/g, url).replace(/%OWNER%/g, cfg.owner || 'the developer of Unilife GH')
    .replace(/%EMAIL_LINK%/g, cfg.email ? `<a href="mailto:${cfg.email}">${cfg.email}</a>` : 'the <b>💬 Send feedback</b> button in the game menu')
    .replace(/%COUNTRY%/g, cfg.country || 'Ghana').replace(/%UPDATED%/g, cfg.updated || '');
  return {
    name: 'site-meta',
    transformIndexHtml: { order: 'pre', handler: (html) => fill(html) },
    generateBundle() {
      for (const f of ['privacy', 'terms']) {
        const src = root + '/legal/' + f + '.html';
        if (fs.existsSync(src)) this.emitFile({ type: 'asset', fileName: f + '.html', source: fill(fs.readFileSync(src, 'utf8')) });
      }
    },
  };
}

export default defineConfig({
  plugins: [siteMeta(), yoloGame()],
  build: { outDir: 'dist', chunkSizeWarningLimit: 1500 },
  server: { port: 5173 },
});
