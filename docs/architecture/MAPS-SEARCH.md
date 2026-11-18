# Local Google Maps search

The owner admin includes **Pipeline → Google Maps Search**. Enter one keyword phrase and a city or area, choose no proxy or a privately configured proxy, then start a search. The table previews 20 captured businesses; CSV download includes all results captured so far, including partial results after a failure. The explicit Send to Prospect Directory button imports all captured results after source-use confirmation and opens the directory with added/skipped counts. Existing prospects with the same normalized business name and city are skipped by the database unique constraint and ON CONFLICT policy, including duplicates within a batch or simultaneous imports. Existing notes, qualification and contact permissions are preserved. Scraped results are not used for outreach automatically. The local import reads trusted job metadata and result files server-side, validates the displayed job ID, and forwards mapped fields through the existing authenticated prospect import endpoint; client-supplied result rows are never accepted. Searches must finish or be stopped before import.

## Runtime

This integration is available through the Vite development server only. Docker Desktop must be running. `scripts/maps-dev.mjs` invokes the reviewed workspace skill at `../.agents/skills/google-maps-scraper/scripts/run-local.sh`, using depth 1, JSON Lines, no email extraction and no extra reviews. A single query is the validation crawl and the requested shallow search; no larger crawl is started automatically. The first launch can download the scraper image.

The existing admin API authenticates the owner, enforces MFA policy, and validates the environment before dispatching local Maps actions. POST also requires the same origin. There is no public Docker API, client-side credential, arbitrary command argument or user-selected filesystem path. The production API does not dispatch these local actions. Hosted execution needs a separately designed and authorized background worker, job storage and authenticated worker transport.

A configured proxy uses the server-only `CLINAHIR_MAPS_PROXY_FILE` environment variable. Create the file privately with the installed skill's masked `configure-proxy.sh` helper; never put proxy credentials in the dashboard or chat. Restart the development server after changing its environment.

## Storage and lifecycle

Raw queries and results are kept in private, randomly named directories under the OS temporary directory (`clinahir-maps`). The current job pointer is kept in a private metadata file and shared across development server reloads. One search runs at a time; existing active skill crawls are not replaced. Navigating away from the page does not cancel a search. The Stop search control terminates a running container while preserving captured results. Image preparation must finish before this control becomes available. An already running container can be monitored after restart. If the server is terminated during image preparation, the startup helper may need manual recovery; raw files remain intact. CSV export neutralizes spreadsheet formulas without modifying the source JSON. Scraped values render as text, including website URLs.

## Verification

- `npm run typecheck`
- `node --test tests/maps-dev.test.mjs` (isolated Docker/helper stand-ins; no external crawl)
- `npm run test:phase2`
- `node scripts/clinahir-phase2-smoke.mjs`
- `node scripts/maps-import-smoke.mjs` (isolated browser import and repeat-import checks)

A live crawl additionally needs Docker image/network access and real Google Maps availability. Do not confuse fixture checks with a successful live crawl.
