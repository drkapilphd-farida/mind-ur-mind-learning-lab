-- ─────────────────────────────────────────────────────────────────────────────
-- 20260809000003_create_live_masterclass_waitlist
--
-- QSR Pro Circuit™ — Live Masterclass upsell. Dr. Kapil Dev Sharma's live
-- workshop model is documented product philosophy (docs/PROJECT_RULES.md,
-- docs/LEARNING_BIBLE.md), not a scheduled, bookable event today — no
-- table anywhere stores a real class date/time. This is deliberately just
-- an honest interest waitlist ("notify me when one is scheduled"), never
-- a booking/registration flow that would imply a real class already
-- exists.
--
-- No separate email column — the email already lives on auth.users, and
-- capturing it a second time here would be needless duplicate PII.
-- UNIQUE(user_id) makes a repeat join a no-op at the DB level, matching
-- the UI's own "You're on the list" (not a resubmit) behavior.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.live_masterclass_waitlist (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT live_masterclass_waitlist_user_unique UNIQUE (user_id)
);

ALTER TABLE public.live_masterclass_waitlist ENABLE ROW LEVEL SECURITY;

-- A user may only ever join the waitlist as themselves, and can only see
-- their own row — no admin-read policy is needed yet (nothing reads this
-- table outside the app today); a future admin export can go through
-- createServiceClient() like every other master-admin query already does.
CREATE POLICY "live_masterclass_waitlist_insert_own"
  ON public.live_masterclass_waitlist FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "live_masterclass_waitlist_select_own"
  ON public.live_masterclass_waitlist FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
