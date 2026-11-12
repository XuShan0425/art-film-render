# -*- coding: utf-8 -*-
import subprocess, os, io
FF='C:/Windows/ffmpeg-9.0.1/bin/ffmpeg.exe'
os.chdir(r'H:/ARCHIVE/art-film-2026-11-12')
listf='out/seglist.txt'
io.open(listf,'w',encoding='utf-8').write("".join("file 'seg-%d.mp4'"+chr(10) % i for i in range(3)))
subprocess.run([FF,'-v','error','-y','-f','concat','-safe','0','-i',listf,'-c','copy','out/chroma-video.mp4'], check=True)
# 合成音轨
subprocess.run([FF,'-v','error','-y','-i','out/chroma-video.mp4','-i','public/audio/chroma.wav','-c:v','copy','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart','out/chroma-v2.mp4'], check=True)
print('ok', os.path.getsize('out/chroma-v2.mp4'))
