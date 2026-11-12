import path from 'node:path';
import {openBrowser} from '@remotion/renderer';
const browser = await openBrowser('chrome', { chromeMode:'headless-shell', browserExecutable: path.resolve('.cache/chs/chrome-headless-shell-win64/chrome-headless-shell.exe') });
const page = await browser.newPage({context:null,logLevel:'error',indent:false,pageIndex:0});
await page.goto({url:'http://127.0.0.1:3999/', timeout:30000});
const res = await page.evaluate(`(() => {
  const S=320, c=new OffscreenCanvas(S,S), ctx=c.getContext('2d');
  ctx.fillStyle='#000'; ctx.fillRect(0,0,S,S); ctx.fillStyle='#fff';
  ctx.font='500 270px "Microsoft YaHei"'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('永',S/2,S/2);
  const d=ctx.getImageData(0,0,S,S).data;
  const px=(x,y)=>d[(y*S+x)*4]>110;
  const rows=[];
  for(let y=60;y<260;y+=6){ let line=''; for(let x=40;x<290;x+=3){ line += px(x,y)?'#':'.'; } rows.push(String(y).padStart(3)+line); }
  return rows;
})()`, 60000);
console.log(res.join('\\n'));
await browser.close({silent:true});
