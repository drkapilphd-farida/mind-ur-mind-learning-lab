-- ─────────────────────────────────────────────────────────────────────────────
-- 20260731000001_widen_learning_sessions_reading_experience
--
-- Reading Intelligence Engine™ Upgrade — Sprint-4: Quantum Speed Reading™
-- Experience Integration. `learning_sessions.session_type`
-- (20260711000003_create_learning_sessions.sql) is a CHECK constraint, not a
-- Postgres ENUM, precisely so a new session type is "a plain constraint swap,
-- not an enum-widening migration" — same real pattern every prior amendment
-- (Smart Notes™, Focus Mode™, MCQs™) already used.
--
-- 'reading-experience' is deliberately a NEW, distinct value from the
-- existing 'reading' — the new Reading Session-driven QSR mode this sprint
-- adds stores a different real shape in its own `data` jsonb (a lightweight
-- {documentId, chapterOrder, bundleVersion, progress} marker, not a full
-- adaptive-learning-runtime SessionSnapshot) and must never be picked up by
-- the existing 'reading' SessionSnapshot lookups (`findReadingSessionForDocument`
-- and friends), which remain completely unmodified for QSR's existing 7
-- modes.
--
-- Additive only: every existing row's `session_type` remains valid under the
-- new constraint; no data is touched.
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
  CHECK (session_type IN ('reading', 'memory', 'revision', 'research', 'smart-notes', 'focus', 'mcqs', 'reading-experience'));
