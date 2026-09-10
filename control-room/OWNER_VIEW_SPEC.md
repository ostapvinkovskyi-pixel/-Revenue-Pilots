# Revenue Pilots Autopilot — Client Owner View

## Product rule

Owner View is the business-facing surface of the same Autopilot engine that powers the Revenue Pilots Operator / Control Room.

It is intentionally much simpler.

The owner should understand the state of the business in seconds without knowing Make, GitHub, Claude, webhooks, API calls, workflow runs, commit SHAs, deployment internals, or agent infrastructure.

The first screen must answer two questions immediately:

1. **Is everything okay?**
2. **Do you need me for anything?**

## Home

The canonical home experience is:

**Good afternoon, John**

A short natural-language briefing generated only from verified system facts:

> Everything is running normally. Since this morning, Autopilot handled 14 customer messages, followed up with 3 leads, booked 2 appointments, and flagged 1 item for you.

Then four simple blocks:

### Today / Overnight

A compact recap of outcomes, not technical executions.

Examples:
- 14 customer messages handled
- 3 leads followed up
- 2 appointments booked
- 1 payment received

### Needs You

Only owner decisions. This should be impossible to miss.

Examples:
- Sarah asked for custom pricing — Review
- Website change is ready — Review
- Payment issue needs a decision — Open

### Done for You

A reverse-chronological human-readable activity stream.

Examples:
- Replied to Michael about availability
- Sent James the available estimate times
- Followed up with Anna after no response
- Added Friday estimate to your calendar

Each item may drill into the underlying record when useful.

### Up Next

What the owner should expect next.

Examples:
- 2:30 PM — Roof estimate with Michael Torres
- Tomorrow 9:00 AM — Follow-up with Carter Homes
- Friday — Invoice reminder scheduled

## Main navigation

Keep primary navigation extremely small:

- **Home** — briefing, today, needs you, done for you, up next
- **Activity** — searchable history of what Autopilot did
- **Business** — Email, Leads, Calendar, Payments, Website / Operations as relevant to that company

Settings and Support are secondary.

## Business areas

### Email

Do not show workflow internals. Show business meaning:

- received today
- handled automatically
- informational
- needs owner

A conversation detail may say:

**Michael Torres**
Asked about availability
- Replied
- Sent available times
- Added follow-up

### Leads

Show:
- new
- awaiting reply
- follow-up scheduled
- qualified
- booked
- needs owner

### Calendar

Show today's schedule, upcoming meetings, and bookings Autopilot created or changed.

### Payments

Show received, pending, failed/needs attention, and relevant customer context. Never imply a payment succeeded unless verified by the payment provider event.

### Website / Operations

For businesses using website/build workflows, show the business outcome in plain language. Technical build state belongs in Operator View unless the owner deliberately opens diagnostics.

## Pilots

Pilots may appear, but only as understandable roles:

- Inbox Pilot — handles messages
- Lead Pilot — follows up with prospects
- Booking Pilot — schedules appointments
- Payment Pilot — watches payments
- Website Pilot — handles approved website work

Default pilot card:

**Inbox Pilot**
● Working
7 tasks today

The owner can open it to see recent actions, not infrastructure logs.

## AI briefing rule

AI is allowed to make the experience natural and conversational, but **AI is a narrator, not the source of truth**.

Every factual claim in a briefing must be backed by verified structured data or events.

AI must never invent:
- completed work
- meetings
- customer replies
- bookings
- payments/revenue
- progress
- failures
- saved hours
- counts

If evidence is incomplete, the briefing must say so rather than guess.

Useful briefing periods:
- overnight
- morning
- today
- end of day

## One engine, two views

### Operator / Control Room
For Revenue Pilots and authorized technical operators:
- jobs
- deterministic progress
- pilots
- sync
- QA
- exact-target approvals
- blockers
- system health
- diagnostics / provider details

### Client Owner View
For the business owner:
- what happened
- what was completed
- what is scheduled
- what needs them
- business areas

The two views use the same normalized underlying state. We do not maintain a separate fake demo data model for customers.

## Client ownership

Client Owner View inherits the client-owned single-tenant architecture:
- client owns data and infrastructure after handoff
- Revenue Pilots has no hidden backdoor
- support access is explicit, visible, time-limited and revocable
- updates should not require persistent access to customer business data

## Design direction

The final visual design is intentionally not frozen here.

Astra may make Owner View feel premium, calm, warm and extremely easy to read. Simplicity is more important than showing technical sophistication.

The emotional reaction we want is not "this AI system looks complicated." It is:

**"My business is being handled, I know what happened, and I know exactly when I need to step in."**
