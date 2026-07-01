// Exercise Builder™ — the 7 builder functions.
//
// Sits ABOVE the runtime. Converts compact ExerciseBuilderConfig into the
// full ExerciseDefinition + SessionItem[] that the Universal Runtime consumes.
// No runtime code changes required when adding new exercises.

import type {
  ExerciseDefinition,
  SessionItem,
  ContentItem,
  SpeedMs,
} from '@/types/exercise-engine'
import { DEFAULT_SCORING_RULES } from '@/types/exercise-engine'
import type {
  ExerciseBuilderConfig,
  ExerciseValidationResult,
  BuiltExercise,
  DistractorStrategy,
} from '@/types/exercise-engine/builder'
import { applyBuilderDefaults } from './builderDefaults'
import { computeNextSpeed } from './performanceEngine'
import { getDataset } from './contentEngine'
import { getContentForExercise } from './datasetEngine'
import { pickItems } from './randomizationEngine'
import { ensureMinItems } from './datasetValidator'
import type { PerformanceMetrics, ExerciseRecommendation } from '@/types/exercise-engine'
import { computeRecommendation } from './recommendationEngine'
import { loadState } from './sessionEngine'

// ── 1. createExercise() ────────────────────────────────────────────────────

// Converts a compact ExerciseBuilderConfig into a fully-formed ExerciseDefinition
// with all defaults applied. This is the primary entry point for creating exercises.
export function createExercise(config: ExerciseBuilderConfig): BuiltExercise {
  const full = applyBuilderDefaults(config)
  const validationResult = validateExercise(config)

  const dataset = getDataset(full.datasetId)

  const definition: ExerciseDefinition<ExerciseBuilderConfig> = {
    id: full.id,
    labId: full.labId,
    title: full.title,
    description: full.description,
    trainsAbility: full.trainsAbility,
    exerciseType: 'flash',  // builder currently supports flash; extensible
    contentType: full.contentType,
    interactionType: full.answerMode === 'passive' ? 'passive' : 'multiple-choice',
    dataset: dataset ?? {
      id: full.datasetId,
      locale: full.locale,
      contentType: full.contentType,
      items: [],
      getItemsByDifficulty: () => [],
    },
    adaptiveRules: {
      increaseSpeedAbove: full.increaseSpeedAbove,
      decreaseSpeedBelow: full.decreaseSpeedBelow,
      minSpeedMs: full.minSpeedMs,
      maxSpeedMs: full.maxSpeedMs,
      defaultSpeedMs: full.defaultSpeedMs,
      itemsPerSession: full.itemsPerSession,
      minAccuracyToComplete: full.minAccuracyToComplete,
    },
    speedMode: 'adaptive',
    scoringRules: DEFAULT_SCORING_RULES,
    intelligenceDimension: full.intelligenceDimension,
    href: full.href,
    labHref: full.labHref,
    locale: full.locale,
    i18nKeys: buildI18nKeys(full.id),
    config: full,
    ...(full.unlockAfterExerciseId !== undefined || full.minMindScoreToUnlock !== undefined
      ? {
          unlockCondition: {
            ...(full.unlockAfterExerciseId !== undefined ? { prerequisiteExerciseId: full.unlockAfterExerciseId } : {}),
            ...(full.minMindScoreToUnlock !== undefined ? { minMindScore: full.minMindScoreToUnlock } : {}),
          },
        }
      : {}),
  }

  return {
    id: full.id,
    definition,
    config: full,
    validationResult,
    registeredAt: Date.now(),
  }
}

// ── 2. validateExercise() ──────────────────────────────────────────────────

