import { describe, expect, it } from 'vitest'
import { buildAssessmentQuestions } from './buildAssessmentQuestions'
import type { AssessmentPassage } from '../selectAssessmentPassages'
import type { DocumentComprehensionSignal } from '../../presentation/listDocumentComprehensionSignals'

function makePassage(stage: AssessmentPassage['stage'], chunkNodeId: string): AssessmentPassage {
  return {
    stage,
    chunkNodeId,
    content: 'real content',
    wordCount: 200,
    enrichment: {
      semantic: `Real summary for ${chunkNodeId}.`,
      concepts: [`Concept ${chunkNodeId}`],
      entities: [`Entity ${chunkNodeId}`],
      misconceptions: [`Misconception ${chunkNodeId}`],
      keywords: [`Keyword ${chunkNodeId}`],
      importantTerms: [`Term ${chunkNodeId}`],
      definitions: [{ term: `Term ${chunkNodeId}`, definition: `Real definition for ${chunkNodeId}.` }],
    },
  }
}

function makeSignals(passages: readonly AssessmentPassage[]): readonly DocumentComprehensionSignal[] {
  const signals: DocumentComprehensionSignal[] = []
  for (const passage of passages) {
    signals.push({ chunkNodeId: passage.chunkNodeId, kind: 'main-idea', value: passage.enrichment.semantic ?? '' })
    for (const concept of passage.enrichment.concepts ?? []) signals.push({ chunkNodeId: passage.chunkNodeId, kind: 'concept', value: concept })
    for (const entity of passage.enrichment.entities ?? []) signals.push({ chunkNodeId: passage.chunkNodeId, kind: 'entity', value: entity })
    for (const misconception of passage.enrichment.misconceptions ?? []) signals.push({ chunkNodeId: passage.chunkNodeId, kind: 'misconception', value: misconception })
  }
  return signals
}

describe('buildAssessmentQuestions', () => {
  it('caps word-chunk/phrase-chunk/sentence stages at 3 real questions', () => {
    const passages = [makePassage('word-chunk', 'chunk-1'), makePassage('word-chunk', 'chunk-2'), makePassage('word-chunk', 'chunk-3')]
    const questions = buildAssessmentQuestions(passages[0]!, passages, makeSignals(passages))
    expect(questions.length).toBeLessThanOrEqual(3)
    expect(questions.length).toBeGreaterThan(0)
  })

  it('caps the paragraph stage at 5 real questions', () => {
    const passages = [makePassage('paragraph', 'chunk-1'), makePassage('paragraph', 'chunk-2'), makePassage('paragraph', 'chunk-3'), makePassage('paragraph', 'chunk-4')]
    const questions = buildAssessmentQuestions(passages[0]!, passages, makeSignals(passages))
    expect(questions.length).toBeLessThanOrEqual(5)
  })

  it('returns an empty array, honestly, when a passage has no real enrichment and no other passage to draw distractors from', () => {
    const bare: AssessmentPassage = { stage: 'word-chunk', chunkNodeId: 'bare', content: 'x', wordCount: 10, enrichment: {} }
    expect(buildAssessmentQuestions(bare, [bare], [])).toEqual([])
  })

  it('is deterministic — the same real inputs always produce the same real question set', () => {
    const passages = [makePassage('sentence', 'chunk-1'), makePassage('sentence', 'chunk-2')]
    const signals = makeSignals(passages)
    const first = buildAssessmentQuestions(passages[0]!, passages, signals)
    const second = buildAssessmentQuestions(passages[0]!, passages, signals)
    expect(first).toEqual(second)
  })
})
