-- ─────────────────────────────────────────────────────────────────────────────
-- 20260823155016_create_curriculum_day_completions
--
-- Two-Pillar Simplification™ — the 30-Day Masterclass's own completion
-- tracking (curriculumProgress.ts) has always been localStorage-only, by
-- design, for the in-app UI (day-unlocking, streaks, checkpoint deltas).
-- That's real data for the student's own browser, but a Parents Dashboard
-- is read server-side, often from a different device entirely — it can
-- never see localStorage. This table is a write-through mirror of the
-- same completions, real-only (never estimated), purely for cross-device
-- reporting: the Parents Dashboard's "Daily Curriculum Progress" and
-- "Session History." It does not replace curriculumProgress.ts as the
-- source of truth for gating/unlocking — that stays exactly as-is.
--
-- One row per (user, day) — a re-completion (e.g. a checkpoint re-run)
-- upserts in place rather than growing a duplicate history, matching
-- curriculumProgress.ts's own idempotent-by-day semantics.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.curriculum_day_completions (
  id                              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                         uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  day                             integer     NOT NULL CHECK (day >= 1 AND day <= 30),
  raw_wpm                         integer,
  true_wpm                        integer,
  comprehension_accuracy_percent  integer,
  completed_at                    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT curriculum_day_completions_user_day_key UNIQUE (user_id, day)
);

ALTER TABLE public.curriculum_day_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "curriculum_day_completions_insert_own"
  ON public.curriculum_day_completions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "curriculum_day_completions_update_own"
  ON public.curriculum_day_completions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "curriculum_day_completions_select_own"
  ON public.curriculum_day_completions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
