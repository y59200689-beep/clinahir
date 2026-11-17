# Separate Daily Command sandbox resource plan

> Executed update: the owner approved pausing only the isolated restore target; the separate Free/Nano CRM sandbox was created and verified. See [current results](README.md). The quota/tradeoff discussion below is the reviewed plan preceding that approval.

Owner instruction: prepare a separate CRM sandbox; keep live CRM read-only.

Verified live project: `daily-command-center`, Vercel project `prj_qkHMHxMVera3Lp6yHg82GXwXSNnR`, owned by the connected team. The linked repository and exact revision/migration hashes are recorded in `crm-sandbox-plan.json`. Its real Clinahir handler requires a server-only bearer secret and server-configured destination user. A credential-free empty integration request returned 401; no live record was written. No live project environment values or database rows were fetched.

Proposed new resources: `clinahir-crm-sandbox`, protected hosting Preview, and a separate empty Supabase Free/Nano database in EU Frankfurt. Quoted plan cost: $0 if the active-free-project quota permits creation. The actual creation attempt was rejected because the owner account is at its two-active-free-project limit. No project or paid plan was created.

The existing source staging database `fsfqgionuuxykpoxhrdm` must remain active. The separate recovery target `xrfptjnsjckqgbvhvrwp` contains only the synthetic restored acceptance data. Its restore, row/constraint equality and private permissions were verified; a verified encrypted local backup now exists with its key separately stored in macOS Keychain. It has no application or outbound delivery attached.

A possible no-cost tradeoff is to pause **only** `clinahir-staging-restore` (`xrfptjnsjckqgbvhvrwp`) to free an active slot, then create the new CRM sandbox. Pausing preserves that target's data but makes it unavailable for immediate further recovery tests; resuming later may require another quota decision. Do not pause it without explicit owner approval. Do not pause the source staging or live Daily Command project, delete any project, reuse recovery tables as CRM storage, or upgrade a plan automatically.

Once an independent CRM database is available: verify it is empty and distinct from all protected databases; review/rehearse its 56 inventoried migrations and provider prerequisites before remote application; configure only a synthetic sandbox owner; exclude the four production cron schedules and every unrelated provider credential; deploy the exact reviewed source to protected sandbox hosting; verify restricted-role access; then run actual HTTP capture/deduplication/concurrency with independent receiver persistence checks. Update Clinahir's staging routing only after those checks pass. Existing production routing stays untouched.
