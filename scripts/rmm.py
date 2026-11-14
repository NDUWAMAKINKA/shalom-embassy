p='index.html'
s=open(p,encoding='utf-8').read()
old='''<section class="section section--tight">
  <div class="container">
    <div class="section-head section-head--center reveal">
      <p class="eyebrow">Gallery</p>
      <h2 class="h2">Moments of grace.</h2>
      <p class="lead">Glimpses of what God is doing in our family.</p>
    </div>
    <div class="grid grid-3">
      <figure class="reveal"><img src="assets/img/congregation.webp" alt="Sunday worship" width="400" height="300" loading="lazy" decoding="async"><figcaption>Sunday worship</figcaption></figure>
      <figure class="reveal" data-delay="1"><img src="assets/img/youth-worship.webp" alt="The next generation" width="400" height="300" loading="lazy" decoding="async"><figcaption>The next generation</figcaption></figure>
      <figure class="reveal" data-delay="2"><img src="assets/img/worship-crowd.webp" alt="Worship encounter" width="400" height="300" loading="lazy" decoding="async"><figcaption>Worship encounter</figcaption></figure>
      <figure class="reveal"><img src="assets/img/auditorium.webp" alt="Our home in Lusaka" width="400" height="300" loading="lazy" decoding="async"><figcaption>Our home in Lusaka</figcaption></figure>
      <figure class="reveal" data-delay="1"><img src="assets/img/preaching-stage.webp" alt="A word for the people" width="400" height="300" loading="lazy" decoding="async"><figcaption>A word for the people</figcaption></figure>
      <figure class="reveal" data-delay="2"><img src="assets/img/worship-singer.webp" alt="Worship that makes room" width="400" height="300" loading="lazy" decoding="async"><figcaption>Worship that makes room</figcaption></figure>
    </div>
  </div>
</section>
'''
if old in s:
    s=s.replace(old,'')
    open(p,'w',encoding='utf-8').write(s)
    print('done')
else:
    print('block not found')