import { describe, expect, it } from 'vitest'
import { getFocusProfile, recordFocusProfile } from './focusProfileHandoff'
import type { FocusIntelligenceReport } from './focusIntelligenceEngine'

const sampleReport: FocusIntelligenceReport = {
  profileName: 'Selective Observer',
  profileDescription: 'You naturally filter distractions well.',
  heroMetricLabel: 'Attention Stability™',
  heroMetricPercent: 88,
  focusEfficiencyPercent: 91,
  reactionPrecisionPercent: 90,
  visualSearchAccuracyPercent: 85,
  ruleAdaptationPercent: 92,
  strongestSkillLabel: 'Selective Attention',
  growthOpportunityLine: 'Visual clutter slightly affects your search speed.',
  personalInsight: 'You maintained attention well during visual search.',
  recommendation: 'Focus Mode is recommended.',
  learningPotentialMessage: 'Your attention foundation is strong.',
  missionsCompleted: 5,
  totalMissions: 5,
  journey: [],
}

// This module's real localStorage I/O only ever runs client-side
// (`typeof window === 'undefined'` guards every real branch) — the same
// SSR-safety shape `readingSpeedHandoff.ts` already established. Tests
// run in this project's real `node` environment (no `window`), so
// what's actually verifiable here is the honest, no-op-not-throw SSR
// fallback — real localStorage round-tripping is exercised by the real
// browser at runtime, not by this unit test.
describe('focusProfileHandoff', () => {
  it('is honest with no window (SSR): never throws, always falls back to null', () => {
    expect(() => recordFocusProfile(sampleReport)).not.toThrow()
    expect(getFocusProfile()).toBeNull()
  })
})
