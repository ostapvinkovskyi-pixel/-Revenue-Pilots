import Stripe from "stripe";

const STARTER = {
  name: "Revenue Pilots — Starter Pilot",
  amount: 24900,
  description: "One-time pilot: 3 custom vertical video ads, 3 distinct hooks/creative angles, branding + CTA copy, social-ready 9:16 exports, and 1 revision round. First drafts within 72 hours after required assets are received. No subscription. Ad spend not included."
};

const INTERNAL_TEST = {
  name: "Revenue Pilots — Internal $1 Payment Test",
  amount: 100,
  description: "Internal production payment-flow test. No service or deliverable is included."
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
    const testKey = url.searchParams.get("test_key");
    const isInternalTest = plan === "internal_test" && testKey === "rp-launch-1usd";

    if (plan !== "starter" && !isInternalTest) {
      return json({ error: "Only the Starter Pilot is available during the launch test." }, 400);
    }

    if (!isInternalTest && term && term !== "one_time" && term !== "pack") {
      return json({ error: "The Starter Pilot is a one-time purchase, not a subscription." }, 400);
    }

    const stripe = new Stripe(secret);
    const origin = process.env.PUBLIC_SITE_URL || url.origin;
    const offer = isInternalTest ? INTERNAL_TEST : STARTER;
    const metadata = isInternalTest
      ? {
          plan: "internal_test",
          billing_term: "one_time",
          source: "revenue-pilots-internal-test",
          launch_offer_version: "internal-1usd-v1",
          internal_test: "true"
        }
      : {
          plan: "starter",
          billing_term: "one_time",
          source: "revenue-pilots-website",
          launch_offer_version: "starter-pilot-v1"
        };

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: "usd",
            unit_amount: offer.amount,
            product_data: {
              name: offer.name,
              description: offer.description
            }
          },
          quantity: 1
        }],
        success_url: isInternalTest
          ? `${origin}/internal-payment-test.html?checkout=success&session_id={CHECKOUT_SESSION_ID}`
          : `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: isInternalTest
          ? `${origin}/internal-payment-test.html?checkout=cancelled`
          : `${origin}/#pricing`,
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
