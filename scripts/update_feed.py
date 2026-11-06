#!/usr/bin/env python3
"""Update the Shalom Embassy social feed.

YouTube is public and always available. Facebook/Instagram/Calendar are
optional and activate when the matching environment variables/secrets exist.

Output: data/feed.json (+ downloaded social images in assets/img/feed/)
"""

from __future__ import annotations

import hashlib
import html
import json
import os
import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FEED_FILE = ROOT / "data" / "feed.json"
IMAGE_DIR = ROOT / "assets" / "img" / "feed"
CHANNEL_ID = "UCyRdboSgc7-TZMtX6UT4yeA"
RSS_URL = f"https://www.youtube.com/feeds/videos.xml?channel_id={CHANNEL_ID}"
USER_AGENT = "ShalomEmbassyWebsite/1.0"
TIMEOUT = 45


def fetch(url: str) -> bytes:
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "*/*",
        },
    )
    with urllib.request.urlopen(request, timeout=TIMEOUT) as response:
        return response.read()


def human_date(value: str) -> str:
    if not value:
        return ""
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        try:
            parsed = datetime.fromisoformat(value[:10])
        except ValueError:
            return value
    return f"{parsed.strftime('%b')} {parsed.day}, {parsed.year}"


def youtube_items() -> list[dict]:
    root = ET.fromstring(fetch(RSS_URL).decode("utf-8", "replace"))
    atom = {"a": "http://www.w3.org/2005/Atom", "media": "http://search.yahoo.com/mrss/"}
    items: list[dict] = []
    seen_titles: set[str] = set()

    for entry in root.findall("a:entry", atom):
        title = entry.findtext("a:title", default="", namespaces=atom).strip()
        link = ""
        link_node = entry.find("a:link", atom)
        if link_node is not None:
            link = link_node.attrib.get("href", "")
        # Shorts use vertical artwork and are not suitable for the sermon cards.
        if "/shorts/" in link:
            continue
        title_key = " ".join(title.lower().split())
        if title_key in seen_titles:
            continue
        seen_titles.add(title_key)
        published = entry.findtext("a:published", default="", namespaces=atom)
        video_id = ""
        match = re.search(r"[?&]v=([A-Za-z0-9_-]{11})", link)
        if match:
            video_id = match.group(1)
        if not video_id:
            video_id = entry.findtext("a:id", default="", namespaces=atom).split(":")[-1]
        if not video_id:
            continue

        thumbnail = f"https://i.ytimg.com/vi/{video_id}/maxresdefault.jpg"
        description = entry.findtext(
            "media:group/media:description", default="", namespaces=atom
        )
        items.append(
            {
                "id": video_id,
                "title": title,
                "url": link or f"https://www.youtube.com/watch?v={video_id}",
                "thumbnail": thumbnail,
                "image": thumbnail,
                "date": human_date(published),
                "published": published,
                "description": " ".join(html.unescape(description).split())[:260],
                "source": "YouTube",
            }
        )

    return items


def youtube_from_channel_page() -> list[dict]:
    """Fallback when YouTube's RSS endpoint is unavailable.

    The current channel layout exposes videos as lockupViewModel objects inside
    ytInitialData. This also lets us skip Shorts using their duration badges.
    """
    page = fetch("https://www.youtube.com/@apostlesundaysinyangwe/videos").decode(
        "utf-8", "replace"
    )
    match = re.search(r"var ytInitialData\s*=\s*(\{[\s\S]*?\})\s*;\s*</script>", page)
    if not match:
        return []
    data = json.loads(match.group(1))

    locks: list[dict] = []

    def walk(value) -> None:
        if isinstance(value, dict):
            if "lockupViewModel" in value:
                locks.append(value["lockupViewModel"])
            for child in value.values():
                walk(child)
        elif isinstance(value, list):
            for child in value:
                walk(child)

    walk(data)
    items: list[dict] = []
    seen: set[str] = set()

    for lock in locks:
        video_id = lock.get("contentId", "")
        if not video_id or video_id in seen:
            continue
        metadata = (lock.get("metadata") or {}).get("lockupMetadataViewModel") or {}
        title = ((metadata.get("title") or {}).get("content") or "").strip()
        if not title:
            continue

        duration = ""
        badge_rows = (
            (lock.get("contentImage") or {})
            .get("thumbnailViewModel", {})
            .get("overlays", [])
        )
        for overlay in badge_rows:
            badge = overlay.get("thumbnailBottomOverlayViewModel", {})
            for entry in badge.get("badges", []):
                text = entry.get("thumbnailBadgeViewModel", {}).get("text", "")
                if re.fullmatch(r"\d+(?::\d+){1,2}", text or ""):
                    duration = text
                    break
            if duration:
                break

        # Ignore Shorts and very short clips.
        if duration:
            parts = [int(part) for part in duration.split(":")]
            seconds = parts[-1] + (parts[-2] * 60 if len(parts) > 1 else 0)
            if len(parts) > 2:
                seconds += parts[-3] * 3600
            if seconds < 60:
                continue

        relative_date = ""
        metadata_rows = (
            metadata.get("metadata", {})
            .get("contentMetadataViewModel", {})
            .get("metadataRows", [])
        )
        for row in metadata_rows:
            for part in row.get("metadataParts", []):
                text = (part.get("text") or {}).get("content", "")
                if "ago" in text.lower():
                    relative_date = text
                    break

        thumbnail = f"https://i.ytimg.com/vi/{video_id}/maxresdefault.jpg"
        seen.add(video_id)
        items.append(
            {
                "id": video_id,
                "title": title,
                "url": f"https://www.youtube.com/watch?v={video_id}",
                "thumbnail": thumbnail,
                "image": thumbnail,
                "date": relative_date,
                "published": "",
                "description": "",
                "source": "YouTube",
            }
        )

    return items


