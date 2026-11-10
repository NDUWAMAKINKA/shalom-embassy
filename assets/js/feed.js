/* =========================================================
   SHALOM EMBASSY — AUTO-UPDATING SOCIAL FEED
   Reads data/feed.json (updated by GitHub Actions).
   ========================================================= */

(function () {
  "use strict";

  const FEED_URL = "data/feed.json";
  const YOUTUBE_READER =
    "https://r.jina.ai/https://www.youtube.com/@apostlesundaysinyangwe/videos";

  const escapeHtml = (value) =>
    String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const t = (text) =>
    typeof window.SHALOM_T === "function" ? window.SHALOM_T(text) : text;

  const responsiveLocal = (src, alt, width, height, sizes) => {
    if (!/^assets\/img\/(?:sermons\/|sermon-)/.test(src)) {
      return (
        '<img src="' + src + '" alt="' + alt + '" width="' + width +
        '" height="' + height + '" loading="lazy" decoding="async">'
      );
    }
    const base = src.split("?")[0].replace(/\.(webp|jpg|jpeg|png)$/i, "");
    const name = base.split("/").pop();
    const set = (ext) =>
      [320, 480, 640, 960]
        .map((w) => "assets/img/opt/" + name + "-" + w + "." + ext + " " + w + "w")
        .join(", ");
    return (
      '<picture><source type="image/avif" srcset="' + set("avif") +
      '" sizes="' + sizes + '"><source type="image/webp" srcset="' +
      set("webp") + '" sizes="' + sizes + '"><img src="' + src + '" alt="' +
      alt + '" width="' + width + '" height="' + height +
      '" loading="lazy" decoding="async"></picture>'
    );
  };

  const sourceClass = (source) => {
    const key = String(source || "").toLowerCase();
    if (key === "facebook") return "update-card__source--facebook";
    if (key === "instagram") return "update-card__source--instagram";
    return "";
  };

  const icon = (name) =>
    '<svg class="icon" aria-hidden="true" focusable="false"><use href="#i-' +
    name +
    '"></use></svg>';

  const isExternal = (url) => {
    const value = String(url || "").toLowerCase();
    return value.startsWith("http://") || value.startsWith("https://");
  };

  const hdThumb = (url) =>
    String(url || "").replace(/\/(?:maxres|hq|mq)default\.jpg/i, "/sddefault.jpg");

  const videoId = (url) => {
    const match = String(url || "").match(/[?&]v=([A-Za-z0-9_-]{11})/);
    return match ? match[1] : "";
  };

  const localThumbMap = {};

  function inferCategory(title) {
    const text = String(title || "").toLowerCase();
    if (/prayer|fast|night of|overnight|intercession|fire night/.test(text)) return "Prayer";
    if (/worship|weapon|ministration|music/.test(text)) return "Worship";
    if (/sunday|service|miracle service/.test(text)) return "Sunday";
    if (/conference|anniversary|summit/.test(text)) return "Conference";
    return "Teaching";
  }

  function cleanTitle(raw) {
    let text = String(raw || "").trim();
    text = text.replace(/\s*\|\s*Apostle Sunday Sinyangwe\s*$/i, "");
    text = text.replace(/^Apostle\s*Sunday\s*Sinyangwe\s*[-–—:]\s*/i, "");
    const letters = text.replace(/[^A-Za-z]/g, "");
    const uppers = text.replace(/[^A-Z]/g, "");
    if (letters.length > 6 && uppers.length / letters.length > 0.75) {
      const small = new Set(["a", "an", "and", "as", "at", "by", "for", "from", "in", "into", "of", "on", "or", "the", "to", "with"]);
      text = text
        .toLowerCase()
        .split(/\s+/)
        .map((word, idx) => {
          if (/^ii+$/i.test(word)) return word.toUpperCase();
          if (idx > 0 && small.has(word)) return word;
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(" ");
    }
    return text;
  }

  function resolveThumb(url, id) {
    const vid = id || videoId(url);
    if (vid && localThumbMap[vid]) return localThumbMap[vid];
    if (String(url || "").startsWith("assets/")) return url;
    return hdThumb(url);
  }

  function attachImageFallbacks(root) {
    root.querySelectorAll("img").forEach((img) => {
      img.addEventListener("error", function onError() {
        const src = img.getAttribute("src") || "";
        if (src.includes("maxresdefault")) {
          img.src = src.replace("maxresdefault", "hqdefault");
        } else if (src.includes("sddefault")) {
          img.src = src.replace("sddefault", "hqdefault");
        } else if (src.includes("hqdefault")) {
          img.src = src.replace("hqdefault", "mqdefault");
        } else {
          img.removeEventListener("error", onError);
        }
      });
    });
  }

  function renderSermons(items) {
    const grid = document.querySelector("[data-feed-sermons]");
    if (!grid || !items || !items.length) return;

    grid.innerHTML = items
      .slice(0, 3)
      .map((item) => {
        const url = escapeHtml(item.url);
        const title = escapeHtml(cleanTitle(item.title));
        const category = escapeHtml(t(item.type || inferCategory(item.title)));
        const image = escapeHtml(resolveThumb(item.image || item.thumbnail || "", item.id));
        const date = escapeHtml(item.date || t("Recent"));
        return (
          '<article class="sermon-card">' +
          '<a class="sermon-card__media" href="' +
          url +
          '" target="_blank" rel="noopener noreferrer" aria-label="' +
          escapeHtml(t("Watch")) +
          " " +
          title +
          " " +
          escapeHtml(t("on YouTube")) +
          '">' +
          responsiveLocal(
            image,
            title,
            960,
            540,
            "(max-width: 760px) 100vw, (max-width: 1200px) 50vw, 380px"
          ) +
          '<span class="sermon-card__play">' +
          icon("play") +
          "</span></a>" +
          '<div class="sermon-card__body">' +
          '<div class="sermon-card__meta"><span>' +
          category +
          '</span><span class="dot"></span><span>' +
          date +
          "</span></div>" +
          '<h3><a href="' +
          url +
          '" target="_blank" rel="noopener noreferrer">' +
          title +
          "</a></h3>" +
          '<a class="sermon-card__link" href="' +
          url +
          '" target="_blank" rel="noopener noreferrer">' +
          escapeHtml(t("Watch message")) +
          " " +
          icon("arrow") +
          "</a></div></article>"
        );
      })
      .join("");

    attachImageFallbacks(grid);
  }

  function renderUpdates(items) {
    const section = document.querySelector("[data-feed-updates-section]");
    const grid = document.querySelector("[data-feed-updates]");
    if (!section || !grid || !items || !items.length) return;

    grid.innerHTML = items
      .slice(0, 6)
      .map((item) => {
        const url = escapeHtml(item.url);
        const text = escapeHtml(cleanTitle(item.text));
        const source = escapeHtml(t(item.source || "Update"));
        const date = escapeHtml(item.date || "");
        const image = escapeHtml(resolveThumb(item.image || "", videoId(item.url)));
        const media = image
          ? '<a class="update-card__media" href="' +
            url +
            '" target="_blank" rel="noopener noreferrer" aria-label="' +
            escapeHtml(t("Open post")) +
            " " +
            source +
            '">' +
            responsiveLocal(
              image,
              text,
              960,
              600,
              "(max-width: 760px) 100vw, (max-width: 1200px) 50vw, 33vw"
            ) +
            '<span class="update-card__source ' +
            sourceClass(item.source) +
            '">' +
            source +
            "</span></a>"
          : "";

        return (
          '<article class="update-card">' +
          media +
          '<div class="update-card__body">' +
          '<p class="update-card__meta">' +
          (date ? date + " · " : "") +
          source +
          "</p>" +
          '<p class="update-card__text">' +
          text +
          "</p>" +
          '<a class="update-card__link" href="' +
          url +
          '" target="_blank" rel="noopener noreferrer">' +
          escapeHtml(t("Open post")) +
          " " +
          icon("arrow") +
          "</a></div></article>"
        );
      })
      .join("");

    attachImageFallbacks(grid);
    section.hidden = false;
    updateTimestamp();
  }

  function renderGallery(items) {
    const section = document.querySelector("[data-feed-gallery-section]");
    const grid = document.querySelector("[data-feed-gallery]");
    if (!section || !grid || !items || !items.length) return;

    grid.innerHTML = items
      .slice(0, 8)
      .map((item) => {
        const url = escapeHtml(item.url);
        const image = escapeHtml(resolveThumb(item.src || item.image || "", videoId(item.url)));
        const caption = escapeHtml(cleanTitle(item.caption || item.alt || t("Shalom Embassy photo")));
        const source = escapeHtml(t(item.source || "Gallery"));
        return (
          '<a class="feed-gallery__item" href="' +
          url +
          '" target="_blank" rel="noopener noreferrer" aria-label="' +
          escapeHtml(t("Open")) +
          " " +
          caption +
          '">' +
          responsiveLocal(
            image,
            caption,
            800,
            800,
            "(max-width: 760px) 50vw, 33vw"
          ) +
          '<span class="feed-gallery__source ' +
          sourceClass(item.source) +
          '">' +
          source +
          "</span>" +
          '<span class="feed-gallery__caption">' +
          caption +
          "</span></a>"
        );
      })
      .join("");

    attachImageFallbacks(grid);
    section.hidden = false;
    updateTimestamp();
  }

  function renderEvents(items) {
    const section = document.querySelector("[data-feed-events-section]");
    const grid = document.querySelector("[data-feed-events]");
    if (!section || !grid || !items || !items.length) return;

    grid.innerHTML = items
      .slice(0, 6)
      .map((item) => {
        const url = escapeHtml(item.url || "gatherings.html");
        const title = escapeHtml(item.title);
        const date = escapeHtml(item.date || "");
        const time = escapeHtml(item.time || "");
        const location = escapeHtml(item.location || "");
        const description = escapeHtml(item.description || "");
        const external = isExternal(item.url)
          ? ' target="_blank" rel="noopener noreferrer"'
          : "";
        return (
          '<article class="event-card feed-event">' +
          '<div class="event-card__body">' +
          '<p class="event-card__date">' +
          icon("calendar") +
          " " +
          date +
          "</p>" +
          "<h3>" +
          title +
          "</h3>" +
          "<p>" +
          description +
          "</p>" +
          '<p class="feed-event__meta">' +
          (time ? icon("clock") + time : "") +
          (location ? icon("pin") + location : "") +
          "</p>" +
          '<a class="sermon-card__link" href="' +
          url +
          '"' +
          external +
          ">" +
          escapeHtml(t("Details")) +
          " " +
          icon("arrow") +
          "</a></div></article>"
        );
      })
      .join("");

    attachImageFallbacks(grid);
    section.hidden = false;
    updateTimestamp();
  }

  function updateTimestamp() {
    const target = document.querySelector("[data-feed-updated]");
    if (!target || !window.__shalomFeedUpdated) return;
    try {
      target.textContent =
        t("Last synced") +
        " " +
        new Date(window.__shalomFeedUpdated).toLocaleString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
    } catch (error) {
      target.textContent = "";
    }
  }

  function parseYouTubeMarkdown(text) {
    const items = [];
    const seen = new Set();
    const pattern =
      /\[!\[[^\]]*\]\((https:\/\/i\.ytimg\.com\/vi\/[^)\s]+)\)\s*([\d:]+)\]\((https:\/\/www\.youtube\.com\/watch\?v=([A-Za-z0-9_-]{11}))\)\s*\n+\s*###\s*\[([^\]]+)\]\([^)]+\)\s*\n+\s*([^\n]+)/g;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const id = match[4];
      if (seen.has(id)) continue;
      seen.add(id);
      const dateLine = match[6] || "";
      const relative = dateLine.replace(/^\s*[\d.,KMB]+\s*/i, "").trim();
      items.push({
        id,
        title: match[5].trim(),
        url: `https://www.youtube.com/watch?v=${id}`,
        image: `https://i.ytimg.com/vi/${id}/sddefault.jpg`,
        thumbnail: `https://i.ytimg.com/vi/${id}/sddefault.jpg`,
        date: relative,
        source: "YouTube",
      });
      if (items.length >= 8) break;
    }
    return items;
  }

  async function fetchYouTubeLive() {
    const controller = new AbortController();
    const timeout = window.setTimeout(function () {
      controller.abort();
    }, 7000);
    try {
      const response = await fetch(YOUTUBE_READER, {
        cache: "no-store",
        headers: { Accept: "text/plain" },
        signal: controller.signal,
      });
      if (!response.ok) return [];
      return parseYouTubeMarkdown(await response.text());
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function renderFeed(feed) {
    window.__shalomFeedUpdated = feed.updated || "";
    renderSermons(feed.sermons);
    renderUpdates(feed.updates);
    renderGallery(feed.gallery);
    renderEvents(feed.events);
    updateTimestamp();
  }

  async function loadFeed() {
    let feed = { sermons: [], updates: [], gallery: [], events: [] };

    try {
      const response = await fetch(FEED_URL + "?v=" + Date.now(), {
        cache: "no-store",
      });
      if (response.ok) feed = await response.json();
    } catch (error) {
      // Keep the curated static content if the JSON feed is unavailable.
      if (window.console) console.warn("Shalom feed JSON unavailable:", error);
    }

    (feed.sermons || []).forEach((s) => {
      const vid = s.id || videoId(s.url);
      const img = s.thumbnail || s.image || "";
      if (vid && img.startsWith("assets/")) localThumbMap[vid] = img;
    });
    (feed.updates || []).forEach((u) => {
      const vid = videoId(u.url);
      const img = u.image || "";
      if (vid && img.startsWith("assets/")) localThumbMap[vid] = img;
    });
    (feed.gallery || []).forEach((g) => {
      const vid = videoId(g.url);
      const img = g.src || g.image || "";
      if (vid && img.startsWith("assets/")) localThumbMap[vid] = img;
    });

    renderFeed(feed);

    try {
      const live = await fetchYouTubeLive();
      if (live.length) {
        const metaUpdates = (feed.updates || []).filter(
          (item) => item.source !== "YouTube"
        );
        const metaGallery = (feed.gallery || []).filter(
          (item) => item.source !== "YouTube"
        );
        feed.sermons = live.slice(0, 6);
        feed.updates = metaUpdates
          .concat(
            live.map((item) => ({
              source: "YouTube",
              text: item.title,
              image: item.image,
              url: item.url,
              date: item.date,
            }))
          )
          .slice(0, 6);
        feed.gallery = metaGallery
          .concat(
            live.map((item) => ({
              src: item.image,
              alt: item.title,
              caption: item.title,
              url: item.url,
              source: "YouTube",
            }))
          )
          .slice(0, 8);
        feed.updated = new Date().toISOString();
      }
    } catch (error) {
      // The static feed remains a complete fallback.
      if (window.console) console.warn("Live YouTube feed unavailable:", error);
    }

    window.__shalomFeedUpdated = feed.updated || "";
    renderSermons(feed.sermons);
    renderUpdates(feed.updates);
    renderGallery(feed.gallery);
    renderEvents(feed.events);
    updateTimestamp();
  }

  var feedStarted = false;
  function startFeed() {
    if (feedStarted) return;
    feedStarted = true;
    loadFeed();
  }

  function scheduleFeed() {
    var anchor = document.querySelector("[data-feed-sermons]");
    if (!anchor) return;
    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          if (entries.some(function (entry) { return entry.isIntersecting; })) {
            observer.disconnect();
            startFeed();
          }
        },
        { rootMargin: "900px 0px" }
      );
      observer.observe(anchor);
    } else {
      window.addEventListener("load", function () {
        window.setTimeout(startFeed, 1200);
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleFeed);
  } else {
    scheduleFeed();
  }
})();
