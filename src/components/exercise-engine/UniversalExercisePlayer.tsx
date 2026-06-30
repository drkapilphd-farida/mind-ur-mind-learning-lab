'use client'

// UniversalExercisePlayer™ — executes any exercise from ExerciseDefinition + items.
// Session-level state: managed by useUniversalExerciseRuntime.
// Item-level timing: managed locally (flash/response/feedback/gap).
// This player never changes when exercises are added.

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { RuntimeResultScreen } from './RuntimeResultScreen'
import { SpeedControl } from './SpeedControl'
import type { ExerciseDefinition, SessionItem, ItemResponse, SpeedMs } from '@/types/exercise-engine'

type ItemPhase = 'flash' | 'response' | 'feedback' | 'gap'

const FEEDBACK_MS = 450
const GAP_MS = 600

type UniversalExercisePlayerProps<TConfig> = {
  definition: ExerciseDefinition<TConfig>
  items: SessionItem[]
  nextExerciseId?: string | null
  nextExerciseHref?: string | null
  renderStimulus?: (stimulus: string) => React.ReactNode
  // Called when the player's Practice Again button is pressed — parent should
  // regenerate items with a new seed before the next session starts.
  onRestart?: () => void
}

export function UniversalExercisePlayer<TConfig = Record<string, unknown>>({
  definition,
  items,
  nextExerciseId = null,
  nextExerciseHref = null,
  renderStimulus,
  onRestart,
}: UniversalExercisePlayerProps<TConfig>): React.JSX.Element {
  const router = useRouter()
  const prefersReducedMotion = usePrefersReducedMotion()

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
    return (
      <RuntimeResultScreen
        exerciseName={definition.title}
        trainsAbility={definition.trainsAbility}
        result={runtime.result}
        labHref={definition.labHref}
        onPracticeAgain={handlePracticeAgain}
      />
    )
  }

  // ── Active session ──────────────────────────────────────────────────────
  const isPlaying = runtime.phase === 'playing'
  const isIdle = runtime.phase === 'idle'
  const isPaused = runtime.phase === 'paused'
  const showProgress = isPlaying || isPaused

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6">
      {/* Progress bar + counters */}
      {showProgress && (
        <SessionProgress
          currentIndex={runtime.currentIndex}
          totalItems={runtime.totalItems}
          completionPercent={runtime.completionPercent}
          runningAccuracy={runtime.runningAccuracy}
          speedMs={effectiveSpeedMs}
          prefersReducedMotion={prefersReducedMotion}
        />
      )}

      {/* Exit */}
      <button
        onClick={() => { clearTimer(); router.push(definition.labHref) }}
        className="absolute top-4 right-6 text-xs text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Exit exercise"
      >
        Exit
      </button>

      {/* Pause / Resume */}
      {isPlaying && (
        <button
          onClick={runtime.pause}
          className="absolute top-4 right-20 text-xs text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Pause exercise"
        >
          Pause
        </button>
      )}
      {isPaused && (
        <button
          onClick={runtime.resume}
          className="absolute top-4 right-20 text-xs text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Resume exercise"
        >
          Resume
        </button>
      )}

      <div className="flex w-full max-w-sm flex-col items-center gap-8">

        {/* ── Idle — Start screen with Speed Control ── */}
        {isIdle && (
          <div className="flex flex-col items-center gap-6 text-center w-full">
            <p className="text-sm text-muted-foreground">{definition.description}</p>
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
              Begin
            </button>
          </div>
        )}

        {/* ── Countdown ── */}
        {runtime.phase === 'countdown' && (
          <ExerciseCountdown onComplete={runtime.beginPlaying} />
        )}

        {/* ── Playing ── */}
        {isPlaying && currentItem !== null && (
          <>
            {itemPhase === 'flash' && (
              <FlashStimulus
                stimulus={currentItem.stimulus}
                {...(currentItem.renderAs !== undefined ? { renderAs: currentItem.renderAs } : {})}
                durationMs={effectiveSpeedMs}
                onHide={handleFlashEnd}
                {...(renderStimulus !== undefined ? { renderStimulus } : {})}
              />
            )}
            {itemPhase === 'gap' && (
              <div className="flex min-h-[140px] items-center justify-center" aria-hidden="true">
                <div className="size-2 rounded-full bg-muted-foreground/30" />
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
                {...(renderStimulus !== undefined
                  ? { renderOption: (opt: string) => renderStimulus(opt) }
                  : {})}
              />
            )}
          </>
        )}

        {/* ── Paused — show Speed Control ── */}
        {isPaused && (
          <div className="flex flex-col items-center gap-5 text-center w-full">
            <p className="text-lg font-semibold text-foreground">Paused</p>
            <p className="text-sm text-muted-foreground">
              {runtime.currentIndex} of {runtime.totalItems} items complete ·{' '}
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
              Resume
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
