import path from 'node:path';
import fs from 'node:fs';
import {openBrowser} from '@remotion/renderer';
const browser = await openBrowser('chrome', { chromeMode:'headless-shell', browserExecutable: path.resolve('.cache/chs/chrome-headless-shell-win64/chrome-headless-shell.exe') });
const page = await browser.newPage({context:null,logLevel:'error',indent:false,pageIndex:0});
await page.goto({url:'http://127.0.0.1:3999/', timeout:30000});
const b64 = {};
for (const [ch, n] of [['永',114],['墨',111],['静',113]]) {
  b64[ch] = fs.readFileSync('public/fonts/nssc-'+n+'.woff2').toString('base64');
}
const src = fs.readFileSync('scripts/fontprobe.js','utf8').replace('__B64__', JSON.stringify(b64));
const res = await page.evaluate(src, 120000);
console.log(JSON.stringify(res));
await browser.close({silent:true});
