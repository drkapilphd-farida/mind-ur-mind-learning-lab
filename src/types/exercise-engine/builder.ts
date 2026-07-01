// Exercise Builder™ — configuration types for the builder layer.
//
// These types sit ABOVE the runtime. They describe HOW an exercise should
// be presented and scored. The builder converts them into the ExerciseDefinition
// + SessionItem[] that the runtime consumes — no runtime changes needed.

import type {
  ContentType,
  DatasetCategory,
  Locale,
  SpeedMs,
} from './index'

// ── Display types ──────────────────────────────────────────────────────────

// How the stimulus content is rendered to the student.
export type ExerciseDisplayType =
  | 'single-word'         // one word at centre
  | 'multiple-words'      // 2–4 words simultaneously
  | 'sentence'            // a full sentence
  | 'paragraph'           // a paragraph of text
  | 'letter'              // a single letter (large)
  | 'number'              // a single number (large)
  | 'shape'               // a shape rendered visually
  | 'color'               // a colour swatch
  | 'image'               // a photograph
  | 'icon'                // an SVG/lucide icon
  | 'pattern'             // geometric or abstract pattern
  | 'grid'                // items arranged in a grid (memory matrices)
  | 'flash-card'          // front/back flip card
  | 'target-tracking'     // moving target to follow
  | 'peripheral-vision'   // peripheral detection task
  | 'memory-sequence'     // show a sequence, recall it
  | 'reaction'            // tap/click when target appears
  | 'custom'              // exercise supplies its own renderer

// ── Presentation modes ─────────────────────────────────────────────────────

// How the stimulus transitions in and out.
export type PresentationMode =
  | 'flash'               // appears for flashDurationMs then disappears
  | 'slide'               // slides in from one edge
  | 'fade'                // fades in then out
  | 'zoom'                // scales up from small to large
  | 'center'              // static, centred, no motion
  | 'random-position'     // appears at randomised position (attention training)
  | 'grid'                // placed in a grid layout
  | 'sequential'          // shows one-by-one without hiding previous
  | 'adaptive'            // runtime chooses based on performance
  | 'mixed'               // random selection of above modes

// ── Distractor strategy ────────────────────────────────────────────────────

// How wrong answer options are generated for MCQ exercises.
export type DistractorStrategy =
  | 'pool-random'         // random items from the same dataset pool (default)
  | 'pool-same-tier'      // random items from the same difficulty tier
  | 'numeric-adjacent'    // numbers that differ by one digit (Flash Numbers)
  | 'visually-similar'    // characters that look alike (Flash Symbols: O/0, l/I)
  | 'label-from-stimulus' // options are labels of OTHER stimuli (Flash Images)
  | 'phrase-word-swap'    // same phrase with one word swapped (Flash Phrases)
  | 'custom'              // builder config supplies a custom function

// ── Answer interaction type ────────────────────────────────────────────────

export type AnswerMode =
  | 'multiple-choice-4'   // 2×2 grid of 4 options (current default)
  | 'multiple-choice-6'   // 2×3 grid of 6 options
  | 'true-false'          // binary yes/no
  | 'type-in'             // student types the answer
  | 'tap-target'          // tap when target appears (reaction)
  | 'sequence-recall'     // repeat a sequence
  | 'passive'             // no interaction — observation only

// ── Builder configuration ──────────────────────────────────────────────────

// The compact, human-readable configuration that Admin CMS or a developer
// writes. The builder converts it into the full ExerciseDefinition.
export type ExerciseBuilderConfig = {
  // Identity
  id: string
  title: string
  description: string
  trainsAbility: string
  labId: string
  labHref: string
  href: string

  // Content
  contentType: ContentType
  datasetId: string           // registered dataset ID
  locale?: Locale             // defaults to 'en'
  categories?: DatasetCategory[]

  // Presentation
  displayType: ExerciseDisplayType
  presentationMode: PresentationMode
  answerMode?: AnswerMode     // defaults to 'multiple-choice-4'
  distractorStrategy?: DistractorStrategy  // defaults to 'pool-random'

  // Session
  itemsPerSession?: number    // defaults to 20
  minAccuracyToComplete?: number  // defaults to 60

  // Speed
  defaultSpeedMs?: SpeedMs    // defaults to 500
  minSpeedMs?: SpeedMs        // defaults to 50
  maxSpeedMs?: SpeedMs        // defaults to 1000

  // Adaptive thresholds
  increaseSpeedAbove?: number // accuracy % — defaults to 90
  decreaseSpeedBelow?: number // accuracy % — defaults to 70

  // Intelligence contribution
  intelligenceDimension?: string   // defaults to 'reading'

  // Unlock rules (future Admin CMS)
  unlockAfterExerciseId?: string
  minMindScoreToUnlock?: number
}

// ── Validation result ──────────────────────────────────────────────────────

export type ExerciseValidationResult = {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

// ── Builder result ─────────────────────────────────────────────────────────

// Full exercise definition + metadata produced by createExercise().
export type BuiltExercise = {
  id: string
  definition: import('./index').ExerciseDefinition<ExerciseBuilderConfig>
  config: ExerciseBuilderConfig
  validationResult: ExerciseValidationResult
  registeredAt: number
}

// ── Registry entry ─────────────────────────────────────────────────────────

export type ExerciseRegistryEntry = {
  id: string
  title: string
  labId: string
  href: string
  contentType: ContentType
  displayType: ExerciseDisplayType
  presentationMode: PresentationMode
  datasetId: string
  isValid: boolean
  registeredAt: number
}

// ── Future Admin CMS schema ────────────────────────────────────────────────

// Admin CMS will POST this payload to create new exercises without writing code.
export type AdminExerciseCreateRequest = {
  builderConfig: ExerciseBuilderConfig
  publishedBy: string        // admin user ID
  publishAt?: string         // ISO 8601 — scheduled publish
  targetLabs: string[]       // which Labs can access this exercise
}

export type AdminExerciseUpdateRequest = {
  exerciseId: string
  updates: Partial<ExerciseBuilderConfig>
  updatedBy: string
  reason: string
}
