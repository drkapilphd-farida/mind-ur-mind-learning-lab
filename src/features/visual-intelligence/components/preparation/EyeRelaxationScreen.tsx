'use client'

import { useEffect, useRef, useState } from 'react'
import { ProgressRing } from '@/components/exercises/ProgressRing'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { EYE_RELAXATION_STEPS, EYE_RELAXATION_STEP_SECONDS, type EyeMovementDirection } from '../../preparation/eyeRelaxationSteps'

type EyeRelaxationScreenProps = {
  onComplete: () => void
}

const AMPLITUDE_CQ = 28
const PERIOD_S = 3

// A smooth 0 -> 1 -> 0 wave — used for every direction so the dot always
// eases out from center and back, never snaps.
function unipolarWave(t: number, periodS: number): number {
  return (1 - Math.cos((2 * Math.PI * t) / periodS)) / 2
}

// Real, continuous motion per direction — mirrors EyeWarmupCanvas.tsx's
// sine-wave / cqmin-relative technique (the proven pattern already used
// for Eye Warm-up/Eye Stretch), so the dot genuinely moves and the user has
// something real to follow, not a static icon.
function getFixationState(direction: EyeMovementDirection, elapsedMs: number): { x: number; y: number; scale: number; opacity: number } {
  const t = elapsedMs / 1000

  switch (direction) {
    case 'left':
      return { x: -AMPLITUDE_CQ * unipolarWave(t, PERIOD_S), y: 0, scale: 1, opacity: 1 }
    case 'right':
      return { x: AMPLITUDE_CQ * unipolarWave(t, PERIOD_S), y: 0, scale: 1, opacity: 1 }
    case 'up':
      return { x: 0, y: -AMPLITUDE_CQ * unipolarWave(t, PERIOD_S), scale: 1, opacity: 1 }
    case 'down':
      return { x: 0, y: AMPLITUDE_CQ * unipolarWave(t, PERIOD_S), scale: 1, opacity: 1 }
    case 'rotate':
      return {
        x: AMPLITUDE_CQ * Math.sin((2 * Math.PI * t) / PERIOD_S),
        y: AMPLITUDE_CQ * Math.cos((2 * Math.PI * t) / PERIOD_S),
        scale: 1,
        opacity: 1,
      }
    case 'near':
      return { x: 0, y: 0, scale: 1 + 0.6 * unipolarWave(t, PERIOD_S), opacity: 1 }
    case 'far':
      return { x: 0, y: 0, scale: 1 - 0.4 * unipolarWave(t, PERIOD_S), opacity: 1 }
    case 'none':
    default:
      return { x: 0, y: 0, scale: 1, opacity: 1 - 0.6 * unipolarWave(t, PERIOD_S) }
  }
}

// Mirrors BreathAwarenessScreen.tsx's real-timer structure: one fixed 12s
// clock per step, auto-advancing through all 8 EYE_RELAXATION_STEPS before
// calling onComplete — no manual "Next" tap needed. A real moving fixation
// dot (not a static icon) gives the user something to actually follow.
export function EyeRelaxationScreen({ onComplete }: EyeRelaxationScreenProps): React.JSX.Element {
  const [stepIndex, setStepIndex] = useState(0)
  const [remainingSeconds, setRemainingSeconds] = useState(EYE_RELAXATION_STEP_SECONDS)
  const [elapsedInStepMs, setElapsedInStepMs] = useState(0)
  const prefersReducedMotion = usePrefersReducedMotion()
  const stepStartRef = useRef(performance.now())

  useEffect(() => {
    if (remainingSeconds > 0) {
      const tickTimer = setTimeout(() => setRemainingSeconds((s) => s - 1), 1000)
      return () => clearTimeout(tickTimer)
    }

    if (stepIndex + 1 >= EYE_RELAXATION_STEPS.length) {
      onComplete()
      return undefined
    }

    stepStartRef.current = performance.now()
    setStepIndex((index) => index + 1)
    setRemainingSeconds(EYE_RELAXATION_STEP_SECONDS)
    return undefined
  }, [remainingSeconds, stepIndex, onComplete])

  useEffect(() => {
    if (prefersReducedMotion) return undefined

    let frameId: number
    function tick(): void {
      setElapsedInStepMs(performance.now() - stepStartRef.current)
      frameId = requestAnimationFrame(tick)
    }
    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
    // Re-runs whenever the step changes, so the animation clock restarts cleanly per step.
  }, [stepIndex, prefersReducedMotion])

  const step = EYE_RELAXATION_STEPS[stepIndex]!
  const fixation = prefersReducedMotion ? { x: 0, y: 0, scale: 1, opacity: 1 } : getFixationState(step.direction, elapsedInStepMs)

  return (
    <div className="relative mx-auto flex w-full max-w-md flex-col items-center gap-8 overflow-hidden rounded-3xl border bg-gradient-to-b from-primary/[0.06] to-transparent px-6 py-12 text-center">
      <div className="flex flex-col items-center gap-2">
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Eye Relaxation</p>
        <p className="text-sm text-muted-foreground">
          Step {stepIndex + 1} of {EYE_RELAXATION_STEPS.length}
        </p>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          Relaxed eyes track lines of text more smoothly — tension is what makes reading feel tiring.
        </p>
      </div>

      <div className="relative flex aspect-square w-full max-w-[220px] items-center justify-center" style={{ containerType: 'size' }}>
        <div
          aria-hidden="true"
          className="size-10 rounded-full bg-primary shadow-[0_0_24px_rgba(0,0,0,0.15)]"
          style={{
            transform: `translate(${fixation.x}cqmin, ${fixation.y}cqmin) scale(${fixation.scale})`,
            opacity: fixation.opacity,
          }}
        />
      </div>

      <div aria-live="polite">
        <p className="font-heading text-2xl font-bold tracking-tight text-foreground">{step.title}</p>
        <p className="mt-2 text-sm text-muted-foreground">{step.instruction}</p>
      </div>

      <ProgressRing
        progress={(EYE_RELAXATION_STEP_SECONDS - remainingSeconds) / EYE_RELAXATION_STEP_SECONDS}
        size={64}
        label={String(remainingSeconds)}
        accessibleLabel={`${remainingSeconds} seconds remaining on this step`}
      />
    </div>
  )
}
