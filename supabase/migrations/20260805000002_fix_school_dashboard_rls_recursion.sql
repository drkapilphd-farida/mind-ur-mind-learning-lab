-- ─────────────────────────────────────────────────────────────────────────────
-- 20260805000002_fix_school_dashboard_rls_recursion
--
-- Phase 1 verification caught a real bug: school_members_select_admin_all_or_self
-- (and every policy that copied its self-referencing EXISTS-on-school_members
-- shape) throws "infinite recursion detected in policy for relation
-- school_members" at query time. Unlike a plain self-join, Postgres must
-- re-apply school_members' own RLS to evaluate the "self" alias inside its
-- own USING clause, which requires evaluating the same policy again — a
-- real, well-documented Postgres/Supabase RLS limitation, not a rare edge
-- case (family_members_select_same_family — 20260711000001 — has the exact
-- same latent shape and would fail identically under the same test).
--
-- Fix: move every self-referencing EXISTS check into a SECURITY DEFINER
-- helper function. A SECURITY DEFINER function owned by the migration
-- role (table owner) bypasses RLS on the tables it reads internally, so
-- the recursive re-entry never happens — the standard, documented fix for
-- this exact pattern. Policy logic is unchanged; only how it's expressed.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.is_active_school_member(p_school_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.school_members
    WHERE school_id = p_school_id AND user_id = auth.uid() AND status = 'active'
  )
$$;

CREATE OR REPLACE FUNCTION public.is_school_admin(p_school_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.school_members
    WHERE school_id = p_school_id AND user_id = auth.uid() AND role = 'school_admin' AND status = 'active'
  )
$$;

CREATE OR REPLACE FUNCTION public.is_class_teacher(p_class_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.class_teachers
    JOIN public.school_members ON school_members.id = class_teachers.school_member_id
    WHERE class_teachers.class_id = p_class_id
      AND school_members.user_id = auth.uid()
      AND school_members.status = 'active'
  )
$$;

CREATE OR REPLACE FUNCTION public.is_class_student(p_class_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.class_enrollments
    JOIN public.school_members ON school_members.id = class_enrollments.school_member_id
    WHERE class_enrollments.class_id = p_class_id
      AND school_members.user_id = auth.uid()
      AND school_members.status = 'active'
  )
$$;

CREATE OR REPLACE FUNCTION public.is_school_admin_for_class(p_class_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.classes
    JOIN public.school_members ON school_members.school_id = classes.school_id
    WHERE classes.id = p_class_id
      AND school_members.user_id = auth.uid()
      AND school_members.role = 'school_admin'
      AND school_members.status = 'active'
  )
$$;


-- ── schools ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "schools_select_member" ON public.schools;
CREATE POLICY "schools_select_member"
  ON public.schools FOR SELECT TO authenticated
  USING (public.is_active_school_member(id));

DROP POLICY IF EXISTS "schools_update_admin" ON public.schools;
CREATE POLICY "schools_update_admin"
  ON public.schools FOR UPDATE TO authenticated
  USING (public.is_school_admin(id))
  WITH CHECK (public.is_school_admin(id));

-- ── school_members ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "school_members_select_admin_all_or_self" ON public.school_members;
CREATE POLICY "school_members_select_admin_all_or_self"
  ON public.school_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_school_admin(school_id));

-- ── classes ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "classes_select_scoped" ON public.classes;
CREATE POLICY "classes_select_scoped"
  ON public.classes FOR SELECT TO authenticated
  USING (
    public.is_school_admin(school_id)
    OR public.is_class_teacher(id)
    OR public.is_class_student(id)
  );

DROP POLICY IF EXISTS "classes_insert_admin" ON public.classes;
CREATE POLICY "classes_insert_admin"
  ON public.classes FOR INSERT TO authenticated
  WITH CHECK (public.is_school_admin(school_id));

DROP POLICY IF EXISTS "classes_update_admin" ON public.classes;
CREATE POLICY "classes_update_admin"
  ON public.classes FOR UPDATE TO authenticated
  USING (public.is_school_admin(school_id))
  WITH CHECK (public.is_school_admin(school_id));

DROP POLICY IF EXISTS "classes_delete_admin" ON public.classes;
CREATE POLICY "classes_delete_admin"
  ON public.classes FOR DELETE TO authenticated
  USING (public.is_school_admin(school_id));

-- ── class_enrollments ───────────────────────────────────────────────────
DROP POLICY IF EXISTS "class_enrollments_select_scoped" ON public.class_enrollments;
CREATE POLICY "class_enrollments_select_scoped"
  ON public.class_enrollments FOR SELECT TO authenticated
  USING (
    public.is_school_admin_for_class(class_id)
    OR public.is_class_teacher(class_id)
    OR EXISTS (
      SELECT 1 FROM public.school_members
      WHERE school_members.id = class_enrollments.school_member_id
        AND school_members.user_id = auth.uid()
    )
  );

-- ── class_teachers ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "class_teachers_select_admin" ON public.class_teachers;
CREATE POLICY "class_teachers_select_admin"
  ON public.class_teachers FOR SELECT TO authenticated
  USING (public.is_school_admin_for_class(class_id));
