# -*- coding: utf-8 -*-
import io
p='scripts/score.py'
s=io.open(p,encoding='utf-8').read()
s=s.replace("LEAD = 0.105","LEAD = -0.098")
# 负 LEAD 需要允许 at<0：add 内裁剪
s=s.replace("    at = at + LEAD\n    i = int(round(at * SR))\n    if i >= N: return\n    n = min(len(sig), N - i)",
            "    at = at + LEAD\n    i = int(round(at * SR))\n    if i >= N: return\n    if i < 0:\n        sig = sig[-i:]; i = 0\n    n = min(len(sig), N - i)")
s=s.replace("    at = at + LEAD\n    dur = min(4.0, N/SR - at)","    at = at + LEAD\n    dur = min(4.0, N/SR - max(at,0.0))")
s=s.replace("n = int(0.9*SR); i = int((at+LEAD)*SR)","n = int(0.9*SR); i = max(0, int((at+LEAD)*SR))")
s=s.replace("    a0, a1 = f2s(at0)+LEAD, f2s(at1)+LEAD","    a0, a1 = max(0.0, f2s(at0)+LEAD), f2s(at1)+LEAD")
io.open(p,'w',encoding='utf-8').write(s)
print('ok')
