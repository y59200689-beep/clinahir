# Final staging work — 16 November 2026

## Latest production preparation

The production application backup gate is now closed: encrypted export, approved private offsite storage/readback, isolated restore/cleanup, exact recovery-reader sharing and owner-confirmed off-Mac key custody are recorded in [production backup authorization](production/backup-authorization.json). The earlier access-denied statements below describe historical attempts.

The production upgrade is prepared and locally rehearsed against that restored backup: [migration plan and exact candidate](production-migration-plan.md), [95-check rehearsal](production/migration-rehearsal.json), and [preparation acceptance](production/migration-preparation-acceptance.json). A fresh read-only application catalog matched the baseline. No hosted migration or production permission change occurred. Production configuration/security, operations, release acceptance and explicit activation approval remain separate gates; activation is still blocked.

The compatible local engineering work is complete and the protected staging release is documented here. **Production activation remains explicitly blocked by the owner. This is not a claim of production or clinical readiness.**

## Verified outcomes and limits

| Area | Executed outcome | Limit / remaining acceptance |
| --- | --- | --- |
| Owner access | Approved human owner chose a private password, enrolled verified TOTP and opened the protected dashboard; mandatory MFA configured | Earlier actual human acceptance remains in the launch-session evidence; credentials were not retrieved or changed by the agent |
| Offsite backup | Fresh restricted-role PostgreSQL export, AES-256-GCM encryption, Drive upload, independent readback/decryption and separate portable-key restore | Application/fixture schemas only; managed Auth/Storage and an always-on production RPO/RTO are not established |
| Retention/schedule | Daily desktop job configured for 09:00; 14 daily / 8 weekly / 12 monthly policy, newest two and pinned points retained; 7 retention tests passed | Local Mac/Codex/Docker/Keychain availability required. First future scheduled run and an expired-file Trash action have not yet occurred. Permanent deletion is prohibited |
| Recovery operator | Recovery Google account observed on Drive; actual downloaded archive checksum matched; assisted restore from that download passed 34 checks and removed its isolated container | Agent-assisted execution is explicit. An unassisted human restore receipt and durable off-Mac key custody are not certified |
| Loading | Build-time public hero and public admin sign-in HTML, hydration, deferred demo/marketing chunks, optional background motion and still landscape | Lab measurements, not field Core Web Vitals or authenticated-dashboard performance certification |
| Accessibility | Sampled Safari keyboard navigation, focusable skip target, native modal/labels/Escape, localized French chart descriptions; automated desktop/mobile/tablet checks | VoiceOver was stopped at the owner's request and its OS switch confirmed off. No custom VoiceOver website feature was added; full screen-reader/WCAG certification and a numeric manual 200% zoom audit are not claimed |
| Marketing accuracy | Removed unsupported uptime/SLA, CNDP-certification and guaranteed ranking/results copy; prototype visuals and calculator assumptions are explicitly fictional | Owner-authored CMS material and any future commercial claims still require editorial/legal review |
| Production review | Existing live hosting IDs/deployment rollback targets and environment-variable names inspected read-only; exact review/rollback plan documented | Production Supabase denied both connections (403). Owner chose to keep activation blocked. Actual live secret validity, recipient mapping, database policy and delivery remain unverified |

## Final loading measurements

Three sequential cold lab samples per page used the standard mobile profile and the actual Lighthouse desktop preset. Median results:

| Page | LCP | Total blocking time | CLS |
| --- | --- | --- | --- |
| public-mobile | 1.05 s | 38.5 ms | 0.0015 |
| admin-login-desktop | 0.33 s | 0.0 ms | 0.0000 |

[All samples and device/throttling settings](performance-summary.json). The final medians meet the local LCP/TBT/CLS targets. Individual lab runs varied with host load; these are not field measurements. Earlier desktop-labeled audits changed form factor without the full desktop throttle preset; this final benchmark corrects that configuration and supersedes those desktop comparisons.

## Implementation

React/TypeScript/Vite is preserved. This is build-time prerendering, not a new runtime SSR framework or Vike migration. Only public hero/sign-in markup is generated: no owner session, lead, patient record, credential or integration response enters static HTML. `/admin` and `/admin/` map to the dedicated public `admin.html` in the staging hosting configuration; private APIs still verify identity and MFA on every call.

The synthetic demo remains mounted after first reveal, so lazy loading preserves appointment/profile state. Hash navigation reveals deferred sections, the skip link focuses the demo, and an explicit pre-hydration language choice takes precedence over saved preference restoration. The landscape uses a still frame from the existing asset; background video requires an explicit action and honors reduced motion. No new application runtime dependency was added.

The backup command opens the pre-existing exact-target export role with a short expiry and SELECT-only temporary grants/policies, encrypts in memory, writes only ciphertext and closes/revokes access in finally. Cleanup is attempted even after an ambiguous grant-transaction acknowledgement. The recovery command has no implicit Keychain, database or hosting access and restores only into a disposable local PostgreSQL container with networking/ports disabled. See [backup operating procedure](backup-operations.md).

