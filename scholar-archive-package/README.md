# Iron Vault Scholar Archive — Normalized Source Package

This is an offline content-and-capability package built from every file in `/opt/iron-vault/sex`. It deliberately contains no application UI, route, CSS, layout, database migration, active-release merge, or deployment change.

## Important boundaries

- Publication state: **unpublished**
- Database import: **not performed**
- Active curriculum release: **unchanged**
- Answer keys: isolated in `data/answer-keys.private.json`; do not send this file to browsers
- Canvas outlines: represented as blueprints, never labeled as finished lessons
- Old JSX presentation and CSS: not copied or mounted

## Integration-ready data

- `data/curriculum-canonical.json`: 138 unique, complete authored lesson bodies with stable UUIDs, slugs, blocks, provenance, and proposed placement
- `data/curriculum-source-records.json`: all source variants, including the excluded gated duplicates
- `data/assessments.json`: questions/options without correct answers
- `data/answer-keys.private.json`: private correct-option IDs and explanation gaps
- `data/interactions.json`: extracted interaction instances
- `data/learning-activities.json`: authored assignments plus Canvas activity/project/capstone blueprints
- `data/capability-map.json`: reusable behavior contracts for interactions, instructor, narration, media, and motion
- `data/media-audio-map.json`: asset references and absence findings
- `data/narration-manifest.json`: narration text and proposed offline asset associations per lesson UUID
- `data/duplicate-reconciliation-map.json`: exact, variant, and possible-overlap relationships
- `data/proposed-placement.json`: proposed pathway/course/module placement only
- `data/canvas-blueprints.json`: Canvas pathways, courses, outlines, bootcamp, AI, developer, security, enterprise, growth, assessments, and interaction blueprints
- `data/canvas-coverage-map.json`: every detailed Canvas outline item mapped to its best authored-lesson candidate or marked body-missing
- `data/missing-content.json`: missing bodies, explanations, media, Module Zero, and sourcing gaps
- `data/sources.json`: byte counts, SHA-256, actual content types, counts, instructions, and contradictions
- `source-extractions/master-curriculum-canvas.complete.json`: complete paragraph/table extraction of the real DOCX

## Validation

See `data/validation.json` and the reports in `reports/`. Rebuild deterministically with:

```bash
node scholar-archive-package/tools/build-package.mjs
```

The generator uses Node built-ins only and performs no network or database access.
