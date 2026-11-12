# -*- coding: utf-8 -*-
"""从 Pexels 搜索页里，为每个主题按关键词挑"黑白水墨走向"的候选，下载 3 条 + 出缩略图。"""
import urllib.request, urllib.parse, re, json, os, subprocess
UA={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'}
FF='C:/Windows/ffmpeg-9.0.1/bin/ffmpeg.exe'
def get(u):
    return urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=40).read().decode('utf-8','ignore')

PLAN = {
 # slug: (query, 关键词偏好, 数量)
 'inkblack':   ('ink in water black background', ['black','dark','smoke','ink'], 3),
 'papermacro': ('paper close up texture', ['texture','macro','paper','white'], 3),
 'rainwindow': ('rain on window night', ['rain','window','bokeh'], 3),
 'branch':     ('bare tree branches wind', ['tree','branch'], 3),
}
os.makedirs('out/pool2', exist_ok=True)
os.makedirs('out/pool2/sheet', exist_ok=True)
idx={}
for slug,(q,kw,n) in PLAN.items():
    try:
        html=get('https://www.pexels.com/search/videos/'+urllib.parse.quote(q)+'/')
    except Exception as e:
        print('ERR', slug, e); continue
    vids=[]
    for m in re.finditer(r'href="/video/([a-z0-9-]+?)-(\d+)/"', html):
        name, vid = m.group(1), m.group(2)
        if vid in [v[1] for v in vids]: continue
        score=sum(1 for k in kw if k in name.replace('-',' '))
        vids.append((score, name, vid))
    vids.sort(key=lambda x:-x[0])
    got=0
    for score,name,vid in vids:
        if got>=n: break
        if score==0: continue
        try:
            page=get('https://www.pexels.com/video/%s-%s/'%(name,vid))
        except Exception:
            continue
        urls=sorted(set(re.findall(r'https://videos\.pexels\.com/video-files/%s/\d+-(?:uhd|hd)_\d+_\d+_\d+fps\.mp4'%vid, page)),
                    key=lambda u:-int(re.search(r'_(\d+)_(\d+)_',u).group(1)))
        if not urls: continue
        dst='out/pool2/%s_%d.mp4'%(slug,got+1)
        try:
            with urllib.request.urlopen(urllib.request.Request(urls[0], headers=UA), timeout=120) as r, open(dst,'wb') as f:
                f.write(r.read())
        except Exception as e:
            print('  dl fail', e); continue
        if os.path.getsize(dst)<300000:
            os.remove(dst); continue
        # 缩略图 4 帧
        sheet='out/pool2/sheet/%s_%d.jpg'%(slug,got+1)
        subprocess.run([FF,'-v','error','-y','-i',dst,'-vf',"select='not(mod(n\\,20))',scale=440:-1,tile=4x2","-frames:v","1",sheet],check=False)
        idx['%s_%d'%(slug,got+1)]={'url':urls[0],'page':'https://www.pexels.com/video/%s-%s/'%(name,vid),'q':q,'name':name}
        print('OK','%s_%d'%(slug,got+1), round(os.path.getsize(dst)/1e6,1),'MB', name[:46])
        got+=1
json.dump(idx, open('out/pool2/index.json','w'), indent=1)
