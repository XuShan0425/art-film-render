# -*- coding: utf-8 -*-
"""CHROMA 音轨：按 Gemini 3.8 Flash 的声音脚本，用合成方式落地。"""
import numpy as np, soundfile as sf, os, json

SR=48000; FPS=30; LEAD=-0.040
N2=int(round(1800/FPS*SR))
N=N2+int(0.5*SR)
t=np.arange(N)/SR
rng=np.random.default_rng(600)

L=np.zeros(N); R=np.zeros(N)

def add(sig, at, gain=1.0, pan=0.0, rev=0.0):
    at=at+LEAD
    i=int(round(at*SR))
    if i>=N: return
    if i<0:
        sig=sig[-i:]; i=0
    n=min(len(sig),N-i)
    th=(pan+1)*np.pi/4
    s=sig[:n]
    L[i:i+n]+=s*gain*np.cos(th)
    R[i:i+n]+=s*gain*np.sin(th)

def env(n, a=0.005, d=0.3, curve=3.0):
    x=np.arange(n)/SR
    e=np.exp(-x/d)
    if a>0:
        k=min(n,int(a*SR)); e[:k]*=np.linspace(0,1,k)**0.5
    return e

def noise(n):
    return rng.normal(size=n)

def bp(x, lo, hi):
    # 简易带通：低通 - 更低低通
    def lp(y, fc):
        a=np.exp(-2*np.pi*fc/SR); out=np.zeros_like(y); acc=0.0
        # 向量化近似：一阶 IIR 用 scipy
        from scipy.signal import lfilter
        return lfilter([1-a],[1,-a],y)
    return lp(x,hi)-lp(x,lo)

def tone(f, dur, decay=0.5, harmonics=(1,0.3,0.12)):
    n=int(dur*SR); x=np.arange(n)/SR
    s=np.zeros(n)
    for k,g in enumerate(harmonics,start=1):
        s+=g*np.sin(2*np.pi*f*k*x)
    return s*env(n,0.002,decay)

def hit(at, f0=32, dur=3.2, gain=1.0, pan=0.0, click=True):
    n=int(dur*SR); x=np.arange(n)/SR
    sweep=32+ (70-32)*np.exp(-x/0.09)
    phase=np.cumsum(2*np.pi*sweep/SR)
    body=np.sin(phase)*np.exp(-x/1.1)
    sub=np.sin(2*np.pi*24*x)*np.exp(-x/1.8)*0.6
    s=(body+sub)
    if click:
        s+=noise(n)*np.exp(-x/0.012)*0.5
    s/= (np.max(np.abs(s))+1e-9)
    add(s, at, gain, pan)
    # 短空间反射
    for d,g in ((0.021,0.22),(0.037,0.16),(0.058,0.11)):
        add(s*0.5, at+d, gain*g, -pan*0.6)

FPSF=1/30
def fr(f): return f/FPSF

# ── 底：工频微鸣 + 亚低频 ──
bed=(np.sin(2*np.pi*60*t)*0.25+np.sin(2*np.pi*30*t)*0.5)*0.5
bed+=bp(noise(N),20,140)*0.6
def curve(pts):
    xs=np.array([p[0] for p in pts],float); ys=np.array([p[1] for p in pts],float)
    return np.interp(t, xs, ys)
bed_env=curve([(0,0),(8,0.5),(32,0.55),(33,0.4),(36,0.05),(37,2.2),(40,0.35),(56,0.30),(60,0.0)])
# 960-1079 收窄到死寂
hi=curve([(0,0),(35.9,0),(36.1,1),(60,0.0)])
bed=bed*bed_env*(1-hi*0.95)
L+=bed*0.05; R+=bed*0.05*np.roll(np.ones(1),0)

# 模拟磁带沙沙
tape=bp(noise(N),600,4000)*curve([(0,0),(8,0.35),(28,0.28),(32,0.15),(45,0.22),(60,0)])
L+=tape*0.012; R+=np.roll(tape,733)*0.012

# 1080 之后的下潜低频垫
pad_n=int(4.0*SR); px=np.arange(pad_n)/SR
pad=(np.sin(2*np.pi*38*px)*0.7+np.sin(2*np.pi*57*px)*0.3)*np.exp(-px/2.2)
add(pad, fr(1080), 0.22, 0)

# ── 事件 ──
def squeal(at, f0, f1, dur, gain, pan=0.0):
    n=int(dur*SR); x=np.arange(n)/SR
    f=f0+(f1-f0)*(x/dur)**0.7
    ph=np.cumsum(2*np.pi*f/SR)
    s=np.sin(ph)*np.sin(np.pi*x/dur)**1.5
    s+=bp(noise(n),1500,7000)*0.25*np.sin(np.pi*x/dur)**2
    add(s,at,gain,pan)

