# -*- coding: utf-8 -*-
import numpy as np, soundfile as sf
x, sr = sf.read('public/audio/score.wav')
print('dur', len(x)/sr, 'ch', x.shape[1])
mono = x.mean(axis=1)
# 每 0.5s RMS
w = sr//2
r = [round(float(np.sqrt((mono[i:i+w]**2).mean())),4) for i in range(0, len(mono)-w, w)]
print('rms/0.5s:', r)
f, P = __import__('numpy').fft.rfftfreq(len(mono), 1/sr), np.abs(np.fft.rfft(mono))
band = [(20,80),(80,200),(200,600),(600,2000),(2000,8000),(8000,20000)]
tot = (P**2).sum()
for a,b in band:
    m = (f>=a)&(f<b)
    print(a,b, round(float((P[m]**2).sum()/tot*100),1),'%')
