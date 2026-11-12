# -*- coding: utf-8 -*-
"""Build the 2026 feature upgrade for the Shalom Embassy static site.

Creates impact.html, stories.html and gallery.html, then upgrades the shared
navigation, footer, SVG sprite, cache versions, homepage modules, the contact
"Follow us" section, and the gatherings invitation-card generator.

The script is intentionally idempotent: existing markers stop duplicate
insertions, and the shared navigation/footer blocks are replaced wholesale.
"""

from __future__ import annotations

import glob
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
os.chdir(ROOT)

VERSION = "embassy2"
SITE = "https://nduwamakinka.github.io/shalom-embassy"

EXISTING = [
    "index.html",
    "about.html",
    "sermons.html",
    "gatherings.html",
    "give.html",
    "contact.html",
]

NAV_ITEMS = [
    ("index.html", "Home"),
    ("about.html", "About"),
    ("sermons.html", "Sermons"),
    ("gatherings.html", "Gatherings"),
    ("impact.html", "Impact"),
    ("stories.html", "Stories"),
    ("give.html", "Give"),
    ("contact.html", "Contact"),
]

FOOTER_EXPLORE = """      <h3>Explore</h3>
      <ul>
        <li><a href="index.html">Home</a></li>
        <li><a href="about.html">Our story</a></li>
        <li><a href="sermons.html">Sermons</a></li>
        <li><a href="sermons.html#books">Library</a></li>
        <li><a href="gatherings.html">Gatherings</a></li>
        <li><a href="impact.html">Impact</a></li>
        <li><a href="stories.html">Stories</a></li>
        <li><a href="gallery.html">Gallery</a></li>
        <li><a href="give.html">Give</a></li>
        <li><a href="contact.html">Contact</a></li>
        <li><a href="contact.html#visit">Plan a visit</a></li>
      </ul>"""

NEW_SYMBOLS = (
    '<symbol id="i-tiktok" viewBox="0 0 24 24"><path d="M16.5 3c.4 2.2 1.7 3.7 4 4v3a7 7 0 0 1-4-1.3v6.6a6.2 6.2 0 1 1-6.2-6.2c.4 0 .8 0 1.2.1v3.1a3.2 3.2 0 1 0 2.2 3V3h2.8Z" fill="currentColor" stroke="none"/></symbol>'
    '<symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></symbol>'
    '<symbol id="i-download" viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M4 19h16"/></symbol>'
    '<symbol id="i-share" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4"/></symbol>'
    '<symbol id="i-copy" viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></symbol>'
    '<symbol id="i-link" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.2"/><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.2-1.2"/></symbol>'
)

ICON = lambda name, cls="icon": (
    f'<svg class="{cls}" aria-hidden="true" focusable="false"><use href="#{name}"></use></svg>'
)


def read(name: str) -> str:
    return Path(name).read_text(encoding="utf-8")


def write(name: str, text: str) -> None:
    Path(name).write_text(text, encoding="utf-8", newline="\n")


# ---------------------------------------------------------------------------
# Image helpers
# ---------------------------------------------------------------------------

def available_widths(name: str):
    widths = set()
    for ext in ("avif", "webp"):
        for path in glob.glob(f"assets/img/opt/{name}-*.{ext}"):
            base = os.path.basename(path)
            match = re.match(re.escape(name) + r"-(\d+)\.(?:avif|webp)$", base)
            if match:
                widths.add(int(match.group(1)))
    return sorted(widths)


def srcset(name: str, ext: str) -> str:
    return ", ".join(
        f"assets/img/opt/{name}-{width}.{ext} {width}w"
        for width in available_widths(name)
    )


def picture(name, alt, sizes, width, height, *, eager=False, base=None, cls=""):
    """Responsive picture element built from the optimized image set."""
    base = base or name
    class_attr = f' class="{cls}"' if cls else ""
    loading = "eager" if eager else "lazy"
    fetch = ' fetchpriority="high"' if eager else ""
    return (
        f'<picture class="{cls}">' if cls else "<picture>"
    ) + (
        f'<source type="image/avif" srcset="{srcset(name, "avif")}" sizes="{sizes}">'
        f'<source type="image/webp" srcset="{srcset(name, "webp")}" sizes="{sizes}">'
        f'<img src="assets/img/{base}.webp?v=hd" alt="{alt}" width="{width}" height="{height}" '
        f'loading="{loading}" decoding="async"{fetch}>'
        "</picture>"
    )


# ---------------------------------------------------------------------------
# Shared shell pieces
# ---------------------------------------------------------------------------

def nav_html(current: str) -> str:
    links = []
    for href, label in NAV_ITEMS:
        aria = ' aria-current="page"' if href == current else ""
        links.append(f'<li><a class="nav__link" href="{href}"{aria}>{label}</a></li>')
    return '<ul class="nav__list">\n        ' + "".join(links) + "\n      </ul>"


def head_html(title, description, slug, body_class, preload_name, preload_sizes, og_image, og_alt):
    url = f"{SITE}/{slug}"
    image = f"{SITE}/{og_image}"
    return f"""<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <meta name="description" content="{description}">
  <meta name="theme-color" content="#071a36">
  <meta name="author" content="Shalom Embassy Ministries International">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Shalom Embassy Ministries International">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{description}">
  <meta property="og:url" content="{url}">
  <meta property="og:image" content="{image}">
  <meta property="og:image:alt" content="{og_alt}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{title}">
  <meta name="twitter:description" content="{description}">
  <meta name="twitter:image" content="{image}">
  <link rel="canonical" href="{url}">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="assets/img/logo-official-128.png" sizes="128x128" type="image/png">
  <link rel="apple-touch-icon" href="assets/img/logo-official-128.png">
  <link rel="preload" href="assets/fonts/fraunces-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="assets/fonts/manrope-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" as="image" type="image/avif" href="assets/img/opt/{preload_name}-{(960 if 960 in available_widths(preload_name) else (available_widths(preload_name)[-1] if available_widths(preload_name) else 960))}.avif" imagesrcset="{srcset(preload_name, "avif")}" imagesizes="{preload_sizes}" fetchpriority="high">
  <link rel="preload" as="script" href="assets/js/main.js?v={VERSION}">
  <link rel="stylesheet" href="assets/css/styles.min.css?v={VERSION}">
  <script>document.documentElement.classList.add('js');</script>

</head>"""


