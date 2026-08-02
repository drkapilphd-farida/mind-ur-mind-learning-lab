-- ─────────────────────────────────────────────────────────────────────────────
-- 20260709010000_create_reading_discovery_sessions
--
-- Discover Your Learning Potential™ — Sprint-2, Reading Discovery™.
--
-- Reading Discovery™ is an observation-only experience: users read a word,
-- a word group, a sentence, a paragraph, then answer a couple of gentle
-- comprehension questions. Nothing is scored or shown back to the user —
-- this table only prepares the architecture for future reporting, per the
-- sprint brief ("record user interaction for future reporting, but do not
-- display any analysis yet").
--
-- `events` is an append-only, ordered log of what was observed (per-scene
-- dwell time, which comprehension option was picked) — intentionally raw
-- and un-scored, so any future analysis is derived later, not baked in now.
--
-- Mirrors practice_sessions' auth posture: this route is reachable before
-- sign-in, so the Server Action silently skips the insert for anonymous
-- visitors rather than treating "no user" as an error.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.reading_discovery_sessions (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  events       jsonb       NOT NULL,
  completed    boolean     NOT NULL DEFAULT false,
  occurred_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX reading_discovery_sessions_user_occurred_idx
  ON public.reading_discovery_sessions (user_id, occurred_at DESC);

ALTER TABLE public.reading_discovery_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reading_discovery_sessions_select_own"
  ON public.reading_discovery_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "reading_discovery_sessions_insert_own"
  ON public.reading_discovery_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
