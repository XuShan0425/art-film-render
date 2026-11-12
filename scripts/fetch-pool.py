# -*- coding: utf-8 -*-
"""下载候选素材：从 Pexels 搜索页解析视频页 id -> 视频页 -> 取最大 mp4。
输出 out/pool/<slug>.mp4，并写 out/pool/index.json。"""
import urllib.request, urllib.parse, re, json, os, subprocess

UA={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'}
def get(u):
    return urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=40).read().decode('utf-8','ignore')

QUERIES = {
 'ink': 'black ink water',
 'inkdrop': 'ink drop',
 'paper': 'paper texture macro',
 'neon': 'neon rain night',
 'tree': 'tree branches wind',
 'smoke': 'smoke black background',
 'waterdark': 'water surface ripples dark',
 'crowd': 'crowd walking city night',
}
os.makedirs('out/pool', exist_ok=True)
index={}
for slug,q in QUERIES.items():
    try:
        html=get('https://www.pexels.com/search/videos/'+urllib.parse.quote(q)+'/')
    except Exception as e:
        print('ERR search', slug, e); continue
    vids=[]
    for m in re.finditer(r'href="/video/([a-z0-9-]+?)-(\d+)/"', html):
        if m.group(2) not in [v[1] for v in vids]:
            vids.append((m.group(1), m.group(2)))
    picked=None
    for slugname, vid in vids[:4]:
        try:
            page=get('https://www.pexels.com/video/%s-%s/' % (slugname, vid))
        except Exception:
            continue
        cands=re.findall(r'https://videos\.pexels\.com/video-files/%s/\d+-(?:uhd|hd)_(\d+)_(\d+)_\d+fps\.mp4' % vid, page)
        urls=sorted(set(re.findall(r'https://videos\.pexels\.com/video-files/%s/\d+-(?:uhd|hd)_\d+_\d+_\d+fps\.mp4' % vid, page)),
                    key=lambda u: -int(re.search(r'_(\d+)_(\d+)_',u).group(1)))
        if not urls: continue
        u=urls[0]
        dst='out/pool/%s.mp4'%slug
        try:
            with urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=90) as resp, open(dst,'wb') as f:
                f.write(resp.read())
            size=os.path.getsize(dst)
            if size < 200000:
                os.remove(dst); continue
            picked={'url':u,'page':'https://www.pexels.com/video/%s-%s/'%(slugname,vid),'bytes':size,'q':q}
            break
        except Exception as e:
            print('  dl fail', u[:80], e)
    if picked:
        index[slug]=picked
        print('OK', slug, round(picked['bytes']/1e6,1),'MB', picked['page'])
    else:
        print('MISS', slug)
json.dump(index, open('out/pool/index.json','w'), indent=1)
