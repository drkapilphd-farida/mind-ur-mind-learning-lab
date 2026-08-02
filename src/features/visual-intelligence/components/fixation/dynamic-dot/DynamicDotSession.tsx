'use client'

import { useEffect, useState } from 'react'
import { ProgressRing } from '@/components/exercises/ProgressRing'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { FixationDot } from '../FixationDot'
import { ALL_DYNAMIC_DOT_KEYFRAMES_CSS, DYNAMIC_DOT_PATH_DEFINITIONS } from './dynamicDotPaths'

type DynamicDotSessionProps = {
  pathValue: string
  durationSeconds: number
  onComplete: () => void
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

// Smooth, continuous pursuit movement along the chosen path for the
// session's fixed 45s length. Reduced-motion users get the identical real
// timer with the dot held still at center — "keep the state, drop the
// interpolation," same convention used throughout this lab.
export function DynamicDotSession({ pathValue, durationSeconds, onComplete }: DynamicDotSessionProps): React.JSX.Element {
  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds)
  const prefersReducedMotion = usePrefersReducedMotion()
  const path = DYNAMIC_DOT_PATH_DEFINITIONS[pathValue] ?? DYNAMIC_DOT_PATH_DEFINITIONS.left!

  useEffect(() => {
    if (remainingSeconds <= 0) {
      onComplete()
      return
    }
    const timer = setTimeout(() => setRemainingSeconds((seconds) => seconds - 1), 1000)
    return () => clearTimeout(timer)
  }, [remainingSeconds, onComplete])

  const elapsedSeconds = durationSeconds - remainingSeconds

  return (
    <div className="relative mx-auto flex w-full max-w-md flex-col items-center gap-10 overflow-hidden rounded-3xl border bg-gradient-to-b from-primary/[0.06] to-transparent px-6 py-16 text-center">
      <style>{ALL_DYNAMIC_DOT_KEYFRAMES_CSS}</style>

      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Follow the dot with your eyes</p>

      <div className="flex size-56 items-center justify-center">
        <FixationDot
          size={20}
          style={
            prefersReducedMotion
              ? undefined
              : {
                  animationName: path.keyframeName,
                  animationDuration: `${path.durationMs}ms`,
                  animationTimingFunction: path.timingFunction,
                  animationIterationCount: 'infinite',
                }
          }
        />
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
