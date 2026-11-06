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

  const isExternal = (url) => /^https?:\/\//i.test(url || "");

  function attachImageFallbacks(root) {
    root.querySelectorAll("img").forEach((img) => {
      img.addEventListener(
        "error",
        () => {
          if (img.dataset.fallback) return;
          img.dataset.fallback = "1";
          img.src = img.src
            .replace("hqdefault", "mqdefault")
            .replace("maxresdefault", "hqdefault");
        },
        { once: true }
      );
    });
  }

  function renderSermons(items) {
    const grid = document.querySelector("[data-feed-sermons]");
    if (!grid || !items || !items.length) return;

    grid.innerHTML = items
      .slice(0, 3)
      .map((item) => {
        const url = escapeHtml(item.url);
        const title = escapeHtml(item.title);
        const image = escapeHtml((item.image || item.thumbnail || "").replace("maxresdefault.jpg", "hqdefault.jpg"));
        const date = escapeHtml(item.date || "Latest");
        return (
          '<article class="sermon-card">' +
          '<a class="sermon-card__media" href="' +
          url +
          '" target="_blank" rel="noopener noreferrer" aria-label="Watch ' +
          title +
          ' on YouTube">' +
          '<img src="' +
          image +
          '" alt="' +
          title +
          '" width="960" height="540" loading="lazy" decoding="async">' +
          '<span class="sermon-card__play">' +
          icon("play") +
          "</span></a>" +
          '<div class="sermon-card__body">' +
          '<div class="sermon-card__meta"><span>Latest</span><span class="dot"></span><span>' +
          date +
          "</span></div>" +
          '<h3><a href="' +
          url +
          '" target="_blank" rel="noopener noreferrer">' +
          title +
          "</a></h3>" +
          '<a class="sermon-card__link" href="' +
          url +
          '" target="_blank" rel="noopener noreferrer">Watch message ' +
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
        const text = escapeHtml(item.text);
        const source = escapeHtml(item.source || "Update");
        const date = escapeHtml(item.date || "");
        const image = escapeHtml((item.image || "").replace("maxresdefault.jpg", "hqdefault.jpg"));
        const media = image
          ? '<a class="update-card__media" href="' +
            url +
            '" target="_blank" rel="noopener noreferrer" aria-label="Open ' +
            source +
            ' post">' +
            '<img src="' +
            image +
            '" alt="' +
            text +
            '" width="960" height="600" loading="lazy" decoding="async">' +
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
          '" target="_blank" rel="noopener noreferrer">Open post ' +
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
        const image = escapeHtml((item.src || item.image || "").replace("maxresdefault.jpg", "hqdefault.jpg"));
        const caption = escapeHtml(item.caption || item.alt || "Shalom Embassy");
        const source = escapeHtml(item.source || "Gallery");
        return (
          '<a class="feed-gallery__item" href="' +
          url +
          '" target="_blank" rel="noopener noreferrer" aria-label="Open ' +
          caption +
          '">' +
          '<img src="' +
          image +
          '" alt="' +
          caption +
          '" width="800" height="800" loading="lazy" decoding="async">' +
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
          ">Details " +
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
        "Last synced " +
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
        image: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        date: relative,
        source: "YouTube",
      });
      if (items.length >= 8) break;
    }
    return items;
  }

  async function fetchYouTubeLive() {
    const response = await fetch(YOUTUBE_READER, {
      cache: "no-store",
      headers: { Accept: "text/plain" },
    });
    if (!response.ok) return [];
    return parseYouTubeMarkdown(await response.text());
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadFeed);
  } else {
    loadFeed();
  }
})();
