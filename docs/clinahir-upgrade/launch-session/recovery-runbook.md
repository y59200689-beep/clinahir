# Encrypted offsite recovery — operating procedure

Scope: Clinahir synthetic staging application database only. This is not a full Supabase Auth/Storage backup or a production RPO/RTO commitment. The isolated hosted restore target remains paused by the owner's earlier approval.

## Storage and access

The verified AES-256-GCM archive is in the connected business Drive, owned by `babdoukkalaradiologie@gmail.com`, explicitly approved by the owner. The approved owner and recovery operator have reader access to the archive, not business-admin privileges. [Backup](https://drive.google.com/file/d/1MqTrVv7jNKOoJbd9OCqdjBcEZUqxq0oY/view). Download/checksum/decryption passed independently of the upload. Evidence: [offsite-backup.json](offsite-backup.json), [offsite-sharing.json](offsite-sharing.json).

The original key remains in macOS Keychain. A mode-0600 portable copy is prepared locally at `output/staging/clinahir-recovery-key.keep-offline.txt`. Move it into an approved password manager or offline secure custody, independently of Drive. Never upload it beside the archive, commit it, send it in chat, or include it in shell arguments. Human custody and second-operator receipt remain unverified.

## Retention rule and execution gap

Proposed production operating policy: one verified encrypted backup daily retained 14 days, one weekly retained 8 weeks, and one monthly retained 12 months; additionally retain a verified pre-migration recovery point until the release and rollback window close. Do not prune the last independently recoverable archive. Preserve the manifest and checksums with each ciphertext, with the key stored separately.

This policy is documented, **not an installed scheduler, enforced Drive lifecycle or proven backup history**. Only the uploaded recovery point is verified. Agree a backup executor, credential custody, budget and retention owner before production; perform periodic operator drills and record actual recovery time. No automated deletion or recurring paid infrastructure was activated.

## Independent operator drill

1. The named recovery operator downloads the archive using their own Google account and obtains the key separately through the approved custody channel.
2. Place the portable key in a private file with mode 0600. Use a trusted copy of this repository and Node.js. Check the download's encrypted SHA-256 against `next-milestone/encrypted-backup.json`.
3. From the project root run:

   ```sh
   node scripts/staging/decrypt-offsite-backup.mjs --archive /private/path/archive.aesgcm --key-file /private/path/key.txt --expected-sha256 f9f3699c9492ad9d0ec7c36339f7d664396c1b040f3eed10d9425330d441db1f
   ```

   This authenticates and verifies in memory without writing plaintext. This exact command passed locally against the independently downloaded archive, using the portable key rather than implicit Keychain access. It does not establish another operator's participation.
4. When an approved **isolated** restore target is available, optionally add `--output /private/new/recovered.dump`. The command refuses an existing output path and writes mode 0600. Parse with the pinned PostgreSQL client and follow the reviewed transactional restore/privacy plan. Never restore into a live project for a drill.
5. Verify schema/data digests and anonymous/authenticated denial after restore, record actual durations, and obtain the second operator's confirmation. Retain only the approved encrypted recovery artifacts afterward.

## Outstanding recovery gates

- Actual independent operator download, key custody and drill.
- Automated verified exports/offsite delivery and retention enforcement.
- A fresh recoverable point after later staging writes; the current uploaded archive is the earlier synthetic recovery point.
- Reviewed managed Auth recovery (owner identity, MFA and session invalidation), Storage recovery if introduced, and measured RPO/RTO.
- Capacity/approved target for another hosted recovery drill; do not resume or pause projects unexpectedly to work around quotas.
