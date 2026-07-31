CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID NOT NULL REFERENCES curriculum_releases(id) ON DELETE RESTRICT,
  pathway_id UUID REFERENCES pathways(id) ON DELETE RESTRICT,
  course_id UUID REFERENCES courses(id) ON DELETE RESTRICT,
  module_id UUID REFERENCES curriculum_modules(id) ON DELETE RESTRICT,
  lesson_id UUID REFERENCES lessons(id) ON DELETE RESTRICT,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  purpose TEXT NOT NULL,
  audience TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  passing_score INTEGER,
  max_attempts INTEGER,
  configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (release_id, slug),
  CHECK (num_nonnulls(pathway_id, course_id, module_id, lesson_id) <= 1),
  CHECK (purpose IN ('entry_test', 'knowledge_check', 'module_quiz', 'course_exam', 'pathway_exam', 'readiness')),
  CHECK (audience IN ('public', 'member', 'premium', 'vip', 'sovereign', 'internal')),
  CHECK (status IN ('imported', 'draft', 'review', 'published', 'retired', 'rejected')),
  CHECK (passing_score IS NULL OR passing_score >= 0),
  CHECK (max_attempts IS NULL OR max_attempts > 0),
  CHECK (status <> 'published' OR published_at IS NOT NULL),
  CHECK (jsonb_typeof(configuration) = 'object')
);

CREATE TABLE assessment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE RESTRICT,
  prompt JSONB NOT NULL,
  feedback JSONB NOT NULL DEFAULT '{}'::jsonb,
  topic_key TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'single_choice',
  points INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL,
  randomize_options BOOLEAN NOT NULL DEFAULT TRUE,
  editorial_state TEXT NOT NULL DEFAULT 'imported',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (assessment_id, sort_order),
  CHECK (question_type IN ('single_choice', 'multiple_choice', 'true_false', 'ordering', 'short_answer')),
  CHECK (points >= 0),
  CHECK (sort_order >= 0),
  CHECK (editorial_state IN ('imported', 'draft', 'fact_review', 'legal_review', 'approved', 'published', 'retired', 'rejected')),
  CHECK (jsonb_typeof(prompt) = 'object'),
  CHECK (jsonb_typeof(feedback) = 'object')
);

CREATE TABLE answer_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES assessment_questions(id) ON DELETE RESTRICT,
  content JSONB NOT NULL,
  sort_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (question_id, sort_order),
  CHECK (sort_order >= 0),
  CHECK (jsonb_typeof(content) = 'object')
);

CREATE TABLE assessment_answer_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES assessment_questions(id) ON DELETE RESTRICT,
  answer_option_id UUID REFERENCES answer_options(id) ON DELETE RESTRICT,
  accepted_answer_hash TEXT,
  scoring_weight NUMERIC(8, 4) NOT NULL DEFAULT 1,
  explanation JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (answer_option_id IS NOT NULL OR accepted_answer_hash IS NOT NULL),
  CHECK (scoring_weight >= 0),
  CHECK (jsonb_typeof(explanation) = 'object')
);

CREATE UNIQUE INDEX assessment_answer_keys_option_unique
  ON assessment_answer_keys (question_id, answer_option_id)
  WHERE answer_option_id IS NOT NULL;

CREATE UNIQUE INDEX assessment_answer_keys_written_unique
  ON assessment_answer_keys (question_id, accepted_answer_hash)
  WHERE accepted_answer_hash IS NOT NULL;

CREATE TABLE assessment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE RESTRICT,
  visitor_id UUID REFERENCES visitors(id) ON DELETE SET NULL,
  member_id UUID REFERENCES members(id) ON DELETE RESTRICT,
  public_handle_hash TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'open',
  score INTEGER,
  max_score INTEGER,
  passed BOOLEAN,
  result JSONB NOT NULL DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (status IN ('open', 'submitted', 'claimed', 'expired', 'invalidated')),
  CHECK (length(public_handle_hash) >= 32),
  CHECK (expires_at > started_at),
  CHECK (submitted_at IS NULL OR status IN ('submitted', 'claimed')),
  CHECK (claimed_at IS NULL OR (status = 'claimed' AND member_id IS NOT NULL)),
  CHECK (score IS NULL OR score >= 0),
  CHECK (max_score IS NULL OR max_score >= 0),
  CHECK (jsonb_typeof(result) = 'object')
);

CREATE TABLE assessment_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES assessment_attempts(id) ON DELETE RESTRICT,
  question_id UUID NOT NULL REFERENCES assessment_questions(id) ON DELETE RESTRICT,
  selected_option_ids UUID[] NOT NULL DEFAULT '{}',
  written_answer TEXT,
  awarded_points INTEGER,
  feedback JSONB NOT NULL DEFAULT '{}'::jsonb,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (attempt_id, question_id),
  CHECK (awarded_points IS NULL OR awarded_points >= 0),
  CHECK (jsonb_typeof(feedback) = 'object')
);

CREATE UNIQUE INDEX assessment_attempts_one_claim_per_member_assessment
  ON assessment_attempts (member_id, assessment_id)
  WHERE status = 'claimed';

CREATE INDEX assessment_attempts_visitor_idx ON assessment_attempts (visitor_id, created_at DESC);
CREATE INDEX assessment_attempts_member_idx ON assessment_attempts (member_id, created_at DESC);
CREATE INDEX assessment_attempts_open_expiry_idx ON assessment_attempts (expires_at) WHERE status = 'open';
CREATE INDEX assessment_responses_attempt_idx ON assessment_responses (attempt_id);

CREATE TRIGGER set_assessments_updated_at
BEFORE UPDATE ON assessments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_assessment_questions_updated_at
BEFORE UPDATE ON assessment_questions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_answer_options_updated_at
BEFORE UPDATE ON answer_options
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_assessment_attempts_updated_at
BEFORE UPDATE ON assessment_attempts
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_assessment_responses_updated_at
BEFORE UPDATE ON assessment_responses
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
