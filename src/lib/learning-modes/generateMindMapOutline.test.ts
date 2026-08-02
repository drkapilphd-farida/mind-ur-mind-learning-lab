import { describe, expect, it } from 'vitest'
import { makeChunk, makeDocument, makeScenario } from '@/core/universal-learning-engine/universal-learning-object/testFixtures'
import { buildUniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import { buildLearningKnowledgeGraph } from '@/core/universal-learning-engine/knowledge-graph'
import { buildLearningAnalysis } from '@/core/universal-learning-engine/learning-analysis'
import { generateMindMapOutline } from './generateMindMapOutline'

describe('generateMindMapOutline', () => {
  it('produces one real outline node per real chunk, in real document order', async () => {
    const { chunks, document, graph, analysis } = await makeScenario()
    const ulo = buildUniversalLearningObject(document, chunks, graph, analysis)

    const outline = generateMindMapOutline(ulo)

    expect(outline.documentId).toBe(ulo.documentId)
    expect(outline.documentTitle).toBe(document.title)
    expect(outline.nodes).toHaveLength(chunks.length)
  })

  it("orders nodes by each real chunk's real location.order, regardless of input array order", async () => {
    const document = makeDocument()
    const chunkA = makeChunk('chunk-a', 1, 'Second real section content.')
    const chunkB = makeChunk('chunk-b', 0, 'First real section content.')
    const graph = await buildLearningKnowledgeGraph([chunkA, chunkB], document)
    const analysis = await buildLearningAnalysis([chunkA, chunkB], document, graph)
    const ulo = buildUniversalLearningObject(document, [chunkA, chunkB], graph, analysis)

    const outline = generateMindMapOutline(ulo)

    expect(outline.nodes.map((node) => node.id)).toEqual(['chunk-b', 'chunk-a'])
  })

  it('falls back to a real positional label when a chunk has no real heading', async () => {
    const document = makeDocument()
    const chunk = makeChunk('chunk-1', 0, 'Real content with no heading.', {}, {
      metadata: { title: null, documentTitle: document.title, contentType: 'text' },
      location: { order: 0, sectionId: 'section-0', sectionHeading: null, totalChunksInDocument: 1 },
    })
    const graph = await buildLearningKnowledgeGraph([chunk], document)
    const analysis = await buildLearningAnalysis([chunk], document, graph)
    const ulo = buildUniversalLearningObject(document, [chunk], graph, analysis)

    const outline = generateMindMapOutline(ulo)

    expect(outline.nodes[0]?.title).toBe('Section 1')
  })

  it('surfaces real AI-extracted concepts from the knowledge graph, with their real related chunk headings, ALS-24', async () => {
    const { chunks, document, graph, analysis } = await makeScenario()
    const ulo = buildUniversalLearningObject(document, chunks, graph, analysis)

    const outline = generateMindMapOutline(ulo)

    expect(outline.concepts.length).toBeGreaterThan(0)
    const algebra = outline.concepts.find((concept) => concept.label === 'algebra')
    expect(algebra?.occurrenceCount).toBeGreaterThan(0)
    expect(algebra?.relatedChunkTitles).toContain('Heading 0')
  })

  it('has an empty, honest concepts list when no chunk has any real enrichment yet', async () => {
    const document = makeDocument()
    const chunk = makeChunk('chunk-1', 0, 'Unenriched real content.')
    const graph = await buildLearningKnowledgeGraph([chunk], document)
    const analysis = await buildLearningAnalysis([chunk], document, graph)
    const ulo = buildUniversalLearningObject(document, [chunk], graph, analysis)

    const outline = generateMindMapOutline(ulo)

    expect(outline.concepts).toEqual([])
  })
})
