// Mixed Flash™ Engine — the Boss Mission's "challenge logic" is
// deliberately NOT a fourth reimplementation of distractor generation.
// Every stimulus type already has a correct, tested generator — Word
// Flash's family-based word distractors, Number Flash's digit-
// perturbation, Symbol Flash's confusable-pair swaps — so this file's
// only real job is orchestration: decide which type each challenge is,
// then hand off to the exact existing builder for that type. Zero
// duplicated distractor logic, per the mission brief's explicit
// "Do NOT duplicate any code."
//
// The same reuse principle applies to the two generic Reading Speed
// formulas below: they're identical, pure, mission-agnostic math already
// implemented in numberFlashEngine.ts. Re-deriving them a fourth time
// would itself be the kind of duplication this mission was told to
// avoid, so they're imported from there rather than redefined — Number
// Flash's file is only read from, never modified.

import type { ContentItem, SessionItem } from '@/types/exercise-engine'
import type { DifficultyTier } from '@/types/exercise-engine'
import { shuffleIndices } from '@/lib/exercise-engine/randomizationEngine'
import { getContentForExercise } from '@/lib/exercise-engine/datasetEngine'
import { buildWordFlashItems } from './wordFlashEngine'
import { buildNumberFlashItems } from './numberFlashEngine'
import { buildSymbolFlashItems } from './symbolFlashEngine'
import {
  typeWeightsForTier,
  shouldAvoidImmediateRepeat,
  type MixedFlashStimulusType,
  type TypeWeights,
} from './mixedFlashDifficulty'

export type { MixedFlashStimulusType } from './mixedFlashDifficulty'
export { computeRecognitionRatePerMinute, computeEstimatedVisualProcessingGrowth } from './numberFlashEngine'

// ── Stimulus type sequence (Fix: "the sequence must be unpredictable") ───

function pickWeightedType(weights: TypeWeights, seed: number): MixedFlashStimulusType {
  // A pseudo-random float in [0, 1) reused from the existing seeded
  // shuffle utility — no new randomness primitive added to the shared
  // engine, just an existing one applied to a 1000-way roll.
  const roll = shuffleIndices(1000, seed)[0]! / 1000
  const entries = Object.entries(weights) as [MixedFlashStimulusType, number][]
  let cumulative = 0
  for (const [type, weight] of entries) {
    cumulative += weight
    if (roll < cumulative) return type
  }
  return entries[entries.length - 1]![0]
}

export function generateStimulusTypeSequence(
  itemCount: number,
  tier: DifficultyTier,
  seed: number,
): MixedFlashStimulusType[] {
  const weights = typeWeightsForTier(tier)
  const avoidRepeat = shouldAvoidImmediateRepeat(tier)
  const sequence: MixedFlashStimulusType[] = []

  for (let i = 0; i < itemCount; i++) {
    let type = pickWeightedType(weights, seed + i * 7919)
    if (avoidRepeat && sequence.length > 0 && type === sequence[sequence.length - 1]) {
      // One re-roll on an immediate repeat — encourages switching without
      // rigidly excluding a type, which would distort the tier's weights.
      type = pickWeightedType(weights, seed + i * 7919 + 4001)
    }
    sequence.push(type)
  }

  return sequence
}

// ── Orchestration ──────────────────────────────────────────────────────

function queryPool(
  type: MixedFlashStimulusType,
  tier: DifficultyTier,
  seed: number,
  excludeTexts: ReadonlySet<string>,
): ContentItem[] {
  const fullPool = getContentForExercise({
    contentType: type,
    locale: 'en',
    difficulty: tier,
    count: 60,
    seed,
  })
  const freshPool = fullPool.filter((item) => !excludeTexts.has(item.content))
  return freshPool.length >= 4 ? freshPool : fullPool
}

