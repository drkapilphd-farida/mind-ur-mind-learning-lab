-- ─────────────────────────────────────────────────────────────────────────────
-- 20260801000007_add_target_language_to_quantum_documents
--
-- Multi-Language Support — records which of the app's supported languages
-- (English/Hindi/Gujarati/Marathi/Tamil) this document's AI-generated
-- assets and reading text were produced in, so re-opening a saved
-- quantum_documents row later renders RSVP and review content in the
-- correct language rather than assuming English. NOT NULL with a default
-- of 'en': every row created before this migration was, in effect, an
-- English-only generation (the feature didn't exist yet), so backfilling
-- existing rows to 'en' is the honest value, not a guess.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.quantum_documents
  ADD COLUMN target_language text NOT NULL DEFAULT 'en'
  CHECK (target_language IN ('en', 'hi', 'gu', 'mr', 'ta'));
