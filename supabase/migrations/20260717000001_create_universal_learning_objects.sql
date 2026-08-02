-- ─────────────────────────────────────────────────────────────────────────────
-- 20260717000001_create_universal_learning_objects
--
-- Quantum Speed Reading™ Production Sprint-1. The Universal Learning Object™
-- (UCE-1…6) has been buildable in memory since its own sprint, but nothing
-- persists a built one — `createUniversalLearningObjectCache` (UCE-6) is
-- explicitly disclosed as in-memory-only, "dedupes within one running
-- process only, not across server instances or restarts." Without a real,
-- durable store, "Learning Mode Loader — load an existing Universal
-- Learning Object" has nothing real to load from, and every reading
-- session would force a full, AI-cost-incurring re-build. This migration
-- adds exactly the missing piece: one row per document's current ULO,
-- storing the already-built object verbatim as jsonb. It does not add a
-- new pipeline, parser, or AI step — every field this table stores was
-- already produced by UCE-1…6 before this row is ever written.
--
-- One row per document (`document_id UNIQUE`) — a re-aggregation
-- (`updateUniversalLearningObject`) replaces the row in place via UPSERT,
-- mirroring how the ULO itself represents "the current one" for a
-- document, not a version history. `ulo_id`/`ulo_version_revision` are
-- real fields lifted from the object's own `id`/`version.revision`, kept
-- as real columns (not only inside `data`) so a caller can check identity/
-- staleness without deserializing the full jsonb payload first.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.universal_learning_objects (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id           uuid        NOT NULL REFERENCES public.documents (id) ON DELETE CASCADE,
  ulo_id                text        NOT NULL,
  ulo_version_revision  integer     NOT NULL,
  data                  jsonb       NOT NULL,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT universal_learning_objects_document_id_key UNIQUE (document_id)
);

ALTER TABLE public.universal_learning_objects ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_universal_learning_objects_updated_at
  BEFORE UPDATE ON public.universal_learning_objects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX universal_learning_objects_document_idx ON public.universal_learning_objects (document_id);

-- No `user_id` column — ownership is derived entirely through the real
-- `documents` row a ULO belongs to, never duplicated as a second,
-- possibly-drifting owner field. RLS accordingly joins through `documents`.
CREATE POLICY "universal_learning_objects_select_own"
  ON public.universal_learning_objects
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.documents
      WHERE documents.id = universal_learning_objects.document_id
        AND documents.user_id = auth.uid()
    )
  );

-- Deliberately no INSERT/UPDATE/DELETE policy for `authenticated` — the
-- same "system/service-role-written" pattern ADR 0001 §4 already
-- established for `ai_events`/`subscriptions`/`audit_logs`. A ULO is
-- system-authoritative, real, AI-and-pipeline-produced content; a user
-- must never be able to write or hand-edit their own row here directly.
-- Only the service-role client (bypasses RLS by default) writes this
-- table, from the Learning Mode Loader's own save path.
