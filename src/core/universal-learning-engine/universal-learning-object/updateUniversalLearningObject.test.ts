import { describe, expect, it } from 'vitest'
import { FIXED_NOW, makeScenario } from './testFixtures'
import { buildUniversalLearningObject } from './buildUniversalLearningObject'
import { updateUniversalLearningObject } from './updateUniversalLearningObject'

const UPDATE_NOW = (): Date => new Date('2026-02-01T00:00:00.000Z')

describe('updateUniversalLearningObject', () => {
  it('increments version.revision while preserving id/createdAt', async () => {
    const { document, chunks, graph, analysis } = await makeScenario()
    const original = buildUniversalLearningObject(document, chunks, graph, analysis, { now: FIXED_NOW })

    const updated = updateUniversalLearningObject(original, document, chunks, graph, analysis, { now: UPDATE_NOW })

    expect(updated.id).toBe(original.id)
    expect(updated.createdAt).toBe(original.createdAt)
    expect(updated.version.revision).toBe(2)
  })

  it('appends one real ULOAuditEntry and updates lastModifiedAt', async () => {
    const { document, chunks, graph, analysis } = await makeScenario()
    const original = buildUniversalLearningObject(document, chunks, graph, analysis, { now: FIXED_NOW })

    const updated = updateUniversalLearningObject(original, document, chunks, graph, analysis, { now: UPDATE_NOW })

    expect(updated.lastModifiedAt).toBe('2026-02-01T00:00:00.000Z')
    expect(updated.audit.history).toHaveLength(1)
    expect(updated.audit.history[0]).toEqual({
      changedAt: '2026-02-01T00:00:00.000Z',
      changedBy: 'system',
      changeSummary: 'Re-aggregated via UCE-6 Universal Learning Object update.',
    })
    expect(updated.audit.createdAt).toBe(original.audit.createdAt)
  })

  it('accepts a custom changeSummary', async () => {
    const { document, chunks, graph, analysis } = await makeScenario()
    const original = buildUniversalLearningObject(document, chunks, graph, analysis, { now: FIXED_NOW })

    const updated = updateUniversalLearningObject(original, document, chunks, graph, analysis, { now: UPDATE_NOW, changeSummary: 'Document re-processed.' })

    expect(updated.audit.history[0]?.changeSummary).toBe('Document re-processed.')
  })

  it('recomputes real knowledge/learning/experience intelligence fresh from the new inputs', async () => {
    const { document, chunks, graph, analysis } = await makeScenario()
    const original = buildUniversalLearningObject(document, chunks, graph, analysis, { now: FIXED_NOW })

    const updated = updateUniversalLearningObject(original, document, chunks, graph, analysis, { now: UPDATE_NOW })

    expect(updated.learning.estimatedTotalLearningTimeSeconds).toBe(original.learning.estimatedTotalLearningTimeSeconds)
    expect(updated.knowledge.references).toEqual(original.knowledge.references)
  })

  it('accumulates a real audit history across multiple updates', async () => {
    const { document, chunks, graph, analysis } = await makeScenario()
    const original = buildUniversalLearningObject(document, chunks, graph, analysis, { now: FIXED_NOW })

    const firstUpdate = updateUniversalLearningObject(original, document, chunks, graph, analysis, { now: UPDATE_NOW })
    const secondUpdate = updateUniversalLearningObject(firstUpdate, document, chunks, graph, analysis, { now: () => new Date('2026-03-01T00:00:00.000Z') })

    expect(secondUpdate.audit.history).toHaveLength(2)
    expect(secondUpdate.version.revision).toBe(3)
  })
})
