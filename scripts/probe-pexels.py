# -*- coding: utf-8 -*-
import urllib.request
UA={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36','Referer':'https://www.pexels.com/'}
for u in ['https://www.pexels.com/search/videos/ink%20in%20water/',
          'https://www.pexels.com/video/ink-in-water-1943483/',
          'https://api.openverse.org/v1/images/?q=ink%20water&page_size=3']:
    try:
        r=urllib.request.Request(u, headers=UA)
        b=urllib.request.urlopen(r, timeout=25).read()
        print('OK', len(b), u)
        # 找 mp4 链接
        import re
        links=set(re.findall(rb'https://[^"\' ]+?\.mp4[^"\' ]*', b))
        for l in list(links)[:5]: print('  ', l.decode()[:120])
    except Exception as e:
        print('ERR', e, u)
