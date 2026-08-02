import { describe, expect, it } from 'vitest'
import { makeChunk, makeDocument, makeScenario } from '@/core/universal-learning-engine/universal-learning-object/testFixtures'
import { buildUniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import { buildLearningKnowledgeGraph } from '@/core/universal-learning-engine/knowledge-graph'
import { buildLearningAnalysis } from '@/core/universal-learning-engine/learning-analysis'
import { generateFlashCards } from './generateFlashCards'

describe('generateFlashCards', () => {
  it('produces one real review card per real chunk, front from the real heading, back from the real content', async () => {
    const { chunks, document, graph, analysis } = await makeScenario()
    const ulo = buildUniversalLearningObject(document, chunks, graph, analysis)

    const deck = generateFlashCards(ulo)

    expect(deck.documentId).toBe(ulo.documentId)
    expect(deck.cards).toHaveLength(chunks.length)
    expect(deck.cards[0]?.front).toBe(chunks[0]?.location.sectionHeading)
    expect(deck.cards[0]?.back).toBe(chunks[0]?.content)
    expect(deck.cards[0]?.isExcerpt).toBe(false)
  })

  it('excerpts real content over 600 characters at a real word boundary, disclosed via isExcerpt', async () => {
    const document = makeDocument()
    const longContent = `${'real word '.repeat(120)}tail.`
    const chunk = makeChunk('chunk-1', 0, longContent)
    const graph = await buildLearningKnowledgeGraph([chunk], document)
    const analysis = await buildLearningAnalysis([chunk], document, graph)
    const ulo = buildUniversalLearningObject(document, [chunk], graph, analysis)

    const deck = generateFlashCards(ulo)
    const card = deck.cards[0]

    expect(card?.isExcerpt).toBe(true)
    expect(card?.back.length).toBeLessThan(longContent.length)
    expect(card?.back.endsWith('…')).toBe(true)
    expect(card?.back.endsWith(' …')).toBe(false)
  })

  it("orders cards by each real chunk's real location.order, regardless of input array order", async () => {
    const document = makeDocument()
    const chunkA = makeChunk('chunk-a', 1, 'Second real section content.')
    const chunkB = makeChunk('chunk-b', 0, 'First real section content.')
    const graph = await buildLearningKnowledgeGraph([chunkA, chunkB], document)
    const analysis = await buildLearningAnalysis([chunkA, chunkB], document, graph)
    const ulo = buildUniversalLearningObject(document, [chunkA, chunkB], graph, analysis)

    const deck = generateFlashCards(ulo)

    expect(deck.cards.map((card) => card.id)).toEqual(['chunk-b', 'chunk-a'])
  })

  it('produces one real term/definition flashcard per real AI-extracted definition, ALS-24', async () => {
    const document = makeDocument()
    const chunk = makeChunk('chunk-1', 0, 'Photosynthesis is how plants make energy from light.', {
      definitions: [
        { term: 'Photosynthesis', definition: 'The process plants use to convert light into chemical energy.' },
        { term: 'Chlorophyll', definition: 'The pigment that absorbs light for photosynthesis.' },
      ],
    })
    const graph = await buildLearningKnowledgeGraph([chunk], document)
    const analysis = await buildLearningAnalysis([chunk], document, graph)
    const ulo = buildUniversalLearningObject(document, [chunk], graph, analysis)

    const deck = generateFlashCards(ulo)

    expect(deck.cards).toHaveLength(2)
    expect(deck.cards[0]).toEqual({ id: 'chunk-1-definition-0', front: 'Photosynthesis', back: 'The process plants use to convert light into chemical energy.', isExcerpt: false, order: 0 })
    expect(deck.cards[1]?.front).toBe('Chlorophyll')
  })

  it('keeps the exact existing structural card for a chunk with no real definitions, ALS-24', async () => {
    const { chunks, document, graph, analysis } = await makeScenario()
    const ulo = buildUniversalLearningObject(document, chunks, graph, analysis)

    const deck = generateFlashCards(ulo)

    expect(deck.cards).toHaveLength(chunks.length)
    expect(deck.cards[0]?.front).toBe(chunks[0]?.location.sectionHeading)
  })
})
