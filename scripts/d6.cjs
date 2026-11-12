
const fs = require('node:fs');
const j = JSON.parse(fs.readFileSync('out/raw-font.geom2.json','utf8'));
const all = j['\u58A8'].strokes.filter(s => s.len >= 25);
// 输出前 4 笔的原始 w 序列
const ORDER=[17,16,2,3];
ORDER.forEach(ri=>{
  const s=all[ri];
  console.log('#'+ri,'len'+s.len,'nw'+s.w.length,'npts'+s.pts.length);
  console.log(' w:', s.w.map(v=>Math.round(v)).join(','));
  console.log(' first pts:', s.pts.slice(0,4).map(p=>p.join(',')).join(' | '));
});
