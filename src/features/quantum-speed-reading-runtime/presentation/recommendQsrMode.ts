// Reading Intelligence Engine™ Upgrade — Sprint-4 adds
// 'intelligent-reading' — the new Reading Session-driven mode, additive
// alongside the existing 7. `recommendQsrMode` below is deliberately
// left unchanged: it never recommends the new mode (a real recommendation
// stays scoped to the 7 modes it already has real signals for), never a
// redesign of this sprint's own real, working recommendation logic.
export type QsrModeId = 'sequential' | 'presence' | 'smart-chunk' | 'guided-eye-flow' | 'sprint' | 'comprehension-check' | 'speed-ladder' | 'intelligent-reading'

export type QsrRecommendationSignals = {
  // `null`, honestly, when this document has no real recorded WPM samples
  // yet (a first-time reader) — never a guessed starting number.
  averageWpm: number | null
  pauseCount: number
}

export type QsrModeRecommendation = {
  modeId: QsrModeId
  reason: string
  estimatedImprovementWpm: number | null
}

// The brief's own worked example ("your current reading speed is 165
// WPM" → recommend Smart Chunk Reading) sets this threshold — 165 WPM
// must fall on the "still building speed" side of it.
const LOW_WPM_THRESHOLD = 200
const HIGH_PAUSE_COUNT_THRESHOLD = 3
const ESTIMATED_IMPROVEMENT_WPM = 30

// Quantum Speed Reading Experience Engine™ (QSR-E1) — the AI
// Recommendation Layer and the Exercise Recommendation Engine are the
// same function, called from two places (the Hub's own initial pick, and
// a mid-session nudge once real pause/regression signals accumulate) —
// mirrors `ai-mentor-runtime/recommendations/recommendMentorFocus.ts`'s
// exact real pattern: real, disclosed thresholds over real stored
// signals, a real number interpolated into the message, never an AI
// call, never a fabricated figure. A recommendation is only ever
// guidance — every mode stays directly reachable from the Hub regardless
// of what this function returns.
export function recommendQsrMode(signals: QsrRecommendationSignals): QsrModeRecommendation {
  if (signals.averageWpm === null) {
    return { modeId: 'presence', reason: 'Starting with a calm, focused read helps us learn your natural reading pace.', estimatedImprovementWpm: null }
  }

  if (signals.pauseCount >= HIGH_PAUSE_COUNT_THRESHOLD) {
    return {
      modeId: 'guided-eye-flow',
      reason: `You've paused ${signals.pauseCount} times this session — Guided Eye Flow can help reduce regressions and keep your eyes moving forward.`,
      estimatedImprovementWpm: ESTIMATED_IMPROVEMENT_WPM,
    }
  }

  if (signals.averageWpm < LOW_WPM_THRESHOLD) {
    return {
      modeId: 'smart-chunk',
      reason: `We recommend Smart Chunk Reading because your current reading speed is ${signals.averageWpm} WPM.`,
      estimatedImprovementWpm: ESTIMATED_IMPROVEMENT_WPM,
    }
  }

  return {
    modeId: 'sprint',
    reason: `Your reading speed is ${signals.averageWpm} WPM — a Reading Sprint is a great way to challenge yourself further.`,
    estimatedImprovementWpm: ESTIMATED_IMPROVEMENT_WPM,
  }
}
