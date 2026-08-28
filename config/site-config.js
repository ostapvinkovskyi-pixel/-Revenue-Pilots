// Revenue Pilots public front-end configuration.
// Safe public paths only. Secrets belong in Vercel environment variables.
window.RP_CONFIG = {
  CONTACT_EMAIL: "ostapvinkovskyi@gmail.com",
  LEAD_WEBHOOK_URL: "/api/lead",
  STRIPE_STARTER_URL: "/api/checkout?plan=starter",
  STRIPE_GROWTH_URL: "/api/checkout?plan=growth",
  STRIPE_WEEKLY_URL: "/api/checkout?plan=weekly"
};

// Launch offer + SEO enhancement layer. Kept here so the existing site design,
// checkout wiring, lead form, and backend routes remain untouched.
(() => {
  const SITE = "https://www.revenuepilot.company";

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

  // Homepage metadata. Google can render JS; canonical is also reinforced by
  // an HTTP Link header in vercel.json.
  document.title = "Revenue Pilots | Short-Form Video Ads for Businesses & Products";
  upsertMeta('meta[name="description"]', {
    name: "description",
    content: "Custom short-form video ads for home services, restaurants, ecommerce and product brands. Launch offer: 3 custom ads plus 2 bonus video variations for $249."
  });
  upsertMeta('meta[property="og:title"]', {
    property: "og:title",
    content: "Revenue Pilots — Short-Form Video Ads Built for Your Business"
  });
  upsertMeta('meta[property="og:description"]', {
    property: "og:description",
    content: "Custom vertical ad creative for businesses and products. Launch offer: 3 custom ads + 2 bonus video variations for $249."
  });
  upsertMeta('meta[property="og:url"]', { property: "og:url", content: `${SITE}/` });
  upsertMeta('meta[property="og:image"]', {
    property: "og:image",
    content: `${SITE}/assets/brand/revenue-pilots-monogram-logo.png`
  });
  upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
  upsertMeta('meta[name="twitter:title"]', {
    name: "twitter:title",
    content: "Revenue Pilots — Short-Form Video Ads"
  });
  upsertMeta('meta[name="twitter:description"]', {
    name: "twitter:description",
    content: "Fresh ad creative for businesses and products. Starter launch offer: 3 custom ads + 2 bonus variations for $249."
  });
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
          "description": "Custom vertical video ad creative for local services, restaurants, ecommerce and product brands.",
          "offers": [
            { "@type": "Offer", "name": "Starter", "price": "249", "priceCurrency": "USD", "url": `${SITE}/#pricing` },
            { "@type": "Offer", "name": "Growth", "price": "499", "priceCurrency": "USD", "url": `${SITE}/#pricing` },
            { "@type": "Offer", "name": "Weekly Ad Engine", "price": "999", "priceCurrency": "USD", "url": `${SITE}/#pricing` }
          ]
        }
      ]
    });
    document.head.appendChild(schema);
  }

  const applyLaunchOffer = () => {
    const style = document.createElement("style");
    style.id = "rp-launch-offer-styles";
    style.textContent = `
      .rp-launch-offer{padding:1.2rem 0 4.5rem;background:#07090D}
      .rp-launch-card{position:relative;overflow:hidden;border:1px solid rgba(226,189,100,.32);border-radius:28px;padding:clamp(1.4rem,4vw,2.6rem);background:linear-gradient(135deg,rgba(197,154,60,.13),rgba(255,255,255,.025));box-shadow:0 24px 80px rgba(0,0,0,.28)}
      .rp-launch-card:after{content:"";position:absolute;width:260px;height:260px;border-radius:50%;right:-90px;top:-120px;background:rgba(197,154,60,.12);filter:blur(8px);pointer-events:none}
      .rp-launch-grid{position:relative;z-index:1;display:grid;grid-template-columns:minmax(0,1.3fr) minmax(230px,.7fr);gap:2rem;align-items:center}
      .rp-launch-title{font-family:"Instrument Serif",serif;font-size:clamp(2rem,4.5vw,3.6rem);line-height:.98;margin:.65rem 0 1rem;color:#fff;font-weight:400}
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
      @media(max-width:760px){.rp-launch-grid{grid-template-columns:1fr}.rp-category-grid{grid-template-columns:1fr}}
    `;
    if (!document.getElementById(style.id)) document.head.appendChild(style);

    const eyebrow = document.querySelector('.hero .eyebrow');
    if (eyebrow) eyebrow.innerHTML = '<span class="eyebrow-dash" aria-hidden="true"></span>Short-form ad creative for businesses & products';

    const heroSub = document.querySelector('.hero-sub');
    if (heroSub) {
      heroSub.innerHTML = 'Vertical video ads for services, restaurants, ecommerce and product brands.<br class="br-md"><strong>Launch offer: 3 custom ads + 2 bonus videos for $249.</strong>';
    }

    const heroMicro = document.querySelector('.hero-micro');
    if (heroMicro) heroMicro.textContent = 'Launch bonus included. No contract. Ad spend separate.';

    const pricing = document.getElementById('pricing');
    if (pricing && !document.getElementById('launch-offer')) {
      pricing.insertAdjacentHTML('beforebegin', `
        <section class="rp-launch-offer" id="launch-offer" aria-labelledby="launch-offer-title">
          <div class="shell">
            <div class="rp-launch-card reveal">
              <div class="rp-launch-grid">
                <div>
                  <p class="eyebrow"><span class="eyebrow-dash" aria-hidden="true"></span>Launch bonus</p>
                  <h2 class="rp-launch-title" id="launch-offer-title">Buy a package. Get 2 bonus videos included.</h2>
                  <p class="rp-launch-copy">Starter becomes <strong>3 custom ads + 2 bonus video variations</strong>. Growth becomes <strong>6 custom ads + 2 bonus video variations</strong>. Not ready to buy? Qualified businesses can request one short concept sample so you can see the direction before committing.</p>
                  <p class="rp-launch-note">One launch bonus per business. Bonus videos are additional cutdowns or creative variations built from the approved direction. Free concept samples are limited, may use available brand assets, and do not promise advertising results.</p>
                </div>
                <div class="rp-launch-actions">
                  <a class="btn btn-gold btn-lg" href="#pricing">Claim the launch bonus</a>
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

    document.querySelectorAll('.price-card').forEach((card) => {
      const name = card.querySelector('.price-name')?.textContent?.trim();
      const list = card.querySelector('.price-list');
      const pitch = card.querySelector('.price-pitch');
      if (!list || list.querySelector('[data-launch-bonus]')) return;
      if (name === 'Starter') {
        if (pitch) pitch.textContent = '3 custom vertical ads + 2 bonus videos.';
        const li = document.createElement('li');
        li.dataset.launchBonus = 'true';
        li.innerHTML = '<strong>Launch bonus: +2 video variations</strong>';
        list.prepend(li);
      }
      if (name === 'Growth') {
        if (pitch) pitch.textContent = '6 custom ads + 2 bonus videos to test more directions.';
        const li = document.createElement('li');
        li.dataset.launchBonus = 'true';
        li.innerHTML = '<strong>Launch bonus: +2 video variations</strong>';
        list.prepend(li);
      }
    });

    document.querySelectorAll('[data-free-concept]').forEach((link) => {
      link.addEventListener('click', () => {
        window.setTimeout(() => {
          const message = document.getElementById('lf-message');
          const pkg = document.getElementById('lf-package');
          if (message && !message.value) message.value = "I'd like to request a free short concept sample for my business.";
          if (pkg) pkg.value = 'not_sure';
          document.getElementById('lf-name')?.focus({ preventScroll: true });
        }, 250);
      });
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyLaunchOffer, { once: true });
  } else {
    applyLaunchOffer();
  }
})();