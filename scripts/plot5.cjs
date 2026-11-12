
const fs=require('fs');
const j=JSON.parse(fs.readFileSync('out/raw-font.geom2.json','utf8'));
const N=100, S=320;
const out={};
for (const ch of Object.keys(j)) {
  const g=j[ch];
  const list=g.strokes.filter(s=>s.len>=25);
  const grid=Array.from({length:N},()=>Array(N).fill('.'));
  list.forEach((s,i)=>{ const m=i%10; for(const [x,y] of s.pts){const gx=Math.round(x/S*N), gy=Math.round(y/S*N); if(gx>=0&&gy>=0&&gx<N&&gy<N) grid[gy][gx]=String(m);} });
  console.log('=== '+ch+' (index%10)');
  console.log(grid.slice(12,92).map(r=>r.join('')).join('\n'));
}
