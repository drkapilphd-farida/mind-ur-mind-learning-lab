-- ─────────────────────────────────────────────────────────────────────────────
-- 20260729000002_add_generating_blueprints_stage
--
-- Reading Intelligence Engine™ Upgrade — Sprint-1: Learning Blueprint
-- Generator™. Widens document_processing_progress's own `stage` enum
-- (see supabase/migrations/20260728000002_create_document_processing_progress.sql)
-- to add 'generating_blueprints' — a new Phase 3 "Background AI
-- Intelligence" stage, inserted between 'building_learning_analysis' and
-- 'complete'. Real stage sequence after this migration:
-- enriching_chunks → building_knowledge_graph → building_learning_analysis
-- → generating_blueprints → complete.
--
-- `blueprints_generated`/`total_chapters` mirror `chunks_enriched`/
-- `total_chunks` exactly — the same real, resumable progress-counting
-- pattern, one more stage's worth.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.document_processing_progress DROP CONSTRAINT document_processing_progress_stage_check;
ALTER TABLE public.document_processing_progress
  ADD CONSTRAINT document_processing_progress_stage_check
  CHECK (stage IN ('enriching_chunks', 'building_knowledge_graph', 'building_learning_analysis', 'generating_blueprints', 'complete', 'failed'));

ALTER TABLE public.document_processing_progress
  ADD COLUMN blueprints_generated integer NOT NULL DEFAULT 0,
  ADD COLUMN total_chapters        integer NOT NULL DEFAULT 0;