def build_page(template, *, slug, title, description, body_class, main, preload_name,
               preload_sizes, og_image, og_alt):
    page = re.sub(r"<head>.*?</head>", head_html(title, description, slug, body_class,
                                                preload_name, preload_sizes, og_image, og_alt),
                  template, count=1, flags=re.S)
    page = re.sub(r'<body class="[^"]*">', f'<body class="{body_class}">', page, count=1)
    page = re.sub(r'<main id="main">.*?</main>', '<main id="main">\n' + main.strip() + "\n</main>",
                  page, count=1, flags=re.S)
    write(slug, page)
    print("built", slug)


# ---------------------------------------------------------------------------
# 1. Patch the existing pages
# ---------------------------------------------------------------------------

def patch_existing():
    for name in EXISTING:
        text = read(name)
        current = name

        # New sprite symbols, inserted before the closing sprite SVG.
        if 'id="i-tiktok"' not in text:
            anchor = text.index('<a class="skip-link"')
            close = text.rindex("</svg>", 0, anchor)
            text = text[:close] + NEW_SYMBOLS + text[close:]

        # Shared navigation.
        text = re.sub(r'<ul class="nav__list">.*?</ul>', nav_html(current), text,
                      count=1, flags=re.S)

        # Footer explore column.
        text = re.sub(r'<h3>Explore</h3>\s*<ul>.*?</ul>', FOOTER_EXPLORE, text,
                      count=1, flags=re.S)

        # Single new cache version across every asset reference.
        text = text.replace("?v=library1", f"?v={VERSION}")
        text = text.replace("?v=fast4", f"?v={VERSION}")

        write(name, text)
        print("patched", name)


# ---------------------------------------------------------------------------
# 2. Reusable story data
# ---------------------------------------------------------------------------

STORIES = [
    dict(
        slug="six-points",
        image="story-six-points",
        video="ZqD414u0My8",
        title="Testimony time: “I got 6 points”",
        tag="Breakthrough",
        category="breakthrough",
        search="six points results breakthrough testimony time",
        description="A member of the Shalom Embassy family gives God the glory in this official testimony shared on the church’s YouTube channel.",
    ),
    dict(
        slug="glory",
        image="story-glory",
        video="ZKItIU2GcIc",
        title="Glory be to God",
        tag="Breakthrough",
        category="breakthrough",
        search="glory be to god testimony praise breakthrough",
        description="A testimony of God’s faithfulness and glory, shared with the house at Shalom Embassy.",
    ),
    dict(
        slug="persistence",
        image="story-persistence",
        video="aI0PCeclZBQ",
        title="A testimony of faith, persistence & divine intervention",
        tag="Faith",
        category="faith",
        search="faith persistence divine intervention prayer",
        description="A story of persistent faith and God’s intervention, recorded at Shalom Embassy Ministries International.",
    ),
    dict(
        slug="turnaround",
        image="story-turnaround",
        video="sBN8a5VYhXY",
        title="Testimony of divine turnaround",
        tag="Breakthrough",
        category="breakthrough",
        search="divine turnaround breakthrough change testimony",
        description="A member testifies of a sudden turnaround in circumstances, giving all the glory to God.",
    ),
    dict(
        slug="preserved",
        image="story-preserved",
        video="JEaLV22kwL4",
        title="“When death tried to take her, God preserved her.”",
        tag="Healing",
        category="healing",
        search="death preserved healing protection family",
        description="A powerful account of God’s preserving power when death came near.",
    ),
    dict(
        slug="safe-delivery",
        image="story-safe-delivery",
        video="rhaNffYa0xI",
        title="Miraculous safe delivery: Mrs. Clara Chibwe’s anointing oil experience",
        tag="Family",
        category="family",
        search="safe delivery clara chibwe anointing oil pregnancy family",
        description="A family’s testimony of a safe delivery after prayer with the anointing oil.",
    ),
    dict(
        slug="epilepsy",
        image="story-epilepsy",
        video="s_YkzCm5IsE",
        title="Healed… after 7 years of epilepsy",
        tag="Healing",
        category="healing",
        search="healed epilepsy seven years healing deliverance",
        description="A testimony of healing after seven years of epilepsy, shared with the Shalom Embassy family.",
    ),
    dict(
        slug="footballer",
        image="story-footballer",
        video="8hrpt7wv9lE",
        title="Former footballer healed from career-ending injury",
        tag="Healing",
        category="healing",
        search="footballer football injury healing career restored",
        description="A former footballer shares how God restored him after a career-ending injury.",
    ),
    dict(
        slug="holy-ghost",
        image="story-holy-ghost",
        video="HvxDnmC83WY",
        title="Prayer book leads to a child’s Holy Ghost baptism",
        tag="Faith",
        category="faith",
        search="prayer book child holy ghost baptism family faith",
        description="A testimony of how a Shalom Embassy prayer book opened the way for a child to receive the Holy Ghost.",
    ),
]

CATEGORIES = [
    ("all", "All"),
    ("healing", "Healing"),
    ("breakthrough", "Breakthrough"),
    ("family", "Family"),
    ("faith", "Faith"),
]


def share_buttons(video, title):
    url = f"https://www.youtube.com/watch?v={video}"
    return f"""<div class="share-row">
              <button class="share-btn" type="button" data-share="whatsapp" data-share-url="{url}" data-share-title="{title}" aria-label="Share on WhatsApp">{ICON("i-whatsapp")}</button>
              <button class="share-btn" type="button" data-share="facebook" data-share-url="{url}" data-share-title="{title}" aria-label="Share on Facebook">{ICON("i-facebook")}</button>
              <button class="share-btn" type="button" data-share="x" data-share-url="{url}" data-share-title="{title}" aria-label="Share on X">{ICON("i-x")}</button>
              <button class="share-btn" type="button" data-share="copy" data-share-url="{url}" data-share-title="{title}" aria-label="Copy video link">{ICON("i-copy")}</button>
            </div>"""


