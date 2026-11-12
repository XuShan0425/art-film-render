
const fs=require('node:fs');
const j=JSON.parse(fs.readFileSync('out/raw-font.geom2.json','utf8'));
const N=80;
for (const ch of Object.keys(j)) {
  const g=j[ch];
  const list=g.strokes.filter(s=>s.len>=25).sort((a,b)=>b.len-a.len);
  const grid=Array.from({length:N},()=>Array(N).fill(' '));
  list.forEach((s,i)=>{ const c = '0123456789ABCDEFGHIJ'[i] || '@'; for(const [x,y] of s.pts){const gx=Math.round(x/320*N*0.9+4), gy=Math.round(y/320*N*0.9+4); if(gx>=0&&gy>=0&&gx<N&&gy<N) grid[gy][gx]=c;} });
  console.log('=== '+ch+'  (sorted by len; 0=longest)');
  console.log(grid.map(r=>r.join('')).join('\n'));
}
