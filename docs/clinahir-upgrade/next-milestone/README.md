# Real CRM sandbox integration and operational hardening — 2026-11-16

**Completed for the isolated staging integration scope.** Clinahir's protected staging now forwards synthetic submissions to the actual Daily Command application in a separately provisioned protected sandbox. Real receiver persistence, owner isolation, duplicate handling, browser visibility and CRM failure/recovery were exercised. No live CRM business record, live environment, production domain or production credential was changed. WhatsApp, unrelated external providers and clinical workflows remain disabled.

- [Clinahir protected staging](https://clinahir-staging.vercel.app)
- [Real Daily Command protected sandbox](https://clinahir-crm-sandbox.vercel.app)

Both require Vercel authentication. Automation credentials are private headers, never URL parameters.

## Resource and source decisions

The owner supplied `https://daily-command-center-pink.vercel.app/`. Read-only hosting lookup verified its project and linked repository, `y59200689-beep/daily-command-center`. A credential-free empty integration request returned 401. No live environment values, account records or database rows were retrieved. The owner explicitly chose a **separate sandbox**.

The free-project limit initially blocked a new database. After the owner explicitly approved it, only the synthetic recovery target `xrfptjnsjckqgbvhvrwp` was paused; provider status is now `INACTIVE`, its restored data preserved. It is unavailable for further recovery tests until resumed and quota permits. Its prior recovery evidence remains historical, not a claim it is currently online. [Pause evidence](restore-pause.json).

New independent CRM database: `wpjoszvojojuxmozkhkm`, `clinahir-crm-sandbox`, EU Frankfurt, Free/Nano. Creation was quoted at $0; no plan upgrade or paid infrastructure was requested. Clinahir staging `fsfqgionuuxykpoxhrdm` remains separate and active. [Provisioning](crm-sandbox-provisioning.json).

New protected Vercel project: `prj_rBqHhiFWZyiB9s19F4vJ4oxzQ6fF`, `clinahir-crm-sandbox`. It follows the isolated static-bootstrap/Preview pattern: its initial provider-labeled Production deployment is a protected static placeholder without app credentials. The actual CRM is a Preview with its own keys. No existing live project's alias/configuration was modified. [Hosting](crm-hosting.json).

Daily Command source was pinned at `ff74c0d37686f7117f439331932b98802c647c4d`; all 56 original migration hashes were captured. A new empty database was verified, an empty baseline exported and its PostgreSQL archive parsed before applying migrations. This CRM baseline was **not independently hosted-restored**; the old restore target was deliberately paused. All 56 original migrations applied; all **252 public tables have RLS**. No seed file or production export was loaded. One subsequent additive sandbox-only permission migration is described below. [Source/plan](crm-sandbox-plan.json), [database receipts](crm-database.json).

The actual Next.js app was deployed from a sanitized source snapshot and its existing frozen pnpm lockfile. Its four production cron schedules were removed from sandbox hosting configuration. Google, GitHub, Strava, OpenAI, WhatsApp and radiology-report integration credentials were omitted. No Next.js rebuild of Clinahir was introduced: Clinahir remains React/TypeScript/Vite. [CRM deployment](crm-deployment.json).

## Implemented changes

- Clinahir's staging connector now supports a **separate CRM hosting-access credential**, sent only in staging to the exact guarded receiver origin. The fixture's own hosting credential is not used as a fallback for another project; production configuration never forwards it.
- The new Clinahir Preview uses the real CRM sandbox origin/secret and disables its old simulated receiver. The live Daily Command origin is recorded only as a forbidden-routing guard reference, not as an activated production integration.
- All existing staged leads were confirmed synthetic and synced before changing delivery routing. Old controlled-receiver records remain historical test data; their earlier acknowledgements must not be interpreted as actual Daily Command deliveries.
- Private application grants are reconciled **inside the restore transaction** before commit. This prevents the exposure window caused by provider defaults during the previous recovery drill. An actual isolated PostgreSQL regression verifies anonymous/authenticated denial, retained service access, preservation of unrelated public tables, and rollback of failed restores.
- The previously verified synthetic application backup is now encrypted with AES-256-GCM, a random nonce and authenticated header. Its key is stored separately in macOS Keychain. Key readback, exact decryption, tamper rejection and actual `pg_restore --list` parsing of decrypted bytes passed. Ciphertext is private, mode 0600. Original private plaintext exports were retained; **offsite retention and another operator's key recovery are not established**.
- Database SSL enforcement was enabled and confirmed on the two active staging projects. A certificate/hostname-verified CRM pooler connection confirmed TLS. No live database setting or owner password was changed.
- Provider advisors identified direct browser execution grants on the CRM's `financial_audit_change()` SECURITY DEFINER trigger function. An additive migration explicitly revoked PUBLIC/anon/authenticated execution. A rollback-only synthetic trigger probe verified that audit dispatch still works and retains no financial test data. This local migration was not pushed or applied to live CRM. [SQL](migrations/20261116113024_clinahir_sandbox_audit_trigger_permissions.sql), [verification](crm-trigger-hardening.json).

## Verification and exact results

The full Clinahir local gate `npm run check:phase3` completed all **12 commands successfully**:

| Command | Result |
| --- | --- |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed existing boundary lint; not ESLint |
| `npm run test:leads` | 43 passed, 0 failed |
| `npm run test:demo` | 2 passed, 0 failed |
| `npm run test:phase2` | 17 passed, 0 failed |
| `npm run build` | Passed production build |
| `npm run test:sites` | 4 passed, 0 failed |
| `npm run report:bundles` | Passed |
| `npm run test:smoke` | 6 browser workflow groups passed |
| `npm run test:phase2:browser` | 10 browser workflow groups passed |
| `npm run test:phase3` | 33 passed, 0 failed |
| `npm run report:release` | Completed local inventory |

**Total: 99 Node tests passed, 0 failed; 16 local browser workflow groups passed, 0 failed.** Four encryption cases and one separate-CRM access case were added. [Captured machine results](local-checks.json).

Additional executed checks have separate scopes; do not combine them into a readiness percentage:

| Exact command | Final result / evidence |
| --- | --- |
| `node scripts/staging/test-restore-privacy.mjs` | [9 actual isolated PostgreSQL checks passed](restore-privacy.json), container removed |
| `node scripts/staging/encrypt-recovery-backup.mjs` | [Keychain/decryption/tamper/PG archive checks passed](encrypted-backup.json) |
| `node scripts/staging/enforce-staging-tls.mjs` | [5 passed](tls-enforcement.json) |
| `node scripts/staging/verify-crm-sandbox.mjs` | [17 actual receiver/Auth/RLS checks passed](crm-acceptance.json) |
| `node scripts/staging/verify-connected-crm.mjs` | [12 actual cross-system checks passed](connected-crm-acceptance.json) |
| `node scripts/staging/crm-browser-smoke.mjs` | [3 real browser workflow checks passed](crm-browser.json), no mocked APIs |
| `verifyStagingAccess` with explicit private staging accounts | [42 deployed access checks passed](clinahir-access.json) |
| `node scripts/staging/verify-real-crm-recovery.mjs` | [9 actual failure/recovery checks passed](real-crm-recovery.json) |
| `node scripts/staging/harden-crm-trigger.mjs` | [3 permission/trigger/rollback checks passed](crm-trigger-hardening.json) |
| `node scripts/staging/scan-stage-advisors.mjs` | [Both provider scans executed](security-advisors.json); warnings below remain |
| `node scripts/staging/final-crm-health.mjs` | [Final alias/protection/receipt health](final-health.json) |

Operational `.mjs` files also passed `node --check`; this is syntax verification, not a substitute for their executed checks. The CRM's remote frozen-lockfile install and production build succeeded. A separate full local Daily Command lint/unit/e2e suite was not installed/executed, and its 252 unrelated application domains are not certified by this integration acceptance.

Initial harness failures were corrected and rerun: the PostgreSQL regression needed a fresh isolated cluster rather than the image's managed bootstrap; a successful empty pause response required safe parsing; the CRM account menu had two accessible-name matches and the browser test was scoped to the actual desktop control. The live login redirect comparison was corrected to accept the equivalent same-origin absolute URL. The quota rejection was resolved only through the explicit owner-approved pause. Final passing results are distinguished from those initial failures.

## Real business evidence

The real receiver accepted concurrent matching external IDs as one creation plus one duplicate and stored exactly one row. Independent reads verified source `clinahir`, destination owner, contact fields and submitted metadata. Payload attempts to override owner/source/status were ignored. An actual non-owner token saw no owner row and could not insert into the owner's workspace; anonymous access exposed no lead.

Clinahir's actual website API accepted concurrent synthetic submissions, persisted one source row, forwarded to the actual CRM sandbox and recorded its acknowledgement. A fresh independent CRM database read confirmed one matching row with business intent preserved. The old simulated receiver returned 404. The durable WhatsApp job remained unsent with zero attempts/provider ID while sending was disabled; disabled sending does not imply that no durable queue row exists.

For actual failure acceptance, a **separate sandbox-only fault Preview** overrode its database key with an intentionally invalid synthetic string. Only the CRM sandbox alias briefly pointed to it. A real handler 500 left Clinahir's lead saved and pending. The healthy CRM Preview was restored before waiting the actual one-minute backoff. Two concurrent authenticated retry workers completed, the same source row synchronized on attempt 2, and an independent CRM read found exactly one receipt. The live CRM was never a test receiver. The fault Preview remains a protected test artifact and **must not be promoted**. Healthy aliases are recorded in final health evidence.

## Security findings and remaining gates

Final advisor scans: Clinahir has **1 WARN** (leaked-password protection disabled); CRM sandbox has **2 WARN** (the same password setting and authenticated access to intentional `record_invoice_payment`). No advisor ERROR was reported. The payment function checks `auth.uid()` and invoice ownership in the inspected source, but its full financial behavior was not certified; its legitimate authenticated permission was preserved.

Leaked-password protection requires Pro or above according to [Supabase's password-security documentation](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). No paid plan was enabled merely to clear an advisor warning. Synthetic account passwords are strong random values; MFA, human-owner access policy and any commercial plan decision remain operator review items.

Known configured credential values were scanned against reports and the local Clinahir browser build with zero matches; deployed Clinahir runtime-source hashes matched local files. This is not a general secret audit or a scan of every remote Next.js asset. Keys, passwords, bypass values and backups are gitignored/private; none are embedded in links. [Scan](final-secret-check.json).

## Status and next milestone

| Gate | Current assessment |
| --- | --- |
| Actual Daily Command sandbox integration | Verified, including actual persisted rows and browser visibility |
| Actual sandbox failure/backoff/concurrent recovery | Verified |
| Clinahir existing functionality | Local regression gate passed; deployed access reverified |
| Private restore atomicity | Actual PostgreSQL regression passed; prior hosted recovery remains historical |
| Backup encryption | Verified locally with OS Keychain; offsite retention/second-operator recovery still missing |
| Restore target availability | Paused with explicit approval; synthetic data preserved |
| Production Daily Command integration | Not activated; live system kept read-only |
| WhatsApp / other provider automation | Disabled, no provider delivery certification |
| Full managed Auth/Storage disaster recovery / RPO/RTO | Not established |
| Performance / manual accessibility | Earlier performance findings remain; no new field or full manual certification |
| Clinical use / legal compliance | Excluded; no compliance or patient-operation readiness claim |

**Next recommended milestone:** operator acceptance of the two protected demonstrations, then production-specific operational review: backup retention/offsite encryption and second-operator key recovery, Auth/Storage recovery scope and capacity, MFA/access lifecycle, performance/manual accessibility work, and a separately reviewed production CRM activation/rollback plan. No automatic production promotion follows from these tests.
