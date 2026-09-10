# Builder Pilot QA Policy

A build is not ready for owner review merely because code exists.

Minimum gates:
1. Builder implementation completed on isolated branch.
2. Repository validation/build commands run.
3. Pull request created or updated.
4. Vercel Preview deployment reaches READY/success.
5. Preview smoke QA passes.
6. Exact preview URL and commit SHA are recorded for review.
7. Production remains blocked until owner approval for that exact commit.

Generic preview smoke QA checks:
- preview returns a healthy HTTP response after redirects;
- response resembles an HTML website;
- no common fatal deployment/application error page is present.

Project-specific acceptance criteria from BUILD_JOB are additional required checks and override generic defaults when stricter.

Any new commit after owner review invalidates the prior approval and requires QA/review again.
