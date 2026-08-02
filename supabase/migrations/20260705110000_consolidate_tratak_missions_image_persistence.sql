-- ─────────────────────────────────────────────────────────────────────────────
-- 20260705110000_consolidate_tratak_missions_image_persistence
--
-- Visual Intelligence Lab™ — Tratak Intelligence Journey™, Sprint 10F.
--
-- Sprint 10A reserved 5 placeholder mission ids (color-persistence,
-- nature-persistence, portrait-persistence, sacred-symbol-persistence,
-- candle-tratak) for future missions — none of them ever shipped an
-- exercise engine or a UI path, so no real row could ever exist with any
-- of those ids. Sprint 10F consolidates all 5 into one real, built mission:
-- Image Persistence Challenge™ ('image-persistence-challenge'), per
-- explicit product approval. This only narrows the allow-list on the
-- mission_id CHECK constraint — the column, its type, and every other
-- constraint/policy on this table are unchanged.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.tratak_mission_sessions
  DROP CONSTRAINT tratak_mission_sessions_mission_id_check;

ALTER TABLE public.tratak_mission_sessions
  ADD CONSTRAINT tratak_mission_sessions_mission_id_check
  CHECK (mission_id IN ('mandala-persistence', 'image-persistence-challenge'));
