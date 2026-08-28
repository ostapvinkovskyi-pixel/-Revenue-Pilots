# Revenue Pilots — website

Static site. No build step, no dependencies, no framework. Three files do the work:
`index.html`, `css/styles.css`, `js/main.js`.

---

## Run it locally

```bash
cd revenue-pilots && python3 -m http.server 8092
```

Then open <http://localhost:8092/>.

Serve it over HTTP rather than opening `index.html` from the file system — `file://` breaks the
relative paths for the videos and the config script.

---

## Front-end routing: `config/site-config.js`

The public front-end now points only to same-origin Vercel Function routes. Live Stripe and Make secrets stay server-side in Vercel environment variables.

| Key | Used by | Status |
|---|---|---|
| `STRIPE_STARTER_URL` | every "Start for $249" / "Start Starter" button | `/api/checkout?plan=starter` |
| `STRIPE_GROWTH_URL` | "Start Growth — $499" | `/api/checkout?plan=growth` |
| `STRIPE_WEEKLY_URL` | "Start Weekly — $999/mo" | `/api/checkout?plan=weekly` |
| `LEAD_WEBHOOK_URL` | the contact form | `/api/lead` |
| `CONTACT_EMAIL` | fallback shown if the form fails | set |

`config/site-config.example.js` is the pristine template — keep it as the reference copy.

### How placeholders behave

A value counts as configured only when it is a real `http(s)://` URL with no `__ADD_` token left
in it. Until then:

- **Checkout buttons** do not navigate. They reveal a labelled development notice naming the exact
  config key to fill in.
- **The contact form** validates normally but refuses to send, and says so. It never shows a false
  success.

This is deliberate — nothing on the page ever pretends a payment or a lead succeeded.

---

## Lead payload

The form POSTs this JSON to `LEAD_WEBHOOK_URL`:

```json
{
  "name": "Jane Smith",
  "business_name": "ABC Roofing",
  "email": "jane@example.com",
  "phone": "704-555-0148",
  "website": "abcroofing.com",
  "service_area": "Charlotte, NC",
  "package_interest": "growth",
  "message": "Interested in weekly.",
  "source": "revenue-pilots-website",
  "page_url": "https://…"
}
```

Success is a 2xx response and nothing else. Non-2xx and network failures show an error state with a
`mailto:` fallback.

**Verify CORS when you wire the real webhook.** A browser `fetch` with
`Content-Type: application/json` sends a preflight `OPTIONS` request first. Make custom webhooks
normally handle this, but it is the one thing that can only be confirmed against the live URL. If
the browser blocks it, the form will correctly show its error state rather than failing silently.

---

## Security

`config/site-config.js` **is committed to the repo on purpose** — the site cannot run without it
and static hosts need it present. Everything in it is public by nature: Stripe hosted-Checkout
links and the Make webhook URL are both visible to anyone who views source in the browser. Keeping
the file out of git would hide nothing and only break deploys.

Because the webhook URL is effectively public, do not treat it as a secret. Put the protection on
the Make side — validate the payload shape, and add rate limiting or a shared token check inside
the scenario if you start seeing junk submissions.

Never put these in any front-end file:

- `sk_test_…` / `sk_live_…` / `rk_test_…` / `rk_live_…`
- Stripe webhook signing secrets
- Gmail or any mailbox credentials

There are no card fields on this site by design. Payment happens entirely on Stripe-hosted
Checkout. Payment truth comes from Stripe webhook events server-side — never from the browser
reaching a success URL.

---

## Assets

