# Staging preparation and activation gates

Prepared locally on 2026-11-15. No deployment or migration was executed. The configured development Supabase project is **not established to be a staging project**. Treat its credentials as privileged and never copy them into preview environments automatically.

## 1. Staging environment checklist

- [ ] Owner identifies a separate staging Supabase project and Vercel preview/custom environment; record project identities privately and compare with the configured endpoint. The connected Supabase account in this session exposed other projects and cannot establish Clinahir migration state.
- [ ] Use only synthetic business leads and fictional profile information. No patient records, prescriptions, DICOM, PACS, OHIF or clinical workflows.
- [ ] Create/review an immutable code revision and record dependency lockfile, build artifact and environment revision. The working tree already contained uncommitted changes before Phase 2; review all of them before making a release revision.
- [ ] Review the exact SQL migration set on an isolated database; no new SQL migrations were introduced by Phase 2. Do not replay migrations onto an unknown existing database.
- [ ] Provision a dedicated staging owner privately; no shared/default production password. Keep public signup disabled for the owner-only workspace. Use staging-specific IDs and keys.
- [ ] Use a controlled CRM receiver/test transport with a separate secret. Keep WhatsApp disabled; test actual provider sends only after a separate reviewed test-recipient/template plan.
- [ ] Confirm missing configuration produces useful blocked/review states rather than a false success/delivery indicator.
- [ ] Run the local checks listed below and retain results. Obtain approval for a preview deployment as a separate action.
- [ ] Protect preview access; keep staging pages noindex. Validate private API authorization independently of UI routing.

## 2. Environment-variable inventory

All listed integration/owner values are server-only. Do not put them in `VITE_` variables, browser storage, screenshots, issue bodies or build logs.

| Variable | Purpose | Staging requirement / observed local state |
| --- | --- | --- |
| SUPABASE_URL | Project REST/Auth endpoint | Present; read-only endpoint probes succeeded. Dedicated staging identity still needs approval |
| SUPABASE_SERVICE_ROLE_KEY | Private database/Auth transport | Present, zero-row access succeeded; never ship to client |
| CLINAHIR_ADMIN_EMAIL | Configured owner allowlist | Present; account metadata matched, value not recorded |
| CLINAHIR_ADMIN_USER_ID | Owner ID allowlist | Present; account metadata matched, value not recorded |
| DAILY_COMMAND_URL | CRM receiver HTTPS origin | Missing locally; use staging receiver only |
| CLINAHIR_INTEGRATION_SECRET | CRM bearer credential | Missing locally; separate staging secret |
| CRON_SECRET | Scheduled/manual outbox authorization | Missing locally; separate secret, do not invoke processing without an approved staging test |
| WHATSAPP_ENABLED | Sending switch | False; retain false by default |
| WHATSAPP_ACCESS_TOKEN | Meta server credential | Missing; not required for mocked verification |
| WHATSAPP_PHONE_NUMBER_ID | Provider sender identity | Missing; approved test sender required before any send |
| WHATSAPP_API_VERSION | Pinned Meta API version | Missing; verify supported version when configuring |
| WHATSAPP_TEMPLATE_NAME | Approved template | Missing; verify template and consent plan |
| WHATSAPP_TEMPLATE_LANGUAGE | Approved template locale | Missing; must match approved template |
| WHATSAPP_DEMO_URL | Destination used in message | Missing; approved public demo URL required |

Optional `SUPABASE_ANON_KEY` (or existing `VITE_SUPABASE_ANON_KEY`) is read only by the verification script if independently supplied. It was absent; the anonymous probe therefore tested API-gateway rejection, not anonymous-role RLS. The app does not need a browser Supabase client for its owner API model. No new credentials were created.

See `../phase2-readonly-results.json` for boolean inventory and HTTP statuses. `npm run verify:staging:readonly` performs only zero-row/owner-metadata GETs against the configured hosted Supabase endpoint; it never signs in, posts a lead, invokes a function, runs cron or sends a message. Do not mistake that script's exit 0 for a production-ready verdict; inspect every probe result.

## 3. Safe Supabase verification

1. Identify the target. Compare its project reference privately with SUPABASE_URL before using any connector, CLI or SQL console. Never substitute a different connected project because it happens to be accessible.
2. Run [verify-metadata-readonly.sql](verify-metadata-readonly.sql) only in a reviewed administration session. It reads migration/catalog metadata in a read-only transaction, not business rows. It was prepared but **not executed** during this phase.
3. Compare installed migrations with `supabase/migrations/` in sorted order. Record missing, extra and altered versions; review dependencies before proposing any apply operation. Confirm actual column/RPC definitions, not only table existence.
4. Verify private tables have RLS and public/anon/authenticated access is revoked as designed. Inspect RPC execute grants and invoker/search-path settings; service role is privileged and still requires the server's owner checks.
5. With a separately verified public key on **staging**, prove anon cannot read leads, drafts, prospects, audits or queues. With a disposable non-owner user, prove the owner API rejects reads and writes. A 401 with no API key is insufficient RLS evidence.
6. Run database security advisors against the correctly identified staging project. Record all findings with remediation, distinguish intentionally private service-only tables from unintended public grants, and review any fix separately.
7. Use the dedicated staging owner to verify sign-in, expiry, logout, draft privacy, publishing/version conflict and audit actions with test records. This is a future approved staging smoke test, not completed live evidence.

