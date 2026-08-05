-- ─────────────────────────────────────────────────────────────────────────────
-- 20260805000001_create_schools_and_school_dashboard
--
-- School / Institutional Dashboard — Phase 1. Multi-tenant foundation:
-- schools, their membership (admin/teacher/student roles), classes, and
-- class enrollment/teacher-assignment. Mirrors the existing
-- families/family_members precedent (20260711000001) for the
-- "one account overseeing several member accounts, relationship-table
-- gated RLS" shape, with two differences: school_members.user_id is
-- NOT NULL (every student gets a real, login-able account — see
-- provisionStudentAccount.ts — so there is no login-less member row to
-- model), and there are three roles instead of one owner/member split.
--
-- Purely additive: no existing table is altered. See
-- docs/adr/... (school dashboard plan) for the full design.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.schools (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text        NOT NULL,
  slug              text        NOT NULL,
  logo_url          text,
  -- Display label only — max_students is the number actually enforced,
  -- so master admin can grant a custom seat count without inventing a
  -- new tier label.
  tier              text        NOT NULL DEFAULT 'tier_50'
                      CHECK (tier IN ('tier_50', 'tier_100', 'tier_200', 'tier_500_plus')),
  max_students      integer     NOT NULL DEFAULT 50 CHECK (max_students > 0),
  monthly_ai_quota  integer     NOT NULL DEFAULT 100 CHECK (monthly_ai_quota >= 0),
  status            text        NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'archived')),
  owner_id          uuid        NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT schools_slug_key UNIQUE (slug)
);

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_schools_updated_at
  BEFORE UPDATE ON public.schools
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX schools_owner_idx ON public.schools (owner_id);


-- Every member of a school — admin, teacher, or student, one row each.
CREATE TABLE public.school_members (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id     uuid        NOT NULL REFERENCES public.schools (id) ON DELETE CASCADE,
  user_id       uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  role          text        NOT NULL CHECK (role IN ('school_admin', 'teacher', 'student')),
  status        text        NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'removed')),
  -- Student-only provisioning metadata (null for admin/teacher rows).
  -- username is the generated login handle, e.g. "greenwood.6a.rahul42".
  username      text,
  roll_number   text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT school_members_school_user_unique UNIQUE (school_id, user_id),
  CONSTRAINT school_members_username_required_for_student
    CHECK (role <> 'student' OR username IS NOT NULL)
);

ALTER TABLE public.school_members ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_school_members_updated_at
  BEFORE UPDATE ON public.school_members
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX school_members_school_idx ON public.school_members (school_id);
CREATE INDEX school_members_user_idx ON public.school_members (user_id);
-- username doubles as the literal Supabase Auth login identity (via a
-- synthetic email derived from it), so it must be globally unique, not
-- just unique per school.
CREATE UNIQUE INDEX school_members_username_unique ON public.school_members (username) WHERE username IS NOT NULL;


-- Sections like "Class 6-A".
CREATE TABLE public.classes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id   uuid        NOT NULL REFERENCES public.schools (id) ON DELETE CASCADE,
  name        text        NOT NULL,
  grade_level text,
  section     text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_classes_updated_at
  BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX classes_school_idx ON public.classes (school_id);


-- Student <-> class. References the student's school_members row (not
-- auth.users directly) so role/status/username are reachable via one
-- join. "member must have role='student'" is enforced by the Server
-- Action, not a DB CHECK (Postgres can't CHECK against another table).
CREATE TABLE public.class_enrollments (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id          uuid        NOT NULL REFERENCES public.classes (id) ON DELETE CASCADE,
  school_member_id  uuid        NOT NULL REFERENCES public.school_members (id) ON DELETE CASCADE,
  created_at        timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT class_enrollments_class_member_unique UNIQUE (class_id, school_member_id)
);

ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;

CREATE INDEX class_enrollments_class_idx ON public.class_enrollments (class_id);
CREATE INDEX class_enrollments_member_idx ON public.class_enrollments (school_member_id);


-- Teacher <-> class assignment, the join scoped role-based visibility
-- (§ RLS below) is built on.
CREATE TABLE public.class_teachers (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id          uuid        NOT NULL REFERENCES public.classes (id) ON DELETE CASCADE,
  school_member_id  uuid        NOT NULL REFERENCES public.school_members (id) ON DELETE CASCADE,
  created_at        timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT class_teachers_class_member_unique UNIQUE (class_id, school_member_id)
);

ALTER TABLE public.class_teachers ENABLE ROW LEVEL SECURITY;

CREATE INDEX class_teachers_class_idx ON public.class_teachers (class_id);
CREATE INDEX class_teachers_member_idx ON public.class_teachers (school_member_id);


-- ── RLS ─────────────────────────────────────────────────────────────────
-- Mirrors family_members_select_same_family's self-referencing EXISTS
-- shape, with two visibility tiers: school_admin sees everything in
-- their school (no class filter), teacher sees only rows reachable via
-- class_teachers, student sees only their own row / their own class.

-- schools: visible to any active member; updatable by that school's
-- admin (branding fields only are exposed in the UI's edit form — the
-- tier/max_students/monthly_ai_quota columns are technically reachable
-- by this policy but never rendered as editable client-side; a
-- column-level REVOKE is a noted fast-follow, not blocking Phase 1).
-- INSERT is master-admin-only via the service-role client from
-- /admin/schools/new — no authenticated-role INSERT policy at all.
CREATE POLICY "schools_select_member"
  ON public.schools FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.school_members
      WHERE school_members.school_id = schools.id
        AND school_members.user_id = auth.uid()
        AND school_members.status = 'active'
    )
  );

