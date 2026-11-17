# Monitoring and operational response

> Later authorized execution: [current protected staging and acceptance evidence](../staging-execution/README.md). This report retains the earlier preparation findings.

Prepared configuration and code only; **no external monitor, alert channel, paid resource or Sentry project was activated**. Owner must assign an operator and backup operator privately before launch. No messages were sent to others.

## Implemented local controls

Existing redacted `clinahir_lead_capture`, `clinahir_lead_sync`, `clinahir_whatsapp`, cron/health categories and durable delivery states remain. New `observeResponse` records admin failures as only area, HTTP status and a bounded category; no request URL/body, cookie, email, phone or raw exception is included. Rate-limited and denied auth events are distinguishable without logging the attempted account. Existing `scripts/check-delivery-health.mjs` reads the protected aggregate health endpoint and flags stale/blocked/exhausted/review states. It has not been run against live staging.

Optional Sentry initialization uses the installed SDK lazily, only with both explicit opt-in and a DSN. Default integrations are disabled; only browser error handlers are selected. Collection of user information, cookies, headers, bodies, query parameters and database data is disabled. `beforeSend` creates a fresh allowlisted generic event with generated event ID, timestamp, fixed message/fingerprint and bounded environment. It drops exception text/stacks, user/request/context/tags and breadcrumbs. Error-boundary failures submit a fixed error, never the caught exception. No replay, tracing, sessions or console-capture integration is enabled. This trades diagnostic detail for privacy; reproduction and server category correlation remain necessary. Provider IP/network metadata and retention require review before activation. The [Sentry options reference](https://docs.sentry.io/platforms/javascript/configuration/options/) and installed 11.12.0 type declarations were checked; no ingestion test was performed.

## Proposed alert thresholds — not configured alerts

| Signal | Threshold / operator response |
| --- | --- |
| API storage/auth service failure | 3 consecutive synthetic failures or 5xx >2% over 5 minutes with at least 50 requests: inspect configuration/provider status; stop retries if misrouted |
| Invalid auth / throttling | Sustained 401/403 or 429 spike above baseline for 5 minutes: review access/protection and abuse signals; never log credentials or disable authorization |
| Lead capture 503 | Any repeated synthetic capture failure: check database reachability/schema, preserve visitor idempotency ID, alert release operator |
| CRM pending/blocked/exhausted | Any blocked/exhausted or pending older than agreed SLA: inspect reason/config and controlled receiver; replay only after eligibility/identity review |
| WhatsApp review | Any review/unknown outcome: no automatic resend, owner/provider reconciliation required; staging false always |
| Cron heartbeat | Existing daily production cadence: >27h stale is an alert; staging has no scheduled job, so configure its cadence deliberately rather than treating absent heartbeat as successful processing |
| Client errors | Repeated new generic errors in a release: reproduce with synthetic data, compare release artifact, consider code rollback |
| Database availability | Authenticated zero-row read timeout/error twice: operator checks correct project/provider before any changes |

Use a staging-only operator runner and automation bypass header for probes. No secrets in URLs/logs. Verify that the monitor itself is authorized and cannot trigger deliveries. Configure alerts to the assigned operators only after owner approval, exercise alert routing with synthetic failure and record acknowledgement/recovery time. Aggregates, logs and a DSN alone do not establish monitored operations.
