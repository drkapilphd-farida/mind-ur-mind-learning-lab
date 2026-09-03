-- ─────────────────────────────────────────────────────────────────────────────
-- 20260903000003_create_digital_detox_checkins
--
-- Digital Detox Check-in™ — one row per daily "did you keep your phone
-- away for an hour before sleep last night?" answer, shown at the start
-- of every day's session in the 21-Day Quantum Mindset & Habit Builder
-- (habit.mindurmind.org.in only — QuantumJourneySession.tsx is only ever
-- reachable via /labs/quantum-speed-reading/journey/*, which is
-- habit-domain-exclusive per src/middleware.ts's DOMAIN_ROUTES).
--
-- Same append-only, one-row-per-real-check-in shape as
-- daily_quantum_sessions — no persisted "streak" column; the detox
-- streak (consecutive days answered `true`) is computed fresh from these
-- rows every time (see computeDigitalDetoxStreak.ts), the same
-- "never a separately mutable running total" convention every other
-- streak in this app already follows. Multiple rows on the same real day
-- are tolerated, not prevented (no unique constraint) — the streak
-- calculation buckets by date-key exactly like computeDailyQuantumStreak
-- already does, so a duplicate same-day answer is harmless.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.digital_detox_checkins (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  kept_phone_away  boolean     NOT NULL,
  occurred_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX digital_detox_checkins_user_occurred_idx
  ON public.digital_detox_checkins (user_id, occurred_at DESC);

ALTER TABLE public.digital_detox_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "digital_detox_checkins_select_own"
  ON public.digital_detox_checkins
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "digital_detox_checkins_insert_own"
  ON public.digital_detox_checkins
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
