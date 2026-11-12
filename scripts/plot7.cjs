
const fs=require('node:fs');
const j=JSON.parse(fs.readFileSync('out/raw-font.geom2.json','utf8'));
const N=105, S=320;
for (const ch of ['\u58A8','\u9759']) {
  const g=j[ch];
  const list=g.strokes.filter(s=>s.len>=25).sort((a,b)=>b.len-a.len);
  const want = ch==='\u58A8' ? [236,301] : [224,337];
  const grid=Array.from({length:N},()=>Array(N).fill('.'));
  for (const L of want) {
    const a=g.strokes.find(s=>s.len===L);
    const c = L===want[0]?'a':'b';
    for(const [x,y] of a.pts){const gx=Math.round(x/S*N), gy=Math.round(y/S*N); if(gx>=0&&gy>=0&&gx<N&&gy<N) grid[gy][gx]=c;}
    console.log(ch, L, 'from', a.pts[0].map(Math.round).join(','), 'to', a.pts[a.pts.length-1].map(Math.round).join(','), 'npts', a.pts.length);
  }
  console.log(grid.slice(58,100).map(r=>r.join('')).join('\n'));
}
