-- ─────────────────────────────────────────────────────────────────────────────
-- 20260728000002_create_document_processing_progress
--
-- ALS-15 Instant Learning Engine™. One row per document, tracking Phase 3
-- "Background AI Intelligence" across many separate, client-paced poll
-- invocations — no background-job/queue/cron infrastructure exists in
-- this codebase, so progress must be durable and resumable across
-- requests rather than held in memory.
--
-- `stage` walks forward only: 'enriching_chunks' → 'building_knowledge_graph'
-- → 'building_learning_analysis' → 'complete' (or 'failed' from any of the
-- first three). `locked_at` is a short-lived advisory lock: a poll call
-- only proceeds past its claim UPDATE if it finds NULL or a `locked_at`
-- older than its own staleness window — see advanceBackgroundProcessing.ts
-- — preventing two concurrent polls (two open tabs) from double-enriching
-- the same chunk batch or double-billing Claude.
--
-- Same "system/service-role-written" pattern as document_chunk_cache (see
-- that table's own migration comment) — the client never queries this
-- table directly; it only ever sees a progress snapshot returned by the
-- pollBackgroundProcessing Server Action, which reads this table using
-- the service-role client only after independently verifying document
-- ownership via the caller's own RLS-scoped getDocument() first.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.document_processing_progress (
  id                     uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id            uuid        NOT NULL REFERENCES public.documents (id) ON DELETE CASCADE,
  stage                  text        NOT NULL DEFAULT 'enriching_chunks'
                                     CHECK (stage IN ('enriching_chunks', 'building_knowledge_graph', 'building_learning_analysis', 'complete', 'failed')),
  total_chunks           integer     NOT NULL DEFAULT 0,
  chunks_enriched        integer     NOT NULL DEFAULT 0,
  knowledge_graph_done   boolean     NOT NULL DEFAULT false,
  learning_analysis_done boolean     NOT NULL DEFAULT false,
  error_message          text,
  locked_at              timestamptz,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT document_processing_progress_document_id_key UNIQUE (document_id)
);

ALTER TABLE public.document_processing_progress ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_document_processing_progress_updated_at
  BEFORE UPDATE ON public.document_processing_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX document_processing_progress_document_idx ON public.document_processing_progress (document_id);

-- No authenticated SELECT/INSERT/UPDATE policy at all, by design — see
-- header comment.
