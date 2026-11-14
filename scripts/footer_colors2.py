p='assets/css/rpa30.css'
s=open(p,encoding='utf-8').read()
extra = '''

.footer-social a[href*="facebook"] { background: #1877f2; color: #fff; border-color: #1877f2; }
.footer-social a[href*="instagram"] { background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); color: #fff; border-color: #cc2366; }
.footer-social a[href*="youtube"] { background: #ff0000; color: #fff; border-color: #ff0000; }
.footer-social a[href*="x.com"] { background: #000; color: #fff; border-color: #000; }
.footer-social a[href*="t.me"] { background: #26a5e4; color: #fff; border-color: #26a5e4; }
'''
s += extra
open(p,'w',encoding='utf-8').write(s)
print('done')