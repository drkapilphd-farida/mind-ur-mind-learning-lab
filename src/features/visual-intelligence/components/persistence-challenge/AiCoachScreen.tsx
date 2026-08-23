'use client'

import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

type AiCoachScreenProps = {
  // null while completePersistenceChallengeSession is still in flight —
  // shows a skeleton, never a blank or error state.
  message: string | null
  onContinue: () => void
}

export function AiCoachScreen({ message, onContinue }: AiCoachScreenProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const fadeClass = !prefersReducedMotion ? 'animate-in fade-in slide-in-from-bottom-2 duration-300' : ''

  return (
    <div className={cn('mx-auto flex w-full max-w-md flex-col items-center gap-6 text-center', fadeClass)}>
      <div
        className={cn('flex size-16 items-center justify-center rounded-full bg-primary/[0.07]', !prefersReducedMotion && 'animate-in zoom-in-75 duration-500')}
        aria-hidden="true"
      >
        <div className="flex size-10 items-center justify-center rounded-full bg-primary/[0.12] text-primary">
          <Sparkles className="size-5" aria-hidden="true" />
        </div>
      </div>

      <div>
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Dr. Kapil&apos;s Note™</p>
        <h1 className="mt-2 font-heading text-xl font-bold tracking-tight text-foreground">Your Feedback</h1>
      </div>

      <div className="w-full rounded-2xl border bg-card p-6 text-left shadow-sm">
        {message === null ? (
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-foreground">{message}</p>
        )}
      </div>

      <Button
        size="lg"
        disabled={message === null}
        className={cn('w-full rounded-full', !prefersReducedMotion && 'transition-transform active:scale-[0.98]')}
        onClick={onContinue}
      >
        Continue
      </Button>
    </div>
  )
}
