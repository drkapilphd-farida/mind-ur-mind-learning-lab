// Phrase Reading™ History — localStorage analytics, mirroring PCR's
// mastery-gated history shape (highestLevelReached, tracked stimuli for
// next-session freshness) instead of the old flat single-tier
// phraseWordCount tracking.

import type { DifficultyTier } from '@/types/exercise-engine'
import type { PhraseReadingLevel } from './phraseDifficulty'
import type { PhraseReadingRhythm } from './phraseEngine'

export type PhraseReadingSessionEntry = {
  timestamp: number
  tier: DifficultyTier
  phrasesRead: number
  recognitionAccuracyPercent: number
  estimatedWpm: number
  readingRhythm: PhraseReadingRhythm
  // Highest level actually PASSED this session (mastery-gated, not just
  // attempted) — feeds Mission Complete's lifetime-best stat.
  highestLevelReached: PhraseReadingLevel
  promoted: boolean
  recovered: boolean
  // Exact phrases shown this session — lets the next session/retry exclude
  // them so a fresh attempt feels different, same purpose as every other
  // mission's `stimuli` field.
  stimuli: string[]
}

export type PhraseReadingAnalytics = {
  totalSessions: number
  averageAccuracy: number
  bestAccuracy: number
  totalPhrasesRead: number
  previousEstimatedWpm: number | null
  bestWpmEver: number
  highestLevelEverReached: PhraseReadingLevel | null
  recentSessions: PhraseReadingSessionEntry[]
}

const HISTORY_KEY = (exerciseId: string): string => `phrase-reading-history-${exerciseId}`
const MAX_ENTRIES = 50

export function loadPhraseReadingHistory(exerciseId: string): PhraseReadingSessionEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(HISTORY_KEY(exerciseId))
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as PhraseReadingSessionEntry[]) : []
  } catch {
    return []
  }
}

export function appendPhraseReadingSession(exerciseId: string, entry: PhraseReadingSessionEntry): void {
  if (typeof window === 'undefined') return
  try {
    const history = loadPhraseReadingHistory(exerciseId)
    history.push(entry)
    localStorage.setItem(HISTORY_KEY(exerciseId), JSON.stringify(history.slice(-MAX_ENTRIES)))
  } catch {
    // storage full — fail silently, server-side practice_sessions record still exists
  }
}

export function getRecentlyShownPhrases(exerciseId: string, sessionWindow = 2): Set<string> {
  const history = loadPhraseReadingHistory(exerciseId)
  const recentSessions = history.slice(-sessionWindow)
  return new Set(recentSessions.flatMap((entry) => entry.stimuli))
}

export function computePhraseReadingAnalytics(exerciseId: string): PhraseReadingAnalytics {
  const history = loadPhraseReadingHistory(exerciseId)
  if (history.length === 0) {
    return {
      totalSessions: 0,
      averageAccuracy: 0,
      bestAccuracy: 0,
      totalPhrasesRead: 0,
      previousEstimatedWpm: null,
      bestWpmEver: 0,
      highestLevelEverReached: null,
      recentSessions: [],
    }
  }
  const last = history[history.length - 1]!
  const averageAccuracy = Math.round(history.reduce((a, e) => a + e.recognitionAccuracyPercent, 0) / history.length)
  const bestAccuracy = Math.max(...history.map((e) => e.recognitionAccuracyPercent))
  const totalPhrasesRead = history.reduce((a, e) => a + e.phrasesRead, 0)
  const bestWpmEver = Math.max(...history.map((e) => e.estimatedWpm))
  const highestLevelEverReached = Math.max(...history.map((e) => e.highestLevelReached)) as PhraseReadingLevel

  return {
    totalSessions: history.length,
    averageAccuracy,
    bestAccuracy,
    totalPhrasesRead,
    previousEstimatedWpm: last.estimatedWpm,
    bestWpmEver,
    highestLevelEverReached,
    recentSessions: history.slice(-10),
  }
}
