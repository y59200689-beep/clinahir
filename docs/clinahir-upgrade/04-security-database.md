# Security and database review

> Phase 1 historical report. Phase 2 implementation, current status and final verification supersede the unfinished items below: [Phase 2 completion report](07-phase2-completion.md).

## Scope and conclusion

Local source/SQL review and deterministic tests only. No production database, policies, secrets, accounts, deployment or migration state was changed or queried. The owner-admin model is a single configured owner, not multi-tenant clinic authorization. No legal compliance certification is established.

## Findings and controls

| ID | Severity | Evidence | Disposition |
| --- | --- | --- | --- |
| S1 | High readiness gap | `server/admin.ts:59` configuration gate and `:91` onward provider verification; activation runbook still pending | Source verifies owner ID/email on private requests. Live owner setup and DB policy installation remain unverified; do not interpret fixture login as production activation |
| S2 | Medium, fixed | Previous independent unvalidated `kelo-demo-appointments-v2` session-storage reads | Appointment/message state now lives only in `src/demo/DemoProvider.tsx`; demo never imports server libraries or business leads. Entered appointment/patient details no longer persisted by touched flows |
| S3 | Medium trust risk, fixed | Previous index SoftwareApplication price 0, unsupported upload copy and CNDP badge; generated MedicalClinic partners | Homepage/generated output/llms content grounded; no certification or partner network claims. Generated pages excluded from sitemap and noindex pending editorial review |
| S4 | Low, fixed | `server/http.ts:9` previously accepted any MIME prefix starting application/json | Exact media type matching now rejects lookalikes; accepts parameters. 429 includes Retry-After; responses include nosniff |
| S5 | Medium operational gap | `server/http.ts` forwarded-IP throttling and `server/admin.ts` login throttle rely on hosting-supplied header | Existing database-backed phone/email limits retained. Confirm edge header overwrite and proxy/IP behavior on deployment; do not trust arbitrary client proxy headers outside the intended host |
| S6 | Medium readiness gap | `public/guide/` pre-existing medical guide assets | Clinical/legal editorial review remains required. Removed guides from the newly generated business sitemap; did not assert their medical/legal accuracy or delete source content |
| S7 | Medium readiness gap | Owner-only model in `server/admin.ts`, no clinic organization IDs in demo | Not a multi-tenant clinical platform. Requires separately designed tenant authorization, isolation tests, audit/retention and incident procedures before real patient use |
| S8 | Low accessibility/operability, fixed | AdminDrawer previously Escape-only; admin error state not rendered | Focus cycling/restoration, modal semantics, labelled lead notes, keyboard rows, native publishing confirmation and visible retry alerts added |

Existing controls preserved: HttpOnly SameSite=Strict cookie scoped to /api/admin, Secure on HTTPS (`server/admin.ts:15`); server-origin validation (`:57`); server verification on every authenticated request; request size bounds; no service-role keys in browser imports; bounded provider timeouts; private error reasons instead of raw external response bodies; CSV formula neutralization; version-protected CMS changes and audit RPCs.

No Sentry telemetry was initialized. No new logging of form contents, patient-shaped records, passwords or credentials was added. Existing persisted demo settings/support drafts remain browser-local and should continue warning against real medical data.

## Database report

No SQL migration added, edited or applied. Existing migrations include base lead capture, rate limits, analytics, WhatsApp jobs, business admin/CMS/audit and prospects. Source inspection found RLS enabled and public/anon/authenticated access revoked on private tables. Service-role RPCs have restricted execute grants; server authorization must remain in front of that privileged role. `20261003095303_clinahir_supabase_outbox.sql:22` claims with row locks, attempt limits and expiring lease tokens. Completion checks the token, protecting stale workers. Existing tests verify RPC/privilege source contracts; they are not executing Postgres policies.

Before any production migration: inventory installed versions non-destructively, back up, review missing migrations/dependencies and rollback plan, test on isolated database, exercise anonymous/non-owner/owner permissions, run database advisors and review grants/functions, then seek explicit deployment/migration approval. No schema changes are required for this local upgrade.

Supabase's current [RLS documentation](https://supabase.com/docs/guides/database/postgres/row-level-security) distinguishes service keys from user-level policies; service-role isolation cannot be inferred from UI routing. The [changelog](https://supabase.com/changelog.md) was checked; no Supabase feature migration was implemented here. Hosting timezone data should be checked before future Africa/Casablanca clinical scheduling.

## Moroccan data-protection review gate

The [CNDP conditions](https://www.cndp.ma/conditions/) and [notification procedures](https://www.cndp.ma/procedures-de-notification-process/) identify formalities and cross-border handling considerations. Before processing real health data, obtain qualified review of purpose, notices, sensitive-data authorization, hosting/transfer arrangements, processors, retention and subject rights under Law 09-08. This is a development gate, not legal advice or a claim that the implementation satisfies those obligations. OHIF/Cornerstone imaging and PACS remain explicitly out of scope.
