
const fs=require('node:fs');
const j=JSON.parse(fs.readFileSync('out/raw-font.geom2.json','utf8'));
const ch='\u58A8';
const all=j[ch].strokes.filter(s=>s.len>=25);
const raw=all.map((s,i)=>({i,...s}));
const grp = (set,c)=>{const g=Array.from({length:90},()=>Array(90).fill('.'));for(const ri of set){for(const [x,y] of raw[ri].pts){const gx=Math.round(x/320*90), gy=Math.round(y/320*90); if(gx>=0&&gy>=0&&gx<90&&gy<90) g[gy][gx]=c;}}return g;};
const a=grp([18,19],'a'), b=grp([13,12],'b'), c=grp([14],'c');
console.log('13,12,14 pts count', raw[13].pts.length, raw[12].pts.length, raw[14].pts.length);
console.log('12:', raw[12].pts.slice(0,3).map(p=>p.map(Math.round).join(',')).join(' | '),'...',raw[12].pts.slice(-3).map(p=>p.map(Math.round).join(',')).join(' | '));
console.log('13:', raw[13].pts.slice(0,3).map(p=>p.map(Math.round).join(',')).join(' | '),'...',raw[13].pts.slice(-3).map(p=>p.map(Math.round).join(',')).join(' | '));
console.log('14:', raw[14].pts.slice(0,3).map(p=>p.map(Math.round).join(',')).join(' | '),'...',raw[14].pts.slice(-3).map(p=>p.map(Math.round).join(',')).join(' | '));
// 可视 patch
const A=raw[13].pts, B=raw[12].pts;
const minx=Math.min(...A.map(p=>p[0]),...B.map(p=>p[0]))-3, maxx=Math.max(...A.map(p=>p[0]),...B.map(p=>p[0]))+3;
const miny=Math.min(...A.map(p=>p[1]),...B.map(p=>p[1]))-3, maxy=Math.max(...A.map(p=>p[1]),...B.map(p=>p[1]))+3;
const W=Math.ceil(maxx-minx), H=Math.ceil(maxy-miny);
const g=Array.from({length:H},()=>Array(W).fill(' '));
for(const [x,y] of A){g[Math.round(y-miny)][Math.round(x-minx)]='a';}
for(const [x,y] of B){g[Math.round(y-miny)][Math.round(x-minx)]='b';}
console.log(g.map(r=>r.join('')).join('\n'));
