# -*- coding: utf-8 -*-
import subprocess, os, io
FF='C:/Windows/ffmpeg-9.0.1/bin/ffmpeg.exe'
os.chdir(r'H:/ARCHIVE/art-film-2026-11-12')
lines = [("file 'seg-%d.mp4'" % i) + chr(10) for i in range(3)]
io.open('out/seglist.txt','w',encoding='utf-8').write("".join(lines))
subprocess.run([FF,'-v','error','-y','-f','concat','-safe','0','-i','out/seglist.txt','-c','copy','out/chroma-video.mp4'], check=True)
print('video', os.path.getsize('out/chroma-video.mp4'))
subprocess.run([FF,'-v','error','-y','-i','out/chroma-video.mp4','-i','public/audio/chroma.wav','-c:v','copy','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart','out/chroma-v2.mp4'], check=True)
print('muxed', os.path.getsize('out/chroma-v2.mp4'))
