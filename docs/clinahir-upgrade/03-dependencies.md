# Dependency integration report

Installation is not activation. Versions below are installed versions observed during this session; see package-lock.json for resolved dependencies.

| Repository / package | Version | Actual application integration | Decision |
| --- | --- | --- | --- |
| microsoft/playwright / playwright | 1.65.1 | Isolated browser smoke suite | Integrated as QA tooling; Chromium, Firefox and WebKit binaries installed; upgrade smoke suite executes Chromium only |
| colinhacks/zod / zod | 4.6.7 | Demo appointment schema and conflict-flow validation | Integrated; existing backend contract validators retained |
| react-hook-form/react-hook-form | 7.92.0 | Appointment editor form state/errors | Integrated and lazy loaded |
| TanStack/query / @tanstack/react-query | 5.107.1 | No runtime import | Deferred: current business API fetching works; cache/session invalidation needs a planned migration |
| getsentry/sentry-javascript / @sentry/react | 11.12.0 | No initialized telemetry | Deferred until owner DSN/environment, redaction, retention and consent requirements are reviewed |
| fullcalendar/fullcalendar-react / @fullcalendar/react | 7.1.5 | No runtime import | Existing calendar preserved; v7 plugins differ from v6. No Premium plugins installed/used. Future adoption needs visual parity, licensing review for chosen plugins and timezone/resource tests |
| TanStack/table / @tanstack/react-table | 9.3.1 | No runtime import | Deferred; v9 differs from common v8 APIs. Existing tables get local pagination/sorting without a framework migration |
| shadcn-ui/ui / shadcn | 4.23.0 | CLI installed; no components.json or generated UI | Deferred theme initialization: Tailwind 3 and custom brand tokens must not be overwritten. Shared native primitives improve touched flows |
| i18next/react-i18next | 18.0.1 (+ i18next 27.1.2) | i18next runtime integrated for every admin screen through an explicit React provider and EN/FR resources; react-i18next remains installed without direct runtime use | Phase 2 removes admin DOM translation; public legacy translator remains a separate migration |
| triggerdotdev/trigger.dev / @trigger.dev/sdk | 4.8.5 | No runtime import or tasks deployed | Deferred; durable SQL outbox already handles retry/leases. No paid infrastructure or new scheduler |
| vikejs/vike / vike | 0.4.270 | No plugin activation, no SSR routes | Deferred architectural alternative; app uses Vite 6, package brings nested Vite 8. Do not copy latest SSR setup into this SPA without migration testing |
| OHIF/Viewers | 3.14.0-beta.91, d493d1c | Independent checkout at integrations/ohif | Future research only; no DICOM ingestion, PACS, real patient data or clinical workflow activation |

Tailwind, Framer Motion, Lucide, React and Vite continue powering the existing UI. Inactive installed packages are kept because they were explicitly requested earlier; uninstalling them is a separate cleanup decision. They should not be imported merely to justify their installation. No new dependency was required during the upgrade itself.

Official references used: [FullCalendar React](https://github.com/fullcalendar/fullcalendar-react), [OHIF source](https://github.com/OHIF/Viewers), and the package manifests/exports installed locally. The final build continues to use Vite 6.4.2.

## Phase 3 addendum

Pinned development-only Lighthouse 13.6.0 and @axe-core/playwright 4.14.0 were added for executed local audits. Installed Sentry 11.12.0 now has optional lazy, strictly redacted error-only wiring; it remains disabled with no configured provider or ingestion evidence. No other deferred package was activated. See [Phase 3 monitoring](phase3/monitoring.md) and [audit evidence](phase3/accessibility-performance.md).
