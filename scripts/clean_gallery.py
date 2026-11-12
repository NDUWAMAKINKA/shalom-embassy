import re
html=open('gallery.html').read()
lines=html.splitlines(keepends=True)
exclude=['book','map','poster','conference','event-','night-freedom','worship-weapon','card-welcome']
new=[]
removed=0
for line in lines:
    if 'gallery-item' in line:
        low=line.lower()
        if any(k in low for k in exclude):
            removed+=1
            continue
    new.append(line)
open('gallery.html','w').write(''.join(new))
print('removed', removed)
PY
