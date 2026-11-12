# -*- coding: utf-8 -*-
"""把 7 句念白按帧区间贴进 chroma.wav，重写 final 音轨。"""
import subprocess, os, numpy as np, soundfile as sf
SR=48000; FPS=30
LINES=[(60,180),(270,390),(510,630),(700,810),(870,970),(1140,1240),(1470,1620)]
FF='C:/Windows/ffmpeg-9.0.1/bin/ffmpeg.exe'
for i,(a,b) in enumerate(LINES):
    mp3='out/voice/line%d.mp3'%i
    subprocess.run([FF,'-v','error','-y','-i',mp3,'-ar',str(SR),'-ac','1','out/voice/line%d.wav'%i],check=False)
base, sr = sf.read('public/audio/chroma.wav')
print('base', base.shape, sr)
N=len(base)
L=base[:,0].copy(); R=base[:,1].copy()
for i,(a,b) in enumerate(LINES):
    v,sr2=sf.read('out/voice/line%d.wav'%i)
    v=v if v.ndim==1 else v.mean(axis=1)
    # 去掉首尾静音
    thr=0.01*np.max(np.abs(v)); idx=np.where(np.abs(v)>thr)[0]
    if len(idx): v=v[max(0,idx[0]-400):idx[-1]+600]
    dur=len(v)/SR
    span=(b-a)/FPS
    # 超长则提速（最多 1.35x）
    if dur>span*1.02:
        sp=min(1.35, dur/(span*0.96))
        v=np.interp(np.arange(int(len(v)/sp)), np.arange(len(v))*sp, v)
        dur=len(v)/SR
    start=(a/FPS) + max(0.0,(span-dur)/2*0.25) - 0.040
    i0=int(start*SR)
    if i0<0: i0=0
    n=min(len(v), N-i0)
    fade=np.ones(n); fi=min(n,int(0.02*SR)); fade[:fi]=np.linspace(0,1,fi)
    fo=min(n,int(0.06*SR)); fade[-fo:]=np.linspace(1,0,fo)
    L[i0:i0+n]+=v[:n]*fade*0.30
    R[i0:i0+n]+=v[:n]*fade*0.30
    print('line',i,'dur',round(dur,2),'span',round(span,2),'start',round(start,2))
peak=max(np.max(np.abs(L)),np.max(np.abs(R)))
k=0.92/peak
sf.write('public/audio/chroma.wav', np.stack([L*k,R*k],axis=1).astype(np.float32), SR, subtype='PCM_16')
print('rewrote', round(N/SR,2),'s peak', round(float(peak*k),3))
