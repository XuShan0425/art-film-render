const fs=require('fs');
const p='src/Root.tsx';
fs.writeFileSync(p, `import {Composition} from 'remotion';
import {Film} from './scenes/Film';
import {Chroma} from './scenes/Chroma';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Film" component={Film} durationInFrames={930} fps={30} width={1920} height={1080} />
    <Composition id="Chroma" component={Chroma} durationInFrames={1800} fps={30} width={1080} height={1920} />
  </>
);
`);
console.log('ok');
