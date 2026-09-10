# Revenue Pilots Control Room

Control Room is the owner-facing product layer for Business Autopilot. It should answer four questions in seconds:

1. What is working right now?
2. What is blocked?
3. What needs the owner's decision?
4. How far has each active job actually progressed?

It is intentionally **not** a technical dashboard for Make, GitHub, Claude, Vercel, or other infrastructure. Those systems are implementation details behind stable domain contracts.

## Dogfood first

Revenue Pilots is Client #001. We build and operate the internal instance first, observe failures and edge cases, and only then package the same architecture for customers.

## Core contracts

- `src/domain.ts` — stable organization, pilot, job, event, approval, connection, and support-access contracts.
- `src/progress.ts` — deterministic checkpoint-derived progress. Percentages are never guessed by AI.
- `supabase/migrations/001_core.sql` — organization-scoped persistence and membership-based RLS.
- `ASTRA_HANDOFF.md` — boundary between engineering contracts and visual/product polish.

The database is the operational source for the Control Room product. External systems publish normalized events/status changes through adapters; the UI reads the normalized domain model rather than depending directly on provider-specific payloads.

## Client-owned deployment model

Each external customer receives a **single-tenant, client-owned** deployment. The client owns the application project, database, business data, OAuth connections, secrets, and infrastructure accounts after handoff.

Revenue Pilots may receive temporary least-privilege implementation access during setup. That access must be explicit, auditable, scoped to the work, and revocable. After handoff it should be removed unless the client separately enables support access.

There is **no hidden Revenue Pilots backdoor** and no standing access requirement. Product/code updates must be deliverable through versioned code, migrations, and documented deployment steps without requiring persistent access to the client's business data.

## Support access

Managed support is optional. A support grant must be:

- explicitly enabled by the client,
- scoped to defined capabilities,
- time-limited,
- visible in Control Room,
- revocable by the client.

Support credentials or OAuth tokens are never stored in Control Room's business tables. `connections` stores only non-secret provider/status/account metadata.

## Security model

All business records are organization-scoped. Row Level Security uses authenticated organization membership. Owner/admin permissions are separate from ordinary membership. Operational events are append-oriented: authenticated sessions can read/append allowed events but cannot normally edit history.

Production approvals are exact-target decisions. An approval binds to a specific repository, pull request, commit SHA, preview URL, action, and job. A changed SHA requires a new approval.

## Provisioning

The core migration deliberately does not allow an ordinary browser session to bootstrap an organization/first owner membership. Initial provisioning belongs in a trusted server/admin path so a user cannot manufacture owner access through a permissive first-membership rule.

## Build strategy

Engineering comes first: stable domain contracts, deterministic progress, ownership/security boundaries, persistence, and adapters. Astra can then make the experience exceptional without rewriting those contracts. Visual changes must not weaken isolation, approval semantics, or progress truthfulness.
