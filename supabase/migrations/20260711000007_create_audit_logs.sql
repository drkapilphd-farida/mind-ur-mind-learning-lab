-- ─────────────────────────────────────────────────────────────────────────────
-- 20260711000007_create_audit_logs
--
-- AI Learning Studio™ Sprint 0 — Platform Foundation™. Domain model: see
-- docs/adr/0001-ai-learning-studio-domain-model.md.
--
-- Generic, append-only record of significant actions across the system
-- (family membership changes, subscription transitions, role grants,
-- ...). `actor_user_id` is nullable — a system-initiated event (e.g. a
-- Stripe webhook expiring a subscription) has no human actor. Written
-- exclusively via the service-role client from server-side code; no
-- authenticated INSERT policy, so a client can never forge an entry.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.audit_logs (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id  uuid        REFERENCES auth.users (id) ON DELETE SET NULL,
  action         text        NOT NULL,
  entity_type    text        NOT NULL,
  entity_id      uuid,
  metadata       jsonb       NOT NULL DEFAULT '{}'::jsonb,
  created_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX audit_logs_actor_idx ON public.audit_logs (actor_user_id, created_at DESC) WHERE actor_user_id IS NOT NULL;
CREATE INDEX audit_logs_entity_idx ON public.audit_logs (entity_type, entity_id) WHERE entity_id IS NOT NULL;

-- A user may view their own activity history. No INSERT/UPDATE/DELETE
-- policy for `authenticated` — writes are service-role only.
CREATE POLICY "audit_logs_select_own"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = actor_user_id);
