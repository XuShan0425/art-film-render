
import io
p='src/scenes/Film.tsx'
s=io.open(p,encoding='utf-8').read()
s=s.replace("{'\\u58A8'}", "\u58a8").replace("{'\\u9759'}", "\u9759")
io.open(p,'w',encoding='utf-8').write(s)
print('done', s.count('\\u'))
