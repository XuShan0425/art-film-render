# -*- coding: utf-8 -*-
"""念白：Gemini 3.8 Flash 写稿，edge-tts 合成，按帧区间对位。"""
import subprocess, os, json, numpy as np, soundfile as sf
LINES=[
 (60,180,"颜色不是视觉的偶然。"),
 (270,390,"它先被拆解为波长。"),
 (510,630,"被编号，被赋予精确坐标。"),
 (700,810,"在理性刻度里锚定纯度。"),
 (870,970,"秩序在此建立。"),
 (1140,1240,"当界限重叠，彼此并置。"),
 (1470,1620,"严苛的度量，终成审美。"),
]
os.makedirs('out/voice',exist_ok=True)
SR=48000
for i,(a,b,txt) in enumerate(LINES):
    out='out/voice/line%d.mp3'%i
    subprocess.run(['edge-tts','--voice','zh-CN-YunyangNeural','--rate=-8%','--text',txt,'--write-media',out],check=False)
    print(i, os.path.exists(out), os.path.getsize(out) if os.path.exists(out) else 0, txt)
