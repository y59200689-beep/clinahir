# Clinahir launch readiness — October 20, 2026

## Completed locally

| Request | Result |
|---|---|
| Replace work email | Required full name and international WhatsApp number, EN/FR; legacy email supported on server |
| Confirmation | Receipt popup in both languages, dismissal and submit-button focus restoration verified |
| Spam protection | Honeypot, strict same-origin requests, existing phone rate counter plus trusted Vercel-IP rate counter, bounded body |
| Automatic demo | Server-only Meta adapter, atomic database queue migration and duplicate protection prepared; sending disabled |
| Failure recovery | Private aggregate health endpoint, cron heartbeat migration, operator checker and recovery runbook |
| Responsive checks | 390×844 and 412×915 browser viewports, no page-wide horizontal overflow; appointments/patients/staff navigation, date dropdown, translated form dropdowns and keyboard selections checked |
| Automated checks | 23 lead/WhatsApp tests + 4 hosting tests, typecheck, boundary lint, production build and git diff whitespace check passed |

Browser submissions used a disposable in-memory fixture and test receiver, not production. Verified captured name, omitted email, retained UTM campaign/source and server bearer authorization. No real WhatsApp message was sent. Build retains a roughly 602KB minified application bundle advisory.

## Required before deploying this change

- [ ] Apply supabase/migrations/20261020165330_whatsapp_contact_leads.sql. Connector permission denied; migration is prepared, not applied.
- [ ] Verify Daily Command accepts a lead with contactName/phone and no email; then run production end-to-end test.
- [ ] Deploy the matching backend and frontend together after database change.
- [ ] Verify a production cron invocation and its persisted heartbeat. Available Vercel log query returned no cron entries and secrets were masked, so execution is unverified.
- [ ] Connect the health checker to a trusted monitor with an actual notification recipient. No active external alerts have been configured.
- [ ] Test real iPhone Safari and Android Chrome including the software keyboard. Browser viewport testing is not device certification.

## Deferred as requested

- [ ] Set WhatsApp server credentials, supported API version, sender ID, approved two-body-parameter template/language and HTTPS demo link. Then explicitly enable WHATSAPP_ENABLED.
- [ ] Review accumulated pending WhatsApp jobs before enabling sending and test with an authorized recipient.
- [ ] Add delivery-status webhook if delivered/read tracking is required. Current accepted status means Meta accepted the request, not delivery.

## Remaining launch decisions and checks

- [ ] Confirm public business contact, legal identity, privacy controller, retention and deletion/contact details.
- [ ] Verify production domain, canonical/social metadata and search indexing configuration.
- [ ] Confirm conversion reports exclude or identify test submissions.
- [ ] Decide whether daily 03:00 UTC retries provide sufficient turnaround. WhatsApp cron processes one queued job per invocation; use a supported faster scheduler for higher volume.
- [ ] Consider bundle splitting/performance improvements after a real-device performance pass.

Detailed environment, activation and recovery instructions: INTEGRATION.md and .env.example. These changes are local and have not been deployed in this session.

## Owner admin follow-up

A separate /admin owner workspace is implemented, including secure server-verified login, leads, bilingual content drafts/publishing, analytics, deliveries, activity and settings. See ADMIN.md. Activation still requires the admin migration, privately created Supabase Auth owner account, server-only owner email/UUID configuration, deployment and a live access check. There is no default password. 33 integration/security tests plus four hosting tests pass. The former single-bundle advisory was resolved by separating public/admin chunks.
