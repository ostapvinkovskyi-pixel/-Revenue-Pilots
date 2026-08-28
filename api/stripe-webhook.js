import Stripe from "stripe";

function safe(value) {
  return value == null ? "" : String(value);
}

async function notifyMake(payload) {
  const makeUrl = process.env.MAKE_WEBHOOK_URL;
  if (!makeUrl) throw new Error("MAKE_WEBHOOK_URL is missing");

  const response = await fetch(makeUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
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

        await notifyMake({
          event_type: "payment",
          stripe_event_id: event.id,
          stripe_event_type: event.type,
          session_id: safe(session.id),
          payment_status: safe(session.payment_status || session.status),
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
        });
      } else if (event.type === "invoice.payment_failed" || event.type === "customer.subscription.deleted") {
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
        });
      }
    } catch (error) {
      console.error("Webhook processing error", error);
      // Return 500 so Stripe retries a temporary downstream failure.
      return new Response("Webhook processing failed", { status: 500 });
    }

    return new Response("ok", { status: 200 });
  }
};
