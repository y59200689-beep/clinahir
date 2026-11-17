# Integration status and verification plan

> Later authorized execution: [current protected staging and acceptance evidence](../staging-execution/README.md). This report retains the earlier preparation findings.

| Integration | Implemented / locally verified | Actual staging evidence |
| --- | --- | --- |
| Supabase | Existing REST store/RPC integration; durable capture order, duplicate fingerprints, locks, retries, validation and private contract tests | None in Phase 3. Dedicated staging project not provided/authorized; no schema or lead writes |
| Auth/admin | All eight routes in EN/FR; existing security mocks; gated restricted-role verifier prepared | No real login, expiry, RLS or admin write verified |
| Daily Command | Existing HTTPS server-only transport; new real loopback HTTP receiver exercises 503, timeout, concurrent duplicates, ambiguous acknowledgement and exhaustion/recovery | Controlled hosted receiver not configured; no live sales lead sent |
| WhatsApp | Existing disabled/configuration/ambiguity/429 tests; staging guard requires false | Disabled; no provider call or delivery assertion |
| Sentry | Optional, lazy, privacy-restricted initialization and redaction test | Disabled; no DSN configured or provider ingestion/alert verified |
| Cron/health | Existing protected health endpoint, outbox/heartbeat contracts and operator checker | No staging schedule/invocation; production cron unchanged |

The receiver is an in-memory test double over **real local HTTP**; the database in these tests remains `MemoryStore`. This improves network-path coverage but does not prove durable Supabase capture, SQL transaction/lease behavior or durable CRM idempotency.

`verify:staging:workflow` is a separately gated future harness. It requires a protected staging origin, dedicated project/account declarations, WhatsApp false, distinct CRM origins and explicit synthetic-business-write approval. It checks invalid input, concurrent identical submissions, changed-payload conflict, fresh admin read of one captured lead, stage/notes persistence, audit entry, backend synced state and an independent controlled-receiver receipt. It logs no lead payload or credentials. It leaves the synthetic record for review; no automatic cleanup or queue-wide cron processing is performed.

Hosted receiver read contract: authenticated `GET /__verification/receipts/:externalId` returns only `{externalId, receiptCount}`. Existing delivery contract remains `POST /api/integrations/clinahir/leads`. The loopback module implements both; its failure controls cannot be invoked through HTTP. A future hosted receiver must have persistent deduplication and protected operator outage controls, not a public mode switch. Never send synthetic data to Daily Command's live sales workflows.

The future failure/recovery drill requires owner-controlled receiver outage, one synthetic request, durable database snapshot, independent process/read, bounded due retry, receiver recovery and one durable receipt. Record original external ID/timestamp, attempts, next-attempt/terminal status and audit metadata. Do not manually advance production queue clocks or replay ambiguous WhatsApp sends. Existing local tests cover these paths with mocks/memory; real staging recovery remains pending.

CMS live draft/publish/version-conflict and session expiry are not exercised by the lead harness: verify them separately with synthetic staging content, preserving/restoring the initial draft and never publishing to production. Clinic directories/appointments remain in-memory prototypes and never enter this business integration pipeline.
