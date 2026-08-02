import { describe, expect, it } from 'vitest'
import { FIXED_NOW, makeScenario } from './testFixtures'
import { buildUniversalLearningObject } from './buildUniversalLearningObject'

describe('buildUniversalLearningObject', () => {
  it('embeds the real document, chunks, graph, and analysis by composition', async () => {
    const { document, chunks, graph, analysis } = await makeScenario()
    const ulo = buildUniversalLearningObject(document, chunks, graph, analysis, { now: FIXED_NOW })

    expect(ulo.knowledge.document).toBe(document)
    expect(ulo.knowledge.chunks).toBe(chunks)
    expect(ulo.knowledge.graph).toBe(graph)
    expect(ulo.analysis).toBe(analysis)
  })

  it('computes real provenance matching the real inputs', async () => {
    const { document, chunks, graph, analysis } = await makeScenario()
    const ulo = buildUniversalLearningObject(document, chunks, graph, analysis, { now: FIXED_NOW })

    expect(ulo.knowledge.references.documentId).toBe(document.id)
    expect(ulo.knowledge.references.graphId).toBe(graph.id)
    expect(ulo.knowledge.references.analysisId).toBe(analysis.id)
    expect(ulo.knowledge.references.chunkIds).toEqual(chunks.map((chunk) => chunk.id))
  })

  it('computes a real estimatedTotalLearningTimeSeconds matching the sum of chunk analyses', async () => {
    const { document, chunks, graph, analysis } = await makeScenario()
    const ulo = buildUniversalLearningObject(document, chunks, graph, analysis, { now: FIXED_NOW })
    const expectedTotal = analysis.chunkAnalyses.reduce((sum, chunk) => sum + chunk.estimatedLearningTimeSeconds, 0)
    expect(ulo.learning.estimatedTotalLearningTimeSeconds).toBe(expectedTotal)
  })

  it('computes a real averageCognitiveLoad within [0, 1]', async () => {
    const { document, chunks, graph, analysis } = await makeScenario()
    const ulo = buildUniversalLearningObject(document, chunks, graph, analysis, { now: FIXED_NOW })
    expect(ulo.learning.averageCognitiveLoad).toBeGreaterThanOrEqual(0)
    expect(ulo.learning.averageCognitiveLoad).toBeLessThanOrEqual(1)
  })

  it('assigns version 1.0.0 revision 1 to a freshly built ULO', async () => {
    const { document, chunks, graph, analysis } = await makeScenario()
    const ulo = buildUniversalLearningObject(document, chunks, graph, analysis, { now: FIXED_NOW })
    expect(ulo.version).toEqual({ schemaVersion: '1.0.0', revision: 1 })
  })

  it('stamps real, matching createdAt/lastModifiedAt/audit timestamps from the injected clock', async () => {
    const { document, chunks, graph, analysis } = await makeScenario()
    const ulo = buildUniversalLearningObject(document, chunks, graph, analysis, { now: FIXED_NOW })
    expect(ulo.createdAt).toBe('2026-01-01T00:00:00.000Z')
    expect(ulo.lastModifiedAt).toBe('2026-01-01T00:00:00.000Z')
    expect(ulo.audit).toEqual({
      createdAt: '2026-01-01T00:00:00.000Z',
      createdBy: 'system',
      lastModifiedAt: '2026-01-01T00:00:00.000Z',
      lastModifiedBy: 'system',
      history: [],
    })
  })

  it('produces real, non-empty blueprints', async () => {
    const { document, chunks, graph, analysis } = await makeScenario()
    const ulo = buildUniversalLearningObject(document, chunks, graph, analysis, { now: FIXED_NOW })
    expect(ulo.learning.revisionBlueprint.entries.length).toBe(analysis.conceptAnalyses.length)
    expect(ulo.learning.memoryBlueprint.entries.length).toBe(analysis.chunkAnalyses.length)
    expect(ulo.learning.practiceBlueprint.entries.length).toBe(analysis.conceptAnalyses.length)
    expect(ulo.experience.attentionBlueprint.entries.length).toBe(analysis.chunkAnalyses.length)
  })

  it('is deterministic for the same inputs', async () => {
    const { document, chunks, graph, analysis } = await makeScenario()
    const first = buildUniversalLearningObject(document, chunks, graph, analysis, { now: FIXED_NOW, idFactory: () => 'fixed-id' })
    const second = buildUniversalLearningObject(document, chunks, graph, analysis, { now: FIXED_NOW, idFactory: () => 'fixed-id' })
    expect(first).toEqual(second)
  })
})
