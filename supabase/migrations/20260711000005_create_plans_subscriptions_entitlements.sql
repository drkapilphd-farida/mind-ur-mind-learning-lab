-- ─────────────────────────────────────────────────────────────────────────────
-- 20260711000005_create_plans_subscriptions_entitlements
--
-- AI Learning Studio™ Sprint 0 — Platform Foundation™. Domain model: see
-- docs/adr/0001-ai-learning-studio-domain-model.md.
--
-- Plan: the purchasable catalog, public like the existing `courses`
-- pattern (courses_select_published). Subscription: a user's (or
-- family's) active plan instance — this sprint adds the table only, the
-- existing Stripe billing integration (createCheckoutSession.ts) is not
-- touched or wired to it yet. Entitlement: what a plan (or a specific
-- user override) unlocks, as key/value rather than one column per
-- feature, so a new limit never needs a schema change.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.plans (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  key                 text        NOT NULL,
  name                text        NOT NULL,
  description         text,
  price_cents         integer     NOT NULL DEFAULT 0,
  billing_interval    text        NOT NULL CHECK (billing_interval IN ('month', 'year', 'lifetime', 'free')),
  max_family_members  integer,
  is_active           boolean     NOT NULL DEFAULT true,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT plans_key_key UNIQUE (key)
);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_plans_updated_at
  BEFORE UPDATE ON public.plans
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Public catalog — anyone (including signed-out visitors) may browse active plans.
CREATE POLICY "plans_select_active"
  ON public.plans
  FOR SELECT
  USING (is_active = true);


CREATE TABLE public.subscriptions (
  id                     uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  family_id              uuid        REFERENCES public.families (id) ON DELETE SET NULL,
  plan_id                uuid        NOT NULL REFERENCES public.plans (id) ON DELETE RESTRICT,
  status                 text        NOT NULL CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'expired')),
  stripe_customer_id     text,
  stripe_subscription_id text,
  current_period_start   timestamptz,
  current_period_end     timestamptz,
  canceled_at            timestamptz,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX subscriptions_user_idx ON public.subscriptions (user_id);
CREATE INDEX subscriptions_family_idx ON public.subscriptions (family_id) WHERE family_id IS NOT NULL;
CREATE INDEX subscriptions_stripe_subscription_idx ON public.subscriptions (stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;

-- Read-only for the client — billing state is written server-side
-- (Stripe webhook handler using the service-role client), never directly
-- by an authenticated user, so no INSERT/UPDATE policy is granted here.
CREATE POLICY "subscriptions_select_own"
  ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);


CREATE TABLE public.entitlements (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Exactly one of plan_id (a template every subscriber to that plan
  -- gets) or user_id (a one-off override/grant for a specific user) is set.
  plan_id     uuid        REFERENCES public.plans (id) ON DELETE CASCADE,
  user_id     uuid        REFERENCES auth.users (id) ON DELETE CASCADE,
  key         text        NOT NULL,
  value       jsonb       NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT entitlements_plan_xor_user CHECK (
    (plan_id IS NOT NULL AND user_id IS NULL) OR (plan_id IS NULL AND user_id IS NOT NULL)
  )
);

ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_entitlements_updated_at
  BEFORE UPDATE ON public.entitlements
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX entitlements_plan_idx ON public.entitlements (plan_id) WHERE plan_id IS NOT NULL;
CREATE INDEX entitlements_user_idx ON public.entitlements (user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX entitlements_plan_key_unique ON public.entitlements (plan_id, key) WHERE plan_id IS NOT NULL;
CREATE UNIQUE INDEX entitlements_user_key_unique ON public.entitlements (user_id, key) WHERE user_id IS NOT NULL;

-- Plan-level entitlements are part of the public plan catalog; user-level
-- overrides are visible only to that user. Writes are service-role only.
CREATE POLICY "entitlements_select_plan_or_own"
  ON public.entitlements
  FOR SELECT
  USING (plan_id IS NOT NULL OR user_id = auth.uid());