def story_card(story, delay=None):
    video = f"https://www.youtube.com/watch?v={story['video']}"
    style = f' style="--reveal-delay:{delay}"' if delay else ""
    return f"""<article class="story-card reveal"{style} data-card data-category="{story['category']}" data-search="{story['search']}">
          <a class="story-card__media" href="{video}" target="_blank" rel="noopener noreferrer" aria-label="Watch {story['title']} on YouTube">
            {picture(story['image'], story['title'], "(max-width: 760px) 100vw, (max-width: 1200px) 50vw, 380px", 1280, 720)}
            <span class="story-card__play">{ICON("i-play")}</span>
            <span class="story-card__duration">Official video</span>
          </a>
          <div class="story-card__body">
            <span class="story-card__tag">{story['tag']}</span>
            <h3><a href="{video}" target="_blank" rel="noopener noreferrer">{story['title']}</a></h3>
            <p>{story['description']}</p>
            <div class="story-card__foot">
              <a class="story-card__link" href="{video}" target="_blank" rel="noopener noreferrer">Watch testimony {ICON("i-arrow")}</a>
              {share_buttons(story['video'], story['title'])}
            </div>
          </div>
        </article>"""


# ---------------------------------------------------------------------------
# 3. impact.html
# ---------------------------------------------------------------------------

IMPACT_MAIN = f"""
<section class="page-hero impact-hero">
  <div class="page-hero__media">
    {picture("hero-sanctuary-1920", "The Shalom Embassy congregation gathered in worship", "100vw", 1920, 1080, eager=True, base="hero-sanctuary")}
  </div>
  <div class="page-hero__overlay" aria-hidden="true"></div>
  <div class="container page-hero__inner">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="index.html">Home</a><span aria-hidden="true">/</span><span aria-current="page">Impact</span>
    </nav>
    <p class="eyebrow eyebrow--light">17 years · 2009—2026</p>
    <h1>Seventeen years of<br><em>nothing missing, nothing broken.</em></h1>
    <p class="page-hero__lead">Since 9 March 2009, Shalom Embassy Ministries International has carried one commission: to preach the full Gospel, heal the brokenhearted, and see every life restored to wholeness in Christ.</p>
    <div class="impact-hero__chips" aria-label="Ministry milestones">
      <span>Founded 9 March 2009</span>
      <span>21+ branches</span>
      <span>1,500+ messages</span>
      <span>294K+ online family</span>
    </div>
  </div>
</section>

<section class="section">
  <div class="container impact-intro">
    <div class="impact-intro__year reveal" aria-hidden="true">17<small>Years of grace<br>2009 — 2026</small></div>
    <div class="impact-intro__copy reveal" style="--reveal-delay:.1s">
      <p class="eyebrow">The anniversary</p>
      <h2>God has been faithful in every season.</h2>
      <p>What began in Lusaka’s Kanyama area has grown into a family of believers gathered around the Word, prayer, healing, and deliverance. In March 2026, the Shalom Embassy family marked <strong>17 years</strong> of God’s faithfulness at the Main Auditorium in Garden House.</p>
      <p>This anniversary is not a celebration of a building or a name. It is a testimony of what God has done in ordinary people who trusted Him — the sick made whole, the bound set free, families restored, and a new generation raised in the fear of the Lord.</p>
      <div class="impact-intro__facts">
        <div class="impact-fact">{ICON("i-calendar")} Founded 9 March 2009 in Kanyama, Lusaka</div>
        <div class="impact-fact">{ICON("i-pin")} Headquarters at Plot 995, Garden House</div>
        <div class="impact-fact">{ICON("i-users")} 21+ branches across Zambia</div>
        <div class="impact-fact">{ICON("i-star")} 17th anniversary celebrated March 2026</div>
      </div>
      <a class="btn btn--navy" href="about.html" style="margin-top:26px">Read our full story {ICON("i-arrow")}</a>
    </div>
  </div>
</section>

<section class="section section--cream">
  <div class="container">
    <div class="section-head section-head--center reveal">
      <p class="eyebrow">By the numbers</p>
      <h2>A movement measured in lives.</h2>
      <p>Verified milestones from the life and labour of Shalom Embassy Ministries International.</p>
    </div>
    <div class="impact-scoreboard reveal">
      <div class="impact-metric">
        <span class="impact-metric__icon">{ICON("i-calendar")}</span>
        <strong>17</strong>
        <span>Years of ministry</span>
        <p>From 9 March 2009 to the 17th anniversary in March 2026.</p>
      </div>
      <div class="impact-metric">
        <span class="impact-metric__icon">{ICON("i-pin")}</span>
        <strong>21+</strong>
        <span>Branches in Zambia</span>
        <p>Churches planted across Lusaka, rural villages, and other parts of Zambia.</p>
      </div>
      <div class="impact-metric">
        <span class="impact-metric__icon">{ICON("i-book")}</span>
        <strong>1,500+</strong>
        <span>Messages shared</span>
        <p>Teaching, preaching, and prayer encounters shared with the body of Christ.</p>
      </div>
      <div class="impact-metric">
        <span class="impact-metric__icon">{ICON("i-globe")}</span>
        <strong>294K+</strong>
        <span>Online family</span>
        <p>Believers connected through the ministry’s digital channels and broadcasts.</p>
      </div>
      <div class="impact-metric">
        <span class="impact-metric__icon">{ICON("i-heart")}</span>
        <strong>6</strong>
        <span>Ministry expressions</span>
        <p>Prayer, deliverance, women, youth, men, worship, media, and children.</p>
      </div>
      <div class="impact-metric">
        <span class="impact-metric__icon">{ICON("i-flame")}</span>
        <strong>1</strong>
        <span>Unchanging mandate</span>
        <p>Nothing missing. Nothing broken. The peace of God for every life.</p>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head section-head--row reveal">
      <div>
        <p class="eyebrow">What the years have built</p>
        <h2>Impact you can see in people.</h2>
        <p>Six expressions of one commission, each serving the wholeness of the believer and the reach of the Gospel.</p>
      </div>
      <a class="link-arrow section-head__link" href="about.html#ministries">Explore our ministries</a>
    </div>
    <div class="impact-grid">
      <article class="impact-card reveal">
        <div class="impact-card__top"><span class="impact-card__icon">{ICON("i-flame")}</span><span class="impact-card__num">01</span></div>
        <h3>Prayer that stands in the gap</h3>
        <p>Morning Glory, Midnight Watch, dry fasts, and overnight vigils keep the house on the altar and contend for families, leaders, and the nation.</p>
      </article>
      <article class="impact-card reveal" style="--reveal-delay:.08s">
        <div class="impact-card__top"><span class="impact-card__icon">{ICON("i-heart")}</span><span class="impact-card__num">02</span></div>
        <h3>Healing &amp; deliverance</h3>
        <p>Weekly healing and deliverance services and monthly 7-hour encounters minister the power of Christ to spirit, soul, and body.</p>
      </article>
      <article class="impact-card reveal" style="--reveal-delay:.16s">
        <div class="impact-card__top"><span class="impact-card__icon">{ICON("i-pin")}</span><span class="impact-card__num">03</span></div>
        <h3>Branch expansion</h3>
        <p>Over 21 branches across Lusaka, rural villages, and other parts of Zambia carry the same mandate to communities beyond the headquarters.</p>
      </article>
      <article class="impact-card reveal">
        <div class="impact-card__top"><span class="impact-card__icon">{ICON("i-users")}</span><span class="impact-card__num">04</span></div>
        <h3>Virtuous Women</h3>
        <p>Pastor Bupe Sinyangwe leads a women’s ministry raising watchmen, strengthening families, and reaching vulnerable women and girls in villages.</p>
      </article>
      <article class="impact-card reveal" style="--reveal-delay:.08s">
        <div class="impact-card__top"><span class="impact-card__icon">{ICON("i-star")}</span><span class="impact-card__num">05</span></div>
        <h3>Battle Axe Youth</h3>
        <p>Young men and women are equipped in identity, purity, and calling through youth services, conferences, and worship encounters.</p>
      </article>
      <article class="impact-card reveal" style="--reveal-delay:.16s">
        <div class="impact-card__top"><span class="impact-card__icon">{ICON("i-book")}</span><span class="impact-card__num">06</span></div>
        <h3>Media &amp; publishing</h3>
        <p>Sermons, prayer books, devotionals, and online broadcasts carry the Word beyond the auditorium to a growing global family.</p>
      </article>
    </div>
  </div>
</section>

<section class="section section--cream">
  <div class="container">
    <div class="impact-banner reveal">
      <div class="impact-banner__media">
        {picture("anniversary-day2", "The Shalom Embassy family celebrating the 17th anniversary", "(max-width: 1024px) 100vw, 56vw", 1280, 720)}
      </div>
      <div class="impact-banner__body">
        <p class="eyebrow eyebrow--light">The 17th anniversary</p>
        <h2>One family. One altar. One mandate.</h2>
        <p>In March 2026, the Shalom Embassy family gathered at Garden House to thank God for 17 years of grace, growth, healing, and deliverance, with guest minister Bishop Dr. Edgar Ng’ambi.</p>
        <ul class="impact-banner__list">
          <li>{ICON("i-check")} 17 years of prayer, teaching, and intercession</li>
          <li>{ICON("i-check")} A family of 21+ branches across Zambia</li>
          <li>{ICON("i-check")} A growing global online family</li>
          <li>{ICON("i-check")} One unchanging promise: nothing missing, nothing broken</li>
        </ul>
        <div class="impact-banner__actions">
          <a class="btn" href="gatherings.html">Join a gathering {ICON("i-arrow")}</a>
          <a class="btn btn--ghost-light" href="stories.html">Read the testimonies</a>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="cta-band">
  <div class="container cta-band__inner">
    <div>
      <p class="eyebrow eyebrow--light">Be part of the next chapter</p>
      <h2>Your story can begin here.</h2>
      <p>Come and worship with us this Sunday, or reach out and let us pray with you.</p>
    </div>
    <div class="cta-band__actions">
      <a class="btn" href="contact.html#visit">Plan your visit {ICON("i-arrow")}</a>
      <a class="btn btn--ghost-light" href="stories.html">See what God has done</a>
    </div>
  </div>
</section>
"""


