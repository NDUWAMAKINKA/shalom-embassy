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


/* Localization maps and engine */
/*
 * Royal Priesthood Assemblies International
 * Complete offline translation maps for every language in the switcher.
 * All strings are pre-generated and embedded here. The website never calls
 * an external translation service at runtime, so switching is immediate
 * and works on a slow or offline mobile connection.
 *
 * Tonga and Lozi were reviewed and supplied with local-language help.
 * The remaining maps were pre-translated and checked for the site context.
 */
window.SHALOM_BASE_TEXT = {"bem":{"(The Pillars)":"(Imipeto)","09:00 AM CAT":"09:00 AM CAT","A Christian church in Lusaka, Zambia, growing together through worship, the Word, and service to our neighbours.":"Icilonganino ca Bwina Kristu mu Lusaka, Zambia, ukukula pamo ukupitila mu kupepa, Ishiwi, nokubombela abena mupalamano besu.","A church built on prayer and fellowship":"Icalici ilyakuulwa pa mapepo no kulanshanya .","A community strengthened by hope":"Icilonganino icakoseleshiwa ne subilo .","A fresh reading from Rhapsody of Realities each day.":"Ukubelenga ukupya ukufuma kuli Rhapsody of Realities cila bushiku.","A people of faith, growing together":"Abantu ba citetekelo, abakula pamo .","A place of love where everyone counts":"Icifulo ca kutemwa umo umuntu onse apendelwa .","A place of love where everyone counts.":"Icifulo ca kutemwa uko umuntu onse apendelwa.","A place to belong and to grow":"Icifulo ca kubamo no kukulilamo .","A vibrant community where young believers can discover their God-given identity, talents, and career callings.":"Icilonganino ica mweo umo abasumina abapungwe bengasanga ubunte bwabo ubwapeelwa kuli Lesa, amano, ne kwitwa kwa ncito.","AIRTEL MOBILE MONEY":"AIRTEL MOBILE MONEY","About":"Pa lwa","About us":"Pa lwa ifwe","Absa":"Absa","Absa Bank":"Absa Bank","Absa Bank Zambia":"Absa Bank Zambia","Account name":"Ishina lya akaunti","Account number":"Namba ya akaunti","Airtel Mobile Money":"Airtel Mobile Money","Along Ndeke Road, Lusaka, Zambia":"Mu musebo wa Ndeke, mu Lusaka, mu Zambia","Announcements":"Ifyakubilisha","Apostle Dr. Mighty Zunga":"Apostle Dr. Mighty Zunga","Apostle Dr. Mighty Zunga in worship":"Apostle Dr. Mighty Zunga mu kupepa","Apostle Dr. Mighty Zunga is the Founder and General Overseer of Royal Priesthood Assemblies International in Lusaka, Zambia. His ministry is expressed through preaching, prayer, discipleship, and the leadership of the church community. He encourages believers to grow in their understanding of Scripture and to put their faith into practice through service.":"Apostle Dr. Mighty Zunga ni Katendeke kabili Kacema Mukalamba uwa Royal Priesthood Assemblies International mu Lusaka, Zambia. Umulimo wakwe ulalangishiwa ukupitila mu kubilisha, ipepo, ubusambi, no kutungulula umutundu wa cilonganino. Acincisha abasumina ukukula mu kumfwikisha kwabo ukwa Malembo no kubika icitetekelo cabo mu mulimo ukupitila mu mulimo.","As a royal priesthood, we worship God with our whole lives. As disciples, we follow Jesus and help others follow Him, sharing His truth with humility and living it with compassion at home, in the church, and throughout our community.":"Nga bushimapepo bwa bufumu, tulapepa Lesa no mweo wesu onse. Nga basambi, tulakonka Yesu no kwafwa bambi ukumukonka, ukushimikila icine cakwe no kuicefya no kwikala muli ci no luse pa ng’anda, mu calici, na mu cifulo cesu conse.","Ask about a fellowship":"Busheni pa lwa bucibusa","Ask about a ride":"Busheni pa lwa kukwela","Ask on WhatsApp":"Busheni pa WhatsApp","Audio":"Amashiwi","Back to slideshow":"Ukubwelela ku kulanga ifikope","Branches & Transport":"Amatabi & Ifyakutwala","Call":"Ita","Call +260 767 716 936":"Itani 260 767 716 936","Centre":"Pakati","Choose one":"Salenipo cimo","Choose the next step that feels right for you. Your message will be prepared in your email app for you to review and send.":"Saleni inshila imbi iyo muleumfwa ukuti yalilinga kuli imwe. Imbila yenu ikapekanishiwa mu app yenu iya email pakuti mwingapitulukamo no kutuma.","Church Services":"Imilimo ya Cikolwe","Church updates":"Ifyakubwekeshapo ifya cilonganino","Close menu":"Isaleni menyu","Connect with RPAI":"Ukuminkanya na RPAI","Connect with a local fellowship for biblical discussion and mutual support.":"Kulanshanyeni ne cibusa ca mu ncende yenu pa kulanshanya kwa cipingo no kwafwilishanya.","Contact":"Ukulanshanya","Contact the church":"Ukulanshanya ne calici","Contact the church to ask about current Sunday transport availability, pickup points, and arrangements.":"Landa ne calici pa kwipusha pa lwa kusangwa kwa fya kutwala ifya pa Mulungu pali ino nshita, ififulo fya kusendamamo, na mapekanyo.","Daily Devotional":"Ukupepa kwa cila bushiku","Daily message":"Imbila ya cila bushiku","Email Address":"Akeyala ka Imelo","Email the church":"Tumina imelo ku calici","Empowering and equipping men to take their place of leadership in family, career, and church through focused fellowship and growth sessions, including the Online Royal Men’s Summit.":"Ukupeela amaka no kupanga abaume ukupoka icifulo cabo ica butungulushi mu lupwa, incito, ne calici ukupitila mu kulanshanya ukwabikwako amano no kukula, ukubikapo no Kulongana kwa Baume ukwa Bufumu ukwa pa Intaneti.","Every ministry here opens room for worship, prayer, biblical learning, fellowship, and practical service in our community.":"Ubutumikishi bonse pano bulaisula icifulo ca kupepa, ipepo, ukusambilila baibolo, ukulongana, no mulimo wa kubomba mu cifulo cesu.","Explore our ministries":"Ukufwailisha imilimo yesu","FNB":"FNB","FNB Zambia":"FNB Zambia","Facebook only shows its posts to people who are signed in to Facebook, so the live feed below stays blank for many visitors. The button above always works.":"Facebook ilangishafye ifilembo fyaiko ku bantu abailembelwe pa Facebook, kanshi ifyakulya ifili pesamba filaba ifyabula nangu cimo ku benshi abengi. Batani ili pa muulu lyonse lilabomba.","Faith in word and action":"Ukucetekela mu mashiwi na mu milimo .","Faith lived together":"Icitetekelo caleikala pamo .","Fellowship":"Ubwampano","Fellowship locations":"Ififulo fya bucibusa","Find a Home Cell":"Ufwaye Incende ya pa Ng'anda","Find a church community":"Fwayeni umutundu wa cilonganino","Find a fellowship":"Ukusanga ubucibusa","Find the Sunday gathering location and contact the church about transport and fellowship locations.":"Fwayeni icifulo ca kulonganinapo pa Mulungu no kulanshanya ne calici pa lwa fifulo fya kutwalamo ne fya kulanshanya.","Find your place among our ministries.":"Fwayeni icifulo cenu pa kati ka milimo yesu.","First National Bank":"First National Bank","Follow the church for updates, photos and notices":"Konkeni icalici pakuti mumone ifyakukonkapo, ifikope ne fishibisho","Follow us":"Tukonkeni","For help with any of these details, contact the church office.":"Pa kwafwilishiwa pali ifi fyonse, lanshanyeni ne ofeshi lya calici.","Full Name":"Ishina lyonse","Gallery":"Icikuulwa","Gallery & Media":"Icikuulwa ne fyakushimikila","General Overseer & Founder":"Kacema Mukalamba & Katendeke","General Overseer and Founder":"Kacema Mukalamba kabili Katendeke","Give":"Ukupeela","Give directly to any of our Zambian bank accounts. Please use your name as the reference so the church can acknowledge your gift.":"Peela ukwabula ukupita mu mbali kuli akaunti yesu iya banki iya ku Zambia. Mukwai bomfyeni ishina lyenu nge cilangililo pakuti icalici lisumine ubupe bwenu.","Give via PayPal":"Ukupeela ukupitila muli PayPal","Giving details":"Ukupeela ifyebo fyonse","Giving from outside Zambia? Use our only international gateway, PayPal.":"Bushe mulepeela ukufuma kunse ya Zambia? Bomfyeni umulyango wesu fye uwa calo conse, PayPal.","God has not forgotten you. His mercies are new every morning.":"Lesa tamulubile. Inkumbu shakwe shipya cila bushiku ulucelo.","Grow in faith":"Ukukula mu citetekelo .","Grow with us in faith and fellowship":"Ukula pamo na ifwe mu citetekelo no bucibusa .","Growing in faith":"Ukukula mu citetekelo .","Hebrews 10:23":"Hebrews 10:23","Home":"Ing'anda","Home Cell & Branch Fellowships":"Ubwampano bwa pa Ng'anda na Musambo","How can Apostle Dr. Mighty Zunga and the RPAI Prayer Team stand in faith with you this week?":"Bushe Apostle Dr. Mighty Zunga na RPAI Ibumba lya Mapepo kuti baiminina shani mu citetekelo pamo na imwe muli uyu mulungu?","How can we connect?":"Bushe kuti twaumfwana shani?","I am looking for a church home":"Nalefwaya ing'anda ya calici","I want to join a local Cell group":"Nalefwaya ukwingila mwi bumba lya muncende","I want to receive salvation":"Nalefwaya ukupokelela ubupususho .","I'm New Here / Connect Card":"Nali Mupya Pano / Ukusuntinkanya Khadi","In Royal Priesthood, love is more than a kind word; it is the life of Christ made visible in the way we welcome, forgive, serve, and stand beside one another. We are called to carry each other's burdens and to make room for every person to grow in faith.":"Mu Bushimapepo bwa Bufumu, ukutemwa kwacila pa mashiwi ya cikuuku; ni mweo wa kwa Kristu uwalengelwe ukumoneka mu nshila tupokelela, ukwelela, ukubombela, no kwiminina pa mbali ya umo na umbi. Tuliitwa ukusenda imilandu ya umo na umbi no kupanga icifulo ku muntu onse ukukula mu citetekelo.","International giving":"Ukupeela kwa calo conse","I’m New Here / Connect Card":"Nali Mupya Apa / Khadi lya Kusuntinkanya","John 13:34-35.":"John 13:34-35.","Join Us":"Ingila Ifwe","Join us every Sunday at 09:00 AM CAT at Otwa Events, Long Acres, Lusaka.":"Mukabe naifwe cila Sande pa 09:00 AM CAT ku Otwa Events, Long Acres, Lusaka.","Join us for Sunday Divine Service at 09:00 AM CAT at Otwa Events, Long Acres, along Ndeke Road in Lusaka.":"Mube na ifwe ku Mulimo wa Bumulungu uwa pa Mulungu pa 09:00 AM CAT pa Otwa Events, Long Acres, mupepi no musebo wa Ndeke mu Lusaka.","Join us in Lusaka":"Mukabe naifwe mu Lusaka","Join us this week":"Mukabe naifwe uno mulungu","Keep Your Faith":"Ukusunga Icitetekelo Cenu .","Keep faith through every season":"Ukusunga icitetekelo mu nshita yonse","Know more about us":"Ukwishiba ifingi pali ifwe","Latest announcements":"Ifyakubilisha ifya nombaline","Latest photos":"Ifikope ifipya","Let us pray for you. Share your needs and we will stand with you in faith and prayer.":"Natupepele kuli imwe. Ukwakanako ifyo ulefwaya kabili tukaiminina pamo na iwe mu citetekelo ne pepo.","Listen":"Ukukutika","Listen to music by LoveWorld Singers and Pastor Chris through licensed music services. Use each service's own purchase or download option where available.":"Ukukutika ku nyimbo sha bashimapepo ba mu calo ca kutemwa na Kacema Chris ukupitila mu milimo ya nyimbo iyasuminishiwa. Bomfyeni ukushita kwa mulimo umo umo nelyo ukukopolola nga ca kuti kuli.","Live Service":"Imilimo iya cine cine","Loading...":"Ukubika...","Local fellowships":"Ubwampano bwa muncende","Local gatherings, including groups meeting in areas such as Chalala, for biblical discussion, mutual support, and neighbourly care.":"Ukulongana kwa mu ncende, ukusanshako amabumba ayalongana mu fifulo pamo nga Chalala, ku kulanshanya kwa mu Baibolo, ukwafwilishanya, no kusakamana aba mupepi.","Love that forms disciples":"Ukutemwa ukwapanga abasambi .","LoveWorld Singers on Apple Music":"Abemba ba mu calo ca kutemwa pa nyimbo sha Apple","LoveWorld Singers on Spotify":"Abemba ba mu calo ca kutemwa pa Spotify","LoveWorld Singers on YouTube Music":"LoveWorld Singers pa YouTube Music","Lusaka Main Centre":"Lusaka Main Centre","MTN MOBILE MONEY":"MTN MOBILE MONEY","MTN Mobile Money":"MTN Mobile Money","Meet with us Wednesdays at 05:30 PM CAT for interactive fellowship, virtually and in cell locations.":"Ukukumana na ifwe pali Citatu pa 05:30 PM CAT ku kulanshanya kwa kulanshanya, mupepi na mu fifulo fya maselo.","Men":"Abaume","Mid-Week Fellowship":"Ubwampano bwa pakati ka mulungu","Mid-Week Interactive Fellowship":"Ubwampano bwa pakati ka mulungu","Ministries":"Imilimo","Ministries & Fellowships":"Imilimo & Ubwampano","Mobile Money":"Indalama sha pa foni","PayPal email":"Imeyili ya PayPal","Moments of worship, prayer, fellowship, and ministry from Royal Priesthood Assemblies International.":"Inshita sha kupepa, ipepo, ukulongana, no mulimo ukufuma ku Royal Priesthood Assemblies International.","Next photos":"Ifikope ifikonkelepo","Next steps":"Intampulo shakonkapo","NextGen Youth & Teen Ministry":"Ubutumikishi bwa Bapungwe na Bapungwe","Open directions in Google Maps":"Isuleni ubutungulushi mu mapu ya Google","Open menu":"Isuleni menyu","Open the church's Facebook page":"Isuleni ibuula lya Facebook ilya cilonganino","Otwa Events, Long Acres":"Otwa Events, Long Acres","Otwa Events, Long Acres, along Ndeke Road, Lusaka, Zambia":"Otwa Events, Long Acres, ukukonka umusebo wa Ndeke, mu Lusaka, mu Zambia","Our Founder":"Uwatutendeke","Our Services":"Imilimo yesu","Our ministries":"Imilimo yesu","Our ministries create opportunities for worship, prayer, biblical learning, fellowship, and practical service in the community.":"Imilimo yesu ilalenga ukuti kube inshita sha kupepa, ukupepa, ukusambilila ifya mu Baibolo, ukulongana, no kubomba umulimo wa kubomba mu cifulo.","Our mission":"Umulimo wesu","Our vision":"Icimonwa cesu","Pal":"Cibusa","Partner with us":"Ukubombela pamo na ifwe","Pastor Chris on Apple Music":"Umusambi Chris pa nyimbo sha Apple","Pastor Chris on Spotify":"Umusambi Chris pa Spotify","Pastor Chris on YouTube Music":"Umusambi Chris pa YouTube Music","Pastor Thelma welcome you to Royal Priesthood Assemblies International.":"Pastor Thelma twamupokelela ku Royal Priesthood Assemblies International.","Pause slideshow":"Lekeni ukulangisha","Pay":"Ukulipila","PayPal":"PayPal","Phone Number":"Namba ya foni","Photographs from worship gatherings and ministry moments. Select any photograph to view it larger.":"Ifikope ukufuma ku kulongana kwa kupepa ne nshita sha mulimo. Saleni icikope icili conse pakuti mumone icikulu.","Plan Your Visit":"Pekanishisheni Ukutandalila Kwenu","Plan your visit":"Mupekanye ukutandala kwenu","Play slideshow":"Tambani ifikope","Previous photos":"Ifikope ifyapita","Proverbs 3:9":"Proverbs 3:9","ROYAL PRIESTHOOD ASSEMBLIES INTERNATIONAL":"ROYAL PRIESTHOOD ASSEMBLIES INTERNATIONAL","ROYAL Priesthood Assemblies International":"ROYAL Priesthood Assemblies International","RPAI lists local home-cell and branch fellowships, including gatherings in Chalala. Contact the church for current meeting locations, schedules, and details about other branches.":"RPAI atantika ifilonganino fya mu ncende ya ŋanda ne filonganino fya musambo, ukusanshako ukulongana mu Chalala. Landa ne calici pa lwa fifulo fya kulonganinamo ifya nomba, inshita, ne fyo fishinka pa lwa misampi imbi.","Raising spiritual mothers, career women, and impactful leaders through local sisterhood fellowships and prayer clusters.":"Ukukusha banyina ba ku mupashi, abanakashi aba ncito, na ba ntungulushi abakwata amaka ukupitila mu bucibusa bwa bwananyina bwa mu ncende ne filonganino fya mapepo.","Read the complete daily devotional from the official Rhapsody of Realities reading page.":"Belengeni ukupepa kwa cila bushiku ukwakumanina ukufuma pe buula lya kubelenga ilyaishibikwa ilya Rhapsody of Realities.","Read today's devotional":"Belengeni ukupepa kwa lelo","Read today's message on the official Rhapsody of Realities site, and spend a few quiet minutes with God before the day begins.":"Belengeni imbila ya lelo pa ncende ya Rhapsody of Realities iyaishibikwa, kabili mube na maminiti ayanono aya mutelelwe na Lesa ilyo ubushiku bushilatendeka.","Recent public posts from the Royal Priesthood Assemblies International Facebook page.":"Ifyalembwa ifya nombaline ifya cintubwingi ukufuma pe buula lya Facebook.","Recordings":"Ukulembwa","Request a Prayer":"Lomba Ipepo","Rhapsody of Realities":"Rhapsody of Realities","Rooted in faith. United in fellowship.":"Ukushintilila pa citetekelo. Ukulongana mu cibusa.","Royal Men's Fellowship":"Ubwampano bwa baume ba bufumu","Royal Men’s Fellowship":"Ubwampano bwa baume ba bufumu","Royal Priesthood Assemblies International":"Royal Priesthood Assemblies International","Royal Priesthood Assemblies International can add direct audio downloads when it has the tracks and permission to distribute them.":"Royal Priesthood Assemblies International kuti yasanshako ukukopolola kwa mawi ukwalungatana nga ca kuti ili ne nyimbo no kusuminishiwa ukufisabankanya.","Royal Priesthood Assemblies International is a Christian church based in Lusaka, Zambia. Our church life is centred on worship, biblical teaching, prayer, fellowship, and service.":"Royal Priesthood Assemblies International ni calici lya cikristu ilyasangwa mu Lusaka, Zambia. Ubumi bwesu ubwa cilonganino bwashintilila pa kupepa, ukusambilisha kwa mu baibolo, ipepo, ukulongana, no kubombela.","Royal Priesthood Assemblies International is a church family in Lusaka, Zambia. We gather to worship, grow in faith, and serve our community.":"Royal Priesthood Assemblies International lupwa lwa cilonganino lumo mu Lusaka, Zambia. Tulongana ku kupepa, ukukula mu citetekelo, no kubombela abantu besu.","Royal Priesthood Assemblies International. All rights reserved.":"Royal Priesthood Assemblies International. Insambu shonse shalisungilwa.","Scripture:":"Amalembo:","Select language":"Saleni ululimi","Send Connect Card":"Tuma Khadi lya Kusuntinkanya","Send Prayer Request":"Tumani Ipepo lya Kulomba","Send a prayer request, plan your visit, or ask us anything.":"Tumani ipepo lya kulomba, pangani ukutandalila kwenu, nelyo ukutwipusha icili conse.","Send us your prayer request":"Tutumineni ilipusho lyenu ilya mapepo","Serve with care":"Ukubombela bwino","Service video":"Vidio ya mulimo","Share a Prayer Request":"Ukushimikila Ipepo lya Kulomba","Show all pictures":"Langisheni ifikope fyonse","Show slideshow":"Langisheni ifikope","Songs and downloads":"Inyimbo ne fyakukopolola","Songs from the church":"Inyimbo ukufuma ku calici .","Stanbic":"Icikopo","Stanbic Bank":"Stanbic Bank","Stanbic Bank Zambia":"Stanbic Bank Zambia","Standard Chartered":"Standard Chartered","Standard Chartered Zambia":"Standard Chartered Zambia","Stream live service":"Ukutambisha imilimo iya cine cine","Stream live service and find the latest worship and ministry videos from Royal Priesthood Assemblies International.":"Ukutambisha imilimo iya cine cine no kusanga amavidyo ya nomba line aya kupepa no mulimo ukufuma ku Royal Priesthood Assemblies International.","Sunday Divine Service":"Imilimo ya Bumulungu iya pa Mulungu","Sunday Transport & Branches":"Ukutwala pa Mulungu na Matabi","Sunday Worship":"Ukupepa kwa pa Mulungu","Sunday gallery":"Icikuulwa ca pa Mulungu","Sunday photos":"Ifikope fya pa Mulungu","Sunday service":"Imilimo ya pa Mulungu","Sunday service moves to 8am from 1 December.":"Imilimo ya pa Mulungu ilaya ku 8am ukufuma pa 1 Disemba.","Sunday transport":"Ukutwala pa Mulungu","Sunday worship":"Ukupepa kwa pa Mulungu","The ten newest photographs sent by the church":"Ifikope ikumi ifyapya ifyatumilwe ne calici .","To be confirmed":"Ukushininkishiwa","To proclaim the Gospel, encourage spiritual growth through Scripture and prayer, and serve our neighbours with compassion.":"Ukubilisha Imbila Nsuma, ukukoselesha ukukula kwa ku mupashi ukupitila mu Malembo ne pepo, no kubombela abena mupalamano besu ne nkumbu.","To see people and communities strengthened by the hope of Christ and equipped to live out their faith.":"Ukumona abantu ne filonganino fyakoseleshiwa ku subilo lya kwa Kristu no kupanga ifya kufwala ifya kwikala mu citetekelo cabo.","Today's podcast":"Ilyashi lya lelo","Today's reading":"Ukubelenga kwa lelo","Updates from Royal Priesthood Assemblies International.":"Ifyapya ukufuma ku Royal Priesthood Assemblies International.","Video":"Vidio","Virtual and cell locations":"Ififulo fya cine cine ne fya maselo","Virtuous Women’s Ministry":"Umulimo wa Banakashi Uwalinga","Watch":"Moneni","Watch a message from the ministry.":"Moneni ubukombe ukufuma ku mulimo wa kushimikila.","Ways to give":"Inshila sha kupeelamo .","We aim to serve our neighbours and community with care.":"Tulefwaya ukubombela abekala mupalamano besu no mushi no kusakamana.","We gather to honour God and make room for prayer, praise, and gratitude.":"Tulongana ku kucindika Lesa no kupanga icifulo ca kupepa, ukulumbanya, no kutasha.","We gather to honour God through prayer, praise, and gratitude.":"Tulongana ku kucindika Lesa ukupitila mu kupepa, ukulumbanya, no kutasha.","We seek to build a life of faith through Scripture, prayer, and encouragement.":"Tufwaya ukupanga ubumi bwa citetekelo ukupitila mu Malembo, ipepo, no kukoselesha.","We seek to create a welcoming community where people can learn Scripture, strengthen their faith, and serve others with compassion.":"Tulefwaya ukupanga umushi wa kupokelela abantu umo bengasambilila Amalembo, ukukosha icitetekelo cabo, no kubombela bambi ne nkumbu.","We seek to grow through Scripture, prayer, and encouragement.":"Tufwaya ukukula ukupitila mu Malembo, ipepo, no kukoselesha.","We value welcoming one another, sharing life, and serving our community with care.":"Tulacindika ukupokelelana, ukwakanyako bambi ubumi, no kubombela abantu mu cifulo cesu mu kusakamana.","We welcome one another and share life as a church family.":"Tulapokelelana no kwakanako ubumi ngo lupwa lwa cilonganino.","We would be glad to hear from you.":"Tukatemwa ukumfwa ukufuma kuli imwe.","Wednesdays at 05:30 PM CAT":"Pali Citatu pa 05:30 akasuba","We’re here to stand with you":"Tuli pano ku kwiminina naimwe","What matters to us":"Icacindama kuli ifwe .","Who we are":"Ni bani ifwe tuli","Who we are, and why we gather.":"Ni bani tuli, kabili mulandu nshi tulonganina.","Why Us":"Umulandu Ifwe","Women":"Abakashi","World languages":"Ifitundu fya calo conse","Worship":"Ukupepa","Worship and church life":"Ukupepa no mweo wa cilonganino .","Worship audio from Royal Priesthood Assemblies International.":"Ukupepa amashiwi ukufuma ku Royal Priesthood Assemblies International.","Worship music":"Inyimbo sha kupepa","You are welcome here":"Mwapokelelwa kuno","You matter to God, you matter to us.":"Mwalicindama kuli Lesa, muli abacindama kuli ifwe.","Your email app is opening with your message ready. Please review and send it to the church.":"Icibombelo cenu ica email cileisulwa ne mbila yenu iyaiteyanya. Mukwai pitulukeni no kutuma ku calici.","Your giving supports local outreach, building expansion, and the spread of the Gospel across Zambia.":"Ukupeela kwenu kulatungilila ukufikilisha kwa mu ncende, ukukuula, no kusabankanya Imbila Nsuma mu Zambia yonse.","Youth & teens":"Abapungwe na bapungwe","ZAMTEL MOBILE MONEY":"ZAMTEL MOBILE MONEY","Zambia National Commercial Bank":"Zambia National Commercial Bank","Zambian banks":"Amabanki yaku Zambia","Zambian languages":"Ifitundu fyaku Zambia","Zamtel Mobile Money":"Zamtel Mobile Money","Zanaco":"Zanaco","“Honor the Lord with your possessions, and with the firstfruits of all your increase.”":"“Cindikeni Shikulu ne fikwatwa fyenu, ne fisabo fya kubalilapo ifya fimenwa fyenu fyonse.”","“Let us hold unswervingly to the hope we profess, for he who promised is faithful.”":"“Lekeni tukakatile ukwabula ukutenkana ku subilo ilyo tusosa, pantu uwalaile ali uwa cishinka.”"},"nya":{"(The Pillars)":"(Mizati)","09:00 AM CAT":"09:00 AM CAT","A Christian church in Lusaka, Zambia, growing together through worship, the Word, and service to our neighbours.":"Mpingo wachikhristu ku Lusaka, Zambia, ukukulira limodzi kudzera mu kupembedza, Mawu, ndi kutumikira anzathu.","A church built on prayer and fellowship":"Mpingo womangidwa pa pemphero ndi chiyanjano","A community strengthened by hope":"Dera lolimbikitsidwa ndi chiyembekezo","A fresh reading from Rhapsody of Realities each day.":"Kuwerenga kwatsopano kuchokera ku Rhapsody of Realities tsiku lililonse.","A people of faith, growing together":"Anthu achikhulupiriro, akukulira limodzi","A place of love where everyone counts":"Malo achikondi omwe aliyense amawerengera","A place of love where everyone counts.":"Malo achikondi omwe aliyense amawerengera.","A place to belong and to grow":"Malo oti akhale ndi kukula","A vibrant community where young believers can discover their God-given identity, talents, and career callings.":"Dera lachisangalalo kumene okhulupirira achinyamata angapeze zomwe Mulungu wawapatsa, luso, ndi maitanidwe a ntchito.","AIRTEL MOBILE MONEY":"AIRTEL MOBILE MONEY","About":"Za","About us":"Za ife","Absa":"Absa","Absa Bank":"Absa Bank","Absa Bank Zambia":"Absa Bank Zambia","Account name":"Dzina laakaunti","Account number":"Nambala ya akaunti","Airtel Mobile Money":"Airtel Mobile Money","Along Ndeke Road, Lusaka, Zambia":"M'mbali mwa Msewu wa Ndeke, Lusaka, Zambia","Announcements":"Zolengeza","Apostle Dr. Mighty Zunga":"Apostle Dr. Mighty Zunga","Apostle Dr. Mighty Zunga in worship":"Apostle Dr. Mighty Zunga popembedza","Apostle Dr. Mighty Zunga is the Founder and General Overseer of Royal Priesthood Assemblies International in Lusaka, Zambia. His ministry is expressed through preaching, prayer, discipleship, and the leadership of the church community. He encourages believers to grow in their understanding of Scripture and to put their faith into practice through service.":"Apostle Dr. Mighty Zunga ndi Woyambitsa ndi Woyang’anira Wamkulu wa Royal Priesthood Assemblies International ku Lusaka, Zambia. Utumiki wake umaonekera kudzera mu kulalikira, pemphero, kuphunzitsa, ndi utsogoleri wa mpingo. Iye amalimbikitsa okhulupirira kukula m’kumvetsetsa kwawo Malemba ndi kuika chikhulupiriro chawo m’ntchito kudzera mu utumiki.","As a royal priesthood, we worship God with our whole lives. As disciples, we follow Jesus and help others follow Him, sharing His truth with humility and living it with compassion at home, in the church, and throughout our community.":"Monga ansembe achifumu, timalambira Mulungu ndi moyo wathu wonse. Monga ophunzira, timatsatira Yesu ndi kuthandiza ena kutsatira Iye, kuuza ena choonadi chake modzichepetsa ndi kukhala nacho mwachifundo kunyumba, mu mpingo, ndi m’dera lathu lonse.","Ask about a fellowship":"Funsani za chiyanjano","Ask about a ride":"Funsani za kukwera","Ask on WhatsApp":"Funsani pa WhatsApp","Audio":"Zomvera","Back to slideshow":"Bwererani ku chiwonetsero chazithunzi","Branches & Transport":"Nthambi ndi Mayendedwe","Call":"Imbani","Call +260 767 716 936":"Imbani +260 767 716 936","Centre":"Pakati","Choose one":"Sankhani imodzi","Choose the next step that feels right for you. Your message will be prepared in your email app for you to review and send.":"Sankhani sitepe yotsatira yomwe ikuwoneka yoyenera kwa inu. Uthenga wanu udzakonzedwa mu pulogalamu yanu ya imelo kuti muwunikenso ndi kutumiza.","Church Services":"Ntchito za Mpingo","Church updates":"Zosintha zakutchalitchi","Close menu":"Tsekani menyu","Connect with RPAI":"Gwirizanani ndi RPAI","Connect with a local fellowship for biblical discussion and mutual support.":"Lumikizanani ndi chiyanjano chapafupi kuti mukambirane za m'Baibulo ndi kuthandizana.","Contact":"Kulumikizana","Contact the church":"Lumikizanani ndi mpingo","Contact the church to ask about current Sunday transport availability, pickup points, and arrangements.":"Lumikizanani ndi tchalitchi kuti mufunse za kupezeka kwa mayendedwe a Lamlungu, malo onyamulira, ndi makonzedwe.","Daily Devotional":"Za tsiku ndi tsiku","Daily message":"Uthenga watsiku ndi tsiku","Email Address":"Imelo Adilesi","Email the church":"Tumizani imelo ku mpingo","Empowering and equipping men to take their place of leadership in family, career, and church through focused fellowship and growth sessions, including the Online Royal Men’s Summit.":"Kulimbikitsa ndi kuwapatsa amuna mphamvu kuti atenge malo awo a utsogoleri m'mabanja, ntchito, ndi tchalitchi kupyolera m'macheza ndi magawo a kukula, kuphatikizapo Msonkhano wa Amuna a Chifumu pa intaneti.","Every ministry here opens room for worship, prayer, biblical learning, fellowship, and practical service in our community.":"Utumiki uliwonse pano umatsegula malo a kupembedza, kupemphera, kuphunzira Baibulo, chiyanjano, ndi ntchito zothandiza mdera lathu.","Explore our ministries":"Onani mautumiki athu","FNB":"Mtengo wa FNB","FNB Zambia":"FNB Zambia","Facebook only shows its posts to people who are signed in to Facebook, so the live feed below stays blank for many visitors. The button above always works.":"Facebook imangowonetsa zolemba zake kwa anthu omwe adalowa nawo pa Facebook, kotero kuti chakudya chomwe chili pansipa chimakhala chopanda alendo kwa alendo ambiri. Batani pamwambapa limagwira ntchito nthawi zonse.","Faith in word and action":"Chikhulupiriro m’mawu ndi m’zochita","Faith lived together":"Chikhulupiriro chinakhala pamodzi","Fellowship":"Chiyanjano","Fellowship locations":"Malo a chiyanjano","Find a Home Cell":"Pezani Celo Yanyumba","Find a church community":"Pezani gulu la mpingo","Find a fellowship":"Pezani chiyanjano","Find the Sunday gathering location and contact the church about transport and fellowship locations.":"Pezani malo osonkhanira Lamlungu ndipo funsani tchalitchi za mayendedwe ndi malo ochezera.","Find your place among our ministries.":"Pezani malo anu pakati pa mautumiki athu.","First National Bank":"First National Bank","Follow the church for updates, photos and notices":"Tsatirani mpingo kuti mumve zosintha, zithunzi ndi zidziwitso","Follow us":"Titsatireni","For help with any of these details, contact the church office.":"Kuti mudziwe zambiri za izi, funsani ofesi ya tchalitchi.","Full Name":"Dzina Lathunthu","Gallery":"Galero","Gallery & Media":"Zithunzi ndi Makanema","General Overseer & Founder":"Woyang'anira Wamkulu & Woyambitsa","General Overseer and Founder":"Woyang’anira Wamkulu ndi Woyambitsa","Give":"Perekani","Give directly to any of our Zambian bank accounts. Please use your name as the reference so the church can acknowledge your gift.":"Perekani mwachindunji kumaakaunti athu aku banki aku Zambia. Chonde gwiritsani ntchito dzina lanu ngati kalozera kuti mpingo uvomereze mphatso yanu.","Give via PayPal":"Perekani kudzera PayPal","Giving details":"Kupereka tsatanetsatane","Giving from outside Zambia? Use our only international gateway, PayPal.":"Kupereka kuchokera kunja kwa Zambia? Gwiritsani ntchito zipata zathu zapadziko lonse lapansi, PayPal.","God has not forgotten you. His mercies are new every morning.":"Mulungu sanayiwale iwe. chifundo chake n'chatsopano m'mawa uliwonse.","Grow in faith":"Kulani m’cikhulupiriro","Grow with us in faith and fellowship":"Kulani nafe m’chikhulupiriro ndi m’chiyanjano","Growing in faith":"Kukula m’chikhulupiriro","Hebrews 10:23":"Hebrews 10:23","Home":"Kunyumba","Home Cell & Branch Fellowships":"Magulu a M'nyumba ndi a Nthambi","How can Apostle Dr. Mighty Zunga and the RPAI Prayer Team stand in faith with you this week?":"Kodi Apostle Dr. Mighty Zunga ndi RPAI Gulu la Mapemphero angaime bwanji mwachikhulupiriro nanu sabata ino?","How can we connect?":"Kodi tingagwirizane bwanji?","I am looking for a church home":"Ndikuyang'ana nyumba yakutchalitchi","I want to join a local Cell group":"Ndikufuna kujowina gulu la cell la m'dera","I want to receive salvation":"Ndikufuna kulandira chipulumutso","I'm New Here / Connect Card":"Ndine Watsopano Pano / Khadi la Kulumikizana","In Royal Priesthood, love is more than a kind word; it is the life of Christ made visible in the way we welcome, forgive, serve, and stand beside one another. We are called to carry each other's burdens and to make room for every person to grow in faith.":"Mu Unsembe Wachifumu, chikondi chimaposa mawu achifundo; ndi moyo wa Khristu wowonekera m'njira yomwe timalandirira, kukhululukira, kutumikira, ndi kuyimilira wina ndi mzake. Taitanidwa kunyamula zothodwetsa za wina ndi mzake ndi kupereka malo kuti munthu aliyense akule m’chikhulupiriro.","International giving":"Kupereka kwa mayiko","I’m New Here / Connect Card":"Ndine Watsopano Pano / Khadi la Kulumikizana","John 13:34-35.":"John 13:34-35.","Join Us":"Nafe","Join us every Sunday at 09:00 AM CAT at Otwa Events, Long Acres, Lusaka.":"Khalani nafe Lamlungu lililonse ku Otwa Events, Long Acres, Lusaka.","Join us for Sunday Divine Service at 09:00 AM CAT at Otwa Events, Long Acres, along Ndeke Road in Lusaka.":"Khalani nafe ku msonkhano wa Mulungu Lamlungu ku Otwa Events, Long Acres, mumsewu wa Ndeke ku Lusaka.","Join us in Lusaka":"Tibwere ku Lusaka","Join us this week":"Khalani nafe sabata ino","Keep Your Faith":"Sungani Chikhulupiriro Chanu","Keep faith through every season":"Sungani chikhulupiriro mu nyengo iliyonse","Know more about us":"Dziwani zambiri za ife","Latest announcements":"Zolengeza zaposachedwa","Latest photos":"Zithunzi zaposachedwa","Let us pray for you. Share your needs and we will stand with you in faith and prayer.":"Tiyeni ife tikupempherereni inu. Gawani zosowa zanu ndipo tidzayima nanu mchikhulupiriro ndi pemphero.","Listen":"Mvetserani","Listen to music by LoveWorld Singers and Pastor Chris through licensed music services. Use each service's own purchase or download option where available.":"Mverani nyimbo za LoveWorld Singers ndi Pastor Chris kudzera m'mayimba ovomerezeka. Gwiritsani ntchito kugula kwanu kapena kutsitsa komwe kulipo.","Live Service":"Ntchito ya Mwachindunji","Loading...":"Tikutsegula...","Local fellowships":"Mayanjano akumaloko","Local gatherings, including groups meeting in areas such as Chalala, for biblical discussion, mutual support, and neighbourly care.":"Misonkhano yapadela, kuphatikizapo magulu osonkhana m’madera monga Chalala, kukambirana za m’Baibulo, kuthandizana, ndi kusamalirana.","Love that forms disciples":"Chikondi chimene chimapanga ophunzira","LoveWorld Singers on Apple Music":"LoveWorld Singers pa Apple Music","LoveWorld Singers on Spotify":"LoveWorld Singers pa Spotify","LoveWorld Singers on YouTube Music":"LoveWorld Singers pa YouTube Music","Lusaka Main Centre":"Lusaka Main Centre","MTN MOBILE MONEY":"MTN MOBILE MONEY","MTN Mobile Money":"MTN Mobile Money","Meet with us Wednesdays at 05:30 PM CAT for interactive fellowship, virtually and in cell locations.":"Kumanani nafe Lachitatu nthawi ya 05:30 PM CAT pa macheza okambirana, pa intaneti komanso m'magulu a m'nyumba.","Men":"Amuna","Mid-Week Fellowship":"Chiyanjano chapakati pa Sabata","Mid-Week Interactive Fellowship":"Macheza a Pakati pa Sabata","Ministries":"Utumiki","Ministries & Fellowships":"Ntchito ndi Magulu","Mobile Money":"Ndalama za pa foni","PayPal email":"Imelo ya PayPal","Moments of worship, prayer, fellowship, and ministry from Royal Priesthood Assemblies International.":"Nthawi zakupembedza, pemphero, chiyanjano, ndi utumiki kuchokera ku Royal Priesthood Assemblies International.","Next photos":"Zithunzi zotsatirazi","Next steps":"Masitepe otsatira","NextGen Youth & Teen Ministry":"Ntchito ya M'badwo Wotsatira wa Achinyamata","Open directions in Google Maps":"Tsegulani mayendedwe mu Google Maps","Open menu":"Tsegulani menyu","Open the church's Facebook page":"Tsegulani tsamba la Facebook la mpingo","Otwa Events, Long Acres":"Otwa Events, Long Acres","Otwa Events, Long Acres, along Ndeke Road, Lusaka, Zambia":"Otwa Events, Long Acres, m'mbali mwa Msewu wa Ndeke, Lusaka, Zambia","Our Founder":"Woyambitsa Wathu","Our Services":"Ntchito Zathu","Our ministries":"Utumiki wathu","Our ministries create opportunities for worship, prayer, biblical learning, fellowship, and practical service in the community.":"Utumiki wathu umapanga mipata ya kupembedza, kupemphera, kuphunzira Baibulo, kuyanjana, ndi utumiki wothandiza m’dera.","Our mission":"Ntchito yathu","Our vision":"Masomphenya athu","Pal":"Pal","Partner with us":"Gwirizanani nafe","Pastor Chris on Apple Music":"M'busa Chris pa Apple Music","Pastor Chris on Spotify":"Pastor Chris pa Spotify","Pastor Chris on YouTube Music":"Pastor Chris pa YouTube Music","Pastor Thelma welcome you to Royal Priesthood Assemblies International.":"Pastor Thelma akukulandirani ku Royal Priesthood Assemblies International.","Pause slideshow":"Imitsani chiwonetsero chazithunzi","Pay":"Lipirani","PayPal":"PayPal","Phone Number":"Nambala Yafoni","Photographs from worship gatherings and ministry moments. Select any photograph to view it larger.":"Zithunzi zochokera ku misonkhano ya mapemphero ndi nthawi ya utumiki. Sankhani chithunzi chilichonse kuti muwone chokulirapo.","Plan Your Visit":"Konzani Ulendo Wanu","Plan your visit":"Konzani ulendo wanu","Play slideshow":"Sewerani chiwonetsero chazithunzi","Previous photos":"Zithunzi zam'mbuyo","Proverbs 3:9":"Proverbs 3:9","ROYAL PRIESTHOOD ASSEMBLIES INTERNATIONAL":"ROYAL PRIESTHOOD ASSEMBLIES INTERNATIONAL","ROYAL Priesthood Assemblies International":"ROYAL Priesthood Assemblies International","RPAI lists local home-cell and branch fellowships, including gatherings in Chalala. Contact the church for current meeting locations, schedules, and details about other branches.":"RPAI amandandalika maubale a kunyumba ndi nthambi, kuphatikizapo misonkhano ya Chalala. Lumikizanani ndi tchalitchi kuti mudziwe malo omwe mudzakumane nawo, ndandanda, ndi zambiri za nthambi zina.","Raising spiritual mothers, career women, and impactful leaders through local sisterhood fellowships and prayer clusters.":"Kulera amayi auzimu, akazi pa ntchito, ndi atsogoleri okhudzidwa kudzera mu chiyanjano chaubale ndi magulu a mapemphero.","Read the complete daily devotional from the official Rhapsody of Realities reading page.":"Werengani mapemphero athunthu atsiku ndi tsiku kuchokera patsamba lovomerezeka la Rhapsody of Realities.","Read today's devotional":"Werengani chipembedzo chamasiku ano","Read today's message on the official Rhapsody of Realities site, and spend a few quiet minutes with God before the day begins.":"Werengani uthenga wa lero pa tsamba lovomerezeka, ndipo khalani ndi mphindi zochepa chabe ndi Mulungu tsiku lisanayambe.","Recent public posts from the Royal Priesthood Assemblies International Facebook page.":"Zolemba zaposachedwa zapagulu la Royal Priesthood Assemblies International Facebook.","Recordings":"Zojambulidwa","Request a Prayer":"Pemphani Pemphero","Rhapsody of Realities":"Rhapsody of Realities","Rooted in faith. United in fellowship.":"Ozikika mu chikhulupiriro. Ogwirizana mu chiyanjano.","Royal Men's Fellowship":"Ubwenzi wa Amuna a Chifumu","Royal Men’s Fellowship":"Ubwenzi wa Amuna a Chifumu","Royal Priesthood Assemblies International":"Royal Priesthood Assemblies International","Royal Priesthood Assemblies International can add direct audio downloads when it has the tracks and permission to distribute them.":"Royal Priesthood Assemblies International ikhoza kuwonjezera kutsitsa kwachindunji komwe ili ndi nyimbo ndi chilolezo chowagawa.","Royal Priesthood Assemblies International is a Christian church based in Lusaka, Zambia. Our church life is centred on worship, biblical teaching, prayer, fellowship, and service.":"Royal Priesthood Assemblies International ndi mpingo wachikhristu womwe uli mumzinda wa Lusaka, Zambia. Moyo wathu wa mpingo umakhazikika pa kulambira, chiphunzitso cha Baibulo, pemphero, chiyanjano, ndi utumiki.","Royal Priesthood Assemblies International is a church family in Lusaka, Zambia. We gather to worship, grow in faith, and serve our community.":"Royal Priesthood Assemblies International ndi banja la mpingo ku Lusaka, Zambia. Timasonkhana kuti tilambire, kukula m’chikhulupiriro, ndi kutumikira anthu a m’dera lathu.","Royal Priesthood Assemblies International. All rights reserved.":"Royal Priesthood Assemblies International. Maumwini onse ndi otetezedwa.","Scripture:":"Lemba:","Select language":"Sankhani chinenero","Send Connect Card":"Tumizani Khadi la Kulumikizana","Send Prayer Request":"Tumizani Pemphero Pempho","Send a prayer request, plan your visit, or ask us anything.":"Tumizani pempho la pemphero, konzani kudzacheza kwanu, kapena mutifunse kalikonse.","Send us your prayer request":"Titumizireni pemphero lanu lopempha","Serve with care":"Tumikirani mosamala","Service video":"Kanema wautumiki","Share a Prayer Request":"Gawani Pempho la Pemphero","Show all pictures":"Onetsani zithunzi zonse","Show slideshow":"Onetsani chiwonetsero chazithunzi","Songs and downloads":"Nyimbo ndi kutsitsa","Songs from the church":"Nyimbo za mpingo","Stanbic":"Stanbic","Stanbic Bank":"Stanbic Bank","Stanbic Bank Zambia":"Stanbic Bank Zambia","Standard Chartered":"Standard Chartered","Standard Chartered Zambia":"Standard Chartered Zambia","Stream live service":"Onetsani utumiki wamoyo","Stream live service and find the latest worship and ministry videos from Royal Priesthood Assemblies International.":"Onetsani ntchito zaposachedwa ndikupeza makanema aposachedwa achipembedzo ndi mautumiki kuchokera ku Royal Priesthood Assemblies International.","Sunday Divine Service":"Ntchito ya Lamlungu","Sunday Transport & Branches":"Mayendedwe a Lamlungu ndi Nthambi","Sunday Worship":"Kulambira Lamlungu","Sunday gallery":"Zithunzi za Lamlungu","Sunday photos":"Zithunzi za Lamlungu","Sunday service":"Utumiki wa Lamlungu","Sunday service moves to 8am from 1 December.":"Utumiki wa Lamlungu umayenda mpaka 8am kuyambira pa 1 December.","Sunday transport":"Mayendedwe a Lamlungu","Sunday worship":"Kupembedza kwa Lamlungu","The ten newest photographs sent by the church":"Zithunzi khumi zatsopano zotumizidwa ndi mpingo","To be confirmed":"Kuti zitsimikizidwe","To proclaim the Gospel, encourage spiritual growth through Scripture and prayer, and serve our neighbours with compassion.":"Kulalikira Uthenga Wabwino, kulimbikitsa kukula kwauzimu kudzera m’Malemba ndi pemphero, ndi kutumikira anansi athu ndi chifundo.","To see people and communities strengthened by the hope of Christ and equipped to live out their faith.":"Kuwona anthu ndi madera akulimbikitsidwa ndi chiyembekezo cha Khristu ndi kukhala okonzeka kuchita zomwe amakhulupirira.","Today's podcast":"Podcast lero","Today's reading":"Zowerenga zalero","Updates from Royal Priesthood Assemblies International.":"Zosintha kuchokera ku Royal Priesthood Assemblies International.","Video":"Kanema","Virtual and cell locations":"Pa intaneti ndi m'magulu a m'nyumba","Virtuous Women’s Ministry":"Utumiki Wabwino Wakazi","Watch":"Penyani","Watch a message from the ministry.":"Onerani uthenga wochokera mu utumiki.","Ways to give":"Njira zoperekera","We aim to serve our neighbours and community with care.":"Tikufuna kutumikira anansi athu ndi dera lathu mosamala.","We gather to honour God and make room for prayer, praise, and gratitude.":"Timasonkhana kuti tilemekeze Mulungu ndi kupeza malo a pemphero, matamando, ndi chiyamiko.","We gather to honour God through prayer, praise, and gratitude.":"Timasonkhana kuti tilemekeze Mulungu kudzera m’pemphero, chitamando, ndi chiyamiko.","We seek to build a life of faith through Scripture, prayer, and encouragement.":"Timayesetsa kumanga moyo wachikhulupiriro kudzera m'Malemba, pemphero, ndi chilimbikitso.","We seek to create a welcoming community where people can learn Scripture, strengthen their faith, and serve others with compassion.":"Timayesetsa kupanga gulu lolandira bwino lomwe anthu angaphunzire Malemba, kulimbitsa chikhulupiriro chawo, ndi kutumikira ena mwachifundo.","We seek to grow through Scripture, prayer, and encouragement.":"Timayesetsa kukula kudzera m'Malemba, pemphero, ndi chilimbikitso.","We value welcoming one another, sharing life, and serving our community with care.":"Timayamikira kucherezana wina ndi mnzake, kugawana moyo, ndi kutumikira dera lathu mosamala.","We welcome one another and share life as a church family.":"Timalandilana wina ndi mzake ndikugawana moyo ngati banja la mpingo.","We would be glad to hear from you.":"Tingakhale okondwa kumva kuchokera kwa inu.","Wednesdays at 05:30 PM CAT":"Lachitatu nthawi ya 05:30 PM CAT","We’re here to stand with you":"Tabwera kudzayima nanu","What matters to us":"Zomwe zili zofunika kwa ife","Who we are":"Ndife ndani","Who we are, and why we gather.":"Ndife ndani, ndi chifukwa chiyani timasonkhana.","Why Us":"Chifukwa Chiyani Ife","Women":"Akazi","World languages":"Zilankhulo zapadziko lonse lapansi","Worship":"Kulambira","Worship and church life":"Kupembedza ndi moyo wa mpingo","Worship audio from Royal Priesthood Assemblies International.":"Lambirani mawu ochokera ku Royal Priesthood Assemblies International.","Worship music":"Kulambira nyimbo","You are welcome here":"Mwalandilidwa kuno","You matter to God, you matter to us.":"Ndinu ofunika kwa Mulungu, ndinu ofunika kwa ife.","Your email app is opening with your message ready. Please review and send it to the church.":"Pulogalamu yanu ya imelo ikutsegulidwa ndi uthenga wanu wokonzeka. Chonde onaninso ndikutumiza kutchalitchi.","Your giving supports local outreach, building expansion, and the spread of the Gospel across Zambia.":"Kupereka kwanu kumathandizira kufalikira kwa anthu kwanuko, kukulitsa kukula, ndi kufalitsa Uthenga Wabwino ku Zambia konse.","Youth & teens":"Achinyamata & Achinyamata","ZAMTEL MOBILE MONEY":"ZAMTEL MOBILE MONEY","Zambia National Commercial Bank":"Zambia National Commercial Bank","Zambian banks":"Mabanki aku Zambia","Zambian languages":"Zinenero za Zambia","Zamtel Mobile Money":"Zamtel Mobile Money","Zanaco":"Zanaco","“Honor the Lord with your possessions, and with the firstfruits of all your increase.”":"“Lemekeza Yehova ndi chuma chako, ndi zipatso zoyamba za zipatso zako zonse.”","“Let us hold unswervingly to the hope we profess, for he who promised is faithful.”":"“Tigwiritsitse chiyembekezo chathu chosagwedezeka, pakuti iye amene analonjeza ali wokhulupirika.","The Pillars":"Mizati","Empowering and equipping men to take their place of leadership in family, career, and church through focused fellowship and growth sessions, including the Online Royal Men's Summit.":"Kulimbikitsa ndi kuwapatsa amuna mphamvu kuti atenge malo awo a utsogoleri m'mabanja, ntchito, ndi tchalitchi kupyolera m'macheza ndi magawo a kukula, kuphatikizapo Msonkhano wa Amuna a Chifumu pa intaneti."},"toi":{"(The Pillars)":"(Mipika)","09:00 AM CAT":"09:00 AM CAT","A Christian church in Lusaka, Zambia, growing together through worship, the Word, and service to our neighbours.":"A Cikombelo ca Cikristo ku Lusaka, Zambia, kukomena antoomwe kwiinda mukukomba, mu Bbala akubelekela basimukoboma.","A church built on prayer and fellowship":"Cikombelo ciyakidwe a mupailo abunyina","A community strengthened by hope":"Cisi cizumizigwa alusyomo","A fresh reading from Rhapsody of Realities each day.":"Kubala kuzwa mu Rhapsody of Realities buzuba abuzuba.","A people of faith, growing together":"Bantu bakusyoma, tukomene antoomwe","A place of love where everyone counts":"Busena bwaluyando oomo mobala muntu oonse","A place of love where everyone counts.":"Busena bwaluyando oomo mobala muntu oonse.","A place to belong and to grow":"Busena bwakukkala akukomena","A vibrant community where young believers can discover their God-given identity, talents, and career callings.":"Busena bubotu mbobakonzya kuzubulula bube bwabo bwapegwa a Leza, zyipego, alimwi aluyando lwamulimo.","AIRTEL MOBILE MONEY":"AIRTEL MOBILE MONEY","About":"Za ndiswe","About us":"Atwe","Absa":"Absa","Absa Bank":"Absa Bank","Absa Bank Zambia":"Absa Bbanga Zambia","Account name":"Zina lya akaunti","Account number":"Namba ya akaunti","Airtel Mobile Money":"Airtel Mobile Money","Along Ndeke Road, Lusaka, Zambia":"Munzila ya Ndeke Road, Lusaka, Zambia","Announcements":"Makani","Apostle Dr. Mighty Zunga":"Apostle Dr. Mighty Zunga","Apostle Dr. Mighty Zunga in worship":"Apostle Dr. Mighty Zunga mukukomba","Apostle Dr. Mighty Zunga is the Founder and General Overseer of Royal Priesthood Assemblies International in Lusaka, Zambia. His ministry is expressed through preaching, prayer, discipleship, and the leadership of the church community. He encourages believers to grow in their understanding of Scripture and to put their faith into practice through service.":"Apostle Dr. Mighty Zunga ngu Singuzuzyo mupati wa Royal Priesthood Assemblies International mu Lusaka, Zambia. Bubelesi bwakwe bulalitondezya kwiinda mukukambauka, kupaila, kuba mwiiyi, abweendelezi bwamucikombelo. Ulakulwaizya basyomi kukomena mukumvwisisisya kwabo Malembo akubikka lusyomo lwabo mukucita kwiinda mububelesi.","As a royal priesthood, we worship God with our whole lives. As disciples, we follow Jesus and help others follow Him, sharing His truth with humility and living it with compassion at home, in the church, and throughout our community.":"Mbuli bupaizi bwabwami, tulamukomba Leza abuumi bwesu boonse. Mbuli basikwiiya, tulamutobela Jesu alimwi tulagwasya bamwi kumutobela, kwaabana masimpe aakwe cakulibombya akupona aluse amunzi, mucikombelo, Amuminzi yesu yoonse.","Ask about a fellowship":"Buzya bweenzyinyina","Ask about a ride":"Buzya zyakweenzya","Ask on WhatsApp":"Buzya a WhatsApp","Audio":"Makani alamvwugwa","Back to slideshow":"Kujokela kusilayidi","Branches & Transport":"Matabi a Zilwendo","Call":"Iitani foni","Call +260 767 716 936":"Kamwiita +260 767 716 936","Centre":"Mukati","Choose one":"Sala yomwe","Choose the next step that feels right for you. Your message will be prepared in your email app for you to review and send.":"Sala ntaamu iccilila mboyeeya kuti ili kabotu kuli nduwe. Mulumbe wako uyakubambwa mubulangizi bwakubelesya luwaile lwako kutegwa ubalangisye akutuma.","Church Services":"Mibelesi ya Cikombelo","Church updates":"Makani aazwa ku Cikombelo","Close menu":"Cinya menu","Connect with RPAI":"Swangana a RPAI","Connect with a local fellowship for biblical discussion and mutual support.":"Kopa lugwasyo kubulongwe bwamucilawo kutegwa mubandike zyiiyo zya mu Bbaibbele akugwasyanya.","Contact":"Kutumina","Contact the church":"Kwatila kucikombelo","Contact the church to ask about current Sunday transport availability, pickup points, and arrangements.":"Lumikizya kucikombelo kubuzya kujatikizya zyeendelo zyijanika mu Nsondo, busena bwakubwezela zyintu, alimwi ambokweelede kubambwa","Daily Devotional":"Cilongololo ca buzuba","Daily message":"Mulumbe wabuzuba abuzuba","Email Address":"Kkeyala lyamaile","Email the church":"Tumizyi email ku cikombelo","Empowering and equipping men to take their place of leadership in family, career, and church through focused fellowship and growth sessions, including the Online Royal Men’s Summit.":"Kupa nguzu akubambila balombwana kutola busololi mumikwasyi, milimo akucikombelo kwiinda mukubandika akuzumanana Kubikkilizya a Muswaangano wa Basankwa Bamwami wa pa intaneti.","Every ministry here opens room for worship, prayer, biblical learning, fellowship, and practical service in our community.":"Bubelesi boonse oobu bulapa ciindi cakukomba, kupaila, kwiiya Bbaibbele, kuswaangana, akubelekela bamuminzi yesu.","Explore our ministries":"Zubulula milimo yesu","FNB":"FNB","FNB Zambia":"FNB Zambia","Facebook only shows its posts to people who are signed in to Facebook, so the live feed below stays blank for many visitors. The button above always works.":"Facebook itondezya buyo zyilembedwe kubantu bajanika mubusena bwa Facebook, aboobo zyibelesyo zyijanika ansi aawa tazyibonwi kubantu banji. Incini iili atala lyoonse ilabeleka.","Faith in word and action":"Lusyomo mumajwi amumicito","Faith lived together":"Lusyomo lwakukkala antoomwe","Fellowship":"Bweenzyinyina","Fellowship locations":"Zibaka zyabunyina","Find a Home Cell":"Jana Kaselo Kamunzi","Find a church community":"Jana Cikombelo","Find a fellowship":"Jana bweenzyinyina","Find the Sunday gathering location and contact the church about transport and fellowship locations.":"Amujane busena bwakuswaanganina mu Nsondo akubandika kucikombelo kujatikizya zyeendelo abusena bwakuswaanganina.","Find your place among our ministries.":"Kojana busena bwako akati kabubelesi bwesu.","First National Bank":"Bbanga lyasaanguna lyacisi","Follow the church for updates, photos and notices":"Batobelezye cikombelo kutegwa ubone twaambo twaino, zifwanikiso azyizyibisyo","Follow us":"Tutobeleni","For help with any of these details, contact the church office.":"Kwa bwafo pa makani aya, sumbani ku ofesi ya cikombelo.","Full Name":"Zyina Lyoonse","Gallery":"Zifaniso","Gallery & Media":"Zyibeela Zyijatikizya Zyibelesyo Zyamumabbuku (Gallery) azyibelesyo zyijatikizya twaambo","General Overseer & Founder":"Mwangalizi mupati akutalika","General Overseer and Founder":"Mwangalizi mupati a Simwaambilizi","Give":"Kupeela","Give directly to any of our Zambian bank accounts. Please use your name as the reference so the church can acknowledge your gift.":"Pelelani ku akaunti yabanki yesu ya Zambia. Ambozya zina lyenu kuti cikombelo cizibe kupeela kwenu.","Give via PayPal":"Pelelani na PayPal","Giving details":"Makani aakupeela","Giving from outside Zambia? Use our only international gateway, PayPal.":"Muli kupeela kufuma kunze kwa Zambia? Ambozya PayPal, nzila yesu yeka ya matunji.","God has not forgotten you. His mercies are new every morning.":"Leza tanamukaluba pe. Luse lwakwe ndupya mafwumo-fwumo.","Grow in faith":"Kkomena mukusyoma","Grow with us in faith and fellowship":"Kamukomena andiswe mukusyomeka amubwana","Growing in faith":"Kukomena mukusyoma","Hebrews 10:23":"Hebrews 10:23","Home":"Kumatalikilo","Home Cell & Branch Fellowships":"Munzi Buswaangano bwa Kabunga Kamunsinga Amitabi","How can Apostle Dr. Mighty Zunga and the RPAI Prayer Team stand in faith with you this week?":"Ino Apostle Dr. Mighty Zunga a RPAI Prayer Team inga baima buti mulusyomo andinywe mvwiki eeyi?","How can we connect?":"Ino inga twajatana buti?","I am looking for a church home":"Njandaula ŋanda yacikombelo","I want to join a local Cell group":"Ndanda kuswaangana a nkamu ya Cell ya mumunzi.","I want to receive salvation":"Njanda kuvwunwa","I'm New Here / Connect Card":"Ndili Mupya / Kapepa Kakuswaangana","In Royal Priesthood, love is more than a kind word; it is the life of Christ made visible in the way we welcome, forgive, serve, and stand beside one another. We are called to carry each other's burdens and to make room for every person to grow in faith.":"Mubupaizi Bwamwami, luyando taluli bbala libotu pe, mbobuumi bwa Kristo bwakalibonya munzila njotutambula, kulekelela, kubelekela, Alimwi mwiime munsi-munsi. Twaitwa kuti tukwasyanye mikuli yesu akucita kuti muntu oonse akomene mukusyoma.","International giving":"Kupeela kwa matunji amakwabo","I’m New Here / Connect Card":"Ndili Mupya / Kapepa Kakuswaangana","John 13:34-35.":"John 13:34-35.","Join Us":"Kamuswaanganya","Join us every Sunday at 09:00 AM CAT at Otwa Events, Long Acres, Lusaka.":"Kamuswaanganina mu Nsondo moonse ciindi ca 9:00 AM Cat ku Otwa Events, Long Acres, Lusaka.","Join us for Sunday Divine Service at 09:00 AM CAT at Otwa Events, Long Acres, along Ndeke Road in Lusaka.":"Kamuswaanganina mu Nsondo ciindi ca 9:00 AM ku Otwa Events, Long Acres, kumwi ku Ndeke Road ku Lusaka.","Join us in Lusaka":"Kamuswaanganina mu Lusaka","Join us this week":"Kotusanganya nsondo eeyi","Keep Your Faith":"Koyobola Lusyomo Lwako","Keep faith through every season":"Kozumanana kusyomeka ciindi coonse","Know more about us":"Zyiba zyintu zyinji zyitujatikizya","Latest announcements":"Zyiyabilo zyamamanino","Latest photos":"Zifwanikiso zyamamanino","Let us pray for you. Share your needs and we will stand with you in faith and prayer.":"Atumupailile. Kamwaambaula zyiyandika kuli ndinywe, tuyakwiima andinywe mukusyomeka amumukomba.","Listen":"Swiilila","Listen to music by LoveWorld Singers and Pastor Chris through licensed music services. Use each service's own purchase or download option where available.":"Koteelela nyimbo zya LoveWorld Singers aba Pastor Chris kwiinda mukubelesya nzila zyizumizidwe. Belesya nzila yacintu acimwi mbocikonzya kuulwa antela kugwisyigwa kufwumbwa kuti nkocili.","Live Service":"Sebeza Wapona","Loading...":"Kulongela...","Local fellowships":"Bweenzyinyina bwamunzi","Local gatherings, including groups meeting in areas such as Chalala, for biblical discussion, mutual support, and neighbourly care.":"Miswaangano yabansiku, kubikkilizya atubunga tuswaanganina mumasena mbuli Chalala, kwaambaula zyibalo, kugwasyanya, akubikkila maanu basimukobonyina.","Love that forms disciples":"Luyando lucita kuti kube basikwiiya","LoveWorld Singers on Apple Music":"LoveWorld Singers kuli Apple Music","LoveWorld Singers on Spotify":"LoveWorld Singers ali Spotify","LoveWorld Singers on YouTube Music":"LoveWorld Singers ku YouTube Music","Lusaka Main Centre":"Lusaka Main Centre","MTN MOBILE MONEY":"MTN MOBILE MONEY","MTN Mobile Money":"MTN Mobile Money","Meet with us Wednesdays at 05:30 PM CAT for interactive fellowship, virtually and in cell locations.":"Kamuswaangana andiswe muli Bwatatu ciindi ca5h30pm kutegwa tube amubandi uukonzya kubelesyegwa mumasena oonse.","Men":"Basankwa","Mid-Week Fellowship":"Cisangano caakati kamvwiki","Mid-Week Interactive Fellowship":"Bweenzyinyina bwa Mukati ka Mvwiki","Ministries":"Milingo ya Leza","Ministries & Fellowships":"Mibelesi a Bweenzyinyina","Mobile Money":"Mali ku Foni","PayPal email":"Imeyili ya PayPal","Moments of worship, prayer, fellowship, and ministry from Royal Priesthood Assemblies International.":"Zyiindi zyakukomba, kupaila, kuswaangana abwami kuzwa ku Royal Priesthood Assemblies International.","Next photos":"Zifwanikiso zyiccilila","Next steps":"Ntaamu zitobela","NextGen Youth & Teen Ministry":"Mibelesi ya Basankwa a Basizana","Open directions in Google Maps":"Zyitondezyo zyazinzila zyijanika mu Google Maps","Open menu":"Jula menu","Open the church's Facebook page":"Jula peeji ya Facebook ya cikombelo","Otwa Events, Long Acres":"Otwa Events, Long Acres","Otwa Events, Long Acres, along Ndeke Road, Lusaka, Zambia":"Otwa Events, Long Acres, KUMWI Ndeke Road, Lusaka, Zambia","Our Founder":"Musunguli Wesu","Our Services":"Mibelesi Yesu","Our ministries":"Milimo Yesu","Our ministries create opportunities for worship, prayer, biblical learning, fellowship, and practical service in the community.":"Bubelesi bwesu bupa ciindi cakukomba, kupaila, kwiiya Bbaibbele, kuswaangana, alimwi akubelekela bana maleya.","Our mission":"Mulimo Wesu","Our vision":"Bbona mbele lyesu","Pal":"Munyinzi","Partner with us":"Tiyende pamo","Pastor Chris on Apple Music":"Ba Pastor Chris ku Apple Music","Pastor Chris on Spotify":"Ba Pastor Chris ku Spotify","Pastor Chris on YouTube Music":"Ba Pastor Chris ku YouTube Music","Pastor Thelma welcome you to Royal Priesthood Assemblies International.":"Pastor Thelma watambula ku Royal Priesthood Assemblies International.","Pause slideshow":"Imisa slideshow","Pay":"Bbadela","PayPal":"PayPal","Phone Number":"Nambala yamfwooni","Photographs from worship gatherings and ministry moments. Select any photograph to view it larger.":"Zyifwanikiso zyizwa kumiswaangano yakukomba amubelesi Sala kufwumbwa cifwanikiso kutegwa ucikomenzye.","Plan Your Visit":"Panga Lwendo Lwako","Plan your visit":"Panga Lwendo Lwako","Play slideshow":"Tanda slideshow","Previous photos":"Zyifwanikiso zyakainda","Proverbs 3:9":"Proverbs 3:9","ROYAL PRIESTHOOD ASSEMBLIES INTERNATIONAL":"ROYAL PRIESTHOOD ASSEMBLIES INTERNATIONAL","ROYAL Priesthood Assemblies International":"ROYAL Priesthood Assemblies International","RPAI lists local home-cell and branch fellowships, including gatherings in Chalala. Contact the church for current meeting locations, schedules, and details about other branches.":"RPAI ililembedwe nkamu zyamuminzi alimwi amitobe, kubikkilizya amiswaangano iicitwa ku Chalala. Amubandike kucikombelo kutegwa mumvwe masena aamuswaangano, maccililanwa, abupanduluzi bujatikizya mitabi imbi.","Raising spiritual mothers, career women, and impactful leaders through local sisterhood fellowships and prayer clusters.":"Kusyomezya bamaama bamuzimo zyabupampu, bamakaintu bajisi mulimo mupati, abasololi bapati kwiinda mukukambauka akupaila.","Read the complete daily devotional from the official Rhapsody of Realities reading page.":"Bala bupaizi bwakupa buzuba abuzuba buzulide kuzwa apeeji yakubala ya Rhapsody of Realities.","Read today's devotional":"Bala mulumbe wasunu","Read today's message on the official Rhapsody of Realities site, and spend a few quiet minutes with God before the day begins.":"Bala mulumbe wasunu abusena bwa Rhapsody of Realities, wamana ciindi cisyoonto kali mucuumuno a Leza buzuba kabutana talika.","Recent public posts from the Royal Priesthood Assemblies International Facebook page.":"Zyilembedwe abantu boonse kuzwa ku Royal Priesthood Assemblies International Facebook page.","Recordings":"Zyakalembwa","Request a Prayer":"Lomba Mupailo","Rhapsody of Realities":"Rhapsody of Realities","Rooted in faith. United in fellowship.":"Iizimide mukusyomeka. Baswaangane mubunyina.","Royal Men's Fellowship":"Bweenzyinyina bwa Basankwa ba Mwami","Royal Men’s Fellowship":"Bweenzyinyina bwa Basankwa ba Mwami","Royal Priesthood Assemblies International":"Royal Priesthood Assemblies International","Royal Priesthood Assemblies International can add direct audio downloads when it has the tracks and permission to distribute them.":"Royal Priesthood Assemblies International ilakonzya kuyungizya zyibelesyo zyijatikizya mateende kuti yabaa nyimbo azyizumizyo zyakwaapaula.","Royal Priesthood Assemblies International is a Christian church based in Lusaka, Zambia. Our church life is centred on worship, biblical teaching, prayer, fellowship, and service.":"Royal Priesthood Assemblies International ncikombelo cacikristo cili ku Lusaka, Zambia. Buumi bwesu bwa mu cikombelo bujatikizya bukombi, lwiiyo lwa mu Bbaibbele, kupaila, kuswaangana akubelekela antoomwe.","Royal Priesthood Assemblies International is a church family in Lusaka, Zambia. We gather to worship, grow in faith, and serve our community.":"Royal Priesthood Assemblies International mukwasyi wacikombelo ku Lusaka, Zambia. Tulabungana kukomba, kukomena mukusyoma akubelekela bana maleya.","Royal Priesthood Assemblies International. All rights reserved.":"Royal Priesthood Assemblies International. Mafwuta oonse alapegwa.","Scripture:":"Lemba:","Select language":"Select language","Send Connect Card":"Tumina Kapepa kakukwabana","Send Prayer Request":"Tumina Kulomba Mupailo","Send a prayer request, plan your visit, or ask us anything.":"Tumina kulomba kupaila, kubamba kuswaya kwako, antela kutubuzya kufwumbwa cintu.","Send us your prayer request":"Tumina kulomba kwako","Serve with care":"Belekela kabotu-kabotu","Service video":"Kavidiyo kazyintu zyijatikizya mulimo","Share a Prayer Request":"Amwaabane Kulomba Kwakulomba","Show all pictures":"Tondezya zyifwanikiso zyoonse","Show slideshow":"Tondezya slideshow","Songs and downloads":"Nyimbo azyibelesyo zyakuselusya","Songs from the church":"Nyimbo zya kucikombelo","Stanbic":"Stanbic","Stanbic Bank":"Stanbic Bank","Stanbic Bank Zambia":"Stanbic Bbanga Zambia","Standard Chartered":"Standard Chartered","Standard Chartered Zambia":"Standard Chartered Zambia","Stream live service":"Cikwankwani cicitika","Stream live service and find the latest worship and ministry videos from Royal Priesthood Assemblies International.":"Tondezya bukombi bwamazuba oonse akujana mavideo aakaindi aakupaila aakupaila kuzwa ku Royal Priesthood Assemblies International","Sunday Divine Service":"Nsondo","Sunday Transport & Branches":"Nsondo Zyeendelo Amitabi","Sunday Worship":"Bukombi bwa Nsondo","Sunday gallery":"Cipekupeku ca Nsondo","Sunday photos":"Zifwanikiso zya Nsondo","Sunday service":"Mulimo wa Nsondo","Sunday service moves to 8am from 1 December.":"Mulimo wa Nsondo ulacincwa kuya ku 8am kuzwa mu 1 mwezi wa Nalupale.","Sunday transport":"Zyeendelo mu Nsondo","Sunday worship":"Bukombi bwamu Nsondo","The ten newest photographs sent by the church":"Zifwanikiso zyasunu zyili kkumi zyakatumwa a cikombelo","To be confirmed":"Kusinizigwa","To proclaim the Gospel, encourage spiritual growth through Scripture and prayer, and serve our neighbours with compassion.":"Kukambauka makani mabotu, kukulwaizya bukomezi bwamuzimo kwiinda mu Bbaibbele amupailo, akubelekela basicikolonyina cabusoni.","To see people and communities strengthened by the hope of Christ and equipped to live out their faith.":"Kubona bantu abamuminzi kabayumya-yumya kwiinda mulusyomo lwaKristo alimwi kabayungizigwa kutegwa bapone lusyomo lwabo.","Today's podcast":"Cisobano casunu","Today's reading":"Kubala kwamasunu","Updates from Royal Priesthood Assemblies International.":"Twaambo twazwa ku Royal Priesthood Assemblies International.","Video":"Kavideo","Virtual and cell locations":"Zyibaka zyijanika ama sela","Virtuous Women’s Ministry":"Bubelesi bwabamakaintu basyomeka","Watch":"Kamulanga","Watch a message from the ministry.":"Kamulangilizya mulumbe kuzwa kub ministry.","Ways to give":"Nzila zyakupeela","We aim to serve our neighbours and community with care.":"Tuyanda kubelekela basimukoboma abasimukoboma canguzu.","We gather to honour God and make room for prayer, praise, and gratitude.":"Tulalibunga kukulemekezya Leza akupa ciindi cakulomba, kulumbaizya, akulumba.","We gather to honour God through prayer, praise, and gratitude.":"Tulalibunga kuti tulemeke Leza kwiinda mukulomba, kulumbaizya, akulumba.","We seek to build a life of faith through Scripture, prayer, and encouragement.":"Tuyandaula kuyaka buumi bwakusyoma kwiinda mu Malembo, mupailo, akukulwaizyanya.","We seek to create a welcoming community where people can learn Scripture, strengthen their faith, and serve others with compassion.":"Tulayandaula kubamba mbunga yakutambula bantu nkobakonzya kwiiya Malembo, kusumpula lusyomo lwabo akubelekela bamwi akuba aluse.","We seek to grow through Scripture, prayer, and encouragement.":"Tuyandaula kukomena kwiinda mu Malembo, mupailo, akukulwaizyanya.","We value welcoming one another, sharing life, and serving our community with care.":"Tulayandisya kutambulwa, kwaabana buumi, akubelekela bana maleya.","We welcome one another and share life as a church family.":"Tulapokelana akubana buumi mbuli mukwasyi wacikombelo.","We would be glad to hear from you.":"Inga twakkomana kumvwa kuzwa kuli nduwe.","Wednesdays at 05:30 PM CAT":"Bwatatu ciindi ca 5: 30pm (CAT)","We’re here to stand with you":"Tuli waano kuti twiime andinywe","What matters to us":"Cintu cipati kuli ndiswe","Who we are":"Mbotuli","Who we are, and why we gather.":"Mbotubede ancotuswaanganina.","Why Us":"Ncitwaambila","Women":"Bamakaintu","World languages":"Ndimi zya matunji amakwabo","Worship":"Bukombi","Worship and church life":"Bukombi abuumi bwamucikombelo","Worship audio from Royal Priesthood Assemblies International.":"Kukomba kwa Royal Priesthood Assemblies International.","Worship music":"Nyimbo zyakukomba","You are welcome here":"Mwatambulwa.","You matter to God, you matter to us.":"Uli waamba kuli Leza, uli waamba kuli ndiswe.","Your email app is opening with your message ready. Please review and send it to the church.":"App ya email yako ilajulwa a mulumbe wako uulede. Amubone alimwi amutume kucikombelo.","Your giving supports local outreach, building expansion, and the spread of the Gospel across Zambia.":"Kupeela kwenu kulayalusa milimo ya mucisi, kukula kwa ng’anda, akufalisa Mulumbe Wabotu mu Zambia yonse.","Youth & teens":"Bakubusyi a Bakubusyi","ZAMTEL MOBILE MONEY":"ZAMTEL MOBILE MONEY","Zambia National Commercial Bank":"Zambia Bbanga lya National Commercial Bank","Zambian banks":"Mabanki a Zambia","Zambian languages":"Ndimi zya Zambia","Zamtel Mobile Money":"Zamtel Mobile Money","Zanaco":"Zanaco","“Honor the Lord with your possessions, and with the firstfruits of all your increase.”":"“Kolemekezya Mwami abuvwubi bwako, amicelo yakusaanguna yakuvwula kwako koonse.”","“Let us hold unswervingly to the hope we profess, for he who promised is faithful.”":"“Tubambe cakusininzya kulangila nkotuzumina nkaambo sikusyomezya ulasyomeka.”"},"loz":{"(The Pillars)":"(Makala)","09:00 AM CAT":"09:00 AM CAT","A Christian church in Lusaka, Zambia, growing together through worship, the Word, and service to our neighbours.":"Kereke ea Bokreste e Lusaka, Zambia, e holang hammoho ka borapeli, Lentsoe, le tšebeletso ho baahisani ba rona.","A church built on prayer and fellowship":"Kereke e hahiloeng holim'a thapelo le kopano","A community strengthened by hope":"Sikolo se matisizwe ki sepiso","A fresh reading from Rhapsody of Realities each day.":"Palo ye ncha ye balwa kwa Rhapsody of Realities zazi ni zazi.","A people of faith, growing together":"Batu ba tumelo, ba ba hōla hamoho","A place of love where everyone counts":"Sibaka sa lato mo mutu kaufela a balwa","A place of love where everyone counts.":"Sibaka sa lato mo mutu kaufela a balwa.","A place to belong and to grow":"Sibaka sa ku ba wa hao ni ku hula","A vibrant community where young believers can discover their God-given identity, talents, and career callings.":"Sibaka se pila se buñata mo bashemi ba bañwi ba ka fumana boitsebi bwa bona bo ba ne ba filwe ki Mulimu, matalenta, ni mibele ya mesebezi.","AIRTEL MOBILE MONEY":"AIRTEL MOBILE MONEY","About":"Ka za luna","About us":"Ka za luna","Absa":"Absa","Absa Bank":"Absa Bank","Absa Bank Zambia":"Absa Bank Zambia","Account name":"Libizo la akaunti","Account number":"Nambala ya akaunti","Airtel Mobile Money":"Airtel Mobile Money","Along Ndeke Road, Lusaka, Zambia":"Kwa Ndeke Road, Lusaka, Zambia","Announcements":"Makande","Apostle Dr. Mighty Zunga":"Apostle Dr. Mighty Zunga","Apostle Dr. Mighty Zunga in worship":"Apostle Dr. Mighty Zunga mwa kulombela","Apostle Dr. Mighty Zunga is the Founder and General Overseer of Royal Priesthood Assemblies International in Lusaka, Zambia. His ministry is expressed through preaching, prayer, discipleship, and the leadership of the church community. He encourages believers to grow in their understanding of Scripture and to put their faith into practice through service.":"ki Mubupi ni Mubusisi wa Kakwate wa Royal Priesthood Assemblies International kwa Lusaka, Zambia. Bushomi bwa hae bu bonahala ka kubuleka, kupupa, kuluta balutiwa, ni bukuwelisa bwa sikwata sa kereke. U susueza bashemi kuli ba hule mwa kutwisiso ya Mañolo ni ku sebelisa tumelo ya bona ka kuitukela.","As a royal priesthood, we worship God with our whole lives. As disciples, we follow Jesus and help others follow Him, sharing His truth with humility and living it with compassion at home, in the church, and throughout our community.":"Kaufela sina baprista ba bukosi, lu lotuza Mulimu ka bupilo bwesu kaufela. Sina balutiwa, lu latelela Jesu mi lu thusa bañwi ku mu latelela, lu abelana niti ya Hae ka boikokobetso mi lu ipila ka yona ka likutezo mwa ndu, mwa kereke, ni mwa sibaka sesi lutaamile.","Ask about a fellowship":"Busa ka mikalelo","Ask about a ride":"Busa ka za ku palama","Ask on WhatsApp":"Buza kwa WhatsApp","Audio":"Zwalo","Back to slideshow":"Kutela kwa dislaedishoo","Branches & Transport":"Mafelo ni Lwendo","Call":"Bizanga foni","Call +260 767 716 936":"Biza +260 767 716 936","Centre":"Sentara","Choose one":"Keta se sili","Choose the next step that feels right for you. Your message will be prepared in your email app for you to review and send.":"Keta mukwalo o latelang oo u utwa kuli u swanela. Molaetsa wa hao u ta lulamisiwa kwa app ya hao ya imeili kuli u u hlahlobile mi u u rome.","Church Services":"Misebezi ya Kereke","Church updates":"Litaba za Kereke","Close menu":"Kwala menu","Connect with RPAI":"Kopana ni RPAI","Connect with a local fellowship for biblical discussion and mutual support.":"Kopana ni kereke ya moo kwa buisano bwa Bibele ni thuso.","Contact":"Kukopanya","Contact the church":"Ikopanye ni kereke","Contact the church to ask about current Sunday transport availability, pickup points, and arrangements.":"Ikopani kwa kereke kuli mu buze ka buino bwa sepiso ya Sondo ya bupilo, mabaka a ku zwa, ni malukulukiso.","Daily Devotional":"Za lika ni lika","Daily message":"Mulumo wa zazi","Email Address":"Imeli","Email the church":"Lumela kereke ka email","Empowering and equipping men to take their place of leadership in family, career, and church through focused fellowship and growth sessions, including the Online Royal Men’s Summit.":"Kufa maata ni kulubeka banna kuli ba kene mwa sibaka sa bona sa bueteli mwa lusika, misebezi, ni kereke kwa mukiti wa ku kopana ni ku hula, ku kenyeleza ni Online Royal Men’s Summit.","Every ministry here opens room for worship, prayer, biblical learning, fellowship, and practical service in our community.":"Kwa butulo kaufela mwa mo ku bulukelwa kwa kulapela, ku phahla, ku ithuta Bibele, ku kopana, ni ku sebeza ka ku swanelwa mwa sibaka sa luna.","Explore our ministries":"Bona misebezi ya luna","FNB":"FNB","FNB Zambia":"FNB Zambia","Facebook only shows its posts to people who are signed in to Facebook, so the live feed below stays blank for many visitors. The button above always works.":"Facebook e bontša fela litaba za yona kwa batu ba keneñi mo Facebook, kacwalo live feed ye e li fa tlase e sala i si na selo kwa baeti ba bañata. Butuñi ye e li fa halimu i sebetsa ka nako kaufela.","Faith in word and action":"Tumelo mwa linzwi ni mwa likute","Faith lived together":"Tumelo e pila hamoho","Fellowship":"Kopano","Fellowship locations":"Mabaka a likopano","Find a Home Cell":"Fumana Ndu ya Kopano","Find a church community":"Fumana kereke","Find a fellowship":"Fumana kopano","Find the Sunday gathering location and contact the church about transport and fellowship locations.":"Bona sina sa kukopana kwa Sondo ni buza kwa kereke ka za sitimela ni sina sa kukopana.","Find your place among our ministries.":"Fumana sibaka sa hao hara mikitilizano ya luna.","First National Bank":"First National Bank","Follow the church for updates, photos and notices":"Latelela kereke kuli u fumane litaba, lifoto ni litatiso","Follow us":"Lu latele","For help with any of these details, contact the church office.":"Kwa thuso ya makande a, bukwa ofisi ya kereke.","Full Name":"Libizo le feletileng","Gallery":"Lifaniso","Gallery & Media":"Lifaniso ni Media","General Overseer & Founder":"Mubuki wa Kakalezi ni Mubuki wa Silemu","General Overseer and Founder":"Mubusisi wa Kakwate ni Mubupi","Give":"Kufa","Give directly to any of our Zambian bank accounts. Please use your name as the reference so the church can acknowledge your gift.":"Fanga kwa akaunti ye nngwe ya mabanki a luna a Zambia. Kwalisa libizo la luna kuti kereke i zibe kufa kwa luna.","Give via PayPal":"Fa ka PayPal","Giving details":"Makande a ku fa","Giving from outside Zambia? Use our only international gateway, PayPal.":"Ha u fa ku zwa kwa nze ya Zambia? Sebelisa PayPal, njila ya luna ye nngwe ya linaha.","God has not forgotten you. His mercies are new every morning.":"Molimo ha a u lebale. Mohau oa hae o mocha hoseng ho hong le ho hong.","Grow in faith":"Kukula mwa tumelo","Grow with us in faith and fellowship":"Hula ni luna ka tumelo ni kopano","Growing in faith":"Ku hula ka tumelo","Hebrews 10:23":"Hebrews 10:23","Home":"Kwa Hae","Home Cell & Branch Fellowships":"Makopano a Ndu ni Makalulo","How can Apostle Dr. Mighty Zunga and the RPAI Prayer Team stand in faith with you this week?":"Kuli cwang'i ni Sepalamente sa Thapelo ba ka yema cwang'i ka tumelo ni wena kweli beke ye?","How can we connect?":"Lukona ku kopana cwani?","I am looking for a church home":"Ki na batla ndu ya kereke","I want to join a local Cell group":"Ni batile ku ikopanya ni nikamu ya Cell ya moo.","I want to receive salvation":"Ni batile ku fumana puluso","I'm New Here / Connect Card":"I'm New Here / Connect Card","In Royal Priesthood, love is more than a kind word; it is the life of Christ made visible in the way we welcome, forgive, serve, and stand beside one another. We are called to carry each other's burdens and to make room for every person to grow in faith.":"Mwa Buprista bwa Sihulu, lilato li fita fa kwa linzwi le nde; ki bupilo bwa Kreste bo bonahalazwa ka mukwa wo tu amuhela, tu swalelela, tu sebeza, mi tu yemi fa thoko ya ba bañwi. Tu bizwa ku sikulisa mizwalo ya ba bañwi mi ku sisa sibaka kuli mutu ku mutu a hule mwa tumelo.","International giving":"Kufa kwa linaha ze nngwe","I’m New Here / Connect Card":"Ki Ni Muzuzi Mwaha / Kadi ya Kukopanya","John 13:34-35.":"John 13:34-35.","Join Us":"Kopana ni luna","Join us every Sunday at 09:00 AM CAT at Otwa Events, Long Acres, Lusaka.":"Itokisele ku ba ni luna Sontaha se sengwe ni se sengwe ka 09:00 AM CAT kwa Otwa Events, Long Acres, Lusaka.","Join us for Sunday Divine Service at 09:00 AM CAT at Otwa Events, Long Acres, along Ndeke Road in Lusaka.":"Iteñi ku luna ku Sonda ya Borapeli ka 09:00 AM CAT ku Otwa Events, Long Acres, mwa Ndeke Road ku Lusaka.","Join us in Lusaka":"Ikenye ni luna kwa Lusaka","Join us this week":"Ikenye ni luna kweli beke","Keep Your Faith":"Boloka Tumelo Ya Hao","Keep faith through every season":"Sunga tumelo mwa nako ni nako","Know more about us":"Iteyani hahulu ka za luna","Latest announcements":"Litaba za pili","Latest photos":"Zifanyiso za pili","Let us pray for you. Share your needs and we will stand with you in faith and prayer.":"Ha lu swalelele. Abelane ka lituso za mina mi lu ka ema ni mina ka tumelo ni thapelo.","Listen":"Mamela","Listen to music by LoveWorld Singers and Pastor Chris through licensed music services. Use each service's own purchase or download option where available.":"Teelanga muzika ya LoveWorld Singers ni Moruti Chris kwa litšebeletso za muzika ze lumelletsoeng. Sebelisa khetho ya ku reka kamba ku download ya tšebeletso ka nngwe mo e fumanehang.","Live Service":"Misebezi ya pila","Loading...":"Ku lwisa...","Local fellowships":"Dikopano za mo nzi","Local gatherings, including groups meeting in areas such as Chalala, for biblical discussion, mutual support, and neighbourly care.":"Mikopano ya moo, ku kenyeleditso likwata ze kopana mwa mibaka ye swana ni Chalala, bakeng sa puisano ya Bibele, situso sa ku lumelana, ni tumelelo ya bañwi.","Love that forms disciples":"Lerato le le bopang barutiwa","LoveWorld Singers on Apple Music":"LoveWorld Singers kwa Apple Music","LoveWorld Singers on Spotify":"LoveWorld Singers kwa Spotify","LoveWorld Singers on YouTube Music":"LoveWorld Singers kwa YouTube Music","Lusaka Main Centre":"Lusaka Main Centre","MTN MOBILE MONEY":"MTN MOBILE MONEY","MTN Mobile Money":"MTN Mobile Money","Meet with us Wednesdays at 05:30 PM CAT for interactive fellowship, virtually and in cell locations.":"Bukopani ni luna ka Laboraro ka 05:30 PM CAT kwa kopano ye buzwisani, ka virtual ni kwa mabaka a cell.","Men":"Banna","Mid-Week Fellowship":"Likopano za kasikati","Mid-Week Interactive Fellowship":"Kopano ya Mukati wa Beke","Ministries":"Misebezi ya Mulimu","Ministries & Fellowships":"Mishitu ye e Nde & Mikalelo","Mobile Money":"Mali ya Foni","PayPal email":"Imeyili ya PayPal","Moments of worship, prayer, fellowship, and ministry from Royal Priesthood Assemblies International.":"Mikiti ya kulobala, thapelo, kukopana, ni mushumo wa kwa.","Next photos":"Dikifano ze latelako","Next steps":"Mehato ye latelako","NextGen Youth & Teen Ministry":"Misebezi ya Bashemi ba Banyinyani","Open directions in Google Maps":"Bula dihala mu Google Maps","Open menu":"Bula menu","Open the church's Facebook page":"Bula peji ya Facebook ya kereke","Otwa Events, Long Acres":"Otwa Events, Long Acres","Otwa Events, Long Acres, along Ndeke Road, Lusaka, Zambia":"Otwa Events, Long Acres, kaufela Ndeke Road, Lusaka, Zambia","Our Founder":"Mutami wa luna","Our Services":"Misebezi ya luna","Our ministries":"Misebeza ya luna","Our ministries create opportunities for worship, prayer, biblical learning, fellowship, and practical service in the community.":"Litšebeletso tsa rona li theha menyetla ea borapeli, thapelo, thuto ea Bibele, kopano, le tšebeletso e sebetsang sechabeng.","Our mission":"Mosebezi wa luna","Our vision":"Pono ya luna","Pal":"Pal","Partner with us":"Mube baka luna","Pastor Chris on Apple Music":"Moruti Chris ku Apple Music","Pastor Chris on Spotify":"Moruti Chris ku Spotify","Pastor Chris on YouTube Music":"Pastor Chris kwa YouTube Music","Pastor Thelma welcome you to Royal Priesthood Assemblies International.":"Pastor Thelma u a ku amuhela kwa Royal Priesthood Assemblies International.","Pause slideshow":"Emisa slideshow","Pay":"Lefa","PayPal":"PayPal","Phone Number":"Nombolo ya foni","Photographs from worship gatherings and ministry moments. Select any photograph to view it larger.":"Lifoto ze zwa ku mikopano ya kulapela ni mila ya bukombwa. Keta lifoto kaufela kuli u li bone ka bukata.","Plan Your Visit":"Lukisa lwendo lwa hao","Plan your visit":"Lukisa lwendo lwa hao","Play slideshow":"Bapala slideshow","Previous photos":"Lifoto za pili","Proverbs 3:9":"Proverbs 3:9","ROYAL PRIESTHOOD ASSEMBLIES INTERNATIONAL":"ROYAL PRIESTHOOD ASSEMBLIES INTERNATIONAL","ROYAL Priesthood Assemblies International":"ROYAL Priesthood Assemblies International","RPAI lists local home-cell and branch fellowships, including gatherings in Chalala. Contact the church for current meeting locations, schedules, and details about other branches.":"RPAI e bontša likopano za mo nzubo ni za makalulo a mo nzubo, ku kenyellezwa likopano za Chalala. Ikopanye ni kereke kwa libaka za likopano za nako ye, manane, ni litaba ze ñwi ka makalulo a mañwi.","Raising spiritual mothers, career women, and impactful leaders through local sisterhood fellowships and prayer clusters.":"Ku holisa bomme ba moya, basali ba mesebezi, ni baitapeleli ba nang le tuto ka dipokisano za bomahe ba moo ni dikopano za thapelo.","Read the complete daily devotional from the official Rhapsody of Realities reading page.":"Bala bukombwa bo bu felela bwa zazi ni zazi ku zwa kwa likepe za ku bala za Rhapsody of Realities.","Read today's devotional":"Bala mulao wa kacenu","Read today's message on the official Rhapsody of Realities site, and spend a few quiet minutes with God before the day begins.":"Bala molaetsa wa kacenu kwa webusaiti ya semmuso ya Rhapsody of Realities, mi u iphe nako e nyinyani ya ku siya kwapili ni Mulimu pele lizazi li kala.","Recent public posts from the Royal Priesthood Assemblies International Facebook page.":"Litaba za phatlalalo za pili ze tswa kwa Facebook page.","Recordings":"Zebukilwe","Request a Prayer":"Kopa Thapelo","Rhapsody of Realities":"Rhapsody of Realities","Rooted in faith. United in fellowship.":"Zamizwe ka tumelo. Zamubukelelo ka kopano.","Royal Men's Fellowship":"Mukalelo wa Banna ba Royal","Royal Men’s Fellowship":"Mukalelo wa Banna ba Royal","Royal Priesthood Assemblies International":"Royal Priesthood Assemblies International","Royal Priesthood Assemblies International can add direct audio downloads when it has the tracks and permission to distribute them.":"Royal Priesthood Assemblies International ka ekeza ku downloada za audio fa ne li na le di track ni tumelo ya ku li aba.","Royal Priesthood Assemblies International is a Christian church based in Lusaka, Zambia. Our church life is centred on worship, biblical teaching, prayer, fellowship, and service.":"Royal Priesthood Assemblies International ki kereke ya Sikreste ye e zwa Lusaka, Zambia. Bupilo bwa kereke ya luna bu mi ka ku koropa, kuluta Bibele, ku rapela, ku kopana, ni ku sebeza.","Royal Priesthood Assemblies International is a church family in Lusaka, Zambia. We gather to worship, grow in faith, and serve our community.":"ke lubasi lwa kereke kwa Lusaka, Zambia. Lu kopana ku rapela, ku hōla mu tumelo, ni ku sebeletsa setjhaba sa luna.","Royal Priesthood Assemblies International. All rights reserved.":"Royal Priesthood Assemblies International. Likwalo kaufela li bolokilwe.","Scripture:":"Mangolo:","Select language":"Select language","Send Connect Card":"Lumela Karata ya Kopano","Send Prayer Request":"Lumela Thapelo","Send a prayer request, plan your visit, or ask us anything.":"Lumelani kopo ya thapelo, luka ni ku etela, kamba lu buze sifapimo.","Send us your prayer request":"Lu Tumelise kuli lu kope thapelo ya mina","Serve with care":"Sebeletsa ka kulobala","Service video":"Vidio ya sizibelo","Share a Prayer Request":"Abela Kopo ya Tapelo","Show all pictures":"Bontsha litšoantšo kaufela","Show slideshow":"Bontsha slideshow","Songs and downloads":"Lipina ni ku zwa","Songs from the church":"Lipina ze zwa ku kereke","Stanbic":"Stanbic","Stanbic Bank":"Stanbic Bank","Stanbic Bank Zambia":"Stanbic Bank Zambia","Standard Chartered":"Standard Chartered","Standard Chartered Zambia":"Standard Chartered Zambia","Stream live service":"Bona sepo ya pili","Stream live service and find the latest worship and ministry videos from Royal Priesthood Assemblies International.":"Bona sebeza sa pila ni ku fumana bideo za ku khumamela ni za sebezo za pili kwa Royal Priesthood Assemblies International.","Sunday Divine Service":"Sonda ya Borapeli","Sunday Transport & Branches":"Sande ya Zamaiso ni Mikalelo","Sunday Worship":"Kukomboka kwa Sonto","Sunday gallery":"Dizaini za Sonto","Sunday photos":"Zifanyiso za Sonto","Sunday service":"Sizibelo sa Sonto","Sunday service moves to 8am from 1 December.":"Sikolo sa Sonto si cwaleha ku 8am kuzwa ka 1 December.","Sunday transport":"Sepalamo sa Sondo","Sunday worship":"Kukomboka kwa Sonto","The ten newest photographs sent by the church":"Lifoto ze lishumi ze nca ze zitumilwe ki kereke","To be confirmed":"Ku tiiswa","To proclaim the Gospel, encourage spiritual growth through Scripture and prayer, and serve our neighbours with compassion.":"Ku kalima Mafu, ku matlafaza ku hula kwa moya ka Mangolo ni ka thapelo, ni ku sebeza babañi ka kutokwa.","To see people and communities strengthened by the hope of Christ and equipped to live out their faith.":"Ku bona batu ni mikwalehe ye matiswanga ki sepiso ya Kreste ni ku lukiwa ku pila tumelo ya bona.","Today's podcast":"Podcast ya kacenu","Today's reading":"Lipalo za kacenu","Updates from Royal Priesthood Assemblies International.":"Litaba ze zwa ku.","Video":"Vidio","Virtual and cell locations":"Mikunda ya pa intaneti ni ya ma cell","Virtuous Women’s Ministry":"Misebezi ya Basali ba Bukwa","Watch":"Bona","Watch a message from the ministry.":"Bona molaozwa kuzwa kwa bukombwa.","Ways to give":"Njila za ku fa","We aim to serve our neighbours and community with care.":"Lu ikemiselitse ku sebeza ba bapeli ni sibaka ka kulukilela.","We gather to honour God and make room for prayer, praise, and gratitude.":"Lwa kopana ku tukuza Mulimu ni ku sisa ndawo ya thapelo, ku boka, ni ku lumba.","We gather to honour God through prayer, praise, and gratitude.":"Re bokana ho tlotlisa Molimo ka thapelo, thoriso, le teboho.","We seek to build a life of faith through Scripture, prayer, and encouragement.":"Lwa batukulukile ku yaha bupilo bwa tumelo kwa ka Mañolo, thapelo, ni ku lwanisa.","We seek to create a welcoming community where people can learn Scripture, strengthen their faith, and serve others with compassion.":"Lu batanga ku bupa mubunga o lu amuhezwa, mo ba tu ba ka ithuta Mañolo, ba ka tiisa tumelo ya bona, mi ba ka sebeza ba bañwi ka likute.","We seek to grow through Scripture, prayer, and encouragement.":"Re batla ho hola ka Mangolo, thapelo, le khothatso.","We value welcoming one another, sharing life, and serving our community with care.":"Lu nanga ku amuhelana, ku abelana bupilo, ni ku sebeza setjhaba sa heso ka tlhokomelo.","We welcome one another and share life as a church family.":"Lu amuhelana ni ku abelana bupilo sina lubasi lwa kereke.","We would be glad to hear from you.":"Lwa tabile kwa kuziba hande kuzwa kwa mina.","Wednesdays at 05:30 PM CAT":"Bilabo ka 05:30 PM CAT","We’re here to stand with you":"Lu inzi kwateni ku yema ni mina","What matters to us":"Se si bohlokwa kwa go luna","Who we are":"Luna ki bo mani","Who we are, and why we gather.":"Ki bo lu li, mi ka libaka lu kopana.","Why Us":"Kakuli luna","Women":"Basali","World languages":"Dipuo za linaha ze nngwe","Worship":"Kulapela","Worship and church life":"Kulumela ni bupilo bwa kereke","Worship audio from Royal Priesthood Assemblies International.":"Audio ya borapeli ye zwa kwa Royal Priesthood Assemblies International.","Worship music":"Muzika wa kukomboka","You are welcome here":"Wa amuhelwa kwano","You matter to God, you matter to us.":"U bohlokwa ku Mulimu, u bohlokwa ku luna.","Your email app is opening with your message ready. Please review and send it to the church.":"App ya imeili ya hao i buluka ni molaetsa wa hao o lokilwe. Kwalisa u hlahlobile mi u romele kereke.","Your giving supports local outreach, building expansion, and the spread of the Gospel across Zambia.":"Kufa kwa luna ku kwahilisa misebezi ya mwahae, ku kula kwa ndu, ni ku kalisa Muka Mukwa Mulimu mwa Zambia kaufela.","Youth & teens":"Bashimani ni bakulwana","ZAMTEL MOBILE MONEY":"ZAMTEL MOBILE MONEY","Zambia National Commercial Bank":"Zambia National Commercial Bank","Zambian banks":"Mabanki a Zambia","Zambian languages":"Dipuo za Zambia","Zamtel Mobile Money":"Zamtel Mobile Money","Zanaco":"Zanaco","“Honor the Lord with your possessions, and with the firstfruits of all your increase.”":"“Kanya Mulena ka lika za hao, ni ka lihuto za pele za ku ekeza kaufela hao.”","“Let us hold unswervingly to the hope we profess, for he who promised is faithful.”":"“Ha lu tiyele hande kwa kwa tumelo ye lu e bolelang, kakuli ya ekezize sisupo u wa kwa nnete.”"},"tum":{"(The Pillars)":"(Nsanja)","09:00 AM CAT":"09:00 AM CAT","A Christian church in Lusaka, Zambia, growing together through worship, the Word, and service to our neighbours.":"Mpingo wa Chikhristu ku Lusaka, Zambia, kukura pamoza kwizira mu kusopa, Mazgu, na kuteŵetera ŵazengezgani ŵithu.","A church built on prayer and fellowship":"Mpingo uwo ukazengeka pa lurombo na kuchezga .","A community strengthened by hope":"Mtundu uwo ukulimbikiskika na chigomezgo .","A fresh reading from Rhapsody of Realities each day.":"Kuŵerenga kwasono kufuma ku Rhapsody of Realities zuŵa lililose.","A people of faith, growing together":"Ŵanthu ŵa chipulikano, ŵakukura pamoza .","A place of love where everyone counts":"Malo gha chitemwa uko waliyose wakuzirwa .","A place of love where everyone counts.":"Malo gha chitemwa uko waliyose wakupenda.","A place to belong and to grow":"Malo ghakuti munthu waŵepo na kukura .","A vibrant community where young believers can discover their God-given identity, talents, and career callings.":"Muzi wakukhora uwo ŵawukirano ŵakugomezga ŵangasanga chimanyikwiro chawo cha Chiuta, maluso ghawo, na viyitaniro vyawo vya ntchito.","AIRTEL MOBILE MONEY":"AIRTEL MOBILE MONEY","About":"Pafupifupi","About us":"Vyakukhwaskana na ise","Absa":"Absa","Absa Bank":"Absa Bank","Absa Bank Zambia":"Absa Bank Zambia","Account name":"Zina la akaunti","Account number":"Nambala ya akaunti","Airtel Mobile Money":"Airtel Mobile Money","Along Ndeke Road, Lusaka, Zambia":"Mphepete mwa msewu wa Ndeke, ku Lusaka, ku Zambia","Announcements":"Vipharazgo","Apostle Dr. Mighty Zunga":"Apostle Dr. Mighty Zunga","Apostle Dr. Mighty Zunga in worship":"Apostle Dr. Mighty Zunga mu kusopa","Apostle Dr. Mighty Zunga is the Founder and General Overseer of Royal Priesthood Assemblies International in Lusaka, Zambia. His ministry is expressed through preaching, prayer, discipleship, and the leadership of the church community. He encourages believers to grow in their understanding of Scripture and to put their faith into practice through service.":"Apostle Dr. Mighty Zunga ni Muyambiski na Mulaŵiliri Mukuru wa Royal Priesthood Assemblies International ku Lusaka, Zambia. Uteŵeti wake ukulongosoreka kwizira mu kupharazga, lurombo, kuŵa msambiri, na ulongozgi wa ŵanthu ŵa mu tchalitchi. Wakuchiska ŵakupulikana kuti ŵakure mu kupulikiska kwawo kwa Malemba na kuŵika chipulikano chawo mu ntchito kwizira mu uteŵeti.","As a royal priesthood, we worship God with our whole lives. As disciples, we follow Jesus and help others follow Him, sharing His truth with humility and living it with compassion at home, in the church, and throughout our community.":"Pakuŵa ŵasembe ŵa ufumu, tikusopa Chiuta na umoyo withu wose. Pakuŵa ŵasambiri, tikumulondezga Yesu na kovwira ŵanyithu kuti ŵamulondezge, kugaŵana unenesko wake na kujiyuyura na kuwukhalira na lusungu pa nyumba, mu mpingo, na mu chikaya chithu chose.","Ask about a fellowship":"Fumbani vya ubwezi","Ask about a ride":"Fumbani vya kukwera","Ask on WhatsApp":"Fumbani pa WhatsApp","Audio":"Mazgu","Back to slideshow":"Kuwelera ku chiwoneskero","Branches & Transport":"Nthambi na Mayendero","Call":"Yimbirani foni","Call +260 767 716 936":"Yimbirani foni +260 767 716 936","Centre":"Pakati","Choose one":"Sankhani chimoza","Choose the next step that feels right for you. Your message will be prepared in your email app for you to review and send.":"Sankhani nthowa yakulondezgapo iyo mukuwona kuti njakwenelera kwa imwe. Uthenga winu uzamunozgeka mu pulogiramu yinu ya email kuti muwone na kutuma.","Church Services":"Mauteŵeti gha mu tchalitchi","Church updates":"Vinthu vyasonosono vya tchalitchi","Close menu":"Jalani menyu","Connect with RPAI":"Lumikizanani na RPAI","Connect with a local fellowship for biblical discussion and mutual support.":"Lumikizanani na ŵanyinu kuti mudumbiskane vya Baibolo na kovwirana.","Contact":"Lumikizanani na","Contact the church":"Lumikizanani na tchalitchi .","Contact the church to ask about current Sunday transport availability, pickup points, and arrangements.":"Lumikizanani na tchalitchi kuti mufumbe vya galimoto za pa Sabata izo zilipo sonosono apa, malo ghakutolerapo, na ndondomeko.","Daily Devotional":"Kusopa kwa Zuŵa na Zuŵa","Daily message":"Uthenga wa zuŵa na zuŵa","Email Address":"Adilesi ya Imelo","Email the church":"Tumirani email ku tchalitchi","Empowering and equipping men to take their place of leadership in family, career, and church through focused fellowship and growth sessions, including the Online Royal Men’s Summit.":"Kupereka nkhongono na kunozga ŵanalume kuti ŵatore malo ghawo gha ulongozgi mu mbumba, ntchito, na tchalitchi kwizira mu maungano ghakuŵika mtima pa kuchezga na kukura, kusazgapo Online Royal Men’s Summit.","Every ministry here opens room for worship, prayer, biblical learning, fellowship, and practical service in our community.":"Uteŵeti uliwose pano ukujura malo ghakusoperapo, kulomba, kusambira Baibolo, kuchezga, na uteŵeti wakuchitika mu chikaya chithu.","Explore our ministries":"Wonani uteŵeti withu","FNB":"FNB","FNB Zambia":"FNB Zambia","Facebook only shows its posts to people who are signed in to Facebook, so the live feed below stays blank for many visitors. The button above always works.":"Facebook yikulongora waka ivyo yikulemba ku ŵanthu awo ŵali kunjira mu Facebook, ntheura live feed iyo ili musi umu yikukhala yambura kanthu ku ŵalendo ŵanandi. Batani ilo lili pachanya likugwira ntchito nyengo zose.","Faith in word and action":"Chipulikano mu mazgu na mu milimo .","Faith lived together":"Chipulikano chikakhalanga pamoza .","Fellowship":"Kuchezga","Fellowship locations":"Malo gha chibwezi","Find a Home Cell":"Penjani Selo ya panyumba","Find a church community":"Penjani gulu la tchalitchi","Find a fellowship":"Penjani ubwezi","Find the Sunday gathering location and contact the church about transport and fellowship locations.":"Penjani malo ghakuwunganapo pa Sabata na kuyowoya na mpingo pa vyakwendekwenda na malo ghakuchezgerapo.","Find your place among our ministries.":"Penjani malo ghinu pakati pa mauteŵeti ghithu.","First National Bank":"First National Bank","Follow the church for updates, photos and notices":"Londezgani mpingo kuti mumanye vinthu viphya, vithuzithuzi na vimanyikwiro","Follow us":"Tilondezgani","For help with any of these details, contact the church office.":"Kuti muwovwirike pa chilichose mwa vinthu ivi, fumbani ofesi ya tchalitchi.","Full Name":"Zina lose","Gallery":"Vithuzithuzi","Gallery & Media":"Vithuzithuzi na vyakupharazga","General Overseer & Founder":"Mulaŵiliri Mukuru & Muyambiski","General Overseer and Founder":"Mulaŵiliri Mukuru na Muyambiski","Give":"Kupereka","Give directly to any of our Zambian bank accounts. Please use your name as the reference so the church can acknowledge your gift.":"Mupeleke mwaluŵiro ku akaunti yithu yiliyose ya banki ya ku Zambia. Chonde gwiliskirani ntchito zina linu nga ni chimanyikwiro kuti mpingo uzomerezge chawanangwa chinu.","Give via PayPal":"Kupereka kwizira mu PayPal","Giving details":"Kupereka vyose","Giving from outside Zambia? Use our only international gateway, PayPal.":"Kupereka kufuma kuwaro kwa Zambia? Gwiliskirani nchito chipata chithu chimoza pera cha pa charu chose, PayPal.","God has not forgotten you. His mercies are new every morning.":"Chiuta wakumuluwani yayi. Lusungu lwake lukuŵa luphya mulenji uliwose.","Grow in faith":"Kula mu chipulikano .","Grow with us in faith and fellowship":"Kulani nase mu chipulikano na ubwezi .","Growing in faith":"Kukura mu chipulikano .","Hebrews 10:23":"Hebrews 10:23","Home":"Kunyumba","Home Cell & Branch Fellowships":"Kuyanjana kwa Selo ya pa Nthambi na Nthambi","How can Apostle Dr. Mighty Zunga and the RPAI Prayer Team stand in faith with you this week?":"Kasi Apostle Dr. Mighty Zunga na RPAI Gulu la Lurombo ŵangayima wuli mu chipulikano pamoza na imwe sabata iyi?","How can we connect?":"Kasi tingaŵa ŵakukolerana wuli?","I am looking for a church home":"Nkhupenja nyumba ya tchalitchi","I want to join a local Cell group":"Nkhukhumba kunjira mu gulu la Cell","I want to receive salvation":"Nkhukhumba kupokera chiponosko .","I'm New Here / Connect Card":"Ndine Muphya pano / Khadi lakulumikiza","In Royal Priesthood, love is more than a kind word; it is the life of Christ made visible in the way we welcome, forgive, serve, and stand beside one another. We are called to carry each other's burdens and to make room for every person to grow in faith.":"Mu Usembe wa Ufumu, chitemwa nchakuzirwa chomene kuluska mazgu ghalusungu; ni umoyo wa Khristu uwo ukuwoneka mu umo tikupokelera, kugowokera, kuteŵetera, na kwimilira pafupi na ŵanyithu. Tikuchemeka kuti tinyamurenge katundu wa yumoza na munyake na kupanga malo ghakuti munthu waliyose wakure mu chipulikano.","International giving":"Kupereka vya pa charu chose","I’m New Here / Connect Card":"Ndine Muphya Pano / Khadi la Kulumikizana","John 13:34-35.":"John 13:34-35.","Join Us":"Tiŵeni Nase","Join us every Sunday at 09:00 AM CAT at Otwa Events, Long Acres, Lusaka.":"Tiŵeni nase pa Sabata yiliyose pa 09:00 AM CAT pa Otwa Events, Long Acres, Lusaka.","Join us for Sunday Divine Service at 09:00 AM CAT at Otwa Events, Long Acres, along Ndeke Road in Lusaka.":"Tiŵeni nase pa Uteŵeti wa Ciuta wa pa Sabata pa 09:00 AM CAT pa Otwa Events, Long Acres, pafupi na msewu wa Ndeke ku Lusaka.","Join us in Lusaka":"Tiŵeni nase ku Lusaka","Join us this week":"Tiŵeni nase sabata iyi","Keep Your Faith":"Lutilirani kuŵa na Chipulikano","Keep faith through every season":"Lutilirani kuŵa na chipulikano mu nyengo yiliyose","Know more about us":"Manyani vinandi vya ise","Latest announcements":"Vipharazgo vyasonosono","Latest photos":"Vithuzithuzi vyasonosono","Let us pray for you. Share your needs and we will stand with you in faith and prayer.":"Tiyeni timulomberani. Mugaŵane ivyo mukukhumba ndipo tizamuyimilira namwe mu chipulikano na lurombo.","Listen":"Tegherezgani","Listen to music by LoveWorld Singers and Pastor Chris through licensed music services. Use each service's own purchase or download option where available.":"Tegherezgani ku sumu za LoveWorld Singers na Muliska Chris kwizira mu mauteŵeti gha sumu ghakuzomerezgeka. Gwiliskirani nchito ivyo mungagura panji kuseŵezeska pa dawunilodi para vilipo.","Live Service":"Uteŵeti wamoyo","Loading...":"Kukwezga...","Local fellowships":"Kuchezga kwa mu chigaŵa","Local gatherings, including groups meeting in areas such as Chalala, for biblical discussion, mutual support, and neighbourly care.":"Maungano gha mu chigaŵa, kusazgapo magulu agho ghakuwungana mu malo nga ni Chalala, kuti ŵadumbiskane vya Baibolo, kovwirana, na kupwelelera ŵazengezgani.","Love that forms disciples":"Chitemwa icho chikupanga ŵasambiri .","LoveWorld Singers on Apple Music":"Ŵakwimba ŵa pa Apple Music","LoveWorld Singers on Spotify":"Ŵakwimba ŵa pa Spotify","LoveWorld Singers on YouTube Music":"LoveWorld Singers pa YouTube Music","Lusaka Main Centre":"Lusaka Main Centre","MTN MOBILE MONEY":"MTN MOBILE MONEY","MTN Mobile Money":"MTN Mobile Money","Meet with us Wednesdays at 05:30 PM CAT for interactive fellowship, virtually and in cell locations.":"Kumanani nase pa Chitatu pa 05:30 PM CAT kuti tiŵe ŵakukolerana, pafupifupi na mu malo gha maselo.","Men":"Ŵanalume","Mid-Week Fellowship":"Kuchezga pakati pa sabata","Mid-Week Interactive Fellowship":"Kuchezga kwapakati pa sabata","Ministries":"Uteŵeti","Ministries & Fellowships":"Uteŵeti na Ubwezi","Mobile Money":"Ndalama za pa foni","PayPal email":"Imeyili ya PayPal","Moments of worship, prayer, fellowship, and ministry from Royal Priesthood Assemblies International.":"Nyengo zakusopera, lurombo, kuchezga, na uteŵeti kufuma ku Royal Priesthood Assemblies International.","Next photos":"Vithuzithuzi vyakulondezgapo","Next steps":"Nthowa zakulondezgapo","NextGen Youth & Teen Ministry":"Uteŵeti wa Ŵawukirano na Ŵawukirano ŵa NextGen","Open directions in Google Maps":"Julani nthowa mu mapu gha Google","Open menu":"Julani menyu","Open the church's Facebook page":"Julani tchati cha Facebook cha tchalitchi","Otwa Events, Long Acres":"Otwa Events, Long Acres","Otwa Events, Long Acres, along Ndeke Road, Lusaka, Zambia":"Otwa Events, Long Acres, pafupi na msewu wa Ndeke, ku Lusaka, ku Zambia","Our Founder":"Munthu uyo wakatimbika","Our Services":"Mauteŵeti ghithu","Our ministries":"Uteŵeti withu","Our ministries create opportunities for worship, prayer, biblical learning, fellowship, and practical service in the community.":"Uteŵeti withu ukupanga mwaŵi wa kusopa, kulomba, kusambira Baibolo, kuchezga, na kugwira ntchito mu chikaya.","Our mission":"Ntchito yithu","Our vision":"Mboniwoni yithu","Pal":"Pal","Partner with us":"Muŵe na ise","Pastor Chris on Apple Music":"Mliska Chris pa nyimbo za Apple","Pastor Chris on Spotify":"Mliska Chris pa Spotify","Pastor Chris on YouTube Music":"Mliska Chris pa YouTube Music","Pastor Thelma welcome you to Royal Priesthood Assemblies International.":"Pastor Thelma tikumupokelerani ku Royal Priesthood Assemblies International.","Pause slideshow":"Lekani kuwoneska","Pay":"Lipirani","PayPal":"PayPal","Phone Number":"Nambala ya foni","Photographs from worship gatherings and ministry moments. Select any photograph to view it larger.":"Vithuzithuzi vyakufuma pa maungano gha kusopa na nyengo za uteŵeti. Sankhani chithuzithuzi chilichose kuti muwone chikuru.","Plan Your Visit":"Nozgekerani Ulendo Winu","Plan your visit":"Nozgekerani ulendo winu","Play slideshow":"Seŵerani vithuzithuzi","Previous photos":"Vithuzi vyakumanyuma","Proverbs 3:9":"Proverbs 3:9","ROYAL PRIESTHOOD ASSEMBLIES INTERNATIONAL":"ROYAL PRIESTHOOD ASSEMBLIES INTERNATIONAL","ROYAL Priesthood Assemblies International":"ROYAL Priesthood Assemblies International","RPAI lists local home-cell and branch fellowships, including gatherings in Chalala. Contact the church for current meeting locations, schedules, and details about other branches.":"RPAI wakulemba maungano gha ku nyumba na gha nthambi, kusazgapo maungano gha ku Chalala. Lumikizanani na tchalitchi kuti mumanye malo gha maungano ghasono, ndondomeko, na vinyake vyakukhwaskana na nthambi zinyake.","Raising spiritual mothers, career women, and impactful leaders through local sisterhood fellowships and prayer clusters.":"Kulera ŵamama ŵauzimu, ŵanakazi ŵa ntchito, na ŵalongozgi ŵakukhwaska kwizira mu maungano gha ŵadumbu ŵa mu chigaŵa na magulu gha lurombo.","Read the complete daily devotional from the official Rhapsody of Realities reading page.":"Ŵazgani chisambizgo chose cha zuŵa na zuŵa kufuma pa Rhapsody of Realities, peji likuru lakuzomerezgeka la kuŵazga.","Read today's devotional":"Ŵazgani nkhani yakusopa ya lero","Read today's message on the official Rhapsody of Realities site, and spend a few quiet minutes with God before the day begins.":"Ŵazgani uthenga wa lero pa webusayiti yakuzomerezgeka ya Rhapsody of Realities, ndipo khalani na Chiuta kwa maminiti ghachoko waka pambere zuŵa lindambe.","Recent public posts from the Royal Priesthood Assemblies International Facebook page.":"Ivyo ŵanthu ŵakulemba sonosono apa kufuma pa Royal Priesthood Assemblies International Facebook page.","Recordings":"Vyakujambulika","Request a Prayer":"Pemphani Lurombo","Rhapsody of Realities":"Rhapsody of Realities","Rooted in faith. United in fellowship.":"Kukhazikika mu chipulikano. Kukolerana mu ubwezi.","Royal Men's Fellowship":"Ubwezi wa Ŵanalume ŵa Ufumu","Royal Men’s Fellowship":"Ubwezi wa Ŵanalume ŵa Ufumu","Royal Priesthood Assemblies International":"Royal Priesthood Assemblies International","Royal Priesthood Assemblies International can add direct audio downloads when it has the tracks and permission to distribute them.":"Royal Priesthood Assemblies International lingasazgirako vyakupulikika vyakulongozgeka para lili na sumu na chizomerezgo cha kugaŵira.","Royal Priesthood Assemblies International is a Christian church based in Lusaka, Zambia. Our church life is centred on worship, biblical teaching, prayer, fellowship, and service.":"Royal Priesthood Assemblies International ni mpingo wa Chikhristu uwo uli ku Lusaka, Zambia. Umoyo withu wa mpingo ukukhazikika pa kusopa, kusambizga Baibolo, lurombo, kuchezga, na uteŵeti.","Royal Priesthood Assemblies International is a church family in Lusaka, Zambia. We gather to worship, grow in faith, and serve our community.":"Royal Priesthood Assemblies International ni mbumba ya tchalitchi ku Lusaka, Zambia. Tikuwungana kuti tisope, kukura mu chipulikano, na kuteŵetera ŵanthu ŵa mu chigaŵa chithu.","Royal Priesthood Assemblies International. All rights reserved.":"Royal Priesthood Assemblies International. Mazgu ghose ghakusungika.","Scripture:":"Lemba:","Select language":"Sankhani chiyowoyero","Send Connect Card":"Tumirani khadi lakulumikizgana","Send Prayer Request":"Tumirani Pempho la Lurombo","Send a prayer request, plan your visit, or ask us anything.":"Tumirani pempho la lurombo, nozgekerani ulendo winu, panji tifumbani chilichose.","Send us your prayer request":"Titumirani pempho linu la lurombo","Serve with care":"Kuteŵetera mwakupwelelera","Service video":"Vidiyo ya uteŵeti","Share a Prayer Request":"Kugaŵana Pempho la Lurombo","Show all pictures":"Longorani vithuzithuzi vyose","Show slideshow":"Longorani vithuzithuzi","Songs and downloads":"Nyimbo na vyakukopera","Songs from the church":"Nyimbo zakufuma ku tchalitchi .","Stanbic":"Stanbic","Stanbic Bank":"Stanbic Bank","Stanbic Bank Zambia":"Stanbic Bank Zambia","Standard Chartered":"Standard Chartered","Standard Chartered Zambia":"Standard Chartered Zambia","Stream live service":"Kuwonelera mauteŵeti ghamoyo","Stream live service and find the latest worship and ministry videos from Royal Priesthood Assemblies International.":"Onani uteŵeti wa pa intaneti na kusanga mavidiyo ghasono gha kusopa na uteŵeti kufuma ku Royal Priesthood Assemblies International.","Sunday Divine Service":"Uteŵeti wa Chiuta wa pa Sabata","Sunday Transport & Branches":"Mayendero gha pa Sabata na Nthambi","Sunday Worship":"Kusopa kwa pa Sabata","Sunday gallery":"Vithuzithuzi vya pa Sabata","Sunday photos":"Vithuzithuzi vya pa Sabata","Sunday service":"Uteŵeti wa pa Sabata","Sunday service moves to 8am from 1 December.":"Uteŵeti wa pa Sabata ukusuntha ku 8am kufuma pa 1 December.","Sunday transport":"Mayendero gha pa Sabata","Sunday worship":"Kusopa kwa pa Sabata","The ten newest photographs sent by the church":"Vithuzithuzi khumi viphya ivyo tchalitchi likatuma .","To be confirmed":"Kuti mukhozgeke","To proclaim the Gospel, encourage spiritual growth through Scripture and prayer, and serve our neighbours with compassion.":"Kuti tipharazge Uthenga Uwemi, kulimbikiska kukura kwauzimu kwizira mu Malemba na lurombo, na kuteŵetera ŵanyithu na lusungu.","To see people and communities strengthened by the hope of Christ and equipped to live out their faith.":"Kuti ŵawone ŵanthu na mitundu ŵakukhozgeka na chigomezgo cha Khristu na kunozgekera kuti ŵakhalenge mwakuyana na chipulikano chawo.","Today's podcast":"Podcast ya lero","Today's reading":"Kuŵerenga kwa lero","Updates from Royal Priesthood Assemblies International.":"Vyakusintha kufuma ku Royal Priesthood Assemblies International.","Video":"Vidiyo","Virtual and cell locations":"Malo ghakuwoneka na maselo","Virtuous Women’s Ministry":"Uteŵeti wa Ŵanakazi Ŵawemi","Watch":"Wonani","Watch a message from the ministry.":"Wonani uthenga wakufuma mu uteŵeti.","Ways to give":"Nthowa zakupelekera .","We aim to serve our neighbours and community with care.":"Tikukhumba kuteŵetera ŵazengezgani ŵithu na ŵanthu ŵa mu chigaŵa chithu mwakupwelelera.","We gather to honour God and make room for prayer, praise, and gratitude.":"Tikuwungana kuti tichindike Chiuta na kupanga malo ghakulombera, kulumba, na kuwonga.","We gather to honour God through prayer, praise, and gratitude.":"Tikuwungana kuti tichindike Chiuta kwizira mu lurombo, kulumba, na kuwonga.","We seek to build a life of faith through Scripture, prayer, and encouragement.":"Tikukhumba kuzenga umoyo wa chipulikano kwizira mu Malemba, lurombo, na kukhozga.","We seek to create a welcoming community where people can learn Scripture, strengthen their faith, and serve others with compassion.":"Tikukhumba kupanga malo ghakupokelera ŵalendo umo ŵanthu ŵangasambilira Malemba, kulimbikiska chipulikano chawo, na kuteŵetera ŵanyawo na lusungu.","We seek to grow through Scripture, prayer, and encouragement.":"Tikukhumba kukura kwizira mu Malemba, lurombo, na kukhozga.","We value welcoming one another, sharing life, and serving our community with care.":"Tikuwona kuti kupokelerana, kugaŵana umoyo, na kuteŵetera ŵanthu ŵa mu chigaŵa chithu mwakupwelelera.","We welcome one another and share life as a church family.":"Tikupokelerana na kugaŵana umoyo nga ni mbumba ya tchalitchi.","We would be glad to hear from you.":"Tiŵenge ŵakukondwa kupulika kufuma kwa imwe.","Wednesdays at 05:30 PM CAT":"Lachitatu pa 05:30 PM CAT","We’re here to stand with you":"Tili pano kuti tiyime namwe","What matters to us":"Ivyo ni vyakuzirwa kwa ise .","Who we are":"Ndise njani","Who we are, and why we gather.":"Tili ŵanjani, ndipo chifukwa wuli tikuwungana.","Why Us":"Chifukwa Ise","Women":"Ŵanakazi","World languages":"Viyowoyero vya pa charu chose","Worship":"Kusopa","Worship and church life":"Kusopa na umoyo wa tchalitchi .","Worship audio from Royal Priesthood Assemblies International.":"Kusopa kwa mazgu kufuma ku Royal Priesthood Assemblies International.","Worship music":"Nyimbo zakusopa","You are welcome here":"Mwapokelereka kuno","You matter to God, you matter to us.":"Muli ŵakuzirwa kwa Ciuta, ndimwe ŵakuzirwa kwa ise.","Your email app is opening with your message ready. Please review and send it to the church.":"App yinu ya email yikujulika na uthenga winu wakunozgeka. Chonde wonani na kutumizga ku tchalitchi.","Your giving supports local outreach, building expansion, and the spread of the Gospel across Zambia.":"Kupereka kwanu kukovwira pa mulimo wa kupharazga mu chigaŵa chinu, kukuzga nyumba, na kuthandazga Uthenga Uwemi mu Zambia yose.","Youth & teens":"Ŵawukirano na ŵawukirano","ZAMTEL MOBILE MONEY":"ZAMTEL MOBILE MONEY","Zambia National Commercial Bank":"Zambia National Commercial Bank","Zambian banks":"Mabanki gha ku Zambia","Zambian languages":"Viyowoyero vya ku Zambia","Zamtel Mobile Money":"Zamtel Mobile Money","Zanaco":"Zanaco","“Honor the Lord with your possessions, and with the firstfruits of all your increase.”":"“Chindika Fumu na katundu wako, na vipambi vyakwamba vya vipambi vyako vyose.”","“Let us hold unswervingly to the hope we profess, for he who promised is faithful.”":"“Tiyeni tikoleske chigomezgo icho tikuyowoya, pakuti uyo wakalayizga ngwakugomezgeka.”"},"hi":{"(The Pillars)":"(स्तम्भ)","09:00 AM CAT":"09:00 AM CAT","A Christian church in Lusaka, Zambia, growing together through worship, the Word, and service to our neighbours.":"लुसाका, ज़ाम्बिया में एक ईसाई चर्च, पूजा, वचन और हमारे पड़ोसियों की सेवा के माध्यम से एक साथ बढ़ रहा है।","A church built on prayer and fellowship":"प्रार्थना और संगति पर बना एक चर्च","A community strengthened by hope":"एक समुदाय आशा से मजबूत हुआ","A fresh reading from Rhapsody of Realities each day.":"प्रत्येक दिन Rhapsody of Realities से एक ताज़ा पाठन।","A people of faith, growing together":"आस्थावान लोग, एक साथ बढ़ रहे हैं","A place of love where everyone counts":"प्यार की एक जगह जहां हर कोई मायने रखता है","A place of love where everyone counts.":"प्यार की एक जगह जहां हर कोई मायने रखता है।","A place to belong and to grow":"संबंधित होने और विकसित होने का स्थान","A vibrant community where young believers can discover their God-given identity, talents, and career callings.":"एक जीवंत समुदाय जहां युवा विश्वासी अपनी ईश्वर प्रदत्त पहचान, प्रतिभा और करियर की खोज कर सकते हैं।","AIRTEL MOBILE MONEY":"AIRTEL MOBILE MONEY","About":"के बारे में","About us":"हमारे बारे में","Absa":"अबसा","Absa Bank":"Absa Bank","Absa Bank Zambia":"Absa Bank Zambia","Account name":"खाता नाम","Account number":"खाता संख्या","Airtel Mobile Money":"Airtel Mobile Money","Along Ndeke Road, Lusaka, Zambia":"नडेके रोड, लुसाका, जाम्बिया के साथ","Announcements":"घोषणाएँ","Apostle Dr. Mighty Zunga":"Apostle Dr. Mighty Zunga","Apostle Dr. Mighty Zunga in worship":"Apostle Dr. Mighty Zunga पूजा में","Apostle Dr. Mighty Zunga is the Founder and General Overseer of Royal Priesthood Assemblies International in Lusaka, Zambia. His ministry is expressed through preaching, prayer, discipleship, and the leadership of the church community. He encourages believers to grow in their understanding of Scripture and to put their faith into practice through service.":"Apostle Dr. Mighty Zunga लुसाका, ज़ाम्बिया में Royal Priesthood Assemblies International के संस्थापक और जनरल ओवरसियर हैं। उनका मंत्रालय उपदेश, प्रार्थना, शिष्यत्व और चर्च समुदाय के नेतृत्व के माध्यम से व्यक्त किया जाता है। वह विश्वासियों को पवित्रशास्त्र की समझ बढ़ाने और सेवा के माध्यम से अपने विश्वास को अभ्यास में लाने के लिए प्रोत्साहित करता है।","As a royal priesthood, we worship God with our whole lives. As disciples, we follow Jesus and help others follow Him, sharing His truth with humility and living it with compassion at home, in the church, and throughout our community.":"एक शाही पुरोहित वर्ग के रूप में, हम अपने पूरे जीवन से भगवान की पूजा करते हैं। शिष्यों के रूप में, हम यीशु का अनुसरण करते हैं और दूसरों को उनका अनुसरण करने में मदद करते हैं, उनकी सच्चाई को विनम्रता के साथ साझा करते हैं और इसे घर, चर्च और हमारे पूरे समुदाय में करुणा के साथ जीते हैं।","Ask about a fellowship":"संगति के बारे में पूछें","Ask about a ride":"सवारी के बारे में पूछें","Ask on WhatsApp":"व्हाट्सएप पर पूछें","Audio":"ऑडियो","Back to slideshow":"स्लाइड शो पर वापस जाएँ","Branches & Transport":"शाखाएँ एवं परिवहन","Call":"बुलाओ","Call +260 767 716 936":"+260 767 716 936 पर कॉल करें","Centre":"केंद्र","Choose one":"एक चुनें","Choose the next step that feels right for you. Your message will be prepared in your email app for you to review and send.":"अगला चरण चुनें जो आपके लिए सही लगे। आपका संदेश आपके ईमेल ऐप में समीक्षा करने और भेजने के लिए तैयार किया जाएगा।","Church Services":"चर्च सेवाएँ","Church updates":"चर्च अद्यतन","Close menu":"मेनू बंद करें","Connect with RPAI":"RPAI से जुड़ें","Connect with a local fellowship for biblical discussion and mutual support.":"बाइबिल चर्चा और आपसी सहयोग के लिए स्थानीय संगति से जुड़ें।","Contact":"संपर्क करें","Contact the church":"चर्च से संपर्क करें","Contact the church to ask about current Sunday transport availability, pickup points, and arrangements.":"वर्तमान रविवार परिवहन उपलब्धता, पिकअप पॉइंट और व्यवस्थाओं के बारे में पूछने के लिए चर्च से संपर्क करें।","Daily Devotional":"दैनिक भक्ति","Daily message":"दैनिक संदेश","Email Address":"ईमेल पता","Email the church":"चर्च को ईमेल करें","Empowering and equipping men to take their place of leadership in family, career, and church through focused fellowship and growth sessions, including the Online Royal Men’s Summit.":"ऑनलाइन रॉयल मेन्स समिट सहित केंद्रित फ़ेलोशिप और विकास सत्रों के माध्यम से पुरुषों को परिवार, करियर और चर्च में नेतृत्व का स्थान लेने के लिए सशक्त और सक्षम बनाना।","Every ministry here opens room for worship, prayer, biblical learning, fellowship, and practical service in our community.":"यहां प्रत्येक मंत्रालय हमारे समुदाय में पूजा, प्रार्थना, बाइबिल शिक्षा, संगति और व्यावहारिक सेवा के लिए जगह खोलता है।","Explore our ministries":"हमारे मंत्रालयों का अन्वेषण करें","FNB":"एफएनबी","FNB Zambia":"FNB Zambia","Facebook only shows its posts to people who are signed in to Facebook, so the live feed below stays blank for many visitors. The button above always works.":"फेसबुक केवल उन्हीं लोगों को अपनी पोस्ट दिखाता है जो फेसबुक पर साइन इन हैं, इसलिए नीचे दी गई लाइव फ़ीड कई आगंतुकों के लिए खाली रहती है। ऊपर दिया गया बटन हमेशा काम करता है.","Faith in word and action":"कथनी और करनी में विश्वास","Faith lived together":"आस्था साथ रहती थी","Fellowship":"संगति","Fellowship locations":"संगति स्थान","Find a Home Cell":"एक होम सेल खोजें","Find a church community":"एक चर्च समुदाय खोजें","Find a fellowship":"संगति खोजें","Find the Sunday gathering location and contact the church about transport and fellowship locations.":"रविवार की सभा का स्थान खोजें और परिवहन तथा संगति स्थानों के बारे में चर्च से संपर्क करें।","Find your place among our ministries.":"हमारे मंत्रालयों के बीच अपना स्थान खोजें।","First National Bank":"First National Bank","Follow the church for updates, photos and notices":"अपडेट, फ़ोटो और नोटिस के लिए चर्च का अनुसरण करें","Follow us":"हमें फ़ॉलो करें","For help with any of these details, contact the church office.":"इनमें से किसी भी विवरण में सहायता के लिए, चर्च कार्यालय से संपर्क करें।","Full Name":"पूरा नाम","Gallery":"गैलरी","Gallery & Media":"गैलरी और मीडिया","General Overseer & Founder":"जनरल ओवरसियर और संस्थापक","General Overseer and Founder":"जनरल ओवरसियर और संस्थापक","Give":"देना","Give directly to any of our Zambian bank accounts. Please use your name as the reference so the church can acknowledge your gift.":"हमारे किसी भी जाम्बिया बैंक खाते में सीधे दें। कृपया संदर्भ के रूप में अपना नाम उपयोग करें ताकि चर्च आपके उपहार को स्वीकार कर सके।","Give via PayPal":"PayPal के माध्यम से दें","Giving details":"विवरण दे रहा हूँ","Giving from outside Zambia? Use our only international gateway, PayPal.":"जाम्बिया के बाहर से दे रहे हैं? हमारे एकमात्र अंतर्राष्ट्रीय गेटवे का उपयोग करें, PayPal.","God has not forgotten you. His mercies are new every morning.":"भगवान तुम्हें नहीं भूले हैं. उसकी दया हर सुबह नई होती है।","Grow in faith":"विश्वास में बढ़ो","Grow with us in faith and fellowship":"हमारे साथ विश्वास और संगति में बढ़ें","Growing in faith":"विश्वास में बढ़ रहा है","Hebrews 10:23":"Hebrews 10:23","Home":"घर","Home Cell & Branch Fellowships":"होम सेल और शाखा संगति","How can Apostle Dr. Mighty Zunga and the RPAI Prayer Team stand in faith with you this week?":"इस सप्ताह Apostle Dr. Mighty Zunga और RPAI प्रार्थना टीम आपके साथ विश्वास में कैसे खड़ी रह सकती है?","How can we connect?":"हम कैसे जुड़ सकते हैं?","I am looking for a church home":"मैं एक चर्च घर की तलाश में हूं","I want to join a local Cell group":"मैं एक स्थानीय सेल समूह में शामिल होना चाहता हूं","I want to receive salvation":"मुझे मोक्ष प्राप्त करना है","I'm New Here / Connect Card":"मैं यहां नया हूं / कार्ड कनेक्ट करें","In Royal Priesthood, love is more than a kind word; it is the life of Christ made visible in the way we welcome, forgive, serve, and stand beside one another. We are called to carry each other's burdens and to make room for every person to grow in faith.":"रॉयल प्रीस्टहुड में, प्यार एक दयालु शब्द से कहीं अधिक है; यह मसीह का जीवन है जो हमारे एक दूसरे का स्वागत करने, क्षमा करने, सेवा करने और एक दूसरे के साथ खड़े होने के तरीके में दिखाई देता है। हमें एक-दूसरे का बोझ उठाने और प्रत्येक व्यक्ति के विश्वास में वृद्धि के लिए जगह बनाने के लिए बुलाया गया है।","International giving":"अंतर्राष्ट्रीय देना","I’m New Here / Connect Card":"मैं यहां नया हूं / कार्ड कनेक्ट करें","John 13:34-35.":"John 13:34-35.","Join Us":"हमसे जुड़ें","Join us every Sunday at 09:00 AM CAT at Otwa Events, Long Acres, Lusaka.":"हर रविवार को 09:00 AM CAT, लुसाका में हमसे जुड़ें।","Join us for Sunday Divine Service at 09:00 AM CAT at Otwa Events, Long Acres, along Ndeke Road in Lusaka.":"लुसाका में नडेके रोड के किनारे 09:00 AM CAT पर रविवार की दिव्य सेवा के लिए हमसे जुड़ें।","Join us in Lusaka":"लुसाका में हमसे जुड़ें","Join us this week":"इस सप्ताह हमसे जुड़ें","Keep Your Faith":"अपना विश्वास बनाए रखें","Keep faith through every season":"हर मौसम में विश्वास बनाए रखें","Know more about us":"हमारे बारे में और जानें","Latest announcements":"नवीनतम घोषणाएँ","Latest photos":"नवीनतम तस्वीरें","Let us pray for you. Share your needs and we will stand with you in faith and prayer.":"आइए हम आपके लिए प्रार्थना करें. अपनी ज़रूरतें साझा करें और हम विश्वास और प्रार्थना में आपके साथ खड़े रहेंगे।","Listen":"सुनो","Listen to music by LoveWorld Singers and Pastor Chris through licensed music services. Use each service's own purchase or download option where available.":"लाइसेंस प्राप्त संगीत सेवाओं के माध्यम से लववर्ल्ड सिंगर्स और पादरी क्रिस का संगीत सुनें। जहां उपलब्ध हो, प्रत्येक सेवा की अपनी खरीद या डाउनलोड विकल्प का उपयोग करें।","Live Service":"लाइव सेवा","Loading...":"लोड हो रहा है...","Local fellowships":"स्थानीय संगति","Local gatherings, including groups meeting in areas such as Chalala, for biblical discussion, mutual support, and neighbourly care.":"बाइबिल पर चर्चा, आपसी सहयोग और पड़ोसी की देखभाल के लिए चलाला जैसे क्षेत्रों में समूहों की बैठक सहित स्थानीय सभाएँ।","Love that forms disciples":"प्रेम जो शिष्यों का निर्माण करता है","LoveWorld Singers on Apple Music":"एप्पल म्यूजिक पर लववर्ल्ड सिंगर्स","LoveWorld Singers on Spotify":"Spotify पर लववर्ल्ड सिंगर्स","LoveWorld Singers on YouTube Music":"YouTube Music पर LoveWorld Singers","Lusaka Main Centre":"Lusaka Main Centre","MTN MOBILE MONEY":"MTN MOBILE MONEY","MTN Mobile Money":"MTN Mobile Money","Meet with us Wednesdays at 05:30 PM CAT for interactive fellowship, virtually and in cell locations.":"इंटरैक्टिव संगति के लिए बुधवार शाम 05:30 बजे CAT पर हमसे ऑनलाइन और होम सेल स्थानों पर मिलें।","Men":"पुरुष","Mid-Week Fellowship":"मध्य सप्ताह संगति","Mid-Week Interactive Fellowship":"मध्य-सप्ताह संवादात्मक संगति","Ministries":"मंत्रालय","Ministries & Fellowships":"मंत्रालय और संगति","Mobile Money":"मोबाइल मनी","PayPal email":"PayPal ईमेल","Moments of worship, prayer, fellowship, and ministry from Royal Priesthood Assemblies International.":"Royal Priesthood Assemblies International से पूजा, प्रार्थना, संगति और मंत्रालय के क्षण।","Next photos":"अगली तस्वीरें","Next steps":"अगले चरण","NextGen Youth & Teen Ministry":"नेक्स्टजेन युवा एवं किशोर मंत्रालय","Open directions in Google Maps":"Google मानचित्र में दिशानिर्देश खोलें","Open menu":"मेनू खोलें","Open the church's Facebook page":"चर्च का फेसबुक पेज खोलें","Otwa Events, Long Acres":"Otwa Events, Long Acres","Otwa Events, Long Acres, along Ndeke Road, Lusaka, Zambia":"Otwa Events, Long Acres, नडेके रोड के किनारे, लुसाका, ज़ाम्बिया","Our Founder":"हमारे संस्थापक","Our Services":"हमारी सेवाएँ","Our ministries":"हमारे मंत्रालय","Our ministries create opportunities for worship, prayer, biblical learning, fellowship, and practical service in the community.":"हमारे मंत्रालय समुदाय में पूजा, प्रार्थना, बाइबिल सीखने, संगति और व्यावहारिक सेवा के अवसर पैदा करते हैं।","Our mission":"हमारा विशेष कार्य","Our vision":"हमारी दृष्टि","Pal":"पाल","Partner with us":"हमारे साथ भागीदार बनें","Pastor Chris on Apple Music":"एप्पल म्यूजिक पर पादरी क्रिस","Pastor Chris on Spotify":"Spotify पर पादरी क्रिस","Pastor Chris on YouTube Music":"YouTube Music पर पादरी क्रिस","Pastor Thelma welcome you to Royal Priesthood Assemblies International.":"Pastor Thelma आपका Royal Priesthood Assemblies International में स्वागत करती हैं।","Pause slideshow":"स्लाइड शो रोकें","Pay":"भुगतान करें","PayPal":"PayPal","Phone Number":"फ़ोन नंबर","Photographs from worship gatherings and ministry moments. Select any photograph to view it larger.":"पूजा सभाओं और मंत्रालय के क्षणों की तस्वीरें। किसी भी तस्वीर को बड़ा करके देखने के लिए उसका चयन करें।","Plan Your Visit":"अपनी यात्रा की योजना बनाएं","Plan your visit":"अपनी यात्रा की योजना बनाएं","Play slideshow":"स्लाइड शो चलायें","Previous photos":"पिछली तस्वीरें","Proverbs 3:9":"Proverbs 3:9","ROYAL PRIESTHOOD ASSEMBLIES INTERNATIONAL":"ROYAL PRIESTHOOD ASSEMBLIES INTERNATIONAL","ROYAL Priesthood Assemblies International":"ROYAL Priesthood Assemblies International","RPAI lists local home-cell and branch fellowships, including gatherings in Chalala. Contact the church for current meeting locations, schedules, and details about other branches.":"RPAI चलाला में सभाओं सहित स्थानीय होम-सेल और शाखा संगति को सूचीबद्ध करता है। वर्तमान बैठक स्थानों, कार्यक्रमों और अन्य शाखाओं के विवरण के लिए चर्च से संपर्क करें।","Raising spiritual mothers, career women, and impactful leaders through local sisterhood fellowships and prayer clusters.":"स्थानीय महिला संगति और प्रार्थना समूहों के माध्यम से आध्यात्मिक माताओं, कैरियर महिलाओं और प्रभावशाली नेताओं को तैयार करना।","Read the complete daily devotional from the official Rhapsody of Realities reading page.":"आधिकारिक Rhapsody of Realities वाचन पृष्ठ से संपूर्ण दैनिक भक्ति पढ़ें।","Read today's devotional":"पढ़ें आज की भक्ति","Read today's message on the official Rhapsody of Realities site, and spend a few quiet minutes with God before the day begins.":"आधिकारिक Rhapsody of Realities साइट पर आज का संदेश पढ़ें, और दिन शुरू होने से पहले भगवान के साथ कुछ शांत मिनट बिताएँ।","Recent public posts from the Royal Priesthood Assemblies International Facebook page.":"Royal Priesthood Assemblies International के फेसबुक पेज से हाल की सार्वजनिक पोस्ट।","Recordings":"रिकॉर्डिंग","Request a Prayer":"प्रार्थना का अनुरोध करें","Rhapsody of Realities":"Rhapsody of Realities","Rooted in faith. United in fellowship.":"विश्वास में स्थिर। संगति में एकजुट।","Royal Men's Fellowship":"रॉयल मेन्स फ़ेलोशिप","Royal Men’s Fellowship":"रॉयल मेन्स फ़ेलोशिप","Royal Priesthood Assemblies International":"Royal Priesthood Assemblies International","Royal Priesthood Assemblies International can add direct audio downloads when it has the tracks and permission to distribute them.":"Royal Priesthood Assemblies International जब उसके पास ट्रैक और उन्हें वितरित करने की अनुमति हो तो वह सीधे ऑडियो डाउनलोड जोड़ सकता है।","Royal Priesthood Assemblies International is a Christian church based in Lusaka, Zambia. Our church life is centred on worship, biblical teaching, prayer, fellowship, and service.":"Royal Priesthood Assemblies International लुसाका, जाम्बिया में स्थित एक ईसाई चर्च है। हमारा चर्च जीवन पूजा, बाइबिल शिक्षण, प्रार्थना, संगति और सेवा पर केंद्रित है।","Royal Priesthood Assemblies International is a church family in Lusaka, Zambia. We gather to worship, grow in faith, and serve our community.":"Royal Priesthood Assemblies International लुसाका, जाम्बिया में एक चर्च परिवार है। हम पूजा करने, विश्वास बढ़ाने और अपने समुदाय की सेवा करने के लिए एकत्रित होते हैं।","Royal Priesthood Assemblies International. All rights reserved.":"Royal Priesthood Assemblies International. सर्वाधिकार सुरक्षित।","Scripture:":"धर्मग्रंथ:","Select language":"भाषा चुनें","Send Connect Card":"कनेक्ट कार्ड भेजें","Send Prayer Request":"प्रार्थना अनुरोध भेजें","Send a prayer request, plan your visit, or ask us anything.":"प्रार्थना अनुरोध भेजें, अपनी यात्रा की योजना बनाएं, या हमसे कुछ भी पूछें।","Send us your prayer request":"हमें अपना प्रार्थना अनुरोध भेजें","Serve with care":"सावधानी से परोसें","Service video":"सेवा वीडियो","Share a Prayer Request":"प्रार्थना अनुरोध साझा करें","Show all pictures":"सभी चित्र दिखाएँ","Show slideshow":"स्लाइड शो दिखाएँ","Songs and downloads":"गाने और डाउनलोड","Songs from the church":"चर्च के गाने","Stanbic":"स्टैनबिक","Stanbic Bank":"Stanbic Bank","Stanbic Bank Zambia":"Stanbic Bank Zambia","Standard Chartered":"Standard Chartered","Standard Chartered Zambia":"Standard Chartered Zambia","Stream live service":"लाइव सेवा स्ट्रीम करें","Stream live service and find the latest worship and ministry videos from Royal Priesthood Assemblies International.":"लाइव सेवा स्ट्रीम करें और Royal Priesthood Assemblies International से नवीनतम पूजा और मंत्रालय वीडियो ढूंढें।","Sunday Divine Service":"रविवार दिव्य सेवा","Sunday Transport & Branches":"रविवार परिवहन एवं शाखाएँ","Sunday Worship":"रविवार की पूजा","Sunday gallery":"रविवार गैलरी","Sunday photos":"रविवार की तस्वीरें","Sunday service":"रविवार सेवा","Sunday service moves to 8am from 1 December.":"1 दिसंबर से रविवार की सेवा सुबह 8 बजे तक कर दी गई है।","Sunday transport":"रविवार परिवहन","Sunday worship":"रविवार की पूजा","The ten newest photographs sent by the church":"चर्च द्वारा भेजी गई दस नवीनतम तस्वीरें","To be confirmed":"पुष्टि की जानी है","To proclaim the Gospel, encourage spiritual growth through Scripture and prayer, and serve our neighbours with compassion.":"सुसमाचार का प्रचार करना, धर्मग्रंथ और प्रार्थना के माध्यम से आध्यात्मिक विकास को प्रोत्साहित करना और करुणा के साथ अपने पड़ोसियों की सेवा करना।","To see people and communities strengthened by the hope of Christ and equipped to live out their faith.":"लोगों और समुदायों को मसीह की आशा से मजबूत होते और अपने विश्वास को जीने के लिए सुसज्जित देखना।","Today's podcast":"आज का पॉडकास्ट","Today's reading":"आज का वाचन","Updates from Royal Priesthood Assemblies International.":"Royal Priesthood Assemblies International से अपडेट.","Video":"वीडियो","Virtual and cell locations":"आभासी और सेल स्थान","Virtuous Women’s Ministry":"सदाचारी महिला मंत्रालय","Watch":"देखो","Watch a message from the ministry.":"मंत्रालय का एक संदेश देखें.","Ways to give":"देने के तरीके","We aim to serve our neighbours and community with care.":"हमारा लक्ष्य अपने पड़ोसियों और समुदाय की देखभाल के साथ सेवा करना है।","We gather to honour God and make room for prayer, praise, and gratitude.":"हम ईश्वर का सम्मान करने और प्रार्थना, स्तुति और कृतज्ञता के लिए जगह बनाने के लिए इकट्ठा होते हैं।","We gather to honour God through prayer, praise, and gratitude.":"हम प्रार्थना, स्तुति और कृतज्ञता के माध्यम से ईश्वर का सम्मान करने के लिए एकत्रित होते हैं।","We seek to build a life of faith through Scripture, prayer, and encouragement.":"हम धर्मग्रंथ, प्रार्थना और प्रोत्साहन के माध्यम से विश्वास का जीवन बनाना चाहते हैं।","We seek to create a welcoming community where people can learn Scripture, strengthen their faith, and serve others with compassion.":"हम एक स्वागत योग्य समुदाय बनाना चाहते हैं जहां लोग पवित्रशास्त्र सीख सकें, अपना विश्वास मजबूत कर सकें और करुणा के साथ दूसरों की सेवा कर सकें।","We seek to grow through Scripture, prayer, and encouragement.":"हम धर्मग्रंथ, प्रार्थना और प्रोत्साहन के माध्यम से बढ़ना चाहते हैं।","We value welcoming one another, sharing life, and serving our community with care.":"हम एक-दूसरे का स्वागत करने, जीवन साझा करने और देखभाल के साथ अपने समुदाय की सेवा करने को महत्व देते हैं।","We welcome one another and share life as a church family.":"हम एक दूसरे का स्वागत करते हैं और एक चर्च परिवार के रूप में जीवन साझा करते हैं।","We would be glad to hear from you.":"हमें आपकी बात सुनकर ख़ुशी होगी.","Wednesdays at 05:30 PM CAT":"बुधवार शाम 05:30 बजे कैट","We’re here to stand with you":"हम आपके साथ खड़े होने के लिए यहां हैं","What matters to us":"हमारे लिए क्या मायने रखता है","Who we are":"हम कौन हैं","Who we are, and why we gather.":"हम कौन हैं, और हम क्यों एकत्रित होते हैं।","Why Us":"हम क्यों","Women":"महिला","World languages":"विश्व भाषाएँ","Worship":"पूजा","Worship and church life":"पूजा और चर्च जीवन","Worship audio from Royal Priesthood Assemblies International.":"Royal Priesthood Assemblies International से पूजा ऑडियो.","Worship music":"संगीत की आराधना करें","You are welcome here":"आपका यहां स्वागत है","You matter to God, you matter to us.":"आप भगवान के लिए मायने रखते हैं, आप हमारे लिए मायने रखते हैं।","Your email app is opening with your message ready. Please review and send it to the church.":"आपका ईमेल ऐप आपके संदेश के साथ खुल रहा है। कृपया समीक्षा करें और इसे चर्च को भेजें।","Your giving supports local outreach, building expansion, and the spread of the Gospel across Zambia.":"आपका दान स्थानीय आउटरीच, भवन विस्तार और जाम्बिया में सुसमाचार के प्रसार का समर्थन करता है।","Youth & teens":"युवा एवं किशोर","ZAMTEL MOBILE MONEY":"ZAMTEL MOBILE MONEY","Zambia National Commercial Bank":"Zambia National Commercial Bank","Zambian banks":"जाम्बिया के बैंक","Zambian languages":"जाम्बिया भाषाएँ","Zamtel Mobile Money":"Zamtel Mobile Money","Zanaco":"Zanaco","“Honor the Lord with your possessions, and with the firstfruits of all your increase.”":"“अपनी सम्पत्ति के द्वारा, और अपनी सारी उपज की पहली उपज के द्वारा यहोवा का आदर करना।”","“Let us hold unswervingly to the hope we profess, for he who promised is faithful.”":"\"आइए हम जिस आशा का दावा करते हैं उस पर अटल रहें, क्योंकि जिसने वादा किया है वह वफादार है।\"","Fellowships":"संगति"},"fr":{"(The Pillars)":"(Les piliers)","09:00 AM CAT":"09:00 AM CAT","A Christian church in Lusaka, Zambia, growing together through worship, the Word, and service to our neighbours.":"Une église chrétienne à Lusaka, en Zambie, grandissant ensemble à travers le culte, la Parole et le service envers nos voisins.","A church built on prayer and fellowship":"Une église bâtie sur la prière et la communion fraternelle","A community strengthened by hope":"Une communauté renforcée par l’espoir","A fresh reading from Rhapsody of Realities each day.":"Une nouvelle lecture de Rhapsody of Realities chaque jour.","A people of faith, growing together":"Un peuple de foi qui grandit ensemble","A place of love where everyone counts":"Un lieu d'amour où chacun compte","A place of love where everyone counts.":"Un lieu d'amour où chacun compte.","A place to belong and to grow":"Un lieu d'appartenance et de croissance","A vibrant community where young believers can discover their God-given identity, talents, and career callings.":"Une communauté dynamique où les jeunes croyants peuvent découvrir l'identité, les talents et les appels de carrière que Dieu leur a donnés.","AIRTEL MOBILE MONEY":"AIRTEL MOBILE MONEY","About":"À propos","About us":"À propos de nous","Absa":"Absa","Absa Bank":"Absa Bank","Absa Bank Zambia":"Absa Bank Zambia","Account name":"Nom du compte","Account number":"Numéro de compte","Airtel Mobile Money":"Airtel Mobile Money","Along Ndeke Road, Lusaka, Zambia":"Le long de Ndeke Road, Lusaka, Zambie","Announcements":"Annonces","Apostle Dr. Mighty Zunga":"Apostle Dr. Mighty Zunga","Apostle Dr. Mighty Zunga in worship":"Apostle Dr. Mighty Zunga dans le culte","Apostle Dr. Mighty Zunga is the Founder and General Overseer of Royal Priesthood Assemblies International in Lusaka, Zambia. His ministry is expressed through preaching, prayer, discipleship, and the leadership of the church community. He encourages believers to grow in their understanding of Scripture and to put their faith into practice through service.":"Apostle Dr. Mighty Zunga est le fondateur et le superviseur général de Royal Priesthood Assemblies International à Lusaka, en Zambie. Son ministère s'exprime à travers la prédication, la prière, la formation de disciples et le leadership de la communauté ecclésiale. Il encourage les croyants à développer leur compréhension des Écritures et à mettre leur foi en pratique par le service.","As a royal priesthood, we worship God with our whole lives. As disciples, we follow Jesus and help others follow Him, sharing His truth with humility and living it with compassion at home, in the church, and throughout our community.":"En tant que sacerdoce royal, nous adorons Dieu de toute notre vie. En tant que disciples, nous suivons Jésus et aidons les autres à le suivre, en partageant sa vérité avec humilité et en la vivant avec compassion à la maison, dans l’église et dans toute notre communauté.","Ask about a fellowship":"Renseignez-vous sur une communauté","Ask about a ride":"Demandez un trajet","Ask on WhatsApp":"Demandez sur WhatsApp","Audio":"Audio","Back to slideshow":"Retour au diaporama","Branches & Transport":"Succursales et transports","Call":"Appeler","Call +260 767 716 936":"Appelez le +260 767 716 936","Centre":"Centre","Choose one":"Choisissez-en un","Choose the next step that feels right for you. Your message will be prepared in your email app for you to review and send.":"Choisissez la prochaine étape qui vous convient. Votre message sera préparé dans votre application de messagerie pour que vous puissiez le consulter et l'envoyer.","Church Services":"Services religieux","Church updates":"Mises à jour de l'Église","Close menu":"Fermer le menu","Connect with RPAI":"Connectez-vous avec RPAI","Connect with a local fellowship for biblical discussion and mutual support.":"Connectez-vous avec une communauté locale pour une discussion biblique et un soutien mutuel.","Contact":"Contacter","Contact the church":"Contacter l'église","Contact the church to ask about current Sunday transport availability, pickup points, and arrangements.":"Contactez l'église pour vous renseigner sur la disponibilité actuelle des transports du dimanche, les points de collecte et les modalités.","Daily Devotional":"Dévotion quotidienne","Daily message":"Message quotidien","Email Address":"Adresse e-mail","Email the church":"Envoyez un e-mail à l'église","Empowering and equipping men to take their place of leadership in family, career, and church through focused fellowship and growth sessions, including the Online Royal Men’s Summit.":"Donner aux hommes les moyens et les outils nécessaires pour qu’ils prennent leur place de leader dans la famille, la carrière et l’église grâce à des séances ciblées de fraternité et de croissance, y compris le Sommet royal en ligne des hommes.","Every ministry here opens room for worship, prayer, biblical learning, fellowship, and practical service in our community.":"Chaque ministère ici ouvre un espace pour le culte, la prière, l'apprentissage biblique, la camaraderie et le service pratique dans notre communauté.","Explore our ministries":"Découvrez nos ministères","FNB":"FNB","FNB Zambia":"FNB Zambia","Facebook only shows its posts to people who are signed in to Facebook, so the live feed below stays blank for many visitors. The button above always works.":"Facebook n'affiche ses publications qu'aux personnes connectées à Facebook, de sorte que le flux en direct ci-dessous reste vide pour de nombreux visiteurs. Le bouton ci-dessus fonctionne toujours.","Faith in word and action":"La foi en la parole et en l'action","Faith lived together":"La foi vivait ensemble","Fellowship":"Communauté","Fellowship locations":"Lieux de communauté","Find a Home Cell":"Trouver une cellule résidentielle","Find a church community":"Trouver une communauté ecclésiale","Find a fellowship":"Trouver une communauté","Find the Sunday gathering location and contact the church about transport and fellowship locations.":"Trouvez le lieu de rassemblement du dimanche et contactez l'église au sujet du transport et des lieux de communauté.","Find your place among our ministries.":"Trouvez votre place parmi nos ministères.","First National Bank":"First National Bank","Follow the church for updates, photos and notices":"Suivez l'église pour les mises à jour, les photos et les avis","Follow us":"Suivez-nous","For help with any of these details, contact the church office.":"Pour obtenir de l'aide sur l'un de ces détails, contactez le bureau de l'église.","Full Name":"Nom complet","Gallery":"Galerie","Gallery & Media":"Galerie et médias","General Overseer & Founder":"Surveillant général et fondateur","General Overseer and Founder":"Surveillant général et fondateur","Give":"Donner","Give directly to any of our Zambian bank accounts. Please use your name as the reference so the church can acknowledge your gift.":"Faites un don directement sur l'un de nos comptes bancaires zambiens. Veuillez utiliser votre nom comme référence afin que l'église puisse reconnaître votre don.","Give via PayPal":"Donner via PayPal","Giving details":"Donner des détails","Giving from outside Zambia? Use our only international gateway, PayPal.":"Vous donnez depuis l’extérieur de la Zambie ? Utilisez notre seule passerelle internationale, PayPal.","God has not forgotten you. His mercies are new every morning.":"Dieu ne vous a pas oublié. Ses miséricordes sont nouvelles chaque matin.","Grow in faith":"Grandir dans la foi","Grow with us in faith and fellowship":"Grandissez avec nous dans la foi et la communion fraternelle","Growing in faith":"Grandir dans la foi","Hebrews 10:23":"Hebrews 10:23","Home":"Accueil","Home Cell & Branch Fellowships":"Groupes de cellules à domicile et communautés de branches","How can Apostle Dr. Mighty Zunga and the RPAI Prayer Team stand in faith with you this week?":"Comment Apostle Dr. Mighty Zunga et l’équipe de prière RPAI peuvent-ils rester fidèles à vous cette semaine ?","How can we connect?":"Comment pouvons-nous nous connecter ?","I am looking for a church home":"Je cherche une maison d'église","I want to join a local Cell group":"Je souhaite rejoindre un groupe Cell local","I want to receive salvation":"Je veux recevoir le salut","I'm New Here / Connect Card":"Je suis nouveau ici / Carte Connect","In Royal Priesthood, love is more than a kind word; it is the life of Christ made visible in the way we welcome, forgive, serve, and stand beside one another. We are called to carry each other's burdens and to make room for every person to grow in faith.":"Dans la Prêtrise Royale, l’amour est plus qu’un mot gentil ; c'est la vie du Christ rendue visible dans la manière dont nous accueillons, pardonnons, servons et nous tenons les uns à côté des autres. Nous sommes appelés à porter les fardeaux les uns des autres et à faire de la place pour que chacun grandisse dans la foi.","International giving":"Dons internationaux","I’m New Here / Connect Card":"Je suis nouveau ici / Carte Connect","John 13:34-35.":"John 13:34-35.","Join Us":"Rejoignez-nous","Join us every Sunday at 09:00 AM CAT at Otwa Events, Long Acres, Lusaka.":"Rejoignez-nous tous les dimanches à 09:00 AM CAT à Otwa Events, Long Acres, Lusaka.","Join us for Sunday Divine Service at 09:00 AM CAT at Otwa Events, Long Acres, along Ndeke Road in Lusaka.":"Rejoignez-nous pour le service divin du dimanche à 09:00 AM CAT à Otwa Events, Long Acres, le long de Ndeke Road à Lusaka.","Join us in Lusaka":"Rejoignez-nous à Lusaka","Join us this week":"Rejoignez-nous cette semaine","Keep Your Faith":"Gardez votre foi","Keep faith through every season":"Gardez la foi à chaque saison","Know more about us":"En savoir plus sur nous","Latest announcements":"Dernières annonces","Latest photos":"Dernières photos","Let us pray for you. Share your needs and we will stand with you in faith and prayer.":"Laissez-nous prier pour vous. Partagez vos besoins et nous serons à vos côtés dans la foi et la prière.","Listen":"Ecoute","Listen to music by LoveWorld Singers and Pastor Chris through licensed music services. Use each service's own purchase or download option where available.":"Écoutez de la musique de LoveWorld Singers et du pasteur Chris via des services de musique sous licence. Utilisez la propre option d'achat ou de téléchargement de chaque service, le cas échéant.","Live Service":"Service en direct","Loading...":"Chargement...","Local fellowships":"Communautés locales","Local gatherings, including groups meeting in areas such as Chalala, for biblical discussion, mutual support, and neighbourly care.":"Rassemblements locaux, y compris des groupes se réunissant dans des zones telles que Chalala, pour des discussions bibliques, un soutien mutuel et des soins de voisinage.","Love that forms disciples":"L'amour qui forme des disciples","LoveWorld Singers on Apple Music":"Chanteurs LoveWorld sur Apple Music","LoveWorld Singers on Spotify":"Chanteurs LoveWorld sur Spotify","LoveWorld Singers on YouTube Music":"LoveWorld Singers sur YouTube Music","Lusaka Main Centre":"Lusaka Main Centre","MTN MOBILE MONEY":"MTN MOBILE MONEY","MTN Mobile Money":"MTN Mobile Money","Meet with us Wednesdays at 05:30 PM CAT for interactive fellowship, virtually and in cell locations.":"Rencontrez-nous les mercredis à 17h30 CAT pour une communion interactive, en ligne et dans les groupes de cellules.","Men":"Hommes","Mid-Week Fellowship":"Communion de mi-semaine","Mid-Week Interactive Fellowship":"Communion interactive en milieu de semaine","Ministries":"Ministères","Ministries & Fellowships":"Ministères et communautés","Mobile Money":"Argent mobile","PayPal email":"E-mail PayPal","Moments of worship, prayer, fellowship, and ministry from Royal Priesthood Assemblies International.":"Moments d'adoration, de prière, de camaraderie et de ministère de la part de Royal Priesthood Assemblies International.","Next photos":"Photos suivantes","Next steps":"Prochaines étapes","NextGen Youth & Teen Ministry":"Ministère des jeunes et des adolescents NextGen","Open directions in Google Maps":"Ouvrir les itinéraires dans Google Maps","Open menu":"Ouvrir le menu","Open the church's Facebook page":"Ouvrez la page Facebook de l'église","Otwa Events, Long Acres":"Otwa Events, Long Acres","Otwa Events, Long Acres, along Ndeke Road, Lusaka, Zambia":"Otwa Events, Long Acres, le long de Ndeke Road, Lusaka, Zambie","Our Founder":"Notre Fondateur","Our Services":"Nos prestations","Our ministries":"Nos ministères","Our ministries create opportunities for worship, prayer, biblical learning, fellowship, and practical service in the community.":"Nos ministères créent des opportunités d'adoration, de prière, d'apprentissage biblique, de camaraderie et de service pratique dans la communauté.","Our mission":"Notre mission","Our vision":"Notre vision","Pal":"Copain","Partner with us":"Devenez partenaire avec nous","Pastor Chris on Apple Music":"Pasteur Chris sur Apple Music","Pastor Chris on Spotify":"Pasteur Chris sur Spotify","Pastor Chris on YouTube Music":"Pasteur Chris sur YouTube Music","Pastor Thelma welcome you to Royal Priesthood Assemblies International.":"Pastor Thelma vous souhaite la bienvenue à Royal Priesthood Assemblies International.","Pause slideshow":"Suspendre le diaporama","Pay":"Payer","PayPal":"PayPal","Phone Number":"Numéro de téléphone","Photographs from worship gatherings and ministry moments. Select any photograph to view it larger.":"Photographies de rassemblements de culte et de moments de ministère. Sélectionnez n’importe quelle photo pour l’afficher en plus grand.","Plan Your Visit":"Planifiez votre visite","Plan your visit":"Planifiez votre visite","Play slideshow":"Lire le diaporama","Previous photos":"Photos précédentes","Proverbs 3:9":"Proverbs 3:9","ROYAL PRIESTHOOD ASSEMBLIES INTERNATIONAL":"ROYAL PRIESTHOOD ASSEMBLIES INTERNATIONAL","ROYAL Priesthood Assemblies International":"ROYAL Priesthood Assemblies International","RPAI lists local home-cell and branch fellowships, including gatherings in Chalala. Contact the church for current meeting locations, schedules, and details about other branches.":"RPAI répertorie les groupes de cellules à domicile et les communautés de branches, y compris les rassemblements à Chalala. Contactez l'église pour connaître les lieux de réunion actuels, les horaires et les détails sur les autres branches.","Raising spiritual mothers, career women, and impactful leaders through local sisterhood fellowships and prayer clusters.":"Élever des mères spirituelles, des femmes de carrière et des leaders influents grâce à des communautés fraternelles locales et à des groupes de prière.","Read the complete daily devotional from the official Rhapsody of Realities reading page.":"Lisez la dévotion quotidienne complète sur la page de lecture officielle.","Read today's devotional":"Lisez la dévotion d'aujourd'hui","Read today's message on the official Rhapsody of Realities site, and spend a few quiet minutes with God before the day begins.":"Lisez le message d'aujourd'hui sur le site officiel et passez quelques minutes tranquilles avec Dieu avant le début de la journée.","Recent public posts from the Royal Priesthood Assemblies International Facebook page.":"Publications publiques récentes de la page Facebook Royal Priesthood Assemblies International.","Recordings":"Enregistrements","Request a Prayer":"Demander une prière","Rhapsody of Realities":"Rhapsody of Realities","Rooted in faith. United in fellowship.":"Enracinés dans la foi. Unis dans la communion fraternelle.","Royal Men's Fellowship":"Confraternité royale des hommes","Royal Men’s Fellowship":"Confraternité royale des hommes","Royal Priesthood Assemblies International":"Royal Priesthood Assemblies International","Royal Priesthood Assemblies International can add direct audio downloads when it has the tracks and permission to distribute them.":"Royal Priesthood Assemblies International peut ajouter des téléchargements audio directs lorsqu'il dispose des pistes et de l'autorisation de les distribuer.","Royal Priesthood Assemblies International is a Christian church based in Lusaka, Zambia. Our church life is centred on worship, biblical teaching, prayer, fellowship, and service.":"Royal Priesthood Assemblies International est une église chrétienne basée à Lusaka, en Zambie. La vie de notre église est centrée sur l'adoration, l'enseignement biblique, la prière, la communion fraternelle et le service.","Royal Priesthood Assemblies International is a church family in Lusaka, Zambia. We gather to worship, grow in faith, and serve our community.":"Royal Priesthood Assemblies International est une famille d'église de Lusaka, en Zambie. Nous nous rassemblons pour adorer, grandir dans la foi et servir notre communauté.","Royal Priesthood Assemblies International. All rights reserved.":"Royal Priesthood Assemblies International. Tous droits réservés.","Scripture:":"Écriture :","Select language":"Sélectionnez la langue","Send Connect Card":"Envoyer la carte de connexion","Send Prayer Request":"Envoyer une demande de prière","Send a prayer request, plan your visit, or ask us anything.":"Envoyez une demande de prière, planifiez votre visite ou demandez-nous quoi que ce soit.","Send us your prayer request":"Envoyez-nous votre demande de prière","Serve with care":"Servir avec soin","Service video":"Vidéo de maintenance","Share a Prayer Request":"Partager une demande de prière","Show all pictures":"Afficher toutes les photos","Show slideshow":"Afficher le diaporama","Songs and downloads":"Chansons et téléchargements","Songs from the church":"Chants de l'église","Stanbic":"Stanbic","Stanbic Bank":"Stanbic Bank","Stanbic Bank Zambia":"Stanbic Bank Zambia","Standard Chartered":"Standard Chartered","Standard Chartered Zambia":"Standard Chartered Zambia","Stream live service":"Service de diffusion en direct","Stream live service and find the latest worship and ministry videos from Royal Priesthood Assemblies International.":"Diffusez le service en direct et trouvez les dernières vidéos d'adoration et de ministère de Royal Priesthood Assemblies International.","Sunday Divine Service":"Service divin du dimanche","Sunday Transport & Branches":"Transports et succursales du dimanche","Sunday Worship":"Culte du dimanche","Sunday gallery":"Galerie du dimanche","Sunday photos":"Photos du dimanche","Sunday service":"Service du dimanche","Sunday service moves to 8am from 1 December.":"Le service du dimanche est déplacé à 8 heures du matin à partir du 1er décembre.","Sunday transport":"Transports du dimanche","Sunday worship":"Culte du dimanche","The ten newest photographs sent by the church":"Les dix dernières photographies envoyées par l'église","To be confirmed":"À confirmer","To proclaim the Gospel, encourage spiritual growth through Scripture and prayer, and serve our neighbours with compassion.":"Proclamer l’Évangile, encourager la croissance spirituelle à travers les Écritures et la prière, et servir nos voisins avec compassion.","To see people and communities strengthened by the hope of Christ and equipped to live out their faith.":"Voir des personnes et des communautés renforcées par l’espérance du Christ et équipées pour vivre leur foi.","Today's podcast":"Le podcast du jour","Today's reading":"Lecture du jour","Updates from Royal Priesthood Assemblies International.":"Mises à jour de Royal Priesthood Assemblies International.","Video":"Vidéo","Virtual and cell locations":"Emplacements virtuels et cellulaires","Virtuous Women’s Ministry":"Ministère des Femmes Vertueuses","Watch":"Regarder","Watch a message from the ministry.":"Regardez un message du ministère.","Ways to give":"Façons de donner","We aim to serve our neighbours and community with care.":"Nous visons à servir nos voisins et notre communauté avec soin.","We gather to honour God and make room for prayer, praise, and gratitude.":"Nous nous réunissons pour honorer Dieu et faire place à la prière, à la louange et à la gratitude.","We gather to honour God through prayer, praise, and gratitude.":"Nous nous réunissons pour honorer Dieu par la prière, la louange et la gratitude.","We seek to build a life of faith through Scripture, prayer, and encouragement.":"Nous cherchons à construire une vie de foi à travers les Écritures, la prière et les encouragements.","We seek to create a welcoming community where people can learn Scripture, strengthen their faith, and serve others with compassion.":"Nous cherchons à créer une communauté accueillante où les gens peuvent apprendre les Écritures, renforcer leur foi et servir les autres avec compassion.","We seek to grow through Scripture, prayer, and encouragement.":"Nous cherchons à grandir à travers les Écritures, la prière et les encouragements.","We value welcoming one another, sharing life, and serving our community with care.":"Nous valorisons l’accueil les uns des autres, le partage de la vie et le service attentionné de notre communauté.","We welcome one another and share life as a church family.":"Nous nous accueillons et partageons la vie en famille ecclésiale.","We would be glad to hear from you.":"Nous serions heureux d’avoir de vos nouvelles.","Wednesdays at 05:30 PM CAT":"Les mercredis à 17h30 CAT","We’re here to stand with you":"Nous sommes là pour être à vos côtés","What matters to us":"Ce qui compte pour nous","Who we are":"Qui nous sommes","Who we are, and why we gather.":"Qui nous sommes et pourquoi nous nous réunissons.","Why Us":"Pourquoi nous","Women":"Femmes","World languages":"Langues du monde","Worship":"Culte","Worship and church life":"Culte et vie de l'église","Worship audio from Royal Priesthood Assemblies International.":"Audio d’adoration de Royal Priesthood Assemblies International.","Worship music":"Musique d'adoration","You are welcome here":"Vous êtes les bienvenus ici","You matter to God, you matter to us.":"Vous comptez pour Dieu, vous comptez pour nous.","Your email app is opening with your message ready. Please review and send it to the church.":"Votre application de messagerie s'ouvre avec votre message prêt. Veuillez le consulter et l'envoyer à l'église.","Your giving supports local outreach, building expansion, and the spread of the Gospel across Zambia.":"Votre don soutient l’action locale, l’expansion des bâtiments et la propagation de l’Évangile à travers la Zambie.","Youth & teens":"Jeunes et adolescents","ZAMTEL MOBILE MONEY":"ZAMTEL MOBILE MONEY","Zambia National Commercial Bank":"Zambia National Commercial Bank","Zambian banks":"Banques zambiennes","Zambian languages":"Langues zambiennes","Zamtel Mobile Money":"Zamtel Mobile Money","Zanaco":"Zanaco","“Honor the Lord with your possessions, and with the firstfruits of all your increase.”":"« Honorez l’Éternel avec vos biens et avec les prémices de tout votre revenu. »","“Let us hold unswervingly to the hope we profess, for he who promised is faithful.”":"« Gardons inébranlablement l’espérance que nous professons, car celui qui a promis est fidèle. »","Fellowships":"Communautés"},"de":{"(The Pillars)":"(Die Säulen)","09:00 AM CAT":"09:00 AM CAT","A Christian church in Lusaka, Zambia, growing together through worship, the Word, and service to our neighbours.":"Eine christliche Kirche in Lusaka, Sambia, die durch Gottesdienst, das Wort Gottes und den Dienst an unseren Nachbarn zusammenwächst.","A church built on prayer and fellowship":"Eine Kirche, die auf Gebet und Gemeinschaft basiert","A community strengthened by hope":"Eine durch Hoffnung gestärkte Gemeinschaft","A fresh reading from Rhapsody of Realities each day.":"Jeden Tag eine neue Lektüre von Rhapsody of Realities.","A people of faith, growing together":"Ein Volk des Glaubens, das zusammenwächst","A place of love where everyone counts":"Ein Ort der Liebe, an dem jeder zählt","A place of love where everyone counts.":"Ein Ort der Liebe, an dem jeder zählt.","A place to belong and to grow":"Ein Ort, an dem man dazugehören und wachsen kann","A vibrant community where young believers can discover their God-given identity, talents, and career callings.":"Eine lebendige Gemeinschaft, in der junge Gläubige ihre von Gott gegebene Identität, Talente und berufliche Berufung entdecken können.","AIRTEL MOBILE MONEY":"AIRTEL MOBILE MONEY","About":"Über","About us":"Über uns","Absa":"Absa","Absa Bank":"Absa Bank","Absa Bank Zambia":"Absa Bank Zambia","Account name":"Kontoname","Account number":"Kontonummer","Airtel Mobile Money":"Airtel Mobile Money","Along Ndeke Road, Lusaka, Zambia":"Entlang der Ndeke Road, Lusaka, Sambia","Announcements":"Ankündigungen","Apostle Dr. Mighty Zunga":"Apostle Dr. Mighty Zunga","Apostle Dr. Mighty Zunga in worship":"Apostle Dr. Mighty Zunga im Gottesdienst","Apostle Dr. Mighty Zunga is the Founder and General Overseer of Royal Priesthood Assemblies International in Lusaka, Zambia. His ministry is expressed through preaching, prayer, discipleship, and the leadership of the church community. He encourages believers to grow in their understanding of Scripture and to put their faith into practice through service.":"Apostle Dr. Mighty Zunga ist der Gründer und Generalaufseher von Royal Priesthood Assemblies International in Lusaka, Sambia. Sein Dienst drückt sich in Predigten, Gebeten, Jüngerschaft und der Führung der Kirchengemeinschaft aus. Er ermutigt die Gläubigen, ihr Verständnis der Heiligen Schrift zu vertiefen und ihren Glauben durch Dienst in die Praxis umzusetzen.","As a royal priesthood, we worship God with our whole lives. As disciples, we follow Jesus and help others follow Him, sharing His truth with humility and living it with compassion at home, in the church, and throughout our community.":"Als königliche Priesterschaft verehren wir Gott unser ganzes Leben lang. Als Jünger folgen wir Jesus und helfen anderen, ihm zu folgen, indem wir seine Wahrheit mit Demut teilen und sie mit Mitgefühl zu Hause, in der Kirche und in unserer gesamten Gemeinschaft leben.","Ask about a fellowship":"Fragen Sie nach einer Gemeinschaft","Ask about a ride":"Fragen Sie nach einer Mitfahrgelegenheit","Ask on WhatsApp":"Fragen Sie auf WhatsApp","Audio":"Audio","Back to slideshow":"Zurück zur Diashow","Branches & Transport":"Branchen & Transport","Call":"Rufen Sie an","Call +260 767 716 936":"Rufen Sie +260 767 716 936 an","Centre":"Mitte","Choose one":"Wählen Sie eine aus","Choose the next step that feels right for you. Your message will be prepared in your email app for you to review and send.":"Wählen Sie den nächsten Schritt, der sich für Sie richtig anfühlt. Ihre Nachricht wird in Ihrer E-Mail-App vorbereitet, damit Sie sie überprüfen und senden können.","Church Services":"Gottesdienste","Church updates":"Kirchenaktualisierungen","Close menu":"Menü schließen","Connect with RPAI":"Mit RPAI verbinden","Connect with a local fellowship for biblical discussion and mutual support.":"Vernetzen Sie sich mit einer lokalen Gemeinschaft für biblische Gespräche und gegenseitige Unterstützung.","Contact":"Kontakt","Contact the church":"Kontaktieren Sie die Kirche","Contact the church to ask about current Sunday transport availability, pickup points, and arrangements.":"Wenden Sie sich an die Kirche, um Informationen zur aktuellen Verfügbarkeit von Sonntagstransporten, Abholpunkten und Vereinbarungen zu erhalten.","Daily Devotional":"Tägliche Andacht","Daily message":"Tägliche Nachricht","Email Address":"E-Mail-Adresse","Email the church":"Schicken Sie der Kirche eine E-Mail","Empowering and equipping men to take their place of leadership in family, career, and church through focused fellowship and growth sessions, including the Online Royal Men’s Summit.":"Durch gezielte Gemeinschafts- und Wachstumssitzungen, einschließlich des Online Royal Men’s Summit, werden Männer befähigt und ausgerüstet, ihre Führungsposition in Familie, Beruf und Kirche einzunehmen.","Every ministry here opens room for worship, prayer, biblical learning, fellowship, and practical service in our community.":"Jeder Dienst hier eröffnet Raum für Gottesdienst, Gebet, biblisches Lernen, Gemeinschaft und praktischen Dienst in unserer Gemeinschaft.","Explore our ministries":"Entdecken Sie unsere Dienste","FNB":"FNB","FNB Zambia":"FNB Zambia","Facebook only shows its posts to people who are signed in to Facebook, so the live feed below stays blank for many visitors. The button above always works.":"Facebook zeigt seine Beiträge nur Personen an, die bei Facebook angemeldet sind, daher bleibt der Live-Feed unten für viele Besucher leer. Der Button oben funktioniert immer.","Faith in word and action":"Glaube an Wort und Tat","Faith lived together":"Der Glaube lebte zusammen","Fellowship":"Gemeinschaft","Fellowship locations":"Orte der Gemeinschaft","Find a Home Cell":"Finden Sie eine Heimatzelle","Find a church community":"Finden Sie eine Kirchengemeinde","Find a fellowship":"Gemeinschaft finden","Find the Sunday gathering location and contact the church about transport and fellowship locations.":"Finden Sie den Sonntagstreffpunkt und kontaktieren Sie die Kirche bezüglich Transport und Orten der Gemeinschaft.","Find your place among our ministries.":"Finden Sie Ihren Platz in unseren Diensten.","First National Bank":"First National Bank","Follow the church for updates, photos and notices":"Folgen Sie der Kirche für Updates, Fotos und Hinweise","Follow us":"Folgen Sie uns","For help with any of these details, contact the church office.":"Wenn Sie Hilfe zu diesen Einzelheiten benötigen, wenden Sie sich bitte an das Kirchenbüro.","Full Name":"Vollständiger Name","Gallery":"Galerie","Gallery & Media":"Galerie & Medien","General Overseer & Founder":"Generalaufseher und Gründer","General Overseer and Founder":"Generalaufseher und Gründer","Give":"Gib","Give directly to any of our Zambian bank accounts. Please use your name as the reference so the church can acknowledge your gift.":"Spenden Sie direkt auf eines unserer sambischen Bankkonten. Bitte verwenden Sie Ihren Namen als Referenz, damit die Kirche Ihre Spende anerkennen kann.","Give via PayPal":"Geben Sie über PayPal","Giving details":"Einzelheiten angeben","Giving from outside Zambia? Use our only international gateway, PayPal.":"Von außerhalb Sambias spenden? Nutzen Sie unser einziges internationales Gateway, PayPal.","God has not forgotten you. His mercies are new every morning.":"Gott hat dich nicht vergessen. Seine Gnaden sind jeden Morgen neu.","Grow in faith":"Wachse im Glauben","Grow with us in faith and fellowship":"Wachsen Sie mit uns im Glauben und in der Gemeinschaft","Growing in faith":"Im Glauben wachsen","Hebrews 10:23":"Hebrews 10:23","Home":"Zuhause","Home Cell & Branch Fellowships":"Hauskreise und Gemeinschaften der Zweigstellen","How can Apostle Dr. Mighty Zunga and the RPAI Prayer Team stand in faith with you this week?":"Wie können Apostle Dr. Mighty Zunga und das RPAI Gebetsteam Ihnen diese Woche im Glauben zur Seite stehen?","How can we connect?":"Wie können wir uns verbinden?","I am looking for a church home":"Ich suche ein kirchliches Zuhause","I want to join a local Cell group":"Ich möchte einer lokalen Cell-Gruppe beitreten","I want to receive salvation":"Ich möchte Erlösung empfangen","I'm New Here / Connect Card":"Ich bin neu hier / Kontaktkarte","In Royal Priesthood, love is more than a kind word; it is the life of Christ made visible in the way we welcome, forgive, serve, and stand beside one another. We are called to carry each other's burdens and to make room for every person to grow in faith.":"Im königlichen Priestertum ist Liebe mehr als ein freundliches Wort; Es ist das Leben Christi, das in der Art und Weise sichtbar wird, wie wir einander willkommen heißen, vergeben, dienen und nebeneinander stehen. Wir sind aufgerufen, die Lasten des anderen zu tragen und jedem Menschen Raum zu geben, im Glauben zu wachsen.","International giving":"Internationales Spenden","I’m New Here / Connect Card":"Ich bin neu hier / Kontaktkarte","John 13:34-35.":"John 13:34-35.","Join Us":"Machen Sie mit","Join us every Sunday at 09:00 AM CAT at Otwa Events, Long Acres, Lusaka.":"Besuchen Sie uns jeden Sonntag um 09:00 AM CAT um Otwa Events, Long Acres, Lusaka.","Join us for Sunday Divine Service at 09:00 AM CAT at Otwa Events, Long Acres, along Ndeke Road in Lusaka.":"Besuchen Sie uns zum Sonntagsgottesdienst um 09:00 AM CAT um Otwa Events, Long Acres entlang der Ndeke Road in Lusaka.","Join us in Lusaka":"Begleiten Sie uns in Lusaka","Join us this week":"Seien Sie diese Woche dabei","Keep Your Faith":"Behalte deinen Glauben","Keep faith through every season":"Behalten Sie den Glauben zu jeder Jahreszeit","Know more about us":"Erfahren Sie mehr über uns","Latest announcements":"Neueste Ankündigungen","Latest photos":"Neueste Fotos","Let us pray for you. Share your needs and we will stand with you in faith and prayer.":"Lass uns für dich beten. Teilen Sie Ihre Bedürfnisse mit und wir werden Ihnen im Glauben und im Gebet zur Seite stehen.","Listen":"Hören Sie","Listen to music by LoveWorld Singers and Pastor Chris through licensed music services. Use each service's own purchase or download option where available.":"Hören Sie Musik von LoveWorld Singers und Pastor Chris über lizenzierte Musikdienste. Nutzen Sie die eigene Kauf- oder Download-Option jedes Dienstes, sofern verfügbar.","Live Service":"Live-Service","Loading...":"Laden...","Local fellowships":"Lokale Gemeinschaften","Local gatherings, including groups meeting in areas such as Chalala, for biblical discussion, mutual support, and neighbourly care.":"Lokale Zusammenkünfte, einschließlich Gruppentreffen in Gegenden wie Chalala, zur biblischen Diskussion, gegenseitiger Unterstützung und Nachbarschaftsfürsorge.","Love that forms disciples":"Liebe, die Jünger formt","LoveWorld Singers on Apple Music":"LoveWorld Singers auf Apple Music","LoveWorld Singers on Spotify":"LoveWorld Singers auf Spotify","LoveWorld Singers on YouTube Music":"LoveWorld Singers auf YouTube Music","Lusaka Main Centre":"Lusaka Main Centre","MTN MOBILE MONEY":"MTN MOBILE MONEY","MTN Mobile Money":"MTN Mobile Money","Meet with us Wednesdays at 05:30 PM CAT for interactive fellowship, virtually and in cell locations.":"Treffen Sie sich mittwochs um 17:30 Uhr CAT mit uns zu einer interaktiven Gemeinschaft – online und in Hauskreisen.","Men":"Männer","Mid-Week Fellowship":"Gemeinschaft zur Wochenmitte","Mid-Week Interactive Fellowship":"Interaktive Gemeinschaft zur Wochenmitte","Ministries":"Ministerien","Ministries & Fellowships":"Dienste und Gemeinschaften","Mobile Money":"Mobiles Geld","PayPal email":"PayPal-E-Mail","Moments of worship, prayer, fellowship, and ministry from Royal Priesthood Assemblies International.":"Momente der Anbetung, des Gebets, der Gemeinschaft und des Dienstes von Royal Priesthood Assemblies International.","Next photos":"Nächste Fotos","Next steps":"Nächste Schritte","NextGen Youth & Teen Ministry":"NextGen Youth & Teen Ministry","Open directions in Google Maps":"Wegbeschreibung in Google Maps öffnen","Open menu":"Menü öffnen","Open the church's Facebook page":"Öffnen Sie die Facebook-Seite der Kirche","Otwa Events, Long Acres":"Otwa Events, Long Acres","Otwa Events, Long Acres, along Ndeke Road, Lusaka, Zambia":"Otwa Events, Long Acres, entlang der Ndeke Road, Lusaka, Sambia","Our Founder":"Unser Gründer","Our Services":"Unsere Leistungen","Our ministries":"Unsere Dienste","Our ministries create opportunities for worship, prayer, biblical learning, fellowship, and practical service in the community.":"Unsere Dienste schaffen Möglichkeiten für Gottesdienst, Gebet, biblisches Lernen, Gemeinschaft und praktischen Dienst in der Gemeinschaft.","Our mission":"Unsere Mission","Our vision":"Unsere Vision","Pal":"Kumpel","Partner with us":"Arbeiten Sie mit uns zusammen","Pastor Chris on Apple Music":"Pastor Chris über Apple Music","Pastor Chris on Spotify":"Pastor Chris auf Spotify","Pastor Chris on YouTube Music":"Pastor Chris auf YouTube Music","Pastor Thelma welcome you to Royal Priesthood Assemblies International.":"Pastor Thelma heißt Sie bei Royal Priesthood Assemblies International willkommen.","Pause slideshow":"Diashow anhalten","Pay":"Bezahlen","PayPal":"PayPal","Phone Number":"Telefonnummer","Photographs from worship gatherings and ministry moments. Select any photograph to view it larger.":"Fotos von Gottesdiensten und Gottesdienstmomenten. Wählen Sie ein beliebiges Foto aus, um es größer anzuzeigen.","Plan Your Visit":"Planen Sie Ihren Besuch","Plan your visit":"Planen Sie Ihren Besuch","Play slideshow":"Diashow abspielen","Previous photos":"Vorherige Fotos","Proverbs 3:9":"Proverbs 3:9","ROYAL PRIESTHOOD ASSEMBLIES INTERNATIONAL":"ROYAL PRIESTHOOD ASSEMBLIES INTERNATIONAL","ROYAL Priesthood Assemblies International":"ROYAL Priesthood Assemblies International","RPAI lists local home-cell and branch fellowships, including gatherings in Chalala. Contact the church for current meeting locations, schedules, and details about other branches.":"RPAI listet lokale Hauskreise und Gemeinschaften der Zweigstellen auf, einschließlich der Treffen in Chalala. Kontaktieren Sie die Kirche für aktuelle Treffpunkte, Zeitpläne und Einzelheiten zu anderen Zweigstellen.","Raising spiritual mothers, career women, and impactful leaders through local sisterhood fellowships and prayer clusters.":"Förderung spiritueller Mütter, Karrierefrauen und einflussreicher Führungskräfte durch lokale Schwesternschaften und Gebetsgruppen.","Read the complete daily devotional from the official Rhapsody of Realities reading page.":"Lesen Sie die komplette tägliche Andacht auf der offiziellen Rhapsody of Realities-Leseseite.","Read today's devotional":"Lesen Sie die heutige Andacht","Read today's message on the official Rhapsody of Realities site, and spend a few quiet minutes with God before the day begins.":"Lesen Sie die heutige Botschaft auf der offiziellen Rhapsody of Realities-Website und verbringen Sie ein paar ruhige Minuten mit Gott, bevor der Tag beginnt.","Recent public posts from the Royal Priesthood Assemblies International Facebook page.":"Aktuelle öffentliche Beiträge von der Royal Priesthood Assemblies International Facebook-Seite.","Recordings":"Aufnahmen","Request a Prayer":"Fordern Sie ein Gebet an","Rhapsody of Realities":"Rhapsody of Realities","Rooted in faith. United in fellowship.":"Im Glauben verwurzelt. In Gemeinschaft vereint.","Royal Men's Fellowship":"Königliche Männergemeinschaft","Royal Men’s Fellowship":"Königliche Männergemeinschaft","Royal Priesthood Assemblies International":"Royal Priesthood Assemblies International","Royal Priesthood Assemblies International can add direct audio downloads when it has the tracks and permission to distribute them.":"Royal Priesthood Assemblies International kann direkte Audio-Downloads hinzufügen, wenn es über die Titel und die Erlaubnis zur Verbreitung verfügt.","Royal Priesthood Assemblies International is a Christian church based in Lusaka, Zambia. Our church life is centred on worship, biblical teaching, prayer, fellowship, and service.":"Royal Priesthood Assemblies International ist eine christliche Kirche mit Sitz in Lusaka, Sambia. Unser kirchliches Leben konzentriert sich auf Anbetung, biblische Lehre, Gebet, Gemeinschaft und Dienst.","Royal Priesthood Assemblies International is a church family in Lusaka, Zambia. We gather to worship, grow in faith, and serve our community.":"Royal Priesthood Assemblies International ist eine Kirchenfamilie in Lusaka, Sambia. Wir kommen zusammen, um anzubeten, im Glauben zu wachsen und unserer Gemeinschaft zu dienen.","Royal Priesthood Assemblies International. All rights reserved.":"Royal Priesthood Assemblies International. Alle Rechte vorbehalten.","Scripture:":"Schrift:","Select language":"Sprache auswählen","Send Connect Card":"Connect-Karte senden","Send Prayer Request":"Gebetsanliegen senden","Send a prayer request, plan your visit, or ask us anything.":"Senden Sie eine Gebetsanliegen, planen Sie Ihren Besuch oder stellen Sie uns eine Frage.","Send us your prayer request":"Senden Sie uns Ihr Gebetsanliegen","Serve with care":"Mit Vorsicht servieren","Service video":"Servicevideo","Share a Prayer Request":"Teilen Sie ein Gebetsanliegen","Show all pictures":"Alle Bilder anzeigen","Show slideshow":"Diashow anzeigen","Songs and downloads":"Lieder und Downloads","Songs from the church":"Lieder aus der Kirche","Stanbic":"Stanbic","Stanbic Bank":"Stanbic Bank","Stanbic Bank Zambia":"Stanbic Bank Zambia","Standard Chartered":"Standard Chartered","Standard Chartered Zambia":"Standard Chartered Zambia","Stream live service":"Live-Service streamen","Stream live service and find the latest worship and ministry videos from Royal Priesthood Assemblies International.":"Streamen Sie Live-Gottesdienste und finden Sie die neuesten Anbetungs- und Dienstvideos von Royal Priesthood Assemblies International.","Sunday Divine Service":"Sonntagsgottesdienst","Sunday Transport & Branches":"Sonntagstransport & Filialen","Sunday Worship":"Sonntagsgottesdienst","Sunday gallery":"Sonntagsgalerie","Sunday photos":"Sonntagsfotos","Sunday service":"Sonntagsgottesdienst","Sunday service moves to 8am from 1 December.":"Der Sonntagsgottesdienst wird ab dem 1. Dezember auf 8 Uhr morgens verschoben.","Sunday transport":"Sonntagstransport","Sunday worship":"Sonntagsgottesdienst","The ten newest photographs sent by the church":"Die zehn neuesten Fotos, die die Kirche geschickt hat","To be confirmed":"Wird noch bestätigt","To proclaim the Gospel, encourage spiritual growth through Scripture and prayer, and serve our neighbours with compassion.":"Um das Evangelium zu verkünden, das geistliche Wachstum durch die Heilige Schrift und das Gebet zu fördern und unseren Nachbarn mit Mitgefühl zu dienen.","To see people and communities strengthened by the hope of Christ and equipped to live out their faith.":"Zu sehen, wie Menschen und Gemeinschaften durch die Hoffnung Christi gestärkt und gerüstet sind, ihren Glauben zu leben.","Today's podcast":"Der heutige Podcast","Today's reading":"Die heutige Lektüre","Updates from Royal Priesthood Assemblies International.":"Updates von Royal Priesthood Assemblies International.","Video":"Video","Virtual and cell locations":"Virtuelle und mobile Standorte","Virtuous Women’s Ministry":"Tugendhaftes Frauenministerium","Watch":"Beobachten Sie","Watch a message from the ministry.":"Sehen Sie sich eine Nachricht des Ministeriums an.","Ways to give":"Möglichkeiten zu geben","We aim to serve our neighbours and community with care.":"Unser Ziel ist es, unseren Nachbarn und der Gemeinschaft mit Fürsorge zu dienen.","We gather to honour God and make room for prayer, praise, and gratitude.":"Wir kommen zusammen, um Gott zu ehren und Raum für Gebet, Lob und Dankbarkeit zu schaffen.","We gather to honour God through prayer, praise, and gratitude.":"Wir kommen zusammen, um Gott durch Gebet, Lob und Dankbarkeit zu ehren.","We seek to build a life of faith through Scripture, prayer, and encouragement.":"Wir möchten durch die Heilige Schrift, Gebete und Ermutigung ein Leben im Glauben aufbauen.","We seek to create a welcoming community where people can learn Scripture, strengthen their faith, and serve others with compassion.":"Wir möchten eine einladende Gemeinschaft schaffen, in der Menschen die Heilige Schrift lernen, ihren Glauben stärken und anderen mit Mitgefühl dienen können.","We seek to grow through Scripture, prayer, and encouragement.":"Wir möchten durch die Heilige Schrift, das Gebet und die Ermutigung wachsen.","We value welcoming one another, sharing life, and serving our community with care.":"Wir legen Wert darauf, einander willkommen zu heißen, das Leben zu teilen und unserer Gemeinschaft mit Fürsorge zu dienen.","We welcome one another and share life as a church family.":"Wir heißen einander willkommen und teilen das Leben als Kirchenfamilie.","We would be glad to hear from you.":"Wir würden uns freuen, von Ihnen zu hören.","Wednesdays at 05:30 PM CAT":"Mittwochs um 17:30 Uhr CAT","We’re here to stand with you":"Wir sind hier, um Ihnen zur Seite zu stehen","What matters to us":"Was uns wichtig ist","Who we are":"Wer wir sind","Who we are, and why we gather.":"Wer wir sind und warum wir uns versammeln.","Why Us":"Warum wir","Women":"Frauen","World languages":"Weltsprachen","Worship":"Anbetung","Worship and church life":"Gottesdienst und Kirchenleben","Worship audio from Royal Priesthood Assemblies International.":"Gottesdienst-Audio von Royal Priesthood Assemblies International.","Worship music":"Anbetungsmusik","You are welcome here":"Sie sind hier herzlich willkommen","You matter to God, you matter to us.":"Du bist Gott wichtig, du bist uns wichtig.","Your email app is opening with your message ready. Please review and send it to the church.":"Ihre E-Mail-App wird geöffnet und Ihre Nachricht ist bereit. Bitte überprüfen Sie es und senden Sie es an die Kirche.","Your giving supports local outreach, building expansion, and the spread of the Gospel across Zambia.":"Ihre Spende unterstützt die lokale Öffentlichkeitsarbeit, die Gebäudeerweiterung und die Verbreitung des Evangeliums in ganz Sambia.","Youth & teens":"Jugend & Teenager","ZAMTEL MOBILE MONEY":"ZAMTEL MOBILE MONEY","Zambia National Commercial Bank":"Zambia National Commercial Bank","Zambian banks":"Sambische Banken","Zambian languages":"Sambische Sprachen","Zamtel Mobile Money":"Zamtel Mobile Money","Zanaco":"Zanaco","“Honor the Lord with your possessions, and with the firstfruits of all your increase.”":"„Ehre den Herrn mit deinem Besitz und mit den Erstlingen all deines Ertrags.“","“Let us hold unswervingly to the hope we profess, for he who promised is faithful.”":"„Lasst uns unerschütterlich an der Hoffnung festhalten, die wir bekennen, denn wer versprochen hat, ist treu.“","Fellowships":"Gemeinschaften"},"it":{"(The Pillars)":"(I Pilastri)","09:00 AM CAT":"09:00 AM CAT","A Christian church in Lusaka, Zambia, growing together through worship, the Word, and service to our neighbours.":"Una chiesa cristiana a Lusaka, Zambia, che cresce insieme attraverso il culto, la Parola e il servizio al prossimo.","A church built on prayer and fellowship":"Una chiesa costruita sulla preghiera e sulla fraternità","A community strengthened by hope":"Una comunità rafforzata dalla speranza","A fresh reading from Rhapsody of Realities each day.":"Una nuova lettura da Rhapsody of Realities ogni giorno.","A people of faith, growing together":"Un popolo di fede, che cresce insieme","A place of love where everyone counts":"Un luogo d'amore dove tutti contano","A place of love where everyone counts.":"Un luogo d'amore dove tutti contano.","A place to belong and to grow":"Un luogo a cui appartenere e in cui crescere","A vibrant community where young believers can discover their God-given identity, talents, and career callings.":"Una comunità vivace in cui i giovani credenti possono scoprire l'identità, i talenti e le chiamate professionali donati da Dio.","AIRTEL MOBILE MONEY":"AIRTEL MOBILE MONEY","About":"Circa","About us":"Chi siamo","Absa":"Absa","Absa Bank":"Absa Bank","Absa Bank Zambia":"Absa Bank Zambia","Account name":"Nome dell'account","Account number":"Numero di conto","Airtel Mobile Money":"Airtel Mobile Money","Along Ndeke Road, Lusaka, Zambia":"Lungo Ndeke Road, Lusaka, Zambia","Announcements":"Annunci","Apostle Dr. Mighty Zunga":"Apostle Dr. Mighty Zunga","Apostle Dr. Mighty Zunga in worship":"Apostle Dr. Mighty Zunga nel culto","Apostle Dr. Mighty Zunga is the Founder and General Overseer of Royal Priesthood Assemblies International in Lusaka, Zambia. His ministry is expressed through preaching, prayer, discipleship, and the leadership of the church community. He encourages believers to grow in their understanding of Scripture and to put their faith into practice through service.":"Apostle Dr. Mighty Zunga è il fondatore e supervisore generale di Royal Priesthood Assemblies International a Lusaka, Zambia. Il suo ministero si esprime attraverso la predicazione, la preghiera, il discepolato e la guida della comunità ecclesiale. Incoraggia i credenti a crescere nella comprensione della Scrittura e a mettere in pratica la loro fede attraverso il servizio.","As a royal priesthood, we worship God with our whole lives. As disciples, we follow Jesus and help others follow Him, sharing His truth with humility and living it with compassion at home, in the church, and throughout our community.":"Come sacerdozio reale, adoriamo Dio con tutta la nostra vita. Come discepoli, seguiamo Gesù e aiutiamo gli altri a seguirlo, condividendo la Sua verità con umiltà e vivendola con compassione a casa, in chiesa e in tutta la nostra comunità.","Ask about a fellowship":"Chiedi informazioni su una comunità","Ask about a ride":"Chiedi un passaggio","Ask on WhatsApp":"Chiedi su WhatsApp","Audio":"Audio","Back to slideshow":"Torna alla presentazione","Branches & Transport":"Filiali e trasporti","Call":"Chiama","Call +260 767 716 936":"Chiama il numero +260 767 716 936","Centre":"Centro","Choose one":"Scegline uno","Choose the next step that feels right for you. Your message will be prepared in your email app for you to review and send.":"Scegli il passaggio successivo che ritieni giusto per te. Il tuo messaggio verrà preparato nella tua app di posta elettronica per poter essere esaminato e inviato.","Church Services":"Servizi della Chiesa","Church updates":"Aggiornamenti della Chiesa","Close menu":"Chiudi menu","Connect with RPAI":"Connettiti con RPAI","Connect with a local fellowship for biblical discussion and mutual support.":"Entra in contatto con una comunità locale per discussioni bibliche e sostegno reciproco.","Contact":"Contatto","Contact the church":"Contatta la chiesa","Contact the church to ask about current Sunday transport availability, pickup points, and arrangements.":"Contatta la chiesa per chiedere informazioni sulla disponibilità attuale dei trasporti domenicali, sui punti di ritiro e sulle modalità.","Daily Devotional":"Devozionale quotidiano","Daily message":"Messaggio quotidiano","Email Address":"Indirizzo e-mail","Email the church":"Invia un'e-mail alla chiesa","Empowering and equipping men to take their place of leadership in family, career, and church through focused fellowship and growth sessions, including the Online Royal Men’s Summit.":"Dare potere e dotare gli uomini degli strumenti per assumere il loro posto di leadership nella famiglia, nella carriera e nella chiesa attraverso sessioni mirate di amicizia e crescita, incluso il Royal Men's Summit online.","Every ministry here opens room for worship, prayer, biblical learning, fellowship, and practical service in our community.":"Ogni ministero qui apre spazio all’adorazione, alla preghiera, all’apprendimento biblico, alla comunione e al servizio pratico nella nostra comunità.","Explore our ministries":"Esplora i nostri ministeri","FNB":"FNB","FNB Zambia":"FNB Zambia","Facebook only shows its posts to people who are signed in to Facebook, so the live feed below stays blank for many visitors. The button above always works.":"Facebook mostra i suoi post solo alle persone che hanno effettuato l'accesso a Facebook, quindi il feed live di seguito rimane vuoto per molti visitatori. Il pulsante qui sopra funziona sempre.","Faith in word and action":"Fede in parole e azioni","Faith lived together":"La fede viveva insieme","Fellowship":"Comunità","Fellowship locations":"Luoghi di comunità","Find a Home Cell":"Trova una cellula domestica","Find a church community":"Trova una comunità ecclesiale","Find a fellowship":"Trova una comunità","Find the Sunday gathering location and contact the church about transport and fellowship locations.":"Trova il luogo dell'incontro domenicale e contatta la chiesa per informazioni sui trasporti e sui luoghi di comunità.","Find your place among our ministries.":"Trova il tuo posto tra i nostri ministeri.","First National Bank":"First National Bank","Follow the church for updates, photos and notices":"Seguite la chiesa per aggiornamenti, foto e avvisi","Follow us":"Seguici","For help with any of these details, contact the church office.":"Per assistenza con uno qualsiasi di questi dettagli, contattare l'ufficio della chiesa.","Full Name":"Nome completo","Gallery":"Galleria","Gallery & Media":"Galleria e contenuti multimediali","General Overseer & Founder":"Supervisore generale e fondatore","General Overseer and Founder":"Supervisore generale e fondatore","Give":"Dai","Give directly to any of our Zambian bank accounts. Please use your name as the reference so the church can acknowledge your gift.":"Fai una donazione direttamente su uno qualsiasi dei nostri conti bancari in Zambia. Per favore usa il tuo nome come riferimento in modo che la chiesa possa riconoscere il tuo dono.","Give via PayPal":"Dona tramite PayPal","Giving details":"Fornire dettagli","Giving from outside Zambia? Use our only international gateway, PayPal.":"Donare da fuori dello Zambia? Utilizza il nostro unico gateway internazionale, PayPal.","God has not forgotten you. His mercies are new every morning.":"Dio non ti ha dimenticato. Le sue misericordie sono nuove ogni mattina.","Grow in faith":"Crescere nella fede","Grow with us in faith and fellowship":"Cresci con noi nella fede e nella comunione","Growing in faith":"Crescere nella fede","Hebrews 10:23":"Hebrews 10:23","Home":"Casa","Home Cell & Branch Fellowships":"Cellule domestiche e comunità di filiali","How can Apostle Dr. Mighty Zunga and the RPAI Prayer Team stand in faith with you this week?":"Come possono Apostle Dr. Mighty Zunga e il RPAI Gruppo di Preghiera rimanere fedeli a te questa settimana?","How can we connect?":"Come possiamo connetterci?","I am looking for a church home":"Cerco una chiesa-casa","I want to join a local Cell group":"Voglio unirmi a un gruppo cellulare locale","I want to receive salvation":"Voglio ricevere la salvezza","I'm New Here / Connect Card":"Sono nuovo qui / Scheda di contatto","In Royal Priesthood, love is more than a kind word; it is the life of Christ made visible in the way we welcome, forgive, serve, and stand beside one another. We are called to carry each other's burdens and to make room for every person to grow in faith.":"Nel Sacerdozio Reale, l'amore è più di una parola gentile; è la vita di Cristo resa visibile nel modo in cui accogliamo, perdoniamo, serviamo e stiamo accanto all’altro. Siamo chiamati a portare i pesi gli uni degli altri e a fare spazio affinché ogni persona possa crescere nella fede.","International giving":"Donazioni internazionali","I’m New Here / Connect Card":"Sono nuovo qui / Scheda di contatto","John 13:34-35.":"John 13:34-35.","Join Us":"Unisciti a noi","Join us every Sunday at 09:00 AM CAT at Otwa Events, Long Acres, Lusaka.":"Unisciti a noi ogni domenica alle 09:00 AM CAT alle Otwa Events, Long Acres, Lusaka.","Join us for Sunday Divine Service at 09:00 AM CAT at Otwa Events, Long Acres, along Ndeke Road in Lusaka.":"Unisciti a noi per il servizio divino domenicale alle 09:00 AM CAT alle Otwa Events, Long Acres, lungo Ndeke Road a Lusaka.","Join us in Lusaka":"Unisciti a noi a Lusaka","Join us this week":"Unisciti a noi questa settimana","Keep Your Faith":"Mantieni la tua fede","Keep faith through every season":"Mantieni la fede in ogni stagione","Know more about us":"Scopri di più su di noi","Latest announcements":"Ultimi annunci","Latest photos":"Ultime foto","Let us pray for you. Share your needs and we will stand with you in faith and prayer.":"Preghiamo per te. Condividi i tuoi bisogni e noi saremo al tuo fianco nella fede e nella preghiera.","Listen":"Ascolta","Listen to music by LoveWorld Singers and Pastor Chris through licensed music services. Use each service's own purchase or download option where available.":"Ascolta la musica di LoveWorld Singers e Pastor Chris attraverso servizi musicali autorizzati. Utilizza l'opzione di acquisto o download di ciascun servizio, ove disponibile.","Live Service":"Servizio dal vivo","Loading...":"Caricamento...","Local fellowships":"Comunità locali","Local gatherings, including groups meeting in areas such as Chalala, for biblical discussion, mutual support, and neighbourly care.":"Riunioni locali, compresi gruppi che si incontrano in aree come Chalala, per discussioni bibliche, sostegno reciproco e cura del vicinato.","Love that forms disciples":"L'amore che forma discepoli","LoveWorld Singers on Apple Music":"Cantanti di LoveWorld su Apple Music","LoveWorld Singers on Spotify":"Cantanti di LoveWorld su Spotify","LoveWorld Singers on YouTube Music":"LoveWorld Singers su YouTube Music","Lusaka Main Centre":"Lusaka Main Centre","MTN MOBILE MONEY":"MTN MOBILE MONEY","MTN Mobile Money":"MTN Mobile Money","Meet with us Wednesdays at 05:30 PM CAT for interactive fellowship, virtually and in cell locations.":"Incontraci il mercoledì alle 17:30 CAT per una comunione interattiva, online e nei gruppi domestici.","Men":"Uomini","Mid-Week Fellowship":"Comunione infrasettimanale","Mid-Week Interactive Fellowship":"Comunione interattiva infrasettimanale","Ministries":"Ministeri","Ministries & Fellowships":"Ministeri e comunità","Mobile Money":"Denaro mobile","PayPal email":"Email PayPal","Moments of worship, prayer, fellowship, and ministry from Royal Priesthood Assemblies International.":"Momenti di adorazione, preghiera, comunione e ministero da Royal Priesthood Assemblies International.","Next photos":"Prossime foto","Next steps":"Prossimi passi","NextGen Youth & Teen Ministry":"Ministero della gioventù e dell'adolescenza della prossima generazione","Open directions in Google Maps":"Apri le indicazioni stradali in Google Maps","Open menu":"Apri menu","Open the church's Facebook page":"Apri la pagina Facebook della Chiesa","Otwa Events, Long Acres":"Otwa Events, Long Acres","Otwa Events, Long Acres, along Ndeke Road, Lusaka, Zambia":"Otwa Events, Long Acres, lungo Ndeke Road, Lusaka, Zambia","Our Founder":"Il nostro Fondatore","Our Services":"I nostri servizi","Our ministries":"I nostri ministeri","Our ministries create opportunities for worship, prayer, biblical learning, fellowship, and practical service in the community.":"I nostri ministeri creano opportunità di culto, preghiera, apprendimento biblico, comunione e servizio pratico nella comunità.","Our mission":"La nostra missione","Our vision":"La nostra visione","Pal":"Amico","Partner with us":"Collabora con noi","Pastor Chris on Apple Music":"Pastore Chris su Apple Music","Pastor Chris on Spotify":"Pastore Chris su Spotify","Pastor Chris on YouTube Music":"Pastore Chris su YouTube Music","Pastor Thelma welcome you to Royal Priesthood Assemblies International.":"Pastor Thelma vi dà il benvenuto a Royal Priesthood Assemblies International.","Pause slideshow":"Metti in pausa la presentazione","Pay":"Paga","PayPal":"PayPal","Phone Number":"Numero di telefono","Photographs from worship gatherings and ministry moments. Select any photograph to view it larger.":"Fotografie di incontri di culto e momenti di ministero. Seleziona una fotografia per visualizzarla ingrandita.","Plan Your Visit":"Organizza la tua visita","Plan your visit":"Organizza la tua visita","Play slideshow":"Riproduci la presentazione","Previous photos":"Foto precedenti","Proverbs 3:9":"Proverbs 3:9","ROYAL PRIESTHOOD ASSEMBLIES INTERNATIONAL":"ROYAL PRIESTHOOD ASSEMBLIES INTERNATIONAL","ROYAL Priesthood Assemblies International":"ROYAL Priesthood Assemblies International","RPAI lists local home-cell and branch fellowships, including gatherings in Chalala. Contact the church for current meeting locations, schedules, and details about other branches.":"RPAI elenca le cellule domestiche locali e le comunità di filiali, compresi gli incontri a Chalala. Contatta la chiesa per conoscere i luoghi e gli orari attuali degli incontri e i dettagli sulle altre filiali.","Raising spiritual mothers, career women, and impactful leaders through local sisterhood fellowships and prayer clusters.":"Crescere madri spirituali, donne in carriera e leader di grande impatto attraverso comunità locali di sorelle e gruppi di preghiera.","Read the complete daily devotional from the official Rhapsody of Realities reading page.":"Leggi il devozionale quotidiano completo dalla pagina ufficiale di lettura Rhapsody of Realities.","Read today's devotional":"Leggi il devozionale di oggi","Read today's message on the official Rhapsody of Realities site, and spend a few quiet minutes with God before the day begins.":"Leggi il messaggio di oggi sul sito ufficiale Rhapsody of Realities e trascorri qualche minuto tranquillo con Dio prima che la giornata abbia inizio.","Recent public posts from the Royal Priesthood Assemblies International Facebook page.":"Post pubblici recenti dalla pagina Facebook Royal Priesthood Assemblies International.","Recordings":"Registrazioni","Request a Prayer":"Richiedi una preghiera","Rhapsody of Realities":"Rhapsody of Realities","Rooted in faith. United in fellowship.":"Radicati nella fede. Uniti nella comunione.","Royal Men's Fellowship":"Comunità maschile reale","Royal Men’s Fellowship":"Comunità maschile reale","Royal Priesthood Assemblies International":"Royal Priesthood Assemblies International","Royal Priesthood Assemblies International can add direct audio downloads when it has the tracks and permission to distribute them.":"Royal Priesthood Assemblies International può aggiungere download audio diretti quando dispone delle tracce e dell'autorizzazione a distribuirle.","Royal Priesthood Assemblies International is a Christian church based in Lusaka, Zambia. Our church life is centred on worship, biblical teaching, prayer, fellowship, and service.":"Royal Priesthood Assemblies International è una chiesa cristiana con sede a Lusaka, Zambia. La nostra vita ecclesiale è incentrata sul culto, sull’insegnamento biblico, sulla preghiera, sulla comunione e sul servizio.","Royal Priesthood Assemblies International is a church family in Lusaka, Zambia. We gather to worship, grow in faith, and serve our community.":"Royal Priesthood Assemblies International è una famiglia della chiesa di Lusaka, Zambia. Ci riuniamo per adorare, crescere nella fede e servire la nostra comunità.","Royal Priesthood Assemblies International. All rights reserved.":"Royal Priesthood Assemblies International. Tutti i diritti riservati.","Scripture:":"Scrittura:","Select language":"Seleziona la lingua","Send Connect Card":"Invia la scheda Connect","Send Prayer Request":"Invia richiesta di preghiera","Send a prayer request, plan your visit, or ask us anything.":"Invia una richiesta di preghiera, pianifica la tua visita o chiedici qualsiasi cosa.","Send us your prayer request":"Inviaci la tua richiesta di preghiera","Serve with care":"Servire con cura","Service video":"Video di servizio","Share a Prayer Request":"Condividi una richiesta di preghiera","Show all pictures":"Mostra tutte le immagini","Show slideshow":"Mostra presentazione","Songs and downloads":"Canzoni e download","Songs from the church":"Canti dalla chiesa","Stanbic":"Stanbico","Stanbic Bank":"Stanbic Bank","Stanbic Bank Zambia":"Stanbic Bank Zambia","Standard Chartered":"Standard Chartered","Standard Chartered Zambia":"Standard Chartered Zambia","Stream live service":"Servizio in streaming dal vivo","Stream live service and find the latest worship and ministry videos from Royal Priesthood Assemblies International.":"Trasmetti in streaming il servizio dal vivo e trova gli ultimi video di culto e ministero da Royal Priesthood Assemblies International.","Sunday Divine Service":"Servizio divino domenicale","Sunday Transport & Branches":"Trasporti e filiali domenicali","Sunday Worship":"Culto domenicale","Sunday gallery":"Galleria della domenica","Sunday photos":"Le foto della domenica","Sunday service":"Servizio domenicale","Sunday service moves to 8am from 1 December.":"Dal 1° dicembre il servizio domenicale sarà alle 8.00.","Sunday transport":"Trasporto domenicale","Sunday worship":"Culto domenicale","The ten newest photographs sent by the church":"Le dieci fotografie più recenti inviate dalla chiesa","To be confirmed":"Da confermare","To proclaim the Gospel, encourage spiritual growth through Scripture and prayer, and serve our neighbours with compassion.":"Annunciare il Vangelo, incoraggiare la crescita spirituale attraverso la Scrittura e la preghiera e servire il nostro prossimo con compassione.","To see people and communities strengthened by the hope of Christ and equipped to live out their faith.":"Vedere persone e comunità rafforzate dalla speranza di Cristo e attrezzate per vivere la propria fede.","Today's podcast":"Il podcast di oggi","Today's reading":"La lettura di oggi","Updates from Royal Priesthood Assemblies International.":"Aggiornamenti da Royal Priesthood Assemblies International.","Video":"Video","Virtual and cell locations":"Posizioni virtuali e cellulari","Virtuous Women’s Ministry":"Ministero delle donne virtuose","Watch":"Guarda","Watch a message from the ministry.":"Guarda il messaggio del Ministero.","Ways to give":"Modi per donare","We aim to serve our neighbours and community with care.":"Il nostro obiettivo è servire i nostri vicini e la comunità con cura.","We gather to honour God and make room for prayer, praise, and gratitude.":"Ci riuniamo per onorare Dio e fare spazio alla preghiera, alla lode e alla gratitudine.","We gather to honour God through prayer, praise, and gratitude.":"Ci riuniamo per onorare Dio attraverso la preghiera, la lode e la gratitudine.","We seek to build a life of faith through Scripture, prayer, and encouragement.":"Cerchiamo di costruire una vita di fede attraverso la Scrittura, la preghiera e l’incoraggiamento.","We seek to create a welcoming community where people can learn Scripture, strengthen their faith, and serve others with compassion.":"Cerchiamo di creare una comunità accogliente in cui le persone possano imparare le Scritture, rafforzare la propria fede e servire gli altri con compassione.","We seek to grow through Scripture, prayer, and encouragement.":"Cerchiamo di crescere attraverso la Scrittura, la preghiera e l’incoraggiamento.","We value welcoming one another, sharing life, and serving our community with care.":"Apprezziamo accoglierci a vicenda, condividere la vita e servire la nostra comunità con cura.","We welcome one another and share life as a church family.":"Ci diamo il benvenuto l'un l'altro e condividiamo la vita come famiglia ecclesiale.","We would be glad to hear from you.":"Saremo lieti di sentire la tua opinione.","Wednesdays at 05:30 PM CAT":"Mercoledì alle 17:30 CAT","We’re here to stand with you":"Siamo qui per stare al tuo fianco","What matters to us":"Ciò che conta per noi","Who we are":"Chi siamo","Who we are, and why we gather.":"Chi siamo e perché ci riuniamo.","Why Us":"Perché noi","Women":"Donne","World languages":"Lingue del mondo","Worship":"Culto","Worship and church life":"Culto e vita ecclesiale","Worship audio from Royal Priesthood Assemblies International.":"Audio di adorazione da Royal Priesthood Assemblies International.","Worship music":"Adorare la musica","You are welcome here":"Sei il benvenuto qui","You matter to God, you matter to us.":"Sei importante per Dio, sei importante per noi.","Your email app is opening with your message ready. Please review and send it to the church.":"L'app di posta elettronica si sta aprendo con il messaggio pronto. Si prega di esaminarlo e inviarlo alla chiesa.","Your giving supports local outreach, building expansion, and the spread of the Gospel across Zambia.":"Le tue donazioni sostengono la sensibilizzazione locale, l'espansione edilizia e la diffusione del Vangelo in tutto lo Zambia.","Youth & teens":"Giovani e adolescenti","ZAMTEL MOBILE MONEY":"ZAMTEL MOBILE MONEY","Zambia National Commercial Bank":"Zambia National Commercial Bank","Zambian banks":"Banche dello Zambia","Zambian languages":"Lingue dello Zambia","Zamtel Mobile Money":"Zamtel Mobile Money","Zanaco":"Zanaco","“Honor the Lord with your possessions, and with the firstfruits of all your increase.”":"“Onora il Signore con i tuoi beni e con le primizie di tutti i tuoi proventi”.","“Let us hold unswervingly to the hope we profess, for he who promised is faithful.”":"“Manteniamo fermamente la speranza che professiamo, perché fedele è colui che ha promesso”.","Fellowships":"Comunità"},"pt":{"(The Pillars)":"(Os Pilares)","09:00 AM CAT":"09:00 AM CAT","A Christian church in Lusaka, Zambia, growing together through worship, the Word, and service to our neighbours.":"Uma igreja cristã em Lusaka, Zâmbia, crescendo junta através da adoração, da Palavra e do serviço ao próximo.","A church built on prayer and fellowship":"Uma igreja construída sobre oração e comunhão","A community strengthened by hope":"Uma comunidade fortalecida pela esperança","A fresh reading from Rhapsody of Realities each day.":"Uma nova leitura de Rhapsody of Realities todos os dias.","A people of faith, growing together":"Um povo de fé, crescendo juntos","A place of love where everyone counts":"Um lugar de amor onde todos contam","A place of love where everyone counts.":"Um lugar de amor onde todos contam.","A place to belong and to grow":"Um lugar para pertencer e crescer","A vibrant community where young believers can discover their God-given identity, talents, and career callings.":"Uma comunidade vibrante onde jovens crentes podem descobrir sua identidade, talentos e vocações profissionais dados por Deus.","AIRTEL MOBILE MONEY":"AIRTEL MOBILE MONEY","About":"Sobre","About us":"Sobre nós","Absa":"Absa","Absa Bank":"Absa Bank","Absa Bank Zambia":"Absa Bank Zambia","Account name":"Nome da conta","Account number":"Número da conta","Airtel Mobile Money":"Airtel Mobile Money","Along Ndeke Road, Lusaka, Zambia":"Ao longo da Ndeke Road, Lusaka, Zâmbia","Announcements":"Anúncios","Apostle Dr. Mighty Zunga":"Apostle Dr. Mighty Zunga","Apostle Dr. Mighty Zunga in worship":"Apostle Dr. Mighty Zunga na adoração","Apostle Dr. Mighty Zunga is the Founder and General Overseer of Royal Priesthood Assemblies International in Lusaka, Zambia. His ministry is expressed through preaching, prayer, discipleship, and the leadership of the church community. He encourages believers to grow in their understanding of Scripture and to put their faith into practice through service.":"Apostle Dr. Mighty Zunga é o Fundador e Supervisor Geral da Royal Priesthood Assemblies International em Lusaka, Zâmbia. Seu ministério é expresso através da pregação, oração, discipulado e liderança da comunidade da igreja. Ele encoraja os crentes a crescerem na sua compreensão das Escrituras e a colocarem a sua fé em prática através do serviço.","As a royal priesthood, we worship God with our whole lives. As disciples, we follow Jesus and help others follow Him, sharing His truth with humility and living it with compassion at home, in the church, and throughout our community.":"Como sacerdócio real, adoramos a Deus com toda a nossa vida. Como discípulos, seguimos Jesus e ajudamos outros a segui-Lo, partilhando a Sua verdade com humildade e vivendo-a com compaixão em casa, na igreja e em toda a nossa comunidade.","Ask about a fellowship":"Pergunte sobre uma comunidade","Ask about a ride":"Pergunte sobre uma carona","Ask on WhatsApp":"Pergunte no WhatsApp","Audio":"Áudio","Back to slideshow":"Voltar à apresentação de slides","Branches & Transport":"Filiais e Transporte","Call":"Ligar","Call +260 767 716 936":"Ligue para +260 767 716 936","Centre":"Centro","Choose one":"Escolha um","Choose the next step that feels right for you. Your message will be prepared in your email app for you to review and send.":"Escolha a próxima etapa que achar melhor para você. Sua mensagem será preparada em seu aplicativo de e-mail para você revisar e enviar.","Church Services":"Serviços da Igreja","Church updates":"Atualizações da igreja","Close menu":"Fechar menu","Connect with RPAI":"Conecte-se com RPAI","Connect with a local fellowship for biblical discussion and mutual support.":"Ligue-se a uma comunidade local para discussão bíblica e apoio mútuo.","Contact":"Contato","Contact the church":"Entre em contato com a igreja","Contact the church to ask about current Sunday transport availability, pickup points, and arrangements.":"Entre em contato com a igreja para perguntar sobre a disponibilidade atual de transporte aos domingos, pontos de coleta e preparativos.","Daily Devotional":"Devocional Diário","Daily message":"Mensagem diária","Email Address":"Endereço de e-mail","Email the church":"Envie um e-mail para a igreja","Empowering and equipping men to take their place of leadership in family, career, and church through focused fellowship and growth sessions, including the Online Royal Men’s Summit.":"Capacitar e equipar os homens para assumirem o seu lugar de liderança na família, na carreira e na igreja através de sessões focadas de comunhão e crescimento, incluindo o Online Royal Men’s Summit.","Every ministry here opens room for worship, prayer, biblical learning, fellowship, and practical service in our community.":"Cada ministério aqui abre espaço para adoração, oração, aprendizado bíblico, comunhão e serviço prático em nossa comunidade.","Explore our ministries":"Explore nossos ministérios","FNB":"FNB","FNB Zambia":"FNB Zambia","Facebook only shows its posts to people who are signed in to Facebook, so the live feed below stays blank for many visitors. The button above always works.":"O Facebook mostra suas postagens apenas para pessoas que estão conectadas ao Facebook, portanto, o feed ao vivo abaixo permanece em branco para muitos visitantes. O botão acima sempre funciona.","Faith in word and action":"Fé em palavra e ação","Faith lived together":"A fé viveu junto","Fellowship":"Comunhão","Fellowship locations":"Locais de comunhão","Find a Home Cell":"Encontre uma célula inicial","Find a church community":"Encontre uma comunidade religiosa","Find a fellowship":"Encontre uma comunidade","Find the Sunday gathering location and contact the church about transport and fellowship locations.":"Encontre o local da reunião de domingo e contacte a igreja sobre transporte e locais de comunhão.","Find your place among our ministries.":"Encontre o seu lugar entre nossos ministérios.","First National Bank":"First National Bank","Follow the church for updates, photos and notices":"Siga a igreja para atualizações, fotos e avisos","Follow us":"Siga-nos","For help with any of these details, contact the church office.":"Para obter ajuda com qualquer um desses detalhes, entre em contato com o escritório da igreja.","Full Name":"Nome Completo","Gallery":"Galeria","Gallery & Media":"Galeria e mídia","General Overseer & Founder":"Supervisor Geral e Fundador","General Overseer and Founder":"Superintendente Geral e Fundador","Give":"Dê","Give directly to any of our Zambian bank accounts. Please use your name as the reference so the church can acknowledge your gift.":"Doe diretamente para qualquer uma de nossas contas bancárias na Zâmbia. Por favor, use seu nome como referência para que a igreja possa reconhecer sua doação.","Give via PayPal":"Dê por PayPal","Giving details":"Dando detalhes","Giving from outside Zambia? Use our only international gateway, PayPal.":"Doar de fora da Zâmbia? Use nosso único gateway internacional, PayPal.","God has not forgotten you. His mercies are new every morning.":"Deus não se esqueceu de você. Suas misericórdias são novas a cada manhã.","Grow in faith":"Crescer na fé","Grow with us in faith and fellowship":"Cresça connosco na fé e na comunhão","Growing in faith":"Crescendo na fé","Hebrews 10:23":"Hebrews 10:23","Home":"Página inicial","Home Cell & Branch Fellowships":"Células domésticas e comunidades de filiais","How can Apostle Dr. Mighty Zunga and the RPAI Prayer Team stand in faith with you this week?":"Como Apostle Dr. Mighty Zunga e a RPAI Equipe de Oração podem permanecer com fé com você esta semana?","How can we connect?":"Como podemos nos conectar?","I am looking for a church home":"Estou procurando uma casa para igreja","I want to join a local Cell group":"Quero participar de um grupo de células local","I want to receive salvation":"Eu quero receber a salvação","I'm New Here / Connect Card":"Sou novo aqui / Cartão de contacto","In Royal Priesthood, love is more than a kind word; it is the life of Christ made visible in the way we welcome, forgive, serve, and stand beside one another. We are called to carry each other's burdens and to make room for every person to grow in faith.":"No Sacerdócio Real, o amor é mais do que uma palavra amável; é a vida de Cristo tornada visível na maneira como acolhemos, perdoamos, servimos e permanecemos ao lado uns dos outros. Somos chamados a carregar os fardos uns dos outros e a abrir espaço para que cada pessoa cresça na fé.","International giving":"Doações internacionais","I’m New Here / Connect Card":"Sou novo aqui / Cartão de contacto","John 13:34-35.":"John 13:34-35.","Join Us":"Junte-se a nós","Join us every Sunday at 09:00 AM CAT at Otwa Events, Long Acres, Lusaka.":"Junte-se a nós todos os domingos às 09:00 AM CAT às Otwa Events, Long Acres, Lusaka.","Join us for Sunday Divine Service at 09:00 AM CAT at Otwa Events, Long Acres, along Ndeke Road in Lusaka.":"Junte-se a nós para o Culto Divino de Domingo às 09:00 AM CAT às Otwa Events, Long Acres, ao longo da Ndeke Road em Lusaka.","Join us in Lusaka":"Junte-se a nós em Lusaca","Join us this week":"Junte-se a nós esta semana","Keep Your Faith":"Mantenha sua fé","Keep faith through every season":"Mantenha a fé em todas as estações","Know more about us":"Saiba mais sobre nós","Latest announcements":"Últimos anúncios","Latest photos":"Últimas fotos","Let us pray for you. Share your needs and we will stand with you in faith and prayer.":"Vamos orar por você. Compartilhe suas necessidades e estaremos com você em fé e oração.","Listen":"Ouça","Listen to music by LoveWorld Singers and Pastor Chris through licensed music services. Use each service's own purchase or download option where available.":"Ouça músicas de LoveWorld Singers e Pastor Chris por meio de serviços de música licenciados. Use a opção de compra ou download de cada serviço, quando disponível.","Live Service":"Serviço ao vivo","Loading...":"Carregando...","Local fellowships":"Comunidades locais","Local gatherings, including groups meeting in areas such as Chalala, for biblical discussion, mutual support, and neighbourly care.":"Reuniões locais, incluindo grupos que se reúnem em áreas como Chalala, para discussão bíblica, apoio mútuo e cuidado com a vizinhança.","Love that forms disciples":"Amor que forma discípulos","LoveWorld Singers on Apple Music":"Cantores do LoveWorld na Apple Music","LoveWorld Singers on Spotify":"Cantores do LoveWorld no Spotify","LoveWorld Singers on YouTube Music":"LoveWorld Singers no YouTube Music","Lusaka Main Centre":"Lusaka Main Centre","MTN MOBILE MONEY":"MTN MOBILE MONEY","MTN Mobile Money":"MTN Mobile Money","Meet with us Wednesdays at 05:30 PM CAT for interactive fellowship, virtually and in cell locations.":"Encontre-se connosco às quartas-feiras às 17h30 CAT para comunhão interativa, online e em células.","Men":"Homens","Mid-Week Fellowship":"Comunhão de meio de semana","Mid-Week Interactive Fellowship":"Comunhão interativa de meio de semana","Ministries":"Ministérios","Ministries & Fellowships":"Ministérios e comunidades","Mobile Money":"Dinheiro móvel","PayPal email":"E-mail PayPal","Moments of worship, prayer, fellowship, and ministry from Royal Priesthood Assemblies International.":"Momentos de adoração, oração, comunhão e ministério de Royal Priesthood Assemblies International.","Next photos":"Próximas fotos","Next steps":"Próximas etapas","NextGen Youth & Teen Ministry":"Ministério de Jovens e Adolescentes NextGen","Open directions in Google Maps":"Abra rotas no Google Maps","Open menu":"Abrir menu","Open the church's Facebook page":"Abra a página da igreja no Facebook","Otwa Events, Long Acres":"Otwa Events, Long Acres","Otwa Events, Long Acres, along Ndeke Road, Lusaka, Zambia":"Otwa Events, Long Acres, ao longo da Ndeke Road, Lusaka, Zâmbia","Our Founder":"Nosso Fundador","Our Services":"Nossos serviços","Our ministries":"Nossos ministérios","Our ministries create opportunities for worship, prayer, biblical learning, fellowship, and practical service in the community.":"Nossos ministérios criam oportunidades de adoração, oração, aprendizado bíblico, comunhão e serviço prático na comunidade.","Our mission":"Nossa missão","Our vision":"Nossa visão","Pal":"Amigo","Partner with us":"Seja nosso parceiro","Pastor Chris on Apple Music":"Pastor Chris na Apple Music","Pastor Chris on Spotify":"Pastor Chris no Spotify","Pastor Chris on YouTube Music":"Pastor Chris no YouTube Music","Pastor Thelma welcome you to Royal Priesthood Assemblies International.":"Pastor Thelma bem-vindo a Royal Priesthood Assemblies International.","Pause slideshow":"Pausar apresentação de slides","Pay":"Pagar","PayPal":"PayPal","Phone Number":"Número de telefone","Photographs from worship gatherings and ministry moments. Select any photograph to view it larger.":"Fotografias de reuniões de adoração e momentos de ministério. Selecione qualquer fotografia para visualizá-la em tamanho maior.","Plan Your Visit":"Planeje sua visita","Plan your visit":"Planeje sua visita","Play slideshow":"Reproduzir apresentação de slides","Previous photos":"Fotos anteriores","Proverbs 3:9":"Proverbs 3:9","ROYAL PRIESTHOOD ASSEMBLIES INTERNATIONAL":"ROYAL PRIESTHOOD ASSEMBLIES INTERNATIONAL","ROYAL Priesthood Assemblies International":"ROYAL Priesthood Assemblies International","RPAI lists local home-cell and branch fellowships, including gatherings in Chalala. Contact the church for current meeting locations, schedules, and details about other branches.":"A RPAI lista as células domésticas e comunidades de filiais locais, incluindo reuniões em Chalala. Contacte a igreja para saber os locais e horários atuais das reuniões e detalhes sobre outras filiais.","Raising spiritual mothers, career women, and impactful leaders through local sisterhood fellowships and prayer clusters.":"Criar mães espirituais, mulheres de carreira e líderes impactantes através de comunidades locais de irmãs e grupos de oração.","Read the complete daily devotional from the official Rhapsody of Realities reading page.":"Leia o devocional diário completo na página oficial de leitura.","Read today's devotional":"Leia o devocional de hoje","Read today's message on the official Rhapsody of Realities site, and spend a few quiet minutes with God before the day begins.":"Leia a mensagem de hoje no site oficial e passe alguns minutos tranquilos com Deus antes do dia começar.","Recent public posts from the Royal Priesthood Assemblies International Facebook page.":"Postagens públicas recentes da página do Royal Priesthood Assemblies International Facebook.","Recordings":"Gravações","Request a Prayer":"Solicite uma oração","Rhapsody of Realities":"Rhapsody of Realities","Rooted in faith. United in fellowship.":"Enraizados na fé. Unidos na comunhão.","Royal Men's Fellowship":"Irmandade Real Masculina","Royal Men’s Fellowship":"Irmandade Real Masculina","Royal Priesthood Assemblies International":"Royal Priesthood Assemblies International","Royal Priesthood Assemblies International can add direct audio downloads when it has the tracks and permission to distribute them.":"Royal Priesthood Assemblies International pode adicionar downloads diretos de áudio quando tiver as faixas e permissão para distribuí-las.","Royal Priesthood Assemblies International is a Christian church based in Lusaka, Zambia. Our church life is centred on worship, biblical teaching, prayer, fellowship, and service.":"Royal Priesthood Assemblies International é uma igreja cristã com sede em Lusaka, Zâmbia. Nossa vida na igreja está centrada na adoração, no ensino bíblico, na oração, na comunhão e no serviço.","Royal Priesthood Assemblies International is a church family in Lusaka, Zambia. We gather to worship, grow in faith, and serve our community.":"Royal Priesthood Assemblies International é uma família religiosa em Lusaka, Zâmbia. Nós nos reunimos para adorar, crescer na fé e servir nossa comunidade.","Royal Priesthood Assemblies International. All rights reserved.":"Royal Priesthood Assemblies International. Todos os direitos reservados.","Scripture:":"Escritura:","Select language":"Selecione o idioma","Send Connect Card":"Enviar cartão de conexão","Send Prayer Request":"Enviar pedido de oração","Send a prayer request, plan your visit, or ask us anything.":"Envie um pedido de oração, planeje sua visita ou pergunte-nos qualquer coisa.","Send us your prayer request":"Envie-nos seu pedido de oração","Serve with care":"Sirva com cuidado","Service video":"Vídeo de serviço","Share a Prayer Request":"Compartilhe um pedido de oração","Show all pictures":"Mostrar todas as fotos","Show slideshow":"Mostrar apresentação de slides","Songs and downloads":"Músicas e downloads","Songs from the church":"Canções da igreja","Stanbic":"Stanbic","Stanbic Bank":"Stanbic Bank","Stanbic Bank Zambia":"Stanbic Bank Zambia","Standard Chartered":"Standard Chartered","Standard Chartered Zambia":"Standard Chartered Zambia","Stream live service":"Transmitir serviço ao vivo","Stream live service and find the latest worship and ministry videos from Royal Priesthood Assemblies International.":"Transmita o culto ao vivo e encontre os vídeos mais recentes de adoração e ministério de Royal Priesthood Assemblies International.","Sunday Divine Service":"Culto Divino Dominical","Sunday Transport & Branches":"Domingo Transporte e Filiais","Sunday Worship":"Culto de Domingo","Sunday gallery":"Galeria de domingo","Sunday photos":"Fotos de domingo","Sunday service":"Culto de domingo","Sunday service moves to 8am from 1 December.":"O culto de domingo passa para as 8h a partir de 1º de dezembro.","Sunday transport":"Transporte de domingo","Sunday worship":"Culto de domingo","The ten newest photographs sent by the church":"As dez mais novas fotografias enviadas pela igreja","To be confirmed":"A confirmar","To proclaim the Gospel, encourage spiritual growth through Scripture and prayer, and serve our neighbours with compassion.":"Proclamar o Evangelho, encorajar o crescimento espiritual através das Escrituras e da oração, e servir o nosso próximo com compaixão.","To see people and communities strengthened by the hope of Christ and equipped to live out their faith.":"Ver pessoas e comunidades fortalecidas pela esperança de Cristo e equipadas para viver a sua fé.","Today's podcast":"Podcast de hoje","Today's reading":"A leitura de hoje","Updates from Royal Priesthood Assemblies International.":"Atualizações de Royal Priesthood Assemblies International.","Video":"Vídeo","Virtual and cell locations":"Locais online e em células","Virtuous Women’s Ministry":"Ministério de Mulheres Virtuosas","Watch":"Assistir","Watch a message from the ministry.":"Assista a uma mensagem do ministério.","Ways to give":"Maneiras de dar","We aim to serve our neighbours and community with care.":"Nosso objetivo é servir nossos vizinhos e comunidade com cuidado.","We gather to honour God and make room for prayer, praise, and gratitude.":"Nós nos reunimos para honrar a Deus e abrir espaço para oração, louvor e gratidão.","We gather to honour God through prayer, praise, and gratitude.":"Nós nos reunimos para honrar a Deus através da oração, louvor e gratidão.","We seek to build a life of faith through Scripture, prayer, and encouragement.":"Procuramos construir uma vida de fé através das Escrituras, oração e encorajamento.","We seek to create a welcoming community where people can learn Scripture, strengthen their faith, and serve others with compassion.":"Procuramos criar uma comunidade acolhedora onde as pessoas possam aprender as Escrituras, fortalecer a sua fé e servir os outros com compaixão.","We seek to grow through Scripture, prayer, and encouragement.":"Procuramos crescer por meio das Escrituras, da oração e do encorajamento.","We value welcoming one another, sharing life, and serving our community with care.":"Valorizamos acolher uns aos outros, compartilhar a vida e servir nossa comunidade com cuidado.","We welcome one another and share life as a church family.":"Damos as boas-vindas uns aos outros e partilhamos a vida como uma família da igreja.","We would be glad to hear from you.":"Ficaríamos felizes em ouvir de você.","Wednesdays at 05:30 PM CAT":"Quartas-feiras às 17h30 CAT","We’re here to stand with you":"Estamos aqui para ficar com você","What matters to us":"O que importa para nós","Who we are":"Quem somos","Who we are, and why we gather.":"Quem somos e por que nos reunimos.","Why Us":"Por que nós","Women":"Mulheres","World languages":"Línguas mundiais","Worship":"Adoração","Worship and church life":"Adoração e vida da igreja","Worship audio from Royal Priesthood Assemblies International.":"Adoração em áudio de Royal Priesthood Assemblies International.","Worship music":"Música de adoração","You are welcome here":"Você é bem-vindo aqui","You matter to God, you matter to us.":"Você é importante para Deus, você é importante para nós.","Your email app is opening with your message ready. Please review and send it to the church.":"Seu aplicativo de e-mail está abrindo com sua mensagem pronta. Por favor, revise e envie para a igreja.","Your giving supports local outreach, building expansion, and the spread of the Gospel across Zambia.":"As suas doações apoiam a divulgação local, a expansão dos edifícios e a propagação do Evangelho em toda a Zâmbia.","Youth & teens":"Jovens e adolescentes","ZAMTEL MOBILE MONEY":"ZAMTEL MOBILE MONEY","Zambia National Commercial Bank":"Zambia National Commercial Bank","Zambian banks":"Bancos zambianos","Zambian languages":"Línguas zambianas","Zamtel Mobile Money":"Zamtel Mobile Money","Zanaco":"Zanaco","“Honor the Lord with your possessions, and with the firstfruits of all your increase.”":"“Honra ao Senhor com os teus bens e com as primícias de todos os teus ganhos.”","“Let us hold unswervingly to the hope we profess, for he who promised is faithful.”":"“Apeguemo-nos inabalavelmente à esperança que professamos, pois aquele que prometeu é fiel.”","Fellowships":"Comunhões"},"ru":{"(The Pillars)":"(Столпы)","09:00 AM CAT":"09:00 AM CAT","A Christian church in Lusaka, Zambia, growing together through worship, the Word, and service to our neighbours.":"Христианская церковь в Лусаке, Замбия, растущая вместе посредством поклонения, Слова и служения нашим соседям.","A church built on prayer and fellowship":"Церковь, построенная на молитве и общении","A community strengthened by hope":"Сообщество, укрепленное надеждой","A fresh reading from Rhapsody of Realities each day.":"Свежее чтение от Rhapsody of Realities каждый день.","A people of faith, growing together":"Народ веры, растущий вместе","A place of love where everyone counts":"Место любви, где каждый важен","A place of love where everyone counts.":"Место любви, где каждый имеет значение.","A place to belong and to grow":"Место, где можно принадлежать и расти","A vibrant community where young believers can discover their God-given identity, talents, and career callings.":"Яркое сообщество, где молодые верующие могут открыть для себя данную Богом индивидуальность, таланты и карьерные призвания.","AIRTEL MOBILE MONEY":"AIRTEL MOBILE MONEY","About":"О","About us":"О нас","Absa":"Абса","Absa Bank":"Absa Bank","Absa Bank Zambia":"Absa Bank Zambia","Account name":"Имя учетной записи","Account number":"Номер счета","Airtel Mobile Money":"Airtel Mobile Money","Along Ndeke Road, Lusaka, Zambia":"Вдоль дороги Ндеке, Лусака, Замбия","Announcements":"Объявления","Apostle Dr. Mighty Zunga":"Apostle Dr. Mighty Zunga","Apostle Dr. Mighty Zunga in worship":"Apostle Dr. Mighty Zunga в богослужении","Apostle Dr. Mighty Zunga is the Founder and General Overseer of Royal Priesthood Assemblies International in Lusaka, Zambia. His ministry is expressed through preaching, prayer, discipleship, and the leadership of the church community. He encourages believers to grow in their understanding of Scripture and to put their faith into practice through service.":"Apostle Dr. Mighty Zunga является основателем и генеральным руководителем Royal Priesthood Assemblies International в Лусаке, Замбия. Его служение выражается через проповедь, молитву, ученичество и руководство церковной общиной. Он призывает верующих возрастать в понимании Писания и применять свою веру на практике через служение.","As a royal priesthood, we worship God with our whole lives. As disciples, we follow Jesus and help others follow Him, sharing His truth with humility and living it with compassion at home, in the church, and throughout our community.":"Будучи царственным священством, мы поклоняемся Богу всю свою жизнь. Будучи учениками, мы следуем за Иисусом и помогаем другим следовать за Ним, делясь Его истиной со смирением и живя по ней с состраданием дома, в церкви и во всем нашем обществе.","Ask about a fellowship":"Спросить об общении","Ask about a ride":"Спросить о поездке","Ask on WhatsApp":"Спросите в WhatsApp","Audio":"Аудио","Back to slideshow":"Вернуться к слайд-шоу","Branches & Transport":"Филиалы и транспорт","Call":"Позвонить","Call +260 767 716 936":"Звоните +260 767 716 936.","Centre":"Центр","Choose one":"Выберите один","Choose the next step that feels right for you. Your message will be prepared in your email app for you to review and send.":"Выберите следующий шаг, который кажется вам подходящим. Ваше сообщение будет подготовлено в вашем почтовом приложении, чтобы вы могли его просмотреть и отправить.","Church Services":"Церковные службы","Church updates":"Обновления церкви","Close menu":"Закрыть меню","Connect with RPAI":"Свяжитесь с RPAI","Connect with a local fellowship for biblical discussion and mutual support.":"Свяжитесь с местной общиной для обсуждения Библии и взаимной поддержки.","Contact":"Контакт","Contact the church":"Связаться с церковью","Contact the church to ask about current Sunday transport availability, pickup points, and arrangements.":"Свяжитесь с церковью, чтобы узнать о доступности транспорта по воскресеньям, местах встречи и договоренностях.","Daily Devotional":"Ежедневное благочестие","Daily message":"Ежедневное сообщение","Email Address":"Адрес электронной почты","Email the church":"Отправьте электронное письмо в церковь","Empowering and equipping men to take their place of leadership in family, career, and church through focused fellowship and growth sessions, including the Online Royal Men’s Summit.":"Расширение прав и возможностей мужчин, чтобы они могли занять место лидера в семье, карьере и церкви посредством целенаправленных сессий общения и роста, включая Королевский мужской саммит онлайн.","Every ministry here opens room for worship, prayer, biblical learning, fellowship, and practical service in our community.":"Каждое служение здесь открывает место для поклонения, молитвы, изучения Библии, общения и практического служения в нашем сообществе.","Explore our ministries":"Изучите наши министерства","FNB":"ФНБ","FNB Zambia":"FNB Zambia","Facebook only shows its posts to people who are signed in to Facebook, so the live feed below stays blank for many visitors. The button above always works.":"Facebook показывает свои публикации только тем людям, которые вошли в систему, поэтому для многих посетителей прямая трансляция ниже остается пустой. Кнопка выше всегда работает.","Faith in word and action":"Вера в словах и действиях","Faith lived together":"Вера жила вместе","Fellowship":"Общение","Fellowship locations":"Места общения","Find a Home Cell":"Найдите домашний сотовый","Find a church community":"Найдите церковную общину","Find a fellowship":"Найти общение","Find the Sunday gathering location and contact the church about transport and fellowship locations.":"Найдите место воскресной встречи и свяжитесь с церковью по вопросам транспорта и мест общения.","Find your place among our ministries.":"Найдите свое место среди наших служений.","First National Bank":"First National Bank","Follow the church for updates, photos and notices":"Следите за обновлениями церкви, фотографиями и уведомлениями.","Follow us":"Следуйте за нами","For help with any of these details, contact the church office.":"За помощью по любым из этих деталей обращайтесь в офис церкви.","Full Name":"Полное имя","Gallery":"Галерея","Gallery & Media":"Галерея и медиа","General Overseer & Founder":"Генеральный наблюдатель и основатель","General Overseer and Founder":"Генеральный наблюдатель и основатель","Give":"Дай","Give directly to any of our Zambian bank accounts. Please use your name as the reference so the church can acknowledge your gift.":"Отправьте деньги напрямую на любой из наших банковских счетов в Замбии. Пожалуйста, используйте свое имя в качестве ссылки, чтобы церковь могла признать ваш дар.","Give via PayPal":"Отправить через PayPal","Giving details":"Подробности","Giving from outside Zambia? Use our only international gateway, PayPal.":"Пожертвования из-за пределов Замбии? Используйте наш единственный международный шлюз PayPal.","God has not forgotten you. His mercies are new every morning.":"Бог не забыл тебя. Его милости обновляются каждое утро.","Grow in faith":"Возрастайте в вере","Grow with us in faith and fellowship":"Растите вместе с нами в вере и общении","Growing in faith":"Возрастание в вере","Hebrews 10:23":"Hebrews 10:23","Home":"Главная","Home Cell & Branch Fellowships":"Домашние группы и общины филиалов","How can Apostle Dr. Mighty Zunga and the RPAI Prayer Team stand in faith with you this week?":"Как Apostle Dr. Mighty Zunga и RPAI Молитвенная команда могут оставаться вместе с вами верой на этой неделе?","How can we connect?":"Как мы можем подключиться?","I am looking for a church home":"Я ищу церковный дом","I want to join a local Cell group":"Я хочу присоединиться к местной группе Cell","I want to receive salvation":"Я хочу получить спасение","I'm New Here / Connect Card":"Я здесь новенький / Подключите карту","In Royal Priesthood, love is more than a kind word; it is the life of Christ made visible in the way we welcome, forgive, serve, and stand beside one another. We are called to carry each other's burdens and to make room for every person to grow in faith.":"В Царственном Священстве любовь – это больше, чем просто доброе слово; это жизнь Христа, которая проявляется в том, как мы приветствуем, прощаем, служим и поддерживаем друг друга. Мы призваны нести бремена друг друга и давать каждому человеку возможность возрастать в вере.","International giving":"Международное пожертвование","I’m New Here / Connect Card":"Я здесь новенький / Подключите карту","John 13:34-35.":"John 13:34-35.","Join Us":"Присоединяйтесь к нам","Join us every Sunday at 09:00 AM CAT at Otwa Events, Long Acres, Lusaka.":"Присоединяйтесь к нам каждое воскресенье в 09:00 AM CAT в Otwa Events, Long Acres, Лусака.","Join us for Sunday Divine Service at 09:00 AM CAT at Otwa Events, Long Acres, along Ndeke Road in Lusaka.":"Присоединяйтесь к нам на воскресное богослужение в 09:00 AM CAT в Otwa Events, Long Acres, на улице Ндеке в Лусаке.","Join us in Lusaka":"Присоединяйтесь к нам в Лусаке","Join us this week":"Присоединяйтесь к нам на этой неделе","Keep Your Faith":"Храните свою веру","Keep faith through every season":"Сохраняйте веру в любое время года","Know more about us":"Узнайте больше о нас","Latest announcements":"Последние объявления","Latest photos":"Последние фотографии","Let us pray for you. Share your needs and we will stand with you in faith and prayer.":"Давайте помолимся за вас. Поделитесь своими потребностями, и мы будем рядом с вами в вере и молитве.","Listen":"Слушай","Listen to music by LoveWorld Singers and Pastor Chris through licensed music services. Use each service's own purchase or download option where available.":"Слушайте музыку LoveWorld Singers и Pastor Chris через лицензионные музыкальные сервисы. Используйте собственный вариант покупки или загрузки каждой службы, если это возможно.","Live Service":"Живой сервис","Loading...":"Загрузка...","Local fellowships":"Местные общины","Local gatherings, including groups meeting in areas such as Chalala, for biblical discussion, mutual support, and neighbourly care.":"Местные собрания, в том числе группы, встречающиеся в таких местах, как Чалала, для обсуждения Библии, взаимной поддержки и заботы о соседях.","Love that forms disciples":"Любовь, формирующая учеников","LoveWorld Singers on Apple Music":"LoveWorld Singers в Apple Music","LoveWorld Singers on Spotify":"Певцы LoveWorld на Spotify","LoveWorld Singers on YouTube Music":"LoveWorld Singers на YouTube Music","Lusaka Main Centre":"Lusaka Main Centre","MTN MOBILE MONEY":"MTN MOBILE MONEY","MTN Mobile Money":"MTN Mobile Money","Meet with us Wednesdays at 05:30 PM CAT for interactive fellowship, virtually and in cell locations.":"Встречайтесь с нами по средам в 17:30 CAT для интерактивного общения — онлайн и в домашних группах.","Men":"Мужчины","Mid-Week Fellowship":"Общение в середине недели","Mid-Week Interactive Fellowship":"Интерактивное общение в середине недели","Ministries":"Министерства","Ministries & Fellowships":"Служения и общины","Mobile Money":"Мобильные деньги","PayPal email":"Эл. почта PayPal","Moments of worship, prayer, fellowship, and ministry from Royal Priesthood Assemblies International.":"Моменты поклонения, молитвы, общения и служения от Royal Priesthood Assemblies International.","Next photos":"Следующие фотографии","Next steps":"Следующие шаги","NextGen Youth & Teen Ministry":"Служение молодежи и подростков NextGen","Open directions in Google Maps":"Открытые маршруты в Google Maps","Open menu":"Открыть меню","Open the church's Facebook page":"Откройте страницу церкви в Facebook.","Otwa Events, Long Acres":"Otwa Events, Long Acres","Otwa Events, Long Acres, along Ndeke Road, Lusaka, Zambia":"Otwa Events, Long Acres, вдоль дороги Ндеке, Лусака, Замбия","Our Founder":"Наш основатель","Our Services":"Наши услуги","Our ministries":"Наши министерства","Our ministries create opportunities for worship, prayer, biblical learning, fellowship, and practical service in the community.":"Наши служения создают возможности для поклонения, молитвы, изучения Библии, общения и практического служения в обществе.","Our mission":"Наша миссия","Our vision":"Наше видение","Pal":"Пал","Partner with us":"Партнер с нами","Pastor Chris on Apple Music":"Пастор Крис в Apple Music","Pastor Chris on Spotify":"Пастор Крис на Spotify","Pastor Chris on YouTube Music":"Пастор Крис на YouTube Music","Pastor Thelma welcome you to Royal Priesthood Assemblies International.":"Pastor Thelma приветствует вас в Royal Priesthood Assemblies International.","Pause slideshow":"Приостановить слайд-шоу","Pay":"Оплата","PayPal":"PayPal","Phone Number":"Номер телефона","Photographs from worship gatherings and ministry moments. Select any photograph to view it larger.":"Фотографии с богослужений и моментов служения. Выберите любую фотографию, чтобы увеличить ее.","Plan Your Visit":"Спланируйте свой визит","Plan your visit":"Спланируйте свой визит","Play slideshow":"Воспроизвести слайд-шоу","Previous photos":"Предыдущие фотографии","Proverbs 3:9":"Proverbs 3:9","ROYAL PRIESTHOOD ASSEMBLIES INTERNATIONAL":"ROYAL PRIESTHOOD ASSEMBLIES INTERNATIONAL","ROYAL Priesthood Assemblies International":"ROYAL Priesthood Assemblies International","RPAI lists local home-cell and branch fellowships, including gatherings in Chalala. Contact the church for current meeting locations, schedules, and details about other branches.":"RPAI перечисляет местные домашние группы и общины филиалов, включая встречи в Чалале. Свяжитесь с церковью, чтобы узнать текущие места и время встреч, а также подробности о других филиалах.","Raising spiritual mothers, career women, and impactful leaders through local sisterhood fellowships and prayer clusters.":"Воспитание духовных матерей, работающих женщин и влиятельных лидеров через местные женские общины и молитвенные группы.","Read the complete daily devotional from the official Rhapsody of Realities reading page.":"Прочтите полный ежедневный молитвенный текст на официальной Rhapsody of Realities странице чтения.","Read today's devotional":"Прочтите сегодняшнее богослужение","Read today's message on the official Rhapsody of Realities site, and spend a few quiet minutes with God before the day begins.":"Прочтите сегодняшнее сообщение на официальном сайте Rhapsody of Realities и проведите несколько минут тишины с Богом перед началом дня.","Recent public posts from the Royal Priesthood Assemblies International Facebook page.":"Последние публичные публикации со страницы Royal Priesthood Assemblies International Facebook.","Recordings":"Записи","Request a Prayer":"Запросить молитву","Rhapsody of Realities":"Rhapsody of Realities","Rooted in faith. United in fellowship.":"Укоренены в вере. Объединены в общении.","Royal Men's Fellowship":"Королевское мужское братство","Royal Men’s Fellowship":"Королевское мужское братство","Royal Priesthood Assemblies International":"Royal Priesthood Assemblies International","Royal Priesthood Assemblies International can add direct audio downloads when it has the tracks and permission to distribute them.":"Royal Priesthood Assemblies International может добавлять прямые загрузки аудио, если у него есть треки и разрешение на их распространение.","Royal Priesthood Assemblies International is a Christian church based in Lusaka, Zambia. Our church life is centred on worship, biblical teaching, prayer, fellowship, and service.":"Royal Priesthood Assemblies International — христианская церковь, расположенная в Лусаке, Замбия. Наша церковная жизнь сосредоточена на поклонении, библейском учении, молитве, общении и служении.","Royal Priesthood Assemblies International is a church family in Lusaka, Zambia. We gather to worship, grow in faith, and serve our community.":"Royal Priesthood Assemblies International — церковная семья из Лусаки, Замбия. Мы собираемся, чтобы поклоняться, возрастать в вере и служить нашему сообществу.","Royal Priesthood Assemblies International. All rights reserved.":"Royal Priesthood Assemblies International. Все права защищены.","Scripture:":"Священное Писание:","Select language":"Выберите язык","Send Connect Card":"Отправить карту подключения","Send Prayer Request":"Отправить молитвенный запрос","Send a prayer request, plan your visit, or ask us anything.":"Отправьте молитвенную просьбу, спланируйте свой визит или спросите нас о чем-нибудь.","Send us your prayer request":"Отправьте нам свою молитвенную просьбу","Serve with care":"Служите с осторожностью","Service video":"Сервисное видео","Share a Prayer Request":"Поделитесь молитвенной просьбой","Show all pictures":"Показать все фотографии","Show slideshow":"Показать слайд-шоу","Songs and downloads":"Песни и загрузки","Songs from the church":"Песни из церкви","Stanbic":"Станбич","Stanbic Bank":"Stanbic Bank","Stanbic Bank Zambia":"Stanbic Bank Zambia","Standard Chartered":"Standard Chartered","Standard Chartered Zambia":"Standard Chartered Zambia","Stream live service":"Трансляция в прямом эфире","Stream live service and find the latest worship and ministry videos from Royal Priesthood Assemblies International.":"Смотрите служения в прямом эфире и находите последние видео поклонения и служения от Royal Priesthood Assemblies International.","Sunday Divine Service":"Воскресное богослужение","Sunday Transport & Branches":"Воскресный транспорт и филиалы","Sunday Worship":"Воскресное Богослужение","Sunday gallery":"Воскресная галерея","Sunday photos":"Воскресные фотографии","Sunday service":"воскресная служба","Sunday service moves to 8am from 1 December.":"Воскресная служба с 1 декабря переносится на 8 утра.","Sunday transport":"Воскресный транспорт","Sunday worship":"воскресное богослужение","The ten newest photographs sent by the church":"Десять новейших фотографий, присланных церковью","To be confirmed":"Подлежит подтверждению","To proclaim the Gospel, encourage spiritual growth through Scripture and prayer, and serve our neighbours with compassion.":"Провозглашать Евангелие, поощрять духовный рост посредством Священного Писания и молитвы и с состраданием служить нашим ближним.","To see people and communities strengthened by the hope of Christ and equipped to live out their faith.":"Видеть, как люди и сообщества укрепляются надеждой на Христа и готовы жить по своей вере.","Today's podcast":"Сегодняшний подкаст","Today's reading":"Сегодняшнее чтение","Updates from Royal Priesthood Assemblies International.":"Обновления от Royal Priesthood Assemblies International.","Video":"Видео","Virtual and cell locations":"Виртуальные и сотовые локации","Virtuous Women’s Ministry":"Добродетельное женское служение","Watch":"Смотреть","Watch a message from the ministry.":"Посмотрите сообщение министерства.","Ways to give":"Способы дать","We aim to serve our neighbours and community with care.":"Мы стремимся бережно служить нашим соседям и обществу.","We gather to honour God and make room for prayer, praise, and gratitude.":"Мы собираемся, чтобы почтить Бога и освободить место для молитвы, хвалы и благодарности.","We gather to honour God through prayer, praise, and gratitude.":"Мы собираемся, чтобы почтить Бога молитвой, хвалой и благодарностью.","We seek to build a life of faith through Scripture, prayer, and encouragement.":"Мы стремимся строить жизнь веры через Священное Писание, молитву и ободрение.","We seek to create a welcoming community where people can learn Scripture, strengthen their faith, and serve others with compassion.":"Мы стремимся создать гостеприимное сообщество, где люди смогут изучать Священное Писание, укреплять свою веру и с состраданием служить другим.","We seek to grow through Scripture, prayer, and encouragement.":"Мы стремимся расти через Священное Писание, молитву и ободрение.","We value welcoming one another, sharing life, and serving our community with care.":"Мы ценим то, что приветствуем друг друга, делимся жизнью и заботливо служим нашему сообществу.","We welcome one another and share life as a church family.":"Мы приветствуем друг друга и разделяем жизнь церковной семьи.","We would be glad to hear from you.":"Мы будем рады услышать ваше мнение.","Wednesdays at 05:30 PM CAT":"По средам в 17:30 CAT","We’re here to stand with you":"Мы здесь, чтобы быть с тобой","What matters to us":"Что важно для нас","Who we are":"Кто мы","Who we are, and why we gather.":"Кто мы и почему собираемся.","Why Us":"Почему мы","Women":"Женщины","World languages":"Мировые языки","Worship":"Поклонение","Worship and church life":"Богослужение и церковная жизнь","Worship audio from Royal Priesthood Assemblies International.":"Аудиозаписи поклонения от Royal Priesthood Assemblies International.","Worship music":"Музыка поклонения","You are welcome here":"Добро пожаловать сюда","You matter to God, you matter to us.":"Вы имеете значение для Бога, вы имеете значение для нас.","Your email app is opening with your message ready. Please review and send it to the church.":"Ваше почтовое приложение откроется с готовым сообщением. Пожалуйста, просмотрите и отправьте его в церковь.","Your giving supports local outreach, building expansion, and the spread of the Gospel across Zambia.":"Ваши пожертвования поддерживают местную евангелизацию, расширение зданий и распространение Евангелия по всей Замбии.","Youth & teens":"Молодежь и подростки","ZAMTEL MOBILE MONEY":"ZAMTEL MOBILE MONEY","Zambia National Commercial Bank":"Zambia National Commercial Bank","Zambian banks":"Замбийские банки","Zambian languages":"Замбийские языки","Zamtel Mobile Money":"Zamtel Mobile Money","Zanaco":"Zanaco","“Honor the Lord with your possessions, and with the firstfruits of all your increase.”":"«Почитай Господа всем, что у тебя есть, и начатками всех произведений твоих».","“Let us hold unswervingly to the hope we profess, for he who promised is faithful.”":"«Давайте непоколебимо будем придерживаться надежды, которую исповедуем, ибо верен Обещавший».","Fellowships":"Общения"},"es":{"(The Pillars)":"(Los pilares)","09:00 AM CAT":"09:00 AM CAT","A Christian church in Lusaka, Zambia, growing together through worship, the Word, and service to our neighbours.":"Una iglesia cristiana en Lusaka, Zambia, que crece juntos a través de la adoración, la Palabra y el servicio a nuestros vecinos.","A church built on prayer and fellowship":"Una iglesia construida sobre la oración y el compañerismo","A community strengthened by hope":"Una comunidad fortalecida por la esperanza","A fresh reading from Rhapsody of Realities each day.":"Una nueva lectura de Rhapsody of Realities cada día.","A people of faith, growing together":"Un pueblo de fe, creciendo juntos","A place of love where everyone counts":"Un lugar de amor donde todos cuentan.","A place of love where everyone counts.":"Un lugar de amor donde todos cuentan.","A place to belong and to grow":"Un lugar al que pertenecer y crecer","A vibrant community where young believers can discover their God-given identity, talents, and career callings.":"Una comunidad vibrante donde los jóvenes creyentes pueden descubrir la identidad, los talentos y los llamados profesionales que Dios les dio.","AIRTEL MOBILE MONEY":"AIRTEL MOBILE MONEY","About":"Acerca de","About us":"Sobre nosotros","Absa":"Absa","Absa Bank":"Absa Bank","Absa Bank Zambia":"Absa Bank Zambia","Account name":"Nombre de cuenta","Account number":"Número de cuenta","Airtel Mobile Money":"Airtel Mobile Money","Along Ndeke Road, Lusaka, Zambia":"A lo largo de Ndeke Road, Lusaka, Zambia","Announcements":"Anuncios","Apostle Dr. Mighty Zunga":"Apostle Dr. Mighty Zunga","Apostle Dr. Mighty Zunga in worship":"Apostle Dr. Mighty Zunga en adoración","Apostle Dr. Mighty Zunga is the Founder and General Overseer of Royal Priesthood Assemblies International in Lusaka, Zambia. His ministry is expressed through preaching, prayer, discipleship, and the leadership of the church community. He encourages believers to grow in their understanding of Scripture and to put their faith into practice through service.":"Apostle Dr. Mighty Zunga es el fundador y supervisor general de Royal Priesthood Assemblies International en Lusaka, Zambia. Su ministerio se expresa a través de la predicación, la oración, el discipulado y el liderazgo de la comunidad eclesial. Anima a los creyentes a crecer en su comprensión de las Escrituras y a poner en práctica su fe a través del servicio.","As a royal priesthood, we worship God with our whole lives. As disciples, we follow Jesus and help others follow Him, sharing His truth with humility and living it with compassion at home, in the church, and throughout our community.":"Como real sacerdocio, adoramos a Dios con toda nuestra vida. Como discípulos, seguimos a Jesús y ayudamos a otros a seguirlo, compartiendo Su verdad con humildad y viviéndola con compasión en el hogar, en la iglesia y en toda nuestra comunidad.","Ask about a fellowship":"Pregunta por una comunidad","Ask about a ride":"Preguntar por un viaje","Ask on WhatsApp":"Pregunta por WhatsApp","Audio":"Audio","Back to slideshow":"Volver a la presentación de diapositivas","Branches & Transport":"Sucursales y Transporte","Call":"llamar","Call +260 767 716 936":"Llama al +260 767 716 936","Centre":"Centro","Choose one":"Elige uno","Choose the next step that feels right for you. Your message will be prepared in your email app for you to review and send.":"Elija el siguiente paso que le parezca adecuado. Su mensaje se preparará en su aplicación de correo electrónico para que lo revise y lo envíe.","Church Services":"Servicios de la Iglesia","Church updates":"Actualizaciones de la iglesia","Close menu":"Cerrar menú","Connect with RPAI":"Conéctate con RPAI","Connect with a local fellowship for biblical discussion and mutual support.":"Conéctese con una comunidad local para conversar sobre la Biblia y apoyarse mutuamente.","Contact":"Contacto","Contact the church":"Contacta con la iglesia","Contact the church to ask about current Sunday transport availability, pickup points, and arrangements.":"Comuníquese con la iglesia para preguntar sobre la disponibilidad actual de transporte dominical, los puntos de recogida y los arreglos.","Daily Devotional":"Devocional diario","Daily message":"Mensaje diario","Email Address":"Dirección de correo electrónico","Email the church":"Envíe un correo electrónico a la iglesia","Empowering and equipping men to take their place of leadership in family, career, and church through focused fellowship and growth sessions, including the Online Royal Men’s Summit.":"Empoderar y equipar a los hombres para que ocupen su lugar de liderazgo en la familia, la carrera y la iglesia a través de sesiones enfocadas en compañerismo y crecimiento, incluida la Cumbre Real de Hombres en línea.","Every ministry here opens room for worship, prayer, biblical learning, fellowship, and practical service in our community.":"Cada ministerio aquí abre espacio para la adoración, la oración, el aprendizaje bíblico, el compañerismo y el servicio práctico en nuestra comunidad.","Explore our ministries":"Explora nuestros ministerios","FNB":"FNB","FNB Zambia":"FNB Zambia","Facebook only shows its posts to people who are signed in to Facebook, so the live feed below stays blank for many visitors. The button above always works.":"Facebook solo muestra sus publicaciones a las personas que han iniciado sesión en Facebook, por lo que la transmisión en vivo a continuación permanece en blanco para muchos visitantes. El botón de arriba siempre funciona.","Faith in word and action":"Fe en palabra y acción","Faith lived together":"La fe vivió juntos","Fellowship":"Comunidad","Fellowship locations":"Ubicaciones de comunidades","Find a Home Cell":"Encuentra una celda en casa","Find a church community":"Encuentre una comunidad eclesial","Find a fellowship":"Encuentra una comunidad","Find the Sunday gathering location and contact the church about transport and fellowship locations.":"Encuentre el lugar de reunión dominical y comuníquese con la iglesia sobre el transporte y las ubicaciones de las comunidades.","Find your place among our ministries.":"Encuentra tu lugar entre nuestros ministerios.","First National Bank":"First National Bank","Follow the church for updates, photos and notices":"Siga la iglesia para actualizaciones, fotos y avisos.","Follow us":"Síguenos","For help with any of these details, contact the church office.":"Para obtener ayuda con cualquiera de estos detalles, comuníquese con la oficina de la iglesia.","Full Name":"Nombre completo","Gallery":"Galería","Gallery & Media":"Galería y medios","General Overseer & Founder":"Supervisor General y Fundador","General Overseer and Founder":"Supervisor General y Fundador","Give":"dar","Give directly to any of our Zambian bank accounts. Please use your name as the reference so the church can acknowledge your gift.":"Done directamente a cualquiera de nuestras cuentas bancarias de Zambia. Utilice su nombre como referencia para que la iglesia pueda reconocer su donación.","Give via PayPal":"Dar a través de PayPal","Giving details":"dando detalles","Giving from outside Zambia? Use our only international gateway, PayPal.":"¿Donar desde fuera de Zambia? Utilice nuestra única puerta de enlace internacional, PayPal.","God has not forgotten you. His mercies are new every morning.":"Dios no te ha olvidado. Sus misericordias son nuevas cada mañana.","Grow in faith":"Crecer en la fe","Grow with us in faith and fellowship":"Crezca con nosotros en fe y comunidad","Growing in faith":"Creciendo en la fe","Hebrews 10:23":"Hebrews 10:23","Home":"Inicio","Home Cell & Branch Fellowships":"Grupos pequeños en hogares y comunidades de sucursales","How can Apostle Dr. Mighty Zunga and the RPAI Prayer Team stand in faith with you this week?":"¿Cómo pueden Apostle Dr. Mighty Zunga y el RPAI Equipo de Oración permanecer en fe contigo esta semana?","How can we connect?":"¿Cómo podemos conectarnos?","I am looking for a church home":"Estoy buscando una iglesia hogar","I want to join a local Cell group":"Quiero unirme a un grupo celular local","I want to receive salvation":"quiero recibir la salvacion","I'm New Here / Connect Card":"Soy nuevo aquí/Conectar tarjeta","In Royal Priesthood, love is more than a kind word; it is the life of Christ made visible in the way we welcome, forgive, serve, and stand beside one another. We are called to carry each other's burdens and to make room for every person to grow in faith.":"En el Sacerdocio Real, el amor es más que una palabra amable; es la vida de Cristo hecha visible en la forma en que acogemos, perdonamos, servimos y estamos uno al lado del otro. Estamos llamados a llevar las cargas de los demás y a dejar espacio para que cada persona crezca en la fe.","International giving":"donaciones internacionales","I’m New Here / Connect Card":"Soy nuevo aquí / Tarjeta Connect","John 13:34-35.":"John 13:34-35.","Join Us":"Únase a nosotros","Join us every Sunday at 09:00 AM CAT at Otwa Events, Long Acres, Lusaka.":"Únase a nosotros todos los domingos a las 09:00 AM CAT en Otwa Events, Long Acres, Lusaka.","Join us for Sunday Divine Service at 09:00 AM CAT at Otwa Events, Long Acres, along Ndeke Road in Lusaka.":"Únase a nosotros para el Servicio Divino dominical a las 09:00 AM CAT en Otwa Events, Long Acres, a lo largo de Ndeke Road en Lusaka.","Join us in Lusaka":"Únase a nosotros en Lusaka","Join us this week":"Únase a nosotros esta semana","Keep Your Faith":"Mantén tu fe","Keep faith through every season":"Mantén la fe en cada temporada.","Know more about us":"Conozca más sobre nosotros","Latest announcements":"Últimos anuncios","Latest photos":"Últimas fotos","Let us pray for you. Share your needs and we will stand with you in faith and prayer.":"Oremos por ti. Comparta sus necesidades y estaremos a su lado en fe y oración.","Listen":"Escuchar","Listen to music by LoveWorld Singers and Pastor Chris through licensed music services. Use each service's own purchase or download option where available.":"Escuche música de LoveWorld Singers y Pastor Chris a través de servicios de música con licencia. Utilice la opción de compra o descarga propia de cada servicio cuando esté disponible.","Live Service":"Servicio en vivo","Loading...":"Cargando...","Local fellowships":"Comunidades locales","Local gatherings, including groups meeting in areas such as Chalala, for biblical discussion, mutual support, and neighbourly care.":"Reuniones locales, incluidos grupos que se reúnen en áreas como Chalala, para discusión bíblica, apoyo mutuo y atención al prójimo.","Love that forms disciples":"Amor que forma discípulos","LoveWorld Singers on Apple Music":"Cantantes de LoveWorld en Apple Music","LoveWorld Singers on Spotify":"Cantantes de LoveWorld en Spotify","LoveWorld Singers on YouTube Music":"LoveWorld Singers en YouTube Music","Lusaka Main Centre":"Lusaka Main Centre","MTN MOBILE MONEY":"MTN MOBILE MONEY","MTN Mobile Money":"MTN Mobile Money","Meet with us Wednesdays at 05:30 PM CAT for interactive fellowship, virtually and in cell locations.":"Reúnase con nosotros los miércoles a las 17:30 CAT para una comunión interactiva, en línea y en grupos pequeños.","Men":"hombres","Mid-Week Fellowship":"Comunión de mitad de semana","Mid-Week Interactive Fellowship":"Comunión interactiva de mitad de semana","Ministries":"Ministerios","Ministries & Fellowships":"Ministerios y comunidades","Mobile Money":"Dinero Móvil","PayPal email":"Correo electrónico de PayPal","Moments of worship, prayer, fellowship, and ministry from Royal Priesthood Assemblies International.":"Momentos de adoración, oración, compañerismo y ministerio desde Royal Priesthood Assemblies International.","Next photos":"Fotos siguientes","Next steps":"Próximos pasos","NextGen Youth & Teen Ministry":"Ministerio de Jóvenes y Adolescentes NextGen","Open directions in Google Maps":"Abrir direcciones en Google Maps","Open menu":"Abrir menú","Open the church's Facebook page":"Abra la página de Facebook de la iglesia.","Otwa Events, Long Acres":"Otwa Events, Long Acres","Otwa Events, Long Acres, along Ndeke Road, Lusaka, Zambia":"Otwa Events, Long Acres, a lo largo de Ndeke Road, Lusaka, Zambia","Our Founder":"Nuestro Fundador","Our Services":"Nuestros Servicios","Our ministries":"Nuestros ministerios","Our ministries create opportunities for worship, prayer, biblical learning, fellowship, and practical service in the community.":"Nuestros ministerios crean oportunidades para la adoración, la oración, el aprendizaje bíblico, el compañerismo y el servicio práctico en la comunidad.","Our mission":"Nuestra misión","Our vision":"Nuestra visión","Pal":"amigo","Partner with us":"Asóciese con nosotros","Pastor Chris on Apple Music":"Pastor Chris en Apple Music","Pastor Chris on Spotify":"Pastor Chris en Spotify","Pastor Chris on YouTube Music":"Pastor Chris en YouTube Music","Pastor Thelma welcome you to Royal Priesthood Assemblies International.":"Pastor Thelma le da la bienvenida a Royal Priesthood Assemblies International.","Pause slideshow":"Pausar presentación de diapositivas","Pay":"pagar","PayPal":"PayPal","Phone Number":"Número de teléfono","Photographs from worship gatherings and ministry moments. Select any photograph to view it larger.":"Fotografías de reuniones de adoración y momentos ministeriales. Selecciona cualquier fotografía para verla más grande.","Plan Your Visit":"Planifica tu visita","Plan your visit":"Planifica tu visita","Play slideshow":"Reproducir presentación de diapositivas","Previous photos":"Fotos anteriores","Proverbs 3:9":"Proverbs 3:9","ROYAL PRIESTHOOD ASSEMBLIES INTERNATIONAL":"ROYAL PRIESTHOOD ASSEMBLIES INTERNATIONAL","ROYAL Priesthood Assemblies International":"ROYAL Priesthood Assemblies International","RPAI lists local home-cell and branch fellowships, including gatherings in Chalala. Contact the church for current meeting locations, schedules, and details about other branches.":"RPAI enumera los grupos pequeños en hogares y las comunidades de sucursales, incluidas las reuniones en Chalala. Comuníquese con la iglesia para conocer los lugares y horarios actuales de las reuniones y los detalles sobre otras sucursales.","Raising spiritual mothers, career women, and impactful leaders through local sisterhood fellowships and prayer clusters.":"Formar madres espirituales, mujeres profesionales y líderes de impacto a través de comunidades locales de hermanas y grupos de oración.","Read the complete daily devotional from the official Rhapsody of Realities reading page.":"Lea el devocional diario completo en la página oficial de lectura.","Read today's devotional":"Lee el devocional de hoy","Read today's message on the official Rhapsody of Realities site, and spend a few quiet minutes with God before the day begins.":"Lee el mensaje de hoy en el sitio oficial Rhapsody of Realities y pasa unos minutos tranquilos con Dios antes de que comience el día.","Recent public posts from the Royal Priesthood Assemblies International Facebook page.":"Publicaciones públicas recientes de la página de Facebook Royal Priesthood Assemblies International.","Recordings":"Grabaciones","Request a Prayer":"Solicitar una oración","Rhapsody of Realities":"Rhapsody of Realities","Rooted in faith. United in fellowship.":"Arraigados en la fe. Unidos en comunidad.","Royal Men's Fellowship":"Comunidad Real de Hombres","Royal Men’s Fellowship":"Comunidad Real de Hombres","Royal Priesthood Assemblies International":"Royal Priesthood Assemblies International","Royal Priesthood Assemblies International can add direct audio downloads when it has the tracks and permission to distribute them.":"Puede agregar descargas directas de audio cuando tenga las pistas y el permiso para distribuirlas.","Royal Priesthood Assemblies International is a Christian church based in Lusaka, Zambia. Our church life is centred on worship, biblical teaching, prayer, fellowship, and service.":"Royal Priesthood Assemblies International es una iglesia cristiana con sede en Lusaka, Zambia. Nuestra vida de iglesia se centra en la adoración, la enseñanza bíblica, la oración, el compañerismo y el servicio.","Royal Priesthood Assemblies International is a church family in Lusaka, Zambia. We gather to worship, grow in faith, and serve our community.":"Royal Priesthood Assemblies International es una familia de la iglesia en Lusaka, Zambia. Nos reunimos para adorar, crecer en la fe y servir a nuestra comunidad.","Royal Priesthood Assemblies International. All rights reserved.":"Royal Priesthood Assemblies International. Reservados todos los derechos.","Scripture:":"Escritura:","Select language":"Seleccionar idioma","Send Connect Card":"Enviar tarjeta de conexión","Send Prayer Request":"Enviar solicitud de oración","Send a prayer request, plan your visit, or ask us anything.":"Envía una petición de oración, planifica tu visita o pregúntanos cualquier cosa.","Send us your prayer request":"Envíanos tu petición de oración","Serve with care":"Servir con cuidado","Service video":"Vídeo de servicio","Share a Prayer Request":"Comparte una petición de oración","Show all pictures":"Mostrar todas las imágenes","Show slideshow":"Mostrar presentación de diapositivas","Songs and downloads":"Canciones y descargas","Songs from the church":"Canciones de la iglesia","Stanbic":"Stanbic","Stanbic Bank":"Stanbic Bank","Stanbic Bank Zambia":"Stanbic Bank Zambia","Standard Chartered":"Standard Chartered","Standard Chartered Zambia":"Standard Chartered Zambia","Stream live service":"Transmitir servicio en vivo","Stream live service and find the latest worship and ministry videos from Royal Priesthood Assemblies International.":"Transmita el servicio en vivo y encuentre los últimos videos de adoración y ministerio de Royal Priesthood Assemblies International.","Sunday Divine Service":"Servicio Divino Dominical","Sunday Transport & Branches":"Transporte Dominical y Sucursales","Sunday Worship":"Adoración dominical","Sunday gallery":"galería del domingo","Sunday photos":"fotos del domingo","Sunday service":"servicio dominical","Sunday service moves to 8am from 1 December.":"El servicio dominical se traslada a las 8 a. m. a partir del 1 de diciembre.","Sunday transport":"Transporte dominical","Sunday worship":"culto dominical","The ten newest photographs sent by the church":"Las diez fotografías más recientes enviadas por la iglesia","To be confirmed":"Por confirmar","To proclaim the Gospel, encourage spiritual growth through Scripture and prayer, and serve our neighbours with compassion.":"Proclamar el Evangelio, fomentar el crecimiento espiritual a través de las Escrituras y la oración, y servir a nuestro prójimo con compasión.","To see people and communities strengthened by the hope of Christ and equipped to live out their faith.":"Ver personas y comunidades fortalecidas por la esperanza de Cristo y equipadas para vivir su fe.","Today's podcast":"El podcast de hoy","Today's reading":"la lectura de hoy","Updates from Royal Priesthood Assemblies International.":"Actualizaciones de Royal Priesthood Assemblies International.","Video":"Vídeo","Virtual and cell locations":"Ubicaciones virtuales y de grupos pequeños","Virtuous Women’s Ministry":"Ministerio de Mujeres Virtuosas","Watch":"ver","Watch a message from the ministry.":"Vea un mensaje del ministerio.","Ways to give":"formas de dar","We aim to serve our neighbours and community with care.":"Nuestro objetivo es servir a nuestros vecinos y a la comunidad con cuidado.","We gather to honour God and make room for prayer, praise, and gratitude.":"Nos reunimos para honrar a Dios y dejar espacio para la oración, la alabanza y la gratitud.","We gather to honour God through prayer, praise, and gratitude.":"Nos reunimos para honrar a Dios mediante la oración, la alabanza y la gratitud.","We seek to build a life of faith through Scripture, prayer, and encouragement.":"Buscamos construir una vida de fe a través de las Escrituras, la oración y el aliento.","We seek to create a welcoming community where people can learn Scripture, strengthen their faith, and serve others with compassion.":"Buscamos crear una comunidad acogedora donde las personas puedan aprender las Escrituras, fortalecer su fe y servir a los demás con compasión.","We seek to grow through Scripture, prayer, and encouragement.":"Buscamos crecer a través de las Escrituras, la oración y el aliento.","We value welcoming one another, sharing life, and serving our community with care.":"Valoramos darnos la bienvenida unos a otros, compartir la vida y servir a nuestra comunidad con cariño.","We welcome one another and share life as a church family.":"Nos damos la bienvenida unos a otros y compartimos la vida como familia de la iglesia.","We would be glad to hear from you.":"Estaremos encantados de saber de usted.","Wednesdays at 05:30 PM CAT":"Miércoles a las 17:30 CAT","We’re here to stand with you":"Estamos aquí para apoyarte","What matters to us":"lo que nos importa","Who we are":"Quienes somos","Who we are, and why we gather.":"Quiénes somos y por qué nos reunimos.","Why Us":"Por qué nosotros","Women":"mujeres","World languages":"Idiomas del mundo","Worship":"adoración","Worship and church life":"Adoración y vida de iglesia","Worship audio from Royal Priesthood Assemblies International.":"Audio de adoración de Royal Priesthood Assemblies International.","Worship music":"música de adoración","You are welcome here":"Eres bienvenido aquí","You matter to God, you matter to us.":"Tú le importas a Dios, tú nos importas a nosotros.","Your email app is opening with your message ready. Please review and send it to the church.":"Su aplicación de correo electrónico se abre con su mensaje listo. Por favor revíselo y envíelo a la iglesia.","Your giving supports local outreach, building expansion, and the spread of the Gospel across Zambia.":"Su donación apoya el alcance local, la expansión de la construcción y la difusión del Evangelio en toda Zambia.","Youth & teens":"Jóvenes y adolescentes","ZAMTEL MOBILE MONEY":"ZAMTEL MOBILE MONEY","Zambia National Commercial Bank":"Zambia National Commercial Bank","Zambian banks":"bancos de Zambia","Zambian languages":"Idiomas de Zambia","Zamtel Mobile Money":"Zamtel Mobile Money","Zanaco":"Zanaco","“Honor the Lord with your possessions, and with the firstfruits of all your increase.”":"“Honra al Señor con tus bienes y con las primicias de todos tus frutos”.","“Let us hold unswervingly to the hope we profess, for he who promised is faithful.”":"“Mantengamos firme la esperanza que profesamos, porque fiel es el que prometió”.","Fellowships":"Comunidades"}};

/* Shalom Embassy phrase maps generated for the custom localization engine. */
window.SHALOM_TEXT = {
  "bem": {
    "Nothing missing.": "Tapali icintu icasheleko.",
    "Nothing broken.": "Tapali icaonaika.",
    "Plan your visit": "Panga ukutandala",
    "Watch a message": "Moneni meseji",
    "Big Sunday": "Pa Mulungu Mukalamba",
    "Night of Solution": "Ubushiku bwa Kupwisha",
    "Prayer Line": "Ulupapulo lwa Mapepo",
    "7 Hours of Nothing Missing, Nothing Broken": "7 Tapali Icintu Icasenaminwe, Tapali Icintu Icasenaminwe",
    "Come as you are. Leave whole.": "Iseni ifyo muli.",
    "A home where the broken become whole.": "Ing'anda umo abapondoka baba abapwililika.",
    "Our story": "Ilyashi lyesu",
    "Meet the pastor": "Moneni shimapepo",
    "Our mandate": "Ubupingushi bwesu",
    "Whole people.": "Abantu bonse.",
    "A revived nation.": "Uluko ulwabuka.",
    "The Word": "Icebo",
    "Worship": "Ukupepa",
    "Prayer": "Ipepo",
    "Wholeness": "Ukupwililika",
    "Messages that anchor the soul.": "Amashiwi ayasunga umweo.",
    "Sermon library": "Ibuuku lya Mbila Nsuma",
    "Watch message": "Moneni meseji",
    "Find your place. Serve with purpose.": "Sangeni icifulo cenu.",
    "Explore ministries": "Moneni ifilonganino",
    "Moments of grace.": "Inshita sha cikuuku.",
    "There is a place for you here.": "Kuli icifulo ico mwingaikala.",
    "Get directions": "Mufwile ukwishiba ifyo mwingacita",
    "Sermons": "Ukushimikila",
    "Gatherings": "Ukulongana",
    "Give": "Ukupeela",
    "Contact": "Ukumfwana",
    "About": "Pa",
    "Home": "Pa Ng'anda",
    "Latest moments": "Inshita sha kulekelesha",
    "Upcoming": "Ifya ku Ntanshi",
    "Service times": "Inshita ya kubomba",
    "When we gather.": "Ilyo tukalongana.",
    "Your questions, answered.": "Ifipusho fyenu fyasukwa.",
    "Send a message": "Tumeni meseji",
    "How can we pray with you?": "Kuti twapepa shani na imwe?",
    "Follow us": "Muletukonka",
    "Watch online": "Tontonkanyeni pa Intaneti",
    "Details": "Ifishinka",
    "All gatherings": "Ukulongana konse",
    "Our mission": "Umulimo wesu",
    "Our vision": "Ifyo tumona ifintu",
    "What we believe": "Ifyo twasumina",
    "Leadership": "Ukutungulula",
    "Ministries": "Amaofeshi",
    "Recent highlights": "Ifyacitika nomba line",
    "Ways to give": "Inshila sha kupeela",
    "Contact & visit": "Ukwishibilapo na Bambi",
    "Join us this Sunday, or reach out and let us pray with you. We would love to meet you.": "Muletwikatana pali Cibelushi, nelyo mulefwaya ukuti tulelomba pamo.",
    "Rooted in peace.": "Balikwata umutende.",
    "A cheerful giver": "Uupeela ne nsansa",
    "Partner with what God is doing.": "Mulebombela pamo na Lesa.",
    ", the LORD is peace. That peace is not a feeling; it is a person, and it changes everything.": "Yehova e mutende. Uyu mutende te kuumfwa; ni muntu, kabili ulenga ifintu fyonse ukwaluka.",
    ", send a message through the form above, or speak with one of our pastors after a gathering.": ", kutuma meseji ukupitila mu fomu ili pa muulu, nelyo ukulanda na umo pa bashimapepo besu pa numa ya kulongana.",
    "07:00 — 14:00 · Main Auditorium": "07:00 — 14:00 · Main Auditorium",
    "12 messages": "Imbila 12",
    "2 Corinthians 9:7": "2 Abena Korinti 9:7",
    "2010s": "Imyaka ya mu 2010",
    "21:00 — 04:00 · Main Auditorium": "21:00 — 04:00 · Main Auditorium",
    "A church built on the Word": "Icalici lyakuulilwe pa Cebo",
    "A day of consecration and seeking God together. Watch the replay and return to the altar with fresh hunger.": "Ubushiku bwa kuipeelesha no kufwaya Lesa pamo.",
    "A few things that will help you feel at home before you arrive.": "Kwaliba ifintu fimo ifingalenga mwaumfwa bwino ilyo mushilafika.",
    "A home for the next generation": "Iŋanda iya ku nkulo ikonkelepo",
    "A house of peace": "Ing'anda ya mutende",
    "A house of prayer for all nations": "Ing'anda ya kupepelamo ku nko shonse",
    "A milestone of grace": "Ulupili lwa cikuuku",
    "A night of prayer, praise, and freedom in Christ. Watch the replay and stand in the liberty Jesus purchased for you.": "Ubushiku bwa kupepa, ukutasha, no buntungwa muli Kristu.",
    "A note on integrity": "Ilembo pa kuba uwa kaele",
    "A place of healing and deliverance": "Icifulo ica kundapilamo no kupusuka",
    "A prayer burden becomes a church": "Umulimo wa kupepa waba icilonganino",
    "A warm welcome": "Twalimupokelela bwino sana",
    "A word for the people": "Icebo ku bantu",
    "All": "Bonse",
    "All messages": "Ifyebo Fyonse",
    "An all-night encounter for answers, direction, and breakthrough. Come with your questions; leave with peace.": "Mufwile ukulatontonkanya pa kwasuka amepusho yenu no kuya mu mutende.",
    "Are children welcome?": "Bushe abana kuti babapokelela?",
    "Aug 24, 2026": "24 Aug, 2026",
    "Aug 27, 2026": "Pa 27 August, 2026",
    "Aug 4, 2026": "4 Aug, 2026",
    "Battle Axe Youth": "Abacaice ba Battle Axe",
    "Become a partner": "Beni cibusa wandi",
    "Better together": "Caliba bwino nga tuli pamo",
    "Browse all messages": "Moneni ifyebo fyonse",
    "Building and maintaining a place where every person can encounter God and belong.": "Ukukuula no kusunga icifulo umo umuntu onse akumana na Lesa no kuba umuntu wakwe.",
    "Built for wholeness.": "Balipangile pa kuti babe abapwililika.",
    "Call the prayer line": "Fwayeni mwi line lya mapepo",
    "Call us daily for prayer and counsel": "Muletwita cila bushiku pa kuti tulemupepa no kufunda",
    "Can I watch online?": "Bushe kuti nabelengamo pa Intaneti?",
    "Chat with the church office": "Mulelanshanya na ba mu maofeshi ya calici",
    "Classic": "Icishibilo ca kale",
    "Choose your way to sow.": "Saleni inshila ya kuseepa.",
    "Come and see": "Iseni mumone",
    "Come as you are. You will find people in everything from smart suits to traditional dress. What matters most is that you are here.": "Mulesanga abantu abafwala ifya kufwala ifya mano ukufika na ku fya kufwala fya kale, icacindama ca kuti mwaba muno.",
    "Come expecting.": "Twalishininkisha.",
    "Come forward for prayer after the message; we will stand with you in faith.": "Muletendeka ukupepa pa numa ya mashiwi; ifwe tukeminina pamo na imwe mu citetekelo.",
    "Consecration": "Ukutuula",
    "Next Sunday service in": "Ukulongana kwa pa Mulungu ukakonkapo mu",
    "Days": "Inshiku",
    "Hours": "Amaola",
    "Secs": "Amaciko",
    "Every Sunday · 07:00 — 14:00": "Cila Mulungu · 07:00 — 14:00",
    "Every Wednesday": "Cila Citatu",
    "Daily": "Cila bushiku",
    "See all gatherings": "Moneni ukulongana konse",
    "Main Auditorium · Behind Livonia Complex, Off Mumbwa Road": "Ing'anda ya Kulandilamo iyabelele ku numa ya Libonia Complex, pa Mumbwa Road",
    "Welcome home": "Tulamupokelela ku ng'anda",
    "Gather with us": "Sangeni pamo na ifwe",
    "Find us": "Tusaneni",
    "Sunday gathering": "Ukulongana kwa pa Mulungu",
    "Talk to us": "Landeni na ifwe",
    "Founder & President": "Uwapangile & President",
    "Spiritual heritage": "Ifyuma fya ku mupashi",
    "Years of ministry": "Imyaka yonse iyo nabombele umulimo wa kushimikila",
    "Messages shared": "Imbila shalekanalekana",
    "Weekly gatherings": "Ukulongana kwa cila mulungu",
    "Welcome to Shalom Embassy Ministries International - a home of healing and deliverance, where every life is restored to wholeness in Christ.": "Tulamupokelela ku Shalom Embassy Ministries International - ing'anda ya kuposha no kupususha, umo ubumi bonse bwabwelela muli Kristu.",
    "This week at Shalom": "Uyu mulungu ku Shalom",
    "Sunday": "Pa Mulungu",
    "Wednesday": "Pali Citatu",
    "Prayer line": "Ulupapulo lwa mapepo",
    "Main Auditorium, Lusaka": "Icikuulwa Cikulu mu Lusaka",
    "Every Sunday": "Pa Mulungu onse",
    "Welcome to Shalom Embassy Ministries International — a home of healing and deliverance, where every life is restored to wholeness in Christ.": "Tulamupokelela ku Shalom Embassy Ministries International — ing'anda ya kuposha no kupususha, umo ubumi bonse bwabwelela ku bupwililika muli Kristu."
  },
  "nya": {
    "Nothing missing.": "Palibe chimene chinasowa.",
    "Nothing broken.": "Palibe chosweka.",
    "Plan your visit": "Konzani ulendo wanu",
    "Watch a message": "Yang'anani uthenga",
    "Big Sunday": "Lamlungu lalikulu",
    "Night of Solution": "Usiku Wothetsa Mavuto",
    "Prayer Line": "Mzere wa Pemphero",
    "7 Hours of Nothing Missing, Nothing Broken": "Maola 7 Osataya Chilichonse, Osasweka Chilichonse",
    "Come as you are. Leave whole.": "Bwerani mmene mulili.",
    "A home where the broken become whole.": "Kunyumba kumene anthu osweka amakhala athanzi.",
    "Our story": "Nkhani yathu",
    "Meet the pastor": "Kumanani ndi m'busa",
    "Our mandate": "Ntchito yathu",
    "Whole people.": "Anthu onse.",
    "A revived nation.": "Mtundu wamoyo.",
    "The Word": "Mawu a Mulungu",
    "Worship": "Kulambira",
    "Prayer": "Pemphero",
    "Wholeness": "Kukwaniritsidwa",
    "Messages that anchor the soul.": "Mauthenga amene amalimbitsa mzimu.",
    "Sermon library": "Laibulale ya ulaliki",
    "Watch message": "Onani uthenga",
    "Find your place. Serve with purpose.": "Pezani malo anu.",
    "Explore ministries": "Fufuzani mautumiki",
    "Moments of grace.": "Nthaŵi ya chisomo.",
    "There is a place for you here.": "Pali malo anu pano.",
    "Get directions": "Pezani malangizo",
    "Sermons": "Ulaliki",
    "Gatherings": "Misonkhano",
    "Give": "Perekani",
    "Contact": "Kuyankhulana",
    "About": "Zokhudza",
    "Home": "Kunyumba",
    "Latest moments": "Nthawi yomaliza",
    "Upcoming": "Zimene Zidzachitike",
    "Service times": "Nthawi ya utumiki",
    "When we gather.": "Tikadzasonkhana.",
    "Your questions, answered.": "Mafunso anu anayankhidwa.",
    "Send a message": "Tumizani uthenga",
    "How can we pray with you?": "Kodi tingapemphere nanu limodzi motani?",
    "Follow us": "Titsateni",
    "Watch online": "Onerani pa Intaneti",
    "Details": "Zambiri",
    "All gatherings": "Misonkhano yonse",
    "Our mission": "Ntchito yathu",
    "Our vision": "Masomphenya athu",
    "What we believe": "Zimene timakhulupirira",
    "Leadership": "Utsogoleri",
    "Ministries": "Utumiki",
    "Recent highlights": "Mfundo Zazikulu za Posachedwapa",
    "Ways to give": "Njira Zoperekera Zinthu",
    "Contact & visit": "Kuyankhulana & Kuchezera",
    "Join us this Sunday, or reach out and let us pray with you. We would love to meet you.": "Bwerani mudzakhale nafe Lamlungu lino, kapena tipemphere nanu.",
    "Rooted in peace.": "Zimakhazikika mwamtendere.",
    "A cheerful giver": "Wopereka mokondwera",
    "Partner with what God is doing.": "Muzichita zinthu mogwirizana ndi zimene Mulungu akuchita.",
    ", the LORD is peace. That peace is not a feeling; it is a person, and it changes everything.": "Mtendere umenewo si maganizo; ndi munthu, ndipo umasintha zonse.",
    ", send a message through the form above, or speak with one of our pastors after a gathering.": ", tumizani uthenga kudzera pa fomu ili pamwambapa, kapena lankhulani ndi mmodzi wa abusa athu pambuyo pa msonkhano.",
    "07:00 — 14:00 · Main Auditorium": "07:00 — 14:00 · Msonkhano waukulu",
    "12 messages": "Mauthenga 12",
    "2 Corinthians 9:7": "2 Akorinto 9:7",
    "2010s": "Zaka za m'ma 2010",
    "21:00 — 04:00 · Main Auditorium": "21:00 — 04:00 · Msonkhano waukulu",
    "A church built on the Word": "Mpingo womangidwa pa Mawu",
    "A day of consecration and seeking God together. Watch the replay and return to the altar with fresh hunger.": "Tsiku la kudzipereka ndi kufunafuna Mulungu pamodzi. Yang'anani kubwereza ndi kubwerera ku guwa lansembe ndi njala yatsopano.",
    "A few things that will help you feel at home before you arrive.": "Pali zinthu zingapo zimene zingakuthandizeni kumva ngati muli panyumba musanafike.",
    "A home for the next generation": "Nyumba ya m'badwo wotsatira",
    "A house of peace": "Nyumba yamtendere",
    "A house of prayer for all nations": "Nyumba yopemphereramo anthu a mitundu yonse",
    "A milestone of grace": "Chimene chinali chofunika kwambiri pa moyo wathu",
    "A night of prayer, praise, and freedom in Christ. Watch the replay and stand in the liberty Jesus purchased for you.": "Usiku wa pemphero, matamando, ndi ufulu mwa Kristu.",
    "A note on integrity": "Mfundo yokhudza kukhulupirika",
    "A place of healing and deliverance": "Malo ochiritsira ndi opulumutsira",
    "A prayer burden becomes a church": "Katundu wa pemphero anakhala tchalitchi",
    "A warm welcome": "Mwalandiridwa bwino kwambiri",
    "A word for the people": "Liwu kwa anthu",
    "All": "Onse",
    "All messages": "Mauthenga onse",
    "An all-night encounter for answers, direction, and breakthrough. Come with your questions; leave with peace.": "Tidzakumana usiku wonse kuti tipeze mayankho, malangizo, ndi kusintha zinthu.",
    "Are children welcome?": "Kodi ana ndi olandiridwa?",
    "Aug 24, 2026": "Tsiku la 24 August, 2026",
    "Aug 27, 2026": "Tsiku la 27 August, 2026",
    "Aug 4, 2026": "August 4, 2026",
    "Battle Axe Youth": "Nkhondo ya Axe Youth",
    "Become a partner": "Khalani mnzanu",
    "Better together": "Ndi bwino kukhala limodzi",
    "Browse all messages": "Sakatulani mauthenga onse",
    "Building and maintaining a place where every person can encounter God and belong.": "Kumanga ndi kusamalira malo amene munthu aliyense angakumane ndi Mulungu ndi kukhala wake.",
    "Built for wholeness.": "Anamangidwa kuti akhale ndi moyo wathunthu.",
    "Call the prayer line": "Funsani mzere wa pemphero",
    "Call us daily for prayer and counsel": "Tiimbireni foni tsiku lililonse kuti mupemphere ndi kulandira uphungu",
    "Can I watch online?": "Kodi ndingayang'ane pa Intaneti?",
    "Chat with the church office": "Kambiranani ndi ofesi ya tchalitchi",
    "Classic": "Zochitika Zakale",
    "Choose your way to sow.": "Sankhani njira yanu yofesa.",
    "Come and see": "Bwerani mukaone",
    "Come as you are. You will find people in everything from smart suits to traditional dress. What matters most is that you are here.": "Bwerani mmene mulili. Mudzapeza anthu m'zinthu zonse kuyambira m'zovala zapamwamba mpaka m'mavalidwe achikhalidwe.",
    "Come expecting.": "Ndinkayembekezera zimenezi.",
    "Come forward for prayer after the message; we will stand with you in faith.": "\"Pitani patsogolo popemphera pambuyo pa uthenga, ndipo tidzaima nanu m'chikhulupiriro\".",
    "Consecration": "Kupatulidwa",
    "Next Sunday service in": "Lamlungu lotsatira utumiki mu",
    "Days": "Masiku",
    "Hours": "Maola",
    "Mins": "Migodi",
    "Secs": "Anthu a m'banja",
    "Every Sunday · 07:00 — 14:00": "Lamlungu lililonse · 07:00 — 14:00",
    "Every Wednesday": "Lachitatu lililonse",
    "Daily": "Tsiku lililonse",
    "See all gatherings": "Onani misonkhano yonse",
    "Main Auditorium · Behind Livonia Complex, Off Mumbwa Road": "Nyumba Yaikulu ya Msonkhano · Kumbuyo kwa nyumba ya Livonia, pa Mumbwa Road",
    "Welcome home": "Mwalandiridwa kunyumba",
    "Gather with us": "Tisonkhaneni pamodzi",
    "Find us": "Tipezeni",
    "Sunday gathering": "Kusonkhana Lamlungu",
    "Talk to us": "Lankhulani nafe",
    "Founder & President": "Woyambitsa & Pulezidenti",
    "Spiritual heritage": "Cholowa chauzimu",
    "Years of ministry": "Zaka za utumiki",
    "Messages shared": "Mauthenga ogulitsidwa",
    "Weekly gatherings": "Misonkhano ya mlungu uliwonse",
    "Welcome to Shalom Embassy Ministries International - a home of healing and deliverance, where every life is restored to wholeness in Christ.": "Takulandirani ku Shalom Embassy Ministries International - nyumba ya machiritso ndi chipulumutso, kumene moyo uliwonse umabwezeretsedwa ku umunthu wonse mwa Kristu.",
    "This week at Shalom": "Mlungu uno ku Shalom",
    "Sunday": "Lamlungu",
    "Wednesday": "Lachitatu",
    "Prayer line": "Mawu a pemphero",
    "Main Auditorium, Lusaka": "Nyumba Yaikulu ya Msonkhano ku Lusaka",
    "Every Sunday": "Lamlungu lililonse",
    "Welcome to Shalom Embassy Ministries International — a home of healing and deliverance, where every life is restored to wholeness in Christ.": "Takulandilani ku Shalom Embassy Ministries International — nyumba ya machiritso ndi chipulumutso, kumene moyo uliwonse umabwezeretsedwa kukhala wathunthu mwa Kristu."
  },
  "tum": {
    "Nothing missing.": "Palije icho chikusoŵerwa.",
    "Nothing broken.": "Pakaŵavya icho chikasweka.",
    "Plan your visit": "Panganani ulendo winu",
    "Watch a message": "Wonani uthenga",
    "Big Sunday": "Zuŵa la Sabata likuru",
    "Night of Solution": "Usiku wa Umoyo",
    "Prayer Line": "Mzere wa Lurombo",
    "7 Hours of Nothing Missing, Nothing Broken": "Maora 7 Ghakumara Cinthu Cinyake Yayi",
    "Come as you are. Leave whole.": "Welerani umo muliri.",
    "A home where the broken become whole.": "Mu nyumba iyo ŵakwananga ŵakuzgoka ŵamoyo.",
    "Our story": "Nkhani yithu",
    "Meet the pastor": "Tikukumana na muliska",
    "Our mandate": "Ulamuliro withu",
    "Whole people.": "Ŵanthu wose.",
    "A revived nation.": "Mtundu uwo ukawuskika.",
    "The Word": "Mazgu",
    "Worship": "Kusopa",
    "Prayer": "Lurombo",
    "Wholeness": "Vinthu Vyose",
    "Messages that anchor the soul.": "Uthenga uwo ukukhozga umoyo.",
    "Sermon library": "Mabuku gha nkhani",
    "Watch message": "Wonani uthenga",
    "Find your place. Serve with purpose.": "Sangani malo ghinu na kuteŵetera mwakwenelera.",
    "Explore ministries": "Wonani mautumiki",
    "Moments of grace.": "Nyengo zinyake nkhakondwanga.",
    "There is a place for you here.": "Pali malo ghinu pano.",
    "Get directions": "Pemphani ulongozgi.",
    "Sermons": "Mapemphero",
    "Gatherings": "Maungano",
    "Give": "Mupelekenge",
    "Contact": "Kuyanjana",
    "About": "Pa nkhani ya",
    "Home": "Kunyumba",
    "Latest moments": "Nyengo yaumaliro",
    "Upcoming": "Vinthu Vyakunthazi",
    "Service times": "Nyengo ya uteŵeti",
    "When we gather.": "Para tawungana.",
    "Your questions, answered.": "Mafumbo ghinu ghazgoreka.",
    "Send a message": "Tumani uthenga",
    "How can we pray with you?": "Kasi tingalomba wuli na imwe?",
    "Follow us": "Londezgani ise.",
    "Watch online": "Wonelerani pa Intaneti",
    "Details": "Vinthu Vinyake",
    "All gatherings": "Maungano ghose",
    "Our mission": "Mulimo withu",
    "Our vision": "Ivyo tikuwona",
    "What we believe": "Ivyo tikugomezga",
    "Leadership": "Ŵalongozgi",
    "Ministries": "Maofesi",
    "Recent highlights": "Ivyo vyachitika sonosono apa",
    "Ways to give": "Umo mungapelekera",
    "Contact & visit": "Kuchezga na kuchezga",
    "Join us this Sunday, or reach out and let us pray with you. We would love to meet you.": "Tiŵe nase pa Sabata iyi, panji tilombenge namwe lumoza.",
    "Rooted in peace.": "Wakakhazikika mu mtende.",
    "A cheerful giver": "Munthu wakupeleka mwakukondwa",
    "Partner with what God is doing.": "Muŵe ŵabwezi ŵa Chiuta.",
    ", the LORD is peace. That peace is not a feeling; it is a person, and it changes everything.": "Mtende uwu ni maghanoghano yayi, kweni munthu, ndipo ukusintha vinthu vyose.",
    ", send a message through the form above, or speak with one of our pastors after a gathering.": ", tumani uthenga kwizira mu fomu iyo yili kumasinda, panji dumbiskanani na yumoza wa ŵaliska ŵithu pamanyuma pa ungano.",
    "07:00 — 14:00 · Main Auditorium": "07:00 — 14:00 · Main Auditorium",
    "12 messages": "Uthenga 12",
    "2 Corinthians 9:7": "2 Ŵakorinte 9:7",
    "2010s": "Vyaka vya 2010",
    "21:00 — 04:00 · Main Auditorium": "21:00 — 04:00 · Main Auditorium",
    "A church built on the Word": "Tchalitchi lakuzengeka pa Mazgu",
    "A day of consecration and seeking God together. Watch the replay and return to the altar with fresh hunger.": "Zuŵa la kujipeleka na kupenja Chiuta pamoza.",
    "A few things that will help you feel at home before you arrive.": "Pali vinthu vichoko waka ivyo vingamovwirani kuti mujipulikenge makora pambere mundafike.",
    "A home for the next generation": "Nyumba ya muwiro wakulondezgapo",
    "A house of peace": "Nyumba ya mtende",
    "A house of prayer for all nations": "Nyumba yakusoperamo mitundu yose",
    "A milestone of grace": "Cinthu cakukondweska comene",
    "A night of prayer, praise, and freedom in Christ. Watch the replay and stand in the liberty Jesus purchased for you.": "Usiku wa lurombo, malumbo, na wanangwa mwa Khristu.",
    "A note on integrity": "Fundo Yakukhwaskana na Kugomezgeka",
    "A place of healing and deliverance": "Malo gha kuchizgika na kuwombokwa",
    "A prayer burden becomes a church": "Mulimo wa kulomba ukuzgoka tchalitchi",
    "A warm welcome": "Ŵakaŵapokelera makora chomene",
    "A word for the people": "Mazgu ghakuyowoya vya ŵanthu",
    "All": "Wose",
    "All messages": "Mauthenga ghose",
    "An all-night encounter for answers, direction, and breakthrough. Come with your questions; leave with peace.": "Mukwenera kwiza na mafumbo ghinu ndipo mufumemo mu mtende.",
    "Are children welcome?": "Kasi ŵana mbakuzomerezgeka?",
    "Aug 24, 2026": "24 Ogasiti, 2026",
    "Aug 27, 2026": "27 Ogasiti 2026",
    "Aug 4, 2026": "4 Ogasiti 2026",
    "Battle Axe Youth": "Ŵawukirano ŵa Nkhondo ya Axe",
    "Become a partner": "Ŵani ŵabwezi",
    "Better together": "Ntchiwemi kuŵa lumoza",
    "Browse all messages": "Wonani mauthenga ghose",
    "Building and maintaining a place where every person can encounter God and belong.": "Kuzenga na kupwelelera malo agho munthu waliyose wangakumana na Ciuta na kuŵa wake.",
    "Built for wholeness.": "Wakapangika kuti waŵe wakufikapo.",
    "Call the prayer line": "Pempherani pa mzere",
    "Call us daily for prayer and counsel": "Zuŵa lililose mutipempherenge na kutipa ulongozgi",
    "Can I watch online?": "Kasi ningawonelera pa Intaneti?",
    "Chat with the church office": "Mungadumbiskana na ofesi ya tchalitchi",
    "Classic": "Classical",
    "Choose your way to sow.": "Sankhani umo mungaseŵera.",
    "Come and see": "Zaninge muwone",
    "Come as you are. You will find people in everything from smart suits to traditional dress. What matters most is that you are here.": "Muzamusanga ŵanthu mu vyakuvwara vyose, kwambira ku vyakuvwara vyachilendo m'paka ku vyakuvwara vyachilendo.",
    "Come expecting.": "Ŵakaŵa na chigomezgo.",
    "Come forward for prayer after the message; we will stand with you in faith.": "Lutilirani kulomba pamanyuma pa uthenga, ndipo tizamwimilira namwe mu chipulikano.",
    "Consecration": "Kupatulira",
    "Next Sunday service in": "Nyengo yakulyeramo pa Sabata yikwiza mu",
    "Days": "Mazuŵa",
    "Hours": "Maora",
    "Mins": "Migodi",
    "Secs": "Ŵapharazgi",
    "Every Sunday · 07:00 — 14:00": "Zuŵa lililose la Sabata · 07:00 — 14:00",
    "Every Wednesday": "Pa Chitatu chilichose",
    "Daily": "Zuŵa lililose",
    "See all gatherings": "Wonani maungano ghose",
    "Main Auditorium · Behind Livonia Complex, Off Mumbwa Road": "Malo Ghakuru Ghakupharazgira · Kuseri kwa Livonia Complex, Pa Mumbwa Road",
    "Welcome home": "Takulandirani kunyumba.",
    "Gather with us": "Wunganani nase.",
    "Find us": "Sangani ise.",
    "Sunday gathering": "Kuwungana pa Sabata",
    "Talk to us": "Yowoyani nase",
    "Founder & President": "Woyambika & Purezidenti",
    "Spiritual heritage": "Chiharo Chauzimu",
    "Years of ministry": "Vyaka vya uteŵeti",
    "Messages shared": "Mauthenga ghakupambanapambana",
    "Weekly gatherings": "Maungano gha sabata yiliyose",
    "Welcome to Shalom Embassy Ministries International - a home of healing and deliverance, where every life is restored to wholeness in Christ.": "Takulandirani ku Shalom Embassy Ministries International - nyumba ya kuchizgika na kuwombokwa, uko umoyo uliwose ukuŵaso wakufikapo mwa Khristu.",
    "This week at Shalom": "Sabata iyi ku Shalom",
    "Sunday": "Zuŵa la Sabata",
    "Wednesday": "Lachitatu",
    "Prayer line": "Mazgu gha malurombo",
    "Main Auditorium, Lusaka": "Nyumba Yikuru, Lusaka",
    "Every Sunday": "Zuŵa lililose la Sabata",
    "Welcome to Shalom Embassy Ministries International — a home of healing and deliverance, where every life is restored to wholeness in Christ.": "Takulandirani ku Shalom Embassy Ministries International — nyumba ya kuchizgika na kuwombokwa, uko umoyo uliwose ukuŵaso wakufikapo mwa Khristu."
  },
  "hi": {
    "Nothing missing.": "कुछ भी गायब नहीं है।",
    "Nothing broken.": "कुछ भी टूटा नहीं है.",
    "Plan your visit": "अपनी यात्रा की योजना बनाएं",
    "Watch a message": "एक संदेश देखें",
    "Big Sunday": "बड़ा रविवार",
    "Night of Solution": "समाधान की रात",
    "Prayer Line": "प्रार्थना पंक्ति",
    "7 Hours of Nothing Missing, Nothing Broken": "7 घंटों में कुछ भी नहीं खोया, कुछ भी नहीं टूटा",
    "Come as you are. Leave whole.": "तुम जैसे हो आओ, पूरी तरह से जाओ।",
    "A home where the broken become whole.": "एक घर जहां टूटे हुए पूरे हो जाते हैं।",
    "Our story": "हमारी कहानी",
    "Meet the pastor": "पादरी से मिलें",
    "Our mandate": "हमारा कार्य",
    "Whole people.": "पूरे लोगों.",
    "A revived nation.": "एक पुनर्जीवित राष्ट्र।",
    "The Word": "वचन",
    "Worship": "उपासना",
    "Prayer": "प्रार्थना",
    "Wholeness": "पूर्णता",
    "Messages that anchor the soul.": "आत्मा को जकड़ने वाले संदेश।",
    "Sermon library": "उपदेश पुस्तकालय",
    "Watch message": "संदेश देखना",
    "Find your place. Serve with purpose.": "अपने स्थान को खोजें, उद्देश्य के साथ सेवा करें।",
    "Explore ministries": "मंत्रालयों का पता लगाएं",
    "Moments of grace.": "अनुग्रह के क्षण।",
    "There is a place for you here.": "यहाँ तुम्हारे लिए एक जगह है।",
    "Get directions": "निर्देश प्राप्त करें",
    "Sermons": "उपदेश",
    "Gatherings": "सभाएं",
    "Give": "देना",
    "Contact": "संपर्क",
    "About": "के बारे में",
    "Home": "घर",
    "Latest moments": "अंतिम क्षण",
    "Upcoming": "आगामी",
    "Service times": "सेवा का समय",
    "When we gather.": "जब हम इकट्ठा होते हैं.",
    "Your questions, answered.": "आपके सवालों के जवाब.",
    "Send a message": "संदेश भेजें",
    "How can we pray with you?": "हम आपके साथ कैसे प्रार्थना कर सकते हैं?",
    "Follow us": "हमारे पीछे आओ",
    "Watch online": "ऑनलाइन देखें",
    "Details": "विवरण",
    "All gatherings": "सभी सभाएं",
    "Our mission": "हमारा मिशन",
    "Our vision": "हमारी दृष्टि",
    "What we believe": "हम क्या मानते हैं",
    "Leadership": "नेतृत्व",
    "Ministries": "मंत्रालय",
    "Recent highlights": "हालिया हाइलाइट",
    "Ways to give": "दान करने के तरीके",
    "Contact & visit": "संपर्क और यात्रा",
    "Join us this Sunday, or reach out and let us pray with you. We would love to meet you.": "इस रविवार हमारे साथ जुड़ें, या हाथ बढ़ाएँ और हम आपके साथ प्रार्थना करें। हम आपसे मिलना पसंद करेंगे।",
    "Rooted in peace.": "शांति में जड़ें।",
    "A cheerful giver": "एक खुशहाल दाता",
    "Partner with what God is doing.": "जो कुछ अल्लाह कर रहा है, उसके साथ भागीदार हो।",
    ", the LORD is peace. That peace is not a feeling; it is a person, and it changes everything.": "यह शांति भावना नहीं है, यह एक व्यक्ति है, और यह सब कुछ बदलता है।",
    ", send a message through the form above, or speak with one of our pastors after a gathering.": ", उपरोक्त फॉर्म के माध्यम से एक संदेश भेजें, या एक सभा के बाद हमारे पादरी में से एक से बात करें।",
    "07:00 — 14:00 · Main Auditorium": "07:00 — 14:00 · मुख्य सभागार",
    "12 messages": "12 संदेश",
    "2 Corinthians 9:7": "2 कुरिन्थियों 9:7",
    "2010s": "2010 के दशक",
    "21:00 — 04:00 · Main Auditorium": "21:00 — 04:00 · मुख्य सभागार",
    "A church built on the Word": "वचन पर निर्मित एक चर्च",
    "A day of consecration and seeking God together. Watch the replay and return to the altar with fresh hunger.": "एक समर्पण का दिन और एक साथ भगवान की तलाश. पुनरावृत्ति देखें और नए भूख के साथ वेदी पर लौटें.",
    "A few things that will help you feel at home before you arrive.": "कुछ चीजें जो आपको आने से पहले घर पर महसूस करने में मदद करेंगी।",
    "A home for the next generation": "अगली पीढ़ी के लिए एक घर",
    "A house of peace": "शांति का घर",
    "A house of prayer for all nations": "सभी जातियों के लिए प्रार्थना का घर",
    "A milestone of grace": "अनुग्रह का एक मील का पत्थर",
    "A night of prayer, praise, and freedom in Christ. Watch the replay and stand in the liberty Jesus purchased for you.": "एक रात प्रार्थना, स्तुति, और मसीह में स्वतंत्रता की। पुनरावृत्ति को देखो और यीशु ने आपके लिए खरीदी हुई स्वतंत्रता में खड़े हो जाओ।",
    "A note on integrity": "अखंडता पर एक नोट",
    "A place of healing and deliverance": "उपचार और मुक्ति का स्थान",
    "A prayer burden becomes a church": "प्रार्थना का बोझ एक चर्च बन जाता है",
    "A warm welcome": "हार्दिक स्वागत",
    "A word for the people": "लोगों के लिए एक शब्द",
    "All": "सभी",
    "All messages": "सभी संदेश",
    "An all-night encounter for answers, direction, and breakthrough. Come with your questions; leave with peace.": "उत्तर, दिशा और सफलता के लिए एक पूरी रात का मुलाकात। अपने प्रश्नों के साथ आओ; शांति से चले जाओ।",
    "Are children welcome?": "क्या बच्चों का स्वागत है?",
    "Aug 24, 2026": "24 अगस्त 2026",
    "Aug 27, 2026": "27 अगस्त 2026",
    "Aug 4, 2026": "4 अगस्त 2026",
    "Battle Axe Youth": "युद्ध कुल्हाड़ी युवा",
    "Become a partner": "भागीदार बनें",
    "Better together": "एक साथ बेहतर",
    "Browse all messages": "सभी संदेश ब्राउज़ करें",
    "Building and maintaining a place where every person can encounter God and belong.": "एक ऐसी जगह का निर्माण और रखरखाव जहां हर व्यक्ति ईश्वर से मिल सके और उसका हिस्सा बन सके।",
    "Built for wholeness.": "पूर्णता के लिए बनाया गया।",
    "Call the prayer line": "प्रार्थना लाइन पर कॉल करें",
    "Call us daily for prayer and counsel": "प्रार्थना और सलाह के लिए हमें रोज बुलाओ",
    "Can I watch online?": "क्या मैं ऑनलाइन देख सकता हूँ?",
    "Chat with the church office": "चर्च कार्यालय के साथ चैट करें",
    "Classic": "क्लासिक",
    "Choose your way to sow.": "अपने बीज बोने का तरीका चुनें।",
    "Come and see": "आओ और देखो",
    "Come as you are. You will find people in everything from smart suits to traditional dress. What matters most is that you are here.": "जैसे आप हैं, वैसे ही आएं. आपको स्मार्ट सूट से लेकर पारंपरिक पोशाक तक हर चीज में लोग मिलेंगे। सबसे महत्वपूर्ण बात यह है कि आप यहां हैं।",
    "Come expecting.": "आशा करते हुए आते हैं।",
    "Come forward for prayer after the message; we will stand with you in faith.": "और (ऐ रसूल) तुम पैग़म्बर के बाद नमाज़ के लिए आगे बढ़ो हम ईमान के साथ तुम्हारे साथ खड़े होंगे",
    "Consecration": "समर्पण",
    "Next Sunday service in": "अगले रविवार सेवा में",
    "Days": "दिन",
    "Hours": "घंटे",
    "Mins": "खदान",
    "Secs": "सेक",
    "Every Sunday · 07:00 — 14:00": "हर रविवार · 07:00 — 14:00",
    "Every Wednesday": "हर बुधवार",
    "Daily": "दैनिक",
    "See all gatherings": "सभी सभाओं को देखें",
    "Main Auditorium · Behind Livonia Complex, Off Mumbwa Road": "मुख्य सभागार · लिवोनिया परिसर के पीछे, मुम्बा रोड के बाहर",
    "Welcome home": "घर में आपका स्वागत है",
    "Gather with us": "हमारे साथ इकट्ठा",
    "Find us": "हमें खोजें",
    "Sunday gathering": "रविवार की सभा",
    "Talk to us": "हमसे बात करो",
    "Founder & President": "संस्थापक और अध्यक्ष",
    "Spiritual heritage": "आध्यात्मिक विरासत",
    "Years of ministry": "सेवा के वर्ष",
    "Messages shared": "साझा किए गए संदेश",
    "Weekly gatherings": "साप्ताहिक सभाएं",
    "Welcome to Shalom Embassy Ministries International - a home of healing and deliverance, where every life is restored to wholeness in Christ.": "शलोम दूतावास मंत्रालय इंटरनेशनल में आपका स्वागत है - उपचार और मुक्ति का घर, जहां हर जीवन को मसीह में पूर्णता में बहाल किया जाता है।",
    "This week at Shalom": "इस सप्ताह शलोम में",
    "Sunday": "रविवार",
    "Wednesday": "बुधवार",
    "Prayer line": "प्रार्थना पंक्ति",
    "Main Auditorium, Lusaka": "मुख्य सभागार, लुसाका",
    "Every Sunday": "हर रविवार",
    "Welcome to Shalom Embassy Ministries International — a home of healing and deliverance, where every life is restored to wholeness in Christ.": "शलोम दूतावास मंत्रालयों अंतर्राष्ट्रीय में आपका स्वागत है उपचार और मुक्ति का घर, जहां हर जीवन को मसीह में पूर्णता में बहाल किया जाता है।"
  },
  "fr": {
    "Nothing missing.": "Rien ne manque.",
    "Nothing broken.": "Rien n'a été cassé.",
    "Plan your visit": "Planifiez votre visite",
    "Watch a message": "Regardez un message.",
    "Big Sunday": "Le grand dimanche",
    "Night of Solution": "La nuit de la solution",
    "Prayer Line": "La ligne de prière",
    "7 Hours of Nothing Missing, Nothing Broken": "7 Heures où rien ne manque, rien ne se brise",
    "Come as you are. Leave whole.": "Venez comme vous êtes.",
    "A home where the broken become whole.": "Une maison où les brisés deviennent entiers.",
    "Our story": "Notre histoire",
    "Meet the pastor": "Rencontrez le pasteur.",
    "Our mandate": "Notre mandat",
    "Whole people.": "Des gens entiers.",
    "A revived nation.": "Une nation renouvelée.",
    "The Word": "La Parole",
    "Worship": "Le culte",
    "Prayer": "La prière",
    "Wholeness": "L'intégralité",
    "Messages that anchor the soul.": "Des messages qui ancrent l'âme.",
    "Sermon library": "Bibliothèque des sermons",
    "Watch message": "Voir le message",
    "Find your place. Serve with purpose.": "Trouvez votre place, servez avec un but.",
    "Explore ministries": "Découvrez les ministères",
    "Moments of grace.": "Des moments de grâce.",
    "There is a place for you here.": "Il y a une place pour vous ici.",
    "Get directions": "Obtenez des directions.",
    "Sermons": "Les sermons",
    "Gatherings": "Rassemblements",
    "Give": "Donner",
    "Contact": "Contacts",
    "About": "À propos de",
    "Home": "À la maison",
    "Latest moments": "Les derniers moments",
    "Upcoming": "Le prochain",
    "Service times": "Temps de service",
    "When we gather.": "Quand nous serons rassemblés.",
    "Your questions, answered.": "Vos questions ont été répondues.",
    "Send a message": "Envoyez un message",
    "How can we pray with you?": "Comment prier avec toi?",
    "Follow us": "Suivez-nous!",
    "Watch online": "Regardez en ligne",
    "Details": "Détails",
    "All gatherings": "Toutes les réunions",
    "Our mission": "Notre mission",
    "Our vision": "Notre vision",
    "What we believe": "Ce que nous croyons",
    "Leadership": "Le leadership",
    "Ministries": "Ministères",
    "Recent highlights": "Résultats récents",
    "Ways to give": "Les façons de donner",
    "Contact & visit": "Contact et visite",
    "Join us this Sunday, or reach out and let us pray with you. We would love to meet you.": "Rejoignez-nous ce dimanche ou nous prierons avec vous.",
    "Rooted in peace.": "Enraciné dans la paix.",
    "A cheerful giver": "Un donneur joyeux",
    "Partner with what God is doing.": "Partage avec ce que Dieu fait.",
    ", the LORD is peace. That peace is not a feeling; it is a person, and it changes everything.": "Cette paix n'est pas un sentiment, c'est une personne, et elle change tout.",
    ", send a message through the form above, or speak with one of our pastors after a gathering.": "Envoyez un message via le formulaire ci-dessus, ou parlez à un de nos pasteurs après un rassemblement.",
    "07:00 — 14:00 · Main Auditorium": "07:00 — 14:00 · Auditorium principal",
    "2 Corinthians 9:7": "2 Corinthiens 9:7",
    "2010s": "Les années 2010",
    "21:00 — 04:00 · Main Auditorium": "21:00 — 04:00 · Auditorium principal",
    "A church built on the Word": "Une église bâtie sur la Parole",
    "A day of consecration and seeking God together. Watch the replay and return to the altar with fresh hunger.": "Un jour de consécration et de recherche de Dieu ensemble.",
    "A few things that will help you feel at home before you arrive.": "Quelques choses qui vous aideront à vous sentir à l'aise avant d'arriver.",
    "A home for the next generation": "Une maison pour la prochaine génération",
    "A house of peace": "Une maison de paix",
    "A house of prayer for all nations": "Une maison de prière pour toutes les nations",
    "A milestone of grace": "Une étape de grâce.",
    "A night of prayer, praise, and freedom in Christ. Watch the replay and stand in the liberty Jesus purchased for you.": "Une nuit de prière, de louange et de liberté en Christ.",
    "A note on integrity": "Une note sur l'intégrité",
    "A place of healing and deliverance": "Un lieu de guérison et de délivrance",
    "A prayer burden becomes a church": "Un fardeau de prière devient une église",
    "A warm welcome": "Un accueil chaleureux",
    "A word for the people": "Un mot pour le peuple",
    "All": "Tout le monde",
    "All messages": "Tous les messages",
    "An all-night encounter for answers, direction, and breakthrough. Come with your questions; leave with peace.": "Une rencontre de toute la nuit pour trouver des réponses, des conseils et des avancées.",
    "Are children welcome?": "Les enfants sont-ils les bienvenus?",
    "Aug 24, 2026": "24 août 2026",
    "Aug 27, 2026": "Le 27 août 2026",
    "Aug 4, 2026": "Le 4 août 2026",
    "Battle Axe Youth": "Jeunesse à la bataille",
    "Become a partner": "Devenez un partenaire",
    "Better together": "C'est mieux ensemble.",
    "Browse all messages": "Parcourir tous les messages",
    "Building and maintaining a place where every person can encounter God and belong.": "Construire et entretenir un lieu où chaque personne peut rencontrer Dieu et appartenir.",
    "Built for wholeness.": "Construit pour l'intégrité.",
    "Call the prayer line": "Appelez la ligne de prière",
    "Call us daily for prayer and counsel": "Appelez-nous chaque jour pour la prière et les conseils.",
    "Can I watch online?": "Je peux regarder en ligne?",
    "Chat with the church office": "Discutez avec le bureau de l'église.",
    "Classic": "Classique",
    "Choose your way to sow.": "Choisissez votre façon de semer.",
    "Come and see": "Venez voir.",
    "Come as you are. You will find people in everything from smart suits to traditional dress. What matters most is that you are here.": "Vous trouverez des gens dans tout, des costumes intelligents aux robes traditionnelles.",
    "Come expecting.": "Je t'attends.",
    "Come forward for prayer after the message; we will stand with you in faith.": "Approchez pour la prière après la parole, nous serons avec vous dans la foi.",
    "Consecration": "La consécration",
    "Next Sunday service in": "Le dimanche prochain,",
    "Days": "Les jours",
    "Hours": "Les heures",
    "Mins": "Les mines",
    "Every Sunday · 07:00 — 14:00": "Tous les dimanches · 07:00 — 14:00",
    "Every Wednesday": "Chaque mercredi",
    "Daily": "Chaque jour",
    "See all gatherings": "Voir tous les rassemblements",
    "Main Auditorium · Behind Livonia Complex, Off Mumbwa Road": "Auditorium principal · Derrière le complexe Livonia, sur la route Mumbwa",
    "Welcome home": "Bienvenue à la maison.",
    "Gather with us": "Rassemblez-vous avec nous",
    "Find us": "Trouvez-nous",
    "Sunday gathering": "Rassemblement de dimanche",
    "Talk to us": "Parlez-nous.",
    "Founder & President": "Fondateur et président",
    "Spiritual heritage": "Un héritage spirituel",
    "Years of ministry": "Des années de ministère",
    "Messages shared": "Messages partagés",
    "Weekly gatherings": "Rassemblements hebdomadaires",
    "Welcome to Shalom Embassy Ministries International - a home of healing and deliverance, where every life is restored to wholeness in Christ.": "Bienvenue à l'ambassade de Shalom Ministries International - un foyer de guérison et de délivrance, où chaque vie est restaurée à la plénitude en Christ.",
    "This week at Shalom": "Cette semaine à Shalom",
    "Sunday": "Dimanche",
    "Wednesday": "Mercredi",
    "Prayer line": "La ligne de prière",
    "Main Auditorium, Lusaka": "L'auditorium principal de Lusaka",
    "Every Sunday": "Chaque dimanche",
    "Welcome to Shalom Embassy Ministries International — a home of healing and deliverance, where every life is restored to wholeness in Christ.": "Bienvenue à l'ambassade de Shalom Ministries International, un foyer de guérison et de délivrance, où chaque vie est restaurée à la plénitude en Christ."
  },
  "de": {
    "Nothing missing.": "Nichts fehlt.",
    "Nothing broken.": "Nichts ist kaputt.",
    "Plan your visit": "Planen Sie Ihren Besuch",
    "Watch a message": "Sieh dir eine Nachricht an.",
    "Big Sunday": "Der große Sonntag",
    "Night of Solution": "Die Nacht der Lösung",
    "Prayer Line": "Gebetszeichen",
    "7 Hours of Nothing Missing, Nothing Broken": "7 Stunden, in denen nichts fehlt und nichts gebrochen wird",
    "Come as you are. Leave whole.": "Kommen Sie, wie Sie sind.",
    "A home where the broken become whole.": "Ein Zuhause, in dem die gebrochenen ganz werden.",
    "Our story": "Unsere Geschichte",
    "Meet the pastor": "Treffen Sie den Pfarrer.",
    "Our mandate": "Unser Mandat",
    "Whole people.": "Ein ganzes Volk.",
    "A revived nation.": "Eine wiederbelebte Nation.",
    "The Word": "Das Wort",
    "Worship": "Anbetung",
    "Prayer": "Gebet",
    "Wholeness": "Vollständigkeit",
    "Messages that anchor the soul.": "Botschaften, die die Seele verankern.",
    "Sermon library": "Predigtbibliothek",
    "Watch message": "Beobachtungsnachricht",
    "Find your place. Serve with purpose.": "Finden Sie Ihren Platz und dienen Sie mit einem Zweck.",
    "Explore ministries": "Entdecken Sie die Ministerien",
    "Moments of grace.": "Momente der Gnade.",
    "There is a place for you here.": "Hier ist ein Platz für dich.",
    "Get directions": "Hol dir die Anweisungen.",
    "Sermons": "Predigten",
    "Gatherings": "Versammlungen",
    "Give": "Geben Sie",
    "Contact": "Kontaktaufnahme",
    "About": "Über",
    "Home": "Zuhause",
    "Latest moments": "Die letzten Momente.",
    "Upcoming": "Vorstehende",
    "Service times": "Dienstzeiten",
    "When we gather.": "Wenn wir uns versammeln.",
    "Your questions, answered.": "Ihre Fragen sind beantwortet.",
    "Send a message": "Senden Sie eine Nachricht",
    "How can we pray with you?": "Wie können wir mit dir beten?",
    "Follow us": "Folgen Sie uns.",
    "Watch online": "Schauen Sie online.",
    "Details": "Einzelheiten",
    "All gatherings": "Alle Versammlungen",
    "Our mission": "Unsere Mission",
    "Our vision": "Unsere Vision",
    "What we believe": "Was wir glauben",
    "Leadership": "Führung",
    "Ministries": "Ministerien",
    "Recent highlights": "Aktuelle Highlights",
    "Ways to give": "Möglichkeiten zu geben",
    "Contact & visit": "Kontakt und Besuch",
    "Join us this Sunday, or reach out and let us pray with you. We would love to meet you.": "Kommen Sie uns an diesem Sonntag an, oder wir beten mit Ihnen.",
    "Rooted in peace.": "In Frieden verwurzelt.",
    "A cheerful giver": "Ein fröhlicher Geber",
    "Partner with what God is doing.": "Partner mit dem, was Gott tut.",
    ", the LORD is peace. That peace is not a feeling; it is a person, and it changes everything.": "Der Friede ist nicht ein Gefühl, sondern ein Mensch, der alles verändert.",
    ", send a message through the form above, or speak with one of our pastors after a gathering.": ", eine Nachricht über das Formular oben, oder sprechen Sie mit einem unserer Pastoren nach einer Versammlung.",
    "07:00 — 14:00 · Main Auditorium": "07:00 — 14:00 · Hauptauditorium",
    "12 messages": "12 Nachrichten",
    "2 Corinthians 9:7": "2. Korinther 9:7",
    "2010s": "2010er Jahre",
    "21:00 — 04:00 · Main Auditorium": "21:00 — 04:00 · Hauptauditorium",
    "A church built on the Word": "Eine Kirche, die auf dem Wort gebaut wurde",
    "A day of consecration and seeking God together. Watch the replay and return to the altar with fresh hunger.": "Ein Tag der Weihe und der Suche nach Gott zusammen.",
    "A few things that will help you feel at home before you arrive.": "Ein paar Dinge, die dir helfen, dich zu Hause zu fühlen, bevor du ankommst.",
    "A home for the next generation": "Ein Zuhause für die nächste Generation",
    "A house of peace": "Ein Haus des Friedens",
    "A house of prayer for all nations": "Ein Gebetshaus für alle Völker",
    "A milestone of grace": "Ein Meilenstein der Gnade",
    "A night of prayer, praise, and freedom in Christ. Watch the replay and stand in the liberty Jesus purchased for you.": "Eine Nacht des Gebets, des Lobes und der Freiheit in Christus.",
    "A note on integrity": "Ein Hinweis auf Integrität",
    "A place of healing and deliverance": "Ein Ort der Heilung und Befreiung",
    "A prayer burden becomes a church": "Eine Gebetslast wird zu einer Kirche.",
    "A warm welcome": "Ein herzliches Willkommen.",
    "A word for the people": "Ein Wort für das Volk",
    "All": "Alle.",
    "All messages": "Alle Nachrichten",
    "An all-night encounter for answers, direction, and breakthrough. Come with your questions; leave with peace.": "Ein ganztägiges Treffen für Antworten, Richtung und Durchbruch.",
    "Are children welcome?": "Sind Kinder willkommen?",
    "Aug 24, 2026": "24. August 2026",
    "Aug 27, 2026": "27. August 2026",
    "Aug 4, 2026": "4. August 2026",
    "Battle Axe Youth": "Kampf Axe Jugend",
    "Become a partner": "Werden Sie Partner",
    "Better together": "Besser zusammen.",
    "Browse all messages": "Durchsuchen Sie alle Nachrichten",
    "Building and maintaining a place where every person can encounter God and belong.": "Ein Ort zu bauen und zu pflegen, an dem jeder Gott begegnen und zu ihm gehören kann.",
    "Built for wholeness.": "Für die Ganzheit gebaut.",
    "Call the prayer line": "Ruf die Gebetslinie an.",
    "Call us daily for prayer and counsel": "Rufen Sie uns täglich um Gebet und Rat.",
    "Can I watch online?": "Darf ich das online sehen?",
    "Chat with the church office": "Sprich mit dem Kirchenbüro",
    "Classic": "Klassiker",
    "Choose your way to sow.": "Wählen Sie, wie Sie säen.",
    "Come and see": "Kommen Sie und sehen Sie",
    "Come as you are. You will find people in everything from smart suits to traditional dress. What matters most is that you are here.": "Du findest Leute in allem, von schlauen Anzügen bis hin zu traditionellen Kleidern, was am wichtigsten ist, dass du hier bist.",
    "Come expecting.": "Ich habe erwartet.",
    "Come forward for prayer after the message; we will stand with you in faith.": "Kommt zum Gebet nach der Botschaft vor. Wir werden mit euch im Glauben stehen.",
    "Consecration": "Weihung",
    "Next Sunday service in": "Nächste Sonntagsdienst in",
    "Days": "Tage",
    "Hours": "Stunden",
    "Mins": "Minen",
    "Secs": "Sekse",
    "Every Sunday · 07:00 — 14:00": "Jeden Sonntag · 07:00 — 14:00",
    "Every Wednesday": "Jeden Mittwoch",
    "Daily": "Täglich",
    "See all gatherings": "Sehen Sie alle Versammlungen",
    "Main Auditorium · Behind Livonia Complex, Off Mumbwa Road": "Hauptauditorium · Hinter dem Livonia-Komplex, Off Mumbwa Road",
    "Welcome home": "Willkommen zu Hause.",
    "Gather with us": "Versammelt euch mit uns.",
    "Find us": "Finden Sie uns.",
    "Sunday gathering": "Sonntagsversammlung",
    "Talk to us": "Reden Sie mit uns.",
    "Founder & President": "Gründer und Präsident",
    "Spiritual heritage": "Geistiges Erbe",
    "Years of ministry": "Jahre im Dienst",
    "Messages shared": "Geteilte Nachrichten",
    "Weekly gatherings": "Wöchentliche Zusammenkünfte",
    "Welcome to Shalom Embassy Ministries International - a home of healing and deliverance, where every life is restored to wholeness in Christ.": "Willkommen bei der Shalom Embassy Ministries International - ein Zuhause der Heilung und Befreiung, wo jedes Leben in Christus zur Vollkommenheit wiederhergestellt wird.",
    "This week at Shalom": "Diese Woche in Shalom",
    "Sunday": "Sonntag",
    "Wednesday": "Mittwoch",
    "Prayer line": "Gebetszeichen",
    "Main Auditorium, Lusaka": "Hauptsaal, Lusaka",
    "Every Sunday": "Jeden Sonntag",
    "Welcome to Shalom Embassy Ministries International — a home of healing and deliverance, where every life is restored to wholeness in Christ.": "Willkommen bei Shalom Embassy Ministries International, einem Zuhause der Heilung und Befreiung, wo jedes Leben in Christus zur Vollkommenheit wiederhergestellt wird."
  },
  "it": {
    "Nothing missing.": "Non manca niente.",
    "Nothing broken.": "Niente rotto.",
    "Plan your visit": "Pianifica la tua visita",
    "Watch a message": "Guarda un messaggio.",
    "Big Sunday": "La grande domenica",
    "Night of Solution": "La Notte della Soluzione",
    "Prayer Line": "Linea di preghiera",
    "7 Hours of Nothing Missing, Nothing Broken": "7 ore di niente mancante, niente rotto",
    "Come as you are. Leave whole.": "Venite come siete, lasciate tutto.",
    "A home where the broken become whole.": "Una casa dove i fratturati diventano sani.",
    "Our story": "La nostra storia",
    "Meet the pastor": "Incontri il pastore.",
    "Our mandate": "Il nostro mandato",
    "Whole people.": "Intere persone.",
    "A revived nation.": "Una nazione rinascita.",
    "The Word": "La Parola",
    "Worship": "Il culto",
    "Prayer": "Preghiera",
    "Wholeness": "Completità",
    "Messages that anchor the soul.": "Messaggi che ancorano l'anima.",
    "Sermon library": "Biblioteca dei sermoni",
    "Watch message": "Guarda il messaggio",
    "Find your place. Serve with purpose.": "Trova il tuo posto, serve con scopo.",
    "Explore ministries": "Esplora i ministeri",
    "Moments of grace.": "Momenti di grazia.",
    "There is a place for you here.": "C'è un posto per te qui.",
    "Get directions": "Prendi le indicazioni",
    "Sermons": "Sermoni",
    "Gatherings": "Riunioni",
    "Give": "Dare",
    "Contact": "Contatto",
    "About": "A proposito di",
    "Home": "A casa",
    "Latest moments": "Ultimi momenti",
    "Upcoming": "Il prossimo",
    "Service times": "Orari di servizio",
    "When we gather.": "Quando ci riuniremo.",
    "Your questions, answered.": "Le tue domande, risposte.",
    "Send a message": "Invia un messaggio",
    "How can we pray with you?": "Come possiamo pregare con te?",
    "Follow us": "Seguiteci.",
    "Watch online": "Guarda online",
    "Details": "Dettagli",
    "All gatherings": "Tutte le riunioni",
    "Our mission": "La nostra missione",
    "Our vision": "La nostra visione",
    "What we believe": "Cosa crediamo",
    "Leadership": "Liderato",
    "Ministries": "Ministeri",
    "Recent highlights": "Recenti punti salienti",
    "Ways to give": "Modi di dare",
    "Contact & visit": "Contatto e visita",
    "Join us this Sunday, or reach out and let us pray with you. We would love to meet you.": "Unisciti a noi questa domenica, o raggiungici e preghiamo con te.",
    "Rooted in peace.": "Incrollato in pace.",
    "A cheerful giver": "Un donatore allegro",
    "Partner with what God is doing.": "Partecipare a ciò che Dio sta facendo.",
    ", the LORD is peace. That peace is not a feeling; it is a person, and it changes everything.": "La pace non è un sentimento, è una persona, e cambia tutto.",
    ", send a message through the form above, or speak with one of our pastors after a gathering.": ", inviare un messaggio attraverso il modulo sopra, o parlare con uno dei nostri pastori dopo una riunione.",
    "07:00 — 14:00 · Main Auditorium": "07:00 — 14:00 · Auditorio principale",
    "12 messages": "12 messaggi",
    "2 Corinthians 9:7": "2 Corinzi 9:7",
    "21:00 — 04:00 · Main Auditorium": "21:00 — 04:00 · Auditorio principale",
    "A church built on the Word": "Una chiesa costruita sulla Parola",
    "A day of consecration and seeking God together. Watch the replay and return to the altar with fresh hunger.": "Un giorno di consacrazione e di ricerca di Dio insieme.",
    "A few things that will help you feel at home before you arrive.": "Un paio di cose che ti aiuteranno a sentirti a casa prima di arrivare.",
    "A home for the next generation": "Una casa per la prossima generazione",
    "A house of peace": "Una casa di pace",
    "A house of prayer for all nations": "Una casa di preghiera per tutte le nazioni",
    "A milestone of grace": "Una pietra miliare di grazia",
    "A night of prayer, praise, and freedom in Christ. Watch the replay and stand in the liberty Jesus purchased for you.": "Una notte di preghiera, lode e libertà in Cristo.",
    "A note on integrity": "Una nota sull'integrità",
    "A place of healing and deliverance": "Un luogo di guarigione e di liberazione",
    "A prayer burden becomes a church": "Un peso di preghiera diventa una chiesa",
    "A warm welcome": "Un caloroso benvenuto",
    "A word for the people": "Una parola per la gente.",
    "All": "Tutti.",
    "All messages": "Tutti i messaggi",
    "An all-night encounter for answers, direction, and breakthrough. Come with your questions; leave with peace.": "Un incontro di tutta la notte per risposte, direzioni e scoperte.",
    "Are children welcome?": "I bambini sono i benvenuti?",
    "Aug 24, 2026": "24 agosto 2026",
    "Aug 27, 2026": "27 agosto 2026",
    "Aug 4, 2026": "4 agosto 2026",
    "Battle Axe Youth": "Battaglia Axe Gioventù",
    "Become a partner": "Diventa un partner",
    "Better together": "Meglio insieme.",
    "Browse all messages": "Scorrere tutti i messaggi",
    "Building and maintaining a place where every person can encounter God and belong.": "Costruire e mantenere un luogo dove ogni persona possa incontrare Dio e appartenere.",
    "Built for wholeness.": "Costruito per l'interezza.",
    "Call the prayer line": "Chiama la linea di preghiera",
    "Call us daily for prayer and counsel": "Chiamateci ogni giorno per preghiere e consigli",
    "Can I watch online?": "Posso guardare online?",
    "Chat with the church office": "Parlate con l'ufficio della chiesa",
    "Classic": "Classico",
    "Choose your way to sow.": "Scegli il tuo modo di seminare.",
    "Come and see": "Vieni a vedere.",
    "Come as you are. You will find people in everything from smart suits to traditional dress. What matters most is that you are here.": "Vieni come sei, troverete persone in tutto, dagli abiti intelligenti ai vestiti tradizionali, il più importante è che tu sia qui.",
    "Come expecting.": "Vieni ad aspettarti.",
    "Come forward for prayer after the message; we will stand with you in faith.": "Venite avanti per la preghiera dopo la parola, noi saremo con voi nella fede.",
    "Consecration": "La consacrazione",
    "Next Sunday service in": "Il prossimo domenica il servizio in",
    "Days": "Giorni",
    "Hours": "Orari",
    "Mins": "Miniere",
    "Every Sunday · 07:00 — 14:00": "Ogni domenica · 07:00 — 14:00",
    "Every Wednesday": "Ogni mercoledì",
    "Daily": "Ogni giorno",
    "See all gatherings": "Guarda tutte le riunioni.",
    "Main Auditorium · Behind Livonia Complex, Off Mumbwa Road": "Auditorio principale · dietro il complesso Livonia, off Mumbwa Road",
    "Welcome home": "Benvenuti a casa.",
    "Gather with us": "Unisciti a noi.",
    "Find us": "Trovaci.",
    "Sunday gathering": "La riunione di domenica",
    "Talk to us": "Parlaci.",
    "Founder & President": "Fondatore & Presidente",
    "Spiritual heritage": "Erede spirituale",
    "Years of ministry": "Anni di ministero",
    "Messages shared": "Messaggi condivisi",
    "Weekly gatherings": "Riunioni settimanali",
    "Welcome to Shalom Embassy Ministries International - a home of healing and deliverance, where every life is restored to wholeness in Christ.": "Benvenuti a Shalom Embassy Ministries International - una casa di guarigione e di liberazione, dove ogni vita viene riportata alla pienezza in Cristo.",
    "This week at Shalom": "Questa settimana a Shalom",
    "Sunday": "Domenica",
    "Wednesday": "Mercoledì",
    "Prayer line": "Linea di preghiera",
    "Main Auditorium, Lusaka": "Auditorio principale, Lusaka",
    "Every Sunday": "Ogni domenica",
    "Welcome to Shalom Embassy Ministries International — a home of healing and deliverance, where every life is restored to wholeness in Christ.": "Benvenuti a Shalom Embassy Ministries International, una casa di guarigione e liberazione, dove ogni vita viene restituita alla completezza in Cristo."
  },
  "pt": {
    "Nothing missing.": "Não faltam nada.",
    "Nothing broken.": "Nada quebrado.",
    "Plan your visit": "Planeje a sua visita",
    "Watch a message": "Veja uma mensagem.",
    "Big Sunday": "Grande domingo",
    "Night of Solution": "Noite da Solução",
    "Prayer Line": "Linha de oração",
    "7 Hours of Nothing Missing, Nothing Broken": "7 Horas de Nada Perdido, Nada Quebrado",
    "Come as you are. Leave whole.": "Venha como está, sai inteiro.",
    "A home where the broken become whole.": "Uma casa onde os quebrados tornam-se inteiros.",
    "Our story": "A nossa história",
    "Meet the pastor": "Conheça o pastor.",
    "Our mandate": "O nosso mandato",
    "Whole people.": "Pessoas inteiras.",
    "A revived nation.": "Uma nação revivida.",
    "The Word": "A Palavra",
    "Worship": "Adoração",
    "Prayer": "Oração",
    "Wholeness": "Integridade",
    "Messages that anchor the soul.": "Mensagens que ancoram a alma.",
    "Sermon library": "Biblioteca de sermões",
    "Watch message": "Veja mensagem",
    "Find your place. Serve with purpose.": "Encontre o seu lugar e sirva com propósito.",
    "Explore ministries": "Explorar ministérios",
    "Moments of grace.": "Momentos de graça.",
    "There is a place for you here.": "Há um lugar para ti aqui.",
    "Get directions": "Obtenha instruções.",
    "Sermons": "Sermões",
    "Gatherings": "Reuniões",
    "Give": "Dá",
    "Contact": "Contacto",
    "About": "Sobre",
    "Home": "Em casa",
    "Latest moments": "Últimos momentos",
    "Upcoming": "Próximo",
    "Service times": "Horários de serviço",
    "When we gather.": "Quando nos reunirmos.",
    "Your questions, answered.": "As suas perguntas, respondidas.",
    "Send a message": "Envia uma mensagem.",
    "How can we pray with you?": "Como podemos orar contigo?",
    "Follow us": "Segue-nos.",
    "Watch online": "Assistir online",
    "Details": "Detalhes",
    "All gatherings": "Todas as reuniões",
    "Our mission": "A nossa missão",
    "Our vision": "A nossa visão",
    "What we believe": "O que acreditamos",
    "Leadership": "Liderança",
    "Ministries": "Ministérios",
    "Recent highlights": "Destaques recentes",
    "Ways to give": "Formas de dar",
    "Contact & visit": "Contacto e visita",
    "Join us this Sunday, or reach out and let us pray with you. We would love to meet you.": "Junte-se a nós neste domingo, ou vamos rezar contigo.",
    "Rooted in peace.": "Enraizado em paz.",
    "A cheerful giver": "Um doador alegre",
    "Partner with what God is doing.": "Parceria com o que Deus está fazendo.",
    ", the LORD is peace. That peace is not a feeling; it is a person, and it changes everything.": "A paz não é um sentimento, é uma pessoa, e muda tudo.",
    ", send a message through the form above, or speak with one of our pastors after a gathering.": "Enviar uma mensagem através do formulário acima, ou falar com um dos nossos pastores depois de uma reunião.",
    "07:00 — 14:00 · Main Auditorium": "07:00 — 14:00 · Auditório Principal",
    "12 messages": "12 mensagens",
    "2 Corinthians 9:7": "2 Coríntios 9:7",
    "2010s": "Anos de 2010",
    "21:00 — 04:00 · Main Auditorium": "21:00 — 04:00 · Auditório Principal",
    "A church built on the Word": "Uma igreja construída sobre a Palavra",
    "A day of consecration and seeking God together. Watch the replay and return to the altar with fresh hunger.": "Um dia de consagração e de busca de Deus juntos.",
    "A few things that will help you feel at home before you arrive.": "Algumas coisas que te ajudarão a sentir-te em casa antes de chegares.",
    "A home for the next generation": "Uma casa para a próxima geração",
    "A house of peace": "Uma casa de paz",
    "A house of prayer for all nations": "Uma casa de oração para todas as nações",
    "A milestone of grace": "Um marco de graça",
    "A night of prayer, praise, and freedom in Christ. Watch the replay and stand in the liberty Jesus purchased for you.": "Uma noite de oração, louvor e liberdade em Cristo.",
    "A note on integrity": "Uma nota sobre integridade",
    "A place of healing and deliverance": "Um lugar de cura e libertação",
    "A prayer burden becomes a church": "Um fardo de oração torna-se uma igreja",
    "A warm welcome": "Um caloroso acolhimento",
    "A word for the people": "Uma palavra para o povo.",
    "All": "Todos.",
    "All messages": "Todas as mensagens",
    "An all-night encounter for answers, direction, and breakthrough. Come with your questions; leave with peace.": "Um encontro de toda a noite para respostas, orientação e descobertas.",
    "Are children welcome?": "As crianças são bem-vindas?",
    "Aug 24, 2026": "24 de agosto de 2026",
    "Aug 27, 2026": "27 de agosto de 2026",
    "Aug 4, 2026": "4 de agosto de 2026",
    "Battle Axe Youth": "Jovens de Axe de Batalha",
    "Become a partner": "Torne-te sócio",
    "Better together": "Melhor juntos.",
    "Browse all messages": "Explore todas as mensagens",
    "Building and maintaining a place where every person can encounter God and belong.": "Construir e manter um lugar onde cada pessoa possa encontrar Deus e pertencer.",
    "Built for wholeness.": "Construído para a integridade.",
    "Call the prayer line": "Chame a linha de oração.",
    "Call us daily for prayer and counsel": "Chame-nos diariamente para oração e conselho.",
    "Can I watch online?": "Posso assistir online?",
    "Chat with the church office": "Conversar com o escritório da igreja",
    "Classic": "Clássico",
    "Choose your way to sow.": "Escolha a sua maneira de semear.",
    "Come and see": "Venha ver.",
    "Come as you are. You will find people in everything from smart suits to traditional dress. What matters most is that you are here.": "Você encontrará pessoas em tudo, desde fatos inteligentes até roupas tradicionais, o mais importante é que você esteja aqui.",
    "Come expecting.": "Venha à espera.",
    "Come forward for prayer after the message; we will stand with you in faith.": "Venham para a oração depois da mensagem, nós estaremos com vocês na fé.",
    "Consecration": "Consagração",
    "Next Sunday service in": "Serviço no próximo domingo em",
    "Days": "Dias",
    "Hours": "Horas",
    "Mins": "Minas",
    "Every Sunday · 07:00 — 14:00": "Todos os domingos · 07:00 — 14:00",
    "Every Wednesday": "Toda quarta-feira.",
    "Daily": "Diariamente",
    "See all gatherings": "Veja todas as reuniões",
    "Main Auditorium · Behind Livonia Complex, Off Mumbwa Road": "Auditório Principal · Atrás do Complexo Livonia, Off Mumbwa Road",
    "Welcome home": "Bem-vindo para casa.",
    "Gather with us": "Reúnem-se connosco.",
    "Find us": "Encontrem-nos.",
    "Sunday gathering": "Reunião de domingo",
    "Talk to us": "Fala connosco.",
    "Founder & President": "Fundador e Presidente",
    "Spiritual heritage": "Herança espiritual",
    "Years of ministry": "Anos de ministério",
    "Messages shared": "Mensagens compartilhadas",
    "Weekly gatherings": "Reuniões semanais",
    "Welcome to Shalom Embassy Ministries International - a home of healing and deliverance, where every life is restored to wholeness in Christ.": "Bem-vindo à Embaixada Shalom Ministries International - um lar de cura e libertação, onde cada vida é restaurada à integridade em Cristo.",
    "This week at Shalom": "Esta semana em Shalom",
    "Sunday": "Domingo",
    "Wednesday": "Quarta-feira",
    "Prayer line": "Linha de oração",
    "Main Auditorium, Lusaka": "Auditório Principal, Lusaka",
    "Every Sunday": "Todos os domingos",
    "Welcome to Shalom Embassy Ministries International — a home of healing and deliverance, where every life is restored to wholeness in Christ.": "Bem-vindo à Embaixada Shalom Ministries International, um lar de cura e libertação, onde cada vida é restaurada à plenitude em Cristo."
  },
  "ru": {
    "Nothing missing.": "Ничего не осталось.",
    "Nothing broken.": "Ничего не сломалось.",
    "Plan your visit": "Планируйте свой визит",
    "Watch a message": "Смотрите сообщение.",
    "Big Sunday": "Большое воскресенье",
    "Night of Solution": "Ночь решения",
    "Prayer Line": "Молитвенная линия",
    "7 Hours of Nothing Missing, Nothing Broken": "7 часов - ничего не пропало, ничего не сломалось",
    "Come as you are. Leave whole.": "Иди как хочешь, и уходи целиком.",
    "A home where the broken become whole.": "Дом, где разбитые становятся целыми.",
    "Our story": "Наша история",
    "Meet the pastor": "Познакомься с пастором.",
    "Our mandate": "Наш мандат",
    "Whole people.": "Целых людей.",
    "A revived nation.": "Возрождённый народ.",
    "The Word": "Слово",
    "Worship": "Поклонение",
    "Prayer": "Молитва",
    "Wholeness": "Совершенность",
    "Messages that anchor the soul.": "Сообщения, которые закрепляют душу.",
    "Sermon library": "Библиотека проповедей",
    "Watch message": "Просмотреть сообщение",
    "Find your place. Serve with purpose.": "Найди свое место, служи с целью.",
    "Explore ministries": "Исследуйте министерства",
    "Moments of grace.": "Минуты благодати.",
    "There is a place for you here.": "Здесь есть место для тебя.",
    "Get directions": "Получи указания.",
    "Sermons": "Лекции",
    "Gatherings": "Собрания",
    "Give": "Давать",
    "Contact": "Контакт",
    "About": "По поводу",
    "Home": "Дом",
    "Latest moments": "Последние минуты",
    "Upcoming": "Впереди",
    "Service times": "Время службы",
    "When we gather.": "Когда мы соберемся.",
    "Your questions, answered.": "Ваши вопросы, ответы.",
    "Send a message": "Отправить сообщение",
    "How can we pray with you?": "Как мы можем молиться с тобой?",
    "Follow us": "Следуй за нами.",
    "Watch online": "Смотреть онлайн",
    "Details": "Подробности",
    "All gatherings": "Все собрания",
    "Our mission": "Наша миссия",
    "Our vision": "Наше видение",
    "What we believe": "В чем мы верим",
    "Leadership": "Лидерство",
    "Ministries": "Министерство",
    "Recent highlights": "Недавние события",
    "Ways to give": "Способы подарить",
    "Contact & visit": "Контакт и посещение",
    "Join us this Sunday, or reach out and let us pray with you. We would love to meet you.": "Присоединяйтесь к нам в воскресенье или помолитесь вместе.",
    "Rooted in peace.": "Укоренившись в мире.",
    "A cheerful giver": "Веселый дающий",
    "Partner with what God is doing.": "Содействуйте тому, что делает Бог.",
    ", the LORD is peace. That peace is not a feeling; it is a person, and it changes everything.": "Мир - это не чувство, это человек, и он меняет все.",
    ", send a message through the form above, or speak with one of our pastors after a gathering.": ", отправить сообщение через форму выше, или поговорить с одним из наших пасторов после собрания.",
    "07:00 — 14:00 · Main Auditorium": "07:00 — 14:00 · Главный зал",
    "12 messages": "12 сообщений",
    "2 Corinthians 9:7": "2 Коринфянам 9:7",
    "2010s": "2010-е годы",
    "21:00 — 04:00 · Main Auditorium": "21:00 — 04:00 · Главный зал",
    "A church built on the Word": "Церковь, построенная на Слове",
    "A day of consecration and seeking God together. Watch the replay and return to the altar with fresh hunger.": "День посвящения и поиска Бога вместе. Смотрите на повторение и возвращайтесь к жертвеннику с новым голодом.",
    "A few things that will help you feel at home before you arrive.": "Несколько вещей, которые помогут вам чувствовать себя как дома до прибытия.",
    "A home for the next generation": "Дом для следующего поколения",
    "A house of peace": "Дом мира",
    "A house of prayer for all nations": "Дом молитвы для всех народов",
    "A milestone of grace": "Мильный камень благодати.",
    "A night of prayer, praise, and freedom in Christ. Watch the replay and stand in the liberty Jesus purchased for you.": "Ночь молитвы, хвалы и свободы в Христе.",
    "A note on integrity": "Запись о непорочности",
    "A place of healing and deliverance": "Место исцеления и избавления",
    "A prayer burden becomes a church": "Молитвенное бремя становится церковью",
    "A warm welcome": "Теплое приветствие",
    "A word for the people": "Слово для народа",
    "All": "Все",
    "All messages": "Все сообщения",
    "An all-night encounter for answers, direction, and breakthrough. Come with your questions; leave with peace.": "Целую ночь мы встретились, чтобы найти ответы, направление и прорыв.",
    "Are children welcome?": "Дети приветствуются?",
    "Aug 24, 2026": "24 августа 2026 г.",
    "Aug 27, 2026": "27 августа 2026 г.",
    "Aug 4, 2026": "4 августа 2026 г.",
    "Battle Axe Youth": "Сражайтесь с молодёжью.",
    "Become a partner": "Станьте партнером.",
    "Better together": "Лучше вместе.",
    "Browse all messages": "Просмотреть все сообщения",
    "Building and maintaining a place where every person can encounter God and belong.": "Строить и поддерживать место, где каждый человек может встретиться с Богом и принадлежать к нему.",
    "Built for wholeness.": "Создан для целостности.",
    "Call the prayer line": "Позвони на молитвенную линию.",
    "Call us daily for prayer and counsel": "Призови нас ежедневно для молитвы и совета",
    "Can I watch online?": "Можно смотреть онлайн?",
    "Chat with the church office": "Поговорите с церковным офисом",
    "Classic": "Классический",
    "Choose your way to sow.": "Выберите свой способ сеяния.",
    "Come and see": "Подойди и посмотри.",
    "Come as you are. You will find people in everything from smart suits to traditional dress. What matters most is that you are here.": "Вы найдете людей, одетых в все, от умных костюмов до традиционных, но самое главное, что вы здесь.",
    "Come expecting.": "Приезжайте ожидать.",
    "Come forward for prayer after the message; we will stand with you in faith.": "Поступайте в молитве после проповеди, мы будем стоять с вами в вере.",
    "Next Sunday service in": "В следующую воскресенье служба в",
    "Days": "Дни",
    "Hours": "Часы",
    "Mins": "Мины",
    "Secs": "Сексы",
    "Every Sunday · 07:00 — 14:00": "Каждое воскресенье - 07:00 - 14:00",
    "Every Wednesday": "Каждую среду",
    "Daily": "Ежедневно",
    "See all gatherings": "Смотрите все собрания.",
    "Main Auditorium · Behind Livonia Complex, Off Mumbwa Road": "Главная аудитория · За комплексом Ливонии, Off Mumbwa Road",
    "Welcome home": "Добро пожаловать домой.",
    "Gather with us": "Присоединяйтесь к нам",
    "Find us": "Найди нас.",
    "Sunday gathering": "Недельное собрание",
    "Talk to us": "Поговори с нами.",
    "Founder & President": "Основатель и президент",
    "Spiritual heritage": "Духовное наследие",
    "Years of ministry": "Годы служения",
    "Messages shared": "Общие сообщения",
    "Weekly gatherings": "Еженедельные встречи",
    "Welcome to Shalom Embassy Ministries International - a home of healing and deliverance, where every life is restored to wholeness in Christ.": "Добро пожаловать в международную посольство Шалом - дом исцеления и освобождения, где вся жизнь восстанавливается в полноте в Христе.",
    "This week at Shalom": "На этой неделе в Шаломе",
    "Sunday": "В воскресенье",
    "Wednesday": "В среду",
    "Prayer line": "Молитвенная строка",
    "Main Auditorium, Lusaka": "Главный зал, Люсака",
    "Every Sunday": "Каждое воскресенье",
    "Welcome to Shalom Embassy Ministries International — a home of healing and deliverance, where every life is restored to wholeness in Christ.": "Добро пожаловать в Посольство Шалом Минобразования, дом исцеления и освобождения, где вся жизнь восстанавливается в полноте в Христе."
  },
  "es": {
    "Nothing missing.": "No faltó nada.",
    "Nothing broken.": "No hay nada roto.",
    "Plan your visit": "Planifique su visita",
    "Watch a message": "Mira un mensaje.",
    "Big Sunday": "El gran domingo",
    "Night of Solution": "Noche de solución",
    "Prayer Line": "Línea de oración",
    "7 Hours of Nothing Missing, Nothing Broken": "7 Horas de nada perdido, nada roto",
    "Come as you are. Leave whole.": "Ven como estés.",
    "A home where the broken become whole.": "Un hogar donde los rotos se vuelven sanos.",
    "Our story": "Nuestra historia",
    "Meet the pastor": "Conozca al pastor.",
    "Our mandate": "Nuestro mandato",
    "Whole people.": "Toda la gente.",
    "A revived nation.": "Una nación revivida.",
    "The Word": "La Palabra",
    "Worship": "Adoración",
    "Prayer": "La oración",
    "Wholeness": "La totalidad",
    "Messages that anchor the soul.": "Mensajes que anclan el alma.",
    "Sermon library": "Biblioteca de sermones",
    "Watch message": "Vigilar el mensaje",
    "Find your place. Serve with purpose.": "Encuentra tu lugar y sirve con propósito.",
    "Explore ministries": "Explora los ministerios",
    "Moments of grace.": "Momentos de gracia.",
    "There is a place for you here.": "Hay un lugar para ti aquí.",
    "Get directions": "Obtenga instrucciones.",
    "Sermons": "Los sermones",
    "Gatherings": "Las reuniones",
    "Give": "- ¿Por qué?",
    "Contact": "Contacto",
    "About": "En cuanto a",
    "Home": "El hogar",
    "Latest moments": "Últimos momentos",
    "Upcoming": "Las próximas",
    "Service times": "Tiempos de servicio",
    "When we gather.": "Cuando nos reunamos.",
    "Your questions, answered.": "Sus preguntas, respondidas.",
    "Send a message": "Envía un mensaje",
    "How can we pray with you?": "¿Cómo podemos orar contigo?",
    "Follow us": "Sigue con nosotros.",
    "Watch online": "Vea en línea",
    "Details": "Detalles",
    "All gatherings": "Todas las reuniones",
    "Our mission": "Nuestra misión",
    "Our vision": "Nuestra visión",
    "What we believe": "Lo que creemos",
    "Leadership": "El liderazgo",
    "Ministries": "Ministerios",
    "Recent highlights": "Principales acontecimientos recientes",
    "Ways to give": "Maneras de dar",
    "Contact & visit": "Contacto y visita",
    "Join us this Sunday, or reach out and let us pray with you. We would love to meet you.": "Únase a nosotros este domingo, o nos acerquemos y oremos con usted.",
    "Rooted in peace.": "Enraizada en paz.",
    "A cheerful giver": "Un donante alegre",
    "Partner with what God is doing.": "Socios de lo que Dios está haciendo.",
    ", the LORD is peace. That peace is not a feeling; it is a person, and it changes everything.": "La paz no es un sentimiento, es una persona, y cambia todo.",
    ", send a message through the form above, or speak with one of our pastors after a gathering.": ", enviar un mensaje a través del formulario de arriba, o hablar con uno de nuestros pastores después de una reunión.",
    "07:00 — 14:00 · Main Auditorium": "07:00 — 14:00 · Auditorio principal",
    "12 messages": "12 mensajes",
    "2 Corinthians 9:7": "2 Corintios 9:7",
    "2010s": "La década de 2010",
    "21:00 — 04:00 · Main Auditorium": "21:00 — 04:00 · Auditorio principal",
    "A church built on the Word": "Una iglesia construida sobre la Palabra",
    "A day of consecration and seeking God together. Watch the replay and return to the altar with fresh hunger.": "Un día de consagración y buscar a Dios juntos. Mira la repetición y regresa al altar con un nuevo hambre.",
    "A few things that will help you feel at home before you arrive.": "Unas pocas cosas que te ayudarán a sentirte como en casa antes de llegar.",
    "A home for the next generation": "Un hogar para la próxima generación",
    "A house of peace": "Una casa de paz",
    "A house of prayer for all nations": "Una casa de oración para todas las naciones",
    "A milestone of grace": "Un hito de gracia",
    "A night of prayer, praise, and freedom in Christ. Watch the replay and stand in the liberty Jesus purchased for you.": "Una noche de oración, alabanza y libertad en Cristo.",
    "A note on integrity": "Una nota sobre la integridad",
    "A place of healing and deliverance": "Un lugar de curación y liberación",
    "A prayer burden becomes a church": "Una carga de oración se convierte en una iglesia",
    "A warm welcome": "Una cálida bienvenida",
    "A word for the people": "Una palabra para el pueblo",
    "All": "Todo el mundo",
    "All messages": "Todos los mensajes",
    "An all-night encounter for answers, direction, and breakthrough. Come with your questions; leave with peace.": "Un encuentro de toda la noche para respuestas, dirección y avance.",
    "Are children welcome?": "¿Los niños son bienvenidos?",
    "Aug 24, 2026": "24 de agosto de 2026",
    "Aug 27, 2026": "27 de agosto de 2026",
    "Aug 4, 2026": "4 de agosto de 2026",
    "Battle Axe Youth": "Juventud en la batalla del hacha",
    "Become a partner": "Conviértete en socio",
    "Better together": "Mejor juntos.",
    "Browse all messages": "Explora todos los mensajes",
    "Building and maintaining a place where every person can encounter God and belong.": "Construir y mantener un lugar donde cada persona pueda encontrar a Dios y pertenecer.",
    "Built for wholeness.": "Construido para la integridad.",
    "Call the prayer line": "Llama a la línea de oración",
    "Call us daily for prayer and counsel": "Llámenos todos los días por oración y consejo.",
    "Can I watch online?": "¿Puedo ver en línea?",
    "Chat with the church office": "Habla con la oficina de la iglesia",
    "Classic": "Clásico",
    "Choose your way to sow.": "Elige tu manera de sembrar.",
    "Come and see": "Ven y ve.",
    "Come as you are. You will find people in everything from smart suits to traditional dress. What matters most is that you are here.": "Ven como estés, encontrarás gente en todo, desde trajes inteligentes hasta vestidos tradicionales, lo más importante es que estés aquí.",
    "Come expecting.": "Viene esperando.",
    "Come forward for prayer after the message; we will stand with you in faith.": "Ven a la oración después de la palabra. Estaremos con usted en la fe.",
    "Consecration": "La consagración",
    "Next Sunday service in": "El servicio del próximo domingo en",
    "Days": "Días",
    "Hours": "Horario de trabajo",
    "Mins": "Las minas",
    "Secs": "Las secas",
    "Every Sunday · 07:00 — 14:00": "Todos los domingos · 07:00 — 14:00",
    "Every Wednesday": "Todos los miércoles",
    "Daily": "Todos los días",
    "See all gatherings": "Ver todas las reuniones",
    "Main Auditorium · Behind Livonia Complex, Off Mumbwa Road": "Auditorio principal · Detrás del complejo Livonia, en la calle Mumbwa",
    "Welcome home": "Bienvenido a casa.",
    "Gather with us": "Reúnete con nosotros",
    "Find us": "Encuentranos.",
    "Sunday gathering": "Reunión del domingo",
    "Talk to us": "Habla con nosotros.",
    "Founder & President": "Fundador y Presidente",
    "Spiritual heritage": "Una herencia espiritual",
    "Years of ministry": "Años de ministerio",
    "Messages shared": "Mensajes compartidos",
    "Weekly gatherings": "Reuniones semanales",
    "Welcome to Shalom Embassy Ministries International - a home of healing and deliverance, where every life is restored to wholeness in Christ.": "Bienvenidos a Shalom Embassy Ministries International - un hogar de curación y liberación, donde cada vida es restaurada a la plenitud en Cristo.",
    "This week at Shalom": "Esta semana en Shalom",
    "Sunday": "El domingo",
    "Wednesday": "Miércoles",
    "Prayer line": "Una oración",
    "Main Auditorium, Lusaka": "Auditorio principal, Lusaka",
    "Every Sunday": "Todos los domingos",
    "Welcome to Shalom Embassy Ministries International — a home of healing and deliverance, where every life is restored to wholeness in Christ.": "Bienvenido a Shalom Embassy Ministries International, un hogar de curación y liberación, donde cada vida es restaurada a la plenitud en Cristo."
  }
};

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
