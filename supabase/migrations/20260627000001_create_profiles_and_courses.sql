-- ─────────────────────────────────────────────────────────────────────────────
-- 20260627000001_create_profiles_and_courses
--
-- Establishes shared utilities, public user profiles, and the course catalog.
-- All tables use Row Level Security; service role bypasses RLS by default.
-- ─────────────────────────────────────────────────────────────────────────────


-- ── Utility: auto-stamp updated_at on every UPDATE ───────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


-- ── Profiles ──────────────────────────────────────────────────────────────────
-- Public-safe extension of auth.users (1:1).
-- Application code always reads from profiles, never from auth.users directly.

CREATE TABLE public.profiles (
  id          uuid        PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Authenticated users may read any profile (required for course social features)
CREATE POLICY "profiles_select_authenticated"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Users may only insert their own profile row
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users may only update their own profile row
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Auto-create a profiles row the moment a user signs up.
-- SECURITY DEFINER + explicit search_path prevents schema-injection attacks.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN new;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ── Courses ───────────────────────────────────────────────────────────────────
-- The learning catalog. Content is managed via the service role (admin CMS).
-- Learners see only published courses.

CREATE TABLE public.courses (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text        NOT NULL,
  slug          text        NOT NULL,
  description   text,
  thumbnail_url text,
  is_published  boolean     NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT courses_slug_key UNIQUE (slug)
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Anyone (including unauthenticated visitors) may browse published courses
CREATE POLICY "courses_select_published"
  ON public.courses
  FOR SELECT
  USING (is_published = true);
