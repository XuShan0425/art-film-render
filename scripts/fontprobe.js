(async () => {
  const b64 = __B64__;
  const out = {};
  for (const ch of Object.keys(b64)) {
    const bin = atob(b64[ch]);
    const buf = new Uint8Array(bin.length);
    for (let i=0;i<bin.length;i++) buf[i] = bin.charCodeAt(i);
    const face = new FontFace('T'+ch.charCodeAt(0), buf.buffer, {weight:'700'});
    await face.load(); document.fonts.add(face);
    const S=320; const c=new OffscreenCanvas(S,S); const ctx=c.getContext('2d');
    ctx.fillStyle='#000'; ctx.fillRect(0,0,S,S); ctx.fillStyle='#fff';
    ctx.font='700 270px T'+ch.charCodeAt(0); ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(ch, S/2, S/2);
    const d = ctx.getImageData(0,0,S,S).data;
    let minX=1e9,minY=1e9,maxX=-1e9,maxY=-1e9,n=0;
    for (let y=0;y<S;y++) for (let x=0;x<S;x++) if (d[(y*S+x)*4] > 110) { n++; if(x<minX)minX=x; if(x>maxX)maxX=x; if(y<minY)minY=y; if(y>maxY)maxY=y; }
    out[ch] = {S:S, bbox:[minX,minY,maxX,maxY], count:n};
  }
  return out;
})()
