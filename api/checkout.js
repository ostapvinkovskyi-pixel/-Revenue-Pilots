import Stripe from "stripe";

const PLANS = {
  starter: {
    name: "Revenue Pilots — Starter",
    oneTimeAmount: 24900,
    monthlyAmount: 24900,
    annualAmount: 249000,
    oneTimeDescription: "One-time launch pack: 3 custom vertical video ads plus 2 bonus video variations. No subscription required.",
    subscriptionDescription: "3 fresh custom vertical video ads per month. First month includes 2 bonus video variations."
  },
  growth: {
    name: "Revenue Pilots — Growth",
    oneTimeAmount: 49900,
    monthlyAmount: 44900,
    annualAmount: 449000,
    oneTimeDescription: "One-time growth pack: 6 custom vertical video ads plus 2 bonus video variations, multiple creative angles, and 1 revision round. No subscription required.",
    subscriptionDescription: "6 fresh custom vertical video ads per month with multiple creative angles and 1 revision round. First month includes 2 bonus video variations."
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
    const requestedTerm = url.searchParams.get("term");
    const term = requestedTerm === "annual"
      ? "annual"
      : (requestedTerm === "one_time" || requestedTerm === "pack")
        ? "one_time"
        : "monthly";
    const plan = PLANS[planKey];

    if (!plan) {
      return json({ error: "Unknown plan" }, 400);
    }

    const oneTime = term === "one_time";
    const annual = term === "annual";

    if (oneTime && !plan.oneTimeAmount) {
      return json({ error: "This package is only available as a subscription." }, 400);
    }

    const origin = process.env.PUBLIC_SITE_URL || url.origin;
    const unitAmount = oneTime
      ? plan.oneTimeAmount
      : annual
        ? plan.annualAmount
        : plan.monthlyAmount;

    const termDescription = oneTime
      ? plan.oneTimeDescription
      : `${plan.subscriptionDescription} ${annual ? "Annual plan: pay for 10 months and receive 12 months of service." : "Monthly plan: cancel anytime before the next renewal."}`;

    const priceData = {
      currency: "usd",
      unit_amount: unitAmount,
      product_data: {
        name: oneTime ? `${plan.name} Pack` : plan.name,
        description: termDescription
      }
    };

    if (!oneTime) {
      priceData.recurring = { interval: annual ? "year" : "month" };
    }

    const params = {
      mode: oneTime ? "payment" : "subscription",
      line_items: [{ price_data: priceData, quantity: 1 }],
      success_url: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#pricing`,
      phone_number_collection: { enabled: true },
      billing_address_collection: "auto",
      metadata: {
        plan: planKey,
        billing_term: term,
        source: "revenue-pilots-website",
        launch_bonus: planKey === "starter" || planKey === "growth" ? "2-video-variations" : "none"
      }
    };

    if (oneTime) {
      params.payment_intent_data = {
        metadata: {
          plan: planKey,
          billing_term: term,
          source: "revenue-pilots-website"
        }
      };
    } else {
      params.subscription_data = {
        metadata: {
          plan: planKey,
          billing_term: term,
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
