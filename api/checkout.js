import Stripe from "stripe";

const OFFERS = {
  starter: {
    slug: "creative_sprint",
    name: "Revenue Pilots — Creative Sprint",
    amount: 150000,
    billing: "one_time",
    description: "Creative Sprint: a 4-week creative engagement with 8 original vertical 9:16 ads delivered as 2 per week, plus 4 alternate hook cuts for 12 ad-ready exports total. Includes hooks/scripts, CTA copy, captions/branding, social-ready exports, and one revision round per weekly batch. Built around the approved offer, audience and brand. Ad spend, paid talent/creator fees, whitelisting/partnership ads, product shipping and unusual third-party production costs are separate when required and approved in advance."
  },
  creative_engine: {
    slug: "creative_engine",
    name: "Revenue Pilots — Creative Engine",
    amount: 250000,
    billing: "subscription",
    interval: "month",
    description: "Creative Engine: 12 original vertical ads plus 12 alternate hook variations for 24 ad-ready exports per month, delivered in weekly batches. Includes scripts/CTA copy, captions/branding, monthly creative planning, performance-led iteration when usable client data is shared, and two revision rounds per month. Up to two products/offers. Renews monthly until canceled. Ad spend, paid talent/creator fees, whitelisting/partnership ads, product shipping and unusual third-party production costs are separate when required and approved in advance."
  },
  creative_scale: {
    slug: "creative_scale",
    name: "Revenue Pilots — Creative Scale",
    amount: 400000,
    billing: "subscription",
    interval: "month",
    description: "Creative Scale: 16 original vertical ads plus 16 alternate hook variations for 32 ad-ready exports per month, delivered in weekly batches. Includes scripts/CTA copy, creative testing map, performance feedback review when usable client data is shared, priority production, and two revision rounds per month. Up to three products/offers. Renews monthly until canceled. Ad spend, paid talent/creator fees, whitelisting/partnership ads, product shipping and unusual third-party production costs are separate when required and approved in advance."
  },
  website: {
    slug: "conversion_website",
    name: "Revenue Pilots — Conversion Website",
    amount: 350000,
    depositAmount: 175000,
    billing: "project",
    description: "Conversion Website package: custom visual direction, responsive desktop + mobile build, conversion architecture, lead capture, motion/interaction where it adds value, and core integrations. Total project price is $3,500. Custom additions outside the core package are quoted separately."
  },
  cinematic_website: {
    slug: "cinematic_website",
    name: "Revenue Pilots — Cinematic Website",
    amount: 550000,
    depositAmount: 275000,
    billing: "project",
    description: "Cinematic Website base package: everything in Conversion Website plus custom cinematic visual direction, scroll-controlled storytelling, advanced motion, and custom video/generated visual production as scoped. Base project price is $5,500. This deposit reserves the project and is applied to the base package total. Custom additions outside the base scope are quoted and approved separately before that extra work begins."
  },
  signature_interactive: {
    slug: "signature_interactive",
    name: "Revenue Pilots — Signature Interactive Website",
    amount: 750000,
    depositAmount: 375000,
    billing: "project",
    description: "Signature Interactive base package: bespoke interaction architecture, advanced scroll/pointer experiences, custom art direction, performance/mobile fallback planning, and real-time 3D/WebGL where included in the agreed base scope. Base project price is $7,500. This deposit reserves the project and is applied to the base package total. Unusually complex 3D, production, integrations or additions outside the base scope are quoted and approved separately before that extra work begins."
  },
  systems: {
    slug: "revenue_systems",
    name: "Revenue Pilots — Revenue Systems",
    amount: 350000,
    depositAmount: 175000,
    billing: "project",
    description: "Revenue Systems package: lead capture + routing, follow-up, booking integration, pipeline/CRM handoff, and core workflow automation. Total project price is $3,500. Final implementation is limited to supported providers and the agreed scope; custom additions are quoted separately."
  },
  full_build: {
    slug: "full_revenue_build",
    name: "Revenue Pilots — Full Revenue Build",
    amount: 1200000,
    depositAmount: 600000,
    billing: "project",
    description: "Full Revenue Build base package: a Cinematic Website, Revenue Systems, an agent-powered lead workflow, and Launch Creative built as one connected system. Launch Creative includes 8 original vertical ads plus 4 alternate hook cuts for 12 ad-ready exports. Base project price is $12,000. Exact providers, integrations and automation channels are confirmed during onboarding. Ad spend, paid talent, third-party subscriptions and custom additions outside the base scope are separate and approved before extra work begins."
  },
  signature_revenue_build: {
    slug: "signature_revenue_build",
    name: "Revenue Pilots — Signature Revenue Build",
    amount: 1500000,
    depositAmount: 750000,
    billing: "project",
    description: "Signature Revenue Build base package: everything in the Full Revenue Build, upgraded to a Signature Interactive Website with deeper bespoke interaction, custom visual production and more advanced workflow/integration architecture. Launch Creative includes 8 original vertical ads plus 4 alternate hook cuts for 12 ad-ready exports. Base project price is $15,000. Real-time 3D/WebGL, unusually complex production, advanced integrations, ad spend, paid talent and third-party subscriptions are included only when explicitly confirmed in the agreed scope or quoted separately before extra work begins."
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
    const term = url.searchParams.get("term") || "one_time";
    const offer = OFFERS[plan];

    if (!offer) return json({ error: "That package is not available for direct checkout." }, 400);

    const isSubscription = offer.billing === "subscription";
    if (isSubscription && term !== "monthly") {
      return json({ error: "This package is billed monthly." }, 400);
    }
    if (!isSubscription && !["one_time", "deposit"].includes(term)) {
      return json({ error: "That checkout option is not available." }, 400);
    }
    if (term === "deposit" && !offer.depositAmount) {
      return json({ error: "This package is paid in full at checkout." }, 400);
    }

    const isDeposit = !isSubscription && term === "deposit";
    const checkoutAmount = isDeposit ? offer.depositAmount : offer.amount;
    const remainingBalance = isDeposit ? offer.amount - offer.depositAmount : 0;
    const checkoutName = isDeposit ? `${offer.name} — 50% Project Deposit` : offer.name;
    const checkoutDescription = isDeposit
      ? `${offer.description} This payment is the 50% project deposit and is applied to the total price. The remaining balance is due before final launch/delivery of the completed project scope.`
      : offer.description;

    const stripe = new Stripe(secret);
    const origin = process.env.PUBLIC_SITE_URL || url.origin;
    const billingTerm = isSubscription ? "monthly_subscription" : isDeposit ? "project_deposit" : "one_time";
    const metadata = {
      plan,
      billing_term: billingTerm,
      source: "revenue-pilots-website",
      offer_version: "clarified-revenue-builds-2026-09",
      offer: offer.slug,
      total_project_amount: String(offer.amount),
      checkout_amount: String(checkoutAmount),
      remaining_balance: String(remainingBalance)
    };

    const lineItemPriceData = {
      currency: "usd",
      unit_amount: checkoutAmount,
      product_data: { name: checkoutName, description: checkoutDescription }
    };
    if (isSubscription) {
      lineItemPriceData.recurring = { interval: offer.interval || "month" };
    }

    const sessionParams = {
      mode: isSubscription ? "subscription" : "payment",
      payment_method_types: ["card"],
      line_items: [{ price_data: lineItemPriceData, quantity: 1 }],
      success_url: `${origin}/order-success/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#packages`,
      phone_number_collection: { enabled: true },
      billing_address_collection: "auto",
      metadata
    };

    if (isSubscription) {
      sessionParams.subscription_data = { metadata };
    } else {
      sessionParams.payment_intent_data = { metadata };
    }

    try {
      const session = await stripe.checkout.sessions.create(sessionParams);
      return Response.redirect(session.url, 303);
    } catch (error) {
      console.error("Stripe checkout error", error);
      return json({ error: "Checkout could not be started." }, 500);
    }
  }
};
