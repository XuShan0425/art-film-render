
const fs=require('fs');
const j=JSON.parse(fs.readFileSync('out/raw-font.geom2.json','utf8'));
for (const ch of Object.keys(j)) {
  const g=j[ch]; const N=64;
  const grid=Array.from({length:N},()=>Array(N).fill('.'));
  const cs='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const list=g.strokes.filter(s=>s.len>=25);
  list.forEach((s,i)=>{ for(const [x,y] of s.pts){const gx=Math.round(x/g.S*N), gy=Math.round(y/g.S*N); if(gx>=0&&gy>=0&&gx<N&&gy<N) grid[gy][gx]=cs[i%26];}});
  console.log('== '+ch+' kept '+list.length);
  console.log(grid.map(r=>r.join('')).join('\n'));
}
