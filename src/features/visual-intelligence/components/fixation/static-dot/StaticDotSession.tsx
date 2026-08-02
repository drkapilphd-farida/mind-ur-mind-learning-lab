'use client'

import { useEffect, useState } from 'react'
import { ProgressRing } from '@/components/exercises/ProgressRing'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import { FixationDot } from '../FixationDot'

type StaticDotSessionProps = {
  durationSeconds: number
  onComplete: () => void
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

// A real countdown timer — durationSeconds is the level's fixed designed
// length (30/45/60/90s), never a fabricated value.
export function StaticDotSession({ durationSeconds, onComplete }: StaticDotSessionProps): React.JSX.Element {
  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds)
  const prefersReducedMotion = usePrefersReducedMotion()

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
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Keep your eyes on the dot</p>

      <div className="relative flex size-40 items-center justify-center">
        <div
          className={cn('absolute size-32 rounded-full bg-primary/10 blur-2xl', !prefersReducedMotion && 'animate-pulse')}
          aria-hidden="true"
        />
        <FixationDot size={20} />
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
