INSERT INTO curriculum_releases (
  id,
  academy_id,
  version,
  title,
  status,
  source_manifest_hash,
  published_at
)
SELECT
  md5('iron-vault:release:foundations-v1')::uuid,
  academies.id,
  'foundations-v1',
  'Iron Vault Foundations v1',
  'published',
  encode(digest('iron-vault-foundations-v1', 'sha256'), 'hex'),
  NOW()
FROM academies
WHERE academies.slug = 'iron-vault-academy'
ON CONFLICT (academy_id, version) DO UPDATE SET
  title = EXCLUDED.title,
  status = 'published',
  published_at = COALESCE(curriculum_releases.published_at, EXCLUDED.published_at),
  updated_at = NOW();

INSERT INTO pathways (
  id,
  release_id,
  slug,
  title,
  description,
  outcome,
  access_class,
  editorial_state,
  sort_order
)
VALUES (
  md5('iron-vault:pathway:foundations-v1')::uuid,
  md5('iron-vault:release:foundations-v1')::uuid,
  'foundations',
  'Foundations',
  'Build safe operating habits before evaluating digital assets or using on-chain applications.',
  'Use verifiable evidence, protect wallet authority, and distinguish present facts from claims.',
  'free',
  'published',
  0
)
ON CONFLICT (release_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  outcome = EXCLUDED.outcome,
  access_class = 'free',
  editorial_state = 'published',
  updated_at = NOW();

INSERT INTO courses (
  id,
  pathway_id,
  slug,
  title,
  description,
  outcome,
  access_class,
  editorial_state,
  sort_order,
  estimated_minutes
)
VALUES (
  md5('iron-vault:course:evidence-first-v1')::uuid,
  md5('iron-vault:pathway:foundations-v1')::uuid,
  'evidence-first',
  'Evidence First',
  'A practical starting course for wallet control, transaction evidence, and claim evaluation.',
  'Apply a repeatable stop, verify, and classify process before taking an irreversible action.',
  'free',
  'published',
  0,
  24
)
ON CONFLICT (pathway_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  outcome = EXCLUDED.outcome,
  access_class = 'free',
  editorial_state = 'published',
  estimated_minutes = EXCLUDED.estimated_minutes,
  updated_at = NOW();

INSERT INTO curriculum_modules (
  id,
  course_id,
  slug,
  title,
  subtitle,
  description,
  access_class,
  editorial_state,
  sort_order,
  estimated_minutes,
  xp_value
)
VALUES (
  md5('iron-vault:module:safe-start-v1')::uuid,
  md5('iron-vault:course:evidence-first-v1')::uuid,
  'safe-start',
  'Safe Start',
  'Control first. Evidence second. Claims last.',
  'Three short lessons that establish the operating discipline used throughout Iron Vault Academy.',
  'free',
  'published',
  0,
  24,
  75
)
ON CONFLICT (course_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  access_class = 'free',
  editorial_state = 'published',
  estimated_minutes = EXCLUDED.estimated_minutes,
  xp_value = EXCLUDED.xp_value,
  updated_at = NOW();

WITH lesson_seed (
  key,
  slug,
  title,
  summary,
  sort_order
) AS (
  VALUES
    (
      'wallet-control',
      'wallet-control',
      'Protect Wallet Control',
      'Understand what grants control of a wallet and use a safe response when someone asks for that authority.',
      0
    ),
    (
      'transaction-evidence',
      'transaction-evidence',
      'Read Transaction Evidence',
      'Separate what an explorer can prove from the conclusions it cannot establish on its own.',
      1
    ),
    (
      'facts-and-claims',
      'facts-and-claims',
      'Separate Facts from Claims',
      'Classify project statements before you rely on them or act on them.',
      2
    )
)
INSERT INTO lessons (
  id,
  module_id,
  slug,
  title,
  summary,
  lesson_type,
  access_class,
  editorial_state,
  sort_order,
  estimated_minutes,
  xp_value,
  is_required
)
SELECT
  md5('iron-vault:lesson:foundations-v1:' || lesson_seed.key)::uuid,
  md5('iron-vault:module:safe-start-v1')::uuid,
  lesson_seed.slug,
  lesson_seed.title,
  lesson_seed.summary,
  'mixed',
  'free',
  'published',
  lesson_seed.sort_order,
  8,
  25,
  TRUE
FROM lesson_seed
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  lesson_type = EXCLUDED.lesson_type,
  access_class = 'free',
  editorial_state = 'published',
  sort_order = EXCLUDED.sort_order,
  estimated_minutes = EXCLUDED.estimated_minutes,
  xp_value = EXCLUDED.xp_value,
  is_required = TRUE,
  updated_at = NOW();

WITH block_seed (
  lesson_key,
  sort_order,
  block_type,
  payload,
  evidence_class,
  source_citations
) AS (
  VALUES
    (
      'wallet-control',
      0,
      'heading',
      '{"text":"Control is the asset"}'::jsonb,
      'interpretation',
      '[]'::jsonb
    ),
    (
      'wallet-control',
      1,
      'body',
      '{"text":"A wallet does not store coins in the way a physical wallet stores cash. It holds the credentials used to authorize actions for blockchain accounts. Anyone who obtains the recovery phrase or equivalent signing authority may be able to act as the wallet owner."}'::jsonb,
      'fact',
      '[{"label":"Solana core concepts","url":"https://solana.com/docs/core","publisher":"Solana Foundation","reviewedAt":"2026-07-30"}]'::jsonb
    ),
    (
      'wallet-control',
      2,
      'warning',
      '{"title":"A legitimate support conversation never needs your recovery phrase","text":"If anyone asks for it, stop. Do not share part of it, type it into a linked page, or continue through direct messages. Close the conversation and independently locate the provider’s official support channel.","variant":"warning"}'::jsonb,
      'interpretation',
      '[]'::jsonb
    ),
    (
      'wallet-control',
      3,
      'scenario',
      '{"title":"The urgent support message","instructions":"Use this sequence before responding.","items":[{"title":"Stop","text":"Do not click, sign, or disclose anything while urgency is being applied."},{"title":"Verify independently","text":"Open the provider from a trusted bookmark or type its known address yourself."},{"title":"Preserve control","text":"Treat recovery phrases and private keys as non-shareable signing authority."}]}'::jsonb,
      'scenario',
      '[]'::jsonb
    ),
    (
      'wallet-control',
      4,
      'action',
      '{"title":"Your operating rule","text":"No person, support agent, website, or direct message gets your recovery phrase. When authority is requested, stop and verify through a channel you found independently.","variant":"vault"}'::jsonb,
      'interpretation',
      '[]'::jsonb
    ),

    (
      'transaction-evidence',
      0,
      'heading',
      '{"text":"A record is evidence, not a conclusion"}'::jsonb,
      'interpretation',
      '[]'::jsonb
    ),
    (
      'transaction-evidence',
      1,
      'body',
      '{"text":"A Solana transaction contains instructions and signatures, and its execution produces a recorded result. An explorer can expose details such as the transaction signature, status, accounts, programs, instructions, and balance changes."}'::jsonb,
      'fact',
      '[{"label":"Solana transactions","url":"https://solana.com/docs/core/transactions","publisher":"Solana Foundation","reviewedAt":"2026-07-30"}]'::jsonb
    ),
    (
      'transaction-evidence',
      2,
      'comparison',
      '{"title":"What the record does and does not establish","items":[{"title":"Directly observable","text":"A transaction signature, execution status, referenced accounts and programs, instructions, and recorded changes."},{"title":"Requires outside evidence","text":"The real-world identity behind an address, the legality or wisdom of an action, and whether a future promise will be fulfilled."}]}'::jsonb,
      'fact',
      '[{"label":"Solana core concepts","url":"https://solana.com/docs/core","publisher":"Solana Foundation","reviewedAt":"2026-07-30"}]'::jsonb
    ),
    (
      'transaction-evidence',
      3,
      'callout',
      '{"title":"Do not overclaim","text":"“The transaction exists” and “the promoter’s story about the transaction is true” are different statements. Confirm the first on-chain; investigate the second with independent evidence.","variant":"vault"}'::jsonb,
      'interpretation',
      '[]'::jsonb
    ),
    (
      'transaction-evidence',
      4,
      'action',
      '{"title":"Evidence checklist","text":"Record the network, transaction signature, status, relevant addresses, program IDs, and timestamp. Then write down which conclusions still depend on off-chain evidence.","variant":"vault"}'::jsonb,
      'interpretation',
      '[]'::jsonb
    ),

    (
      'facts-and-claims',
      0,
      'heading',
      '{"text":"Classify before you trust"}'::jsonb,
      'interpretation',
      '[]'::jsonb
    ),
    (
      'facts-and-claims',
      1,
      'body',
      '{"text":"Digital-asset promotions often combine present facts, future plans, assumptions, and marketing claims. Treating those categories as equivalent makes weak evidence look stronger than it is."}'::jsonb,
      'interpretation',
      '[]'::jsonb
    ),
    (
      'facts-and-claims',
      2,
      'sorting',
      '{"title":"Four evidence buckets","instructions":"Place every important statement into one bucket: present verifiable fact, future plan, stated assumption, or promotional claim. Require an appropriate source for each bucket."}'::jsonb,
      'scenario',
      '[]'::jsonb
    ),
    (
      'facts-and-claims',
      3,
      'warning',
      '{"title":"Guaranteed-return language is a red flag","text":"Crypto assets can be speculative and volatile, and losses can be significant. Confidence, scarcity, and social proof do not remove risk or substitute for evidence.","variant":"warning"}'::jsonb,
      'fact',
      '[{"label":"Investor.gov crypto asset risk alert","url":"https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-alerts/crypto-asset-securities","publisher":"U.S. Securities and Exchange Commission","reviewedAt":"2026-07-30"}]'::jsonb
    ),
    (
      'facts-and-claims',
      4,
      'action',
      '{"title":"The evidence-first decision","text":"Before acting, list what is verifiable now, what is only planned, what must be assumed, what could cause loss, and which source supports each conclusion.","variant":"vault"}'::jsonb,
      'interpretation',
      '[]'::jsonb
    )
)
INSERT INTO content_blocks (
  id,
  lesson_id,
  block_type,
  sort_order,
  payload,
  evidence_class,
  source_citations,
  editorial_state
)
SELECT
  md5(
    'iron-vault:block:foundations-v1:'
    || block_seed.lesson_key
    || ':'
    || block_seed.sort_order::text
  )::uuid,
  md5(
    'iron-vault:lesson:foundations-v1:'
    || block_seed.lesson_key
  )::uuid,
  block_seed.block_type,
  block_seed.sort_order,
  block_seed.payload,
  block_seed.evidence_class,
  block_seed.source_citations,
  'published'
FROM block_seed
ON CONFLICT (lesson_id, sort_order) DO UPDATE SET
  block_type = EXCLUDED.block_type,
  payload = EXCLUDED.payload,
  evidence_class = EXCLUDED.evidence_class,
  source_citations = EXCLUDED.source_citations,
  editorial_state = 'published',
  updated_at = NOW();

INSERT INTO curriculum_source_records (
  id,
  release_id,
  entity_type,
  entity_id,
  source_path,
  source_key,
  source_hash,
  importer_version,
  source_metadata
)
VALUES (
  md5('iron-vault:source:foundations-v1')::uuid,
  md5('iron-vault:release:foundations-v1')::uuid,
  'pathway',
  md5('iron-vault:pathway:foundations-v1')::uuid,
  'packages/database/migrations/0006_foundations_v1.sql',
  'pathway:foundations-v1',
  encode(digest('iron-vault-foundations-v1', 'sha256'), 'hex'),
  'foundations-v1',
  '{"reviewClass":"public-safety-foundations","sourcePolicy":"official-primary"}'::jsonb
)
ON CONFLICT (release_id, source_path, source_key) DO NOTHING;
