# -*- coding: utf-8 -*-
import io
p='src/scenes/Chroma.tsx'
s=io.open(p,encoding='utf-8').read()
print(repr(s[:200]))
print('---imports---')
print('\n'.join(l for l in s.split(chr(10)) if l.startswith('import')))
print('---has Subs?', 'Subs' in s, 'subs var?', 'const SUBS' in s)
