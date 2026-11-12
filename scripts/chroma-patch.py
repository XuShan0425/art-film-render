# -*- coding: utf-8 -*-
import io
p='src/scenes/Chroma.tsx'
s=io.open(p,encoding='utf-8').read()

lines=[(60,180,"颜色不是视觉的偶然。"),(270,390,"它先被拆解为波长。"),(510,630,"被编号，被赋予精确坐标。"),
       (700,810,"在理性刻度里锚定纯度。"),(870,970,"秩序在此建立。"),(1140,1240,"当界限重叠，彼此并置。"),
       (1470,1620,"严苛的度量，终成审美。")]
rows = chr(10).join(['  {a:%d,b:%d,t:"%s"},'%(a,b,t) for a,b,t in lines])
comp = '''
const SUBS = [
%s
];

const Subs: React.FC<{f:number}> = ({f}) => {
  const cur = SUBS.find((s)=> f>=s.a-4 && f<=s.b+16);
  if (!cur) return null;
  const a = Math.min(1, (f-cur.a+4)/10) * Math.min(1, (cur.b+16-f)/12);
  return (
    <div className="serif" style={{position:'absolute',left:0,right:0,bottom:300,textAlign:'center',opacity:a,color:'#F3EDE0',fontSize:38,fontWeight:320,letterSpacing:'0.08em',textShadow:'0 2px 24px rgba(0,0,0,0.55)'}}>{cur.t}</div>
  );
};
''' % rows

anchor = "export const Chroma: React.FC = () => {"
assert anchor in s
s = s.replace(anchor, comp + chr(10) + anchor, 1)
s = s.replace("import {C} from '../lib/ui';", "import {C} from '../lib/ui';"+chr(10)+"import {Audio} from 'remotion';", 1)

mark = "      {/* 落定白闪 */}"
assert mark in s
s = s.replace(mark, "      <Audio src={staticFile('audio/chroma.wav')} />"+chr(10)+"      <Subs f={f} />"+chr(10)+mark, 1)

old_op = "opacity: 1 - Math.max(s1*0.55, s2*0.5, s3*0.5)"
if old_op in s:
    s = s.replace(old_op, "opacity: 1 - Math.max(s1*0.86, s2*0.80, s3*0.84, s4*0.86)")
io.open(p,'w',encoding='utf-8').write(s)
print('ok', 'const SUBS' in s, s.count('Audio'), '<Subs' in s)
