// Revenue Pilots public front-end configuration.
// Safe public paths only. Secrets belong in Vercel environment variables.
window.RP_CONFIG = {
  CONTACT_EMAIL: "ostapvinkovskyi@gmail.com",
  LEAD_WEBHOOK_URL: "/api/lead",
  STRIPE_STARTER_URL: "/api/checkout?plan=starter&term=monthly",
  STRIPE_GROWTH_URL: "/api/checkout?plan=growth&term=monthly",
  STRIPE_WEEKLY_URL: "/api/checkout?plan=weekly&term=monthly"
};

(() => {
  const SITE = "https://www.revenuepilot.company";

  const PACKS = [
    {
      key: "starter",
      name: "Starter Pack",
      amount: 249,
      pitch: "See our direction on your actual business before you decide to buy.",
      features: [
        "3 custom vertical video ads",
        "2 custom previews at no cost before you commit",
        "Approved previews count toward your 3-video pack",
        "3 hooks / creative angles",
        "Your branding + CTA copy",
        "Social-ready 9:16 exports",
        "One-time payment — no subscription"
      ]
    },
    {
      key: "growth",
      name: "Growth Pack",
      amount: 499,
      pitch: "Test more directions once you know you like the creative first.",
      features: [
        "6 custom vertical video ads",
        "2 custom previews at no cost before you commit",
        "Approved previews count toward your 6-video pack",
        "Multiple hooks, offers and creative directions",
        "Custom CTA copy + branding",
        "1 revision round",
        "Social-ready 9:16 exports"
      ]
    }
  ];

  const PLANS = [
    {
      key: "starter",
      name: "Starter",
      monthly: 249,
      annualTotal: 2490,
      annualMonthly: 208,
      pitchMonthly: "Fresh creative every month after you have seen our direction on your business.",
      pitchAnnual: "Same monthly creative, with 2 months free on yearly billing.",
      features: [
        "3 fresh custom vertical ads every month",
        "2 custom previews at no cost before you commit",
        "Approved previews count toward month one",
        "3 new hooks / creative angles",
        "Your branding + CTA copy",
        "Social-ready 9:16 exports",
        "Monthly plan can be canceled before renewal"
      ]
    },
    {
      key: "growth",
      name: "Growth",
      monthly: 449,
      annualTotal: 4490,
      annualMonthly: 374,
      pitchMonthly: "More creative to test, rotate and improve once you know the fit is right.",
      pitchAnnual: "Six fresh ads every month, with 2 months free on yearly billing.",
      features: [
        "6 fresh custom vertical ads every month",
        "2 custom previews at no cost before you commit",
        "Approved previews count toward month one",
        "Multiple hooks, offers and creative directions",
        "Custom CTA copy + branding",
        "1 revision round each month",
        "Social-ready 9:16 exports"
      ]
    },
    {
      key: "weekly",
      name: "Scale",
      monthly: 699,
      annualTotal: 6990,
      annualMonthly: 583,
      pitchMonthly: "An ongoing creative engine for businesses actively spending on ads.",
      pitchAnnual: "Weekly creative delivery, with 2 months free on yearly billing.",
      features: [
        "10 fresh custom vertical ads every month",
        "2 custom previews at no cost before you commit",
        "Approved previews count toward month one",
        "Fresh creative delivered weekly",
        "New hooks, angles and offer concepts",
        "Creative planning around your current campaigns",
        "2 revision rounds each month",
        "Priority production queue"
      ]
    }
  ];

  const upsertMeta = (selector, attrs) => {
    let el = document.head.querySelector(selector);
    if (!el) {
      el = document.createElement("meta");
      document.head.appendChild(el);
    }
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    return el;
  };

  const upsertLink = (rel, href) => {
    let el = document.head.querySelector(`link[rel="${rel}"]`);
    if (!el) {
      el = document.createElement("link");
      el.rel = rel;
      document.head.appendChild(el);
    }
    el.href = href;
  };

  document.title = "Revenue Pilots | See 2 Custom Ad Previews Before You Buy";
  upsertMeta('meta[name="description"]', {
    name: "description",
    content: "See two custom video ad previews built for your business at no cost before you commit. If you continue, the approved previews are finalized as part of your selected pack or first subscription month."
  });
  upsertMeta('meta[property="og:title"]', {
    property: "og:title",
    content: "Revenue Pilots — See 2 Custom Previews Before You Buy"
  });
  upsertMeta('meta[property="og:description"]', {
    property: "og:description",
    content: "We build two custom review previews around your actual business before you pay. Continue only if you like the direction."
  });
  upsertMeta('meta[property="og:url"]', { property: "og:url", content: `${SITE}/` });
  upsertMeta('meta[property="og:image"]', {
    property: "og:image",
    content: `${SITE}/assets/brand/revenue-pilots-monogram-logo.png`
  });
  upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
  upsertLink("canonical", `${SITE}/`);

  if (!document.head.querySelector('#rp-structured-data')) {
    const schema = document.createElement("script");
    schema.type = "application/ld+json";
    schema.id = "rp-structured-data";
    schema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": `${SITE}/#organization`,
          "name": "Revenue Pilots",
          "url": `${SITE}/`,
          "logo": `${SITE}/assets/brand/revenue-pilots-monogram-logo.png`
        },
        {
          "@type": "WebSite",
          "@id": `${SITE}/#website`,
          "url": `${SITE}/`,
          "name": "Revenue Pilots",
          "publisher": { "@id": `${SITE}/#organization` }
        },
        {
          "@type": "Service",
          "@id": `${SITE}/#video-ad-service`,
          "name": "Short-form video ad creative",
          "serviceType": "Short-form video advertising creative",
          "provider": { "@id": `${SITE}/#organization` },
          "areaServed": "United States",
          "url": `${SITE}/`,
          "description": "One-time and recurring vertical video ad creative for local services, restaurants, ecommerce and product brands.",
          "offers": [
            { "@type": "Offer", "name": "Starter Pack one-time", "price": "249", "priceCurrency": "USD", "url": `${SITE}/#pricing` },
            { "@type": "Offer", "name": "Growth Pack one-time", "price": "499", "priceCurrency": "USD", "url": `${SITE}/#pricing` },
            { "@type": "Offer", "name": "Starter monthly", "price": "249", "priceCurrency": "USD", "url": `${SITE}/#pricing` },
            { "@type": "Offer", "name": "Growth monthly", "price": "449", "priceCurrency": "USD", "url": `${SITE}/#pricing` },
            { "@type": "Offer", "name": "Scale monthly", "price": "699", "priceCurrency": "USD", "url": `${SITE}/#pricing` }
          ]
        }
      ]
    });
    document.head.appendChild(schema);
  }

  const applyEnhancements = () => {
    const style = document.createElement("style");
    style.id = "rp-purchase-styles";
    style.textContent = `
      .rp-launch-offer{padding:1.2rem 0 4.5rem;background:#07090D}
      .rp-launch-card{position:relative;overflow:hidden;border:1px solid rgba(226,189,100,.32);border-radius:28px;padding:clamp(1.4rem,4vw,2.6rem);background:linear-gradient(135deg,rgba(197,154,60,.13),rgba(255,255,255,.025));box-shadow:0 24px 80px rgba(0,0,0,.28)}
      .rp-launch-card:after{content:"";position:absolute;width:260px;height:260px;border-radius:50%;right:-90px;top:-120px;background:rgba(197,154,60,.12);filter:blur(8px);pointer-events:none}
      .rp-launch-grid{position:relative;z-index:1;display:grid;grid-template-columns:minmax(0,1.3fr) minmax(230px,.7fr);gap:2rem;align-items:center}
      .rp-launch-title{font-family:var(--font);font-weight:800;letter-spacing:-.022em;text-wrap:balance;font-size:clamp(1.9rem,3.6vw,2.7rem);line-height:1.05;margin:.65rem 0 1rem;color:#fff}
      .rp-launch-copy{max-width:760px;color:rgba(255,255,255,.72);font-size:1rem;line-height:1.7}
      .rp-launch-copy strong{color:#E2BD64}
      .rp-launch-actions{display:flex;flex-direction:column;gap:.8rem;align-items:stretch}
      .rp-launch-note{margin-top:1rem;color:rgba(255,255,255,.45);font-size:.78rem;line-height:1.55}
      .rp-category-links{padding:0 0 5rem;background:#07090D}
      .rp-category-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem;margin-top:1.5rem}
      .rp-category-card{display:block;border:1px solid rgba(255,255,255,.09);border-radius:20px;padding:1.25rem 1.2rem;background:rgba(255,255,255,.025);text-decoration:none;transition:transform .2s ease,border-color .2s ease}
      .rp-category-card:hover{transform:translateY(-3px);border-color:rgba(226,189,100,.45)}
      .rp-category-card strong{display:block;color:#fff;margin-bottom:.35rem}
      .rp-category-card span{color:rgba(255,255,255,.52);font-size:.86rem;line-height:1.45}
      .rp-billing-wrap{display:flex;flex-direction:column;align-items:center;gap:.8rem;margin:1.6rem auto 2.2rem}
      .rp-billing-toggle{display:inline-flex;padding:.35rem;border:1px solid rgba(255,255,255,.12);border-radius:999px;background:rgba(255,255,255,.035);gap:.25rem;flex-wrap:wrap;justify-content:center}
      .rp-billing-btn{border:0;border-radius:999px;background:transparent;color:rgba(255,255,255,.62);padding:.72rem 1.05rem;font:inherit;font-weight:700;cursor:pointer;transition:.2s ease}
      .rp-billing-btn.is-active{background:#E2BD64;color:#101216;box-shadow:0 8px 28px rgba(197,154,60,.2)}
      .rp-billing-save{color:#E2BD64;font-size:.78rem;font-weight:800;letter-spacing:.04em;text-transform:uppercase}
      .rp-billing-detail{color:rgba(255,255,255,.48);font-size:.82rem;text-align:center}
      .price-annual-note{display:block;margin-top:.28rem;color:rgba(255,255,255,.48);font-size:.78rem;line-height:1.35}
      .price-grid.rp-two-cards{grid-template-columns:repeat(2,minmax(0,1fr));max-width:920px;margin-left:auto;margin-right:auto}
      .price-card[hidden]{display:none!important}
      @media(max-width:760px){.rp-launch-grid{grid-template-columns:1fr}.rp-category-grid{grid-template-columns:1fr}.price-grid.rp-two-cards{grid-template-columns:1fr}.rp-billing-btn{padding:.68rem .9rem;font-size:.9rem}}
    `;
    if (!document.getElementById(style.id)) document.head.appendChild(style);

    const eyebrow = document.querySelector('.hero .eyebrow');
    if (eyebrow) eyebrow.innerHTML = '<span class="eyebrow-dash" aria-hidden="true"></span>See the work before you pay';

    const heroSub = document.querySelector('.hero-sub');
    if (heroSub) {
      heroSub.innerHTML = '<strong>Get 2 custom video previews built for your business at no cost.</strong><br class="br-md">See our direction first. Continue only if you like what we make.';
    }

    const heroMicro = document.querySelector('.hero-micro');
    if (heroMicro) heroMicro.textContent = 'Preview versions are review-only. Final usable files are delivered with a purchased pack or plan and count toward its included video total.';

    const contactSub = document.querySelector('.contact-pitch .section-sub');
    if (contactSub) contactSub.textContent = 'Tell us what you want to promote. We will start by showing you two custom previews built around your actual business.';
    const contactMicro = document.querySelector('.contact-pitch .hero-micro');
    if (contactMicro) contactMicro.textContent = 'No payment is required to view the previews. Final usable files are delivered after purchase and count toward the selected package total.';

    document.querySelectorAll('.hero [data-plan="starter"], .header-actions [data-plan="starter"], .contact-ctas [data-plan="starter"]').forEach((btn) => {
      btn.removeAttribute('data-plan');
      btn.textContent = btn.classList.contains('header-cta')
        ? 'Get 2 previews'
        : btn.closest('.contact-ctas')
          ? 'Get my 2 previews'
          : 'See my 2 previews';
      btn.addEventListener('click', () => {
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.setTimeout(() => document.getElementById('lf-name')?.focus({ preventScroll: true }), 350);
      });
    });

    const pricing = document.getElementById('pricing');
    if (pricing && !document.getElementById('launch-offer')) {
      pricing.insertAdjacentHTML('beforebegin', `
        <section class="rp-launch-offer" id="launch-offer" aria-labelledby="launch-offer-title">
          <div class="shell">
            <div class="rp-launch-card reveal">
              <div class="rp-launch-grid">
                <div>
                  <p class="eyebrow"><span class="eyebrow-dash" aria-hidden="true"></span>Built for your business first</p>
                  <h2 class="rp-launch-title" id="launch-offer-title">See 2 custom video previews before you spend a dollar.</h2>
                  <p class="rp-launch-copy">Tell us what your business sells and what you want to push right now. For qualified businesses, we will create <strong>2 custom video previews around your real brand, offer and audience at no cost</strong>. You get to judge the creative on your own business — not on a generic portfolio — before deciding whether Revenue Pilots is worth paying for.</p>
                  <p class="rp-launch-copy">Like the direction? Choose a pack or subscription and we finalize those approved previews as part of it, then build the remaining videos in your package.</p>
                  <p class="rp-launch-note">Preview versions are watermarked / review-only and are not licensed as final social-ready deliverables. Final usable files are delivered only after purchase. Any approved preview that is finalized counts toward the total number of videos included in the selected pack or first subscription month. No advertising result is guaranteed.</p>
                </div>
                <div class="rp-launch-actions">
                  <a class="btn btn-gold btn-lg" href="#contact" data-free-concept>Get my 2 previews</a>
                  <a class="btn btn-ghost btn-lg" href="#work">See examples first</a>
                </div>
              </div>
            </div>
          </div>
        </section>`);
    }

    const work = document.getElementById('work');
    if (work && !document.getElementById('category-pages')) {
      work.insertAdjacentHTML('afterend', `
        <section class="rp-category-links" id="category-pages" aria-labelledby="category-pages-title">
          <div class="shell">
            <p class="eyebrow"><span class="eyebrow-dash" aria-hidden="true"></span>Built around your category</p>
            <h2 class="section-title" id="category-pages-title">See how we approach different businesses.</h2>
            <div class="rp-category-grid">
              <a class="rp-category-card" href="/video-ads-for-home-services/"><strong>Home services</strong><span>Roofing, HVAC, plumbing, cleaning, landscaping and more.</span></a>
              <a class="rp-category-card" href="/restaurant-video-ads/"><strong>Restaurants & hospitality</strong><span>Food, atmosphere, offers and reservation-focused creative.</span></a>
              <a class="rp-category-card" href="/ecommerce-product-video-ads/"><strong>Ecommerce & products</strong><span>Product-led ads, hooks, routines, demos and visual desire.</span></a>
              <a class="rp-category-card" href="/beauty-video-ads/"><strong>Beauty & skincare</strong><span>Texture, routine, ingredient story and claims-safe product creative.</span></a>
              <a class="rp-category-card" href="/meta-ad-creative/"><strong>Meta ad creative</strong><span>Fresh angles and vertical creative for Facebook and Instagram campaigns.</span></a>
              <a class="rp-category-card" href="/short-form-video-ads/"><strong>Short-form video ads</strong><span>A broader look at the creative system behind Revenue Pilots.</span></a>
            </div>
          </div>
        </section>`);
    }

    const priceGrid = pricing?.querySelector('.price-grid');
    if (priceGrid && !document.getElementById('rp-billing-wrap')) {
      priceGrid.insertAdjacentHTML('beforebegin', `
        <div class="rp-billing-wrap" id="rp-billing-wrap">
          <div class="rp-billing-toggle" role="group" aria-label="Purchase option">
            <button type="button" class="rp-billing-btn is-active" data-billing="pack">Buy Pack</button>
            <button type="button" class="rp-billing-btn" data-billing="monthly">Monthly</button>
            <button type="button" class="rp-billing-btn" data-billing="annual">Yearly</button>
          </div>
          <div class="rp-billing-save" id="rp-billing-save">One-time purchase — no subscription</div>
          <div class="rp-billing-detail" id="rp-billing-detail">Already saw your previews? Pick the package that fits. Approved previews count toward the videos included in your purchase.</div>
        </div>`);
    }

    const cards = Array.from(document.querySelectorAll('.price-card'));

    function wireButton(button, planKey, term, label) {
      if (!button) return;
      button.removeAttribute('data-plan');
      delete button.dataset.subscriptionPlan;
      button.textContent = label;
      button.onclick = () => {
        window.location.assign(`/api/checkout?plan=${encodeURIComponent(planKey)}&term=${encodeURIComponent(term)}`);
      };
    }

    function renderPricing(term) {
      window.RP_BILLING_TERM = term;

      document.querySelectorAll('.rp-billing-btn').forEach((btn) => {
        btn.classList.toggle('is-active', btn.dataset.billing === term);
      });

      const detail = document.getElementById('rp-billing-detail');
      const save = document.getElementById('rp-billing-save');

      if (term === 'pack') {
        if (save) save.textContent = 'One-time purchase — no subscription';
        if (detail) detail.textContent = 'Already saw your previews? Pick the package that fits. Approved previews count toward the videos included in your purchase.';
        priceGrid?.classList.add('rp-two-cards');

        cards.forEach((card, index) => {
          const pack = PACKS[index];
          if (!pack) {
            card.hidden = true;
            card.style.display = 'none';
            return;
          }
          card.hidden = false;
          card.style.removeProperty('display');
          const name = card.querySelector('.price-name');
          const amount = card.querySelector('.price-amount');
          const pitch = card.querySelector('.price-pitch');
          const list = card.querySelector('.price-list');
          const button = card.querySelector('.btn');
          if (name) name.textContent = pack.name;
          if (amount) amount.innerHTML = `<span class="price-value">$${pack.amount}</span> <span class="price-term">one-time</span>`;
          if (pitch) pitch.textContent = pack.pitch;
          if (list) list.innerHTML = pack.features.map((feature) => `<li>${feature}</li>`).join('');
          wireButton(button, pack.key, 'one_time', `Buy ${pack.name} — $${pack.amount}`);
        });
        return;
      }

      priceGrid?.classList.remove('rp-two-cards');
      if (save) save.textContent = term === 'annual' ? 'Yearly = 2 months free' : 'Cancel before renewal';
      if (detail) {
        detail.textContent = term === 'annual'
          ? 'Yearly plans are billed once per year. You receive 12 months of service for the price of 10. Approved previews count toward month one.'
          : 'Pay month to month. Switch or cancel before the next renewal. Approved previews count toward month one.';
      }

      cards.forEach((card, index) => {
        const plan = PLANS[index];
        if (!plan) return;
        card.hidden = false;
        card.style.removeProperty('display');

        const name = card.querySelector('.price-name');
        const amount = card.querySelector('.price-amount');
        const pitch = card.querySelector('.price-pitch');
        const list = card.querySelector('.price-list');
        const button = card.querySelector('.btn');

        if (name) name.textContent = plan.name;
        if (pitch) pitch.textContent = term === 'annual' ? plan.pitchAnnual : plan.pitchMonthly;

        if (amount) {
          if (term === 'annual') {
            amount.innerHTML = `<span class="price-value">$${plan.annualMonthly}</span> <span class="price-term">/ month equivalent</span><span class="price-annual-note">$${plan.annualTotal.toLocaleString('en-US')} billed yearly</span>`;
          } else {
            amount.innerHTML = `<span class="price-value">$${plan.monthly}</span> <span class="price-term">/ month</span>`;
          }
        }

        if (list) list.innerHTML = plan.features.map((feature) => `<li>${feature}</li>`).join('');
        wireButton(
          button,
          plan.key,
          term,
          term === 'annual'
            ? `Start ${plan.name} — $${plan.annualTotal.toLocaleString('en-US')}/yr`
            : `Start ${plan.name} — $${plan.monthly}/mo`
        );
      });
    }

    document.querySelectorAll('.rp-billing-btn').forEach((btn) => {
      btn.addEventListener('click', () => renderPricing(btn.dataset.billing));
    });

    renderPricing('pack');

    const priceHead = pricing?.querySelector('.section-head .section-title');
    const priceSub = pricing?.querySelector('.section-head .section-sub');
    if (priceHead) priceHead.textContent = 'Like what we made? Choose how to continue.';
    if (priceSub) priceSub.textContent = 'Your two previews let you see our direction first. Then choose a one-time pack, monthly plan, or yearly billing.';

    const priceFoot = pricing?.querySelector('.price-foot');
    if (priceFoot) priceFoot.textContent = 'Preview versions are review-only; final usable files are delivered after purchase and count toward the selected package total. Secure checkout is handled by Stripe. Ad spend is separate.';

    document.querySelectorAll('[data-free-concept]').forEach((link) => {
      link.addEventListener('click', () => {
        window.setTimeout(() => {
          const message = document.getElementById('lf-message');
          const pkg = document.getElementById('lf-package');
          if (message && !message.value) message.value = "I'd like to see 2 custom video previews built for my business before deciding on a pack or subscription.";
          if (pkg) pkg.value = 'not_sure';
          document.getElementById('lf-name')?.focus({ preventScroll: true });
        }, 250);
      });
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyEnhancements, { once: true });
  } else {
    applyEnhancements();
  }
})();

