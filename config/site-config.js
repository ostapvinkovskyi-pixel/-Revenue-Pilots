// Revenue Pilots — launch sales configuration.
// Revenue-mode freeze: one ICP, one public offer, one checkout path.
window.RP_CONFIG = {
  CONTACT_EMAIL: "ostapvinkovskyi@gmail.com",
  LEAD_WEBHOOK_URL: "/api/lead",
  STRIPE_STARTER_URL: "/api/checkout?plan=starter&term=one_time"
};

(() => {
  const SITE = "https://www.revenuepilot.company";
  const CHECKOUT = "/api/checkout?plan=starter&term=one_time";

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

  document.title = "Revenue Pilots | Meta Ad Creative for Home-Service Businesses";
  upsertMeta('meta[name="description"]', {
    name: "description",
    content: "Three custom vertical video ads for home-service businesses. Built around your real offer, service area and brand. $249 one-time pilot. No contract."
  });
  upsertMeta('meta[property="og:title"]', {
    property: "og:title",
    content: "Revenue Pilots — 3 Custom Ads. $249 One-Time Pilot."
  });
  upsertMeta('meta[property="og:description"]', {
    property: "og:description",
    content: "Fresh Meta-ready vertical video creative for roofing, HVAC, plumbing and other home-service businesses."
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
          "@type": "Service",
          "@id": `${SITE}/#creative-pilot`,
          "name": "Home-service vertical video ad creative",
          "serviceType": "Short-form paid-social video creative",
          "provider": { "@id": `${SITE}/#organization` },
          "areaServed": "United States",
          "url": `${SITE}/#pricing`,
          "description": "A one-time pilot with three custom vertical video ads built around a home-service company's real offer, service area and brand.",
          "offers": [{
            "@type": "Offer",
            "name": "Starter Pilot",
            "price": "249",
            "priceCurrency": "USD",
            "url": `${SITE}/#pricing`
          }]
        }
      ]
    });
    document.head.appendChild(schema);
  }

  const ensureFounderWindow = () => {
    if (document.getElementById('about-founder')) return;

    if (!document.getElementById('rp-founder-inline-styles')) {
      const style = document.createElement('style');
      style.id = 'rp-founder-inline-styles';
      style.textContent = `
        .section-founder-inline{padding-top:0;padding-bottom:clamp(72px,9vw,120px)}
        .founder-window{position:relative;display:grid;grid-template-columns:minmax(180px,240px) minmax(0,1fr);gap:clamp(32px,4.5vw,58px);align-items:start;padding:clamp(26px,4vw,50px);border:1px solid rgba(255,255,255,.10);border-radius:28px;background:linear-gradient(145deg,rgba(255,255,255,.035),rgba(255,255,255,.012));box-shadow:0 30px 80px rgba(0,0,0,.18);overflow:hidden}
        .founder-window::before{content:"";position:absolute;left:0;top:0;bottom:0;width:2px;background:linear-gradient(180deg,rgba(217,185,110,.9),rgba(217,185,110,.08))}
        .founder-window-photo{position:relative;margin:0;max-width:240px;align-self:start;justify-self:center}
        .founder-window-photo::after{content:"";position:absolute;inset:9px -9px -9px 9px;border:1px solid rgba(217,185,110,.22);border-radius:20px;z-index:0;pointer-events:none}
        .founder-window-photo img{position:relative;z-index:1;display:block;width:100%;height:auto;max-height:330px;object-fit:contain;border-radius:20px;border:1px solid rgba(255,255,255,.10);background:#11151b}
        .founder-window-copy{max-width:720px}
        .founder-window-copy .eyebrow{margin-bottom:18px}
        .founder-window-title{margin:0;color:#f4f3ef;font-family:"Manrope",Arial,sans-serif;font-size:clamp(2.1rem,4vw,3.8rem);font-weight:700;line-height:1.02;letter-spacing:-.055em}
        .founder-window-lead{margin:14px 0 28px;color:#d9b96e;font-size:clamp(1.05rem,1.5vw,1.22rem);font-weight:600;line-height:1.45}
        .founder-window-story{display:grid;gap:16px}
        .founder-window-story p{margin:0;color:#b8b9b5;font-size:clamp(.98rem,1.25vw,1.08rem);line-height:1.7;letter-spacing:-.01em}
        .founder-window-signoff{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;flex-wrap:wrap;margin-top:30px;padding-top:24px;border-top:1px solid rgba(255,255,255,.09)}
        .founder-window-name{margin:0;color:#f4f3ef;font-weight:800;font-size:1rem}
        .founder-window-role{margin:4px 0 0;color:#7f827f;font-size:.82rem}
        .founder-window-quote{max-width:330px;margin:0;color:#d9b96e;font-size:.95rem;font-weight:600;line-height:1.5}
        @media(max-width:820px){.founder-window{grid-template-columns:1fr;gap:34px}.founder-window-photo{max-width:215px}.founder-window-copy{max-width:none}}
        @media(max-width:560px){.founder-window{padding:24px 22px;border-radius:22px}.founder-window-photo{max-width:190px;margin:0 auto}.founder-window-photo img,.founder-window-photo::after{border-radius:17px}.founder-window-signoff{align-items:flex-start;flex-direction:column}.founder-window-title{font-size:2.25rem}}
      `;
      document.head.appendChild(style);
    }

    const section = document.createElement('section');
    section.className = 'section section-founder-inline';
    section.id = 'about-founder';
    section.setAttribute('aria-labelledby', 'founder-inline-title');
    section.innerHTML = `
      <div class="shell">
        <div class="founder-window reveal">
          <figure class="founder-window-photo">
            <img src="https://d2ol7oe51mr4n9.cloudfront.net/user_3IQOKnTRxX22rPLfhCEsOdVJxTl/ae5475e9-b185-4db1-879c-73e0f1f4410a.jpg" alt="Ostap Vinkovskyi, founder of Revenue Pilots" width="1536" height="2048" loading="lazy" decoding="async">
          </figure>
          <div class="founder-window-copy">
            <p class="eyebrow"><span class="eyebrow-dash" aria-hidden="true"></span>The person behind Revenue Pilots</p>
            <h2 class="founder-window-title" id="founder-inline-title">I’m Ostap.</h2>
            <p class="founder-window-lead">I build creative for businesses that deserve to be noticed.</p>
            <div class="founder-window-story">
              <p>I started Revenue Pilots because I kept seeing the same problem: good businesses doing genuinely good work, but their advertising didn’t communicate that nearly as well as it could.</p>
              <p>I’ve always been drawn to creative work. I make music, build ideas from scratch, and spend a lot of time thinking about what makes someone stop, feel something, and pay attention. Revenue Pilots became a way to apply that same creative thinking to business.</p>
              <p>My goal isn’t to sell companies more marketing for the sake of marketing. It’s to understand what makes a business valuable, find the clearest way to communicate it, and turn that into creative people actually want to watch.</p>
            </div>
            <div class="founder-window-signoff">
              <div><p class="founder-window-name">Ostap Vinkovskyi</p><p class="founder-window-role">Founder, Revenue Pilots</p></div>
              <p class="founder-window-quote">“Make the business look as good online as the work it does in real life.”</p>
            </div>
          </div>
        </div>
      </div>`;

    const main = document.getElementById('main');
    const contact = document.getElementById('contact');
    if (contact && contact.parentNode === main) contact.insertAdjacentElement('afterend', section);
    else if (main) main.appendChild(section);
  };

  const applyRevenueMode = () => {
    ensureFounderWindow();

    const eyebrow = document.querySelector('.hero .eyebrow');
    if (eyebrow) eyebrow.innerHTML = '<span class="eyebrow-dash" aria-hidden="true"></span>Meta ad creative for home-service businesses';

    const heroSub = document.querySelector('.hero-sub');
    if (heroSub) heroSub.innerHTML = '3 custom vertical video ads built around your <strong>real offer, service area and brand</strong>.<br class="br-md">One-time pilot: <strong>$249</strong>.';

    const heroMicro = document.querySelector('.hero-micro');
    if (heroMicro) heroMicro.textContent = 'No contract. Ad spend separate. We guarantee the creative deliverables — not advertising results.';

    const wireCheckout = (btn, label) => {
      if (!btn) return;
      btn.removeAttribute('data-plan');
      btn.textContent = label;
      btn.onclick = () => window.location.assign(CHECKOUT);
    };

    document.querySelectorAll('.header-actions [data-plan="starter"]').forEach((btn) => wireCheckout(btn, 'Start $249 pilot'));
    document.querySelectorAll('.hero [data-plan="starter"]').forEach((btn) => wireCheckout(btn, 'Start $249 pilot'));
    document.querySelectorAll('.contact-ctas [data-plan="starter"]').forEach((btn) => wireCheckout(btn, 'Start $249 pilot'));

    const pricing = document.getElementById('pricing');
    const cards = Array.from(pricing?.querySelectorAll('.price-card') || []);
    if (cards[0]) {
      const card = cards[0];
      card.classList.add('price-card-featured');
      const name = card.querySelector('.price-name');
      const amount = card.querySelector('.price-amount');
      const pitch = card.querySelector('.price-pitch');
      const list = card.querySelector('.price-list');
      if (name) name.textContent = 'Starter Pilot';
      if (amount) amount.innerHTML = '<span class="price-value">$249</span> <span class="price-term">one-time</span>';
      if (pitch) pitch.textContent = 'One focused test before you commit to anything larger.';
      if (list) list.innerHTML = [
        '3 custom vertical video ads',
        '3 distinct hooks / creative angles',
        'Built around your real offer and service area',
        'Your branding + CTA copy',
        'Social-ready 9:16 exports',
        '1 revision round',
        'First drafts within 72 hours after required assets are received',
        'No contract or subscription'
      ].map((item) => `<li>${item}</li>`).join('');
      wireCheckout(card.querySelector('.btn'), 'Start Starter Pilot — $249');
    }
    cards.slice(1).forEach((card) => { card.hidden = true; card.style.display = 'none'; });

    if (pricing) {
      const grid = pricing.querySelector('.price-grid');
      if (grid) {
        grid.style.gridTemplateColumns = 'minmax(0, 620px)';
        grid.style.justifyContent = 'center';
      }
      const head = pricing.querySelector('.section-title');
      const sub = pricing.querySelector('.section-sub');
      const foot = pricing.querySelector('.price-foot');
      if (head) head.textContent = 'Start with one pilot.';
      if (sub) sub.textContent = 'No retainer decision. No annual commitment. First prove that the creative fits your business.';
      if (foot) foot.textContent = 'Secure checkout is handled by Stripe. Ad spend is separate and paid directly to the advertising platform.';
    }

    const stepsNote = document.querySelector('.steps-note');
    if (stepsNote) stepsNote.textContent = 'The 72-hour first-draft window starts after the required business details and usable assets are received.';

    Array.from(document.querySelectorAll('.faq-item')).forEach((item) => {
      const q = item.querySelector('summary')?.textContent || '';
      if (/cancel weekly/i.test(q)) item.remove();
      if (/roofing videos client work/i.test(q)) {
        const summary = item.querySelector('summary');
        const answer = item.querySelector('.faq-answer p');
        if (summary) summary.textContent = 'Is the portfolio client work?';
        if (answer) answer.textContent = 'The current examples are clearly labeled spec ads / concept demos. We do not present fictional work as client results.';
      }
    });

    const contactSub = document.querySelector('.contact-pitch .section-sub');
    if (contactSub) contactSub.textContent = 'Start with 3 custom vertical ads for $249. Prefer to ask a question first? Send the form and we will reply.';
    const contactMicro = document.querySelector('.contact-pitch .hero-micro');
    if (contactMicro) contactMicro.textContent = 'No contract. No subscription required. Ad spend separate.';

    const packageSelect = document.getElementById('lf-package');
    if (packageSelect) {
      packageSelect.innerHTML = '<option value="starter">Starter Pilot — $249 one-time</option><option value="not_sure">I have a question first</option>';
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyRevenueMode, { once: true });
  } else {
    applyRevenueMode();
  }
})();
