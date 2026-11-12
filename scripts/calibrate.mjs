
import fs from 'node:fs';
const j = JSON.parse(fs.readFileSync('out/raw-font.geom2.json','utf8'));
const S=320;
// 手工指定的笔画：idx 为过滤后(len>=25)的下标
const SPEC = {
  '永': [ {i:2, rev:false}, {i:5, rev:true}, {i:1, rev:false}, {i:4, rev:false}, {i:3, rev:false} ],
};
const out = {};
for (const ch of Object.keys(SPEC)) {
  const g = j[ch];
  const list = g.strokes.filter(s => s.len >= 25);
  // 统一 bbox
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  for (const s of list) for (const [x,y] of s.pts) { x0=Math.min(x0,x); y0=Math.min(y0,y); x1=Math.max(x1,x); y1=Math.max(y1,y); }
  const side = Math.max(x1-x0, y1-y0);
  const PAD = 8, K = (100 - PAD*2) / side;
  const map = (x,y) => [ +(((x - (x0+x1)/2) * K)).toFixed(2), +(((y - (y0+y1)/2) * K)).toFixed(2) ];
  const strokes = SPEC[ch].map(({i,rev}) => {
    let pts = list[i].pts.map(([x,y]) => map(x,y));
    if (rev) pts = pts.reverse();
    // 抽稀：去掉过密点，保留拐点
    const simp = [pts[0]];
    for (let k=1;k<pts.length-1;k++) {
      const a=simp[simp.length-1], b=pts[k], c=pts[k+1];
      const cross = (b[0]-a[0])*(c[1]-a[1]) - (b[1]-a[1])*(c[0]-a[0]);
      const d = Math.hypot(b[0]-a[0], b[1]-a[1]);
      if (Math.abs(cross) > 0.35 || d > 7) simp.push(b);
    }
    simp.push(pts[pts.length-1]);
    const wraw = list[i].w.slice(); if (rev) wraw.reverse();
    // 宽度同步抽稀
    const ws = [wraw[0]];
    for (let k=1;k<wraw.length-1;k++) if (simp.includes(pts[k])) ws.push(wraw[k]);
    ws.push(wraw[wraw.length-1]);
    return { pts: simp, w: ws.map(v=>+(v*K).toFixed(2)), len: list[i].len };
  });
  out[ch] = strokes;
}
fs.writeFileSync('out/ship.cal.json', JSON.stringify(out));
for (const ch of Object.keys(out)) console.log(ch, out[ch].map(s=>s.pts.length+'p/'+s.w.length+'w avgw'+Math.round(s.w.reduce((a,b)=>a+b,0)/s.w.length)).join(' | '));
