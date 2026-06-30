'use client'

// RuntimeResultScreen — enhanced post-session result for the Universal Runtime™.
// Extends ExerciseResultScreen with: reaction time, AI coach message,
// next speed + next milestone predictions.

import Link from 'next/link'
import { RotateCcw, ArrowRight, Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import { getSpeedLabel } from '@/lib/exercise-engine/speedEngine'
import type { RuntimeResult } from '@/hooks/exercise-engine/useUniversalExerciseRuntime'

type RuntimeResultScreenProps = {
  exerciseName: string
  trainsAbility: string
  result: RuntimeResult
  labHref: string
  onPracticeAgain: () => void
}

function formatMs(ms: number): string {
  if (ms === 0) return '—'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export function RuntimeResultScreen({
  exerciseName,
  trainsAbility,
  result,
  labHref,
  onPracticeAgain,
}: RuntimeResultScreenProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const { metrics, recommendation, accuracyMessage } = result
  const {
    accuracyPercent, correctCount, totalCount, speedMs,
    performanceScore, averageReactionTimeMs, fastestReactionTimeMs,
  } = metrics

  const anim = (delay: number): React.CSSProperties =>
    !prefersReducedMotion ? { animationDelay: `${delay}ms`, animationFillMode: 'backwards' } : {}
  const fadeIn = !prefersReducedMotion ? 'animate-in fade-in duration-500' : ''

  const nextSpeed = recommendation.nextSpeedMs
  const speedImproved = nextSpeed !== null && nextSpeed < speedMs

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
        <span className={cn('text-3xl font-bold tabular-nums', accuracyPercent >= 75 ? 'text-success' : 'text-foreground')}>
          {accuracyPercent}%
        </span>
      </div>

      {/* Title */}
      <h1 className={cn('mt-6 text-2xl font-bold tracking-tight text-foreground', fadeIn)} style={anim(150)}>
        {exerciseName} · Session complete
      </h1>

      {/* AI Coach Message */}
      <p className={cn('mx-auto mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground', fadeIn)} style={anim(200)}>
        {accuracyMessage}
      </p>
      <p className="mt-1 text-xs text-muted-foreground/60">{trainsAbility} activated.</p>

      {/* Stats grid */}
      <div className={cn('mx-auto mt-6 grid max-w-xs grid-cols-2 gap-3 sm:grid-cols-4', fadeIn)} style={anim(300)}>
        <div className="rounded-xl bg-muted/40 px-3 py-3">
          <p className="text-xl font-bold tabular-nums text-foreground">{correctCount}/{totalCount}</p>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Correct</p>
        </div>
        <div className="rounded-xl bg-muted/40 px-3 py-3">
          <p className="text-xl font-bold tabular-nums text-foreground">{speedMs}<span className="text-xs font-normal">ms</span></p>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Speed</p>
        </div>
        <div className="rounded-xl bg-muted/40 px-3 py-3">
          <p className="text-xl font-bold tabular-nums text-foreground">{performanceScore}</p>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Score</p>
        </div>
        <div className="rounded-xl bg-muted/40 px-3 py-3">
          <p className="text-xl font-bold tabular-nums text-foreground">{formatMs(averageReactionTimeMs)}</p>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Avg reaction</p>
        </div>
      </div>

      {/* Reaction time detail */}
      {fastestReactionTimeMs > 0 && (
        <p className={cn('mt-3 flex items-center gap-1 text-xs text-muted-foreground', fadeIn)} style={anim(350)}>
          <Timer className="size-3" aria-hidden="true" />
          Fastest response: {formatMs(fastestReactionTimeMs)}
        </p>
      )}

      {/* Recommendation */}
      <div className={cn('mx-auto mt-5 max-w-xs rounded-xl border bg-card p-4', fadeIn)} style={anim(400)}>
        <p className="text-xs font-medium text-foreground">{recommendation.message}</p>
        {recommendation.detail !== null && (
          <p className="mt-1 text-xs text-muted-foreground">{recommendation.detail}</p>
        )}
        {nextSpeed !== null && nextSpeed !== speedMs && (
          <p className={cn('mt-2 text-[10px] font-medium', speedImproved ? 'text-success' : 'text-muted-foreground')}>
            {speedImproved ? '↑' : '↓'} Next session: {nextSpeed}ms · {getSpeedLabel(nextSpeed)}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className={cn('mt-8 flex flex-col items-center gap-3', fadeIn)} style={anim(500)}>
        <Button size="lg" onClick={onPracticeAgain} className="min-w-[200px] gap-2 rounded-full">
          <RotateCcw className="size-4" />
          Practice Again
        </Button>
        {recommendation.nextExerciseHref !== null && (
          <Button asChild variant="outline" size="sm" className="gap-1.5 rounded-full">
            <Link href={recommendation.nextExerciseHref}>
              Try next exercise
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        )}
        <Button asChild variant="ghost" size="sm">
          <Link href={labHref}>Back to Lab</Link>
        </Button>
      </div>
    </div>
  )
}
