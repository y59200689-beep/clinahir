# Verification report — 2026-11-15

> Phase 1 historical report. Phase 2 implementation, current status and final verification supersede the unfinished items below: [Phase 2 completion report](07-phase2-completion.md).

## Executed commands

All commands below were actually executed successfully after their relevant changes. The final TypeScript/build/lint and browser passes include the current admin shell, dialogs and scheduling code. Hosting checks were repeated after the final build.

| Command | Baseline | Latest result |
| --- | --- | --- |
| `npm run typecheck` | Exit 0 | Exit 0 |
| `npm run lint` | Exit 0 | Exit 0; custom integration-boundary lint, not comprehensive ESLint |
| `npm run test:leads` | 41 passed | 43 passed, 0 failed |
| `npm run test:demo` | Not present | 2 passed, 0 failed |
| `npm run test:sites` | 4 passed | 4 passed, 0 failed, repeated after final build |
| `npm run build` | Exit 0 | Exit 0; Vite 6.4.2; emits client, server worker and .openai packaging |
| `npm run test:smoke` | Not present | Exit 0; six browser workflow groups; machine-readable `browser-results.json` |

Total automated Node tests: 49 (43 backend/security/integration + 2 scheduling + 4 packaging). Browser groups contain multiple assertions and are not counted as Node unit tests.

## Browser coverage actually executed

The Playwright script starts `scripts/verify-admin.mjs` on localhost:4181. It uses fictional admin records and test-only auth; public leads/analytics are browser-intercepted. Unhandled fixture API requests now fail instead of falling through to production middleware. No credentials or real accounts are needed.

1. Homepage renders and switches English/French; document language follows selection.
2. Create appointment, filter it, reject an overlapping doctor slot, reschedule, navigate into month/week/day calendar, return and cancel. Patient sort, staff, doctor and activity navigation exercised.
3. Empty demo-request validation; filled form with deterministic 503 shows a visible error; retry with deterministic durable-capture response shows the receipt dialog. Backend duplicate behavior is covered separately.
4. Homepage at 390×844 has no document-width overflow. Desktop checks use 1440×1000. Screenshots reviewed locally.
5. Anonymous admin snapshot rejected (401), fixture owner login, keyboard lead opening, stage/notes save and re-read.
6. CMS draft edit/save, explicit native-dialog publication against fixture only, integration monitoring, mobile sidebar open/Escape and admin width check.

No uncaught browser errors were observed on the final passing run. This is Chromium smoke coverage. Firefox/WebKit browser binaries were installed and launch-tested earlier, but this upgrade suite was not executed across those engines. No real-device, screen-reader, axe, Lighthouse or field CWV audit was performed.

## Backend / policy evidence

Existing tests cover server owner enforcement, session cookie flags, cross-origin writes, auth outages, throttling, content schema and URL safety, draft privacy/version conflicts, CSV import/export, durable lead capture, CRM outages, stable retries, missing configuration, WhatsApp ambiguity and protected replay. Added tests cover concurrent identical captures delivering once and exact JSON media-type/rate-limit response behavior.

Scheduling tests reject invalid calendar dates, unsupported assignments and invalid hours; verify overlaps, adjacent slots, different doctors, self edits and inactive records. The browser tests cover the user-facing path as well.

Database-policy checks inspect SQL/RPC source and mocked transport. They do not execute RLS in a local or hosted Postgres instance. Production activation, migration state, cron/provider delivery and recovery remain unverified.

## Failures encountered and resolved

- First added backend test run failed because two new test cases used undefined fixture names (`form`/`request`). Corrected to the existing `input`/`req` fixtures; final 43/43 pass.
- First browser attempt timed out locating a status label; localized React dialog content was exposed to the legacy DOM translator. Added explicit translation ownership and stable form selection; scheduling path then passed.
- Next browser attempt targeted a hidden native language `<option>` instead of the custom priority listbox. Scoped the selector to the correct listbox; final form flow passes.
- Integrating the editor eagerly produced a >500 kB public chunk warning. Lazy loaded it; final public App chunk is 422.21 kB (116.59 kB gzip), and the editor is a separate 123.39 kB (38.91 kB gzip) chunk. No final >500 kB chunk warning.
- Build still emits two third-party Zod PURE-comment annotation warnings. Build exits 0; no source suppression or dependency patch applied.
- `git diff --check` reports trailing whitespace in existing uncommitted marketing edits. Those unrelated content edits were preserved. This is not reported as a passing formatter check.

## Artifacts

`output/playwright/marketing-desktop.png`, `marketing-mobile.png`, `admin-deliveries.png`, `admin-mobile.png` are local, gitignored screenshots. Admin screenshots carry the fictional QA banner. Intermediate failure screenshots may also remain in that ignored directory. `docs/clinahir-upgrade/browser-results.json` records the final successful groups; it is not a production health report.
