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
  for (let it=0; it<300; it++) {
    let removed=0;
    for (let pass=0; pass<2; pass++) {
      del.fill(0);
      for (let y=1;y<S-1;y++) for (let x=1;x<S-1;x++) {
        const k=y*W+x; if(!alive[k]) continue;
        const p2=inCell(x,y-1),p3=inCell(x+1,y-1),p4=inCell(x+1,y),p5=inCell(x+1,y+1),p6=inCell(x,y+1),p7=inCell(x-1,y+1),p8=inCell(x-1,y),p9=inCell(x-1,y-1);
        const arr=[p2,p3,p4,p5,p6,p7,p8,p9];
        let B=0; for(const v of arr) if(v) B++;
        if (B<2||B>6) continue;
        let A=0; for(let i=0;i<8;i++) if(!arr[i]&&arr[(i+1)%8]) A++;
        if (A!==1) continue;
        if (pass===0) { if (p2&&p4&&p6) continue; if (p4&&p6&&p8) continue; }
        else { if (p2&&p4&&p8) continue; if (p2&&p6&&p8) continue; }
        del[k]=1;
      }
      for (let k=0;k<del.length;k++) if(del[k]){alive[k]=0;removed++;}
    }
    if (!removed) break;
  }
  const pts=[]; for(let y=0;y<S;y++)for(let x=0;x<S;x++) if(alive[y*W+x]) pts.push([x,y]);
  const comp=new Map(); let cid=0;
  for (const [x,y] of pts) {
    const k=y*W+x; if (comp.has(k)) continue;
    cid++; const q=[[x,y]]; comp.set(k,cid);
    for (let h=0;h<q.length;h++){ const [cx,cy]=q[h]; for (const [dx,dy] of D4){ const nx=cx+dx,ny=cy+dy; if(!inCell(nx,ny))continue; const nk=ny*W+nx; if(comp.has(nk))continue; comp.set(nk,cid); q.push([nx,ny]); } }
  }
  const groups=new Map(); for(const [x,y] of pts){ const c=comp.get(y*W+x); if(!groups.has(c))groups.set(c,[]); groups.get(c).push([x,y]); }
  const strokes=[];
  for (const grp of groups.values()) {
    if (grp.length<4) continue;
    const adj=(x,y)=>{const r=[];for(const [dx,dy] of D4){if(inCell(x+dx,y+dy))r.push([x+dx,y+dy]);}return r;};
    const keyOf=(p)=>p[1]*W+p[0];
    const deg=(p)=>adj(p[0],p[1]).length;
    // 从端点出发，贪心走到底（每步不回头），遇到分叉挑最直的方向
    const walk=(s)=>{
      const path=[s]; const used=new Set([keyOf(s)]);
      let prev=null, cur=s;
      for(;;){
        const nbrs=adj(cur[0],cur[1]).filter(n=>!used.has(keyOf(n)));
        if(!nbrs.length) break;
        let nxt=nbrs[0];
        if(nbrs.length>1 && prev){
          const vx=cur[0]-prev[0], vy=cur[1]-prev[1];
          let bs=-2;
          for(const n of nbrs){const wx=n[0]-cur[0], wy=n[1]-cur[1]; const dot=(vx*wx+vy*wy)/(Math.hypot(vx,vy)*Math.hypot(wx,wy)||1); if(dot>bs){bs=dot;nxt=n;}}
        }
        used.add(keyOf(nxt)); path.push(nxt); prev=cur; cur=nxt;
        if(path.length>2000) break;
      }
      return path;
    };
    const endpoints = grp.filter(p=>deg(p)===1);
    const starts = endpoints.length ? endpoints : [grp.reduce((a,b)=>deg(a)>deg(b)?a:b)];
    const usedPts=new Set();
    for (const s of starts) {
      if (usedPts.has(keyOf(s))) continue;
      const path=walk(s);
      if (path.length < 8) continue;
      for(const p of path) usedPts.add(keyOf(p));
      const step=7; const picked=[path[0]];
      for(const p of path){const l=picked[picked.length-1]; if(Math.hypot(p[0]-l[0],p[1]-l[1])>=step) picked.push(p);}
      if(picked[picked.length-1][0]!==path[path.length-1][0]||picked[picked.length-1][1]!==path[path.length-1][1]) picked.push(path[path.length-1]);
      strokes.push({pts:picked,len:path.length});
    }
  }
  out[ch]={S,font:g.font,strokes};
  console.log(ch,'strokes',strokes.length,'lens',strokes.map(s=>s.len).sort((a,b)=>b-a).join(','));
}
fs.writeFileSync('out/skel5.json',JSON.stringify(out));
