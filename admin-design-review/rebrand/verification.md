# Full admin rebrand verification

31 October 2026. Full owner-admin scope, extending and superseding the Prospects-only design. Source system: `src/admin/admin-brand.css`; decisions: `design-system/admin-workspace.md`.

## Delivered
New Iris / Graphite identity, light grouped navigation rail, owner workspace selector-style identifier, profile link, navigation states, page headings, summary components, table surfaces, forms, editor navigation/action bar, delivery configuration components, settings panels, activity styling, dialogs, notifications, empty states and a rebuilt sign-in composition. Overview, Leads, Prospects, Website content, Analytics, Deliveries, Activity, Settings and sign-in use the shared scoped system. Existing chart/data meanings remain.

## Verification
- TypeScript check passed.
- Production build passed after final styling changes.
- All 41 existing integration tests passed: authentication, admin mutations, CSV/import validation, consent, migrations, publishing boundaries and lead/WhatsApp integrations.
- Diff whitespace check passed.
- Desktop 1440×900 and mobile 390×844: all eight pages render without document-wide horizontal overflow. Tablet captures at 834px cover the directory and editor.
- Zero unnamed visible buttons in all eight desktop pages. Visible focus styling, semantic labels, native select behavior, reduced-motion rules, responsive drawer and desktop sidebar controls retained.
- CSV-backed directory loads 312 rows with original source totals; search Abdelmoumen produces 5 matches. Pagination reaches 26–50 and returns to 1–25.
- Review dialog opens for selected center. Escape closes it and focus returns to the triggering row action.
- New profile control navigates to Settings.
- Mobile grouped navigation opens/closes and navigates all pages.
- Website editor switches into French with French content; Publish opens the existing confirmation and Keep editing cancels. No save/publish was submitted.
- Sign-in renders in its new composition; password visibility toggle verified without entering credentials.
- No browser console errors during normal interactions.

## Isolation and limits
Verification uses localhost:5175 and a temporary read-only Python fixture server, the existing prospect CSV and compiled site schema defaults. Inbound lead, analytics and audit fixtures are empty and integration booleans unconfigured, so those screenshots show legitimate empty/configuration states rather than invented performance data. POST is blocked. Production auth, writes, imports, delivery requeues and publishing were not exercised against real services. Existing server contract tests passed, but this is not a complete WCAG or screen-reader certification. No API, SQL, environment variable, production deployment or live-data changes. Verification itself did not deploy the changes.

The prior Prospects verification also covers source-attestation gating in CSV import, combined city/website filtering, empty and forced-error states. Those handlers were preserved during the full rebrand.

## Refinements
Replaced all forest theme emphasis with shared Iris / Graphite; raised faint secondary-text contrast; aligned mobile summary values; styled the editor's horizontal scroll; checked populated directory, document editor and all empty states. Final gallery: index.html.
