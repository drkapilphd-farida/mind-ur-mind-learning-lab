-- ─────────────────────────────────────────────────────────────────────────────
-- 20260806000001_fix_profiles_and_certificates_leaks
--
-- Security audit findings #1 and #2 (2026-08-06):
--
-- #1 `profiles_select_authenticated` was `USING (true)` for the
-- `authenticated` role — any logged-in user (any tenant, any account)
-- could read every other user's full_name/avatar_url/selected_reading_goal.
-- Fixed by scoping to self, same-school-tenant, or same-family — mirroring
-- the is_active_school_member()/is_active_family_member() helper pattern
-- already established for schools/families.
--
-- #2 `certificates_select_public` was `USING (true)` for the `public`
-- role (including anon) — the entire certificates table (every user_id,
-- course_id, and verification token ever issued) was bulk-readable by
-- anyone, unauthenticated, in one query. Fixed by: (a) removing the
-- public policy entirely, (b) adding a proper self-only SELECT policy
-- so a signed-in user can still see their OWN certificates (this was
-- the only existing SELECT policy on the table, so authenticated users
-- relied on it too — a genuine self-read policy never existed until
-- now), and (c) a SECURITY DEFINER verify_certificate(token) RPC that
-- looks up exactly one certificate by its token — the real, narrower
-- shape the public verification page (/certificates/[token]) actually
-- needs, joined against courses/profiles internally so the page still
-- shows the certificate holder's name without needing broad table
-- access. See src/app/(marketing)/certificates/[token]/page.tsx.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── profiles ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.shares_school_with(p_target_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.school_members AS viewer
    JOIN public.school_members AS target ON target.school_id = viewer.school_id
    WHERE viewer.user_id = auth.uid() AND viewer.status = 'active'
      AND target.user_id = p_target_user_id AND target.status = 'active'
  )
$$;

CREATE OR REPLACE FUNCTION public.shares_family_with(p_target_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.family_members AS viewer
    JOIN public.family_members AS target ON target.family_id = viewer.family_id
    WHERE viewer.user_id = auth.uid() AND viewer.status = 'active'
      AND target.user_id = p_target_user_id AND target.status = 'active'
  )
$$;

DROP POLICY IF EXISTS "profiles_select_authenticated" ON public.profiles;
CREATE POLICY "profiles_select_self_or_related"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR public.shares_school_with(id)
    OR public.shares_family_with(id)
  );

-- ── certificates ────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "certificates_select_public" ON public.certificates;

CREATE POLICY "certificates_select_own"
  ON public.certificates FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.verify_certificate(p_token uuid)
RETURNS TABLE (
  certificate_id uuid,
  course_id uuid,
  course_title text,
  course_slug text,
  student_name text,
  issued_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER SET search_path = public
STABLE
AS $$
  SELECT
    certificates.id,
    certificates.course_id,
    courses.title,
    courses.slug,
    COALESCE(profiles.full_name, 'A dedicated learner'),
    certificates.issued_at
  FROM public.certificates
  JOIN public.courses ON courses.id = certificates.course_id
  LEFT JOIN public.profiles ON profiles.id = certificates.user_id
  WHERE certificates.token = p_token
$$;
