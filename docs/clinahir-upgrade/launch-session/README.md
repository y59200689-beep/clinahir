# Pre-production session — 16 November 2026

Protected staging is operational with the approved human owner and mandatory MFA. **The full pre-production checklist is not complete and production was not activated.**

| Workstream | Verified outcome | Remaining gate |
| --- | --- | --- |
| Backups | Encrypted Drive upload, independent download/checksum/decryption; both approved recipients have reader access | Automated backup/retention execution, fresh recovery point, second-operator key custody and recovery drill; managed Auth/Storage recovery and measured RPO/RTO |
| Owner access | Human owner chose a private password and enrolled a verified TOTP factor; protected dashboard observed under approved email; former synthetic owner rejected | Production-specific access/recovery review; no production grant made |
| Performance/accessibility | Route/marketing splitting, reduced translation work, immediate hero text and deferred offscreen rendering; 31 automated axe scans without violations | Mobile lab LCP 6.50s/TBT 1.58s remains below target; full manual screen-reader/browser/accessibility checks incomplete |
| Production activation | Written credential/routing/activation/rollback review procedure; protected staging deployment and sandbox integration verified | Review actual production configuration, backup/migration evidence and monitoring; explicit approval of concrete live activation plan; no live CRM connection activated |

## Executed verification

- `npm run check:phase3`: TypeScript, boundary lint, build, 111 Node tests and 16 browser workflow groups passed. [Command receipts](local-checks.json). This lint is the existing integration boundary checker, not a full ESLint audit.
- `npm run test:phase3`: final provider-QR size regression included; 45 passed, 0 failed. An initial sandbox run failed five loopback receiver tests with EPERM; unrestricted rerun passed. The full gate also passed.
- `node scripts/staging/owner-ui-smoke.mjs`: 4 additional English/French browser groups passed, including mobile/tablet reflow, keyboard, errors and setup flow; 8 axe scans, zero violations. [Evidence](owner-ui.json). An initial harness used the wrong French accessible label; corrected to the dictionary label and rerun.
- `node scripts/staging/audit.mjs --launch-session`: 23 existing public/demo/admin axe scans, zero violations; two Lighthouse runs. [Audit](audit-results.json). Automated checks do not certify WCAG conformance.
- `node scripts/staging/verify-real-admin-mfa.mjs`: 16 actual Supabase Auth/local-handler checks passed with a disposable synthetic account, including one-time verification, private password setup, MFA enforcement, real OTP verification and stale assurance rejection. [Evidence](real-mfa.json). Initial provider enrollment exposed XML-prefixed 321KB SVG responses; bounded parsing/size handling was corrected and regression-tested.
- Human owner handoff: browser dashboard observed, approved identity shown, provider read-only check confirms one verified TOTP factor. No human password, setup secret or code was retrieved. [Acceptance](human-owner-acceptance.json).
- Protected new Preview deployed and dedicated staging alias switched: 9 access/target checks passed. [Access and rollback targets](preview-access.json), [immutable source inventory](deployment.json).
- `node scripts/staging/verify-connected-crm.mjs --launch-session`: 12 real cross-system sandbox checks passed after the new deployment, including concurrent duplicate capture, independent persistence/receipt reads, owner mapping and disabled WhatsApp. [Evidence](connected-crm-acceptance.json). Earlier outage/retry evidence remains in the previous milestone; not rerun in this session.
- Offsite ciphertext download/checksum/decryption passed; approved reader permissions independently verified. Portable key-file decryption also passed without implicit Keychain access or plaintext output. [Backup](offsite-backup.json), [sharing](offsite-sharing.json).
- Known configured staging secrets scanned against reports and the browser artifact: zero matches. This is a bounded known-value check, not a general secret audit. [Evidence](secret-check.json).

**Local totals: 111 Node tests, 20 browser workflow groups passed, zero final failures.** Operational/provider checks have separate scopes and are not added into a readiness percentage. No real patient data was used.

## Deployment and security boundaries

[Protected staging](https://clinahir-staging.vercel.app/admin) now targets the new Preview recorded in `deployment.json`. React/TypeScript/Vite is preserved. New server-side owner setup uses fresh provider-verified one-time email sessions, token-bound signed HttpOnly setup cookies and private password entry. Business endpoints require provider identity plus the verified factor and AAL2 when MFA is required. Setup and MFA fields are bilingual. Source/staging secrets remain server-only; no recovery key was uploaded to Drive.

No production database migration, live credential change, live CRM write, WhatsApp activation or clinical workflow was performed. The earlier isolated restore target remains paused. Existing provider warnings and broader CRM security review limits in the previous milestone still apply. Production leaked-password protection/plan decisions remain owner review items.

## Remaining operational work

Follow [encrypted recovery and retention procedure](recovery-runbook.md) and [production activation/rollback review](production-activation.md). The retention policy is proposed and documented, not an installed schedule. The second operator has archive access, but has not independently demonstrated recovery or acknowledged separate key custody. These are unresolved gates, not completed functionality.

The next work is to close these specific gates, rather than another redesign or new framework migration. Production activation remains a separate explicit approval after the concrete live configuration and acceptance plan are reviewed.
