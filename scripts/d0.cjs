
const fs=require('node:fs');
const j=JSON.parse(fs.readFileSync('out/raw-font.geom2.json','utf8'));
const ch='\u58A8';
const all=j[ch].strokes.filter(s=>s.len>=25);
for (const ri of [0,1]) {
  const p=all[ri].pts;
  console.log('raw#'+ri,'len'+all[ri].len,'npts'+p.length);
  console.log(' w:', all[ri].w.map(v=>Math.round(v)).join(','));
  console.log(' pts:', p.map(q=>q.map(v=>Math.round(v)).join(',')).join(' '));
}
