
const fs=require('node:fs');
const j=JSON.parse(fs.readFileSync('out/raw-font.geom2.json','utf8'));
const N=88, S=320;
for (const ch of ['\u58A8']) {
  const g=j[ch];
  const list=g.strokes.filter(s=>s.len>=25).sort((a,b)=>b.len-a.len);
  const grid=Array.from({length:N},()=>Array(N).fill(' '));
  list.forEach((s,i)=>{ const c='0123456789abcdefghijklmnopqrstuv'[i]; for(const [x,y] of s.pts){const gx=Math.round(x/S*N), gy=Math.round(y/S*N); if(gx>=0&&gy>=0&&gx<N&&gy<N) grid[gy][gx]=c;} });
  console.log(grid.slice(10,80).map(r=>r.join('')).join('\n'));
}