/* Desktop portfolio v3
   Three visible cards, five real items, one-card movement, transform-based
   animation (not native smooth scrolling) so loop resets happen on visually
   identical clone windows. The progress rail keeps a fixed width so it never
   jumps when the active state changes. Mobile remains owned by main.js. */
(() => {
  const desktopMQ = window.matchMedia('(min-width: 1024px)');
  const reduceMotionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  const TRANSITION_MS = 620;

  const installStyles = () => {
    if (document.getElementById('rp-desktop-carousel-v3')) return;
    const style = document.createElement('style');
    style.id = 'rp-desktop-carousel-v3';
    style.textContent = `
      @media (min-width:1024px){
        #work .work-track{
          --work-gap:clamp(16px,1.55vw,22px);
          --card-w:calc((100% - (2 * var(--work-gap))) / 3);
          max-width:var(--shell);
          box-sizing:border-box;
          padding-inline:var(--pad);
          overflow:hidden!important;
          scroll-snap-type:none!important;
          scroll-behavior:auto!important;
          cursor:grab;
          touch-action:pan-y;
        }
        #work .work-track.is-dragging{cursor:grabbing;}
        #work .work-grid{
          width:100%;
          display:flex;
          flex-wrap:nowrap;
          gap:var(--work-gap);
          will-change:transform;
          transform:translate3d(0,0,0);
          transition:transform ${TRANSITION_MS}ms cubic-bezier(.22,.61,.36,1);
        }
        #work .work-card{
          flex:0 0 var(--card-w)!important;
          width:var(--card-w)!important;
          opacity:1!important;
          scroll-snap-align:none!important;
        }
        #work .work-card.is-loop-clone{display:flex;}
        #work .work-rail{
          display:flex!important;
          min-height:4px;
          align-items:center;
          gap:7px;
        }
        #work .work-rail span,
        #work .work-rail span.is-on{
          width:30px!important;
          height:2px;
          background:var(--line-2);
          transform:scaleX(.46);
          transform-origin:center;
          opacity:.7;
          transition:transform 420ms cubic-bezier(.22,.61,.36,1),background 420ms ease,opacity 420ms ease;
        }
        #work .work-rail span.is-on{
          width:30px!important;
          background:var(--gold);
          transform:scaleX(1);
          opacity:1;
        }
      }
    `;
    document.head.appendChild(style);
  };

  const init = () => {
    installStyles();
    if (!desktopMQ.matches || reduceMotionMQ.matches) return;

    let oldTrack = document.getElementById('workTrack');
    if (!oldTrack || oldTrack.dataset.rpSmoothLoop === 'true') return;

    const oldGrid = oldTrack.querySelector('#workGrid');
    if (!oldGrid) return;

    /* Clone only real cards. Replacing the track also removes the native
       scroll listeners installed by main.js so two carousel engines cannot
       fight each other. */
    const sourceCards = Array.from(oldGrid.children).filter((card) => !card.classList.contains('is-loop-clone'));
    if (sourceCards.length < 4) return;

    const track = oldTrack.cloneNode(false);
    const grid = oldGrid.cloneNode(false);
    track.dataset.rpSmoothLoop = 'true';
    track.classList.remove('is-dragging');

    const realCards = sourceCards.map((card, index) => {
      const clean = card.cloneNode(true);
      clean.classList.remove('is-loop-clone', 'is-active');
      clean.classList.add('is-visible');
      clean.dataset.rpRealIndex = String(index);
      return clean;
    });

    realCards.forEach((card) => grid.appendChild(card));
    track.appendChild(grid);
    oldTrack.replaceWith(track);

    const makeClone = (card) => {
      const clone = card.cloneNode(true);
      clone.classList.add('is-loop-clone', 'is-visible');
      clone.classList.remove('is-active');
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelectorAll('button,a,input,select,textarea').forEach((el) => el.setAttribute('tabindex', '-1'));
      return clone;
    };

    grid.prepend(makeClone(realCards[realCards.length - 2]), makeClone(realCards[realCards.length - 1]));
    grid.append(makeClone(realCards[0]), makeClone(realCards[1]));

    const items = Array.from(grid.children);
    const rail = document.getElementById('workRail');
    if (rail) {
      rail.innerHTML = '';
      realCards.forEach(() => rail.appendChild(document.createElement('span')));
    }
    const dots = rail ? Array.from(rail.children) : [];

    let position = 2; // 1,2,3 are visible first
    let animating = false;
    let dragging = false;
    let dragStartX = 0;
    let dragStartPosition = position;
    let pointerId = null;
    let autoTimer = 0;
    let resumeTimer = 0;
    let sectionVisible = true;

    const gap = () => parseFloat(getComputedStyle(grid).columnGap || getComputedStyle(grid).gap || '0') || 0;
    const step = () => {
      const first = items[0];
      return first ? first.getBoundingClientRect().width + gap() : 0;
    };
    const xFor = (pos) => -(pos * step());

    const realIndexAt = (pos) => {
      const item = items[pos];
      const value = item ? Number(item.dataset.rpRealIndex) : 0;
      return Number.isFinite(value) ? value : 0;
    };

    const updateDots = (pos) => {
      const active = realIndexAt(pos);
      dots.forEach((dot, index) => dot.classList.toggle('is-on', index === active));
    };

    const syncPlayback = (pos) => {
      items.forEach((card, index) => {
        const visible = index >= pos && index < pos + 3;
        card.classList.toggle('is-active', visible);
        const video = card.querySelector('.work-video');
        if (!video) return;
        if (sectionVisible && visible) {
          const promise = video.play();
          if (promise && typeof promise.catch === 'function') promise.catch(() => {});
        } else if (!video.paused) {
          video.pause();
        }
      });
    };

    const setTransform = (pos, animate) => {
      grid.style.transition = animate
        ? `transform ${TRANSITION_MS}ms cubic-bezier(.22,.61,.36,1)`
        : 'none';
      grid.style.transform = `translate3d(${xFor(pos)}px,0,0)`;
    };

    const normalize = () => {
      /* Both resets land on an identical three-card window, so the DOM moves
         but the pixels on screen do not. */
      if (position === 6) {
        position = 1; // [5,1,2] -> identical [5,1,2]
        setTransform(position, false);
      } else if (position === 0) {
        position = 5; // [4,5,1] -> identical [4,5,1]
        setTransform(position, false);
      }
      // Force the no-transition reset to commit before restoring animation.
      grid.getBoundingClientRect();
      grid.style.transition = `transform ${TRANSITION_MS}ms cubic-bezier(.22,.61,.36,1)`;
      animating = false;
      updateDots(position);
      syncPlayback(position);
    };

    const move = (direction) => {
      if (animating || dragging) return;
      const target = position + direction;
      if (target < 0 || target > 6) return;
      animating = true;
      position = target;
      updateDots(position);
      syncPlayback(position);
      setTransform(position, true);
    };

    grid.addEventListener('transitionend', (event) => {
      if (event.propertyName !== 'transform' || !animating) return;
      normalize();
    });

    const stopAuto = () => {
      if (autoTimer) window.clearInterval(autoTimer);
      autoTimer = 0;
    };

    const startAuto = () => {
      stopAuto();
      if (!sectionVisible) return;
      autoTimer = window.setInterval(() => move(1), 30000);
    };

    const pauseAuto = (resumeAfter = 4500) => {
      stopAuto();
      if (resumeTimer) window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(startAuto, resumeAfter);
    };

    track.addEventListener('wheel', (event) => {
      const horizontal = Math.abs(event.deltaX) > 7 && Math.abs(event.deltaX) > Math.abs(event.deltaY) * .7;
      if (!horizontal) return;
      event.preventDefault();
      pauseAuto();
      if (!animating) move(event.deltaX > 0 ? 1 : -1);
    }, { passive: false });

    track.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      if (animating) return;
      dragging = true;
      dragStartX = event.clientX;
      dragStartPosition = position;
      pointerId = event.pointerId;
      track.classList.add('is-dragging');
      grid.style.transition = 'none';
      pauseAuto();
      if (track.setPointerCapture) {
        try { track.setPointerCapture(pointerId); } catch (_) {}
      }
    });

    track.addEventListener('pointermove', (event) => {
      if (!dragging) return;
      const dx = event.clientX - dragStartX;
      grid.style.transform = `translate3d(${xFor(dragStartPosition) + dx}px,0,0)`;
      if (Math.abs(dx) > 6) event.preventDefault();
    });

    const endDrag = (event) => {
      if (!dragging) return;
      dragging = false;
      track.classList.remove('is-dragging');
      if (track.releasePointerCapture && pointerId !== null) {
        try { track.releasePointerCapture(pointerId); } catch (_) {}
      }
      const endX = typeof event.clientX === 'number' ? event.clientX : dragStartX;
      const dx = endX - dragStartX;
      pointerId = null;

      if (Math.abs(dx) >= 42) {
        grid.style.transition = `transform ${TRANSITION_MS}ms cubic-bezier(.22,.61,.36,1)`;
        move(dx < 0 ? 1 : -1);
      } else {
        animating = true;
        setTransform(position, true);
      }
    };

    ['pointerup','pointercancel'].forEach((type) => track.addEventListener(type, endDrag));

    track.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      pauseAuto();
      move(event.key === 'ArrowRight' ? 1 : -1);
    });

    track.addEventListener('mouseenter', stopAuto);
    track.addEventListener('mouseleave', () => pauseAuto(1800));
    track.addEventListener('focusin', stopAuto);
    track.addEventListener('focusout', () => pauseAuto(2500));

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          sectionVisible = entry.isIntersecting;
          syncPlayback(position);
          if (sectionVisible) startAuto(); else stopAuto();
        });
      }, { rootMargin: '100px 0px', threshold: .12 });
      observer.observe(track);
    }

    let resizeTimer = 0;
    window.addEventListener('resize', () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        setTransform(position, false);
        grid.getBoundingClientRect();
        grid.style.transition = `transform ${TRANSITION_MS}ms cubic-bezier(.22,.61,.36,1)`;
      }, 100);
    });

    window.requestAnimationFrame(() => {
      setTransform(position, false);
      updateDots(position);
      syncPlayback(position);
      grid.getBoundingClientRect();
      grid.style.transition = `transform ${TRANSITION_MS}ms cubic-bezier(.22,.61,.36,1)`;
      startAuto();
    });
  };

  if (document.readyState === 'complete') {
    window.setTimeout(init, 0);
  } else {
    window.addEventListener('load', init, { once: true });
  }

  desktopMQ.addEventListener?.('change', (event) => {
    if (event.matches) init();
    else if (document.getElementById('workTrack')?.dataset.rpSmoothLoop === 'true') window.location.reload();
  });
})();
