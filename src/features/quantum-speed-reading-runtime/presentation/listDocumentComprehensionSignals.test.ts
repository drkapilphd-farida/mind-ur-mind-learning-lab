import { describe, expect, it } from 'vitest'
import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import { listDocumentComprehensionSignals } from './listDocumentComprehensionSignals'

function makeUlo(chunks: readonly { id: string; order: number; enrichment: Record<string, unknown> }[]): UniversalLearningObject {
  return {
    knowledge: {
      chunks: chunks.map((chunk) => ({ id: chunk.id, location: { order: chunk.order }, enrichment: chunk.enrichment })),
    },
  } as unknown as UniversalLearningObject
}

describe('listDocumentComprehensionSignals', () => {
  it('pools every real enrichment field across every chunk, in real document order', () => {
    const ulo = makeUlo([
      { id: 'chunk-2', order: 1, enrichment: { semantic: 'Second real summary.', concepts: ['B'] } },
      { id: 'chunk-1', order: 0, enrichment: { semantic: 'First real summary.', concepts: ['A'], entities: ['Entity A'], misconceptions: ['Misconception A'] } },
    ])

    const signals = listDocumentComprehensionSignals(ulo)

    expect(signals[0]).toEqual({ chunkNodeId: 'chunk-1', kind: 'main-idea', value: 'First real summary.' })
    expect(signals).toContainEqual({ chunkNodeId: 'chunk-1', kind: 'concept', value: 'A' })
    expect(signals).toContainEqual({ chunkNodeId: 'chunk-1', kind: 'entity', value: 'Entity A' })
    expect(signals).toContainEqual({ chunkNodeId: 'chunk-1', kind: 'misconception', value: 'Misconception A' })
    expect(signals).toContainEqual({ chunkNodeId: 'chunk-2', kind: 'main-idea', value: 'Second real summary.' })
  })

  it('omits a signal kind for a chunk with no real value for it, rather than fabricating one', () => {
    const ulo = makeUlo([{ id: 'chunk-1', order: 0, enrichment: {} }])
    expect(listDocumentComprehensionSignals(ulo)).toEqual([])
  })
})
