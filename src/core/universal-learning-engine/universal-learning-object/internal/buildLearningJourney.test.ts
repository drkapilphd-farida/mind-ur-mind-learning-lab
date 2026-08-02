import { describe, expect, it } from 'vitest'
import { makeScenario } from '../testFixtures'
import { buildLearningJourney } from './buildLearningJourney'

describe('buildLearningJourney', () => {
  it('produces one step per real learning milestone, in order', async () => {
    const { analysis, graph } = await makeScenario()
    const journey = buildLearningJourney(analysis, graph)
    expect(journey.steps).toHaveLength(analysis.learningMilestones.length)
    expect(journey.steps.map((step) => step.conceptNodeId)).toEqual(analysis.learningMilestones.map((milestone) => milestone.conceptNodeId))
  })

  it('reuses each milestone\'s real label verbatim', async () => {
    const { analysis, graph } = await makeScenario()
    const journey = buildLearningJourney(analysis, graph)
    for (const [index, step] of journey.steps.entries()) {
      expect(step.label).toBe(analysis.learningMilestones[index]?.label)
    }
  })

  it('computes totalEstimatedTimeSeconds as the real sum of every step', async () => {
    const { analysis, graph } = await makeScenario()
    const journey = buildLearningJourney(analysis, graph)
    const expectedTotal = journey.steps.reduce((sum, step) => sum + step.estimatedTimeSeconds, 0)
    expect(journey.totalEstimatedTimeSeconds).toBe(expectedTotal)
  })

  it('returns zero steps when there are no learning milestones', async () => {
    const { analysis, graph } = await makeScenario()
    const journey = buildLearningJourney({ ...analysis, learningMilestones: [] }, graph)
    expect(journey.steps).toEqual([])
    expect(journey.totalEstimatedTimeSeconds).toBe(0)
  })
})
