/* =========================================================================
   REVENUE PILOTS — shared "ORVYN" fictional premium demo component.

   One implementation, mounted at four sizes (full / lg / sm / xs) so the
   same original demo identity appears consistently in the standalone demo
   page, the Selected Work showcase, the hero Websites state and the
   Packages mini preview. ORVYN is an invented, clearly fictional operations
   platform built only to demonstrate composition quality -- no real brand,
   no real metrics.

   Internal identifiers (window.RPAltura, the "rp-altura-*" CSS classes, the
   /demo/altura/ route) intentionally keep their original technical name --
   only the user-visible wordmark and copy changed. New "orv-*" classes were
   added for the dimensional "Operations Core" focal object and its four
   interaction states (workflows / intelligence / analytics / control).
   ========================================================================= */
(function () {
  "use strict";

  var COPY = {
    mark: "ORVYN",
    badge: "Automation Layer / 01",
    h1a: "The operating layer",
    h1b: "for modern teams.",
    sub: "Capture work. Route decisions. Keep every handoff moving.",
    cta1: "Explore the platform",
    cta2: "See it in motion",
    nav: ["Platform", "Solutions", "Pricing", "Resources"],
    navCta: "Book a demo",
    states: [
      { key: "workflows", label: "Workflows", note: "Capture → Route → Execute" },
      { key: "intelligence", label: "Intelligence", note: "Signals converge in real time" },
      { key: "analytics", label: "Analytics", note: "Every handoff, instrumented" },
      { key: "control", label: "Control", note: "One locked, current system state" }
    ],
    hudTop: "SIGNAL — STABLE",
    hudBottom: "NODE.04 ACTIVE"
  };

  var SPARKLE_PATH = "M12 2.6C12.55 2.6 12.88 3.15 13.08 4.7c.62 4.7 1.52 5.6 6.22 6.22 1.55.2 2.1.53 2.1 1.08s-.55.88-2.1 1.08c-4.7.62-5.6 1.52-6.22 6.22-.2 1.55-.53 2.1-1.08 2.1s-.88-.55-1.08-2.1c-.62-4.7-1.52-5.6-6.22-6.22C3.15 12.88 2.6 12.55 2.6 12s.55-.88 2.1-1.08c4.7-.62 5.6-1.52 6.22-6.22C11.12 3.15 11.45 2.6 12 2.6Z";

  function reduceMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  function coarsePointer() {
    return window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  }

  /* ---------- markup ---------- */

  /* The Operations Core: a layered industrial machine, not an orbital
     diagram. Background mass plate -> fin stack -> chassis (with a cut
     aperture exposing the lit internal core) -> brushed strut -> foreground
     armour shell -> indicator LEDs, each on its own translateZ plane so the
     parts genuinely occlude and parallax against each other. */
  function buildCore(showHud) {
    var fins = "";
    for (var f = 0; f < 6; f++) fins += "<i></i>";
    var leds = "<i></i><i></i><i></i>";

    var html = '<div class="orv-stage" aria-hidden="true">' +
      '<div class="orv-grid"></div>' +
      '<canvas class="rp-altura-canvas orv-fx" aria-hidden="true"></canvas>' +
      '<div class="orv-core">' +
        '<div class="orv-core-3d">' +
          '<span class="orv-back"></span>' +
          '<span class="orv-fins">' + fins + '</span>' +
          '<span class="orv-chassis">' +
            '<span class="orv-vent"></span>' +
            '<span class="orv-slot"><span class="orv-core-glow"></span></span>' +
          '</span>' +
          '<span class="orv-strut"></span>' +
          '<span class="orv-shell"></span>' +
          '<span class="orv-leds">' + leds + '</span>' +
        '</div>' +
      '</div>';
    if (showHud) {
      html += '<span class="orv-hud orv-hud-tl">' + COPY.hudTop + '</span>' +
              '<span class="orv-hud orv-hud-br">' + COPY.hudBottom + '</span>';
    }
    html += "</div>";
    return html;
  }

  function buildDom(root, opts) {
    var showLinks = opts.size === "full" || opts.size === "lg";
    var showSub = opts.size === "full" || opts.size === "sm";
    var showCtas = opts.size === "full" || opts.size === "lg";
    var showStates = opts.size === "full" || opts.size === "lg";
    var showHud = opts.size === "full" || opts.size === "lg";
    var showCore = true; /* keep the silhouette even at the smallest size */

    var html = "";
    html += '<div class="rp-altura-veil" aria-hidden="true"></div>';
    if (showCore) html += buildCore(showHud);
    html += '<div class="rp-altura-nav" aria-hidden="true">' +
              '<span class="rp-altura-mark">' + COPY.mark + '</span>';
    if (showLinks) {
      html += '<span class="rp-altura-links">' +
        COPY.nav.map(function (l) { return "<i>" + l + "</i>"; }).join("") +
        "</span>";
    }
    html += '<span class="rp-altura-navcta">' + COPY.navCta + "</span></div>";

    html += '<div class="rp-altura-hero" aria-hidden="true">' +
              '<span class="rp-altura-badge">' +
                '<svg class="rp-altura-spark" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="' + SPARKLE_PATH + '"/></svg>' +
                '<span>' + COPY.badge + '</span>' +
              '</span>' +
              '<h1 class="rp-altura-h1">' +
                '<span class="rp-altura-line"><span>' + COPY.h1a + '</span></span>' +
                '<span class="rp-altura-line"><span>' + COPY.h1b + '</span></span>' +
              '</h1>';
    if (showSub) html += '<p class="rp-altura-sub">' + COPY.sub + "</p>";
    if (showCtas) {
      html += '<div class="rp-altura-ctas">' +
                '<span class="rp-altura-cta-1">' + COPY.cta1 + "</span>" +
                '<span class="rp-altura-cta-2">' + COPY.cta2 + "</span>" +
              "</div>";
    }
    if (showStates) {
      /* This whole mockup is exposed to assistive tech as one decorative
         image (role="img" on the mount root, aria-hidden through this
         subtree), so a real <button> here would be a focusable control an
         AT user could tab to but never hear announced. tabindex="-1" keeps
         it out of the tab order while staying fully mouse/touch-clickable
         for a sighted visitor exploring the demo. */
      html += '<div class="orv-states" aria-hidden="true">' +
        COPY.states.map(function (s, i) {
          return '<button type="button" tabindex="-1" class="orv-state" data-orv-key="' + s.key + '"' + (i === 0 ? ' data-orv-active="true"' : '') + '>' + s.label + '</button>';
        }).join("") +
        '<span class="orv-state-note"></span>' +
      "</div>";
    }
    html += "</div>";

    root.innerHTML = html;
  }

  /* ---------- Operations Core: state machine + pointer tilt ---------- */

  function initCore(root, opts) {
    var stage = root.querySelector(".orv-stage");
    if (!stage) return null;
    var core3d = root.querySelector(".orv-core-3d");
    var tabs = Array.prototype.slice.call(root.querySelectorAll(".orv-state"));
    var note = root.querySelector(".orv-state-note");
    var keys = COPY.states.map(function (s) { return s.key; });
    var idx = 0;
    var cycleTimer = null;
    var cycling = !opts.interactive || opts.size !== "full";

    function applyState(key, viaUser) {
      idx = keys.indexOf(key);
      if (idx < 0) idx = 0;
      root.setAttribute("data-orv-state", key);
      tabs.forEach(function (t) {
        var active = t.getAttribute("data-orv-key") === key;
        if (active) t.setAttribute("data-orv-active", "true"); else t.removeAttribute("data-orv-active");
      });
      if (note) {
        var st = COPY.states[idx];
        note.textContent = st ? st.note : "";
      }
      if (viaUser) { cycling = false; stopCycle(); }
    }

    function next() { applyState(keys[(idx + 1) % keys.length]); }

    function startCycle() {
      if (!cycling || reduceMotion() || cycleTimer) return;
      cycleTimer = setInterval(next, 3600);
    }
    function stopCycle() {
      if (cycleTimer) { clearInterval(cycleTimer); cycleTimer = null; }
    }

    tabs.forEach(function (t) {
      t.addEventListener("click", function () { applyState(t.getAttribute("data-orv-key"), true); });
    });

    applyState(keys[0]);
    if (!reduceMotion()) startCycle();

    /* restrained pointer tilt on the core only -- clamped, no wild spin */
    var tiltRaf = null;
    if (!coarsePointer() && !reduceMotion()) {
      var targetX = 0, targetY = 0, curX = 0, curY = 0;
      function tick() {
        curX += (targetX - curX) * .1;
        curY += (targetY - curY) * .1;
        if (core3d) core3d.style.setProperty("--orv-tiltx", curY.toFixed(2) + "deg");
        if (core3d) core3d.style.setProperty("--orv-tilty", curX.toFixed(2) + "deg");
        if (Math.abs(targetX - curX) > .03 || Math.abs(targetY - curY) > .03) {
          tiltRaf = requestAnimationFrame(tick);
        } else { tiltRaf = null; }
      }
      function schedule() { if (!tiltRaf) tiltRaf = requestAnimationFrame(tick); }
      root.addEventListener("mousemove", function (e) {
        var r = stage.getBoundingClientRect();
        targetX = (((e.clientX - r.left) / r.width) - .5) * 7;
        targetY = ((((e.clientY - r.top) / r.height) - .5) * -7);
        schedule();
      });
      root.addEventListener("mouseleave", function () { targetX = 0; targetY = 0; schedule(); });
    }

    return {
      pause: stopCycle,
      resume: startCycle,
      destroy: function () { stopCycle(); if (tiltRaf) cancelAnimationFrame(tiltRaf); }
    };
  }

  /* ---------- ambient dust + route-line / telemetry canvas ---------- */

  function startCanvas(root, opts) {
    var canvas = root.querySelector(".orv-fx");
    if (!canvas) return null;
    var ctx = canvas.getContext("2d");
    var w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var t = 0;
    var raf = null;
    var running = false;
    var dust = [];

    function size() {
      var r = root.getBoundingClientRect();
      w = Math.max(1, r.width);
      h = Math.max(1, r.height);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = opts.size === "full" ? 46 : opts.size === "lg" ? 30 : 16;
      dust = [];
      for (var i = 0; i < count; i++) {
        dust.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.3 + .3,
          a: Math.random() * .45 + .15,
          s: Math.random() * .25 + .05
        });
      }
    }

    function coreCenter() {
      var core = root.querySelector(".orv-core");
      if (!core) return { x: w * .5, y: h * .5 };
      var cr = core.getBoundingClientRect();
      var rr = root.getBoundingClientRect();
      return { x: cr.left - rr.left + cr.width / 2, y: cr.top - rr.top + cr.height / 2 };
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      var c = coreCenter();
      var state = root.getAttribute("data-orv-state");

      /* thin route lines from the HUD corners toward the core */
      ctx.save();
      ctx.strokeStyle = state === "workflows" ? "rgba(226,189,100,.28)" : "rgba(255,255,255,.09)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(w * .06, h * .12); ctx.lineTo(c.x, c.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * .94, h * .88); ctx.lineTo(c.x, c.y); ctx.stroke();
      ctx.restore();

      for (var i = 0; i < dust.length; i++) {
        var d = dust[i];
        if (state === "intelligence") {
          d.x += (c.x - d.x) * .006;
          d.y += (c.y - d.y) * .006;
          if (Math.hypot(c.x - d.x, c.y - d.y) < 18) { d.x = Math.random() * w; d.y = Math.random() * h; }
        } else {
          d.y -= d.s;
          if (d.y < -4) d.y = h + 4;
        }
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255," + (d.a * (.6 + .4 * Math.sin(t * 2 + i))) + ")";
        ctx.fill();
      }

      if (state === "analytics") {
        ctx.save();
        ctx.strokeStyle = "rgba(180,220,255,.35)";
        ctx.lineWidth = 1;
        for (var k = 0; k < 5; k++) {
          var tx = w * .1 + (w * .8) * (k / 4);
          var th = 6 + ((k * 37 + Math.floor(t * 10)) % 14);
          ctx.beginPath(); ctx.moveTo(tx, h * .94); ctx.lineTo(tx, h * .94 - th); ctx.stroke();
        }
        ctx.restore();
      }

      t += .0032;
      if (running) raf = requestAnimationFrame(frame);
    }

    size();
    frame();
    if (!reduceMotion()) { running = true; raf = requestAnimationFrame(frame); }

    var ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(size) : null;
    if (ro) ro.observe(root);
    else window.addEventListener("resize", size);

    return {
      pause: function () { running = false; if (raf) cancelAnimationFrame(raf); },
      resume: function () {
        if (running || reduceMotion()) return;
        running = true;
        raf = requestAnimationFrame(frame);
      },
      destroy: function () {
        running = false;
        if (raf) cancelAnimationFrame(raf);
        if (ro) ro.disconnect();
      }
    };
  }

  function mount(root, options) {
    if (!root || root.getAttribute("data-altura-mounted")) return null;
    var opts = {
      size: options && options.size || "lg",
      canvas: !options || options.canvas !== false,
      interactive: !!(options && options.interactive)
    };
    root.setAttribute("data-altura-mounted", "true");
    root.classList.add("rp-altura", "rp-altura-" + opts.size);
    buildDom(root, opts);

    var entrance = null;
    if ("IntersectionObserver" in window) {
      entrance = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) root.classList.add("is-in");
        });
      }, { threshold: .25 });
      entrance.observe(root);
    } else {
      root.classList.add("is-in");
    }

    var coreCtl = initCore(root, opts);
    var canvasCtl = opts.canvas ? startCanvas(root, opts) : null;

    /* Keep the ambient canvas + state cycle alive only while this particular
       demo is near the viewport. The homepage can contain more than one
       ORVYN mount, so allowing every hidden/offscreen instance to keep
       animating forever wastes work. */
    var motionIo = null;
    var nearViewport = true;
    function syncMotion() {
      var active = document.visibilityState !== "hidden" && nearViewport;
      if (canvasCtl) { if (active) canvasCtl.resume(); else canvasCtl.pause(); }
      if (coreCtl) { if (active) coreCtl.resume(); else coreCtl.pause(); }
    }
    if ("IntersectionObserver" in window) {
      motionIo = new IntersectionObserver(function (entries) {
        nearViewport = !!(entries[0] && entries[0].isIntersecting);
        syncMotion();
      }, { rootMargin: "120px", threshold: .01 });
      motionIo.observe(root);
    }
    function onVisibility() { syncMotion(); }
    document.addEventListener("visibilitychange", onVisibility);

    return {
      pause: function () { if (canvasCtl) canvasCtl.pause(); if (coreCtl) coreCtl.pause(); },
      resume: function () {
        if (!nearViewport || document.visibilityState === "hidden") return;
        if (canvasCtl) canvasCtl.resume();
        if (coreCtl) coreCtl.resume();
      },
      destroy: function () {
        if (canvasCtl) canvasCtl.destroy();
        if (coreCtl) coreCtl.destroy();
        if (entrance) entrance.disconnect();
        if (motionIo) motionIo.disconnect();
        document.removeEventListener("visibilitychange", onVisibility);
      }
    };
  }

  window.RPAltura = { mount: mount };
})();
