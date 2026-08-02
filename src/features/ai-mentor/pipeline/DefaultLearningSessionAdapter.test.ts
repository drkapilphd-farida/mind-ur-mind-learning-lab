import { describe, expect, it } from 'vitest'
import { DefaultLearningSessionAdapter } from './DefaultLearningSessionAdapter'
import { makeLearningPlan } from '../testFixtures'

describe('DefaultLearningSessionAdapter', () => {
  it('derives conceptsEncountered from the plan’s real concept titles', () => {
    const adapter = new DefaultLearningSessionAdapter()
    const snapshot = adapter.adapt({ learningProjectId: 'project-1', plan: makeLearningPlan() })
    expect(snapshot.conceptsEncountered).toEqual(['Introduction', 'Core Content'])
  })

  it('derives studyModesUsed from the plan’s real availableStudyModes', () => {
    const adapter = new DefaultLearningSessionAdapter()
    const snapshot = adapter.adapt({ learningProjectId: 'project-1', plan: makeLearningPlan({ availableStudyModes: ['concept', 'quiz-question'] }) })
    expect(snapshot.studyModesUsed).toEqual(['concept', 'quiz-question'])
  })

  it('defaults sessionCount to 0 when not supplied — no real session tracking exists yet', () => {
    const adapter = new DefaultLearningSessionAdapter()
    const snapshot = adapter.adapt({ learningProjectId: 'project-1', plan: makeLearningPlan() })
    expect(snapshot.sessionCount).toBe(0)
  })

  it('passes through a real supplied sessionCount', () => {
    const adapter = new DefaultLearningSessionAdapter()
    const snapshot = adapter.adapt({ learningProjectId: 'project-1', plan: makeLearningPlan(), sessionCount: 5 })
    expect(snapshot.sessionCount).toBe(5)
  })

  it('scopes the snapshot to the given learningProjectId, not the plan’s documentId', () => {
    const adapter = new DefaultLearningSessionAdapter()
    const snapshot = adapter.adapt({ learningProjectId: 'project-xyz', plan: makeLearningPlan({ documentId: 'document-abc' }) })
    expect(snapshot.learningProjectId).toBe('project-xyz')
  })
})
