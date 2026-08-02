import type { ExerciseDefinition } from '@/types/exercise-engine'
import { DEFAULT_SCORING_RULES } from '@/types/exercise-engine'
import { createDataset } from '@/lib/exercise-engine/contentEngine'
import { MULTI_LINE_PARAGRAPHS } from '../multiLineParagraphDataset'

// `dataset` is a nominal-only field on ExerciseDefinition — the runtime
// never reads it directly (same precedent PCR's and Phrase Reading's own
// definitions established). Real content for this mission comes from
// multiLineParagraphDataset.ts's level-keyed, entity-tagged paragraphs,
// resolved directly in the Experience component — this just registers a
// genuine, representative sample (Level 1's own paragraphs) for schema
// completeness, rather than borrowing an unrelated dataset from another
// feature folder.
const MULTI_LINE_READING_DATASET = createDataset({
  id: 'en-multi-line-reading-paragraphs-v2',
  locale: 'en',
  contentType: 'paragraph',
  rawItems: MULTI_LINE_PARAGRAPHS[1].map((p) => ({ content: p.lines.join('\n'), difficulty: 'beginner' as const })),
})

export const MULTI_LINE_READING_DEFINITION: ExerciseDefinition = {
  id: 'multi-line-reading',
  labId: 'quantum-speed-reading',
  title: 'Multi-Line Reading™',
  description: 'A real paragraph appears — read it, then recall exactly which line contained what. Trains spatial reading and eye navigation.',
  trainsAbility: 'Spatial reading, eye navigation, and line tracking',
  exerciseType: 'reading',
  contentType: 'paragraph',
  interactionType: 'multiple-choice',
  dataset: MULTI_LINE_READING_DATASET,
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
  href: '/labs/quantum-speed-reading/multi-line-reading',
  labHref: '/labs/quantum-speed-reading',
  locale: 'en',
  i18nKeys: {
    title: 'exercise.multi_line_reading.title',
    description: 'exercise.multi_line_reading.description',
    instruction: 'exercise.multi_line_reading.instruction',
    startLabel: 'exercise.common.start',
    pauseLabel: 'exercise.common.pause',
    resumeLabel: 'exercise.common.resume',
    exitLabel: 'exercise.common.exit',
    correctLabel: 'exercise.common.correct',
    incorrectLabel: 'exercise.common.incorrect',
    completedLabel: 'exercise.multi_line_reading.completed',
    practiceAgainLabel: 'exercise.common.practiceAgain',
    questionPrompt: 'exercise.multi_line_reading.questionPrompt',
    keyboardHint: 'exercise.common.keyboardHint',
  },
  config: {},
}
