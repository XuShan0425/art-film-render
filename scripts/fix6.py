# -*- coding: utf-8 -*-
import io,re
p='src/scenes/Film.tsx'
s=io.open(p,encoding='utf-8').read()
s=re.sub(r'<VLabel text="M O[^"]*"','<VLabel text="M O  N-01"',s)
io.open(p,'w',encoding='utf-8').write(s)
print([l.strip() for l in s.split(chr(10)) if 'VLabel text' in l])
