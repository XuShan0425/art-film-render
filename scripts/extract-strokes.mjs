import fs from 'node:fs';
const j = JSON.parse(fs.readFileSync('out/raw-font.geom.json','utf8'));
const CH = ['永','墨','静'];
const PAD = 6, BOX = 100;
const res = {};
for (const ch of CH) {
  const g = j[ch];
  const all = g.strokes.flatMap(s=>s.pts);
  const minX = Math.min(...all.map(p=>p[0])), maxX = Math.max(...all.map(p=>p[0]));
  const minY = Math.min(...all.map(p=>p[1])), maxY = Math.max(...all.map(p=>p[1]));
  const span = Math.max(maxX-minX, maxY-minY);
  const k = (BOX - 2*PAD) / span;
  const ox = (BOX - (maxX-minX)*k)/2 - minX*k;
  const oy = (BOX - (maxY-minY)*k)/2 - minY*k;
  res[ch] = g.strokes
    .filter(s => s.len >= 20)
    .map(s => ({
      pts: s.pts.map(([x,y]) => [ +((x*k+ox).toFixed(2)), +((y*k+oy).toFixed(2)) ]),
      w: +((s.w*k).toFixed(2)),
      len: s.len,
    }));
}
const ts = '// 自动生成：scripts/extract-strokes.mjs 从 Noto Serif SC 700 子集光栅化 → 距离变换 → Zhang-Suen 细化 → 走线提取。\n' +
  '// 坐标单位是 100×100 的字面方框，原点左上，y 向下；w 是笔画宽度（同单位）。\n' +
  'export type StrokePts = { pts: [number, number][]; w: number };\n\n' +
  'export const STROKES: Record<string, StrokePts[]> = ' + JSON.stringify(Object.fromEntries(Object.entries(res).map(([c,list])=>[c, list.map(({pts,w})=>({pts,w}))])), null, 0) + ';\n';
fs.writeFileSync('src/lib/strokesData.ts', ts);
console.log(Object.entries(res).map(([c,l])=>c+' '+l.length+' pts='+l.map(s=>s.pts.length).join('/')+' w='+l.map(s=>s.w).join('/')).join('\n'));
console.log('file bytes', fs.statSync('src/lib/strokesData.ts').size);
