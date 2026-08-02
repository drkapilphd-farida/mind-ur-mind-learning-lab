-- ─────────────────────────────────────────────────────────────────────────────
-- 20260729000001_create_chapter_intelligence_blueprints
--
-- Reading Intelligence Engine™ Upgrade — Sprint-1: Learning Blueprint
-- Generator™. One row per (document, chapter). "Chapter" this sprint
-- means the existing ~200-word LearningChunk granularity (no real
-- chapter-boundary detection exists anywhere in this pipeline — see
-- generateRealLearningBlueprint.ts's own identical `chapter-{index}`
-- relabeling); `chapter_order` mirrors `document_chunk_cache.chunk_order`
-- exactly.
--
-- `content_hash` is the same real SHA-256-of-chunk-content signal
-- `document_chunk_cache` already uses — "the Blueprint must be generated
-- ONCE" is enforced here the same way chunk enrichment already is: an
-- unchanged chunk's hash matches the cached row, so the pipeline skips
-- straight past it rather than re-spending a real Claude call.
--
-- Same "system/service-role-written, no authenticated policy at all"
-- pattern as document_chunk_cache (see that table's own migration
-- comment) — nothing in the product surfaces this table to a learner
-- directly; future learning-mode pages read it server-side via a new
-- loadChapterIntelligenceBlueprints() service function.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.chapter_intelligence_blueprints (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id   uuid        NOT NULL REFERENCES public.documents (id) ON DELETE CASCADE,
  chapter_order integer     NOT NULL,
  content_hash  text        NOT NULL,
  data          jsonb       NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT chapter_intelligence_blueprints_document_chapter_key UNIQUE (document_id, chapter_order)
);

ALTER TABLE public.chapter_intelligence_blueprints ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_chapter_intelligence_blueprints_updated_at
  BEFORE UPDATE ON public.chapter_intelligence_blueprints
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX chapter_intelligence_blueprints_document_idx ON public.chapter_intelligence_blueprints (document_id);

-- No authenticated SELECT/INSERT/UPDATE policy at all, by design — see
-- header comment.
