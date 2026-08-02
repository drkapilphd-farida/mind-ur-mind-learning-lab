-- ─────────────────────────────────────────────────────────────────────────────
-- 20260718000001_widen_learning_sessions_smart_notes
--
-- Smart Notes™ Sprint-1 — Foundation Engine™. `learning_sessions.session_type`
-- (20260711000003_create_learning_sessions.sql) is a CHECK constraint, not a
-- Postgres ENUM, precisely so a new session type is "a plain constraint swap,
-- not an enum-widening migration" (that migration's own comment). Smart Notes
-- is a real, separate production module — its sessions must not be mislabeled
-- as 'research' or 'revision', so a genuine sixth value is added here rather
-- than reusing an existing one.
--
-- Additive only: every existing row's `session_type` ('reading', 'memory',
-- 'revision', 'research') remains valid under the new constraint; no data is
-- touched.
-- ─────────────────────────────────────────────────────────────────────────────

-- Looked up by table/column rather than a hardcoded name — the original
-- migration never named this constraint explicitly, so this targets
-- whatever Postgres actually auto-generated rather than assuming it.
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
  CHECK (session_type IN ('reading', 'memory', 'revision', 'research', 'smart-notes'));
