# Clinahir owner administration

## Entry point

`/admin` is the real website administration area. The public interactive medical-center dashboard remains a sample product demonstration and never reads production leads. There is no signup endpoint or default admin password.

### Included

- Owner email/password login backed by Supabase Auth; session verified server-side on every private request.
- Overview with real lead stages, 30-day conversion events, source totals and latest opportunities.
- Paginated/searchable leads, contact/request attribution, private notes and stage updates; current-page CSV export neutralizes formula prefixes.
- English/French content editing: hero, solutions, patient-journey tabs, client project, process, offers, about, form introduction, FAQ additions/removals, footer, public business contact, social links, image URLs and section visibility.
- Draft/save and explicit publish confirmation with version conflict protection. The public endpoint exposes published content only. Public copy retains the current design and defaults if content cannot load.
- Daily Command/WhatsApp delivery state, protected requeue for blocked/exhausted jobs. Ambiguous WhatsApp jobs cannot be resent through this UI. Requeues do not send immediately.
- Audit trail for lead edits, content saves/publishes and delivery requeues.
- Settings show connection booleans only. Credentials and passwords are never displayed or edited through the CMS.

## Activation — pending

Supabase connector calls returned permission denied during implementation. No production schema or account was changed, and this has not been deployed.

1. Apply `supabase/migrations/20261020165330_whatsapp_contact_leads.sql` if not already applied, then `supabase/migrations/20261020171750_clinahir_admin_workspace.sql` in the Clinahir Supabase project. The latter depends on the former.
2. In Supabase Authentication → Users, create the owner email account supplied in this conversation. Choose a strong password privately, mark the email confirmed through the administrator UI, and copy that user's UUID. Do not post the password in chat or commit it.
3. Set server-only `CLINAHIR_ADMIN_EMAIL` to the owner email and `CLINAHIR_ADMIN_USER_ID` to that exact UUID. Keep `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` configured. Add values privately to Vercel and local `.env.local` for local login. Existing lead/WhatsApp/cron environment variables are unchanged.
4. Keep public Supabase signup disabled if this project is owner-only; new unrelated Auth users never receive admin access because the backend requires both the configured UUID and email. Configure appropriate Auth password policy and email provider/recovery in Supabase.
5. Deploy frontend and functions together, then verify owner login, lead reads/updates and content draft/publication against the real database. Refresh the public website after publishing; the public content cache can take 30 seconds.
6. Verify anonymous and non-owner requests cannot access `/api/admin?action=snapshot` and that the public content endpoint cannot read a draft. Run Supabase security advisors after applying the schema.

No credentials are embedded in the client. API mutations require same-origin requests. Session access token is stored in an HttpOnly, SameSite=Strict cookie scoped to `/api/admin`, Secure on HTTPS, expiring after at most an hour. Supabase verifies its authenticity, and the server matches current owner ID/email; localStorage is not used for auth. No refresh token is stored; session expiry requires signing in again. Login attempts use private database counters and provider rate limiting. The current implementation does not add MFA.

All new tables/functions are service-role-only with RLS and explicit privilege revocation. Server-side owner checks protect all service-role reads and writes. Lead stages/notes belong to Clinahir; editing them does not alter Daily Command prospect stages. Integration payload fields remain immutable through admin editing.

## Operational boundaries

- Text, links, image URLs and content visibility are managed here; layout/code, new page types, domain, secrets, infrastructure and the sample dashboard logic are code/hosting changes.
- Image fields accept HTTPS URLs; this release does not include an upload/media storage library.
- Content schema rejects unknown fields, unsafe links and changes to the form's accepted role/priority values. The stable lead validation contract remains intact.
- FAQ supports 1–30 questions per language. Public content must satisfy the complete document schema. Future schema additions should include a data upgrade for previously saved drafts/publications.
- The current delivery tables show the latest 25 items and audit shows the latest 50. Lead pagination is 25 per page. Export exports the displayed page; there is no destructive bulk delete.
- Dashboard counts include test leads. Analytics count events, not unique visitors. A healthy cron heartbeat records completion, not proof that Vercel (rather than an operator) invoked it.
- Existing cron cadence remains daily; WhatsApp credentials remain disabled/deferred. The workspace does not configure external alert notifications.

## Verification

`npm run typecheck`, `npm run lint`, `npm run test:leads`, `npm run build`, and `npm run test:sites`.

Admin security tests cover missing sessions, owner enforcement, cookie flags, throttling, cross-origin writes, lead patch validation, content schema/unsafe URLs, optimistic version conflicts and logout. The isolated test server (`node scripts/verify-admin.mjs`, after compiled tests) uses fictional records and test-only credentials. It never contacts Supabase, Daily Command or WhatsApp. Do not use it for real leads. Live account/database verification remains pending until access and setup are complete.

### Verified in this implementation

33 integration/security tests and 4 hosting tests passed, along with strict typecheck, boundary lint and a production build. Desktop preview and a 390px responsive viewport were checked; the mobile overflow issue was corrected. In the isolated browser workflow, login, lead stage/notes save, draft privacy and publication into the public page were verified. The overview screenshot uses explicitly fictional fixture records. No production account or content was changed. Real-device Safari/Chrome and authenticated production database verification still need to follow activation.

The real admin is lazy-loaded separately from the marketing page, so it does not load the interactive medical-center demo bundle. The production build now emits separate public/admin chunks without the earlier single-chunk size advisory.
