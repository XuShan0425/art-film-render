# -*- coding: utf-8 -*-
import io
p='scripts/score.py'
s=io.open(p,encoding='utf-8').read()
s=s.replace("LEAD = -0.098","LEAD = -0.040")
io.open(p,'w',encoding='utf-8').write(s)
print('ok')
