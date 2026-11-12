
(async () => {
  const S=1024;
  const bin = atob('__B64__'); const buf=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++) buf[i]=bin.charCodeAt(i);
  const face = new FontFace('RefSerif', buf.buffer, {weight:'700'});
  await face.load(); document.fonts.add(face);
  const c=document.createElement('canvas'); c.width=S; c.height=S;
  const ctx=c.getContext('2d');
  ctx.fillStyle='#0b0b0c'; ctx.fillRect(0,0,S,S);
  ctx.fillStyle='#e8dfd0'; ctx.font='700 760px RefSerif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('\u58A8', S/2, S/2+20);
  return c.toDataURL('image/png');
})()
