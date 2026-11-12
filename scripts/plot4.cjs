
const fs=require('fs');
const j=JSON.parse(fs.readFileSync('out/raw-font.geom2.json','utf8'));
for (const ch of Object.keys(j)) {
  const g=j[ch]; const N=100;
  const grid=Array.from({length:N},()=>Array(N).fill(' '));
  const list=g.strokes.filter(s=>s.len>=25).sort((a,b)=>b.len-a.len);
  console.log('=== '+ch+' ===');
  console.log(list.map((s,i)=>(i+1)+':len'+s.len+' w'+Math.max(...s.w)+' start('+s.pts[0].map(v=>Math.round(v/g.S*100)).join(',')+') end('+s.pts[s.pts.length-1].map(v=>Math.round(v/g.S*100)).join(',')+')').join('\n'));
}
