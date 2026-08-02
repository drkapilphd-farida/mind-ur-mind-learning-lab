-- ─────────────────────────────────────────────────────────────────────────────
-- 20260705120000_add_candle_tratak_mission_id
--
-- Visual Intelligence Lab™ — Tratak Intelligence Journey™, Sprint 10F
-- architecture refinement.
--
-- Adds 'candle-tratak' (Mission 1 in the refined roadmap) to the mission_id
-- allow-list. 'mandala-persistence' is deliberately KEPT in this constraint
-- even though Mission Mandala Persistence™ is retired from the visible
-- roadmap (tratakMissions.ts) — its route and real historical rows stay
-- fully functional if visited directly, per explicit product decision.
-- Purely additive: no existing allowed value is removed.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.tratak_mission_sessions
  DROP CONSTRAINT tratak_mission_sessions_mission_id_check;

ALTER TABLE public.tratak_mission_sessions
  ADD CONSTRAINT tratak_mission_sessions_mission_id_check
  CHECK (mission_id IN ('mandala-persistence', 'image-persistence-challenge', 'candle-tratak'));
