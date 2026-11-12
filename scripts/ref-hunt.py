# -*- coding: utf-8 -*-
"""搜索准确审美关键词，取每类的参考图（用于定调，不进成片）。"""
import urllib.request, urllib.parse, re, json, os, subprocess, io, time
UA={'User-Agent':'ArtFilmResearch/1.0 (contact: research@example.org) python-urllib/3.14'}
def api(params):
    time.sleep(1.6)
    u='https://commons.wikimedia.org/w/api.php?'+urllib.parse.urlencode(params)
    return json.loads(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=40).read())

TERMS = ['Bauhaus exhibition poster','Itten color circle','Kandinsky color study','Josef Albers Homage to the Square','Bauhaus Dessau building','Hermann von Helmholtz colour diagram','Munsell color system','pantone color guide','Paul Klee color','Bauhaus magazine cover']
os.makedirs('out/ref', exist_ok=True)
FF='C:/Windows/ffmpeg-9.0.1/bin/ffmpeg.exe'
rows=[]
for t in TERMS:
    d=api({'action':'query','generator':'search','gsrsearch':t,'gsrnamespace':6,'gsrlimit':2,
           'prop':'imageinfo','iiprop':'url|size|mime','iiurlwidth':900,'format':'json'})
    for p in d.get('query',{}).get('pages',{}).values():
        ii=p.get('imageinfo',[{}])[0]
        if ii.get('mime','').startswith('image/') and ii.get('thumburl'):
            rows.append((t, ii['thumburl'], p['title']))
print(len(rows))
# 拼成一张参考墙
files=[]
for i,(t,u,title) in enumerate(rows[:24]):
    try:
        b=urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=40).read()
        fn='out/ref/%02d.jpg'%i
        open(fn,'wb').write(b); files.append(fn)
    except Exception as e:
        print('ERR', e, title)
print('saved', len(files))
json.dump([{'term':r[0],'title':r[2]} for r in rows[:24]], open('out/ref/index.json','w'), ensure_ascii=False, indent=1)
