CREATE TABLE academies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (status IN ('draft', 'active', 'retired'))
);

CREATE TABLE curriculum_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE RESTRICT,
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  source_manifest_hash TEXT,
  published_at TIMESTAMPTZ,
  retired_at TIMESTAMPTZ,
  created_by_member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (academy_id, version),
  CHECK (status IN ('imported', 'draft', 'review', 'published', 'retired')),
  CHECK (status <> 'published' OR published_at IS NOT NULL),
  CHECK (retired_at IS NULL OR published_at IS NOT NULL)
);

CREATE TABLE pathways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID NOT NULL REFERENCES curriculum_releases(id) ON DELETE RESTRICT,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  outcome TEXT NOT NULL DEFAULT '',
  access_class TEXT NOT NULL DEFAULT 'free',
  editorial_state TEXT NOT NULL DEFAULT 'imported',
  sort_order INTEGER NOT NULL,
  prerequisites JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (release_id, slug),
  UNIQUE (release_id, sort_order),
  CHECK (access_class IN ('free', 'premium', 'vip', 'sovereign', 'internal')),
  CHECK (editorial_state IN ('imported', 'draft', 'fact_review', 'legal_review', 'approved', 'published', 'retired', 'rejected')),
  CHECK (sort_order >= 0)
);

CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pathway_id UUID NOT NULL REFERENCES pathways(id) ON DELETE RESTRICT,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  outcome TEXT NOT NULL DEFAULT '',
  access_class TEXT NOT NULL,
  editorial_state TEXT NOT NULL DEFAULT 'imported',
  sort_order INTEGER NOT NULL,
  estimated_minutes INTEGER,
  prerequisites JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (pathway_id, slug),
  UNIQUE (pathway_id, sort_order),
  CHECK (access_class IN ('free', 'premium', 'vip', 'sovereign', 'internal')),
  CHECK (editorial_state IN ('imported', 'draft', 'fact_review', 'legal_review', 'approved', 'published', 'retired', 'rejected')),
  CHECK (sort_order >= 0),
  CHECK (estimated_minutes IS NULL OR estimated_minutes > 0)
);

CREATE TABLE curriculum_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  access_class TEXT NOT NULL,
  editorial_state TEXT NOT NULL DEFAULT 'imported',
  source_legacy_number INTEGER,
  sort_order INTEGER NOT NULL,
  estimated_minutes INTEGER,
  xp_value INTEGER NOT NULL DEFAULT 0,
  prerequisites JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (course_id, slug),
  UNIQUE (course_id, sort_order),
  CHECK (access_class IN ('free', 'premium', 'vip', 'sovereign', 'internal')),
  CHECK (editorial_state IN ('imported', 'draft', 'fact_review', 'legal_review', 'approved', 'published', 'retired', 'rejected')),
  CHECK (sort_order >= 0),
  CHECK (estimated_minutes IS NULL OR estimated_minutes > 0),
  CHECK (xp_value >= 0)
);

CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES curriculum_modules(id) ON DELETE RESTRICT,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  lesson_type TEXT NOT NULL DEFAULT 'reading',
  access_class TEXT NOT NULL,
  editorial_state TEXT NOT NULL DEFAULT 'imported',
  source_legacy_index INTEGER,
  sort_order INTEGER NOT NULL,
  estimated_minutes INTEGER,
  xp_value INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  prerequisites JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (module_id, slug),
  UNIQUE (module_id, sort_order),
  CHECK (lesson_type IN ('reading', 'interactive', 'assessment', 'project', 'media', 'mixed')),
  CHECK (access_class IN ('free', 'premium', 'vip', 'sovereign', 'internal')),
  CHECK (editorial_state IN ('imported', 'draft', 'fact_review', 'legal_review', 'approved', 'published', 'retired', 'rejected')),
  CHECK (sort_order >= 0),
  CHECK (estimated_minutes IS NULL OR estimated_minutes > 0),
  CHECK (xp_value >= 0)
);

CREATE TABLE content_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE RESTRICT,
  block_type TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  payload JSONB NOT NULL,
  evidence_class TEXT,
  source_citations JSONB NOT NULL DEFAULT '[]'::jsonb,
  editorial_state TEXT NOT NULL DEFAULT 'imported',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (lesson_id, sort_order),
  CHECK (block_type IN (
    'heading', 'body', 'list', 'quote', 'source', 'warning', 'callout',
    'timeline', 'comparison', 'calculator', 'simulation', 'scenario',
    'sorting', 'reveal', 'quiz', 'assignment', 'project', 'narration',
    'media', 'action'
  )),
  CHECK (evidence_class IS NULL OR evidence_class IN ('fact', 'interpretation', 'hypothesis', 'scenario')),
  CHECK (editorial_state IN ('imported', 'draft', 'fact_review', 'legal_review', 'approved', 'published', 'retired', 'rejected')),
  CHECK (sort_order >= 0),
  CHECK (jsonb_typeof(payload) = 'object'),
  CHECK (jsonb_typeof(source_citations) = 'array')
);

CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE RESTRICT,
  slug TEXT NOT NULL,
  interaction_type TEXT NOT NULL,
  prompt JSONB NOT NULL,
  configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_scored BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL,
  editorial_state TEXT NOT NULL DEFAULT 'imported',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (lesson_id, slug),
  UNIQUE (lesson_id, sort_order),
  CHECK (interaction_type IN ('calculator', 'simulation', 'scenario', 'sorting', 'reveal', 'reflection', 'knowledge_check')),
  CHECK (editorial_state IN ('imported', 'draft', 'fact_review', 'legal_review', 'approved', 'published', 'retired', 'rejected')),
  CHECK (sort_order >= 0),
  CHECK (jsonb_typeof(prompt) = 'object'),
  CHECK (jsonb_typeof(configuration) = 'object')
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE RESTRICT,
  module_id UUID REFERENCES curriculum_modules(id) ON DELETE RESTRICT,
  lesson_id UUID REFERENCES lessons(id) ON DELETE RESTRICT,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  brief JSONB NOT NULL,
  rubric JSONB NOT NULL DEFAULT '{}'::jsonb,
  access_class TEXT NOT NULL,
  editorial_state TEXT NOT NULL DEFAULT 'draft',
  xp_value INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (num_nonnulls(course_id, module_id, lesson_id) = 1),
  CHECK (access_class IN ('free', 'premium', 'vip', 'sovereign', 'internal')),
  CHECK (editorial_state IN ('imported', 'draft', 'fact_review', 'legal_review', 'approved', 'published', 'retired', 'rejected')),
  CHECK (xp_value >= 0),
  CHECK (jsonb_typeof(brief) = 'object'),
  CHECK (jsonb_typeof(rubric) = 'object')
);

CREATE TABLE curriculum_source_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID NOT NULL REFERENCES curriculum_releases(id) ON DELETE RESTRICT,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  source_path TEXT NOT NULL,
  source_key TEXT NOT NULL,
  source_hash TEXT NOT NULL,
  importer_version TEXT NOT NULL,
  source_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (release_id, source_path, source_key),
  CHECK (entity_type IN ('pathway', 'course', 'module', 'lesson', 'content_block', 'interaction', 'assessment', 'question', 'answer_option', 'project')),
  CHECK (length(source_hash) = 64)
);

CREATE TABLE editorial_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  review_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  reviewer_member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  notes TEXT,
  source_citations JSONB NOT NULL DEFAULT '[]'::jsonb,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (review_type IN ('editorial', 'fact', 'legal', 'compliance', 'accessibility')),
  CHECK (status IN ('open', 'changes_requested', 'approved', 'rejected')),
  CHECK (resolved_at IS NULL OR status IN ('approved', 'rejected')),
  CHECK (jsonb_typeof(source_citations) = 'array')
);

CREATE INDEX pathways_release_idx ON pathways (release_id);
CREATE INDEX courses_pathway_idx ON courses (pathway_id);
CREATE INDEX curriculum_modules_course_idx ON curriculum_modules (course_id);
CREATE INDEX lessons_module_idx ON lessons (module_id);
CREATE INDEX content_blocks_lesson_idx ON content_blocks (lesson_id, sort_order);
CREATE INDEX interactions_lesson_idx ON interactions (lesson_id, sort_order);
CREATE INDEX curriculum_source_records_entity_idx ON curriculum_source_records (entity_type, entity_id);
CREATE INDEX editorial_reviews_entity_idx ON editorial_reviews (entity_type, entity_id);
CREATE INDEX editorial_reviews_open_idx ON editorial_reviews (review_type, status) WHERE status IN ('open', 'changes_requested');

CREATE TRIGGER set_academies_updated_at
BEFORE UPDATE ON academies
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_curriculum_releases_updated_at
BEFORE UPDATE ON curriculum_releases
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_pathways_updated_at
BEFORE UPDATE ON pathways
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_courses_updated_at
BEFORE UPDATE ON courses
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_curriculum_modules_updated_at
BEFORE UPDATE ON curriculum_modules
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_lessons_updated_at
BEFORE UPDATE ON lessons
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_content_blocks_updated_at
BEFORE UPDATE ON content_blocks
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_interactions_updated_at
BEFORE UPDATE ON interactions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_editorial_reviews_updated_at
BEFORE UPDATE ON editorial_reviews
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
