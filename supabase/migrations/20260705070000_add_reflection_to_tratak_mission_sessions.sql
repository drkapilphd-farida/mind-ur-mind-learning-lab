-- ─────────────────────────────────────────────────────────────────────────────
-- 20260705070000_add_reflection_to_tratak_mission_sessions
--
-- Visual Intelligence Lab™ — Mandala Tratak™, Sprint 10B.
--
-- Purely additive: 3 new nullable/defaulted columns on the existing
-- tratak_mission_sessions table (Sprint 10A). Zero impact on Sprint-10A's
-- reads (getTratakMissionSessions.ts keeps selecting only its original 4
-- columns) or RLS policies (already select/insert-own, sufficient).
-- reflection_response is nullable — future missions (e.g. Candle Tratak™)
-- may not use this same after-image reflection shape.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.tratak_mission_sessions
  ADD COLUMN reflection_response text CHECK (reflection_response IS NULL OR reflection_response IN (
    'clear-afterimage', 'brief-afterimage', 'colors-only', 'no-afterimage'
  )),
  ADD COLUMN observation_notes text,
  ADD COLUMN xp_earned integer NOT NULL DEFAULT 0 CHECK (xp_earned >= 0);
