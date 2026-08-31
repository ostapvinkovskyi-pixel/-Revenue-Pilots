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

  const applyRevenueMode = () => {
    const addAboutLink = (nav, beforeSelector) => {
      if (!nav || nav.querySelector('a[href="/about/"]')) return;
      const link = document.createElement('a');
      link.href = '/about/';
      link.textContent = 'About';
      const before = beforeSelector ? nav.querySelector(beforeSelector) : null;
      if (before) nav.insertBefore(link, before);
      else nav.appendChild(link);
    };

    addAboutLink(document.querySelector('.nav-desktop'), 'a[href="#contact"]');
    addAboutLink(document.getElementById('navMobile'), 'a[href="#contact"]');

    const footerContact = document.querySelector('.footer-contact');
    if (footerContact && !footerContact.querySelector('a[href="/about/"]')) {
      const separator = document.createTextNode(' · ');
      const about = document.createElement('a');
      about.href = '/about/';
      about.textContent = 'About Ostap';
      footerContact.appendChild(separator);
      footerContact.appendChild(about);
    }

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
