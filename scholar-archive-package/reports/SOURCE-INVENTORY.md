# Scholar Archive Source Inventory

Generated from all 12 archive files. Counts are detected from actual payloads, not filename assumptions.

| Source filename | SHA-256 | Detected content | Modules/outlines | Lessons | Assessments | Questions | Keys | Interactive components |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| contentblock-interactive-extension.jsx | `59b13a6ebe25622640c738396e6efa57a3670c69a6302063dfbf44417f876096` | motion-and-design-directive | 0 | 0 | 0 | 0 | 0 | 0 |
| generate-lesson-audio.mjs | `26ec8bdf086f4edd9e8189fa524bf42c4046a2039740c88a54dad41dc02226ad` | interactive-block-react-reference | 0 | 0 | 0 | 0 | 0 | 5 |
| instructor-integration.md | `18e34cda8d00c1f26bb46e7c55727eff1f51efada831e6b68815373a6b29aa2e` | elevenlabs-offline-audio-generator | 0 | 0 | 0 | 0 | 0 | 0 |
| iron-vault-academy-gated.jsx | `2b77778309f87b9b35d8129745dbf403854c97d4477734b70356cdbd01d07d0f` | lesson-instructor-integration-guide | 0 | 0 | 0 | 0 | 0 | 0 |
| iron-vault-academy-unlocked (1).jsx | `72352d24ae18418c0235a6b2fe1304727fd79ae82987633db05c549f7e45757f` | gated-original-academy-with-embedded-curriculum | 6 | 40 | 6 | 60 | 60 | 0 |
| iron-vault-modules-13-22.jsx | `592281060dc83fecc84d7ade04d7bff33cd0b2c67778cfc1ff12c67e3e02e012` | unlocked-original-academy-with-embedded-curriculum | 6 | 40 | 6 | 60 | 60 | 0 |
| iron-vault-modules-7-12.md | `5f8df33e08bd1738d6c24137e1383c8cd5bd97be7bdc7c3742d787d959727d04` | authored-modules-13-22-javascript | 10 | 32 | 10 | 100 | 100 | 12 |
| Iron_Vault_Master_Curriculum_Canvas.docx | `519232cdd530109b8713858b5851a612ff1ee9a9f46850e65e2c6ca1e4870664` | authored-modules-7-12-markdown | 6 | 36 | 6 | 60 | 60 | 0 |
| LessonInstructor.jsx | `a01a2a67b9586158918091bc261efd9df0c1a4e8fabab29b77cf7f615252d050` | master-curriculum-canvas-docx | 137 | 15 | 42 | 0 | 0 | 12 |
| module zero.md | `304b578f5cd96f7ced2c7749e86348ef8f42583bda4d790fbb6ee462297b21e1` | lesson-instructor-react-reference | 0 | 0 | 0 | 0 | 0 | 1 |
| VaultLoadingScreen-integration.md | `d11b612bcc230e2e98066e2c3e0bacaed7d143701b69f088965ba66dcfb6adb9` | authored-researched-crypto-modules-1-10 | 10 | 30 | 10 | 100 | 100 | 14 |
| VaultLoadingScreen.jsx | `68b1dc7c349abee430b7c8f036d1d888cb7b538e41fb51f197221b90c749f799` | vault-loading-screen-integration-guide | 0 | 0 | 0 | 0 | 0 | 0 |

## Filename/content contradictions

- **contentblock-interactive-extension.jsx:** Filename says interactive content blocks; payload is a site-wide motion directive.
- **generate-lesson-audio.mjs:** Filename says audio generator; payload implements calculator, simulator, scenario, sortgame, and reveal.
- **instructor-integration.md:** Markdown filename contains executable Node.js rather than an integration guide.
- **iron-vault-academy-gated.jsx:** Filename says gated Academy; payload is an instructor/narration integration guide.
- **iron-vault-academy-unlocked (1).jsx:** Filename says unlocked; source header and behavior identify the gated variant.
- **iron-vault-modules-13-22.jsx:** Filename says modules 13–22; payload is the unlocked modules 1–6 Academy.
- **iron-vault-modules-7-12.md:** Filename says modules 7–12; payload declares MODULES_13_22.
- **Iron_Vault_Master_Curriculum_Canvas.docx:** DOCX extension is false; payload is UTF-8 Markdown for Modules 7–12.
- **LessonInstructor.jsx:** JSX extension is false; payload is a valid Microsoft Word DOCX with 38 tables.
- **module zero.md:** Filename says Module Zero; payload is the LessonInstructor React component and contains no Module Zero curriculum.
- **VaultLoadingScreen-integration.md:** Filename says loading-screen integration; payload is a complete researched ten-module crypto curriculum.
- **VaultLoadingScreen.jsx:** Filename says JSX component; payload is the Markdown integration guide.

## Complete DOCX extraction

The valid Word document is `sex/LessonInstructor.jsx`, despite its extension. The package extracted 915 non-empty paragraphs and all 38 tables into `source-extractions/master-curriculum-canvas.complete.json`. The file named `Iron_Vault_Master_Curriculum_Canvas.docx` is actually UTF-8 Markdown containing complete Modules 7–12.
