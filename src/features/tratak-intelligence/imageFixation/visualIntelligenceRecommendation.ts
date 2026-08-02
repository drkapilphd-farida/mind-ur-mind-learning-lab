// Visual Intelligence Lab™ — Visual Intelligence Report™, Sprint 10E.
// "AI Recommendation" is a plain, deterministic, rule-based text
// generator — no Anthropic call, no invented claim. Every branch is
// derived only from the real computed scores and the real next-step label
// (or the real "no next step" completion message) — matching the brief's
// own "NO FAKE AI / never fabricate" instruction literally.

export type VisualIntelligenceScores = {
  observationAccuracy: number
  fixationStability: number
  afterImageAwareness: number
  attentionScore: number
  visualRecall: number
}

function overallScore(scores: VisualIntelligenceScores): number {
  return Math.round(
    (scores.observationAccuracy + scores.fixationStability + scores.afterImageAwareness + scores.attentionScore + scores.visualRecall) / 5,
  )
}

// Sprint 10F: widened from a Mandala-specific `nextLevelOrder: MandalaLevelOrder
// | null` to a generic `nextStepLabel: string | null` + an explicit
// `completionMessage` for the null case, so missions with no "level" concept
// (Image Persistence Challenge™) can reuse this unchanged. Mandala's call
// site passes `Level ${n}` / its exact original sentence, so its visible
// output is byte-for-byte unchanged.
export function generateVisualIntelligenceRecommendation(
  scores: VisualIntelligenceScores,
  nextStepLabel: string | null,
  completionMessage: string,
): string {
  const overall = overallScore(scores)
  const nextStep = nextStepLabel !== null ? `Continue to ${nextStepLabel} next.` : completionMessage

  if (overall >= 85) return `Excellent fixation and observation this session. ${nextStep}`
  if (overall >= 65) return `Good progress — your gaze mostly held steady. ${nextStep}`
  if (overall >= 40) return `A fair session — your attention drifted at times. Try a calmer, quieter space before your next session. ${nextStep}`
  return `Your focus was inconsistent this time. A shorter session in a quieter space may help next time. ${nextStep}`
}
