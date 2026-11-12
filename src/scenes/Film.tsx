import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig, interpolate, Easing, Sequence} from 'remotion';
import {MO, JING} from '../lib/glyphData';
import {InkStroke, partialPoints} from '../lib/ink';
import {Cross, HLabel, VLabel, FilmTexture, C} from '../lib/ui';
import {useFilmFonts} from '../lib/fonts';
import type {GlyphSpec} from '../lib/glyphData';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const ease = Easing.bezier(0.22, 0.61, 0.16, 1);
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const easeInOut = Easing.bezier(0.45, 0, 0.25, 1);

// ───────── 时间表（30fps，总 930f = 31s）─────────
export const T = {
  w0: 60, w1: 330,          // 字一 墨
  xf: 352, xfEnd: 392,      // 转场
  w2: 392, w3: 662,         // 字二 静
  em: 700, emEnd: 724,      // 去色 / 版画化
  dis: 724, disEnd: 784,    // 离散成星群
  ret: 790, retEnd: 858,    // 回归
  sig: 858, sigEnd: 894,    // 字号标 scale word
  ty: 896, tyEnd: 926,      // 落款
  end: 930,
};

// 笔尖位置
const penTip = (g: GlyphSpec, t: number) => {
  if (t <= 0 || t >= 1) return null;
  let acc = 0;
  for (const s of g.strokes) {
    const dur = s.plen[s.plen.length - 1];
    if (t * g.total < acc + dur) {
      const local = (t * g.total - acc) / dur;
      const p = partialPoints(s.pts, local);
      return p.length ? p[p.length - 1] : null;
    }
    acc += dur;
  }
  return null;
};

// 离散/回归：确定性位移 + 旋转
const scatterTransform = (i: number, amt: number) => {
  if (amt <= 0.0001) return undefined;
  const seed = (i * 47) % 23;
  const ang = (seed / 23) * Math.PI * 2 + 0.6;
  const mag = 6 + (seed % 7) * 3.2;
  const dx = Math.cos(ang) * mag * amt;
  const dy = Math.sin(ang) * mag * amt * 1.15;
  const rot = ((seed % 5) - 2) * 9 * amt;
  const sc = 1 - 0.14 * amt;
  return 'translate(' + dx.toFixed(2) + ' ' + dy.toFixed(2) + ') rotate(' + rot.toFixed(2) + ') scale(' + sc.toFixed(3) + ')';
};

const Strokes: React.FC<{g: GlyphSpec; t: number; color: string; amt?: number; weight?: number; opacity?: number}> = ({ g, t, color, amt = 0, weight = 1, opacity = 1 }) => {
  let before = 0;
  const tt = Math.min(1, Math.max(0, t));
  return (
    <g opacity={opacity}>
      {g.strokes.map((s, i) => {
        const dur = s.plen[s.plen.length - 1];
        const prog = Math.min(1, Math.max(0, (tt * g.total - before) / Math.max(dur, 0.001)));
        before += dur;
        if (prog <= 0) return null;
        const tr = scatterTransform(i, amt);
        return (
          <g key={i} transform={tr}>
            <InkStroke s={s} prog={prog} color={color} weight={weight} />
          </g>
        );
      })}
    </g>
  );
};

const TipLight: React.FC<{p: [number, number] | null; k: number}> = ({ p, k }) => {
  if (!p || k <= 0.001) return null;
  return (
    <g opacity={k}>
      <circle cx={p[0]} cy={p[1]} r={13} fill="url(#tipGlow)" />
      <circle cx={p[0]} cy={p[1]} r={1.9} fill="#fff8ea" />
    </g>
  );
};

