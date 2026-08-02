'use client'

// Word Flash™ Experience — the complete exercise consumer for the Flash
// Intelligence Pack™'s entry game, and the platform's flagship for the
// locked "premium cognitive mission" product language and pacing. Still
// runs entirely on the Universal Exercise Runtime™ and Universal Exercise
// Player™ — the same runtime Chunk Reading, Phrase Reading, and Multi-Line
// Reading already use, unmodified in its core mechanics. Every "Mission" /
// "Brain XP" / "Recognition Accuracy" surface below is wired through the
// optional, backward-compatible copy/metric props the shared player and
// result screen gained for exactly this purpose — no other exercise's
// copy or behavior changes as a result of any of it.

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
import { WORD_FLASH_DEFINITION } from '../definitions/wordFlashDefinition'
import { buildWordFlashItems, computeRecognitionSpeedWpm, computeEstimatedSessionWpm, computeEstimatedWpmGrowth, computeFlashXp } from '../wordFlashEngine'
import { getWordFlashProfile, wordFlashUiLevel, wordFlashPaceDescriptor } from '../wordFlashDifficulty'
import { computeWordFlashProgression } from '../wordFlashProgression'
import { buildWordFlashRecommendation } from '../wordFlashRecommendation'
import { appendWordFlashSession, computeWordFlashAnalytics, loadWordFlashHistory, getRecentlyShownStimuli } from '../wordFlashHistory'
import {
  computeMasteryPercent,
  computeReadingReadiness,
  computePersonalBestWpm,
  computeWeeklyMissionCount,
  computeTodaysImprovement,
} from '../wordFlashInsights'
import { loadState } from '@/lib/exercise-engine/sessionEngine'
import { getContentForExercise, getContentFromPool } from '@/lib/exercise-engine/datasetEngine'
import type { ContentItem, ExerciseDefinition } from '@/types/exercise-engine'

// Register the word dataset with the engine on first import
import '../wordFlashDataset'

// Sprint-12: Flash Intelligence Pack™ is now one guided sequence — this
// points at the next real mission (Number Flash), not back to the lab hub.
const NEXT_EXERCISE_HREF = '/labs/quantum-speed-reading/number-flash'
const LEVEL_COUNT = RAMP_LEVEL_TIERS.length // 5 — Beginner..Master

// Locked language system — "Mission," not "Session"; "Brain Challenge," not
// "Question"; never Quiz/Score/Correct/Wrong/Practice/Next/Test/Marks.
const PLAYER_COPY = {
  exit: 'Exit Mission',
  begin: 'Start Mission',
  paused: 'Mission Paused',
  gap: 'Next Flash',
  ready: 'Mission Ready',
  go: 'FLASH',
  prompt: 'Brain Challenge',
  itemNoun: 'Challenge', // Fix 4: "Challenge 3 / 20" — "Mission" names the whole session
}

const RESULT_LABELS: RuntimeResultLabels = {
  completeSuffix: 'Recognition Speed Increased',
  correctLabel: 'Recognition Accuracy',
  speedLabel: 'Flash Speed',
  scoreLabel: 'Brain Performance',
  reactionLabel: 'Reaction Time',
  practiceAgainLabel: 'Replay Mission',
  nextLabel: 'Continue to Next Mission',
}

// Shared, pure derivation used by every result-screen surface (extra
// stats, coach message, extra content) and by the persisted history entry,
// so none of them can ever drift from each other or from what's actually
// saved.
function deriveWordFlashMetrics(
  result: RuntimeResult,
  previousEstimatedWpm: number | null,
): {
  recognitionSpeedWpm: number
  estimatedWpm: number
  estimatedWpmGrowth: number | null
  flashXpEarned: number
} {
  const { metrics } = result
  const recognitionSpeedWpm = computeRecognitionSpeedWpm(metrics.averageReactionTimeMs)
  const estimatedWpm = computeEstimatedSessionWpm(metrics.accuracyPercent, metrics.averageReactionTimeMs)
  const estimatedWpmGrowth = computeEstimatedWpmGrowth(estimatedWpm, previousEstimatedWpm)
  const flashXpEarned = computeFlashXp(metrics.performanceScore, metrics.totalCount)
  return { recognitionSpeedWpm, estimatedWpm, estimatedWpmGrowth, flashXpEarned }
}

