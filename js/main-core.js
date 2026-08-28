/* =========================================================================
   REVENUE PILOTS — site behaviour
   No dependencies. No secrets. All external URLs come from config/site-config.js
   ========================================================================= */
(function () {
  "use strict";

  var cfg = window.RP_CONFIG || {};

  /* ---------------------------------------------------------------------
     Config helpers
     A value counts as configured only if it is a real http(s) URL that no
     longer contains an "__ADD_..." placeholder token.
     --------------------------------------------------------------------- */
  function isConfigured(value) {
    return (
      typeof value === "string" &&
      value.length > 0 &&
      value.indexOf("__ADD_") === -1 &&
      (/^https?:\/\//i.test(value) || /^\//.test(value))
    );
  }

  var PLAN_KEYS = {
    starter: "STRIPE_STARTER_URL",
    growth: "STRIPE_GROWTH_URL",
    weekly: "STRIPE_WEEKLY_URL"
  };
  var PLAN_LABELS = {
    starter: "Starter ($249)",
    growth: "Growth ($499)",
    weekly: "Weekly Ad Engine ($999/mo)"
  };

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  ready(function () {

    /* -------------------------------------------------------------------
       Footer year
       ------------------------------------------------------------------- */
    var yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    /* -------------------------------------------------------------------
       Sticky header state
       ------------------------------------------------------------------- */
    var header = document.getElementById("siteHeader");
    if (header) {
      var setStuck = function () {
        header.classList.toggle("is-stuck", window.scrollY > 8);
      };
      setStuck();
      window.addEventListener("scroll", setStuck, { passive: true });
    }

    /* -------------------------------------------------------------------
       Mobile navigation
       ------------------------------------------------------------------- */
    var navToggle = document.getElementById("navToggle");
    var navMobile = document.getElementById("navMobile");

    if (navToggle && navMobile) {
      var closeNav = function () {
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open menu");
        navMobile.classList.remove("is-open");
        navMobile.hidden = true;
      };
      var openNav = function () {
        navToggle.setAttribute("aria-expanded", "true");
        navToggle.setAttribute("aria-label", "Close menu");
        navMobile.hidden = false;
        navMobile.classList.add("is-open");
      };

      navToggle.addEventListener("click", function () {
        var expanded = navToggle.getAttribute("aria-expanded") === "true";
        if (expanded) closeNav(); else openNav();
      });

      navMobile.addEventListener("click", function (e) {
        if (e.target.closest("a")) closeNav();
      });

      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
          closeNav();
          navToggle.focus();
        }
      });

      // Close the panel if the viewport grows into the desktop nav
      window.matchMedia("(min-width: 1024px)").addEventListener("change", function (ev) {
        if (ev.matches) closeNav();
      });
    }

    /* -------------------------------------------------------------------
       Scroll reveal
       ------------------------------------------------------------------- */
    var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    } else {
      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });

      revealEls.forEach(function (el) { revealObserver.observe(el); });
    }

    /* -------------------------------------------------------------------
       Portfolio videos
       Autoplay muted loops, paused when comfortably offscreen.
       Under prefers-reduced-motion nothing autoplays; each card gets a
       real play/pause control instead so the section still works.
       ------------------------------------------------------------------- */
    var videos = Array.prototype.slice.call(document.querySelectorAll(".work-video"));

    function safePlay(video) {
      var p = video.play();
      if (p && typeof p.catch === "function") {
        // Autoplay can be refused (power saving, browser policy). Not an error
        // we need to surface — the poster frame remains visible.
        p.catch(function () {});
      }
    }

    if (videos.length && reduceMotion) {
      videos.forEach(function (video) {
        video.removeAttribute("autoplay");
        video.pause();

        var toggle = video.closest(".video-frame").querySelector(".video-toggle");
        if (!toggle) return;
        toggle.hidden = false;
        toggle.addEventListener("click", function () {
          if (video.paused) {
            safePlay(video);
            toggle.textContent = "Pause";
          } else {
            video.pause();
            toggle.textContent = "Play";
          }
        });
        video.addEventListener("ended", function () { toggle.textContent = "Play"; });
      });
    }

    /* -------------------------------------------------------------------
       Portfolio carousel
       One horizontal track at every width, gesture-first and dependency-free.
       Touch swipe and Mac two-finger scroll come free from native
       overflow-x; this adds pointer drag, keyboard, a centre-card notion,
       and a gentle auto-advance on top of it.

       Playback is owned here rather than by a per-video observer: when the
       track scrolls, only the centre card plays. Five simultaneous video
       decodes is the kind of thing that makes a premium page feel cheap.
       When every card already fits on screen, they all play.
       ------------------------------------------------------------------- */
    (function initWorkCarousel() {
      var track = document.getElementById("workTrack");
      var grid = document.getElementById("workGrid");
      var rail = document.getElementById("workRail");
      if (!track || !grid) return;

      var cards = Array.prototype.slice.call(grid.querySelectorAll(".work-card"));
      if (!cards.length) return;

      var activeIndex = -1;
      var sectionVisible = true;
      var autoTimer = null;
      var resumeTimer = null;

      if (rail) {
        cards.forEach(function () { rail.appendChild(document.createElement("span")); });
      }
      var dots = rail ? Array.prototype.slice.call(rail.children) : [];

      function isScrollable() {
        return track.scrollWidth - track.clientWidth > 4;
      }

      /* Geometry via getBoundingClientRect rather than offsetLeft: the track
         is not a positioned ancestor, so offsetParent is not dependable. */
      function trackCentre() {
        var r = track.getBoundingClientRect();
        return r.left + r.width / 2;
      }

      /* The indicator has to agree with however the CSS is snapping, or it
         reads as wrong: desktop snaps cards to the start edge, the mobile
         carousel centres them. Ask the stylesheet rather than duplicating
         the breakpoint here. */
      function snapsToCentre() {
        return getComputedStyle(cards[0]).scrollSnapAlign.indexOf("center") !== -1;
      }

      function centreIndex() {
        var centred = snapsToCentre();
        var tr = track.getBoundingClientRect();
        var anchor = centred ? trackCentre() : tr.left + parseFloat(getComputedStyle(track).paddingLeft || 0);
        var best = 0;
        var bestDist = Infinity;
        for (var i = 0; i < cards.length; i++) {
          var r = cards[i].getBoundingClientRect();
          var point = centred ? r.left + r.width / 2 : r.left;
          var d = Math.abs(point - anchor);
          if (d < bestDist) { bestDist = d; best = i; }
        }
        return best;
      }

      function scrollToCard(i, behavior) {
        var card = cards[i];
        if (!card) return;
        var r = card.getBoundingClientRect();
        var tr = track.getBoundingClientRect();
        var delta = snapsToCentre()
          ? r.left + r.width / 2 - trackCentre()
          : r.left - (tr.left + parseFloat(getComputedStyle(track).paddingLeft || 0));
        if (track.scrollTo) {
          track.scrollTo({ left: track.scrollLeft + delta, behavior: behavior || "smooth" });
        } else {
          track.scrollLeft += delta;
        }
      }

      function syncPlayback() {
        if (reduceMotion) return;
        var playAll = !isScrollable();
        cards.forEach(function (card, n) {
          var video = card.querySelector(".work-video");
          if (!video) return;
          if (sectionVisible && (playAll || n === activeIndex)) {
            safePlay(video);
          } else if (!video.paused) {
            video.pause();
          }
        });
      }

      function setActive(i) {
        if (i === activeIndex) return;
        activeIndex = i;
        cards.forEach(function (card, n) { card.classList.toggle("is-active", n === i); });
        dots.forEach(function (dot, n) { dot.classList.toggle("is-on", n === i); });
        syncPlayback();
      }

      /* --- gentle auto-advance: pauses on any input, resumes when idle --- */
      function autoAllowed() {
        return !reduceMotion && sectionVisible && isScrollable();
      }

      function stopAuto() {
        if (autoTimer) { window.clearInterval(autoTimer); autoTimer = null; }
      }

      function startAuto() {
        stopAuto();
        if (!autoAllowed()) return;
        autoTimer = window.setInterval(function () {
          if (!autoAllowed()) { stopAuto(); return; }
          var next = activeIndex + 1;
          scrollToCard(next >= cards.length ? 0 : next);
        }, 5200);
      }

      function pauseAuto(resumeAfter) {
        stopAuto();
        if (resumeTimer) window.clearTimeout(resumeTimer);
        resumeTimer = window.setTimeout(startAuto, resumeAfter || 6000);
      }

      /* --- scroll tracking --- */
      var ticking = false;
      track.addEventListener("scroll", function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(function () {
          ticking = false;
          setActive(centreIndex());
        });
      }, { passive: true });

      /* --- pointer drag (mouse / pen); touch keeps native momentum --- */
      var dragging = false;
      var startX = 0;
      var startScroll = 0;
      var moved = 0;
      var pointerId = null;

      track.addEventListener("pointerdown", function (e) {
        if (e.pointerType === "touch" || e.button !== 0) return;
        dragging = true;
        moved = 0;
        startX = e.clientX;
        startScroll = track.scrollLeft;
        pointerId = e.pointerId;
        pauseAuto();
      });

      track.addEventListener("pointermove", function (e) {
        if (!dragging) return;
        var dx = e.clientX - startX;
        if (!track.classList.contains("is-dragging")) {
          // below the threshold this is still a click, not a drag
          if (Math.abs(dx) < 6) return;
          track.classList.add("is-dragging");
          if (track.setPointerCapture) {
            try { track.setPointerCapture(pointerId); } catch (err) {}
          }
        }
        moved = Math.abs(dx);
        track.scrollLeft = startScroll - dx;
        e.preventDefault();
      });

      function endDrag() {
        if (!dragging) return;
        dragging = false;
        if (track.classList.contains("is-dragging")) {
          track.classList.remove("is-dragging");
          if (track.releasePointerCapture && pointerId !== null) {
            try { track.releasePointerCapture(pointerId); } catch (err) {}
          }
          scrollToCard(centreIndex());
        }
        pointerId = null;
      }

      ["pointerup", "pointercancel", "pointerleave"].forEach(function (type) {
        track.addEventListener(type, endDrag);
      });

      // swallow the click that a drag would otherwise fire on release
      track.addEventListener("click", function (e) {
        if (moved > 6) {
          e.preventDefault();
          e.stopPropagation();
          moved = 0;
        }
      }, true);

      /* --- keyboard: the track is a focusable scroll region --- */
      track.addEventListener("keydown", function (e) {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        e.preventDefault();
        pauseAuto();
        var next = activeIndex + (e.key === "ArrowRight" ? 1 : -1);
        scrollToCard(Math.max(0, Math.min(cards.length - 1, next)));
      });

      ["wheel", "touchstart"].forEach(function (type) {
        track.addEventListener(type, function () { pauseAuto(); }, { passive: true });
      });
      track.addEventListener("mouseenter", stopAuto);
      track.addEventListener("mouseleave", function () { pauseAuto(1200); });
      track.addEventListener("focusin", stopAuto);

      /* --- pause everything while the section is off screen --- */
      if ("IntersectionObserver" in window) {
        var sectionObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            sectionVisible = entry.isIntersecting;
            syncPlayback();
            if (sectionVisible) { startAuto(); } else { stopAuto(); }
          });
        }, { rootMargin: "120px 0px", threshold: 0.15 });
        sectionObserver.observe(track);
      }

      var resizeTimer = null;
      window.addEventListener("resize", function () {
        if (resizeTimer) window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(function () {
          activeIndex = -1;            // widths changed; re-derive from scratch
          setActive(centreIndex());
          startAuto();
        }, 180);
      });

      setActive(centreIndex());
      syncPlayback();
      startAuto();
    })();

    /* -------------------------------------------------------------------
       "How it works" background beams
       A slow, low-opacity canvas wash behind the four steps — gold-toned to
       match the brand, not the site's accent-flooding rule. Skipped
       entirely under prefers-reduced-motion (the static CSS glow in
       .how-ambient carries the section on its own). Paused via
       IntersectionObserver when the section is off-screen.
       ------------------------------------------------------------------- */
    (function initHowBeams() {
      var canvas = document.getElementById("howBeams");
      var section = document.querySelector(".section-how");
      if (!canvas || !section || reduceMotion) return;

      var ctx = canvas.getContext("2d");
      if (!ctx) return;

      var GOLD_HUE_MIN = 36, GOLD_HUE_MAX = 46;
      var BEAM_COUNT = 11;

      var beams = [];
      var width = 0, height = 0, dpr = 1;
      var rafId = null;
      var running = false;
      var resizeTimer = null;

      function rand(min, max) { return min + Math.random() * (max - min); }

      function makeBeam(startAnywhere) {
        return {
          x: rand(-0.15, 1.15) * width,
          y: startAnywhere ? rand(-0.2, 1.2) * height : height + rand(60, 220),
          w: rand(70, 150),
          len: height * 2.1,
          angle: rand(-34, -24),
          speed: rand(0.10, 0.24),
          opacity: rand(0.08, 0.16),
          hue: rand(GOLD_HUE_MIN, GOLD_HUE_MAX),
          pulse: rand(0, Math.PI * 2),
          pulseSpeed: rand(0.006, 0.014)
        };
      }

      function resize() {
        var rect = section.getBoundingClientRect();
        width = Math.max(1, Math.round(rect.width));
        height = Math.max(1, Math.round(rect.height));
        dpr = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        beams = [];
        for (var i = 0; i < BEAM_COUNT; i++) beams.push(makeBeam(true));
      }

      function drawBeam(beam) {
        ctx.save();
        ctx.translate(beam.x, beam.y);
        ctx.rotate((beam.angle * Math.PI) / 180);

        var pulsing = beam.opacity * (0.82 + Math.sin(beam.pulse) * 0.18);
        var grad = ctx.createLinearGradient(0, 0, 0, -beam.len);
        grad.addColorStop(0, "hsla(" + beam.hue + ",62%,58%," + (pulsing * 0.55) + ")");
        grad.addColorStop(0.35, "hsla(" + beam.hue + ",62%,58%," + pulsing + ")");
        grad.addColorStop(0.65, "hsla(" + beam.hue + ",62%,58%," + pulsing + ")");
        grad.addColorStop(1, "hsla(" + beam.hue + ",62%,58%,0)");

        ctx.fillStyle = grad;
        ctx.fillRect(-beam.w / 2, -beam.len, beam.w, beam.len);
        ctx.restore();
      }

      function frame() {
        ctx.clearRect(0, 0, width, height);
        for (var i = 0; i < beams.length; i++) {
          var beam = beams[i];
          beam.y -= beam.speed;
          beam.pulse += beam.pulseSpeed;
          if (beam.y + beam.len < -80) beams[i] = makeBeam(false);
          drawBeam(beam);
        }
        rafId = requestAnimationFrame(frame);
      }

      function start() {
        if (running) return;
        running = true;
        rafId = requestAnimationFrame(frame);
      }
      function stop() {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
      }

      resize();

      window.addEventListener("resize", function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 180);
      });

      if ("IntersectionObserver" in window) {
        var howObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) start(); else stop();
          });
        }, { rootMargin: "150px 0px", threshold: 0.05 });
        howObserver.observe(section);
      } else {
        start();
      }
    })();

    /* -------------------------------------------------------------------
       Checkout buttons
       Each button maps to exactly one config URL. If that URL has not been
       filled in yet we show a clearly labelled development notice instead
       of navigating somewhere broken.
       ------------------------------------------------------------------- */
    var checkoutNotice = document.getElementById("checkoutNotice");

    // Stripe returns here after a successful hosted Checkout session.
    try {
      var checkoutParams = new URLSearchParams(window.location.search);
      if (checkoutParams.get("checkout") === "success" && checkoutNotice) {
        checkoutNotice.innerHTML =
          "<strong>Payment received.</strong> Your Revenue Pilots order is confirmed. " +
          "Check your email for the confirmation and next steps.";
        checkoutNotice.hidden = false;
      }
    } catch (e) {}

    function showCheckoutNotice(plan) {
      var key = PLAN_KEYS[plan];
      if (!checkoutNotice) {
        return;
      }
      checkoutNotice.innerHTML =
        "<strong>Checkout not connected yet &mdash; development build</strong>" +
        "The " + PLAN_LABELS[plan] + " button is wired and ready. Add the Stripe-hosted " +
        "checkout route to <code>" + key + "</code> in <code>config/site-config.js</code>.";
      checkoutNotice.hidden = false;

      // Bring the notice into view if the click came from elsewhere on the page
      var rect = checkoutNotice.getBoundingClientRect();
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        checkoutNotice.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "center"
        });
      }
    }

    Array.prototype.forEach.call(document.querySelectorAll("[data-plan]"), function (btn) {
      var plan = btn.getAttribute("data-plan");
      var key = PLAN_KEYS[plan];
      if (!key) return;

      var url = cfg[key];

      if (isConfigured(url)) {
        btn.addEventListener("click", function () {
          window.location.assign(url);
        });
      } else {
        btn.addEventListener("click", function () {
          showCheckoutNotice(plan);
        });
      }
    });

    /* -------------------------------------------------------------------
       Lead form
       ------------------------------------------------------------------- */
    var form = document.getElementById("leadForm");
    if (!form) return;

    var submitBtn = document.getElementById("leadSubmit");
    var statusEl = document.getElementById("formStatus");
    var isSubmitting = false;
    var hasSubmittedSuccessfully = false;

    var FIELD_ERRORS = {
      name: document.getElementById("err-name"),
      business_name: document.getElementById("err-business"),
      email: document.getElementById("err-email")
    };

    function setStatus(message, kind) {
      if (!statusEl) return;
      statusEl.innerHTML = message;
      statusEl.className = "form-status" + (kind ? " is-" + kind : "");
      statusEl.hidden = false;
    }

    function clearStatus() {
      if (!statusEl) return;
      statusEl.hidden = true;
      statusEl.innerHTML = "";
      statusEl.className = "form-status";
    }

    function setFieldError(name, message) {
      var errEl = FIELD_ERRORS[name];
      var input = form.elements[name];
      if (errEl) {
        if (message) {
          errEl.textContent = message;
          errEl.hidden = false;
        } else {
          errEl.textContent = "";
          errEl.hidden = true;
        }
      }
      if (input) {
        if (message) {
          input.setAttribute("aria-invalid", "true");
          if (errEl && errEl.id) input.setAttribute("aria-describedby", errEl.id);
        } else {
          input.removeAttribute("aria-invalid");
          input.removeAttribute("aria-describedby");
        }
      }
    }

    function clearAllFieldErrors() {
      Object.keys(FIELD_ERRORS).forEach(function (name) { setFieldError(name, ""); });
    }

    function isValidEmail(value) {
      // Deliberately permissive: reject the obviously-wrong, let the server decide the rest.
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
    }

    function validate() {
      clearAllFieldErrors();

      var firstInvalid = null;
      var name = form.elements.name.value.trim();
      var business = form.elements.business_name.value.trim();
      var email = form.elements.email.value.trim();

      if (!email) {
        setFieldError("email", "Enter your email address.");
        firstInvalid = form.elements.email;
      } else if (!isValidEmail(email)) {
        setFieldError("email", "Enter a valid email address.");
        firstInvalid = form.elements.email;
      }

      if (!business) {
        setFieldError("business_name", "Enter your business name.");
        firstInvalid = form.elements.business_name;
      }

      if (!name) {
        setFieldError("name", "Enter your name.");
        firstInvalid = form.elements.name;
      }

      if (firstInvalid) {
        firstInvalid.focus();
        return false;
      }
      return true;
    }

    // Clear a field's error as soon as the visitor starts fixing it
    ["name", "business_name", "email"].forEach(function (fieldName) {
      var input = form.elements[fieldName];
      if (!input) return;
      input.addEventListener("input", function () {
        if (input.getAttribute("aria-invalid") === "true") setFieldError(fieldName, "");
      });
    });

    function setBusy(busy) {
      isSubmitting = busy;
      if (!submitBtn) return;
      submitBtn.disabled = busy;
      submitBtn.setAttribute("aria-busy", busy ? "true" : "false");
      submitBtn.textContent = busy ? "Sending…" : "Send message";
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Guard against double submits and re-submits after success
      if (isSubmitting) return;
      if (hasSubmittedSuccessfully) return;

      // Honeypot: a bot filled the hidden field. Fail silently so it learns nothing.
      if (form.elements.company_url && form.elements.company_url.value.trim() !== "") {
        setStatus("Thanks — your message has been sent.", "success");
        return;
      }

      if (!validate()) {
        setStatus("Please correct the highlighted fields and try again.", "error");
        return;
      }

      var webhook = cfg.LEAD_WEBHOOK_URL;

      if (!isConfigured(webhook)) {
        setStatus(
          "<strong>Form not connected yet &mdash; development build.</strong> " +
          "The form validated correctly, but no lead destination is configured, so nothing was sent.",
          "error"
        );
        return;
      }

      var payload = {
        name: form.elements.name.value.trim(),
        business_name: form.elements.business_name.value.trim(),
        email: form.elements.email.value.trim(),
        phone: form.elements.phone.value.trim(),
        website: form.elements.website.value.trim(),
        service_area: form.elements.service_area.value.trim(),
        package_interest: form.elements.package_interest.value,
        message: form.elements.message.value.trim(),
        source: "revenue-pilots-website",
        page_url: window.location.href
      };

      setBusy(true);
      setStatus("Sending your message…", null);

      fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          // Success is a 2xx response and nothing less.
          if (!res.ok) {
            throw new Error("Request failed with status " + res.status);
          }
          hasSubmittedSuccessfully = true;
          setStatus(
            "<strong>Thanks — your message has been sent.</strong> " +
            "We'll reply to the email address you gave us.",
            "success"
          );
          form.reset();
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Message sent";
          }
        })
        .catch(function (err) {
          setStatus(
            "<strong>Your message could not be sent.</strong> " +
            "Please try again, or email us directly at " +
            "<a href=\"mailto:" + (cfg.CONTACT_EMAIL || "") + "\">" + (cfg.CONTACT_EMAIL || "") + "</a>.",
            "error"
          );
          if (window.console && console.warn) {
            console.warn("[Revenue Pilots] Lead submission failed:", err.message);
          }
        })
        .finally(function () {
          if (!hasSubmittedSuccessfully) setBusy(false);
          else isSubmitting = false;
        });
    });

    // If the visitor edits the form after a success, let them send a new enquiry
    form.addEventListener("input", function () {
      if (hasSubmittedSuccessfully) {
        hasSubmittedSuccessfully = false;
        clearStatus();
        setBusy(false);
      }
    });
  });
})();
