import { describe, expect, it } from 'vitest'
import { makeScenario } from '../testFixtures'
import { computeProvenance } from './computeProvenance'

describe('computeProvenance', () => {
  it('records the real document, source, chunk, graph, and analysis ids', async () => {
    const { chunks, document, graph, analysis } = await makeScenario()
    const provenance = computeProvenance(document, chunks, graph, analysis)

    expect(provenance.documentId).toBe(document.id)
    expect(provenance.sourceId).toBe(document.source.id)
    expect(provenance.chunkIds).toEqual(chunks.map((chunk) => chunk.id))
    expect(provenance.graphId).toBe(graph.id)
    expect(provenance.analysisId).toBe(analysis.id)
  })

  it('returns an empty chunkIds array for a document with no chunks', async () => {
    const { document, graph, analysis } = await makeScenario()
    const provenance = computeProvenance(document, [], graph, analysis)
    expect(provenance.chunkIds).toEqual([])
  })
})
