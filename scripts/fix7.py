# -*- coding: utf-8 -*-
import io,re
p='src/scenes/Film.tsx'
s=io.open(p,encoding='utf-8').read()
# 背景大字：墨 在左、静 在右（不再叠在同一位置）
old1 = """        <div className="serif" style={{position:'absolute', left:96, top:60, fontSize:820, fontWeight:220, color:'#fff', lineHeight:1, opacity: 0.026 * (1 - xf)}}>墨</div>
        <div className="serif" style={{position:'absolute', left:96, top:60, fontSize:820, fontWeight:220, color:'#fff', lineHeight:1, opacity: 0.026 * xf * echoOut}}>静</div>"""
new1 = """        <div className="serif" style={{position:'absolute', left:52, top:74, fontSize:790, fontWeight:215, color:'#fff', lineHeight:1, opacity: 0.030 * (1 - 0.55 * xf)}}>墨</div>
        <div className="serif" style={{position:'absolute', left:1000, top:74, fontSize:790, fontWeight:215, color:'#fff', lineHeight:1, opacity: 0.030 * xf}}>静</div>"""
assert old1 in s, 'bg block not found'
s = s.replace(old1, new1)
io.open(p,'w',encoding='utf-8').write(s)
print('ok')
