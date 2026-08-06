-- ─────────────────────────────────────────────────────────────────────────────
-- 20260808000001_add_parent_feedback
--
-- Phase 4: Parent NPS & Quality Control. Column named `school_id` (not
-- `tenant_id`) to match every other tenant-scoped log table added this
-- phase series (school_ai_usage_log, school_billing_events) — same
-- entity, same FK target, kept consistently named.
--
-- There is no separate "parent" login in this schema — a school's
-- students are the only tenant-portal-accessible identity a parent
-- could be using (see provisionStudentAccount.ts's synthetic-email
-- students). Feedback submission is therefore scoped to the 'student'
-- school_members role specifically, not just any active tenant member —
-- letting staff (teacher/school_admin/franchise_partner) submit their
-- own "parent" feedback would dilute the signal this is meant to
-- measure.
--
-- nps_score is 0-10, not a 1-5 rating — Net Promoter Score is only a
-- well-defined metric on the 0-10 scale (0-6 Detractor, 7-8 Passive,
-- 9-10 Promoter; NPS = %Promoters − %Detractors), and this feature is
-- named NPS throughout, including the Quality Control dashboard's own
-- promoter/detractor breakdown.
-- ─────────────────────────────────────────────────────────────────────────────

-- Mirrors is_school_admin()/is_active_school_member() from
-- 20260805000002 — a policy on a NEW table querying school_members must
-- go through a SECURITY DEFINER helper, never an inline EXISTS, to avoid
-- the exact self-referencing-policy recursion bug fixed twice already
-- this project (school_members, then family_members).
CREATE OR REPLACE FUNCTION public.is_active_student(p_school_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.school_members
    WHERE school_id = p_school_id AND user_id = auth.uid() AND role = 'student' AND status = 'active'
  )
$$;

CREATE TABLE public.parent_feedback (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id     uuid        NOT NULL REFERENCES public.schools (id) ON DELETE CASCADE,
  user_id       uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  nps_score     integer     NOT NULL CHECK (nps_score BETWEEN 0 AND 10),
  feedback_text text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.parent_feedback ENABLE ROW LEVEL SECURITY;

CREATE INDEX parent_feedback_school_idx ON public.parent_feedback (school_id, created_at DESC);

-- A student may submit feedback only as themselves, and only for a
-- school they are an actively-enrolled student of — both halves of the
-- check matter (user_id = auth.uid() alone would let a student post
-- under someone else's identity for a school they don't attend; the
-- is_active_student() check alone would let them spoof user_id).
CREATE POLICY "parent_feedback_insert_own"
  ON public.parent_feedback FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.is_active_student(school_id));

-- A submitter can see their own past feedback; the tenant's own admin
-- (school_admin or franchise_partner, via the existing is_school_admin()
-- helper) can see every submission for their tenant. Master admin reads
-- go through createServiceClient() (bypasses RLS) — same posture as
-- every other master-admin query this session; ADMIN_EMAILS has no
-- DB-expressible identity for RLS to check, so no policy is written "for"
-- master admin here.
CREATE POLICY "parent_feedback_select_own_or_admin"
  ON public.parent_feedback FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_school_admin(school_id));
