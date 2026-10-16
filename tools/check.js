/* npm run check: makes sure the joined game script has no syntax errors, and says which file a problem is in. */
import vm from 'node:vm';
import { gameJs, whereIs, listFiles } from './game-bundle.js';

const code = gameJs();
try {
  new vm.Script(code, { filename: 'game.js' });
  console.log(`✔ game code OK (${listFiles('src/game', '.js').length} files, ${(code.length / 1024).toFixed(0)} KB)`);
} catch (e) {
  const m = /game\.js:(\d+)/.exec(e.stack || '');
  console.error(`✖ ${e.message}` + (m ? `\n  at ${whereIs(+m[1])}` : ''));
  process.exit(1);
}
