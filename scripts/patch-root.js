const fs=require('fs');
const p='src/Root.tsx';
let s=fs.readFileSync(p,'utf8');
if(!s.includes("id=\"Chroma\"")){
  s=s.replace(/(<Composition\s+id="Film"[\s\S]*?\/>)/, "$1\n      <Composition id=\"Chroma\" component={Chroma} durationInFrames={1800} fps={30} width={1080} height={1920} />");
  s=s.replace("import {Film} from './scenes/Film';", "import {Film} from './scenes/Film';\nimport {Chroma} from './scenes/Chroma';");
  fs.writeFileSync(p,s);
}
console.log(fs.readFileSync(p,'utf8'));
