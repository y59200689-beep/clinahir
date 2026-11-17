# Staging execution — exact verification report

Final local gate: `npm run check:phase3`, completed 2026-11-16T10:33:17.334Z. All 12 commands exited 0. **94 Node tests passed, 0 failed**; **16 local browser workflow groups passed, 0 failed**.

| Command | Result | Node passed | Node failed |
| --- | --- | ---: | ---: |
| `npm run typecheck` | Passed | — | — |
| `npm run lint` | Passed | — | — |
| `npm run test:leads` | Passed | 43 | 0 |
| `npm run test:demo` | Passed | 2 | 0 |
| `npm run test:phase2` | Passed | 17 | 0 |
| `npm run build` | Passed | — | — |
| `npm run test:sites` | Passed | 4 | 0 |
| `npm run report:bundles` | Passed | — | — |
| `npm run test:smoke` | Passed | — | — |
| `npm run test:phase2:browser` | Passed | — | — |
| `npm run test:phase3` | Passed | 28 | 0 |
| `npm run report:release` | Passed | — | — |

Browser groups: `npm run test:smoke` = 6; `npm run test:phase2:browser` = 10. Both executed sequentially with fictional local fixtures. The production build and Sites packaging checks passed. Boundary lint is the existing repository custom lint, not ESLint.

## Additional executed commands

- `npm run test:postgres:rehearsal`: 164 actual isolated PostgreSQL checks passed, 0 failed.
- `node scripts/staging/remote-baseline-backup.mjs`: 6 hosted baseline checks passed.
- `node scripts/staging/apply-reviewed-migrations.mjs`: seven reviewed migrations applied to dedicated staging; all eight application tables have RLS.
- `node scripts/staging/hosted-database-access.mjs`: 23 actual Auth/database checks passed.
- `node scripts/staging/run-hosted-acceptance.mjs`: 42 access checks and 17 business checks passed.
- `node scripts/staging/hosted-failure-acceptance.mjs`: 27 real failure/retry/CMS checks passed.
- `node scripts/staging/hosted-browser.mjs`: 4 hosted Playwright workflow groups passed, 0 failed; no mocked API routes.
- `node scripts/staging/hosted-recovery.mjs`, followed by `node scripts/staging/verify-restored-permissions.mjs`: actual hosted restore, full-row/constraint equality and repaired permission verification passed. The first default-grant failure is retained in the artifact; it was not ignored.
- `node scripts/staging/rehearse-hosting-rollback.mjs`: 4 staging alias/protection checks passed.
- `node scripts/staging/finish-recovery.mjs`: both temporary backup logins disabled and temporary read policies removed.
- `node scripts/staging/verify-restored-schema.mjs`: 5 read-only routine/view/RLS/permission comparisons passed, 0 failed.

These operational scripts are target-pinned, stateful acceptance tools, not commands to rerun blindly. Application/source and hosted credential files remain private. Remote installer/build evidence is in the private Vercel CLI log; no separate fresh local npm ci was executed.

## Initial failures and fixes

Sandbox loopback restrictions caused EPERM; affected tests were rerun with the required permissions. A verified leftover fictional QA server occupied port 4181 and was stopped; graceful fixture shutdown was added. One calendar click timed out under concurrent work; isolated and final sequential suites subsequently passed. Hosted browser selectors were corrected to the actual existing admin inputs/navigation.

Backup TLS initially rejected the unrecognized database CA; the official dashboard certificate fixed this without disabling verification. Docker restore stdin attachment, provider-owned schema/default ACL/helper preservation, read-only sequence access, and target default browser grants were corrected and retested. Vercel first-Preview restriction required an explicitly approved protected static bootstrap. Automation-secret format, idempotent reuse and environment upload format were corrected before deployment. Alias propagation required bounded result polling.

## Limits

No real Daily Command or WhatsApp provider was verified. No patient, imaging, Auth/Storage full disaster recovery, paid backup/PITR entitlement, production deployment, field performance, new full axe scan or manual WCAG certification is claimed. Prior performance/manual accessibility findings remain open.