export function validateExercise(config: ExerciseBuilderConfig): ExerciseValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!config.id || config.id.trim() === '') errors.push('id is required')
  if (!config.title || config.title.trim() === '') errors.push('title is required')
  if (!config.datasetId || config.datasetId.trim() === '') errors.push('datasetId is required')
  if (!config.href || config.href.trim() === '') errors.push('href is required')
  if (!config.labHref || config.labHref.trim() === '') errors.push('labHref is required')

  const dataset = getDataset(config.datasetId)
  if (!dataset) {
    warnings.push(`Dataset '${config.datasetId}' is not registered yet. Register it before the exercise can be used.`)
  } else if (dataset.items.length < 10) {
    warnings.push(`Dataset '${config.datasetId}' has only ${dataset.items.length} items. Sessions may have repeated content.`)
  }

  return { isValid: errors.length === 0, errors, warnings }
}

// ── 3. buildSession() ─────────────────────────────────────────────────────

// Generates a ready-to-use SessionItem[] for the Universal Runtime.
// The distractorStrategy in the definition config controls how wrong options
// are generated. This centralises all item-building logic — Exercise components
// no longer need custom buildItems() functions.
export function buildSession(
  definition: ExerciseDefinition<Record<string, unknown>>,
  seed: number,
  options?: { excludeIds?: string[] },
): SessionItem[] {
  // config may be ExerciseBuilderConfig or a custom shape — access safely
  const config = definition.config as Partial<ExerciseBuilderConfig>
  const count = config.itemsPerSession ?? 20
  const strategy = config.distractorStrategy ?? 'pool-random'

  const raw = getContentForExercise({
    contentType: definition.contentType,
    locale: config.locale ?? 'en',
    difficulty: 'medium',   // adaptive difficulty handled by the runtime
    count: count + 15,
    excludeIds: options?.excludeIds ?? [],
    seed,
  })

  const pool = ensureMinItems(raw, count, seed)
  const stimuli = pool.slice(0, count)
  const distractorPool = pool.slice(count)

  return stimuli.map((item, i) => {
    const itemSeed = seed + i * 31337
    const options = buildOptions(item, distractorPool, strategy, itemSeed)
    const correctIndex = options.indexOf(getOptionLabel(item, strategy))

    return {
      id: `${definition.id}-${item.id}`,
      stimulus: item.content,
      stimulusLabel: item.contentLabel,
      options: options.slice(0, 4),
      correctIndex: correctIndex >= 0 ? correctIndex : 0,
    }
  })
}

function getOptionLabel(item: ContentItem, strategy: DistractorStrategy): string {
  // For icon exercises, the option labels are the content label (e.g. 'Sun')
  // For all others, the option IS the content
  return strategy === 'label-from-stimulus' ? item.contentLabel : item.content
}

function buildOptions(
  item: ContentItem,
  pool: ContentItem[],
  strategy: DistractorStrategy,
  seed: number,
): string[] {
  const correctLabel = getOptionLabel(item, strategy)

  let distractorLabels: string[]

  switch (strategy) {
    case 'numeric-adjacent': {
      const n = Number(item.content)
      distractorLabels = [
        generateNumericDistractor(item.content, seed + 1),
        generateNumericDistractor(item.content, seed + 2),
        generateNumericDistractor(item.content, seed + 3),
      ]
      void n
      break
    }
    case 'label-from-stimulus': {
      distractorLabels = pickItems(
        pool.filter((p) => p.contentLabel !== item.contentLabel),
        3,
        seed,
      ).map((p) => p.contentLabel)
      break
    }
    default: {
      distractorLabels = pickItems(
        pool.filter((p) => p.content !== item.content),
        3,
        seed,
      ).map((p) => p.content)
    }
  }

  // Fill to exactly 3 distractors if needed
  while (distractorLabels.length < 3) {
    distractorLabels.push(pool[distractorLabels.length % pool.length]?.content ?? 'option')
  }

  const raw = [correctLabel, ...distractorLabels.slice(0, 3)]
  const sortSeed = seed % 4
  return [
    raw[sortSeed % 4] ?? correctLabel,
    raw[(sortSeed + 1) % 4] ?? distractorLabels[0] ?? 'b',
    raw[(sortSeed + 2) % 4] ?? distractorLabels[1] ?? 'c',
    raw[(sortSeed + 3) % 4] ?? distractorLabels[2] ?? 'd',
  ]
}

