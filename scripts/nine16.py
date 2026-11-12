# -*- coding: utf-8 -*-
"""把实拍素材转成 Remotion 可用的首帧/素材：转 1080p 兼容的 h264、裁成 9:16 备份、并抽首帧做色彩统计。"""
import json, os, subprocess, io
FF='C:/Windows/ffmpeg-9.0.1/bin/ffmpeg.exe'
pool=json.load(open('out/pool3/index.json',encoding='utf-8'))
os.makedirs('public/footage', exist_ok=True)
os.makedirs('out/pool3/nine16', exist_ok=True)
stats={}
for key in pool:
    src='out/pool3/%s.mp4'%key
    if not os.path.exists(src): continue
    dst='out/pool3/nine16/%s.mp4'%key
    # 9:16 竖屏：取中心裁切 1080x1920，30fps，6 秒
    cmd=[FF,'-v','error','-y','-i',src,'-t','9','-vf',
         "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,format=yuv420p",
         '-an','-c:v','libx264','-crf','20','-preset','veryfast',dst]
    subprocess.run(cmd, check=False)
    ok=os.path.exists(dst) and os.path.getsize(dst)>100000
    print(key, ok, round(os.path.getsize(dst)/1e6,2) if ok else 0)
