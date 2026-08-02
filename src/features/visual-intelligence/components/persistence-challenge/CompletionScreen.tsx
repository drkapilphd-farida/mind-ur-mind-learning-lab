'use client'

import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProgressRing } from '@/components/exercises/ProgressRing'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

// Flat, disclosed per-session reward — never a fabricated cumulative total
// (no XP-tracking table exists anywhere in this codebase). Mirrors
// ImagePersistenceCompletion.tsx (25) and FixationCompletion.tsx (20).
export const XP_PER_SESSION = 25

type CompletionScreenProps = {
  completedSessionCount: number
  currentStreak: number
  persistenceScore: number
  visualIntelligenceScore: number
  onContinue: () => void
}

export function CompletionScreen({
  completedSessionCount,
  currentStreak,
  persistenceScore,
  visualIntelligenceScore,
  onContinue,
}: CompletionScreenProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-8 text-center">
      <div
        className={cn('flex size-24 items-center justify-center rounded-full bg-primary/[0.07]', !prefersReducedMotion && 'animate-in zoom-in-75 duration-500')}
        aria-hidden="true"
      >
        <div className="flex size-16 items-center justify-center rounded-full bg-primary/[0.12] text-primary">
          <Sparkles className="size-7" aria-hidden="true" />
        </div>
      </div>

      <div>
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Image Persistence Challenge™</p>
        <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground">Challenge Complete</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Nicely done — you practiced sustained visual attention and observation.
        </p>
      </div>

      <div className="flex w-full items-center gap-5 rounded-2xl border bg-card p-6 shadow-sm">
        <ProgressRing
          progress={persistenceScore / 100}
          size={72}
          label={`${persistenceScore}`}
          accessibleLabel={`Visual Persistence Score ${persistenceScore} out of 100`}
        />
        <div className="flex-1 space-y-2 text-left">
          <div>
            <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Visual Persistence Score™</p>
            <p className="text-sm font-semibold text-foreground">{persistenceScore} / 100</p>
          </div>
          <div>
            <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Visual Intelligence Score™</p>
            <p className="text-sm font-semibold text-foreground">{visualIntelligenceScore} / 1000</p>
          </div>
        </div>
      </div>

      <div className="grid w-full grid-cols-3 gap-3">
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Images</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{completedSessionCount}</p>
        </div>
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">XP</p>
          <p className="mt-1 text-lg font-semibold text-foreground">+{XP_PER_SESSION}</p>
        </div>
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Streak</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{currentStreak}</p>
        </div>
      </div>

      <Button
        size="lg"
        className={cn('w-full gap-2 rounded-full', !prefersReducedMotion && 'transition-transform active:scale-[0.98]')}
        onClick={onContinue}
      >
        Continue
        <ArrowRight className="size-4" aria-hidden="true" />
      </Button>
    </div>
  )
}
