/* =========================================================================
   REVENUE PILOTS — autonomy-first homepage controller
   Preview branch only. No production/payment logic is changed here.
   ========================================================================= */
(function () {
  "use strict";

  var ORDER = ["systems", "websites", "creative"];
  var COPY = {
    systems: {
      name: "BUSINESS AUTOPILOT",
      promise: "A business that keeps moving after the lead comes in.",
      desc: "Connect enquiries, follow-up, booking, payment handoff and pipeline updates so routine work keeps moving and only real decisions come back to you.",
      price: "Autopilot Pilot — <strong>$500 one-time</strong>",
      cta: "Ask about the $500 pilot",
      checkout: "#contact"
    },
    websites: {
      name: "WEBSITES + INTAKE",
      promise: "Give every new lead a clear next step.",
      desc: "Premium websites built around enquiries, bookings and sales — with the intake path designed to connect cleanly into your operating system.",
      price: "Website Build — <strong>from $3,500</strong>",
      cta: "See the website demo",
      checkout: "#work"
    },
    creative: {
      name: "PROMOTION ADD-ON",
      promise: "Add attention after the engine is ready for it.",
      desc: "Short-form promotional creative is available as an add-on when you need more demand going into the same connected customer journey.",
      price: "Creative Sprint — <strong>$1,500 / 4 weeks</strong>",
      cta: "See promotion add-on",
      checkout: "#work"
    }
  };

  var POOL_DEMO = "https://charlotte-pool-company-private-demo.vercel.app/";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  function text(el, value) {
    if (el) el.textContent = value;
  }

  function injectStyle() {
    if (document.getElementById("rp-autonomy-style")) return;
    var style = document.createElement("style");
    style.id = "rp-autonomy-style";
    style.textContent = `
      :root{
        --bg:#050505;
        --surface:#0A0A0A;
        --surface-2:#101010;
        --surface-3:#080808;
        --text:#F6F4ED;
        --text-2:#B7B3AA;
        --text-3:#7D7A72;
        --line:rgba(255,255,255,.09);
        --line-2:rgba(255,255,255,.16);
        --gold:#E7BF38;
        --gold-hi:#FFD957;
        --gold-deep:#9A7612;
        --gold-tint:rgba(231,191,56,.10);
        --gold-tint-2:rgba(231,191,56,.24);
      }
      body{background:#050505;}
      .v4-bg-video{filter:saturate(.18) contrast(1.08) brightness(.44);}
      .site-header.is-stuck{background:rgba(5,5,5,.84);}
      .btn-gold{
        --btn-bg:linear-gradient(180deg,#FFE26F,#E7BF38);
        box-shadow:0 1px 0 rgba(255,255,255,.24) inset,0 14px 38px -18px rgba(231,191,56,.72);
      }
      .btn-gold:hover{--btn-bg:linear-gradient(180deg,#FFF09C,#FFD957);}
      .rp-autopilot-flow{margin:22px 0 0;display:flex;flex-wrap:wrap;gap:8px}
      .rp-autopilot-flow span{background:#0A0A0A;border-color:rgba(231,191,56,.25)}
      .rp-autopilot-section{padding-top:clamp(74px,9vw,120px);padding-bottom:clamp(74px,9vw,120px)}
      .rp-autopilot-head{max-width:830px;margin-bottom:38px}
      .rp-autopilot-grid{display:grid;grid-template-columns:.92fr 1.08fr;gap:clamp(24px,4vw,54px);align-items:stretch}
      .rp-autopilot-map,.rp-owner-view{
        border:1px solid var(--line);border-radius:22px;background:linear-gradient(180deg,#0D0D0D,#070707);
        box-shadow:0 24px 70px -42px rgba(0,0,0,.95);overflow:hidden
      }
      .rp-autopilot-map{padding:clamp(24px,3.5vw,42px)}
      .rp-autopilot-kicker{font-size:11px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:var(--gold-hi);margin-bottom:22px}
      .rp-flow-stack{display:grid;gap:12px}
      .rp-flow-step{display:grid;grid-template-columns:40px 1fr auto;align-items:center;gap:14px;padding:15px 16px;border:1px solid var(--line);border-radius:14px;background:#090909}
      .rp-flow-step b{font-size:15px}
      .rp-flow-step p{font-size:13px;color:var(--text-3);margin-top:2px}
      .rp-flow-n{width:34px;height:34px;display:grid;place-items:center;border-radius:50%;border:1px solid rgba(231,191,56,.3);color:var(--gold-hi);font-size:11px;font-weight:800}
      .rp-flow-auto{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#050505;background:var(--gold-hi);padding:6px 8px;border-radius:999px;font-weight:800}
      .rp-flow-human{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--text-2);border:1px solid var(--line-2);padding:6px 8px;border-radius:999px}
      .rp-owner-top{display:flex;align-items:center;justify-content:space-between;padding:15px 18px;border-bottom:1px solid var(--line);background:#0A0A0A}
      .rp-owner-brand{display:flex;align-items:center;gap:9px;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}
      .rp-owner-dot{width:8px;height:8px;border-radius:50%;background:var(--gold-hi);box-shadow:0 0 18px rgba(255,217,87,.55)}
      .rp-owner-live{font-size:10px;color:var(--text-3)}
      .rp-owner-body{padding:clamp(20px,3vw,32px)}
      .rp-owner-title{font-size:clamp(25px,3vw,38px);margin-bottom:8px}
      .rp-owner-sub{color:var(--text-2);font-size:14px;margin-bottom:24px}
      .rp-owner-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
      .rp-owner-card{border:1px solid var(--line);border-radius:14px;background:#090909;padding:15px}
      .rp-owner-card small{display:block;color:var(--text-3);font-size:9px;text-transform:uppercase;letter-spacing:.15em;margin-bottom:8px}
      .rp-owner-card strong{font-size:14px;display:block}
      .rp-owner-card span{display:block;color:var(--text-3);font-size:12px;margin-top:6px}
      .rp-owner-card.is-now{border-color:rgba(231,191,56,.38);background:linear-gradient(180deg,rgba(231,191,56,.08),#090909)}
      .rp-owner-row{margin-top:12px;border:1px solid var(--line);border-radius:14px;padding:15px;display:grid;grid-template-columns:1fr auto;gap:14px;align-items:center}
      .rp-owner-row b{font-size:14px}.rp-owner-row p{font-size:12px;color:var(--text-3);margin-top:4px}
      .rp-status{font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:var(--gold-hi)}
      .rp-live-demo{width:100%;min-height:600px;border:0;display:block;background:#091411}
      .rp-demo-frame{border:1px solid var(--line);border-radius:20px;overflow:hidden;background:#080808;box-shadow:0 30px 90px -54px rgba(0,0,0,.95)}
      .rp-demo-bar{display:flex;align-items:center;gap:7px;padding:11px 14px;border-bottom:1px solid var(--line);background:#0A0A0A;color:var(--text-3);font-size:11px}
      .rp-demo-bar i{width:7px;height:7px;border-radius:50%;background:#343434}
      .rp-demo-bar b{margin-left:7px;font-weight:600;color:var(--text-2)}
      .rp-demo-note{font-size:12px;color:var(--text-3);margin-top:12px}
      .rp-creative-condensed{margin-top:clamp(76px,10vw,126px);opacity:.94}
      .rp-creative-condensed .v4-track-mask{max-width:860px;margin-inline:auto}
      .rp-creative-condensed .v4-slide:nth-child(n+4){display:none}
      .rp-creative-intro{max-width:650px;color:var(--text-2);margin:14px 0 24px;font-size:15px}
      .rp-pilot-card{border-color:rgba(231,191,56,.34)!important;background:linear-gradient(180deg,rgba(231,191,56,.07),rgba(255,255,255,.015))!important}
      .rp-pilot-card .rp-simple-badge{color:var(--gold-hi)}
      .rp-pool-work .v4-flow-frame{border:0;background:transparent}
      .rp-pool-work .v4-flow-live{margin-top:14px}
      .rp-pool-work .rp-case-specs{margin-top:20px}
      .rp-pool-work .rp-case-specs span{background:#0A0A0A}
      @media(max-width:900px){
        .rp-autopilot-grid{grid-template-columns:1fr}
        .rp-owner-cards{grid-template-columns:1fr}
        .rp-live-demo{min-height:520px}
      }
      @media(max-width:620px){
        .rp-flow-step{grid-template-columns:34px 1fr}
        .rp-flow-auto,.rp-flow-human{grid-column:2;justify-self:start}
        .rp-live-demo{min-height:480px}
        .rp-demo-bar b{max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      }
    `;
    document.head.appendChild(style);
  }

  function buildAutopilotSection(positioning) {
    if (!positioning || document.getElementById("autopilot")) return;
    var section = document.createElement("section");
    section.className = "v2-section rp-autopilot-section";
    section.id = "autopilot";
    section.innerHTML = `
      <div class="shell">
        <div class="rp-autopilot-head">
          <p class="v2-eyebrow">Business Autopilot</p>
          <h2 class="v2-lead">The routine work keeps moving. You step in for judgment.</h2>
          <p class="v2-body">Autopilot is the operating layer behind the website. It connects the boring handoffs that usually live across an inbox, a calendar, a payment screen and a spreadsheet — then gives the owner one simple place to see what is happening.</p>
        </div>
        <div class="rp-autopilot-grid">
          <div class="rp-autopilot-map">
            <p class="rp-autopilot-kicker">One example customer journey</p>
            <div class="rp-flow-stack">
              <div class="rp-flow-step"><span class="rp-flow-n">01</span><div><b>Lead arrives</b><p>Website or form turns the enquiry into structured customer data.</p></div><span class="rp-flow-auto">Auto</span></div>
              <div class="rp-flow-step"><span class="rp-flow-n">02</span><div><b>Follow-up starts</b><p>The agreed response or next-step message can go out while the lead is still warm.</p></div><span class="rp-flow-auto">Auto</span></div>
              <div class="rp-flow-step"><span class="rp-flow-n">03</span><div><b>Booking / payment handoff</b><p>The customer is moved toward the next supported action instead of getting lost between tools.</p></div><span class="rp-flow-auto">Auto</span></div>
              <div class="rp-flow-step"><span class="rp-flow-n">04</span><div><b>Owner decision</b><p>Pricing exceptions, approvals and real judgment stay human.</p></div><span class="rp-flow-human">Human</span></div>
              <div class="rp-flow-step"><span class="rp-flow-n">05</span><div><b>Pipeline stays current</b><p>The record and status stay organized so the team knows what happens next.</p></div><span class="rp-flow-auto">Auto</span></div>
            </div>
          </div>
          <div class="rp-owner-view" aria-label="Example Revenue Pilots owner view">
            <div class="rp-owner-top"><div class="rp-owner-brand"><span class="rp-owner-dot"></span> Revenue Pilots Autopilot</div><span class="rp-owner-live">Owner View · interface preview</span></div>
            <div class="rp-owner-body">
              <h3 class="rp-owner-title">Know what the business is doing without chasing it.</h3>
              <p class="rp-owner-sub">A simple owner-facing view can show what is moving, what finished, and the few moments that actually need you.</p>
              <div class="rp-owner-cards">
                <div class="rp-owner-card is-now"><small>Working now</small><strong>New enquiry follow-up</strong><span>Next: booking handoff</span></div>
                <div class="rp-owner-card"><small>Done for you</small><strong>Lead captured</strong><span>Structured + recorded</span></div>
                <div class="rp-owner-card"><small>Needs you</small><strong>Approve custom quote</strong><span>Human decision</span></div>
              </div>
              <div class="rp-owner-row"><div><b>One operating picture</b><p>No GitHub, Make or technical plumbing exposed to the business owner.</p></div><span class="rp-status">Simple by design</span></div>
            </div>
          </div>
        </div>
      </div>`;
    var rule = document.createElement("hr");
    rule.className = "v2-rule";
    positioning.insertAdjacentElement("afterend", rule);
    rule.insertAdjacentElement("afterend", section);
  }

  function reworkPackages() {
    var packages = document.getElementById("packages");
    if (!packages) return;
    text(packages.querySelector(".v2-eyebrow"), "Start small or build the full system");
    text(packages.querySelector(".v2-lead"), "Start with the bottleneck that is costing you time.");

    var cards = packages.querySelectorAll(".rp-simple-card");
    if (cards[0]) {
      cards[0].classList.add("rp-pilot-card");
      text(cards[0].querySelector(".rp-simple-badge"), "Low-friction first step");
      text(cards[0].querySelector("h4"), "Autopilot Pilot");
      var price = cards[0].querySelector(".rp-simple-price");
      if (price) price.innerHTML = "$500 <span>one-time</span>";
      text(cards[0].querySelector(".rp-simple-one"), "We take one real repetitive workflow and make it move with less manual handling.");
      var lis = cards[0].querySelectorAll(".rp-simple-list li");
      if (lis[0]) lis[0].textContent = "One clearly defined workflow";
      if (lis[1]) lis[1].textContent = "Lead / follow-up / booking handoff where supported";
      if (lis[2]) lis[2].textContent = "Testing + owner-facing handoff";
      if (lis[3]) lis[3].textContent = "No subscription required for the pilot";
      var a = cards[0].querySelector("a");
      if (a) { a.textContent = "Talk about the $500 pilot"; a.setAttribute("href", "#contact"); }
      text(cards[0].querySelector(".rp-simple-note"), "Best when you want to prove one useful automation before a larger build.");
    }
    if (cards[1]) {
      text(cards[1].querySelector(".rp-simple-badge"), "Need a better front door");
      text(cards[1].querySelector("h4"), "Website + Intake");
      text(cards[1].querySelector(".rp-simple-one"), "A conversion-focused website built to hand new enquiries cleanly into the next step.");
    }
    if (cards[2]) {
      text(cards[2].querySelector(".rp-simple-badge"), "Website + operating system");
      text(cards[2].querySelector("h4"), "Full Autopilot Build");
      text(cards[2].querySelector(".rp-simple-one"), "The website, lead-handling workflow and launch layer designed as one connected customer journey.");
    }

    var secondary = packages.querySelector(".rp-simple-secondary");
    if (secondary && !secondary.querySelector(".rp-creative-mini")) {
      var mini = document.createElement("div");
      mini.className = "rp-simple-mini rp-creative-mini";
      mini.innerHTML = '<div><small>Need more attention too?</small><strong>Promotion / Creative — optional add-on</strong><p>Short-form ads and promotional creative stay available, but they are not the center of the system.</p></div><a href="#work">See examples →</a>';
      secondary.appendChild(mini);
    }

    var explain = packages.querySelector(".rp-simple-explain");
    if (explain) explain.innerHTML = "<strong>Simple rule:</strong> start with one workflow if you need proof. Build the website when the front door is weak. Build the full Autopilot when the handoffs behind the site are the real problem. Promotion is an add-on, not the foundation.";
  }

  function reworkProcess() {
    var how = document.getElementById("how");
    if (!how) return;
    text(how.querySelector(".v2-lead"), "How we install the operating layer.");
    var steps = how.querySelectorAll(".v2-step");
    var data = [
      ["01", "Map", "We find the repetitive handoff: where a lead, booking, payment or internal task currently waits on a person."],
      ["02", "Build", "We connect the agreed website, forms and supported tools around one clear workflow."],
      ["03", "Test", "We run the handoffs, failure cases and owner gates before anything important is trusted to automation."],
      ["04", "Operate", "Routine work moves automatically. The owner view surfaces completed work and the decisions that still need a human."]
    ];
    steps.forEach(function (step, i) {
      if (!data[i]) return;
      text(step.querySelector(".v2-step-num"), data[i][0]);
      text(step.querySelector("h3"), data[i][1]);
      text(step.querySelector("p:last-child"), data[i][2]);
    });
  }

  function reworkContactSelect() {
    var select = document.getElementById("lf-package");
    if (!select) return;
    var opts = Array.prototype.slice.call(select.options);
    opts.forEach(function (o) {
      if (o.value === "systems") o.textContent = "Autopilot Pilot / Revenue Systems";
      if (o.value === "website_build") o.textContent = "Website + Intake";
      if (o.value === "video_creative") o.textContent = "Promotion / Creative add-on";
      if (o.value === "full_build") o.textContent = "Full Autopilot Build";
    });
    var systems = select.querySelector('option[value="systems"]');
    var website = select.querySelector('option[value="website_build"]');
    var creative = select.querySelector('option[value="video_creative"]');
    var full = select.querySelector('option[value="full_build"]');
    var unsure = select.querySelector('option[value="not_sure"]');
    [systems, website, full, creative, unsure].forEach(function (o) { if (o) select.appendChild(o); });
  }

  ready(function () {
    injectStyle();

    var objects = Array.prototype.slice.call(document.querySelectorAll(".v2-object"));
    var tabs = Array.prototype.slice.call(document.querySelectorAll(".v2-tab"));
    var elName = document.getElementById("v2ServiceName");
    var elPromise = document.getElementById("v2Promise");
    var elDesc = document.getElementById("v2Desc");
    var elPrice = document.getElementById("v2Price");
    var elCta = document.getElementById("v2ServiceCta");

    var hero = document.querySelector(".v2-hero-copy");
    if (hero) {
      text(hero.querySelector(".v2-eyebrow"), "Business Autopilot · Websites · Promotion add-on");
      text(hero.querySelector(".v2-h1"), "Build a business that does not wait on you for every next step.");
      text(hero.querySelector(".v2-sub"), "Revenue Pilots builds the website and operating layer behind it: capture the enquiry, follow up, route the work, move customers toward booking or payment, and show you the few decisions that still need a human.");
      if (!hero.querySelector(".rp-autopilot-flow")) {
        var flow = document.createElement("div");
        flow.className = "rp-case-specs rp-autopilot-flow v2-entrance";
        flow.setAttribute("style", "--d:420ms");
        flow.setAttribute("aria-label", "Business Autopilot flow");
        flow.innerHTML = "<span>Lead</span><span>Follow-up</span><span>Booking</span><span>Payment</span><span>Pipeline</span>";
        var ctaWrap = hero.querySelector(".v2-hero-cta");
        if (ctaWrap && ctaWrap.parentNode) ctaWrap.parentNode.insertBefore(flow, ctaWrap.nextSibling);
      }
    }

    var headerCta = document.querySelector(".header-cta");
    if (headerCta) { headerCta.textContent = "Build My Autopilot"; headerCta.setAttribute("href", "#contact"); }

    var systemsTab = document.querySelector('.v2-tab[data-service="systems"]');
    var websitesTab = document.querySelector('.v2-tab[data-service="websites"]');
    var creativeTab = document.querySelector('.v2-tab[data-service="creative"]');
    text(systemsTab, "Autopilot");
    text(websitesTab, "Website");
    text(creativeTab, "Promotion add-on");

    var systemsObject = document.querySelector('.v2-object[data-service="systems"]');
    var websitesObject = document.querySelector('.v2-object[data-service="websites"]');
    var creativeObject = document.querySelector('.v2-object[data-service="creative"]');
    text(systemsObject && systemsObject.querySelector(".v2-object-label"), "Autopilot");
    text(websitesObject && websitesObject.querySelector(".v2-object-label"), "Website");
    text(creativeObject && creativeObject.querySelector(".v2-object-label"), "Promotion");
    var networkCore = systemsObject && systemsObject.querySelector(".v4-net-core b");
    if (networkCore) networkCore.innerHTML = "Business<br>Autopilot";

    var positioning = document.getElementById("positioning");
    if (positioning) {
      text(positioning.querySelector(".v2-lead"), "The website is the front door. Autopilot is what happens behind it.");
      var bodies = positioning.querySelectorAll(".v2-body");
      if (bodies[0]) bodies[0].textContent = "Most businesses already have enough tools. The problem is the gaps between them — the form, the inbox, the calendar, the payment and the spreadsheet.";
      if (bodies[1]) bodies[1].innerHTML = "<strong>We design one connected path so routine handoffs do not die between tabs.</strong>";
      var chain = positioning.querySelector(".v2-chain");
      if (chain) chain.innerHTML = "<span>Website</span><i>→</i><span>Autopilot</span><i>→</i><span>Owner View</span><i>→</i><span>Customer</span>";
      buildAutopilotSection(positioning);
    }

    var work = document.getElementById("work");
    if (work) text(work.querySelector(".v2-lead"), "See the system, the website, then the promotion.");

    var workShell = document.querySelector("#work .shell");
    if (workShell) {
      var workItems = Array.prototype.slice.call(workShell.querySelectorAll(":scope > .v2-work"));
      function byLabel(needle) {
        return workItems.find(function (item) {
          var label = item.querySelector(".v2-work-num");
          return label && label.textContent.toLowerCase().indexOf(needle) !== -1;
        });
      }
      var systemsWork = byLabel("systems");
      var websitesWork = byLabel("websites");
      var creativeWork = byLabel("creative");

      if (systemsWork && websitesWork && creativeWork) {
        var disclosure = workShell.querySelector(".v2-disclosure");
        [systemsWork, websitesWork, creativeWork].forEach(function (item) { workShell.insertBefore(item, disclosure || null); });

        text(systemsWork.querySelector(".v2-work-num"), "01 / Business Autopilot");
        text(systemsWork.querySelector(".v2-work-title"), "Routine lead handling should not wait for you.");
        text(systemsWork.querySelector(".v4-sys-body"), "Capture the enquiry, qualify and route it, trigger the agreed follow-up, move it toward booking or payment, and keep the pipeline organized. Human approval stays where the business actually needs judgment.");

        text(websitesWork.querySelector(".v2-work-num"), "02 / Interactive Website");
        text(websitesWork.querySelector(".v2-work-title"), "A real website concept you can scroll, click and inspect.");
        text(websitesWork.querySelector(".v4-sys-body"), "This pool-company concept is a working demonstration of the kind of customer-facing experience we can build — not a screenshot. Interact with it below.");
        websitesWork.classList.add("rp-pool-work");
        var specs = websitesWork.querySelector(".rp-case-specs");
        if (specs) specs.innerHTML = "<span>Interactive desktop + mobile</span><span>Scroll storytelling</span><span>Lead capture path</span><span>Workflow demonstration</span>";
        var frame = websitesWork.querySelector(".v4-flow-frame");
        if (frame) {
          frame.className = "rp-demo-frame";
          frame.innerHTML = '<div class="rp-demo-bar"><i></i><i></i><i></i><b>Interactive demo · Charlotte Pool Company concept</b></div><iframe class="rp-live-demo" src="' + POOL_DEMO + '" title="Interactive Charlotte Pool Company website concept" loading="lazy" sandbox="allow-scripts allow-same-origin"></iframe>';
        }
        var demoLink = websitesWork.querySelector(".v4-flow-live");
        if (demoLink) { demoLink.href = POOL_DEMO; demoLink.textContent = "Open the full interactive demo ↗"; }
        if (!websitesWork.querySelector(".rp-demo-note")) {
          var demoNote = document.createElement("p");
          demoNote.className = "rp-demo-note";
          demoNote.textContent = "Concept/demo work is labeled honestly. This is not presented as a paying client result.";
          websitesWork.appendChild(demoNote);
        }

        text(creativeWork.querySelector(".v2-work-num"), "03 / Promotion add-on");
        text(creativeWork.querySelector(".v2-work-title"), "Promotion is available when you need more attention.");
        creativeWork.classList.add("rp-creative-condensed");
        if (!creativeWork.querySelector(".rp-creative-intro")) {
          var intro = document.createElement("p");
          intro.className = "rp-creative-intro";
          intro.textContent = "A few examples are enough here. Video is an optional demand layer — the website and operating system stay the foundation.";
          var carousel = creativeWork.querySelector(".v4-carousel");
          if (carousel) creativeWork.insertBefore(intro, carousel);
        }
      }
    }

    var systemFilm = document.querySelector(".rp-system-video video");
    if (systemFilm) {
      var systemFilmUrl = "https://d2ol7oe51mr4n9.cloudfront.net/user_3IQOKnTRxX22rPLfhCEsOdVJxTl/b25280d1-f2c0-44cc-a207-59022bb2f6a1.mp4";
      if (systemFilm.getAttribute("src") !== systemFilmUrl) {
        systemFilm.setAttribute("src", systemFilmUrl);
        systemFilm.setAttribute("aria-label", "Revenue Pilots flagship film showing website intake, agents, booking and pipeline working as one connected business system. Silent video.");
        systemFilm.load();
      }
      var capStrong = document.querySelector(".rp-system-video-caption strong");
      var capSpan = document.querySelector(".rp-system-video-caption span");
      text(capStrong, "Website → Autopilot → Booking / Payment → Owner View");
      text(capSpan, "The system film now sits below the operating explanation instead of being the first thing the buyer sees.");
    }

    reworkPackages();
    reworkProcess();
    reworkContactSelect();

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
        var featured = s === service;
        el.classList.toggle("is-featured", featured);
        el.classList.toggle("is-left", s === left);
        el.classList.toggle("is-right", s === right);
        el.setAttribute("aria-pressed", String(featured));
        el.disabled = featured;
        var video = el.querySelector("video");
        if (!video) return;
        if (featured) {
          var p = video.play();
          if (p && p.catch) p.catch(function () {});
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

    objects.forEach(function (el) { el.addEventListener("click", function () { show(el.getAttribute("data-service")); }); });
    tabs.forEach(function (t) { t.addEventListener("click", function () { show(t.getAttribute("data-service")); }); });

    var q = /[?&]service=(creative|websites|systems)/.exec(location.search);
    show(q ? q[1] : "systems");
    document.documentElement.classList.add("v2-ready");

    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState !== "visible" || !active) return;
      var featured = document.querySelector('.v2-object[data-service="' + active + '"]');
      var video = featured && featured.querySelector("video");
      if (!video || !video.paused) return;
      var p = video.play();
      if (p && p.catch) p.catch(function () {});
    });

    Array.prototype.forEach.call(document.querySelectorAll(".v2-clip"), function (fig) {
      var video = fig.querySelector("video");
      var btn = fig.querySelector(".v2-play");
      if (!video || !btn) return;
      btn.addEventListener("click", function () {
        fig.classList.add("is-playing");
        video.controls = true;
        var p = video.play();
        if (p && p.catch) p.catch(function () {});
      });
    });
  });
})();
