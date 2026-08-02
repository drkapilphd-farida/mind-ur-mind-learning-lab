-- ─────────────────────────────────────────────────────────────────────────────
-- 20260718000004_create_mentor_conversation_turns
--
-- AI Mentor™ Sprint-2 — the first real conversation turn. Confirmed with
-- the founder before building: a real, persisted, append-only turn history
-- per mentor session, so a learner can leave and resume a real
-- conversation — never a stateless client-held-history model (contrast
-- with the older, LMS-era `ai-tutor` chat action).
--
-- `user_id` is denormalized here (not derived via a join through
-- `mentor_session_id`) so the RLS policies below stay a simple, direct
-- `auth.uid() = user_id` check — the same convention `learning_sessions`
-- and `smart_notes` already use, rather than a slower subquery-based
-- policy.
--
-- Insert-only, no update/delete policy — a real conversation turn, once
-- sent, is never edited or retracted, the same "observation-only" shape
-- `learning_sessions`'s own migration comment already distinguishes from
-- its own (mutable) session rows.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.mentor_conversation_turns (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_session_id uuid        NOT NULL REFERENCES public.mentor_sessions (id) ON DELETE CASCADE,
  user_id           uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  role              text        NOT NULL CHECK (role IN ('mentor', 'learner')),
  content           text        NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.mentor_conversation_turns ENABLE ROW LEVEL SECURITY;

CREATE INDEX mentor_conversation_turns_session_idx ON public.mentor_conversation_turns (mentor_session_id, created_at);

CREATE POLICY "mentor_conversation_turns_select_own"
  ON public.mentor_conversation_turns
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "mentor_conversation_turns_insert_own"
  ON public.mentor_conversation_turns
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
