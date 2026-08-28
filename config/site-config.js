// Revenue Pilots public front-end configuration.
// Safe public paths only. Secrets belong in Vercel environment variables.
window.RP_CONFIG = {
  CONTACT_EMAIL: "ostapvinkovskyi@gmail.com",
  LEAD_WEBHOOK_URL: "/api/lead",
  STRIPE_STARTER_URL: "/api/checkout?plan=starter",
  STRIPE_GROWTH_URL: "/api/checkout?plan=growth",
  STRIPE_WEEKLY_URL: "/api/checkout?plan=weekly"
};
