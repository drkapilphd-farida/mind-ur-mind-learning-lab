import { describe, expect, it } from 'vitest'
import { createLearningGoalAnalyzer } from './DefaultLearningGoalAnalyzer'

describe('DefaultLearningGoalAnalyzer', () => {
  const analyzer = createLearningGoalAnalyzer()

  it('classifies a reading-related goal', () => {
    expect(analyzer.analyze('I want to read faster').focusSkill).toBe('reading')
  })

  it('classifies a memory-related goal', () => {
    expect(analyzer.analyze('Help me remember more').focusSkill).toBe('memory')
  })

  it('classifies a focus-related goal', () => {
    expect(analyzer.analyze('I get distracted, want to improve my focus').focusSkill).toBe('focus')
  })

  it('classifies an unrecognized goal as general', () => {
    expect(analyzer.analyze('I want to learn Spanish').focusSkill).toBe('general')
  })

  it('is case-insensitive', () => {
    expect(analyzer.analyze('READ FASTER').focusSkill).toBe('reading')
  })

  it('preserves the original raw goal text', () => {
    expect(analyzer.analyze('Improve my memory').rawGoal).toBe('Improve my memory')
  })
})
