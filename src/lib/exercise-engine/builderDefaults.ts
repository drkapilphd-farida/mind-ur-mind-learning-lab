// Builder Defaults™ — sensible default configurations per exercise type.
//
// When a builder config omits a field, these defaults apply. Centralising
// defaults here means a change to "standard" behaviour only requires
// editing one file, not every exercise definition.

import type { ExerciseBuilderConfig, ExerciseDisplayType, DistractorStrategy } from '@/types/exercise-engine/builder'
import type { SpeedMs } from '@/types/exercise-engine'

// ── Session defaults ─────────────────────────────────────────────────────

export const DEFAULT_ITEMS_PER_SESSION = 20
export const DEFAULT_MIN_ACCURACY_TO_COMPLETE = 60

// ── Speed defaults by display type ──────────────────────────────────────

const SPEED_DEFAULTS: Record<ExerciseDisplayType, {
  defaultSpeedMs: SpeedMs
  minSpeedMs: SpeedMs
  maxSpeedMs: SpeedMs
}> = {
  'single-word':      { defaultSpeedMs: 500, minSpeedMs: 50,  maxSpeedMs: 1000 },
  'multiple-words':   { defaultSpeedMs: 800, minSpeedMs: 100, maxSpeedMs: 1000 },
  'sentence':         { defaultSpeedMs: 1000,minSpeedMs: 200, maxSpeedMs: 1000 },
  'paragraph':        { defaultSpeedMs: 1000,minSpeedMs: 500, maxSpeedMs: 1000 },
  'letter':           { defaultSpeedMs: 300, minSpeedMs: 50,  maxSpeedMs: 500  },
  'number':           { defaultSpeedMs: 500, minSpeedMs: 50,  maxSpeedMs: 1000 },
  'shape':            { defaultSpeedMs: 500, minSpeedMs: 80,  maxSpeedMs: 1000 },
  'color':            { defaultSpeedMs: 500, minSpeedMs: 150, maxSpeedMs: 1000 },
  'image':            { defaultSpeedMs: 600, minSpeedMs: 100, maxSpeedMs: 1000 },
  'icon':             { defaultSpeedMs: 500, minSpeedMs: 80,  maxSpeedMs: 1000 },
  'pattern':          { defaultSpeedMs: 800, minSpeedMs: 200, maxSpeedMs: 1000 },
  'grid':             { defaultSpeedMs: 1000,minSpeedMs: 300, maxSpeedMs: 1000 },
  'flash-card':       { defaultSpeedMs: 1000,minSpeedMs: 300, maxSpeedMs: 1000 },
  'target-tracking':  { defaultSpeedMs: 800, minSpeedMs: 300, maxSpeedMs: 1000 },
  'peripheral-vision':{ defaultSpeedMs: 600, minSpeedMs: 200, maxSpeedMs: 1000 },
  'memory-sequence':  { defaultSpeedMs: 800, minSpeedMs: 400, maxSpeedMs: 1000 },
  'reaction':         { defaultSpeedMs: 500, minSpeedMs: 150, maxSpeedMs: 1000 },
  'custom':           { defaultSpeedMs: 500, minSpeedMs: 50,  maxSpeedMs: 1000 },
}

// ── Distractor strategy defaults ─────────────────────────────────────────

const DISTRACTOR_DEFAULTS: Partial<Record<string, DistractorStrategy>> = {
  word:    'pool-same-tier',
  phrase:  'pool-same-tier',
  number:  'numeric-adjacent',
  symbol:  'visually-similar',
  letter:  'visually-similar',
  icon:    'label-from-stimulus',
  shape:   'pool-same-tier',
  color:   'pool-same-tier',
  sentence:'pool-same-tier',
}

// ── Adaptive threshold defaults ───────────────────────────────────────────

export const DEFAULT_INCREASE_SPEED_ABOVE = 90   // % accuracy
export const DEFAULT_DECREASE_SPEED_BELOW = 70   // % accuracy

// ── Apply defaults to a partial builder config ────────────────────────────

// Return type: all required fields filled, optional lock fields preserved as-is
type AppliedBuilderConfig =
  Required<Omit<ExerciseBuilderConfig, 'unlockAfterExerciseId' | 'minMindScoreToUnlock'>> &
  Pick<ExerciseBuilderConfig, 'unlockAfterExerciseId' | 'minMindScoreToUnlock'>

export function applyBuilderDefaults(config: ExerciseBuilderConfig): AppliedBuilderConfig {
  const speeds = SPEED_DEFAULTS[config.displayType] ?? SPEED_DEFAULTS['single-word']!
  const distractorStrategy = (DISTRACTOR_DEFAULTS[config.contentType] ?? 'pool-random') as DistractorStrategy

  return {
    id: config.id,
    title: config.title,
    description: config.description,
    trainsAbility: config.trainsAbility,
    labId: config.labId,
    labHref: config.labHref,
    href: config.href,
    contentType: config.contentType,
    datasetId: config.datasetId,
    locale: config.locale ?? 'en',
    categories: config.categories ?? [],
    displayType: config.displayType,
    presentationMode: config.presentationMode,
    answerMode: config.answerMode ?? 'multiple-choice-4',
    distractorStrategy: config.distractorStrategy ?? distractorStrategy,
    itemsPerSession: config.itemsPerSession ?? DEFAULT_ITEMS_PER_SESSION,
    minAccuracyToComplete: config.minAccuracyToComplete ?? DEFAULT_MIN_ACCURACY_TO_COMPLETE,
    defaultSpeedMs: config.defaultSpeedMs ?? speeds.defaultSpeedMs,
    minSpeedMs: config.minSpeedMs ?? speeds.minSpeedMs,
    maxSpeedMs: config.maxSpeedMs ?? speeds.maxSpeedMs,
    increaseSpeedAbove: config.increaseSpeedAbove ?? DEFAULT_INCREASE_SPEED_ABOVE,
    decreaseSpeedBelow: config.decreaseSpeedBelow ?? DEFAULT_DECREASE_SPEED_BELOW,
    intelligenceDimension: config.intelligenceDimension ?? 'reading',
    // Optional lock fields — omitted (not set to undefined) when not provided
    ...(config.unlockAfterExerciseId !== undefined ? { unlockAfterExerciseId: config.unlockAfterExerciseId } : {}),
    ...(config.minMindScoreToUnlock !== undefined ? { minMindScoreToUnlock: config.minMindScoreToUnlock } : {}),
  }
}
