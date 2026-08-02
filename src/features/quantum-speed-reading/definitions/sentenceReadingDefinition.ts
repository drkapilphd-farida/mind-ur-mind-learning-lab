import type { ExerciseDefinition } from '@/types/exercise-engine'
import { DEFAULT_SCORING_RULES } from '@/types/exercise-engine'
import { createDataset } from '@/lib/exercise-engine/contentEngine'
import { SENTENCE_CHAPTERS } from '../sentenceLibrary'
import type { ChapterSentence } from '../sentenceLibrary'

// `dataset` is a nominal-only field on ExerciseDefinition — the runtime
// never reads it directly (same precedent every mission in this pack's
// own definition established). Real content comes from
// sentenceLibrary.ts's themed chapters, resolved directly in the
// Experience component — this registers a genuine, representative sample
// (Level 1's first chapter's 5 sentences) for schema completeness.
const SENTENCE_READING_DATASET = createDataset({
  id: 'en-sentence-reading-chapters-v1',
  locale: 'en',
  contentType: 'sentence',
  rawItems: SENTENCE_CHAPTERS[1][0]!.sentences.map((s: ChapterSentence) => ({ content: s.text, difficulty: 'beginner' as const })),
})

export const SENTENCE_READING_DEFINITION: ExerciseDefinition = {
  id: 'sentence-reading',
  labId: 'quantum-speed-reading',
  title: 'Sentence Reading™',
  description: 'A complete sentence appears — recognise its central idea instantly, without reading word by word. Trains idea recognition.',
  trainsAbility: 'Idea recognition and rapid meaning processing',
  exerciseType: 'reading',
  contentType: 'sentence',
  interactionType: 'multiple-choice',
  dataset: SENTENCE_READING_DATASET,
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
  href: '/labs/quantum-speed-reading/sentence-reading',
  labHref: '/labs/quantum-speed-reading',
  locale: 'en',
  i18nKeys: {
    title: 'exercise.sentence_reading.title',
    description: 'exercise.sentence_reading.description',
    instruction: 'exercise.sentence_reading.instruction',
    startLabel: 'exercise.common.start',
    pauseLabel: 'exercise.common.pause',
    resumeLabel: 'exercise.common.resume',
    exitLabel: 'exercise.common.exit',
    correctLabel: 'exercise.common.correct',
    incorrectLabel: 'exercise.common.incorrect',
    completedLabel: 'exercise.sentence_reading.completed',
    practiceAgainLabel: 'exercise.common.practiceAgain',
    questionPrompt: 'exercise.sentence_reading.questionPrompt',
    keyboardHint: 'exercise.common.keyboardHint',
  },
  config: {},
}