# ---------------------------------------------------------------------------
# 4. stories.html
# ---------------------------------------------------------------------------

FEATURE = STORIES[4]

STORY_CARDS = "\n".join(
    story_card(story, f"{index * 0.06:.2f}s" if index else None)
    for index, story in enumerate(STORIES)
)

CHIPS = "\n".join(
    f'<button class="card-chip{" is-active" if key == "all" else ""}" type="button" data-card-chip="{key}" aria-pressed="{"true" if key == "all" else "false"}">{label}</button>'
    for key, label in CATEGORIES
)

STORIES_MAIN = f"""
<section class="page-hero">
  <div class="page-hero__media">
    {picture("worship-crowd", "The Shalom Embassy family in worship", "100vw", 1038, 592, eager=True)}
  </div>
  <div class="page-hero__overlay" aria-hidden="true"></div>
  <div class="container page-hero__inner">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="index.html">Home</a><span aria-hidden="true">/</span><span aria-current="page">Stories</span>
    </nav>
    <p class="eyebrow eyebrow--light">Stories &amp; testimonies</p>
    <h1>What God has done,<br><em>we cannot keep to ourselves.</em></h1>
    <p class="page-hero__lead">Real testimonies from the Shalom Embassy family — healing, deliverance, breakthrough, and the faithful hand of God in everyday life.</p>
  </div>
</section>

<section class="section">
  <div class="container">
    <article class="story-feature reveal">
      <div class="story-feature__media">
        {picture("story-preserved", "A testimony of God’s preserving power", "(max-width: 1024px) 100vw, 54vw", 1280, 720)}
        <a class="story-feature__play" href="https://www.youtube.com/watch?v={FEATURE['video']}" target="_blank" rel="noopener noreferrer" aria-label="Watch the featured testimony on YouTube">{ICON("i-play")}</a>
        <span class="story-feature__badge">Featured testimony</span>
      </div>
      <div class="story-feature__body">
        <p class="eyebrow eyebrow--light">Healing &amp; preservation</p>
        <h2>“When death tried to take her, God preserved her.”</h2>
        <p>In this official Shalom Embassy testimony, a family recounts how God preserved a life when death came near. Watch the full story and give glory to God for His keeping power.</p>
        <div class="story-feature__meta">
          <span>Official Shalom Embassy video</span><span class="dot"></span><span>YouTube</span>
        </div>
        <div class="story-feature__actions">
          <a class="btn" href="https://www.youtube.com/watch?v={FEATURE['video']}" target="_blank" rel="noopener noreferrer">Watch the testimony {ICON("i-arrow")}</a>
          <a class="btn btn--ghost-light" href="#share">Share your story</a>
        </div>
        {share_buttons(FEATURE['video'], FEATURE['title'])}
      </div>
    </article>
  </div>
</section>

<section class="section section--cream">
  <div class="container" data-card-filter data-noun="testimony" data-noun-plural="testimonies">
    <div class="section-head section-head--center reveal">
      <p class="eyebrow">The testimony wall</p>
      <h2>Stories from the house.</h2>
      <p>Search the archive or choose a category. Every video opens on the official Shalom Embassy YouTube channel.</p>
    </div>

    <div class="card-tools reveal">
      <label class="card-search">
        {ICON("i-search")}
        <input type="search" data-card-search placeholder="Search by name, need, or keyword" aria-label="Search testimonies">
      </label>
      <div class="card-chips" role="group" aria-label="Filter testimonies">
        {CHIPS}
      </div>
      <span class="card-count" data-card-count>{len(STORIES)} testimonies</span>
    </div>

    <div class="story-grid">
      {STORY_CARDS}
    </div>
    <div class="story-empty" data-card-empty hidden>
      <strong>No testimonies match that search.</strong>
      Try another word or choose “All”.
    </div>
  </div>
</section>

<section class="section" id="share">
  <div class="container">
    <div class="testimony-cta reveal">
      <div class="testimony-cta__intro">
        <p class="eyebrow eyebrow--light">Your story matters</p>
        <h2>Has God done something in your life?</h2>
        <p>Your testimony can strengthen someone who is waiting for their own breakthrough. Share it with our team and, with your permission, with the church family.</p>
        <blockquote class="testimony-cta__verse">“Let the redeemed of the LORD say so, whom he hath redeemed from the hand of the enemy.” — Psalm 107:2</blockquote>
      </div>
      <form class="testimony-form" data-testimony-form data-wa-number="260974807770" action="https://wa.me/260974807770" method="get">
        <h3>Share your testimony</h3>
        <p>This form opens WhatsApp with your message ready to send to the church office.</p>
        <div class="form-field">
          <label for="testimony-name">Your name</label>
          <input id="testimony-name" name="name" type="text" autocomplete="name" placeholder="e.g. Chanda Mwale" required>
        </div>
        <div class="form-field">
          <label for="testimony-category">What is your testimony about?</label>
          <select id="testimony-category" name="category">
            <option value="Healing">Healing</option>
            <option value="Deliverance">Deliverance</option>
            <option value="Breakthrough">Breakthrough</option>
            <option value="Family">Family</option>
            <option value="Faith">Faith</option>
            <option value="Testimony">Other testimony</option>
          </select>
        </div>
        <div class="form-field">
          <label for="testimony-message">Your testimony</label>
          <textarea id="testimony-message" name="testimony" placeholder="Tell us what God has done..." required></textarea>
        </div>
        <div class="form-status" data-form-status hidden role="status"></div>
        <button class="btn btn--navy btn--block" type="submit">Send via WhatsApp {ICON("i-send")}</button>
      </form>
    </div>
  </div>
</section>

<section class="cta-band">
  <div class="container cta-band__inner">
    <div>
      <p class="eyebrow eyebrow--light">Come and see</p>
      <h2>There is more where that came from.</h2>
      <p>Join us for a service and bring your expectation. God is still at work in His people.</p>
    </div>
    <div class="cta-band__actions">
      <a class="btn" href="gatherings.html">See our gatherings {ICON("i-arrow")}</a>
      <a class="btn btn--ghost-light" href="contact.html#visit">Plan your visit</a>
    </div>
  </div>
</section>
"""


