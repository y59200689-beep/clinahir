# Clinahir Phase 3 — protected staging preparation

> Historical preparation report. The later owner-authorized [protected staging execution](../staging-execution/README.md) now contains actual hosted deployment, migration, Auth/database, controlled CRM failure, recovery and rollback evidence. The blocked statements below describe the original preparation run.

Completed locally on 2026-11-16. **No remote project, deployment, credential/configuration change, migration, live lead delivery or clinical operation was performed.** No real patient data was used. Existing Phases 1–2 functionality and visual design are preserved.

Implemented: fail-closed preview/staging API checks; separate staging deployment config and secret-free templates; visible staging identity; approval-gated restricted-role/Auth and durable-business-workflow harnesses; controlled loopback CRM receiver/failure tests; privacy-safe logs and disabled optional Sentry; release/migration digests; recovery consistency tooling; accessibility fixes and lazy demo routes.

Evidence: **89 Node tests passed, 0 failed; 16 Chromium workflow groups passed, 0 failed; TypeScript, boundary lint and build passed.** The synthetic staging build passed with banner/secret assertions. Final axe audit: **23 scans, 0 automatically detected violations**. Lighthouse ran on local production artifacts; performance remains below target. No field CWV is reported.

Real staging integration verification is **blocked, not passed**: the two gated verifiers executed zero remote checks because approved target/configuration/credentials are unavailable. Backups and restoration are unverified. WhatsApp and Sentry remain disabled. Production activation is a no-go; see the evidence gates below.

## Reports

1. [Staging architecture](architecture.md)
2. [Environment setup, templates and owner actions](environment.md)
3. [Security findings and Auth/RLS evidence](security.md)
4. [Supabase, CRM and WhatsApp status](integrations.md)
5. [Exact test commands, counts and limits](test-results.md)
6. [Backup, restore and deployment/schema rollback](backup-rollback.md)
7. [Monitoring, thresholds and operator response](monitoring.md)
8. [Accessibility and performance findings](accessibility-performance.md)
9. [Go/no-go and next milestones](readiness.md)
10. This consolidated summary.

## Reproduce safe local checks

```sh
npm run check:phase3
npm run audit:phase3
node scripts/staging/verify-build.mjs
npm run build
npm run test:sites
```

The staging-build exercise uses fictional configuration and must be followed by the ordinary build if retaining the default local artifact. Tests require existing Playwright Chromium; browser workflow suites share 4181 and run sequentially. Audit uses 4182; stop any previous fixture on that port. No clean-checkout `npm ci` was executed; it remains a release gate. The audit's external asset blocking makes it reproducible/isolated, not representative field measurement.

`preflight:staging`, `verify:staging:access` and `verify:staging:workflow` intentionally exit 2 when missing explicit configuration/approval. Do not set approval flags merely to make a command green. Remote verification may only run after owner approval against dedicated staging; never load the existing `.env.local` to satisfy it.

Artifacts: [local checks](check-results.json), [axe/Lighthouse summary](audit-results.json), [bundles](bundles.json), [synthetic staging build](staging-build-results.json), [blocked access](staging-access-results.json), [blocked business verification](staging-workflow-results.json), [release/migration inventory](release-manifest.json). Full Lighthouse JSON is retained alongside these reports. Generated local screenshots under `output/playwright/` are gitignored.

**Next milestone:** approve isolated resources, protection and reviewed migration/recovery plan, then deploy a protected preview and run actual restricted-role plus synthetic persistence/CRM recovery acceptance. The local fixtures and simulated clinical profiles do not establish readiness for patient records.
