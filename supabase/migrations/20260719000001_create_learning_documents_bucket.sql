-- ─────────────────────────────────────────────────────────────────────────────
-- 20260719000001_create_learning_documents_bucket
--
-- AI Learning Studio™ Sprint ALS-10 — Universal Content Engine™ Foundation
-- (UCE-1). Until now, no Supabase Storage bucket existed anywhere in this
-- app — an uploaded file's real bytes never left the browser; only
-- `{name, type, size}` was ever persisted (see `documents.storage_path`,
-- nullable since its own Sprint 1 migration, always null in practice).
-- This is the missing piece: a private bucket real files are genuinely
-- uploaded to, so the real UCE-2…6 pipeline (extraction/chunking/
-- knowledge-graph/learning-analysis/ULO-assembly — all already built,
-- tested, and orphaned until this sprint) has real bytes to read.
--
-- Path convention: `{user_id}/{document_id}/{filename}` — the same
-- owner-first-segment convention this app already uses for RLS elsewhere,
-- so `storage.foldername(name)[1] = auth.uid()::text` is sufficient
-- ownership proof, mirroring `documents`/`learning_projects`' own
-- `user_id`-scoped RLS rather than inventing a new authorization model.
-- Private (never public) — a signed URL or an authenticated download is
-- required to read a file back, never a public link.
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('learning-documents', 'learning-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "learning_documents_insert_own"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'learning-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "learning_documents_select_own"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'learning-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Deliberately no UPDATE/DELETE policy yet — no real "replace file" or
-- "delete project" capability exists anywhere in this app today (a
-- Learning Project's own delete flow is out of this sprint's scope); a
-- policy for an action nothing can trigger would be dead surface, not a
-- real capability.
