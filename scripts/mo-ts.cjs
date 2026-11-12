
const fs = require('node:fs');
const src = fs.readFileSync('src/lib/glyph-mo.json','utf8');
const obj = JSON.parse(src);
const out = { STROKES: obj['\u58A8'] };
fs.writeFileSync('src/lib/glyphMo.ts', 'export type Stroke = { ri: number; len: number; pts: [number, number][]; w: number[] };\nexport const MO: Stroke[] = ' + JSON.stringify(out.STROKES) + ';\n');
console.log(out.STROKES.length);
