-- ─────────────────────────────────────────────────────────────────────────────
-- 20260724000001_create_document_chunk_cache
--
-- Production AI Cost Optimization & ULO Reuse. The real cost audit found
-- that `buildAndSaveDocumentUniversalLearningObject.ts` has no persisted
-- record of which chunks were already enriched — every Retry after a
-- failure, and every re-triggered processing run, re-sends every chunk to
-- Claude from scratch, even chunks a prior run already paid to enrich.
-- `enrichLearningChunk`'s own `isAlreadyEnriched` idempotency check has
-- existed since UCE-3B, but nothing durable has ever fed it an
-- already-enriched chunk to recognize — this table is exactly that missing
-- persistence, nothing more.
--
-- One row per (document, chunk position). `content_hash` is a real SHA-256
-- of the chunk's own text — a cache row only counts as a match when the
-- document id, the chunk's position, AND its content all agree, so a
-- genuinely revised document (same position, different real content)
-- correctly misses and gets re-enriched, while an unchanged re-upload hits
-- on every chunk. `data` stores the complete, already-enriched
-- LearningChunk verbatim (same JSON-safe shape `universal_learning_objects`
-- already stores whole ULOs as) so a cache hit can be substituted directly
-- back into the pipeline with zero re-derivation.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.document_chunk_cache (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id  uuid        NOT NULL REFERENCES public.documents (id) ON DELETE CASCADE,
  chunk_order  integer     NOT NULL,
  content_hash text        NOT NULL,
  data         jsonb       NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT document_chunk_cache_document_order_key UNIQUE (document_id, chunk_order)
);

ALTER TABLE public.document_chunk_cache ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_document_chunk_cache_updated_at
  BEFORE UPDATE ON public.document_chunk_cache
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX document_chunk_cache_document_idx ON public.document_chunk_cache (document_id);

-- Same "system/service-role-written" pattern as `universal_learning_objects`
-- (see that table's own migration comment) — a chunk cache row is
-- system-authoritative pipeline state, never something a user reads or
-- writes directly. No SELECT policy for `authenticated` either: unlike the
-- ULO itself, nothing in the product surfaces this table to a learner: only
-- the processing pipeline, running under the service-role client, ever
-- reads or writes it.
