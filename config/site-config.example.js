// Public front-end config. These are same-origin Vercel Function routes.
window.RP_CONFIG = {
  CONTACT_EMAIL: "you@example.com",
  LEAD_WEBHOOK_URL: "/api/lead",
  STRIPE_STARTER_URL: "/api/checkout?plan=starter",
  STRIPE_GROWTH_URL: "/api/checkout?plan=growth",
  STRIPE_WEEKLY_URL: "/api/checkout?plan=weekly"
};
