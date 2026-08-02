'use client'

// Number Flash™ Experience — Mission 2 of the Flash Intelligence Pack™,
// now running on the Flash Engine's upgraded shared capabilities: an
// intra-session difficulty ramp (Challenge 1-4 at 2 digits, up through
// 17-20 at 6 digits), a gentle intra-session speed ramp, a live
// difficulty indicator, and recent-content exclusion — all supplied by
// the shared engine (difficultyRamp.ts, UniversalExercisePlayer,
// SessionProgress), not reimplemented here.

import { useCallback, useMemo, useState } from 'react'
import { UniversalExercisePlayer } from '@/components/exercise-engine/UniversalExercisePlayer'
import type { RuntimeResultExtraStat, RuntimeResultLabels } from '@/components/exercise-engine/RuntimeResultScreen'
import type { RuntimeResult } from '@/hooks/exercise-engine/useUniversalExerciseRuntime'
import type { SpeedMs } from '@/types/exercise-engine'
import {
  buildRampedSession,
  computeSessionSpeedRamp,
  RAMP_LEVEL_TIERS,
  levelIndexForTier,
} from '@/lib/exercise-engine/difficultyRamp'
import { NUMBER_FLASH_DEFINITION } from '../definitions/numberFlashDefinition'
import { buildNumberFlashItems, computeRecognitionRatePerMinute, computeEstimatedVisualProcessingGrowth } from '../numberFlashEngine'
import { getNumberFlashProfile, numberFlashUiLevel, numberFlashPaceDescriptor } from '../numberFlashDifficulty'
import { computeNumberFlashProgression } from '../numberFlashProgression'
import { buildNumberFlashRecommendation, computeReadingSpeedBenefit } from '../numberFlashRecommendation'
import { appendNumberFlashSession, computeNumberFlashAnalytics, getRecentlyShownStimuli } from '../numberFlashHistory'
import { loadState } from '@/lib/exercise-engine/sessionEngine'
import { getContentForExercise } from '@/lib/exercise-engine/datasetEngine'

// Register the number dataset with the engine on first import
import '../numberFlashDataset'

const EXERCISE_ID = 'number-flash'
// Sprint-12: Flash Intelligence Pack™ is now one guided sequence — this
// points at the next real mission (Symbol Flash), not back to the lab hub.
const NEXT_EXERCISE_HREF = '/labs/quantum-speed-reading/symbol-flash'
const LEVEL_COUNT = RAMP_LEVEL_TIERS.length // 5 — Beginner..Master

const PLAYER_COPY = {
  exit: 'Exit Mission',
  begin: 'Start Mission',
  paused: 'Mission Paused',
  gap: 'Next Flash',
  ready: 'Mission Ready',
  go: 'FLASH',
  prompt: 'Brain Challenge',
  itemNoun: 'Challenge', // Fix 4: "Challenge 3 / 20" — "Mission" now names the whole session
}

const RESULT_LABELS: RuntimeResultLabels = {
  completeSuffix: 'Numerical Recognition Sharpened',
  correctLabel: 'Recognition Accuracy',
  speedLabel: 'Flash Speed',
  scoreLabel: 'Mission Score',
  reactionLabel: 'Average Response Time',
  practiceAgainLabel: 'Retry Mission',
  nextLabel: 'Continue to Next Mission',
}

