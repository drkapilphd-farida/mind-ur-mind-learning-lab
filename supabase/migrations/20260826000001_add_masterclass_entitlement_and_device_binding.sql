-- ─────────────────────────────────────────────────────────────────────────────
-- 20260826000001_add_masterclass_entitlement_and_device_binding
--
-- Automated Masterclass Access™ — wires real payment to real access. Until
-- now, RAZORPAY_MASTERCLASS_PAYMENT_LINK (src/config/masterclassPaymentLink.ts)
-- took real money but granted nothing automatically — enrollment was
-- confirmed manually by Dr. Kapil's team. This migration does NOT add a
-- new, disconnected `has_paid` flag: the app already has a real
-- paywall — public.subscriptions + getIsPaidUser() (see
-- 20260711000005_create_plans_subscriptions_entitlements.sql) — used by
-- every existing paid gate (hasQuantumSpeedReadingProAccess.ts, and by
-- extension both the QSR journey pages AND the habit.mindurmind.org.in
-- domain's HabitDashboard, which reuses the same check). A second,
-- separate `has_paid` boolean would not be seen by any of that — this
-- migration instead teaches the REAL mechanism about a new plan, so
-- getIsPaidUser() starts returning true the moment a payment is granted,
-- with zero changes needed at any existing call site.
--
-- Payment-before-signup problem: RAZORPAY_MASTERCLASS_PAYMENT_LINK is a
-- static, unauthenticated Razorpay Payment Link — a visitor can pay
-- without ever having created an app account, so a webhook firing at
-- payment time frequently has no user_id to attach a subscription to.
-- masterclass_payments (below) is the staging ledger that makes both
-- orderings work: webhook-first (payment arrives, no account yet — sits
-- unclaimed) and signup-first (account exists — matched immediately).
-- handle_new_user() is extended to claim any unclaimed row matching the
-- new user's email/phone at the moment they sign up, so the grant
-- resolves automatically regardless of which happened first.
--
-- Revision (still unapplied, edited in place rather than layered with a
-- second migration): single-device enforcement no longer lives in this
-- schema at all. It's now handled entirely at login time via
-- supabase.auth.signOut({ scope: 'others' }) — Supabase's own built-in
-- session-invalidation primitive (see verifyAppLoginEmailOtp.ts) — which
-- operates on Supabase's own internal session/refresh-token store, not a
-- self-reported column this app would have to trust. The
-- `current_device_id` column and its column-level write lockdown from an
-- earlier revision of this migration are gone; email/phone remain (still
-- needed for payment matching), with their own lockdown kept.
-- ─────────────────────────────────────────────────────────────────────────────


-- ── profiles: email/phone, for matching a webhook payment to an account ──────
--
-- email/phone duplicate auth.users columns on purpose — "application code
-- always reads from profiles, never auth.users directly" is this
-- project's established convention (see create_profiles_and_courses.sql),
-- and matching a webhook payment to an account via a plain profiles
-- query is far simpler than paginating the Admin Auth API. Populated by
-- handle_new_user() below at signup; not kept in sync with later
-- auth.users email/phone changes — acceptable for MVP matching, revisit
-- if change-email/change-phone flows become real feature.

ALTER TABLE public.profiles
  ADD COLUMN email text,
  ADD COLUMN phone text;

-- Column-level write restriction — same fix, same reasoning, as
-- 20260806000003_restrict_schools_authenticated_update_columns: RLS
-- (profiles_update_own) gates WHICH ROW an authenticated user can
-- update, not WHICH COLUMN. Without this, any signed-in user could
-- forge their own email/phone from their own browser session to hijack
-- a pending masterclass_payments grant meant for someone else.
-- email/phone are written only by handle_new_user() (SECURITY DEFINER,
-- bypasses grants) and by Server Actions using the service-role client —
-- never by a client-side update. full_name/avatar_url/selected_reading_goal
-- remain self-editable, matching current app behavior.
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name, avatar_url, selected_reading_goal) ON public.profiles TO authenticated;


-- ── plans: seed both real entitlements ────────────────────────────────────────
--
-- qsr-masterclass: billing_interval = 'lifetime' — a one-time ₹4,999
-- enrollment, not a recurring charge; current_period_end stays NULL on
-- the subscription row (getIsPaidUser only checks status, never
-- current_period_end — NULL there means "never expires").
--
-- qsr-app-continued: the new ₹499 plan — what unlocks continued app
-- practice access once a user's 60-day free window (see getIsPaidUser.ts)
-- lapses, for users who want continued practice without the full live
-- Masterclass. Seeded as billing_interval = 'month' (recurring) — this
-- was not specified in the request; a one-time/'lifetime' ₹499 unlock is
-- an equally simple one-value change here if that's what's actually
-- intended. No Razorpay payment link exists yet for this plan (nothing
-- analogous to RAZORPAY_MASTERCLASS_PAYMENT_LINK) — provide one and a
-- webhook can be added to grant it the same way masterclass-webhook does.
--
-- ON CONFLICT makes this migration safe to reason about even if a plan
-- with either key is ever seeded by hand before this runs.

