# Authentication, authorization and database controls

> Later authorized execution: [current protected staging and acceptance evidence](../staging-execution/README.md). This report retains the earlier preparation findings.

## Evidence boundary

Phase 3 made no remote database/auth request. Actual staging security remains unverified. Existing deterministic tests exercise owner allowlist, provider validation on every protected call, CSRF origin checks, cookie flags, non-owner/anonymous rejection, content versions and private migration contracts. These are application/source-contract tests, not PostgreSQL execution.

Prepared `verify:staging:access` refuses all network calls unless explicit staging identity, distinct project references, independently supplied public key, disposable owner/non-owner accounts and action approval are provided. It first rejects publicly accessible hosting, verifies the server's staging label and checks that Auth accepts the public key. It then uses an actual non-owner access token for private API, all ten private-table/view read probes and private snapshot RPC rejection. It also verifies owner reads, provider owner ID, secure HttpOnly/Strict cookie, logout and old-cookie replay. It rejects secret/service-role key types in the public-key slot and never uses the service role or writes business records. A denial with an invalid/missing API key cannot masquerade as an RLS pass. Failed checks stop the run without storing response rows or secrets.

[verify-schema-readonly.sql](verify-schema-readonly.sql) adds migration, indexes, constraints, RLS, view options, grants and RPC metadata checks. Prepared only, **not executed**. Confirm that restricted roles lack SELECT/INSERT/UPDATE/DELETE/EXECUTE as appropriate and use separately reviewed staging DML probes to establish write denial. The access harness does not claim actual INSERT/UPDATE/DELETE enforcement. No multi-tenant clinic schema exists; organization isolation is **not implemented**, not an inferred pass.

## Findings and changes

| ID / priority | Location / evidence | Outcome |
| --- | --- | --- |
| S3-01 High deployment risk | Prior production configuration did not itself isolate arbitrary Preview server credentials | Added `server/environment.ts:11` fail-closed preview/staging checks and local preflight. Actual account ownership/hosting protection still requires owner verification |
| S3-02 Medium session risk | `server/admin.ts:102` verifies provider user; `:113` clears cookie and attempts provider logout without a server-owned revocation ledger | Not established that an already issued JWT becomes unusable immediately. New staging old-cookie replay check must pass or become a release blocker with reviewed server-session revocation work. Test names about provider logout do not establish bearer revocation |
| S3-03 Medium operational risk | Existing per-process analytics rate limit / provider request controls are not proven under multiple instances | Lead/auth rate-limit RPC contracts pass locally; distributed load/abuse tests remain required; no claim of cluster-wide protection |
| S3-04 Low input robustness | Admin body parser previously accepted JSON lookalike media types | Now exact application/json media-type matching; regression test rejects application/jsonp before network transport |
| S3-05 Privacy / observability | Raw exception/provider context can contain private content if telemetry is enabled casually | Added strict client event allowlist, all data-collection switches off, no default integrations/replay/tracing, disabled opt-in by default; admin error logs contain only area/status/category |

No credential, token, service-role key or patient record was added to browser sources. Secrets remain server-only; actual hosting secret scopes still require review. Configuration failure responses do not enumerate private values. The client-secret regression test remains in the full gate.

## Required staging review

Reconcile the seven migration hashes with actual installed history before any apply. Use actual anon/authenticated roles and test the service-only model independently of UI route guards. Verify RLS, grants, private drafts, view security-invoker flags, RPC execution privileges and auth expiry/replay. Provider backups, Auth settings, public signup, JWT maximum lifetime, database timezone version and security advisors need the correctly identified project's review. Supabase's current [RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security) is the reference; no policies were changed here.

No compliance or clinical-safety certification is claimed. Real patient data, tenant isolation, retention/rights/transfer obligations and Moroccan privacy review remain separate gates.
