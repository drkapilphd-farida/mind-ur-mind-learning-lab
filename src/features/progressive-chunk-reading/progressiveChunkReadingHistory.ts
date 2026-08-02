// Progressive Chunk Reading™ History — localStorage analytics, following
// the exact pattern established by every prior mission's history file
// (see peripheralFlashHistory.ts).

import type { DifficultyTier } from '@/types/exercise-engine'
import type { ReadingRhythm } from './progressiveChunkReadingEngine'
import type { ProgressiveChunkReadingLevel } from './progressiveChunkReadingDifficulty'

export type ProgressiveChunkReadingSessionEntry = {
  timestamp: number
  tier: DifficultyTier
  blocksCompleted: number
  chunksRead: number
  recognitionAccuracyPercent: number
  estimatedWpm: number
  readingRhythm: ReadingRhythm
  // The highest level actually reached (mastery-gated: passed, not just
  // attempted) during this session — feeds the Mission Complete "Levels
  // Completed" / lifetime-best stats. Distinct from `tier`/`promoted`,
  // which describe the between-session adaptive-difficulty outcome,
  // unaffected by this within-session level progression.
  highestLevelReached: ProgressiveChunkReadingLevel
  promoted: boolean
  recovered: boolean
  // The exact chunks/phrases shown this session — lets the next session
  // exclude them from the pool, same purpose as every other mission's
  // `stimuli` field.
  stimuli: string[]
}

export type ProgressiveChunkReadingAnalytics = {
  totalSessions: number
  averageAccuracy: number
  bestAccuracy: number
  totalChunksRead: number
  previousEstimatedWpm: number | null
  bestWpmEver: number
  highestLevelEverReached: ProgressiveChunkReadingLevel | null
  recentSessions: ProgressiveChunkReadingSessionEntry[]
}

const HISTORY_KEY = (exerciseId: string): string => `progressive-chunk-reading-history-${exerciseId}`
const MAX_ENTRIES = 50

export function loadProgressiveChunkReadingHistory(exerciseId: string): ProgressiveChunkReadingSessionEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(HISTORY_KEY(exerciseId))
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as ProgressiveChunkReadingSessionEntry[]) : []
  } catch {
    return []
  }
}

export function appendProgressiveChunkReadingSession(exerciseId: string, entry: ProgressiveChunkReadingSessionEntry): void {
  if (typeof window === 'undefined') return
  try {
    const history = loadProgressiveChunkReadingHistory(exerciseId)
    history.push(entry)
    localStorage.setItem(HISTORY_KEY(exerciseId), JSON.stringify(history.slice(-MAX_ENTRIES)))
  } catch {
    // storage full — fail silently, server-side practice_sessions record still exists
  }
}

export function getRecentlyShownStimuli(exerciseId: string, sessionWindow = 2): Set<string> {
  const history = loadProgressiveChunkReadingHistory(exerciseId)
  const recentSessions = history.slice(-sessionWindow)
  return new Set(recentSessions.flatMap((entry) => entry.stimuli))
}

export function computeProgressiveChunkReadingAnalytics(exerciseId: string): ProgressiveChunkReadingAnalytics {
  const history = loadProgressiveChunkReadingHistory(exerciseId)
  if (history.length === 0) {
    return {
      totalSessions: 0,
      averageAccuracy: 0,
      bestAccuracy: 0,
      totalChunksRead: 0,
      previousEstimatedWpm: null,
      bestWpmEver: 0,
      highestLevelEverReached: null,
      recentSessions: [],
    }
  }
  const last = history[history.length - 1]!
  const averageAccuracy = Math.round(history.reduce((a, e) => a + e.recognitionAccuracyPercent, 0) / history.length)
  const bestAccuracy = Math.max(...history.map((e) => e.recognitionAccuracyPercent))
  const totalChunksRead = history.reduce((a, e) => a + e.chunksRead, 0)
  const bestWpmEver = Math.max(...history.map((e) => e.estimatedWpm))
  const highestLevelEverReached = Math.max(...history.map((e) => e.highestLevelReached)) as ProgressiveChunkReadingLevel

  return {
    totalSessions: history.length,
    averageAccuracy,
    bestAccuracy,
    totalChunksRead,
    previousEstimatedWpm: last.estimatedWpm,
    bestWpmEver,
    highestLevelEverReached,
    recentSessions: history.slice(-10),
  }
}
