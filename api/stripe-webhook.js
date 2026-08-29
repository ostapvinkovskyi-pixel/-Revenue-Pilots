import Stripe from "stripe";
import { createHash } from "node:crypto";

const DEFAULT_MAKE_WEBHOOK_URL = "https://hook.us2.make.com/qbvey2ub4psm3u7gg1mswes2g2hog19h";
const MAKE_TOKEN_CONTEXT = "revenue-pilots-make-v1";

function safe(value) {
  return value == null ? "" : String(value);
}

function makeToken(secret) {
  return createHash("sha256")
    .update(`${secret}|${MAKE_TOKEN_CONTEXT}`)
    .digest("hex");
}

async function notifyMake(payload, internalSecret) {
  const makeUrl = process.env.MAKE_WEBHOOK_URL || DEFAULT_MAKE_WEBHOOK_URL;

  const response = await fetch(makeUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      make_token: makeToken(internalSecret)
    })
  });

  if (!response.ok) {
    throw new Error(`Make returned ${response.status}`);
  }
}

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const secret = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret || !webhookSecret) {
      return new Response("Stripe webhook is not configured", { status: 503 });
    }

    const stripe = new Stripe(secret);
    const signature = request.headers.get("stripe-signature");
    const rawBody = await request.text();

    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (error) {
      console.error("Invalid Stripe signature", error);
      return new Response("Invalid signature", { status: 400 });
    }

    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const email = session.customer_details?.email || session.customer_email || "";
        const name = session.customer_details?.name || "";
        const phone = session.customer_details?.phone || "";
        const paymentStatus = safe(session.payment_status || session.status);

        // Never open a production order until Stripe says this one-time Checkout is paid.
        // The launch checkout currently accepts card payments only, but keep this guard
        // so a future payment-method change cannot silently create unpaid orders.
        if (session.payment_status !== "paid") {
          await notifyMake({
            event_type: "payment_issue",
            stripe_event_id: event.id,
            stripe_event_type: event.type,
            session_id: safe(session.id),
            payment_status: paymentStatus || "not_paid",
            mode: safe(session.mode),
            plan: safe(session.metadata?.plan),
            amount: typeof session.amount_total === "number" ? session.amount_total / 100 : "",
            currency: safe(session.currency || "usd"),
            customer_name: safe(name),
            customer_email: safe(email),
            phone: safe(phone),
            stripe_customer_id: safe(session.customer),
            subscription_id: safe(session.subscription),
            verified: true
          }, webhookSecret);

          return new Response("ok", { status: 200 });
        }

        await notifyMake({
          event_type: "payment",
          stripe_event_id: event.id,
          stripe_event_type: event.type,
          session_id: safe(session.id),
          payment_status: paymentStatus,
          mode: safe(session.mode),
          plan: safe(session.metadata?.plan),
          amount: typeof session.amount_total === "number" ? session.amount_total / 100 : "",
          currency: safe(session.currency || "usd"),
          customer_name: safe(name),
          customer_email: safe(email),
          phone: safe(phone),
          business_name: "",
          website: "",
          service_area: "",
          stripe_customer_id: safe(session.customer),
          subscription_id: safe(session.subscription),
          verified: true
        }, webhookSecret);
      } else if (event.type === "invoice.payment_failed" || event.type === "customer.subscription.deleted") {
        // Kept defensively for any legacy subscription objects. The public launch
        // checkout no longer sells subscriptions.
        const object = event.data.object;
        await notifyMake({
          event_type: "payment_issue",
          stripe_event_id: event.id,
          stripe_event_type: event.type,
          payment_status: safe(object.status || "failed"),
          customer_email: safe(object.customer_email),
          stripe_customer_id: safe(object.customer),
          subscription_id: safe(object.subscription || object.id),
          verified: true
        }, webhookSecret);
      }
    } catch (error) {
      console.error("Webhook processing error", error);
      return new Response("Webhook processing failed", { status: 500 });
    }

    return new Response("ok", { status: 200 });
  }
};