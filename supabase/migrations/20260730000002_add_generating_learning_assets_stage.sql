-- ─────────────────────────────────────────────────────────────────────────────
-- 20260730000002_add_generating_learning_assets_stage
--
-- Reading Intelligence Engine™ Upgrade — Sprint-2: Learning Assets
-- Generator™. Widens document_processing_progress's own `stage` enum
-- (see 20260729000002_add_generating_blueprints_stage.sql) to add
-- 'generating_learning_assets' — inserted between 'generating_blueprints'
-- and 'complete'. Real stage sequence after this migration:
-- enriching_chunks → building_knowledge_graph → building_learning_analysis
-- → generating_blueprints → generating_learning_assets → complete.
--
-- `learning_assets_generated` mirrors `blueprints_generated` exactly —
-- reuses the SAME `total_chapters` counter (this sprint generates one
-- bundle per chapter, the same granularity Sprint-1 already established;
-- no new "total" column needed).
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.document_processing_progress DROP CONSTRAINT document_processing_progress_stage_check;
ALTER TABLE public.document_processing_progress
  ADD CONSTRAINT document_processing_progress_stage_check
  CHECK (stage IN ('enriching_chunks', 'building_knowledge_graph', 'building_learning_analysis', 'generating_blueprints', 'generating_learning_assets', 'complete', 'failed'));

ALTER TABLE public.document_processing_progress
  ADD COLUMN learning_assets_generated integer NOT NULL DEFAULT 0;
