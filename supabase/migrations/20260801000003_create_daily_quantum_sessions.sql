-- ─────────────────────────────────────────────────────────────────────────────
-- 20260801000003_create_daily_quantum_sessions
--
-- Daily Quantum Session — one append-only summary row per completed full
-- 4-step guided session (Mind Awakening → Visual Activation → Focus &
-- Intuition → Quantum Reading Sprint). This is the durable home for the
-- growth signals the session's completion screen surfaces back to the
-- learner: WPM history, a daily streak, and lifetime XP.
--
-- Neither existing WPM table fits this session's own ad-hoc reading
-- content: qsr_reading_speed_samples requires a real uploaded
-- document_id, and reading_intelligence_sessions is tied to the separate,
-- fixed 24-passage Lab library. XP and streak have no persisted home
-- anywhere in the app at all today — both are computed fresh from this
-- table's own rows (streak via day-key bucketing over occurred_at,
-- lifetime XP via SUM(xp_earned)), the same "never a separately mutable
-- running total" convention every other tracking table in this project
-- already follows.
--
-- One row per completed FULL session only — a single-phase "Practice
-- Again" replay does not insert a row here (it still logs its own
-- practice_sessions attempt under a distinct exerciseId, for that one
-- exercise's personal-best tracking, but does not count as a new guided
-- session).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.daily_quantum_sessions (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  reading_wpm      integer     NOT NULL CHECK (reading_wpm >= 0),
  accuracy_percent integer     NOT NULL CHECK (accuracy_percent BETWEEN 0 AND 100),
  reading_score    integer     NOT NULL CHECK (reading_score BETWEEN 0 AND 100),
  xp_earned        integer     NOT NULL CHECK (xp_earned >= 0),
  occurred_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX daily_quantum_sessions_user_occurred_idx
  ON public.daily_quantum_sessions (user_id, occurred_at DESC);

ALTER TABLE public.daily_quantum_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_quantum_sessions_select_own"
  ON public.daily_quantum_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "daily_quantum_sessions_insert_own"
  ON public.daily_quantum_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
