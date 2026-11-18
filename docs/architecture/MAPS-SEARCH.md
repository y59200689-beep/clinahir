# Google Maps search

The owner admin supports searches on both localhost and the production website. Enter a keyword phrase and city, then start a search. Production searches are queued privately and processed by GitHub Actions. The Mac and local Docker are not needed. The scheduled worker checks approximately every five minutes; GitHub scheduling can be delayed. A manual workflow dispatch can pick up a waiting search sooner.

## Hosted execution

- Private `clinahir_maps_jobs` table and service-only `clinahir_maps_job` RPC. RLS is enabled; anonymous and browser database roles have no table or RPC access.
- Every owner action runs through the existing admin session, verified owner, MFA policy and same-origin POST checks.
- `api/maps-worker.ts` accepts only signed, short-lived GitHub OIDC identities for immutable repository ID 1402964658, owner ID 297662398, the default branch and the exact `maps-worker.yml` workflow. Issuer, audience, signature, expiration, event and repository claims are checked. No app secret or database key is sent to GitHub.
- A single active search per owner; maximum 30 searches per day. Five-minute leases, idempotent claims and stale-worker recovery. Stopping preserves partial results and prevents further writes from an old lease.
- The worker uses an immutable scraper image digest, depth 1, no email extraction, no extra reviews and no proxy. CPU, memory, PID and execution-time limits apply. Queries/results remain off public workflow logs and artifacts.
- Results are persisted in the private database during the crawl and survive closing the browser. The table previews 20 businesses; CSV downloads every captured row and neutralizes spreadsheet formulas.
- Explicit Send to Prospect Directory imports all captured rows using the existing validated import and atomic normalized-name/city duplicate protection. Reimports preserve notes, review status and contact permissions. No outreach is activated.

## Local execution

Vite retains the reviewed local Docker helper at `../.agents/skills/google-maps-scraper/scripts/run-local.sh`. Local output is stored in private OS temporary directories and is independent from the hosted queue. A privately configured proxy may be selected locally with server-only `CLINAHIR_MAPS_PROXY_FILE`. No proxy credentials belong in the UI or chat.

## Verification

`npm run typecheck`, `npm run test:phase2`, `node --test tests/maps-hosted.test.mjs tests/maps-dev.test.mjs`, `node scripts/test-maps-queue.mjs` (offline PostgreSQL), and the isolated Maps/admin browser smoke checks. Live acceptance additionally requires a completed GitHub worker run and private persisted results; a passing fixture test is not a live crawl.
