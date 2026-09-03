# Revenue Pilots — production website

Revenue Pilots is a **modular company site** (Site V2, 2026-09-03): one business, four buyable modules — video creative, websites, systems/automation, and a combined full build. A visitor can buy one module or the full system; each acquisition message and landing page stays narrow and relevant even though the company itself is broad. See `01_CONTEXT/OWNER_DECISIONS.md` in the V2 handoff pack for the full reasoning — it supersedes the older single-offer "revenue mode" freeze below wherever the two conflict.

Production: `https://www.revenuepilot.company`

## Current public offers

**Starter Pilot (video) — $249 one-time.** The only module with instant Stripe checkout.
- 3 custom vertical 9:16 video ads, 3 distinct hooks
- built around the customer's real offer, service area and brand
- 1 revision round; first drafts within 72 hours after required usable assets are received
- no contract / subscription; ad spend separate
- Revenue Pilots guarantees the creative deliverables, not advertising results

**Website Rescue** (from ~$500), **Website Build** (from ~$1.5k, scope-dependent), **Growth Systems** (custom-scoped), **Full Revenue Build** (from $10k, custom scope) all route through the lead form — quoted after a real review, never an instant checkout. Do not add Stripe checkout for these without an explicit pricing decision; do not promise unsupported SMS/telephony capability.

---

## Architecture

The front end is a static site. Sensitive operations run through same-origin Vercel Functions.

Route map:

- `/` → `home-v2.html` — modular router homepage (services, tabbed video/website work, packages, process, contact)
- `/video-ads/` — dedicated video-creative landing page (the full prior homepage content, preserved)
- `/websites/`, `/systems/`, `/full-build/` — dedicated service landing pages
- `/work/northline-hvac/`, `/work/crownline-auto/`, `/work/stone-shade-outdoors/` — public, indexable, **fictional** website concept demos (not real clients)
- `/previews/*` — private, noindex prospect previews; never linked from public nav, never listed as client work
- `/about/` and the standalone video SEO pages (`/ai-ugc-video-ads/`, `/beauty-video-ads/`, etc.) are unchanged

Shared front-end files:

- `css/styles.css` — shared design tokens/components (dark, gold accent)
- `css/portfolio-v3.css` — video showreel + portfolio grid (used by `/` and `/video-ads/`)
- `css/site-v2.css` — V2-only components (service cards, work tabs, concept cards, flow diagram)
- `js/main.js` — nav, reveal animation, checkout button wiring, lead form (unchanged)
- `js/portfolio-v3.js` — video portfolio behavior
- `js/site-v2.js` — Work-section tab switching on the homepage
- `config/site-config.js` — just the `window.RP_CONFIG` routing object now. It no longer force-rewrites page title/meta/hero copy at runtime (that "revenue mode" DOM-patching was removed in V2); each page sets its own correct `<title>`, meta and JSON-LD directly in its own `<head>`.

Current `config/site-config.js` public routing:

- `LEAD_WEBHOOK_URL` → `/api/lead`
- `STRIPE_STARTER_URL` → `/api/checkout?plan=starter&term=one_time`
- `CONTACT_EMAIL` → fallback contact only

Secrets must stay server-side in Vercel environment variables. Never place Stripe secret keys, Stripe webhook secrets, Make webhook URLs, Gmail credentials or other private credentials in front-end code.

---

## Lead flow

Website form → `/api/lead` → validated / normalized server-side → Make Master Intake → Google Sheets + internal alert + customer acknowledgement.

`package_interest` now accepts `starter`, `website_rescue`, `website_build`, `systems`, `full_build`, or `not_sure` (previously anything but `starter` collapsed to `not_sure`) so a V2 lead routes to the right conversation instead of landing as generic. Update the Make scenario's routing if it branches on this field.

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

The homepage `#work` section has two tabs, both public and both spec/concept work — never client case studies:

**Video tab** — the full 7-card portfolio grid (UGC, founder/app, testimonial, before/after, wellness, high-motion, cinematic), the hook-lab, and the legacy 3-card range (Home Services, Hospitality, E-commerce/Beauty). Preserved in full; not trimmed for the redesign.

**Websites tab** — 3 fictional public concept demos: Northline Heating & Air, Crownline Auto Care, Stone & Shade Outdoors, at `/work/<slug>/`. Fictional names, fictional contact details, labeled `Concept / Spec`. Real prospect previews under `/previews/*` stay private/noindex and are never shown here.

All examples are clearly presented as spec / concept work. Do not imply they are client case studies or attach fictional performance results.

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

## Current production status — 2026-09-03 (Site V2)

- production domain live and verified
- public $249 one-time Starter Pilot checkout live and unchanged
- verified Stripe webhook flow live and unchanged
- Make Master Intake live; `package_interest` enum widened (see Lead flow above) — confirm the Make scenario handles the new values before relying on routing by them
- lead / order Sheets live
- branded payment confirmation live
- original hero loop live, reused on both `/` and `/video-ads/`
- homepage rebuilt as a modular router (Site V2); `/video-ads/`, `/websites/`, `/systems/`, `/full-build/`, and 3 public fictional `/work/*` concept demos added
- all 4 private `/previews/*` prospect pages unchanged and still noindex
- ChatGPT → Make → Claude bridge tested and active
- Site V2 was built and locally QA'd on branch `site-v2-modular-homepage`; not yet merged to `main` or deployed — pending owner review

When this state changes intentionally, update this README so the repository does not become a second conflicting version of the business.
