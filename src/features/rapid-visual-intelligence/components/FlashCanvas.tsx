'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { ITEMS_PER_SESSION, type SessionSummary, buildSessionSummary, type FlashDuration } from '../adaptiveEngine'

export type FlashItem = {
  id: string
  // The stimulus — either a text string or a React element (for icon exercises)
  stimulus: string
  stimulusIsIcon?: boolean   // renders via ICON_LOOKUP in the parent when true
  stimulusLabel: string      // accessible label for screen readers
  options: string[]          // exactly 4 choices
  correctIndex: number       // 0–3
}

type Phase = 'idle' | 'countdown' | 'flash' | 'response' | 'feedback' | 'complete'

type FlashCanvasProps = {
  exerciseId: string
  exerciseName: string
  items: FlashItem[]         // must have at least ITEMS_PER_SESSION items
  flashDurationMs: FlashDuration
  renderStimulus?: (stimulus: string) => React.ReactNode  // for icon-based exercises
  onComplete: (summary: SessionSummary) => void
  onExit: () => void
}

// Shared countdown phase: "3 → 2 → 1 → Go" before the first item.
// Between items: a brief 600ms blank gap (no full countdown).
const COUNTDOWN_SECONDS = 3
const BETWEEN_ITEM_GAP_MS = 600
const FEEDBACK_DURATION_MS = 500

