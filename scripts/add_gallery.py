import re, os
base='assets/img'
# collect unique base names (without ext) for images excluding logo/flag/opt
files=os.listdir(base)
bases=set()
for f in files:
    if f.lower().endswith(('.jpg','.jpeg','.png','.webp')) and not any(x in f.lower() for x in ['logo','flag','opt']):
        bases.add(os.path.splitext(f)[0])
# prefer webp
chosen=[]
for b in sorted(bases):
    if b+'.webp' in files:
        chosen.append(b+'.webp')
    elif b+'.jpg' in files:
        chosen.append(b+'.jpg')
    elif b+'.jpeg' in files:
        chosen.append(b+'.jpeg')
    elif b+'.png' in files:
        chosen.append(b+'.png')

# read existing gallery to know which are already present
html=open('gallery.html').read()
existing=set(re.findall(r'assets/img/([a-zA-Z0-9_-]+\.(?:webp|jpg|jpeg|png))', html))

# build items for new images
items=[]
for fn in chosen:
    if fn in existing:
        continue
    name=fn.rsplit('.',1)[0]
    caption=name.replace('-',' ').title()
    tag=fn
    item=f'''      <button class="gallery-item" type="button" data-gallery-item data-category="moments" data-caption="{caption}" data-tags="{name.replace('-',' ')}" data-full="assets/img/{fn}?v=hd" aria-label="View {caption}"><img src="assets/img/{fn}?v=hd" alt="{caption}" loading="lazy" decoding="async" width="600" height="450"><span class="gallery-caption">{caption}</span></button>'''
    items.append(item)

# insert before closing of gallery-grid
marker='    <div class="gallery-grid">'
start=html.index(marker)
end=html.index('    </div>', start+len(marker))
insert='\n'.join(items)+'\n'
newhtml=html[:end]+insert+html[end:]
open('gallery.html','w').write(newhtml)
print('added', len(items))