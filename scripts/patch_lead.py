# -*- coding: utf-8 -*-
p='scripts/score.py'
s=open(p,encoding='utf-8').read()
s=s.replace("FPS = 30\nDUR = 930 / FPS","LEAD = 0.105  # AAC/容器对齐补偿：整条音轨提前，使落定感与画面同拍\nFPS = 30\nDUR = 930 / FPS + LEAD")
# 所有 add/hit 时间统一 +LEAD
s=s.replace("def add(sig, at, gain=1.0, pan=0.0):\n    i = int(round(at * SR))","def add(sig, at, gain=1.0, pan=0.0):\n    at = at + LEAD\n    i = int(round(at * SR))")
s=s.replace("def hit(at, gain=1.0, freq=68.0, decay=1.8, pan=0.0, bright=0.0):\n    dur = min(4.0, N/SR - at)","def hit(at, gain=1.0, freq=68.0, decay=1.8, pan=0.0, bright=0.0):\n    at = at + LEAD\n    dur = min(4.0, N/SR - at)")
s=s.replace("n = int(0.9*SR); i = int(at*SR)","n = int(0.9*SR); i = int((at+LEAD)*SR)")
s=s.replace("    a0, a1 = f2s(at0), f2s(at1)\n    i0, i1 = int(a0*SR), min(int(a1*SR), N)","    a0, a1 = f2s(at0)+LEAD, f2s(at1)+LEAD\n    i0, i1 = int(a0*SR), min(int(a1*SR), N)")
s=s.replace("    n = i1 - i0\n    if n <= 0: return","    n = i1 - i0\n    if n <= 0: return")
# 输出长度裁回 31.0s
s=s.replace("os.makedirs('public/audio', exist_ok=True)","N2 = int(round(930/FPS*SR))\nLout = np.pad(Lout, (0, max(0, N2-len(Lout))))[:N2]\nRout = np.pad(Rout, (0, max(0, N2-len(Rout))))[:N2]\nos.makedirs('public/audio', exist_ok=True)")
open(p,'w',encoding='utf-8').write(s)
print('patched lead')
