import { describe, expect, it } from 'vitest'
import { makeChunk, makeDocument } from '@/core/universal-learning-engine/universal-learning-object/testFixtures'
import { buildUniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import { buildLearningKnowledgeGraph } from '@/core/universal-learning-engine/knowledge-graph'
import { buildLearningAnalysis } from '@/core/universal-learning-engine/learning-analysis'
import { listDocumentSectionHeadings } from './listDocumentSectionHeadings'

describe('listDocumentSectionHeadings', () => {
  it('lists one real heading per real chunk, ordered by real location.order regardless of input array order', async () => {
    const document = makeDocument()
    const chunkA = makeChunk('chunk-a', 1, 'Second real section content.')
    const chunkB = makeChunk('chunk-b', 0, 'First real section content.')
    const graph = await buildLearningKnowledgeGraph([chunkA, chunkB], document)
    const analysis = await buildLearningAnalysis([chunkA, chunkB], document, graph)
    const ulo = buildUniversalLearningObject(document, [chunkA, chunkB], graph, analysis)

    const headings = listDocumentSectionHeadings(ulo)

    expect(headings.map((heading) => heading.chunkNodeId)).toEqual(['chunk-b', 'chunk-a'])
    expect(headings[0]?.heading).toBe(chunkB.location.sectionHeading)
    expect(headings[0]?.order).toBe(0)
  })
})
