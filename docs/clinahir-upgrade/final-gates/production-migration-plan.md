# Production migration prepared and rehearsed — hosted execution blocked

The production backup/recovery gate is closed, and the application upgrade has been rehearsed against its independently downloaded, authenticated archive. No hosted migration, permission change, credential change, application deployment, CRM delivery or production activation occurred during this preparation. The intended project remains `jsagrvxgydvhdoxibzny`.

## Reviewable candidate

[Exact transactional SQL](production/20261116234811_clinahir_production_upgrade.sql) is frozen by [candidate manifest and SHA-256](production/migration-candidate.json). It lives outside `supabase/migrations` deliberately: the normal seven-file chain bootstraps a fresh database and must not be replayed against this legacy production schema. The CLI created the candidate in a separate unlinked temporary project before it was moved here. Historical source files and hosted migration history were not rewritten.

The source backup is `2026-11-16T23-30-09-724Z`; the [encrypted export](production/encrypted-backup.json), [offsite acceptance](production/offsite-acceptance.json), [isolated recovery](production/isolated-restore.json), and [owner-confirmed separate key custody](production/recovery-key-custody.json) retain their own evidence. This upgrade rehearsal does not replace managed Auth/Storage recovery.

## Reconciliation with the actual baseline

[Baseline reconciliation and hashes](production/baseline-reconciliation.json), [restored catalog](production/restored-baseline-catalog.json), and [fresh read-only catalog comparison](production/catalog-drift-check.json) show:

| Area | Actual production baseline | Candidate decision |
| --- | --- | --- |
| Lead identity | UUID `id` primary key; `external_id` has a unique constraint and default | Preserve both, rather than replacing the primary key with the fresh-install definition |
| Legacy columns | Extra `updated_at`, defaults, nullable city/role/priority/fingerprint fields, broader form types | Preserve existing definitions, timestamps and historical values; do not tighten legacy constraints |
| Existing behavior | Six base/outbox/analytics routine bodies match the local source after whitespace/comments; additional timestamp trigger function | Preserve unchanged routines and trigger; replace capture only to add the current phone-first job-enqueue contract |
| Indexes | Existing submitted-time index, email index and retry index | Retain all; omit the duplicate submitted-index creation |
| Email | NOT NULL with an existing length check | Relax NOT NULL to support current phone-first leads; preserve all existing emails and the length check |
| Missing features | Five private tables absent | Add WhatsApp jobs, cron heartbeat, site content, admin audit and prospects with final prospect address/category/filter behavior |
| Prospects listing | No existing prospects RPC | Install only the final five-argument signature, avoiding an unnecessary create/drop cycle and default-argument ambiguity |
| Browser permissions | Tables private; timestamp function previously executable by browser roles | Revoke browser/PUBLIC execution on all application routines; explicitly retain server service-role execution. New tables have RLS and explicit private grants |
| Hosted history | Only `20261003095511` outbox and `20261004180919` analytics recorded | Preserve these versions; do not insert guessed base history or rename old entries to match local filenames |

No existing table/row/column/index/function is dropped, truncated or reset. The one intentional schema relaxation is email nullability. A singleton CMS row is initialized with null draft/published content and version zero; no invented content, prospects or messaging jobs are seeded. Adding the queue schema does not activate WhatsApp or a worker.

The live read-only application catalog matched the restored backup catalog at the recorded check. This verifies metadata at that time, not ongoing row freshness, sealed Vercel settings, provider objects, or future schema state.

## Rehearsal evidence

[Rehearsal receipt](production/migration-rehearsal.json): **95 checks passed**, container removed. The harness uses only the archive/recovery key and local Docker; it does not load production database credentials or call hosted services. Its disposable PostgreSQL 17.11 container has no network, published ports or host mounts. Plaintext stays in process memory and the disposable container, with private local diagnostics if a failure occurs.

- Restored the original application backup without first altering its schema/ACLs; all three original row counts/digests matched.
- Verified the exact frozen candidate hash and baseline metadata precondition.
- Injected an error before commit: all candidate changes rolled back and original catalog/data digests remained identical.
- Applied the exact candidate, preserving every original row/field, ID, timestamp, outbox status, attempt and lease value; only the two new admin fields were excluded when comparing legacy row digests.
- Verified eight private application tables, invoker views/routines, browser-role denial of actual reads/writes, service access and RLS defense even under a temporary test SELECT grant.
- Exercised legacy-email and phone-first capture/idempotency, lease/token/retry semantics, CMS drafts/publishing/version conflict, prospects import/deduplication/filters/opt-out, admin snapshots/audit and heartbeat. All synthetic writes were rolled back locally. Ambiguous WhatsApp attempts move to review without contacting Meta.
- Rejected accidental candidate reapplication through the baseline guard, leaving the target catalog intact.

TypeScript test compilation and **30 targeted application tests passed** for admin authorization/MFA, disabled WhatsApp behavior and legacy migration contracts. These are fixture-based application checks, not production owner enrollment, hosted Auth/PostgREST acceptance or proof of working live CRM delivery. See [preparation acceptance](production/migration-preparation-acceptance.json).

## Preconditions for a later approved rollout

Production activation remains explicitly blocked. This document authorizes no hosted action.

1. Approve the exact project, candidate SHA-256, immutable application revision, owner identity, production settings and controlled acceptance boundary. Verify current Vercel/runtime bindings independently and keep WhatsApp disabled.
2. Immediately before execution, recheck application catalog and hosted history, create/verify a fresh recovery point appropriate to the rollout window, and retain the currently healthy immutable deployment/configuration references privately. Current metadata drift requires a new review and rehearsal.
3. Review production default grants/event-trigger behavior, actual owner MFA/AAL2, provider advisories and restricted HTTP access. The provider helper `rls_auto_enable` is excluded from the app archive and is not modified by the candidate.
4. Choose the controlled transaction runner and migration-history recording mechanism explicitly. Do not use an unreviewed `db push`, history repair, or replay of the existing chain. The candidate includes BEGIN/COMMIT, a complete application-baseline guard, a 5-second lock timeout and 120-second statement timeout. Review locking/write-traffic scheduling before execution; no lock-free rollout is claimed.
5. Apply only after explicit approval; independently verify post-migration metadata/private API access before routing the new application or enabling approved cron/CRM processing. Record the actual migration/version, operator and timestamps after a successful transaction, preserving historical entries.

## Failure and rollback boundaries

Before commit, PostgreSQL rolls back this transaction on error; this behavior was exercised locally. A timeout or ambiguous network response requires checking actual committed state before any retry. The guard intentionally rejects reapplication.

After commit, favor a corrected forward change while retaining the additive schema. The rehearsal verifies legacy email-capture compatibility but does not certify an unknown deployed application revision. Retain both version/configuration references, and validate legacy routing before choosing application rollback. Do not undo the upgrade by dropping the new tables or restoring the backup automatically. In particular, email NOT NULL cannot safely be reintroduced after phone-first leads exist. Database restore remains a separate incident decision. Preserve outbox IDs and reconcile uncertain downstream acknowledgements before retries.

Next gate: production configuration/security and release-candidate review, followed by operational readiness and separately approved activation. No production write is required merely to finish this preparation task.
