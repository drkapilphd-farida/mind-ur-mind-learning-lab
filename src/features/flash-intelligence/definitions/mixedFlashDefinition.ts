import type { ExerciseDefinition } from '@/types/exercise-engine'
import { DEFAULT_SCORING_RULES } from '@/types/exercise-engine'
// `dataset`/`contentType` are nominal-only fields on ExerciseDefinition —
// verified the runtime (UniversalExercisePlayer / useUniversalExerciseRuntime)
// never reads them; every mission's real content comes from explicit
// getContentForExercise calls in its own Experience component. Mixed
// Flash genuinely draws from three content types per session, so rather
// than register a fabricated placeholder dataset, this references Word
// Flash's real, already-validated dataset for schema completeness only —
// a read-only import, Word Flash's own file is untouched.
import { WORD_FLASH_DATASET } from '../wordFlashDataset'

export const MIXED_FLASH_DEFINITION: ExerciseDefinition = {
  id: 'mixed-flash',
  labId: 'quantum-speed-reading',
  title: 'Mixed Flash™',
  description: 'Words, numbers, and symbols — the brain never knows which is coming next.',
  trainsAbility: 'Recognition switching and cognitive flexibility',
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
  href: '/labs/quantum-speed-reading/mixed-flash',
  labHref: '/labs/quantum-speed-reading',
  locale: 'en',
  i18nKeys: {
    title: 'exercise.mixed_flash.title',
    description: 'exercise.mixed_flash.description',
    instruction: 'exercise.mixed_flash.instruction',
    startLabel: 'exercise.common.start',
    pauseLabel: 'exercise.common.pause',
    resumeLabel: 'exercise.common.resume',
    exitLabel: 'exercise.common.exit',
    correctLabel: 'exercise.common.correct',
    incorrectLabel: 'exercise.common.incorrect',
    completedLabel: 'exercise.mixed_flash.completed',
    practiceAgainLabel: 'exercise.common.practiceAgain',
    questionPrompt: 'exercise.mixed_flash.questionPrompt',
    keyboardHint: 'exercise.common.keyboardHint',
  },
  config: {},
}
