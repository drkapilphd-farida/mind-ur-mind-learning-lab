-- ─────────────────────────────────────────────────────────────────────────────
-- 20260711000003_create_learning_sessions
--
-- AI Learning Studio™ Sprint 0 — Platform Foundation™. Domain model: see
-- docs/adr/0001-ai-learning-studio-domain-model.md §2.
--
-- One generic session table shared across Reading, Memory, Revision, and
-- Research (`session_type` + `data jsonb`) rather than one table per
-- feature. This does NOT replace or touch the existing Brain Training
-- Studio™ session tables (reading_discovery_sessions,
-- memory_discovery_sessions, fixation_sessions, etc.) — those keep
-- working exactly as they do today; this is the new AI Learning Studio™
-- side's own table, additive only.
--
-- `session_type` is a CHECK constraint, not a Postgres ENUM — adding a
-- fifth type later is a plain constraint swap, not an enum-widening
-- migration. `data` shape is per session_type and validated in
-- application code, not the database.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.learning_sessions (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  learning_project_id uuid        REFERENCES public.learning_projects (id) ON DELETE SET NULL,
  session_type        text        NOT NULL CHECK (session_type IN ('reading', 'memory', 'revision', 'research')),
  status              text        NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  data                jsonb       NOT NULL DEFAULT '{}'::jsonb,
  started_at          timestamptz NOT NULL DEFAULT now(),
  completed_at        timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_learning_sessions_updated_at
  BEFORE UPDATE ON public.learning_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX learning_sessions_user_idx ON public.learning_sessions (user_id, started_at DESC);
CREATE INDEX learning_sessions_type_idx ON public.learning_sessions (session_type);
CREATE INDEX learning_sessions_project_idx ON public.learning_sessions (learning_project_id) WHERE learning_project_id IS NOT NULL;

CREATE POLICY "learning_sessions_select_own"
  ON public.learning_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "learning_sessions_insert_own"
  ON public.learning_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Sessions are ongoing (status/data update as the session progresses),
-- unlike the existing observation-only *_discovery_sessions tables which
-- are insert-once — this one genuinely needs an UPDATE-own policy.
CREATE POLICY "learning_sessions_update_own"
  ON public.learning_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
