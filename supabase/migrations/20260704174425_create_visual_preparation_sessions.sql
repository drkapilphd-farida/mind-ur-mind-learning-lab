-- ─────────────────────────────────────────────────────────────────────────────
-- 20260704174425_create_visual_preparation_sessions
--
-- Visual Intelligence Lab™ — Visual Preparation Protocol™, Sprint 4.
--
-- Append-only log of every completed Visual Preparation session (breath
-- awareness + eye relaxation). A separate, independent table — never
-- touches Reading Intelligence Lab's tables, the progression system, or
-- LabIdSchema, same precedent as image_persistence_sessions.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.visual_preparation_sessions (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  -- Always the fixed designed total (120s breath + 96s eye relaxation =
  -- 216) — the real, honest session length by design, not a measured or
  -- fabricated wall-clock value.
  duration_seconds integer     NOT NULL CHECK (duration_seconds >= 0),
  completed        boolean     NOT NULL DEFAULT true,
  occurred_at      timestamptz NOT NULL DEFAULT now()
);

-- hot path: "this user's preparation sessions, most recent first"
CREATE INDEX visual_preparation_sessions_user_occurred_idx
  ON public.visual_preparation_sessions (user_id, occurred_at DESC);

ALTER TABLE public.visual_preparation_sessions ENABLE ROW LEVEL SECURITY;

-- Append-only: select/insert only, no update/delete — same convention as
-- image_persistence_sessions.
CREATE POLICY "visual_preparation_sessions_select_own"
  ON public.visual_preparation_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "visual_preparation_sessions_insert_own"
  ON public.visual_preparation_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
