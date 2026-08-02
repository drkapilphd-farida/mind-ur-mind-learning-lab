-- ─────────────────────────────────────────────────────────────────────────────
-- 20260801000006_add_cognitive_techniques_to_quantum_documents
--
-- AI Document Transformer™ — Advanced Cognitive Memory Techniques, added to
-- the same single Claude call that already produces ai_summary/
-- spider_notes/keywords/quiz_questions (no new API call, no new cost per
-- document). Three additive, nullable jsonb columns, matching the existing
-- nullable-jsonb convention already used for spider_notes/quiz_questions on
-- this table:
--   - feynman_challenge: { topic, prompt } — a single object.
--   - mnemonics: an array of { term, hook } — may legitimately be an empty
--     array (a simple document can honestly have nothing worth a memory
--     hook), never fabricated to satisfy a NOT NULL/min-length constraint.
--   - subject_lens: { subject, insights: [{ label, detail }] } — a single
--     object whose insight labels vary per document's real subject.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.quantum_documents
  ADD COLUMN feynman_challenge jsonb,
  ADD COLUMN mnemonics jsonb,
  ADD COLUMN subject_lens jsonb;
