# -*- coding: utf-8 -*-
import json,io,collections
d=json.load(io.open(r'H:\\ARCHIVE\\video-shotcraft\\gallery\\api\\library.json',encoding='utf-8'))
print(type(d))
if isinstance(d,dict):
    print(list(d.keys())[:12])
    for k,v in d.items():
        if isinstance(v,list):
            print(k, len(v))
            if v: print('  sample keys', list(v[0].keys())[:14])
