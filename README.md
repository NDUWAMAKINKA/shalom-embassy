# Shalom Embassy Ministries International — Website

A complete, responsive, static website for **Shalom Embassy Ministries International**, Lusaka, Zambia. Built around the church’s official logo, its teal-and-gold palette, and the message **“Nothing missing. Nothing broken.”**

## Live site

- **Website:** https://nduwamakinka.github.io/shalom-embassy/
- **Repository:** https://github.com/NDUWAMAKINKA/shalom-embassy

The site is deployed with GitHub Pages from the `main` branch.

## Pages

| File | Purpose |
|------|---------|
| `index.html` | Home — hero, welcome, service times, mandate, latest messages, ministries, languages, gallery, visit |
| `about.html` | Story, timeline, mission/vision, leadership, spiritual heritage, beliefs, ministries |
| `languages.html` | Zambia’s five most widely spoken languages, greetings, language spotlight |
| `sermons.html` | Featured message, filterable message library, YouTube channel links |
| `gatherings.html` | Weekly gatherings, what to expect, recent highlights, anniversary, visit |
| `give.html` | Giving & partnership, ways to give, integrity note |
| `contact.html` | Contact cards, WhatsApp contact form, local map, service times, FAQ |

## Preview locally

Open `index.html` directly, or run a local server:

```powershell
cd "C:\Users\hp\Desktop\SHALOM EMBASSY"
python -m http.server 8000
```

Then visit `http://localhost:8000`.

For exact webfont rendering, use the local server. Some browsers block webfont files when `index.html` is opened directly with `file://`; the site falls back to Georgia and Segoe UI but works normally over HTTP/HTTPS.

## Design

- **Official logo:** `assets/img/logo-official.png` — the actual Shalom Embassy oval seal, extracted from the church’s official poster artwork and cleaned to a transparent PNG. The simplified favicon is in `assets/favicon.svg`.
- **Palette sampled from the logo:**
  - Midnight navy: `#071a36`
  - Logo teal: `#10709c`
  - Turquoise: `#106f93`
  - Gold: `#e2b42c`
  - Logo-rim gold: `#f0c12e` (used for the fine structural borders)
  - Light gold: `#f6d468`
  - Cream/paper: `#fdfaf3` and `#f8f1e3`
- **Typography:** Fraunces (display serif) and Manrope (sans), self-hosted in `assets/fonts/`.
- **No frameworks, no build step.** Everything is plain HTML, CSS, and JavaScript.
- **Local images and fonts** so the site renders correctly without third-party CDNs.

## Key features

- Sticky header with mobile navigation overlay and focus management
- Live countdown to the next Sunday 07:00 CAT gathering (Africa/Lusaka)
- Scroll reveal animations, animated statistics, reduced-motion support
- Zambian language spotlight with keyboard-accessible tabs, copy-greeting action, and a floating language launcher on every page
- Language greetings for Bemba, Nyanja, Tonga, Lozi, and Kaonde with verified local phrases
- Sermon category filters
- Accessible photo lightbox with keyboard controls
- Contact/prayer form that opens WhatsApp with the message pre-filled
- Local map card with a Google Maps directions link
- SEO meta tags, Open Graph/Twitter cards, and Church JSON-LD
- Responsive down to 390px; no horizontal overflow
- Local OpenStreetMap-derived map image, so the visit section never shows a blank iframe

### Languages

The language section celebrates Zambia’s five most widely spoken languages: **Bemba, Nyanja, Tonga, Lozi, and Kaonde**. English is the official language of Zambia and the language of the website. The greetings were checked against Zambian language guides, including Zambian Translators International and public Silozi learning material. Speaker figures are approximate and vary by source. The floating globe opens a language panel; selecting a greeting shows a short welcome toast and links to the full language page.

## Important content notes

Service times, phone numbers, the address, and social links were taken from the church’s public YouTube channel, Facebook page, and official service posters:

- **Sunday Big Sunday:** 07:00 — 14:00 CAT
- **Wednesday Night of Solution:** 21:00 — 04:00 CAT
- **Prayer line:** +260 974 807 770
- **Church office:** +260 977 846 660
- **Address:** Behind Livonia Complex, Off Mumbwa Road, Garden House, Lusaka, Zambia

Please confirm these details with the church office before publishing, especially if times or phone numbers change.

### Giving

No bank or mobile-money account numbers were published because they are not public. The giving page invites visitors to request details from the church office via WhatsApp. Add the official account details when the church provides them.

### Contact form

The form is intentionally front-end only. On submit, it opens WhatsApp with the visitor’s message addressed to **+260 974 807 770**. There is no database and no server-side email.

### Map

The map is a locally stored OpenStreetMap-derived image centred on the Garden House/Lusaka area, with a link to Google Maps for exact directions. It is decorative rather than a live GPS pin. Replace `assets/img/map-lusaka.jpg` if you have a more precise map image.

## Photo credits

All photographs are from the church’s public Facebook page and official YouTube channel, plus official service posters. They were cropped, resized, and compressed for web use. See `MEDIA FILES/SOURCES.txt` for the source list. The originals are kept in `MEDIA FILES/originals/` for future use.

If the church has higher-resolution originals, replace the matching files in `assets/img/` using the same filenames and keep the `width`/`height` attributes in the HTML.

## Deployment

Upload the whole folder to any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages, cPanel, etc.) with `index.html` as the entry point. No server-side runtime is required.

Before launch:

1. Confirm service times, phone numbers, and the address.
2. Add official giving details if desired.
3. Set the real domain in the Open Graph `og:url` / `og:image` tags (currently relative, which is fine for local preview but not ideal for social scrapers).
4. Replace the approximate map image if a precise location graphic is available.
5. Review the privacy wording on the contact form with the church.

---

Built for the glory of God — **Nothing missing. Nothing broken.**
