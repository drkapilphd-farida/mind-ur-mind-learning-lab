import { describe, expect, it } from 'vitest'
import { createLearningMilestoneGenerator } from './DefaultLearningMilestoneGenerator'
import { makeAnalyzedGoal } from '../testFixtures'

describe('DefaultLearningMilestoneGenerator', () => {
  const generator = createLearningMilestoneGenerator()

  it('includes every checkpoint ahead of current progress', () => {
    const milestones = generator.generate(10, makeAnalyzedGoal({ focusSkill: 'general' }))
    expect(milestones.map((milestone) => milestone.targetProgressPercent)).toEqual([25, 50, 75, 100])
  })

  it('never includes a checkpoint at or behind current progress', () => {
    const milestones = generator.generate(60, makeAnalyzedGoal({ focusSkill: 'general' }))
    expect(milestones.every((milestone) => milestone.targetProgressPercent > 60)).toBe(true)
    expect(milestones.map((milestone) => milestone.targetProgressPercent)).toEqual([75, 100])
  })

  it('returns no progress checkpoints once already at 100%', () => {
    const milestones = generator.generate(100, makeAnalyzedGoal({ focusSkill: 'general' }))
    expect(milestones.filter((milestone) => milestone.id.startsWith('journey-progress'))).toHaveLength(0)
  })

  it('adds a goal-focused milestone when the goal targets a real skill', () => {
    const milestones = generator.generate(10, makeAnalyzedGoal({ focusSkill: 'reading', rawGoal: 'read faster' }))
    expect(milestones.some((milestone) => milestone.id === 'skill-focus-reading')).toBe(true)
  })

  it('adds no goal-focused milestone for a general goal', () => {
    const milestones = generator.generate(10, makeAnalyzedGoal({ focusSkill: 'general' }))
    expect(milestones.some((milestone) => milestone.id.startsWith('skill-focus'))).toBe(false)
  })
})
