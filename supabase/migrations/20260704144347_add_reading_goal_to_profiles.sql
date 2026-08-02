-- ─────────────────────────────────────────────────────────────────────────────
-- 20260704144347_add_reading_goal_to_profiles
--
-- Quantum Speed Reading™ Sprint 4 — Adaptive Intelligence Engine™.
--
-- A single per-user preference (which of the 6 reading goals the learner has
-- selected), following the same "simple field on profiles" precedent as
-- full_name/avatar_url. Nullable — no goal selected yet is a valid state.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN selected_reading_goal text;
