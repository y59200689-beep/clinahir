# Phase 2 — functional completion and staging evidence

Date: 2026-11-15. This report supersedes Phase 1's incomplete admin localization and profile-editor items. Existing React/TypeScript/Vite architecture and Iris/Graphite admin styling are preserved. No dependency installation, production deployment, credential change, SQL migration, external delivery or clinical activation was performed.

## Implemented features

### Bilingual business administration

All eight admin screens, navigation, login, drawers, status labels, confirmation dialogs, validation, known server errors, dates and numbers now use explicit English/French resources. Language preference survives reload and changes without reload; CMS content language remains independent. The admin no longer relies on DOM mutation translation. Machine values (lead stages, API actions, form values) remain unchanged. Unknown service errors show a localized generic message rather than exposing provider detail. CSV errors retain useful row/column context. User-authored content and proper names are intentionally not translated.

Fixed overview filter navigation, added loading boundaries for lazy admin pages, guarded against stale responses after logout, improved labels/focus/keyboard access, and replaced a retry browser confirmation with the shared accessible modal. WhatsApp entries without an error no longer imply delivery. Session copy reflects absolute expiry rather than unsupported inactivity behavior.

### Interactive clinic demo

Patients, doctors and staff share one reducer-backed directory with appointments. Each supports search, sort, filters, pagination, details, validated creation/editing, archive and restore/undo. Soft deletion preserves appointment history. Archiving patients/doctors with active future bookings is blocked. Stable identifiers preserve staff attribution and propagate patient contact/doctor name edits through appointment/calendar/profile views. Archived staff cannot be selected as the actor for new demo activity. Roles are demonstration fields, not real permissions.

Appointment forms can search/select existing patient profiles or create fictional patients and assign newly created doctors. Linked patient contact fields are read-only in the appointment form and editable in the patient directory. Conflict checks also protect status-board reactivation, and archived profiles cannot receive new active bookings. Calendar, dashboard and profile counts derive from shared appointment state; feedback is bilingual. Dashboard linked-patient counts replace an estimate.

All demo edits remain in memory, survive in-app navigation, and reset on reload/new context. They never enter Supabase, CRM or business-admin records. The fixed sample reference date is 2026-09-29; this is not a live clinical scheduler.

### Performance and accessibility

Admin routes now load separately with a loading fallback. Profile counts use aggregate maps, calendar day counts are memoized, unchanged appointment arrays are retained on staff-only edits, and appointment patient search renders at most 50 candidates plus the selection. Appointment schema/editor code stays lazy; conflict logic is a lightweight separate module. No unnecessary dependency was introduced.

The measured build has no JavaScript chunk above 500 KiB. Largest app chunk: 410,591 bytes / 116,356 gzip; admin entry: 121,682 / 36,167 gzip; appointment editor: 125,458 / 39,605 gzip. See [bundle artifact](phase2-bundles.json). These are local artifact measurements, not field Core Web Vitals or a Lighthouse score.

Added explicit form/control names, keyboard-operable prospect rows, visible focus, modal focus/Escape checks, clearer error/success states and stronger admin secondary-text contrast. Browser checks cover 390, 768 and 1024 pixel layouts. Full WCAG 2.2 AA, assistive-technology, real-device and cross-browser certification remain outstanding.

## Verification report

The reproducible sequential gate is `npm run check:phase2`; exact command exit codes and timings are recorded in [phase2-check-results.json](phase2-check-results.json).

| Executed command | Final result |
| --- | --- |
| npm run typecheck | Passed |
| npm run lint | Passed; existing integration-boundary checker, not a full ESLint audit |
| npm run test:leads | 43 passed, 0 failed |
| npm run test:demo | 2 passed, 0 failed |
| npm run test:phase2 | 17 passed, 0 failed |
| npm run build | Passed; two upstream Zod PURE-comment annotation warnings, no failed build or oversized-chunk warning |
| npm run test:sites | 4 passed, 0 failed |
| npm run report:bundles | Passed |
| npm run test:smoke | 6 workflow groups passed, 0 failed |
| npm run test:phase2:browser | 10 workflow groups passed, 0 failed |

Totals: **66 Node tests passed, 0 failed; 16 Chromium browser workflow groups passed, 0 failed.** Browser groups contain multiple assertions and are reported separately from Node test cases. Final results have no skipped Node tests. Development runs exposed and fixed patient-selector accessibility and inconsistent French staff-navigation wording; final verification is the evidence above. No clean `npm ci`, Firefox/WebKit run, load test, Lighthouse run or live database-policy execution was performed. A whole-tree `git diff --check` reports pre-existing trailing whitespace in marketing files; the targeted Phase 2 admin/demo/test diff check passes. Unrelated user changes were preserved.

New deterministic coverage includes dictionary parity and explicit admin localization, machine-value preservation, all private API actions rejecting anonymous/non-owner users before private transport, migration RLS/grant source contracts, profile validation/identity/propagation/archive/restoration, archived actor fallback, calendar synchronization and isolation. Existing backend tests cover concurrent duplicates, CRM outages/recovery/backoff, missing configuration, session/security contracts and ambiguous WhatsApp outcomes. New browser groups exercise all eight admin routes in both languages, failed login, snapshot outage/retry, stage/notes, prospects, content-locale independence, EN/FR profile CRUD, conflict/reschedule synchronization, responsive layouts and fresh-context isolation.

