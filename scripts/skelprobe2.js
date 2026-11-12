
(async () => {
const b64 = __B64__;
const S = 320;
const out = {};
for (const ch of Object.keys(b64)) {
  const bin = atob(b64[ch]); const buf = new Uint8Array(bin.length);
  for (let i=0;i<bin.length;i++) buf[i] = bin.charCodeAt(i);
  const fam = 'T'+ch.charCodeAt(0);
  const face = new FontFace(fam, buf.buffer, {weight:'700'});
  await face.load(); document.fonts.add(face);
  const c = new OffscreenCanvas(S,S); const ctx = c.getContext('2d');
  ctx.fillStyle='#000'; ctx.fillRect(0,0,S,S); ctx.fillStyle='#fff';
  ctx.font='700 270px '+fam; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(ch, S/2, S/2);
  const d = ctx.getImageData(0,0,S,S).data;
  const W=S;
  const ink = new Uint8Array(S*S);
  for (let k=0;k<S*S;k++) ink[k] = d[k*4] > 110 ? 1 : 0;
  // 距离变换（从外部 BFS）
  const dist = new Int16Array(S*S).fill(-1); const q=[];
  for (let y=0;y<S;y++) for (let x=0;x<S;x++) if (!ink[y*W+x]) { dist[y*W+x]=0; q.push(y*W+x); }
  for (let h=0;h<q.length;h++){ const k=q[h], x=k%W, y=(k/W)|0, dv=dist[k];
    if(x>0){const nk=k-1; if(dist[nk]===-1){dist[nk]=dv+1;q.push(nk);}}
    if(x<S-1){const nk=k+1; if(dist[nk]===-1){dist[nk]=dv+1;q.push(nk);}}
    if(y>0){const nk=k-S; if(dist[nk]===-1){dist[nk]=dv+1;q.push(nk);}}
    if(y<S-1){const nk=k+S; if(dist[nk]===-1){dist[nk]=dv+1;q.push(nk);}} }
  const distAt=(x,y)=> (x>=0&&y>=0&&x<S&&y<S)?dist[y*W+x]:0;
  const nearD = (x,y) => { let m=0; for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){ const v=distAt(x+dx,y+dy); if(v>m)m=v; } return m; };
  const inkAt=(x,y)=> (x>=0&&y>=0&&x<S&&y<S&&ink[y*W+x])?1:0;
  const D4=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
  const strokes=[];
  const alive = new Uint8Array(ink);
  const see=(x,y)=> (x>=0&&y>=0&&x<S&&y<S&&alive[y*W+x])?1:0;
  const erase=(cx,cy,rad)=>{ for(let y=Math.floor(cy-rad);y<=cy+rad;y++) for(let x=Math.floor(cx-rad);x<=cx+rad;x++){ if(x<0||y<0||x>=S||y>=S) continue; if((x-cx)*(x-cx)+(y-cy)*(y-cy)<=rad*rad) alive[y*W+x]=0; } };
  for (let iter=0; iter<40; iter++) {
    // 1) 在剩余墨迹里找"最粗"的点作种子
    let bx=-1, by=-1, bd=0;
    for (let y=0;y<S;y++) for (let x=0;x<S;x++) { if(!alive[y*W+x]) continue; const v=dist[y*W+x]; if (v>bd) { bd=v; bx=x; by=y; } }
    if (bd < 4) break;
    const r = Math.max(4, bd*0.92);
    // 2) 从种子沿"同厚度带"生长：保留 dist 在 [r*0.7, bd] 且连通的像素 → 这根笔画的脊
    const grp=[[bx,by]]; const seen=new Uint8Array(S*S); seen[by*W+bx]=1;
    const lo = Math.max(3, bd*0.55);
    for (let h=0;h<grp.length;h++) {
      const [cx,cy]=grp[h];
      for (const [dx,dy] of D4) {
        const nx=cx+dx, ny=cy+dy;
        if(!see(nx,ny)) continue;
        const nk=ny*W+nx;
        if(seen[nk]) continue;
        if(dist[nk] < lo) continue;
        seen[nk]=1; grp.push([nx,ny]);
      }
    }
    // 3) 起点取该带里最细的端点（笔画起笔处），走线到底
    const adjN=(x,y)=>{const rr=[];for(const [dx,dy] of D4){const nx=x+dx,ny=y+dy; if(see(nx,ny)&&dist[ny*W+nx]>=lo) rr.push([nx,ny]);}return rr;};
    const ends = grp.filter(p=>adjN(p[0],p[1]).length===1);
    const start = ends.length ? ends.reduce((a,b)=> nearD(a[0],a[1])<nearD(b[0],b[1])?a:b) : grp[0];
    const path=[start]; const usedP=new Set([start[1]*W+start[0]]);
    let prev=null, cur=start;
    for(;;){
      const nb = adjN(cur[0],cur[1]).filter(n=>!usedP.has(n[1]*W+n[0]));
      if(!nb.length) break;
      let nxt=nb[0];
      if(nb.length>1 && prev){
        const vx=cur[0]-prev[0], vy=cur[1]-prev[1]; let bs=-2;
        for(const n of nb){const wx=n[0]-cur[0], wy=n[1]-cur[1]; const dot=(vx*wx+vy*wy)/(Math.hypot(vx,vy)*Math.hypot(wx,wy)||1); if(dot>bs){bs=dot;nxt=n;}}
      }
      usedP.add(nxt[1]*W+nxt[0]); path.push(nxt); prev=cur; cur=nxt;
      if(path.length>3000) break;
    }
    if (path.length >= 6) {
      const step=6; const picked=[path[0]];
      for(const p of path){const l=picked[picked.length-1]; if(Math.hypot(p[0]-l[0],p[1]-l[1])>=step) picked.push(p);}
      const e=path[path.length-1]; const l=picked[picked.length-1]; if(l[0]!==e[0]||l[1]!==e[1]) picked.push(e);
      const widths = picked.map(p=>Math.max(3, dist[p[1]*W+p[0]]));
      strokes.push({pts:picked, w: widths, len: path.length, seed: bd});
    }
    // 4) 擦除这根笔画占位
    for (const [x,y] of grp) erase(x,y, Math.max(5, dist[y*W+x])*1.05);
    for (const [x,y] of path) erase(x,y, Math.max(5, dist[y*W+x])*1.0);
    // 也被邻近区域吸收掉：以种子为心擦一遍
    erase(bx,by,r);
  }
  out[ch] = {S, strokes};
}
return out;
})()
