// Visual Intelligence Lab™ — Tratak Intelligence Journey™, Sprint 10A.
// Gate for unlocking Journey-2: mirrors the exact condition Sprint-9's own
// journeyProgressEngine.ts uses to mark Preparation/Fixation/Persistence
// 'completed' — computed directly from the 3 existing raw session getters,
// not by routing through the full buildDnaContext/DNA engine (which
// computes strengths/radar/etc. this check doesn't need). Fully decoupled
// from Sprint-8's DNA feature.

export type FoundationCompletionCounts = {
  visualPreparationCount: number
  fixationCount: number
  persistenceChallengeCount: number
}

export function isFoundationJourneyComplete(counts: FoundationCompletionCounts): boolean {
  return counts.visualPreparationCount > 0 && counts.fixationCount > 0 && counts.persistenceChallengeCount > 0
}
