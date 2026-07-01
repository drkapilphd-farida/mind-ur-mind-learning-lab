-- Add markdown body to lessons.
-- Nullable so existing rows are unaffected; populated via the admin editor or AI generation.
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS content TEXT;