# ---------------------------------------------------------------------------
# 5. gallery.html
# ---------------------------------------------------------------------------

GALLERY = [
    ("congregation", "The Shalom Embassy congregation in worship", "worship", "congregation worship church family audience"),
    ("worship-deep", "A moment of deep worship at Shalom Embassy", "worship", "worship deep praise altar"),
    ("worship-singer", "A worship leader ministering in song", "worship", "worship singer music praise leader"),
    ("worship-crowd", "The family standing together in worship", "worship", "worship crowd congregation standing"),
    ("prayer-standing-gap", "Prayer and intercession at Shalom Embassy", "prayer", "prayer intercession standing gap altar"),
    ("deliverance-service", "Congregants receiving prayer and ministry", "prayer", "prayer deliverance ministry healing"),
    ("altar-honour", "Honouring God at the altar", "prayer", "altar honour prayer worship"),
    ("revival-fire", "A revival encounter at Shalom Embassy", "prayer", "revival fire prayer encounter"),
    ("pastor-preaching", "Apostle Sunday Sinyangwe ministering the Word", "ministry", "preaching word apostle sunday sinyangwe"),
    ("preaching-stage", "The Word preached from the main auditorium", "ministry", "preaching stage word ministry"),
    ("men-fellowship", "Men gathered in the Word and fellowship", "ministry", "men fellowship ministry brotherhood"),
    ("youth-worship", "The next generation in worship", "youth", "youth worship next generation young people"),
    ("youth-battle-axe", "Battle Axe Youth Ministry gathering", "youth", "youth battle axe conference young"),
    ("big-sunday", "A Big Sunday gathering at Shalom Embassy", "gatherings", "big sunday gathering service"),
    ("event-anniversary", "An anniversary celebration at Shalom Embassy", "anniversary", "anniversary celebration event"),
    ("anniversary-day2", "The 17th anniversary celebration", "anniversary", "anniversary 17 years celebration"),
    ("power-supply", "A gathering of the Shalom Embassy family", "gatherings", "gathering congregation service"),
]

GALLERY_LABELS = {
    "congregation": ("Worship", 1400, 900),
    "worship-deep": ("Worship", 1280, 720),
    "worship-singer": ("Worship", 1200, 800),
    "worship-crowd": ("Worship", 1038, 592),
    "prayer-standing-gap": ("Prayer", 800, 900),
    "deliverance-service": ("Prayer", 1280, 720),
    "altar-honour": ("Prayer", 1280, 720),
    "revival-fire": ("Prayer", 1280, 720),
    "pastor-preaching": ("Ministry", 1400, 900),
    "preaching-stage": ("Ministry", 1280, 720),
    "men-fellowship": ("Ministry", 1280, 720),
    "youth-worship": ("Youth", 900, 1000),
    "youth-battle-axe": ("Youth", 1280, 720),
    "big-sunday": ("Gatherings", 1200, 900),
    "event-anniversary": ("Anniversary", 1280, 720),
    "anniversary-day2": ("Anniversary", 1280, 720),
    "power-supply": ("Gatherings", 1280, 720),
}