type WordFlashExperienceProps = {
  // Sprint QSR-3 — Word Flash Experience Unification™. All optional,
  // additive, and defaulting to exactly today's standalone behavior — the
  // real mission, parameterized rather than forked, so a caller (the
  // Quantum Reading Journey) can supply its own exercise identity and
  // document-derived content pool, and be told when a session completes,
  // without this component knowing anything about the Journey. Same
  // pattern as ProgressiveChunkReadingExperience's own props (QSR-2.6).
  definition?: ExerciseDefinition
  contentPool?: readonly ContentItem[]
  onComplete?: (result: RuntimeResult) => void
}

export function WordFlashExperience({ definition, contentPool, onComplete }: WordFlashExperienceProps = {}): React.JSX.Element {
  const [sessionKey, setSessionKey] = useState(0)
  const resolvedDefinition = definition ?? WORD_FLASH_DEFINITION
  const exerciseId = resolvedDefinition.id

  // Load current difficulty. Re-reads on every restart (sessionKey bump) —
  // updateStateAfterSession() persists a promoted/recovered tier as soon as
  // a session completes, before Replay Mission is clickable, so this
  // picks up the new tier without needing a page reload (matches Chunk
  // Reading / Phrase Reading / Multi-Line Reading).
  const state = useMemo(
    () => loadState(exerciseId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionKey, exerciseId],
  )
  const profile = useMemo(() => getWordFlashProfile(state.currentDifficultyTier), [state.currentDifficultyTier])

  // Word Flash-specific analytics + raw history for display and as the
  // "before this mission" baseline for every comparison figure (Estimated
  // WPM Growth, Personal Best, Weekly Progress, Today's Improvement).
  // Read once per sessionKey, before the mission plays — a stable
  // snapshot safe to reuse across every render of this mission's result
  // screen without ever comparing a mission against itself.
  const analytics = useMemo(
    () => computeWordFlashAnalytics(exerciseId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionKey, exerciseId],
  )
  const historySoFar = useMemo(
    () => loadWordFlashHistory(exerciseId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionKey, exerciseId],
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
  // dataset at its own tier and excludes words shown in the last 2
  // sessions (Fix 2), falling back to the unfiltered pool only if
  // exclusion would leave too few candidates to fill the segment.
  const items = useMemo(() => {
    const seed = Date.now() + sessionKey * 99991
    const recentlyShown = getRecentlyShownStimuli(exerciseId)

    return buildRampedSession({
      totalItems: profile.itemsPerSession,
      levelCount: LEVEL_COUNT,
      startLevelIndex,
      seed,
      buildSegment: (levelIndex, segmentItemCount, segmentSeed) => {
        const tier = RAMP_LEVEL_TIERS[levelIndex]!
        // Sprint QSR-3 — Quantum Experience Parity™. A document-derived
        // pool draws from the learner's own uploaded content instead of
        // the global curated dataset — same real selection pipeline
        // (recent-repeat avoidance + tier fallback), different source.
        const fullPool = contentPool !== undefined
          ? getContentFromPool(contentPool, { difficulty: tier, count: 40, seed: segmentSeed })
          : getContentForExercise({
              contentType: 'word',
              locale: 'en',
              difficulty: tier,
              count: 40,
              seed: segmentSeed,
            })
        const freshPool = fullPool.filter((item) => !recentlyShown.has(item.content))
        const pool = freshPool.length >= segmentItemCount ? freshPool : fullPool
        return buildWordFlashItems(pool, segmentItemCount, segmentSeed)
      },
    })
  }, [startLevelIndex, profile.itemsPerSession, sessionKey, exerciseId, contentPool])

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
      minSpeedMs: WORD_FLASH_DEFINITION.adaptiveRules.minSpeedMs,
    })
    return ramp[segment]!
  }, [])

  // Live difficulty indicator (Fix 5) — recomputed as the ramp advances.
  const computeDifficultyLabel = useCallback((itemIndex: number, totalItems: number): string => {
    const segmentSize = Math.ceil(totalItems / LEVEL_COUNT)
    const segment = Math.min(Math.floor(itemIndex / segmentSize), LEVEL_COUNT - 1)
    const levelIndex = Math.min(startLevelIndex + segment, LEVEL_COUNT - 1)
    return wordFlashUiLevel(RAMP_LEVEL_TIERS[levelIndex]!)
  }, [startLevelIndex])

  // Pure, synchronous — computed in the same render pass as the result
  // screen itself, so nothing pops in a render late (a state-based version
  // was tried first and reproduced a real one-render gap in live testing —
  // see UniversalExercisePlayer's computeExtraStats prop comment).
  const computeExtraStats = useCallback((result: RuntimeResult): RuntimeResultExtraStat[] => {
    const { metrics } = result
    const { recognitionSpeedWpm, estimatedWpmGrowth, flashXpEarned } =
      deriveWordFlashMetrics(result, analytics.previousEstimatedWpm)

    const blendedAccuracy = analytics.totalSessions > 0
      ? (analytics.averageAccuracy * analytics.totalSessions + metrics.accuracyPercent) / (analytics.totalSessions + 1)
      : metrics.accuracyPercent
    const masteryPercent = computeMasteryPercent(metrics.difficultyTier, blendedAccuracy)

    return [
      {
        label: 'Recognition Speed',
        value: `${recognitionSpeedWpm} wpm`,
        hint: 'Words recognized per minute at this mission’s pace.',
      },
      {
        label: 'Estimated WPM Growth',
        value: estimatedWpmGrowth === null ? 'Building Your Baseline™' : `${estimatedWpmGrowth > 0 ? '+' : ''}${estimatedWpmGrowth}`,
        hint: 'Estimated from recognition speed and accuracy trends — not a direct reading measurement.',
      },
      {
        label: 'Brain XP Earned',
        value: `+${flashXpEarned}`,
        hint: 'Personal mastery points from this mission — never compared to other users.',
      },
      {
        label: 'Mastery %',
        value: `${masteryPercent}%`,
        hint: 'Blends your current level with your accuracy consistency.',
      },
    ]
  }, [analytics.previousEstimatedWpm, analytics.totalSessions, analytics.averageAccuracy])

  // Premium brain-coaching copy — combines the accuracy read and the
  // level-progression read into the one coach-message line the result
  // screen shows.
  const computeCoachMessage = useCallback((result: RuntimeResult): string => {
    const { metrics } = result
    const progression = computeWordFlashProgression({
      currentTier: metrics.difficultyTier,
      recentAccuracies: [...state.progressCurve.slice(-2), metrics.accuracyPercent],
      averageReactionMs: metrics.averageReactionTimeMs,
      sessionsAtCurrentTier: state.sessionCount,
    })
    const recommendation = buildWordFlashRecommendation({
      accuracyPercent: metrics.accuracyPercent,
      estimatedWpmGrowth: computeEstimatedWpmGrowth(
        computeEstimatedSessionWpm(metrics.accuracyPercent, metrics.averageReactionTimeMs),
        analytics.previousEstimatedWpm,
      ),
      currentTier: metrics.difficultyTier,
      nextTier: progression.nextTier,
      promoted: progression.promoted,
      recovered: progression.recovered,
    })
    return `${recommendation.coachParagraph} You're training instant word recognition — the visual shortcut fluent readers rely on.`
  }, [state.progressCurve, state.sessionCount, analytics.previousEstimatedWpm])

  // Reading Readiness / Personal Best / Weekly Progress / Today's
  // Improvement / Current Level — the redesigned Mission Complete screen's
  // secondary summary. Every figure is either a direct threshold readout
  // or a comparison against the pre-mission history snapshot above — never
  // a fresh localStorage read at render time (that reintroduces the same
  // race class already found and fixed for computeExtraStats).
  const computeResultExtraContent = useCallback((result: RuntimeResult): React.ReactNode => {
    const { metrics } = result
    const estimatedWpm = computeEstimatedSessionWpm(metrics.accuracyPercent, metrics.averageReactionTimeMs)
    const readiness = computeReadingReadiness(metrics.accuracyPercent, profile.requiredAccuracyToAdvance)
    const priorBest = computePersonalBestWpm(historySoFar)
    const personalBest = priorBest === null ? estimatedWpm : Math.max(priorBest, estimatedWpm)
    const weeklyMissions = computeWeeklyMissionCount(historySoFar) + 1
    const todaysImprovement = computeTodaysImprovement(historySoFar, estimatedWpm)
    const level = wordFlashUiLevel(metrics.difficultyTier)
    const pace = wordFlashPaceDescriptor(metrics.difficultyTier)

    return (
      <div className="space-y-1 text-xs text-muted-foreground">
        <p>Reading Readiness: <span className="font-medium text-foreground">{readiness}</span></p>
        <p>Personal Best: <span className="font-medium text-foreground">{personalBest} wpm</span> · Weekly Progress: <span className="font-medium text-foreground">{weeklyMissions} mission{weeklyMissions === 1 ? '' : 's'}</span></p>
        <p>Current Level: <span className="font-medium text-foreground">{level}</span> · {pace} pace</p>
        {todaysImprovement !== null && (
          <p>Today&rsquo;s Improvement: <span className="font-medium text-foreground">{todaysImprovement > 0 ? '+' : ''}{todaysImprovement} wpm</span></p>
        )}
      </div>
    )
  }, [profile.requiredAccuracyToAdvance, historySoFar])

  // Side effect — fires exactly once when a mission's real result becomes
  // available. Persists the Reading Speed metrics and Brain XP to Word
  // Flash history using the same real session metrics as the render-time
  // functions above, via the shared deriveWordFlashMetrics helper.
  const handleResultReady = useCallback((result: RuntimeResult): void => {
    const { metrics } = result
    const { recognitionSpeedWpm, estimatedWpm, estimatedWpmGrowth, flashXpEarned } =
      deriveWordFlashMetrics(result, analytics.previousEstimatedWpm)
    const cumulativeFlashXpAfter = analytics.totalFlashXp + flashXpEarned

    // Mirrors the internal runtime's own promotion input exactly: the
    // pre-session progressCurve/sessionCount snapshot (captured in `state`
    // when this component mounted for this session, before it was played)
    // plus this session's fresh accuracy — not the post-session state,
    // which updateStateAfterSession has already mutated by the time this
    // fires, and which would double-count this session's accuracy if
    // read again here.
    const progression = computeWordFlashProgression({
      currentTier: metrics.difficultyTier,
      recentAccuracies: [...state.progressCurve.slice(-2), metrics.accuracyPercent],
      averageReactionMs: metrics.averageReactionTimeMs,
      sessionsAtCurrentTier: state.sessionCount,
    })

    appendWordFlashSession(exerciseId, {
      timestamp: Date.now(),
      tier: metrics.difficultyTier,
      accuracyPercent: metrics.accuracyPercent,
      flashDurationMs: metrics.speedMs,
      itemCount: metrics.totalCount,
      promoted: progression.promoted,
      recovered: progression.recovered,
      recognitionSpeedWpm,
      estimatedWpm,
      estimatedWpmGrowth,
      flashXpEarned,
      cumulativeFlashXpAfter,
      stimuli: items.map((item) => item.stimulus),
    })
  }, [analytics.previousEstimatedWpm, analytics.totalFlashXp, state.progressCurve, state.sessionCount, items, exerciseId])

  function handleRestart(): void {
    setSessionKey((k) => k + 1)
  }

  return (
    <UniversalExercisePlayer
      key={sessionKey}
      definition={{
        ...resolvedDefinition,
        // Dynamic caption shows the current level, pace, and mission info
        // on the idle screen — kept separate from `description` so the
        // definition's static "why" copy still reaches the screen.
        metaLine: `${wordFlashUiLevel(state.currentDifficultyTier)} · ${wordFlashPaceDescriptor(state.currentDifficultyTier)} pace · ${profile.itemsPerSession} words per mission${analytics.totalSessions > 0 ? ` · Mission ${analytics.totalSessions + 1}` : ''}`,
      }}
      items={items}
      onRestart={handleRestart}
      onResultReady={handleResultReady}
      computeExtraStats={computeExtraStats}
      computeCoachMessage={computeCoachMessage}
      computeResultExtraContent={computeResultExtraContent}
      resultLabels={RESULT_LABELS}
      copy={PLAYER_COPY}
      showCombo
      showFocusLevel
      showAverageResponseTime
      computeItemSpeedMs={computeItemSpeedMs}
      computeDifficultyLabel={computeDifficultyLabel}
      nextExerciseHref={NEXT_EXERCISE_HREF}
      {...(onComplete !== undefined ? { onNext: onComplete } : {})}
    />
  )
}
