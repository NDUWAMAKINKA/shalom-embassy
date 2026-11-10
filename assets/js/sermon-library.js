/* =========================================================
   SHALOM EMBASSY — SERMON LIBRARY
   - curated archive from data/sermons.json
   - latest uploads from the official YouTube channel
   - latest social posts from data/feed.json
   ========================================================= */

(function () {
  "use strict";

  const root = document.querySelector("[data-sermon-library]");
  if (!root) return;

  const grid = root.querySelector("[data-sermon-grid]") || root;
  const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
  const filterCount = document.querySelector("[data-filter-count]");
  const searchInput = document.querySelector("[data-sermon-search]");
  const moreButton = document.querySelector("[data-sermon-more]");
  const syncLabel = document.querySelector("[data-sermon-sync]");
  const channelStrip = document.querySelector("[data-channel-strip]");
  const channelGrid = document.querySelector("[data-channel-grid]");

  const PAGE_SIZE = 12;
  const LIVE_URL = "https://r.jina.ai/https://www.youtube.com/@apostlesundaysinyangwe/videos";
  const LIVE_CACHE_KEY = "shalom.sermons.live.v1";
  const LIVE_CACHE_MS = 5 * 60 * 1000;

  const state = {
    archive: [],
    social: [],
    live: [],
    filter: "all",
    query: "",
    visible: PAGE_SIZE,
    liveStatus: "loading",
  };

  const escapeHtml = (value) =>
    String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const normalize = (value) => String(value || "").toLowerCase();

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

  function inferType(title) {
    const text = normalize(title);
    if (/prayer|fast|night of|overnight|intercession|fire night/.test(text)) return "Prayer";
    if (/worship|weapon|ministration|music/.test(text)) return "Worship";
    if (/sunday|service|miracle service/.test(text)) return "Sunday";
    if (/conference|anniversary|summit/.test(text)) return "Conference";
    return "Teaching";
  }

  function dateValue(item) {
    const value = String(item.date || "");
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return Date.parse(value);
    const match = value.match(/(\d+)\s*(min|hour|hr|day|d|week|w|month|mo|year|y)\s*ago/i);
    if (!match) return 0;
    const n = Number(match[1]);
    const unit = normalize(match[2]);
    const multipliers = {
      min: 60 * 1000,
      hour: 60 * 60 * 1000,
      hr: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      w: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      mo: 30 * 24 * 60 * 60 * 1000,
      year: 365 * 24 * 60 * 60 * 1000,
      y: 365 * 24 * 60 * 60 * 1000,
    };
    return Date.now() - n * (multipliers[unit] || 0);
  }

  function formatDate(item) {
    const value = String(item.date || "");
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      const date = new Date(value + "T12:00:00");
      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }
    }
    return value || t("Archive");
  }

  function videoId(url) {
    const match = String(url || "").match(/[?&]v=([A-Za-z0-9_-]{11})/);
    return match ? match[1] : "";
  }

  function staticArchive() {
    return Array.from(root.querySelectorAll(".sermon-card")).map((card) => {
      const link = card.querySelector("h3 a");
      const img = card.querySelector("img");
      const meta = Array.from(card.querySelectorAll(".sermon-card__meta span"))
        .map((item) => item.textContent.trim())
        .filter(Boolean);
      const url = link ? link.href : card.querySelector("a") ? card.querySelector("a").href : "";
      return {
        id: videoId(url),
        title: link ? link.textContent.trim() : "",
        speaker: "Apostle Sunday Sinyangwe",
        date: meta.length > 1 ? meta[meta.length - 1] : "",
        type: meta[0] || "Teaching",
        series: "",
        url,
        thumbnail: img ? img.getAttribute("src") : "",
        source: "YouTube",
      };
    });
  }

  async function fetchJson(url) {
    const response = await fetch(url + (url.includes("?") ? "&" : "?") + "v=" + Date.now(), {
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Unable to load " + url);
    return response.json();
  }

  function setStatus(message, stateName) {
    if (!syncLabel) return;
    syncLabel.dataset.state = stateName || "";
    syncLabel.innerHTML =
      '<span class="sermon-sync__dot" aria-hidden="true"></span> ' +
      escapeHtml(message);
  }

  function setLiveLabel() {
    if (state.liveStatus === "live") {
      setStatus(t("Updated from YouTube & church channels"), "live");
    } else if (state.liveStatus === "error") {
      setStatus(
        t("{n} messages in library").replace("{n}", state.archive.length),
        "live"
      );
    } else {
      setStatus(t("Loading sermon library…"), "loading");
    }
  }

  function mergeSermons() {
    const map = new Map();
    state.archive.forEach((item) => {
      if (item.title) map.set(item.id || item.url || item.title, item);
    });
    state.social.forEach((item) => {
      if (item.id && item.title && !map.has(item.id)) map.set(item.id, item);
    });
    state.live.forEach((item) => {
      const key = item.id || item.url || item.title;
      const existing = map.get(key);
      if (existing) {
        map.set(key, {
          ...item,
          ...existing,
          thumbnail: existing.thumbnail || item.thumbnail,
          type: existing.type || inferType(item.title),
          series: existing.series || "Latest upload",
          speaker: existing.speaker || "Apostle Sunday Sinyangwe",
        });
      } else {
        map.set(key, {
          ...item,
          type: item.type || inferType(item.title),
          series: item.series || "Latest upload",
          speaker: item.speaker || "Apostle Sunday Sinyangwe",
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => dateValue(b) - dateValue(a));
  }

  function matches(item) {
    if (state.filter === "pastor-bupe") {
      if (!/pastor bupe|bupe sinyangwe/i.test(item.speaker || "")) return false;
    } else if (state.filter !== "all" && normalize(item.type) !== state.filter) {
      return false;
    }
    if (!state.query) return true;
    const haystack = normalize(
      [item.title, item.speaker, item.series, item.type].join(" ")
    );
    return haystack.includes(state.query);
  }

  function cardMarkup(item) {
    const title = escapeHtml(item.title);
    const url = escapeHtml(item.url);
    const image = escapeHtml(item.thumbnail);
    const category = escapeHtml(normalize(item.type));
    const type = escapeHtml(t(item.type || "Message"));
    const date = escapeHtml(formatDate(item));
    return (
      '<article class="sermon-card" data-category="' +
      category +
      '" data-speaker="' +
      escapeHtml(item.speaker || "") +
      '">' +
      '<a class="sermon-card__media" href="' +
      url +
      '" target="_blank" rel="noopener noreferrer" aria-label="' +
      escapeHtml(t("Watch")) +
      " " +
      title +
      '">' +
      responsiveLocal(
        image,
        title,
        960,
        540,
        "(max-width: 760px) 100vw, (max-width: 1200px) 50vw, 380px"
      ) +
      '<span class="sermon-card__play"><svg class="icon" aria-hidden="true" focusable="false"><use href="#i-play"></use></svg></span>' +
      "</a>" +
      '<div class="sermon-card__body">' +
      '<div class="sermon-card__meta"><span>' +
      type +
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
      ' <svg class="icon" aria-hidden="true" focusable="false"><use href="#i-arrow"></use></svg></a>' +
      "</div></article>"
    );
  }

  function attachImageFallbacks(container) {
    container.querySelectorAll("img").forEach((img) => {
      img.addEventListener(
        "error",
        () => {
          const src = img.getAttribute("src") || "";
          if (src.includes("maxresdefault")) {
            img.src = src.replace("maxresdefault", "hqdefault");
          } else if (src.includes("hqdefault")) {
            img.src = src.replace("hqdefault", "mqdefault");
          }
        },
        { once: true }
      );
    });
  }

  function render() {
    const all = mergeSermons();
    const filtered = all.filter(matches);
    const shown = filtered.slice(0, state.visible);
    grid.innerHTML = shown.length
      ? shown.map(cardMarkup).join("")
      : '<p class="sermon-empty">' +
        escapeHtml(
          t(
            "No messages match that search yet. Try another title, speaker, or category."
          )
        ) +
        "</p>";
    attachImageFallbacks(grid);

    if (filterCount) {
      filterCount.textContent =
        filtered.length +
        " " +
        t(filtered.length === 1 ? "Message" : "Messages");
    }
    if (moreButton) {
      const remaining = filtered.length - shown.length;
      moreButton.hidden = remaining <= 0;
      moreButton.textContent =
        remaining > 0
          ? t("Load {n} more messages").replace(
              "{n}",
              String(Math.min(PAGE_SIZE, remaining))
            )
          : t("All messages shown");
    }
    setLiveLabel();
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

  function renderSocial(feed) {
    if (!channelStrip || !channelGrid) return;
    const updates = (feed.updates || []).filter((item) => item && item.url).slice(0, 4);
    if (!updates.length) {
      channelStrip.hidden = true;
      return;
    }
    channelGrid.innerHTML = updates
      .map((item) => {
        const source = escapeHtml(t(item.source || "Church feed"));
        const text = escapeHtml(cleanTitle(item.text || item.title || t("Latest from Shalom Embassy")));
        const url = escapeHtml(item.url);
        const image = escapeHtml(item.image || item.thumbnail || "");
        const date = escapeHtml(item.date || "");
        return (
          '<a class="channel-card" href="' +
          url +
          '" target="_blank" rel="noopener noreferrer">' +
          (image
            ? '<span class="channel-card__media"><img src="' +
              image +
              '" alt="" width="640" height="360" decoding="async"></span>'
            : "") +
          '<span class="channel-card__body"><span class="channel-card__source">' +
          source +
          "</span><span class=\"channel-card__text\">" +
          text +
          '</span><span class="channel-card__date">' +
          date +
          "</span></span></a>"
        );
      })
      .join("");
    attachImageFallbacks(channelGrid);
    channelStrip.hidden = false;
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
        url: "https://www.youtube.com/watch?v=" + id,
        thumbnail: "https://i.ytimg.com/vi/" + id + "/sddefault.jpg",
        date: relative,
        speaker: "Apostle Sunday Sinyangwe",
        type: inferType(match[5]),
        series: "Latest upload",
        source: "YouTube",
      });
      if (items.length >= 12) break;
    }
    return items;
  }

  async function loadArchive() {
    try {
      const data = await fetchJson("data/sermons.json");
      if (Array.isArray(data.sermons) && data.sermons.length) {
        state.archive = data.sermons;
        render();
      }
    } catch (error) {
      if (window.console) console.warn("Sermon archive unavailable:", error);
    }
  }

  async function loadSocial() {
    try {
      const feed = await fetchJson("data/feed.json");
      state.social = (feed.sermons || []).map((item) => ({
        id: item.id || videoId(item.url),
        title: item.title || item.text || "",
        speaker: "Apostle Sunday Sinyangwe",
        date: item.date || "",
        type: inferType(item.title || item.text || ""),
        series: "Latest upload",
        url: item.url || "",
        thumbnail: item.image || item.thumbnail || "",
        source: item.source || "YouTube",
      }));
      renderSocial(feed);
      render();
    } catch (error) {
      if (window.console) console.warn("Social feed unavailable:", error);
    }
  }

  async function loadLive(force) {
    if (!force) {
      try {
        const cached = JSON.parse(window.sessionStorage.getItem(LIVE_CACHE_KEY) || "null");
        if (cached && Date.now() - cached.at < LIVE_CACHE_MS && Array.isArray(cached.items)) {
          state.live = cached.items;
          state.liveStatus = state.live.length ? "live" : "error";
          render();
          return;
        }
      } catch (error) {
        /* private mode / malformed cache */
      }
    }

    state.liveStatus = "loading";
    setLiveLabel();
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(LIVE_URL, {
        headers: { Accept: "text/plain" },
        cache: "no-store",
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Live feed unavailable");
      const items = parseYouTubeMarkdown(await response.text());
      state.live = items;
      state.liveStatus = items.length ? "live" : "error";
      try {
        window.sessionStorage.setItem(
          LIVE_CACHE_KEY,
          JSON.stringify({ at: Date.now(), items })
        );
      } catch (error) {
        /* private mode */
      }
      render();
    } catch (error) {
      state.liveStatus = "error";
      render();
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function bindFilters() {
    if (!filterButtons.length) return;
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        state.filter = button.getAttribute("data-filter") || "all";
        state.visible = PAGE_SIZE;
        filterButtons.forEach((item) => {
          const active = item === button;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-pressed", String(active));
        });
        render();
      });
    });
  }

  function bindSearch() {
    if (!searchInput) return;
    searchInput.addEventListener("input", () => {
      state.query = normalize(searchInput.value.trim());
      state.visible = PAGE_SIZE;
      render();
    });
  }

  function bindMore() {
    if (!moreButton) return;
    moreButton.addEventListener("click", () => {
      state.visible += PAGE_SIZE;
      render();
    });
  }

  // Start with the server-rendered cards so the page is useful even if JSON is slow.
  state.archive = staticArchive();
  if (!state.archive.length) {
    state.archive = [];
  }
  bindFilters();
  bindSearch();
  bindMore();
  render();

  loadArchive();
  loadSocial();
  window.setTimeout(() => loadLive(false), 500);
  window.setInterval(() => {
    if (document.visibilityState !== "visible") return;
    loadSocial();
    loadLive(true);
  }, 10 * 60 * 1000);
})();
