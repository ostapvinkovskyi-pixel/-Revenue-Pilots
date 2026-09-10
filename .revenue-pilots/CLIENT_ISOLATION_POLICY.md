# Client Isolation Policy

Revenue Pilots Builder Pilot must treat every client as an isolated workspace.

- A BUILD_JOB may reference only one canonical company_id and one exact target repository.
- Never reuse client credentials, environment variables, files, assets, or private data across companies.
- Client credentials remain in client-owned OAuth/provider secret stores whenever possible; they are never copied into Cloud OS prompts or build briefs.
- Revenue Pilots setup access must be least-privilege and revocable.
- A Builder job must refuse any instruction that would require exposing secrets or mixing client contexts.
- Production access is separate from build/preview access and remains owner-gated.
