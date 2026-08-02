import { describe, expect, it } from 'vitest'
import { MockConceptGraphBuilder } from './mockConceptGraphBuilder'
import { makeExtractedContent } from '../testFixtures'

describe('MockConceptGraphBuilder', () => {
  it('produces exactly one concept per extracted section', async () => {
    const builder = new MockConceptGraphBuilder()
    const content = makeExtractedContent()
    const graph = await builder.build(content)
    expect(graph.concepts).toHaveLength(content.sections.length)
  })

  it('derives each concept from its matching section', async () => {
    const builder = new MockConceptGraphBuilder()
    const content = makeExtractedContent()
    const graph = await builder.build(content)
    expect(graph.concepts[0]?.title).toBe(content.sections[0]?.title)
    expect(graph.concepts[0]?.description).toBe(content.sections[0]?.text)
  })

  it('links neighboring concepts bidirectionally', async () => {
    const builder = new MockConceptGraphBuilder()
    const graph = await builder.build(makeExtractedContent())
    expect(graph.edges).toContainEqual({ fromConceptId: 'concept-0', toConceptId: 'concept-1' })
    expect(graph.edges).toContainEqual({ fromConceptId: 'concept-1', toConceptId: 'concept-0' })
  })

  it('keeps relatedConceptIds in sync with the edges', async () => {
    const builder = new MockConceptGraphBuilder()
    const graph = await builder.build(makeExtractedContent())
    for (const concept of graph.concepts) {
      const expectedRelated = graph.edges.filter((edge) => edge.fromConceptId === concept.id).map((edge) => edge.toConceptId)
      expect(concept.relatedConceptIds).toEqual(expectedRelated)
    }
  })

  it('produces no edges for a single-section document, but still one concept', async () => {
    const builder = new MockConceptGraphBuilder()
    const content = makeExtractedContent({ sections: [{ id: 'section-0', title: 'Only Section', text: 'The only content.' }] })
    const graph = await builder.build(content)
    expect(graph.concepts).toHaveLength(1)
    expect(graph.edges).toHaveLength(0)
    expect(graph.concepts[0]?.relatedConceptIds).toEqual([])
  })

  it('scopes the graph to the extracted content’s documentId', async () => {
    const builder = new MockConceptGraphBuilder()
    const graph = await builder.build(makeExtractedContent({ documentId: 'doc-xyz' }))
    expect(graph.documentId).toBe('doc-xyz')
  })
})
