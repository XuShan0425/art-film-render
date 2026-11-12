import io
p='scripts/ref-hunt.py'
s=io.open(p,encoding='utf-8').read()
s=s.replace("import urllib.request, urllib.parse, re, json, os, subprocess, io","import urllib.request, urllib.parse, re, json, os, subprocess, io, time")
s=s.replace("def api(params):","def api(params):\n    time.sleep(1.6)")
s=s.replace("gsrlimit':3","gsrlimit':2")
io.open(p,'w',encoding='utf-8').write(s)
print('ok')
