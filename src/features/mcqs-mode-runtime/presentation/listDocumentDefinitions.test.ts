import { describe, expect, it } from 'vitest'
import { makeChunk, makeDocument } from '@/core/universal-learning-engine/universal-learning-object/testFixtures'
import { buildUniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import { buildLearningKnowledgeGraph } from '@/core/universal-learning-engine/knowledge-graph'
import { buildLearningAnalysis } from '@/core/universal-learning-engine/learning-analysis'
import { listDocumentDefinitions } from './listDocumentDefinitions'

describe('listDocumentDefinitions', () => {
  it('lists one real definition per real AI-extracted {term, definition} pair, ordered by real location.order', async () => {
    const document = makeDocument()
    const chunkA = makeChunk('chunk-a', 1, 'Second real section content.', { definitions: [{ term: 'Chlorophyll', definition: 'The pigment that absorbs light.' }] })
    const chunkB = makeChunk('chunk-b', 0, 'First real section content.', { definitions: [{ term: 'Photosynthesis', definition: 'The process plants use to convert light into energy.' }] })
    const graph = await buildLearningKnowledgeGraph([chunkA, chunkB], document)
    const analysis = await buildLearningAnalysis([chunkA, chunkB], document, graph)
    const ulo = buildUniversalLearningObject(document, [chunkA, chunkB], graph, analysis)

    const definitions = listDocumentDefinitions(ulo)

    expect(definitions).toEqual([
      { chunkNodeId: 'chunk-b', term: 'Photosynthesis', definition: 'The process plants use to convert light into energy.' },
      { chunkNodeId: 'chunk-a', term: 'Chlorophyll', definition: 'The pigment that absorbs light.' },
    ])
  })

  it('includes every real definition when a chunk has more than one', async () => {
    const document = makeDocument()
    const chunk = makeChunk('chunk-1', 0, 'Real content.', {
      definitions: [
        { term: 'Photosynthesis', definition: 'Definition A.' },
        { term: 'Chlorophyll', definition: 'Definition B.' },
      ],
    })
    const graph = await buildLearningKnowledgeGraph([chunk], document)
    const analysis = await buildLearningAnalysis([chunk], document, graph)
    const ulo = buildUniversalLearningObject(document, [chunk], graph, analysis)

    expect(listDocumentDefinitions(ulo)).toHaveLength(2)
  })

  it('is an honest empty list when no chunk has any real definitions yet', async () => {
    const document = makeDocument()
    const chunk = makeChunk('chunk-1', 0, 'Unenriched real content.')
    const graph = await buildLearningKnowledgeGraph([chunk], document)
    const analysis = await buildLearningAnalysis([chunk], document, graph)
    const ulo = buildUniversalLearningObject(document, [chunk], graph, analysis)

    expect(listDocumentDefinitions(ulo)).toEqual([])
  })
})
