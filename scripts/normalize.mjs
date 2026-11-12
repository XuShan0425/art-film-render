import fs from 'node:fs';
const sk = JSON.parse(fs.readFileSync('out/skel5.json','utf8'));
let minX=1e9,minY=1e9,maxX=-1e9,maxY=-1e9;
for (const g of Object.values(sk)) for (const s of g.strokes) for (const [x,y] of s.pts) { if(x<minX)minX=x; if(x>maxX)maxX=x; if(y<minY)minY=y; if(y>maxY)maxY=y; }
const sc = 100 / Math.max(maxX-minX, maxY-minY);
const dtm = JSON.parse(fs.readFileSync('out/dtm.json','utf8'));
const res = {};
for (const [ch,g] of Object.entries(sk)) {
  const S=g.S, W=S;
  const dist=new Int16Array(S*S).fill(-1);
  for (const [x,y,d] of dtm[ch].pts) dist[y*W+x]=d;
  const D=(x,y)=>(x<0||y<0||x>=S||y>=S)?0:Math.max(0,dist[y*W+x]);
  res[ch] = g.strokes
    .filter(s => s.len >= 30)
    .map(s => {
      const rr = s.pts.map(([x,y]) => D(Math.round(x),Math.round(y)) * sc);
      const sorted = rr.slice().sort((a,b)=>a-b);
      const med = sorted[Math.floor(sorted.length/2)];
      const w = 2 * Math.max(med, 2.6);
      return {
        pts: s.pts.map(([x,y]) => [ +(((x-minX)*sc).toFixed(2)), +(((y-minY)*sc).toFixed(2)) ]),
        w: +Math.max(3.2, Math.min(7.2, w)).toFixed(2),
        len: s.len,
      };
    });
  res[ch].sort((a,b)=>b.len-a.len);
  res[ch] = res[ch].map(({pts,w}) => ({pts,w}));
}
fs.writeFileSync('out/strokes-100.json', JSON.stringify(res));
for (const [ch,list] of Object.entries(res)) console.log(ch, list.length, 'widths', list.map(l=>l.w).join(','));
console.log('bytes', fs.statSync('out/strokes-100.json').size);
