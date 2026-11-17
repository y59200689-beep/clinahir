# Production configuration and rollback review — activation blocked

## Latest database preparation

The previous access limitation is resolved for the intended project `jsagrvxgydvhdoxibzny`. The [production backup/recovery gate](production/backup-authorization.json) is closed, and the [exact additive migration](production-migration-plan.md) has passed 95 isolated PostgreSQL rehearsal checks plus 30 targeted application tests. The [fresh read-only metadata comparison](production/catalog-drift-check.json) matches the restored backup. These results supersede historical access/export limitations in this document, but do not establish sealed runtime settings, production owner MFA, live CRM acceptance or activation approval. No hosted migration or production permission changes were made.

The owner explicitly chose **Keep production activation blocked** after both Supabase connections denied the recorded production guard reference. No further production write or activation is authorized by this report. This is a concrete review of available metadata, not live integration certification.

## Recorded live hosting resources

| Resource | Project | Provider-reported current Production deployment |
| --- | --- | --- |
| Clinahir | `prj_zGZICTaNNTHcLa1fhxI1WQCto7lK` / `clinahir` | `dpl_BjcY5BWyDSkg4nRtLoJTUjtpaTeV` — `clinahir-nc9r2lowo-paraoonline.vercel.app` |
| Daily Command | `prj_qkHMHxMVera3Lp6yHg82GXwXSNnR` / `daily-command-center` | `dpl_4TLfbhiqvmyntd8LPkktqdBQTFyd` — `daily-command-center-ldvvx52o3-paraoonline.vercel.app` |

Both were READY in the read-only provider metadata. READY is not a functional health test. Re-read the current targets immediately before any approved release/rollback; do not assume these records remain current indefinitely. Staging and its CRM sandbox are separate projects and were the only release targets changed in this session.

Clinahir's production variable-name inventory contains `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CLINAHIR_ADMIN_EMAIL`, `CLINAHIR_ADMIN_USER_ID`, `CRON_SECRET`, `DAILY_COMMAND_URL`, and `CLINAHIR_INTEGRATION_SECRET`. These are sensitive/write-only settings. Their values, target identities, secret equivalence or validity were not inferred from their existence.

The new `CLINAHIR_ADMIN_MFA_REQUIRED` flag is absent from that inventory. Before any production upgrade, require its value to be true and separately verify the actual approved production owner/factor/AAL2 access. Do not copy the staging owner ID or staging credentials into production. Set `WHATSAPP_ENABLED=false` explicitly until a separate approved provider activation. An explicit production application identity and public build identity must be reviewed alongside hosting target checks.

Daily Command's live inventory includes the receiver's `CLINAHIR_INTEGRATION_SECRET`, `CLINAHIR_LEADS_USER_ID`, `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SECRET_KEY` names. These are not proof of a valid shared secret, correct recipient account, matching Supabase policies or working delivery. Unrelated live Google, OpenAI and radiology-provider settings were not changed or activated.

See [exact names-only inventory](production-config-review.json).

## Database access and migration gate

The staging configuration records `yurquokjaumjdzglioaf` as its production guard reference. Both current Supabase connections lack access; the direct project metadata check returned 403. It was not possible to verify production RLS, table grants, applied migration versions, backups, approved owner identity, managed Auth recovery or live service-key validity. The sealed live `SUPABASE_URL` was not independently compared to this guard reference, so it must be confirmed before treating it as the runtime target.

No business/patient rows were read and no production SQL ran. The attempted script allows only read-only catalog inspection, not schema changes. [Access evidence](production-database-review.json).

No new application migration was introduced by this final phase. The seven previously reviewed application migrations were exercised in staging, not automatically certified for production. Future activation requires current authorized catalog inspection, reviewed hashes/diffs, a production-specific backup and isolated restore, and an additive migration plan where necessary. Never apply an old migration set blindly or restore into a live project for acceptance testing.

## Future activation prerequisites — no execution approved

1. The owner explicitly reopens production review and supplies an authorized account/access path. Keep secrets out of chat and browser bundles. Verify actual hosting, database and CRM identities, approved owner and destination ID, exact live origin and credential relationships privately.
2. Complete production-specific backup execution/retention, independently recoverable key custody and measured recovery objectives. The desktop staging job and application-only restore do not establish a production RPO/RTO or managed Auth/Storage recovery.
3. Prepare a reviewed immutable candidate with the public `/admin` and `/admin/` rewrites to `/admin.html`, noindex handling, required owner MFA, server authorization and no clinical-data integration. Public sign-in HTML must contain no business records or credentials. Preserve existing production API routing and review cron authorization/schedules separately; staging intentionally has no production cron schedule.
4. Record the actual current deployment and configuration references and an operator-approved rollback window. Store any old secret material needed for reversal in approved private custody before changing write-only values; do not put it in reports or beside Drive backups. Review coordinated CRM-secret changes rather than assuming two systems switch atomically.
5. Obtain approval for the exact domains/projects, candidate, credential changes, any migration and a bounded non-patient synthetic acceptance test. No staging bypass credential may be sent to a live CRM. No live patient/test record writes occur before that approval.
6. On approved activation, independently confirm durable source capture and exactly one actual destination receipt, destination ownership, acknowledgement and disabled WhatsApp. Check duplicate/concurrent/retry behavior against the approved live boundary. Passing sandbox tests cannot replace these checks.

## Rollback procedure to approve with the release

- Stop new forwarding/worker scheduling if delivery integrity is uncertain, while retaining saved leads and original outbox identities. Never clear the outbox or generate replacement IDs to hide failures.
- Route traffic back to the freshly recorded known-good immutable deployment using the provider's reviewed rollback operation. Restore the reviewed configuration/secret relationships under operator control. A provider READY label alone does not make a deployment a known-good target.
- Keep additive schema compatibility with both application versions during the window. Do not automatically reverse a destructive migration or restore a database as an application rollback; that requires a separately reviewed incident recovery decision.
- Reconcile uncertain CRM acknowledgements independently before replaying the same IDs. Verify owner/MFA access, anonymous denial, endpoint routing and monitoring before resuming workers.
- Record actual executed acceptance and rollback outcomes, operator and configuration revisions. No such production operation occurred here.

The protected staging rollback targets and access probes are recorded in [preview-access.json](preview-access.json). They are not production rollback certification.

## Read-only Brave follow-up

The owner subsequently supplied browser access to **ysfkhaourimahir@gmail.com’s Org**. The project named **clinahir** is `jsagrvxgydvhdoxibzny`, differing from the old guard reference. Browser inspection confirmed an older public schema and only two visible migration-history entries. [Read-only findings](brave-production-project-review.json) and [forward-only migration preparation](production-migration-plan.md) supersede the earlier “no browser access” limitation, but do not verify sealed Vercel runtime bindings or grant API/CLI access. Production activation remains blocked; no live changes occurred.

## Owner confirmation of production binding

The owner confirmed that Vercel uses `jsagrvxgydvhdoxibzny`. This resolves the intended target by owner confirmation; sealed runtime values were not independently retrieved. The old staging guard reference and all live credentials remain unchanged. [Concrete production backup/recovery proposal](production/backup-approval-plan.md) and [read-only catalog review](production/catalog-review.sql) are prepared. Production export and permission changes have not been executed, and migration/deployment activation remains blocked.
