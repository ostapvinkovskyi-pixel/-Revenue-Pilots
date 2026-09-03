// Revenue Pilots — public routing configuration.
// Shared by every page that wires up checkout buttons ([data-plan]) or the
// lead form (#leadForm) via js/main.js. Per-page SEO metadata (title,
// description, canonical, OG tags, JSON-LD) lives in each page's own <head>
// instead of being injected here, so it is correct even before JS runs and
// each page can carry its own facts.
window.RP_CONFIG = {
  CONTACT_EMAIL: "ostapvinkovskyi@gmail.com",
  LEAD_WEBHOOK_URL: "/api/lead",
  STRIPE_STARTER_URL: "/api/checkout?plan=starter&term=one_time"
};
