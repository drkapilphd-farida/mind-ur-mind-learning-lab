import { describe, expect, it } from 'vitest'
import { makeScenario } from '../testFixtures'
import { computeULOParts } from './computeULOParts'

describe('computeULOParts', () => {
  it('is deterministic for the same inputs', async () => {
    const { document, chunks, graph, analysis } = await makeScenario()
    expect(computeULOParts(document, chunks, graph, analysis)).toEqual(computeULOParts(document, chunks, graph, analysis))
  })

  it('produces real, non-empty references/learning/experience parts', async () => {
    const { document, chunks, graph, analysis } = await makeScenario()
    const parts = computeULOParts(document, chunks, graph, analysis)

    expect(parts.references.documentId).toBe(document.id)
    expect(parts.learning.revisionBlueprint.entries.length).toBe(analysis.conceptAnalyses.length)
    expect(parts.experience.attentionBlueprint.entries.length).toBe(analysis.chunkAnalyses.length)
  })
})
