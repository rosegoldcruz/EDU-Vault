CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'started',
  last_block_id UUID REFERENCES content_blocks(id) ON DELETE SET NULL,
  percent_complete INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (member_id, lesson_id),
  CHECK (status IN ('started', 'completed')),
  CHECK (percent_complete BETWEEN 0 AND 100),
  CHECK (status <> 'completed' OR (completed_at IS NOT NULL AND percent_complete = 100))
);

CREATE TABLE module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  module_id UUID NOT NULL REFERENCES curriculum_modules(id) ON DELETE RESTRICT,
  completed_lessons INTEGER NOT NULL DEFAULT 0,
  required_lessons INTEGER NOT NULL DEFAULT 0,
  percent_complete INTEGER NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (member_id, module_id),
  CHECK (completed_lessons >= 0),
  CHECK (required_lessons >= 0),
  CHECK (completed_lessons <= required_lessons),
  CHECK (percent_complete BETWEEN 0 AND 100)
);

CREATE TABLE learning_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE RESTRICT,
  visitor_id UUID REFERENCES visitors(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  assessment_attempt_id UUID REFERENCES assessment_attempts(id) ON DELETE RESTRICT,
  idempotency_key TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (member_id IS NOT NULL OR visitor_id IS NOT NULL),
  CHECK (event_type IN (
    'assessment_started', 'assessment_submitted', 'assessment_claimed',
    'lesson_started', 'lesson_progressed', 'lesson_completed',
    'module_completed', 'course_completed', 'pathway_completed',
    'interaction_completed', 'project_submitted'
  )),
  CHECK (entity_type IN ('assessment', 'lesson', 'module', 'course', 'pathway', 'interaction', 'project')),
  CHECK (jsonb_typeof(payload) = 'object')
);

CREATE UNIQUE INDEX learning_events_idempotency_unique
  ON learning_events (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE TABLE xp_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  event_type TEXT NOT NULL,
  source_entity_type TEXT NOT NULL,
  source_entity_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  learning_event_id UUID REFERENCES learning_events(id) ON DELETE RESTRICT,
  administrative_reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (event_type IN ('assessment_claimed', 'lesson_completed', 'module_completed', 'course_completed', 'achievement', 'admin_adjustment', 'migration')),
  CHECK (amount <> 0),
  CHECK (
    event_type = 'admin_adjustment'
    OR administrative_reason IS NULL
  ),
  CHECK (
    event_type <> 'admin_adjustment'
    OR administrative_reason IS NOT NULL
  ),
  CHECK (jsonb_typeof(metadata) = 'object')
);

CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  criteria JSONB NOT NULL,
  xp_value INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (xp_value >= 0),
  CHECK (status IN ('draft', 'active', 'retired')),
  CHECK (jsonb_typeof(criteria) = 'object')
);

CREATE TABLE member_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE RESTRICT,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  revocation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE NULLS NOT DISTINCT (member_id, achievement_id, revoked_at),
  CHECK (revoked_at IS NULL OR revocation_reason IS NOT NULL),
  CHECK (jsonb_typeof(evidence) = 'object')
);

CREATE TABLE member_streaks (
  member_id UUID PRIMARY KEY REFERENCES members(id) ON DELETE RESTRICT,
  current_days INTEGER NOT NULL DEFAULT 0,
  longest_days INTEGER NOT NULL DEFAULT 0,
  last_qualifying_date DATE,
  grace_credits INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (current_days >= 0),
  CHECK (longest_days >= current_days),
  CHECK (grace_credits >= 0)
);

CREATE TABLE saved_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  result_type TEXT NOT NULL,
  source_entity_type TEXT NOT NULL,
  source_entity_id UUID NOT NULL,
  title TEXT NOT NULL,
  result JSONB NOT NULL,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (member_id, result_type, source_entity_type, source_entity_id),
  CHECK (result_type IN ('assessment', 'calculator', 'simulation', 'scenario', 'project')),
  CHECK (jsonb_typeof(result) = 'object')
);

CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID NOT NULL,
  reason_code TEXT NOT NULL,
  explanation TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  acted_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (recommendation_type IN ('continue', 'remediation', 'pathway_fit', 'readiness', 'return')),
  CHECK (resource_type IN ('lesson', 'module', 'course', 'pathway', 'assessment', 'project')),
  CHECK (status IN ('active', 'acted', 'dismissed', 'expired')),
  CHECK (priority >= 0)
);

CREATE UNIQUE INDEX recommendations_one_active_resource
  ON recommendations (member_id, recommendation_type, resource_type, resource_id)
  WHERE status = 'active';

CREATE INDEX lesson_progress_member_activity_idx ON lesson_progress (member_id, last_activity_at DESC);
CREATE INDEX module_progress_member_activity_idx ON module_progress (member_id, last_activity_at DESC);
CREATE INDEX learning_events_member_time_idx ON learning_events (member_id, occurred_at DESC);
CREATE INDEX learning_events_visitor_time_idx ON learning_events (visitor_id, occurred_at DESC);
CREATE INDEX xp_events_member_time_idx ON xp_events (member_id, created_at DESC);
CREATE INDEX member_achievements_member_idx ON member_achievements (member_id, awarded_at DESC);
CREATE INDEX recommendations_active_member_idx ON recommendations (member_id, priority DESC) WHERE status = 'active';

CREATE VIEW member_xp_totals AS
SELECT
  members.id AS member_id,
  COALESCE(SUM(xp_events.amount), 0)::bigint AS xp_total
FROM members
LEFT JOIN xp_events ON xp_events.member_id = members.id
GROUP BY members.id;

CREATE TRIGGER set_lesson_progress_updated_at
BEFORE UPDATE ON lesson_progress
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_module_progress_updated_at
BEFORE UPDATE ON module_progress
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_achievements_updated_at
BEFORE UPDATE ON achievements
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_saved_results_updated_at
BEFORE UPDATE ON saved_results
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_recommendations_updated_at
BEFORE UPDATE ON recommendations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
