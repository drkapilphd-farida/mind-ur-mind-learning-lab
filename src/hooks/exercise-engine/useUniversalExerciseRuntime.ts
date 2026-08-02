'use client'

// Universal Exercise Runtime™ — the master lifecycle hook.
//
// Manages SESSION-level state. The UniversalExercisePlayer manages ITEM-level
// timing (flash/response/feedback/gap). This separation keeps the runtime
// exercise-agnostic: it never needs to know how stimuli are displayed.

import { useState, useCallback, useMemo } from 'react'
import type {
  ExerciseDefinition,
  SessionItem,
  ItemResponse,
  PerformanceMetrics,
  SpeedMs,
} from '@/types/exercise-engine'
import { loadState, updateStateAfterSession } from '@/lib/exercise-engine/sessionEngine'
import { computeNextSpeed } from '@/lib/exercise-engine/performanceEngine'
import { computeRecommendation } from '@/lib/exercise-engine/recommendationEngine'
import { getSpeedLabel } from '@/lib/exercise-engine/speedEngine'
import { getDifficultyLabel } from '@/lib/exercise-engine/difficultyEngine'
import type { ExerciseRecommendation } from '@/types/exercise-engine'
// Sprint 5E — Adaptive Runtime Integration™
import { computePromotion } from '@/lib/exercise-engine/promotionRules'
import { computeRecovery } from '@/lib/exercise-engine/recoveryRules'
import { computeSpeedRecommendation } from '@/lib/exercise-engine/speedRecommendation'
import { appendDifficultyEntry } from '@/lib/exercise-engine/difficultyHistory'

// ── Session-level phases only ─────────────────────────────────────────────
// Item-level phases (flash/response/feedback/gap) are managed by the Player.
export type RuntimePhase = 'idle' | 'countdown' | 'playing' | 'paused' | 'completed'

export type RuntimeResult = {
  metrics: PerformanceMetrics
  recommendation: ExerciseRecommendation
  accuracyMessage: string
  // Longest run of consecutive correct answers within this completed
  // session. Additive field — every existing consumer (Chunk/Phrase/
  // Multi-Line Reading, RVI, Word Flash) simply doesn't read it, nothing
  // about their behavior changes. Added for Number Flash's "Best Streak"
  // result-screen figure, which has no honest way to be computed outside
  // this hook: per-item ItemResponse data lives only in this hook's local
  // state and was never previously exposed past session completion.
  longestComboThisSession: number
  // The full per-item response log for this completed session. Additive,
  // same reasoning as longestComboThisSession — added for Mixed Flash's
  // per-stimulus-type accuracy breakdown, which needs to know which
  // specific items were answered correctly, not just an aggregate. The
  // runtime doesn't need to know what "stimulus type" means — it just
  // exposes the responses it already collects; Mixed Flash cross-
  // references them against its own itemId→type map.
  responses: ItemResponse[]
}

// Exported (not just used internally) so it has direct unit test coverage
// without needing a React-hook-testing harness this project doesn't have
// installed — it's a small pure function, testable in isolation.
export function computeLongestCombo(responses: ItemResponse[]): number {
  let longest = 0
  let current = 0
  for (const response of responses) {
    current = response.isCorrect ? current + 1 : 0
    longest = Math.max(longest, current)
  }
  return longest
}

// ── Metric computation (inline — avoids circular import) ──────────────────

function buildMetrics(
  responses: ItemResponse[],
  speedMs: SpeedMs,
  difficultyTier: import('@/types/exercise-engine').DifficultyTier,
  sessionDurationMs: number,
): PerformanceMetrics {
  const totalCount = responses.length
  const correctCount = responses.filter((r) => r.isCorrect).length
  const accuracyPercent = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0

  const timed = responses.filter((r) => !r.skipped && r.reactionTimeMs > 0)
  const avgReaction = timed.length > 0
    ? Math.round(timed.reduce((a, r) => a + r.reactionTimeMs, 0) / timed.length)
    : 0
  const fastestReaction = timed.length > 0
    ? Math.min(...timed.map((r) => r.reactionTimeMs))
    : 0

  const speedScore = Math.max(0, Math.min(1, (1000 - speedMs) / 950))
  const rawScore = (accuracyPercent / 100) * 0.6 + speedScore * 0.3
  const mult: Record<string, number> = {
    beginner: 0.5, easy: 0.7, medium: 1.0, advanced: 1.3, expert: 1.6,
    elite: 2.0, master: 2.5, adaptive: 1.0,
  }
  const performanceScore = Math.min(100, Math.round(rawScore * 100 * (mult[difficultyTier] ?? 1.0)))
  const mindScoreContribution = Math.round((performanceScore / 100) * 5)

  return {
    accuracyPercent,
    correctCount,
    totalCount,
    sessionDurationMs,
    speedMs,
    difficultyTier,
    averageReactionTimeMs: avgReaction,
    fastestReactionTimeMs: fastestReaction,
    performanceScore,
    mindScoreContribution,
  }
}

