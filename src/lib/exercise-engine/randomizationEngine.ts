// Randomization Engine™ — deterministic, seed-based, universal.
//
// Absorbs the shuffleIndices() function from Sprint 4C-1's adaptiveEngine.ts
// and generalises it with additional strategies. Seeded randomization means
// two students with the same seed get the same order — useful for replay
// and testing — while varying the seed by time + session count ensures no
// two real sessions feel identical.

import type { ContentItem, DifficultyTier } from '@/types/exercise-engine'

// LCG constants (same as Sprint 4C-1 for compatibility)
const LCG_MULTIPLIER = 1664525
const LCG_INCREMENT = 1013904223
const LCG_MODULUS = 0x100000000

function lcgNext(seed: number): number {
  return ((seed * LCG_MULTIPLIER + LCG_INCREMENT) >>> 0) % LCG_MODULUS
}

// Shuffle an array of indices deterministically given a seed.
// The Sprint 4C-1 shuffleIndices() is a special case of this with sequential inputs.
export function shuffleIndices(length: number, seed: number): number[] {
  const arr = Array.from({ length }, (_, i) => i)
  let s = seed
  for (let i = arr.length - 1; i > 0; i--) {
    s = lcgNext(s + i)
    const j = s % (i + 1)
    const tmp = arr[i]!
    arr[i] = arr[j] ?? i
    arr[j] = tmp
  }
  return arr
}

// Shuffle an arbitrary array deterministically
export function shuffleArray<T>(arr: readonly T[], seed: number): T[] {
  const indices = shuffleIndices(arr.length, seed)
  return indices.map((i) => arr[i]!)
}

// Pick N items from a pool using seeded randomization
export function pickItems<T>(pool: readonly T[], count: number, seed: number): T[] {
  const shuffled = shuffleArray(pool, seed)
  return shuffled.slice(0, Math.min(count, pool.length))
}

// Pick content items at a specific difficulty tier, filling with adjacent
// tiers if the exact tier has too few items
export function pickContentItems(
  items: ContentItem[],
  tier: DifficultyTier,
  count: number,
  seed: number,
): ContentItem[] {
  const tierOrder: DifficultyTier[] = ['beginner', 'easy', 'medium', 'advanced', 'expert']
  const tierIdx = tier === 'adaptive' ? 2 : tierOrder.indexOf(tier)

  // Start with exact tier, then expand to neighbours
  const candidates: ContentItem[] = []
  for (let radius = 0; candidates.length < count && radius <= tierOrder.length; radius++) {
    for (const delta of radius === 0 ? [0] : [-radius, radius]) {
      const t = tierOrder[tierIdx + delta]
      if (t !== undefined) {
        const matching = items.filter((item) => item.difficulty === t)
        candidates.push(...matching.filter((m) => !candidates.includes(m)))
      }
    }
  }

  return pickItems(candidates, count, seed)
}

// Generate a session seed from exercise ID + session count + current date
export function generateSessionSeed(exerciseId: string, sessionCount: number): number {
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  const str = `${exerciseId}:${sessionCount}:${today}`
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}
