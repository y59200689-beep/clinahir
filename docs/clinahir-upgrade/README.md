# Clinahir local upgrade — 2026-11-15

This is an existing-architecture local upgrade, not a claim of a completed clinical SaaS or production activation. No deployment, live schema changes, credential changes or real medical-data integration were performed.

1. [Architecture audit and baseline](01-audit.md)
2. [Implemented changes by application area](02-implementation.md)
3. [Dependency integration and deferral decisions](03-dependencies.md)
4. [Security findings, database review and migration requirements](04-security-database.md)
5. [Commands, results and test limits](05-testing.md)
6. [Feature matrix, production readiness gates and prioritized next work](06-status-readiness.md)

## Phase 2 — functional completion and staging preparation

7. [Current implementation, verification, feature matrix and readiness gates](07-phase2-completion.md)
8. [Staging checklist, environment inventory, verification, deployment and rollback plan](staging/README.md)

The six Phase 1 reports above collectively cover the original nine deliverables and remain historical evidence. Phase 2 supersedes their incomplete admin French/profile editing items. The current implementation uses explicit bilingual admin dictionaries, shared editable demo profiles and linked appointment state; no clinical persistence or production activation is claimed.

Run `npm run check:phase2` for the complete local gate (browser suites run sequentially on fixture port 4181). Exact command results: [phase2-check-results.json](phase2-check-results.json). Browser evidence: [phase2-browser-results.json](phase2-browser-results.json) and [browser-results.json](browser-results.json). Read-only remote evidence: [phase2-readonly-results.json](phase2-readonly-results.json). Bundle measurements: [phase2-bundles.json](phase2-bundles.json).

## Phase 3 — protected staging preparation

[Phase 3 executive summary and all ten reports](phase3/README.md) now contain the current staging/security, integration, recovery, accessibility and performance findings. Remote actions remain explicitly approval-gated. The local gate is `npm run check:phase3`; mocked/loopback results are separated from unavailable staging evidence.

## Authorized staging execution follow-up

[Current protected staging, real integration acceptance and recovery evidence](staging-execution/README.md) supersede the earlier preparation/access-blocked status. The dedicated protected Preview, seven staging migrations, synthetic hosted Auth/persistence/CRM failure tests and independent hosted application recovery have now been exercised. Production activation and real clinical operations remain outside scope.

## Real Daily Command sandbox milestone

[Latest integration, hardening, resource decisions and exact test evidence](next-milestone/README.md): the actual Daily Command app now runs in a separate protected sandbox and Clinahir staging is connected to it. Actual failure/retry and cross-user isolation were exercised. The owner-approved recovery target is now paused, with its data preserved, to free the sandbox's project slot. Live CRM and production configuration remain unchanged.

## Human owner, offsite recovery and final staging follow-up

[Current session evidence and remaining production gates](launch-session/README.md) records the approved human owner/MFA acceptance, encrypted offsite backup/sharing, new protected Preview, fresh sandbox acceptance, exact regression counts and unresolved performance/manual recovery gates. Production remains inactive.

## Final staging work and owner decisions

[Current release, exact verification, scheduled backup procedure and remaining external acceptance](final-gates/README.md) supersedes earlier performance, offsite-backup and staging-release status. Production activation is explicitly blocked by the owner. VoiceOver testing was stopped and the OS switch confirmed off.
