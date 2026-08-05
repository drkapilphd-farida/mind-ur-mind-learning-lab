-- ─────────────────────────────────────────────────────────────────────────────
-- 20260805000003_add_franchise_partner_support
--
-- Franchise / Partner White-Label Upgrade. A franchise partner is
-- structurally identical to a school (one tenant, its own batches/
-- students/branding) — so rather than a parallel schema, this widens
-- the existing schools/school_members machinery: a `type` discriminator
-- on schools, a new `franchise_partner` membership role treated as a
-- school_admin-equivalent everywhere, plus two genuinely new pieces:
-- the Partner Resources hub and the school-assets logo bucket (pulled
-- forward from the original school-dashboard plan's Phase 5).
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.schools
  ADD COLUMN type text NOT NULL DEFAULT 'school' CHECK (type IN ('school', 'franchise_partner'));

-- Widen the existing role check (was: school_admin, teacher, student) to
-- add franchise_partner — the tenant-admin-equivalent role for a
-- franchise_partner-type tenant. 'teacher' continues to serve as the
-- generic staff/sub-account role for both tenant types (labeled
-- differently per tenantCopy.ts, not a new DB value).
ALTER TABLE public.school_members DROP CONSTRAINT school_members_role_check;
ALTER TABLE public.school_members ADD CONSTRAINT school_members_role_check
  CHECK (role IN ('school_admin', 'franchise_partner', 'teacher', 'student'));

-- Widen the two SECURITY DEFINER helpers from 20260805000002 in place —
-- same function names/signatures, so every existing RLS policy that
-- already calls them (schools_update_admin, classes_insert_admin, etc.)
-- picks up franchise_partner admin rights with zero policy rewrites.
CREATE OR REPLACE FUNCTION public.is_school_admin(p_school_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.school_members
    WHERE school_id = p_school_id AND user_id = auth.uid()
      AND role IN ('school_admin', 'franchise_partner') AND status = 'active'
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
      AND school_members.role IN ('school_admin', 'franchise_partner')
      AND school_members.status = 'active'
  )
$$;

-- Global (not tenant-scoped) check: "is this caller a franchise partner
-- anywhere" — backs partner_resources visibility below.
CREATE OR REPLACE FUNCTION public.is_franchise_partner()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.school_members
    WHERE user_id = auth.uid() AND role = 'franchise_partner' AND status = 'active'
  )
$$;


-- Partner Resources hub — one shared list (Zoom sessions, marketing
-- materials, sales guides), not per-partner content. Master-admin
-- managed; url points either to an external link (Zoom) or a
-- school-assets storage path (downloadable file).
CREATE TABLE public.partner_resources (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title          text        NOT NULL,
  description    text,
  resource_type  text        NOT NULL CHECK (resource_type IN ('zoom_session', 'marketing_material', 'sales_guide')),
  url            text        NOT NULL,
  -- Populated for zoom_session rows only.
  scheduled_at   timestamptz,
  display_order  integer     NOT NULL DEFAULT 0,
  is_published   boolean     NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_resources ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_partner_resources_updated_at
  BEFORE UPDATE ON public.partner_resources
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX partner_resources_display_order_idx ON public.partner_resources (display_order);

CREATE POLICY "partner_resources_select_partners"
  ON public.partner_resources FOR SELECT TO authenticated
  USING (is_published = true AND public.is_franchise_partner());
-- Writes: service-role only, from /admin/partner-resources.


-- Logo storage — public (must render unauthenticated in student-facing
-- headers), path convention {school_id}/logo.{ext}. Reuses the
-- now-widened is_school_admin() for both tenant types, so no new helper
-- is needed here. First public bucket in this app (learning-documents,
-- the only prior bucket, is private/owner-folder-scoped).
INSERT INTO storage.buckets (id, name, public)
VALUES ('school-assets', 'school-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "school_assets_insert_admin"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'school-assets'
    AND public.is_school_admin(((storage.foldername(name))[1])::uuid)
  );

CREATE POLICY "school_assets_update_admin"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'school-assets'
    AND public.is_school_admin(((storage.foldername(name))[1])::uuid)
  );

CREATE POLICY "school_assets_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'school-assets');