export function FlashCanvas({
  exerciseId: _exerciseId,
  exerciseName,
  items,
  flashDurationMs,
  renderStimulus,
  onComplete,
  onExit,
}: FlashCanvasProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const sessionItems = items.slice(0, ITEMS_PER_SESSION)

  const [phase, setPhase] = useState<Phase>('idle')
  const [countdownValue, setCountdownValue] = useState(COUNTDOWN_SECONDS)
  const [currentItemIndex, setCurrentItemIndex] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [correctCount, setCorrectCount] = useState(0)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function clearTimer(): void {
    if (timerRef.current !== null) clearTimeout(timerRef.current)
  }

  // Starts the full 3-2-1 countdown
  const startCountdown = useCallback((): void => {
    setPhase('countdown')
    setCountdownValue(COUNTDOWN_SECONDS)

    let remaining = COUNTDOWN_SECONDS
    function tick(): void {
      remaining -= 1
      if (remaining > 0) {
        setCountdownValue(remaining)
        timerRef.current = setTimeout(tick, 1000)
      } else {
        triggerFlash()
      }
    }
    timerRef.current = setTimeout(tick, 1000)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Shows the stimulus for exactly flashDurationMs
  function triggerFlash(): void {
    setPhase('flash')
    timerRef.current = setTimeout(() => {
      setPhase('response')
    }, prefersReducedMotion ? Math.max(flashDurationMs, 300) : flashDurationMs)
  }

  // Called when user selects an option
  function handleAnswer(selectedIdx: number): void {
    if (phase !== 'response') return
    const item = sessionItems[currentItemIndex]
    if (!item) return

    const correct = selectedIdx === item.correctIndex
    setSelectedIndex(selectedIdx)
    if (correct) setCorrectCount((c) => c + 1)
    setPhase('feedback')

    timerRef.current = setTimeout(() => {
      advance(correct)
    }, FEEDBACK_DURATION_MS)
  }

  function advance(wasCorrect: boolean): void {
    const nextIndex = currentItemIndex + 1
    setSelectedIndex(null)

    if (nextIndex >= sessionItems.length) {
      // Session complete — compute final correct count including this last answer
      const finalCorrect = correctCount + (wasCorrect ? 1 : 0)
      const summary = buildSessionSummary(finalCorrect, sessionItems.length, flashDurationMs)
      setPhase('complete')
      onComplete(summary)
      return
    }

    setCurrentItemIndex(nextIndex)
    setPhase('idle')
    timerRef.current = setTimeout(triggerFlash, BETWEEN_ITEM_GAP_MS)
  }

  // Kick off the first item with a countdown
  useEffect(() => {
    timerRef.current = setTimeout(startCountdown, 300)
    return clearTimer
  }, [startCountdown])

  // Keyboard shortcuts: 1/2/3/4 for options, Escape to exit
  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') { clearTimer(); onExit(); return }
      if (phase !== 'response') return
      const num = Number(e.key)
      if (num >= 1 && num <= 4) handleAnswer(num - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, currentItemIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => clearTimer(), [])

  const item = sessionItems[currentItemIndex]
  const progress = Math.round(((currentItemIndex) / sessionItems.length) * 100)

  return (
    <div
      className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6"
      aria-label={`${exerciseName} — item ${currentItemIndex + 1} of ${sessionItems.length}`}
    >
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-border" aria-hidden="true">
        <div
          className={cn('h-0.5 bg-primary', !prefersReducedMotion && 'transition-[width] duration-300')}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Exit */}
      <button
        onClick={() => { clearTimer(); onExit() }}
        className="absolute top-4 right-6 text-xs text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Exit exercise"
      >
        Exit
      </button>

      {/* Item counter */}
      <p className="absolute top-4 left-6 text-xs text-muted-foreground tabular-nums" aria-live="polite">
        {currentItemIndex + 1} / {sessionItems.length}
      </p>

      {/* Main area */}
      <div className="flex w-full max-w-sm flex-col items-center gap-8">

        {/* Countdown */}
        {phase === 'countdown' && (
          <div
            className={cn(
              'flex size-24 items-center justify-center rounded-full bg-muted',
              !prefersReducedMotion && 'animate-in zoom-in-50 duration-300',
            )}
            aria-live="assertive"
            aria-label={`Starting in ${countdownValue}`}
          >
            <span className="text-5xl font-bold text-foreground tabular-nums">{countdownValue}</span>
          </div>
        )}

        {/* Flash stimulus */}
        {(phase === 'flash' || phase === 'idle') && phase === 'flash' && item && (
          <div
            className={cn(
              'flex min-h-[120px] items-center justify-center',
              !prefersReducedMotion && 'animate-in fade-in duration-100',
            )}
            aria-live="assertive"
            aria-label={`Flash: ${item.stimulusLabel}`}
          >
            {renderStimulus ? (
              renderStimulus(item.stimulus)
            ) : (
              <span
                className="text-center text-5xl font-bold tracking-tight text-foreground sm:text-6xl"
                style={{ userSelect: 'none' }}
              >
                {item.stimulus}
              </span>
            )}
          </div>
        )}

        {/* Blank gap between items */}
        {phase === 'idle' && (
          <div className="flex min-h-[120px] items-center justify-center" aria-hidden="true">
            <div className="size-2 rounded-full bg-muted-foreground/30" />
          </div>
        )}

        {/* Response phase — multiple choice */}
        {(phase === 'response' || phase === 'feedback') && item && (
          <div className="w-full space-y-4" role="group" aria-label="Choose your answer">
            {/* Question prompt */}
            <p className="text-center text-sm text-muted-foreground" aria-hidden="true">
              What did you see?
            </p>

            {/* 2×2 option grid */}
            <div className="grid grid-cols-2 gap-3">
              {item.options.map((option, idx) => {
                const isSelected = selectedIndex === idx
                const isThisCorrect = phase === 'feedback' && idx === item.correctIndex
                const isThisWrong = phase === 'feedback' && isSelected && !isThisCorrect

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={phase === 'feedback'}
                    aria-label={`Option ${idx + 1}: ${option}`}
                    aria-pressed={isSelected}
                    className={cn(
                      'flex min-h-[68px] items-center justify-center rounded-xl border px-4 py-3',
                      'text-base font-medium transition-all duration-150 focus-visible:outline-none',
                      'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                      phase === 'response'
                        ? 'border-border bg-card text-foreground hover:bg-muted hover:border-foreground/20 active:scale-[0.98]'
                        : isThisCorrect
                          ? 'border-success bg-success/10 text-success'
                          : isThisWrong
                            ? 'border-destructive bg-destructive/10 text-destructive'
                            : 'border-border bg-card text-muted-foreground opacity-60',
                    )}
                  >
                    <span className="mr-2 text-[10px] text-muted-foreground">{idx + 1}</span>
                    {renderStimulus && option !== item.options[idx]
                      ? renderStimulus(option)
                      : option}
                  </button>
                )
              })}
            </div>

            <p className="text-center text-[10px] text-muted-foreground" aria-hidden="true">
              Press 1 · 2 · 3 · 4 or tap to choose
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
