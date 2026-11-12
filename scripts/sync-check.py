# -*- coding: utf-8 -*-
import numpy as np, soundfile as sf
x, sr = sf.read('out/audio-probe.wav')
x = x if x.ndim==1 else x.mean(axis=1)
def onset(a,b):
    s,e = int(a*sr), int(b*sr)
    seg = np.abs(x[s:e])
    return s + int(np.argmax(seg))
def at(t):
    return round(onset(max(0,t-0.12), t+0.35)/sr, 3)
print('笔触落定 墨 @11.00 ->', at(11.0))
print('笔触落定 静 @22.07 ->', at(22.07))
print('回归落点 @28.60 ->', at(28.6))
print('落款 @29.87 ->', at(29.87))
# 音频与画面（30fps）之间偏差
for name, tf in [('墨', 11.0), ('静', 22.07)]:
    a = at(tf)
    print(name, 'audio-video offset(ms)', round((a-tf)*1000))
