import sys
p='H:/ARCHIVE/art-film-2026-11-12/scripts/score.py'
s=open(p,encoding='utf-8').read()
s=s.replace("e = (np.sin(np.pi*np.clip(loc*1.06,0,1))**0.55)","e = (np.sin(np.pi*np.clip(loc*1.06,0,1))**0.85)")
s=s.replace("add(sig, a0, gain*0.5, pan=-0.25)","add(sig, a0, gain*0.20, pan=-0.25)")
s=s.replace("add(np.roll(sig, 311), a0, gain*0.45, pan=0.3)","add(np.roll(sig, 311), a0, gain*0.18, pan=0.3)")
s=s.replace("brush(724, 784, 37, 0.55)","brush(724, 784, 37, 0.34)")
s=s.replace("brush(790, 858, 41, 0.4)","brush(790, 858, 41, 0.25)")
s=s.replace("S = SR","SR = SR")
s=s.replace("x = np.convolve(x, np.ones(5)/5, mode='same')","x = np.convolve(x, np.ones(9)/9, mode='same')")
s=s.replace("x = x - np.convolve(x, np.ones(240)/240, mode='same')","x = x - np.convolve(x, np.ones(420)/420, mode='same')")
# 柔化笔拂的高频：再叠一层低通
s=s.replace("sig = norm(x * e)","x = np.convolve(x, np.ones(6)/6, mode='same')\n    sig = norm(x * e)")
s=s.replace("L += bed * bed_env * 0.16","L += bed * bed_env * 0.155")
open(p,'w',encoding='utf-8').write(s)
print('patched')
