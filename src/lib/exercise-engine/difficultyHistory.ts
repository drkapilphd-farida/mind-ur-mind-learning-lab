// Difficulty History™ — per-exercise analytics tracking in localStorage.
//
// Extends the existing ExercisePersistedState (from sessionEngine.ts) with
// richer history: difficulty progressions, promotion/recovery events, and
// speed milestones. Stored under a separate localStorage key so it doesn't
// interfere with the existing session state schema.

import type { DifficultyTier, SpeedMs } from '@/types/exercise-engine'
import { loadState } from './sessionEngine'

export type DifficultyEventType = 'session' | 'promotion' | 'recovery' | 'manual-reset'

export type DifficultyHistoryEntry = {
  timestamp: number
  tier: DifficultyTier
  accuracyPercent: number
  averageReactionMs: number
  speedMs: SpeedMs
  eventType: DifficultyEventType
  promoted?: boolean      // true if this session triggered a promotion
  recovered?: boolean     // true if this session triggered a recovery
}

export type DifficultyAnalytics = {
  exerciseId: string
  totalSessions: number
  currentTier: DifficultyTier
  bestTierAchieved: DifficultyTier
  bestAccuracyEver: number
  fastestSpeedEver: SpeedMs
  averageAccuracy: number
  promotionCount: number
  recoveryCount: number
  // Last 10 entries for charts
  recentHistory: DifficultyHistoryEntry[]
  // Sessions spent at each tier (for insight into growth)
  tierDuration: Partial<Record<DifficultyTier, number>>
}

const HISTORY_KEY_PREFIX = 'aiee-history-'
const MAX_HISTORY_ENTRIES = 50

function historyKey(exerciseId: string): string {
  return `${HISTORY_KEY_PREFIX}${exerciseId}`
}

// ── Load / Save ────────────────────────────────────────────────────────────

export function loadDifficultyHistory(exerciseId: string): DifficultyHistoryEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(historyKey(exerciseId))
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as DifficultyHistoryEntry[]) : []
  } catch {
    return []
  }
}

export function saveDifficultyHistory(
  exerciseId: string,
  history: DifficultyHistoryEntry[],
): void {
  if (typeof window === 'undefined') return
  try {
    // Keep only the most recent entries
    localStorage.setItem(historyKey(exerciseId), JSON.stringify(history.slice(-MAX_HISTORY_ENTRIES)))
  } catch {
    // Storage full — silent fail, session state in sessionEngine.ts remains intact
  }
}

export function appendDifficultyEntry(
  exerciseId: string,
  entry: Omit<DifficultyHistoryEntry, 'timestamp'>,
): void {
  const history = loadDifficultyHistory(exerciseId)
  history.push({ ...entry, timestamp: Date.now() })
  saveDifficultyHistory(exerciseId, history)
}

export function clearDifficultyHistory(exerciseId: string): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(historyKey(exerciseId))
}

// ── Analytics computation ──────────────────────────────────────────────────

export function computeDifficultyAnalytics(exerciseId: string): DifficultyAnalytics {
  const history = loadDifficultyHistory(exerciseId)
  const sessionState = loadState(exerciseId)

  const sessions = history.filter((e) => e.eventType === 'session')
  const tierRanks: Record<DifficultyTier, number> = {
    beginner: 0, easy: 1, medium: 2, advanced: 3, expert: 4, elite: 5, master: 6, adaptive: 3,
  }

  const bestTier = history.reduce((best, e) => {
    return (tierRanks[e.tier] ?? 0) > (tierRanks[best] ?? 0) ? e.tier : best
  }, 'beginner' as DifficultyTier)

  const fastestSpeed = history.reduce((fastest, e) =>
    e.speedMs < fastest ? e.speedMs : fastest, 1000 as SpeedMs)

  const avgAccuracy = sessions.length > 0
    ? Math.round(sessions.reduce((a, e) => a + e.accuracyPercent, 0) / sessions.length)
    : 0

  const tierDuration: Partial<Record<DifficultyTier, number>> = {}
  for (const e of sessions) {
    tierDuration[e.tier] = (tierDuration[e.tier] ?? 0) + 1
  }

  return {
    exerciseId,
    totalSessions: sessions.length,
    currentTier: sessionState.currentDifficultyTier,
    bestTierAchieved: bestTier,
    bestAccuracyEver: sessionState.bestAccuracy,
    fastestSpeedEver: fastestSpeed,
    averageAccuracy: avgAccuracy,
    promotionCount: history.filter((e) => e.promoted).length,
    recoveryCount: history.filter((e) => e.recovered).length,
    recentHistory: history.slice(-10),
    tierDuration,
  }
}

// ── Adaptive difficulty from history ──────────────────────────────────────

// The master function buildSession() calls to get the right tier for a session.
export function getAdaptiveDifficulty(exerciseId: string): DifficultyTier {
  const state = loadState(exerciseId)
  // Use the persisted tier from sessionEngine — it's already updated after
  // each session by updateStateAfterSession(). The history adds context
  // for promotion/recovery decisions but the canonical tier lives in state.
  return state.currentDifficultyTier
}