def gallery_tile(item):
    name, alt, category, search = item
    label, width, height = GALLERY_LABELS[name]
    return f"""<button class="photo-tile reveal" type="button" data-card data-category="{category}" data-search="{search}" data-lightbox="assets/img/{name}.webp?v=hd" data-caption="{alt}">
          {picture(name, alt, "(max-width: 480px) 100vw, (max-width: 1024px) 50vw, 33vw", width, height)}
          <span class="photo-tile__tag">{label}</span>
          <span class="photo-tile__zoom">{ICON("i-expand")}</span>
          <span class="photo-tile__caption">{alt}</span>
        </button>"""


GALLERY_CATEGORIES = [
    ("all", "All"),
    ("worship", "Worship"),
    ("prayer", "Prayer"),
    ("ministry", "Ministry"),
    ("youth", "Youth"),
    ("gatherings", "Gatherings"),
    ("anniversary", "Anniversary"),
]

GALLERY_CHIPS = "\n".join(
    f'<button class="card-chip{" is-active" if key == "all" else ""}" type="button" data-card-chip="{key}" aria-pressed="{"true" if key == "all" else "false"}">{label}</button>'
    for key, label in GALLERY_CATEGORIES
)

GALLERY_TILES = "\n".join(gallery_tile(item) for item in GALLERY)

GALLERY_MAIN = f"""
<section class="page-hero">
  <div class="page-hero__media">
    {picture("congregation", "The Shalom Embassy congregation gathered in the main auditorium", "100vw", 1400, 900, eager=True)}
  </div>
  <div class="page-hero__overlay" aria-hidden="true"></div>
  <div class="container page-hero__inner">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="index.html">Home</a><span aria-hidden="true">/</span><span aria-current="page">Gallery</span>
    </nav>
    <p class="eyebrow eyebrow--light">Life at Shalom</p>
    <h1>Moments of grace,<br><em>frames of faith.</em></h1>
    <p class="page-hero__lead">Worship, prayer, celebration, and the everyday life of the Shalom Embassy family in Lusaka.</p>
  </div>
</section>

<section class="section">
  <div class="container" data-card-filter data-noun="photo" data-noun-plural="photos">
    <div class="section-head section-head--center reveal">
      <p class="eyebrow">Photo gallery</p>
      <h2>Look at what God is doing.</h2>
      <p>Browse the moments, open any photo for a closer look, and share the joy of the house.</p>
    </div>

    <div class="gallery-page__tools card-tools reveal">
      <label class="card-search">
        {ICON("i-search")}
        <input type="search" data-card-search placeholder="Search photos by moment or ministry" aria-label="Search photos">
      </label>
      <div class="card-chips" role="group" aria-label="Filter photos">
        {GALLERY_CHIPS}
      </div>
      <span class="card-count" data-card-count>{len(GALLERY)} photos</span>
    </div>

    <div class="photo-grid">
      {GALLERY_TILES}
    </div>
    <div class="gallery-empty" data-card-empty hidden>
      <strong>No photos match that search.</strong>
      Try another word or choose “All”.
    </div>

    <div class="gallery-note reveal">
      <p>New frames are added as the church shares them. For the latest moments, follow the official Shalom Embassy channels.</p>
      <a href="https://www.youtube.com/@shalomembassyministries" target="_blank" rel="noopener noreferrer">Visit the Shalom Embassy channel {ICON("i-arrow")}</a>
    </div>
  </div>
</section>

<section class="cta-band">
  <div class="container cta-band__inner">
    <div>
      <p class="eyebrow eyebrow--light">Be in the frame</p>
      <h2>Your moment is waiting.</h2>
      <p>Join us at the Main Auditorium in Garden House, Lusaka, and become part of the story.</p>
    </div>
    <div class="cta-band__actions">
      <a class="btn" href="contact.html#visit">Plan your visit {ICON("i-arrow")}</a>
      <a class="btn btn--ghost-light" href="gatherings.html">See our gatherings</a>
    </div>
  </div>
</section>
"""


# ---------------------------------------------------------------------------
# 6. Contact Follow-us module
# ---------------------------------------------------------------------------

FOLLOW_HTML = f"""
<!-- FOLLOW-US -->
<section class="section follow" aria-labelledby="follow-title">
  <div class="container">
    <div class="follow__head reveal">
      <div>
        <p class="eyebrow eyebrow--light">Follow us</p>
        <h2 id="follow-title">Walk with us every day.</h2>
        <p>The Word, the prayer altar, and the life of the house are closer than ever. Follow the official channels and stay connected to the family.</p>
      </div>
      <a class="link-arrow follow__head-link" href="https://www.youtube.com/@shalomembassyministries" target="_blank" rel="noopener noreferrer">Visit our channel {ICON("i-arrow")}</a>
    </div>

    <div class="follow__grid">
      <article class="follow-card reveal">
        <div class="follow-card__art">
          {picture("pastor-preaching", "", "(max-width: 760px) 100vw, 33vw", 1400, 900)}
        </div>
        <span class="follow-card__dots" aria-hidden="true"></span>
        <div class="follow-card__body">
          <span class="follow-card__kicker">YouTube</span>
          <h3 class="follow-card__title">Watch the Word.</h3>
          <span class="follow-card__handle">@apostlesundaysinyangwe</span>
          <div class="follow-card__socials">
            <a href="https://www.youtube.com/@apostlesundaysinyangwe" target="_blank" rel="noopener noreferrer" aria-label="Apostle Sunday Sinyangwe on YouTube">{ICON("i-youtube")}</a>
            <a href="https://www.youtube.com/@shalomembassyministries" target="_blank" rel="noopener noreferrer" aria-label="Shalom Embassy Ministries on YouTube">{ICON("i-youtube")}</a>
            <a href="https://www.youtube.com/@Pastor.BupeSinyangwe" target="_blank" rel="noopener noreferrer" aria-label="Pastor Bupe Sinyangwe on YouTube">{ICON("i-youtube")}</a>
          </div>
        </div>
      </article>

      <article class="follow-card reveal" style="--reveal-delay:.08s">
        <div class="follow-card__art">
          {picture("worship-singer", "", "(max-width: 760px) 100vw, 33vw", 1200, 800)}
        </div>
        <span class="follow-card__dots" aria-hidden="true"></span>
        <div class="follow-card__body">
          <span class="follow-card__kicker">Social family</span>
          <h3 class="follow-card__title">Stay connected.</h3>
          <span class="follow-card__handle">@apostlesundaysinyangwe</span>
          <div class="follow-card__socials">
            <a href="https://www.facebook.com/ApostleSundaySinyangwe/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">{ICON("i-facebook")}</a>
            <a href="https://www.instagram.com/apostlesundaysinyangwe/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">{ICON("i-instagram")}</a>
            <a href="https://x.com/ApostleSundayS" target="_blank" rel="noopener noreferrer" aria-label="X">{ICON("i-x")}</a>
            <a href="https://www.tiktok.com/@pastorbupesinyangwe" target="_blank" rel="noopener noreferrer" aria-label="Pastor Bupe Sinyangwe on TikTok">{ICON("i-tiktok")}</a>
          </div>
        </div>
      </article>

      <article class="follow-card reveal" style="--reveal-delay:.16s">
        <div class="follow-card__art">
          {picture("prayer-standing-gap", "", "(max-width: 760px) 100vw, 33vw", 800, 900)}
        </div>
        <span class="follow-card__dots" aria-hidden="true"></span>
        <div class="follow-card__body">
          <span class="follow-card__kicker">Prayer &amp; chat</span>
          <h3 class="follow-card__title">Pray with us.</h3>
          <span class="follow-card__handle">Daily prayer line · +260 974 807 770</span>
          <div class="follow-card__socials">
            <a href="https://whatsapp.com/channel/0029VaIULXfHbFVE2fsv3f1p" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp Channel">{ICON("i-whatsapp")}</a>
            <a href="https://t.me/apostlesundaysinyangwe" target="_blank" rel="noopener noreferrer" aria-label="Telegram">{ICON("i-telegram")}</a>
            <a href="https://wa.me/260974807770?text=Hello%20Shalom%20Embassy%2C%20I%20would%20like%20to%20pray%20with%20someone." target="_blank" rel="noopener noreferrer" aria-label="Chat with the prayer line on WhatsApp">{ICON("i-whatsapp")}</a>
          </div>
        </div>
      </article>
    </div>
  </div>
</section>
"""


