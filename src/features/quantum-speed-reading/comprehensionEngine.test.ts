import { describe, it, expect } from 'vitest'
import { isResponseCorrect, computeAccuracyPercent, computeSpeedScore, computeReadingIntelligenceScore } from './comprehensionEngine'
import type { ComprehensionQuestion } from './comprehensionTypes'

describe('isResponseCorrect', () => {
  const singleChoice: ComprehensionQuestion = {
    id: 'q1', type: 'main-idea', format: 'single-choice', prompt: '', options: ['a', 'b', 'c', 'd'], correctIndex: 2, explanation: '',
  }
  const trueFalse: ComprehensionQuestion = {
    id: 'q2', type: 'key-detail', format: 'true-false', prompt: '', options: ['True', 'False'], correctIndex: 1, explanation: '',
  }
  const multiSelect: ComprehensionQuestion = {
    id: 'q3', type: 'inference', format: 'multi-select', prompt: '', options: ['a', 'b', 'c', 'd'], correctIndices: [0, 2], explanation: '',
  }
  const ordering: ComprehensionQuestion = {
    id: 'q4', type: 'sequence', format: 'ordering', prompt: '', options: ['a', 'b', 'c', 'd'], correctOrder: [1, 0, 3, 2], explanation: '',
  }

  it('checks single-choice by exact index', () => {
    expect(isResponseCorrect(singleChoice, { format: 'single-choice', selectedIndex: 2 })).toBe(true)
    expect(isResponseCorrect(singleChoice, { format: 'single-choice', selectedIndex: 0 })).toBe(false)
  })

  it('checks true-false the same way as single-choice', () => {
    expect(isResponseCorrect(trueFalse, { format: 'true-false', selectedIndex: 1 })).toBe(true)
    expect(isResponseCorrect(trueFalse, { format: 'true-false', selectedIndex: 0 })).toBe(false)
  })

  it('checks multi-select as an order-independent set', () => {
    expect(isResponseCorrect(multiSelect, { format: 'multi-select', selectedIndices: [2, 0] })).toBe(true)
    expect(isResponseCorrect(multiSelect, { format: 'multi-select', selectedIndices: [0] })).toBe(false)
    expect(isResponseCorrect(multiSelect, { format: 'multi-select', selectedIndices: [0, 1, 2] })).toBe(false)
  })

  it('checks ordering as an exact-order match', () => {
    expect(isResponseCorrect(ordering, { format: 'ordering', order: [1, 0, 3, 2] })).toBe(true)
    expect(isResponseCorrect(ordering, { format: 'ordering', order: [0, 1, 2, 3] })).toBe(false)
  })
})

describe('computeAccuracyPercent', () => {
  it('computes real percentage', () => {
    expect(computeAccuracyPercent(5, 5)).toBe(100)
    expect(computeAccuracyPercent(3, 5)).toBe(60)
    expect(computeAccuracyPercent(0, 5)).toBe(0)
  })

  it('returns 0 for zero total rather than dividing by zero', () => {
    expect(computeAccuracyPercent(0, 0)).toBe(0)
  })
})

describe('computeSpeedScore', () => {
  it('scores 100 when actual WPM meets or exceeds target', () => {
    expect(computeSpeedScore(200, 200)).toBe(100)
    expect(computeSpeedScore(300, 200)).toBe(100)
  })

  it('scores proportionally below target', () => {
    expect(computeSpeedScore(100, 200)).toBe(50)
  })

  it('clamps at 0 for zero/invalid target', () => {
    expect(computeSpeedScore(100, 0)).toBe(0)
  })
})

describe('computeReadingIntelligenceScore', () => {
  it('weights accuracy 50%, speed 30%, completion (constant 100) 20%', () => {
    // accuracy 100, speed 100 -> 100*0.5 + 100*0.3 + 100*0.2 = 100
    expect(computeReadingIntelligenceScore(200, 200, 5, 5)).toBe(100)
    // accuracy 0, speed 0 -> 0 + 0 + 20 = 20
    expect(computeReadingIntelligenceScore(0, 200, 0, 5)).toBe(20)
  })

  it('stays within 0-100 bounds', () => {
    const score = computeReadingIntelligenceScore(500, 200, 5, 5)
    expect(score).toBeLessThanOrEqual(100)
    expect(score).toBeGreaterThanOrEqual(0)
  })
})
