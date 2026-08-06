-- ─────────────────────────────────────────────────────────────────────────────
-- 20260806000004_evolve_partner_resources_hub
--
-- Partner Resource Hub upgrade. `partner_resources` already existed
-- (20260805000003) with a closed `resource_type` enum and an external
-- `url` — evolved here, not duplicated, into a real file-upload feature:
-- `resource_type` (enum: zoom_session/marketing_material/sales_guide)
-- becomes `category` (free text — real categories like 'Video Ads' or
-- 'Brochures' don't fit that old 3-value enum), `url` becomes `file_url`
-- (now backs uploaded Storage objects, not just external links), and
-- `file_type`/`created_by` are new. Table had zero real rows at the time
-- of this migration — a pure schema evolution, no data transform needed.
--
-- Visibility also widens: the original policy only showed resources to
-- franchise partners; schools should see them too (both are "HQ-managed
-- marketing/sales resources for the tenant admin running this school/
-- academy"). is_franchise_partner() is left in place (harmless, still
-- valid) rather than removed — is_tenant_admin() is the new, broader
-- check this policy actually uses.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.partner_resources DROP CONSTRAINT partner_resources_resource_type_check;
ALTER TABLE public.partner_resources RENAME COLUMN resource_type TO category;
ALTER TABLE public.partner_resources RENAME COLUMN url TO file_url;
ALTER TABLE public.partner_resources ADD COLUMN file_type text;
ALTER TABLE public.partner_resources ADD COLUMN created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION public.is_tenant_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.school_members
    WHERE user_id = auth.uid() AND role IN ('school_admin', 'franchise_partner') AND status = 'active'
  )
$$;

DROP POLICY IF EXISTS "partner_resources_select_partners" ON public.partner_resources;
CREATE POLICY "partner_resources_select_tenant_admins"
  ON public.partner_resources FOR SELECT TO authenticated
  USING (is_published = true AND public.is_tenant_admin());

-- New public bucket for uploaded marketing/sales materials. Writes are
-- service-role only — master admin has no DB-expressible identity
-- (ADMIN_EMAILS is a server env var, not a table RLS can query), same
-- posture as every other master-admin write in this app
-- (createSchool.ts, updateTenantLimits.ts, ...) — so no authenticated
-- INSERT/UPDATE/DELETE policy is granted here at all; only a public
-- SELECT so uploaded files can actually be viewed/downloaded once
-- inserted. 50MB cap, restricted to the file types this feature was
-- scoped for (PDF, MP4, images, Word docs) — the school-assets bucket
-- built earlier this session had neither limit set from day one, a gap
-- fixed in a later security pass; this bucket gets it right from the
-- start.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'partner-resources',
  'partner-resources',
  true,
  52428800,
  ARRAY[
    'application/pdf',
    'video/mp4',
    'image/png',
    'image/jpeg',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "partner_resources_bucket_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'partner-resources');
