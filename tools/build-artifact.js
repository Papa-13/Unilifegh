/* npm run build:artifact: builds the single-file version used on claude.ai (dist-artifact/freshers.html).
   It has no Firebase: on claude.ai the page gets online play from claude.ai itself. */
import fs from 'node:fs';
import path from 'node:path';
import { gameJs, gameCss, root } from './game-bundle.js';

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const head = html.slice(html.indexOf('<head>') + 6, html.indexOf('</head>')).replace(/<meta charset[^>]*>\n?/, '').trim();
const body = html.slice(html.indexOf('<body>') + 6, html.indexOf('<!-- Online play')).trim();
const three = '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>';
const out = `${head}\n${three}\n<style>\n${gameCss()}\n</style>\n${body}\n<script>\n${gameJs()}\n</script>\n`;
fs.mkdirSync(path.join(root, 'dist-artifact'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist-artifact/freshers.html'), out);
console.log(`wrote dist-artifact/freshers.html (${(out.length / 1024).toFixed(0)} KB)`);
