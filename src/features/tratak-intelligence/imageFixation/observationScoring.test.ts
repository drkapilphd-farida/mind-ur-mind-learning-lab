import { describe, expect, it } from 'vitest'
import { computeAttentionScore, computeObservationAccuracy, computeVisualRecall, type ObservationQuestionSet } from './observationScoring'

const QUESTION_SET: ObservationQuestionSet = {
  questions: [
    { id: 'q1', text: 'Q1', options: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }], correctOptionId: 'a' },
    { id: 'q2', text: 'Q2', options: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }], correctOptionId: 'b' },
    { id: 'q3', text: 'Q3', options: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }], correctOptionId: 'a' },
  ],
}

describe('computeObservationAccuracy', () => {
  it('is 0 when nothing is answered', () => {
    expect(computeObservationAccuracy(QUESTION_SET, {})).toBe(0)
  })

  it('is 100 when every answer is correct', () => {
    expect(computeObservationAccuracy(QUESTION_SET, { q1: 'a', q2: 'b', q3: 'a' })).toBe(100)
  })

  it('reflects a real partial-correct ratio, never fabricated', () => {
    // 1 of 3 correct -> 33%
    expect(computeObservationAccuracy(QUESTION_SET, { q1: 'a', q2: 'a', q3: 'b' })).toBe(33)
  })

  it('never rewards a wrong answer', () => {
    expect(computeObservationAccuracy(QUESTION_SET, { q1: 'b', q2: 'a', q3: 'b' })).toBe(0)
  })
})

describe('computeAttentionScore', () => {
  it('blends gaze stability and observation accuracy equally', () => {
    // 0.5 gaze ratio, 66% accuracy -> 0.5*0.5 + 0.5*0.66 = 0.58 -> 58
    expect(computeAttentionScore(0.5, 66)).toBe(58)
  })

  it('is 100 when both inputs are maximal', () => {
    expect(computeAttentionScore(1, 100)).toBe(100)
  })

  it('is 0 when both inputs are minimal', () => {
    expect(computeAttentionScore(0, 0)).toBe(0)
  })
})

describe('computeVisualRecall', () => {
  it('weighs observation accuracy more heavily than after-image duration', () => {
    // 0.7*1.0 + 0.3*0 = 70
    expect(computeVisualRecall(100, 0)).toBe(70)
    // 0.7*0 + 0.3*1.0 = 30
    expect(computeVisualRecall(0, 1)).toBe(30)
  })

  it('is 100 when both inputs are maximal', () => {
    expect(computeVisualRecall(100, 1)).toBe(100)
  })
})