## Exact verification

| Command / evidence | Result |
| --- | --- |
| `npm run check:phase3` | All 12 commands passed: TypeScript, boundary lint, 43 lead/admin tests, 2 scheduling tests, 17 phase-2 tests, build, 4 Sites tests, bundle report, 6 smoke groups, 10 phase-2 browser groups, 52 phase-3 tests, release inventory |
| `node scripts/staging/owner-ui-smoke.mjs --final-gates` | 4 English/French owner browser groups passed; 8 axe scans without violations |
| `node scripts/staging/prerender-smoke.mjs` | 4 groups passed: public/no-JS HTML, private-data-free sign-in shell, early language choice/hydration and deferred navigation/mobile/keyboard/reduced-motion behavior |
| `node scripts/staging/final-performance.mjs` | Six sequential measurements completed; three per page, proper device presets and recorded medians |
| `node scripts/staging/audit.mjs --final-gates` | See [final audit](audit-results.json) for 23 public/demo/admin scan states and two Lighthouse measurements; do not treat lab scores as a readiness percentage |
| `node --test tests/backup-retention.test.mjs` | 7 passed, included in the 52 phase-3 tests, not counted twice |
| `node scripts/staging/create-offsite-backup.mjs` | Fresh export/encryption/readback checks passed and restrictedRoleClosed true; [receipt](fresh-backup.json) |
| `node scripts/staging/record-offsite-backup.mjs` | Actual Drive download checksum/decryption passed and verified catalog registered; [receipt](offsite-acceptance.json) |
| `node scripts/staging/operator-recovery-drill.mjs … --agent-rehearsal` | 34 isolated restore/data/privacy checks passed. [Initial rehearsal](agent-restore-rehearsal.json), [assisted recovery-account download](assisted-operator-recovery.json) |
| Protected staging release/access | [Immutable source/deployment receipt](deployment.json), [alias/protection and rollback targets](preview-access.json) |
| Real Daily Command sandbox forwarding | [12 synthetic cross-system checks](connected-crm-acceptance.json); live CRM not used for writes |
| Production metadata | [Hosting/name inventory](production-config-review.json), [database-access result](production-database-review.json) |

**Final local totals: 118 Node tests passed, 0 failed; 24 browser workflow groups passed, 0 failed.** Operational checks have distinct scopes and are not combined into a percentage. Lint is the existing integration boundary checker, not a full ESLint rule set.

Initial failures are retained honestly: Docker was stopped during export/recovery attempts; temporary role cleanup was confirmed and the successful archive was then exercised with the runtime available. A TypeScript dictionary lookup was corrected. New smoke selectors were corrected for hidden desktop navigation/CTAs at mobile widths; the targeted test also caught a real pre-hydration locale race, which was fixed and rerun successfully. These initial attempts do not count as passing runs. No success is inferred merely from an API function or a configured future job.

## Production review and rollback

[Concrete review and rollback requirements](production-review.md) records the inspected live project/deployment identities, missing mandatory-MFA configuration, required dedicated production identities, public admin rewrite, safe migration/backup gates and integration acceptance boundary. No live deployment, production migration, credential mutation or clinical activation occurred. Staging keeps its own protection, noindex headers, distinct database/CRM resources and disabled WhatsApp.

The prior hosted recovery target remains paused by the owner's earlier approval. Provider leaked-password protection/plan warnings and broader Daily Command review limits from previous reports remain relevant; no paid plan was activated to clear them. Actual healthcare operations, PACS/DICOM/OHIF and legal compliance certification are outside this release.

## Remaining owner-controlled acceptance

- Production stays blocked until the owner changes that decision and supplies authorized review access. Do not reactivate it automatically.
- For independent operational acceptance, another operator must retain the key separately and run/acknowledge recovery without the agent executing it. This session proves the assisted technical workflow and recovery-account download, not unassisted participation.
- The scheduled desktop job must report its real future successes/failures. Move to an approved always-available executor before making production recovery promises that exceed desktop availability.

## Read-only Brave follow-up

The owner subsequently supplied browser access to **ysfkhaourimahir@gmail.com’s Org**. The project named **clinahir** is `jsagrvxgydvhdoxibzny`, differing from the old guard reference. Browser inspection confirmed an older public schema and only two visible migration-history entries. [Read-only findings](brave-production-project-review.json) and [forward-only migration preparation](production-migration-plan.md) supersede the earlier “no browser access” limitation, but do not verify sealed Vercel runtime bindings or grant API/CLI access. Production activation remains blocked; no live changes occurred.

## Owner confirmation of production binding

The owner confirmed that Vercel uses `jsagrvxgydvhdoxibzny`. This resolves the intended target by owner confirmation; sealed runtime values were not independently retrieved. The old staging guard reference and all live credentials remain unchanged. [Concrete production backup/recovery proposal](production/backup-approval-plan.md) and [read-only catalog review](production/catalog-review.sql) are prepared. Production export and permission changes have not been executed, and migration/deployment activation remains blocked.
