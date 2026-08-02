'use client'

import { Button } from '@/components/ui/button'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

type BrainChallengeIntroProps = {
  passageTitle: string
  questionCount: number
  onStart: () => void
}

export function BrainChallengeIntro({ passageTitle, questionCount, onStart }: BrainChallengeIntroProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const fadeClass = !prefersReducedMotion ? 'animate-in fade-in slide-in-from-bottom-2 duration-500' : ''

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <div
        className={cn('flex size-20 items-center justify-center rounded-full bg-primary/[0.07]', !prefersReducedMotion && 'animate-in zoom-in-75 duration-500')}
        aria-hidden="true"
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/[0.12]">
          <div className="size-6 rounded-full bg-primary" />
        </div>
      </div>

      <div className={fadeClass}>
        <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">Comprehension Intelligence™</p>
        <h1 className="mt-3 font-heading text-2xl font-bold tracking-tight text-balance text-foreground">
          Begin Brain Challenge
        </h1>
        <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
          {questionCount} questions about &ldquo;{passageTitle}&rdquo; — show what you understood, not just what you read.
        </p>
      </div>

      <Button size="lg" className="rounded-full px-8 transition-transform active:scale-[0.98]" onClick={onStart}>
        Start Brain Challenge
      </Button>
    </div>
  )
}