function getCoachMessage(accuracy: number, reactionMs: number): string {
  if (accuracy >= 90 && reactionMs < 1500) return 'Exceptional — accuracy and speed are both outstanding.'
  if (accuracy >= 90) return 'Exceptional visual recognition.'
  if (accuracy >= 75) return 'Strong performance. Your visual processing is sharpening.'
  if (accuracy >= 60) return 'Good start. Consistent practice builds the skill.'
  return 'Keep going — the pattern will click with repetition.'
}

// ── Hook ──────────────────────────────────────────────────────────────────

type UseUniversalExerciseRuntimeInput<TConfig> = {
  definition: ExerciseDefinition<TConfig>
  items: SessionItem[]
  nextExerciseId?: string | null
  nextExerciseHref?: string | null
  onSessionComplete?: (result: RuntimeResult) => Promise<void>
}

export type UseUniversalExerciseRuntimeReturn = {
  phase: RuntimePhase
  currentIndex: number
  totalItems: number
  completionPercent: number
  remainingItems: number
  responses: ItemResponse[]
  speedMs: SpeedMs
  speedLabel: string
  difficultyLabel: string
  sessionCount: number
  runningAccuracy: number
  result: RuntimeResult | null

  // Session control
  startSession: () => void      // idle → countdown
  beginPlaying: () => void      // countdown complete → playing
  recordResponse: (response: ItemResponse) => void  // item answered
  pause: () => void
  resume: () => void
  restart: () => void

  // Speed control (Student Speed Control™)
  setManualSpeed: (ms: SpeedMs) => void
  isManualSpeed: boolean
}

