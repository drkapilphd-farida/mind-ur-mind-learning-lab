-- ─────────────────────────────────────────────────────────────────────────────
-- 20260705051606_create_mind_passport_snapshots
--
-- Visual Intelligence Lab™ — Visual DNA™, Sprint 8.
--
-- A deliberate departure from this lab's usual append-only-log convention:
-- Mind Passport is a CURRENT SNAPSHOT (one row per user, upserted), not a
-- session history — future Mind Passport pages need to read the latest
-- computed identity/score/summary without recomputing the whole Visual DNA
-- engine. This is the first table in this lab with an UPDATE policy.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.mind_passport_snapshots (
  user_id                   uuid        PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  visual_dna_level          text        NOT NULL,
  visual_intelligence_score integer     NOT NULL CHECK (visual_intelligence_score >= 0),
  primary_trait             text        NOT NULL,
  observation_style         text        NOT NULL,
  -- Nullable: honest "not enough history yet" rather than a fabricated 0.
  growth_percent            numeric,
  achievement_count         integer     NOT NULL CHECK (achievement_count >= 0),
  latest_ai_summary         text        NOT NULL,
  updated_at                timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.mind_passport_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mind_passport_snapshots_select_own"
  ON public.mind_passport_snapshots
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "mind_passport_snapshots_insert_own"
  ON public.mind_passport_snapshots
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "mind_passport_snapshots_update_own"
  ON public.mind_passport_snapshots
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
