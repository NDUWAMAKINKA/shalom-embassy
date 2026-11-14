import re, glob
for p in glob.glob('*.html'):
    s=open(p,encoding='utf-8').read()
    s2=re.sub(r'<div class="footer-marquee".*?</div>', '', s, flags=re.S)
    open(p,'w',encoding='utf-8').write(s2)
print('done')