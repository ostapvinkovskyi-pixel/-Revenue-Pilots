const REQUIRED = ["name", "business_name", "email"];
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
  return out.replace(/</g, "‹").replace(/>/g, "›");
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function json(data, status = 200) {
  return Response.json(data, { status });
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

function upstreamHeaders() {
  const headers = { "Content-Type": "application/json" };
  const token = (process.env.N8N_WEBHOOK_TOKEN || "").trim();
  if (token) headers.Authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  return headers;
}

function configuredN8nUrl(name) {
  const value = process.env[name];
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
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

    if (clean(body.company_url, 200)) {
      return json({ ok: true });
    }

    if (tooManyRequests(clientIp(request))) {
      return json({ error: "Too many requests. Please try again shortly." }, 429);
    }

    const n8nUrl = configuredN8nUrl("N8N_LEAD_WEBHOOK_URL");
    if (!n8nUrl) {
      console.error("N8N_LEAD_WEBHOOK_URL is unavailable or invalid");
      return json({ error: "Lead intake unavailable" }, 503);
    }

    const email = clean(body.email, 254).toLowerCase();
    const packageInterest = clean(body.package_interest, 50);
    const KNOWN_PACKAGES = new Set([
      "starter",
      "website_rescue",
      "website_build",
      "video_creative",
      "systems",
      "full_build",
      "not_sure"
    ]);
    const lead = {
      event_type: "lead",
      name: clean(body.name, 120),
      business_name: clean(body.business_name, 160),
      email,
      phone: clean(body.phone, 80),
      website: clean(body.website, 300),
      service_area: clean(body.service_area, 200),
      package_interest: KNOWN_PACKAGES.has(packageInterest) ? packageInterest : "not_sure",
      message: clean(body.message, 3000, true),
      source: "revenue-pilots-website",
      page_url: clean(request.headers.get("referer") || requestUrl.origin, 500)
    };

    if (REQUIRED.some((key) => !lead[key]) || !validEmail(lead.email)) {
      return json({ error: "Missing or invalid required fields" }, 400);
    }

    try {
      const upstream = await fetch(n8nUrl, {
        method: "POST",
        headers: upstreamHeaders(),
        body: JSON.stringify(lead),
        signal: AbortSignal.timeout(8000)
      });

      if (!upstream.ok) {
        console.error("n8n lead webhook returned", upstream.status);
        return json({ error: "Lead intake unavailable" }, 502);
      }

      return json({ ok: true });
    } catch (error) {
      console.error("n8n lead webhook error", error);
      return json({ error: "Lead intake unavailable" }, 502);
    }
  }
};
