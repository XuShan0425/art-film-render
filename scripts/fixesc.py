
import io, re, sys
p = 'src/scenes/Film.tsx'
s = io.open(p, encoding='utf-8').read()
s = s.replace('\\u58A8  \\u2014  INK / STILLNESS', '\u58a8  \u2014  INK / STILLNESS')
s = s.replace('1920 \\u00D7 1080 \\u00B7 30P', '1920 \u00d7 1080 \u00b7 30P')
s = s.replace("'\\u4E09\\u7B14\\u843D\\u5B9A\\uFF0C\\u58A8\\u6C38\\u5728\\u7EB8\\u4E0A'", "'\u4e09\u7b14\u843d\u5b9a\uff0c\u58a8\u6c38\u5728\u7eb8\u4e0a'")
s = s.replace(">{\\u58A8}<", ">\u58a8<").replace(">{\\u9759}<", ">\u9759<")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok', s.count('\\u'))