| Path | Notes |
|---|---|
| `assets/videos/*.mp4` | The three original 9:16 spec-ad demos, 1080×1920, silent. Kept as masters — nothing on the page links to these directly. |
| `assets/videos/card/*.mp4` | The same three demos, re-encoded to 720×1280 at a much lower bitrate for the portfolio carousel (~85% smaller, audio stripped since they're always muted). This is what the site actually serves. |
| `assets/posters/*.jpg` | Frames pulled at 0.6s from each video so cards paint instantly and never shift. |
| `assets/steps/step-*.jpg` | Small gold-glow visuals for the "Four steps" section, downscaled from 1254×1254 originals to 480×480. Rendered with `mix-blend-mode:screen` so the black background disappears into the page — do not add a white/light background behind them. |
| `assets/brand/revenue-pilots-monogram-logo.png` | The supplied logo, untouched. Used for social/OG. |
| `assets/brand/rp-monogram.png` | The monogram cropped from that logo for the header badge. Not redrawn — a crop and a downscale only. |

The logo's navy would disappear against the near-black header, so the monogram sits in a small
light badge (option 1 in the design system brief).

### The two "in production" portfolio cards

The Clothing/Product and Spa/Salon cards in the portfolio carousel don't have video yet — that's
deliberate. Producing that footage is a separate video-creation task; this repo only prepares the
website side. Each placeholder (`.work-card--soon` in `index.html`) is a hand-built CSS/SVG-free
gradient card, not a photo, so nothing needed generating to ship it.

To swap in the real thing once footage exists, replace one `<li class="work-card work-card--soon">`
block with the same markup pattern the first three cards use (`<video>` + `poster` + `spec-chip`),
pointing at a new `assets/videos/card/04-clothing-product.mp4` (or `05-spa-salon.mp4`) and a matching
poster. No JS or CSS changes are needed — `initWorkCarousel()` in `js/main.js` reads `.work-card`
generically by position, and `.video-frame` styling already applies to any card that contains a
`<video>`.

---

## Deploying

Upload the folder as-is to Netlify, Vercel, Cloudflare Pages, S3, or any static host. Keep the
directory structure — all paths are relative.

Before going live, set the four URLs in `config/site-config.js`.

---

## The hero composition

The floating artwork beside the headline is decorative (`aria-hidden`, `pointer-events:none`) and
is built entirely in CSS + inline SVG — no image files, nothing to download.

It deliberately contains **no metrics, charts, percentages, or performance figures**. It depicts
the deliverable instead: a 9:16 video frame, a format chip, and a "creative pack" card. If you
restyle it later, keep it that way — a "+142% engagement"-style stat would contradict the
"We guarantee delivery. Not results." block further down the page and breaks the claims policy.

It scales down at 1340px and 1180px, and is hidden below 1024px so the headline keeps the full
width on tablet and mobile.

## Honesty rules baked into the copy

There are no testimonials, client logos, ratings, review counts, awards, licences, years in
business, lead counts, or performance figures anywhere on this site. The only guarantee made is
delivery, and ad spend is stated as separate in four places. If you add copy later, keep it that
way — see `reference/claims-policy.md` in the build brief.

The roofing videos are labelled **SPEC AD / CONCEPT DEMO** on each card, the videos carry the same
label burned into the footage, and a disclosure under the section states the company is fictional.

---

## Vercel production wiring (added 2026-08-28)

This build now includes same-origin Vercel Functions:

- `/api/lead` validates the website form and forwards a normalized lead to Make.
- `/api/checkout?plan=starter|growth|weekly` creates a Stripe-hosted Checkout Session server-side.
- `/api/stripe-webhook` verifies Stripe's signature before forwarding paid-order/payment-issue events to Make.

Front-end buttons contain no Stripe secret and no Make webhook URL.

### Required Vercel environment variables

Set these in **Vercel → Project → Settings → Environment Variables**. Never commit real values:

- `STRIPE_SECRET_KEY` — live Stripe secret key; enter it directly in Vercel, never in chat or GitHub.
- `STRIPE_WEBHOOK_SECRET` — signing secret for the live Stripe webhook endpoint pointing to `https://YOUR_DOMAIN/api/stripe-webhook`.
- `MAKE_WEBHOOK_URL` — the active Revenue Pilot Master Intake webhook URL.
- `PUBLIC_SITE_URL` — optional canonical production origin, e.g. `https://revenuepilots.com`.

### Stripe webhook events

At minimum subscribe the production endpoint to:

- `checkout.session.completed`
- `invoice.payment_failed`
- `customer.subscription.deleted`

The endpoint validates the `stripe-signature` header against `STRIPE_WEBHOOK_SECRET` before Make ever sees a payment event.

### Videos

You can deploy before the final three portfolio videos are ready. Replace the files in `assets/videos/` and their posters later without changing the payment/lead integration.
