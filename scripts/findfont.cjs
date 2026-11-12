
const fs=require('fs');
const css=fs.readFileSync('node_modules/@fontsource/noto-serif-sc/700.css','utf8');
const blocks=[...css.matchAll(/@font-face\s*\{[^}]*\}/g)].map(m=>m[0]);
const out={};
for (const ch of ['\u6C38','\u58A8','\u9759']) {
  const cp=ch.codePointAt(0);
  const hits=[];
  for (const b of blocks) {
    const nm=/noto-serif-sc-(\d+)-700-normal/.exec(b);
    const rm=/unicode-range:\s*([^;]+);/.exec(b);
    if(!nm||!rm) continue;
    const parts=rm[1].split(',').map(s=>s.trim());
    let ok=false;
    for (const p of parts) {
      const m=/^U\+([0-9a-fA-F]+)(?:-([0-9a-fA-F]+))?$/.exec(p);
      if(!m) continue;
      const a=parseInt(m[1],16), z=m[2]?parseInt(m[2],16):a;
      if (cp>=a&&cp<=z) ok=true;
    }
    if (ok) hits.push(nm[1]);
  }
  out[ch]=hits;
}
console.log(JSON.stringify(out));
