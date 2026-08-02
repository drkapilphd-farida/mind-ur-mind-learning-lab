-- ─────────────────────────────────────────────────────────────────────────────
-- 20260801000001_widen_learning_sessions_qsr_journey
--
-- Reading Intelligence Engine™ Upgrade — Sprint QSR-2: Reading Experience
-- Integration™. `learning_sessions.session_type` (20260711000003_create_
-- learning_sessions.sql) is a CHECK constraint, not a Postgres ENUM,
-- precisely so a new session type is "a plain constraint swap, not an
-- enum-widening migration" — same real pattern every prior amendment
-- (Smart Notes™, Focus Mode™, MCQs™, Reading Experience™) already used.
--
-- 'qsr-journey' is deliberately a NEW, distinct value from both the
-- existing 'reading' (the classic 7 QSR modes' own SessionSnapshot) and
-- 'reading-experience' (Reading Journey Experience™, Sprint 5's own
-- ULO-native word/phrase/sentence/paragraph journey). Quantum Reading
-- Journey™ (this sprint) stores a distinct real shape in its own `data`
-- jsonb — {documentId, chapterOrder, stage, wordFlashCompleted,
-- chunkReadingCompleted, assessmentCompleted, assessmentScore} — and must
-- never be picked up by either of those existing lookups, which remain
-- completely unmodified.
--
-- Additive only: every existing row's `session_type` remains valid under
-- the new constraint; no data is touched.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT con.conname INTO constraint_name
  FROM pg_constraint con
  JOIN pg_attribute att ON att.attnum = ANY (con.conkey) AND att.attrelid = con.conrelid
  WHERE con.conrelid = 'public.learning_sessions'::regclass
    AND con.contype = 'c'
    AND att.attname = 'session_type';

  EXECUTE format('ALTER TABLE public.learning_sessions DROP CONSTRAINT %I', constraint_name);
END $$;

ALTER TABLE public.learning_sessions
  ADD CONSTRAINT learning_sessions_session_type_check
  CHECK (session_type IN ('reading', 'memory', 'revision', 'research', 'smart-notes', 'focus', 'mcqs', 'reading-experience', 'qsr-journey'));