# ---------------------------------------------------------------------------
# 7. Gatherings invitation-card generator
# ---------------------------------------------------------------------------

INVITE_HTML = f"""
<!-- INVITE-GENERATOR -->
<section class="section section--cream" id="invite">
  <div class="container invite">
    <form class="invite__form reveal" data-invite-form>
      <p class="eyebrow">Invite someone</p>
      <h2>Create your invitation.</h2>
      <p>Choose a gathering, add the date and your name, then download or share a ready-made invitation card for WhatsApp.</p>
      <div class="form-field">
        <label for="invite-gathering">Gathering</label>
        <select id="invite-gathering" name="gathering">
          <option>7 Hours of Nothing Missing, Nothing Broken</option>
          <option>Big Sunday</option>
          <option>Night of Solution</option>
          <option>Healing &amp; Deliverance Service</option>
          <option>My Worship My Weapon 4</option>
          <option>17th Anniversary Celebration</option>
          <option>Virtuous Women Meeting</option>
        </select>
      </div>
      <div class="form-field">
        <label for="invite-date">Date</label>
        <input id="invite-date" name="date" type="date" value="2026-11-29">
      </div>
      <div class="form-field">
        <label for="invite-name">Your name (optional)</label>
        <input id="invite-name" name="name" type="text" autocomplete="name" placeholder="e.g. Chanda Mwale">
      </div>
      <div class="invite__actions">
        <button class="btn" type="button" data-invite-download>Download card {ICON("i-download")}</button>
        <button class="btn btn--navy" type="button" data-invite-share>Share card {ICON("i-share")}</button>
      </div>
      <p class="invite__hint">Your card is created in your browser. Nothing is uploaded to a server.</p>
    </form>

    <div class="invite__preview reveal" style="--reveal-delay:.1s">
      <div class="invite__canvas-wrap">
        <canvas id="invite-canvas" width="1080" height="1350" role="img" aria-label="Preview of your Shalom Embassy invitation card"></canvas>
      </div>
      <p class="invite__hint">Designed for WhatsApp status and social sharing · 1080 × 1350</p>
    </div>
  </div>
</section>
"""


# ---------------------------------------------------------------------------
# 8. Homepage modules
# ---------------------------------------------------------------------------

TICKER_ITEMS = [
    "17 years of God’s faithfulness",
    "2009 — 2026",
    "21+ branches across Zambia",
    "1,500+ messages shared",
    "294K+ online family",
    "Nothing missing. Nothing broken.",
    "17th anniversary · March 2026",
]

TICKER_GROUP = "".join(f'<span class="ticker__item">{item}</span>' for item in TICKER_ITEMS)

TICKER_HTML = f"""
<!-- ANNIVERSARY-TICKER -->
<div class="ticker" aria-label="Shalom Embassy 17th anniversary milestones">
  <div class="ticker__track">
    <div class="ticker__group">{TICKER_GROUP}</div>
    <div class="ticker__group" aria-hidden="true">{TICKER_GROUP}</div>
  </div>
</div>
"""

HOME_STORIES = "\n".join(
    story_card(story, f"{index * 0.08:.2f}s" if index else None)
    for index, story in enumerate([STORIES[5], STORIES[0], STORIES[6]])
)

HOME_STORIES_HTML = f"""
<!-- HOME-STORIES -->
<section class="section section--cream">
  <div class="container">
    <div class="section-head section-head--row reveal">
      <div>
        <p class="eyebrow">Stories of grace</p>
        <h2>Real people. Real encounters.</h2>
        <p>Healing, safe delivery, and breakthrough — a glimpse of what God is doing in the Shalom Embassy family.</p>
      </div>
      <a class="link-arrow section-head__link" href="stories.html">All testimonies</a>
    </div>
    <div class="story-grid story-grid--home">
      {HOME_STORIES}
    </div>
  </div>
</section>
"""

