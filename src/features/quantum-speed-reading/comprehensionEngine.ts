// Comprehension Intelligence Engine™ — pure scoring functions. Self
// contained per this pack's convention; imports only the local
// comprehension types, never another mission's engine.

import type { ComprehensionQuestion, QuestionResponse } from './comprehensionTypes'

function arraysEqualAsSets(a: readonly number[], b: readonly number[]): boolean {
  if (a.length !== b.length) return false
  const setB = new Set(b)
  return a.every((value) => setB.has(value))
}

function arraysEqualInOrder(a: readonly number[], b: readonly number[]): boolean {
  if (a.length !== b.length) return false
  return a.every((value, index) => value === b[index])
}

// Generalized correctness check across all 4 response formats — true-false
// is just a 2-option case of single-choice, sharing the same check.
export function isResponseCorrect(question: ComprehensionQuestion, response: QuestionResponse): boolean {
  switch (response.format) {
    case 'single-choice':
    case 'true-false':
      return question.correctIndex === response.selectedIndex
    case 'multi-select':
      return arraysEqualAsSets(question.correctIndices ?? [], response.selectedIndices)
    case 'ordering':
      return arraysEqualInOrder(question.correctOrder ?? [], response.order)
  }
}

export function computeAccuracyPercent(correctCount: number, totalCount: number): number {
  if (totalCount <= 0) return 0
  return Math.round((correctCount / totalCount) * 100)
}

// Reading Intelligence Score (0-100) — disclosed formula:
// 50% accuracy (did they actually understand it) + 30% speed (real WPM
// against that passage's own difficulty-based target, from
// passageDifficulty.ts's estimateWpm — never a fabricated target) + 20%
// completion (a constant 100, since reaching this screen already requires
// finishing both the reading and all 5 questions).
const ACCURACY_WEIGHT = 0.5
const SPEED_WEIGHT = 0.3
const COMPLETION_WEIGHT = 0.2
const COMPLETION_SCORE = 100

export function computeSpeedScore(actualWpm: number, targetWpm: number): number {
  if (targetWpm <= 0) return 0
  const percent = Math.round((actualWpm / targetWpm) * 100)
  return Math.min(100, Math.max(0, percent))
}

export function computeReadingIntelligenceScore(
  actualWpm: number,
  targetWpm: number,
  correctCount: number,
  totalCount: number,
): number {
  const accuracyScore = computeAccuracyPercent(correctCount, totalCount)
  const speedScore = computeSpeedScore(actualWpm, targetWpm)
  const weighted = accuracyScore * ACCURACY_WEIGHT + speedScore * SPEED_WEIGHT + COMPLETION_SCORE * COMPLETION_WEIGHT
  return Math.round(Math.min(100, Math.max(0, weighted)))
}
