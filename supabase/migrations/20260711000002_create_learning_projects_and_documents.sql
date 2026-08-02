-- ─────────────────────────────────────────────────────────────────────────────
-- 20260711000002_create_learning_projects_and_documents
--
-- AI Learning Studio™ Sprint 0 — Platform Foundation™. Domain model: see
-- docs/adr/0001-ai-learning-studio-domain-model.md.
--
-- Learning Project: a container ("IELTS Prep", "Grade 9 Biology") that
-- Documents and (later) Learning Sessions attach to. Optionally shared
-- with a family. Sprint 0 ships owner-only RLS; family-shared visibility
-- is deferred to whichever future sprint builds the actual sharing UI
-- (see ADR §4).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.learning_projects (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  family_id     uuid        REFERENCES public.families (id) ON DELETE SET NULL,
  title         text        NOT NULL,
  description   text,
  status        text        NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.learning_projects ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_learning_projects_updated_at
  BEFORE UPDATE ON public.learning_projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX learning_projects_user_idx ON public.learning_projects (user_id, created_at DESC);
CREATE INDEX learning_projects_family_idx ON public.learning_projects (family_id) WHERE family_id IS NOT NULL;

CREATE POLICY "learning_projects_select_own"
  ON public.learning_projects
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "learning_projects_insert_own"
  ON public.learning_projects
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "learning_projects_update_own"
  ON public.learning_projects
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "learning_projects_delete_own"
  ON public.learning_projects
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


-- Document: an uploaded/created learning artifact. `storage_path` is a
-- reference into Supabase Storage — this sprint only shapes the table;
-- no bucket, no upload UI, no processing pipeline yet.
CREATE TABLE public.documents (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  learning_project_id uuid        REFERENCES public.learning_projects (id) ON DELETE SET NULL,
  title               text        NOT NULL,
  storage_path        text,
  mime_type           text,
  size_bytes          bigint,
  status              text        NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'failed')),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX documents_user_idx ON public.documents (user_id, created_at DESC);
CREATE INDEX documents_learning_project_idx ON public.documents (learning_project_id) WHERE learning_project_id IS NOT NULL;

CREATE POLICY "documents_select_own"
  ON public.documents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "documents_insert_own"
  ON public.documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "documents_update_own"
  ON public.documents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "documents_delete_own"
  ON public.documents
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
