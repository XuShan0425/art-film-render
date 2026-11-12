
import io
p='src/scenes/Film.tsx'
s=io.open(p,encoding='utf-8').read()
s=s.replace("from './lib/glyphData'","from '../lib/glyphData'").replace("from './lib/ink'","from '../lib/ink'").replace("from './lib/ui'","from '../lib/ui'").replace("from './lib/fonts'","from '../lib/fonts'")
io.open(p,'w',encoding='utf-8').write(s)
print('ok')
