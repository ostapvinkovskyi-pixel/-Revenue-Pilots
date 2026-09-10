# Build Status Contract

Canonical Builder states:
- READY_FOR_BUILD
- BUILDING
- VALIDATING
- PREVIEW_DEPLOYING
- QA
- READY_FOR_OWNER_REVIEW
- CHANGES_REQUESTED
- OWNER_APPROVED
- BUILD_FAILED
- PREVIEW_FAILED
- QA_FAILED
- BLOCKED
- DONE

Every state transition must preserve job_id, company_id, repository, branch, current commit SHA when known, and last error when applicable.