INSERT INTO public.plans (key, name, description, price_cents, billing_interval, is_active)
VALUES
  (
    'qsr-masterclass',
    '30-Day Quantum Speed Reading Live Masterclass',
    '7 live masterclass sessions with Dr. Kapil Dev Sharma plus the Quantum Mind App for daily practice (WPM & comprehension tracking) — one-time enrollment.',
    499900,
    'lifetime',
    true
  ),
  (
    'qsr-app-continued',
    'Quantum Mind App — Continued Practice Access',
    'Continued access to the Quantum Mind App''s daily practice tools after your 60-day free window ends.',
    49900,
    'month',
    true
  )
ON CONFLICT (key) DO NOTHING;

-- Idempotency for the webhook's upsert below: redelivery of the same
-- Razorpay event (or a user re-paying after a lapsed/canceled row) must
-- not create duplicate active subscriptions for the same plan.
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_user_plan_unique
  ON public.subscriptions (user_id, plan_id);


-- ── masterclass_payments: payment ledger + pending-grant staging table ───────
--
-- Every payment.captured webhook delivery is upserted here first
-- (unique on razorpay_payment_id — safe against Razorpay's documented
-- at-least-once redelivery). user_id is filled in immediately if a
-- matching profile already exists; otherwise the row waits here,
-- unclaimed, until handle_new_user() finds it at signup. No RLS SELECT/
-- INSERT policy is granted to `authenticated` — only the service-role
-- webhook and the SECURITY DEFINER trigger function ever touch this
-- table, same posture as school_billing_events.

CREATE TABLE public.masterclass_payments (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  razorpay_payment_id text        NOT NULL,
  email               text,
  phone               text,
  amount_cents        integer,
  currency            text,
  user_id             uuid        REFERENCES auth.users (id) ON DELETE SET NULL,
  granted_at          timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT masterclass_payments_razorpay_payment_id_unique UNIQUE (razorpay_payment_id)
);

ALTER TABLE public.masterclass_payments ENABLE ROW LEVEL SECURITY;

CREATE INDEX masterclass_payments_email_idx ON public.masterclass_payments (email) WHERE email IS NOT NULL AND granted_at IS NULL;
CREATE INDEX masterclass_payments_phone_idx ON public.masterclass_payments (phone) WHERE phone IS NOT NULL AND granted_at IS NULL;


-- ── handle_new_user(): populate email/phone + claim any pending payment ──────
--
-- CREATE OR REPLACE on the existing function from
-- create_profiles_and_courses.sql — same trigger (on_auth_user_created),
-- extended rather than duplicated. New behavior only: copy email/phone
-- onto the new profile row, then look for an unclaimed
-- masterclass_payments row matching either one and, if found, grant the
-- qsr-masterclass subscription immediately. Runs inside the same
-- transaction as the auth.users insert, SECURITY DEFINER (as before) so
-- it bypasses the column-restriction GRANT above (it IS the trusted
-- writer that GRANT is written to allow for).

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  matched_plan_id uuid;
  matched_payment_id uuid;
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, email, phone)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url',
    new.email,
    new.phone
  );

  -- Claim-on-signup: at most one unclaimed payment is matched (oldest
  -- first) — a real person paying twice for the same one-time product
  -- is an edge case for manual support, not something this trigger
  -- should silently grant twice over.
  SELECT id INTO matched_payment_id
  FROM public.masterclass_payments
  WHERE granted_at IS NULL
    AND (
      (new.email IS NOT NULL AND email = new.email)
      OR (new.phone IS NOT NULL AND phone = new.phone)
    )
  ORDER BY created_at ASC
  LIMIT 1;

  IF matched_payment_id IS NOT NULL THEN
    SELECT id INTO matched_plan_id FROM public.plans WHERE key = 'qsr-masterclass';

    IF matched_plan_id IS NOT NULL THEN
      INSERT INTO public.subscriptions (user_id, plan_id, status, current_period_start)
      VALUES (new.id, matched_plan_id, 'active', now())
      ON CONFLICT (user_id, plan_id) DO UPDATE SET status = 'active';

      UPDATE public.masterclass_payments
      SET user_id = new.id, granted_at = now()
      WHERE id = matched_payment_id;
    END IF;
  END IF;

  RETURN new;
END;
$$;
