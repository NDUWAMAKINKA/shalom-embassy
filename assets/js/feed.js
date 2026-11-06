/* =========================================================
   SHALOM EMBASSY — AUTO-UPDATING SOCIAL FEED
   Reads data/feed.json (updated by GitHub Actions).
   ========================================================= */

(function () {
  "use strict";

  const FEED_URL = "data/feed.json";

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

  function renderSermons(items) {
    const grid = document.querySelector("[data-feed-sermons]");
    if (!grid || !items || !items.length) return;

    grid.innerHTML = items
      .slice(0, 3)
      .map((item) => {
        const url = escapeHtml(item.url);
        const title = escapeHtml(item.title);
        const image = escapeHtml(item.image || item.thumbnail);
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
          '" width="960" height="540" loading="eager" decoding="async">' +
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

    // Some older uploads do not expose a maxres thumbnail.
    grid.querySelectorAll("img").forEach((img) => {
      img.addEventListener(
        "error",
        () => {
          img.src = img.src.replace("maxresdefault", "hqdefault");
        },
        { once: true }
      );
    });
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
        const image = escapeHtml(item.image || "");
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
            '" width="960" height="600" loading="eager" decoding="async">' +
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
        const image = escapeHtml(item.src || item.image);
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
          '" width="800" height="800" loading="eager" decoding="async">' +
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

  async function loadFeed() {
    try {
      const response = await fetch(FEED_URL + "?v=" + Date.now(), {
        cache: "no-store",
      });
      if (!response.ok) return;
      const feed = await response.json();
      window.__shalomFeedUpdated = feed.updated || "";
      renderSermons(feed.sermons);
      renderUpdates(feed.updates);
      renderGallery(feed.gallery);
      renderEvents(feed.events);
    } catch (error) {
      // Keep the curated static content if the feed is unavailable.
      if (window.console) console.warn("Shalom feed unavailable:", error);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadFeed);
  } else {
    loadFeed();
  }
})();
