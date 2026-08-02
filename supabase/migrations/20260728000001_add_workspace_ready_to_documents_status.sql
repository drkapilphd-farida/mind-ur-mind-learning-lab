-- ─────────────────────────────────────────────────────────────────────────────
-- 20260728000001_add_workspace_ready_to_documents_status
--
-- ALS-15 Instant Learning Engine™ — 30-Second Learning Promise. The
-- pipeline is being split into Phase 1 "Quick Intelligence" (fast, no AI —
-- parse/chunk/structural blueprint) and Phase 3 "Background AI
-- Intelligence" (chunk enrichment, knowledge graph, learning analysis,
-- run progressively after the workspace already opened). `'ready'` used
-- to mean "any ULO exists" (the whole pipeline ran in one shot); it now
-- means Phase 3 has *also* fully finished. `'workspace_ready'` is the new
-- honest middle state: Phase 1 finished, the workspace is fully usable,
-- Phase 3 may still be running in the background.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.documents DROP CONSTRAINT documents_status_check;
ALTER TABLE public.documents
  ADD CONSTRAINT documents_status_check
  CHECK (status IN ('processing', 'workspace_ready', 'ready', 'failed'));
