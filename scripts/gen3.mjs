
import fs from 'node:fs';
const j = JSON.parse(fs.readFileSync('out/raw-font.geom2.json','utf8'));
const CHAR = { MO: '\u58A8', JING: '\u9759' };
const ORDER = {
  MO: [17,16,2,3,6,10,19,18,20,21,22,23,24,25,14,15,1,0,13,7,11,12,4,5,8,9],
  JING: [13,12,0,7,14,2,17,16,15,21,18,20,23,4,1,10,6,5,8,9,3,22,19,11],
};
const resample = (pts, minStep) => {
  const out = [pts[0]];
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = out[out.length-1], b = pts[i];
    const d = Math.hypot(b[0]-a[0], b[1]-a[1]);
    if (d >= minStep) out.push(b);
  }
  return out;
};
const nearestW = (s, p) => { let best=1e9, w=3; for (let k=0;k<s.pts.length;k++){const d=Math.hypot(p[0]-s.pts[k][0],p[1]-s.pts[k][1]); if(d<best){best=d;w=s.w[Math.min(k,s.w.length-1)];}} return w; };
const smooth = (pts, iters) => {
  let p = pts.map(q=>[q[0],q[1]]);
  for (let it=0; it<iters; it++) {
    const n = p.length;
    p = p.map((q,i)=> i===0||i===n-1 ? q : [ (p[i-1][0]+2*q[0]+p[i+1][0])/4, (p[i-1][1]+2*q[1]+p[i+1][1])/4 ]);
  }
  return p;
};
for (const key of ['MO','JING']) {
  const ch = CHAR[key];
  const all = j[ch].strokes.filter(s => s.len >= 25);
  // 横竖长笔 width 提升到 5.2，让视觉骨线接近字体笔画厚度的一半
  const items = ORDER[key].map((ri,k)=>{
    const s = all[ri];
    const pts0 = smooth(resample(s.pts, 1.0), 2);
    const w0 = pts0.map(p=>nearestW(s,p));
    const w1 = w0.map((_,i)=>{let sum=0,n=0;for(let d=-2;d<=2;d++){const v=w0[i+d];if(v!==undefined){sum+=v;n++;}}return sum/n;});
    const ws = w1.map((v,i)=>{
      const t = i/(w1.length-1);
      const head = t < 0.2 ? 1.0 + 3.2*(1 - t/0.2) : 1;
      const tail = t > 0.8 ? 1.0 + 2.2*((t-0.8)/0.2) : 1;
      return Math.max(2.6, v*head*tail);
    });
    return { ri, order:k, len:s.len, pts:pts0, w:ws };
  });
  let len = 0;
  for (const s of items) { s.plen = [0]; for (let i=1;i<s.pts.length;i++){ const d=Math.hypot(s.pts[i][0]-s.pts[i-1][0], s.pts[i][1]-s.pts[i-1][1]); s.plen.push(s.plen[i-1]+d); } len += s.plen[s.plen.length-1]; }
  const total = len;
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  for (const s of items) for (const [x,y] of s.pts){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
  const cx=(x0+x1)/2, cy=(y0+y1)/2, side=Math.max(x1-x0,y1-y0), K=95/side;
  const out = items.map(s=>({ ri:s.ri, order:s.order, len:s.len, plen:s.plen.map(v=>+v.toFixed(1)),
    pts: s.pts.map(([x,y]) => [+((x-cx)*K).toFixed(2), +((y-cy)*K).toFixed(2)]),
    w: s.w.map(v => +(v*K).toFixed(2)) }));
  fs.writeFileSync('out/glyph-' + key + '.json', JSON.stringify({total: +total.toFixed(1), strokes: out}));
  console.log(key, out.length, 'total pen length', (total*K).toFixed(0));
}
