/* =========================================================
   SHALOM EMBASSY MINISTRIES INTERNATIONAL
   Interaction layer
   ========================================================= */

(function () {
  "use strict";

  const body = document.body;
  const header = document.getElementById("site-header");
  const nav = document.getElementById("primary-nav");
  const navToggle = document.querySelector(".nav-toggle");
  const navBackdrop = document.querySelector("[data-nav-backdrop]");
  const toTop = document.querySelector(".to-top");
  const mainContent = document.getElementById("main");
  const siteFooter = document.querySelector(".site-footer");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobile navigation ---------- */

  const setNav = (open) => {
    if (!navToggle) return;
    body.classList.toggle("nav-open", open);
    navToggle.setAttribute("aria-expanded", String(open));

    const toggleLabel = navToggle.querySelector(".sr-only");
    if (toggleLabel) {
      toggleLabel.textContent = open ? "Close menu" : "Open menu";
    }

    if (mainContent) mainContent.toggleAttribute("inert", open);
    if (siteFooter) siteFooter.toggleAttribute("inert", open);

    if (open && header) {
      var top = Math.max(0, Math.round(header.getBoundingClientRect().bottom));
      document.documentElement.style.setProperty("--drawer-top", top + "px");
    }

    if (open) {
      const firstLink = nav ? nav.querySelector("a") : null;
      window.setTimeout(() => firstLink && firstLink.focus(), 120);
    } else if (document.activeElement && nav && nav.contains(document.activeElement)) {
      navToggle.focus();
    }
  };

  if (navToggle) {
    navToggle.addEventListener("click", () => {
      setNav(!body.classList.contains("nav-open"));
    });
  }

  if (nav) {
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setNav(false));
    });
  }

  if (navBackdrop) {
    navBackdrop.addEventListener("click", () => setNav(false));
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && body.classList.contains("nav-open")) {
      setNav(false);
    }
  });

  const desktopQuery = window.matchMedia("(min-width: 1025px)");
  const handleDesktop = (event) => {
    if (event.matches) setNav(false);
  };

  if (typeof desktopQuery.addEventListener === "function") {
    desktopQuery.addEventListener("change", handleDesktop);
  } else if (typeof desktopQuery.addListener === "function") {
    desktopQuery.addListener(handleDesktop);
  }

  /* ---------- Header + back to top ---------- */

  const onScroll = () => {
    if (header) {
      header.classList.toggle("is-scrolled", window.scrollY > 18);
    }
    if (toTop) {
      toTop.classList.toggle("is-visible", window.scrollY > 720);
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- Reveal on scroll ---------- */

  const revealItems = document.querySelectorAll(".reveal");
  const revealNow = (element) => element.classList.add("is-visible");

  if (!reduceMotion && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            revealNow(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
    );
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach(revealNow);
  }

  /* ---------- Animated counters ---------- */

  const counters = document.querySelectorAll("[data-count]");
  const formatNumber = (value) => value.toLocaleString("en-US");

  const runCounter = (element) => {
    const target = Number(element.dataset.count);
    const suffix = element.dataset.suffix || "";
    if (!Number.isFinite(target)) return;

    if (reduceMotion) {
      element.textContent = formatNumber(target) + suffix;
      return;
    }

    const duration = 1500;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);
      element.textContent = formatNumber(current) + suffix;
      if (progress < 1) window.requestAnimationFrame(tick);
    };

    window.requestAnimationFrame(tick);
  };

  if (counters.length) {
    if (!reduceMotion && "IntersectionObserver" in window) {
      const counterObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              runCounter(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );
      counters.forEach((counter) => counterObserver.observe(counter));
    } else {
      counters.forEach(runCounter);
    }
  }

  /* ---------- Next Sunday service countdown ---------- */

  const countdown = document.querySelector("[data-service-countdown]");

  if (countdown) {
    const label = countdown.querySelector("[data-countdown-label]");
    const daysEl = countdown.querySelector("[data-countdown-days]");
    const hoursEl = countdown.querySelector("[data-countdown-hours]");
    const minutesEl = countdown.querySelector("[data-countdown-minutes]");
    const secondsEl = countdown.querySelector("[data-countdown-seconds]");
    const pad = (value) => String(value).padStart(2, "0");
    let countdownState = "waiting";

    const updateCountdown = () => {
      const now = new Date();
      const cat = new Date(
        now.toLocaleString("en-US", { timeZone: "Africa/Lusaka" })
      );

      const catDay = cat.getDay();
      const catHour = cat.getHours();
      const catMinute = cat.getMinutes();
      const isLive =
        catDay === 0 && (catHour > 7 || (catHour === 7 && catMinute >= 0)) && catHour < 14;

      if (isLive) {
        countdown.classList.add("is-live");
        if (label && countdownState !== "live") {
          label.textContent = "Happening now - you are welcome";
          countdownState = "live";
        }
        if (daysEl) daysEl.textContent = "00";
        if (hoursEl) hoursEl.textContent = "00";
        if (minutesEl) minutesEl.textContent = "00";
        if (secondsEl) secondsEl.textContent = "00";
        return;
      }

      countdown.classList.remove("is-live");
      if (label && countdownState !== "waiting") {
        label.textContent = "Next Sunday service in";
        countdownState = "waiting";
      }

      let daysAhead = (7 - catDay) % 7;
      if (daysAhead === 0 && (catHour > 14 || (catHour === 14 && catMinute > 0))) {
        daysAhead = 7;
      }

      const targetCat = new Date(
        cat.getFullYear(),
        cat.getMonth(),
        cat.getDate() + daysAhead,
        7,
        0,
        0,
        0
      );

      const targetUtc = Date.UTC(
        targetCat.getFullYear(),
        targetCat.getMonth(),
        targetCat.getDate(),
        5,
        0,
        0
      );

      let remaining = targetUtc - Date.now();
      if (remaining < 0) remaining += 7 * 24 * 60 * 60 * 1000;

      const totalSeconds = Math.floor(remaining / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      if (daysEl) daysEl.textContent = pad(days);
      if (hoursEl) hoursEl.textContent = pad(hours);
      if (minutesEl) minutesEl.textContent = pad(minutes);
      if (secondsEl) secondsEl.textContent = pad(seconds);
    };

    updateCountdown();
    window.setInterval(updateCountdown, 1000);
  }

  /* ---------- Sermon filters ---------- */

  const filterButtons = document.querySelectorAll("[data-filter]");
  const filterCards = document.querySelectorAll("[data-category]");
  const filterCount = document.querySelector("[data-filter-count]");

  if (filterButtons.length && filterCards.length) {
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.filter;

        filterButtons.forEach((item) => {
          const isActive = item === button;
          item.classList.toggle("is-active", isActive);
          item.setAttribute("aria-pressed", String(isActive));
        });

        let visible = 0;
        filterCards.forEach((card) => {
          const show = filter === "all" || card.dataset.category === filter;
          card.classList.toggle("is-hidden", !show);
          if (show) visible += 1;
        });

        if (filterCount) {
          filterCount.textContent =
            visible + (visible === 1 ? " message" : " messages");
        }
      });
    });
  }

  /* ---------- Gallery lightbox ---------- */

  const lightbox = document.getElementById("lightbox");
  const galleryTriggers = Array.from(document.querySelectorAll("[data-lightbox]"));

  if (lightbox && galleryTriggers.length) {
    const lightboxImage = lightbox.querySelector("[data-lightbox-image]");
    const lightboxCaption = lightbox.querySelector("[data-lightbox-caption]");
    const closeButton = lightbox.querySelector("[data-lightbox-close]");
    const prevButton = lightbox.querySelector("[data-lightbox-prev]");
    const nextButton = lightbox.querySelector("[data-lightbox-next]");
    let currentIndex = 0;
    let lastFocused = null;

    const items = galleryTriggers.map((trigger) => ({
      src: trigger.dataset.lightbox,
      caption: trigger.dataset.caption || "",
      alt:
        (trigger.querySelector("img") && trigger.querySelector("img").alt) ||
        trigger.dataset.caption ||
        "Shalom Embassy photo",
    }));

    const render = (index) => {
      currentIndex = (index + items.length) % items.length;
      const item = items[currentIndex];
      if (lightboxImage) {
        lightboxImage.src = item.src;
        lightboxImage.alt = item.alt;
      }
      if (lightboxCaption) lightboxCaption.textContent = item.caption;
    };

    const openLightbox = (index, trigger) => {
      lastFocused = trigger || document.activeElement;
      render(index);
      if (typeof lightbox.showModal === "function") {
        lightbox.showModal();
      } else {
        lightbox.setAttribute("open", "");
      }
      if (closeButton) closeButton.focus();
    };

    const closeLightbox = () => {
      if (typeof lightbox.close === "function" && lightbox.open) {
        lightbox.close();
      } else {
        lightbox.removeAttribute("open");
      }
      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
      }
    };

    galleryTriggers.forEach((trigger, index) => {
      trigger.addEventListener("click", () => openLightbox(index, trigger));
    });

    if (closeButton) closeButton.addEventListener("click", closeLightbox);
    if (prevButton) {
      prevButton.addEventListener("click", () => render(currentIndex - 1));
    }
    if (nextButton) {
      nextButton.addEventListener("click", () => render(currentIndex + 1));
    }

    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });

    lightbox.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        render(currentIndex - 1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        render(currentIndex + 1);
      }
    });
  }

  /* ---------- WhatsApp contact forms ---------- */

  document.querySelectorAll("[data-wa-form]").forEach((form) => {
    const status = form.querySelector("[data-form-status]");
    const number = form.dataset.waNumber || "260974807770";

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (typeof form.reportValidity === "function" && !form.reportValidity()) {
        return;
      }

      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const contact = String(data.get("contact") || "").trim();
      const subject = String(data.get("subject") || "General enquiry").trim();
      const message = String(data.get("message") || "").trim();

      const text = [
        "Hello Shalom Embassy Ministries International,",
        "",
        "Name: " + name,
        "Contact: " + contact,
        "Subject: " + subject,
        "",
        message,
        "",
        "Sent from the Shalom Embassy website.",
      ].join("\n");

      const url =
        "https://wa.me/" + number + "?text=" + encodeURIComponent(text);
      const popup = window.open(url, "_blank", "noopener,noreferrer");

      if (status) {
        status.hidden = false;
        status.innerHTML =
          "WhatsApp should open with your message ready to send. " +
          '<a href="' +
          url +
          '" target="_blank" rel="noopener noreferrer">Open WhatsApp here</a> ' +
          "if it does not.";
      }

      if (!popup) {
        if (status) {
          status.innerHTML =
            "Your browser blocked the new window. " +
            '<a href="' +
            url +
            '" target="_blank" rel="noopener noreferrer">Tap here to open WhatsApp</a>.';
        }
      }
    });

    form.addEventListener("input", () => {
      if (status) status.hidden = true;
    });
  });

  /* ---------- Current year ---------- */

  document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });
})();


