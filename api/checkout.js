import Stripe from "stripe";

const VIDEO_CREATIVE = {
  name: "Revenue Pilots — Video Creative",
  amount: 150000,
  description: "One-time Video Creative package: 3 custom vertical video ads, 3 distinct hooks/creative angles, creative direction, branding + CTA copy, social-ready 9:16 exports, and 1 revision round. First drafts within 72 hours after required usable assets are received. No subscription. Ad spend not included."
};

function json(data, status = 200) {
  return Response.json(data, { status });
}

export default {
  async fetch(request) {
    if (request.method !== "GET") {
      return json({ error: "Method not allowed" }, 405);
    }

    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      return json({ error: "Checkout is not configured yet." }, 503);
    }

    const url = new URL(request.url);
    const plan = url.searchParams.get("plan");
    const term = url.searchParams.get("term");

    if (plan !== "starter") {
      return json({ error: "Only Video Creative is available for direct checkout." }, 400);
    }

    if (term && term !== "one_time") {
      return json({ error: "Video Creative is a one-time purchase, not a subscription." }, 400);
    }

    const stripe = new Stripe(secret);
    const origin = process.env.PUBLIC_SITE_URL || url.origin;
    const metadata = {
      plan: "starter",
      billing_term: "one_time",
      source: "revenue-pilots-website",
      launch_offer_version: "video-creative-v2",
      offer: "video_creative"
    };

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: "usd",
            unit_amount: VIDEO_CREATIVE.amount,
            product_data: {
              name: VIDEO_CREATIVE.name,
              description: VIDEO_CREATIVE.description
            }
          },
          quantity: 1
        }],
        success_url: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
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
