import fs from 'node:fs';
const raw = JSON.parse(fs.readFileSync('out/dtm.json','utf8'));

const K = 40; // 骨架取样分辨率（沿笔画中线每 40px 骨架路径取一个点，后续贝塞尔平滑）
const out = {};
for (const [ch, g] of Object.entries(raw)) {
  const S = g.S;
  const dist = new Map(); // key -> dist
  for (const [x,y,d] of g.pts) dist.set(y*S+x, d);
  const W = S;
  // 局部最大：半径 5 邻域内没有更深的点
  const isLocalMax = (x,y,d) => {
    const idx = y*W+x;
    if (dist.get(idx-1) > d) return false;
    if (dist.get(idx+1) > d) return false;
    if (dist.get(idx-W) > d) return false;
    if (dist.get(idx+W) > d) return false;
    return true;
  };
  // 每个字形派生出若干条笔画：从种子点沿骨架（局部最大点）生长的连通分量
  const seeds = [];
  for (const [x,y,d] of g.pts) {
    if (y < 1 || y > S-2 || x < 1 || x > S-2) continue;
    if (isLocalMax(x,y,d) && d >= 6) seeds.push([x,y,d]);
  }
  // 连通分量：8 邻域把距离值相近的种子连起来
  const parent = new Map();
  const find = (a) => { while (parent.get(a) !== a) { parent.set(a, parent.get(parent.get(a))); a = parent.get(a); } return a; };
  const union = (a,b) => { const ra=find(a), rb=find(b); if (ra!==rb) parent.set(ra, rb); };
  const key = (x,y)=>y*W+x;
  for (const [x,y] of seeds) parent.set(key(x,y), key(x,y));
  for (const [x,y,d] of seeds) {
    for (let dy=-3; dy<=3; dy++) for (let dx=-3; dx<=3; dx++) {
      if (!dx && !dy) continue;
      const k2 = key(x+dx, y+dy);
      if (!parent.has(k2)) continue;
      const other = dist.get(k2);
      if (Math.abs(other - d) > 3) continue;
      union(key(x,y), k2);
    }
  }
  const comps = new Map();
  for (const [x,y,d] of seeds) {
    const rk = find(key(x,y));
    if (!comps.has(rk)) comps.set(rk, []);
    comps.get(rk).push([x,y,d]);
  }
  const strokes = [];
  for (const pts of comps.values()) {
    if (pts.length < 12) continue;
    // 这条笔画最粗处的一半 = 笔画宽度
    const maxd = Math.max(...pts.map(p=>p[2]));
    // 按主轴投影排序，得到中线走向
    const cx = pts.reduce((a,p)=>a+p[0],0)/pts.length;
    const cy = pts.reduce((a,p)=>a+p[1],0)/pts.length;
    let sxx=0, syy=0, sxy=0;
    for (const p of pts) { const a=p[0]-cx, b=p[1]-cy; sxx+=a*a; syy+=b*b; sxy+=a*b; }
    const th = 0.5*Math.atan2(2*sxy, sxx-syy);
    const ux = Math.cos(th), uy = Math.sin(th);
    pts.sort((p,q)=>((p[0]-cx)*ux+(p[1]-cy)*uy) - ((q[0]-cx)*ux+(q[1]-cy)*uy));
    // 抽稀
    const picked = [pts[0]];
    for (const p of pts) { const last=picked[picked.length-1]; if (Math.hypot(p[0]-last[0], p[1]-last[1]) >= K) picked.push(p); }
    if (picked[picked.length-1] !== pts[pts.length-1]) picked.push(pts[pts.length-1]);
    strokes.push({ pts: picked.map(p=>[p[0],p[1]]), w: maxd*2 });
  }
  // 粗笔画优先画（重的先落）
  strokes.sort((a,b)=>b.w-a.w);
  const total = strokes.reduce((a,s)=>a+s.pts.length,0);
  out[ch] = { S, font: g.font, strokes, totalPts: total };
  console.log(ch, 'strokes', strokes.length, 'pts', total, 'widths', strokes.map(s=>s.w).join(','));
}
fs.writeFileSync('out/skel.json', JSON.stringify(out));
