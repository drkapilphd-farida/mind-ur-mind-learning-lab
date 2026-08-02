'use client'

import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProgressRing } from '@/components/exercises/ProgressRing'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import { FixationCoachMessage } from './FixationCoachMessage'

// Flat, disclosed per-session reward — never a fabricated cumulative total
// (no XP-tracking table exists anywhere in this codebase). Mirrors
// ImagePersistenceCompletion.tsx's identical XP_PER_SESSION precedent
// (slightly lower here since these sessions run 30-90s vs. Image
// Persistence's longer flow).
export const XP_PER_SESSION = 20

type FixationCompletionProps = {
  exerciseLabel: string
  levelLabel: string
  accuracyPercent: number | null
  // null while completeFixationSession is still in flight.
  focusScore: number | null
  coachMessage: string | null
  onBackToHub: () => void
}

// Shared completion screen for all 5 fixation exercises. What's known
// instantly (level, XP) renders immediately; Visual Focus Score and the AI
// Coach message stream in once the server round-trip resolves — never a
// blank or error state, just a brief loading placeholder.
export function FixationCompletion({
  exerciseLabel,
  levelLabel,
  accuracyPercent,
  focusScore,
  coachMessage,
  onBackToHub,
}: FixationCompletionProps): React.JSX.Element {
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
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">{exerciseLabel}</p>
        <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground">Session Complete</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Nicely done — you practiced sustained visual attention.
        </p>
      </div>

      <div className="flex w-full items-center gap-5 rounded-2xl border bg-card p-6 shadow-sm">
        <ProgressRing
          progress={focusScore === null ? 0 : focusScore / 100}
          size={72}
          label={focusScore === null ? '—' : `${focusScore}`}
          accessibleLabel={focusScore === null ? 'Calculating Visual Focus Score' : `Visual Focus Score ${focusScore} out of 100`}
        />
        <div className="flex-1 space-y-2 text-left">
          <div>
            <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Visual Focus Score™</p>
            <p className="text-sm font-semibold text-foreground">{focusScore === null ? 'Calculating…' : `${focusScore} / 100`}</p>
          </div>
          <div>
            <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Visual Intelligence XP</p>
            <p className="text-sm font-semibold text-foreground">+{XP_PER_SESSION} XP</p>
          </div>
          {accuracyPercent !== null ? (
            <div>
              <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Accuracy</p>
              <p className="text-sm font-semibold text-foreground">{accuracyPercent}%</p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="w-full rounded-2xl border bg-card p-4 shadow-sm">
        <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Level</p>
        <p className="mt-1 text-sm font-semibold text-foreground">{levelLabel}</p>
      </div>

      <FixationCoachMessage message={coachMessage} />

      <Button
        size="lg"
        className={cn('w-full gap-2 rounded-full', !prefersReducedMotion && 'transition-transform active:scale-[0.98]')}
        onClick={onBackToHub}
      >
        Back to Visual Fixation Engine™
        <ArrowRight className="size-4" aria-hidden="true" />
      </Button>
    </div>
  )
}
