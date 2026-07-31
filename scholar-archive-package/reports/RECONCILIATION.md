# Scholar Archive Reconciliation

## Package state

- Offline and unpublished.
- No database import or schema migration.
- No active curriculum merge.
- No Academy UI, member route, shell, navigation, CSS, or layout changes.
- No build, PM2 restart, staging change, or deployment.

## Counts

- Source curriculum modules, including the gated/unlocked variants: 38
- Source lessons, including variants: 178
- Canonical modules after excluding the shorter gated presentation variant: 32
- Canonical full lesson bodies: 138
- Canonical module assessments: 32
- Canonical questions and server-private answer-key records: 320
- Extracted interactive instances: 26
- Narration associations: 138
- Duplicate/overlap relationships: 40

## Reconciliation decisions

- The unlocked original Academy source is the canonical body for modules 1–6 because it is generally the more complete authored variant. The gated body remains intact in `curriculum-source-records.json`.
- Modules 7–12 are parsed from the text payload falsely named `Iron_Vault_Master_Curriculum_Canvas.docx`.
- Modules 13–22 are parsed from the source falsely named `iron-vault-modules-7-12.md`.
- The researched crypto modules 1–10 are retained as a separate course family rather than overwriting the original Academy’s colliding legacy indexes.
- Canvas items remain blueprints. They are represented, mapped, and explicitly not promoted to finished lessons.
- Possible conceptual overlaps are never auto-merged.

## Review boundary

Every normalized entity is unpublished. Fact review is required on every authored lesson; legal review and owner approval are flagged heuristically and must be confirmed by humans before any later import or publication.
