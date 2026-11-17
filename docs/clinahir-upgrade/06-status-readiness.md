# Feature status and production readiness

> Phase 1 historical report. Phase 2 implementation, current status and final verification supersede the unfinished items below: [Phase 2 completion report](07-phase2-completion.md).

## Feature matrix

| Area | Status | Evidence / boundary |
| --- | --- | --- |
| React/TypeScript/Vite architecture | Completed locally | Existing entry points, API contracts and packaging retained; build/type checks executed |
| Bilingual marketing and new scheduling flow | Improved, partial overall localization | EN/FR browser selection checked; managed CMS dictionaries retained; legacy DOM translation still exists |
| Complete bilingual business administration | Partial | CMS edits both languages; general owner workspace remains English-heavy. Full French UI/error parity is a remaining implementation task |
| Demo appointment create/edit/reschedule/cancel | Completed as prototype | Shared editor, field validation, doctor choice, same-doctor conflict prevention; no medical API |
| Calendar | Improved prototype | Existing month/week/day and shared appointment details/editor; no drag rescheduling, resource capacity or timezone-aware clinical scheduler |
| Dashboard / appointment / message coherence | Completed locally | Shared in-memory records, computed counts, upcoming overview and functional create shortcut |
| Patients / doctors / staff | Improved prototype, partial | Shared appointment-based metrics, patient sort/progressive results; existing add forms; no full profile/editor migration or persistent clinical directories |
| Business lead pipeline | Improved locally | Correct overview filters, keyboard details, stage/notes edits, export and existing audit trail |
| Business content management | Improved locally | Client and server schema validation, draft/version flow, accessible explicit publish confirmation; fixture-only publication verified |
| Integration monitoring | Improved locally | Configuration distinguished from delivery; stale heartbeat handling, protected existing retries; real provider health not verified |
| Durable lead capture and retries | Existing implementation retained and regression-tested | 43 backend tests include duplicate concurrency, CRM outage, retries, permissions and WhatsApp ambiguity behavior |
| Supabase live auth/RLS | Blocked on reviewed environment activation | Source contracts and mocked verification only, no live schema/account inspection |
| Marketing visual polish | Incremental improvement | Existing branding preserved; mobile typography, quiet fallback, focus, disclosures, state feedback. No wholesale redesign claimed |
| SEO | Improved with intentional restrictions | Grounded homepage schema/metadata, consistent private robots rules, false generated partner/clinical claims removed; generated pages noindex and sitemap restricted pending editorial review |
| WCAG 2.2 AA | Partial, not certified | Focus, labels, modal/keyboard improvements and mobile smoke; no full contrast/accessibility assistive-technology audit |
| Core Web Vitals | Unmeasured in field | Lazy editor avoids 500 kB public chunk regression; no Lighthouse or real-user performance score claimed |
| Sentry / Trigger.dev / Vike / new clinical backend | Deferred | No credentials, queues, framework migration or telemetry activated just because a package exists |
| OHIF/PACS/DICOM | Explicitly excluded | Separate source checkout only; future reviews required |

## Evidence-backed readiness scorecard

No percentage is assigned. Passing a local demo check does not establish production readiness.

| Gate | Assessment | Evidence required / available |
| --- | --- | --- |
| Local demonstration | Supported | Deterministic seed, shared interactions, bilingual scheduling, form failure/success and isolated admin smoke suite |
| Automated regression baseline | Passing locally | TypeScript, boundary lint, backend/demo/hosting tests, production build, Chromium smoke; see testing report |
| Production marketing release | Needs review | New SEO indexing strategy and copy need owner/editorial approval; production API configuration and live capture still unverified |
| Production owner administration | Not verified | Real account activation, live migration state, provider auth checks, RLS execution, backups/recovery and operational monitoring |
| Clinical patient-data operations | Not ready / out of scope | No tenant model, patient lifecycle backend, clinical audit/retention, resource scheduling, interoperability or formal legal review |
| Legal/privacy readiness | Requires formal assessment | Controller/processor roles, notices, sensitive-data permissions, transfers, retention, rights and contracts need qualified review |
| Observability | Partial | Redacted server error categories and existing outbox status; no Sentry configuration, production alerting or verified recovery drills |
| Accessibility | Improved, incomplete | Keyboard/native-modal/mobile evidence; full WCAG 2.2 AA audit and real-device checks remain |

## Recommended next tasks

| Priority | Task | Impact | Risk | Effort |
| --- | --- | --- | --- | --- |
| P0 | Review production activation plan; verify owner configuration, installed SQL privileges and end-to-end lead capture in an isolated staging environment | Establishes operational truth before launch | High if bypassed; no destructive migration needed for this upgrade | Medium |
| P0 | Owner/editorial review of business claims, noindex location pages and existing medical guides before any indexing/deployment decision | Avoids fabricated or unreviewed healthcare claims | High | Medium |
| P0 before patient data | Separate clinical tenancy/security/privacy/interoperability architecture and qualified Moroccan data-protection review | Required before handling real health data | High | Large |
| P1 | Replace legacy MutationObserver localization with explicit dictionaries/react-i18next and complete French owner-admin copy/error coverage | Stable language switching and equivalent language UX | Medium | Medium/large |
| P1 | Finish patient/doctor/staff profile editing and unify manual directory state if demo scope warrants it | Better complete product demonstration | Low/medium | Medium |
| P1 | Add browser checks for more calendar records, status-board drag, overview filter navigation, session expiry, CMS conflicts, accessibility and Safari/Firefox | Stronger regression protection | Medium | Medium |
| P1 | Measure Lighthouse and field CWV, optimize third-party images/video, remove stale unused legacy admin CSS and review inactive dependency footprint | Performance and maintainability | Low/medium | Medium |
| P2 | Decide whether React Query/Table, FullCalendar, shadcn or Sentry solve a defined remaining problem | Avoids duplicate abstractions | Medium if forced | Scoped experiments |
| Future phase only | OHIF/Cornerstone imaging integration, PACS/DICOM and medical-device-use assessment | Separate imaging capability | High | Large |
