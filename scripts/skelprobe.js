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
  // 距离变换（BFS from outside）
  const dist = new Int16Array(S*S).fill(-1); const q=[];
  for (let y=0;y<S;y++) for (let x=0;x<S;x++) if (!ink[y*W+x]) { dist[y*W+x]=0; q.push(y*W+x); }
  for (let h=0;h<q.length;h++){ const k=q[h], x=k%W, y=(k/W)|0, dv=dist[k];
    if(x>0){const nk=k-1; if(dist[nk]===-1){dist[nk]=dv+1;q.push(nk);}}
    if(x<S-1){const nk=k+1; if(dist[nk]===-1){dist[nk]=dv+1;q.push(nk);}}
    if(y>0){const nk=k-S; if(dist[nk]===-1){dist[nk]=dv+1;q.push(nk);}}
    if(y<S-1){const nk=k+S; if(dist[nk]===-1){dist[nk]=dv+1;q.push(nk);}} }
  // Zhang-Suen 细化
  const alive = new Uint8Array(ink);
  const del = new Uint8Array(S*S);
  const at=(x,y)=> (x>=0&&y>=0&&x<S&&y<S&&alive[y*W+x])?1:0;
  for (let it=0; it<300; it++) {
    let removed=0;
    for (let pass=0; pass<2; pass++) {
      del.fill(0);
      for (let y=1;y<S-1;y++) for (let x=1;x<S-1;x++) {
        const k=y*W+x; if(!alive[k]) continue;
        const p2=at(x,y-1),p3=at(x+1,y-1),p4=at(x+1,y),p5=at(x+1,y+1),p6=at(x,y+1),p7=at(x-1,y+1),p8=at(x-1,y),p9=at(x-1,y-1);
        const arr=[p2,p3,p4,p5,p6,p7,p8,p9];
        let B=0; for(const v of arr) if(v) B++;
        if (B<2||B>6) continue;
        let A=0; for(let i=0;i<8;i++) if(!arr[i]&&arr[(i+1)%8]) A++;
        if (A!==1) continue;
        if (pass===0) { if(p2&&p4&&p6) continue; if(p4&&p6&&p8) continue; }
        else { if(p2&&p4&&p8) continue; if(p2&&p6&&p8) continue; }
        del[k]=1;
      }
      for (let k=0;k<del.length;k++) if(del[k]){alive[k]=0;removed++;}
    }
    if(!removed) break;
  }
  // 连通分量 + 贪心走线
  const D4=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
  const see = (x,y)=> (x>=0&&y>=0&&x<S&&y<S&&alive[y*W+x])?1:0;
  const adj=(x,y)=>{const r=[];for(const [dx,dy] of D4) if(see(x+dx,y+dy)) r.push([x+dx,y+dy]); return r;};
  const key=(x,y)=>y*W+x;
  const seenComp=new Uint8Array(S*S); const groups=[];
  for (let y=0;y<S;y++) for (let x=0;x<S;x++) {
    if(!alive[key(x,y)]||seenComp[key(x,y)]) continue;
    const grp=[[x,y]]; seenComp[key(x,y)]=1;
    for(let h=0;h<grp.length;h++){ const [cx,cy]=grp[h]; for(const [dx,dy] of D4){const nx=cx+dx,ny=cy+dy; if(!see(nx,ny)||seenComp[key(nx,ny)])continue; seenComp[key(nx,ny)]=1; grp.push([nx,ny]);} }
    groups.push(grp);
  }
  const strokes=[];
  for (const grp of groups) {
    if (grp.length<6) continue;
    const deg=(p)=>adj(p[0],p[1]).length;
    const walk=(s)=>{
      const path=[s]; const used=new Set([key(s[0],s[1])]);
      let prev=null, cur=s;
      for(;;){
        const nb=adj(cur[0],cur[1]).filter(n=>!used.has(key(n[0],n[1])));
        if(!nb.length) break;
        let nxt=nb[0];
        if(nb.length>1&&prev){
          const vx=cur[0]-prev[0], vy=cur[1]-prev[1]; let bs=-2;
          for(const n of nb){const wx=n[0]-cur[0], wy=n[1]-cur[1]; const dot=(vx*wx+vy*wy)/(Math.hypot(vx,vy)*Math.hypot(wx,wy)||1); if(dot>bs){bs=dot;nxt=n;}}
        }
        used.add(key(nxt[0],nxt[1])); path.push(nxt); prev=cur; cur=nxt;
        if(path.length>4000) break;
      }
      return path;
    };
    const ends = grp.filter(p=>deg(p)===1);
    const starts = ends.length ? ends : [grp.reduce((a,b)=>deg(a)>deg(b)?a:b)];
    const usedPts=new Set();
    for (const s of starts) {
      if (usedPts.has(key(s[0],s[1]))) continue;
      const path = walk(s);
      if (path.length<8) continue;
      for(const p of path) usedPts.add(key(p[0],p[1]));
      const step=6; const picked=[path[0]];
      for(const p of path){const l=picked[picked.length-1]; if(Math.hypot(p[0]-l[0],p[1]-l[1])>=step) picked.push(p);}
      const e=path[path.length-1]; const l=picked[picked.length-1]; if(l[0]!==e[0]||l[1]!==e[1]) picked.push(e);
      const ws = path.map(p=>dist[key(p[0],p[1])]); ws.sort((a,b)=>a-b);
      const med = ws[Math.floor(ws.length/2)];
      strokes.push({pts: picked, w: Math.max(6, med*2), len: path.length});
    }
  }
  strokes.sort((a,b)=>b.len-a.len);
  out[ch] = {S, strokes};
}
return out;
})()
