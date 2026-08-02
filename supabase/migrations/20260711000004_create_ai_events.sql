-- ─────────────────────────────────────────────────────────────────────────────
-- 20260711000004_create_ai_events
--
-- AI Learning Studio™ Sprint 0 — Platform Foundation™. Domain model: see
-- docs/adr/0001-ai-learning-studio-domain-model.md.
--
-- AIEvent (named per this sprint's explicit correction — not "AIUsage"):
-- one row per discrete AI call (a chat turn, a content generation, an
-- analysis). Append-only — the foundation a future AI Economics Engine
-- would aggregate over, not a feature itself. No AI integration in this
-- sprint; this only shapes where that data will land.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.ai_events (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  learning_session_id uuid        REFERENCES public.learning_sessions (id) ON DELETE SET NULL,
  event_type          text        NOT NULL,
  provider            text        NOT NULL,
  model               text        NOT NULL,
  input_tokens        integer,
  output_tokens       integer,
  cost_cents          numeric(10, 4),
  metadata            jsonb       NOT NULL DEFAULT '{}'::jsonb,
  created_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX ai_events_user_idx ON public.ai_events (user_id, created_at DESC);
CREATE INDEX ai_events_session_idx ON public.ai_events (learning_session_id) WHERE learning_session_id IS NOT NULL;

-- Append-only from the client's point of view: a user may read their own
-- event history, but every insert goes through the server-side AI router
-- (service role), not a direct client write, so cost/token figures can
-- never be forged.
CREATE POLICY "ai_events_select_own"
  ON public.ai_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
