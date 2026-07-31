INSERT INTO academies (id, slug, title, description, status)
VALUES (
  md5('iron-vault:academy:iron-vault-academy')::uuid,
  'iron-vault-academy',
  'Iron Vault Academy',
  'Iron Vault education system',
  'active'
)
ON CONFLICT (slug) DO UPDATE SET
  status = 'active',
  updated_at = NOW();

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
  md5('iron-vault:release:entry-test-v1')::uuid,
  academies.id,
  'entry-test-v1',
  'Iron Vault Entry Test v1',
  'published',
  encode(digest('iron-vault-entry-test-v1', 'sha256'), 'hex'),
  NOW()
FROM academies
WHERE academies.slug = 'iron-vault-academy'
ON CONFLICT (academy_id, version) DO NOTHING;

INSERT INTO assessments (
  id,
  release_id,
  slug,
  title,
  purpose,
  audience,
  status,
  passing_score,
  max_attempts,
  configuration,
  published_at
)
VALUES (
  md5('iron-vault:assessment:entry-test-v1')::uuid,
  md5('iron-vault:release:entry-test-v1')::uuid,
  'entry-test',
  'Iron Vault Entry Test',
  'entry_test',
  'public',
  'published',
  NULL,
  NULL,
  '{
    "questionCount": 5,
    "resultMode": "diagnostic",
    "claimXp": 50,
    "version": 1
  }'::jsonb,
  NOW()
)
ON CONFLICT (release_id, slug) DO NOTHING;

WITH question_seed (
  key,
  sort_order,
  prompt,
  topic_key,
  feedback
) AS (
  VALUES
    (
      'wallet-safety',
      0,
      'A person claiming to be wallet support asks for your recovery phrase so they can fix an account problem. What is the safest response?',
      'wallet-safety',
      '{
        "correct": "Correct. A recovery phrase controls the wallet. Refuse the request, close the conversation, and use only a support channel you independently verify.",
        "incorrect": "A recovery phrase can give complete control of a wallet. Never share it with support staff, websites, callers, or direct messages.",
        "nextTopic": "Wallet ownership and recovery",
        "sources": [
          {
            "label": "Solana core concepts",
            "url": "https://solana.com/docs/core"
          }
        ]
      }'::jsonb
    ),
    (
      'onchain-verification',
      1,
      'What can a blockchain explorer establish directly about a Solana transaction?',
      'onchain-verification',
      '{
        "correct": "Correct. Explorer data can show that a transaction was recorded and expose its signature, status, accounts, and instructions. Interpretation still requires context.",
        "incorrect": "An explorer provides transaction evidence, not a guarantee of identity, legality, safety, value, or future performance.",
        "nextTopic": "Reading on-chain evidence",
        "sources": [
          {
            "label": "Solana transactions and core concepts",
            "url": "https://solana.com/docs/core"
          }
        ]
      }'::jsonb
    ),
    (
      'programs',
      2,
      'Which statement about a Solana program (often called a smart contract) is most accurate?',
      'programs',
      '{
        "correct": "Correct. A Solana program is executable on-chain code. Programs can still contain defects, and some retain an authority that can upgrade them.",
        "incorrect": "On-chain execution does not make code automatically safe or immutable. Review the program address, upgrade authority, verified build status, and risks.",
        "nextTopic": "Programs, automation, and upgrade authority",
        "sources": [
          {
            "label": "Solana programs",
            "url": "https://solana.com/docs/core/programs"
          },
          {
            "label": "Solana verified builds",
            "url": "https://solana.com/docs/programs/verified-builds"
          }
        ]
      }'::jsonb
    ),
    (
      'risk-evidence',
      3,
      'A digital-asset promotion says its returns are guaranteed and there is no meaningful downside. What should that claim trigger?',
      'risk-evidence',
      '{
        "correct": "Correct. Guaranteed-return language conflicts with the real possibility of loss. Stop, verify the promoter and claims, and do not treat marketing as evidence.",
        "incorrect": "Crypto assets can be volatile, speculative, and subject to loss. A confident promise does not remove those risks.",
        "nextTopic": "Risk, claims, and source quality",
        "sources": [
          {
            "label": "Investor.gov crypto asset risk alert",
            "url": "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-alerts/crypto-asset-securities"
          }
        ]
      }'::jsonb
    ),
    (
      'token-evaluation',
      4,
      'When evaluating a token project, which approach produces the strongest starting point?',
      'token-evaluation',
      '{
        "correct": "Correct. Separate observable present facts from future plans, assumptions, and promotional claims; then verify each category with appropriate sources.",
        "incorrect": "Popularity, price movement, and confident projections are not substitutes for verifiable present facts, explicit assumptions, and documented risks.",
        "nextTopic": "Token mechanics and evidence",
        "sources": [
          {
            "label": "Investor.gov crypto assets overview",
            "url": "https://www.investor.gov/additional-resources/spotlight/crypto-assets"
          }
        ]
      }'::jsonb
    )
)
INSERT INTO assessment_questions (
  id,
  assessment_id,
  prompt,
  feedback,
  topic_key,
  question_type,
  points,
  sort_order,
  randomize_options,
  editorial_state
)
SELECT
  md5('iron-vault:entry-test-v1:question:' || question_seed.key)::uuid,
  md5('iron-vault:assessment:entry-test-v1')::uuid,
  jsonb_build_object('text', question_seed.prompt),
  question_seed.feedback,
  question_seed.topic_key,
  'single_choice',
  1,
  question_seed.sort_order,
  TRUE,
  'published'
