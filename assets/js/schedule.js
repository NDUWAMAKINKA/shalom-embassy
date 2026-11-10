/* =========================================================
   SHALOM EMBASSY — CHURCH CALENDAR
   Recurring weekly, monthly, and quarterly gatherings.
   ========================================================= */

(function () {
  "use strict";

  var CAT_TZ = "Africa/Lusaka";
  var MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  var WEEKDAYS = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ];
  var WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  var EVENTS = [
    {
      id: "seven-hours",
      title: "7 Hours of Nothing Missing, Nothing Broken",
      recurrence: "Every Last Sunday",
      time: "07:00 — 14:00 CAT",
      place: "Main Auditorium · Plot 995, Garden House, Off Mumbwa Road",
      description: "A seven-hour healing and deliverance service on the last Sunday of every month. Come expectant for worship, the Word, prophetic prayer, and ministry to the whole family.",
      special: true,
      match: function (date) {
        return date.weekday === 0 && date.day + 7 > date.daysInMonth;
      }
    },
    {
      id: "empowerment-sunday",
      title: "Empowerment Sunday",
      recurrence: "First Week of Every Month",
      time: "07:00 — 14:00 CAT",
      place: "Main Auditorium · Plot 995, Garden House, Off Mumbwa Road",
      description: "Our monthly empowerment service on the first Sunday of every month — a full day of worship, the Word, and prayer for every area of your life.",
      special: true,
      match: function (date) {
        return date.weekday === 0 && date.day <= 7;
      }
    },
    {
      id: "worship-weapon",
      title: "My Worship My Weapon 4",
      recurrence: "First Week of Every Month",
      time: "21:00 CAT",
      place: "Main Auditorium · Plot 995, Garden House, Off Mumbwa Road",
      description: "Our monthly worship encounter on the first Friday of every month — a night of deep worship, ministration, and encounter with the presence of God.",
      special: true,
      match: function (date) {
        return date.weekday === 5 && date.day <= 7;
      }
    },
    {
      id: "morning-glory",
      title: "Morning Glory",
      recurrence: "Monday – Saturday",
      time: "06:00 CAT",
      place: "Main Auditorium & Online Broadcast",
      description: "Begin each morning at the altar of prayer with Morning Glory and Standing In The Gap intercession, committing your family, work, and nation into God's hands.",
      special: false,
      match: function (date) {
        return date.weekday >= 1 && date.weekday <= 6;
      }
    },
    {
      id: "virtuous-women",
      title: "Virtuous Women",
      recurrence: "Every Tuesday",
      time: "14:00 CAT",
      place: "Main Auditorium · Plot 995, Garden House",
      description: "Led by Pastor Bupe Sinyangwe, equipping women through fervent intercession, practical teaching of the Word, fellowship, and spiritual mentorship.",
      special: false,
      match: function (date) {
        return date.weekday === 2;
      }
    },
    {
      id: "midweek",
      title: "Midweek Service",
      recurrence: "Every Wednesday",
      time: "11:00 & 16:00 CAT",
      place: "Main Auditorium · Plot 995, Garden House",
      description: "Our Wednesday midweek service with Deliverance at 11:00 CAT and Preservation at 16:00 CAT — breaking yokes, ministering divine healing, and establishing spiritual preservation over your life and household.",
      special: false,
      match: function (date) {
        return date.weekday === 3;
      }
    },
    {
      id: "night-of-solution",
      title: "Night of Solution",
      recurrence: "Wednesday Night",
      time: "21:00 — 04:00 CAT",
      place: "Main Auditorium · Plot 995, Garden House",
      description: "An all-night prophetic and deliverance vigil for answers, divine direction, and supernatural breakthrough in the presence of God.",
      special: false,
      match: function (date) {
        return date.weekday === 3;
      }
    },
    {
      id: "healing-deliverance",
      title: "Healing & Deliverance",
      recurrence: "Every Thursday",
      time: "18:00 CAT",
      place: "Main Auditorium · Plot 995, Garden House",
      description: "A weekly evening service dedicated to healing, deliverance, and restoration in spirit, soul, and body through the Word of God and the power of the Holy Spirit.",
      special: false,
      match: function (date) {
        return date.weekday === 4;
      }
    }
  ];

  function t(text) {
    if (typeof window.SHALOM_T === "function") return window.SHALOM_T(text);
    return text;
  }

  function catToday() {
    var parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: CAT_TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(new Date());
    var values = {};
    parts.forEach(function (part) {
      if (part.type !== "literal") values[part.type] = part.value;
    });
    return {
      year: Number(values.year),
      month: Number(values.month),
      day: Number(values.day)
    };
  }

  function makeDate(year, month, day) {
    var date = new Date(Date.UTC(year, month - 1, day));
    var daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    return {
      year: year,
      month: month,
      day: day,
      weekday: date.getUTCDay(),
      daysInMonth: daysInMonth,
      key: year + "-" + month + "-" + day
    };
  }

  function addDays(date, amount) {
    var next = new Date(Date.UTC(date.year, date.month - 1, date.day + amount));
    return makeDate(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate());
  }

  function addMonths(year, month, amount) {
    var next = new Date(Date.UTC(year, month - 1 + amount, 1));
    return {
      year: next.getUTCFullYear(),
      month: next.getUTCMonth() + 1
    };
  }

  function monthLabel(year, month) {
    return t(MONTHS[month - 1]) + " " + year;
  }

  function dateLabel(date) {
    return t(WEEKDAYS[date.weekday]) + ", " + date.day + " " + t(MONTHS[date.month - 1]) + " " + date.year;
  }

  function shortDateLabel(date) {
    return t(WEEKDAYS[date.weekday]) + ", " + date.day + " " + t(MONTHS[date.month - 1]);
  }

  function eventsFor(date) {
    return EVENTS.filter(function (event) {
      return event.match(date);
    });
  }

  function upcomingOccurrences(limit, specialOnly) {
    var today = makeDate(catToday().year, catToday().month, catToday().day);
    var nextByEvent = {};
    var cursor = today;
    for (var i = 0; i < 120; i += 1) {
      eventsFor(cursor).forEach(function (event) {
        if (specialOnly && !event.special) return;
        if (!nextByEvent[event.id]) {
          nextByEvent[event.id] = { event: event, date: cursor };
        }
      });
      cursor = addDays(cursor, 1);
    }
    return Object.keys(nextByEvent)
      .map(function (key) { return nextByEvent[key]; })
      .sort(function (a, b) {
        return a.date.key < b.date.key ? -1 : a.date.key > b.date.key ? 1 : 0;
      })
      .slice(0, limit);
  }

  function buildCalendar() {
    var calendar = document.querySelector("[data-calendar]");
    var grid = document.querySelector("[data-calendar-grid]");
    var weekdays = document.querySelector("[data-calendar-weekdays]");
    var label = document.querySelector("[data-calendar-label]");
    if (!calendar || !grid || !weekdays || !label) return null;
    if (calendar.dataset.ready === "true") return null;

    var today = catToday();
    var state = {
      year: today.year,
      month: today.month
    };

    weekdays.innerHTML = "";
    for (var index = 0; index < 7; index += 1) {
      var dayIndex = (index + 1) % 7;
      var heading = document.createElement("span");
      heading.textContent = t(WEEKDAYS_SHORT[dayIndex]);
      weekdays.appendChild(heading);
    }

    function render() {
      label.textContent = monthLabel(state.year, state.month);
      grid.innerHTML = "";
      var first = makeDate(state.year, state.month, 1);
      var offset = (first.weekday + 6) % 7;
      var total = first.daysInMonth;

      for (var blank = 0; blank < offset; blank += 1) {
        var empty = document.createElement("div");
        empty.className = "calendar__day calendar__day--empty";
        empty.setAttribute("aria-hidden", "true");
        grid.appendChild(empty);
      }

      for (var day = 1; day <= total; day += 1) {
        var date = makeDate(state.year, state.month, day);
        var dayEvents = eventsFor(date);
        var cell = document.createElement("div");
        cell.className = "calendar__day";
        if (date.weekday === 0) cell.classList.add("calendar__day--sunday");
        if (dayEvents.some(function (event) { return event.special; })) {
          cell.classList.add("calendar__day--special");
        }
        cell.setAttribute("role", "gridcell");
        cell.setAttribute("aria-label", dateLabel(date));

        var number = document.createElement("span");
        number.className = "calendar__day-num";
        number.textContent = String(day);
        cell.appendChild(number);

        if (dayEvents.length) {
          var dots = document.createElement("span");
          dots.className = "calendar__dots";
          dayEvents.forEach(function (event) {
            var dot = document.createElement("span");
            dot.className =
              "calendar__dot " +
              (event.special ? "calendar__dot--special" : "calendar__dot--weekly");
            dot.setAttribute("aria-label", t(event.title));
            dot.setAttribute("title", t(event.title));
            dots.appendChild(dot);
          });
          cell.appendChild(dots);
        }

        grid.appendChild(cell);
      }

      if (grid.children.length % 7 !== 0) {
        while (grid.children.length % 7 !== 0) {
          var filler = document.createElement("div");
          filler.className = "calendar__day calendar__day--empty";
          filler.setAttribute("aria-hidden", "true");
          grid.appendChild(filler);
        }
      }
    }

    calendar.dataset.ready = "true";
    render();

    var prev = document.querySelector("[data-calendar-prev]");
    var next = document.querySelector("[data-calendar-next]");
    if (prev) {
      prev.onclick = function () {
        var target = addMonths(state.year, state.month, -1);
        state.year = target.year;
        state.month = target.month;
        render();
      };
    }
    if (next) {
      next.onclick = function () {
        var target = addMonths(state.year, state.month, 1);
        state.year = target.year;
        state.month = target.month;
        render();
      };
    }

    return { render: render };
  }

  function buildUpcoming() {
    var grid = document.querySelector("[data-schedule-upcoming]");
    if (!grid) return;

    var limit = parseInt(grid.getAttribute("data-limit") || "8", 10) || 8;
    var specialOnly = grid.getAttribute("data-special") === "true";
    var items = upcomingOccurrences(limit, specialOnly);
    var html = "";

    html +=
      '<article class="event-card feed-event schedule-card schedule-card--quarterly">' +
        '<div class="event-card__body">' +
        '<p class="event-card__date">' +
        '<svg class="icon" aria-hidden="true" focusable="false"><use href="#i-calendar"></use></svg> ' +
        t("Quarterly") +
        "</p>" +
        "<h3>" + t("Big Sunday") + "</h3>" +
        "<p>" + t("Our quarterly gathering of the whole church family for a full day of worship, the Word, prophetic prayer, healing, and deliverance.") + "</p>" +
        '<p class="feed-event__meta">' +
        '<svg class="icon" aria-hidden="true" focusable="false"><use href="#i-clock"></use></svg>' + t("07:00 — 14:00 CAT") +
        '<span class="schedule-card__note">' + t("Date to be announced") + "</span>" +
        "</p>" +
        '<a class="sermon-card__link" href="contact.html#visit">' +
        t("Plan your visit") +
        ' <svg class="icon" aria-hidden="true" focusable="false"><use href="#i-arrow"></use></svg></a>' +
        "</div></article>";

    items.forEach(function (item) {
      html +=
        '<article class="event-card feed-event schedule-card">' +
        '<div class="event-card__body">' +
        '<p class="event-card__date">' +
        '<svg class="icon" aria-hidden="true" focusable="false"><use href="#i-calendar"></use></svg> ' +
        dateLabel(item.date) +
        "</p>" +
        "<h3>" + t(item.event.title) + "</h3>" +
        "<p>" + t(item.event.description) + "</p>" +
        '<p class="feed-event__meta">' +
        '<svg class="icon" aria-hidden="true" focusable="false"><use href="#i-clock"></use></svg>' + t(item.event.time) +
        '<svg class="icon" aria-hidden="true" focusable="false"><use href="#i-pin"></use></svg>' + t(item.event.place) +
        "</p>" +
        '<p class="schedule-card__recurrence">' + t(item.event.recurrence) + "</p>" +
        "</div></article>";
    });

    grid.innerHTML = html;
  }

  function build() {
    buildCalendar();
    buildUpcoming();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }

  document.addEventListener("shalom:language", function () {
    var calendar = document.querySelector("[data-calendar]");
    if (calendar) calendar.dataset.ready = "false";
    buildCalendar();
    buildUpcoming();
  });
})();
