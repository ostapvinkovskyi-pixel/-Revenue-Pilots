# Revenue Pilots — production website

Revenue Pilots is currently in **revenue mode**: one ICP, one public offer, one checkout path.

Production: `https://www.revenuepilot.company`

## Current public offer

**Starter Pilot — $249 one-time**

- 3 custom vertical 9:16 video ads
- 3 distinct hooks / creative angles
- built around the customer's real offer, service area and brand
- branding + CTA copy
- social-ready exports
- 1 revision round
- first drafts within 72 hours after required usable assets are received
- no contract / subscription
- ad spend separate
- Revenue Pilots guarantees the creative deliverables, not advertising results

Do **not** re-enable Growth, Weekly, recurring tiers, multiple public packages or a different public niche without an intentional business decision. The current goal is to prove the Starter Pilot with a real customer first.

---

## Architecture

The front end is a static site. Sensitive operations run through same-origin Vercel Functions.

Core front-end files:

- `index.html`
- `css/styles.css`
- `js/main.js`
- `config/site-config.js`

Current `config/site-config.js` public routing:

- `LEAD_WEBHOOK_URL` → `/api/lead`
- `STRIPE_STARTER_URL` → `/api/checkout?plan=starter&term=one_time`
- `CONTACT_EMAIL` → fallback contact only

Secrets must stay server-side in Vercel environment variables. Never place Stripe secret keys, Stripe webhook secrets, Make webhook URLs, Gmail credentials or other private credentials in front-end code.

---

## Lead flow

Website form → `/api/lead` → validated / normalized server-side → Make Master Intake → Google Sheets + internal alert + customer acknowledgement.

A browser success state is never treated as proof that a lead was saved; server response is authoritative.

---

## Payment flow

Public checkout → `/api/checkout?plan=starter&term=one_time` → Stripe-hosted Checkout.

Payment truth comes only from the verified Stripe webhook flow:

Stripe → `/api/stripe-webhook` → signature verification → Make Master Intake → Orders sheet + owner alert + branded customer confirmation.

Never create a paid order from a browser success URL alone.

There is also a gated internal $1 live-payment QA path. Transactions tagged `internal_test=true` are QA only and must never be counted as customer revenue.

---

## Production environment variables

Required / used server-side:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `MAKE_WEBHOOK_URL`
- `PUBLIC_SITE_URL` when required by the checkout implementation

Real values belong in Vercel only. Do not commit them.

---

## Portfolio state

The public portfolio currently contains **three real spec / concept examples**:

1. Home Services
2. Hospitality
3. E-commerce / Beauty

All examples are clearly presented as spec / concept work. Do not imply they are client case studies or attach fictional performance results.

The old two empty / “in production” cards were removed. The desktop layout is intentionally sized for the three current cards.

---

## Hero phone media

The hero phone uses an **original Revenue Pilots-owned 5-second vertical loop** stored in:

- `assets/hero/hero-loop.mp4`
- `assets/hero/hero-loop-poster.jpg`

It replaced the third-party watch/product sample. Do not restore outside branded sample footage.

---

## Claims / honesty policy

Do not add:

- fake testimonials
- fake client logos
- invented customer counts
- invented ROAS / CTR / lead numbers
- fake awards, certifications or licences
- guaranteed ad results
- medical / insurance / financial claims that are not directly supported and approved

Use real client facts and approved offers only.

The operating promise is delivery of creative, **not guaranteed marketing performance**.

---

## Launch operating rules

Current sales focus: owner-led home-service businesses, initially Charlotte / Fort Mill and nearby markets.

Before spending Higgsfield credits on a speculative prospect teaser:

1. identify the real decision-maker
2. verify a current business trigger / useful creative angle
3. confirm a legitimate contact route
4. preflight generation cost
5. generate once first; no blind retries

The first milestone is a **real $249 customer payment**. Infrastructure, new tools, new niches and additional packages are lower priority unless they directly unblock sales, delivery, compliance or business memory.

---

## Operations / source of truth

Persistent business operations are organized in Google Drive under **Revenue Pilots — AIOS**.

The Drive AIOS contains the current operating rules, sales queue, client template, creative registry, orders, agent control, finance/legal records and dated reports.

ChatGPT is the primary operator / reviewer. Claude is available as a second execution and critique brain through the Make bridge. Claude should not independently spend credits, send outreach or change business strategy without review.

---

## Current production status — 2026-08-29

- production domain live and verified
- public $249 one-time checkout live
- verified Stripe webhook flow live
- Make Master Intake live
- lead / order Sheets live
- branded payment confirmation live
- original hero loop live
- 3-card portfolio layout fixed
- ChatGPT → Make → Claude bridge tested and active

When this state changes intentionally, update this README so the repository does not become a second conflicting version of the business.
