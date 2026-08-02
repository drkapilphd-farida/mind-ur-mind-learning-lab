'use client'

// UniversalExercisePlayer™ — executes any exercise from ExerciseDefinition + items.
// Session-level state: managed by useUniversalExerciseRuntime.
// Item-level timing: managed locally (flash/response/feedback/gap).
// This player never changes when exercises are added.

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { savePracticeSession } from '@/lib/exercises/actions/savePracticeSession'
import {
  useUniversalExerciseRuntime,
  type RuntimeResult,
} from '@/hooks/exercise-engine/useUniversalExerciseRuntime'
import { ExerciseCountdown } from './ExerciseCountdown'
import { FlashStimulus } from './FlashStimulus'
import { ChoiceGrid } from './ChoiceGrid'
import { SessionProgress } from './SessionProgress'
import { RuntimeResultScreen, type RuntimeResultExtraStat, type RuntimeResultLabels } from './RuntimeResultScreen'
import { SpeedControl } from './SpeedControl'
import { MicroVictoryMoment } from '@/components/exercises/MicroVictoryMoment'
import { useMicroVictoryReveal } from '@/hooks/exercises/useMicroVictoryReveal'
import type { ExerciseDefinition, SessionItem, ItemResponse, SpeedMs } from '@/types/exercise-engine'

type ItemPhase = 'flash' | 'response' | 'feedback' | 'gap'

const FEEDBACK_MS = 450
const GAP_MS = 600

// Optional copy overrides for the player's own chrome (exit/begin/pause/
// resume/paused text, the between-items gap label, the countdown's pacing
// beats, the ChoiceGrid prompt, and the session-progress item noun). One
// consolidated object rather than ten separate props; every field
// defaults to the existing text below when omitted, so every current
// caller renders exactly as before.
type UniversalExercisePlayerCopy = {
  exit?: string        // default 'Exit exercise' (aria-label) / 'Exit' (visible)
  begin?: string        // default 'Begin'
  pause?: string        // default 'Pause'
  resume?: string       // default 'Resume'
  paused?: string        // default 'Paused'
  gap?: string           // shown briefly between items; omitted by default (bare dot only)
  ready?: string          // countdown "ready" beat; omitted by default (countdown starts immediately)
  go?: string             // countdown "go" beat; omitted by default (flash starts immediately at 0)
  prompt?: string          // ChoiceGrid prompt; default 'What did you see?'
  itemNoun?: string         // SessionProgress item counter prefix; omitted by default (bare "N / Total")
}

