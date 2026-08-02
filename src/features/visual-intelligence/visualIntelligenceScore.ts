// Visual Intelligence Lab™ — lab-wide aggregate score.
// Structurally mirrors computeMindScore's "average of active dimension
// scores ×10, capped at 1000" pattern (src/lib/exercises/mindScore.ts), but
// is a fully separate function scoped to this lab — not a modification of
// that file.
//
// Currently fed by a single active dimension (Visual Persistence Score™,
// Sprint 6). Deliberately does not read Sprint-5's Visual Focus Score™ —
// this keeps Sprint 6 self-contained per its isolation constraint, even
// though reading (not modifying) that data would be technically safe. The
// array-input signature is what makes this honestly extensible later: a
// future sprint can pass in more dimension scores without any redesign
// here.
export function computeVisualIntelligenceScore(activeDimensionScores: readonly number[]): number {
  if (activeDimensionScores.length === 0) return 0
  const avg = activeDimensionScores.reduce((sum, score) => sum + score, 0) / activeDimensionScores.length
  return Math.min(1000, Math.round(avg * 10))
}
