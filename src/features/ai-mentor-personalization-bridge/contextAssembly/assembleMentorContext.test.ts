import { describe, expect, it } from 'vitest'
import { assembleMentorContext } from './assembleMentorContext'
import { makeMentorContextAssemblyInputs } from '../testFixtures'

const NOW = '2026-06-01T00:00:00.000Z'

describe('assembleMentorContext', () => {
  it('assembles a snapshot carrying every reduced input field', () => {
    const inputs = makeMentorContextAssemblyInputs({
      currentJourney: 'journey-a',
      recommendations: { items: [{ category: 'exercise', referenceId: 'ex-1', priority: 'high' }] },
      learningState: { profileLifecycle: 'active', difficultyLevel: 'advanced', appliedAdaptationCount: 2 },
      memoryReferences: [{ memoryId: 'reading-0', summary: 'x' }],
    })

    const snapshot = assembleMentorContext(inputs, NOW, 'snapshot-1')

    expect(snapshot).toEqual({
      id: 'snapshot-1',
      version: 1,
      context: {
        currentJourney: 'journey-a',
        recommendations: { items: [{ category: 'exercise', referenceId: 'ex-1', priority: 'high' }] },
        learningState: { profileLifecycle: 'active', difficultyLevel: 'advanced', appliedAdaptationCount: 2 },
        memoryReferences: [{ memoryId: 'reading-0', summary: 'x' }],
      },
      metadata: { learnerId: inputs.learnerId, profileId: inputs.profileId, source: 'mentor-context-assembly', generatedAt: NOW },
    })
  })

  it('is deterministic — identical inputs produce an identical snapshot', () => {
    const inputs = makeMentorContextAssemblyInputs()
    expect(assembleMentorContext(inputs, NOW, 'snapshot-1')).toEqual(assembleMentorContext(inputs, NOW, 'snapshot-1'))
  })
})
