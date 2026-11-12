import React from 'react';
import type {Pt, StrokeSpec} from './glyphData';

const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);

export const partialPoints = (pts: Pt[], prog: number): Pt[] => {
  if (pts.length < 2 || prog <= 0) return [];
  if (prog >= 1) return pts;
  const lens: number[] = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) { const d = dist(pts[i - 1], pts[i]); lens.push(d); total += d; }
  let remain = total * prog;
  const op: Pt[] = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const seg = lens[i - 1];
    if (remain >= seg) { op.push(pts[i]); remain -= seg; }
    else {
      const k = seg > 0 ? remain / seg : 1;
      op.push([pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k]);
      break;
    }
  }
  return op;
};

const chaikin = (p: Pt[], iters: number): Pt[] => {
  let out = p;
  for (let it = 0; it < iters; it++) {
    if (out.length < 3) return out;
    const next: Pt[] = [out[0]];
    for (let i = 0; i < out.length - 1; i++) {
      const a = out[i], b = out[i + 1];
      next.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25]);
      next.push([a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
    }
    next.push(out[out.length - 1]);
    out = next;
  }
  return out;
};

const widthAt = (s: StrokeSpec, ratio: number): number => {
  const n = s.w.length;
  const x = Math.min(n - 1, Math.max(0, ratio * (n - 1)));
  const i = Math.floor(x), f = x - i;
  return s.w[i] * (1 - f) + s.w[Math.min(n - 1, i + 1)] * f;
};

// 单笔的墨迹路径（可变宽 ribbon 闭合多边形）
export const strokePolygon = (s: StrokeSpec, prog: number, weight = 1): { poly: string; capA: Pt; capB: Pt; wA: number; wB: number } | null => {
  const raw = partialPoints(s.pts, prog);
  if (raw.length < 2) return null;
  const pts = chaikin(raw, 2);
  const m = pts.length;
  const nrm: Pt[] = [];
  for (let i = 0; i < m; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(m - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const L = Math.hypot(dx, dy) || 1;
    nrm.push([-dy / L, dx / L]);
  }
  const left: Pt[] = [], right: Pt[] = [];
  for (let i = 0; i < m; i++) {
    const ratio = m === 1 ? 0 : i / (m - 1);
    let wv = widthAt(s, prog >= 0.999 ? ratio : ratio) * weight;
    const tipRatio = Math.min(1, (i / m) * 1.0);
    if (prog < 0.999 && i >= m - 2) wv *= 0.5 + 0.5 * (1 - (i - (m - 3)) / 2);
    else if (prog >= 0.999 && ratio > 0.9) wv *= 1 - 0.55 * ((ratio - 0.9) / 0.1);
    if (ratio < 0.06) wv *= 0.78 + 0.22 * (ratio / 0.06);
    const h = Math.max(0.6, wv / 2);
    left.push([pts[i][0] + nrm[i][0] * h, pts[i][1] + nrm[i][1] * h]);
    right.push([pts[i][0] - nrm[i][0] * h, pts[i][1] - nrm[i][1] * h]);
  }
  const outline = left.concat([...right].reverse());
  const poly = outline.map((p) => p[0].toFixed(2) + ',' + p[1].toFixed(2)).join(' ');
  const wStart = widthAt(s, 0) * weight;
  const wEnd = widthAt(s, 1) * weight * (prog < 0.999 ? 0.5 : 0.45);
  return { poly, capA: pts[0], capB: pts[m - 1], wA: wStart, wB: wEnd };
};

export const InkStroke: React.FC<{ s: StrokeSpec; prog: number; color: string; weight?: number; opacity?: number }> = ({ s, prog, color, weight = 1, opacity = 1 }) => {
  const g = strokePolygon(s, prog, weight);
  if (!g) return null;
  return (
    <g fill={color} opacity={opacity}>
      <polygon points={g.poly} stroke={color} strokeWidth={0.45} strokeLinejoin="round" />
      <circle cx={g.capA[0]} cy={g.capA[1]} r={g.wA / 2} stroke="none" />
      <circle cx={g.capB[0]} cy={g.capB[1]} r={g.wB / 2} stroke="none" />
    </g>
  );
};

// 一整个字：t∈[0,1] 按总笔长匀速写出
export const GlyphInk: React.FC<{
  g: { total: number; strokes: StrokeSpec[] };
  t: number; color: string; weight?: number; opacity?: number;
  from?: number; to?: number;
}> = ({ g, t, color, weight = 1, opacity = 1, from = 0, to = 1 }) => {
  const tt = Math.min(1, Math.max(0, (t - from) / (to - from)));
  let before = 0;
  return (
    <g opacity={opacity}>
      {g.strokes.map((s, i) => {
        const dur = s.plen[s.plen.length - 1];
        const prog = Math.min(1, Math.max(0, (tt * g.total - before) / Math.max(dur, 0.001)));
        before += dur;
        if (prog <= 0) return null;
        return <InkStroke key={i} s={s} prog={prog} color={color} weight={weight} />;
      })}
    </g>
  );
};
