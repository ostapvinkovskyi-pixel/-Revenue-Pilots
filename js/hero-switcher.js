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

  // Commercial hierarchy: Business Autopilot first, Websites second,
  // Creative as the optional attention layer once the operating path works.
  var ORDER = ["systems", "websites", "creative"];

  var COPY = {
    systems: {
      name: "BUSINESS AUTOPILOT",
      promise: "Stop babysitting the same handoffs every day.",
      desc: "Connect new enquiries, follow-up, booking, payment handoff and pipeline updates so routine work keeps moving and only real decisions come back to you.",
      price: "Autopilot Pilot — <strong>$500 one-time</strong>",
      cta: "Ask about the $500 pilot",
      checkout: "#contact"
    },
    websites: {
      name: "WEBSITES + INTAKE",
      promise: "Give every new lead a clear next step.",
      desc: "Premium websites designed around enquiries, bookings and sales — with lead capture built to connect cleanly into your operating system.",
      price: "Website Build — <strong>from $3,500</strong>",
      cta: "See Website Build",
      checkout: "/website-design/"
    },
    creative: {
      name: "CREATIVE ADD-ON",
      promise: "Add more attention after the engine is ready for it.",
      desc: "Original short-form ads and fresh hooks that can feed more qualified attention into the same connected customer journey.",
      price: "Creative Sprint — <strong>$1,500 / 4 weeks</strong>",
      cta: "See Creative Sprint",
      checkout: "#packages"
    }
  };

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else { fn(); }
  }

  function text(el, value) {
    if (el) el.textContent = value;
  }

  ready(function () {
    var objects = Array.prototype.slice.call(document.querySelectorAll(".v2-object"));
    var tabs = Array.prototype.slice.call(document.querySelectorAll(".v2-tab"));
    var elName = document.getElementById("v2ServiceName");
    var elPromise = document.getElementById("v2Promise");
    var elDesc = document.getElementById("v2Desc");
    var elPrice = document.getElementById("v2Price");
    var elCta = document.getElementById("v2ServiceCta");

    // Reframe the homepage around autonomy without changing checkout logic,
    // production infrastructure or the underlying three-service layout.
    var hero = document.querySelector(".v2-hero-copy");
    if (hero) {
      text(hero.querySelector(".v2-eyebrow"), "Business Autopilot · Websites · Creative");
      text(hero.querySelector(".v2-h1"), "A business that keeps moving after the lead comes in.");
      text(hero.querySelector(".v2-sub"), "Revenue Pilots builds the website and operating layer that captures enquiries, follows up, routes work, moves customers toward booking or payment, and keeps the pipeline organized — with you stepping in where a human decision is actually needed.");

      if (!hero.querySelector(".rp-autopilot-flow")) {
        var flow = document.createElement("div");
        flow.className = "rp-case-specs rp-autopilot-flow v2-entrance";
        flow.setAttribute("style", "--d:420ms");
        flow.setAttribute("aria-label", "Business Autopilot flow");
        flow.innerHTML = "<span>Website / Lead</span><span>Follow-up</span><span>Booking</span><span>Payment</span><span>Pipeline</span>";
        var ctaWrap = hero.querySelector(".v2-hero-cta");
        if (ctaWrap && ctaWrap.parentNode) ctaWrap.parentNode.insertBefore(flow, ctaWrap.nextSibling);
      }
    }

    var headerCta = document.querySelector(".header-cta");
    if (headerCta) {
      headerCta.textContent = "Build My Autopilot";
      headerCta.setAttribute("href", "#contact");
    }

    var systemsTab = document.querySelector('.v2-tab[data-service="systems"]');
    var websitesTab = document.querySelector('.v2-tab[data-service="websites"]');
    var creativeTab = document.querySelector('.v2-tab[data-service="creative"]');
    text(systemsTab, "Autopilot");
    text(websitesTab, "Website");
    text(creativeTab, "Creative add-on");

    var systemsObject = document.querySelector('.v2-object[data-service="systems"]');
    var websitesObject = document.querySelector('.v2-object[data-service="websites"]');
    var creativeObject = document.querySelector('.v2-object[data-service="creative"]');
    text(systemsObject && systemsObject.querySelector(".v2-object-label"), "Autopilot");
    text(websitesObject && websitesObject.querySelector(".v2-object-label"), "Website");
    text(creativeObject && creativeObject.querySelector(".v2-object-label"), "Creative add-on");
    var networkCore = systemsObject && systemsObject.querySelector(".v4-net-core b");
    if (networkCore) networkCore.innerHTML = "Business<br>Autopilot";

    // Make the explanation read from operations -> front door -> attention,
    // rather than opening with a video portfolio.
    var positioning = document.getElementById("positioning");
    if (positioning) {
      text(positioning.querySelector(".v2-lead"), "The lead is only the beginning.");
      var positioningBodies = positioning.querySelectorAll(".v2-body");
      if (positioningBodies[0]) positioningBodies[0].textContent = "A website can capture the enquiry. The real value comes from what happens in the next five minutes — and the next five steps.";
      if (positioningBodies[1]) positioningBodies[1].innerHTML = "<strong>We connect those handoffs so the business keeps moving instead of waiting on you.</strong>";
      var chain = positioning.querySelector(".v2-chain");
      if (chain) chain.innerHTML = "<span>Lead</span><i>→</i><span>Autopilot</span><i>→</i><span>Booking / Payment</span><i>→</i><span>Pipeline</span>";
    }

    // Reorder the selected-work chapters so the operating system is shown
    // before websites and creative. The original nodes are moved, not cloned.
    var workShell = document.querySelector("#work .shell");
    if (workShell) {
      var workItems = Array.prototype.slice.call(workShell.querySelectorAll(":scope > .v2-work"));
      function itemByLabel(needle) {
        return workItems.find(function (item) {
          var label = item.querySelector(".v2-work-num");
          return label && label.textContent.toLowerCase().indexOf(needle) !== -1;
        });
      }
      var systemsWork = itemByLabel("systems");
      var websitesWork = itemByLabel("websites");
      var creativeWork = itemByLabel("creative");
      if (systemsWork && websitesWork && creativeWork) {
        var disclosure = workShell.querySelector(".v2-disclosure");
        [systemsWork, websitesWork, creativeWork].forEach(function (item) {
          workShell.insertBefore(item, disclosure || null);
        });
        text(systemsWork.querySelector(".v2-work-num"), "01 / Business Autopilot");
        text(websitesWork.querySelector(".v2-work-num"), "02 / Website");
        text(creativeWork.querySelector(".v2-work-num"), "03 / Creative add-on");

        var sysTitle = systemsWork.querySelector(".v2-work-title");
        var sysBody = systemsWork.querySelector(".v4-sys-body");
        text(sysTitle, "Routine lead handling should not wait for you.");
        text(sysBody, "We map the real customer handoff — capture the enquiry, qualify and route it, trigger the right follow-up, move it toward booking or payment, and keep the pipeline organized. Human approval stays where the business actually needs judgment.");
      }
    }

    // The homepage Systems chapter uses the flagship 16:9 Revenue Pilots film.
    var systemFilm = document.querySelector(".rp-system-video video");
    if (systemFilm) {
      var systemFilmUrl = "https://d2ol7oe51mr4n9.cloudfront.net/user_3IQOKnTRxX22rPLfhCEsOdVJxTl/b25280d1-f2c0-44cc-a207-59022bb2f6a1.mp4";
      if (systemFilm.getAttribute("src") !== systemFilmUrl) {
        systemFilm.setAttribute("src", systemFilmUrl);
        systemFilm.setAttribute("aria-label", "Revenue Pilots flagship film showing website intake, agents, booking and pipeline working as one connected business system. Silent video.");
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
    show(q ? q[1] : "systems");
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
