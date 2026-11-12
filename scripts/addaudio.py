# -*- coding: utf-8 -*-
import io
p='src/scenes/Film.tsx'
s=io.open(p,encoding='utf-8').read()
s=s.replace("import {AbsoluteFill, Audio, staticFile, useCurrentFrame","import {AbsoluteFill, Audio, staticFile, useCurrentFrame")
# 插入 Audio
if 'score.wav' not in s:
    s=s.replace("      <FilmTexture frame={f} grain={0.055} vignette={0.86} />","      <Audio src={staticFile('audio/score.wav')} />\n      <FilmTexture frame={f} grain={0.055} vignette={0.86} />")
io.open(p,'w',encoding='utf-8').write(s)
print('score.wav' in s)
