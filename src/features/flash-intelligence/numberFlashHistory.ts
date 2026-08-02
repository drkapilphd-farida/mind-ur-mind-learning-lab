// Number Flash™ History — localStorage analytics specific to Number
// Flash, following the exact pattern established by wordFlashHistory.ts.
// Tracks the mission-specific figures (recognition rate, longest streak)
// separately from the universal difficultyHistory.ts.

import type { DifficultyTier } from '@/types/exercise-engine'

export type NumberFlashSessionEntry = {
  timestamp: number
  tier: DifficultyTier
  accuracyPercent: number
  flashDurationMs: number
  itemCount: number
  promoted: boolean
  recovered: boolean
  recognitionRatePerMinute: number
  longestComboThisSession: number
  // The exact stimuli shown this session — lets the next session exclude
  // them (Fix 2: "avoid recently used numbers... the experience should
  // feel fresh every session").
  stimuli: string[]
}

export type NumberFlashAnalytics = {
  totalSessions: number
  averageAccuracy: number
  bestAccuracy: number
  totalNumbersProcessed: number
  previousRatePerMinute: number | null
  bestStreakEver: number
  recentSessions: NumberFlashSessionEntry[]
}

const HISTORY_KEY = (exerciseId: string): string => `number-flash-history-${exerciseId}`
const MAX_ENTRIES = 50

export function loadNumberFlashHistory(exerciseId: string): NumberFlashSessionEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(HISTORY_KEY(exerciseId))
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as NumberFlashSessionEntry[]) : []
  } catch {
    return []
  }
}

export function appendNumberFlashSession(exerciseId: string, entry: NumberFlashSessionEntry): void {
  if (typeof window === 'undefined') return
  try {
    const history = loadNumberFlashHistory(exerciseId)
    history.push(entry)
    localStorage.setItem(HISTORY_KEY(exerciseId), JSON.stringify(history.slice(-MAX_ENTRIES)))
  } catch {
    // storage full — fail silently, server-side practice_sessions record still exists
  }
}

// Stimuli shown across the last `sessionWindow` sessions, used to exclude
// recently-seen numbers from the next session's candidate pool. A small
// window (not the full 50-entry history) so the pool cycles back into use
// after a couple of sessions rather than shrinking forever.
export function getRecentlyShownStimuli(exerciseId: string, sessionWindow = 2): Set<string> {
  const history = loadNumberFlashHistory(exerciseId)
  const recentSessions = history.slice(-sessionWindow)
  return new Set(recentSessions.flatMap((entry) => entry.stimuli))
}

export function computeNumberFlashAnalytics(exerciseId: string): NumberFlashAnalytics {
  const history = loadNumberFlashHistory(exerciseId)
  if (history.length === 0) {
    return {
      totalSessions: 0,
      averageAccuracy: 0,
      bestAccuracy: 0,
      totalNumbersProcessed: 0,
      previousRatePerMinute: null,
      bestStreakEver: 0,
      recentSessions: [],
    }
  }
  const last = history[history.length - 1]!
  const averageAccuracy = Math.round(history.reduce((a, e) => a + e.accuracyPercent, 0) / history.length)
  const bestAccuracy = Math.max(...history.map((e) => e.accuracyPercent))
  const totalNumbersProcessed = history.reduce((a, e) => a + e.itemCount, 0)
  const bestStreakEver = Math.max(...history.map((e) => e.longestComboThisSession))

  return {
    totalSessions: history.length,
    averageAccuracy,
    bestAccuracy,
    totalNumbersProcessed,
    previousRatePerMinute: last.recognitionRatePerMinute,
    bestStreakEver,
    recentSessions: history.slice(-10),
  }
}
