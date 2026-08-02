-- ─────────────────────────────────────────────────────────────────────────────
-- 20260705040457_create_persistence_challenge_sessions
--
-- Visual Intelligence Lab™ — Image Persistence Challenge™, Sprint 6.
--
-- A new, standalone flagship experience — NOT the same table as Sprint-3B's
-- image_persistence_sessions (that stays untouched). Append-only log of
-- completed 9-step guided challenges (45s image observation + 30s
-- eyes-closed internal observation + reflection + optional journal).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.persistence_challenge_sessions (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  -- Stable id from the new 5-image registry (persistenceChallengeImages.ts).
  image_id             text        NOT NULL,
  reflection_response  text        NOT NULL CHECK (reflection_response IN (
                                     'bright-image', 'dim-image', 'colours-changed', 'nothing-noticeable'
                                   )),
  -- Optional, self-reported — never required.
  journal_notes        text,
  -- Always the fixed designed total (45s observation + 30s eyes-closed =
  -- 75) — the real, honest session length by design, not a measured or
  -- fabricated wall-clock value.
  duration_seconds     integer     NOT NULL CHECK (duration_seconds >= 0),
  completed            boolean     NOT NULL DEFAULT true,
  occurred_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX persistence_challenge_sessions_user_occurred_idx
  ON public.persistence_challenge_sessions (user_id, occurred_at DESC);

ALTER TABLE public.persistence_challenge_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "persistence_challenge_sessions_select_own"
  ON public.persistence_challenge_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "persistence_challenge_sessions_insert_own"
  ON public.persistence_challenge_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
