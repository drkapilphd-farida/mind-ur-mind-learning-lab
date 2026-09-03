-- ─────────────────────────────────────────────────────────────────────────────
-- 20260902000001_create_franchise_leads
--
-- Franchise/Individual Trainer Application™ — raw leads from the public
-- /franchise-individual application form, kept deliberately separate
-- from the real `schools`/tenant-membership tables `/admin/partners/new`
-- (CreateTenantForm, createSchool.ts) writes to. This table is only ever
-- a review queue: name/phone/city/background plus a status workflow
-- (new/contacted/approved/rejected) the admin works through by hand.
-- Approving a lead here does NOT automatically create a tenant — the
-- admin still goes to /admin/partners/new manually for that, exactly as
-- requested; the two systems are related in purpose only, not linked by
-- a foreign key.
--
-- Same "insert-only for anon" RLS shape as leads.sql — a prospective
-- franchisee fills this out before any sign-in, so there is no user_id
-- to scope a policy on, and this is exactly the kind of contact-detail
-- PII no other visitor should be able to read back through the public
-- API. Reading and updating leads is a service-role-only (admin/
-- back-office) operation, same as every other admin-only table in this
-- app (see masterclasses.sql's own note on the same pattern).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.franchise_leads (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text        NOT NULL,
  phone         text        NOT NULL,
  city          text        NOT NULL,
  background    text,
  status        text        NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'approved', 'rejected')),
  submitted_at  timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX franchise_leads_submitted_at_idx ON public.franchise_leads (submitted_at DESC);
CREATE INDEX franchise_leads_status_idx ON public.franchise_leads (status);

CREATE TRIGGER set_franchise_leads_updated_at
  BEFORE UPDATE ON public.franchise_leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.franchise_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "franchise_leads_insert_anonymous"
  ON public.franchise_leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
