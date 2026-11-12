import re
html=open('gallery.html').read()
# find gallery-grid closing
marker='    <div class="gallery-grid">'
start=html.index(marker)
end=html.index('    </div>', start+len(marker))
# pick 6 existing images from assets/img (unique webp)
import os
files=[f for f in os.listdir('assets/img') if f.endswith('.webp') and 'logo' not in f and 'flag' not in f]
files=sorted(set(files))[:6]
items=[]
for i,fn in enumerate(files,1):
    caption=f"Shalom Embassy moment {i}"
    item=f'''      <button class="gallery-item" type="button" data-gallery-item data-category="moments" data-caption="{caption}" data-tags="shalom embassy moment" data-full="assets/img/{fn}?v=hd" aria-label="View {caption}"><img src="assets/img/{fn}?v=hd" alt="{caption}" loading="lazy" decoding="async" width="600" height="450"><span class="gallery-caption">{caption}</span></button>'''
    items.append(item)
insert='\n'.join(items)+'\n'
newhtml=html[:end]+insert+html[end:]
open('gallery.html','w').write(newhtml)
print('added', len(items))
PY
