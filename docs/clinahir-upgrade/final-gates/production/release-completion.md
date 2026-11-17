# Production release — November 17, 2026

Clinahir's nonclinical marketing website and owner administration are live at https://clinahir.tech and https://clinahir.tech/admin. This record supersedes the earlier preparation-only blockers in rollout-review.md and release-readiness.json. The user explicitly authorized finishing the release, optional MFA, password recovery and the exact production authentication callback.

## Completed

- Application backup encrypted, uploaded, independently downloaded/decrypted and restored in isolation. Recovery reader sharing and separate offline/off-Mac key custody were confirmed. The scheduled backup ran successfully; the upgraded schema also passed the read-only backup preflight.
- Exact guarded additive migration applied as provider version 20261117123734. All six legacy leads were preserved; all eight application tables have RLS. The original database rollback rehearsal passed 95 checks.
- One production owner was provisioned and chose their password privately. MFA is explicitly optional (`CLINAHIR_ADMIN_MFA_REQUIRED=false`); no authenticator enrollment is a release gate. Production sign-in secrets remain server-only.
- New cron/integration secrets and the independently verified CRM recipient were configured in coordinated production deployments. Old immutable deployment references remain in configuration-execution.json. Old sealed secret values cannot be recovered; rollback must preserve the paired sender/receiver relationship and outbox IDs.
- Source deployment `dpl_AuvzgC644YQHG71wpGkpqPvubszu` and CRM deployment `dpl_GrLUHnwnFp5awX4DB66KfW1FmdFN` were staged, checked and promoted. Source snapshot SHA-256: `c4f3da71c9464da77a9e5ef4e6b8b9f7dcbf5190d340f02fd1a91009c380646b`.
- Live admin HTML, noindex/no-store, production environment identity, anonymous admin denial and unauthorized cron denial passed. Authenticated staged health verified the database and disabled WhatsApp. Public browser verification confirmed the live Forgot password form.
- Supabase Site URL is https://clinahir.tech, with exact allowed callback https://clinahir.tech/admin. Provider-generated recovery links accepted that callback. No recovery email was sent and no password was changed during verification. Email delivery itself was not tested.
- One fictional, clearly labeled acceptance lead was submitted twice under the same ID. Independent source/CRM queries confirmed one row in each system, the correct chosen CRM owner, source status `synced`, acknowledgement after one attempt, and zero WhatsApp sends. Fixture ID and retention are recorded in live-acceptance.json; it was deliberately retained, with no real records deleted.
- Latest phase-three pipeline passed 127 Node tests and its public/phase-two browser checks. The owner UI rerun passed four browser groups and eight axe scans. Earlier full release checks and limitations remain in their original receipts.

## Operating boundaries

The existing daily delivery cron remains 03:00 UTC. Its next scheduled production execution has not yet been observed; do not claim continuous retries or a verified future heartbeat. Do not trigger broad replay or clear queues to manufacture this evidence.

Daily encrypted backups run at 09:00 Africa/Casablanca through the desktop automation. They require an available Mac, Codex, Docker, private credential and Drive connection; this is not an always-on backup service. Backup scope remains the approved application schema, excluding managed Auth and Storage.

Supabase's advisor reported eight informational RLS-without-policy entries, intentional for server-only tables, and an existing warning that leaked-password protection is disabled. No public table access was added. Review the latter as provider security hardening without changing the user's optional MFA choice.

WhatsApp delivery, clinical/patient operations and PACS activation remain outside this release. Browser Sentry remains disabled. The temporary localhost password-setup server was stopped after completion.

## Follow-up — November 17, 2026, 13:26 UTC

The owner confirmed receipt and completion of the emailed password reset, followed by sign-in. Read-only Auth metadata independently showed a fresh owner sign-in at 13:25:59 UTC. No password or reset link was accessed or printed. This closes the earlier untested-email limitation. The cron manual test passed and its heartbeat was verified at 13:23:27 UTC; the first scheduled execution remains due November 18 at 03:00 UTC (04:00 Casablanca). See password-reset-followup.json and cron-followup-verification.json.
