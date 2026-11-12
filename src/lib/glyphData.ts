import mo from '../../out/glyph-MO.json';
import jing from '../../out/glyph-JING.json';

export type Pt = [number, number];
export type StrokeSpec = { ri: number; order: number; len: number; pts: Pt[]; w: number[]; plen: number[] };
export type GlyphSpec = { total: number; strokes: StrokeSpec[] };

export const MO = mo as GlyphSpec;
export const JING = jing as GlyphSpec;
