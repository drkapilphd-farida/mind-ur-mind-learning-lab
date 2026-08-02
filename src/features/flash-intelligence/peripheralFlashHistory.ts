// Peripheral Flash™ History — localStorage analytics specific to
// Peripheral Flash, following the exact pattern established by every
// prior mission's history file.

import type { DifficultyTier } from '@/types/exercise-engine'

export type PeripheralFlashSessionEntry = {
  timestamp: number
  tier: DifficultyTier
  accuracyPercent: number
  flashDurationMs: number
  itemCount: number
  promoted: boolean
  recovered: boolean
  averageVisualSpan: number
  peripheralAwarenessScore: number
  // Estimated Session WPM — same reused formula as Word Flash
  // (computeEstimatedSessionWpm), so "Estimated WPM Growth" on the
  // Mission Complete screen means the same thing across every mission.
  estimatedWpm: number
  // The exact word stimuli shown this session (flattened across all
  // positions) — lets the next session exclude them from the pool.
  stimuli: string[]
}

export type PeripheralFlashAnalytics = {
  totalSessions: number
  averageAccuracy: number
  bestAccuracy: number
  totalChallengesProcessed: number
  previousAwarenessScore: number | null
  bestVisualSpanEver: number
  previousEstimatedWpm: number | null
  bestAwarenessScoreEver: number
  recentSessions: PeripheralFlashSessionEntry[]
}

const HISTORY_KEY = (exerciseId: string): string => `peripheral-flash-history-${exerciseId}`
const MAX_ENTRIES = 50

export function loadPeripheralFlashHistory(exerciseId: string): PeripheralFlashSessionEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(HISTORY_KEY(exerciseId))
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as PeripheralFlashSessionEntry[]) : []
  } catch {
    return []
  }
}

export function appendPeripheralFlashSession(exerciseId: string, entry: PeripheralFlashSessionEntry): void {
  if (typeof window === 'undefined') return
  try {
    const history = loadPeripheralFlashHistory(exerciseId)
    history.push(entry)
    localStorage.setItem(HISTORY_KEY(exerciseId), JSON.stringify(history.slice(-MAX_ENTRIES)))
  } catch {
    // storage full — fail silently, server-side practice_sessions record still exists
  }
}

export function getRecentlyShownStimuli(exerciseId: string, sessionWindow = 2): Set<string> {
  const history = loadPeripheralFlashHistory(exerciseId)
  const recentSessions = history.slice(-sessionWindow)
  return new Set(recentSessions.flatMap((entry) => entry.stimuli))
}

export function computePeripheralFlashAnalytics(exerciseId: string): PeripheralFlashAnalytics {
  const history = loadPeripheralFlashHistory(exerciseId)
  if (history.length === 0) {
    return {
      totalSessions: 0,
      averageAccuracy: 0,
      bestAccuracy: 0,
      totalChallengesProcessed: 0,
      previousAwarenessScore: null,
      bestVisualSpanEver: 0,
      previousEstimatedWpm: null,
      bestAwarenessScoreEver: 0,
      recentSessions: [],
    }
  }
  const last = history[history.length - 1]!
  const averageAccuracy = Math.round(history.reduce((a, e) => a + e.accuracyPercent, 0) / history.length)
  const bestAccuracy = Math.max(...history.map((e) => e.accuracyPercent))
  const totalChallengesProcessed = history.reduce((a, e) => a + e.itemCount, 0)
  const bestVisualSpanEver = Math.max(...history.map((e) => e.averageVisualSpan))
  const bestAwarenessScoreEver = Math.max(...history.map((e) => e.peripheralAwarenessScore))

  return {
    totalSessions: history.length,
    averageAccuracy,
    bestAccuracy,
    totalChallengesProcessed,
    previousAwarenessScore: last.peripheralAwarenessScore,
    bestVisualSpanEver,
    previousEstimatedWpm: last.estimatedWpm,
    bestAwarenessScoreEver,
    recentSessions: history.slice(-10),
  }
}
