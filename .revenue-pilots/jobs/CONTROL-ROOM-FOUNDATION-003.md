# BUILD_JOB CONTROL-ROOM-FOUNDATION-003

Company ID: COMP-RP-INTERNAL

## Build brief
PHASE 1A ONLY. Work only under /control-room. Create exactly two engineering contract files and nothing else under control-room: 1) control-room/src/domain.ts with concise exported TypeScript types/enums/interfaces for Organization, Membership, Pilot, Job, JobStep, Event, Approval, Connection, SupportGrant. Include organization_id/organizationId on business records, explicit statuses, timestamps, and Approval exact-target fields for repository, pull request number, commit SHA and preview URL. Connection must store only provider/status/account label/metadata and never tokens, passwords or secrets. 2) control-room/src/progress.ts with deterministic Builder checkpoint map received=5, requirements_complete=15, queued=20, build_started=30, code_complete=60, validation_passed=72, preview_ready=82, qa_passed=92, owner_approved=97, production_live=100 plus typed helpers that return progress only from known checkpoints and fail/return undefined for unknown checkpoints instead of guessing. No UI, no package setup, no SQL, no docs in this phase. Existing root site untouched.

## Acceptance criteria
Exactly /control-room/src/domain.ts and /control-room/src/progress.ts plus generated Builder job control file may change. All requested domain contracts are exported. Progress percentages exactly match the stated checkpoint map and cannot accept arbitrary AI/freeform percentages. No secrets or real data. No root-site changes, external calls, sends or production deploy.

## Required final behavior
Follow CLAUDE.md. Work only in this branch. Do not merge or deploy production.
