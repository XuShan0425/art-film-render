
const fs=require('node:fs');
const j=JSON.parse(fs.readFileSync('out/raw-font.geom2.json','utf8'));
for (const ch of ['\u58A8','\u9759']) {
const sorted = j[ch].strokes.filter(s=>s.len>=25).map((s,i)=>({s,i})).sort((a,b)=>b.s.len-a.s.len);
console.log('== '+ch);
sorted.forEach((e,k)=>console.log(k+' -> raw#'+e.i+' len'+e.s.len+' w'+Math.max(...e.s.w)));
}