/* Translation maps load on demand from assets/js/i18n/<language>.js. */

/*
 * Shalom Embassy localization engine.
 *
 * Architecture mirrors the Royal Priesthood site:
 * - complete phrase maps per language, loaded locally
 * - DOM text-node + attribute replacement
 * - localStorage preference and html[lang]
 * - no Google/third-party translation widget
 */
(function () {
  "use strict";

  var STORAGE_KEY = "shalom.lang";

  var LANGUAGES = [
    { code: "bem", name: "Bemba", htmlLang: "bem", group: "zambian" },
    { code: "nya", name: "Nyanja", htmlLang: "ny", group: "zambian" },
    { code: "toi", name: "Tonga", htmlLang: "toi", group: "zambian" },
    { code: "loz", name: "Lozi", htmlLang: "loz", group: "zambian" },
    { code: "tum", name: "Tumbuka", htmlLang: "tum", group: "zambian" },
    { code: "en", name: "English", htmlLang: "en", group: "world" },
    { code: "hi", name: "Hindi", htmlLang: "hi", group: "world" },
    { code: "fr", name: "French", htmlLang: "fr", group: "world" },
    { code: "de", name: "German", htmlLang: "de", group: "world" },
    { code: "it", name: "Italian", htmlLang: "it", group: "world" },
    { code: "pt", name: "Portuguese", htmlLang: "pt", group: "world" },
    { code: "ru", name: "Russian", htmlLang: "ru", group: "world" },
    { code: "es", name: "Spanish", htmlLang: "es", group: "world" }
  ];

  var byCode = {};
  LANGUAGES.forEach(function (language) {
    byCode[language.code] = language;
  });

  function tableFor(lang) {
    var table = {};
    var base = (window.SHALOM_BASE_TEXT || {})[lang] || {};
    var supplement = (window.SHALOM_TEXT || {})[lang] || {};
    Object.keys(supplement).forEach(function (key) {
      table[key] = supplement[key];
    });
    Object.keys(base).forEach(function (key) {
      table[key] = base[key];
    });
    return table;
  }

  function translateUI(lang, key, fallback) {
    if (lang === "en") return fallback;
    var table = tableFor(lang);
    return table[fallback] || fallback;
  }

  function readStored() {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }

  function store(lang) {
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch (error) {
      /* private mode */
    }
  }

  var SKIP_SELECTOR = [
    "script",
    "style",
    "noscript",
    "textarea",
    "select",
    "option",
    "svg",
    ".lang-switcher",
    ".brand",
    ".nav-toggle",
    "[translate='no']",
    ".notranslate",
    ".countdown",
    ".tns-liveregion"
  ].join(",");

  var originalNodes = new Map();
  var originalAttrs = new Map();
  var currentLanguage = "en";

  function hasText(value) {
    return /[A-Za-z\u00C0-\u024F\u0400-\u04FF\u0900-\u097F]/.test(value || "");
  }

  function trimEdges(value) {
    var leading = (value.match(/^\s*/) || [""])[0];
    var trailing = (value.match(/\s*$/) || [""])[0];
    var text = value.slice(leading.length, value.length - trailing.length);
    return {
      leading: leading,
      trailing: trailing,
      text: text.replace(/\s+/g, " ")
    };
  }

  function collectSources() {
    var items = [];
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!hasText(node.nodeValue)) return NodeFilter.FILTER_REJECT;
        var parent = node.parentElement;
        if (!parent || parent.closest(SKIP_SELECTOR)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    var node;
    while ((node = walker.nextNode())) {
      if (!originalNodes.has(node)) originalNodes.set(node, node.nodeValue);
      items.push({ node: node, source: originalNodes.get(node) });
    }

    document.querySelectorAll("[placeholder], [title], [aria-label]").forEach(function (element) {
      if (element.closest(SKIP_SELECTOR)) return;
      var saved = originalAttrs.get(element) || {};
      ["placeholder", "title", "aria-label"].forEach(function (attribute) {
        if (!element.hasAttribute(attribute)) return;
        if (!(attribute in saved)) saved[attribute] = element.getAttribute(attribute);
        if (hasText(saved[attribute])) {
          items.push({ element: element, attribute: attribute, source: saved[attribute] });
        }
      });
      originalAttrs.set(element, saved);
    });

    return items;
  }

  function restoreOriginal() {
    originalNodes.forEach(function (value, node) {
      if (node.isConnected) node.nodeValue = value;
    });
    originalAttrs.forEach(function (saved, element) {
      if (!element.isConnected) return;
      Object.keys(saved).forEach(function (attribute) {
        element.setAttribute(attribute, saved[attribute]);
      });
    });
    originalNodes = new Map();
    originalAttrs = new Map();
  }

  function applyLocalPage(lang) {
    var table = tableFor(lang);
    collectSources().forEach(function (item) {
      var current = item.node
        ? item.node.nodeValue
        : item.element.getAttribute(item.attribute);
      if (!current) return;

      var currentEdge = trimEdges(current);
      var sourceEdge = trimEdges(item.source);
      if (!currentEdge.text) return;

      var translated = table[sourceEdge.text];
      if (!translated) return;

      var value = currentEdge.leading + translated + currentEdge.trailing;
      if (item.node) {
        if (item.node.nodeValue !== value) item.node.nodeValue = value;
      } else if (item.element.getAttribute(item.attribute) !== value) {
        item.element.setAttribute(item.attribute, value);
      }
    });
  }

  function updateSwitcher(lang) {
    var language = byCode[lang] || byCode.en;
    document.querySelectorAll("[data-lang]").forEach(function (option) {
      option.setAttribute("aria-selected", option.getAttribute("data-lang") === lang ? "true" : "false");
    });
    var current = document.querySelector("[data-lang-current]");
    if (current) current.textContent = language.name;
    var toggle = document.querySelector("[data-lang-toggle]");
    if (toggle) {
      toggle.setAttribute(
        "aria-label",
        translateUI(lang, "lang.select", "Select language") + ": " + language.name
      );
    }
    var menu = document.querySelector("[data-lang-menu]");
    if (menu) menu.setAttribute("aria-label", translateUI(lang, "lang.select", "Select language"));
  }

  function apply(lang) {
    if (!byCode[lang]) lang = "en";
    currentLanguage = lang;
    document.documentElement.setAttribute("lang", byCode[lang].htmlLang);
    stopObserver();
    restoreOriginal();
    updateSwitcher(lang);

    if (lang !== "en") {
      applyLocalPage(lang);
    }
    startObserver(lang);
  }

  /* Dynamic content (feed cards, menus) is picked up after it is inserted. */
  var observer = null;
  var observedLanguage = null;

  function stopObserver() {
    if (observer) observer.disconnect();
    observer = null;
    observedLanguage = null;
  }

  function startObserver(lang) {
    if (lang === "en" || !window.MutationObserver) return;
    observedLanguage = lang;
    observer = new MutationObserver(function () {
      if (currentLanguage === observedLanguage) applyLocalPage(observedLanguage);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  var translationPromises = {};
  var requestedLanguage = "en";

  function hasLanguage(lang) {
    return !!(window.SHALOM_BASE_TEXT && window.SHALOM_BASE_TEXT[lang]);
  }

  function loadTranslations(lang) {
    if (hasLanguage(lang)) return Promise.resolve();
    if (translationPromises[lang]) return translationPromises[lang];
    translationPromises[lang] = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = "assets/js/i18n/" + lang + ".js";
      script.async = true;
      script.onload = function () { resolve(); };
      script.onerror = function () {
        delete translationPromises[lang];
        reject(new Error("Unable to load translations"));
      };
      document.head.appendChild(script);
    });
    return translationPromises[lang];
  }

  function applyLanguage(lang) {
    var code = byCode[lang] ? lang : "en";
    requestedLanguage = code;
    if (code === "en") {
      apply("en");
      return;
    }
    loadTranslations(code)
      .then(function () {
        if (requestedLanguage === code) apply(code);
      })
      .catch(function () {
        if (requestedLanguage === code) apply("en");
      });
  }

  function closeMenu() {
    var switcher = document.querySelector("[data-lang-switcher]");
    var toggle = document.querySelector("[data-lang-toggle]");
    var menu = document.querySelector("[data-lang-menu]");
    if (!switcher || !toggle || !menu) return;
    menu.hidden = true;
    switcher.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  function openMenu() {
    var switcher = document.querySelector("[data-lang-switcher]");
    var toggle = document.querySelector("[data-lang-toggle]");
    var menu = document.querySelector("[data-lang-menu]");
    if (!switcher || !toggle || !menu) return;
    menu.hidden = false;
    switcher.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    var header = document.querySelector(".site-header");
    if (header) {
      document.documentElement.style.setProperty(
        "--lang-menu-top",
        Math.max(0, Math.round(header.getBoundingClientRect().bottom + 8)) + "px"
      );
    }
    var selected = menu.querySelector("[aria-selected='true']");
    if (selected) selected.focus();
  }

  function setupSwitcher() {
    var switcher = document.querySelector("[data-lang-switcher]");
    var toggle = document.querySelector("[data-lang-toggle]");
    var menu = document.querySelector("[data-lang-menu]");
    if (!switcher || !toggle || !menu) return;

    toggle.addEventListener("click", function () {
      if (menu.hidden) openMenu();
      else closeMenu();
    });

    menu.addEventListener("click", function (event) {
      var option = event.target.closest("[data-lang]");
      if (!option) return;
      var lang = option.getAttribute("data-lang");
      store(lang);
      closeMenu();
      toggle.focus();
      applyLanguage(lang);
    });

    menu.addEventListener("keydown", function (event) {
      var options = Array.prototype.slice.call(menu.querySelectorAll("[data-lang]"));
      var index = options.indexOf(document.activeElement);
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        var step = event.key === "ArrowDown" ? 1 : -1;
        options[(index + step + options.length) % options.length].focus();
      }
      if (event.key === "Home") {
        event.preventDefault();
        options[0].focus();
      }
      if (event.key === "End") {
        event.preventDefault();
        options[options.length - 1].focus();
      }
    });

    document.addEventListener("click", function (event) {
      if (!switcher.contains(event.target)) closeMenu();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape" || menu.hidden) return;
      closeMenu();
      toggle.focus();
    });

    window.addEventListener("storage", function (event) {
      if (event.key === STORAGE_KEY && event.newValue) applyLanguage(event.newValue);
    });

    var stored = readStored();
    applyLanguage(byCode[stored] ? stored : "en");
  }

  setupSwitcher();
})();
