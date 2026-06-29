-- ─────────────────────────────────────────────────────────────────────────────
-- 20260629000002_create_practice_sessions
--
-- Append-only log of every practice attempt (completed or exited early),
-- with duration. exercise_progress stays the "current status per exercise"
-- table for locking/progression (Sprint 2A/2B) — this is the separate
-- history record those features never had, needed for streaks, session
-- history, today's activity, and the weekly/timeline views (Sprint 2C).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.practice_sessions (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  lab_id      text        NOT NULL,
  exercise_id text        NOT NULL,
  duration_ms integer     NOT NULL CHECK (duration_ms >= 0),
  completed   boolean     NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

-- hot path: "this user's sessions in this Lab, most recent first"
CREATE INDEX practice_sessions_user_lab_occurred_idx
  ON public.practice_sessions (user_id, lab_id, occurred_at DESC);

ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;

-- Append-only: select/insert only, no update/delete policies. A session
-- record shouldn't change after the fact.
CREATE POLICY "practice_sessions_select_own"
  ON public.practice_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "practice_sessions_insert_own"
  ON public.practice_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
