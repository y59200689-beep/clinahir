# Accessibility and performance audit

> Later authorized execution: [current protected staging and acceptance evidence](../staging-execution/README.md). This report retains the earlier preparation findings.

Completed locally on 2026-11-16. No redesign or field-performance claim.

## Accessibility evidence

Development-only pinned tools: Lighthouse 13.6.0 and @axe-core/playwright 4.14.0. `npm run audit:phase3` serves the **production build** on loopback with fictional admin APIs and blocks external page requests. Axe runs WCAG 2 A/AA, 2.1 AA and 2.2 AA tagged rules in a reduced-motion browser, after allowing transitions to settle. All eight owner screens are scanned in both languages, along with public/dashboard, patient directory and profile dialog in EN/FR, and owner sign-in: **23 scans, 0 automatic violations** in the final run.

Fixed measured issues: admin secondary-copy contrast on the cool canvas; prospect filter caption opacity; login information contrast; 36×36 password visibility control; small public/demo labels; dark text on the brand-green buttons/badge/CTA; proper main landmark on sign-in; removal of a nested main in the public demo. The dashboard now respects reduced-motion initial-state behavior instead of slowly fading essential controls when reduced motion is requested. Existing keyboard/focus/Escape/accessible-name and 390/768/1024 layout assertions pass in the browser suites. The French admin screenshot was inspected locally; Iris/Graphite layout is preserved.

The report retains incomplete checks: translucent/image-backed contrast, chart contrast and some dynamic ARIA relationships require manual assessment. Native screen-reader operation in VoiceOver/NVDA, zoom/reflow across all screens, real-device touch behavior and every possible validation/menu state were not manually certified. Automated checks cannot establish full WCAG 2.2 AA. Use [axe API guidance](https://github.com/dequelabs/axe-core/blob/develop/doc/API.md) as tooling documentation; manual review remains necessary.

## Bundle and route changes

Previously eager inactive demo pages now use React lazy/Suspense with bilingual loading feedback. Shared records remain above the route boundary, preserving edits and calendar/dashboard synchronization. The public App chunk is now **309,247 bytes / 91,412 gzip**, compared with Phase 2's 410,591 / 116,356. The core index chunk is separately 224,838 / 72,373; these figures are chunk sizes, not total page transfer. No JS chunk exceeds 500 KiB. No Sentry runtime chunk is emitted in the default disabled build. Admin pages and the appointment editor remain lazy. See [bundles.json](bundles.json).

## Latest Lighthouse lab diagnostics

These are actual latest-run measurements, not readiness percentages. Local fixture networking/cache behavior differs from hosting; external fonts/images/requests were deliberately blocked. CPU scheduling changed between runs, so no controlled before/after performance improvement is inferred from the scores. The deterministic chunk reduction is established separately.

| Diagnostic | Public mobile | Admin sign-in desktop |
| --- | --- | --- |
| Lighthouse performance (0–100) | 62 | 34 |
| Accessibility (0–100) | 100 | 100 |
| Best practices (0–100) | 96 | 96 |
| SEO (0–100) | 100 | 66, intentionally noindex |
| First contentful paint | 1.08 s | 1.22 s |
| Largest contentful paint | 5.80 s | 6.77 s |
| Total blocking time | 634 ms | 3,122 ms |
| Cumulative layout shift | 0 | 0 |

The lab **performance budget is not met**. Remaining diagnostics include main-thread/JavaScript work, unused CSS/JS, render-blocking dependencies, local cache behavior and forced reflow. Console/resource failures include intentionally blocked external assets; do not infer that the deployed application has those exact failures. Admin SEO noindex is deliberate and must not be removed to improve a score. Full Lighthouse outputs and exact metrics are retained in this directory. [Lighthouse documentation](https://developer.chrome.com/docs/lighthouse/overview) describes lab diagnostics; no field CWV or real-user INP was measured.

## Next measurement work

On approved protected staging, rerun repeatable mobile/desktop lab samples on representative hardware/network with intended assets and hosting headers. Inspect long tasks and React rendering before additional architecture changes. Prioritize deferring expensive offscreen marketing previews, CSS footprint and unnecessary chart/animation work. Set explicit owner-approved budgets after baseline variance is characterized.

Field plan: approve privacy-safe measurement first, then collect aggregate LCP/CLS/INP and route/device class without user identifiers, query strings, form values, clinic/patient content or session replay. Require sufficient real traffic and a defined observation window before reporting percentile CWV. No RUM provider was enabled here.
