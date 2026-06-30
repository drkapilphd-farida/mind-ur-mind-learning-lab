// Session Engine™ — manages exercise session lifecycle and localStorage persistence.
//
// Absorbs getStoredDuration()/saveDuration() from Sprint 4C-1 and generalises
// them into a universal state persistence system. Every exercise stores its
// state under the same schema; the engine reads/writes it consistently.

import type { ExercisePersistedState, SpeedMs, DifficultyTier } from '@/types/exercise-engine'
import { isValidSpeed, clampToValidSpeed } from './speedEngine'

const STORAGE_PREFIX = 'aiee-state-'

function storageKey(exerciseId: string): string {
  return `${STORAGE_PREFIX}${exerciseId}`
}

// Generate a unique session ID
export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export const DEFAULT_STATE: ExercisePersistedState = {
  currentSpeedMs: 500,
  currentDifficultyTier: 'beginner',
  sessionCount: 0,
  bestAccuracy: 0,
  fastestSpeedMs: 500,
  lastSessionAt: null,
  progressCurve: [],
}

export function loadState(exerciseId: string): ExercisePersistedState {
  if (typeof window === 'undefined') return DEFAULT_STATE
  try {
    const raw = localStorage.getItem(storageKey(exerciseId))
    if (!raw) return DEFAULT_STATE
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return DEFAULT_STATE

    const p = parsed as Partial<ExercisePersistedState>
    const speed = isValidSpeed(p.currentSpeedMs ?? 0)
      ? (p.currentSpeedMs as SpeedMs)
      : clampToValidSpeed(p.currentSpeedMs ?? 500)

    return {
      currentSpeedMs: speed,
      currentDifficultyTier: (p.currentDifficultyTier ?? 'beginner') as DifficultyTier,
      sessionCount: Number(p.sessionCount ?? 0),
      bestAccuracy: Number(p.bestAccuracy ?? 0),
      fastestSpeedMs: isValidSpeed(p.fastestSpeedMs ?? 0)
        ? (p.fastestSpeedMs as SpeedMs)
        : clampToValidSpeed(p.fastestSpeedMs ?? 500),
      lastSessionAt: p.lastSessionAt ?? null,
      progressCurve: Array.isArray(p.progressCurve) ? p.progressCurve.slice(-10) : [],
    }
  } catch {
    return DEFAULT_STATE
  }
}

export function saveState(exerciseId: string, state: ExercisePersistedState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(storageKey(exerciseId), JSON.stringify(state))
  } catch {
    // localStorage full or blocked — fail silently, practice still recorded server-side
  }
}

export function updateStateAfterSession(
  exerciseId: string,
  update: {
    nextSpeedMs: SpeedMs
    nextDifficultyTier: DifficultyTier
    accuracyPercent: number
    isSpeedPersonalBest: boolean
  },
): ExercisePersistedState {
  const prev = loadState(exerciseId)
  const next: ExercisePersistedState = {
    currentSpeedMs: update.nextSpeedMs,
    currentDifficultyTier: update.nextDifficultyTier,
    sessionCount: prev.sessionCount + 1,
    bestAccuracy: Math.max(prev.bestAccuracy, update.accuracyPercent),
    fastestSpeedMs: update.isSpeedPersonalBest ? update.nextSpeedMs : prev.fastestSpeedMs,
    lastSessionAt: Date.now(),
    progressCurve: [...prev.progressCurve, update.accuracyPercent].slice(-10),
  }
  saveState(exerciseId, next)
  return next
}

export function clearState(exerciseId: string): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(storageKey(exerciseId))
}

// How many days since the student last practiced this exercise
export function daysSinceLastSession(state: ExercisePersistedState): number | null {
  if (state.lastSessionAt === null) return null
  const diffMs = Date.now() - state.lastSessionAt
  return Math.floor(diffMs / 86_400_000)
}
