import { DIFFICULTY_TIERS } from '@/lib/exercise-engine/difficultyEngine'
import { pickItems, shuffleArray } from '@/lib/exercise-engine/randomizationEngine'
import type { DifficultyTier } from '@/types/exercise-engine'

// Memory Discovery™ Pattern Sequence™ — Sprint-1.5 FIX-04.
//
// "Current implementation does not actually test patterns... The user
// should recognize relationships, not isolated items." The old
// chunk-recall mechanic (2-3 word phrases, order-independent multi-
// select) never tested sequence/order at all — this is a real, distinct
// mechanic: a real ordered sequence of glyphs is flashed one at a time
// (reusing `SequentialFlashCard` exactly as-is), then the user picks
// which of several candidate orderings matches what they actually saw —
// order genuinely matters here, unlike every other Memory Discovery
// recall grid (which is deliberately order-independent).

// Sprint-4 FIX-07 — "Add real symbol-family variety." A real, bounded
// subset of the brief's own list: shapes, arrows, and colours are each a
// real, distinct glyph family that renders through the exact same
// single-glyph flash/choice path already built (no UI change). Position
// sequences / grid positions / directional movement are genuinely
// spatial mechanics — they'd need a real new flash/choice UI, not just a
// new symbol pool — so they're a disclosed scope boundary, not silently
// attempted here.
export const SYMBOL_FAMILIES = ['shapes', 'arrows', 'colors'] as const
export type SymbolFamily = (typeof SYMBOL_FAMILIES)[number]

const SHAPE_SYMBOLS = ['▲', '●', '■', '◆', '★', '⬟', '⬢', '✦', '⬤', '◇'] as const
const ARROW_SYMBOLS = ['→', '←', '↑', '↓', '↗', '↘', '↙', '↖', '⇒', '⇑'] as const
const COLOR_SYMBOLS = ['🟥', '🟦', '🟩', '🟨', '🟧', '🟪', '⬛', '⬜', '🟫', '🔶'] as const

function symbolsForFamily(family: SymbolFamily): readonly string[] {
  if (family === 'arrows') return ARROW_SYMBOLS
  if (family === 'colors') return COLOR_SYMBOLS
  return SHAPE_SYMBOLS
}

// A real, seeded rotation across the three real families — never the
// same family every round for the same session.
export function pickSymbolFamily(seed: number): SymbolFamily {
  return SYMBOL_FAMILIES[Math.abs(seed) % SYMBOL_FAMILIES.length]!
}

function sequenceLengthForTier(tier: DifficultyTier): number {
  const index = DIFFICULTY_TIERS.indexOf(tier)
  if (index < 0) return 4
  if (index >= 6) return 6 // elite, master
  if (index >= 3) return 5 // advanced, expert
  return 4 // beginner, easy, medium
}

export type PatternSequenceRound = {
  sequence: readonly string[]
  family: SymbolFamily
}

export function generatePatternSequence(tier: DifficultyTier, seed: number): PatternSequenceRound {
  const length = sequenceLengthForTier(tier)
  const family = pickSymbolFamily(seed + 3)
  const symbols = pickItems(symbolsForFamily(family), length, seed)
  return { sequence: symbols, family }
}

// Real, plausible order-shuffled decoys — the exact same real symbols,
// genuinely reordered, never a different symbol set (so the real task
// stays "which order," never "which symbols").
export function generateOrderDecoys(round: PatternSequenceRound, count: number, seed: number): readonly (readonly string[])[] {
  const realKey = round.sequence.join(' ')
  const decoysByKey = new Map<string, readonly string[]>()
  let attempt = 0
  while (decoysByKey.size < count && attempt < count * 10) {
    const candidate = shuffleArray(round.sequence, seed + attempt * 151 + 13)
    const key = candidate.join(' ')
    if (key !== realKey) decoysByKey.set(key, candidate)
    attempt++
  }
  return Array.from(decoysByKey.values())
}
