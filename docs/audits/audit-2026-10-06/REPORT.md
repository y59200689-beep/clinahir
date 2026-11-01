# Clinahir launch audit — 6 October 2026

## Verdict and score

**7/10 overall launch readiness.** This is a qualitative product-design judgment, not a measured conversion score. Visual design: 8/10; conversion clarity: 7/10; trust: 5/10; technical foundation: 8/10. Mobile readiness remains unscored because phone captures were unreliable in this run.

The site has a distinctive visual identity and a substantial interactive demo. Keep the colors, landscape direction, glass treatment, primary CTA, and overall structure. The most valuable remaining work is credibility, clearer demo expectations, medical-specific visuals, accessibility verification, and launch operations. Extra decorative animation is not a launch requirement.

## Scope and evidence

Inspected localhost:4173 in English and French, all public landing sections and the entry screens of all ten embedded dashboard pages. Clicked navigation, outcome tabs, a FAQ, the language selector, demo navigation, and an empty form submission. Reviewed current source and ran typecheck, integration boundary lint, 14 lead/analytics tests, 4 hosting tests, and production build: all passed.

Screenshots below were captured and reopened in this run. Whole-page capture was rejected because offscreen content was not rendered correctly. Phone viewport override also produced blank/cropped screenshots; those are rejected evidence, not confirmed website bugs. A partial narrow demo capture showed reflow, but it does not establish phone readiness. The browser reported clientWidth and scrollWidth of 528, not the requested 390. Viewport was reset and the site returned to English afterward.

No new real lead was submitted in this audit; the confirmation dialog was reviewed in source, not newly triggered. Live Daily Command delivery, cron execution, production environment variables, DNS, real-device performance and backups were not reverified. Existing tests are contract/source tests, not a complete browser or accessibility suite. No website implementation was changed.

## User goal

A medical-center decision-maker should understand the offer, trust the provider, recognize a relevant workflow, and confidently request a tailored demo.

## Findings by step

| Step | Surface | Health | Recommended edit |
|---|---|---|---|
| 1 | Hero and navigation | Good | Keep strong outcome headline and clear CTA. French headline leaves “en” alone on a line at the captured width; adjust text wrapping. Put EN/FR access near the top, not only in the footer. |
| 2 | Interactive dashboard | Strong, with polish needed | Keep it. Add an optional three-step suggested tour: review request → schedule → see team activity. Keep clear fictional-data disclosure. Increase text/panel contrast without changing palette. |
| 3 | Solutions feature grid | Needs edit | Replace the code-style Search Visibility graphic with a fictional local-search/map/service-page preview. Remove implementation-like labels such as BOOKING_ACTIVITY_VISIBLE. Use booking UI for Patient Experience rather than a generic bar chart. |
| 4 | Outcome tabs | Functional, needs relevance | Get Found currently shows reviewing requests, which illustrates follow-up. Match each visual to its actual promise: discovery, booking, follow-up, reporting. Measure's Clear/Ready tiles are attractive but abstract; a small labeled reporting preview would explain more. |
| 5 | Demo promise | Good | Useful explanation and three outcomes. Add agreed call duration, who joins, and whether it is free/no-obligation only if accurate. |
| 6 | Delivery process | Good | Four steps are clear. Add one concrete deliverable per step; avoid promising an unsupported launch timeline. |
| 7 | Offer/fit cards | Good | Add a small action per card that preselects the corresponding form priority, while retaining one submission flow. The dark middle card visually suggests a recommended package although no recommendation is stated; clarify or equalize emphasis. |
| 8 | About | Main trust gap | State who runs Clinahir, location/service coverage, relevant expertise and a real business contact. Add an authentic founder/team image if available. Product description alone does not answer “who are these people?” |
| 9 | Demo form | Works for empty validation; needs reassurance | Phone is required and fields are labeled. Add a privacy notice link and honest contact/response expectation. The form captures center, role, city, email, phone and priority but no person's name; consider a contact-name field if helpful for follow-up. Keep required phone as requested. Use localized inline errors for a more consistent experience than browser validation bubbles. |
| 10 | Confirmation | Source-reviewed, not recaptured | Native dialog, focus restoration, Escape dismissal and translated content exist. Add the same agreed next-step/response expectation used beside the form. Recheck on a real phone with a safe labeled test submission. |
| 11 | FAQ | Good, long | Eleven questions cover useful objections. Put demo, price/scope, timing and support questions first. Tighten answers where possible; preserve honest privacy/security wording. |
| 12 | Final CTA/footer | Needs launch information | Clear final action. Add privacy notice, business identity/legal information as appropriate, and a public business contact. No privacy or legal links are present in the inspected footer. |
| 13 | English/French flow | Mostly good | French switches content and document language correctly. Some demo message bodies and chart accessibility descriptions remain English. “Member 01” labels reflect the existing naming choice; retain if intentional. Complete translation of product/sample content and accessible labels. |
| 14 | Phone layout | Verification blocked | Run at 360/390/430px on actual iOS Safari and Android Chrome. Check horizontal overflow, dashboard tabs, tables, dropdowns, keyboard, errors and success dialog. Do not claim readiness from these rejected captures. |

