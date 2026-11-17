# Production activation review — not executed

This session changes only the dedicated protected staging project and synthetic resources. Live Daily Command remains read-only. There is no approval to activate production, copy staging secrets into production or enable WhatsApp.

## Required review before an activation approval

- Complete the human owner's password/MFA setup and verify AAL2 business access; verify recovery operator custody/drill and backup execution/retention.
- Resolve or explicitly accept the measured performance gap and complete manual accessibility checks, including screen reader, keyboard, zoom/reflow and touch across supported browsers.
- Inventory production **names and destinations only**, with secret values entered privately by an authorized operator: independent Supabase project URL/service-role key, exact owner ID/email, `CLINAHIR_ADMIN_MFA_REQUIRED=true`, a separate cron secret, exact live CRM origin/integration secret and destination owner. Confirm least privilege, secret lifecycle and no `VITE_` exposure. Review current plan's leaked-password-protection limitation without silently upgrading it.
- Review production migration hashes and additive compatibility against an actual current backup and isolated restore. Seven earlier staging migrations are not proof of production schema state; never apply them blindly. No production migration is executed here.
- Confirm the live Daily Command receiver source/revision, destination owner, idempotency contract, production allowlist and agreed synthetic-test boundary. Earlier sandbox acceptance does not certify live credentials, policies or live receiver behavior.
- Review hosting access, DNS/domain ownership, server cron scheduling/retry authorization, alerting owner and synthetic smoke-test cleanup. Keep staging noindex/protection, disabled simulated receiver and separate bypass credentials. Never send a staging hosting credential to live CRM.
- WhatsApp remains off. Activation would require its own approved credentials/template, opt-in/privacy handling and end-to-end provider-delivery tests. Clinical/PACS/DICOM workflows remain excluded.

## Controlled activation and rollback procedure

1. Record the approved immutable production candidate, configuration key inventory, migration hashes, last verified recovery point and currently healthy production deployment. Obtain explicit approval of these concrete targets and scope.
2. Stage the candidate using production-specific reviewed settings without changing live aliases. Verify authentication, owner MFA, private database denial and guarded routing through approved test access.
3. After approval, enable the exact live CRM route and execute the approved non-patient synthetic delivery once; independently verify one durable source lead, one destination receipt and acknowledgement. Confirm duplicates/retries preserve identity. Do not use real patients.
4. Observe error rates and outbox/backoff health before any further traffic expansion. Record the executed checks rather than inferring success from functions or HTTP acceptance alone.
5. On failed acceptance, stop new forwarding/cron processing, restore the recorded healthy deployment/configuration and retain saved source leads/outbox identities. Do not clear queues or manufacture new IDs. Reconcile ambiguous CRM acknowledgements before controlled retries. Restoring a database requires a separate incident decision and reviewed recovery procedure, not an automatic destructive rollback.
6. Record operator, timestamps, configuration revisions, acceptance evidence and any rollback. No production commands or live secret values are included in this document.

Protected staging rollback evidence is in [preview-access.json](preview-access.json): the previous and new immutable Preview URLs are recorded. Moving the staging alias back is available for a failed release, but the previous Preview uses the synthetic owner and does not include mandatory MFA; it is not a secure long-term fallback for human business use. Prefer a corrected mandatory-MFA Preview.
