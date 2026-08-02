-- ─────────────────────────────────────────────────────────────────────────────
-- 20260724000003_create_document_processing_summary
--
-- Production AI Cost Optimization & ULO Reuse. One row per document,
-- upserted once processing finishes, aggregating exactly the counters this
-- mission asks for (total/processed/reused chunks, Claude calls made vs.
-- skipped via cache, real token/cost/timing totals) — computed directly
-- from that run's own `document_chunk_cache` hit/miss split and the rows
-- it just wrote to `ai_cost_log`, not a second, independently-derived
-- computation. Exists so a future admin view can show real per-document
-- cost without re-aggregating `ai_cost_log` from scratch every time.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.document_processing_summary (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id           uuid        NOT NULL REFERENCES public.documents (id) ON DELETE CASCADE,
  total_chunks          integer     NOT NULL,
  processed_chunks      integer     NOT NULL,
  reused_chunks         integer     NOT NULL,
  claude_calls          integer     NOT NULL,
  skipped_calls         integer     NOT NULL,
  input_tokens          integer     NOT NULL,
  output_tokens         integer     NOT NULL,
  estimated_cost_cents  numeric     NOT NULL,
  processing_time_ms    integer     NOT NULL,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT document_processing_summary_document_id_key UNIQUE (document_id)
);

ALTER TABLE public.document_processing_summary ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_document_processing_summary_updated_at
  BEFORE UPDATE ON public.document_processing_summary
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- System/service-role-written only — same pattern as the other two tables
-- this mission adds. Future admin analytics tooling reads this under the
-- service-role client too, so no `authenticated` policy is added yet;
-- adding one is a real, disclosed follow-up once an actual admin UI reads
-- this table.
