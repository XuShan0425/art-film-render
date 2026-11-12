# -*- coding: utf-8 -*-
"""Synthesise the film score + brush foley, sample-accurate to the Remotion timeline."""
import numpy as np, soundfile as sf, os

SR = 48000
LEAD = -0.040  # AAC/容器对齐补偿：整条音轨提前，使落定感与画面同拍
FPS = 30
DUR = 930 / FPS + LEAD
N = int(round(DUR * SR))
t = np.arange(N) / SR
rng = np.random.default_rng(20261112)

def f2s(fr):
    return float(fr) / FPS

def env_curve(points, total=N):
    xs = np.array([p[0] for p in points], dtype=float)
    ys = np.array([p[1] for p in points], dtype=float)
    return np.interp(np.arange(total) / SR, xs, ys)

def norm(x, peak=1.0):
    m = np.max(np.abs(x)) + 1e-12
    return x * (peak / m)

# ── stereo bus
L = np.zeros(N); R = np.zeros(N)

def add(sig, at, gain=1.0, pan=0.0):
    at = at + LEAD
    i = int(round(at * SR))
    if i >= N: return
    if i < 0:
        sig = sig[-i:]; i = 0
    n = min(len(sig), N - i)
    th = (pan + 1) * np.pi / 4
    L[i:i+n] += sig[:n] * gain * np.cos(th)
    R[i:i+n] += sig[:n] * gain * np.sin(th)

# ── 1. 低频床：两个缓慢漂移的正弦 + 空气噪声
def lowbed():
    f0 = 55.0
    det = 0.0018
    body = (np.sin(2*np.pi*f0*t) * 0.5
            + np.sin(2*np.pi*f0*1.5*t + 0.7) * 0.30
            + np.sin(2*np.pi*f0*2.0*t + 1.9) * 0.18
            + np.sin(2*np.pi*(f0*1.004)*t) * 0.22)
    trem = 0.86 + 0.14*np.sin(2*np.pi*0.045*t + 0.4)
    return body * trem

bed = lowbed()
bed_env = env_curve([(0,0),(6,0.55),(20,0.72),(26,0.6),(29,0.45),(DUR,0.25)])
L += bed * bed_env * 0.155
R += bed * bed_env * 0.16

# 极缓的上层五度（只在书写段落出现）
for fr0, fr1, g0 in [(60,352,1.0),(392,724,0.85)]:
    a, b = f2s(fr0), f2s(fr1)
    seg = (t >= a) & (t < b)
    loc = (t[seg] - a) / max(b - a, 1e-6)
    e = np.sin(np.pi * loc) ** 0.8 * g0
    hi = (np.sin(2*np.pi*164.8*t[seg]) * 0.5 + np.sin(2*np.pi*247.0*t[seg] + 1.1) * 0.28)
    L[seg] += hi * e * 0.028
    R[seg] += hi * e * 0.028

# ── 2. 长尾颗粒噪声垫（纸张空气感），带缓慢呼吸
def air():
    w = rng.normal(size=N)
    w = np.convolve(w, np.ones(64)/64, mode='same')
    w = np.convolve(w, np.ones(8)/8, mode='same')
    return norm(w)
a = air()
air_env = env_curve([(0,0.0),(3,0.30),(27,0.34),(DUR,0.10)])
L += a * air_env * 0.05
R += np.roll(a, 900) * air_env * 0.05

# ── 3. 笔拂声：每个字一段"刷"的颗粒摩擦，随书写进度起伏
def brush(at0, at1, seed, gain=1.0):
    a0, a1 = max(0.0, f2s(at0)+LEAD), f2s(at1)+LEAD
    i0, i1 = int(a0*SR), min(int(a1*SR), N)
    n = i1 - i0
    if n <= 0: return
    g = np.random.default_rng(seed)
    x = g.normal(size=n)
    # 带通近似：先低通再高通
    k = np.ones(5)/5
    x = np.convolve(x, k, mode='same')
    x = x - np.convolve(x, np.ones(420)/420, mode='same')
    loc = np.arange(n)/n
    e = (np.sin(np.pi*np.clip(loc*1.06,0,1))**0.85) * (0.75 + 0.25*np.sin(2*np.pi*(3.1+0.4*seed)*loc))
    # 每个中文字落笔起点更像"蓄势"—前 12% 更轻
    e *= np.clip(loc/0.12, 0.15, 1.0)
    x = np.convolve(x, np.ones(6)/6, mode='same')
    sig = norm(x * e)
    add(sig, a0, gain*0.20, pan=-0.25)
    add(np.roll(sig, 311), a0, gain*0.18, pan=0.3)

