# -*- coding: utf-8 -*-
import json,io,collections
d=json.load(io.open(r'H:\\ARCHIVE\\video-shotcraft\\gallery\\api\\library.json',encoding='utf-8'))
cats=collections.defaultdict(list)
for c in d['cards']:
    cats[c['category']].append(c)
for k,v in cats.items():
    print('==',k,len(v))
    for c in v:
        print('  ', c['name'], '|', (c.get('summary') or '')[:58])
