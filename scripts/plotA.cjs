
const fs = require('node:fs');
const j = JSON.parse(fs.readFileSync('out/raw-font.geom2.json','utf8'));
const S = 320, N = 128;
const dup = (s) => s.split('').map(c=>c+c).join('');
for (const ch of Object.keys(j)) {
  const g = j[ch];
  const list = g.strokes.filter(s=>s.len>=25).sort((a,b)=>b.len-a.len);
  const grid = Array.from({length:N},()=>Array(N).fill('.'));
  list.forEach((s,i)=>{
    const c = '0123456789abcdefghijklmnopqrstuvwxyz'[i];
    s.pts.forEach(([x,y],k)=>{
      if (k % 3) return;
      const gx = Math.round(x/S*N), gy = Math.round(y/S*N);
      if (gx>=0&&gy>=0&&gx<N&&gy<N) grid[gy][gx]=c;
    });
  });
  console.log('\u2550\u2550 '+ch);
  console.log(grid.map(r=>dup(r.join(''))).join('\n'));
}
