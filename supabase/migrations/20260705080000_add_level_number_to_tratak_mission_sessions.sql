-- ─────────────────────────────────────────────────────────────────────────────
-- 20260705080000_add_level_number_to_tratak_mission_sessions
--
-- Visual Intelligence Lab™ — Mandala Tratak™ Multi-Level Progression, Sprint 10C.
--
-- Purely additive: one new nullable column on the existing
-- tratak_mission_sessions table. The other 5 Tratak missions (and any
-- future non-leveled mission) never set it. Levels within a mission unlock
-- sequentially the same way missions unlock sequentially in
-- tratakMissionEngine.ts (Sprint 10A, unmodified) — that engine still
-- treats a mission as 'completed' the moment any row for its mission_id has
-- completed = true, so only the final level's row sets that flag true;
-- levels 1-4 use completed = false while still recording real level/XP/
-- reflection/notes data.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.tratak_mission_sessions
  ADD COLUMN level_number integer CHECK (level_number IS NULL OR level_number BETWEEN 1 AND 5);
