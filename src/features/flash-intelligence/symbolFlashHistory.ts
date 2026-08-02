// Symbol Flash™ History — localStorage analytics specific to Symbol
// Flash, following the exact pattern established by numberFlashHistory.ts.

import type { DifficultyTier } from '@/types/exercise-engine'

export type SymbolFlashSessionEntry = {
  timestamp: number
  tier: DifficultyTier
  accuracyPercent: number
  flashDurationMs: number
  itemCount: number
  promoted: boolean
  recovered: boolean
  recognitionRatePerMinute: number
  longestComboThisSession: number
  // The exact stimuli (symbol groups) shown this session — lets the next
  // session exclude their constituent symbols from being over-repeated.
  stimuli: string[]
}

export type SymbolFlashAnalytics = {
  totalSessions: number
  averageAccuracy: number
  bestAccuracy: number
  totalSymbolsProcessed: number
  previousRatePerMinute: number | null
  bestStreakEver: number
  recentSessions: SymbolFlashSessionEntry[]
}

const HISTORY_KEY = (exerciseId: string): string => `symbol-flash-history-${exerciseId}`
const MAX_ENTRIES = 50

export function loadSymbolFlashHistory(exerciseId: string): SymbolFlashSessionEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(HISTORY_KEY(exerciseId))
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as SymbolFlashSessionEntry[]) : []
  } catch {
    return []
  }
}

export function appendSymbolFlashSession(exerciseId: string, entry: SymbolFlashSessionEntry): void {
  if (typeof window === 'undefined') return
  try {
    const history = loadSymbolFlashHistory(exerciseId)
    history.push(entry)
    localStorage.setItem(HISTORY_KEY(exerciseId), JSON.stringify(history.slice(-MAX_ENTRIES)))
  } catch {
    // storage full — fail silently, server-side practice_sessions record still exists
  }
}

// Symbols used across the last `sessionWindow` sessions (individual glyphs,
// extracted from the space-joined group stimuli), used to keep single-
// symbol stimuli from repeating too predictably session to session.
export function getRecentlyShownSymbols(exerciseId: string, sessionWindow = 2): Set<string> {
  const history = loadSymbolFlashHistory(exerciseId)
  const recentSessions = history.slice(-sessionWindow)
  const symbols = recentSessions.flatMap((entry) => entry.stimuli.flatMap((group) => group.split(' ')))
  return new Set(symbols)
}

export function computeSymbolFlashAnalytics(exerciseId: string): SymbolFlashAnalytics {
  const history = loadSymbolFlashHistory(exerciseId)
  if (history.length === 0) {
    return {
      totalSessions: 0,
      averageAccuracy: 0,
      bestAccuracy: 0,
      totalSymbolsProcessed: 0,
      previousRatePerMinute: null,
      bestStreakEver: 0,
      recentSessions: [],
    }
  }
  const last = history[history.length - 1]!
  const averageAccuracy = Math.round(history.reduce((a, e) => a + e.accuracyPercent, 0) / history.length)
  const bestAccuracy = Math.max(...history.map((e) => e.accuracyPercent))
  const totalSymbolsProcessed = history.reduce((a, e) => a + e.itemCount, 0)
  const bestStreakEver = Math.max(...history.map((e) => e.longestComboThisSession))

  return {
    totalSessions: history.length,
    averageAccuracy,
    bestAccuracy,
    totalSymbolsProcessed,
    previousRatePerMinute: last.recognitionRatePerMinute,
    bestStreakEver,
    recentSessions: history.slice(-10),
  }
}
