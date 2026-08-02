// Visual Intelligence Lab™ — Visual DNA™, Sprint 8.
// Mind Passport™ Integration — assembles the exact 7 fields the brief asks
// to be "automatically saved" from already-computed Visual DNA results.
// Pure builder; persistence itself lives in actions/saveMindPassportSnapshot.ts.

import type { DnaLevelName, MindPassportSnapshot, VisualIdentity } from './dnaTypes'

export function buildMindPassportSnapshot(input: {
  visualDnaLevel: DnaLevelName
  visualIntelligenceScore: number
  identity: VisualIdentity
  growthPercent: number | null
  achievementCount: number
  latestAiSummary: string
}): MindPassportSnapshot {
  return {
    visualDnaLevel: input.visualDnaLevel,
    visualIntelligenceScore: input.visualIntelligenceScore,
    // Primary Trait — the most prominent identity label. Observation Style
    // is listed first among the 4 AI Visual Identity categories, so it's
    // used as the passport's headline trait.
    primaryTrait: input.identity.observationStyle,
    observationStyle: input.identity.observationStyle,
    growthPercent: input.growthPercent,
    achievementCount: input.achievementCount,
    latestAiSummary: input.latestAiSummary,
  }
}