export function useUniversalExerciseRuntime<TConfig = Record<string, unknown>>({
  definition,
  items,
  nextExerciseId = null,
  nextExerciseHref = null,
  onSessionComplete,
}: UseUniversalExerciseRuntimeInput<TConfig>): UseUniversalExerciseRuntimeReturn {
  const persistedState = useMemo(() => loadState(definition.id), [definition.id])

  const [phase, setPhase] = useState<RuntimePhase>('idle')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [responses, setResponses] = useState<ItemResponse[]>([])
  const [result, setResult] = useState<RuntimeResult | null>(null)
  const [speedMs, setSpeedMs] = useState<SpeedMs>(persistedState.currentSpeedMs)
  const [isManualSpeed, setIsManualSpeed] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now())

  const totalItems = items.length
  const completionPercent = totalItems > 0 ? Math.round((currentIndex / totalItems) * 100) : 0
  const remainingItems = Math.max(0, totalItems - currentIndex)
  const runningAccuracy = responses.length > 0
    ? Math.round((responses.filter((r) => r.isCorrect).length / responses.length) * 100)
    : 0

  const startSession = useCallback((): void => {
    setPhase('countdown')
    setCurrentIndex(0)
    setResponses([])
    setResult(null)
    setSessionStartTime(Date.now())
  }, [])

  const beginPlaying = useCallback((): void => {
    setPhase('playing')
  }, [])

  const recordResponse = useCallback((response: ItemResponse): void => {
    setResponses((prev) => {
      const newResponses = [...prev, response]
      const nextIdx = currentIndex + 1

      if (nextIdx >= totalItems) {
        // ── Session complete — Adaptive Session Flow™ ───────────────────────
        const durationMs = Date.now() - sessionStartTime
        const currentTier = persistedState.currentDifficultyTier
        const recentCurve = persistedState.progressCurve   // last 10 accuracies

        // Step 1: Compute session metrics
        const metrics = buildMetrics(newResponses, speedMs, currentTier, durationMs)

        // Step 2: Promotion check — multi-factor (accuracy trend + reaction + sessions)
        const recentForPromotion = [...recentCurve.slice(-2), metrics.accuracyPercent]
        const promotionResult = computePromotion({
          currentTier,
          recentAccuracies: recentForPromotion,
          averageReactionMs: metrics.averageReactionTimeMs,
          sessionsAtCurrentTier: persistedState.sessionCount,
        })

        // Step 3: Recovery check — only when not promoting (can't promote and recover)
        const recentForRecovery = [...recentCurve.slice(-1), metrics.accuracyPercent]
        const recoveryResult = promotionResult.shouldPromote
          ? { shouldRecover: false, targetTier: currentTier, reason: '', severity: 'none' as const }
          : computeRecovery({
              currentTier,
              recentAccuracies: recentForRecovery,
              averageReactionMs: metrics.averageReactionTimeMs,
              consecutiveCompletions: persistedState.sessionCount,
            })

        // Step 4: Determine next difficulty tier
        const nextDifficultyTier = promotionResult.shouldPromote
          ? promotionResult.targetTier
          : recoveryResult.shouldRecover
            ? recoveryResult.targetTier
            : currentTier

        // Step 5: Speed recommendation using the full Sprint 5D engine
        const momentumScore = recentCurve.length > 0
          ? Math.round(recentCurve.filter((a) => a >= 70).length / recentCurve.length * 100)
          : 50
        const speedRec = computeSpeedRecommendation({
          currentSpeedMs: speedMs,
          currentTier: nextDifficultyTier,
          accuracyPercent: metrics.accuracyPercent,
          averageReactionMs: metrics.averageReactionTimeMs,
          recentAccuracies: [...recentCurve.slice(-4), metrics.accuracyPercent],
          momentumScore,
        })
        // Use the richer recommendation, but fall back to simple computeNextSpeed as safety
        const simpleNextSpeed = computeNextSpeed(speedMs, metrics.accuracyPercent, definition.adaptiveRules)
        const nextSpeedMs: SpeedMs = speedRec.recommendedSpeed < simpleNextSpeed
          ? speedRec.recommendedSpeed  // both agree to go faster
          : simpleNextSpeed            // conservative: take the slower recommendation

        const isSpeedPB = nextSpeedMs < persistedState.fastestSpeedMs

        // Step 6: Persist to difficulty history (Sprint 5D analytics)
        appendDifficultyEntry(definition.id, {
          tier: currentTier,
          accuracyPercent: metrics.accuracyPercent,
          averageReactionMs: metrics.averageReactionTimeMs,
          speedMs,
          eventType: promotionResult.shouldPromote ? 'promotion' : recoveryResult.shouldRecover ? 'recovery' : 'session',
          promoted: promotionResult.shouldPromote,
          recovered: recoveryResult.shouldRecover,
        })

        // Step 7: Persist updated session state (tier + speed)
        updateStateAfterSession(definition.id, {
          nextSpeedMs,
          nextDifficultyTier,
          accuracyPercent: metrics.accuracyPercent,
          isSpeedPersonalBest: isSpeedPB,
        })

        // Step 8: Build recommendation for result screen
        const recommendation = computeRecommendation({
          metrics,
          state: { ...persistedState, sessionCount: persistedState.sessionCount + 1 },
          nextSpeedMs,
          nextExerciseId,
          nextExerciseHref,
          exerciseName: definition.title,
        })

        const sessionResult: RuntimeResult = {
          metrics,
          recommendation,
          accuracyMessage: getCoachMessage(metrics.accuracyPercent, metrics.averageReactionTimeMs),
          longestComboThisSession: computeLongestCombo(newResponses),
          responses: newResponses,
        }

        setResult(sessionResult)
        setPhase('completed')
        void onSessionComplete?.(sessionResult)
      } else {
        setCurrentIndex(nextIdx)
      }

      return newResponses
    })
  }, [
    currentIndex, totalItems, speedMs, sessionStartTime,
    persistedState, definition, nextExerciseId, nextExerciseHref, onSessionComplete,
  ])

  const pause = useCallback((): void => {
    if (phase === 'playing') setPhase('paused')
  }, [phase])

  const resume = useCallback((): void => {
    if (phase === 'paused') setPhase('playing')
  }, [phase])

  const restart = useCallback((): void => {
    setPhase('countdown')
    setCurrentIndex(0)
    setResponses([])
    setResult(null)
    setSessionStartTime(Date.now())
  }, [])

  const setManualSpeed = useCallback((ms: SpeedMs): void => {
    setSpeedMs(ms)
    setIsManualSpeed(true)
  }, [])

  return {
    phase,
    currentIndex,
    totalItems,
    completionPercent,
    remainingItems,
    responses,
    speedMs,
    speedLabel: getSpeedLabel(speedMs),
    difficultyLabel: getDifficultyLabel(persistedState.currentDifficultyTier),
    sessionCount: persistedState.sessionCount,
    runningAccuracy,
    result,
    startSession,
    beginPlaying,
    recordResponse,
    pause,
    resume,
    restart,
    setManualSpeed,
    isManualSpeed,
  }
}
