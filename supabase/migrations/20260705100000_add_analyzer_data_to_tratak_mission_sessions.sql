-- ─────────────────────────────────────────────────────────────────────────────
-- 20260705100000_add_analyzer_data_to_tratak_mission_sessions
--
-- Visual Intelligence Lab™ — Dynamic Mandala Intelligence™, Sprint 10D.
--
-- Purely additive: one new nullable jsonb column. Holds the Intelligent
-- Focus Analyzer™'s 4 structured answers + optional notes + the 5 computed
-- Visual Analytics scores for sessions using the new analyzer flow. The
-- existing reflection_response/observation_notes text columns (Sprint 10B)
-- stay untouched for backward compatibility — simply unused going forward.
-- A single JSON column (vs. many new typed columns) keeps the schema
-- footprint minimal and is the right shape for reusability: a future
-- mission with a different question set needs no new columns, just a
-- different JSON shape.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.tratak_mission_sessions
  ADD COLUMN analyzer_data jsonb;
