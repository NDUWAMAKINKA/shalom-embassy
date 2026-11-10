# Shalom Embassy Ministries International — Website

A complete, responsive, static website for **Shalom Embassy Ministries International**, Lusaka, Zambia. Built around the church’s official logo, its teal-and-gold palette, and the message **“Nothing missing. Nothing broken.”**

## Live site

- **Website:** https://nduwamakinka.github.io/shalom-embassy/
- **Repository:** https://github.com/NDUWAMAKINKA/shalom-embassy

The site is deployed with GitHub Pages from the `main` branch.

## Pages

| File | Purpose |
|------|---------|
| `index.html` | Home — hero, welcome, service times, mandate, latest messages, ministries, gallery, visit |
| `about.html` | Story, timeline, mission/vision, leadership, spiritual heritage, beliefs, ministries |
| `sermons.html` | Featured message, filterable message library, the Shalom Library catalogue, and the Everyday With The Holy Spirit reading room |
| `gatherings.html` | Weekly gatherings, what to expect, recent highlights, anniversary, visit |
| `give.html` | Giving & partnership, official IZB / Airtel Money / MTN Mobile Money / Zelle account details, integrity note |
| `contact.html` | Contact cards, WhatsApp contact form, local map, service times, FAQ |

## Preview locally

Open `index.html` directly, or run a local server:

```powershell
cd "C:\Users\hp\Desktop\SHALOM EMBASSY"
python -m http.server 8000
```

Then visit `http://localhost:8000`.

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
- Live countdown to the next monthly Sunday gathering — the first-Sunday Empowerment Sunday or last-Sunday 7 Hours service (Africa/Lusaka)
- Live church calendar with automatic weekly and monthly recurrence dates
- Homepage **Key Moments** gallery and **Dates to save** upcoming list
- Latest public YouTube posts, messages, and gallery moments refreshed in `data/feed.json`
- Shalom Library timeline and verified catalogue of published books and prayer manuals
- Everyday With The Holy Spirit reading room with a sample daily reading and links to the complete edition
- Responsive AVIF/WebP images with preloaded page heroes and lazy loading below the fold
- Minified CSS and cache-busted local assets for fast repeat visits
- Scroll reveal animations, animated statistics, reduced-motion support
- Sermon category filters
- Accessible photo lightbox with keyboard controls
- Contact/prayer form that opens WhatsApp with the message pre-filled
- Local map card with a Google Maps directions link
- SEO meta tags, Open Graph/Twitter cards, and Church JSON-LD
- Responsive down to 390px; no horizontal overflow
- Local OpenStreetMap-derived map image, so the visit section never shows a blank iframe

## Auto-updating social feed

The site now has a feed pipeline that keeps these sections fresh:

- **Latest sermons** — home page message cards
- **Latest from Shalom** — new YouTube, Facebook and Instagram posts
- **Latest moments** — new gallery images from connected social accounts
- **Upcoming events** — calculated locally from the weekly and monthly recurrence rules on the Gatherings page

`scripts/update_feed.py` writes `data/feed.json`; `assets/js/feed.js` reads it and renders the sections. YouTube is also refreshed live in the browser on every visit through a public reader, so the newest uploads appear without waiting for a build.

### What works immediately

YouTube is public, so the latest sermons, updates and moments update automatically with no setup.

### Optional GitHub Action

The included workflow (`.github/workflows/update-feed.yml`) refreshes the static JSON and social images. It is **manual-dispatch only** because GitHub Actions requires an active billing/actions setup on the account. Run it from **Actions → Update social feed → Run workflow** when that is available, or run `python scripts/update_feed.py` locally and commit the result.

### Optional feeds

Add these in GitHub → **Settings → Secrets and variables → Actions**:

| Secret | Purpose |
|---|---|
| `FACEBOOK_PAGE_ID` | Facebook page ID |
| `FACEBOOK_ACCESS_TOKEN` | Meta page access token with `pages_read_engagement` |
| `INSTAGRAM_USER_ID` | Instagram business account ID |
| `INSTAGRAM_ACCESS_TOKEN` | Meta token with Instagram basic display permissions |
| `CALENDAR_ICS_URL` | Public Google Calendar / ICS address |

Once the Meta secrets exist, Facebook and Instagram posts appear first, with their images downloaded into `assets/img/feed/`. The public Gatherings calendar and Upcoming list are generated in the browser from the service recurrence rules and do not depend on the feed pipeline. `CALENDAR_ICS_URL` is retained for the optional social-feed script; it is not required for the church calendar.

To refresh manually, run:

```powershell
python scripts/update_feed.py
```

## Shalom Library & reading room

The Library section on `sermons.html` is now a full library experience:

