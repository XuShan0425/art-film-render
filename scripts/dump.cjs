
const fs = require('node:fs');
const j = JSON.parse(fs.readFileSync('out/raw-font.geom2.json','utf8'));
for (const ch of Object.keys(j)) {
  const g=j[ch];
  const list=g.strokes.filter(s=>s.len>=25);
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  for (const s of list) for (const [x,y] of s.pts){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
  console.log('== '+ch,'bbox',[x0,y0,x1,y1].map(v=>Math.round(v)).join(','));
  list.forEach((s,i)=>{ const p=s.pts; console.log('  #'+i,'len'+s.len,'w'+Math.round(s.w[0])+'-'+Math.round(s.w[s.w.length-1]), 'from',p[0].map(Math.round).join(','), 'to',p[p.length-1].map(Math.round).join(',')); });
}
