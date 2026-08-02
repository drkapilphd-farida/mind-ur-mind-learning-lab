-- ─────────────────────────────────────────────────────────────────────────────
-- 20260718000002_create_smart_notes
--
-- Smart Notes™ Sprint-2 — Reading & Notes Workspace™. Real, free-text note
-- content does not fit LSE-3's own locked `SessionSnapshot` (Learning
-- Session Runtime™) — that type is deliberately bounded/derived, never a
-- home for raw, growing user content (the same reasoning that already
-- keeps the runtime's own `eventLog` out of it). Notes get their own
-- small, dedicated table instead of widening a shared, locked type.
--
-- Scoped per (learner, document) — confirmed with the founder — not per
-- session: one real, growing set of notes per learner per document,
-- independent of any single session's start/pause/finish lifecycle.
-- `UNIQUE (user_id, document_id)` enforces exactly one row per real
-- learner+document pair; `saveSmartNote.ts` upserts on that pair.
--
-- Session lifecycle/progress/persistence (learning_sessions,
-- universal_learning_objects) are entirely unchanged and untouched by
-- this migration — this is additive only.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.smart_notes (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  document_id  uuid        NOT NULL REFERENCES public.documents (id) ON DELETE CASCADE,
  content      text        NOT NULL DEFAULT '',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, document_id)
);

ALTER TABLE public.smart_notes ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_smart_notes_updated_at
  BEFORE UPDATE ON public.smart_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "smart_notes_select_own"
  ON public.smart_notes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "smart_notes_insert_own"
  ON public.smart_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "smart_notes_update_own"
  ON public.smart_notes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
