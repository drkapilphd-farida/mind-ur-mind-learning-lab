-- ─────────────────────────────────────────────────────────────────────────────
-- 20260722000001_widen_learning_sessions_focus
--
-- AI Learning Studio™ Sprint ALS-16 — Focus Mode™ (Mini). `learning_sessions.
-- session_type` (20260711000003_create_learning_sessions.sql) is a CHECK
-- constraint, not a Postgres ENUM, precisely so a new session type is "a
-- plain constraint swap, not an enum-widening migration" (that migration's
-- own comment, reused verbatim by 20260718000001's own Smart Notes™
-- amendment). Focus Mode™ is its own real production module — its sessions
-- must not be mislabeled as 'reading' or 'memory', so a genuine seventh value
-- is added here rather than reusing an existing one.
--
-- Additive only: every existing row's `session_type` ('reading', 'memory',
-- 'revision', 'research', 'smart-notes') remains valid under the new
-- constraint; no data is touched.
--
-- Not yet applied to the linked Supabase project, matching this project's
-- own established policy (see docs/PRODUCTION_HANDOFF_AI_LEARNING_STUDIO_SPRINT_ALS_10.md).
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
  CHECK (session_type IN ('reading', 'memory', 'revision', 'research', 'smart-notes', 'focus'));
