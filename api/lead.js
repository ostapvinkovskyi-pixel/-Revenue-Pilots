import { createHash } from "node:crypto";

const REQUIRED = ["name", "business_name", "email"];
const DEFAULT_MAKE_WEBHOOK_URL = "https://hook.us2.make.com/qbvey2ub4psm3u7gg1mswes2g2hog19h";
const MAKE_TOKEN_CONTEXT = "revenue-pilots-make-v1";
const MAX_BODY_BYTES = 8192;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;
const rateBuckets = new Map();

function clean(value, max = 1000, multiline = false) {
  if (typeof value !== "string") return "";
  let out = value.trim().slice(0, max);
  out = multiline
    ? out.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    : out.replace(/[\u0000-\u001F\u007F]/g, " ");

  // Lead values are interpolated into raw-HTML notification emails downstream.
  // Angle brackets are not needed for a business enquiry and removing their
  // markup meaning prevents HTML injection without changing normal text.
  return out.replace(/</g, "‹").replace(/>/g, "›");
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

function clientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for") || "";
  return (forwarded.split(",")[0] || request.headers.get("x-real-ip") || "unknown").trim();
}

function tooManyRequests(ip) {
  const now = Date.now();
  const current = rateBuckets.get(ip);

  if (!current || now - current.startedAt > RATE_WINDOW_MS) {
    rateBuckets.set(ip, { startedAt: now, count: 1 });
    return false;
  }

  current.count += 1;
  rateBuckets.set(ip, current);

  if (rateBuckets.size > 500) {
    for (const [key, value] of rateBuckets) {
      if (now - value.startedAt > RATE_WINDOW_MS) rateBuckets.delete(key);
    }
  }

  return current.count > RATE_MAX;
}

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    const requestUrl = new URL(request.url);
    const origin = request.headers.get("origin");
    if (!origin || origin !== requestUrl.origin) {
      return json({ error: "Request origin not allowed" }, 403);
    }

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.toLowerCase().startsWith("application/json")) {
      return json({ error: "Content type not supported" }, 415);
    }

    const declaredLength = Number(request.headers.get("content-length") || 0);
    if (declaredLength > MAX_BODY_BYTES) {
      return json({ error: "Request too large" }, 413);
    }

    let rawBody;
    try {
      rawBody = await request.text();
    } catch {
      return json({ error: "Invalid request body" }, 400);
    }

    if (rawBody.length > MAX_BODY_BYTES) {
      return json({ error: "Request too large" }, 413);
    }

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }

    // Honeypot: bots commonly fill every field. Pretend success but create
    // no Make/Gmail/Sheets side effects.
    if (clean(body.company_url, 200)) {
      return json({ ok: true });
    }

    if (tooManyRequests(clientIp(request))) {
      return json({ error: "Too many requests. Please try again shortly." }, 429);
    }

    const makeUrl = process.env.MAKE_WEBHOOK_URL || DEFAULT_MAKE_WEBHOOK_URL;
    const internalSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!internalSecret) {
      console.error("Internal Make authentication secret is unavailable");
      return json({ error: "Lead intake unavailable" }, 503);
    }

    const email = clean(body.email, 254).toLowerCase();
    const packageInterest = clean(body.package_interest, 50);
    const lead = {
      event_type: "lead",
      name: clean(body.name, 120),
      business_name: clean(body.business_name, 160),
      email,
      phone: clean(body.phone, 80),
      website: clean(body.website, 300),
      service_area: clean(body.service_area, 200),
      package_interest: packageInterest === "starter" ? "starter" : "not_sure",
      message: clean(body.message, 3000, true),
      source: "revenue-pilots-website",
      page_url: clean(request.headers.get("referer") || requestUrl.origin, 500),
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