FROM question_seed
ON CONFLICT (assessment_id, sort_order) DO NOTHING;

WITH option_seed (
  question_key,
  sort_order,
  option_text,
  is_correct
) AS (
  VALUES
    ('wallet-safety', 0, 'Send only the first half of the phrase', FALSE),
    ('wallet-safety', 1, 'Refuse, close the conversation, and independently verify the real support channel', TRUE),
    ('wallet-safety', 2, 'Enter the phrase if the support page uses HTTPS', FALSE),
    ('wallet-safety', 3, 'Ask the person to promise they will delete it', FALSE),

    ('onchain-verification', 0, 'That the transaction guarantees a future return', FALSE),
    ('onchain-verification', 1, 'That every account involved belongs to the person who claims it', FALSE),
    ('onchain-verification', 2, 'The recorded signature, execution status, accounts, and instructions', TRUE),
    ('onchain-verification', 3, 'That a regulator approved the transaction', FALSE),

    ('programs', 0, 'It is automatically secure because it runs on a blockchain', FALSE),
    ('programs', 1, 'It is executable on-chain code that may still be upgradeable or contain defects', TRUE),
    ('programs', 2, 'It is a traditional legal contract uploaded as a PDF', FALSE),
    ('programs', 3, 'It can never interact with another program', FALSE),

    ('risk-evidence', 0, 'A reason to invest before access closes', FALSE),
    ('risk-evidence', 1, 'Evidence that the promoter has eliminated volatility', FALSE),
    ('risk-evidence', 2, 'A red flag requiring independent verification and a realistic loss assessment', TRUE),
    ('risk-evidence', 3, 'Proof that the asset is insured', FALSE),

    ('token-evaluation', 0, 'Follow the largest social account discussing it', FALSE),
    ('token-evaluation', 1, 'Assume the roadmap will happen exactly as written', FALSE),
    ('token-evaluation', 2, 'Use recent price growth as the primary evidence', FALSE),
    ('token-evaluation', 3, 'Separate verifiable present facts from plans, assumptions, claims, and risks', TRUE)
)
INSERT INTO answer_options (
  id,
  question_id,
  content,
  sort_order
)
SELECT
  md5(
    'iron-vault:entry-test-v1:option:'
    || option_seed.question_key
    || ':'
    || option_seed.sort_order::text
  )::uuid,
  md5(
    'iron-vault:entry-test-v1:question:'
    || option_seed.question_key
  )::uuid,
  jsonb_build_object('text', option_seed.option_text),
  option_seed.sort_order
FROM option_seed
ON CONFLICT (question_id, sort_order) DO NOTHING;

WITH correct_options (question_key, sort_order) AS (
  VALUES
    ('wallet-safety', 1),
    ('onchain-verification', 2),
    ('programs', 1),
    ('risk-evidence', 2),
    ('token-evaluation', 3)
)
INSERT INTO assessment_answer_keys (
  id,
  question_id,
  answer_option_id,
  scoring_weight,
  explanation
)
SELECT
  md5(
    'iron-vault:entry-test-v1:answer:'
    || correct_options.question_key
  )::uuid,
  md5(
    'iron-vault:entry-test-v1:question:'
    || correct_options.question_key
  )::uuid,
  md5(
    'iron-vault:entry-test-v1:option:'
    || correct_options.question_key
    || ':'
    || correct_options.sort_order::text
  )::uuid,
  1,
  '{}'::jsonb
FROM correct_options
ON CONFLICT (id) DO NOTHING;

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
  md5('iron-vault:source:entry-test-v1')::uuid,
  md5('iron-vault:release:entry-test-v1')::uuid,
  'assessment',
  md5('iron-vault:assessment:entry-test-v1')::uuid,
  'packages/database/migrations/0005_entry_test_v1.sql',
  'assessment:entry-test-v1',
  encode(digest('iron-vault-entry-test-v1', 'sha256'), 'hex'),
  'entry-test-v1',
  '{"reviewClass":"public-safety-foundations"}'::jsonb
)
ON CONFLICT (release_id, source_path, source_key) DO NOTHING;
