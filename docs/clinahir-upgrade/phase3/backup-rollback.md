# Backup, restoration and rollback

> Historical Phase 3 preparation. A later authorized local real-PostgreSQL backup/restore rehearsal now passes; hosted recovery is still unverified. See [current execution evidence](../staging-execution/README.md).

**No backup was created, downloaded, restored or verified in Phase 3. No deployment/schema rollback was executed.** Docker CLI exists locally but no Docker daemon socket is running; no local PostgreSQL restore was possible. No authorized isolated staging/restore project or backup was supplied. These are pending operational gates, not passing tests.

## Required evidence before deployment or migration

1. Owner identifies the dedicated source staging project and a different disposable restore target, both distinct from the protected existing/production project. Approve costs/resources separately. Use synthetic business data only; never copy production clinical data for a drill.
2. Record actual provider backup/PITR availability, coverage, retention and last successful creation. Verify plan support in the [Supabase backup documentation](https://supabase.com/docs/guides/platform/backups). A dashboard backup entry or an existing file is insufficient. Database backups do not by themselves verify every external asset, Auth/hosting setting or integration secret.
3. Pause staging writes/delivery, capture a consistent baseline and record code/environment revision, seven migration digests, schema definitions/grants, table counts, deterministic ordered data checksums, primary/foreign/unique constraints and outbox/WhatsApp state. Keep business exports encrypted/private; do not commit them. Record recovery objectives approved by the owner; no RPO/RTO is claimed here.
4. Create the approved backup and verify file integrity/checksum where export is used. Store encryption keys separately. Record exact tooling/version and command result privately. Supabase CLI v3 has changed remote-target defaults; inspect installed help/version and use a reviewed target-specific procedure, never a guessed global restore command.
5. Restore into the isolated target with outbound deliveries disabled **before** connecting app/processing queues. Restored queue entries must not replay into CRM/WhatsApp automatically. Review restore coverage for Auth/accounts, extensions, roles/grants and storage separately.
6. Compare schema and every expected business table: row counts plus stable full-row digests, original external IDs, timestamps, notes/stages, delivery attempts/locks/next retry and audit records. Verify unique keys, no orphan references and migration history. Timestamps/digests must match the consistent baseline, not a moving live source.
7. Run actual restricted-role access checks on the restore, then owner sign-in and synthetic capture/version-conflict/outage recovery smoke tests with a controlled receiver. Record elapsed restore and validation times. Re-enable only staging delivery after explicit review; leave production untouched.
8. Sign off with the owner/release operator and retain artifact references. Any failed identity, checksum, grant, replay or functional check is a no-go.

## Local consistency tooling

`npm run compare:recovery -- source.json restore.json` compares private operator-supplied manifests. Format:

```json
{
  "environment": "staging",
  "syntheticOnly": true,
  "projectRef": "operator-verified-source-reference",
  "productionRef": "different-protected-reference",
  "schemaSha256": "64 lowercase hexadecimal characters",
  "tables": [{"name":"clinahir_leads","rows":3,"sha256":"64 lowercase hexadecimal characters"}]
}
```

The restore uses a different project reference. Include all expected tables, not only the example. Produce checksums with a reviewed consistent database export; do not hash differently ordered JSON or omit notes/queue/audit columns. The comparator catches identity, schema, row-count, digest and missing-table differences. It deliberately returns `backupVerified:false` even on equality: fabricated/copied manifests cannot prove a restore occurred. Three local unit tests verify comparison behavior; they are not backup verification.

## Deployment rollback

Before any approved preview, record a known-good immutable deployment/revision, environment revision, dependency lock and database recovery point. Deploy only reviewed changes with `vercel.staging.json` and the protected staging environment. Verify protection/API identity immediately. On failure, stop affected staging writes, restore the previous staging alias/deployment through the authorized hosting operator, and rerun protection, auth, synthetic capture and content checks. No production alias or credentials may be changed. Preview creation, protection configuration and rollback actions require explicit owner authorization.

Code rollback does not undo external deliveries, notes or migrations. Phase 3 introduced no migration, so there is no Phase 3 down migration. For later schema changes prefer reviewed backward-compatible/forward repair; never auto-drop tables or roll back by deleting leads. If a restore is needed, rehearse it in a separate target and account for newly accepted leads since the recovery point. Ambiguous WhatsApp sends always require manual review.
