# Environment setup and inventory

> Later authorized execution: [current protected staging and acceptance evidence](../staging-execution/README.md). This report retains the earlier preparation findings.

No actual secret values are included. Templates: [server/build variables](../../../config/staging.env.example) and [operator verification variables](../../../config/staging-verification.env.example). Set values privately through the hosting/secret-management UI; do not paste them into chat, URLs, CLI arguments, reports or committed files. The verifier scripts read explicit process environment only and never load `.env.local`.

| Variables | Location / purpose |
| --- | --- |
| CLINAHIR_ENV=staging, VITE_APP_ENV=staging | Server identity and deliberately public build label |
| CLINAHIR_STAGING_ORIGIN | Exact protected HTTPS origin, no path/query/credentials |
| CLINAHIR_STAGING_SUPABASE_REF, CLINAHIR_PRODUCTION_SUPABASE_REF | Distinct owner-verified project identities; the latter also protects the existing non-staging project if production is not yet active |
| SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY | Staging server transport; key is never public and is not used by restricted-role verifier |
| CLINAHIR_ADMIN_EMAIL, CLINAHIR_ADMIN_USER_ID | Dedicated staging owner allowlist |
| CRON_SECRET | Staging-only operator secret; template has no scheduled job |
| DAILY_COMMAND_URL, CLINAHIR_STAGING_CRM_ORIGIN, CLINAHIR_PRODUCTION_CRM_ORIGIN | Exact controlled receiver and separately identified live receiver origins; no URL path/query/embedded credential |
| CLINAHIR_INTEGRATION_SECRET | Receiver-only staging bearer credential |
| WHATSAPP_ENABLED=false | Mandatory in staging; omit all Meta credentials |
| VITE_SENTRY_ENABLED=false, VITE_SENTRY_DSN | Optional public DSN and explicit opt-in; default disabled; provider privacy/retention review first |
| SUPABASE_ANON_KEY | Independently supplied staging public/publishable API key for actual restricted-role probes |
| STAGING_OWNER_ID/EMAIL/PASSWORD, STAGING_NONOWNER_ID/EMAIL/PASSWORD | Private operator credentials for two distinct disposable Auth users; not build variables |
| STAGING_PROTECTION_BYPASS | Optional private hosting automation header; never embed in client code or query strings |
| STAGING_VERIFICATION_APPROVED | Blank until explicit owner approval for `synthetic-staging-auth-only` |
| STAGING_WORKFLOW_APPROVED | Separate blank gate; `synthetic-staging-business-writes` only after approval for synthetic capture and stage/notes edits |

The earlier local development configuration is not identified as staging. Its Phase 2 endpoint observations do not establish staging access; no remote checks were repeated against that unknown environment in Phase 3.

## Owner configuration and approval boundary

| Action | Local preparation | Required owner action |
| --- | --- | --- |
| Dedicated Supabase | Templates, schema digest inventory and read-only catalog SQL | Authorize project creation/plan/region, inspect existing project identities, create test users and configure signup/JWT policy privately |
| Protected Preview | Alternate config and fail-closed preflight | Approve/link intended Vercel project, configure environment/protection and authorize preview deployment |
| Migration | Existing seven migrations retained, no new SQL migration | Approve exact reviewed hashes and target after backup/restore gates; actual catalog reconciliation first |
| Controlled CRM | Loopback receiver/tests and hosted receiver contract | Choose sandbox, authorize its resource/configuration and a separate secret; no live sales routing |
| Monitoring | Disabled error-only Sentry wiring and alert runbook | Privacy/retention/provider review, operator assignment and optional DSN activation |
| Real verification | Gated access/workflow scripts | Approve exact auth and synthetic-write scope; provide secrets privately and run against reviewed stage |

`npm run preflight:staging` exits 2 without explicit staging configuration. `npm run build:staging` runs this guard before the ordinary build. Use `vercel.staging.json` only in the approved preview deployment; production config remains unchanged. CLI syntax/plan features must be checked at release time. Do not run a deployment command during this local preparation.

A preview's absent scheduler is intentional. Existing production cron is untouched; manually triggering the production queue to test staging is prohibited. Define a staging-only, scoped retry exercise with a synthetic queue after authorization.
