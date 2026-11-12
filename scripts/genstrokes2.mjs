
import path from 'node:path';
import fs from 'node:fs';
import {openBrowser} from '@remotion/renderer';

const browser = await openBrowser('chrome', { chromeMode:'headless-shell', browserExecutable: path.resolve('.cache/chromium/chrome-headless-shell-win64/chrome-headless-shell.exe') });
const page = await browser.newPage({context:null,logLevel:'error',indent:false,pageIndex:0});
await page.goto({url:'http://127.0.0.1:3999/', timeout:30000});
const b64 = {};
for (const [ch, n] of [['\u6C38',114],['\u58A8',111],['\u9759',113]]) b64[ch] = fs.readFileSync('public/fonts/nssc-'+n+'.woff2').toString('base64');
const src = fs.readFileSync('scripts/skelprobe2.js','utf8').replace('__B64__', JSON.stringify(b64));
const res = await page.evaluate(src, 400000);
fs.writeFileSync('out/raw-font.geom2.json', JSON.stringify(res));
console.log(Object.entries(res).map(([k,v]) => k+' strokes='+v.strokes.length+' lens='+v.strokes.map(s=>s.len).sort((a,b)=>b-a).join(',')).join('\n'));
await browser.close({silent:true});