FAQ_HTML = """
<!-- HOME-FAQ -->
<section class="section">
  <div class="container faq-home">
    <div class="section-head reveal">
      <p class="eyebrow">Before you visit</p>
      <h2>Questions, answered simply.</h2>
      <p>Everything you need to know before your first Sunday at Shalom Embassy Headquarters in Garden House, Lusaka.</p>
      <div class="faq-home__actions">
        <a class="btn btn--navy" href="contact.html#visit">Plan your visit <svg class="icon" aria-hidden="true" focusable="false"><use href="#i-arrow"></use></svg></a>
        <a class="link-arrow" href="contact.html#faq">All questions</a>
      </div>
    </div>
    <div class="faq reveal">
      <div class="faq__list">
        <details class="faq__item" open>
          <summary>What time are your Sunday services?</summary>
          <div class="faq__answer">Our main Sunday gathering is the <strong>7 Hours of Nothing Missing, Nothing Broken</strong> service on the last Sunday of every month, from <strong>07:00 to 14:00 CAT</strong>. Big Sunday and Empowerment Sunday also gather from 07:00 to 14:00. Check the <a href="gatherings.html#calendar">church calendar</a> for exact dates.</div>
        </details>
        <details class="faq__item">
          <summary>Where is the church located?</summary>
          <div class="faq__answer">Our international headquarters is at <strong>Plot 995, Garden House, Off Mumbwa Road, Behind Livonia Shopping Complex, Lusaka, Zambia</strong>. We also have over 21 branches across Lusaka and other parts of Zambia.</div>
        </details>
        <details class="faq__item">
          <summary>What should I expect on my first visit?</summary>
          <div class="faq__answer">Expect a warm welcome, Spirit-filled worship, the teaching of God’s Word, and an opportunity to receive prayer. Come as you are — our team will help you find your way.</div>
        </details>
        <details class="faq__item">
          <summary>Can I watch services online?</summary>
          <div class="faq__answer">Yes. Services and messages are streamed on the official <a href="https://www.youtube.com/@apostlesundaysinyangwe" target="_blank" rel="noopener noreferrer">Shalom Embassy YouTube channel</a>. You can also follow the church on Facebook, Instagram, and X.</div>
        </details>
      </div>
    </div>
  </div>
</section>
"""

MARQUEE = [
    ("worship-deep", "Deep worship"),
    ("altar-honour", "At the altar"),
    ("revival-fire", "Revival fire"),
    ("anniversary-day2", "17th anniversary"),
    ("power-supply", "The family gathered"),
    ("youth-worship", "Next generation"),
    ("congregation", "Sunday worship"),
    ("worship-singer", "Worship in song"),
]

MARQUEE_ITEMS = "\n".join(
    f'<figure class="photo-marquee__item">{picture(name, label, "(max-width: 760px) 60vw, 292px", 1280, 720)}<span>{label}</span></figure>'
    for name, label in MARQUEE
)

MARQUEE_HTML = f"""
<!-- PHOTO-MARQUEE -->
<div class="photo-marquee" aria-label="Moments from Shalom Embassy">
  <div class="photo-marquee__track">
    <div class="photo-marquee__group">{MARQUEE_ITEMS}</div>
    <div class="photo-marquee__group" aria-hidden="true">{MARQUEE_ITEMS}</div>
  </div>
</div>
"""


# ---------------------------------------------------------------------------
# 9. Insert modules into existing pages
# ---------------------------------------------------------------------------

def insert_before(text, anchor, block, marker):
    if marker in text:
        return text
    index = text.find(anchor)
    if index == -1:
        raise SystemExit(f"anchor not found: {anchor}")
    return text[:index] + block.strip() + "\n\n" + text[index:]


def insert_modules():
    contact = read("contact.html")
    contact = insert_before(
        contact,
        '<section class="section section--cream">\n  <div class="container faq">',
        FOLLOW_HTML,
        "<!-- FOLLOW-US -->",
    )
    # Give the FAQ section the anchor used by the homepage.
    contact = contact.replace('<div class="container faq">', '<div class="container faq" id="faq">', 1)
    write("contact.html", contact)

    gatherings = read("gatherings.html")
    gatherings = insert_before(gatherings, '<section class="cta-band">', INVITE_HTML,
                               "<!-- INVITE-GENERATOR -->")
    write("gatherings.html", gatherings)

    index = read("index.html")
    index = insert_before(index, '<section class="scripture-strip"', TICKER_HTML,
                          "<!-- ANNIVERSARY-TICKER -->")
    index = insert_before(index, '<section class="section updates feed-section"', HOME_STORIES_HTML,
                          "<!-- HOME-STORIES -->")
    index = insert_before(index, '<section class="section visit" id="visit">', FAQ_HTML,
                          "<!-- HOME-FAQ -->")
    index = insert_before(index, '<section class="section section--cream feed-section" data-feed-gallery-section hidden>',
                          MARQUEE_HTML, "<!-- PHOTO-MARQUEE -->")
    index = index.replace(
        '<a class="link-arrow section-head__link" href="gatherings.html">Gather with us</a>',
        '<a class="link-arrow section-head__link" href="gallery.html">View full gallery</a>',
        1,
    )
    write("index.html", index)


# ---------------------------------------------------------------------------
# 10. Main
# ---------------------------------------------------------------------------

def main():
    patch_existing()

    template = read("about.html")

    build_page(
        template,
        slug="impact.html",
        title="17 Years of Impact | Shalom Embassy Ministries International",
        description="Seventeen years of God's faithfulness: the story, milestones, and impact of Shalom Embassy Ministries International in Lusaka, Zambia, from 9 March 2009 to 2026.",
        body_class="page-impact",
        main=IMPACT_MAIN,
        preload_name="hero-sanctuary-1920",
        preload_sizes="100vw",
        og_image="assets/img/hero-sanctuary-1920.webp",
        og_alt="Shalom Embassy Ministries International — 17 years of impact",
    )

    build_page(
        template,
        slug="stories.html",
        title="Stories & Testimonies | Shalom Embassy Ministries International",
        description="Real testimonies of healing, deliverance, family, and breakthrough from the Shalom Embassy family in Lusaka, Zambia. Watch the official videos and share your story.",
        body_class="page-stories",
        main=STORIES_MAIN,
        preload_name="worship-crowd",
        preload_sizes="100vw",
        og_image="assets/img/worship-crowd.webp",
        og_alt="The Shalom Embassy family in worship",
    )

    build_page(
        template,
        slug="gallery.html",
        title="Gallery | Shalom Embassy Ministries International",
        description="Browse moments of worship, prayer, celebration, and ministry life at Shalom Embassy Ministries International in Lusaka, Zambia.",
        body_class="page-gallery",
        main=GALLERY_MAIN,
        preload_name="congregation",
        preload_sizes="100vw",
        og_image="assets/img/congregation.webp",
        og_alt="The Shalom Embassy congregation in Lusaka",
    )

    insert_modules()
    print("done")


if __name__ == "__main__":
    main()
