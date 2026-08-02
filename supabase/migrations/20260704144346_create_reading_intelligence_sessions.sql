-- ─────────────────────────────────────────────────────────────────────────────
-- 20260704144346_create_reading_intelligence_sessions
--
-- Quantum Speed Reading™ Sprint 4 — Adaptive Intelligence Engine™.
--
-- Append-only log of every completed Reading + Comprehension Quiz session,
-- feeding the Reading Profile / Reading DNA™ / recommendations / achievements
-- built on top of it. Deliberately a separate table from practice_sessions/
-- exercise_progress — this data never touches the progression engine or
-- exercise unlock gating (verifyExerciseIsUnlocked is never called for it).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.reading_intelligence_sessions (
  id                          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  passage_id                  text        NOT NULL,
  category                    text        NOT NULL,
  difficulty                  text        NOT NULL,
  mode                        text,
  wpm                         integer     NOT NULL CHECK (wpm >= 0),
  reading_time_ms             integer     NOT NULL CHECK (reading_time_ms >= 0),
  -- Sprint-3's quiz only measures one real number (correct/total) — both
  -- comprehension_percent and accuracy_percent are written with that same
  -- value, not two independently-measured metrics.
  comprehension_percent       integer     NOT NULL CHECK (comprehension_percent BETWEEN 0 AND 100),
  accuracy_percent            integer     NOT NULL CHECK (accuracy_percent BETWEEN 0 AND 100),
  reading_intelligence_score  integer     NOT NULL CHECK (reading_intelligence_score BETWEEN 0 AND 100),
  focus_mode                  boolean     NOT NULL DEFAULT false,
  -- No hints mechanism exists anywhere in Sprint 1-3 yet — always 0 until a
  -- real hints feature is built. Schema is future-proofed, not fabricated.
  hints_used                  integer     NOT NULL DEFAULT 0 CHECK (hints_used >= 0),
  completed                   boolean     NOT NULL DEFAULT true,
  occurred_at                 timestamptz NOT NULL DEFAULT now()
);

-- hot path: "this user's reading sessions, most recent first"
CREATE INDEX reading_intelligence_sessions_user_occurred_idx
  ON public.reading_intelligence_sessions (user_id, occurred_at DESC);

ALTER TABLE public.reading_intelligence_sessions ENABLE ROW LEVEL SECURITY;

-- Append-only: select/insert only, no update/delete policies — a session
-- record shouldn't change after the fact, same convention as practice_sessions.
CREATE POLICY "reading_intelligence_sessions_select_own"
  ON public.reading_intelligence_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "reading_intelligence_sessions_insert_own"
  ON public.reading_intelligence_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
