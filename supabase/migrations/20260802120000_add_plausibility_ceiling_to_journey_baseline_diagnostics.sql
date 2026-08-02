-- ─────────────────────────────────────────────────────────────────────────────
-- 20260802120000_add_plausibility_ceiling_to_journey_baseline_diagnostics
--
-- journey_baseline_diagnostics had no upper bound on raw_wpm/true_baseline_wpm
-- — both fields are computed client-side (no server-recorded timer exists),
-- so real user testing found forged/gamed submissions reaching 300+ WPM with
-- no genuine reading involved. BaselineDiagnosticInputSchema now enforces the
-- same ceiling and the rawWpm/accuracyPercent/trueBaselineWpm relationship at
-- the application layer (see baselineDiagnosticSchema.ts) — this is the
-- matching database-level backstop, so the constraint holds even against a
-- future write path that bypasses that Zod schema.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.journey_baseline_diagnostics
  DROP CONSTRAINT journey_baseline_diagnostics_raw_wpm_check,
  DROP CONSTRAINT journey_baseline_diagnostics_true_baseline_wpm_check;

ALTER TABLE public.journey_baseline_diagnostics
  ADD CONSTRAINT journey_baseline_diagnostics_raw_wpm_check CHECK (raw_wpm BETWEEN 0 AND 1000),
  ADD CONSTRAINT journey_baseline_diagnostics_true_baseline_wpm_check CHECK (true_baseline_wpm BETWEEN 0 AND 1000),
  ADD CONSTRAINT journey_baseline_diagnostics_true_wpm_matches_accuracy_check
    CHECK (true_baseline_wpm = ROUND(raw_wpm * (accuracy_percent / 100.0)));