type UniversalExercisePlayerProps<TConfig> = {
  definition: ExerciseDefinition<TConfig>
  items: SessionItem[]
  nextExerciseId?: string | null
  nextExerciseHref?: string | null
  renderStimulus?: (stimulus: string) => React.ReactNode
  // Optional separate renderer for ChoiceGrid options. Defaults to reusing
  // renderStimulus (correct for exercises where an option is just the same
  // kind of content at a smaller size — chunks, phrases, icons). Provide
  // this explicitly when the stimulus renderer does something an option
  // must NOT do — e.g. Multi-Line Reading's renderStimulus looks up and
  // renders an entire paragraph around its argument; reusing it for a
  // single-line option would render the whole paragraph inside one button.
  renderOption?: (option: string) => React.ReactNode
  // Called when the player's Practice Again button is pressed — parent should
  // regenerate items with a new seed before the next session starts.
  onRestart?: () => void
  // Called exactly once, as soon as a session's result becomes available —
  // fires before the result screen is shown, not on Practice Again. Lets a
  // parent persist exercise-specific analytics (e.g. Word Flash's Reading
  // Speed metrics and Flash XP) using the real session metrics, instead of
  // deferring to onRestart where reaction-time/accuracy data would no
  // longer be available.
  onResultReady?: (result: RuntimeResult) => void
  // Optional extra stat tiles shown on the result screen beneath the
  // universal four (Correct/Speed/Score/Avg reaction). Deliberately a pure
  // function computed synchronously at render time from the real result —
  // not a value passed in from parent state — so the tiles appear in the
  // exact same render as the rest of the result screen. A state-based
  // version (set via onResultReady in a parent effect) was tried first and
  // reproduced a real one-render-late pop-in: on a fast run the result
  // screen would briefly render without the extra tiles, then jump to
  // include them a moment later, shifting everything below down. A pure
  // render-time function has no such gap.
  computeExtraStats?: (result: RuntimeResult) => RuntimeResultExtraStat[]
  // Same pure-render-time-function pattern as computeExtraStats, for the
  // same reason: avoids a one-render-late pop-in versus a state round-trip.
  computeCoachMessage?: (result: RuntimeResult) => string
  computeResultExtraContent?: (result: RuntimeResult) => React.ReactNode
  resultLabels?: RuntimeResultLabels
  // Player chrome copy overrides — see UniversalExercisePlayerCopy above.
  copy?: UniversalExercisePlayerCopy
  // Opt-in gamification displays computed from data the runtime already
  // tracks (runtime.responses) — no new state, purely derived. Off by
  // default for every existing exercise.
  showCombo?: boolean
  showFocusLevel?: boolean
  // Per-item flash-duration override — the intra-session Speed Ramp (Fix
  // 6, difficultyRamp.ts's computeSessionSpeedRamp). Receives the current
  // item index/total and the session's base speed, returns the duration
  // to actually flash THIS item for. Ignored while the student has an
  // active manual speed override — manual control always wins. Omitted
  // by default: every exercise not passing this flashes every item at the
  // same base speed, exactly as before.
  computeItemSpeedMs?: (itemIndex: number, totalItems: number, baseSpeedMs: SpeedMs) => SpeedMs
  // Per-item difficulty indicator label (Fix 5) shown in SessionProgress —
  // e.g. "Advanced", recomputed as the item index advances through an
  // intra-session difficulty ramp.
  computeDifficultyLabel?: (itemIndex: number, totalItems: number) => string
  // Running average reaction time so far this session (Fix 8), derived
  // from runtime.responses — no new measurement, just surfaced live
  // instead of only at the end.
  showAverageResponseTime?: boolean
  // Sprint QSR-3 — Word Flash Experience Unification™. When provided, the
  // Results screen's "Next" action calls this with the real result instead
  // of navigating to nextExerciseHref — for a caller (e.g. Quantum Reading
  // Journey) that needs to advance its own internal state rather than
  // leave the page. Every existing caller omits this and keeps the
  // original Link-based behavior.
  onNext?: (result: RuntimeResult) => void
}

function computeRunningAverageReactionMs(responses: ItemResponse[]): number {
  const timed = responses.filter((r) => !r.skipped && r.reactionTimeMs > 0)
  if (timed.length === 0) return 0
  return timed.reduce((sum, r) => sum + r.reactionTimeMs, 0) / timed.length
}

// Consecutive-correct streak counted from the end of the response log.
function computeCombo(responses: ItemResponse[]): number {
  let combo = 0
  for (let i = responses.length - 1; i >= 0; i--) {
    if (!responses[i]!.isCorrect) break
    combo++
  }
  return combo
}

// A calm, descriptive read on reaction-time consistency over the most
// recent responses — low variance relative to the mean reads as steadier
// focus, not raw speed (a fast-but-erratic run isn't "focused"). Derived
// entirely from real per-item timing already recorded by the runtime; no
// new measurement.
function computeFocusLevel(responses: ItemResponse[]): string {
  const recent = responses.slice(-5).filter((r) => !r.skipped && r.reactionTimeMs > 0)
  if (recent.length < 3) return 'Warming Up'
  const mean = recent.reduce((sum, r) => sum + r.reactionTimeMs, 0) / recent.length
  const variance = recent.reduce((sum, r) => sum + (r.reactionTimeMs - mean) ** 2, 0) / recent.length
  const coefficientOfVariation = mean > 0 ? Math.sqrt(variance) / mean : 1
  if (coefficientOfVariation < 0.25) return 'Deep Focus'
  if (coefficientOfVariation < 0.5) return 'Focused'
  return 'Warming Up'
}

