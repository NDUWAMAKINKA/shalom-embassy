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

  var BASE_TEXT = window.SHALOM_BASE_TEXT || {};
  var SUPPLEMENT_TEXT = window.SHALOM_TEXT || {};

  function tableFor(lang) {
    var table = {};
    var base = BASE_TEXT[lang] || {};
    var supplement = SUPPLEMENT_TEXT[lang] || {};
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
      apply(lang);
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
      if (event.key === STORAGE_KEY && event.newValue) apply(event.newValue);
    });

    var stored = readStored();
    apply(byCode[stored] ? stored : "en");
  }

  setupSwitcher();
})();