function buildOneItem(type: MixedFlashStimulusType, pool: ContentItem[], seed: number): SessionItem | null {
  // Each existing builder already validates and skips rather than
  // fabricates; retrying with a different seed a few times covers the
  // rare case where the FIRST candidate it lands on can't be paired with
  // 3 distractors, without ever inventing content.
  for (let attempt = 0; attempt < 3; attempt++) {
    const trySeed = seed + attempt * 6151
    const built =
      type === 'word' ? buildWordFlashItems(pool, 1, trySeed)
      : type === 'number' ? buildNumberFlashItems(pool, 1, trySeed)
      : buildSymbolFlashItems(pool, 1, 1, trySeed)
    if (built.length > 0) return built[0]!
  }
  return null
}

export type MixedFlashSession = {
  items: SessionItem[]
  // Maps each SessionItem's id to which stimulus type it was — the basis
  // for the Mission Complete screen's Stimulus Breakdown. Built here
  // (where the type is already known) rather than re-derived later from
  // the item's content, which would require guessing.
  itemTypes: Map<string, MixedFlashStimulusType>
}

export function buildMixedFlashSession(params: {
  tier: DifficultyTier
  itemCount: number
  seed: number
  recentlyShownByType: Record<MixedFlashStimulusType, ReadonlySet<string>>
}): MixedFlashSession {
  const { tier, itemCount, seed, recentlyShownByType } = params
  const sequence = generateStimulusTypeSequence(itemCount, tier, seed)

  const items: SessionItem[] = []
  const itemTypes = new Map<string, MixedFlashStimulusType>()
  const usedThisSession: Record<MixedFlashStimulusType, Set<string>> = { word: new Set(), number: new Set(), symbol: new Set() }

  sequence.forEach((type, i) => {
    const itemSeed = seed + i * 31337
    const excluded = new Set([...recentlyShownByType[type], ...usedThisSession[type]])
    const pool = queryPool(type, tier, itemSeed, excluded)
    const item = buildOneItem(type, pool, itemSeed)
    if (item === null) return

    items.push(item)
    itemTypes.set(item.id, type)
    usedThisSession[type].add(item.stimulus)
  })

  return { items, itemTypes }
}

// ── Stimulus Breakdown (Mission Complete) ─────────────────────────────────

export type StimulusTypeBreakdown = Record<MixedFlashStimulusType, { correct: number; total: number }>

export function computeStimulusBreakdown(
  responses: ReadonlyArray<{ itemId: string; isCorrect: boolean }>,
  itemTypes: ReadonlyMap<string, MixedFlashStimulusType>,
): StimulusTypeBreakdown {
  const breakdown: StimulusTypeBreakdown = {
    word: { correct: 0, total: 0 },
    number: { correct: 0, total: 0 },
    symbol: { correct: 0, total: 0 },
  }
  for (const response of responses) {
    const type = itemTypes.get(response.itemId)
    if (type === undefined) continue
    breakdown[type].total++
    if (response.isCorrect) breakdown[type].correct++
  }
  return breakdown
}

// The stimulus type with the lowest accuracy among types that were
// actually tested enough to be meaningful (at least 2 items) — the basis
// for the AI Coach's "X needs more practice" callout. Returns null when
// there's no meaningful signal (e.g. every type had 0-1 items).
export function findWeakestStimulusType(breakdown: StimulusTypeBreakdown): MixedFlashStimulusType | null {
  let weakest: MixedFlashStimulusType | null = null
  let weakestAccuracy = Infinity
  for (const [type, stats] of Object.entries(breakdown) as [MixedFlashStimulusType, { correct: number; total: number }][]) {
    if (stats.total < 2) continue
    const accuracy = stats.correct / stats.total
    if (accuracy < weakestAccuracy) {
      weakestAccuracy = accuracy
      weakest = type
    }
  }
  return weakest
}

export function findStrongestStimulusType(breakdown: StimulusTypeBreakdown): MixedFlashStimulusType | null {
  let strongest: MixedFlashStimulusType | null = null
  let strongestAccuracy = -Infinity
  for (const [type, stats] of Object.entries(breakdown) as [MixedFlashStimulusType, { correct: number; total: number }][]) {
    if (stats.total < 2) continue
    const accuracy = stats.correct / stats.total
    if (accuracy > strongestAccuracy) {
      strongestAccuracy = accuracy
      strongest = type
    }
  }
  return strongest
}
