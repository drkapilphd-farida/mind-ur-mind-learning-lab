-- ─────────────────────────────────────────────────────────────────────────────
-- 20260822000001_add_storage_paths_to_documents
--
-- Multi-Image / Batch Photo Upload™ (Phase 3) — `documents.storage_path`
-- (singular) only ever supported one Storage object per document. A
-- student capturing a whole chapter page-by-page needs an ORDERED set of
-- photos to become one document, so this adds `storage_paths` (plural,
-- nullable, ordered `text[]`) alongside it — purely additive, no existing
-- column touched, no existing row's meaning changed.
--
-- `storage_path` stays exactly what it's always been (the one real path
-- for a single-file document — PDF/DOCX/TXT/single-image) and remains
-- the field every pre-existing reader (delete cleanup, single-file
-- extraction, display) keeps using unmodified. `storage_paths` is
-- populated ONLY for a genuine multi-image batch upload (2+ pages); a
-- single-image upload continues writing `storage_path` alone, exactly as
-- before this migration — see runQuickIntelligence.ts's own comment on
-- why a 1-length `storage_paths` array is treated identically to none.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.documents
  ADD COLUMN storage_paths text[];

COMMENT ON COLUMN public.documents.storage_paths IS
  'Ordered Storage paths for a multi-image batch upload (student-defined page order). Null for every single-file document — see storage_path for those.';
