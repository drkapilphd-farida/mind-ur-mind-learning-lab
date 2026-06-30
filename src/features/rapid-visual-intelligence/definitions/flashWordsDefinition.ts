// Flash Words™ — Exercise Definition for the AIEE™.
//
// This is the reference implementation showing how any exercise is described
// as a pure configuration object. The Engine reads this; the player executes
// it. Adding Flash Words to a new language or dataset means creating a new
// definition — not touching any component code.

import type { ExerciseDefinition } from '@/types/exercise-engine'
import { DEFAULT_SCORING_RULES } from '@/types/exercise-engine'
import { ENGLISH_WORDS_FOUNDATION } from '@/lib/exercise-engine/contentEngine'

type FlashWordsConfig = {
  // Flash Words-specific configuration that passes through to the player
  distractorCount: number          // how many wrong options to show
  includeHomophones: boolean       // future: swap real homophones as hard distractors
}

export const FLASH_WORDS_DEFINITION: ExerciseDefinition<FlashWordsConfig> = {
  // Identity
  id: 'flash-words',
  labId: 'quantum-speed-reading',
  title: 'Flash Words™',
  description: 'A word appears briefly — identify it before it vanishes.',
  trainsAbility: 'Word recognition speed',

  // Classification
  exerciseType: 'flash',
  contentType: 'word',
  interactionType: 'multiple-choice',

  // Content — references the built-in English word dataset
  dataset: ENGLISH_WORDS_FOUNDATION,

  // Adaptive rules — match the original Sprint 4C-1 behaviour exactly
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

  // Routing
  href: '/labs/quantum-speed-reading/rapid-visual-intelligence/flash-words',
  labHref: '/labs/quantum-speed-reading/rapid-visual-intelligence',

  locale: 'en',

  // i18n keys (values resolved by the platform's translation layer)
  i18nKeys: {
    title: 'exercise.flashWords.title',
    description: 'exercise.flashWords.description',
    instruction: 'exercise.flashWords.instruction',
    startLabel: 'exercise.common.start',
    pauseLabel: 'exercise.common.pause',
    resumeLabel: 'exercise.common.resume',
    exitLabel: 'exercise.common.exit',
    correctLabel: 'exercise.common.correct',
    incorrectLabel: 'exercise.common.incorrect',
    completedLabel: 'exercise.flashWords.completed',
    practiceAgainLabel: 'exercise.common.practiceAgain',
    questionPrompt: 'exercise.flashWords.questionPrompt',
    keyboardHint: 'exercise.common.keyboardHint',
  },

  // Flash Words-specific config
  config: {
    distractorCount: 3,
    includeHomophones: false,   // future feature
  },
}
