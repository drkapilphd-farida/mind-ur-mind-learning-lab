'use client'

// Peripheral Flash™ Experience — Mission 5, Visual Span Training. This is
// deliberately NOT Word Flash or Mixed Flash's centered flash-and-choose
// interaction: nothing appears at the center except a fixation dot the
// learner is told to keep looking at. The unique interaction — a
// fixation point with one or more targets positioned around it — is
// built entirely through UniversalExercisePlayer's existing
// renderStimulus/renderOption extension points (the same mechanism
// Multi-Line Reading already proved out), so the Flash Engine itself
// needed zero changes.
//
// The mission is structured around FIVE distinct visual span mechanics
// (see peripheralFlashDifficulty.ts's PeripheralTrainingLevel) rather
// than "the same interaction, just faster" — Level 1 is a single target,
// Level 2 a horizontal pair, Level 3 a vertical pair, Level 4 a triple
// span, and Level 5 an adaptive mastery stage mixing words, numbers, and
// symbols with randomized positions and distances. This structural
// progression — not just typography — is what makes Peripheral Flash
// feel like a genuinely different brain skill from every other Flash
// mission, per this sprint's brief.
//
// Everything else — countdown pacing, progress, combo, avg response
// time, Brain XP, Mission Complete, accessibility, responsive layout — is
// the same shared Flash Engine every prior mission already uses.

import { useCallback, useMemo, useState } from 'react'
import { UniversalExercisePlayer } from '@/components/exercise-engine/UniversalExercisePlayer'
import type { RuntimeResultExtraStat, RuntimeResultLabels } from '@/components/exercise-engine/RuntimeResultScreen'
import type { RuntimeResult } from '@/hooks/exercise-engine/useUniversalExerciseRuntime'
import { FitText } from '@/components/typography/FitText'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import { PERIPHERAL_FLASH_DEFINITION } from '../definitions/peripheralFlashDefinition'
import {
  buildPeripheralFlashItems,
  decodePositionedGroup,
  computeVisualSpan,
  computePeripheralAwarenessScore,
  computeSideBreakdown,
  findWeakerSide,
} from '../peripheralFlashEngine'
import type { PeripheralPosition } from '../peripheralFlashDifficulty'
import {
  getPeripheralFlashProfile,
  peripheralFlashUiLevel,
  peripheralFlashPaceDescriptor,
  peripheralFlashTrainingLevel,
  peripheralFlashQuestionPrompt,
  PERIPHERAL_LEVEL_NAME,
} from '../peripheralFlashDifficulty'
import { computePeripheralFlashProgression } from '../peripheralFlashProgression'
import { buildPeripheralFlashRecommendation, computeReadingSpeedBenefit } from '../peripheralFlashRecommendation'
import { appendPeripheralFlashSession, computePeripheralFlashAnalytics, getRecentlyShownStimuli } from '../peripheralFlashHistory'
// Reused, read-only, from Word Flash — pure functions with no
// mission-specific state, same precedent Mixed Flash already established.
import { computeFlashXp, computeEstimatedSessionWpm, computeEstimatedWpmGrowth } from '../wordFlashEngine'
import { computeReadingReadiness } from '../wordFlashInsights'
import { loadState } from '@/lib/exercise-engine/sessionEngine'
import { getContentForExercise } from '@/lib/exercise-engine/datasetEngine'
import type { ContentItem } from '@/types/exercise-engine'

// Register every dataset Peripheral Flash can draw from. Word Flash's is
// needed at every level; Number/Symbol Flash's are only used at Level 5
// (Adaptive Mastery), but registering them unconditionally avoids the
// exact "empty pool because a dataset wasn't imported yet" bug found and
// fixed in Mixed Flash.
import '../wordFlashDataset'
import '../numberFlashDataset'
import '../symbolFlashDataset'

