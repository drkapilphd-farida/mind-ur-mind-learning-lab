import type { ExerciseDefinition } from '@/types/exercise-engine'
import { DEFAULT_SCORING_RULES } from '@/types/exercise-engine'
// `dataset`/`contentType` are nominal-only fields on ExerciseDefinition —
// the runtime never reads them directly (same precedent PCR's own
// definition established). Real content for this mission comes from
// phraseClusterDataset.ts's level-keyed meaning clusters, resolved
// directly in the Experience component — not through this dataset. It's
// referenced here only for schema completeness, and because it must stay
// registered: PCR's own Level 4/5 import this exact file for its content.
import { PHRASE_READING_DATASET } from '../phraseDataset'

export const PHRASE_READING_DEFINITION: ExerciseDefinition = {
  id: 'phrase-reading',
  labId: 'quantum-speed-reading',
  title: 'Phrase Reading™',
  description: 'Recognise the exact meaning of a phrase — not just its topic — among near-identical wording. Trains meaning recognition, not visual grouping.',
  trainsAbility: 'Meaning recognition and language processing',
  exerciseType: 'reading',
  contentType: 'reading-phrase',
  interactionType: 'multiple-choice',
  dataset: PHRASE_READING_DATASET,
  adaptiveRules: {
    increaseSpeedAbove: 88,
    decreaseSpeedBelow: 65,
    minSpeedMs: 60,
    maxSpeedMs: 1000,
    defaultSpeedMs: 300,
    itemsPerSession: 4,
    minAccuracyToComplete: 60,
  },
  speedMode: 'adaptive',
  scoringRules: DEFAULT_SCORING_RULES,
  intelligenceDimension: 'reading',
  href: '/labs/quantum-speed-reading/phrase-reading',
  labHref: '/labs/quantum-speed-reading',
  locale: 'en',
  i18nKeys: {
    title: 'exercise.phrase_reading.title',
    description: 'exercise.phrase_reading.description',
    instruction: 'exercise.phrase_reading.instruction',
    startLabel: 'exercise.common.start',
    pauseLabel: 'exercise.common.pause',
    resumeLabel: 'exercise.common.resume',
    exitLabel: 'exercise.common.exit',
    correctLabel: 'exercise.common.correct',
    incorrectLabel: 'exercise.common.incorrect',
    completedLabel: 'exercise.phrase_reading.completed',
    practiceAgainLabel: 'exercise.common.practiceAgain',
    questionPrompt: 'exercise.phrase_reading.questionPrompt',
    keyboardHint: 'exercise.common.keyboardHint',
  },
  config: {},
}