- A verified history of the published prayer books and devotionals, from the 2020 Jubilee Prayer Book edition through the current collection
- The complete catalogue of titles confirmed in the public Selar bookshop, Amazon Kindle listings, and the church bookshop
- A wider-library callout for `Workings of the Holy Spirit` and `Enter Jubilee By Fire`
- A quiet reading-room panel for `Everyday With The Holy Spirit` with a sample daily reading and direct links to the complete edition on Selar and the print edition

The sample reading is original website copy based on the book's published daily structure. The complete book text is not stored in this repository; it remains available through the official Selar download and the church bookshop. If the church supplies an authorised full-text PDF or HTML edition, it can be added to the reading room without changing the rest of the page.

## Translation concept — notes from Royal Priesthood

The Royal Priesthood Assemblies site uses a fully local translation system rather than a Google Translate widget:

- Each language has its own English-to-language phrase map in `assets/js/i18n/<code>.js`, loaded only when that language is chosen.
- A header language selector stores the chosen code in `localStorage` and updates the page `lang` attribute.
- On selection, the script walks every visible text node and translatable attribute, applies the map, and protects proper nouns such as church names, bank names, and account details with `notranslate`.
- Navigation, mobile menus, form placeholders, and dynamically inserted gallery text are translated too; a `MutationObserver` catches later changes.
- There is no third-party translation widget or runtime machine-translation call. Returning to English restores the original English strings.

For Shalom Embassy, the same architecture is used with a complete phrase map for every page in all 12 languages. The maps in `assets/js/i18n/` cover visible page text, placeholders, titles, `aria-label` text, image `alt` text, gallery captions, and the dynamically generated calendar, sermon-library, and social-feed labels. Tonga, Lozi, and Nyanja were translated separately from the other languages so the wording stays natural rather than falling back to a related language.

## Important content notes

Service times, phone numbers, the address, and social links were taken from the church’s public YouTube channel, Facebook page, and official service posters:

- **7 Hours of Nothing Missing, Nothing Broken (Healing & Deliverance Service):** every last Sunday, 07:00 — 14:00 CAT
- **Big Sunday:** quarterly, 07:00 — 14:00 CAT
- **Night of Solution:** Wednesdays, 21:00 — 04:00 CAT
- **Virtuous Women:** Tuesdays, 14:00 CAT
- **Morning Glory:** Monday — Saturday, 06:00 CAT
- **Midweek Service:** Wednesdays, 11:00 & 16:00 CAT
- **Healing & Deliverance:** Thursdays, 18:00 CAT
- **My Worship My Weapon 4:** first week of every month, Friday 21:00 CAT
- **Empowerment Sunday:** first week of every month, Sunday 07:00 — 14:00 CAT
- **Prayer line:** +260 974 807 770
- **Church office:** +260 977 846 660
- **Address:** Behind Livonia Complex, Off Mumbwa Road, Garden House, Lusaka, Zambia

The Gatherings page includes a live church calendar that calculates the next weekly and monthly occurrences automatically, plus an Upcoming list. The homepage countdown points to the next first-Sunday (Empowerment Sunday) or last-Sunday (7 Hours) service.

Please confirm these details with the church office before publishing, especially if times or phone numbers change.

### Giving

The giving page publishes the official tithes and offerings channels supplied by the church:

- **Indo Zambia Bank (IZB):** account number `0281110000013`
- **Airtel Money:** Mercy Ngalande, `+260 974 807 770`
- **MTN Mobile Money:** Mercy Ngalande, `+260 964 715 187`
- **Zelle:** `sundaysgap@yahoo.com`

The payment section uses local high-resolution brand assets: the official IZB logo, the official Airtel wordmark, the MTN logo on the brand yellow oval, and the official Zelle mark. Update these assets and numbers if the church changes banks or account holders.

### Contact form

The form is intentionally front-end only. On submit, it opens WhatsApp with the visitor’s message addressed to **+260 974 807 770**. There is no database and no server-side email.

### Map

The map is a locally stored OpenStreetMap-derived image centred on the Garden House/Lusaka area, with a link to Google Maps for exact directions. It is decorative rather than a live GPS pin. Replace `assets/img/map-lusaka.jpg` if you have a more precise map image.

## Photo credits

All photographs are from the church's public Facebook page and official YouTube channel, plus official service posters. They were cropped, resized, and compressed for web use. The Shalom Worship, Battle Axe Youth, Big Sunday, men's fellowship, youth, and deliverance images were refreshed with stronger official service photography from public videos `DUA5y_Zk2Ho`, `v-WObP47Um8`, `e0BOfXlqgVs`, and `W2lcZ14Dy1I`. The homepage welcome collage now uses the church-supplied Apostle Sunday and Pastor Bupe portrait instead of a repeated congregation photo. See `MEDIA FILES/SOURCES.txt` for the source list. The originals are kept in `MEDIA FILES/originals/` for future use.

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
