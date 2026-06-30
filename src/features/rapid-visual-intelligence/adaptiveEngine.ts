// Adaptive Difficulty Engine for Rapid Visual Intelligence™.
//
// Pure logic — no side effects except localStorage persistence. Designed
// so Sprint 4C AI Mentor™ can replace the adjustment logic with an LLM
// recommendation without touching any UI component.

export const FLASH_DURATIONS = [500, 400, 300, 250, 200, 150, 100, 75, 50] as const
export type FlashDuration = (typeof FLASH_DURATIONS)[number]

export const ITEMS_PER_SESSION = 20
export const ACCURACY_THRESHOLD_UP = 90    // % → increase difficulty (shorten flash)
export const ACCURACY_THRESHOLD_DOWN = 70  // % → decrease difficulty (lengthen flash)

function storageKey(exerciseId: string): string {
  return `rvi-difficulty-${exerciseId}`
}

export function getStoredDuration(exerciseId: string): FlashDuration {
  if (typeof window === 'undefined') return 500
  const stored = localStorage.getItem(storageKey(exerciseId))
  const parsed = Number(stored) as FlashDuration
  return (FLASH_DURATIONS as readonly number[]).includes(parsed) ? parsed : 500
}

export function saveDuration(exerciseId: string, durationMs: FlashDuration): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(storageKey(exerciseId), String(durationMs))
}

// Returns the next flash duration based on observed accuracy.
// Accuracy is expressed 0–100. Direction: shorter = harder.
export function computeNextDuration(
  current: FlashDuration,
  accuracyPercent: number,
): FlashDuration {
  const idx = (FLASH_DURATIONS as readonly FlashDuration[]).indexOf(current)
  if (accuracyPercent > ACCURACY_THRESHOLD_UP && idx < FLASH_DURATIONS.length - 1) {
    return FLASH_DURATIONS[idx + 1] as FlashDuration
  }
  if (accuracyPercent < ACCURACY_THRESHOLD_DOWN && idx > 0) {
    return FLASH_DURATIONS[idx - 1] as FlashDuration
  }
  return current
}

export function getDifficultyLabel(durationMs: FlashDuration): string {
  if (durationMs >= 400) return 'Foundation'
  if (durationMs >= 250) return 'Developing'
  if (durationMs >= 150) return 'Advanced'
  if (durationMs >= 75) return 'Expert'
  return 'Elite'
}

export type SessionSummary = {
  correctCount: number
  totalCount: number
  accuracyPercent: number
  prevDurationMs: FlashDuration
  nextDurationMs: FlashDuration
  improved: boolean
}

export function buildSessionSummary(
  correctCount: number,
  totalCount: number,
  prevDurationMs: FlashDuration,
): SessionSummary {
  const accuracyPercent = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0
  const nextDurationMs = computeNextDuration(prevDurationMs, accuracyPercent)
  return {
    correctCount,
    totalCount,
    accuracyPercent,
    prevDurationMs,
    nextDurationMs,
    improved: nextDurationMs < prevDurationMs,
  }
}

// Generate a seeded-but-varied array of indices — ensures each session uses
// different items while remaining deterministic for a given attempt count.
export function shuffleIndices(length: number, seed: number): number[] {
  const arr = Array.from({ length }, (_, i) => i)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = ((seed * 1664525 + 1013904223 + i) >>> 0) % (i + 1)
    const tmp = arr[i]!
    arr[i] = arr[j] ?? i
    arr[j] = tmp
  }
  return arr
}
