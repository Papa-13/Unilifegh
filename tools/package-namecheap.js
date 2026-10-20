/* npm run package:namecheap → chale-namecheap.zip : the built game + server + api, ready to upload to a cPanel Node.js app. */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
const OUT = 'release/namecheap';
fs.rmSync('release', { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
execSync('npm run build', { stdio: 'inherit' });
for (const f of ['dist', 'api', 'server.js', 'app.cjs']) fs.cpSync(f, `${OUT}/${f}`, { recursive: true });
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
fs.writeFileSync(`${OUT}/package.json`, JSON.stringify({ name: 'chale-server', private: true, type: 'module', main: 'app.cjs', scripts: { start: 'node server.js' }, engines: { node: '>=18' }, dependencies: { 'firebase-admin': pkg.dependencies['firebase-admin'] }, overrides: pkg.overrides }, null, 2));
execSync(`cd ${OUT} && zip -qr ../chale-namecheap.zip .`);
console.log('wrote release/chale-namecheap.zip');
