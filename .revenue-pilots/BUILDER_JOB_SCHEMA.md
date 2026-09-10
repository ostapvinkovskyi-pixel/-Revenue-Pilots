# Revenue Pilots BUILD_JOB Contract

Every autonomous website build must enter Builder Pilot with a complete structured job. Builder Pilot must refuse incomplete jobs instead of guessing.

Required fields:
- `job_id` — unique stable job identifier
- `company_id` — canonical Cloud OS company identifier
- `repository` — exact `owner/repo`
- `scope` — what is being built or changed
- `requirements_complete` — must be `true`
- `assets_ready` — must be `true`
- `acceptance_criteria` — concrete review criteria
- `priority` — LOW / MEDIUM / HIGH / P0
- `owner_approval_required_for_production` — always `true`

Recommended fields:
- `person_id`
- `brand_context`
- `reference_urls`
- `required_routes`
- `form_behavior`
- `mobile_requirements`
- `do_not_touch`
- `deadline`

State machine:
`READY_FOR_BUILD` → `BUILDING` → `VALIDATING` → `PREVIEW_DEPLOYING` → `QA` → `READY_FOR_OWNER_REVIEW` → (`CHANGES_REQUESTED` → build loop) or (`OWNER_APPROVED` → production merge/deploy) → `DONE`

Failure states:
`WAITING_FOR_CLIENT`, `WAITING_FOR_OWNER`, `BLOCKED`, `BUILD_FAILED`, `PREVIEW_FAILED`, `QA_FAILED`.

Production is never an implicit next step. Owner approval is a separate explicit event.
