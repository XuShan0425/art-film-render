import fs from 'node:fs';
const raw = JSON.parse(fs.readFileSync('out/dtm.json','utf8'));
const out = {};
const D4 = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
for (const [ch,g] of Object.entries(raw)) {
  const S=g.S, W=S;
  const alive=new Uint8Array(S*S);
  for (const [x,y,d] of g.pts) alive[y*W+x]=1;
  const inCell=(x,y)=> x>=0&&y>=0&&x<S&&y<S&&alive[y*W+x]===1;
  const del=new Uint8Array(S*S);
  const countN=(x,y)=>{let n=0;for(const [dx,dy] of D4) if(inCell(x+dx,y+dy)) n++; return n;};
  for (let it=0; it<200; it++) {
    let removed=0;
    for (let pass=0; pass<2; pass++) {
      del.fill(0);
      for (let y=1;y<S-1;y++) for (let x=1;x<S-1;x++) {
        const k=y*W+x; if(!alive[k]) continue;
        const n=countN(x,y);
        if (n<2||n>6) continue;
        // 边界：4连通邻居不为1 → 端点/普通线点不删
        const p2=inCell(x,y-1),p3=inCell(x+1,y-1),p4=inCell(x+1,y),p5=inCell(x+1,y+1),p6=inCell(x,y+1),p7=inCell(x-1,y+1),p8=inCell(x-1,y),p9=inCell(x-1,y-1);
        const arr=[p2,p3,p4,p5,p6,p7,p8,p9];
        let A=0; for(let i=0;i<8;i++) if(!arr[i]&&arr[(i+1)%8]) A++;
        if (A!==1) continue;
        if (pass===0) { if ((!p2||!p4||!p6) && (!p4||!p6||!p8)) continue; }
        else { if ((!p2||!p4||!p8) && (!p2||!p6||!p8)) continue; }
        del[k]=1;
      }
      for (let k=0;k<del.length;k++) if(del[k]){alive[k]=0;removed++;}
    }
    if (!removed) break;
  }
  const pts=[]; for(let y=0;y<S;y++)for(let x=0;x<S;x++) if(alive[y*W+x]) pts.push([x,y]);
  // 连通分量
  const comp=new Map(); let cid=0;
  for (const [x,y] of pts) {
    const k=y*W+x; if (comp.has(k)) continue;
    cid++; const q=[[x,y]]; comp.set(k,cid);
    for (let h=0;h<q.length;h++){ const [cx,cy]=q[h]; for (const [dx,dy] of D4){ const nx=cx+dx,ny=cy+dy; if(!inCell(nx,ny))continue; const nk=ny*W+nx; if(comp.has(nk))continue; comp.set(nk,cid); q.push([nx,ny]); } }
  }
  const groups=new Map(); for(const [x,y] of pts){ const c=comp.get(y*W+x); if(!groups.has(c))groups.set(c,[]); groups.get(c).push([x,y]); }
  // 每个分量：找端点或分叉为起点的最长路径；分叉点多于2则拆多条
  const strokes=[];
  for (const grp of groups.values()) {
    if (grp.length<5) continue;
    const adj=(x,y)=>{const r=[];for(const [dx,dy] of D4){if(inCell(x+dx,y+dy))r.push([x+dx,y+dy]);}return r;};
    const degree=(p)=>adj(p[0],p[1]).length;
    const keyOf=(p)=>p[1]*W+p[0];
    const ends=grp.filter(p=>degree(p)===1);
    const seeds = ends.length? ends : [grp[0]];
    const used=new Set();
    for (const seed of seeds) {
      if (used.has(keyOf(seed)) && degree(seed)===2) continue;
      // BFS 到最远点
      const bfs=(s)=>{ const d=new Map([[keyOf(s),0]]), prev=new Map(), q=[s]; let far=s;
        for(let h=0;h<q.length;h++){const p=q[h]; const dp=d.get(keyOf(p)); if(dp>d.get(keyOf(far))) far=p;
          for(const n of adj(p[0],p[1])){const nk=keyOf(n); if(d.has(nk))continue; d.set(nk,dp+1); prev.set(nk,keyOf(p)); q.push(n);} }
        return {far,prev}; };
      const a1=bfs(seed); const a2=bfs(a1.far);
      const path=[]; let cur=keyOf(a2.far);
      while(cur!==undefined){path.push([cur%W,(cur/W)|0]); cur=a2.prev.get(cur);}
      path.reverse();
      if (path.length<5) continue;
      for (const p of path) used.add(keyOf(p));
      const step=7; const picked=[path[0]];
      for(const p of path){const l=picked[picked.length-1]; if(Math.hypot(p[0]-l[0],p[1]-l[1])>=step) picked.push(p);}
      if(picked[picked.length-1][0]!==path[path.length-1][0]||picked[picked.length-1][1]!==path[path.length-1][1]) picked.push(path[path.length-1]);
      strokes.push({pts:picked,len:path.length});
    }
  }
  out[ch]={S,font:g.font,strokes};
  console.log(ch,'strokes',strokes.length,'lens',strokes.map(s=>s.len).sort((a,b)=>b-a).join(','));
}
fs.writeFileSync('out/skel4.json',JSON.stringify(out));
