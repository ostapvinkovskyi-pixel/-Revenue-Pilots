# Revenue Pilots Automation Control Files

This directory contains operating contracts for the Revenue Pilots Business Autopilot and Builder Pilot.

Core contracts:
- `BUILDER_JOB_SCHEMA.md` — required BUILD_JOB fields and state machine.
- `OWNER_APPROVAL_POLICY.md` — exact-SHA, single-use production approval.
- `QA_POLICY.md` — minimum build/preview QA gates.
- `CLIENT_ISOLATION_POLICY.md` — client data and workspace separation.
- `AUTONOMY_LEVELS.md` — bounded autonomy model.
- `BUILD_STATUS_CONTRACT.md` — canonical build states.
- `SECURITY_NOTES.md` — credential and spend safety.

These files are operating policy, not customer content. Never store passwords, API keys, OAuth tokens, client secrets, or payment credentials here.
