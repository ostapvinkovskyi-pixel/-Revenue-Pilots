/* =========================================================================
   REVENUE PILOTS — final showcase pass.
   Loaded after hero-switcher.js / v4.js. Owns three things only:
   1. the hero "Revenue Engine" ambient canvas + pointer-tilt
   2. mounting every .rp-altura-mount (with lazy-load for the below-fold one)
   3. a small magnetic/shine cursor response on gold CTAs
   Nothing here touches nav, checkout, the lead form or pricing.
   ========================================================================= */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else { fn(); }
  }

  function reduceMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  function coarsePointer() {
    return window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  }

  /* ---------- 1. hero Revenue Engine ambient canvas + pointer tilt ---------- */
  function initEngine() {
    var hero = document.querySelector(".v2-hero");
    var stage = document.querySelector(".v2-stage");
    if (!hero || !stage) return;

    var canvas = document.createElement("canvas");
    canvas.className = "v2-engine-canvas";
    canvas.setAttribute("aria-hidden", "true");
    stage.insertBefore(canvas, stage.firstChild);
    var ctx = canvas.getContext("2d");

    var w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var particles = [];
    var t = 0, raf = null, running = false;

    function size() {
      var r = stage.getBoundingClientRect();
      w = Math.max(1, r.width);
      h = Math.max(1, r.height);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = coarsePointer() ? 36 : 90;
      particles = [];
      for (var i = 0; i < count; i++) {
        var ang = Math.random() * Math.PI * 2;
        var rad = (.26 + Math.random() * .76);
        particles.push({
          ang: ang,
          rad: rad,
          speed: (Math.random() * .0006 + .00018) * (Math.random() < .5 ? 1 : -1),
          r: Math.random() * 1.9 + .6,
          a: Math.random() * .6 + .3
        });
      }
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      var cx = w / 2, cy = h / 2;
      var baseR = Math.min(w, h) * .46;

      ctx.save();
      ctx.strokeStyle = "rgba(197,154,60,.16)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, cy, baseR * 1.24, baseR * .82, t * .04, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(197,154,60,.1)";
      ctx.beginPath();
      ctx.ellipse(cx, cy, baseR * 1.5, baseR * 1.0, -t * .03, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(197,154,60,.06)";
      ctx.beginPath();
      ctx.ellipse(cx, cy, baseR * 1.78, baseR * 1.2, t * .02, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.ang += p.speed;
        var x = cx + Math.cos(p.ang) * baseR * p.rad * 1.3;
        var y = cy + Math.sin(p.ang) * baseR * p.rad * .78;
        ctx.beginPath();
        ctx.arc(x, y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(226,189,100," + (p.a * (.6 + .4 * Math.sin(t * 1.6 + i))) + ")";
        ctx.fill();
      }

      t += .01;
      if (running) raf = requestAnimationFrame(frame);
    }

    var engineInView = true;
    function stopEngine() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    }
    function startEngine() {
      if (reduceMotion() || running || !engineInView || document.visibilityState === "hidden") return;
      running = true;
      raf = requestAnimationFrame(frame);
    }
    function syncEngine() {
      if (!engineInView || document.visibilityState === "hidden") stopEngine();
      else startEngine();
    }

    size();
    frame();
    startEngine();

    if (typeof ResizeObserver !== "undefined") {
      new ResizeObserver(size).observe(stage);
    } else {
      window.addEventListener("resize", size);
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        engineInView = !!(entries[0] && entries[0].isIntersecting);
        syncEngine();
      }, { rootMargin: "120px", threshold: .01 }).observe(stage);
    }
    document.addEventListener("visibilitychange", syncEngine);

    /* pointer parallax: --tiltx/--tilty on .v2-stage, read by the featured
       hero object and by every .v4-net-3d instance inside it. */
    if (!coarsePointer() && !reduceMotion()) {
      var target = { x: 0, y: 0 };
      var cur = { x: 0, y: 0 };
      var tiltRaf = null;

      function onMove(e) {
        var r = hero.getBoundingClientRect();
        var px = ((e.clientX - r.left) / r.width - .5) * 2;
        var py = ((e.clientY - r.top) / r.height - .5) * 2;
        target.x = px * 5;
        target.y = py * -5;
      }
      function onLeave() { target.x = 0; target.y = 0; }

      function tiltFrame() {
        cur.x += (target.x - cur.x) * .12;
        cur.y += (target.y - cur.y) * .12;
        stage.style.setProperty("--tiltx", cur.y.toFixed(2) + "deg");
        stage.style.setProperty("--tilty", cur.x.toFixed(2) + "deg");
        if (Math.abs(target.x - cur.x) > .02 || Math.abs(target.y - cur.y) > .02) {
          tiltRaf = requestAnimationFrame(tiltFrame);
        } else {
          tiltRaf = null;
        }
      }
      function scheduleTilt() {
        if (!tiltRaf) tiltRaf = requestAnimationFrame(tiltFrame);
      }

      hero.addEventListener("mousemove", function (e) { onMove(e); scheduleTilt(); });
      hero.addEventListener("mouseleave", function () { onLeave(); scheduleTilt(); });
    }
  }

  /* ---------- 2. mount every ALTURA instance ---------- */
  function initAltura() {
    if (!window.RPAltura) return;
    var mounts = Array.prototype.slice.call(document.querySelectorAll(".rp-altura-mount"));
    mounts.forEach(function (el) {
      var opts = {
        size: el.getAttribute("data-altura-size") || "lg",
        canvas: el.getAttribute("data-altura-canvas") !== "false",
        interactive: el.getAttribute("data-altura-interactive") === "true"
      };
      function mountOne() {
        var ctl = window.RPAltura.mount(el, opts);
        var heroObject = el.closest && el.closest(".v2-object");
        if (!ctl || !heroObject || typeof MutationObserver === "undefined") return;

        /* Only the featured hero Website state needs its own live canvas.
           Side-state previews remain visually present but do not burn an
           additional animation loop. */
        function syncHeroState() {
          if (heroObject.classList.contains("is-featured")) ctl.resume();
          else ctl.pause();
        }
        new MutationObserver(syncHeroState).observe(heroObject, { attributes:true, attributeFilter:["class"] });
        syncHeroState();
      }
      if (el.getAttribute("data-altura-lazy") === "true" && "IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) {
              mountOne();
              io.disconnect();
            }
          });
        }, { rootMargin: "200px" });
        io.observe(el);
      } else {
        mountOne();
      }
    });
  }

  /* ---------- 3. selected-work Revenue System pointer tilt ---------- */
  function initNetworkTilt() {
    if (coarsePointer() || reduceMotion()) return;
    Array.prototype.forEach.call(document.querySelectorAll(".v4-net-lg"), function (net) {
      if (net.closest(".v2-stage")) return;
      var targetX = 0, targetY = 0, curX = 0, curY = 0, raf = null;
      function tick() {
        curX += (targetX - curX) * .14;
        curY += (targetY - curY) * .14;
        net.style.setProperty("--tiltx", curY.toFixed(2) + "deg");
        net.style.setProperty("--tilty", curX.toFixed(2) + "deg");
        if (Math.abs(targetX - curX) > .02 || Math.abs(targetY - curY) > .02) raf = requestAnimationFrame(tick);
        else raf = null;
      }
      function schedule() { if (!raf) raf = requestAnimationFrame(tick); }
      net.addEventListener("mousemove", function (e) {
        var r = net.getBoundingClientRect();
        targetX = (((e.clientX - r.left) / r.width) - .5) * 8;
        targetY = ((((e.clientY - r.top) / r.height) - .5) * -8);
        schedule();
      });
      net.addEventListener("mouseleave", function () { targetX = 0; targetY = 0; schedule(); });
    });
  }

  /* ---------- 4. CTA magnetic shine ---------- */
  function initCtaShine() {
    if (coarsePointer()) return;
    Array.prototype.forEach.call(document.querySelectorAll(".btn-gold, .v4-shiny"), function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        btn.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
        btn.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
      });
    });
  }

  ready(function () {
    initEngine();
    initAltura();
    initNetworkTilt();
    initCtaShine();
  });
})();
