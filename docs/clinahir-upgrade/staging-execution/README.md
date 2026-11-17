# Authorized protected staging execution — 2026-11-16

> Follow-up: [the actual Daily Command sandbox integration and hardening milestone](../next-milestone/README.md) supersedes this report's controlled-receiver-only status. It records the later owner-approved restore-target pause; this report's recovery evidence describes the completed earlier drill, not current restore-target availability.

This is the current execution record. Earlier Phase 1–3 preparation reports remain historical. The owner authorized isolated staging resources, the reviewed recovery/migration plan, synthetic integration acceptance, and a static bootstrap in the new hosting project's provider-labeled Production slot. **The existing Clinahir hosting project/domain and development credentials were not changed. No real patient information, live CRM, WhatsApp delivery or clinical imaging operation was activated.**

Protected application: [clinahir-staging.vercel.app](https://clinahir-staging.vercel.app). Vercel sign-in is required; private automation credentials are never included in links.

## Architecture and resource boundaries

- Existing React/TypeScript/Vite architecture and shared in-memory clinic demo remain intact.
- Supabase staging: `fsfqgionuuxykpoxhrdm`, owner-supplied project, verified through the connected Chrome account and actual Management API. Public application schema and migration history were empty before migration.
- Separate restore project: `xrfptjnsjckqgbvhvrwp`, `clinahir-staging-restore`, same verified organization, Free Nano. No paid upgrade was requested.
- Separate Vercel project: `clinahir-staging`, `prj_ncLXnX0fRpThugNz33klNz4Sskq3`. All-deployment SSO protection is configured and runtime protection was exercised. The approved static maintenance placeholder is its initial provider-labeled Production deployment; the application is a Preview. Only this staging alias was changed.
- Owner confirmed **no production Daily Command CRM is configured**. The guard now accepts an explicit absent-production declaration while still requiring the exact controlled HTTPS receiver, independent database identity, staging origin and disabled WhatsApp. Contradictory production-CRM configuration is rejected.
- Synthetic receiver lives behind the same hosting protection and a separate bearer credential. Its service-only RPC stores receipt IDs/fingerprints in `clinahir_staging_fixture`, separate from eight business tables. Failure modes are healthy, outage, timeout and accepted-but-unacknowledged. It is disabled outside explicit staging. This verifies the Clinahir delivery contract, **not the real Daily Command product**.

## Implemented and executed

1. Preserved seven reviewed migration hashes and applied those seven migrations to the exact empty staging target only. Provider-generated migration receipts were normalized to the original reviewed repository versions; [migration receipts](hosted-migrations.json).
2. Retrieved the official Supabase database CA from the connected dashboard. All database export/restore connections use `verify-full`; no TLS validation was bypassed.
3. Exported the actual hosted empty application baseline, checked its file checksum and restored it into the independent hosted target before migration: [baseline recovery](hosted-baseline-backup.json).
4. Created private synthetic owner/non-owner Auth accounts, without invitation emails. Verified actual Auth, anonymous/authenticated private-table and RPC denial, server-role access: [database checks](hosted-database-access.json).
5. Configured staging-only encrypted Preview variables, WhatsApp/telemetry disabled and private automation access. Created a sanitized, hashed deployment snapshot excluding `.env*`, private backups, original hosting link, Git and installed dependency trees. Vercel performed its remote dependency install/build: [deployment inventory](deployment.json), [configuration keys only](hosting-configuration.json).
6. Executed real hosted authorization, duplicate lead capture, version conflicts, lead edits/audit records and independently persisted CRM receipts: [access](hosted-access.json), [business workflow](hosted-workflow.json).
7. Exercised actual CRM outage, timeout, ambiguous acknowledgement, the real one-minute backoff, concurrent authenticated retry processors and one durable receipt per lead. Saved/published equivalent French/English staging CMS content and rejected stale versions: [failure/CMS acceptance](hosted-failure-acceptance.json).
8. Executed Playwright against the real protected site with no mocked APIs: languages, demo state isolation, mobile/tablet layouts and owner administration: [hosted browser](hosted-browser.json). Screenshots are private under `output/playwright/hosted-*.png`.
9. Exported hosted synthetic application data and receiver fixture; compared full-row ordered digests/counts for all ten tables and all constraints after independent restore. Reconciled target provider default grants and verified actual anonymous HTTP rejection plus retained server access: [hosted recovery](hosted-recovery.json).
10. Switched only the staging alias to the protected maintenance placeholder and back to the verified Preview, checking protection at both steps: [rollback drill](hosting-rollback.json). Disabled the temporary backup login and removed temporary read policies on both databases: [cleanup](recovery-cleanup.json).

## Important recovery finding

The first restored archive had correct data and constraints but inherited the target Supabase project's default browser table grants. This was a **real failed permission gate**, not a passing recovery. Explicit browser table/sequence/private-function grants were revoked to match the reviewed source. Actual restored anonymous HTTP checks then rejected access, RLS remained enabled and service access succeeded. The initial failed check is retained as `preRepairFailures`; final checks record the repaired result.

The target's provider-owned `public` schema, default ACLs and `rls_auto_enable` helper were preserved. Application grants must be reconciled explicitly on every future hosted restore. Do not blindly replay a public-schema dump into another Supabase project or interpret row equality as security verification.

## Test evidence

See [exact commands and final counts](testing.md). Local PostgreSQL rehearsal: **164 passed, 0 failed**. This is separately counted from hosted HTTP checks and Node tests.

The [operator runbook and environment inventory](operations.md) describe release, backup, permission reconciliation, rollback and activation requirements without secret values.

| Hosted gate | Passed | Failed in final run |
| --- | ---: | ---: |
| Empty baseline backup/restore | 6 | 0 |
| Supabase Auth/database access | 23 | 0 |
| Protected access/owner/non-owner/logout | 42 | 0 |
| Durable lead/duplicate/CRM/owner edits | 17 | 0 |
| Failure recovery/concurrent retry/bilingual CMS | 27 | 0 |
| Real hosted browser workflow groups | 4 | 0 |
| Staging alias rollback/forward restoration | 4 | 0 |
| Hosted application recovery, after grant repair | 37 | 0 |
| Temporary recovery access cleanup | 2 | 0 |
| Restored application routine/view/RLS definitions and privileges | 5 | 0 |

Recovery counts and role cleanup are recorded directly in their JSON artifacts. These counts have different scopes and must not be combined into a readiness percentage.

## Feature and integration matrix

| Area | Status and evidence boundary |
| --- | --- |
| Public bilingual website / synthetic clinic demo | Demonstrable locally and on protected staging; demo changes reset on reload |
| Supabase staging persistence / seven migrations | Verified with actual hosted calls and synthetic records |
| Owner authentication / non-owner rejection / logout replay | Verified on deployed staging APIs |
| Source private table/RPC isolation | Verified with independent anon key and actual non-owner Auth token |
| CRM request contract / outage / timeout / idempotency / retries | Verified against durable controlled receiver |
| Actual Daily Command CRM | **Unverified; owner states none configured** |
| Bilingual CMS draft/publish/version conflict | Verified on protected staging; currently contains clearly synthetic verification headlines |
| Hosted application data recovery | Verified after explicit permission reconciliation; Auth/Storage/infrastructure excluded |
| Hosting rollback | Verified maintenance fallback and return to Preview; not data rollback or previous application-version compatibility |
| WhatsApp / Sentry | Disabled; real delivery and telemetry remain unverified |
| Imaging/PACS/OHIF / actual clinical records | Excluded and not activated |

## Security and database report

- No production migrations, production keys, owner password resets or source-project pauses/deletions were performed. The source and restore accounts/credentials are dedicated staging identities.
- Private role keys/passwords/bypass credentials and backups are gitignored under `output/staging/`, mode 0600. They are not in browser source, reports or request URLs. Backup exports are private local files, **not an approved encrypted offsite retention system**.
- Export used a narrowly scoped expiring read-only login, not an owner-password change. Temporary RLS read policies applied only to that login and were removed. It is now NOLOGIN on both clusters.
- Staging-only receipt/control schema is a separate fixture SQL operation, **not one of the seven application migrations**. It is not a proposal for production deployment.
- Hosted backup covers public application objects/data and the synthetic receiver, not managed Auth records, Storage files, infrastructure, integration secrets or a provider PITR entitlement. Original migration history is evidenced separately in `hosted-migrations.json`; this archive does not constitute a complete provider disaster-recovery image.
- A final read-only comparison also matched application routine/view definitions, RLS tables/policies and private routine permissions across source and restore: [schema verification](restored-schema.json).
- Source/restore SSL enforcement was not changed; clients verified TLS, but provider-wide rejection of non-SSL connections remains a hardening task.
- Keep private automation access restricted to operators; rotate/revoke it after acceptance according to an agreed staging access policy. No bypass token is embedded in links or public assets.

## Production readiness gates and next milestone

| Gate | Evidence-backed assessment |
| --- | --- |
| Dedicated protected staging | Exercised successfully |
| Synthetic business persistence and controlled delivery recovery | Exercised successfully |
| Hosted data restore and private permissions | Exercised with documented grant repair; limited application scope |
| Existing functionality regression / build | See exact final local test report |
| Real CRM/WhatsApp provider acceptance | Not established |
| Production recovery retention, encryption, RPO/RTO and Auth/Storage restore | Not established |
| Performance / manual WCAG review | Earlier local performance below target; no new field CWV or complete manual certification |
| Clinical privacy, interoperability and legal review | Not established; no compliance claim |

**Next milestone:** owner/operator review of the protected demonstration, followed by a separately approved real Daily Command sandbox integration and operational hardening. Define encrypted backup retention and recovery objectives, rehearse managed Auth/Storage recovery if needed, review SSL enforcement/network controls, finish performance/manual accessibility work, and approve a production-specific migration/deployment runbook. Real clinical operations remain out of scope.

Historical account/quota/403 artifacts are retained for traceability. They no longer describe current staging access; no existing project was paused to bypass the earlier quota issue.
