'use client'

// useExerciseEngine — the master hook for the AIEE™.
//
// Any exercise component calls this once with its ExerciseDefinition; the
// hook returns everything needed to run the session, track state, and
// generate recommendations — without the component knowing any engine logic.
//
// Sprint 4C-1 Flash Words is the reference migration showing how to adopt
// this hook. Future exercises (RSVP, Memory Palace, Focus training) call
// the same hook with their own definitions.

import { useState, useCallback, useMemo } from 'react'
import type {
  ExerciseDefinition,
  SpeedMs,
  ExercisePersistedState,
  PerformanceMetrics,
  ExerciseRecommendation,
} from '@/types/exercise-engine'
import {
  loadState,
  updateStateAfterSession,
  generateSessionId,
  daysSinceLastSession,
} from '@/lib/exercise-engine/sessionEngine'
import {
  computeNextSpeed,
  computePerformanceMetrics,
  getAccuracyMessage,
} from '@/lib/exercise-engine/performanceEngine'
import { computeRecommendation } from '@/lib/exercise-engine/recommendationEngine'
import { generateSessionSeed } from '@/lib/exercise-engine/randomizationEngine'

type UseExerciseEngineInput<TConfig> = {
  definition: ExerciseDefinition<TConfig>
  nextExerciseId?: string | null
  nextExerciseHref?: string | null
}

type UseExerciseEngineReturn = {
  // Current session config
  speedMs: SpeedMs
  sessionCount: number
  sessionSeed: number
  sessionId: string

  // State
  persistedState: ExercisePersistedState
  daysSinceLastPractice: number | null

  // Completion handler — call with (correctCount, totalCount, durationMs)
  completeSession: (params: { correctCount: number; totalCount: number; durationMs: number }) => {
    metrics: PerformanceMetrics
    recommendation: ExerciseRecommendation
    accuracyMessage: string
  }

  // Reset for a new attempt without the page navigating
  startNewSession: () => void
}

export function useExerciseEngine<TConfig = Record<string, unknown>>({
  definition,
  nextExerciseId = null,
  nextExerciseHref = null,
}: UseExerciseEngineInput<TConfig>): UseExerciseEngineReturn {
  const [persistedState, setPersistedState] = useState<ExercisePersistedState>(
    () => loadState(definition.id),
  )
  const [sessionId, setSessionId] = useState<string>(() => generateSessionId())

  const speedMs: SpeedMs = persistedState.currentSpeedMs
  const sessionCount = persistedState.sessionCount
  const sessionSeed = useMemo(
    () => generateSessionSeed(definition.id, sessionCount),
    [definition.id, sessionCount],
  )

  const completeSession = useCallback(
    (params: { correctCount: number; totalCount: number; durationMs: number }) => {
      const { correctCount, totalCount, durationMs } = params
      const { adaptiveRules, scoringRules, id, title } = definition

      const metrics = computePerformanceMetrics({
        correctCount,
        totalCount,
        sessionDurationMs: durationMs,
        speedMs,
        difficultyTier: persistedState.currentDifficultyTier,
        scoringRules,
      })

      const nextSpeedMs = computeNextSpeed(speedMs, metrics.accuracyPercent, adaptiveRules)
      const isSpeedPersonalBest = nextSpeedMs < persistedState.fastestSpeedMs

      const recommendation = computeRecommendation({
        metrics,
        state: persistedState,
        nextSpeedMs,
        nextExerciseId,
        nextExerciseHref,
        exerciseName: title,
      })

      const nextState = updateStateAfterSession(id, {
        nextSpeedMs,
        nextDifficultyTier: persistedState.currentDifficultyTier,
        accuracyPercent: metrics.accuracyPercent,
        isSpeedPersonalBest,
      })
      setPersistedState(nextState)

      return {
        metrics,
        recommendation,
        accuracyMessage: getAccuracyMessage(metrics.accuracyPercent),
      }
    },
    [definition, speedMs, persistedState, nextExerciseId, nextExerciseHref],
  )

  const startNewSession = useCallback(() => {
    setSessionId(generateSessionId())
    // Reload state from localStorage in case another tab changed it
    setPersistedState(loadState(definition.id))
  }, [definition.id])

  return {
    speedMs,
    sessionCount,
    sessionSeed,
    sessionId,
    persistedState,
    daysSinceLastPractice: daysSinceLastSession(persistedState),
    completeSession,
    startNewSession,
  }
}
