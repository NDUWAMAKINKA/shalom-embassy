p='assets/css/rpa30.css'
s=open(p).read()
# order matters: replace navy first, then surfaces
repls = [
 ("#0b2240","#10709c"),   # --navy -> logo teal
 ("#080808","#071a36"),   # canvas -> midnight navy
 ("#0f0f0f","#0b2240"),   # surface -> dark navy
 ("#131313","#0e2a4f"),   # surface-2
 ("#1f1f1f","#1a3a66"),   # hair
 ("#262626","#1f4373"),   # line
 ("#f0a92b","#e2b42c"),   # gold
 ("#ffd27a","#f6d468"),   # gold-light
 ("#b8730b","#b88a1a"),   # gold-deep
 ("#b6b6b6","#cfd8e3"),   # muted
 ("#cccccc","#e6edf5"),   # soft
]
for a,b in repls:
    s=s.replace(a,b)
s=s.replace("#ffffff","#fdfaf3")
s=s.replace("#fff","#fdfaf3")
open(p,'w').write(s)
print("done")
PY
