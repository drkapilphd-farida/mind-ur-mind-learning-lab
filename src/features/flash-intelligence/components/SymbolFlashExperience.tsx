'use client'

// Symbol Flash™ Experience — Mission 3 of the Flash Intelligence Pack™.
// Runs on the exact same Flash Engine Word Flash and Number Flash use:
// UniversalExercisePlayer, the shared difficulty ramp orchestrator, the
// gentle intra-session speed ramp, combo micro-feedback, and the Mission
// Complete screen. Only the dataset (symbols, not words/numbers) and the
// challenge logic (group composition + confusable-pair distractors, see
// symbolFlashEngine.ts) are mission-specific.
//
// Symbol Flash's within-session ramp is compositional, not content-tier
// based: buildRampedSession is called with levelCount: 4 (not 5) to match
// the mission's own Challenge 1-5/6-10/11-15/16-20 structure exactly —
// the same shared orchestrator Word/Number Flash use, just configured
// differently, proving it really is reusable rather than hardcoded to one
// mission's shape.

import { useCallback, useMemo, useState } from 'react'
import { UniversalExercisePlayer } from '@/components/exercise-engine/UniversalExercisePlayer'
import type { RuntimeResultExtraStat, RuntimeResultLabels } from '@/components/exercise-engine/RuntimeResultScreen'
import type { RuntimeResult } from '@/hooks/exercise-engine/useUniversalExerciseRuntime'
import type { SpeedMs } from '@/types/exercise-engine'
import { buildRampedSession, computeSessionSpeedRamp } from '@/lib/exercise-engine/difficultyRamp'
import { SYMBOL_FLASH_DEFINITION } from '../definitions/symbolFlashDefinition'
import { buildSymbolFlashItems, computeRecognitionRatePerMinute, computeEstimatedVisualProcessingGrowth } from '../symbolFlashEngine'
import { getSymbolFlashProfile, symbolFlashUiLevel, symbolFlashPaceDescriptor, SYMBOL_GROUP_STAGES, symbolGroupStageLabel } from '../symbolFlashDifficulty'
import { computeSymbolFlashProgression } from '../symbolFlashProgression'
import { buildSymbolFlashRecommendation, computeReadingSpeedBenefit } from '../symbolFlashRecommendation'
import { appendSymbolFlashSession, computeSymbolFlashAnalytics, getRecentlyShownSymbols } from '../symbolFlashHistory'
import { loadState } from '@/lib/exercise-engine/sessionEngine'
import { getContentForExercise } from '@/lib/exercise-engine/datasetEngine'

// Register the symbol dataset with the engine on first import
import '../symbolFlashDataset'

const EXERCISE_ID = 'symbol-flash'
// Sprint-12: Flash Intelligence Pack™ is now one guided sequence — this
// points at the next real mission (Mixed Flash), not back to the lab hub.
const NEXT_EXERCISE_HREF = '/labs/quantum-speed-reading/mixed-flash'
const STAGE_COUNT = SYMBOL_GROUP_STAGES.length // 4 — single/two/three/mixed

const PLAYER_COPY = {
  exit: 'Exit Mission',
  begin: 'Start Mission',
  paused: 'Mission Paused',
  gap: 'Next Flash',
  ready: 'Mission Ready',
  go: 'FLASH',
  prompt: 'Brain Challenge',
  itemNoun: 'Challenge',
}

const RESULT_LABELS: RuntimeResultLabels = {
  completeSuffix: 'Pattern Recognition Sharpened',
  correctLabel: 'Recognition Accuracy',
  speedLabel: 'Flash Speed',
  scoreLabel: 'Mission Score',
  reactionLabel: 'Average Response Time',
  practiceAgainLabel: 'Retry Mission',
  nextLabel: 'Continue to Next Mission',
}

