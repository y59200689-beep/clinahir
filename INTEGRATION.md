# Clinahir → Daily Command Center

## Inspection findings

This is React 19 + Vite 6, with TSX components and a browser SPA. It is not Next.js. There were no API routes, server actions, database, Supabase client, job queue, analytics SDK, UTM capture, lint configuration, or TypeScript configuration. The prior business form used a public `VITE_DEMO_FORM_ENDPOINT`, was disabled without that URL, and posted straight from the browser. Its fields are center name, role, city, work email, optional phone, and priority. All public demo/contact CTAs resolve to `#book-demo`. Only that form is a business lead entry point. The patient/appointment/doctor/staff/settings/support forms in the interactive dashboard are sample tools, not sales leads. Unused template components are not mounted lead entry points.

## Implemented flow

Existing demo inquiry → `POST /api/leads` → validation → atomic durable Redis record and outbox entry → one server-side delivery attempt → normal visitor success once safely captured.

Vercel API functions are in `api/`; development Vite uses the same server handlers via `scripts/leads-dev.mjs`. The existing Sites static-worker packaging remains intact, but it does not deploy these new Vercel functions. This integration requires Vercel or an equivalent host running the API; a static-only/Sites preview cannot accept live leads.

## Environment and deployment

Use the `kelo-clone` directory as the Vercel project root, Vite preset, Node 24, build `npm run build`, output `dist/client`. `vercel.json` configures the API function duration and cron. No framework migration is needed. Configure these **server-only** values from `.env.example`:

