-- ─────────────────────────────────────────────────────────────────────────────
-- 20260705030001_create_fixation_sessions
--
-- Visual Intelligence Lab™ — Visual Fixation Engine™, Sprint 5.
--
-- One shared, append-only log for all 5 fixation exercise variants (Static
-- Dot Focus, Breath Sync, Dynamic Dot, Multi Dot Attention, Peripheral
-- Activation), discriminated by exercise_type + level — mirrors how
-- practice_sessions itself uses exercise_id/lab_id as discriminators in one
-- table. A separate, independent table — never touches Reading Intelligence
-- Lab's tables, the exercise_progress/practice_sessions system, or
-- LabIdSchema, same precedent as image_persistence_sessions and
-- visual_preparation_sessions.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.fixation_sessions (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  exercise_type    text        NOT NULL CHECK (exercise_type IN (
                                 'static-dot', 'breath-sync', 'dynamic-dot',
                                 'multi-dot', 'peripheral'
                               )),
  -- Holds "30"/"45"/"60"/"90" (static-dot seconds), "left"/"right"/"up"/
  -- "down"/"diagonal"/"circle" (dynamic-dot path), or "3"/"5"/"7" (multi-dot
  -- count) — plain text so one column serves every exercise type.
  level            text        NOT NULL,
  -- Always the fixed designed length for that level — the real, honest
  -- session length by design, not a measured or fabricated wall-clock value.
  duration_seconds integer     NOT NULL CHECK (duration_seconds >= 0),
  completed        boolean     NOT NULL DEFAULT true,
  -- Real, disclosed interaction accuracy. NULL for exercise types with no
  -- interaction (static-dot/breath-sync/dynamic-dot are pure fixation —
  -- nothing to answer). Populated only for multi-dot (tap-the-target hit
  -- rate) and peripheral (recall accuracy). NULL means "not applicable",
  -- never defaulted to a fabricated number.
  accuracy_percent integer     CHECK (accuracy_percent IS NULL OR (accuracy_percent BETWEEN 0 AND 100)),
  occurred_at      timestamptz NOT NULL DEFAULT now()
);

-- hot path: "this user's fixation sessions, most recent first"
CREATE INDEX fixation_sessions_user_occurred_idx
  ON public.fixation_sessions (user_id, occurred_at DESC);

-- supports "most-practiced exercise type" and per-type filtering
CREATE INDEX fixation_sessions_user_type_idx
  ON public.fixation_sessions (user_id, exercise_type);

ALTER TABLE public.fixation_sessions ENABLE ROW LEVEL SECURITY;

-- Append-only: select/insert only, no update/delete — same convention as
-- image_persistence_sessions and visual_preparation_sessions.
CREATE POLICY "fixation_sessions_select_own"
  ON public.fixation_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "fixation_sessions_insert_own"
  ON public.fixation_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
