import { getCompositions, RenderInternals } from '@remotion/renderer';
const r = await import('@remotion/renderer');
console.log(typeof r.createCanvas, typeof r.RenderInternals, Object.keys(r.RenderInternals).length);
const sub = await import('@remotion/renderer/dist/create-canvas.js').catch(e=>String(e));
console.log('direct', typeof sub);
