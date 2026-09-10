# Astra Handoff — Revenue Pilots Control Room

Astra owns the **presentation layer** after the engineering foundation is stable.

## Astra may change freely

- visual system, typography, spacing, color, surfaces, iconography
- information layout and responsive composition
- motion, transitions, micro-interactions and perceived responsiveness
- navigation presentation
- card/component styling
- empty/loading/error-state presentation
- interaction polish and accessibility improvements

The target is a premium, calm, highly legible owner experience that feels like the business is genuinely on autopilot — not a developer console.

## Engineering contracts Astra must not change without review

1. `src/domain.ts` domain/entity semantics and authorization-relevant status meanings.
2. `src/progress.ts` deterministic checkpoint percentages. Do not invent, smooth, interpolate, or AI-estimate progress.
3. Database schema, organization isolation, Row Level Security, and client-ownership boundaries.
4. Exact-target approval semantics: production approval is tied to the reviewed repository + PR + commit SHA + preview target. A new SHA invalidates the old approval.
5. Connection/security contract: Control Room stores status and non-secret metadata, not passwords, OAuth tokens, API keys, refresh tokens, or hidden credentials.
6. Client-owned single-tenant model and the rule that Revenue Pilots has no hidden/persistent backdoor after handoff.
7. Support access semantics: explicit, visible, scoped, time-limited and revocable.
8. Adapter boundary between provider-specific systems and the UI/domain model.

## Product behavior to preserve

The Home experience must make these answers obvious within seconds:

- Is Autopilot healthy?
- What work is active?
- What is the verified progress of that work?
- What is blocked?
- What needs me?
- Which pilots are running?
- What just happened?

Technical provider names should stay secondary unless the owner deliberately opens diagnostics.

## Visual direction

Premium/minimal, mobile-first, high signal-to-noise. Motion should communicate state and continuity, not decorate every surface. Avoid generic AI-dashboard aesthetics, excessive glowing graphs, fake metrics, or progress animations that imply unverified work.

Any proposal that changes a frozen engineering contract should be flagged for engineering review rather than implemented silently.
