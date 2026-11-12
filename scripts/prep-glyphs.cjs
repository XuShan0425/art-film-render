
const fs=require('node:fs');
const j=JSON.parse(fs.readFileSync('out/raw-font.geom2.json','utf8'));
const out={};
const pick = (ch, raws) => {
  const all = j[ch].strokes.filter(s=>s.len>=25);
  return raws.map((ri,order) => { const s=all[ri]; return {pts:s.pts, w:s.w, len:s.len, ri}; });
};
// 永：raw# 2(点/啄 reversed) 0(横折钩rev) 7(横) 3(撇) 5(捺) —— 顺序按书写
out['\u6C38'] = pick('\u6C38', [7,2,0,3,5]).map((s,k)=>({...s, ri:[7,2,0,3,5][k]}));
for (const ch of ['\u58A8','\u9759']) out[ch]=pick(ch, j[ch].strokes.filter(s=>s.len>=25).map((_,i)=>i));
// 归一化（单字独立，覆盖 ±46）
for (const ch of Object.keys(out)) {
  const list = out[ch];
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  for (const s of list) for (const [x,y] of s.pts){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
  const cx=(x0+x1)/2, cy=(y0+y1)/2, side=Math.max(x1-x0,y1-y0), K=92/side;
  out[ch]=list.map(s=>({ ...s,
    pts: s.pts.map(([x,y])=>[ +((x-cx)*K).toFixed(2), +((y-cy)*K).toFixed(2) ]),
    w: s.w.map(v=>+(v*K).toFixed(2)) }));
}
fs.writeFileSync('out/glyphs.raw.json', JSON.stringify(out));
console.log(Object.entries(out).map(([k,v])=>k+':'+v.length).join(' '));