brush(60, 330, 11, 1.0)
brush(392, 662, 23, 0.95)
brush(724, 784, 37, 0.34)   # 离散时的沙沙
brush(790, 858, 41, 0.25)    # 回归

# ── 4. 单点事件：落定一记（低木 + 短混响）
def hit(at, gain=1.0, freq=68.0, decay=1.8, pan=0.0, bright=0.0):
    at = at + LEAD
    dur = min(4.0, N/SR - max(at,0.0))
    n = int(dur*SR)
    if n <= 0: return
    x = np.arange(n)/SR
    e = np.exp(-x/ (decay*0.35))
    body = np.sin(2*np.pi*freq*x)*e
    tick = rng.normal(size=n)*np.exp(-x/0.006)*0.35
    if bright > 0:
        tick += np.sin(2*np.pi*1180*x)*np.exp(-x/0.02)*bright
    sig = body*0.9 + tick
    add(norm(sig, 1.0), at, gain, pan)

hit(f2s(60), 0.30, 58.0, 2.2)          # 起笔
hit(f2s(330), 0.62, 74.0, 2.6, -0.1)   # 墨 落定
hit(f2s(392), 0.26, 62.0, 2.0)
hit(f2s(662), 0.60, 66.0, 2.8, 0.08)   # 静 落定（全片最重）
hit(f2s(858), 0.22, 88.0, 1.2)         # 回归落点
hit(f2s(896), 0.16, 104.0, 0.9)        # 落款

# 转场 352 的一记轻擦
def whoosh(at, gain=0.5):
    n = int(0.9*SR); i = max(0, int((at+LEAD)*SR))
    if i+n > N: n = N-i
    x = np.arange(n)/SR
    w = rng.normal(size=n)
    w = np.convolve(w, np.ones(12)/12, mode='same')
    e = np.exp(-((x-0.30)/0.22)**2)
    add(norm(w*e), at, gain, 0.25)
whoosh(f2s(346), 0.55)
whoosh(f2s(720), 0.45)

# ── 5. 混响：多抽头回声（近似大房间），只作用于中频事件
def reverb(x, taps=((0.081,0.34),(0.137,0.26),(0.211,0.19),(0.293,0.14),(0.401,0.10))):
    y = x.copy()
    for d, g in taps:
        s = int(d*SR)
        y[s:] += x[:-s]*g
    return y
Lr = reverb(L, taps=((0.083,0.20),(0.142,0.15),(0.226,0.10)))
Rr = reverb(R, taps=((0.097,0.20),(0.161,0.15),(0.247,0.10)))
# 交叉混一点点
Lout = Lr*0.86 + Rr*0.14
Rout = Rr*0.86 + Lr*0.14

# ── 6. 母带：软限幅 + 淡入淡出
def softclip(x, k=1.2):
    return np.tanh(x*k)/np.tanh(k)
Lout = softclip(norm(Lout, 0.92), 1.15)
Rout = softclip(norm(Rout, 0.92), 1.15)

fade = np.ones(N)
fi = int(0.5*SR); fo = int(1.6*SR)
fade[:fi] = np.linspace(0,1,fi)**1.5
fade[-fo:] = np.linspace(1,0,fo)**1.6
Lout *= fade; Rout *= fade

N2 = int(round(930/FPS*SR))
Lout = np.pad(Lout, (0, max(0, N2-len(Lout))))[:N2]
Rout = np.pad(Rout, (0, max(0, N2-len(Rout))))[:N2]
os.makedirs('public/audio', exist_ok=True)
sf.write('public/audio/score.wav', np.stack([Lout, Rout], axis=1).astype(np.float32), SR, subtype='PCM_16')
print('wrote public/audio/score.wav', round(DUR,2), 's')
print('peak', float(np.max(np.abs(Lout))), float(np.max(np.abs(Rout))))
