-- ─────────────────────────────────────────────────────────────────────────────
-- 20260806000003_restrict_schools_authenticated_update_columns
--
-- Security finding while building the Master Admin analytics dashboard:
-- schools_update_admin (20260805000001) gates WHICH ROWS a tenant admin
-- can update (is_school_admin(id)) but not WHICH COLUMNS — Postgres's
-- default table-wide GRANT UPDATE to `authenticated` meant a
-- school_admin/franchise_partner could write to ANY column on their own
-- row via their own RLS-respecting session, not just the branding
-- fields (name/logo_url) updateTenantBranding.ts actually exposes.
--
-- This only became a real, exploitable escalation path once
-- max_students/monthly_ai_quota/expires_at existed as master-admin-only
-- controls (this same dashboard) — confirmed live: a school_admin could
-- self-escalate their own seat limit and AI quota, and clear their own
-- subscription expiry, completely bypassing updateTenantLimits.ts.
--
-- Fix: revoke the blanket UPDATE grant and re-grant it narrowly, to
-- exactly the two columns a tenant admin is legitimately meant to
-- write. RLS (schools_update_admin) continues to gate which ROW; this
-- gates which COLUMNS, the piece RLS alone cannot express. Master admin
-- writes (updateTenantLimits.ts, createSchool.ts) go through the
-- service-role client, which bypasses both RLS and table grants
-- entirely — unaffected by this change.
-- ─────────────────────────────────────────────────────────────────────────────

REVOKE UPDATE ON public.schools FROM authenticated;
GRANT UPDATE (name, logo_url) ON public.schools TO authenticated;
