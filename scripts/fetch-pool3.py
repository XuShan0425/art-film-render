# -*- coding: utf-8 -*-
"""抓"实拍材质色彩"素材：颜料、漆、印刷、色纸、霓虹、金属，用于 Chroma 片子的实拍段落。"""
import urllib.request, urllib.parse, re, json, os, subprocess
UA={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'}
FF='C:/Windows/ffmpeg-9.0.1/bin/ffmpeg.exe'
def get(u): return urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=40).read().decode('utf-8','ignore')
PLAN = {
 'paintmix':  ('paint mixing colors macro', ['paint','mix','color','colour'], 2),
 'paintpour': ('paint pouring slow motion', ['pour','paint','ink'], 2),
 'riso':      ('printing press close up', ['print','press','paper'], 2),
 'paperswirl':('colored paper background', ['paper','color','abstract'], 2),
 'fabric':    ('silk fabric flowing slow motion', ['silk','fabric','cloth'], 2),
 'neoncity':  ('neon light abstract', ['neon','light','abstract'], 2),
 'metal':     ('brushed metal texture macro', ['metal','texture'], 2),
 'pigment':   ('powder pigment explosion', ['powder','pigment','color','colour'], 2),
}
os.makedirs('out/pool3', exist_ok=True); os.makedirs('out/pool3/sheet', exist_ok=True)
idx={}
for slug,(q,kw,n) in PLAN.items():
    try: html=get('https://www.pexels.com/search/videos/'+urllib.parse.quote(q)+'/')
    except Exception as e:
        print('ERR',slug,e); continue
    vids=[]
    for m in re.finditer(r'href="/video/([a-z0-9-]+?)-(\d+)/"', html):
        name,vid=m.group(1),m.group(2)
        if vid in [v[2] for v in vids]: continue
        vids.append((sum(1 for k in kw if k in name.replace('-',' ')), name, vid))
    vids.sort(key=lambda x:-x[0])
    got=0
    for score,name,vid in vids:
        if got>=n: break
        if score==0: continue
        try: page=get('https://www.pexels.com/video/%s-%s/'%(name,vid))
        except Exception: continue
        urls=sorted(set(re.findall(r'https://videos\.pexels\.com/video-files/%s/\d+-(?:uhd|hd)_\d+_\d+_\d+fps\.mp4'%vid, page)), key=lambda u:-int(re.search(r'_(\d+)_(\d+)_',u).group(1)))
        if not urls: continue
        dst='out/pool3/%s_%d.mp4'%(slug,got+1)
        try:
            with urllib.request.urlopen(urllib.request.Request(urls[0], headers=UA), timeout=120) as r, open(dst,'wb') as f: f.write(r.read())
        except Exception as e:
            print('  dlfail',e); continue
        if os.path.getsize(dst)<300000: os.remove(dst); continue
        subprocess.run([FF,'-v','error','-y','-i',dst,'-vf',"select='not(mod(n\\,18))',scale=440:-1,tile=4x2","-frames:v","1",'out/pool3/sheet/%s_%d.jpg'%(slug,got+1)],check=False)
        idx['%s_%d'%(slug,got+1)]={'url':urls[0],'page':'https://www.pexels.com/video/%s-%s/'%(name,vid),'name':name,'q':q}
        print('OK','%s_%d'%(slug,got+1),round(os.path.getsize(dst)/1e6,1),'MB',name[:50])
        got+=1
json.dump(idx, open('out/pool3/index.json','w'), indent=1)
