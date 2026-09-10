# Production Approval Policy

Builder Pilot may autonomously prepare code, tests, branches, pull requests, and preview deployments.

It may never autonomously:
- merge into `main` or another production branch;
- promote a preview to production;
- change production domains/DNS;
- change billing, pricing, or customer commercial terms;
- add paid services or spend money;
- expose or change secrets/credentials.

The only event that unlocks production is an explicit owner approval tied to the exact `job_id`, repository, pull request/commit, and preview being approved.

Approval must be treated as single-use. If code changes after approval, approval is invalidated and the new commit requires a new review/approval.

A production action must record:
- job_id
- company_id
- repository
- pull request number
- approved commit SHA
- preview URL
- approval timestamp
- approving owner

If any field is missing or the PR head SHA differs from the approved SHA, production remains blocked.
