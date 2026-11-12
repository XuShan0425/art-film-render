import { renderText, extractStrokes } from '../src/lib/glyph.tsx';
const bmp = await renderText({ text: '字', fontSize: 260, weight: 500 });
let n = 0; for (let i=0;i<bmp.bits.length;i++) n += (bmp.bits[i]&255?1:0);
console.log('canvas', bmp.W, bmp.H);
const t0 = Date.now();
const s = extractStrokes(bmp, 7);
console.log('strokes', s.length, 'ms', Date.now()-t0);
for (const st of s) console.log(st.pts.length, Math.round(st.pts[0][0]), Math.round(st.pts[0][1]), '→', Math.round(st.pts.at(-1)[0]), Math.round(st.pts.at(-1)[1]));
process.exit(0);
