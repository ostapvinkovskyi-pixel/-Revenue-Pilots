# Revenue Pilots

Revenue Pilots sells video creative, websites, revenue systems and combined builds to small local service businesses, taking payment through Stripe Checkout and routing leads and paid orders to an automation backend. Terms below are the ones the code, copy and policy files actually use.

## Language

### Offers

**Offer**:
A purchasable package with a fixed server-side price, identified in code by a **plan** key.
_Avoid_: Product, SKU, tier, plan (in copy)

**Plan**:
The short key naming an offer in checkout links and metadata (`starter`, `website`, `systems`, `full_build`, `creative_engine`, `creative_scale`, and others).
_Avoid_: Package (in code), price ID

**Package**:
The customer-facing word for an offer and the label used by the lead form's **package interest** field.
_Avoid_: Plan (in copy)

**Creative Sprint**:
The four-week video offer (8 vertical ads plus 4 alternate hook cuts) sold through the legacy `starter` plan key.
_Avoid_: Starter Pilot (superseded name for a $249 three-ad offer), Starter

**Creative Engine / Creative Scale**:
Monthly subscription video offers with a recurring monthly delivery of ads.
_Avoid_: Retainer, weekly plan

**Conversion Website / Cinematic Website / Signature Interactive Website**:
The three website offers, ordered by scope of visual and interactive work.
_Avoid_: Website Build, Website Rescue (older quote-only names)

**Revenue Systems**:
The lead-capture, follow-up and workflow-automation offer.
_Avoid_: Growth Systems, automation package

**Full Revenue Build / Signature Revenue Build**:
The combined offers of website, systems, agent-powered lead workflow and launch creative.
_Avoid_: Full build (as a proper name), bundle

### Money

**Checkout session**:
A Stripe-hosted payment page created by the site for exactly one offer and billing term.
_Avoid_: Cart, order (a session is not an order)

**Billing term**:
How an offer is charged: `one_time`, `project_deposit` or `monthly_subscription`.
_Avoid_: Payment plan

**Project deposit**:
The 50% payment that reserves a website, systems or full-build project and is applied to its total price.
_Avoid_: Down payment, retainer

**Remaining balance**:
The unpaid other half of a project, due before final launch or delivery.
_Avoid_: Final payment (when it is not yet invoiced)

**Verified payment**:
A payment recognised only from a signature-verified Stripe webhook event, never from the success page.
_Avoid_: Confirmed by redirect, success-URL order

**Payment issue**:
A failed invoice, unpaid checkout, or cancelled subscription event that needs owner attention rather than automatic action.
_Avoid_: Failed order

**Internal test payment**:
A payment tagged as QA that must never be counted as customer revenue.
_Avoid_: Sandbox order

### Customers and records

**Lead**:
A business enquiry submitted through the site's contact form, carrying a **package interest**.
_Avoid_: Prospect (used for outbound targets), contact

**Package interest**:
The offer a lead says they are interested in, or `not_sure`.
_Avoid_: Plan interest

**Order**:
A record of a verified payment for one offer, held by the business's backend systems rather than the site.
_Avoid_: Checkout, purchase, transaction

**Onboarding**:
The step after payment where the customer sends business details, assets and access.
_Avoid_: Kickoff

**Delivery**:
Handing the customer the creative, website or system they bought; the company guarantees delivery, not advertising results.
_Avoid_: Results, performance

### Automation and control

**Cloud OS**:
The business's operating record.
_Avoid_: CRM, database

**Pilot**:
A named automation role (for example Builder Pilot, Delivery Pilot) that performs one class of work under owner-set limits.
_Avoid_: Bot, agent (loosely), Starter Pilot (an offer name, not a role)

**Autopilot**:
The overall business automation system made of the pilots and the Cloud OS.
_Avoid_: Workflow engine

**Build job**:
A structured, complete unit of website work handed to the Builder Pilot, identified by a job ID and company ID.
_Avoid_: Ticket, task

**Owner approval**:
An explicit, single-use decision by the owner tied to one exact commit, required before anything reaches production.
_Avoid_: Sign-off, merge approval

**Production gate**:
The check that a Builder Pilot change has passed preview QA and matches the owner-approved commit before it is merged.
_Avoid_: Release pipeline

**Preview**:
A non-production deployment used to review work before approval.
_Avoid_: Staging

### Showcase work

**Concept demo**:
A public, clearly labelled fictional website example under `/work/`, never a client case study.
_Avoid_: Case study, client work

**Private preview**:
A prospect-specific mock-up made for outreach.
_Avoid_: Portfolio piece

**Spec work**:
Creative made speculatively to show capability, labelled as such and carrying no performance claims.
_Avoid_: Results, testimonial

## Flagged ambiguities

- **Starter**: the code key `starter` now means Creative Sprint at $1,500, while README and older copy still describe a $249 "Starter Pilot"; use the offer names above.
- **Pilot** is both an automation role and, in the old "Starter Pilot", an offer; only the automation sense is current.
- **Plan / package / offer**: code and Stripe metadata say plan and offer, copy and the lead form say package; use offer as the concept, plan as the code key.
