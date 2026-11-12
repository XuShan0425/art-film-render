# -*- coding: utf-8 -*-
import json, subprocess, os
FF='C:/Windows/ffmpeg-9.0.1/bin/ffmpeg.exe'
idx=json.load(open('out/pool/index.json'))
os.makedirs('out/pool/sheet', exist_ok=True)
for slug in idx:
    src='out/pool/%s.mp4'%slug
    out='out/pool/sheet/%s.jpg'%slug
    # 4 帧拼图
    cmd=[FF,'-v','error','-y','-i',src,'-vf',
         "select='not(mod(n\\,25))',scale=480:-1,tile=4x2","-frames:v","1",out]
    subprocess.run(cmd, check=False)
    print(slug, os.path.exists(out), round(os.path.getsize(out)/1024) if os.path.exists(out) else 0,'KB')
