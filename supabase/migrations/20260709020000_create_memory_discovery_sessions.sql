-- ─────────────────────────────────────────────────────────────────────────────
-- 20260709020000_create_memory_discovery_sessions
--
-- Discover Your Learning Potential™ — Sprint-3, Memory Discovery™.
--
-- Mirrors reading_discovery_sessions exactly: an observation-only
-- experience (visual/word/chunk/sentence/number/pattern recall), nothing
-- scored or shown back to the user. This table only prepares the
-- architecture for future reporting.
--
-- `events` is an append-only, ordered log of what was observed (per-scene
-- dwell time, which items were selected/recalled) — intentionally raw and
-- un-scored, so any future analysis is derived later, not baked in now.
--
-- Same auth posture as reading_discovery_sessions: this route is reachable
-- before sign-in, so the Server Action silently skips the insert for
-- anonymous visitors rather than treating "no user" as an error.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.memory_discovery_sessions (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  events       jsonb       NOT NULL,
  completed    boolean     NOT NULL DEFAULT false,
  occurred_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX memory_discovery_sessions_user_occurred_idx
  ON public.memory_discovery_sessions (user_id, occurred_at DESC);

ALTER TABLE public.memory_discovery_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "memory_discovery_sessions_select_own"
  ON public.memory_discovery_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "memory_discovery_sessions_insert_own"
  ON public.memory_discovery_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
