import { describe, expect, it } from 'vitest'
import { deriveLearningIdentity, derivePersonalOutcomeMessage, derivePersonalizedFinalLine } from './learningPotentialCopy'
import type { FocusProfileRecord } from '@/features/focus-discovery/focusProfileHandoff'

function sampleFocusProfile(overrides: Partial<FocusProfileRecord> = {}): FocusProfileRecord {
  return {
    profileName: 'Selective Observer',
    heroMetricLabel: 'Attention Stability™',
    heroMetricPercent: 88,
    focusEfficiencyPercent: 91,
    strongestSkillLabel: 'Selective Attention',
    growthOpportunityLine: 'Visual clutter slightly affects your search speed.',
    reactionPrecisionPercent: 90,
    visualSearchAccuracyPercent: 85,
    ruleAdaptationPercent: 92,
    timestamp: Date.now(),
    ...overrides,
  }
}

describe('deriveLearningIdentity', () => {
  it('uses the real Focus Discovery profile name when one exists', () => {
    expect(deriveLearningIdentity(sampleFocusProfile())).toBe('Selective Observer')
  })

  it('falls back to an honest generic identity when no real profile exists', () => {
    expect(deriveLearningIdentity(null)).toBe('Adaptive Learner')
  })
})

describe('derivePersonalOutcomeMessage', () => {
  it('maps each real strongest Focus skill to its own distinct outcome message', () => {
    expect(derivePersonalOutcomeMessage(false, sampleFocusProfile({ strongestSkillLabel: 'Selective Attention' }))).toBe('Learn With Less Stress.')
    expect(derivePersonalOutcomeMessage(false, sampleFocusProfile({ strongestSkillLabel: 'Visual Search' }))).toBe('Study With More Confidence.')
    expect(derivePersonalOutcomeMessage(false, sampleFocusProfile({ strongestSkillLabel: 'Reaction Speed' }))).toBe('Learn Faster.')
    expect(derivePersonalOutcomeMessage(false, sampleFocusProfile({ strongestSkillLabel: 'Sustained Attention' }))).toBe('Stay Focused Longer.')
    expect(derivePersonalOutcomeMessage(false, sampleFocusProfile({ strongestSkillLabel: 'Rule Switching' }))).toBe('Master Complex Topics.')
  })

  it('prefers the real focus profile over a real reading speed signal when both exist', () => {
    expect(derivePersonalOutcomeMessage(true, sampleFocusProfile({ strongestSkillLabel: 'Rule Switching' }))).toBe('Master Complex Topics.')
  })

  it('falls back to a reading-speed-framed message when only real reading speed exists', () => {
    expect(derivePersonalOutcomeMessage(true, null)).toBe('Learn Faster.')
  })

  it('falls back to an honest generic message when no real signal exists', () => {
    expect(derivePersonalOutcomeMessage(false, null)).toBe('Learn With Less Stress.')
  })
})

describe('derivePersonalizedFinalLine', () => {
  it('shows the real Parent-framed line for a real "child" learner type', () => {
    expect(derivePersonalizedFinalLine('child')).toBe('Help Your Child Learn Better.')
  })

  it('shows the shared growth-framed line for "myself" (no real Student/Professional split exists)', () => {
    expect(derivePersonalizedFinalLine('myself')).toBe('Learn Faster. Grow Faster.')
  })

  it('shows the same honest fallback line when the real learner type is unknown', () => {
    expect(derivePersonalizedFinalLine(null)).toBe('Learn Faster. Grow Faster.')
  })
})
