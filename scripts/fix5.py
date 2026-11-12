
import io,re
p='src/scenes/Film.tsx'
s=io.open(p,encoding='utf-8').read()
def un(m):
    return chr(int(m.group(1),16))
s=re.sub(r'\\u([0-9A-Fa-f]{4})', un, s)
io.open(p,'w',encoding='utf-8').write(s)
print('remaining', s.count('\\u'))
print([l for l in s.split('\n') if 'N' in l and 'VLabel text' in l])