def graph(path: str, params: dict) -> dict:
    token = params.pop("access_token", "")
    query = urllib.parse.urlencode(params)
    url = f"https://graph.facebook.com/v19.0/{path}?{query}&access_token={token}"
    return json.loads(fetch(url).decode("utf-8", "replace"))


def local_image(url: str, prefix: str) -> str:
    if not url:
        return ""
    IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    extension = ".jpg"
    if ".png" in url.lower():
        extension = ".png"
    if ".webp" in url.lower():
        extension = ".webp"
    name = hashlib.sha1(url.encode("utf-8")).hexdigest()[:16]
    filename = f"{prefix}-{name}{extension}"
    path = IMAGE_DIR / filename
    if not path.exists():
        try:
            path.write_bytes(fetch(url))
        except Exception as error:
            print(f"image download failed: {url} ({error})")
            return ""
    return f"assets/img/feed/{filename}"


def facebook_items() -> tuple[list[dict], list[dict]]:
    page_id = os.getenv("FACEBOOK_PAGE_ID", "").strip()
    token = os.getenv("FACEBOOK_ACCESS_TOKEN", "").strip()
    if not page_id or not token:
        return [], []

    updates: list[dict] = []
    gallery: list[dict] = []
    try:
        data = graph(
            f"{page_id}/posts",
            {
                "fields": "id,message,created_time,permalink_url,full_picture",
                "limit": "6",
                "access_token": token,
            },
        )
    except Exception as error:
        print(f"Facebook feed failed: {error}")
        return [], []

    for post in data.get("data", []):
        message = " ".join((post.get("message") or "").split())
        image = local_image(post.get("full_picture", ""), "fb")
        update = {
            "source": "Facebook",
            "text": message or "A new post from Shalom Embassy.",
            "image": image,
            "url": post.get("permalink_url", "https://www.facebook.com/ApostleSundaySinyangwe/"),
            "date": human_date(post.get("created_time", "")),
        }
        updates.append(update)
        if image:
            gallery.append(
                {
                    "src": image,
                    "alt": message[:120] or "Shalom Embassy Facebook post",
                    "caption": message[:120],
                    "url": update["url"],
                    "source": "Facebook",
                }
            )
    return updates, gallery


def instagram_items() -> tuple[list[dict], list[dict]]:
    user_id = os.getenv("INSTAGRAM_USER_ID", "").strip()
    token = os.getenv("INSTAGRAM_ACCESS_TOKEN", "").strip()
    if not user_id or not token:
        return [], []

    updates: list[dict] = []
    gallery: list[dict] = []
    try:
        data = graph(
            f"{user_id}/media",
            {
                "fields": "id,caption,media_url,permalink,timestamp,media_type,thumbnail_url",
                "limit": "6",
                "access_token": token,
            },
        )
    except Exception as error:
        print(f"Instagram feed failed: {error}")
        return [], []

    for media in data.get("data", []):
        caption = " ".join((media.get("caption") or "").split())
        image_url = media.get("media_url") or media.get("thumbnail_url") or ""
        image = local_image(image_url, "ig")
        update = {
            "source": "Instagram",
            "text": caption or "A new moment from Shalom Embassy.",
            "image": image,
            "url": media.get("permalink", "https://www.instagram.com/apostlesundaysinyangwe/"),
            "date": human_date(media.get("timestamp", "")),
        }
        updates.append(update)
        if image:
            gallery.append(
                {
                    "src": image,
                    "alt": caption[:120] or "Shalom Embassy Instagram post",
                    "caption": caption[:120],
                    "url": update["url"],
                    "source": "Instagram",
                }
            )
    return updates, gallery


