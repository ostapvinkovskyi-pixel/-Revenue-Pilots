import { createHash } from "node:crypto";

const REQUIRED = ["name", "business_name", "email"];
const DEFAULT_MAKE_WEBHOOK_URL = "https://hook.us2.make.com/qbvey2ub4psm3u7gg1mswes2g2hog19h";
const MAKE_TOKEN_CONTEXT = "revenue-pilots-make-v1";

function clean(value, max = 1000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function json(data, status = 200) {
  return Response.json(data, { status });
}

function makeToken(secret) {
  return createHash("sha256")
    .update(`${secret}|${MAKE_TOKEN_CONTEXT}`)
    .digest("hex");
}

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    const makeUrl = process.env.MAKE_WEBHOOK_URL || DEFAULT_MAKE_WEBHOOK_URL;
    const internalSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!internalSecret) {
      console.error("Internal Make authentication secret is unavailable");
      return json({ error: "Lead intake unavailable" }, 503);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }

    // Hidden honeypot. Bots that fill it are acknowledged but discarded.
    if (clean(body.company_url, 200)) {
      return json({ ok: true });
    }

    const lead = {
      event_type: "lead",
      name: clean(body.name, 120),
      business_name: clean(body.business_name, 160),
      email: clean(body.email, 254).toLowerCase(),
      phone: clean(body.phone, 80),
      website: clean(body.website, 300),
      service_area: clean(body.service_area, 200),
      package_interest: clean(body.package_interest, 50),
      message: clean(body.message, 3000),
      source: "revenue-pilots-website",
      page_url: clean(body.page_url, 500),
      make_token: makeToken(internalSecret)
    };

    if (REQUIRED.some((key) => !lead[key]) || !validEmail(lead.email)) {
      return json({ error: "Missing or invalid required fields" }, 400);
    }

    try {
      const upstream = await fetch(makeUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead)
      });

      if (!upstream.ok) {
        console.error("Make lead webhook returned", upstream.status);
        return json({ error: "Lead intake unavailable" }, 502);
      }

      return json({ ok: true });
    } catch (error) {
      console.error("Make lead webhook error", error);
      return json({ error: "Lead intake unavailable" }, 502);
    }
  }
};