/* =========================================================================
   REVENUE ENGINE — hero state machine.
   Isolated from js/main.js on purpose: this module can be removed without
   touching nav, reveal, checkout or the lead form.

   Desktop: native scroll only (no preventDefault, no wheel capture). The
   hero section is a tall (~200vh) block with a position:sticky inner panel;
   scroll position is READ (never driven) to pick which of 4 states is
   current, the same rAF-throttled-scroll-listener pattern already used by
   the portfolio carousel and the #how beam canvas in js/main.js.

   Mobile (<=760px) and prefers-reduced-motion: no scroll linkage at all.
   Mobile uses tap (dots) or swipe; reduced-motion renders one static state.
   ========================================================================= */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  var STATES = [
    { label: "Video Creative", copy: "Short-form ads that earn attention." },
    { label: "Websites", copy: "A site that turns interest into action." },
    { label: "Systems", copy: "Captures the lead and follows up automatically." },
    { label: "Full Build", copy: "Website, systems and creative — working together." }
  ];

  ready(function () {
    var section = document.getElementById("engine-hero");
    var scene = document.getElementById("engineScene");
    if (!section || !scene) return;

    var stateLabel = document.getElementById("engineState");
    var stateNum = document.getElementById("engineStateNum");
    var stateText = document.getElementById("engineStateText");
    var dots = Array.prototype.slice.call(document.querySelectorAll(".engine-dot"));
    var panels = [
      scene.querySelector(".engine-panel-video"),
      scene.querySelector(".engine-panel-website"),
      scene.querySelector(".engine-panel-systems")
    ];
    var connectors = Array.prototype.slice.call(scene.querySelectorAll(".engine-connector"));

    var ACTIVE_PANELS_FOR_STATE = { "-1": [], "0": [0], "1": [1], "2": [2], "3": [0, 1, 2] };

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var currentState = -2; // force the first setState call to actually apply

    function setState(i) {
      if (i === currentState) return;
      currentState = i;
      scene.setAttribute("data-state", String(i));

      var activeSet = ACTIVE_PANELS_FOR_STATE[String(i)] || [];
      panels.forEach(function (panel, idx) {
        if (!panel) return;
        panel.classList.toggle("is-active", activeSet.indexOf(idx) !== -1);
      });
      connectors.forEach(function (c, idx) {
        c.classList.toggle("is-active", activeSet.indexOf(idx) !== -1);
      });

      if (i >= 0 && STATES[i]) {
        stateLabel.hidden = false;
        stateNum.textContent = "0" + (i + 1);
        stateText.textContent = STATES[i].label + " — " + STATES[i].copy;
      } else {
        stateLabel.hidden = true;
      }

      dots.forEach(function (dot, idx) {
        dot.setAttribute("aria-selected", idx === i ? "true" : "false");
      });
    }

    /* -------------------------------------------------------------------
       Reduced motion: one static, informative frame. No listeners.
       ------------------------------------------------------------------- */
    if (reduceMotion) {
      setState(0);
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          setState(parseInt(dot.getAttribute("data-goto"), 10));
        });
      });
      return;
    }

    /* -------------------------------------------------------------------
       Mobile: tap dots or swipe the scene. No scroll linkage, no pin.
       ------------------------------------------------------------------- */
    function setupMobile() {
      setState(0);

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          setState(parseInt(dot.getAttribute("data-goto"), 10));
        });
      });

      var startX = null;
      scene.addEventListener("touchstart", function (e) {
        startX = e.touches[0].clientX;
      }, { passive: true });
      scene.addEventListener("touchend", function (e) {
        if (startX === null) return;
        var dx = e.changedTouches[0].clientX - startX;
        startX = null;
        if (Math.abs(dx) < 40) return;
        var next = Math.max(0, Math.min(STATES.length - 1, currentState + (dx < 0 ? 1 : -1)));
        setState(next);
      }, { passive: true });
    }

    /* -------------------------------------------------------------------
       Desktop: read scroll position, never drive it.
       First ~10% of the pinned range is a calm "overview" beat (state -1,
       no label). The remaining ~90% splits evenly across the 4 states.
       A CSS variable carries a small continuous platform rotation
       (0 -> 18deg across the whole range) on top of the discrete state
       swaps, so the settle between states reads as one continuous piece
       of motion rather than four separate scenes.
       ------------------------------------------------------------------- */
    function setupDesktop() {
      var OVERVIEW_FRACTION = 0.10;
      var ticking = false;

      function pinnedRange() {
        return section.offsetHeight - window.innerHeight;
      }

      function update() {
        ticking = false;
        var range = pinnedRange();
        if (range <= 0) { setState(0); return; }

        var scrolledIntoPin = -section.getBoundingClientRect().top;
        var progress = Math.max(0, Math.min(1, scrolledIntoPin / range));

        scene.style.setProperty("--engine-rotate", (progress * 18).toFixed(2) + "deg");

        if (progress < OVERVIEW_FRACTION) {
          setState(-1);
        } else {
          var p2 = (progress - OVERVIEW_FRACTION) / (1 - OVERVIEW_FRACTION);
          var band = Math.min(STATES.length - 1, Math.floor(p2 * STATES.length));
          setState(band);
        }
      }

      function onScroll() {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(update);
      }

      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          var i = parseInt(dot.getAttribute("data-goto"), 10);
          var range = pinnedRange();
          if (range <= 0) { setState(i); return; }
          var targetProgress = OVERVIEW_FRACTION + ((i + 0.5) / STATES.length) * (1 - OVERVIEW_FRACTION);
          var rect = section.getBoundingClientRect();
          var targetY = window.scrollY + rect.top + targetProgress * range;
          window.scrollTo({ top: targetY, behavior: "smooth" });
        });
      });

      update();
    }

    if (window.matchMedia("(max-width: 760px)").matches) {
      setupMobile();
    } else {
      setupDesktop();
    }
  });
})();
