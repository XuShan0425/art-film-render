
const fs=require('node:fs');
const j=JSON.parse(fs.readFileSync('out/raw-font.geom2.json','utf8'));
const idx = {'\u58A8':[20,17,18,19,22,23,0,1,6,7,11,12,13,21,2,24,3,4,5,8,9,10,14,15,16,25]};
const out={};
const all = j['\u58A8'].strokes.filter(s=>s.len>=25);
// 每笔按"简单开放路径"处理：取 pts 数组本身
const list = idx['\u58A8'].map((ri,order)=>({ri, order, pts: all[ri].pts, w: all[ri].w, len: all[ri].len}));
let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
for (const s of list) for (const [x,y] of s.pts){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
const cx=(x0+x1)/2, cy=(y0+y1)/2, side=Math.max(x1-x0,y1-y0), K=92/side;
out['\u58A8'] = list.map(s=>({ ri:s.ri, len:s.len,
  pts: s.pts.map(([x,y])=>[ +((x-cx)*K).toFixed(2), +((y-cy)*K).toFixed(2) ]),
  w: s.w.map(v=>+(v*K).toFixed(2)) }));
fs.writeFileSync('src/lib/glyph-mo.json', JSON.stringify(out));
console.log(out['\u58A8'].map(s=>s.ri+':len'+s.len+' w'+Math.round(Math.max(...s.w))).join(' '));