CREATE POLICY "schools_update_admin"
  ON public.schools FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.school_members
      WHERE school_members.school_id = schools.id
        AND school_members.user_id = auth.uid()
        AND school_members.role = 'school_admin'
        AND school_members.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.school_members
      WHERE school_members.school_id = schools.id
        AND school_members.user_id = auth.uid()
        AND school_members.role = 'school_admin'
        AND school_members.status = 'active'
    )
  );

-- school_members: a member always sees their own row; a school_admin
-- additionally sees every row in their school. All writes are
-- service-role only (no client INSERT/UPDATE/DELETE policy) — same "a
-- client can never self-assign a role" posture as user_roles;
-- provisioning always goes through provisionStudentAccount's
-- service-role client.
CREATE POLICY "school_members_select_admin_all_or_self"
  ON public.school_members FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.school_members AS self
      WHERE self.school_id = school_members.school_id
        AND self.user_id = auth.uid()
        AND self.role = 'school_admin'
        AND self.status = 'active'
    )
  );

-- classes: admin sees/manages all classes in their school; teacher sees
-- classes they're assigned to; student sees their own enrolled class.
CREATE POLICY "classes_select_scoped"
  ON public.classes FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.school_members
      WHERE school_members.school_id = classes.school_id
        AND school_members.user_id = auth.uid()
        AND school_members.role = 'school_admin'
        AND school_members.status = 'active'
    )
    OR EXISTS (
      SELECT 1 FROM public.class_teachers
      JOIN public.school_members ON school_members.id = class_teachers.school_member_id
      WHERE class_teachers.class_id = classes.id
        AND school_members.user_id = auth.uid()
        AND school_members.status = 'active'
    )
    OR EXISTS (
      SELECT 1 FROM public.class_enrollments
      JOIN public.school_members ON school_members.id = class_enrollments.school_member_id
      WHERE class_enrollments.class_id = classes.id
        AND school_members.user_id = auth.uid()
        AND school_members.status = 'active'
    )
  );

CREATE POLICY "classes_insert_admin"
  ON public.classes FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.school_members
      WHERE school_members.school_id = classes.school_id
        AND school_members.user_id = auth.uid()
        AND school_members.role = 'school_admin'
        AND school_members.status = 'active'
    )
  );

CREATE POLICY "classes_update_admin"
  ON public.classes FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.school_members
      WHERE school_members.school_id = classes.school_id
        AND school_members.user_id = auth.uid()
        AND school_members.role = 'school_admin'
        AND school_members.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.school_members
      WHERE school_members.school_id = classes.school_id
        AND school_members.user_id = auth.uid()
        AND school_members.role = 'school_admin'
        AND school_members.status = 'active'
    )
  );

CREATE POLICY "classes_delete_admin"
  ON public.classes FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.school_members
      WHERE school_members.school_id = classes.school_id
        AND school_members.user_id = auth.uid()
        AND school_members.role = 'school_admin'
        AND school_members.status = 'active'
    )
  );

-- class_enrollments: admin sees all in their school; teacher sees
-- enrollments in classes they teach; student sees their own row. Writes
-- are service-role only (bulk import / manual add path).
CREATE POLICY "class_enrollments_select_scoped"
  ON public.class_enrollments FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.classes
      JOIN public.school_members ON school_members.school_id = classes.school_id
      WHERE classes.id = class_enrollments.class_id
        AND school_members.user_id = auth.uid()
        AND school_members.role = 'school_admin'
        AND school_members.status = 'active'
    )
    OR EXISTS (
      SELECT 1 FROM public.class_teachers
      JOIN public.school_members ON school_members.id = class_teachers.school_member_id
      WHERE class_teachers.class_id = class_enrollments.class_id
        AND school_members.user_id = auth.uid()
        AND school_members.status = 'active'
    )
    OR EXISTS (
      SELECT 1 FROM public.school_members
      WHERE school_members.id = class_enrollments.school_member_id
        AND school_members.user_id = auth.uid()
    )
  );

-- class_teachers: admin-visible/writable only for Phase 1 — a teacher
-- does not need to see who else teaches their class yet.
CREATE POLICY "class_teachers_select_admin"
  ON public.class_teachers FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.classes
      JOIN public.school_members ON school_members.school_id = classes.school_id
      WHERE classes.id = class_teachers.class_id
        AND school_members.user_id = auth.uid()
        AND school_members.role = 'school_admin'
        AND school_members.status = 'active'
    )
  );
