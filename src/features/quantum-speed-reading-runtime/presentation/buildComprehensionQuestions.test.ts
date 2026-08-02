import { describe, expect, it } from 'vitest'
import type { ModeChunkView } from '@/features/learning-mode-runtime'
import { buildComprehensionQuestions } from './buildComprehensionQuestions'
import type { DocumentComprehensionSignal } from './listDocumentComprehensionSignals'

function makeChunk(chunkNodeId: string): ModeChunkView {
  return { chunkNodeId, order: 0, content: 'Photosynthesis converts light into chemical energy.', title: null, sectionHeading: null, isCheckpoint: false }
}

const SIGNALS: readonly DocumentComprehensionSignal[] = [
  { chunkNodeId: 'chunk-1', kind: 'main-idea', value: 'Plants convert light into chemical energy through photosynthesis.' },
  { chunkNodeId: 'chunk-2', kind: 'main-idea', value: 'Mitochondria produce ATP through cellular respiration.' },
  { chunkNodeId: 'chunk-1', kind: 'concept', value: 'Photosynthesis' },
  { chunkNodeId: 'chunk-2', kind: 'concept', value: 'Cellular respiration' },
  { chunkNodeId: 'chunk-1', kind: 'entity', value: 'Chlorophyll' },
  { chunkNodeId: 'chunk-2', kind: 'entity', value: 'Mitochondria' },
]

describe('buildComprehensionQuestions', () => {
  it('builds a real question per available signal kind, with the current chunk\'s own real value as the correct option', () => {
    const questions = buildComprehensionQuestions(makeChunk('chunk-1'), SIGNALS)
    expect(questions.length).toBeGreaterThan(0)

    const mainIdea = questions.find((question) => question.kind === 'main-idea')
    expect(mainIdea).toBeDefined()
    const correctOption = mainIdea?.options.find((option) => option.isCorrect)
    expect(correctOption?.value).toBe('Plants convert light into chemical energy through photosynthesis.')
    // The distractor is a real value from another chunk, never invented text.
    const distractor = mainIdea?.options.find((option) => !option.isCorrect)
    expect(distractor?.value).toBe('Mitochondria produce ATP through cellular respiration.')
  })

  it('is deterministic — the same chunk always produces the same real question and option order', () => {
    const first = buildComprehensionQuestions(makeChunk('chunk-1'), SIGNALS)
    const second = buildComprehensionQuestions(makeChunk('chunk-1'), SIGNALS)
    expect(first).toEqual(second)
  })

  it('returns no questions, honestly, for a chunk with no real enrichment signals at all', () => {
    expect(buildComprehensionQuestions(makeChunk('chunk-unenriched'), SIGNALS)).toEqual([])
  })

  it('skips a signal kind when there are no real distractors elsewhere in the document', () => {
    const onlyOneMisconception: readonly DocumentComprehensionSignal[] = [{ chunkNodeId: 'chunk-1', kind: 'misconception', value: 'Some people think plants only respire at night.' }]
    expect(buildComprehensionQuestions(makeChunk('chunk-1'), onlyOneMisconception)).toEqual([])
  })
})
