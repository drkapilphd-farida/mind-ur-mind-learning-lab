'use client'

// ExerciseResultScreen — universal post-session result display.
// Replaces the RVI-specific SessionResultScreen.tsx.
// Accepts PerformanceMetrics + ExerciseRecommendation; every exercise on
// the platform gets identical premium result UI.

import Link from 'next/link'
import { RotateCcw, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import type { PerformanceMetrics, ExerciseRecommendation } from '@/types/exercise-engine'
import { getSpeedLabel } from '@/lib/exercise-engine/speedEngine'

type ExerciseResultScreenProps = {
  exerciseName: string
  trainsAbility: string
  metrics: PerformanceMetrics
  recommendation: ExerciseRecommendation
  accuracyMessage: string
  labHref: string
  onPracticeAgain: () => void
}

export function ExerciseResultScreen({
  exerciseName,
  trainsAbility,
  metrics,
  recommendation,
  accuracyMessage,
  labHref,
  onPracticeAgain,
}: ExerciseResultScreenProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const { accuracyPercent, correctCount, totalCount, speedMs, performanceScore } = metrics
  const nextSpeed = recommendation.nextSpeedMs

  const animBase = !prefersReducedMotion ? 'animate-in fade-in duration-500' : ''
  const delayStyle = (ms: number): React.CSSProperties =>
    !prefersReducedMotion ? { animationDelay: `${ms}ms`, animationFillMode: 'backwards' } : {}

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
      <h1 className={cn('mt-6 text-2xl font-bold tracking-tight text-foreground', animBase)} style={delayStyle(150)}>
        {exerciseName} · Session complete
      </h1>

      {/* Mentor message */}
      <p className={cn('mx-auto mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground', animBase)} style={delayStyle(250)}>
        {accuracyMessage}
      </p>
      <p className="mt-1 text-xs text-muted-foreground/60">{trainsAbility} activated.</p>

      {/* Stats */}
      <div className={cn('mx-auto mt-6 grid max-w-xs grid-cols-3 gap-3', animBase)} style={delayStyle(350)}>
        <div className="rounded-xl bg-muted/40 px-3 py-3">
          <p className="text-xl font-bold tabular-nums text-foreground">{correctCount}/{totalCount}</p>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Correct</p>
        </div>
        <div className="rounded-xl bg-muted/40 px-3 py-3">
          <p className="text-xl font-bold tabular-nums text-foreground">{speedMs}<span className="text-xs font-normal">ms</span></p>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Flash speed</p>
        </div>
        <div className="rounded-xl bg-muted/40 px-3 py-3">
          <p className="text-xl font-bold tabular-nums text-foreground">{performanceScore}</p>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Score</p>
        </div>
      </div>

      {/* Recommendation */}
      <div className={cn('mx-auto mt-5 max-w-xs rounded-xl border bg-card p-4', animBase)} style={delayStyle(450)}>
        <p className="text-xs font-medium text-foreground">{recommendation.message}</p>
        {recommendation.detail !== null && (
          <p className="mt-1 text-xs text-muted-foreground">{recommendation.detail}</p>
        )}
        {nextSpeed !== null && nextSpeed !== speedMs && (
          <p className="mt-2 text-[10px] text-muted-foreground/70">
            Next session: {nextSpeed}ms · {getSpeedLabel(nextSpeed)} level
          </p>
        )}
      </div>

      {/* Actions */}
      <div className={cn('mt-8 flex flex-col items-center gap-3', animBase)} style={delayStyle(550)}>
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
