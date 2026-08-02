-- ─────────────────────────────────────────────────────────────────────────────
-- 20260801000010_create_journey_baseline_diagnostics
--
-- 21-Day Transformation Journey™ — mandatory 30-Second Baseline Speed &
-- Comprehension Diagnostic™, taken once, before a new user's Day 1. One
-- row per user, permanent — this is the authoritative reference point the
-- dashboard later compares Day 21's final result against, so it is never
-- updated or replaced once set (insert-only; no update policy).
--
-- Deliberately its own table rather than a row in daily_quantum_sessions:
-- that table is an append-only history of real, day-indexed journey
-- sessions (Day 1..21), and this diagnostic is not itself a "day" — it
-- happens before Day 1 even starts, and must always be locatable as
-- exactly one row per user rather than "the oldest session," which is
-- what daily_quantum_sessions relied on before this table existed (see
-- adaptivePacing.ts's getBaselineSession, kept as a fallback for anyone
-- who started their journey before this diagnostic existed).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.journey_baseline_diagnostics (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid        NOT NULL UNIQUE REFERENCES auth.users (id) ON DELETE CASCADE,
  raw_wpm           integer     NOT NULL CHECK (raw_wpm >= 0),
  accuracy_percent  integer     NOT NULL CHECK (accuracy_percent IN (0, 50, 100)),
  true_baseline_wpm integer     NOT NULL CHECK (true_baseline_wpm >= 0),
  occurred_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.journey_baseline_diagnostics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "journey_baseline_diagnostics_select_own"
  ON public.journey_baseline_diagnostics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "journey_baseline_diagnostics_insert_own"
  ON public.journey_baseline_diagnostics
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
