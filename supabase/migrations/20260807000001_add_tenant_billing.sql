-- ─────────────────────────────────────────────────────────────────────────────
-- 20260807000001_add_tenant_billing
--
-- Phase 3: tenant (school/franchise partner) billing via Razorpay
-- Subscriptions. Deliberately separate from the existing `subscriptions`
-- table (20260711000005) — that table is individual/consumer billing,
-- keyed to auth.users + Stripe, and still unimplemented. This is
-- tenant-level billing, keyed to `schools`, and is the thing that
-- actually drives `schools.expires_at`.
--
-- Linking model: a Razorpay subscription is created OUTSIDE this app
-- (Razorpay dashboard, or a hosted Subscription Link — the same pattern
-- already used for consumer plans), then the master admin links the
-- resulting subscription id to a tenant here. Nothing in this app calls
-- Razorpay's API to create a subscription — see linkRazorpaySubscription.ts.
-- The webhook handler is what keeps payment_status/expires_at in sync
-- after that link exists.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.schools
  ADD COLUMN razorpay_subscription_id text,
  ADD COLUMN razorpay_customer_id text,
  ADD COLUMN billing_cycle text CHECK (billing_cycle IN ('monthly', 'yearly')),
  -- 'unlinked': the default for every tenant today (no subscription
  -- linked). 'created': linked, but Razorpay hasn't confirmed activation
  -- yet. 'active' / 'past_due' / 'canceled': the three states the
  -- product asked for, driven by the activated/charged, halted, and
  -- cancelled webhook events respectively. This is a payment-provider
  -- status, deliberately independent of `schools.status` (operational
  -- active/suspended/archived, which stays admin-controlled — a billing
  -- webhook must never silently reactivate a tenant an admin suspended
  -- for an unrelated reason, e.g. abuse).
  ADD COLUMN payment_status text NOT NULL DEFAULT 'unlinked'
    CHECK (payment_status IN ('unlinked', 'created', 'active', 'past_due', 'canceled'));

CREATE UNIQUE INDEX schools_razorpay_subscription_id_key
  ON public.schools (razorpay_subscription_id)
  WHERE razorpay_subscription_id IS NOT NULL;

-- One row per billing lifecycle event received from Razorpay — the
-- tenant-facing "billing history" / invoice list. Mirrors
-- school_ai_usage_log's own one-row-per-event convention.
CREATE TABLE public.school_billing_events (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id            uuid        NOT NULL REFERENCES public.schools (id) ON DELETE CASCADE,
  event_type           text        NOT NULL CHECK (event_type IN ('activated', 'charged', 'halted', 'cancelled')),
  razorpay_subscription_id text    NOT NULL,
  -- Only set for 'charged' events; NULL for pure state-transition events.
  razorpay_payment_id  text,
  amount_cents         integer,
  currency              text,
  occurred_at           timestamptz NOT NULL DEFAULT now(),
  created_at            timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.school_billing_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX school_billing_events_school_occurred_idx
  ON public.school_billing_events (school_id, occurred_at DESC);

-- Razorpay may redeliver a webhook; a 'charged' event carries a real
-- payment id, so a duplicate delivery must not double-log a payment.
-- (activated/halted/cancelled are state transitions, not money — a
-- redelivered duplicate there is cosmetic, not a correctness issue.)
CREATE UNIQUE INDEX school_billing_events_payment_id_key
  ON public.school_billing_events (razorpay_payment_id)
  WHERE razorpay_payment_id IS NOT NULL;

-- Mirrors school_ai_usage_log's own policy — the tenant's own admin
-- (school_admin or franchise_partner, via the existing is_school_admin()
-- helper) can read their own billing history; writes are service-role
-- only, from the webhook handler.
CREATE POLICY "school_billing_events_select_admin"
  ON public.school_billing_events FOR SELECT TO authenticated
  USING (public.is_school_admin(school_id));
