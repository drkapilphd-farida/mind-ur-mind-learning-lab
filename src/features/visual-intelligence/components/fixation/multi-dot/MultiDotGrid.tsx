'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ProgressRing } from '@/components/exercises/ProgressRing'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

type MultiDotGridProps = {
  dotCount: number
  durationSeconds: number
  onComplete: (accuracyPercent: number) => void
}

// Time allowed to tap the highlighted dot before it counts as a miss.
const ROUND_MS = 2000
const RADIUS_PX = 100

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function pickNextIndex(count: number, exclude: number): number {
  if (count <= 1) return 0
  let next = Math.floor(Math.random() * count)
  while (next === exclude) next = Math.floor(Math.random() * count)
  return next
}

// No camera tracking — the interaction is deliberate tap/click/keypress.
// Every round's hit/miss is a real, disclosed tally; accuracyPercent is
// exactly "dots you correctly tapped," never conflated with "attention" or
// "focus" measurement.
export function MultiDotGrid({ dotCount, durationSeconds, onComplete }: MultiDotGridProps): React.JSX.Element {
  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds)
  const [highlightedDot, setHighlightedDot] = useState(() => Math.floor(Math.random() * dotCount))
  const [roundIndex, setRoundIndex] = useState(0)
  const prefersReducedMotion = usePrefersReducedMotion()

  const remainingSecondsRef = useRef(remainingSeconds)
  const hitsRef = useRef(0)
  const roundsRef = useRef(0)
  const roundAnsweredRef = useRef(false)
  const finishedRef = useRef(false)

  useEffect(() => {
    remainingSecondsRef.current = remainingSeconds
  }, [remainingSeconds])

  const finish = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    const accuracy = roundsRef.current === 0 ? 0 : Math.round((hitsRef.current / roundsRef.current) * 100)
    onComplete(accuracy)
  }, [onComplete])

  // Overall session clock.
  useEffect(() => {
    if (remainingSeconds <= 0) {
      finish()
      return
    }
    const tickTimer = setTimeout(() => setRemainingSeconds((seconds) => seconds - 1), 1000)
    return () => clearTimeout(tickTimer)
  }, [remainingSeconds, finish])

  // Round lifecycle — independent of the 1s tick, re-runs only when a new
  // round actually starts (not every second), so a round is never cut
  // short by the countdown re-rendering.
  useEffect(() => {
    if (finishedRef.current || remainingSecondsRef.current <= 0) return
    roundsRef.current += 1
    roundAnsweredRef.current = false

    const roundTimer = setTimeout(() => {
      if (roundAnsweredRef.current || finishedRef.current || remainingSecondsRef.current <= 0) return
      setHighlightedDot((prev) => pickNextIndex(dotCount, prev))
      setRoundIndex((i) => i + 1)
    }, ROUND_MS)

    return () => clearTimeout(roundTimer)
  }, [roundIndex, dotCount])

  const handleDotClick = useCallback(
    (index: number) => {
      if (roundAnsweredRef.current || finishedRef.current || remainingSecondsRef.current <= 0) return
      roundAnsweredRef.current = true
      if (index === highlightedDot) hitsRef.current += 1
      setHighlightedDot((prev) => pickNextIndex(dotCount, prev))
      setRoundIndex((i) => i + 1)
    },
    [highlightedDot, dotCount],
  )

  // Keyboard shortcuts 1-7, extending ChoiceGrid's existing 1-4 convention.
  useEffect(() => {
    function onKey(event: KeyboardEvent): void {
      const num = Number(event.key)
      if (num >= 1 && num <= dotCount) handleDotClick(num - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dotCount, handleDotClick])

  const elapsedSeconds = durationSeconds - remainingSeconds

  return (
    <div className="relative mx-auto flex w-full max-w-md flex-col items-center gap-10 rounded-3xl border bg-gradient-to-b from-primary/[0.06] to-transparent px-6 py-14 text-center">
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Tap the highlighted dot</p>

      <div className="relative flex size-64 items-center justify-center" role="group" aria-label="Dot targets">
        {Array.from({ length: dotCount }, (_, index) => {
          const angle = (index / dotCount) * 2 * Math.PI - Math.PI / 2
          const x = Math.cos(angle) * RADIUS_PX
          const y = Math.sin(angle) * RADIUS_PX
          const isHighlighted = index === highlightedDot

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleDotClick(index)}
              aria-label={`Dot ${index + 1} of ${dotCount}${isHighlighted ? ', highlighted, tap now' : ''}`}
              className={cn(
                'absolute top-1/2 left-1/2 flex size-11 items-center justify-center rounded-full border text-[10px] font-medium',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                !prefersReducedMotion && 'transition-transform',
                isHighlighted
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground transition-colors',
              )}
              style={{
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${isHighlighted && !prefersReducedMotion ? 1.15 : 1})`,
                transitionDuration: !prefersReducedMotion ? '200ms' : undefined,
              }}
            >
              {index + 1}
            </button>
          )
        })}
      </div>

      <ProgressRing
        progress={elapsedSeconds / durationSeconds}
        size={64}
        label={formatTime(remainingSeconds)}
        accessibleLabel={`${formatTime(remainingSeconds)} remaining`}
      />
    </div>
  )
}
