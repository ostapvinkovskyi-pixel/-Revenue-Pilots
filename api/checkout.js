import Stripe from "stripe";

const OFFERS = {
  starter: {
    slug: "video_creative",
    name: "Revenue Pilots — Video Creative",
    amount: 150000,
    description: "One-time Video Creative package: 3 custom vertical 9:16 ads, 3 distinct hooks/creative angles, creative direction, branding + CTA copy, social-ready exports, and 1 revision round. First drafts within 72 hours after required usable assets are received. Ad spend not included."
  },
  website: {
    slug: "conversion_website",
    name: "Revenue Pilots — Conversion Website",
    amount: 350000,
    description: "One-time Conversion Website package: custom visual direction, responsive build, conversion architecture, lead capture, and core integrations. Custom additions outside the core package are quoted separately."
  },
  systems: {
    slug: "revenue_systems",
    name: "Revenue Pilots — Revenue Systems",
    amount: 350000,
    description: "One-time Revenue Systems package: lead capture workflow, follow-up, booking integration, pipeline/basic CRM, and core automation. Final implementation is limited to supported providers and the agreed core scope; custom additions are quoted separately."
  },
  full_build: {
    slug: "full_revenue_build",
    name: "Revenue Pilots — Full Revenue Build",
    amount: 750000,
    description: "One-time Full Revenue Build: Video Creative, Conversion Website, and Revenue Systems built as one connected core package. Custom additions outside the core package are quoted separately."
  }
};

function json(data, status = 200) {
  return Response.json(data, { status });
}

export default {
  async fetch(request) {
    if (request.method !== "GET") return json({ error: "Method not allowed" }, 405);

    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) return json({ error: "Checkout is not configured yet." }, 503);

    const url = new URL(request.url);
    const plan = url.searchParams.get("plan") || "";
    const term = url.searchParams.get("term");
    const offer = OFFERS[plan];

    if (!offer) return json({ error: "That package is not available for direct checkout." }, 400);
    if (term && term !== "one_time") return json({ error: "Revenue Pilots packages on this page are one-time purchases." }, 400);

    const stripe = new Stripe(secret);
    const origin = process.env.PUBLIC_SITE_URL || url.origin;
    const metadata = {
      plan,
      billing_term: "one_time",
      source: "revenue-pilots-website",
      offer_version: "fixed-packages-2026-09",
      offer: offer.slug
    };

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: "usd",
            unit_amount: offer.amount,
            product_data: { name: offer.name, description: offer.description }
          },
          quantity: 1
        }],
        success_url: `${origin}/order-success/?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/#packages`,
        phone_number_collection: { enabled: true },
        billing_address_collection: "auto",
        metadata,
        payment_intent_data: { metadata }
      });
      return Response.redirect(session.url, 303);
    } catch (error) {
      console.error("Stripe checkout error", error);
      return json({ error: "Checkout could not be started." }, 500);
    }
  }
};
