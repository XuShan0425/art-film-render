// 字形笔画数据。
// 原先从 ../../out/glyph-*.json 读取，但 out/ 是产物目录（不进 Git），
// 云端 CI 里没有这两个文件，打包会直接报 "Can't resolve ../../out/glyph-MO.json"。
// 现改为放进 src/lib/glyph/，随源码一起提交。
import mo from './glyph/glyph-MO.json';
import jing from './glyph/glyph-JING.json';

export type Pt = [number, number];
export type StrokeSpec = { ri: number; order: number; len: number; pts: Pt[]; w: number[]; plen: number[] };
export type GlyphSpec = { total: number; strokes: StrokeSpec[] };

export const MO = mo as GlyphSpec;
export const JING = jing as GlyphSpec;