## 4. Deployment instructions — preparation only

Local release gates:

```sh
npm ci
npm run typecheck
npm run lint
npm run test:leads
npm run test:demo
npm run test:phase2
npm run build
npm run test:sites
npm run test:smoke
npm run test:phase2:browser
npm run report:bundles
```

Use Node 24, the committed lockfile and the Clinahir project root. Browser tests require installed Playwright Chromium and local port 4181. They close the fixture server afterward. Run browser suites sequentially because they share that port. `npm ci` was not executed in this phase; it is a clean-checkout release gate. Existing dependencies were reused.

After separate approval, link/check the intended Vercel project/environment, set staging-only values privately and deploy the reviewed revision as a **preview** with Vite, build `npm run build`, output `dist/client`, and the existing `api/` serverless functions. A static-only Sites upload cannot validate the business APIs. Current [Vercel deploy documentation](https://vercel.com/docs/cli/deploy) supports explicit preview or custom staging environments; verify the selected target before running any deployment command. No deployment command was executed here.

The existing `vercel.json` cron targets 03:00 UTC. [Vercel Cron documentation](https://vercel.com/docs/schedules/cron-jobs) says cron calls the production deployment URL. Do not infer scheduled retry processing from a preview. Keep production cron/credentials untouched; verify staging processing through a separately approved controlled invocation and a test queue. Daily cadence can delay retries; decide the required service level before changing it.

## 5. Integration smoke-test plan — synthetic staging data only

| Scenario | Evidence to capture | Passing condition |
| --- | --- | --- |
| Valid demo request | Synthetic external ID, HTTP status, audit/outbox metadata only | 201 only after durable capture; no claim of WhatsApp delivery |
| Exact duplicate / concurrent replay | Same submitted UUID, capture count, receiver count | One durable identity; changed payload cannot overwrite original |
| CRM 503/timeout | Capture response, queue state/attempts, original ID/timestamp | Capture remains accepted; bounded retry state, no data loss |
| CRM recovery | Controlled receiver and authorized retry | Same ID forwarded once, successful completion retained |
| Invalid/missing CRM config | Protected status read | Saved lead remains; blocked reason is useful and no secret exposed |
| WhatsApp disabled | Job/processor state | No provider call |
| WhatsApp ambiguous result | Controlled timeout/503 fixture | Manual review; no automatic resend that could duplicate delivery |
| Anonymous/non-owner admin | GET/POST requests | Rejected before private data/RPC transport |
| Anonymous DB / authenticated non-owner | Public-key permission probes, metadata/advisor evidence | No private table/draft access; no public RPC execution |
| CMS EN/FR draft/publish/conflict | Synthetic text and version/audit state | Draft private; publish explicit; stale writes rejected |
| Cookie/expiry/logout | Header flags and protected endpoint result, no token content | HttpOnly/Strict/Secure on HTTPS, session expiry enforced server-side |
| Locale and demo isolation | Separate browser contexts | No real permissions, no demo records enter the sales pipeline |

The local mocks already exercise duplicates, outages, retries and authorization. This matrix is the missing staging verification plan, not a claim those writes were executed remotely.

## 6. Rollback and production activation prerequisites

- Before deployment, record the previous known-good deployment URL/revision, environment revision and a database backup/recovery reference. Identify the authorized release/incident owner.
- For a staging UI/API regression, restore the prior immutable deployment using the hosting deployment dashboard, verify its intended environment/alias, and rerun authorization/capture smoke tests. Follow current [Vercel Instant Rollback guidance](https://vercel.com/docs/instant-rollback). No rollback was executed here.
- A code rollback does not undo database changes, external CRM delivery or WhatsApp messages. This phase has no schema migration to reverse. Never delete captured leads or replay ambiguous sends to simulate rollback. For a future schema issue, stop affected writes and use a reviewed forward fix or tested restore procedure.
- Do not promote before correct project identity, actual migration/RLS tests, staging end-to-end persistence/CRM, owner auth, backups, alerting, retention/privacy review and rollback rehearsal have evidence.
- Review business/marketing claims and legacy medical guide content before production publication. Synthetic clinic operations do not establish clinical safety, multi-tenancy, data-protection certification or readiness for patient information.

**Next milestone:** an explicitly approved, protected staging deployment using a dedicated database and controlled CRM receiver, followed by this integration smoke plan and a recorded permission/rollback review. Clinical activation remains a separate project.