export function SymbolFlashExperience(): React.JSX.Element {
  const [sessionKey, setSessionKey] = useState(0)

  const state = useMemo(
    () => loadState(EXERCISE_ID),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionKey],
  )
  const profile = useMemo(() => getSymbolFlashProfile(state.currentDifficultyTier), [state.currentDifficultyTier])

  const analytics = useMemo(
    () => computeSymbolFlashAnalytics(EXERCISE_ID),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionKey],
  )

  // Build the ramped session: 4 compositional stages (5 challenges each
  // for a 20-item mission) — single symbol, two symbols, three symbols,
  // mixed. Always starts at stage 0 regardless of the player's tier:
  // composing a 3-symbol group isn't a mastery fact that should carry
  // over between sessions the way word/digit length does — it's a fixed
  // warm-up arc within this session. The symbol POOL itself still comes
  // from the player's own current tier, so between-session promotion
  // still means something (rarer, denser glyphs at higher tiers).
  const items = useMemo(() => {
    const seed = Date.now() + sessionKey * 99991
    const recentlyShown = getRecentlyShownSymbols(EXERCISE_ID)

    return buildRampedSession({
      totalItems: profile.itemsPerSession,
      levelCount: STAGE_COUNT,
      startLevelIndex: 0,
      seed,
      buildSegment: (levelIndex, segmentItemCount, segmentSeed) => {
        const groupSize = SYMBOL_GROUP_STAGES[levelIndex]!
        const fullPool = getContentForExercise({
          contentType: 'symbol',
          locale: 'en',
          difficulty: state.currentDifficultyTier,
          count: 60,
          seed: segmentSeed,
        })
        const freshPool = fullPool.filter((item) => !recentlyShown.has(item.content))
        // A single-symbol stage needs at least segmentItemCount distinct
        // symbols; multi-symbol stages need enough to compose that many
        // distinct combinations — either way, fall back to the
        // unfiltered pool if exclusion would leave too little to work
        // with, same graceful-degradation rule Word/Number Flash use.
        const pool = freshPool.length >= fullPool.length / 2 ? freshPool : fullPool
        return buildSymbolFlashItems(pool, groupSize, segmentItemCount, segmentSeed)
      },
    })
  }, [state.currentDifficultyTier, profile.itemsPerSession, sessionKey])

  const computeItemSpeedMs = useCallback((itemIndex: number, totalItems: number, baseSpeedMs: SpeedMs): SpeedMs => {
    const segmentSize = Math.ceil(totalItems / STAGE_COUNT)
    const segment = Math.min(Math.floor(itemIndex / segmentSize), STAGE_COUNT - 1)
    const ramp = computeSessionSpeedRamp({
      startSpeedMs: baseSpeedMs,
      segmentCount: STAGE_COUNT,
      minSpeedMs: SYMBOL_FLASH_DEFINITION.adaptiveRules.minSpeedMs,
    })
    return ramp[segment]!
  }, [])

  // Live difficulty indicator shows the compositional stage — "Single
  // Symbol" / "Two Symbols" / "Three Symbols" / "Mixed Group" — since
  // that's what's actually escalating within this session, not the
  // between-session tier (which stays constant for the whole mission).
  const computeDifficultyLabel = useCallback((itemIndex: number, totalItems: number): string => {
    const segmentSize = Math.ceil(totalItems / STAGE_COUNT)
    const segment = Math.min(Math.floor(itemIndex / segmentSize), STAGE_COUNT - 1)
    return symbolGroupStageLabel(SYMBOL_GROUP_STAGES[segment]!)
  }, [])

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
        hint: 'Symbols recognized per minute at this mission’s pace.',
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
        hint: 'A qualitative read on how well this mission’s eye speed and fixation gains are likely to transfer to real reading.',
      },
    ]
  }, [analytics.previousRatePerMinute, analytics.bestStreakEver])

  const computeCoachMessage = useCallback((result: RuntimeResult): string => {
    const { metrics } = result
    const progression = computeSymbolFlashProgression({
      currentTier: metrics.difficultyTier,
      recentAccuracies: [...state.progressCurve.slice(-2), metrics.accuracyPercent],
      averageReactionMs: metrics.averageReactionTimeMs,
      sessionsAtCurrentTier: state.sessionCount,
    })
    const recommendation = buildSymbolFlashRecommendation({
      accuracyPercent: metrics.accuracyPercent,
      currentTier: metrics.difficultyTier,
      nextTier: progression.nextTier,
      promoted: progression.promoted,
      recovered: progression.recovered,
    })
    return `${recommendation.coachParagraph} You're training instant visual symbol recognition — sharpening the pattern-recognition speed that reading depends on.`
  }, [state.progressCurve, state.sessionCount])

  const handleResultReady = useCallback((result: RuntimeResult): void => {
    const { metrics, longestComboThisSession } = result
    const ratePerMinute = computeRecognitionRatePerMinute(metrics.averageReactionTimeMs)

    const progression = computeSymbolFlashProgression({
      currentTier: metrics.difficultyTier,
      recentAccuracies: [...state.progressCurve.slice(-2), metrics.accuracyPercent],
      averageReactionMs: metrics.averageReactionTimeMs,
      sessionsAtCurrentTier: state.sessionCount,
    })

    appendSymbolFlashSession(EXERCISE_ID, {
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
        ...SYMBOL_FLASH_DEFINITION,
        metaLine: `${symbolFlashUiLevel(state.currentDifficultyTier)} · ${symbolFlashPaceDescriptor(state.currentDifficultyTier)} pace · ${profile.itemsPerSession} symbols per mission, groups grow as you go${analytics.totalSessions > 0 ? ` · Mission ${analytics.totalSessions + 1}` : ''}`,
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
