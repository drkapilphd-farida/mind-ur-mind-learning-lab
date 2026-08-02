// Visual Intelligence Lab™ — Visual Intelligence Report™, Sprint 10E.
// Every score here is a plain, disclosed function of real inputs: either
// objectively-correct/incorrect answers to Observation Intelligence™'s
// questions, or the same real ratios the Intelligent Focus Analyzer™
// (Sprint-10D) already derives from self-reported answers. No fabricated
// measurement, no AI call.

import type { ObservationQuestion } from '../mandalaObservationQuestions'

// Sprint 10F: widened from the Mandala-specific MandalaObservationQuestionSet
// to this minimal generic shape (the function only ever read `.questions`)
// so Image Persistence Challenge™'s per-image question sets can reuse this
// unchanged — zero behavior change for Mandala, which is still structurally
// assignable here.
export type ObservationQuestionSet = { questions: readonly ObservationQuestion[] }

// Observation Accuracy™ — the real percentage of Observation Intelligence™
// questions answered correctly for this level's actual artwork.
export function computeObservationAccuracy(questionSet: ObservationQuestionSet, answers: Record<string, string>): number {
  const total = questionSet.questions.length
  if (total === 0) return 0
  const correct = questionSet.questions.filter((question) => answers[question.id] === question.correctOptionId).length
  return Math.round((correct / total) * 100)
}

// Attention Score™ — how well the student both held focus (self-reported
// gaze stability) AND actually observed correctly (objective accuracy):
// 50% gaze-stability ratio + 50% observation accuracy.
export function computeAttentionScore(gazeStabilityRatio: number, observationAccuracyPercent: number): number {
  return Math.round(100 * (0.5 * gazeStabilityRatio + 0.5 * (observationAccuracyPercent / 100)))
}

// Visual Recall™ — how well the visual information was retained: 70%
// objective observation accuracy + 30% how long the after-image itself
// persisted (self-reported duration ratio).
export function computeVisualRecall(observationAccuracyPercent: number, afterImageDurationRatio: number): number {
  return Math.round(100 * (0.7 * (observationAccuracyPercent / 100) + 0.3 * afterImageDurationRatio))
}