function generateNumericDistractor(target: string, seed: number): string {
  const n = Number(target)
  const offset = (((seed * 22695477 + 1) >>> 0) % 9) + 1
  return String(Math.abs(n + offset * (seed % 2 === 0 ? 1 : -1)))
    .padStart(target.length, '0')
    .slice(0, target.length)
}

// ── 4. buildDataset() ─────────────────────────────────────────────────────

// Re-exports createDataset under the builder naming convention.
// Future Admin CMS calls this to create datasets from uploaded content.
export { createDataset as buildDataset } from './contentEngine'

// ── 5. buildRuntime() ─────────────────────────────────────────────────────

// Returns the input object for useUniversalExerciseRuntime.
// Exercises that want to customise runtime input call this instead of
// constructing it manually — ensures consistent defaults.
export function buildRuntime(
  definition: ExerciseDefinition<ExerciseBuilderConfig>,
  options?: {
    nextExerciseId?: string | null
    nextExerciseHref?: string | null
  },
): {
  definition: ExerciseDefinition<ExerciseBuilderConfig>
  nextExerciseId: string | null
  nextExerciseHref: string | null
} {
  return {
    definition,
    nextExerciseId: options?.nextExerciseId ?? null,
    nextExerciseHref: options?.nextExerciseHref ?? null,
  }
}

// ── 6. buildResult() ──────────────────────────────────────────────────────

// Formats raw ItemResponse[] into the display-ready result structure.
// The runtime hook already does this internally — this is the public API
// for exercises that compute results outside the hook.
export function buildResult(
  exerciseName: string,
  metrics: PerformanceMetrics,
  recommendation: ExerciseRecommendation,
): {
  title: string
  accuracyPercent: number
  performanceScore: number
  averageReactionTimeMs: number
  nextSpeedMs: SpeedMs | null
  recommendation: ExerciseRecommendation
} {
  return {
    title: `${exerciseName} · Session complete`,
    accuracyPercent: metrics.accuracyPercent,
    performanceScore: metrics.performanceScore,
    averageReactionTimeMs: metrics.averageReactionTimeMs,
    nextSpeedMs: recommendation.nextSpeedMs,
    recommendation,
  }
}

// ── 7. buildRecommendation() ──────────────────────────────────────────────

// Public API for computing a recommendation outside the runtime hook.
export function buildRecommendation(
  exerciseId: string,
  metrics: PerformanceMetrics,
  definition: ExerciseDefinition<ExerciseBuilderConfig>,
  nextExerciseId: string | null = null,
  nextExerciseHref: string | null = null,
): ExerciseRecommendation {
  const state = loadState(exerciseId)
  const nextSpeedMs = computeNextSpeed(metrics.speedMs, metrics.accuracyPercent, definition.adaptiveRules)
  return computeRecommendation({
    metrics,
    state,
    nextSpeedMs,
    nextExerciseId,
    nextExerciseHref,
    exerciseName: definition.title,
  })
}

// ── i18n key helper ───────────────────────────────────────────────────────

function buildI18nKeys(exerciseId: string): import('@/types/exercise-engine').ExerciseI18nKeys {
  const base = `exercise.${exerciseId.replace(/-/g, '_')}`
  return {
    title: `${base}.title`,
    description: `${base}.description`,
    instruction: `${base}.instruction`,
    startLabel: 'exercise.common.start',
    pauseLabel: 'exercise.common.pause',
    resumeLabel: 'exercise.common.resume',
    exitLabel: 'exercise.common.exit',
    correctLabel: 'exercise.common.correct',
    incorrectLabel: 'exercise.common.incorrect',
    completedLabel: `${base}.completed`,
    practiceAgainLabel: 'exercise.common.practiceAgain',
    questionPrompt: `${base}.questionPrompt`,
    keyboardHint: 'exercise.common.keyboardHint',
  }
}
