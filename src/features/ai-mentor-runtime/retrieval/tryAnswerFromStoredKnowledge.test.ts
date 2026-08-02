import { describe, expect, it } from 'vitest'
import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import type { ChunkDefinition } from '@/core/universal-learning-engine/learning-chunk'
import { tryAnswerFromStoredKnowledge } from './tryAnswerFromStoredKnowledge'

function makeUlo(definitions: readonly ChunkDefinition[]): UniversalLearningObject {
  return {
    knowledge: {
      chunks: [{ enrichment: { definitions } }],
    },
  } as unknown as UniversalLearningObject
}

const PHOTOSYNTHESIS_DEFINITION: ChunkDefinition = { term: 'photosynthesis', definition: 'The process plants use to convert light into chemical energy.' }

describe('tryAnswerFromStoredKnowledge', () => {
  it('answers a real "what is X" question directly from a matching stored definition', () => {
    const ulo = makeUlo([PHOTOSYNTHESIS_DEFINITION])
    expect(tryAnswerFromStoredKnowledge(ulo, 'What is photosynthesis?')).toBe('photosynthesis: The process plants use to convert light into chemical energy.')
  })

  it('answers "define X" and "what does X mean" the same way, case-insensitively', () => {
    const ulo = makeUlo([PHOTOSYNTHESIS_DEFINITION])
    expect(tryAnswerFromStoredKnowledge(ulo, 'define Photosynthesis')).toContain('The process plants use')
    expect(tryAnswerFromStoredKnowledge(ulo, 'what does PHOTOSYNTHESIS mean?')).toContain('The process plants use')
  })

  it('returns null for a real conversational question with no definition-style pattern', () => {
    const ulo = makeUlo([PHOTOSYNTHESIS_DEFINITION])
    expect(tryAnswerFromStoredKnowledge(ulo, 'How am I doing with my reading practice this week?')).toBeNull()
  })

  it('returns null, honestly, when no stored definition matches the asked term', () => {
    const ulo = makeUlo([PHOTOSYNTHESIS_DEFINITION])
    expect(tryAnswerFromStoredKnowledge(ulo, 'what is mitochondria')).toBeNull()
  })

  it('returns null when the document has no real definitions enriched at all', () => {
    const ulo = makeUlo([])
    expect(tryAnswerFromStoredKnowledge(ulo, 'what is photosynthesis')).toBeNull()
  })
})
