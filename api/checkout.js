import Stripe from "stripe";

const STARTER = {
  name: "Revenue Pilots — Starter Pilot",
  amount: 24900,
  description: "One-time pilot: 3 custom vertical video ads, 3 distinct hooks/creative angles, branding + CTA copy, social-ready 9:16 exports, and 1 revision round. First drafts within 72 hours after required assets are received. No subscription. Ad spend not included."
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
      return json({ error: "Only the Starter Pilot is available during the launch test." }, 400);
    }

    if (term && term !== "one_time" && term !== "pack") {
      return json({ error: "The Starter Pilot is a one-time purchase, not a subscription." }, 400);
    }

    const stripe = new Stripe(secret);
    const origin = process.env.PUBLIC_SITE_URL || url.origin;

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: "usd",
            unit_amount: STARTER.amount,
            product_data: {
              name: STARTER.name,
              description: STARTER.description
            }
          },
          quantity: 1
        }],
        success_url: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/#pricing`,
        phone_number_collection: { enabled: true },
        billing_address_collection: "auto",
        metadata: {
          plan: "starter",
          billing_term: "one_time",
          source: "revenue-pilots-website",
          launch_offer_version: "starter-pilot-v1"
        },
        payment_intent_data: {
          metadata: {
            plan: "starter",
            billing_term: "one_time",
            source: "revenue-pilots-website",
            launch_offer_version: "starter-pilot-v1"
          }
        }
      });

      return Response.redirect(session.url, 303);
    } catch (error) {
      console.error("Stripe checkout error", error);
      return json({ error: "Checkout could not be started." }, 500);
    }
  }
};
