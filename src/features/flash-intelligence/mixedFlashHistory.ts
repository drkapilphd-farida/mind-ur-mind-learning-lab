// Mixed Flash™ History — localStorage analytics specific to Mixed Flash,
// following the exact pattern established by numberFlashHistory.ts /
// symbolFlashHistory.ts. Stimuli are tracked per type so the next
// session's exclusion can be applied to the right pool (a word shown
// recently shouldn't suppress an unrelated number).

import type { DifficultyTier } from '@/types/exercise-engine'
import type { MixedFlashStimulusType } from './mixedFlashDifficulty'

export type MixedFlashSessionEntry = {
  timestamp: number
  tier: DifficultyTier
  accuracyPercent: number
  flashDurationMs: number
  itemCount: number
  promoted: boolean
  recovered: boolean
  recognitionRatePerMinute: number
  longestComboThisSession: number
  stimuliByType: Record<MixedFlashStimulusType, string[]>
}

export type MixedFlashAnalytics = {
  totalSessions: number
  averageAccuracy: number
  bestAccuracy: number
  totalChallengesProcessed: number
  previousRatePerMinute: number | null
  bestStreakEver: number
  recentSessions: MixedFlashSessionEntry[]
}

const HISTORY_KEY = (exerciseId: string): string => `mixed-flash-history-${exerciseId}`
const MAX_ENTRIES = 50

export function loadMixedFlashHistory(exerciseId: string): MixedFlashSessionEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(HISTORY_KEY(exerciseId))
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as MixedFlashSessionEntry[]) : []
  } catch {
    return []
  }
}

export function appendMixedFlashSession(exerciseId: string, entry: MixedFlashSessionEntry): void {
  if (typeof window === 'undefined') return
  try {
    const history = loadMixedFlashHistory(exerciseId)
    history.push(entry)
    localStorage.setItem(HISTORY_KEY(exerciseId), JSON.stringify(history.slice(-MAX_ENTRIES)))
  } catch {
    // storage full — fail silently, server-side practice_sessions record still exists
  }
}

// Stimuli shown across the last `sessionWindow` sessions, keyed by type —
// used to exclude recently-seen content from the next session's pool for
// that same type.
export function getRecentlyShownByType(
  exerciseId: string,
  sessionWindow = 2,
): Record<MixedFlashStimulusType, Set<string>> {
  const history = loadMixedFlashHistory(exerciseId)
  const recentSessions = history.slice(-sessionWindow)
  const result: Record<MixedFlashStimulusType, Set<string>> = {
    word: new Set(),
    number: new Set(),
    symbol: new Set(),
  }
  for (const entry of recentSessions) {
    for (const type of ['word', 'number', 'symbol'] as const) {
      for (const text of entry.stimuliByType[type] ?? []) {
        result[type].add(text)
      }
    }
  }
  return result
}

export function computeMixedFlashAnalytics(exerciseId: string): MixedFlashAnalytics {
  const history = loadMixedFlashHistory(exerciseId)
  if (history.length === 0) {
    return {
      totalSessions: 0,
      averageAccuracy: 0,
      bestAccuracy: 0,
      totalChallengesProcessed: 0,
      previousRatePerMinute: null,
      bestStreakEver: 0,
      recentSessions: [],
    }
  }
  const last = history[history.length - 1]!
  const averageAccuracy = Math.round(history.reduce((a, e) => a + e.accuracyPercent, 0) / history.length)
  const bestAccuracy = Math.max(...history.map((e) => e.accuracyPercent))
  const totalChallengesProcessed = history.reduce((a, e) => a + e.itemCount, 0)
  const bestStreakEver = Math.max(...history.map((e) => e.longestComboThisSession))

  return {
    totalSessions: history.length,
    averageAccuracy,
    bestAccuracy,
    totalChallengesProcessed,
    previousRatePerMinute: last.recognitionRatePerMinute,
    bestStreakEver,
    recentSessions: history.slice(-10),
  }
}
