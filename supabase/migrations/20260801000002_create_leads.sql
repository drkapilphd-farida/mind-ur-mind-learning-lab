-- ─────────────────────────────────────────────────────────────────────────────
-- 20260801000002_create_leads
--
-- Discover Your Learning Potential™ — 2-minute assessment lead magnet,
-- final step. Captures Full Name + WhatsApp Number alongside the three
-- assessment scores (Reading Sprint WPM, Memory Efficiency %, Focus
-- Attention Stability %) so the WhatsApp report/21-day roadmap can be
-- sent after the visitor unlocks their Mind Profile.
--
-- Unlike every other discovery-session table, this one is reached BEFORE
-- any sign-in — the whole point of the flow is to capture contact info
-- for someone who does not yet have an account. There is no user_id to
-- key on, so RLS is insert-only for the anon role rather than the usual
-- auth.uid()-scoped policy: no SELECT policy is defined for anon or
-- authenticated, since a name + WhatsApp number is PII that no other
-- visitor should ever be able to read back through the public API.
-- Reading leads back is a service-role-only (admin/back-office)
-- operation.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.leads (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name       text        NOT NULL,
  whatsapp_number text        NOT NULL,
  reading_wpm     integer     NOT NULL CHECK (reading_wpm >= 0),
  memory_percent  integer     NOT NULL CHECK (memory_percent BETWEEN 0 AND 100),
  focus_percent   integer     NOT NULL CHECK (focus_percent BETWEEN 0 AND 100),
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX leads_created_at_idx ON public.leads (created_at DESC);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leads_insert_anonymous"
  ON public.leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
