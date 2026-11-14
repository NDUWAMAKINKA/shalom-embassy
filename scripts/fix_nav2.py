p='assets/css/rpa30.css'
s=open(p,encoding='utf-8').read()
s=s.replace('''.brand__mark {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #fdfaf3;
  overflow: hidden;
}

.brand__mark img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}''','''.brand__mark {
  display: grid;
  place-items: center;
  width: auto;
  height: 46px;
  flex: 0 0 auto;
  border-radius: 0;
  background: transparent;
  overflow: visible;
}

.brand__mark img {
  display: block;
  width: auto;
  height: 46px;
  object-fit: contain;
}''')
s=s.replace('background: rgba(15, 15, 15, .58);','background: rgba(11, 34, 64, .92);')
s=s.replace('background: rgba(13, 13, 13, .94);','background: rgba(11, 34, 64, .97);')
s=s.replace('color: rgba(255, 255, 255, .8);','color: #ffffff;')
s=s.replace('background: rgba(13, 13, 13, .98);','background: #0b2240;')
open(p,'w',encoding='utf-8').write(s)
print('done')