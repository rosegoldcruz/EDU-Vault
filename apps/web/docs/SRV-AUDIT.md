# SRV Audit

Phase 0 completed 2026-07-15. The full audit reports are retained at:

- `/srv/SRV-AUDIT.md`
- `/srv/IRON-VAULT-REPOSITORY-MAP.md`
- `/srv/IRON-VAULT-CANONICAL-DECISION.md`
- `/srv/LEGACY-REPOSITORY-INVENTORY.md`
- `/srv/LEGACY-CAPABILITY-MATRIX.md`
- `/srv/LEGACY-MIGRATION-BACKLOG.md`

Key result: `/srv` had two independent repositories, not a monorepo. This repository was selected as the canonical seed because it is clean, remote-backed, recent, and contains the best tested Privy/internal-user/wallet/progression/XP invariants. `/srv/iron-vault-automation` is the backend transplant source. The production-linked legacy public and member repositories remain intact as source material and active deployments until controlled cutover.

The user-supplied legacy path `/home/vupi/projects` was absent; `/home/vupi-projects` was the live source root. No repository, production deployment, environment value, database, or CRM object was changed during discovery.

