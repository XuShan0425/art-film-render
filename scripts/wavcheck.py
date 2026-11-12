import numpy as np, soundfile as sf
x,sr = sf.read(r'H:\\ARCHIVE\\art-film-2026-11-12\public\audio\score.wav')
x = x if x.ndim==1 else x.mean(axis=1)
def onset(a,b):
    s,e=int(a*sr),int(b*sr); seg=np.abs(x[s:e]); return round((s+int(np.argmax(seg)))/sr,3)
for t in (11.0, 22.07, 28.6, 29.87):
    print(t, '->', onset(t-0.15, t+0.45))
