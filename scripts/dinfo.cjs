
const fs=require('node:fs');
const j=JSON.parse(fs.readFileSync('out/raw-font.geom2.json','utf8'));
const all=(ch)=>j[ch].strokes.filter(s=>s.len>=25);
const info=(ch,ri)=>{const s=all(ch)[ri];const p=s.pts;return '#'+ri+' len'+s.len+' w'+Math.round(Math.max(...s.w))+' from('+p[0].map(Math.round)+') to('+p[p.length-1].map(Math.round)+')';};
console.log('--- 墨');
for (const ri of [6,10,13,9,3,25,5,20,21,7,17,23,11,19,18,12,2,24,0,8,4,15,1,6]) {
  try { console.log(info('\u58A8',ri)); } catch(e){}
}
console.log('--- 静');
for (const ri of [0,7,8,9,17,3,1,5,13,14,15,16,20,21,23,11,6,2,4,10,12,19,22,18]) {
  try { console.log(info('\u9759',ri)); } catch(e){}
}
