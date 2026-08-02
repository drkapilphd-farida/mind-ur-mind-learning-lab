// Word Flash™ History — localStorage analytics specific to Word Flash,
// following the exact pattern established by chunkHistory.ts. Stores the
// pack-specific Reading Speed metrics (Recognition Speed, Estimated WPM
// Growth) and Flash XP separately from the general difficultyHistory.ts so
// future AI Mentor™ work and the eventual pack-wide Weekly Progress view
// can read pack-specific history without touching the universal schema.

import type { DifficultyTier } from '@/types/exercise-engine'

export type WordFlashSessionEntry = {
  timestamp: number
  tier: DifficultyTier
  accuracyPercent: number
  flashDurationMs: number
  itemCount: number
  promoted: boolean
  recovered: boolean
  recognitionSpeedWpm: number
  estimatedWpm: number
  estimatedWpmGrowth: number | null
  flashXpEarned: number
  cumulativeFlashXpAfter: number
  // The exact stimuli shown this session — lets the next session exclude
  // them (Fix 2: "avoid recently used... the experience should feel fresh
  // every session").
  stimuli: string[]
}

export type WordFlashAnalytics = {
  totalSessions: number
  averageAccuracy: number
  bestAccuracy: number
  totalWordsProcessed: number
  totalFlashXp: number
  previousEstimatedWpm: number | null
  recentSessions: WordFlashSessionEntry[]
}

const HISTORY_KEY = (exerciseId: string): string => `word-flash-history-${exerciseId}`
const MAX_ENTRIES = 50

export function loadWordFlashHistory(exerciseId: string): WordFlashSessionEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(HISTORY_KEY(exerciseId))
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as WordFlashSessionEntry[]) : []
  } catch {
    return []
  }
}

export function appendWordFlashSession(exerciseId: string, entry: WordFlashSessionEntry): void {
  if (typeof window === 'undefined') return
  try {
    const history = loadWordFlashHistory(exerciseId)
    history.push(entry)
    localStorage.setItem(HISTORY_KEY(exerciseId), JSON.stringify(history.slice(-MAX_ENTRIES)))
  } catch {
    // storage full — fail silently, server-side practice_sessions record still exists
  }
}

// Stimuli shown across the last `sessionWindow` sessions, used to exclude
// recently-seen words from the next session's candidate pool. A small
// window (not the full 50-entry history) so the pool cycles back into use
// after a couple of sessions rather than shrinking forever.
export function getRecentlyShownStimuli(exerciseId: string, sessionWindow = 2): Set<string> {
  const history = loadWordFlashHistory(exerciseId)
  const recentSessions = history.slice(-sessionWindow)
  return new Set(recentSessions.flatMap((entry) => entry.stimuli))
}

export function computeWordFlashAnalytics(exerciseId: string): WordFlashAnalytics {
  const history = loadWordFlashHistory(exerciseId)
  if (history.length === 0) {
    return {
      totalSessions: 0,
      averageAccuracy: 0,
      bestAccuracy: 0,
      totalWordsProcessed: 0,
      totalFlashXp: 0,
      previousEstimatedWpm: null,
      recentSessions: [],
    }
  }
  const last = history[history.length - 1]!
  const averageAccuracy = Math.round(history.reduce((a, e) => a + e.accuracyPercent, 0) / history.length)
  const bestAccuracy = Math.max(...history.map((e) => e.accuracyPercent))
  const totalWordsProcessed = history.reduce((a, e) => a + e.itemCount, 0)

  return {
    totalSessions: history.length,
    averageAccuracy,
    bestAccuracy,
    totalWordsProcessed,
    totalFlashXp: last.cumulativeFlashXpAfter,
    previousEstimatedWpm: last.estimatedWpm,
    recentSessions: history.slice(-10),
  }
}
