# Production backup and isolated recovery gate — proposed, not executed

The owner confirmed that Vercel uses **jsagrvxgydvhdoxibzny**, project **clinahir**, in **ysfkhaourimahir@gmail.com's Org**. This is owner confirmation, not an independent reading of sealed Vercel settings. Existing production/staging credentials and guard variables have not been changed.

## Scope proposed for approval

- Source: only `jsagrvxgydvhdoxibzny`. Verify the connection identity and certificate before export. Never select the unrelated Daily Command project `sqzkqzrvxkdbcdpwcywd` or staging database `fsfqgionuuxykpoxhrdm` as this source.
- First execute the accompanying `catalog-review.sql`: a read-only transaction covering server version, application object/column/constraint/policy metadata and role grants/routine digests. No contact/patient rows, Auth users or secret settings are selected by that review.
- Export the existing **Clinahir public application objects and data** (currently the lead/outbox/analytics scope) using an approved private database-access path. The data export may contain business names, contact names, phone/email details and inquiry metadata. It is not authorized to collect unrelated tables, real medical records, managed Auth passwords/MFA secrets or Storage objects.
- Use an existing appropriately authorized export credential, entered privately. Do not reuse staging credentials, reset the owner's password or silently create a production login/role/policy. If a temporary export role/grant is necessary, stop for a separate review of the exact change; the current proposal authorizes no permission changes.
- Encrypt the archive before offsite transmission, with a fresh production recovery key separated from the staging key. Keep the key in private local custody/Keychain, prepare an owner-held offline copy, and never upload or send it through Drive/chat. Do not claim off-Mac custody until the owner verifies it.
- Proposed offsite destination: a new private **Clinahir — encrypted production backups** folder in the already-approved business Drive account `babdoukkalaradiologie@gmail.com`. Upload ciphertext plus a non-secret integrity manifest only. Proposed readers remain `youssefmahir87@gmail.com` and `ysfkhaourimahir@gmail.com`; sharing sends Google Drive notifications. No public/domain access, no key sharing through Drive and no paid infrastructure.
- Independently download the uploaded ciphertext and verify ciphertext/plaintext digests and authenticated decryption.
- Restore only into a fresh disposable local PostgreSQL test container with no network or published ports. Reconcile private grants within the restore transaction, verify object/data digests and restricted-role denial, then remove the container. Do not restore into, pause, resume or overwrite any hosted project. A local drill is not managed Auth/Storage disaster-recovery certification or an always-on production RPO/RTO.

## What stays blocked

No production migration, application deployment, credential rotation, new production permission, live CRM write/acceptance test, worker activation, WhatsApp activation or clinical operation is part of this approval scope. No production backup schedule is created here; the existing scheduled desktop job remains staging-only.

## Access prerequisite

Brave dashboard access is available. The current API/CLI connection remains the separate staging account and is not automatically authenticated by the Brave session. The actual export credential/access path must be established privately before a backup can run. Do not extract browser session cookies/tokens or overwrite the staging automation login merely to bypass this boundary.

## Required receipts

Record exact source/target identity, read-only catalog results, archive digests, encryption verification, actual Drive ID and reader permissions, independent download/decryption, isolated restore and cleanup results. Never mark the gate passed from a planned export, a file upload alone, estimated empty-row counts or the provider's Healthy status.