const EXERCISE_ID = 'peripheral-flash'
// Sprint-12: Peripheral Flash is the last Flash Intelligence Pack™
// mission — this now points into Core Reading Journey™'s first exercise.
const NEXT_EXERCISE_HREF = '/labs/quantum-speed-reading/progressive-chunk-reading'

const PLAYER_COPY_BASE = {
  exit: 'Exit Mission',
  begin: 'Start Mission',
  paused: 'Mission Paused',
  gap: 'Next Flash',
  ready: 'Mission Ready',
  go: 'Eyes on center',
  itemNoun: 'Challenge',
}

const RESULT_LABELS: RuntimeResultLabels = {
  completeSuffix: 'Visual Span Expanded',
  correctLabel: 'Recognition Accuracy',
  speedLabel: 'Flash Speed',
  scoreLabel: 'Mission Score',
  reactionLabel: 'Average Response Time',
  practiceAgainLabel: 'Retry Mission',
  nextLabel: 'Continue to Next Mission',
}

// Unit direction vectors per position — the actual pixel offsets are
// distancePercent (tier-driven) applied to these, so distance and
// direction are cleanly separate concerns.
const POSITION_VECTORS: Record<PeripheralPosition, { dx: number; dy: number }> = {
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
  top: { dx: 0, dy: -1 },
  bottom: { dx: 0, dy: 1 },
  'top-left': { dx: -0.75, dy: -0.75 },
  'top-right': { dx: 0.75, dy: -0.75 },
  'bottom-left': { dx: -0.75, dy: 0.75 },
  'bottom-right': { dx: 0.75, dy: 0.75 },
}

// Widened from the original 260/100 so the flash stimulus can genuinely
// read as the visual hero (a wider FitText container measures larger
// under the shared Typography Engine's cqi-based clamp — see
// FitText.tsx / globals.css's .fit-text-symbol rule, deliberately not
// modified here) and so there's real whitespace around the fixation
// point, per this sprint's "nothing should compete with the stimulus"
// brief.
const DISPLAY_BOX_PX = 320
const PERIPHERAL_SLOT_WIDTH_PX = 180

function positionStyle(position: PeripheralPosition, distancePercent: number): React.CSSProperties {
  const { dx, dy } = POSITION_VECTORS[position]
  return {
    position: 'absolute',
    top: `${50 + dy * distancePercent}%`,
    left: `${50 + dx * distancePercent}%`,
    transform: 'translate(-50%, -50%)',
    width: PERIPHERAL_SLOT_WIDTH_PX,
    textAlign: 'center',
  }
}

// A small, deterministic hash of the encoded stimulus string — used only
// to derive Level 5's per-item distance jitter. Deterministic (not
// Math.random) so a given item always renders identically across
// re-renders, but effectively unpredictable across the session since
// every item's stimulus text differs.
function hashSeed(text: string): number {
  let h = 0
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0
  return Math.abs(h)
}

// The unique interaction: a calm, breathing fixation dot at dead center,
// with the stimulus's positioned targets placed around it. Nothing else
// competes for attention during the flash — no instructions, no chrome —
// since the whole point is undivided peripheral perception.
//
// A factory, not a plain function: distance/jitter/motion preference are
// tier- and system-driven (state outside this function's own scope), and
// renderStimulus is a plain function reference handed to
// UniversalExercisePlayer — it can't read component state on its own, so
// the current session's values have to be captured in closure when the
// render function is created.
function makeRenderPeripheralStimulus(
  distancePercent: number,
  distanceJitterPercent: number,
  prefersReducedMotion: boolean,
): (encoded: string) => React.ReactNode {
  return function renderPeripheralStimulus(encoded: string): React.ReactNode {
    const group = decodePositionedGroup(encoded)
    const jitter = distanceJitterPercent > 0
      ? (hashSeed(encoded) % (distanceJitterPercent * 2 + 1)) - distanceJitterPercent
      : 0
    const effectiveDistance = distancePercent + jitter

    return (
      <div className="relative mx-auto" style={{ width: DISPLAY_BOX_PX, height: DISPLAY_BOX_PX }}>
        <div
          className={cn(
            'absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/70',
            !prefersReducedMotion && 'animate-pulse',
          )}
          style={!prefersReducedMotion ? { animationDuration: '3200ms' } : undefined}
          aria-hidden="true"
        />
        {group.map(({ position, text }) => (
          <div key={position} style={positionStyle(position, effectiveDistance)} aria-hidden="true">
            <FitText text={text} role="symbol" className="font-semibold text-foreground" />
          </div>
        ))}
      </div>
    )
  }
}

