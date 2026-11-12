
const fs=require('node:fs');
const j=JSON.parse(fs.readFileSync('out/raw-font.geom2.json','utf8'));
const ch=process.argv[2]||'\u58A8';
const st=j[ch].strokes;
st.forEach((s,i)=>{const xs=s.pts.map(p=>p[0]),ys=s.pts.map(p=>p[1]);
console.log('#'+i,'len'+s.len,'w'+Math.round(Math.max(...s.w)),'x'+Math.min(...xs)+'-'+Math.max(...xs),'y'+Math.min(...ys)+'-'+Math.max(...ys),'seed'+s.seed);});