- `DAILY_COMMAND_URL`: Daily Command HTTPS origin, such as `https://dailycommand.example.com`, no path/query.
- `CLINAHIR_INTEGRATION_SECRET`: the bearer secret agreed with Daily Command's receiver.
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`: a dedicated Clinahir Redis database's REST credentials. This is Clinahir storage, not Daily Command's database.
- `CRON_SECRET`: a different strong random secret protecting the outbox processor.

Never prefix these with `VITE_` or `NEXT_PUBLIC_`. Remove the obsolete `VITE_DEMO_FORM_ENDPOINT`. Use isolated storage and receiver secrets for Preview/Development; do not send preview leads into the production prospect system. Redeploy after setting the variables. Keep Redis eviction disabled, do not apply TTLs to lead records, and enable the storage provider's available durability/backups. Records have no automatic expiry. Establish an operational retention/export policy for accepted leads.

The checked-in cron runs daily at 03:00 UTC, processing at most 10 due leads with a 30-second start budget to leave completion time within the function limit. For quicker recovery/higher volume, change to a frequency supported by your Vercel plan, or use an authenticated external scheduler. Delays are minimum eligibility times; actual retries happen on the next scheduled invocation. Monitor queue backlog and Vercel logs; increase cadence/capacity if needed. Cron is production-only on Vercel.

## Exact outgoing contract

`POST ${DAILY_COMMAND_URL}/api/integrations/clinahir/leads`

Headers: `Content-Type: application/json`, `Authorization: Bearer ${CLINAHIR_INTEGRATION_SECRET}`. Redirects are rejected, timeout is five seconds. Only a 2xx response marks a lead synced. Daily Command must atomically deduplicate/upsert by `externalId` and return 2xx for a previously accepted ID. A duplicate 409 is treated as a permanent error unless the receiving contract is changed deliberately.

Example from the actual local browser verification:

```json
{
  "companyName": "Clinahir Integration Test Center",
  "city": "Casablanca",
  "email": "integration-test@example.com",
  "formType": "demo",
  "landingPage": "/",
  "message": "Role: Owner / director\nPriority: More appointment requests",
  "utmSource": "google",
  "utmMedium": "cpc",
  "utmCampaign": "integration_test",
  "externalId": "cli_9ae8efe5-77a4-424e-9afc-7b748ae11091",
  "submittedAt": "2026-10-03T09:08:56.172Z"
}
```

Optional phone is included only when provided. No contact name is collected, so `contactName` is omitted. The message summarizes the actual selected role and priority; no visitor message is invented. The exact labels can be English or French. Role and priority are also stored separately in Clinahir. All public CTA variants submit `formType: demo`, because they share this inquiry. Future contact/consultation/booking forms should use the shared client/backend and extend the server's accepted types and validation deliberately.

## Identity, persistence, retries

A browser-generated UUID v4 is stored in sessionStorage as a pending submission ID (in-memory fallback if unavailable). The server validates it and prefixes it `cli_`. A response timeout/retry/reload in that browser tab reuses it. Redis atomically creates the lead and enqueues it in one Lua operation. Existing IDs return the original record; a hash of normalized fields rejects changed input under the same ID. A conflict clears the client pending ID for the visitor's next explicit submission. A successful response clears the pending ID; an intentionally new submission then gets a new ID. Separate browser sessions cannot be identified as the same lead automatically.

`clinahir:lead:<externalId>` retains payload, role, priority, normalized input fingerprint, status, attempts, lastError, syncedAt. `clinahir:leads:due` tracks retry eligibility. No local disk or process memory is used for production persistence. Tests alone use an isolated in-memory fixture.

Delivery uses an atomic 60-second lease with a unique token. Attempts are saved before the HTTP call. Completion updates are token checked. An interrupted function leaves the lead due after the lease, retaining its original externalId and submittedAt. Delivery is at least once: an upstream acceptance followed by a crash can result in another request, so receiver deduplication is required.

Network/timeout/408/429/5xx failures use pending status with minimum delays of 1 minute, 5 minutes, 25 minutes, 125 minutes, then longer delays capped at 24 hours; after eight completed failed attempts they become exhausted and remain stored. 400/401/other permanent 4xx or missing/invalid integration configuration become blocked and leave the automatic queue. Errors are logged using ID/status/reason only, never credentials, lead body, or upstream response text. A post-capture failure still returns visitor success; failed storage capture returns the existing generic form error.

After fixing a blocked or exhausted lead's cause, explicitly replay it:

```text
POST /api/cron/leads?externalId=cli_<uuid>
Authorization: Bearer <CRON_SECRET>
```

This resets its attempt budget and requeues the same record/ID, then processes a bounded batch of due records. `GET /api/cron/leads` with the same authorization processes only due records. Inspect records/statuses in the private Redis console and monitor `clinahir_lead_sync`, `clinahir_lead_capture`, and `clinahir_outbox` logs. There is no public lead listing or public replay endpoint.

The accepted lead ID is retained as `clinahir:last-lead-id` in sessionStorage for a future meeting association. There is no actual meeting scheduler in this project. Connecting one later needs a server-verified booking reference/webhook and a Daily Command update contract; do not blindly reuse an ID for unrelated new inquiries.

## Attribution and security

UTM source/medium/campaign and landing pathname are captured at page mount in sessionStorage, survive hash navigation and reloads within that tab, and are attached to the shared submission. Explicit campaign parameters on a new page load replace the session attribution. No cookies, fingerprinting, medical data, or full query strings are stored for tracking. Fields are capped, normalized server-side, and empty optional values are omitted. Email is lowercased; names/messages are trimmed without aggressive rewriting. The API checks origin, content type, a 16KB streamed request limit, UUID, required fields and known role/priority values. A hashed-email rate limit allows 10 submissions per 10 minutes. Enable Vercel's available public endpoint abuse controls for production as appropriate; this simple email limit is not a complete bot prevention system.

The browser calls only `/api/leads`. Server code is outside client imports. There is no Daily Command database access or Supabase service-role key. Secrets remain in server environment variables. `.gitignore` excludes real environment files and generated artifacts.

## Verification and remaining live setup

`npm run typecheck` checks all TS/TSX including existing components. `npm run lint` is a focused integration boundary check, not a claim of existing ESLint coverage. `npm run test:leads` uses the project's existing Node test runner and strict compiled TypeScript. `npm run test:sites` keeps prior hosting tests. `npm run build` was run with a fake secret canary; tests check its absence in the browser output.

The actual browser form was submitted against a disposable local receiver and store. Its success UX, UTM payload, server bearer authorization, and synced record were verified. Unit/contract tests cover retry identity, transient loss prevention, 400/401, invalid data, storage failure, replay auth, exhaustion, and client behavior. Redis scripts are tested as request contracts; a real provisioned Redis database and live Daily Command endpoint have not been exercised because no credentials/URL were provided. Once configured, submit a clearly labeled test lead and confirm it appears in Daily Command's Leads/Prospects database/UI, then test transient recovery against a staging receiver. Never use the local test harness for real leads.

## Changed files

- `src/LandingSections.tsx`: delegates the existing inquiry to the shared same-origin submission client, enables submission, retains existing validation/success/error states.
- `src/leads/types.ts`, `src/leads/client.ts`: strict request/payload types, attribution, pending ID and shared submit utility.
- `server/leads.ts`, `server/redis.ts`, `server/http.ts`, `server/config.ts`: validation, normalization, payload mapping, durable capture, delivery/outbox, protected retry/replay, environment adapter.
- `api/leads.ts`, `api/cron/leads.ts`: Vercel method handlers.
- `vite.config.mjs`, `scripts/leads-dev.mjs`: local API support using the same backend.
- `vercel.json`, `.env.example`, `.gitignore`: hosting/cron and secret configuration.
- `tsconfig.json`, `tsconfig.tests.json`, `package.json`, `package-lock.json`: strict typecheck/test scripts and Node/React development type definitions. No runtime dependencies were added.
- `scripts/lint-integration.mjs`: client/server boundary checks.
- `tests/leads.test.mjs`, `tests/fixtures/memory-store.mjs`, `scripts/verify-lead-flow.mjs`, `tests/lead-form-success.jpg`: automated contract tests and isolated actual-form verification evidence.
- `INTEGRATION.md`, `AGENTS.md`, `DESIGN.md`: setup and durable integration guidance.

Existing Sites worker/build scripts and tests were preserved. Existing layouts, styles, and unrelated form behavior were preserved.
