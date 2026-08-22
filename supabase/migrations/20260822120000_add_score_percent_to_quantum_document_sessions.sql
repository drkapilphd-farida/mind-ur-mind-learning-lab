-- ─────────────────────────────────────────────────────────────────────────────
-- 20260822120000_add_score_percent_to_quantum_document_sessions
--
-- Transparent Comprehension Scoring™ (Phase 4) — every Chapter
-- Comprehension Check attempt is already recorded, ungated, in
-- quantum_document_sessions (correct_answers_count/total_questions_count,
-- see 20260801000005_create_quantum_document_sessions.sql). A student is
-- never blocked from completing a chapter regardless of score; this
-- migration only makes the resulting percentage a real, queryable column
-- instead of something every reader has to recompute itself.
--
-- GENERATED ALWAYS ... STORED, not a plain mutable column: the score is
-- fully determined by correct_answers_count/total_questions_count, which
-- are already immutable (this table is append-only — see the sessions
-- migration's own RLS, no UPDATE policy exists). A derived column can
-- never drift out of sync with the raw counts it's computed from, the
-- same "never a separately mutable running total" principle this table's
-- own migration comment already states.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.quantum_document_sessions
  ADD COLUMN score_percent numeric(5, 1) GENERATED ALWAYS AS (round((correct_answers_count::numeric / total_questions_count) * 100, 1)) STORED;

COMMENT ON COLUMN public.quantum_document_sessions.score_percent IS
  'Exact comprehension score for this attempt, 0.0-100.0 — derived from correct_answers_count/total_questions_count, never independently settable. A student is never blocked from completing a chapter regardless of this value; it exists purely for transparent reporting (see the Parent Dashboard''s Chapter Scores card).';
