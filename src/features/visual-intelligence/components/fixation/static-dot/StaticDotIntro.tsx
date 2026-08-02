'use client'

import { Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

type StaticDotIntroProps = {
  onStart: () => void
}

export function StaticDotIntro({ onStart }: StaticDotIntroProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-8 text-center">
      <div
        className={cn('flex size-24 items-center justify-center rounded-full bg-primary/[0.07]', !prefersReducedMotion && 'animate-in zoom-in-75 duration-700')}
        aria-hidden="true"
      >
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/[0.12] text-primary">
          <Circle className="size-7" aria-hidden="true" />
        </div>
      </div>

      <div>
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Visual Fixation Engine™</p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground">Static Dot Focus™</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Fix your gaze on a single point and train sustained visual attention.
        </p>
      </div>

      <Button
        size="lg"
        className={cn('w-full rounded-full', !prefersReducedMotion && 'transition-transform active:scale-[0.98]')}
        onClick={onStart}
      >
        Start
      </Button>
    </div>
  )
}
