# Phase 3 execution evidence

> Later authorized execution: [current protected staging and acceptance evidence](../staging-execution/README.md). This report retains the earlier preparation findings.

Report completed 2026-11-16 (Africa/Casablanca). Machine artifacts retain their actual UTC execution timestamps; baseline and implementation checks began on November 15.

## Final local regression results

`npm run check:phase3` executed the following sequentially; [check-results.json](check-results.json) records exit codes and durations. All listed commands exited 0.

| Exact command | Passing | Failing | Evidence type |
| --- | --- | --- | --- |
| npm run typecheck | Passed | 0 errors | TypeScript |
| npm run lint | Passed | 0 boundary failures | Existing integration-boundary checker, not full ESLint |
| npm run test:leads | 43 tests | 0 | Mocked transport / application / SQL-source contracts |
| npm run test:demo | 2 tests | 0 | Pure scheduling |
| npm run test:phase2 | 17 tests | 0 | Profiles, localization, private API/source contracts |
| npm run build | Passed | 0 build failures | Production Vite artifact |
| npm run test:sites | 4 tests | 0 | Hosting artifact and worker |
| npm run report:bundles | Passed | 0 oversized JS chunks | Actual bytes and gzip, no field measurement |
| npm run test:smoke | 6 groups | 0 | Chromium / synthetic fixture |
| npm run test:phase2:browser | 10 groups | 0 | Chromium / synthetic fixture |
| npm run test:phase3 | 23 tests | 0 | Staging guards, private telemetry, real loopback HTTP + memory DB, recovery comparator |
| npm run report:release | Passed | 0 | Local code/lock/migration digest inventory |

**89 Node tests passed, 0 failed, 0 skipped; 16 Chromium workflow groups passed, 0 failed.** Groups contain multiple assertions and are not added to the Node count. `test:sites` was rerun successfully after the final ordinary build. The build still emits two upstream Zod PURE-comment warnings; they do not fail compilation. No source migration was executed by any test.

## Additional executed checks

- `node scripts/staging/verify-build.mjs`: passed. It invokes `npm run build:staging` with fictional server values, checks the compiled staging banner and absence of the supplied fake server secrets. [staging-build-results.json](staging-build-results.json) has exit 0 and both assertions true. The ordinary production build was rerun afterward; no staging artifact was deployed.
- `npm run audit:phase3`: final exit 0, **23 axe scans with 0 automatically detected violations**, plus two completed Lighthouse lab runs. See [accessibility-performance.md](accessibility-performance.md) and [audit-results.json](audit-results.json). Manual/incomplete checks remain; 0 automated violations is not WCAG certification.
- `npm run preflight:staging` without supplied configuration: intentional exit 2 with missing identity issues; no deployment/build initiated by this command.
- `npm run verify:staging:access`: intentional exit 2, status blocked, **0 real staging checks executed**; no approved staging/credentials. [Artifact](staging-access-results.json).
- `npm run verify:staging:workflow`: intentional exit 2, status blocked, **0 real staging checks executed**; separate synthetic-write approval and controlled receiver absent. [Artifact](staging-workflow-results.json).
- Targeted Phase 3 `git diff --check`: passed. Whole working-tree whitespace cleanliness is not claimed; prior marketing changes have pre-existing whitespace issues.
- Docker availability check: CLI present, daemon socket absent. No local PostgreSQL, migration, role test or restore rehearsal executed.

## Meaningful new coverage

Staging tests cover preview identity, distinct project/receiver guards, HTTPS/origin restrictions, WhatsApp false, missing configuration, authorization before network transport, exact admin JSON media type, privacy-safe logs/events, no implicit development-env loading, approval gates and unprotected hosting rejection. Recovery tests reject same/production targets, missing identity, schema/count/digest changes and explicitly decline to certify a backup from matching manifests alone.

Five receiver tests use real loopback sockets/fetch: unauthorized/non-synthetic rejection, CRM outage/recovery, concurrent duplicate receipt, lost acknowledgement deduplication, actual bounded timeout and eight-attempt exhaustion. Database storage in these tests is memory, not Supabase. Existing 43 backend tests cover database error responses, validation, idempotency, retry and WhatsApp behavior with deterministic doubles.

Both existing browser suites still cover bilingual owner routes and clinic profiles, appointment conflict/cancel/reschedule/calendar coherence, demo-request error/success, CMS/notes/stages, responsive widths and new-context isolation. Lazy route loading required replacing a synchronous calendar count assertion with a wait for the expected appointment; the workflow remains asserted.

## Development failures and limits

Initial baseline browser execution hit sandbox EPERM on localhost; the authorized rerun passed. New test fixtures initially had a malformed fake project reference, and the audit harness initially needed an explicit browser context and corrected navigation labels; these were fixed. Installed Sentry 11 types required the current data-collection options rather than older SDK option names. Initial axe scans detected contrast/target-size issues; the final scans reflect the fixes. No transient failure was presented as a final pass.

Not executed: clean-checkout `npm ci`, Firefox/WebKit, load tests, manual screen-reader certification, real-device tests, hosted protection checks, real Auth/RLS/DML, Supabase persistence/SQL concurrency, actual receiver/cron recovery, Sentry ingestion, backups/restoration or any deployment. No real patient data was used.
