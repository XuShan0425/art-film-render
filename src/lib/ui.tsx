import React from 'react';
import {AbsoluteFill} from 'remotion';
import './film.css';

export const C = {
  ink: '#e8ddc8',
  inkSoft: '#c9bfa9',
  dim: '#7d7568',
  bg: '#0a0a0b',
};

// 极细十字准绳，帮助构图（艺术片的"定位"感）
export const Cross: React.FC<{x: number; y: number; a: number; size?: number; color?: string}> = ({ x, y, a, size = 14, color = C.dim }) => {
  if (a <= 0.001) return null;
  return (
    <g opacity={a} stroke={color} strokeWidth={1}>
      <line x1={x - size} y1={y} x2={x + size} y2={y} />
      <line x1={x} y1={y - size} x2={x} y2={y + size} />
    </g>
  );
};

export const VLabel: React.FC<{text: string; x: number; y: number; a: number; size?: number}> = ({ text, x, y, a, size = 15 }) => (
  <div
    className="mono"
    style={{
      position: 'absolute', left: x, top: y, opacity: a, fontSize: size, color: C.dim,
      writingMode: 'vertical-rl', letterSpacing: '0.5em', whiteSpace: 'nowrap',
    }}
  >
    {text}
  </div>
);

export const HLabel: React.FC<{text: string; x: number; y: number; a: number; size?: number; align?: 'left' | 'right' | 'center'}> = ({ text, x, y, a, size = 15, align = 'left' }) => (
  <div
    className="mono"
    style={{
      position: 'absolute', left: x, top: y, opacity: a, fontSize: size, color: C.dim,
      transform: align === 'right' ? 'translateX(-100%)' : align === 'center' ? 'translateX(-50%)' : undefined,
      whiteSpace: 'nowrap',
    }}
  >
    {text}
  </div>
);

// 胶片颗粒 + 暗角，全片常驻（极轻）
export const FilmTexture: React.FC<{grain?: number; vignette?: number; frame: number}> = ({ grain = 0.05, vignette = 0.75, frame }) => {
  const seed = (frame * 7919) % 1000;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
      <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, opacity: grain}}>
        <filter id={'gr' + seed}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={'url(#gr' + seed + ')'} />
      </svg>
      <AbsoluteFill style={{background: 'radial-gradient(120% 90% at 50% 45%, rgba(0,0,0,0) 42%, rgba(0,0,0,' + vignette + ') 100%)'}} />
    </AbsoluteFill>
  );
};
