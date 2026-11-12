import io
p='scripts/ref-hunt.py'
s=io.open(p,encoding='utf-8').read()
s=s.replace("UA={'User-Agent':'artfilm/1.0 (research; local)'}","UA={'User-Agent':'ArtFilmResearch/1.0 (contact: research@example.org) python-urllib/3.14'}")
io.open(p,'w',encoding='utf-8').write(s)
print('ua patched')
