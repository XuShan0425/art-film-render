# -*- coding: utf-8 -*-
import io
p='src/scenes/Film.tsx'
s=io.open(p,encoding='utf-8').read()
old = "left:1000, top:74, fontSize:790, fontWeight:215, color:'#fff', lineHeight:1, opacity: 0.030 * xf"
new = "left:1150, top:120, fontSize:760, fontWeight:210, color:'#fff', lineHeight:1, opacity: 0.024 * xf"
assert old in s
s = s.replace(old, new)
io.open(p,'w',encoding='utf-8').write(s)
print('ok')
