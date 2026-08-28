# Revenue Pilots — fastest launch path

The site is already wired for Vercel Functions. Final portfolio videos can be replaced later without touching payments or lead automation.

## 1) GitHub → Vercel
Push this folder to a GitHub repository, import that repository into Vercel, and deploy.

## 2) Vercel environment variables
In Vercel → Project → Settings → Environment Variables add:

- `STRIPE_SECRET_KEY` — LIVE Stripe secret key. Paste it directly in Vercel only.
- `MAKE_WEBHOOK_URL` — Revenue Pilot — Master Intake webhook URL from Make.
- `PUBLIC_SITE_URL` — optional canonical production site URL.

Redeploy. At this point checkout can create live Stripe-hosted Checkout Sessions.

## 3) Stripe webhook
After the Vercel deployment has a stable URL:

1. Stripe Dashboard → Developers → Webhooks → Add endpoint.
2. Endpoint: `https://YOUR_DOMAIN/api/stripe-webhook`
3. Subscribe to:
   - `checkout.session.completed`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
4. Copy the webhook signing secret (`whsec_...`) directly into Vercel as `STRIPE_WEBHOOK_SECRET`.
5. Redeploy.

## 4) End-to-end QA before outreach
- Submit the website form once: verify a row appears in Revenue Pilot — Orders → Leads, Ostap gets an alert email, and the lead gets an acknowledgment email.
- Run a Stripe test/live checkout as appropriate and verify the paid order appears in Orders and both payment emails arrive.
- Never infer payment from the browser success page; the verified Stripe webhook is payment truth.

## 5) Portfolio videos
Replace the three MP4s/posters in `assets/videos/` and `assets/posters/` after the final Claude/Higgsfield exports are ready. This does not require changing the API/payment setup.
