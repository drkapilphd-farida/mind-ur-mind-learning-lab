-- ─────────────────────────────────────────────────────────────────────────────
-- 20260704152828_create_image_persistence_sessions
--
-- Visual Intelligence Lab™ — Foundation Journey™, Sprint 3 — Image
-- Persistence Engine™.
--
-- Append-only log of every completed Image Persistence Challenge™ session.
-- A separate, independent table — never touches the exercise_progress/
-- practice_sessions progression system or LabIdSchema, same precedent as
-- reading_intelligence_sessions.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.image_persistence_sessions (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  image_used            text        NOT NULL,
  -- Always 45 in this version — the real, fixed, designed session length,
  -- not a measured/fabricated duration.
  duration_seconds      integer     NOT NULL CHECK (duration_seconds >= 0),
  -- 'yes' | 'partially' | 'not-yet' | null (learner tapped Skip)
  observation_response  text,
  notes                 text,
  completed             boolean     NOT NULL DEFAULT true,
  occurred_at           timestamptz NOT NULL DEFAULT now()
);

-- hot path: "this user's image persistence sessions, most recent first"
CREATE INDEX image_persistence_sessions_user_occurred_idx
  ON public.image_persistence_sessions (user_id, occurred_at DESC);

ALTER TABLE public.image_persistence_sessions ENABLE ROW LEVEL SECURITY;

-- Append-only: select/insert only, no update/delete — same convention as
-- reading_intelligence_sessions.
CREATE POLICY "image_persistence_sessions_select_own"
  ON public.image_persistence_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "image_persistence_sessions_insert_own"
  ON public.image_persistence_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
