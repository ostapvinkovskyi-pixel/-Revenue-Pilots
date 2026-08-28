import Stripe from "stripe";

const PLANS = {
  starter: {
    name: "Revenue Pilots — Starter",
    monthlyAmount: 24900,
    annualAmount: 249000,
    description: "3 fresh custom vertical video ads per month. First month includes 2 bonus video variations."
  },
  growth: {
    name: "Revenue Pilots — Growth",
    monthlyAmount: 44900,
    annualAmount: 449000,
    description: "6 fresh custom vertical video ads per month with multiple creative angles and 1 revision round. First month includes 2 bonus video variations."
  },
  weekly: {
    name: "Revenue Pilots — Scale",
    monthlyAmount: 69900,
    annualAmount: 699000,
    description: "10 fresh custom vertical video ads per month with weekly delivery, ongoing hooks and angles, and 2 revision rounds."
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
    const term = url.searchParams.get("term") === "annual" ? "annual" : "monthly";
    const plan = PLANS[planKey];

    if (!plan) {
      return json({ error: "Unknown plan" }, 400);
    }

    const origin = process.env.PUBLIC_SITE_URL || url.origin;
    const annual = term === "annual";

    const priceData = {
      currency: "usd",
      unit_amount: annual ? plan.annualAmount : plan.monthlyAmount,
      recurring: { interval: annual ? "year" : "month" },
      product_data: {
        name: plan.name,
        description: `${plan.description} ${annual ? "Annual plan: pay for 10 months and receive 12 months of service." : "Monthly plan: cancel anytime before the next renewal."}`
      }
    };

    const params = {
      mode: "subscription",
      line_items: [{ price_data: priceData, quantity: 1 }],
      success_url: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#pricing`,
      phone_number_collection: { enabled: true },
      billing_address_collection: "auto",
      metadata: {
        plan: planKey,
        billing_term: term,
        source: "revenue-pilots-website",
        launch_bonus: planKey === "starter" || planKey === "growth" ? "first-month-2-video-variations" : "none"
      },
      subscription_data: {
        metadata: {
          plan: planKey,
          billing_term: term,
          source: "revenue-pilots-website"
        }
      }
    };

    try {
      const session = await stripe.checkout.sessions.create(params);
      return Response.redirect(session.url, 303);
    } catch (error) {
      console.error("Stripe checkout error", error);
      return json({ error: "Checkout could not be started." }, 500);
    }
  }
};