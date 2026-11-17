# Go / no-go decision

> Later authorized execution: [current protected staging and acceptance evidence](../staging-execution/README.md). This report retains the earlier preparation findings.

Decision recorded 2026-11-16. **GO for local demonstration and review of the prepared staging plan. NO-GO for remote staging actions until explicit approval and operational prerequisites; NO-GO for production/commercial activation.** No readiness percentage is assigned.

| Gate | Evidence / status |
| --- | --- |
| Existing platform preserved | React/TypeScript/Vite and Iris/Graphite remain; no unrelated rebuild or clinical backend |
| Local regression gate | 89 Node tests / 16 Chromium workflow groups passing; typecheck, boundary lint and ordinary build pass |
| Staging build/configuration | Synthetic-config build passes; banner and secret-isolation assertions pass; missing-config preflight blocks |
| Automatic accessibility | 23 axe scans, zero violations; incomplete/manual checks remain |
| Performance | Bundle reduced, but latest local Lighthouse LCP/TBT remain poor and variable; field data absent |
| Dedicated project and protected hosting | Not configured/authorized in this phase; declarations cannot establish actual isolation |
| Supabase/Auth/RLS | Actual staging checks not executed; no role/grant/DML, session expiry/replay or migration-history evidence |
| Durable business workflow | Mock/memory and loopback HTTP paths pass; real capture, SQL lease concurrency, CRM receipt/outage/recovery and CMS writes unverified |
| WhatsApp | Disabled and forbidden by staging guard; no delivery evidence required or claimed |
| Backups and rollback | Procedure/comparator prepared, no backup integrity or restore/deployment rehearsal |
| Operational response | Redacted logs and disabled optional Sentry prepared; operator/alerts/retention/ingestion unverified |
| Immutable release | Working tree contains prior and new uncommitted changes; reviewed release revision/sign-off required |
| Real patient operations | Explicitly excluded; demo directories/appointments remain in-memory prototypes |

## Exact external actions requiring owner authorization

Local preparation does not authorize any of these actions:

1. Select the Supabase organization, dedicated staging project/plan/region and a separate restore target; approve any cost before provisioning. Identify protected existing/production references privately. Provision disposable owner/non-owner users and privately configure their credentials/Auth settings.
2. Select the intended Vercel project/Preview environment, approve its secret/protection configuration and authorize deploying the reviewed immutable revision using `vercel.staging.json`. Verify all paths are protected; no production alias change.
3. Approve the exact seven migration hashes and target only after actual history/schema reconciliation and backup/restore prerequisites. Applying SQL remotely is a separate approval, never implied by this report or a passing local build.
4. Select/approve a controlled hosted CRM sandbox with durable receipt deduplication and a separate secret. Authorize synthetic leads and a controlled outage/recovery exercise only there; keep live sales routing and WhatsApp off.
5. Approve creating/revoking staging Auth sessions for access checks; separately approve synthetic business writes/stage/notes in the workflow harness. Setting an approval env flag is an operator step after actual owner approval, not a way to infer it.
6. Authorize backup/restore and deployment rollback rehearsals on the isolated targets; assign release/recovery operators. Optional Sentry/alert-provider activation also needs privacy/retention/recipient review.

## Prioritized next steps

| Priority | Next task | Acceptance evidence |
| --- | --- | --- |
| P0 | Owner resource/identity/approval review | Exact project/environment/receiver choices, protected existing identities, cost and action approvals recorded privately |
| P0 | Schema/security and recovery baseline | Actual migrations/indexes/constraints/RLS/grants, restricted-role reads/writes and backup restored consistently into another project |
| P0 | Protected staging deployment and access checks | Unauthenticated hosting rejected; dedicated owner/non-owner enforcement, secure session/expiry/logout-replay result and private draft protection |
| P0 | Synthetic business end-to-end acceptance | Fresh durable lead read, duplicates/concurrency, CRM outage and recovery with independent receiver receipt, terminal failure state and audit evidence |
| P0 before commercial launch | Resolve session-replay question and recovery/monitoring gaps | Immediate revocation proven or reviewed server-session remediation; operators and alert/recovery drills verified |
| P1 | Performance and remaining accessibility | Repeatable representative lab/real-device tests, main-thread reduction, manual screen-reader/contrast review; field data only after measurement approval |
| P1 | CMS and editorial/privacy review | Real staging draft/publish/conflict/recovery test; claims/notices/retention and operational contracts reviewed |
| Separate program | Any real clinical storage or multi-tenancy | Dedicated technical/security/legal/interoperability review; no patient information until approved |

Do not promote merely because local tests pass, an endpoint returns 200, an environment flag says staging, a provider accepts a request or a backup entry exists. Each operational gate requires actual evidence from the identified isolated infrastructure.
