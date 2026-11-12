import fs from 'node:fs';
const raw = JSON.parse(fs.readFileSync('out/dtm.json','utf8'));
const out = {};
const MIN_D = 6;         // 笔画中线最小半宽
const STEP = 4;          // 骨架生长步长（像素）
const SPARSIFY = 12;     // 抽稀间隔

for (const [ch, g] of Object.entries(raw)) {
  const S = g.S, W = S;
  const dist = new Int16Array(S*S).fill(-1);
  for (const [x,y,d] of g.pts) dist[y*W+x] = d;
  const alive = new Uint8Array(S*S); for (let i=0;i<alive.length;i++) alive[i] = dist[i] > 0 ? 1 : 0;
  const D = (x,y) => (x<0||y<0||x>=S||y>=S) ? -1 : dist[y*W+x];
  const core = (x,y,r) => {
    let n = 0;
    for (let i=0;i<16;i++) {
      const a = i/16*Math.PI*2, dx=Math.cos(a), dy=Math.sin(a);
      let ok = true;
      for (let t=1;t<=r;t++) { if (D(Math.round(x+dx*t), Math.round(y+dy*t)) <= 0) { ok=false; break; } }
      if (ok) n++;
    }
    return n;
  };
  const strokes = [];
  for (let pass=0; pass<60; pass++) {
    // 1) 在活像素里找圆珠得分最高的种子
    let best=null, bestScore=-1, bestR=0;
    for (let y=8;y<S-8;y+=2) for (let x=8;x<S-8;x+=2) {
      if (!alive[y*W+x]) continue;
      const r = Math.min(Math.max(D(x,y)-1, MIN_D), 12);
      const c = core(x,y,r);
      const sc = c + (D(x,y));
      if (c >= 11 && sc > bestScore) { bestScore = sc; best = [x,y]; bestR = r; }
    }
    if (!best) break;
    // 2) 从种子沿圆珠连通域生长中心线
    const seen = new Set([best[1]*W+best[0]]);
    const nodes = [best];
    const q = [best];
    while (q.length) {
      const [x,y] = q.shift();
      for (let i=0;i<16;i++) {
        const a=i/16*Math.PI*2, dx=Math.cos(a), dy=Math.sin(a);
        const nx = Math.round(x+dx*STEP), ny = Math.round(y+dy*STEP);
        if (nx<0||ny<0||nx>=S||ny>=S) continue;
        const k = ny*W+nx;
        if (seen.has(k) || !alive[k]) continue;
        if (core(nx,ny,bestR) < 11) continue;
        seen.add(k); q.push([nx,ny]); nodes.push([nx,ny]);
      }
    }
    // 3) 骨架 = 该域内局部最深的点
    const sk = nodes.filter(([x,y]) => {
      const d = D(x,y);
      for (const [dx,dy] of [[STEP,0],[-STEP,0],[0,STEP],[0,-STEP]]) if (D(x+dx,y+dy) > d) return false;
      return true;
    });
    const skp = sk.length >= 2 ? sk : nodes;
    // 4) 主轴排序 → 中线走向
    const cx = skp.reduce((a,p)=>a+p[0],0)/skp.length;
    const cy = skp.reduce((a,p)=>a+p[1],0)/skp.length;
    const idxOf = new Map(skp.map((p,i)=>[p[1]*W+p[0], i]));
    let sxx=0,syy=0,sxy=0;
    for (const p of skp) { const a=p[0]-cx,b=p[1]-cy; sxx+=a*a; syy+=b*b; sxy+=a*b; }
    const th = 0.5*Math.atan2(2*sxy, sxx-syy);
    const ux=Math.cos(th), uy=Math.sin(th);
    const ordered = skp.slice().sort((p,q)=>((p[0]-cx)*ux+(p[1]-cy)*uy)-((q[0]-cx)*ux+(q[1]-cy)*uy));
    // 5) 抽稀
    const picked=[ordered[0]];
    for (const p of ordered) { const l=picked[picked.length-1]; if (Math.hypot(p[0]-l[0],p[1]-l[1])>=SPARSIFY) picked.push(p); }
    if (picked[picked.length-1]!==ordered[ordered.length-1]) picked.push(ordered[ordered.length-1]);
    const maxd = Math.max(...nodes.map(([x,y])=>D(x,y)));
    strokes.push({ pts: picked.map(p=>[p[0],p[1]]), w: maxd*2.1, n: nodes.length });
    // 6) 擦除该笔画占位（半径 = 最深处）
    const erase = (cx,cy,rad) => { for (let y=Math.floor(cy-rad);y<=cy+rad;y++) for (let x=Math.floor(cx-rad);x<=cx+rad;x++) { if (x<0||y<0||x>=S||y>=S) continue; if ((x-cx)**2+(y-cy)**2 <= rad*rad) alive[y*W+x]=0; } };
    for (const [x,y] of nodes) erase(x,y,Math.max(4, maxd*1.0));
  }
  strokes.sort((a,b)=>b.n-a.n);
  out[ch] = { S, font: g.font, strokes };
  console.log(ch, 'strokes', strokes.length, 'sizes', strokes.map(s=>s.pts.length+'/'+s.n).join(' '));
}
fs.writeFileSync('out/skel2.json', JSON.stringify(out));
