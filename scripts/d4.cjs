
const fs=require('node:fs');
const j=JSON.parse(fs.readFileSync('out/raw-font.geom2.json','utf8'));
const raw=j['\u58A8'].strokes;
raw.forEach((s,i)=>{
  if (!(s.len<=20)) return;
  const xs=s.pts.map(p=>p[0]), ys=s.pts.map(p=>p[1]);
  console.log('#'+i,'len'+s.len,'w'+Math.round(Math.max(...s.w)),'x'+Math.min(...xs)+'-'+Math.max(...xs),'y'+Math.min(...ys)+'-'+Math.max(...ys),'n'+s.pts.length,'seed'+s.seed);
});
console.log('total raw', raw.length);