export function UniversalExercisePlayer<TConfig = Record<string, unknown>>({
  definition,
  items,
  nextExerciseId = null,
  nextExerciseHref = null,
  renderStimulus,
  renderOption,
  onRestart,
  onResultReady,
  computeExtraStats,
  computeCoachMessage,
  computeResultExtraContent,
  resultLabels,
  copy,
  showCombo = false,
  showFocusLevel = false,
  computeItemSpeedMs,
  computeDifficultyLabel,
  showAverageResponseTime = false,
  onNext,
}: UniversalExercisePlayerProps<TConfig>): React.JSX.Element {
  const router = useRouter()
  const prefersReducedMotion = usePrefersReducedMotion()
  const isVictoryRevealed = useMicroVictoryReveal()

  // ── Item-level state ────────────────────────────────────────────────────
  const [itemPhase, setItemPhase] = useState<ItemPhase>('flash')
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const itemStartTimeRef = useRef<number>(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Manual speed override — stored locally so student can adjust without
  // affecting the adaptive engine's persisted state.
  const [manualSpeedMs, setManualSpeedMs] = useState<SpeedMs | null>(null)
  const [isManualMode, setIsManualMode] = useState(false)

  function clearTimer(): void {
    if (timerRef.current !== null) clearTimeout(timerRef.current)
  }

  const onSessionComplete = useCallback(async (result: RuntimeResult): Promise<void> => {
    await savePracticeSession({
      labId: definition.labId,
      exerciseId: definition.id,
      durationMs: Math.max(1, result.metrics.sessionDurationMs),
      completed: result.metrics.accuracyPercent >= definition.adaptiveRules.minAccuracyToComplete,
    })
  }, [definition])

  const runtime = useUniversalExerciseRuntime({
    definition,
    items,
    nextExerciseId,
    nextExerciseHref,
    onSessionComplete,
  })

  // Fire onResultReady exactly once per completed session, as soon as the
  // result becomes available — a ref (not state) tracks the last result
  // notified so this never re-fires on unrelated re-renders while the
  // result screen is showing.
  const notifiedResultRef = useRef<RuntimeResult | null>(null)
  useEffect(() => {
    if (runtime.result !== null && runtime.result !== notifiedResultRef.current) {
      notifiedResultRef.current = runtime.result
      onResultReady?.(runtime.result)
    }
  }, [runtime.result, onResultReady])

  // Apply manual speed override to the runtime when in manual mode
  const effectiveSpeedMs = isManualMode && manualSpeedMs !== null ? manualSpeedMs : runtime.speedMs

  // Sync manual speed to runtime when changed
  useEffect(() => {
    if (isManualMode && manualSpeedMs !== null) {
      runtime.setManualSpeed(manualSpeedMs)
    }
  }, [isManualMode, manualSpeedMs, runtime])

  const currentItem = items[runtime.currentIndex] ?? null

  // ── Transitions ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (runtime.phase === 'playing') {
      setItemPhase('flash')
      setSelectedIndex(null)
    }
  }, [runtime.phase, runtime.currentIndex])

  const handleFlashEnd = useCallback((): void => {
    itemStartTimeRef.current = Date.now()
    setItemPhase('response')
  }, [])

  const handleSelect = useCallback((idx: number): void => {
    if (itemPhase !== 'response' || !currentItem) return
    const reactionTimeMs = Date.now() - itemStartTimeRef.current
    setSelectedIndex(idx)
    setItemPhase('feedback')

    const response: ItemResponse = {
      itemId: currentItem.id,
      selectedIndex: idx,
      correctIndex: currentItem.correctIndex,
      isCorrect: idx === currentItem.correctIndex,
      reactionTimeMs,
      skipped: false,
    }

    clearTimer()
    timerRef.current = setTimeout(() => {
      setItemPhase('gap')
      clearTimer()
      timerRef.current = setTimeout(() => {
        setSelectedIndex(null)
        runtime.recordResponse(response)
        setItemPhase('flash')
      }, GAP_MS)
    }, FEEDBACK_MS)
  }, [itemPhase, currentItem, runtime])

  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') { clearTimer(); router.push(definition.labHref) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [router, definition.labHref])

  useEffect(() => () => clearTimer(), [])

  // ── Handle restart — tell parent to regenerate fresh items ───────────────
  function handlePracticeAgain(): void {
    clearTimer()
    setItemPhase('flash')
    setSelectedIndex(null)
    // Signal parent to regenerate items with a new seed, then restart runtime
    onRestart?.()
    runtime.restart()
  }

  // ── Completed ───────────────────────────────────────────────────────────
  if (runtime.phase === 'completed' && runtime.result !== null) {
    const completedResult = runtime.result
    if (!isVictoryRevealed) {
      return (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-16">
          <MicroVictoryMoment
            progressLabel={`${completedResult.metrics.correctCount} of ${completedResult.metrics.totalCount} Correct`}
          />
        </div>
      )
    }
    return (
      <RuntimeResultScreen
        exerciseName={definition.title}
        trainsAbility={definition.trainsAbility}
        result={completedResult}
        labHref={definition.labHref}
        onPracticeAgain={handlePracticeAgain}
        {...(computeExtraStats !== undefined ? { extraStats: computeExtraStats(completedResult) } : {})}
        {...(computeCoachMessage !== undefined ? { coachMessage: computeCoachMessage(completedResult) } : {})}
        {...(computeResultExtraContent !== undefined ? { extraContent: computeResultExtraContent(completedResult) } : {})}
        {...(resultLabels !== undefined ? { labels: resultLabels } : {})}
        {...(onNext !== undefined ? { onNext: () => onNext(completedResult) } : {})}
      />
    )
  }

  // ── Active session ──────────────────────────────────────────────────────
  const isPlaying = runtime.phase === 'playing'
  const isIdle = runtime.phase === 'idle'
  const isPaused = runtime.phase === 'paused'
  const showProgress = isPlaying || isPaused

  const combo = showCombo ? computeCombo(runtime.responses) : undefined
  const focusLevel = showFocusLevel ? computeFocusLevel(runtime.responses) : undefined
  const averageResponseTimeMs = showAverageResponseTime ? computeRunningAverageReactionMs(runtime.responses) : undefined
  const difficultyLabel = computeDifficultyLabel?.(runtime.currentIndex, runtime.totalItems)

  // The actual duration used to flash the CURRENT item — ramped per-item
  // when computeItemSpeedMs is provided, otherwise identical to the base
  // session speed. Manual override always takes precedence over any ramp.
  const currentItemSpeedMs: SpeedMs =
    isManualMode && manualSpeedMs !== null
      ? manualSpeedMs
      : computeItemSpeedMs
        ? computeItemSpeedMs(runtime.currentIndex, runtime.totalItems, effectiveSpeedMs)
        : effectiveSpeedMs

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6">
      {/* Progress bar + counters */}
      {showProgress && (
        <SessionProgress
          currentIndex={runtime.currentIndex}
          totalItems={runtime.totalItems}
          completionPercent={runtime.completionPercent}
          runningAccuracy={runtime.runningAccuracy}
          speedMs={isPlaying ? currentItemSpeedMs : effectiveSpeedMs}
          prefersReducedMotion={prefersReducedMotion}
          {...(copy?.itemNoun !== undefined ? { itemNoun: copy.itemNoun } : {})}
          {...(combo !== undefined ? { comboCount: combo } : {})}
          {...(focusLevel !== undefined ? { focusLevel } : {})}
          {...(difficultyLabel !== undefined ? { difficultyLabel } : {})}
          {...(averageResponseTimeMs !== undefined ? { averageResponseTimeMs } : {})}
        />
      )}

      {/* Exit */}
      <button
        onClick={() => { clearTimer(); router.push(definition.labHref) }}
        className="absolute top-4 right-6 text-xs text-muted-foreground transition-colors hover:text-foreground"
        aria-label={copy?.exit ?? 'Exit exercise'}
      >
        {copy?.exit ?? 'Exit'}
      </button>

      {/* Pause / Resume */}
      {isPlaying && (
        <button
          onClick={runtime.pause}
          className="absolute top-4 right-20 text-xs text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Pause exercise"
        >
          {copy?.pause ?? 'Pause'}
        </button>
      )}
      {isPaused && (
        <button
          onClick={runtime.resume}
          className="absolute top-4 right-20 text-xs text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Resume exercise"
        >
          {copy?.resume ?? 'Resume'}
        </button>
      )}

      <div className="flex w-full max-w-sm flex-col items-center gap-8">

        {/* ── Idle — Start screen with Speed Control ── */}
        {isIdle && (
          <div className="flex flex-col items-center gap-6 text-center w-full">
            <p className="text-sm text-muted-foreground">{definition.description}</p>
            {definition.metaLine !== undefined && (
              <p className="text-xs text-muted-foreground/70">{definition.metaLine}</p>
            )}
            <SpeedControl
              currentSpeedMs={effectiveSpeedMs}
              isManual={isManualMode}
              onSpeedChange={(ms) => { setManualSpeedMs(ms); setIsManualMode(true) }}
              onToggleMode={(manual) => { setIsManualMode(manual); if (!manual) setManualSpeedMs(null) }}
              className="w-full"
            />
            <button
              onClick={runtime.startSession}
              className="rounded-full bg-foreground px-8 py-3 text-sm font-medium text-background transition-opacity hover:opacity-80"
            >
              {copy?.begin ?? 'Begin'}
            </button>
          </div>
        )}

        {/* ── Countdown ── */}
        {runtime.phase === 'countdown' && (
          <ExerciseCountdown
            onComplete={runtime.beginPlaying}
            {...(copy?.ready !== undefined ? { readyLabel: copy.ready } : {})}
            {...(copy?.go !== undefined ? { goLabel: copy.go } : {})}
          />
        )}

        {/* ── Playing ── */}
        {isPlaying && currentItem !== null && (
          <>
            {itemPhase === 'flash' && (
              <FlashStimulus
                stimulus={currentItem.stimulus}
                {...(currentItem.renderAs !== undefined ? { renderAs: currentItem.renderAs } : {})}
                durationMs={currentItemSpeedMs}
                onHide={handleFlashEnd}
                {...(renderStimulus !== undefined ? { renderStimulus } : {})}
              />
            )}
            {itemPhase === 'gap' && (
              <div
                className={cn(
                  'flex min-h-[140px] flex-col items-center justify-center gap-2',
                  !prefersReducedMotion && 'animate-in fade-in duration-200',
                )}
                aria-hidden="true"
              >
                <div className="size-2 rounded-full bg-muted-foreground/30" />
                {copy?.gap !== undefined && (
                  <p className="text-xs text-muted-foreground/60">{copy.gap}</p>
                )}
              </div>
            )}
            {(itemPhase === 'response' || itemPhase === 'feedback') && (
              <ChoiceGrid
                options={currentItem.options}
                correctIndex={currentItem.correctIndex}
                onSelect={handleSelect}
                selectedIndex={selectedIndex}
                isFeedback={itemPhase === 'feedback'}
                disabled={itemPhase === 'feedback'}
                {...(copy?.prompt !== undefined ? { promptLabel: copy.prompt } : {})}
                {...(renderOption !== undefined
                  ? { renderOption }
                  : renderStimulus !== undefined
                    ? { renderOption: (opt: string) => renderStimulus(opt) }
                    : {})}
              />
            )}
          </>
        )}

        {/* ── Paused — show Speed Control ── */}
        {isPaused && (
          <div className="flex flex-col items-center gap-5 text-center w-full">
            <p className="text-lg font-semibold text-foreground">{copy?.paused ?? 'Paused'}</p>
            <p className="text-sm text-muted-foreground">
              {runtime.currentIndex} of {runtime.totalItems} {copy?.itemNoun !== undefined ? `${copy.itemNoun.toLowerCase()}s` : 'items'} complete ·{' '}
              {runtime.runningAccuracy > 0 && `${runtime.runningAccuracy}% accuracy`}
            </p>
            <SpeedControl
              currentSpeedMs={effectiveSpeedMs}
              isManual={isManualMode}
              onSpeedChange={(ms) => { setManualSpeedMs(ms); setIsManualMode(true) }}
              onToggleMode={(manual) => { setIsManualMode(manual); if (!manual) setManualSpeedMs(null) }}
              className="w-full"
            />
            <button
              onClick={runtime.resume}
              className="rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background"
            >
              {copy?.resume ?? 'Resume'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
