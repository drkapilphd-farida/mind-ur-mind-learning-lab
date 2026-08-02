import { describe, expect, it } from 'vitest'
import { makeScenario } from '../testFixtures'
import { createUniversalLearningObjectCache } from './createUniversalLearningObjectCache'
import { buildUniversalLearningObject } from '../buildUniversalLearningObject'

describe('createUniversalLearningObjectCache', () => {
  it('misses on an unknown documentId', () => {
    const cache = createUniversalLearningObjectCache()
    expect(cache.get('unknown-doc')).toBeUndefined()
  })

  it('returns a previously set ULO for the same documentId', async () => {
    const { document, chunks, graph, analysis } = await makeScenario()
    const ulo = buildUniversalLearningObject(document, chunks, graph, analysis)
    const cache = createUniversalLearningObjectCache()

    cache.set(document.id, ulo)
    expect(cache.get(document.id)).toBe(ulo)
  })

  it('keeps entries for different documentIds independent', async () => {
    const { document, chunks, graph, analysis } = await makeScenario()
    const ulo = buildUniversalLearningObject(document, chunks, graph, analysis)
    const cache = createUniversalLearningObjectCache()

    cache.set('doc-1', ulo)
    expect(cache.get('doc-2')).toBeUndefined()
  })

  it('overwrites a previous entry for the same documentId', async () => {
    const { document, chunks, graph, analysis } = await makeScenario()
    const first = buildUniversalLearningObject(document, chunks, graph, analysis)
    const second = buildUniversalLearningObject(document, chunks, graph, analysis)
    const cache = createUniversalLearningObjectCache()

    cache.set(document.id, first)
    cache.set(document.id, second)
    expect(cache.get(document.id)).toBe(second)
  })
})
