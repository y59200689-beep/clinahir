# Concrete release preparation — activation still blocked

The user requested completion of the remaining launch work. All work possible with current access is prepared and tested; private runtime inputs and human owner enrollment remain necessary. This is not a release approval and does not mark the site upgraded.

## Exact targets and candidate

- Site: `clinahir.tech` (verified); `www.clinahir.tech` redirects to it. Vercel project `prj_zGZICTaNNTHcLa1fhxI1WQCto7lK`, team `team_TjuQw2TZ5FOq8fdj8xeiBoFz`.
- Database: `jsagrvxgydvhdoxibzny`; reviewed additive SQL and frozen hash in `migration-candidate.json`. It passed 95 isolated checks; the hosted migration is not applied.
- Application: local frozen source tree and SHA-256 in `release-candidate.json`. No hosted candidate or production promotion has occurred. The dirty working tree was captured explicitly; no unrelated changes were committed.
- Current rollback reference: Clinahir deployment `dpl_BjcY5BWyDSkg4nRtLoJTUjtpaTeV` / `clinahir-nc9r2lowo-paraoonline.vercel.app`, Git SHA `d4fe45346c44df55d0b606a9459586ee5e85d663`. Current public root and admin routes respond; unauthenticated admin and health reject access. Re-read immediately before release.
- Live CRM: project `prj_qkHMHxMVera3Lp6yHg82GXwXSNnR`, deployment `dpl_4TLfbhiqvmyntd8LPkktqdBQTFyd`, revision `ff74c0d37686f7117f439331932b98802c647c4d`; aliases and exact receiver source review are recorded separately. No CRM code/configuration/records were changed.

## Prepared changes

The production hosting candidate routes `/admin` and `/admin/` to dedicated `admin.html`, adds no-store/noindex handling for admin and no-store for APIs, and retains the existing daily delivery cron at 03:00 UTC. Its production build/runtime gates reject absent production identity, mismatched database/CRM origins, missing server settings, non-mandatory owner MFA, staging bypass credentials or enabled WhatsApp. The public build identity is explicitly production and browser Sentry stays disabled. Production-only configuration is separate from `.env.local`, which points to another database and was rejected as a source.

The private setup launcher is `Production configuration setup.command`. It writes only restricted, Git-ignored local configuration, asks for the chosen owner email and existing production API key/cron/CRM settings, permits unavailable old values to remain blank, and performs no network, account creation or configuration write. Unknown secret values must not be invented or silently replaced. If the old shared secret cannot be recovered, prepare and approve a coordinated sender/receiver replacement and rollback strategy before either value changes.

Production Auth currently contains zero users and zero verified TOTP factors. Therefore production owner authentication is not ready. After the chosen email is available, review creation of exactly one owner account without a default password or unsolicited invitation; the owner must privately complete password/MFA setup. Do not copy staging identities/factors or use the database password as an API key. Confirm authenticated AAL2 owner access and non-owner denial against the actual released APIs; fixture tests cannot replace this.

## Executed evidence

- Full release check: 12 commands passed, 123 Node tests passed, zero failures; 24 browser workflow groups and 8 owner axe scans passed.
- Native Brave 200% zoom: sampled sign-in/public inquiry fields, labels and dropdowns remained reachable in vertical flow; zoom restored. VoiceOver stays off. Existing Safari keyboard evidence remains, with no full screen-reader certification claimed.
- Production build: valid fictional dedicated settings built successfully; invalid missing-MFA settings failed closed before building. No actual production keys were loaded for that build.
- Frozen source and public artifacts contain none of the known private production export password/recovery key values. This scan is bounded to known local secrets, not proof about undisclosed sealed values.
- Fresh read-only production backup, encrypted offsite upload, independent download/decryption and inherited reader metadata passed. Initial recovery point remains pinned; daily desktop production automation is ACTIVE with failure notifications. Future runs and strict always-on RPO/RTO are not claimed.

Initial sandbox loopback restrictions are preserved in earlier command outputs; affected browser/HTTP suites were rerun with the required access and passed. No application failure was suppressed.

## Remaining dependent execution

1. Complete private setup. Verify the service credential against the exact project without showing values, independently identify the live CRM origin/recipient and confirm the shared secret through private custody. Review provider advisory/default-grant limits. The Vercel presence of a sensitive variable is not proof of its actual value or validity.
2. Review the exact owner account and any secret/config changes. Keep the current activation block until the operator/owner explicitly approves these concrete targets and scope. Human password/MFA entry must remain private.
3. Recheck source/migration hashes and current catalog, verify a fresh recovery point and preserve current healthy deployment/configuration references. The source includes the already reviewed existing daily delivery schedule; do not broaden it without review.
4. After approval, apply only the guarded exact migration in a transaction using the reviewed history-recording approach. No `db push`, guessed history repair or replay of the seven original files. Verify private tables/RPCs and provider grants before routing traffic.
5. Deploy the exact reviewed source and production-specific settings; record its immutable deployment ID before assigning the approved custom domains. Verify dedicated admin HTML/noindex/no-store, owner AAL2, non-owner/anonymous denial, content privacy and disabled WhatsApp. Keep the rollback target available.
6. Run one bounded non-patient synthetic acceptance identity through the live website after authorization. Independently verify exactly one source row, one CRM receipt for the approved recipient, acknowledgement, duplicate/retry identity and zero WhatsApp sends. Record and isolate the synthetic IDs; cleanup requires a reviewed record policy, never deleting unknown live data.
7. Observe private health, outbox age/attempts and actual cron logs. Reconcile ambiguous destination acknowledgements before retries. Do not clear queues or generate replacement external IDs.

If application acceptance fails, stop new forwarding/cron activation and restore the recorded healthy application/config relationship under operator control, preserving saved leads and IDs. A post-commit database restore or removal of new schema is a separate incident decision; email NOT NULL cannot safely be restored after phone-first leads exist. No destructive automatic database rollback is prepared.