### Embedded dashboard pages reviewed

| Page | Health | Notes |
|---|---|---|
| Dashboard | Strong | Readable hierarchy; chart details and pale labels need contrast verification. |
| Appointments | Good | Useful filters and masked records; tall summary area can push the actionable list far down. |
| Agenda | Good, dense | Calendar is useful; compact text and event touch targets need phone testing. |
| Patients | Good | Masked names and organized directory. All-time figures differ legitimately from dashboard month figures; make period/scope visible to avoid confusion. |
| Staff | Good | Clear permissions and member cards; avoid excessively small metadata. |
| Messages | Good | Master/detail structure and empty reader state are clear. Translate sample snippets/body text in French mode. |
| Doctors | Needs polish | Long translated labels and specialties visibly truncate at the captured desktop width. Let important labels wrap, reduce badge width, and prioritize metrics. |
| Posts & Articles | Good | Clear publishing statuses and actions; keep sample content clearly illustrative. |
| Activity Log | Good | Rich team metrics. Five summary cards wrap at the captured width; if a desktop single row is still intended, use component-width breakpoints and compact labels rather than squeezing every viewport. |
| Settings | Good | Consistent glass fields; the screenshot shows the contact/useful-link area. Every save/preview action was not exercised. |
| Support | Good | Useful help topics and navigation. Keep draft-only behavior explicit; it is not a live support channel. |

Count-up screenshots capture transitional values in some pages. These are not evidence of incorrect totals. Do not evaluate data consistency until animations settle. Consider shorter count-ups and a single group transition so neighboring numbers reach their final state together.

## What to add, change, and remove

**Add:** factual company identity; real business contact; privacy notice; realistic response expectation; approved client evidence when available; contact-name field if useful; top language switch; an optional short demo tour.

**Change:** feature visual relevance; French heading wrapping; incomplete translations; truncating doctor-card labels; low-contrast fine text; long form/browser validation feedback; unclear reporting-period scope.

**Remove/replace:** terminal/code ornament in the search-visibility card; implementation-like decorative labels; repeated demo disclaimers that overwhelm actual company information (keep the prominent disclosure near the demo); redundant decorative looping motion if any is introduced later. Do not remove useful product sections just to shorten the page.

Never fabricate testimonials, client logos, measured growth results, team credentials, response times, or security certifications. If no clients exist yet, use a clearly labeled example project or founder explanation instead.

## Effects and animation plan

Existing motion includes section reveals, numerical count-ups, tab changes, hover/focus transitions and confirmation entrance. Keep it restrained.

1. Section entrance: opacity + 12–20px movement, about 350–500ms, once per visit; content must remain usable if motion does not run.
2. Metric count-up: about 600–900ms, start when visible, preserve width, settle related values together. Under reduced motion show final values immediately.
3. Outcome tab transition: gentle 150–250ms crossfade; avoid moving the whole page or resizing the panel abruptly.
4. Cards/CTAs: subtle hover emphasis, at most 2–4px lift, with an equivalent visible keyboard focus state. No hover-only information.
5. Demo tour: user-triggered highlight and short explanation, dismissible, never blocking exploration.

Avoid autoplay page scrolling, perpetual pulse effects, floating cards everywhere, cursor-following effects, heavy 3D tilt, repeated count-ups on every incidental scroll, and video before the visitor asks to play it. More motion should help understanding, not compete with the demo CTA.

## Accessibility and performance

Visible risks: fine gray/white text on translucent panels; small calendar/detail text; truncated translated labels; English accessibility/chart descriptions in French mode. These need measured contrast, keyboard, screen-reader and 200% zoom checks. Screenshots cannot establish WCAG compliance. Form labels, native dialog semantics, document-language switching and reduced-motion handling are present, but the complete accessibility journey was not tested.

Current build emits one 583.84kB minified initial JS chunk (169.17kB gzip) and the >500kB advisory. Lazy-load secondary dashboard pages and review image sizes/loading. This is a performance risk, not proof of poor Core Web Vitals. Run a production mobile Lighthouse/Web Vitals check before advertising.

The current index.html has title, description and viewport metadata, but no canonical URL, social share metadata/image or favicon declaration. No robots/sitemap source files were found. Add these for the final chosen domain; verify served production URLs rather than assuming SPA fallbacks are correct XML/text endpoints. Consider prerendered landing content for search reliability if organic search matters.

