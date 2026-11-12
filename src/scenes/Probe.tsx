import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {useEffect, useState} from 'react';
import {continueRender, delayRender} from 'remotion';

const CH = '\u58A8';
const SEG = 2;

const Frame: React.FC = () => (
  <AbsoluteFill style={{background:'#0b0b0c', alignItems:'center', justifyContent:'center', flexDirection:'column', color:'#e8dfd0', fontFamily:'NotoSerifSCVF'}}>
    {[0, 1, 2, 3, 4, 5, 6].map((k) => (
      <div key={k} style={{fontSize:96, lineHeight:1.2, fontVariationSettings:'"wght" ' + (200 + k * 90)}}>{'wght ' + (200 + k * 90) + '\u00A0\u00A0' + CH}</div>
    ))}
  </AbsoluteFill>
);

export const Probe: React.FC = () => {
  const [r, setR] = useState(false);
  useEffect(() => {
    const h = delayRender('f');
    const face = new FontFace('NotoSerifSCVF', 'url(/fonts/NotoSerifSC-VF.ttf)', { weight: '100 900' });
    face.load().then((f) => { document.fonts.add(f); setR(true); continueRender(h); }).catch(() => continueRender(h));
  }, []);
  return <Frame />;
};
