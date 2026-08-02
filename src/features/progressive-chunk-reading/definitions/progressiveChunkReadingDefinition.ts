import type { ExerciseDefinition } from '@/types/exercise-engine'
import { DEFAULT_SCORING_RULES } from '@/types/exercise-engine'
// `dataset`/`contentType` are nominal-only fields on ExerciseDefinition —
// the runtime never reads them directly (verified when Peripheral Flash
// was built); real content comes from explicit getContentForExercise
// calls in the Experience component, drawing from BOTH chunkDataset.ts
// (Levels 1-3) and phraseDataset.ts (Levels 4-5) depending on the
// learner's current tier. CHUNK_READING_DATASET is referenced here for
// schema completeness, matching the mission's Level 1 starting point.
import { CHUNK_READING_DATASET } from '../../chunk-reading/chunkDataset'

export const PROGRESSIVE_CHUNK_READING_DEFINITION: ExerciseDefinition = {
  id: 'progressive-chunk-reading',
  labId: 'quantum-speed-reading',
  title: 'Progressive Chunk Reading™',
  description: 'Word groups appear automatically, in flow — read naturally, then answer two quick recognition questions per block.',
  trainsAbility: 'Sustained reading rhythm at an expanding chunk size',
  exerciseType: 'reading',
  contentType: 'chunk',
  interactionType: 'multiple-choice',
  dataset: CHUNK_READING_DATASET,
  adaptiveRules: {
    increaseSpeedAbove: 90,
    decreaseSpeedBelow: 70,
    minSpeedMs: 60,
    maxSpeedMs: 1000,
    defaultSpeedMs: 400,
    itemsPerSession: 4,
    minAccuracyToComplete: 60,
  },
  speedMode: 'adaptive',
  scoringRules: DEFAULT_SCORING_RULES,
  intelligenceDimension: 'reading',
  href: '/labs/quantum-speed-reading/progressive-chunk-reading',
  labHref: '/labs/quantum-speed-reading',
  locale: 'en',
  i18nKeys: {
    title: 'exercise.progressive_chunk_reading.title',
    description: 'exercise.progressive_chunk_reading.description',
    instruction: 'exercise.progressive_chunk_reading.instruction',
    startLabel: 'exercise.common.start',
    pauseLabel: 'exercise.common.pause',
    resumeLabel: 'exercise.common.resume',
    exitLabel: 'exercise.common.exit',
    correctLabel: 'exercise.common.correct',
    incorrectLabel: 'exercise.common.incorrect',
    completedLabel: 'exercise.progressive_chunk_reading.completed',
    practiceAgainLabel: 'exercise.common.practiceAgain',
    questionPrompt: 'exercise.progressive_chunk_reading.questionPrompt',
    keyboardHint: 'exercise.common.keyboardHint',
  },
  config: {},
}
