# Builder Security Notes

- Claude Code runs only after a valid BUILD_JOB is routed to Builder Pilot.
- Use a repository secret or Anthropic-supported workload identity; never place credentials in workflow files, Cloud OS, prompts, issues, PR bodies, or logs.
- Keep Claude turn count bounded to prevent runaway API use.
- GitHub/Vercel preview work is allowed before production approval; production merge remains a separate exact-SHA owner gate.
- Any post-approval code change invalidates the approval.
