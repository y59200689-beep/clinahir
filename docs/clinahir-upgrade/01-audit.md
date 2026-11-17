# Clinahir upgrade audit — 2026-11-15

> Phase 1 historical report. Phase 2 implementation, current status and final verification supersede the unfinished items below: [Phase 2 completion report](07-phase2-completion.md).

## Baseline before implementation

React 19 / TypeScript / Vite 6 SPA with independent lazy-loaded public and owner-admin bundles. Public routes are marketing and an embedded synthetic clinic dashboard. `/admin` is an internal sales/CMS workspace, not a clinic back office. Vercel functions delegate to server modules; Vite provides local middleware. Supabase migrations contain service-role-only tables/RPCs and lease-based delivery outboxes. Static Sites packaging is separate and does not provide the Vercel API runtime.

Executed baseline: `npm run typecheck`, `npm run lint`, `npm run test:leads` (41/41), `npm run test:sites` (4/4), `npm run build`: all passed. Lint is an import/security-boundary script, not a comprehensive ESLint audit. Build emits separate admin/public chunks. Existing uncommitted marketing edits were present and must be preserved.

## Findings and local implementation plan

1. Demo appointments are copied separately into page-local state and unvalidated session storage. Calendar and activity can diverge; dashboard metrics use the original seed rather than current records. Replace with one in-memory provider scoped to the dashboard. Preserve seed period and totals; never persist entered demo patient data to external systems.
2. Appointment creation has HTML-only validation, a masked placeholder doctor, no conflict rules, details or rescheduling. Add bounded Zod validation, React Hook Form, a keyboard-accessible native dialog and doctor/resource conflict checks. Keep the existing calendar rather than replace its working appearance solely to adopt FullCalendar.
3. Admin overview selection calls setters before navigation resets them; selected clinic/stage filters are lost. Snapshot errors are set but never rendered. Drawer lacks dialog semantics, focus containment and restoration. Fix these locally, keep server authentication checks.
4. `index.html` advertises zero pricing, Arabic support, 24-hour business opening and secure prescription upload without evidence. Replace with grounded organization/website metadata, correct language and nonclinical fallback content. Crawler-specific robots groups currently override wildcard private-path exclusions. Simplify exclusions for all crawlers.
5. Public translations combine managed EN/FR content, per-screen dictionaries and a legacy MutationObserver translator. Do not replace all dictionaries in one pass: explicit localization for new workflows, storage-safe language preference, document metadata in both languages. Legacy translation is a remaining migration risk.
6. Existing delivery implementation already preserves leads during CRM outages, leases work, bounds retries and avoids automatic ambiguous WhatsApp resends. Keep it; strengthen regression tests rather than adding another queue system. Public rate limiting is database-backed; trusted forwarding headers are hosting-specific. No clinical tenancy model exists.
7. Owner API verifies configured ID/email against Supabase on every request, cookies are HttpOnly/Strict and Secure on HTTPS; writes verify origin. RLS/RPC restrictions exist in SQL. Live installation and deployment policy state cannot be inferred from files.

## Dependency disposition

Installed at audit: Playwright, Zod, React Query, Sentry React, FullCalendar React 7, TanStack Table 9, shadcn CLI, i18next/react-i18next, React Hook Form, Trigger.dev SDK, Vike. Most have no app imports yet. OHIF 3.14 beta is a separately cloned pnpm workspace under `integrations/ohif`, not part of the Vite app.

Integrate Zod/RHF into demo scheduling and Playwright into reproducible isolated smoke coverage. Keep existing server validation and outbox contracts. Defer React Query/Table until a server-data/table migration justifies their cost; v9 Table APIs differ from v8 examples. Defer FullCalendar until calendar replacement is warranted; use no Premium plugins. Keep Sentry disabled until privacy-reviewed DSN configuration exists; do not send patient/form data. Defer Trigger.dev (existing outbox suffices), Vike (major routing/build migration; nested Vite 8 alongside app Vite 6), full i18next migration and shadcn theme initialization (global style compatibility). OHIF/PACS/DICOM ingestion explicitly excluded.

## Design direction

Preserve evergreen brand, existing product preview and Iris/Graphite business admin. Improve readable controls, focus states, mobile containment, disclosure and interaction rather than applying a new theme. Palette: brand #01bc7c, action #01a76f, graphite #111010, neutral #f5f4f6, border #e5e7eb, white #ffffff. Keep existing type family, increase actionable hierarchy and reduce decorative UI where touched. A broader brand redesign is not needed.

## Boundaries

No deployment, credentials, live database requests, migrations or clinical imaging activation. Future clinical operation requires separate tenancy, consent/retention, audit/security, interoperability and Moroccan CNDP/Law 09-08 review. This audit is not a compliance certification or live database security assessment.