export const Film: React.FC = () => {
  const f = useCurrentFrame();
  useFilmFonts();
  const {durationInFrames} = useVideoConfig();

  // 唯一连续运动：极缓推近
  const zoom = interpolate(f, [0, durationInFrames], [1.0, 1.05], { ...clamp, easing: Easing.linear });

  const t1 = (f - T.w0) / (T.w1 - T.w0);
  const t2 = (f - T.w2) / (T.w3 - T.w2);
  const tip1 = penTip(MO, t1);
  const tip2 = penTip(JING, t2);

  const xf = interpolate(f, [T.xf, T.xfEnd], [0, 1], { ...clamp, easing: easeInOut });
  const em = interpolate(f, [T.em, T.emEnd], [0, 1], { ...clamp, easing: ease });
  const disp = interpolate(f, [T.dis, T.disEnd], [0, 1], { ...clamp, easing: ease });
  const ret = interpolate(f, [T.ret, T.retEnd], [0, 1], { ...clamp, easing: easeOut });
  const amt = disp * (1 - ret);

  // 余墨：收笔后缓慢扩散的第二层
  const echo1 = interpolate(f, [T.w1, T.w1 + 90], [0, 1], clamp);
  const echo2 = interpolate(f, [T.w3, T.w3 + 70], [0, 1], clamp);
  const echoOut = 1 - interpolate(f, [T.dis, T.dis + 40], [0, 1], clamp);

  const sigA = interpolate(f, [T.sig, T.sig + 26], [0, 1], { ...clamp, easing: easeOut });
  const tyA = interpolate(f, [T.ty, T.tyEnd], [0, 1], { ...clamp, easing: easeOut });

  // 全片唯一一次冲击：最后一笔落定
  const breath = interpolate(f, [T.w3 - 4, T.w3 + 2, T.w3 + 34], [0, 1, 0], clamp);

  const GS = 1240;
  const gx = (1920 - GS) / 2;
  const gy = (1080 - GS) / 2 - 26;
  const unit = GS / 200;

  const tipFade1 = interpolate(f, [T.w0, T.w0 + 16, T.w1 - 12, T.w1], [0, 1, 1, 0], clamp);
  const tipFade2 = interpolate(f, [T.w2, T.w2 + 16, T.w3 - 12, T.w3], [0, 1, 1, 0], clamp);

  const crossA1 = interpolate(f, [T.w0 - 20, T.w0, T.w1, T.w1 + 20], [0, 0.45, 0.45, 0], clamp);
  const crossA2 = interpolate(f, [T.w2 - 20, T.w2, T.w3, T.w3 + 20], [0, 0.45, 0.45, 0], clamp);

  return (
    <AbsoluteFill className="film" style={{background: C.bg}}>
      <AbsoluteFill style={{transform: 'scale(' + zoom + ')', transformOrigin: '50% 48%'}}>
        <AbsoluteFill style={{background: 'radial-gradient(58% 44% at 46% 42%, #131315 0%, #0a0a0b 60%, #070708 100%)'}} />
        <AbsoluteFill style={{opacity: 0.5, background: 'linear-gradient(158deg, rgba(232,221,200,0.045) 0%, rgba(232,221,200,0) 44%)'}} />

        {/* 背景大字（极淡的"纸背"字） */}
        <div className="serif" style={{position:'absolute', left:52, top:74, fontSize:790, fontWeight:215, color:'#fff', lineHeight:1, opacity: 0.030 * (1 - 0.55 * xf)}}>墨</div>
        <div className="serif" style={{position:'absolute', left:1150, top:120, fontSize:760, fontWeight:210, color:'#fff', lineHeight:1, opacity: 0.024 * xf}}>静</div>

        <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
          <defs>
            <filter id="echoBlur" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation={22} /></filter>
            <filter id="tipBlur" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation={9} /></filter>
            <radialGradient id="tipGlow">
              <stop offset="0%" stopColor="#fff4da" stopOpacity={0.55} />
              <stop offset="60%" stopColor="#e6cf9f" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#e6cf9f" stopOpacity={0} />
            </radialGradient>
          </defs>

          <g transform={'translate(' + gx + ' ' + gy + ') scale(' + unit + ') translate(100 100)'}>
            {/* 字一 墨 */}
            <g opacity={1 - xf}>
              <g filter="url(#echoBlur)" opacity={0.16 * echo1}>
                <Strokes g={MO} t={t1} color="#e8ddc8" weight={1.75} amt={0.9 * echo1} />
              </g>
              <Strokes g={MO} t={t1} color={C.ink} />
              <TipLight p={tip1} k={tipFade1} />
            </g>
            {/* 字二 静 */}
            <g opacity={xf}>
              <g filter="url(#echoBlur)" opacity={0.14 * echo2 * echoOut}>
                <Strokes g={JING} t={t2} color="#e8ddc8" weight={1.7} amt={0.9 * echo2 + amt * 1.2} />
              </g>
              <g style={{filter: em > 0 ? 'grayscale(' + (em * 0.9) + ') contrast(' + (1 + 0.3 * em) + ')' : undefined}}>
                <Strokes g={JING} t={t2} color={C.ink} amt={amt} />
              </g>
              <TipLight p={tip2} k={tipFade2} />
            </g>
            {/* 定位十字 */}
            <Cross x={-96} y={-96} a={crossA1} size={6.5} />
            <Cross x={96} y={-96} a={crossA1} size={6.5} />
            <Cross x={-96} y={96} a={crossA2} size={6.5} />
            <Cross x={96} y={96} a={crossA2} size={6.5} />
          </g>
        </svg>

        {/* 版面 */}
        <VLabel text="M O  N-01" x={1806} y={196} a={interpolate(f, [26, 70], [0, 0.85], clamp)} />
        <HLabel text="墨  —  INK  /  STILLNESS" x={1812} y={946} a={interpolate(f, [T.sig, T.sig + 30], [0, 0.8], clamp)} align="right" />
        <HLabel text="STUDY IN THREE GESTURES" x={108} y={932} a={interpolate(f, [T.retEnd - 10, T.retEnd + 24], [0, 0.5], clamp)} />
        <HLabel text="1920 × 1080   30P" x={108} y={962} a={interpolate(f, [T.retEnd, T.retEnd + 34], [0, 0.26], clamp)} />

        {/* 落款 */}
        <div style={{position: 'absolute', left: 1684, top: 452, opacity: tyA * 0.85}}>
          <div className="serif" style={{writingMode: 'vertical-rl', fontSize: 25, letterSpacing: '0.5em', fontWeight: 280, color: C.inkSoft, transform: 'translateY(' + (1 - tyA) * 14 + 'px)'}}>{'三笔落定，墨永在纸上'}</div>
        </div>

        <div className="mono" style={{position:'absolute', left:0, right:0, bottom:74, textAlign:'center', fontSize:12, color:C.dim, opacity: interpolate(f, [T.ty + 10, T.ty + 40], [0, 0.7], clamp), letterSpacing:'0.62em'}}>
          INK STAYS WHERE THE BRUSH LEFT IT
        </div>
      </AbsoluteFill>

      <Audio src={staticFile('audio/score.wav')} />
      <FilmTexture frame={f} grain={0.055} vignette={0.86} />
      <AbsoluteFill style={{background:'#fff8ea', opacity: breath * 0.045, mixBlendMode:'screen'}} />
    </AbsoluteFill>
  );
};