## Business integration evidence

| Area | Verified evidence | Still unverified / blocked |
| --- | --- | --- |
| Supabase endpoint | Read-only zero-row GETs on leads, content, audit and WhatsApp tables returned 200 | Installed migration history, complete RPC/schema state, staging identity, durable writes and recovery |
| Owner authentication | Configured owner metadata matched by privileged read-only lookup; mocked sign-in/session/logout and non-owner rejection pass | Actual password/session authentication and expiry against the intended staging environment |
| Authorization | Deterministic API checks reject anonymous/non-owner requests before data calls | Live API/hosting behavior, actual DB grants/RLS execution |
| RLS | Source migration contracts checked; no-key anonymous HTTP request returned 401 | No independently configured public key; 401 can be gateway rejection and is not proof of anon-role RLS |
| Demo-request persistence | Mocked durable capture/order/duplicate/concurrency/failure handling passes | No remote lead was created; actual persistence and outbox transaction behavior need staging writes |
| Daily Command CRM | Mocked forwarding, outages, idempotent retries and lock contracts pass | URL and integration secret absent locally; no live receiver or delivery verified |
| WhatsApp | Disabled/missing-config/accepted-vs-delivered/429/ambiguous-result tests pass | Disabled; provider settings absent; no message sent or delivery callback verified |
| Cron/retries | Protected handler and bounded retry tests pass | Cron secret absent; preview does not establish production cron execution; operational retry SLA requires review |

Read-only evidence is in [phase2-readonly-results.json](phase2-readonly-results.json). `npm run verify:staging:readonly` succeeded after network permission was available, but its exit status is not a readiness verdict. Connected Supabase project identities did not match the local Clinahir endpoint; unrelated project metadata is excluded from Clinahir conclusions. No migration was applied. The prepared [metadata SQL](staging/verify-metadata-readonly.sql) was not executed.

## Security and database report

Server owner authorization remains independent of UI routes; credentials stay server-side, and fixture APIs cannot fall through to live transports. Browser fixture tests use fictional leads and profiles. No real patient data was used. The client/private-secret regression check passes.

No SQL files or production tables were changed by Phase 2. Production migration requirements are to identify the correct target, reconcile actual history with repository migrations, inspect private-table RLS/grants/RPC privileges and test disposable anon/non-owner access in a dedicated environment. Table reachability under service role does not establish correct RLS. The staged metadata inspection and smoke procedures are documented separately.

Remaining security/operational concerns: live owner authentication and permissions need verification; rate limits are not proven across multiple server instances; backup/restore, alerting and retention/privacy procedures are not operationally verified. Public legacy localization remains outside the explicit admin migration. Marketing/medical content still requires editorial review. No Moroccan Law 09-08/CNDP compliance, clinical safety, tenant isolation or patient-data readiness is claimed.

## Feature matrix and readiness gates

| Feature / gate | Status | Boundary |
| --- | --- | --- |
| Admin French/English | Complete locally for supported screens | User-authored text stays in its authored language; future provider errors use generic localized fallback |
| Patient/doctor/staff create/edit/archive/restore | Complete demo prototype | In-memory only; archive is reversible deletion; no clinical directory backend |
| Appointment/calendar/dashboard/profile coherence | Complete local demo workflow | Existing calendar retained; no drag-to-reschedule/resource capacity/clinical timezone engine |
| Local regression gate | Passing | 66 Node tests + 16 Chromium workflow groups; no remote-write evidence |
| Staging preparation | Complete documentation/tooling | Checklist, secret-free inventory, read-only procedures, deployment/rollback and integration smoke plan prepared |
| Actual protected staging deployment | Pending separate authorization | No deployment made; dedicated project, owner and receiver still required |
| Live business integration acceptance | Blocked on environment/configuration | Actual auth, RLS, capture, CRM recovery and scheduler evidence required |
| Full accessibility / field performance | Partial | Targeted improvements and local checks only |
| Production business activation | Blocked | Staging acceptance, operational recovery, privacy/editorial review and release approval required |
| Real clinical operations / OHIF/PACS/DICOM | Excluded | Separate technical, legal, interoperability and security program |

## Dependency decisions and next milestone

No packages added. i18next, already installed, is now integrated in admin; Zod/RHF remain in appointment validation/editor and Playwright supplies the expanded QA suite. Existing calendar/tables/native dialogs are retained. React Query/Table, FullCalendar, shadcn initialization, Sentry, Trigger.dev and Vike remain deferred for the reasons in [dependency report](03-dependencies.md). OHIF remains an isolated future-research checkout.

Next milestone: approve a protected staging environment with a dedicated Supabase project, staging owner and controlled CRM receiver, then execute [the staging plan](staging/README.md). First establish target identity and permissions, then synthetic capture/duplicate/outage/recovery, then owner/CMS/rollback checks. After that, prioritize distributed rate limiting and operational monitoring/recovery, editorial/privacy review, and complete accessibility/performance measurement. These gates carry evidence requirements, not an arbitrary readiness percentage.
