
const fs = require('node:fs');
const j = JSON.parse(fs.readFileSync('out/raw-font.geom2.json','utf8'));
const S = 320;
// 书写顺序（raw index）
const ORDER = {
  '\u58A8': [17,16, 2, 3, 6, 10, 19,18, 20,21, 22,23, 24,25, 14,15, 1, 0, 13,7, 11,12, 4, 5, 8, 9],
  '\u9759': [13,12, 0, 7, 14, 2, 17,16,15, 21,18, 20,23, 4, 1, 10, 6, 5, 8, 9, 3, 22,19, 11],
};
const out = {};
for (const ch of Object.keys(ORDER)) {
  const all = j[ch].strokes.filter(s => s.len >= 25);
  const strokes = ORDER[ch].map((ri, k) => ({ ri, order: k, pts: all[ri].pts, w: all[ri].w, len: all[ri].len }));
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  for (const s of strokes) for (const [x,y] of s.pts){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
  const cx=(x0+x1)/2, cy=(y0+y1)/2, side=Math.max(x1-x0,y1-y0), K=92/side;
  out[ch] = strokes.map(s => ({ ri:s.ri, order:s.order, len:s.len,
    pts: s.pts.map(([x,y]) => [+((x-cx)*K).toFixed(2), +((y-cy)*K).toFixed(2)]),
    w: s.w.map(v => +(v*K).toFixed(2)) }));
}
const body = 'export type StrokeSpec = { ri: number; order: number; len: number; pts: [number, number][]; w: number[] };\n' +
  Object.keys(out).map(ch => 'export const ' + (ch==='\u58A8'?'MO':'JING') + ': StrokeSpec[] = ' + JSON.stringify(out[ch]) + ';').join('\n') + '\n';
fs.writeFileSync('src/lib/glyphData.ts', body);
console.log(Object.entries(out).map(([k,v])=>k+':'+v.length).join(' '));
