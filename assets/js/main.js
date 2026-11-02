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
        if (label) label.textContent = "Happening now — you are welcome";
        if (daysEl) daysEl.textContent = "00";
        if (hoursEl) hoursEl.textContent = "00";
        if (minutesEl) minutesEl.textContent = "00";
        if (secondsEl) secondsEl.textContent = "00";
        return;
      }

      countdown.classList.remove("is-live");
      if (label) label.textContent = "Next Sunday service in";

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

  /* ---------- Zambian languages ---------- */

  const LANGUAGES = {
    bemba: {
      name: "Bemba",
      endonym: "Ichibemba",
      greeting: "Muli shani?",
      meaning: "Hello — how are you?",
      thanks: "Natotela",
      region: "Northern, Luapula, Muchinga & Copperbelt",
      speakers: "Approx. 4.5 million speakers",
      lang: "bem",
    },
    nyanja: {
      name: "Nyanja",
      endonym: "Chinyanja",
      greeting: "Moni",
      meaning: "Hello",
      thanks: "Zikomo",
      region: "Lusaka, Eastern & Central provinces",
      speakers: "Approx. 3.5 million speakers",
      lang: "ny",
    },
    tonga: {
      name: "Tonga",
      endonym: "Chitonga",
      greeting: "Muli buti?",
      meaning: "Hello — how are you?",
      thanks: "Twalumba",
      region: "Southern Province & parts of Lusaka",
      speakers: "Approx. 2.5 million speakers",
      lang: "toi",
    },
    lozi: {
      name: "Lozi",
      endonym: "Silozi",
      greeting: "Mutozi chwani?",
      meaning: "Hello — how are you?",
      thanks: "Luitumezi",
      region: "Western Province (Barotseland)",
      speakers: "Approx. 1.2 million speakers",
      lang: "loz",
    },
    kaonde: {
      name: "Kaonde",
      endonym: "Kikaonde",
      greeting: "Muji byepi?",
      meaning: "Hello — how are you?",
      thanks: "Nasanta",
      region: "North-Western Province",
      speakers: "Approx. 0.8 million speakers",
      lang: "kqn",
    },
  };

  const languagePicker = document.getElementById("language-picker");
  const languageToast = document.getElementById("language-toast");
  const languageTabs = Array.from(document.querySelectorAll("[data-language-tab]"));
  const languageSelectButtons = document.querySelectorAll("[data-language-select]");
  const languageTabList = document.querySelector("[data-language-tabs]");
  const languagePanel = document.getElementById("language-panel");
  let currentLanguageKey = "bemba";
  let languageToastTimer = null;

  const setLanguageText = (selector, value) => {
    document.querySelectorAll(selector).forEach((element) => {
      element.textContent = value;
    });
  };

  const activateLanguage = (key, options = {}) => {
    const data = LANGUAGES[key];
    if (!data) return;
    currentLanguageKey = key;

    setLanguageText("[data-language-name]", data.name);
    setLanguageText("[data-language-endonym]", data.endonym);
    setLanguageText("[data-language-meaning]", data.meaning);
    setLanguageText("[data-language-region]", data.region);
    setLanguageText("[data-language-speakers]", data.speakers);

    const greeting = document.querySelector("[data-language-greeting]");
    if (greeting) {
      greeting.textContent = data.greeting;
      greeting.setAttribute("lang", data.lang);
    }

    const thanks = document.querySelector("[data-language-thanks]");
    if (thanks) {
      thanks.textContent = data.thanks;
      thanks.setAttribute("lang", data.lang);
    }

    const readMore = document.querySelector("[data-language-readmore]");
    if (readMore) {
      readMore.href = "#" + key;
    }

    languageTabs.forEach((tab) => {
      const isActive = tab.dataset.languageTab === key;
      tab.setAttribute("aria-selected", String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
      if (isActive && languagePanel) {
        languagePanel.setAttribute("aria-labelledby", tab.id);
      }
    });

    document.querySelectorAll(".language-card").forEach((card) => {
      card.classList.toggle("is-active", card.id === key);
    });

    languageSelectButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.languageSelect === key);
    });

    if (options.store) {
      try {
        window.localStorage.setItem("shalom-language", key);
      } catch (error) {
        /* storage can be unavailable in private browsing */
      }
    }

    if (options.focusTab) {
      const activeTab = languageTabs.find((tab) => tab.dataset.languageTab === key);
      if (activeTab) activeTab.focus();
    }
  };

  const showLanguageToast = (key) => {
    if (!languageToast) return;
    const data = LANGUAGES[key];
    if (!data) return;

    const greeting = languageToast.querySelector("[data-language-toast-greeting]");
    const name = languageToast.querySelector("[data-language-toast-name]");
    const link = languageToast.querySelector("[data-language-toast-link]");

    if (greeting) {
      greeting.textContent = data.greeting;
      greeting.setAttribute("lang", data.lang);
    }
    if (name) name.textContent = "Welcome in " + data.name;
    if (link) link.href = "languages.html#" + key;

    languageToast.hidden = false;
    window.clearTimeout(languageToastTimer);
    languageToastTimer = window.setTimeout(() => {
      languageToast.hidden = true;
    }, 6500);
  };

  languageSelectButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.languageSelect;
      activateLanguage(key, { store: true });
      showLanguageToast(key);
      if (languagePicker) languagePicker.open = false;
    });
  });

  languageTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activateLanguage(tab.dataset.languageTab, { store: true });
    });
  });

  if (languageTabList && languageTabs.length) {
    languageTabList.addEventListener("keydown", (event) => {
      const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
      if (!keys.includes(event.key)) return;
      event.preventDefault();

      const currentIndex = languageTabs.indexOf(document.activeElement);
      let nextIndex = currentIndex;

      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = languageTabs.length - 1;
      if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % languageTabs.length;
      if (event.key === "ArrowLeft") {
        nextIndex = (currentIndex - 1 + languageTabs.length) % languageTabs.length;
      }

      const nextTab = languageTabs[nextIndex];
      if (nextTab) {
        activateLanguage(nextTab.dataset.languageTab, { store: true, focusTab: true });
      }
    });
  }

  const copyGreetingButton = document.querySelector("[data-copy-greeting]");
  if (copyGreetingButton) {
    copyGreetingButton.addEventListener("click", async () => {
      const data = LANGUAGES[currentLanguageKey];
      if (!data) return;
      const text = data.greeting + " — " + data.meaning + " (" + data.name + ")";
      const originalMarkup = copyGreetingButton.innerHTML;

      try {
        await navigator.clipboard.writeText(text);
        copyGreetingButton.textContent = "Copied!";
      } catch (error) {
        copyGreetingButton.textContent = "Select and copy";
      }

      window.setTimeout(() => {
        copyGreetingButton.innerHTML = originalMarkup;
      }, 2200);
    });
  }

  if (languageToast) {
    const closeToast = languageToast.querySelector("[data-language-toast-close]");
    if (closeToast) {
      closeToast.addEventListener("click", () => {
        languageToast.hidden = true;
        window.clearTimeout(languageToastTimer);
      });
    }
  }

  if (languagePicker) {
    document.addEventListener("click", (event) => {
      if (languagePicker.open && !languagePicker.contains(event.target)) {
        languagePicker.open = false;
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && languagePicker.open) {
        languagePicker.open = false;
        const summary = languagePicker.querySelector("summary");
        if (summary) summary.focus();
      }
    });

    languagePicker.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        languagePicker.open = false;
      });
    });
  }

  let savedLanguage = null;
  try {
    savedLanguage = window.localStorage.getItem("shalom-language");
  } catch (error) {
    savedLanguage = null;
  }

  const hashLanguage = window.location.hash.replace("#", "");
  const initialLanguage = LANGUAGES[hashLanguage]
    ? hashLanguage
    : LANGUAGES[savedLanguage]
      ? savedLanguage
      : "bemba";

  activateLanguage(initialLanguage, { store: false });

  /* ---------- Current year ---------- */

  document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });
})();
