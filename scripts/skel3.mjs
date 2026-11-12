import fs from 'node:fs';
const raw = JSON.parse(fs.readFileSync('out/dtm.json','utf8'));

const MIN_D = 5;
const out = {};

for (const [ch, g] of Object.entries(raw)) {
  const S = g.S, W = S;
  const dist = new Int16Array(S*S).fill(-1);
  for (const [x,y,d] of g.pts) dist[y*W+x] = d;
  const alive = new Uint8Array(S*S); for (let i=0;i<alive.length;i++) alive[i] = dist[i] > 0 ? 1 : 0;
  const D = (x,y) => (x<0||y<0||x>=S||y>=S) ? -1 : dist[y*W+x];

  // Chen-Chung 细化：反复标记可删点直到稳定
  const del = new Uint8Array(S*S);
  const nb = (x,y) => {
    // p2..p9 顺时针，从正上开始
    return [D(x,y-1)>0, D(x+1,y-1)>0, D(x+1,y)>0, D(x+1,y+1)>0, D(x,y+1)>0, D(x-1,y+1)>0, D(x-1,y)>0, D(x-1,y-1)>0];
  };
  for (let iter=0; iter<40; iter++) {
    let changed = 0;
    for (let y=1;y<S-1;y++) for (let x=1;x<S-1;x++) {
      const k = y*W+x;
      if (!alive[k]) continue;
      const p = nb(x,y);
      let B = 0; for (const v of p) if (v) B++;
      if (B < 2 || B > 6) continue;
      let A = 0; for (let i=0;i<8;i++) if (!p[i] && p[(i+1)%8]) A++;
      if (A !== 1) continue;
      if (p[0] && p[2] && p[4]) continue;   // p2*p4*p6
      if (p[2] && p[4] && p[6]) continue;   // p4*p6*p8
      del[k] = 1;
    }
    for (let y=1;y<S-1;y++) for (let x=1;x<S-1;x++) {
      const k = y*W+x;
      if (!alive[k]) continue;
      const p = nb(x,y);
      let B = 0; for (const v of p) if (v) B++;
      if (B < 2 || B > 6) continue;
      let A = 0; for (let i=0;i<8;i++) if (!p[i] && p[(i+1)%8]) A++;
      if (A !== 1) continue;
      if (p[0] && p[2] && p[6]) continue;   // p2*p4*p8
      if (p[0] && p[4] && p[6]) continue;   // p2*p6*p8
      del[k] = 1;
    }
    for (let k=0;k<del.length;k++) if (del[k]) { alive[k] = 0; del[k] = 0; changed++; }
    if (!changed) break;
  }

  // 骨架点集
  const pts = [];
  for (let y=0;y<S;y++) for (let x=0;x<S;x++) if (alive[y*W+x]) pts.push([x,y]);
  // 连通分量（8 邻域）
  const comp = new Map();
  let cid = 0;
  const keyOf = (x,y)=>y*W+x;
  for (const [x,y] of pts) {
    const k = keyOf(x,y);
    if (comp.has(k)) continue;
    cid++;
    const q = [[x,y]]; comp.set(k, cid);
    while (q.length) {
      const [cx,cy] = q.shift();
      for (let dy=-1;dy<=1;dy++) for (let dx=-1;dx<=1;dx++) {
        if (!dx && !dy) continue;
        const nx=cx+dx, ny=cy+dy; if (nx<0||ny<0||nx>=S||ny>=S) continue;
        const nk = keyOf(nx,ny);
        if (comp.has(nk) || !alive[nk]) continue;
        comp.set(nk, cid); q.push([nx,ny]);
      }
    }
  }
  const groups = new Map();
  for (const [x,y] of pts) { const c = comp.get(keyOf(x,y)); if (!groups.has(c)) groups.set(c, []); groups.get(c).push([x,y]); }

  const strokes = [];
  for (const grp of groups.values()) {
    if (grp.length < 6) continue;
    const adj = (x,y) => {
      const r=[]; for (let dy=-1;dy<=1;dy++) for (let dx=-1;dx<=1;dx++) { if (!dx&&!dy) continue; if (alive[keyOf(x+dx,y+dy)]) r.push([x+dx,y+dy]); } return r;
    };
    // 两遍 BFS 求最长路径
    const bfs = (sx,sy) => {
      const dist2 = new Map([[keyOf(sx,sy),0]]), prev = new Map();
      const q = [[sx,sy]]; let far = [sx,sy];
      for (let h=0; h<q.length; h++) {
        const [x,y] = q[h]; const d0 = dist2.get(keyOf(x,y));
        if (d0 > dist2.get(keyOf(far[0],far[1]))) far=[x,y];
        for (const [nx,ny] of adj(x,y)) {
          const nk = keyOf(nx,ny);
          if (dist2.has(nk)) continue;
          dist2.set(nk, d0+1); prev.set(nk, keyOf(x,y)); q.push([nx,ny]);
        }
      }
      return { far, prev, dist2 };
    };
    let s = grp[0];
    const a1 = bfs(s[0], s[1]);
    const a2 = bfs(a1.far[0], a1.far[1]);
    const path = [];
    let cur = keyOf(a2.far[0], a2.far[1]);
    while (cur !== undefined) { path.push([cur%W, (cur/W)|0]); cur = a2.prev.get(cur); }
    path.reverse();
    // 抽稀
    const step = 6;
    const picked = [path[0]];
    for (const p of path) { const l = picked[picked.length-1]; if (Math.hypot(p[0]-l[0], p[1]-l[1]) >= step) picked.push(p); }
    if (picked[picked.length-1] !== path[path.length-1]) picked.push(path[path.length-1]);
    if (picked.length < 2) continue;
    const w = Math.max(4, ...path.map(([x,y])=>Math.max(1,D(x,y)))) * 2.05;
    strokes.push({ pts: picked, w, len: path.length });
  }

  strokes.sort((a,b)=>b.len-a.len);
  out[ch] = { S, font: g.font, strokes: strokes.map(s=>({pts:s.pts, w:s.w})) };
  console.log(ch, 'strokes', strokes.length, '| lens', strokes.map(s=>s.len).join(','));
}
fs.writeFileSync('out/skel3.json', JSON.stringify(out));