// The response phase shows each option as its own readable positioned
// group — "LEFT · focus" style rows, sized as a real answer option (not
// the flash stimulus's hero size, but a clear step up from the previous
// text-sm) — rather than the raw encoded "left: focus" string ChoiceGrid
// would otherwise render verbatim.
function renderPeripheralOption(encoded: string): React.ReactNode {
  const group = decodePositionedGroup(encoded)
  return (
    <div className="flex flex-col items-center gap-1.5">
      {group.map(({ position, text }, idx) => (
        <p key={idx} className="text-xl font-semibold text-foreground sm:text-2xl">
          <span className="mr-1.5 align-middle text-[10px] font-normal uppercase tracking-wider text-muted-foreground">
            {position.replace('-', ' ')}
          </span>
          {text}
        </p>
      ))}
    </div>
  )
}

export function PeripheralFlashExperience(): React.JSX.Element {
  const [sessionKey, setSessionKey] = useState(0)
  const prefersReducedMotion = usePrefersReducedMotion()

  const state = useMemo(
    () => loadState(EXERCISE_ID),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionKey],
  )
  const profile = useMemo(() => getPeripheralFlashProfile(state.currentDifficultyTier), [state.currentDifficultyTier])
  const trainingLevel = useMemo(() => peripheralFlashTrainingLevel(state.currentDifficultyTier), [state.currentDifficultyTier])

  const analytics = useMemo(
    () => computePeripheralFlashAnalytics(EXERCISE_ID),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionKey],
  )
  const previousVisualSpan = analytics.recentSessions[analytics.recentSessions.length - 1]?.averageVisualSpan ?? null

  const copy = useMemo(
    () => ({ ...PLAYER_COPY_BASE, prompt: peripheralFlashQuestionPrompt(state.currentDifficultyTier) }),
    [state.currentDifficultyTier],
  )

  const renderStimulus = useMemo(
    () => makeRenderPeripheralStimulus(profile.distancePercent, profile.distanceJitterPercent, prefersReducedMotion),
    [profile.distancePercent, profile.distanceJitterPercent, prefersReducedMotion],
  )

  const items = useMemo(() => {
    const seed = Date.now() + sessionKey * 99991
    const recentlyShown = getRecentlyShownStimuli(EXERCISE_ID)
    const fullWordPool = getContentForExercise({
      contentType: 'word',
      locale: 'en',
      difficulty: state.currentDifficultyTier,
      count: 60,
      seed,
    })
    const freshWordPool = fullWordPool.filter((w) => !recentlyShown.has(w.content))
    const wordPool = freshWordPool.length >= 20 ? freshWordPool : fullWordPool

    // Level 5 (Adaptive Mastery) only — widen the pool to numbers and
    // symbols too. Every earlier level stays word-only, unchanged.
    let numberPool: ContentItem[] = []
    let symbolPool: ContentItem[] = []
    if (profile.mixedContentTypes) {
      numberPool = getContentForExercise({
        contentType: 'number', locale: 'en', difficulty: state.currentDifficultyTier, count: 30, seed: seed + 1,
      })
      symbolPool = getContentForExercise({
        contentType: 'symbol', locale: 'en', difficulty: state.currentDifficultyTier, count: 30, seed: seed + 2,
      })
    }

    return buildPeripheralFlashItems({
      wordPool,
      numberPool,
      symbolPool,
      stimulusCount: profile.stimulusCount,
      allowedPositions: profile.positions,
      targetCount: profile.itemsPerSession,
      seed,
    })
  }, [state.currentDifficultyTier, profile.stimulusCount, profile.positions, profile.itemsPerSession, profile.mixedContentTypes, sessionKey])

  const itemStimuli = useMemo(() => new Map(items.map((item) => [item.id, item.stimulus])), [items])

  const averageVisualSpanThisSession = useMemo(
    () => computeVisualSpan(items.map((item) => decodePositionedGroup(item.stimulus).length)),
    [items],
  )

  const computeDifficultyLabel = useCallback((): string => {
    return `Level ${trainingLevel} · ${PERIPHERAL_LEVEL_NAME[trainingLevel]}`
  }, [trainingLevel])

  const computeExtraStats = useCallback((result: RuntimeResult): RuntimeResultExtraStat[] => {
    const { metrics } = result
    const awarenessScore = computePeripheralAwarenessScore(metrics.accuracyPercent, averageVisualSpanThisSession)
    const flashXpEarned = computeFlashXp(metrics.performanceScore, metrics.totalCount)
    const spanGrowth = previousVisualSpan === null ? null : averageVisualSpanThisSession - previousVisualSpan
    const readingBenefit = computeReadingSpeedBenefit(metrics.accuracyPercent, spanGrowth)
    const estimatedWpm = computeEstimatedSessionWpm(metrics.accuracyPercent, metrics.averageReactionTimeMs)
    const wpmGrowth = computeEstimatedWpmGrowth(estimatedWpm, analytics.previousEstimatedWpm)

    return [
      {
        label: 'Peripheral Awareness',
        value: `${awarenessScore}`,
        hint: 'Blends recognition accuracy with how demanding this mission’s visual span was.',
      },
      {
        label: 'Visual Span Score',
        value: `${averageVisualSpanThisSession}`,
        hint: 'Average number of targets perceived at once, in a single fixation, this mission.',
      },
      {
        label: 'Brain XP Earned',
        value: `+${flashXpEarned}`,
        hint: 'Personal mastery points from this mission — never compared to other users.',
      },
      {
        label: 'Estimated Reading Benefit',
        value: readingBenefit,
        hint: 'A qualitative read on how well this mission’s visual span gains are likely to transfer to real reading.',
      },
      {
        label: 'Estimated WPM Growth',
        value: wpmGrowth === null ? 'Building Your Baseline™' : `${wpmGrowth >= 0 ? '+' : ''}${wpmGrowth} WPM`,
        hint: 'Change in estimated reading speed versus your last mission — not a measurement of continuous-text reading.',
      },
    ]
  }, [averageVisualSpanThisSession, previousVisualSpan, analytics.previousEstimatedWpm])

  const computeCoachMessage = useCallback((result: RuntimeResult): string => {
    const { metrics, responses } = result
    const progression = computePeripheralFlashProgression({
      currentTier: metrics.difficultyTier,
      recentAccuracies: [...state.progressCurve.slice(-2), metrics.accuracyPercent],
      averageReactionMs: metrics.averageReactionTimeMs,
      sessionsAtCurrentTier: state.sessionCount,
    })
    const visualSpanGrew = previousVisualSpan === null ? null : averageVisualSpanThisSession > previousVisualSpan
    const breakdown = computeSideBreakdown(responses, itemStimuli)
    const weakerSide = findWeakerSide(breakdown)
    const recommendation = buildPeripheralFlashRecommendation({
      accuracyPercent: metrics.accuracyPercent,
      averageVisualSpan: averageVisualSpanThisSession,
      visualSpanGrew,
      currentTier: metrics.difficultyTier,
      nextTier: progression.nextTier,
      nextTrainingLevel: peripheralFlashTrainingLevel(progression.nextTier),
      promoted: progression.promoted,
      recovered: progression.recovered,
      weakerSide,
    })
    return `${recommendation.coachParagraph} You're training your visual span — widening how much you can take in without moving your eyes, a core speed-reading skill.`
  }, [state.progressCurve, state.sessionCount, averageVisualSpanThisSession, previousVisualSpan, itemStimuli])

  const computeResultExtraContent = useCallback((result: RuntimeResult): React.ReactNode => {
    const { metrics } = result
    const readiness = computeReadingReadiness(metrics.accuracyPercent, profile.requiredAccuracyToAdvance)
    const awarenessScore = computePeripheralAwarenessScore(metrics.accuracyPercent, averageVisualSpanThisSession)
    const personalBest = Math.max(analytics.bestAwarenessScoreEver, awarenessScore)
    const missionChain = analytics.totalSessions + 1
    return (
      <div className="space-y-1 text-xs text-muted-foreground">
        <p>Mission Chain: <span className="font-medium text-foreground">{missionChain} mission{missionChain === 1 ? '' : 's'} completed</span></p>
        <p>Personal Best — Peripheral Awareness: <span className="font-medium text-foreground">{personalBest}</span></p>
        <p>Reading Readiness: <span className="font-medium text-foreground">{readiness}</span></p>
      </div>
    )
  }, [profile.requiredAccuracyToAdvance, averageVisualSpanThisSession, analytics.bestAwarenessScoreEver, analytics.totalSessions])

  const handleResultReady = useCallback((result: RuntimeResult): void => {
    const { metrics } = result
    const awarenessScore = computePeripheralAwarenessScore(metrics.accuracyPercent, averageVisualSpanThisSession)
    const estimatedWpm = computeEstimatedSessionWpm(metrics.accuracyPercent, metrics.averageReactionTimeMs)

    const progression = computePeripheralFlashProgression({
      currentTier: metrics.difficultyTier,
      recentAccuracies: [...state.progressCurve.slice(-2), metrics.accuracyPercent],
      averageReactionMs: metrics.averageReactionTimeMs,
      sessionsAtCurrentTier: state.sessionCount,
    })

    const stimuli = items.flatMap((item) => decodePositionedGroup(item.stimulus).map((g) => g.text))

    appendPeripheralFlashSession(EXERCISE_ID, {
      timestamp: Date.now(),
      tier: metrics.difficultyTier,
      accuracyPercent: metrics.accuracyPercent,
      flashDurationMs: metrics.speedMs,
      itemCount: metrics.totalCount,
      promoted: progression.promoted,
      recovered: progression.recovered,
      averageVisualSpan: averageVisualSpanThisSession,
      peripheralAwarenessScore: awarenessScore,
      estimatedWpm,
      stimuli,
    })
  }, [state.progressCurve, state.sessionCount, items, averageVisualSpanThisSession])

  function handleRestart(): void {
    setSessionKey((k) => k + 1)
  }

  return (
    <UniversalExercisePlayer
      key={sessionKey}
      definition={{
        ...PERIPHERAL_FLASH_DEFINITION,
        metaLine: `${PERIPHERAL_LEVEL_NAME[trainingLevel]} · ${peripheralFlashUiLevel(state.currentDifficultyTier)} · ${peripheralFlashPaceDescriptor(state.currentDifficultyTier)} pace · Keep your eyes on the center dot — never chase the words${analytics.totalSessions > 0 ? ` · Mission ${analytics.totalSessions + 1}` : ''}`,
      }}
      items={items}
      renderStimulus={renderStimulus}
      renderOption={renderPeripheralOption}
      onRestart={handleRestart}
      onResultReady={handleResultReady}
      computeExtraStats={computeExtraStats}
      computeCoachMessage={computeCoachMessage}
      computeResultExtraContent={computeResultExtraContent}
      computeDifficultyLabel={computeDifficultyLabel}
      resultLabels={RESULT_LABELS}
      copy={copy}
      showCombo
      showAverageResponseTime
      nextExerciseHref={NEXT_EXERCISE_HREF}
    />
  )
}
