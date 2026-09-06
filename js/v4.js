/* =========================================================================
   REVENUE PILOTS — V4 behaviour
   Navbar ink underline · portfolio carousel · pricing configurator.
   Vanilla, CSP-safe (script-src 'self'), no dependencies.
   ========================================================================= */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else { fn(); }
  }

  /* ---------------------------------------------------------------------
     NAVBAR — gold ink underline that glides between items
     --------------------------------------------------------------------- */
  function initNav() {
    var nav = document.querySelector(".nav-desktop");
    if (!nav) return;
    var links = Array.prototype.slice.call(nav.querySelectorAll("a"));
    if (!links.length) return;

    var ink = document.createElement("span");
    ink.className = "v4-nav-ink";
    ink.setAttribute("aria-hidden", "true");
    ink.innerHTML =
      '<svg viewBox="0 0 100 9" preserveAspectRatio="none">' +
      '<path d="M1 6.2 C 18 2.4, 34 7.6, 52 4.6 S 84 2.2, 99 5.4"/></svg>';
    nav.appendChild(ink);

    var current = null;
    function moveTo(el) {
      if (!el) { ink.classList.remove("is-on"); return; }
      ink.style.width = el.offsetWidth + "px";
      ink.style.transform = "translateX(" + el.offsetLeft + "px)";
      ink.classList.add("is-on");
      if (current !== el) {
        // re-run the draw-on so it reads as hand-drawn each time
        var p = ink.querySelector("path");
        p.style.animation = "none";
        void p.offsetWidth;
        p.style.animation = "";
        current = el;
      }
    }

    // which section is in view drives the resting position
    var sectionFor = {};
    links.forEach(function (a) {
      var href = a.getAttribute("href") || "";
      if (href.charAt(0) === "#" && href.length > 1) {
        var sec = document.getElementById(href.slice(1));
        if (sec) sectionFor[href] = { link: a, el: sec };
      }
    });

    var active = null;
    function syncActive() {
      var best = null, bestTop = -Infinity;
      var probe = window.innerHeight * 0.34;
      for (var k in sectionFor) {
        var r = sectionFor[k].el.getBoundingClientRect();
        if (r.top <= probe && r.top > bestTop) { bestTop = r.top; best = sectionFor[k].link; }
      }
      if (best !== active) {
        links.forEach(function (a) { a.classList.toggle("is-active", a === best); });
        active = best;
      }
      if (!hovering) moveTo(active);
    }

    var hovering = false;
    links.forEach(function (a) {
      a.addEventListener("mouseenter", function () { hovering = true; moveTo(a); });
      a.addEventListener("focus", function () { hovering = true; moveTo(a); });
      a.addEventListener("mouseleave", function () { hovering = false; moveTo(active); });
      a.addEventListener("blur", function () { hovering = false; moveTo(active); });
    });

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () { ticking = false; syncActive(); });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", function () { moveTo(hovering ? current : active); }, { passive: true });
    syncActive();
  }

  /* ---------------------------------------------------------------------
     CAROUSEL — N slides, 3 visible on desktop, step 1, infinite.
     Wrapping is done by cloning the head/tail and silently rebasing after
     each transition, so 7...1 reads as one continuous move rather than a
     rewind.
     --------------------------------------------------------------------- */
  function initCarousel() {
    var root = document.querySelector(".v4-carousel");
    if (!root) return;
    var track = root.querySelector(".v4-track");
    var mask = root.querySelector(".v4-track-mask");
    if (!track || !mask) return;

    var real = Array.prototype.slice.call(track.children);
    var count = real.length;
    if (!count) return;

    function perView() {
      var w = window.innerWidth;
      return w <= 760 ? 1 : (w <= 1080 ? 2 : 3);
    }

    // clone a full window on each side so wrapping never shows a gap
    var pad = 3;
    for (var i = 0; i < pad; i++) {
      var head = real[i % count].cloneNode(true);
      head.setAttribute("aria-hidden", "true");
      head.classList.add("is-clone");
      track.appendChild(head);
      var tail = real[(count - 1 - (i % count) + count) % count].cloneNode(true);
      tail.setAttribute("aria-hidden", "true");
      tail.classList.add("is-clone");
      track.insertBefore(tail, track.firstChild);
    }

    var index = pad;           // logical position within the padded list
    var slides = Array.prototype.slice.call(track.children);

    function slideStep() {
      var a = slides[0].getBoundingClientRect();
      var b = slides[1] ? slides[1].getBoundingClientRect() : a;
      return (b.left - a.left) || a.width;
    }

    function place(animate) {
      track.classList.toggle("is-animating", !!animate && !reduce);
      track.style.transform = "translate3d(" + (-index * slideStep()) + "px,0,0)";
      updateDots();
    }

    function normalise() {
      // silently rebase once we've drifted into the clone zone
      if (index >= count + pad) { index -= count; }
      else if (index < pad) { index += count; }
      else { return; }
      track.classList.remove("is-animating");
      track.style.transform = "translate3d(" + (-index * slideStep()) + "px,0,0)";
    }
    track.addEventListener("transitionend", function (e) {
      if (e.propertyName === "transform") normalise();
    });

    function go(delta) {
      index += delta;
      place(true);
      if (reduce) normalise();
      restartAuto();
    }

    var dotsWrap = root.querySelector(".v4-dots");
    var dots = [];
    if (dotsWrap) {
      for (var d = 0; d < count; d++) {
        (function (n) {
          var b = document.createElement("button");
          b.type = "button";
          b.className = "v4-dot";
          b.setAttribute("aria-label", "Go to item " + (n + 1));
          b.addEventListener("click", function () {
            index = n + pad; place(true); restartAuto();
          });
          dotsWrap.appendChild(b);
          dots.push(b);
        })(d);
      }
    }
    function updateDots() {
      if (!dots.length) return;
      var logical = ((index - pad) % count + count) % count;
      dots.forEach(function (b, n) { b.setAttribute("aria-current", String(n === logical)); });
    }

    var prev = root.querySelector("[data-carousel-prev]");
    var next = root.querySelector("[data-carousel-next]");
    if (prev) prev.addEventListener("click", function () { go(-1); });
    if (next) next.addEventListener("click", function () { go(1); });

    /* ---- pointer drag + touch swipe ---- */
    var dragging = false, startX = 0, startT = 0, moved = 0;
    function currentTranslate() {
      var m = /translate3d\((-?[\d.]+)px/.exec(track.style.transform || "");
      return m ? parseFloat(m[1]) : 0;
    }
    mask.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true; moved = 0;
      startX = e.clientX;
      startT = currentTranslate();
      track.classList.add("is-dragging");
      track.classList.remove("is-animating");
      mask.setPointerCapture(e.pointerId);
      pauseAuto();
    });
    mask.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      moved = e.clientX - startX;
      track.style.transform = "translate3d(" + (startT + moved) + "px,0,0)";
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false;
      track.classList.remove("is-dragging");
      var step = slideStep();
      // one intentional gesture settles exactly one card
      if (Math.abs(moved) > step * 0.18) index += (moved < 0 ? 1 : -1);
      place(true);
      if (reduce) normalise();
      restartAuto();
    }
    mask.addEventListener("pointerup", endDrag);
    mask.addEventListener("pointercancel", endDrag);
    mask.addEventListener("dragstart", function (e) { e.preventDefault(); });

    /* ---- trackpad horizontal scroll (Mac two-finger) ---- */
    var wheelLock = false;
    mask.addEventListener("wheel", function (e) {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;  // let vertical scroll pass
      e.preventDefault();
      if (wheelLock) return;
      if (Math.abs(e.deltaX) < 12) return;
      wheelLock = true;
      go(e.deltaX > 0 ? 1 : -1);
      setTimeout(function () { wheelLock = false; }, 420);
    }, { passive: false });

    /* ---- auto-advance every 30s, paused on hover/interaction ---- */
    var timer = null;
    function startAuto() {
      if (reduce || timer) return;
      timer = setInterval(function () { index += 1; place(true); }, 30000);
    }
    function pauseAuto() { if (timer) { clearInterval(timer); timer = null; } }
    function restartAuto() { pauseAuto(); startAuto(); }
    root.addEventListener("mouseenter", pauseAuto);
    root.addEventListener("mouseleave", startAuto);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) pauseAuto(); else startAuto();
    });

    window.addEventListener("resize", function () { place(false); }, { passive: true });
    place(false);
    startAuto();

    /* ---- autoplay each clip (muted, looping) while its card is visible
       inside the carousel mask; click still lets a visitor pause/resume
       one manually. Matches the hero and Packages preview, which already
       autoplay -- a static poster here read as broken, not restrained. */
    var slideVideos = Array.prototype.slice.call(track.querySelectorAll(".v4-slide video"));
    if (slideVideos.length) {
      var visIo = "IntersectionObserver" in window
        ? new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
              var v = en.target;
              if (en.isIntersecting) {
                if (!reduce && v.paused && !v.dataset.userPaused) v.play().catch(function () {});
              } else {
                v.pause();
              }
            });
          }, { root: mask, threshold: .4 })
        : null;
      slideVideos.forEach(function (v) {
        if (visIo) visIo.observe(v);
        else if (!reduce) v.play().catch(function () {});
      });
      document.addEventListener("visibilitychange", function () {
        if (document.visibilityState !== "visible" || reduce) return;
        slideVideos.forEach(function (v) {
          if (!v.paused || v.dataset.userPaused) return;
          var r = v.getBoundingClientRect();
          var mr = mask.getBoundingClientRect();
          if (r.right > mr.left && r.left < mr.right) v.play().catch(function () {});
        });
      });
    }
    Array.prototype.forEach.call(track.querySelectorAll(".v4-slide"), function (s) {
      var v = s.querySelector("video");
      if (!v) return;
      s.addEventListener("click", function () {
        if (Math.abs(moved) > 6) return;           // that was a drag, not a click
        if (v.paused) { delete v.dataset.userPaused; v.play().catch(function () {}); }
        else { v.dataset.userPaused = "1"; v.pause(); }
      });
    });
  }

  /* ---------------------------------------------------------------------
     PACKAGES CONFIGURATOR
     Three real, pre-rendered panes (Creative / Websites / Systems) swap
     visibility. Content — including the live Stripe Video Creative button —
     lives in the HTML from first paint, so the one-time [data-plan] wiring
     in main.js always finds it; this only ever toggles `hidden` + a fade.
     --------------------------------------------------------------------- */
  function initPricing() {
    var root = document.querySelector(".v4-config");
    if (!root) return;
    var tabs = Array.prototype.slice.call(root.querySelectorAll(".v4-ptab"));
    var pill = root.querySelector(".v4-tab-pill");
    var panes = {};
    Array.prototype.forEach.call(root.querySelectorAll("[data-pkg-pane]"), function (p) {
      panes[p.getAttribute("data-pkg-pane")] = p;
    });
    if (!tabs.length || !Object.keys(panes).length) return;

    function movePill(btn) {
      if (!pill) return;
      pill.style.width = btn.offsetWidth + "px";
      pill.style.transform = "translateX(" + (btn.offsetLeft - 5) + "px)";
    }

    function pauseVideos(pane) {
      Array.prototype.forEach.call(pane.querySelectorAll("video"), function (v) { v.pause(); });
    }
    function playVideos(pane) {
      if (reduce) return;
      Array.prototype.forEach.call(pane.querySelectorAll("video"), function (v) {
        v.play().catch(function () {});
      });
    }

    var currentKey = null;
    function select(key, instant) {
      var pane = panes[key];
      if (!pane || key === currentKey) return;
      var outgoing = panes[currentKey];
      currentKey = key;

      tabs.forEach(function (t) {
        var on = t.getAttribute("data-package") === key;
        t.setAttribute("aria-selected", String(on));
        if (on) movePill(t);
      });

      function swap() {
        Object.keys(panes).forEach(function (k) {
          var p = panes[k];
          if (k === key) {
            p.hidden = false;
            p.classList.add("is-active");
            p.classList.remove("is-out");
            playVideos(p);
          } else {
            p.hidden = true;
            p.classList.remove("is-active");
            pauseVideos(p);
          }
        });
      }

      if (instant || reduce || !outgoing) { swap(); return; }
      outgoing.classList.add("is-out");
      setTimeout(swap, 150);
    }

    tabs.forEach(function (t) {
      t.addEventListener("click", function () { select(t.getAttribute("data-package")); });
    });
    window.addEventListener("resize", function () {
      var on = root.querySelector('.v4-ptab[aria-selected="true"]');
      if (on) movePill(on);
    }, { passive: true });

    // Same real-world failure as the hero: a backgrounded tab pauses this
    // pane's video and the browser never resumes it on its own.
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState !== "visible") return;
      var pane = panes[currentKey];
      if (pane) playVideos(pane);
    });

    select("creative", true);
  }

  /* ---------------------------------------------------------------------
     Hero background: use an owner-supplied clip when one is wired in.
     --------------------------------------------------------------------- */
  function initBackground() {
    var bg = document.querySelector(".v4-bg");
    if (!bg) return;
    var v = bg.querySelector(".v4-bg-video");
    if (!v || reduce) return;
    if (!v.getAttribute("src") && !v.querySelector("source")) return; // no clip wired -> keep the SVG lines
    bg.classList.add("has-video");
    v.play().catch(function () { bg.classList.remove("has-video"); });
    v.addEventListener("error", function () { bg.classList.remove("has-video"); });
  }

  /* ---------------------------------------------------------------------
     Hero creative: the showreel loops inside the media panel, but a
     visitor who asked for reduced motion gets the poster frame instead.
     --------------------------------------------------------------------- */
  function initHeroCreative() {
    if (!reduce) return;
    var v = document.querySelector('.v2-media-panel video');
    if (!v) return;
    v.removeAttribute("autoplay");
    v.removeAttribute("loop");
    v.autoplay = false;
    v.loop = false;
    try { v.pause(); v.currentTime = 0; } catch (e) { /* ignore */ }
    v.load();                                 // fall back to the poster frame
  }

  ready(function () {
    initNav();
    initCarousel();
    initPricing();
    initBackground();
    initHeroCreative();
  });
})();