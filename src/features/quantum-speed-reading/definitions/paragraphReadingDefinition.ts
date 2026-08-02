import type { ExerciseDefinition } from '@/types/exercise-engine'
import { DEFAULT_SCORING_RULES } from '@/types/exercise-engine'
import { createDataset } from '@/lib/exercise-engine/contentEngine'
import { PARAGRAPH_LIBRARY } from '../paragraphLibrary'

// `dataset` is a nominal-only field on ExerciseDefinition — the runtime
// never reads it directly (same precedent every mission in this pack's own
// definition established). Real content comes from paragraphLibrary.ts's
// 25 authored paragraphs, resolved directly in the Experience component —
// this registers a genuine, representative sample (Level 1's first
// paragraph's lines) for schema completeness.
const PARAGRAPH_READING_DATASET = createDataset({
  id: 'en-paragraph-reading-missions-v1',
  locale: 'en',
  contentType: 'paragraph',
  rawItems: PARAGRAPH_LIBRARY[1][0]!.lines.map((line) => ({ content: line, difficulty: 'beginner' as const })),
})

export const PARAGRAPH_READING_DEFINITION: ExerciseDefinition = {
  id: 'paragraph-reading',
  labId: 'quantum-speed-reading',
  title: 'Paragraph Reading™',
  description: 'A complete paragraph appears at once — recognise it as one meaning block, not a string of sentences. Trains whole-paragraph comprehension.',
  trainsAbility: 'Meaning block recognition and whole-paragraph comprehension',
  exerciseType: 'reading',
  contentType: 'paragraph',
  interactionType: 'multiple-choice',
  dataset: PARAGRAPH_READING_DATASET,
  adaptiveRules: {
    increaseSpeedAbove: 88,
    decreaseSpeedBelow: 65,
    minSpeedMs: 60,
    maxSpeedMs: 1000,
    defaultSpeedMs: 300,
    itemsPerSession: 8,
    minAccuracyToComplete: 60,
  },
  speedMode: 'adaptive',
  scoringRules: DEFAULT_SCORING_RULES,
  intelligenceDimension: 'reading',
  href: '/labs/quantum-speed-reading/paragraph-reading',
  labHref: '/labs/quantum-speed-reading',
  locale: 'en',
  i18nKeys: {
    title: 'exercise.paragraph_reading.title',
    description: 'exercise.paragraph_reading.description',
    instruction: 'exercise.paragraph_reading.instruction',
    startLabel: 'exercise.common.start',
    pauseLabel: 'exercise.common.pause',
    resumeLabel: 'exercise.common.resume',
    exitLabel: 'exercise.common.exit',
    correctLabel: 'exercise.common.correct',
    incorrectLabel: 'exercise.common.incorrect',
    completedLabel: 'exercise.paragraph_reading.completed',
    practiceAgainLabel: 'exercise.common.practiceAgain',
    questionPrompt: 'exercise.paragraph_reading.questionPrompt',
    keyboardHint: 'exercise.common.keyboardHint',
  },
  config: {},
}
