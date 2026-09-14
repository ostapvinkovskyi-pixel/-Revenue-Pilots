import Stripe from "stripe";

function configuredN8nUrl() {
  const value = process.env.N8N_PAYMENT_WEBHOOK_URL;
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

function upstreamHeaders() {
  const headers = { "Content-Type": "application/json" };
  const token = process.env.N8N_WEBHOOK_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function forwardVerifiedEvent(event) {
  const n8nUrl = configuredN8nUrl();
  if (!n8nUrl) {
    throw new Error("N8N_PAYMENT_WEBHOOK_URL is unavailable or invalid");
  }

  const response = await fetch(n8nUrl, {
    method: "POST",
    headers: upstreamHeaders(),
    body: JSON.stringify(event),
    signal: AbortSignal.timeout(10000)
  });

  if (!response.ok) {
    throw new Error(`n8n payment webhook returned ${response.status}`);
  }
}

const FORWARDED_EVENTS = new Set([
  "checkout.session.completed",
  "invoice.paid",
  "invoice.payment_failed",
  "customer.subscription.deleted"
]);

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

    // Preview deployments are test-only. Never let a live Stripe event enter
    // the controlled integration test path.
    if (process.env.VERCEL_ENV === "preview" && event.livemode) {
      console.error("Blocked live Stripe event in preview", event.id);
      return new Response("Live events are not accepted in preview", { status: 409 });
    }

    if (!FORWARDED_EVENTS.has(event.type)) {
      return new Response("ok", { status: 200 });
    }

    try {
      // Forward the verified Stripe event object, not an untrusted request body.
      // n8n remains downstream of the signature-verification boundary.
      await forwardVerifiedEvent(event);
    } catch (error) {
      console.error("Webhook forwarding error", error);
      return new Response("Webhook processing failed", { status: 500 });
    }

    return new Response("ok", { status: 200 });
  }
};
