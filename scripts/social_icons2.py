import glob
repls = [
 ('aria-label="Facebook">Facebook</a>', 'aria-label="Facebook"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2Z"/></svg></a>'),
 ('aria-label="Instagram">Instagram</a>', 'aria-label="Instagram"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="2.5" y="2.5" width="19" height="19" rx="5"/><path d="M16 11.4A4 4 0 1 1 12.6 8 4 4 0 0 1 16 11.4Z"/><path d="M17.5 6.5h.01"/></svg></a>'),
 ('aria-label="YouTube">YouTube</a>', 'aria-label="YouTube"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M22.5 6.4a2.8 2.8 0 0 0-2-2C18.8 4 12 4 12 4s-6.8 0-8.5.4a2.8 2.8 0 0 0-2 2A29 29 0 0 0 1 12a29 29 0 0 0 .5 5.6 2.8 2.8 0 0 0 2 2C5.2 20 12 20 12 20s6.8 0 8.5-.4a2.8 2.8 0 0 0 2-2A29 29 0 0 0 23 12a29 29 0 0 0-.5-5.6Z"/><path d="m10 15 5-3-5-3v6Z" fill="#fff"/></svg></a>'),
 ('aria-label="X">X</a>', 'aria-label="X"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.9 2H22l-7.3 8.3L23 22h-6.8l-5.3-6.9L4.8 22H1.7l7.8-8.9L1 2h7l4.8 6.4L18.9 2Z"/></svg></a>'),
 ('aria-label="Telegram">Telegram</a>', 'aria-label="Telegram"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg></a>'),
]
for p in glob.glob('*.html'):
    s=open(p,encoding='utf-8').read()
    for a,b in repls:
        s=s.replace(a,b)
    open(p,'w',encoding='utf-8').write(s)
print('done')