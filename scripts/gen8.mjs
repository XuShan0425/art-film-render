
import fs from 'node:fs';
const j = JSON.parse(fs.readFileSync('out/raw-font.geom2.json','utf8'));
const CHAR = { MO: '\u58A8', JING: '\u9759' };
const ORDER = {
  MO: [17,16,2,3,6,10,19,18,20,21,22,23,24,25,14,15,1,0,13,7,11,12,4,5,8,9],
  JING: [13,12,0,7,14,2,17,16,15,21,18,20,23,4,1,10,6,5,8,9,3,22,19,11],
};
const resample = (pts) => { const out=[pts[0]]; for (let i=1;i<pts.length;i++){ const a=out[out.length-1], b=pts[i]; if (Math.hypot(b[0]-a[0],b[1]-a[1])>=1.2) out.push(b);} return out; };
const smooth = (pts, iters) => { let p=pts.map(q=>[q[0],q[1]]); for (let it=0;it<iters;it++){ const n=p.length; p=p.map((q,i)=> i===0||i===n-1 ? q : [ (p[i-1][0]+2*q[0]+p[i+1][0])/4, (p[i-1][1]+2*q[1]+p[i+1][1])/4 ]); } return p; };
const nearestW = (s,p) => { let best=1e9,w=3; for (let k=0;k<s.pts.length;k++){const d=Math.hypot(p[0]-s.pts[k][0],p[1]-s.pts[k][1]); if(d<best){best=d;w=s.w[Math.min(k,s.w.length-1)];}} return w; };
const med = (a)=>{const s=[...a].sort((x,y)=>x-y);return s[Math.floor(s.length/2)];};
for (const key of ['MO','JING']) {
  const ch = CHAR[key];
  const raw = j[ch].strokes;
  const big = raw.map((s,i)=>({s,i})).filter(o=>o.s.len>=25).map(o=>({...o.s, idx:o.i}));
  const orderList = ORDER[key].filter(ri=>big.some(b=>b.idx===ri));
  const rest = big.filter(b=>!orderList.includes(b.idx)).sort((a,b)=>b.len-a.len);
  const seq = orderList.map(ri=>big.find(b=>b.idx===ri)).concat(rest);
  const items = seq.map((s,k)=>{
    const pts0 = smooth(resample(s.pts), 1);
    const mw = med(s.w);
    const w0 = pts0.map(p=>nearestW(s,p));
    const w1 = w0.map((_,i)=>{let a=0,c2=0;for(let d=-2;d<=2;d++){const v=w0[i+d];if(v!==undefined){a+=v;c2++;}}return a/c2;});
    const ws = w1.map((v,i)=>{
      const t = i/(w1.length-1);
      const rel = 0.85 + 0.3 * Math.min(1, Math.max(0, (v - mw*0.75) / (mw*0.6)));
      const head = t < 0.12 ? 0.6 + 0.4*(t/0.12) : 1;
      const tail = t > 0.9 ? 1 - 0.4*((t-0.9)/0.1) : 1;
      return Math.max(1.4, mw * rel * head * tail);
    });
    return { ri:s.idx, order:k, len:s.len, pts:pts0, w:ws };
  });
  // 文字外框（权重更大，保证字形占满画面）
  let minX=1e9,minY=1e9,maxX=-1e9,maxY=-1e9;
  for (const s of items) for (const [x,y] of s.pts){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);}
  // 补足四周 4 个"气息边"：把 bbox 往中心按 1.28 倍收缩，让字有呼吸感
  const padX = (maxX-minX)*0.12, padY = (maxY-minY)*0.12;
  minX-=padX;maxX+=padX;minY-=padY;maxY+=padY;
  let total = 0;
  for (const s of items) { s.plen=[0]; for (let i=1;i<s.pts.length;i++){ const d=Math.hypot(s.pts[i][0]-s.pts[i-1][0], s.pts[i][1]-s.pts[i-1][1]); s.plen.push(+(s.plen[i-1]+d).toFixed(2)); } total += s.plen[s.plen.length-1]; }
  const cx=(minX+maxX)/2, cy=(minY+maxY)/2, side=Math.max(maxX-minX, maxY-minY), K=100/side;
  const out = items.map(s=>({ ri:s.ri, order:s.order, len:s.len,
    plen: s.plen.map(v=>+(v*K).toFixed(1)),
    pts: s.pts.map(([x,y]) => [+((x-cx)*K).toFixed(2), +((y-cy)*K).toFixed(2)]),
    w: s.w.map(v => +(v*K).toFixed(2)) }));
  fs.writeFileSync('out/glyph-' + key + '.json', JSON.stringify({total: +(total*K).toFixed(1), strokes: out}));
  const pts=out.flatMap(s=>s.pts);
  console.log(key,'n',out.length,'total',(total*K).toFixed(0),'bbox',
    Math.min(...pts.map(p=>p[0])).toFixed(0)+'..'+Math.max(...pts.map(p=>p[0])).toFixed(0),
    Math.min(...pts.map(p=>p[1])).toFixed(0)+'..'+Math.max(...pts.map(p=>p[1])).toFixed(0));
}
