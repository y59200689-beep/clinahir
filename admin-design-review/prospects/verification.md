# Prospects redesign verification — 31 October 2026

## Scope and direction
Local React 19 / Vite 6 owner admin implementation. Reference influence: the hotel directory's readable rows and the order queue's hierarchy; forest accents from the supplied green dashboard. Existing system font retained to avoid an external font dependency. Changes are isolated to owner Prospects styles, with a clearer shared review badge label. API routes, SQL, auth, and deployment configuration were not changed.

## Refinement passes
1. Compact summaries, aligned filters, narrower forest sidebar, restrained surfaces, sticky table heading and identity column.
2. Mobile summary density, explicit Needs review / Google rating labels, error/retry feedback, semantic table headers and keyboard-scroll region.
3. Correct inherited KPI value margin, align tablet count baselines, preserve full center names and readable identity text.

## Automated checks
- npm run typecheck: passed.
- npm run build: passed after final CSS adjustment.
- npm run test:leads: 41 tests passed; covers admin authentication, CSV normalization/import validation, consent checks, migrations and integration boundaries.
- git diff --check: passed.

## Browser checks
Used the in-app browser against localhost:5174. An isolated Python server serves the production build and local responses from the existing 312-row prospect CSV. Fixture totals and business details derive from that CSV. Session and inbound overview responses are test fixtures. POST requests are blocked. No production sessions, imports or reviews were written.

- Desktop 1440×900, tablet 834×1025, mobile 390×844 CSS viewports inspected; no page-wide horizontal overflow. Narrow tables scroll within their own container.
- Search Abdelmoumen: 5 matches, including address matches.
- City Tangier: 23 matches, all visible city values Tangier.
- Tangier plus no website: 8 matches, zero website links.
- Qualified plus those filters: informative empty state; Clear filters recovers.
- Forced local request failure: alert and retry visible; previous rows retained. Error screenshot is a deliberately induced local failure.
- Pagination: records 26–50, then back to 1–25.
- Desktop sidebar hide/show and mobile drawer navigation operate.
- Review dialog: selected center details, Escape dismissal, focus returns to triggering row button.
- CSV preview: 312 records detected; import disabled until source attestation, enabled after attestation. No import submitted.
- Browser error logs empty during normal interactions.
- Accessible naming inspection: zero unnamed buttons or form controls. Added pressed states, live result count, explicit column headers, visible focus, reduced motion, and touch-sized mobile controls.

## Limits
This is not a complete WCAG audit or a screen-reader certification. Production authentication, network latency, database writes, and actual imports were intentionally not exercised. Existing native select menus remain. On small screens, users scroll horizontally within the table to access later columns; center identity stays visible. No new bulk operations, sorting, metrics, charts, statuses, or backend capabilities were added.

## Captures
- desktop.png / tablet.png / mobile.png: final rendered design.
- empty.png / error.png / review-dialog.png / import-preview.png: interaction evidence captured during refinement.

Verification was performed locally without production changes.
