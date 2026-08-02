-- ─────────────────────────────────────────────────────────────────────────────
-- 20260730000001_create_learning_asset_bundles
--
-- Reading Intelligence Engine™ Upgrade — Sprint-2: Learning Assets
-- Generator™. One row per (document, chapter) — same granularity as
-- `chapter_intelligence_blueprints`, since a Learning Asset Bundle is
-- derived purely from that chapter's own already-real Blueprint (zero
-- new AI, zero raw-chunk re-reading).
--
-- `content_hash` intentionally reuses the SAME real hash value already
-- stored on the source `chapter_intelligence_blueprints` row (not a
-- fresh hash of raw chunk content) — a Blueprint that has not been
-- regenerated means its assets don't need to be either. "Generated ONCE.
-- Stored. Cached. Reused. Never regenerated unless the Blueprint changes."
--
-- Same "system/service-role-written, no authenticated policy at all"
-- pattern as chapter_intelligence_blueprints/document_chunk_cache —
-- nothing in the product surfaces this table to a learner directly;
-- Sprint-3 will read it server-side via a new
-- loadLearningAssetBundles() service function.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.learning_asset_bundles (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id   uuid        NOT NULL REFERENCES public.documents (id) ON DELETE CASCADE,
  chapter_order integer     NOT NULL,
  content_hash  text        NOT NULL,
  data          jsonb       NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT learning_asset_bundles_document_chapter_key UNIQUE (document_id, chapter_order)
);

ALTER TABLE public.learning_asset_bundles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_learning_asset_bundles_updated_at
  BEFORE UPDATE ON public.learning_asset_bundles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX learning_asset_bundles_document_idx ON public.learning_asset_bundles (document_id);

-- No authenticated SELECT/INSERT/UPDATE policy at all, by design — see
-- header comment.
