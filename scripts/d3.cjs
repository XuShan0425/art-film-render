
const fs=require('node:fs');
const j=JSON.parse(fs.readFileSync('out/raw-font.geom2.json','utf8'));
console.log(Object.keys(j));
const k=Object.keys(j)[0];
console.log(JSON.stringify(j[k]).slice(0,400));
