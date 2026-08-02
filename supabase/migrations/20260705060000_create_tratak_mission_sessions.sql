-- ─────────────────────────────────────────────────────────────────────────────
-- 20260705060000_create_tratak_mission_sessions
--
-- Visual Intelligence Lab™ — Tratak Intelligence Journey™, Sprint 10A.
--
-- The second Journey inside Visual Intelligence Lab™ (sibling to the
-- Foundation Journey — Preparation/Fixation/Persistence Challenge/Adaptive/
-- Visual DNA/Dashboard from Sprints 1-9, all untouched). One shared,
-- append-only log for all 6 Tratak missions, discriminated by mission_id —
-- same shape as fixation_sessions/persistence_challenge_sessions. Nothing
-- writes to this table yet: Sprint-10A ships architecture and the landing
-- experience only, no exercise engine, so every read against this table is
-- honestly empty until Sprint-10B builds the real missions.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.tratak_mission_sessions (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  mission_id       text        NOT NULL CHECK (mission_id IN (
                                 'mandala-persistence', 'color-persistence', 'nature-persistence',
                                 'portrait-persistence', 'sacred-symbol-persistence', 'candle-tratak'
                               )),
  -- Always the fixed designed length for that mission — the real, honest
  -- session length by design, not a measured or fabricated wall-clock value.
  duration_seconds integer     NOT NULL CHECK (duration_seconds >= 0),
  completed        boolean     NOT NULL DEFAULT true,
  occurred_at      timestamptz NOT NULL DEFAULT now()
);

-- hot path: "this user's tratak sessions, most recent first"
CREATE INDEX tratak_mission_sessions_user_occurred_idx
  ON public.tratak_mission_sessions (user_id, occurred_at DESC);

-- supports "has this mission been completed" per-mission lookups
CREATE INDEX tratak_mission_sessions_user_mission_idx
  ON public.tratak_mission_sessions (user_id, mission_id);

ALTER TABLE public.tratak_mission_sessions ENABLE ROW LEVEL SECURITY;

-- Append-only: select/insert only, no update/delete — same convention as
-- fixation_sessions and persistence_challenge_sessions.
CREATE POLICY "tratak_mission_sessions_select_own"
  ON public.tratak_mission_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "tratak_mission_sessions_insert_own"
  ON public.tratak_mission_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
