// Visual Intelligence Lab™ — Observation Intelligence™, Sprint 10E.
// Real, objectively-verifiable questions about each level's actual
// generated artwork (mandalaImages.ts) — every correctOptionId below was
// checked against the real layer/colour/accent counts baked into that
// level's image at generation time. This registry is a plain Record keyed
// by level order — trivially extensible to 100+ future mandalas by adding
// more entries (or widening the key to a general mandala id later); no
// architecture change needed to grow it.
//
// The brief's own example list included 2 questions ("Did the center
// remain visible after closing your eyes?", "How stable was your gaze?")
// that are subjective self-report, not objectively checkable against the
// artwork — those already exist as real questions in the Intelligent
// Focus Analyzer™ (Sprint-10D), so they're intentionally not duplicated
// here. Every question in this file has one real correct answer.

import type { MandalaLevelOrder } from './mandalaLevels'

export type ObservationQuestionOption = {
  id: string
  label: string
}

export type ObservationQuestion = {
  id: string
  text: string
  options: readonly ObservationQuestionOption[]
  correctOptionId: string
}

export type MandalaObservationQuestionSet = {
  levelOrder: MandalaLevelOrder
  questions: readonly ObservationQuestion[]
}

function ringCountQuestion(correctCount: number): ObservationQuestion {
  const distractors = [correctCount - 1, correctCount + 1, correctCount + 2].filter((n) => n >= 1 && n !== correctCount)
  const counts = Array.from(new Set([correctCount, ...distractors])).slice(0, 3)
  return {
    id: 'ring-count',
    text: 'How many rings of petals did you notice?',
    options: [
      ...counts.map((count) => ({ id: `count-${count}`, label: String(count) })),
      { id: 'not-sure', label: 'Not Sure' },
    ],
    correctOptionId: `count-${correctCount}`,
  }
}

function dominantColorQuestion(correctColor: string): ObservationQuestion {
  const palette = ['Orange', 'Pink', 'Purple', 'Cyan', 'Gold', 'Green', 'Blue']
  const distractors = palette.filter((color) => color !== correctColor).slice(0, 3)
  return {
    id: 'dominant-colour',
    text: 'Which colour appeared strongest?',
    options: [correctColor, ...distractors].map((color) => ({ id: `colour-${color.toLowerCase()}`, label: color })),
    correctOptionId: `colour-${correctColor.toLowerCase()}`,
  }
}

function accentQuestion(correctLevel: 'none' | 'a-few' | 'many'): ObservationQuestion {
  return {
    id: 'geometric-accents',
    text: 'Did you notice any triangular geometric accents?',
    options: [
      { id: 'none', label: 'None' },
      { id: 'a-few', label: 'A Few' },
      { id: 'many', label: 'Many' },
      { id: 'not-sure', label: 'Not Sure' },
    ],
    correctOptionId: correctLevel,
  }
}

export const MANDALA_OBSERVATION_QUESTIONS: Record<MandalaLevelOrder, MandalaObservationQuestionSet> = {
  1: { levelOrder: 1, questions: [ringCountQuestion(2), dominantColorQuestion('Orange'), accentQuestion('none')] },
  2: { levelOrder: 2, questions: [ringCountQuestion(3), dominantColorQuestion('Pink'), accentQuestion('none')] },
  3: { levelOrder: 3, questions: [ringCountQuestion(3), dominantColorQuestion('Purple'), accentQuestion('a-few')] },
  4: { levelOrder: 4, questions: [ringCountQuestion(4), dominantColorQuestion('Cyan'), accentQuestion('many')] },
  5: { levelOrder: 5, questions: [ringCountQuestion(5), dominantColorQuestion('Gold'), accentQuestion('many')] },
}
