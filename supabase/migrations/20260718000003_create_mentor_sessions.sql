-- ─────────────────────────────────────────────────────────────────────────────
-- 20260718000003_create_mentor_sessions
--
-- AI Mentor™ Sprint-1 — Foundation. AI Mentor does not read a document
-- chunk-by-chunk the way Reading/Memory/Smart Notes do — it consumes those
-- modes' own real progress as read-only input. It genuinely does not fit
-- `learning_sessions` (whose `session_type` CHECK constraint and `data jsonb`
-- shape both assume a chunk/ULO-based session) or LSE-3's own locked
-- `SessionSnapshot` (which requires `documentId`/`uloId`/`strategy`/
-- `completedChunkIds` — none of which apply to a mentor conversation).
-- Confirmed with the founder before building: AI Mentor gets its own real,
-- minimal, learner-scoped session table instead of forcing a chunk-shaped
-- concept onto a fundamentally different one.
--
-- Deliberately minimal this sprint — no conversation-turn table yet ("no
-- conversational AI features yet"); this table only tracks that a real
-- mentor session started and ended. Mirrors `learning_sessions`'/
-- `smart_notes`' own RLS and trigger conventions exactly.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.mentor_sessions (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  status     text        NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended')),
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at   timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.mentor_sessions ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_mentor_sessions_updated_at
  BEFORE UPDATE ON public.mentor_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX mentor_sessions_user_idx ON public.mentor_sessions (user_id, started_at DESC);

CREATE POLICY "mentor_sessions_select_own"
  ON public.mentor_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "mentor_sessions_insert_own"
  ON public.mentor_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "mentor_sessions_update_own"
  ON public.mentor_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
