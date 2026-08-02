-- ─────────────────────────────────────────────────────────────────────────────
-- 20260719000002_create_generated_learning_content
--
-- AI Learning Studio™ Sprint ALS-13 — the first two "generate once from the
-- Universal Learning Object™, cache, display instantly" Learning Modes:
-- Mind Map™ (a real document outline — section headings in real order, no
-- fabricated concept relationships, since none exist in the real pipeline
-- without semantic enrichment/AI) and Flashcards™ (real structural review
-- cards — front: a chunk's real heading, back: its real content — never a
-- fabricated question or answer). Both are pure, deterministic derivations
-- of an already-real, already-saved Universal Learning Object™ (see
-- 20260717000001_create_universal_learning_objects.sql) — this migration
-- adds nowhere to re-run extraction, nowhere to call AI, only a cache for
-- the one real, cheap computation each mode performs once per document.
--
-- One row per (document, mode) — mirrors `universal_learning_objects`'
-- own "one row per document" shape and its own RLS posture exactly: no
-- `user_id` column (ownership derived through the real `documents` row,
-- via the same join), and no INSERT/UPDATE/DELETE policy for
-- `authenticated` — this is system-derived content, real but never
-- learner-authored, so only the service-role client (the same one
-- `saveUniversalLearningObject` already uses) writes it.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.generated_learning_content (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id  uuid        NOT NULL REFERENCES public.documents (id) ON DELETE CASCADE,
  mode_id      text        NOT NULL CHECK (mode_id IN ('mind-map', 'flashcards')),
  data         jsonb       NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT generated_learning_content_document_mode_key UNIQUE (document_id, mode_id)
);

ALTER TABLE public.generated_learning_content ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_generated_learning_content_updated_at
  BEFORE UPDATE ON public.generated_learning_content
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX generated_learning_content_document_idx ON public.generated_learning_content (document_id);

CREATE POLICY "generated_learning_content_select_own"
  ON public.generated_learning_content
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.documents
      WHERE documents.id = generated_learning_content.document_id
        AND documents.user_id = auth.uid()
    )
  );

-- Deliberately no INSERT/UPDATE/DELETE policy for `authenticated` — see
-- this migration's own header comment. Only the service-role client
-- writes this table, from each mode's own generate-once-and-cache route.
