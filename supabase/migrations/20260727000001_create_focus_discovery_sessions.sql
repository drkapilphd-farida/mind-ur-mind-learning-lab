-- ─────────────────────────────────────────────────────────────────────────────
-- 20260727000001_create_focus_discovery_sessions
--
-- Discover Your Learning Potential™ — Sprint-1 Foundation (Learning
-- Intelligence Engine™).
--
-- Mirrors reading_discovery_sessions/memory_discovery_sessions exactly:
-- an observation-only experience (focus challenges — real-world scenes,
-- pattern spotting), nothing scored or shown back to the user. This
-- table only prepares the architecture for future reporting, closing the
-- one gap between the three Discovery stages — Focus Discovery™ has
-- persisted nothing until now.
--
-- `events` is an append-only, ordered log of what was observed (per-
-- challenge dwell time, which target was found/missed) — intentionally
-- raw and un-scored, so any future analysis is derived later, not baked
-- in now.
--
-- Same auth posture as its two siblings: this route is reachable before
-- sign-in, so the Server Action silently skips the insert for anonymous
-- visitors rather than treating "no user" as an error.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.focus_discovery_sessions (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  events       jsonb       NOT NULL,
  completed    boolean     NOT NULL DEFAULT false,
  occurred_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX focus_discovery_sessions_user_occurred_idx
  ON public.focus_discovery_sessions (user_id, occurred_at DESC);

ALTER TABLE public.focus_discovery_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "focus_discovery_sessions_select_own"
  ON public.focus_discovery_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "focus_discovery_sessions_insert_own"
  ON public.focus_discovery_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
