
const fs=require('node:fs');
const src=fs.readFileSync('src/lib/glyphData.ts','utf8');
const m=src.match(/export const MO: StrokeSpec\[\] = (\[.*?\]);/s);
const MO=JSON.parse(m[1]);
MO.forEach((s,i)=>{
  const xs=s.pts.map(p=>p[0]), ys=s.pts.map(p=>p[1]);
  console.log('#'+i,'ri'+s.ri,'n'+s.pts.length,'x'+Math.min(...xs).toFixed(0)+'-'+Math.max(...xs).toFixed(0),'y'+Math.min(...ys).toFixed(0)+'-'+Math.max(...ys).toFixed(0),'w'+Math.max(...s.w).toFixed(1),'l'+s.len.toFixed(0));
});
console.log('sample pts #17', JSON.stringify(MO[17].pts.slice(0,12)));