def paper_at(at, dur, gain, pan=0.0):
    n=int(dur*SR)
    s=bp(noise(n),1800,9000)
    e=np.abs(np.sin(2*np.pi*(3.2)*np.arange(n)/SR))**3
    s*=e
    add(s,at,gain,pan)

def thud(at, f=110, dur=0.5, gain=0.6, pan=0.0, bright=0.0):
    n=int(dur*SR); x=np.arange(n)/SR
    s=np.sin(2*np.pi*f*x*(1+0.4*np.exp(-x/0.03)))*env(n,0.001,0.09)
    s+=bp(noise(n),200,2500)*env(n,0.001,0.03)*(0.5+bright)
    s/=np.max(np.abs(s))+1e-9
    add(s,at,gain,pan)

def click(at, gain=0.5, pan=0.0, f=2400):
    n=int(0.05*SR); x=np.arange(n)/SR
    s=noise(n)*np.exp(-x/0.003)+np.sin(2*np.pi*f*x)*np.exp(-x/0.01)*0.4
    add(s/np.max(np.abs(s)),at,gain,pan)

def ping(at, f=3100, gain=0.4, dur=1.4):
    n=int(dur*SR); x=np.arange(n)/SR
    s=(np.sin(2*np.pi*f*x)+0.4*np.sin(2*np.pi*f*1.51*x))*np.exp(-x/0.5)
    add(s/np.max(np.abs(s)),at,gain,0.1)

# 色环生长：粉末摩擦
squeal(fr(45), 900, 2600, 1.6, 0.10)
paper_at(fr(120), 0.6, 0.06, -0.2)
# 旋转
squeal(fr(240), 220, 180, 3.0, 0.05, 0.2)
# 色带展开：12 张卡纸扇开
for i in range(12):
    paper_at(fr(260+i*6), 0.22, 0.05, -0.5+ i/12.0)
# 滴漆
thud(fr(490), 150, 0.45, 0.55, -0.15, 0.6)
thud(fr(570), 120, 0.6, 0.45, 0.15, 0.3)
# 读数脉冲
for i in range(9):
    click(fr(665+i*7), 0.14, 0.1, 1800+i*40)
# 纸条
paper_at(fr(850), 1.2, 0.10, 0.3)
thud(fr(930), 220, 0.35, 0.30, 0.1, 0.4)
# 收束吸入
n=int(2.0*SR); x=np.arange(n)/SR
sw=180+1600*(x/2.0)**2
inh=np.sin(np.cumsum(2*np.pi*sw/SR))*np.linspace(0,1,n)**2
add(inh, fr(1020), 0.16, 0)
# 落定 1080
hit(fr(1080), 32, 3.4, 0.95)
# 色粉 / 陶碗
paper_at(fr(1110), 1.4, 0.05, -0.2)
thud(fr(1170), 90, 0.9, 0.35, 0.2, 0.15)
# 丝绒 / 印刷机
paper_at(fr(1270), 1.6, 0.045, -0.3)
for i in range(4):
    click(fr(1360+i*11), 0.22, 0.25, 900+i*120)
    thud(fr(1360+i*11)+0.02, 150, 0.16, 0.18, 0.25, 0.5)
# 网格嵌合
for i in range(7):
    thud(fr(1450+i*9), 180, 0.18, 0.30, -0.4+i*0.13, 0.6)
click(fr(1580), 0.20, 0.0, 3200)
# 收线 / 收尾
squeal(fr(1690), 3000, 700, 0.9, 0.07, 0)
ping(fr(1740), 3100, 0.35)

# ── 母带 ──
def reverb(x):
    y=x.copy()
    for d,g in ((0.061,0.16),(0.113,0.12),(0.187,0.08),(0.263,0.055)):
        s=int(d*SR); y[s:]+=x[:-s]*g
    return y
Lr=reverb(L); Rr=reverb(R)
Lo=Lr*0.9+Rr*0.1; Ro=Rr*0.9+Lr*0.1
def softclip(x,k=1.1): return np.tanh(x*k)/np.tanh(k)
Lo=softclip(Lo/(np.max(np.abs(Lo))+1e-9)*0.90)
Ro=softclip(Ro/(np.max(np.abs(Ro))+1e-9)*0.90)
fi=int(0.4*SR); fo=int(2.0*SR)
fade=np.ones(N); fade[:fi]=np.linspace(0,1,fi)**1.4; fade[-fo:]=np.linspace(1,0,fo)**1.5
Lo*=fade; Ro*=fade
Lo=Lo[:N2]; Ro=Ro[:N2]
os.makedirs('public/audio',exist_ok=True)
sf.write('public/audio/chroma.wav', np.stack([Lo,Ro],axis=1).astype(np.float32), SR, subtype='PCM_16')
print('wrote', len(Lo)/SR, 's  peak', round(float(np.max(np.abs(Lo))),3))
