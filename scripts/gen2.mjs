
import fs from 'node:fs';
const j = JSON.parse(fs.readFileSync('out/raw-font.geom2.json','utf8'));
const CHAR = { MO: '\u58A8', JING: '\u9759' };
const ORDER = {
  MO: [17,16,2,3,6,10,19,18,20,21,22,23,24,25,14,15,1,0,13,7,11,12,4,5,8,9],
  JING: [13,12,0,7,14,2,17,16,15,21,18,20,23,4,1,10,6,5,8,9,3,22,19,11],
};
// 横画改成：先起笔顿点、再匀速拖动、末端加重（书法的起收笔）
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
for (const key of ['MO','JING']) {
  const ch = CHAR[key];
  const all = j[ch].strokes.filter(s => s.len >= 25);
  const items = ORDER[key].map((ri,k)=>{
    const s = all[ri];
    const pts = s.pts.map(p=>[p[0],p[1]]);
    const w = s.w.map((v,i)=>{
      const t = i/(s.w.length-1);
      const head = t < 0.18 ? 1.0 + 0.55*(1 - t/0.18) : 1;
      const tail = t > 0.86 ? 1.0 + 0.35*((t-0.86)/0.14) : 1;
      return v * head * tail;
    });
    return { ri, order:k, len:s.len, pts, w };
  });
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  for (const s of items) for (const [x,y] of s.pts){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
  const cx=(x0+x1)/2, cy=(y0+y1)/2, side=Math.max(x1-x0,y1-y0), K=92/side;
  const out = items.map(s=>({ ri:s.ri, order:s.order, len:s.len,
    pts: s.pts.map(([x,y]) => [+((x-cx)*K).toFixed(2), +((y-cy)*K).toFixed(2)]),
    w: s.w.map(v => +Math.max(1.2, v*K).toFixed(2)) }));
  fs.writeFileSync('out/glyph-' + key + '.json', JSON.stringify(out));
  console.log(key, out.length);
}
