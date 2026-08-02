-- ─────────────────────────────────────────────────────────────────────────────
-- 20260724000002_create_ai_cost_log
--
-- Production AI Cost Optimization & ULO Reuse. The real cost audit found
-- two real gaps: (1) `AIFoundation`'s own CostTracker (AIF-1) is
-- in-memory-only by explicit original design — every real cost entry is
-- lost the moment the process exits — and (2) AI Mentor's own real Claude
-- call (`generateMentorReply.ts`) bypasses AIFoundation entirely via a
-- direct `new Anthropic()` client, so it was never tracked at all, by
-- anything. This table is the durable log both real call paths now write
-- to — one row per real request, success or failure.
--
-- A pre-existing `ai_events` table (see its own migration) already has
-- similar-looking columns (cost_cents, tokens, model, provider) but is
-- confirmed, real dead schema — grepping the entire codebase turns up zero
-- call sites that ever write to it, and its shape (FK'd to
-- `learning_session_id`, no chunk/feature/request-id/success distinction)
-- doesn't fit what this task needs. Reusing it would mean forcing a
-- differently-shaped table to pretend to be something it isn't; a new,
-- correctly-shaped table is the honest choice.
--
-- `document_id`/`chunk_id` are nullable — AI Mentor's own calls aren't
-- always grounded in a specific document or chunk. `chunk_id` reuses the
-- same request-id values already threaded through every real
-- `aiFoundation.execute()` call site (`chunk.id` for semantic-enrichment,
-- `${chunk.id}-builds-upon` for relationship-detection, an analysis-scoped
-- id for difficulty-analysis) — no new identifier scheme invented.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.ai_cost_log (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id         uuid        REFERENCES public.documents (id) ON DELETE CASCADE,
  chunk_id            text,
  feature             text        NOT NULL,
  model_id            text        NOT NULL,
  input_tokens        integer     NOT NULL,
  output_tokens       integer     NOT NULL,
  estimated_cost_cents numeric    NOT NULL,
  processing_time_ms  integer     NOT NULL,
  request_id          text        NOT NULL,
  success             boolean     NOT NULL,
  error_message       text,
  created_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_cost_log ENABLE ROW LEVEL SECURITY;

CREATE INDEX ai_cost_log_document_idx ON public.ai_cost_log (document_id);
CREATE INDEX ai_cost_log_created_at_idx ON public.ai_cost_log (created_at);

-- System/service-role-written only, same pattern as
-- `universal_learning_objects`/`document_chunk_cache` — a real cost log
-- entry is written by the pipeline or by AI Mentor's own reply path, never
-- by a learner directly, and isn't surfaced to learners at all (this is
-- for future admin analytics, per this migration's own mission). No
-- policy for `authenticated` at all; only the service-role client reads or
-- writes this table.
