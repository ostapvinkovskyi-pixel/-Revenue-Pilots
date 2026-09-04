/* =========================================================================
   REVENUE ENGINE — 2.5D hero stage.

   Supplied photoreal plates composited in a CSS 3D space. This file does
   positioning, perspective, camera movement, parallax, scale, focus and
   scroll choreography. It does not draw hardware, and it loads no 3D
   library -- there is no WebGL here at all.

   Scroll drives one progress value `t` (0..1) across the hero's own
   range, moving a single camera transform through five compositions:
   Overview / Video / Websites / Systems / Full Build. At the tail of that
   range the stage fades to zero and is released, and the page continues
   as a normal opaque document. The engine is a bounded set-piece, not a
   background behind the rest of the site.

   Progressive enhancement: this only takes over when prefers-reduced-motion
   is off. Otherwise css/engine-intro.css's default (static stacked
   chapters, no stage) stands.
   ========================================================================= */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else { fn(); }
  }

  function clamp01(v){ return v < 0 ? 0 : v > 1 ? 1 : v; }
  function smooth(v){ v = clamp01(v); return v*v*(3-2*v); }
  function lerp(a,b,t){ return a + (b-a)*t; }

  var CHAPTER_WINDOWS = [0, 0.125, 0.375, 0.625, 0.875, 1.0001];

  /* Screen quads, measured off the supplied module PNGs in their own pixel
     space (TL, TR, BR, BL). The module wrappers are sized to those same
     natural dimensions, so these map 1:1 regardless of how the module is
     later scaled or moved by the camera. */
  var QUADS = {
    vidL: { w:540, h:960,  q:[[157,226],[490,226],[597,1007],[241,1007]] },
    vidC: { w:540, h:960,  q:[[632,381],[970,381],[960,909],[618,909]] },
    vidR: { w:540, h:960,  q:[[1084,279],[1384,331],[1304,924],[1013,918]] },
    web:  { w:1280,h:800,  q:[[181,104],[1448,104],[1415,938],[214,938]] }
  };

  /* Camera keyframes in scene units. x/y pan the scene, zoom multiplies the
     fitted scale, focus names the parallax depth held sharp.

     Parallax is explicit 2D rather than CSS perspective + translateZ: with
     real perspective, each layer's *position* also projects toward the
     perspective origin, so placing a module where you want it becomes a
     fight against the projection. Flat plates only need differential
     movement, and this way position stays exactly where it is authored --
     and it costs nothing on mobile, where 3D transforms are the expensive
     part. */
  var KEYS = [
    { t:0.00, x:   0, y:   0, zoom:1.00, focus:0.70 },
    { t:0.25, x:-344, y: 103, zoom:1.55, focus:1.28 },
    { t:0.50, x: 672, y:-100, zoom:1.42, focus:0.90 },
    { t:0.75, x:-712, y:-249, zoom:1.34, focus:0.95 },
    { t:0.92, x:   0, y: -70, zoom:1.00, focus:0.60 },
    { t:1.00, x:   0, y:-110, zoom:0.96, focus:0.60 }
  ];

  /* Per-layer parallax rate. 1.0 tracks the camera exactly (the hub, our
     pivot); lower is further away, higher is nearer the viewer. */
  var PARALLAX = {
    "engine-world":   0.42,
    "engine-mod-web": 0.90,
    "engine-mod-sys": 0.95,
    // the monogram is mounted ON the hub, which lives in the world plate --
    // it must travel at the plate's rate or it slides off the disc
    "engine-logo":    0.42,
    "engine-mod-vid": 1.28
  };

  // Solve an 8x8 linear system by Gaussian elimination with partial pivoting.
  function solve8(A, b) {
    var n = 8, i, j, k;
    for (i = 0; i < n; i++) A[i].push(b[i]);
    for (i = 0; i < n; i++) {
      var piv = i;
      for (j = i+1; j < n; j++) if (Math.abs(A[j][i]) > Math.abs(A[piv][i])) piv = j;
      var tmp = A[i]; A[i] = A[piv]; A[piv] = tmp;
      var d = A[i][i];
      if (!d) return null;
      for (j = i; j <= n; j++) A[i][j] /= d;
      for (j = 0; j < n; j++) {
        if (j === i) continue;
        var f = A[j][i];
        if (!f) continue;
        for (k = i; k <= n; k++) A[j][k] -= f * A[i][k];
      }
    }
    var out = [];
    for (i = 0; i < n; i++) out.push(A[i][n]);
    return out;
  }

  /* Projective map from the element's own (0,0)-(w,h) box onto an arbitrary
     four-corner quad. Exact for a planar surface, and free at runtime --
     the browser composites it on the GPU, and because the screen is a child
     of the module it inherits every camera transform automatically. */
  function quadMatrix(w, h, q) {
    var s = [[0,0],[w,0],[w,h],[0,h]], A = [], b = [], i;
    for (i = 0; i < 4; i++) {
      var sx = s[i][0], sy = s[i][1], dx = q[i][0], dy = q[i][1];
      A.push([sx, sy, 1, 0, 0, 0, -sx*dx, -sy*dx]); b.push(dx);
      A.push([0, 0, 0, sx, sy, 1, -sx*dy, -sy*dy]); b.push(dy);
    }
    var x = solve8(A, b);
    if (!x) return "none";
    return "matrix3d(" + [
      x[0], x[3], 0, x[6],
      x[1], x[4], 0, x[7],
      0,    0,    1, 0,
      x[2], x[5], 0, 1
    ].join(",") + ")";
  }

  ready(function () {
    var section = document.getElementById("engine-intro");
    var stage = document.getElementById("engineStage");
    var scene = document.getElementById("engineScene");
    var scrollHint = document.getElementById("engineScrollHint");
    var chapterEls = Array.prototype.slice.call(document.querySelectorAll(".engine-chapter"));
    if (!section || !stage || !scene || !chapterEls.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("transform" in document.body.style) && !("webkitTransform" in document.body.style)) return;

    var isMobile = window.matchMedia("(max-width: 760px)").matches;
    document.documentElement.classList.add("engine-25d");
    if (isMobile) document.documentElement.classList.add("engine-25d-mobile");

    if (/[?&]engine_t=/.test(location.search)) {
      chapterEls.forEach(function (el) { el.style.transition = "none"; });
    }

    // map each screen image onto its measured quad, once
    Array.prototype.forEach.call(document.querySelectorAll(".mod-screen"), function (el) {
      var spec = QUADS[el.getAttribute("data-quad")];
      if (!spec) return;
      el.style.width = spec.w + "px";
      el.style.height = spec.h + "px";
      el.style.transform = quadMatrix(spec.w, spec.h, spec.q);
    });

    var layers = Array.prototype.slice.call(scene.querySelectorAll(".engine-layer"));
    layers.forEach(function (el) {
      var rate = 1;
      for (var cls in PARALLAX) {
        if (el.classList.contains(cls)) { rate = PARALLAX[cls]; break; }
      }
      el.__rate = rate;
      el.__scale = parseFloat(getComputedStyle(el).getPropertyValue("--scale")) || 1;
    });

    function sampleKeys(t) {
      var i = 0;
      while (i < KEYS.length - 2 && t > KEYS[i+1].t) i++;
      var a = KEYS[i], b = KEYS[i+1];
      var span = b.t - a.t;
      var k = smooth(span ? (t - a.t) / span : 0);
      var r = {
        x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k),
        zoom: lerp(a.zoom, b.zoom, k), focus: lerp(a.focus, b.focus, k)
      };
      /* A 1.91:1 plate inside a portrait viewport is already a tight crop
         before any chapter zoom, so mobile travels less and zooms less --
         otherwise each chapter pushes past the edges of the artwork. */
      if (isMobile) {
        r.x *= 0.58; r.y *= 0.58;
        r.zoom = 1 + (r.zoom - 1) * 0.45;
      }
      return r;
    }

    var currentChapter = -1;
    function setChapter(i) {
      if (i === currentChapter) return;
      currentChapter = i;
      chapterEls.forEach(function (el, idx) { el.classList.toggle("is-active", idx === i); });
    }
    function chapterFor(t) {
      for (var i = 0; i < CHAPTER_WINDOWS.length - 1; i++) {
        if (t < CHAPTER_WINDOWS[i+1]) return i;
      }
      return CHAPTER_WINDOWS.length - 2;
    }

    var released = false;
    var FADE_FROM = 0.94;   // Full Build has landed by 0.92; release right after

    function setT(t) {
      t = clamp01(t);
      var c = sampleKeys(t);
      scene.style.scale = (fitScale * c.zoom).toFixed(4);

      for (var i = 0; i < layers.length; i++) {
        var el = layers[i];
        var r = el.__rate;
        el.style.transform =
          "translate(" + (c.x * r).toFixed(2) + "px," + (c.y * r).toFixed(2) + "px)" +
          (el.__scale !== 1 ? " scale(" + el.__scale + ")" : "");
        if (!isMobile) {
          var blur = Math.min(3.4, Math.abs(r - c.focus) * 3.2);
          el.style.filter = blur > 0.4 ? "blur(" + blur.toFixed(2) + "px)" : "";
        }
      }

      setChapter(chapterFor(t));
      if (scrollHint) scrollHint.classList.toggle("is-hidden", t > 0.02);

      // Bounded set-piece: fade the whole stage out at the tail, then let the
      // page continue as a normal opaque document.
      var fade = t <= FADE_FROM ? 1 : 1 - smooth((t - FADE_FROM) / (1 - FADE_FROM));
      stage.style.opacity = String(fade);
    }

    function release(on) {
      if (on === released) return;
      released = on;
      stage.classList.toggle("is-released", on);
    }

    /* QA-only: ?engine_t=N pins the composition for deterministic capture.
       It has to win over the scroll handler, which would otherwise recompute
       t from the real scroll offset on the next frame and undo it. */
    var pinned = null;

    var ticking = false;
    function update() {
      ticking = false;
      var rect = section.getBoundingClientRect();
      var range = section.offsetHeight - window.innerHeight;
      var t = pinned !== null ? pinned : (range > 0 ? clamp01(-rect.top / range) : 0);
      // stage only exists while the hero is on screen
      release(pinned === null && (rect.bottom <= 0 || rect.top >= window.innerHeight));
      if (!released) setT(t);
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    /* Fit the scene to the viewport: cover, plus a little overscan so the
       camera has somewhere to pan without exposing an edge. */
    var fitScale = 1;
    function fit() {
      var vw = window.innerWidth, vh = window.innerHeight;
      if (!(vw > 0) || !(vh > 0)) return;
      // Cover the viewport at Overview, plus a little overscan so panning
      // never exposes an edge of the plate. Chapter zoom multiplies this.
      fitScale = Math.max(vw / 2400, vh / 1255) * 1.08;
      onScroll();
    }
    fit();
    if ("ResizeObserver" in window) {
      new ResizeObserver(function () { fit(); }).observe(stage);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", fit, { passive: true });

    var qa = /[?&]engine_t=([\d.]+)/.exec(location.search);
    if (qa) pinned = clamp01(parseFloat(qa[1]));
    update();

    /* QA-only: ?engine_scroll=N scrolls N viewport-heights past the top of
       the hero once layout has settled, so a capture tool can land in the
       released state. A plain #anchor can't: the browser resolves it before
       this script grows the hero to its scroll height. Inert without the
       query string. */
    var qs = /[?&]engine_scroll=([\d.]+)/.exec(location.search);
    if (qs) {
      var vh = parseFloat(qs[1]);
      setTimeout(function () {
        window.scrollTo(0, section.offsetTop + section.offsetHeight + vh * window.innerHeight);
        update();
      }, 60);
    }
  });
})();
