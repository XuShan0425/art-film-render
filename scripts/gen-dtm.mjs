import path from 'node:path';
import fs from 'node:fs';
import {openBrowser} from '@remotion/renderer';

const CHARS = ['永','墨','静'];
const S = 320;          // 光栅画布边长
const FONT_PX = 270;    // 字号

const browser = await openBrowser('chrome', { chromeMode:'headless-shell', browserExecutable: path.resolve('.cache/chs/chrome-headless-shell-win64/chrome-headless-shell.exe') });
const page = await browser.newPage({context:null,logLevel:'error',indent:false,pageIndex:0});
await page.goto({url:'http://127.0.0.1:3999/', timeout:30000});

const out = {};
for (const ch of CHARS) {
  const raw = await page.evaluate(`(() => {
    const S=${S}, c=new OffscreenCanvas(S,S), ctx=c.getContext('2d');
    ctx.fillStyle='#000'; ctx.fillRect(0,0,S,S); ctx.fillStyle='#fff';
    ctx.font='500 ${FONT_PX}px "Microsoft YaHei"'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('${ch}', S/2, S/2);
    const d=ctx.getImageData(0,0,S,S).data;
    const px=(x,y)=>x>=0&&y>=0&&x<S&&y<S&&d[(y*S+x)*4]>110;
    const dist=new Int16Array(S*S).fill(-1); const q=[];
    for(let y=0;y<S;y++)for(let x=0;x<S;x++){ if(!px(x,y)){dist[y*S+x]=0;q.push(y*S+x);} }
    for(let h=0;h<q.length;h++){ const k=q[h], x=k%S, y=(k/S)|0; const dv=dist[k];
      if(x>0){const nk=k-1; if(dist[nk]===-1){dist[nk]=dv+1;q.push(nk);}}
      if(x<S-1){const nk=k+1; if(dist[nk]===-1){dist[nk]=dv+1;q.push(nk);}}
      if(y>0){const nk=k-S; if(dist[nk]===-1){dist[nk]=dv+1;q.push(nk);}}
      if(y<S-1){const nk=k+S; if(dist[nk]===-1){dist[nk]=dv+1;q.push(nk);}} }
    const arr=[]; for(let k=0;k<dist.length;k++) if(dist[k]>0) arr.push([k%S, (k/S)|0, dist[k]]);
    return arr;
  })()`, 120000);
  out[ch] = { S, font: FONT_PX, pts: raw };
  console.log(ch, 'in-ink pts', raw.length);
}
await browser.close({silent:true});
fs.writeFileSync('out/dtm.json', JSON.stringify(out));
console.log('saved');