export function NumberFlashExperience(): React.JSX.Element {
  const [sessionKey, setSessionKey] = useState(0)

  const state = useMemo(
    () => loadState(EXERCISE_ID),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionKey],
  )
  const profile = useMemo(() => getNumberFlashProfile(state.currentDifficultyTier), [state.currentDifficultyTier])

  const analytics = useMemo(
    () => computeNumberFlashAnalytics(EXERCISE_ID),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionKey],
  )

  // Where this session's difficulty ramp starts — the player's own
  // current level, not always Beginner, so a returning Advanced player
  // ramps Advanced→Expert→Master→Master→Master, never resetting progress.
  const startLevelIndex = useMemo(
    () => levelIndexForTier(state.currentDifficultyTier),
    [state.currentDifficultyTier],
  )

  // Build the ramped session: 5 segments (4 challenges each for a 20-item
  // mission), escalating one level per segment. Each segment queries the
  // dataset at its own tier and excludes numbers shown in the last 2
  // sessions (Fix 2), falling back to the unfiltered pool only if
  // exclusion would leave too few candidates to fill the segment.
  const items = useMemo(() => {
    const seed = Date.now() + sessionKey * 99991
    const recentlyShown = getRecentlyShownStimuli(EXERCISE_ID)

    return buildRampedSession({
      totalItems: profile.itemsPerSession,
      levelCount: LEVEL_COUNT,
      startLevelIndex,
      seed,
      buildSegment: (levelIndex, segmentItemCount, segmentSeed) => {
        const tier = RAMP_LEVEL_TIERS[levelIndex]!
        const fullPool = getContentForExercise({
          contentType: 'number',
          locale: 'en',
          difficulty: tier,
          count: 60,
          seed: segmentSeed,
        })
        const freshPool = fullPool.filter((item) => !recentlyShown.has(item.content))
        const pool = freshPool.length >= segmentItemCount ? freshPool : fullPool
        return buildNumberFlashItems(pool, segmentItemCount, segmentSeed)
      },
    })
  }, [startLevelIndex, profile.itemsPerSession, sessionKey])

  // The gentle intra-session speed ramp (Fix 6) — precomputed once per
  // session from the player's current base speed, then indexed by
  // challenge segment. Real SPEED_TIERS values only, floor-clamped at the
  // mission's own minimum so it can never become unfair.
  const computeItemSpeedMs = useCallback((itemIndex: number, totalItems: number, baseSpeedMs: SpeedMs): SpeedMs => {
    const segmentSize = Math.ceil(totalItems / LEVEL_COUNT)
    const segment = Math.min(Math.floor(itemIndex / segmentSize), LEVEL_COUNT - 1)
    const ramp = computeSessionSpeedRamp({
      startSpeedMs: baseSpeedMs,
      segmentCount: LEVEL_COUNT,
      minSpeedMs: NUMBER_FLASH_DEFINITION.adaptiveRules.minSpeedMs,
    })
    return ramp[segment]!
  }, [])

  // Live difficulty indicator (Fix 5) — recomputed as the ramp advances.
  const computeDifficultyLabel = useCallback((itemIndex: number, totalItems: number): string => {
    const segmentSize = Math.ceil(totalItems / LEVEL_COUNT)
    const segment = Math.min(Math.floor(itemIndex / segmentSize), LEVEL_COUNT - 1)
    const levelIndex = Math.min(startLevelIndex + segment, LEVEL_COUNT - 1)
    return numberFlashUiLevel(RAMP_LEVEL_TIERS[levelIndex]!)
  }, [startLevelIndex])

  const computeExtraStats = useCallback((result: RuntimeResult): RuntimeResultExtraStat[] => {
    const { metrics, longestComboThisSession } = result
    const ratePerMinute = computeRecognitionRatePerMinute(metrics.averageReactionTimeMs)
    const growth = computeEstimatedVisualProcessingGrowth(ratePerMinute, analytics.previousRatePerMinute)
    const bestStreak = Math.max(analytics.bestStreakEver, longestComboThisSession)
    const readingSpeedBenefit = computeReadingSpeedBenefit(metrics.accuracyPercent, growth)

    return [
      {
        label: 'Brain Performance',
        value: `${ratePerMinute}/min`,
        hint: 'Numbers recognized per minute at this mission’s pace.',
      },
      {
        label: 'Estimated Visual Processing Growth',
        value: growth === null ? 'Building Your Baseline™' : `${growth > 0 ? '+' : ''}${growth}`,
        hint: 'Estimated from recognition speed trends — not a direct measurement.',
      },
      {
        label: 'Best Streak',
        value: `${bestStreak}`,
        hint: 'Longest run of consecutive correct answers, this mission or any before it.',
      },
      {
        label: 'Estimated Reading Speed Benefit',
        value: readingSpeedBenefit,
        hint: 'A qualitative read on how well this mission’s recognition speed is likely to transfer to real reading.',
      },
    ]
  }, [analytics.previousRatePerMinute, analytics.bestStreakEver])

  const computeCoachMessage = useCallback((result: RuntimeResult): string => {
    const { metrics } = result
    const progression = computeNumberFlashProgression({
      currentTier: metrics.difficultyTier,
      recentAccuracies: [...state.progressCurve.slice(-2), metrics.accuracyPercent],
      averageReactionMs: metrics.averageReactionTimeMs,
      sessionsAtCurrentTier: state.sessionCount,
    })
    const recommendation = buildNumberFlashRecommendation({
      accuracyPercent: metrics.accuracyPercent,
      currentTier: metrics.difficultyTier,
      nextTier: progression.nextTier,
      promoted: progression.promoted,
      recovered: progression.recovered,
    })
    return `${recommendation.coachParagraph} You're training instant numerical recognition — the same rapid-processing skill that speeds up reading comprehension.`
  }, [state.progressCurve, state.sessionCount])

  const handleResultReady = useCallback((result: RuntimeResult): void => {
    const { metrics, longestComboThisSession } = result
    const ratePerMinute = computeRecognitionRatePerMinute(metrics.averageReactionTimeMs)

    const progression = computeNumberFlashProgression({
      currentTier: metrics.difficultyTier,
      recentAccuracies: [...state.progressCurve.slice(-2), metrics.accuracyPercent],
      averageReactionMs: metrics.averageReactionTimeMs,
      sessionsAtCurrentTier: state.sessionCount,
    })

    appendNumberFlashSession(EXERCISE_ID, {
      timestamp: Date.now(),
      tier: metrics.difficultyTier,
      accuracyPercent: metrics.accuracyPercent,
      flashDurationMs: metrics.speedMs,
      itemCount: metrics.totalCount,
      promoted: progression.promoted,
      recovered: progression.recovered,
      recognitionRatePerMinute: ratePerMinute,
      longestComboThisSession,
      stimuli: items.map((item) => item.stimulus),
    })
  }, [state.progressCurve, state.sessionCount, items])

  function handleRestart(): void {
    setSessionKey((k) => k + 1)
  }

  return (
    <UniversalExercisePlayer
      key={sessionKey}
      definition={{
        ...NUMBER_FLASH_DEFINITION,
        metaLine: `${numberFlashUiLevel(state.currentDifficultyTier)} · ${numberFlashPaceDescriptor(state.currentDifficultyTier)} pace · ${profile.itemsPerSession} numbers per mission, difficulty rises as you go${analytics.totalSessions > 0 ? ` · Mission ${analytics.totalSessions + 1}` : ''}`,
      }}
      items={items}
      onRestart={handleRestart}
      onResultReady={handleResultReady}
      computeExtraStats={computeExtraStats}
      computeCoachMessage={computeCoachMessage}
      resultLabels={RESULT_LABELS}
      copy={PLAYER_COPY}
      showCombo
      showFocusLevel
      showAverageResponseTime
      computeItemSpeedMs={computeItemSpeedMs}
      computeDifficultyLabel={computeDifficultyLabel}
      nextExerciseHref={NEXT_EXERCISE_HREF}
    />
  )
}
