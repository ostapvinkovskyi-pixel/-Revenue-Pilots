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

  const PLANS = [
    {
      key: "starter",
      name: "Starter",
      monthly: 249,
      annualTotal: 2490,
      annualMonthly: 208,
      pitchMonthly: "Fresh creative every month without a big agency contract.",
      pitchAnnual: "Same monthly creative, with 2 months free on annual billing.",
      features: [
        "3 fresh custom vertical ads every month",
        "First month launch bonus: +2 video variations",
        "3 new hooks / creative angles",
        "Your branding + CTA copy",
        "Social-ready 9:16 exports",
        "Monthly delivery",
        "Monthly plan can be canceled before renewal"
      ]
    },
    {
      key: "growth",
      name: "Growth",
      monthly: 449,
      annualTotal: 4490,
      annualMonthly: 374,
      pitchMonthly: "More creative to test, rotate and keep your ads from going stale.",
      pitchAnnual: "Six fresh ads every month, with 2 months free on annual billing.",
      features: [
        "6 fresh custom vertical ads every month",
        "First month launch bonus: +2 video variations",
        "Multiple hooks, offers and creative directions",
        "Custom CTA copy + branding",
        "1 revision round each month",
        "Social-ready 9:16 exports",
        "Monthly plan can be canceled before renewal"
      ]
    },
    {
      key: "weekly",
      name: "Scale",
      monthly: 699,
      annualTotal: 6990,
      annualMonthly: 583,
      pitchMonthly: "An ongoing creative engine for businesses actively spending on ads.",
      pitchAnnual: "Weekly creative delivery, with 2 months free on annual billing.",
      features: [
        "10 fresh custom vertical ads every month",
        "Fresh creative delivered weekly",
        "New hooks, angles and offer concepts",
        "Creative planning around your current campaigns",
        "2 revision rounds each month",
        "Priority production queue",
        "Monthly plan can be canceled before renewal"
      ]
    }
  ];

  let billingTerm = "monthly";

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

  document.title = "Revenue Pilots | Monthly Short-Form Video Ad Creative";
  upsertMeta('meta[name="description"]', {
    name: "description",
    content: "Monthly short-form video ad creative for home services, restaurants, ecommerce and product brands. Plans from $249/month, with annual billing available."
  });
  upsertMeta('meta[property="og:title"]', {
    property: "og:title",
    content: "Revenue Pilots — Fresh Ad Creative Every Month"
  });
  upsertMeta('meta[property="og:description"]', {
    property: "og:description",
    content: "Ongoing vertical video ad creative for businesses and products. Monthly plans from $249. Annual plans include 2 months free."
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
          "name": "Monthly short-form video ad creative",
          "serviceType": "Recurring short-form video advertising creative",
          "provider": { "@id": `${SITE}/#organization` },
          "areaServed": "United States",
          "url": `${SITE}/`,
          "description": "Ongoing vertical video ad creative for local services, restaurants, ecommerce and product brands.",
          "offers": [
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
    style.id = "rp-subscription-styles";
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
      .rp-billing-toggle{display:inline-flex;padding:.35rem;border:1px solid rgba(255,255,255,.12);border-radius:999px;background:rgba(255,255,255,.035);gap:.25rem}
      .rp-billing-btn{border:0;border-radius:999px;background:transparent;color:rgba(255,255,255,.62);padding:.72rem 1.05rem;font:inherit;font-weight:700;cursor:pointer;transition:.2s ease}
      .rp-billing-btn.is-active{background:#E2BD64;color:#101216;box-shadow:0 8px 28px rgba(197,154,60,.2)}
      .rp-billing-save{color:#E2BD64;font-size:.78rem;font-weight:800;letter-spacing:.04em;text-transform:uppercase}
      .rp-billing-detail{color:rgba(255,255,255,.48);font-size:.82rem;text-align:center}
      .price-annual-note{display:block;margin-top:.28rem;color:rgba(255,255,255,.48);font-size:.78rem;line-height:1.35}
      @media(max-width:760px){.rp-launch-grid{grid-template-columns:1fr}.rp-category-grid{grid-template-columns:1fr}.rp-billing-btn{padding:.68rem .9rem;font-size:.9rem}}
    `;
    if (!document.getElementById(style.id)) document.head.appendChild(style);

    const eyebrow = document.querySelector('.hero .eyebrow');
    if (eyebrow) eyebrow.innerHTML = '<span class="eyebrow-dash" aria-hidden="true"></span>Ongoing ad creative for businesses & products';

    const heroSub = document.querySelector('.hero-sub');
    if (heroSub) {
      heroSub.innerHTML = 'Fresh vertical video ads delivered every month.<br class="br-md"><strong>Subscriptions from $249/month. Annual plans include 2 months free.</strong>';
    }

    const heroMicro = document.querySelector('.hero-micro');
    if (heroMicro) heroMicro.textContent = 'Monthly plans can be canceled before renewal. Ad spend separate.';

    document.querySelectorAll('.hero [data-plan="starter"], .header-actions [data-plan="starter"]').forEach((btn) => {
      btn.textContent = 'Start for $249/mo';
    });

    const pricing = document.getElementById('pricing');
    if (pricing && !document.getElementById('launch-offer')) {
      pricing.insertAdjacentHTML('beforebegin', `
        <section class="rp-launch-offer" id="launch-offer" aria-labelledby="launch-offer-title">
          <div class="shell">
            <div class="rp-launch-card reveal">
              <div class="rp-launch-grid">
                <div>
                  <p class="eyebrow"><span class="eyebrow-dash" aria-hidden="true"></span>Launch bonus</p>
                  <h2 class="rp-launch-title" id="launch-offer-title">Start a subscription. Get 2 bonus videos in month one.</h2>
                  <p class="rp-launch-copy">The point is not one ad and goodbye. We keep giving your business <strong>fresh creative, new hooks and new angles every month</strong>. Starter and Growth include two extra video variations in the first month so you have more creative to test immediately.</p>
                  <p class="rp-launch-note">Bonus videos are additional cutdowns or variations built from the approved direction. Qualified businesses can still request one short concept sample before committing. No advertising result is guaranteed.</p>
                </div>
                <div class="rp-launch-actions">
                  <a class="btn btn-gold btn-lg" href="#pricing">See subscription plans</a>
                  <a class="btn btn-ghost btn-lg" href="#contact" data-free-concept>Request a free concept</a>
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
          <div class="rp-billing-toggle" role="group" aria-label="Billing period">
            <button type="button" class="rp-billing-btn is-active" data-billing="monthly">Monthly</button>
            <button type="button" class="rp-billing-btn" data-billing="annual">Annual</button>
          </div>
          <div class="rp-billing-save">Annual = 2 months free</div>
          <div class="rp-billing-detail" id="rp-billing-detail">Pay month to month. Switch or cancel before the next renewal.</div>
        </div>`);
    }

    const cards = Array.from(document.querySelectorAll('.price-card'));

    function renderPricing(term) {
      billingTerm = term;
      window.RP_BILLING_TERM = term;

      document.querySelectorAll('.rp-billing-btn').forEach((btn) => {
        btn.classList.toggle('is-active', btn.dataset.billing === term);
      });

      const detail = document.getElementById('rp-billing-detail');
      if (detail) {
        detail.textContent = term === 'annual'
          ? 'Annual plans are billed once per year. You receive 12 months of service for the price of 10.'
          : 'Pay month to month. Switch or cancel before the next renewal.';
      }

      cards.forEach((card, index) => {
        const plan = PLANS[index];
        if (!plan) return;

        const name = card.querySelector('.price-name');
        const amount = card.querySelector('.price-amount');
        const pitch = card.querySelector('.price-pitch');
        const list = card.querySelector('.price-list');
        const button = card.querySelector('.btn[data-plan], .btn[data-subscription-plan]');

        if (name) name.textContent = plan.name;
        if (pitch) pitch.textContent = term === 'annual' ? plan.pitchAnnual : plan.pitchMonthly;

        if (amount) {
          if (term === 'annual') {
            amount.innerHTML = `<span class="price-value">$${plan.annualMonthly}</span> <span class="price-term">/ month equivalent</span><span class="price-annual-note">$${plan.annualTotal.toLocaleString('en-US')} billed annually</span>`;
          } else {
            amount.innerHTML = `<span class="price-value">$${plan.monthly}</span> <span class="price-term">/ month</span>`;
          }
        }

        if (list) {
          list.innerHTML = plan.features.map((feature) => `<li>${feature}</li>`).join('');
        }

        if (button) {
          button.removeAttribute('data-plan');
          button.dataset.subscriptionPlan = plan.key;
          button.textContent = term === 'annual'
            ? `Start ${plan.name} — $${plan.annualTotal.toLocaleString('en-US')}/yr`
            : `Start ${plan.name} — $${plan.monthly}/mo`;
          button.onclick = () => {
            window.location.assign(`/api/checkout?plan=${encodeURIComponent(plan.key)}&term=${term}`);
          };
        }
      });
    }

    document.querySelectorAll('.rp-billing-btn').forEach((btn) => {
      btn.addEventListener('click', () => renderPricing(btn.dataset.billing));
    });

    renderPricing('monthly');

    const priceHead = pricing?.querySelector('.section-head .section-title');
    const priceSub = pricing?.querySelector('.section-head .section-sub');
    if (priceHead) priceHead.textContent = 'Choose your monthly creative engine.';
    if (priceSub) priceSub.textContent = 'Fresh ad creative is a recurring need. Pick monthly flexibility or save two months with annual billing.';

    const priceFoot = pricing?.querySelector('.price-foot');
    if (priceFoot) priceFoot.textContent = 'Secure recurring checkout is handled by Stripe. Annual plans are billed upfront. Ad spend is separate and paid directly to the advertising platform.';

    document.querySelectorAll('[data-free-concept]').forEach((link) => {
      link.addEventListener('click', () => {
        window.setTimeout(() => {
          const message = document.getElementById('lf-message');
          const pkg = document.getElementById('lf-package');
          if (message && !message.value) message.value = "I'd like to request a free short concept sample for my business before choosing a subscription.";
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