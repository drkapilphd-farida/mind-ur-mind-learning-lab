-- ─────────────────────────────────────────────────────────────────────────────
-- 20260806000002_add_school_expiry_and_ai_usage_tracking
--
-- Global Students & Credits Management & Analytics Dashboard (master
-- admin). Two pieces of schema this dashboard needs that didn't exist:
--
-- 1. schools.expires_at — subscription/renewal tracking. Nullable:
--    null = no expiry (the default for every existing tenant, matching
--    the "no live billing, tier assigned manually" reality established
--    when the tenant system was built). "Active/Expiring Soon/Expired"
--    is derived from this date at read time (see
--    src/features/school-dashboard/subscriptionStatus.ts), not stored.
--
-- 2. school_ai_usage_log — the previously-planned school_ai_quota_usage
--    table (from the original school-dashboard design), built now with
--    its real write hook. Scoped specifically to Quantum Document
--    Transformer usage (the one AI feature with clean, consistent
--    per-user attribution today) — NOT a platform-wide AI usage log;
--    see the dashboard plan's Context section for why.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.schools ADD COLUMN expires_at timestamptz;

CREATE TABLE public.school_ai_usage_log (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id           uuid        NOT NULL REFERENCES public.schools (id) ON DELETE CASCADE,
  user_id             uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  quantum_document_id uuid        REFERENCES public.quantum_documents (id) ON DELETE SET NULL,
  occurred_at         timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.school_ai_usage_log ENABLE ROW LEVEL SECURITY;

CREATE INDEX school_ai_usage_log_school_occurred_idx
  ON public.school_ai_usage_log (school_id, occurred_at DESC);

-- Mirrors every other tenant-scoped table: the tenant's own admin can
-- read their usage log (reuses the existing is_school_admin() helper —
-- no new SQL function needed). Writes are service-role only, from the
-- transform route's logging hook.
CREATE POLICY "school_ai_usage_log_select_admin"
  ON public.school_ai_usage_log FOR SELECT TO authenticated
  USING (public.is_school_admin(school_id));
