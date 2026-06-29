-- ─────────────────────────────────────────────────────────────────────────────
-- 20260629000001_create_exercise_progress
--
-- Tracks per-user, per-exercise status across every Lab (Quantum Speed
-- Reading today; Memory/Focus Intelligence later, same table). One row per
-- (user, lab, exercise) — this is current status, not a session log.
-- ─────────────────────────────────────────────────────────────────────────────


-- ── Exercise Progress ─────────────────────────────────────────────────────────
-- "Started" and "in progress" are the same persisted state here: the first
-- attempt that didn't finish and a later attempt that also didn't finish are
-- both just "in_progress" — there's nothing in this app that distinguishes
-- them. "Not started" is the absence of a row, not a stored status.

CREATE TABLE public.exercise_progress (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  lab_id       text        NOT NULL,
  exercise_id  text        NOT NULL,
  status       text        NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  started_at   timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  updated_at   timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT exercise_progress_user_exercise_key UNIQUE (user_id, lab_id, exercise_id)
);

-- hot path: "give me this user's progress across one Lab" (landing pages)
CREATE INDEX exercise_progress_user_lab_idx ON public.exercise_progress (user_id, lab_id);

ALTER TABLE public.exercise_progress ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_exercise_progress_updated_at
  BEFORE UPDATE ON public.exercise_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ── RLS: Exercise Progress ───────────────────────────────────────────────────

CREATE POLICY "exercise_progress_select_own"
  ON public.exercise_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "exercise_progress_insert_own"
  ON public.exercise_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "exercise_progress_update_own"
  ON public.exercise_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
