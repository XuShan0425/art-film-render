import path from 'node:path';
import fs from 'node:fs';
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition, openBrowser} from '@remotion/renderer';
const browserExecutable = path.resolve('.cache/chromium/chrome-headless-shell-win64/chrome-headless-shell.exe');
const bundled = await bundle({entryPoint: path.resolve('src/index.ts')});
const browser = await openBrowser('chrome', {chromeMode: 'headless-shell', browserExecutable});
const composition = await selectComposition({serveUrl: bundled, id: 'Chroma', puppeteerInstance: browser});
fs.mkdirSync('out/p6', {recursive: true});
for (let i = 0; i < 4; i++) {
  const from = i * 300;
  const out = 'out/p6/p' + i + '.mp4';
  if (fs.existsSync(out) && fs.statSync(out).size > 100000) { console.log('skip', out); continue; }
  console.log('render', i, from);
  await renderMedia({composition, serveUrl: bundled, codec: 'h264', crf: 18, concurrency: 3,
    outputLocation: path.resolve(out), frameRange: [from, from + 299], puppeteerInstance: browser});
  console.log('done', i);
}
await browser.close({silent: true});
console.log('PART B DONE');
