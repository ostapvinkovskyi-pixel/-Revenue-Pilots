/* =========================================================================
   REVENUE PILOTS — hero service switcher.

   Three service objects live in the DOM from first paint. Exactly one is
   featured; the other two occupy the left/right slots. Clicking a side
   object (or a mobile tab) rotates the positional classes and updates the
   copy in the same frame. No sources are swapped on click, so there is no
   asset flash and the cycle is exactly reversible.

   Vanilla, no dependencies, CSP-safe (script-src 'self').
   ========================================================================= */
(function () {
  "use strict";

  var ORDER = ["creative", "websites", "systems"];

  var COPY = {
    creative: {
      name: "CREATIVE",
      promise: "Get attention worth converting.",
      desc: "Eight original ads over four weeks, plus extra hooks to keep testing fresh.",
      price: "Creative Sprint — <strong>$1,500 / 4 weeks</strong>",
      cta: "Start Creative Sprint — $1,500",
      checkout: "/api/checkout?plan=starter&term=one_time"
    },
    websites: {
      name: "WEBSITES",
      promise: "Turn attention into action.",
      desc: "Premium websites designed around leads, bookings and sales.",
      price: "Conversion Website — <strong>$3,500 total</strong> · $1,750 project deposit",
      cta: "Start Website — $1,750",
      checkout: "/api/checkout?plan=website&term=deposit"
    },
    systems: {
      name: "SYSTEMS",
      promise: "Don't lose the opportunity after the click.",
      desc: "Lead capture, follow-up, booking and workflow automation.",
      price: "Revenue Systems — <strong>$3,500 total</strong> · $1,750 project deposit",
      cta: "Start Revenue Systems — $1,750",
      checkout: "/api/checkout?plan=systems&term=deposit"
    }
  };

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else { fn(); }
  }

  ready(function () {
    var objects = Array.prototype.slice.call(document.querySelectorAll(".v2-object"));
    var tabs = Array.prototype.slice.call(document.querySelectorAll(".v2-tab"));
    var elName = document.getElementById("v2ServiceName");
    var elPromise = document.getElementById("v2Promise");
    var elDesc = document.getElementById("v2Desc");
    var elPrice = document.getElementById("v2Price");
    var elCta = document.getElementById("v2ServiceCta");

    // The homepage Systems chapter uses the high-quality 16:9 Revenue Pilots
    // flagship film. Keep the media URL here so the current markup can be
    // upgraded without changing the section layout/caption the owner approved.
    var systemFilm = document.querySelector(".rp-system-video video");
    if (systemFilm) {
      var systemFilmUrl = "https://d2ol7oe51mr4n9.cloudfront.net/user_3IQOKnTRxX22rPLfhCEsOdVJxTl/b25280d1-f2c0-44cc-a207-59022bb2f6a1.mp4";
      if (systemFilm.getAttribute("src") !== systemFilmUrl) {
        systemFilm.setAttribute("src", systemFilmUrl);
        systemFilm.setAttribute("aria-label", "Revenue Pilots flagship film showing creative, website, agents, booking and pipeline working as one connected system. Silent video.");
        systemFilm.load();
        var systemFilmPlay = systemFilm.play();
        if (systemFilmPlay && systemFilmPlay.catch) systemFilmPlay.catch(function () { /* autoplay policy: poster stays */ });
      }
    }

    if (!objects.length || !elName) return;

    var active = null;

    function show(service) {
      if (!COPY[service] || service === active) return;
      active = service;

      var i = ORDER.indexOf(service);
      var left = ORDER[(i + 2) % 3];
      var right = ORDER[(i + 1) % 3];

      objects.forEach(function (el) {
        var s = el.getAttribute("data-service");
        var isFeatured = s === service;
        el.classList.toggle("is-featured", isFeatured);
        el.classList.toggle("is-left", s === left);
        el.classList.toggle("is-right", s === right);
        el.setAttribute("aria-pressed", String(isFeatured));
        el.disabled = isFeatured;

        var video = el.querySelector("video");
        if (!video) return;
        if (isFeatured) {
          var p = video.play();
          if (p && p.catch) p.catch(function () { /* autoplay policy: poster stays */ });
        } else {
          video.pause();
        }
      });

      tabs.forEach(function (t) {
        t.setAttribute("aria-selected", String(t.getAttribute("data-service") === service));
      });

      var c = COPY[service];
      elName.textContent = c.name;
      elPromise.textContent = c.promise;
      elDesc.textContent = c.desc;
      elPrice.innerHTML = c.price;
      if (elCta) { elCta.textContent = c.cta; elCta.setAttribute("href", c.checkout); }
    }

    objects.forEach(function (el) {
      el.addEventListener("click", function () {
        show(el.getAttribute("data-service"));
      });
    });
    tabs.forEach(function (t) {
      t.addEventListener("click", function () {
        show(t.getAttribute("data-service"));
      });
    });

    var q = /[?&]service=(creative|websites|systems)/.exec(location.search);
    show(q ? q[1] : "creative");
    document.documentElement.classList.add("v2-ready");

    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState !== "visible" || !active) return;
      var featured = document.querySelector('.v2-object[data-service="' + active + '"]');
      var video = featured && featured.querySelector("video");
      if (!video || !video.paused) return;
      var p = video.play();
      if (p && p.catch) p.catch(function () { /* still blocked: poster stays */ });
    });

    Array.prototype.forEach.call(document.querySelectorAll(".v2-clip"), function (fig) {
      var video = fig.querySelector("video");
      var btn = fig.querySelector(".v2-play");
      if (!video || !btn) return;
      btn.addEventListener("click", function () {
        fig.classList.add("is-playing");
        video.controls = true;
        var p = video.play();
        if (p && p.catch) p.catch(function () { /* autoplay policy: poster stays */ });
      });
    });
  });
})();
