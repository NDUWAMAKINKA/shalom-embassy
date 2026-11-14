import glob
old='''      <a class="nav-link" href="gallery.html">Gallery</a>
      <a class="nav-link" href="contact.html">Contact</a>'''
new='''      <a class="nav-link" href="gallery.html">Gallery</a>
      <div class="nav-more" data-more>
        <button class="nav-more__toggle" type="button" data-more-toggle aria-expanded="false" aria-controls="more-menu">
          More <span class="nav-more__caret"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></span>
        </button>
        <div class="nav-more__menu" id="more-menu" data-more-menu>
          <a href="impact.html">Our Impact</a>
          <a href="give.html">Give</a>
          <a href="contact.html">Contact Us</a>
          <a href="privacy.html">Privacy</a>
          <a href="terms.html">Terms</a>
        </div>
      </div>'''
for p in glob.glob('*.html'):
    s=open(p,encoding='utf-8').read()
    if old in s:
        s=s.replace(old,new)
        open(p,'w',encoding='utf-8').write(s)
print('done')