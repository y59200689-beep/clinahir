# Implemented changes

> Phase 1 historical report. Phase 2 implementation, current status and final verification supersede the unfinished items below: [Phase 2 completion report](07-phase2-completion.md).

## Clinic demo

- One `DemoProvider` owns appointment and message records, scoped inside the public dashboard. Calendar, appointment list, doctors, patient consultation totals, staff, activity and dashboard now consume current records rather than separate session-storage snapshots. Read/unread message state survives page navigation in that demo instance and updates the dashboard. Reload resets it.
- Extracted deterministic appointment/message fixtures into `src/demo`. Preserved the September 29, 2026 reporting anchor and original appointment seed totals. Demo patient counts remain explicitly identified estimates, not actual unique-patient measurements.
- New reusable native dialog with focus restoration, Escape dismissal, modal focus containment, accessible heading, viewport-constrained scrolling and visible labels.
- Appointment create/details/edit/reschedule/cancel flow uses React Hook Form and Zod. Doctor assignment uses the actual four seeded doctor identities internally and anonymous numbered labels visually. Validates bounded strings, actual dates, supported examinations/doctors/statuses and 08:00–19:30 half-hour time entry. Rejects overlapping 30-minute active appointments for the same doctor, excluding the current record. Cancelled/inactive appointments do not reserve slots.
- Calendar cards open the same editor. Day/week/month views remain the existing implementation. Scheduling drag-and-drop was not added; status-board drag-and-drop remains supported. Real equipment capacity and variable examination durations remain outside this demo model.
- Appointment list paginates at 25. Patient directory adds ordering by name/visit count and progressive result display. Manually added patients no longer persist to session storage. Other demo directories preserve existing local editing/add flows; they are not real accounts.
- Dashboard create action works, upcoming scheduling overview opens the calendar, examination breakdown derives from current records, upcoming count reflects cancellations and message count reflects reads.
- Explicitly localized demo screens opt out of the legacy DOM translator via `data-i18n-managed`. The appointment editor is lazy loaded to avoid loading Zod/RHF on initial landing render.

## Business admin

- Aligned the owner shell and primary actions with the existing documented Iris/Graphite tokens; light navigation, restrained iris states, authenticated-owner initials and honest owner-workspace badge. Mobile navigation now supports focus containment and Escape.
- Overview clinic/stage selection no longer loses filters when navigating to leads.
- Snapshot failures render an alert and retry action; refresh has a status announcement. Admin requests have a 15-second client timeout.
- Lead rows support Enter/Space activation. Notes are labelled and length limited. Drawer supports dialog semantics, focus cycling/restoration, Escape and background scroll locking.
- CMS validates the complete document before sending; server validation remains authoritative. Publish confirmation uses the shared native modal. Version conflict logic and explicit publishing remain intact.
- Delivery page distinguishes present configuration from verified delivery; a heartbeat older than 30 hours is labelled for review, rather than permanently operational. Copy distinguishes business inquiries from clinical operations.
- Existing owner-only server authorization, private notes, export, prospects and auditing retained. This iteration does not introduce a new permission system or claim that the English-heavy owner workspace has complete French parity.

## Marketing, SEO and accessibility

- Form failures now render a bilingual alert while retaining the entered values. Whitespace-only required fields fail before submission. Existing same-origin lead capture, stable retry identifiers and branded durable-capture confirmation are preserved.
- Removed implied CNDP certification badge, replaced with business-contact guidance. Demo disclosure is explicit in both languages and explains temporary state.
- Storage-denied environments can render the app; French is the default for this Moroccan offer, with stored English preference respected. Document language, title, description and Open Graph locale update with language selection.
- Added skip navigation, global keyboard focus, reduced-motion rules and top-level error recovery. Reduced-motion users do not download/play the decorative background video. Evergreen background provides a readable fallback when third-party media is unavailable.
- Homepage JSON-LD now contains only grounded Organization/WebSite facts; removed invented zero pricing, business hours, Arabic UI and prescription-upload fallback claims. Simplified robots exclusions so crawler-specific groups cannot accidentally override private-path exclusions.
- Replaced generated location-page HTML and AI-summary file with business-only content: no invented clinical partner network or medical advice. Generated pages are noindex pending editorial review; sitemap includes only the homepage. Existing medical guide assets remain a separate review item.

## Architecture and tooling

- React/TypeScript/Vite, server APIs, current Supabase REST/auth boundaries and packaging are preserved. Package identity is now `clinahir`.
- Added pure scheduling tests, concurrency/media-type regression tests and a reproducible Playwright script (`npm run test:smoke`). The QA server rejects unhandled API calls rather than forwarding to real integrations.
- Existing marketing file modifications were present before this task; they were not reverted or represented as entirely authored by this upgrade.
- OHIF remains an ignored independent checkout, documented in `integrations/README.md`; no clinical viewer or imaging ingestion is linked into the app.
