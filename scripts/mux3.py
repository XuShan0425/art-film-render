# -*- coding: utf-8 -*-
import subprocess, os, io
FF='C:/Windows/ffmpeg-9.0.1/bin/ffmpeg.exe'
os.chdir(r'H:/ARCHIVE/art-film-2026-11-12')
# 每段先剥离其自带音轨，再拼视频
for i in range(3):
    subprocess.run([FF,'-v','error','-y','-i','out/seg-%d.mp4'%i,'-an','-c','copy','out/v%d.mp4'%i], check=True)
lines=["file 'v%d.mp4'"%i for i in range(3)]
io.open('out/vlist.txt','w',encoding='utf-8').write("".join(l+chr(10) for l in lines))
subprocess.run([FF,'-v','error','-y','-f','concat','-safe','0','-i','out/vlist.txt','-c','copy','out/chroma-video.mp4'], check=True)
subprocess.run([FF,'-v','error','-y','-i','out/chroma-video.mp4','-i','public/audio/chroma.wav','-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart','out/chroma-v2.mp4'], check=True)
print('ok')
