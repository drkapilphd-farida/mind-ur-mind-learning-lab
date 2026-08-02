import type { ExerciseDefinition } from '@/types/exercise-engine'
import { DEFAULT_SCORING_RULES } from '@/types/exercise-engine'
// `dataset`/`contentType` are nominal-only fields on ExerciseDefinition —
// the runtime never reads them (verified when Mixed Flash was built);
// real content comes from an explicit getContentForExercise call in the
// Experience component. Peripheral Flash draws its content from Word
// Flash's real, already-validated dataset directly (read-only import),
// so this references that dataset for schema completeness rather than
// fabricate a placeholder.
import { WORD_FLASH_DATASET } from '../wordFlashDataset'

export const PERIPHERAL_FLASH_DEFINITION: ExerciseDefinition = {
  id: 'peripheral-flash',
  labId: 'quantum-speed-reading',
  title: 'Peripheral Flash™',
  description: 'Keep your eyes on the center. Recognize what appears around it.',
  trainsAbility: 'Visual span and peripheral awareness',
  exerciseType: 'flash',
  contentType: 'word',
  interactionType: 'multiple-choice',
  dataset: WORD_FLASH_DATASET,
  adaptiveRules: {
    increaseSpeedAbove: 90,
    decreaseSpeedBelow: 70,
    minSpeedMs: 50,
    maxSpeedMs: 500,
    defaultSpeedMs: 500,
    itemsPerSession: 20,
    minAccuracyToComplete: 60,
  },
  speedMode: 'adaptive',
  scoringRules: DEFAULT_SCORING_RULES,
  intelligenceDimension: 'reading',
  href: '/labs/quantum-speed-reading/peripheral-flash',
  labHref: '/labs/quantum-speed-reading',
  locale: 'en',
  i18nKeys: {
    title: 'exercise.peripheral_flash.title',
    description: 'exercise.peripheral_flash.description',
    instruction: 'exercise.peripheral_flash.instruction',
    startLabel: 'exercise.common.start',
    pauseLabel: 'exercise.common.pause',
    resumeLabel: 'exercise.common.resume',
    exitLabel: 'exercise.common.exit',
    correctLabel: 'exercise.common.correct',
    incorrectLabel: 'exercise.common.incorrect',
    completedLabel: 'exercise.peripheral_flash.completed',
    practiceAgainLabel: 'exercise.common.practiceAgain',
    questionPrompt: 'exercise.peripheral_flash.questionPrompt',
    keyboardHint: 'exercise.common.keyboardHint',
  },
  config: {},
}