def ical_events() -> list[dict]:
    url = os.getenv("CALENDAR_ICS_URL", "").strip()
    if not url:
        return []

    try:
        text = fetch(url).decode("utf-8", "replace")
    except Exception as error:
        print(f"Calendar feed failed: {error}")
        return []

    text = text.replace("\r\n ", "").replace("\n ", "")
    events: list[dict] = []
    now = datetime.now(timezone.utc)

    for block in re.findall(r"BEGIN:VEVENT(.*?)END:VEVENT", text, re.S):
        def field(name: str) -> str:
            match = re.search(rf"^{name}(?:;[^:]*)?:(.*)$", block, re.M)
            return html.unescape(match.group(1).strip()) if match else ""

        raw_start = field("DTSTART")
        if not raw_start:
            continue
        try:
            if len(raw_start) == 8:
                start = datetime.strptime(raw_start, "%Y%m%d").replace(tzinfo=timezone.utc)
            else:
                start = datetime.strptime(raw_start.replace("Z", ""), "%Y%m%dT%H%M%S").replace(
                    tzinfo=timezone.utc
                )
        except ValueError:
            continue
        if start < now.replace(hour=0, minute=0, second=0, microsecond=0):
            continue

        events.append(
            {
                "title": field("SUMMARY") or "Church event",
                "date": f"{start.strftime('%b')} {start.day}, {start.year}",
                "time": start.strftime("%H:%M"),
                "location": field("LOCATION") or "Shalom Embassy Ministries International",
                "description": " ".join(field("DESCRIPTION").split())[:280],
                "url": field("URL") or "gatherings.html",
            }
        )

    events.sort(key=lambda event: datetime.strptime(event["date"], "%b %d, %Y"))
    return events[:6]


def load_existing() -> dict:
    if not FEED_FILE.exists():
        return {}
    try:
        return json.loads(FEED_FILE.read_text(encoding="utf-8"))
    except Exception:
        return {}


def cleanup_images(feed: dict) -> None:
    if not IMAGE_DIR.exists():
        return
    referenced = set()
    for key in ("updates", "gallery"):
        for item in feed.get(key, []):
            value = item.get("image") or item.get("src") or ""
            if value.startswith("assets/img/feed/"):
                referenced.add(Path(value).name)
    for path in IMAGE_DIR.iterdir():
        if path.is_file() and path.name not in referenced:
            path.unlink(missing_ok=True)


def main() -> None:
    existing = load_existing()
    youtube: list[dict] = []
    try:
        youtube = youtube_items()
    except Exception as error:
        print(f"YouTube RSS failed: {error}; using the channel page.")
        try:
            youtube = youtube_from_channel_page()
        except Exception as fallback_error:
            print(f"YouTube channel page failed: {fallback_error}")
            youtube = existing.get("sermons", [])

    facebook_updates, facebook_gallery = facebook_items()
    instagram_updates, instagram_gallery = instagram_items()

    updates = facebook_updates + instagram_updates
    gallery = facebook_gallery + instagram_gallery

    # Keep the feed useful even before Meta API credentials are configured:
    # fill the remaining slots with the latest YouTube uploads.
    for item in youtube:
        if len(updates) >= 6:
            break
        if any(update.get("url") == item["url"] for update in updates):
            continue
        updates.append(
            {
                "source": "YouTube",
                "text": item["title"],
                "image": item["image"],
                "url": item["url"],
                "date": item["date"],
            }
        )

    for item in youtube:
        if len(gallery) >= 8:
            break
        if any(entry.get("src") == item["image"] for entry in gallery):
            continue
        gallery.append(
            {
                "src": item["image"],
                "alt": item["title"],
                "caption": item["title"],
                "url": item["url"],
                "source": "YouTube",
            }
        )

    events = ical_events()
    if not events:
        events = existing.get("events", [])

    feed = {
        "updated": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "sermons": youtube[:6],
        "updates": updates[:6],
        "gallery": gallery[:8],
        "events": events[:6],
    }

    FEED_FILE.parent.mkdir(parents=True, exist_ok=True)
    FEED_FILE.write_text(json.dumps(feed, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    cleanup_images(feed)
    print(
        f"Updated feed: {len(feed['sermons'])} sermons, {len(feed['updates'])} updates, "
        f"{len(feed['gallery'])} gallery images, {len(feed['events'])} events."
    )


if __name__ == "__main__":
    main()
