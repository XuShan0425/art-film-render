# -*- coding: utf-8 -*-
"""从 9:16 素材抽 3 帧看真实成片效果：裁切、色调、颗粒。"""
from PIL import Image
import glob, os
keys=['paintmix_2','paintpour_1','paperswirl_1','pigment_2','fabric_2','riso_1','neoncity_1','metal_1']
cell=(300,533)
sheet=Image.new('RGB',(cell[0]*len(keys), cell[1]*2),(10,10,10))
for i,k in enumerate(keys):
    f='out/pool3/nine16/%s.mp4'%k
    if not os.path.exists(f): continue
    for j,ss in enumerate([1.0,4.0]):
        out='out/qa/fr_%s_%d.jpg'%(k,j)
        os.system('"C:/Windows/ffmpeg-9.0.1/bin/ffmpeg.exe" -v error -y -ss %s -i %s -frames:v 1 -vf scale=%d:-1 %s'%(ss,f,cell[0],out))
        if os.path.exists(out):
            im=Image.open(out).convert('RGB')
            sheet.paste(im,(i*cell[0], j*cell[1]))
sheet.save('out/qa/nine16-check.jpg',quality=86)
print('done')
