-- ─────────────────────────────────────────────────────────────────────────────
-- 20260903000002_create_habit_builder_payments_and_entitlement
--
-- Automated Habit Builder Access™ — wires real payment to real access for
-- RAZORPAY_QUANTUM_MINDSET_HABIT_BUILDER_PAYMENT_LINK
-- (src/config/quantumMindsetHabitBuilderPaymentLink.ts), the same way
-- 20260826000001_add_masterclass_entitlement_and_device_binding.sql did
-- for the QSR Masterclass — but deliberately NOT via the same mechanism.
--
-- Why this ISN'T just "add a habit-builder row to plans/subscriptions"
-- (the masterclass migration's own pattern): getIsPaidUser() — the real
-- paywall behind hasQuantumSpeedReadingProAccess() and, by extension,
-- QSR document upload, Masterclass-gated content, etc. — treats ANY
-- active row in public.subscriptions as "paid," regardless of plan_id.
-- Per explicit founder decision, a Habit Builder purchase must NEVER
-- unlock QSR Masterclass content (and this migration must not touch
-- getIsPaidUser() itself, which is shared by every other paid gate in
-- the app). Writing a habit-builder entitlement into `subscriptions`
-- would silently defeat that isolation the moment it's granted — so
-- this grants access via `public.entitlements` instead (a user-level
-- override row, `plan_id IS NULL`), a table getIsPaidUser() never reads.
-- hasHabitBuilderAccess() (application code) checks this entitlement OR
-- getIsPaidUser() — preserving today's existing, separately-decided
-- behavior that a Masterclass/app-continued subscriber already gets
-- Habit Builder access, left completely untouched here.
--
-- No `plans` row is added for 'habit-builder' — plans/subscriptions model
-- a recurring billing relationship (status lifecycle, period start/end);
-- this is a single one-time flag, which is exactly what `entitlements`
-- (key/value, no lifecycle) already exists for.
--
-- Payment-before-signup / signup-before-payment handling mirrors
-- masterclass_payments exactly: a staging ledger table, unique on
-- razorpay_payment_id for webhook-redelivery idempotency, with
-- handle_new_user() extended (again) to claim any unclaimed row matching
-- the new user's email/phone at signup.
-- ─────────────────────────────────────────────────────────────────────────────


-- ── habit_builder_payments: payment ledger + pending-grant staging table ─────
--
-- Same posture as masterclass_payments: no RLS SELECT/INSERT policy for
-- `authenticated` — only the service-role webhook and the SECURITY
-- DEFINER trigger function ever touch this table.

CREATE TABLE public.habit_builder_payments (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  razorpay_payment_id text        NOT NULL,
  email               text,
  phone               text,
  amount_cents        integer,
  currency            text,
  user_id             uuid        REFERENCES auth.users (id) ON DELETE SET NULL,
  granted_at          timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT habit_builder_payments_razorpay_payment_id_unique UNIQUE (razorpay_payment_id)
);

ALTER TABLE public.habit_builder_payments ENABLE ROW LEVEL SECURITY;

CREATE INDEX habit_builder_payments_email_idx ON public.habit_builder_payments (email) WHERE email IS NOT NULL AND granted_at IS NULL;
CREATE INDEX habit_builder_payments_phone_idx ON public.habit_builder_payments (phone) WHERE phone IS NOT NULL AND granted_at IS NULL;


-- ── handle_new_user(): also claim any pending Habit Builder payment ──────────
--
-- CREATE OR REPLACE on the same function 20260826000001 already extended
-- once for masterclass_payments — extended again, not duplicated. New
-- behavior only: after the existing masterclass claim, also look for an
-- unclaimed habit_builder_payments row matching the new user's
-- email/phone and, if found, grant the entitlement immediately via
-- public.entitlements (never public.subscriptions — see this migration's
-- own top comment on why).

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  matched_plan_id uuid;
  matched_payment_id uuid;
  matched_habit_builder_payment_id uuid;
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, email, phone)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url',
    new.email,
    new.phone
  );

  -- Claim-on-signup (QSR Masterclass) — unchanged from 20260826000001.
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

  -- Claim-on-signup (Habit Builder) — new. Same "at most one unclaimed
  -- payment, oldest first" reasoning as the masterclass claim above: a
  -- real person paying twice for the same one-time product is a manual-
  -- support edge case, not something this trigger should silently grant
  -- twice over.
  SELECT id INTO matched_habit_builder_payment_id
  FROM public.habit_builder_payments
  WHERE granted_at IS NULL
    AND (
      (new.email IS NOT NULL AND email = new.email)
      OR (new.phone IS NOT NULL AND phone = new.phone)
    )
  ORDER BY created_at ASC
  LIMIT 1;

  IF matched_habit_builder_payment_id IS NOT NULL THEN
    INSERT INTO public.entitlements (user_id, key, value)
    VALUES (new.id, 'habit_builder_access', '{"granted": true}'::jsonb)
    ON CONFLICT (user_id, key) WHERE user_id IS NOT NULL DO UPDATE SET value = '{"granted": true}'::jsonb;

    UPDATE public.habit_builder_payments
    SET user_id = new.id, granted_at = now()
    WHERE id = matched_habit_builder_payment_id;
  END IF;

  RETURN new;
END;
$$;
