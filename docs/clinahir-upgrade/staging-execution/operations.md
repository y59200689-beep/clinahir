# Staging operations and environment inventory

## Current environment

All values are set only in the dedicated hosting project's encrypted Preview environment. This inventory deliberately contains names and purpose, not values.

| Variables | Purpose / exposure |
| --- | --- |
| `CLINAHIR_ENV`, `VITE_APP_ENV` | Staging server identity and public environment label |
| `CLINAHIR_STAGING_ORIGIN` | Exact protected staging HTTPS origin |
| `CLINAHIR_STAGING_SUPABASE_REF`, `CLINAHIR_PRODUCTION_SUPABASE_REF` | Distinct stage/protected database references |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Dedicated staging server database access; key never in client bundle |
| `CLINAHIR_ADMIN_EMAIL`, `CLINAHIR_ADMIN_USER_ID` | Synthetic owner allowlist |
| `CRON_SECRET` | Authenticated synthetic queue processing |
| `DAILY_COMMAND_URL`, `CLINAHIR_STAGING_CRM_ORIGIN` | Exact controlled receiver origin |
| `CLINAHIR_PRODUCTION_CRM_CONFIGURED` | Explicit owner-confirmed `false`; production CRM origin unset |
| `CLINAHIR_INTEGRATION_SECRET` | Private receiver bearer credential |
| `CLINAHIR_STAGING_RECEIVER_ENABLED` | Explicit staging-only synthetic fixture switch |
| `STAGING_PROTECTION_BYPASS` | Private operator automation header; forwarded only to the explicitly enabled controlled staging receiver |
| `WHATSAPP_ENABLED` | `false`; no Meta credentials configured |
| `VITE_SENTRY_ENABLED` | `false`; no telemetry activation |

Verification-only private account passwords, independent anon key and approval flags are loaded by the operational test runner from gitignored operator files. They are not hosting client environment variables. No `.env.local` file was edited or uploaded.

## Releasing another staging revision

1. Review the working changes and exact dependency lock. Preserve the source/protected project separation and seven original migration hashes. Capture a new immutable source inventory; do not use the current dirty Git SHA as proof that all working changes are committed.
2. Run the full local gate, build and fixture browser tests sequentially. Inspect any failure rather than deleting or skipping it.
3. Verify the dedicated Vercel project ID, account, all-deployment SSO and Preview-only variables. Do not run the static bootstrap again; it is initial-project setup only.
4. Create a sanitized source snapshot without secrets, backups, original `.vercel` link, Git or dependency trees. Deploy as Preview, verify build result and record source digest/deployment URL.
5. Verify unauthenticated rejection or the exact Vercel SSO redirect. Use private bypass headers only for this staging origin; never query-string credentials. Verify `/api/environment` identifies staging before account/record writes.
6. Assign only the staging alias after review. Allow bounded alias propagation; confirm the environment/protection again.
7. Execute approved synthetic acceptance with fresh submission identities. Respect rate limits and real backoff. Existing operational scripts create persistent synthetic records and CMS content; they are not read-only probes.

## Recovery procedure and evidence limits

- Keep staging writes and queue processing quiescent. Record counts/full-row digests, constraints, original migration receipts and delivery state. Existing acceptance records are synthetic; never substitute real medical data.
- Use an expiring dedicated read-only export role with SELECT on tables/sequences and narrowly scoped RLS policies; use the official Supabase CA with full hostname verification.
- Export and checksum the archive. Store it privately with a separately approved encrypted retention strategy. The current private local exports are not an offsite encrypted backup service.
- Restore only into an independently verified empty recovery target, with no hosting app or outbound CRM/WhatsApp connection attached. Preserve target Supabase-managed schema/default privilege/helper objects.
- Reconcile application browser-role grants explicitly after restore. The observed provider defaults granted access during table creation; row equality alone did not catch it. Revoke browser table/sequence/private-routine grants to match the reviewed source, retain service-role access, and verify actual restricted HTTP/SQL behavior.
- Compare every application's table contents and constraints; verify routines/views/RLS and migration history separately before any recovery activation. This drill retained original migration receipts in reports, rather than backing up provider migration-history storage.
- Disable temporary login and remove temporary policies/grants on source and restore. Keep fixture receiver disconnected on the restore target. No provider Auth users, Storage objects or infrastructure/secret recovery was verified by this drill.
- Current restore is intentionally populated with synthetic recovery evidence. Do not drop it or rerun the empty-target restore script without a newly reviewed reset/target plan.

## Hosting rollback

The verified fallback is the immutable protected maintenance placeholder, not a previous functional Clinahir application release. Switch only the staging alias, verify protection and the expected maintenance document, then return to the recorded Preview and verify staging identity. Code/alias rollback does not undo saved leads, CMS versions, delivered receipts or schema changes. Data/schema recovery requires a separate reviewed plan.

## Activation prerequisites

Before any production request: real Daily Command sandbox/account configuration and acceptance, approved production data/recovery plan, encrypted retention/RPO/RTO, managed Auth/Storage scope, staging access/credential lifecycle, SSL enforcement/network review, performance and manual accessibility work, privacy/legal review, deployment review and explicit production authorization. No clinical workflow activation is included.
