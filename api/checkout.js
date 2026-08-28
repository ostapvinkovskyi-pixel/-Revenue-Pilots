import Stripe from "stripe";

const PLANS = {
  starter: {
    name: "Revenue Pilots — Starter",
    description: "3 custom vertical video ads + 2 launch-bonus video variations",
    amount: 24900,
    mode: "payment"
  },
  growth: {
    name: "Revenue Pilots — Growth",
    description: "6 custom vertical video ads + 2 launch-bonus video variations + 1 revision round",
    amount: 49900,
    mode: "payment"
  },
  weekly: {
    name: "Revenue Pilots — Weekly Ad Engine",
    description: "12 video ads per month with fresh creatives weekly",
    amount: 99900,
    mode: "subscription"
  }
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

    const stripe = new Stripe(secret);
    const url = new URL(request.url);
    const planKey = url.searchParams.get("plan");
    const plan = PLANS[planKey];

    if (!plan) {
      return json({ error: "Unknown plan" }, 400);
    }

    const origin = process.env.PUBLIC_SITE_URL || url.origin;

    const priceData = {
      currency: "usd",
      unit_amount: plan.amount,
      product_data: {
        name: plan.name,
        description: plan.description
      }
    };

    if (plan.mode === "subscription") {
      priceData.recurring = { interval: "month" };
    }

    const params = {
      mode: plan.mode,
      line_items: [{ price_data: priceData, quantity: 1 }],
      success_url: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#pricing`,
      phone_number_collection: { enabled: true },
      billing_address_collection: "auto",
      metadata: {
        plan: planKey,
        source: "revenue-pilots-website",
        launch_bonus: planKey === "starter" || planKey === "growth" ? "2-video-variations" : "none"
      }
    };

    if (plan.mode === "payment") {
      params.customer_creation = "always";
    } else {
      params.subscription_data = {
        metadata: {
          plan: planKey,
          source: "revenue-pilots-website"
        }
      };
    }

    try {
      const session = await stripe.checkout.sessions.create(params);
      return Response.redirect(session.url, 303);
    } catch (error) {
      console.error("Stripe checkout error", error);
      return json({ error: "Checkout could not be started." }, 500);
    }
  }
};