-- ─────────────────────────────────────────────────────────────────────────────
-- 20260801000004_harden_quantum_documents
--
-- AI Document Transformer™ — `public.quantum_documents` already exists on
-- the live project (created directly, outside this repo's migration
-- history — confirmed via `supabase gen types typescript --linked`, which
-- reflects the real remote schema: id/user_id/title/raw_text/ai_summary/
-- spider_notes/keywords/quiz_questions/created_at, `keywords` a native
-- `text[]`, no FK on `user_id`, RLS state unconfirmed since this
-- environment has no Docker/direct-Postgres access to introspect
-- `pg_policies` directly). Rather than guess at current RLS/policy state,
-- every statement here is idempotent: enabling RLS that's already enabled,
-- or dropping-then-recreating a policy by the same name, is always safe to
-- re-run and leaves the end state correct regardless of what was there
-- before. Table confirmed empty (0 rows) before this migration, so
-- tightening `user_id` to NOT NULL + a real FK is a safe, non-destructive
-- change, not a risk to existing data.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.quantum_documents ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.quantum_documents ALTER COLUMN user_id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'quantum_documents_user_id_fkey'
  ) THEN
    ALTER TABLE public.quantum_documents
      ADD CONSTRAINT quantum_documents_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS quantum_documents_user_created_idx
  ON public.quantum_documents (user_id, created_at DESC);

DROP POLICY IF EXISTS "quantum_documents_select_own" ON public.quantum_documents;
CREATE POLICY "quantum_documents_select_own" ON public.quantum_documents
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "quantum_documents_insert_own" ON public.quantum_documents;
CREATE POLICY "quantum_documents_insert_own" ON public.quantum_documents
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
