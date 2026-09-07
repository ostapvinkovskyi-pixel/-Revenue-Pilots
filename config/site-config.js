// Revenue Pilots — public routing configuration. No secrets live here.
window.RP_CONFIG = {
  CONTACT_EMAIL: "ostapvinkovskyi@gmail.com",
  LEAD_WEBHOOK_URL: "/api/lead",
  STRIPE_STARTER_URL: "/api/checkout?plan=starter&term=one_time",
  STRIPE_WEBSITE_URL: "/api/checkout?plan=website&term=deposit",
  STRIPE_SYSTEMS_URL: "/api/checkout?plan=systems&term=deposit",
  STRIPE_FULL_BUILD_URL: "/api/checkout?plan=full_build&term=deposit"
};

(function () {
  function wireWebsiteCheckout() {
    var checkout = window.RP_CONFIG.STRIPE_WEBSITE_URL;
    var links = document.querySelectorAll('a[href="/website-design/"], a[href="/websites/"]');
    links.forEach(function (link) {
      link.setAttribute("href", checkout);
      if (/see website build/i.test(link.textContent || "")) {
        link.textContent = "Start Website — $1,750 deposit";
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wireWebsiteCheckout, { once: true });
  } else {
    wireWebsiteCheckout();
  }
})();
