
const fs=require('node:fs');
const j=JSON.parse(fs.readFileSync('out/raw-font.geom2.json','utf8'));
const all=(ch)=>j[ch].strokes.filter(s=>s.len>=25);
const area=(s)=>s.pts.reduce((a,p)=>a+p[0]*0.0+0,0);
// 打印每笔在 100 网格上的分布：横/竖/点
const cls=(s)=>{const p=s.pts; const w=Math.max(...p.map(q=>q[0]))-Math.min(...p.map(q=>q[0])); const h=Math.max(...p.map(q=>q[1]))-Math.min(...p.map(q=>q[1])); return (h>w*2.2?'V':w>h*2.2?'H':'D');};
for (const ch of ['\u58A8','\u9759']) {
  console.log('== '+ch);
  all(ch).forEach((s,ri)=>{ const p=s.pts; const xs=p.map(q=>q[0]), ys=p.map(q=>q[1]);
    console.log('#'+ri, cls(s), 'x'+Math.round(Math.min(...xs))+'-'+Math.round(Math.max(...xs)), 'y'+Math.round(Math.min(...ys))+'-'+Math.round(Math.max(...ys)), 'w'+Math.round(Math.max(...s.w)));
  });
}
