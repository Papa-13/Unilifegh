/* Joins the game's source files into one script and one stylesheet.

   The game code in src/game/*.js is a set of plain scripts that share one global scope
   (a function defined in 070-time.js can be used in 320-needs-mood-tasks-gems.js).
   Files are joined in name order, so the number at the start of each file name is its load order.
   To add a file between 120 and 130, call it 125-something.js. */
import fs from 'node:fs';
import path from 'node:path';

export const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const dir = (d) => path.join(root, d);

export function listFiles(sub, ext) {
  return fs.readdirSync(dir(sub)).filter((f) => f.endsWith(ext)).sort();
}

/* one script: each file is marked so errors are easy to trace back to a file */
export function gameJs() {
  return listFiles('src/game', '.js')
    .map((f) => `/* ===== src/game/${f} ===== */\n` + fs.readFileSync(dir('src/game/' + f), 'utf8'))
    .join('\n');
}

export function gameCss() {
  return listFiles('src/styles', '.css')
    .map((f) => `/* ===== src/styles/${f} ===== */\n` + fs.readFileSync(dir('src/styles/' + f), 'utf8'))
    .join('\n');
}

export const threeJs = () => fs.readFileSync(dir('node_modules/three/build/three.min.js'), 'utf8');

/* which line of which file does line N of the joined script come from? (used by `npm run check`) */
export function whereIs(line) {
  let at = 1;
  for (const f of listFiles('src/game', '.js')) {
    const n = fs.readFileSync(dir('src/game/' + f), 'utf8').split('\n').length + 1;
    if (line < at + n) return `src/game/${f}:${line - at}`;
    at += n;
  }
  return `line ${line}`;
}