The local console reported a Vite HMR websocket connection error. This is development tooling and should not be presented as a confirmed production fault.

Analytics implementation records saved demo leads and anonymous CTA/page events. Reports include historic test leads. Exclude/mark test leads before treating counts as business conversions; establish a reporting habit and lead owner. Existing documentation still contains an outdated “Daily Command endpoint remains unconfigured” verification statement, so update operational documentation to match verified deployment status.

## Prioritized launch checklist

### Before public promotion

- [ ] Add accurate company/team identity and public business contact.
- [ ] Publish an appropriate privacy notice and link it beside the form and in the footer; have applicable legal wording reviewed.
- [ ] Agree the demo duration, response expectation and responsible lead owner, then reflect them in form/confirmation copy.
- [ ] Verify final domain, HTTPS, redirects and canonical URL; configure branded email if used for replies.
- [ ] Submit one clearly labeled test on production: EN and FR, phone required, errors, popup, Supabase capture, Daily Command record, same-ID retry.
- [ ] Verify scheduled retry execution and a way to notice blocked/exhausted deliveries; record recovery steps.
- [ ] Complete actual iOS/Android verification at phone widths, including keyboard and success modal.
- [ ] Check keyboard navigation, focus visibility, contrast, screen-reader announcements, zoom and reduced motion.
- [ ] Add favicon, Open Graph/social preview, canonical, robots and sitemap; check final-domain indexing.
- [ ] Run production performance checks and address material image/bundle issues.

### Highest-value design cleanup

- [ ] Replace code/abstract feature artwork with relevant medical-center workflow previews.
- [ ] Correct Get Found visual and make Measure visually concrete.
- [ ] Finish French strings/accessibility descriptions and fix heading/doctor-card wrapping.
- [ ] Improve subtle text contrast while preserving colors and glass styling.
- [ ] Surface language selection near the top.
- [ ] Add real proof when available, clearly distinguishing example work from client results.

### After launch

- [ ] Review CTA locations, qualified leads and booked calls weekly; filter test records.
- [ ] Track response time and qualification outcome in Daily Command.
- [ ] Add the guided tour and refined motion only where they help exploration.
- [ ] Expand credible project evidence and refine FAQ from real questions.

**Launch decision:** finish the essentials above, then launch a controlled pilot. Do not postpone launch for ornamental animation or a broad redesign. This run does not establish full production or mobile readiness.

## Screenshot evidence

### 1. Hero in French

Strong first impression; isolated “en” line and muted supporting text.

![1. Hero in French](25-hero.jpg)

### 2. Demo appointments

Glassy shell and navigation; large metric area.

![2. Demo appointments](14-appointments.jpg)

### 3. Agenda

Compact calendar text and event density.

![3. Agenda](15-demo.jpg)

### 4. Patients

Organized masked directory; clarify reporting scope.

![4. Patients](16-demo.jpg)

### 5. Staff

Permission chips and team cards; numerical animation still settling.

![5. Staff](17-demo.jpg)

### 6. Messages

Clear list/detail layout; English snippets in French mode.

![6. Messages](18-demo.jpg)

### 7. Doctors

Specialty/metric labels truncate.

![7. Doctors](19-demo.jpg)

### 8. Publishing

Publishing status and actions.

![8. Publishing](20-demo.jpg)

### 9. Activity

Team metrics; summary cards wrap and counts still settling.

![9. Activity](21-demo.jpg)

### 10. Settings

Contact and useful-link fields; top outside this viewport.

![10. Settings](22-demo.jpg)

### 11. Support

Help navigation and FAQ.

![11. Support](23-demo.jpg)

### 12. Solutions

Code ornament and implementation-like label do not explain the medical value.

![12. Solutions](27-landing.jpg)

### 13. Get Found

Discovery text paired with appointment-follow-up artwork.

![13. Get Found](03-solution-cards.jpg)

### 14. Measure

Reporting concept remains abstract.

![14. Measure](04-measure.jpg)

### 15. Demo promise

Concrete discussion outcomes.

![15. Demo promise](28-landing.jpg)

### 16. Process

Four clear delivery stages.

![16. Process](05-process.jpg)

### 17. Offer fit

Three options; dark center card implies emphasis.

![17. Offer fit](29-landing.jpg)

### 18. About

Product description rather than provider identity.

![18. About](06-about.jpg)

### 19. Form validation

Empty submission focuses first required field; native bubble.

![19. Form validation](07-form-validation.jpg)

### 20. FAQ

Open demo-call answer.

![20. FAQ](08-faq.jpg)

### 21. French FAQ

Translation and longer label wrapping; filename does not indicate actual surface.

![21. French FAQ](09-footer-fr.jpg)

### 22. Footer

Final CTA works visually; privacy/legal/contact information absent.

![22. Footer](26-footer.jpg)

