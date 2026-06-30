'use client'

import Link from 'next/link'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import { getDifficultyLabel, type SessionSummary } from '../adaptiveEngine'

type SessionResultScreenProps = {
  exerciseName: string
  summary: SessionSummary
  trainsAbility: string
  labHref: string
  onPracticeAgain: () => void
}

function accuracyMessage(accuracy: number): string {
  if (accuracy >= 90) return 'Exceptional visual recognition.'
  if (accuracy >= 75) return 'Strong performance. Your visual processing is sharpening.'
  if (accuracy >= 60) return 'Good start. Consistency builds the skill.'
  return 'Keep practicing — the pattern will click.'
}

export function SessionResultScreen({
  exerciseName,
  summary,
  trainsAbility,
  labHref,
  onPracticeAgain,
}: SessionResultScreenProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const {
    accuracyPercent,
    correctCount,
    totalCount,
    nextDurationMs,
    prevDurationMs,
    improved,
  } = summary

  const nextLabel = getDifficultyLabel(nextDurationMs)
  const difficultyChanged = nextDurationMs !== prevDurationMs

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6 py-16 text-center">
      {/* Accuracy ring */}
      <div
        className={cn(
          'mx-auto flex size-24 items-center justify-center rounded-full',
          accuracyPercent >= 75 ? 'bg-success/10' : 'bg-muted',
          !prefersReducedMotion && 'animate-in zoom-in-75 duration-500',
        )}
        aria-hidden="true"
      >
        <span className={cn(
          'text-3xl font-bold tabular-nums',
          accuracyPercent >= 75 ? 'text-success' : 'text-foreground',
        )}>
          {accuracyPercent}%
        </span>
      </div>

      {/* Title */}
      <h1
        className={cn(
          'mt-6 text-2xl font-bold tracking-tight text-foreground',
          !prefersReducedMotion && 'animate-in fade-in slide-in-from-bottom-2 duration-500',
        )}
        style={!prefersReducedMotion ? { animationDelay: '150ms', animationFillMode: 'backwards' } : undefined}
      >
        {exerciseName} · Session complete
      </h1>

      {/* Stats */}
      <div
        className={cn(
          'mx-auto mt-6 grid max-w-xs grid-cols-2 gap-3',
          !prefersReducedMotion && 'animate-in fade-in duration-500',
        )}
        style={!prefersReducedMotion ? { animationDelay: '250ms', animationFillMode: 'backwards' } : undefined}
      >
        <div className="rounded-xl bg-muted/40 px-4 py-3">
          <p className="text-2xl font-bold tabular-nums text-foreground">{correctCount}/{totalCount}</p>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Correct</p>
        </div>
        <div className="rounded-xl bg-muted/40 px-4 py-3">
          <p className="text-2xl font-bold tabular-nums text-foreground">{prevDurationMs}<span className="text-sm font-normal">ms</span></p>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Flash speed</p>
        </div>
      </div>

      {/* Mentor message */}
      <p
        className={cn(
          'mx-auto mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground',
          !prefersReducedMotion && 'animate-in fade-in duration-500',
        )}
        style={!prefersReducedMotion ? { animationDelay: '350ms', animationFillMode: 'backwards' } : undefined}
      >
        {accuracyMessage(accuracyPercent)}
      </p>

      {/* Ability trained */}
      <p className="mt-2 text-xs text-muted-foreground/60">{trainsAbility} activated.</p>

      {/* Next difficulty */}
      {difficultyChanged && (
        <div
          className={cn(
            'mx-auto mt-5 max-w-xs rounded-xl border bg-card p-4',
            !prefersReducedMotion && 'animate-in fade-in duration-500',
          )}
          style={!prefersReducedMotion ? { animationDelay: '450ms', animationFillMode: 'backwards' } : undefined}
        >
          <p className="text-xs text-muted-foreground">
            {improved
              ? `Difficulty increased → ${nextLabel} (${nextDurationMs}ms)`
              : `Difficulty adjusted → ${nextLabel} (${nextDurationMs}ms)`}
          </p>
        </div>
      )}

      {/* Actions */}
      <div
        className={cn(
          'mt-8 flex flex-col items-center gap-3',
          !prefersReducedMotion && 'animate-in fade-in duration-500',
        )}
        style={!prefersReducedMotion ? { animationDelay: '550ms', animationFillMode: 'backwards' } : undefined}
      >
        <Button size="lg" onClick={onPracticeAgain} className="min-w-[200px] gap-2 rounded-full">
          <RotateCcw className="size-4" />
          Practice Again
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href={labHref}>Back to Lab</Link>
        </Button>
      </div>
    </div>
  )
}
