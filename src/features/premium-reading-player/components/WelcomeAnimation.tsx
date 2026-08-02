'use client'

import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { usePhaseFadeClass } from '@/hooks/exercises/usePhaseFadeClass'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ReadingPlayerMode } from '../types'

type WelcomeAnimationProps = {
  mode: ReadingPlayerMode
  stageTitle: string
  exerciseTitle: string
  onContinue: () => void
}

const MODE_LABEL: Record<ReadingPlayerMode, string> = {
  flash: 'Flash Reading',
  chunk: 'Chunk Reading',
  streaming: 'Streaming Reading',
}

// New — no existing "Welcome" concept anywhere in the codebase (confirmed by
// grep during Sprint 47 research). Reuses the same motion language every
// other exercise screen already uses (usePhaseFadeClass), rather than
// inventing a new one.
export function WelcomeAnimation({ mode, stageTitle, exerciseTitle, onContinue }: WelcomeAnimationProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const fadeClass = usePhaseFadeClass(prefersReducedMotion)

  return (
    <div className={cn('flex flex-col items-center gap-4 py-16 text-center', fadeClass)}>
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{stageTitle}</p>
      <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">{exerciseTitle}</h1>
      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
        {MODE_LABEL[mode]}
      </span>
      <Button size="lg" className="mt-4 rounded-full" onClick={onContinue}>
        Continue
      </Button>
    </div>
  )
}
