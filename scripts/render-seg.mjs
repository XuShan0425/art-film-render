import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition, openBrowser} from '@remotion/renderer';

const browserExecutable = path.resolve('.cache/chromium/chrome-headless-shell-win64/chrome-headless-shell.exe');
const bundled = await bundle({entryPoint: path.resolve('src/index.ts')});
const browser = await openBrowser('chrome', {chromeMode: 'headless-shell', browserExecutable});
const composition = await selectComposition({serveUrl: bundled, id: 'Chroma', puppeteerInstance: browser});
const segments = JSON.parse(process.argv[2]);
for (const [i, [from, to]] of segments.entries()) {
  const outputLocation = path.resolve(`out/seg-${i}.mp4`);
  console.log('segment', i, from, to, '->', outputLocation);
  await renderMedia({
    composition, serveUrl: bundled, codec: 'h264', crf: 18, concurrency: 3,
    outputLocation, frameRange: [from, to - 1], puppeteerInstance: browser,
  });
  console.log('segment done', i);
}
await browser.close({silent: true});
console.log('ALL SEGMENTS DONE');
