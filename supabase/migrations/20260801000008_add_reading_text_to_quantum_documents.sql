-- ─────────────────────────────────────────────────────────────────────────────
-- 20260801000008_add_reading_text_to_quantum_documents
--
-- Multi-Language Support — persists the actual text RSVP should render
-- (raw_text itself for English targets; Claude's own translation for the
-- other supported languages), not just the target_language code. Without
-- this, target_language alone couldn't reconstruct a non-English reading
-- session later without a fresh translation call — this column is what
-- makes "RSVP and review modes render in the correct language" durable,
-- not just true for the single request/response that created the row.
-- Nullable, matching this table's existing convention for every other
-- AI-generated column (ai_summary/spider_notes/etc.): rows created before
-- this migration simply predate it.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.quantum_documents
  ADD COLUMN reading_text text;
