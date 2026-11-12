
import path from 'node:path';
import fs from 'node:fs';
import {openBrowser} from '@remotion/renderer';
const browser = await openBrowser('chrome', { chromeMode:'headless-shell', browserExecutable: path.resolve('.cache/chromium/chrome-headless-shell-win64/chrome-headless-shell.exe') });
const page = await browser.newPage({context:null,logLevel:'error',indent:false,pageIndex:0});
await page.goto({url:'http://127.0.0.1:3999/blank.html', timeout:30000});
const b64 = fs.readFileSync('public/fonts/nssc-111.woff2').toString('base64');
const src = fs.readFileSync('scripts/ref.js','utf8').replace('__B64__', b64);
const dataUrl = await page.evaluate(src, 60000);
fs.writeFileSync('out/qa/ref-mo.png', Buffer.from(String(dataUrl).split(',')[1], 'base64'));
await browser.close({silent:true});
console.log('ok');
