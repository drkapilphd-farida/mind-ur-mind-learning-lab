import { describe, expect, it } from 'vitest'
import { generateConceptSequence } from './generateConceptSequence'
import { makeConceptGraph } from '../testFixtures'

describe('generateConceptSequence', () => {
  it('includes every concept exactly once', () => {
    const graph = makeConceptGraph()
    const sequence = generateConceptSequence(graph)
    expect([...sequence.orderedConceptIds].sort()).toEqual(graph.concepts.map((c) => c.id).sort())
    expect(new Set(sequence.orderedConceptIds).size).toBe(graph.concepts.length)
  })

  it('starts from the first concept', () => {
    const graph = makeConceptGraph()
    const sequence = generateConceptSequence(graph)
    expect(sequence.orderedConceptIds[0]).toBe('concept-0')
  })

  it('appends a disconnected concept rather than dropping it', () => {
    const graph = makeConceptGraph({
      concepts: [
        { id: 'concept-0', title: 'A', description: 'a', relatedConceptIds: [] },
        { id: 'concept-1', title: 'B (isolated)', description: 'b', relatedConceptIds: [] },
      ],
      edges: [],
    })
    const sequence = generateConceptSequence(graph)
    expect(sequence.orderedConceptIds).toEqual(['concept-0', 'concept-1'])
  })

  it('returns an empty sequence for an empty graph', () => {
    const graph = makeConceptGraph({ concepts: [], edges: [] })
    expect(generateConceptSequence(graph).orderedConceptIds).toEqual([])
  })

  it('is deterministic', () => {
    const graph = makeConceptGraph()
    expect(generateConceptSequence(graph)).toEqual(generateConceptSequence(graph))
  })
})
