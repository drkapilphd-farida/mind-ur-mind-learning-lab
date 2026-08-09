-- ─────────────────────────────────────────────────────────────────────────────
-- 20260809000002_add_visual_learning_fields_to_analysis_cache
--
-- Mirrors 20260809000001_add_document_visual_learning_fields.sql onto
-- quantum_document_analysis_cache — a deliberately separate table from
-- quantum_documents (see 20260804000001's own comment), so it needs its
-- own copy of the same new columns to cache the new AI-response fields.
-- All nullable/purely additive: a row cached before this migration simply
-- has these as NULL, which CachedAnalysisRowSchema (documentAnalysisCache.ts)
-- fails to validate against the new, stricter shape — treated as a cache
-- miss, never a crash, the same policy the file already documents for
-- itself elsewhere.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.quantum_document_analysis_cache
  ADD COLUMN one_sentence_summary text,
  ADD COLUMN short_story text,
  ADD COLUMN recall_questions text[],
  ADD COLUMN keyword_icons jsonb;
