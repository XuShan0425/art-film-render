# -*- coding: utf-8 -*-
import json, urllib.request, urllib.parse
UA={'User-Agent':'artfilm-research/1.0 (contact: local)'}
def get(u):
    r=urllib.request.Request(u, headers=UA)
    return urllib.request.urlopen(r, timeout=30).read()

q=urllib.parse.quote('ink water')
u=('https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=%s'
   '&gsrnamespace=6&gsrlimit=30&prop=imageinfo&iiprop=url|size|mime|extmetadata&format=json')%q
d=json.loads(get(u))
pages=d.get('query',{}).get('pages',{})
rows=[]
for p in pages.values():
    ii=p.get('imageinfo',[{}])[0]
    rows.append((ii.get('mime'), ii.get('width'), ii.get('height'), p['title']))
from collections import Counter
print(Counter([r[0] for r in rows]))
for r in rows:
    if r[0] in ('video/webm','video/ogg','image/svg+xml') or (r[1] and r[1]>2000):
        print(r)
