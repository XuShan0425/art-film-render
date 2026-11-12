# -*- coding: utf-8 -*-
import urllib.request, re, json, os
UA={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'}
def get(u):
    return urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=30).read().decode('utf-8','ignore')

queries = ['ink in water','black ink water','ink drop','paper texture macro','neon rain night','tree branches wind','smoke black background','water surface ripples dark','torn paper','crowd walking city night']
out={}
for q in queries:
    u='https://www.pexels.com/search/videos/'+urllib.parse.quote(q)+'/'
    try:
        b=get(u)
    except Exception as e:
        print('ERR',q,e); continue
    hd=sorted(set(re.findall(r'https://videos\.pexels\.com/video-files/\d+/\d+-(?:hd|uhd)_\d+_\d+_\d+fps\.mp4', b)))
    out[q]=hd[:8]
    print(q, len(hd))
json.dump(out, open('out/pexels-map.json','w'), indent=1)
