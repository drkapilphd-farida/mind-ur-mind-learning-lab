'use client'

// RuntimeResultScreen — enhanced post-session result for the Universal Runtime™.
// Extends ExerciseResultScreen with: reaction time, AI coach message,
// next speed + next milestone predictions.

import Link from 'next/link'
import { RotateCcw, ArrowRight, Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LivingBrainLogo } from '@/components/brand/LivingBrainLogo'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { useCountUp } from '@/hooks/exercises/useCountUp'
import { cn } from '@/lib/utils'
import { getSpeedLabel } from '@/lib/exercise-engine/speedEngine'
import type { RuntimeResult } from '@/hooks/exercise-engine/useUniversalExerciseRuntime'

// Optional extra stat tile — additive, backward-compatible extension point
// for exercises that surface pack-specific metrics beyond the universal
// four (Correct/Speed/Score/Avg reaction). Renders as a second row using
// the exact same tile styling, only when provided — every existing caller
// is unaffected. `hint`, when present, is exposed as both a native title
// tooltip and part of the tile's accessible name, so the caveat reaches
// screen reader users too, not just sighted hover users.
export type RuntimeResultExtraStat = {
  label: string
  value: string
  hint?: string
}

// Optional copy overrides for the handful of labels a pack needs to
// rename — additive, every field defaults to the existing text below when
// omitted, so every current caller renders exactly as before.
export type RuntimeResultLabels = {
  completeSuffix?: string   // default 'Training Complete™'
  correctLabel?: string     // default 'Correct'
  speedLabel?: string       // default 'Speed'
  scoreLabel?: string       // default 'Score'
  reactionLabel?: string    // default 'Avg reaction'
  practiceAgainLabel?: string  // default 'Train Again'
  nextLabel?: string        // default 'Continue to Next Step'
}

type RuntimeResultScreenProps = {
  exerciseName: string
  trainsAbility: string
  result: RuntimeResult
  labHref: string
  onPracticeAgain: () => void
  extraStats?: RuntimeResultExtraStat[]
  // Replaces result.accuracyMessage for display only — the underlying
  // metrics/recommendation logic is untouched, this only changes the
  // coaching sentence shown.
  coachMessage?: string
  // Free-form additional content rendered between extraStats and the
  // recommendation card (e.g. Word Flash's Reading Readiness / Personal
  // Best / Weekly Progress summary). A generic slot rather than five
  // pack-specific props, so this component doesn't need to know what a
  // "Personal Best" is.
  extraContent?: React.ReactNode
  labels?: RuntimeResultLabels
  // Sprint QSR-2.6 — Quantum Experience Parity™. When provided, the "Next"
  // action calls this instead of navigating to result.recommendation's
  // href — for a caller (e.g. Quantum Reading Journey) that needs to
  // advance its own internal state rather than leave the page. Every
  // existing caller omits this and keeps the original Link-based behavior.
  onNext?: () => void
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
  extraStats,
  coachMessage,
  extraContent,
  labels,
  onNext,
}: RuntimeResultScreenProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const { metrics, recommendation, accuracyMessage } = result
  const {
    accuracyPercent, correctCount, totalCount, speedMs,
    performanceScore, averageReactionTimeMs, fastestReactionTimeMs,
  } = metrics
  const displayMessage = coachMessage ?? accuracyMessage

  // Sprint-16 — Delight Layer™. Every result number here used to snap to
  // its final value the instant its fade-in revealed it. Reuses the same
  // useCountUp hook that already animates ProgressRing's stroke — the
  // numbers now gently tick up (ease-out-cubic, 700ms) inside their
  // existing fade-in containers, no change to the stagger timing itself.
  const animatedAccuracyPercent = useCountUp(accuracyPercent, 700, prefersReducedMotion)
  const animatedCorrectCount = useCountUp(correctCount, 700, prefersReducedMotion)
  const animatedSpeedMs = useCountUp(speedMs, 700, prefersReducedMotion)
  const animatedPerformanceScore = useCountUp(performanceScore, 700, prefersReducedMotion)
  const animatedAverageReactionTimeMs = useCountUp(averageReactionTimeMs, 700, prefersReducedMotion)
  const animatedFastestReactionTimeMs = useCountUp(fastestReactionTimeMs, 700, prefersReducedMotion)

  const anim = (delay: number): React.CSSProperties =>
    !prefersReducedMotion ? { animationDelay: `${delay}ms`, animationFillMode: 'backwards' } : {}
  const fadeIn = !prefersReducedMotion ? 'animate-in fade-in duration-500' : ''

  const nextSpeed = recommendation.nextSpeedMs
  const speedImproved = nextSpeed !== null && nextSpeed < speedMs

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6 py-16 text-center">
      <LivingBrainLogo className="size-8 sm:size-10" animated={false} />

      {/* Accuracy ring */}
      <div
        className={cn(
          'mx-auto mt-6 flex size-24 items-center justify-center rounded-full',
          accuracyPercent >= 75 ? 'bg-success/10' : 'bg-muted',
          !prefersReducedMotion && 'animate-in zoom-in-75 duration-500',
        )}
        aria-hidden="true"
      >
        <span className={cn('text-3xl font-bold tabular-nums', accuracyPercent >= 75 ? 'text-success' : 'text-foreground')}>
          {Math.round(animatedAccuracyPercent)}%
        </span>
      </div>

      {/* Title */}
      <h1 className={cn('mt-6 text-2xl font-bold tracking-tight text-foreground', fadeIn)} style={anim(150)}>
        {exerciseName} · {labels?.completeSuffix ?? 'Training Complete™'}
      </h1>

      {/* AI Coach Message */}
      <p className={cn('mx-auto mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground', fadeIn)} style={anim(200)}>
        {displayMessage}
      </p>
      <p className="mt-1 text-xs text-muted-foreground/60">{trainsAbility} activated.</p>

      {/* Stats grid */}
      <div className={cn('mx-auto mt-6 grid max-w-xs grid-cols-2 gap-3 sm:grid-cols-4', fadeIn)} style={anim(300)}>
        <div className="rounded-xl bg-muted/40 px-3 py-3">
          <p className="text-xl font-bold tabular-nums text-foreground">{Math.round(animatedCorrectCount)}/{totalCount}</p>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{labels?.correctLabel ?? 'Correct'}</p>
        </div>
        <div className="rounded-xl bg-muted/40 px-3 py-3">
          <p className="text-xl font-bold tabular-nums text-foreground">{Math.round(animatedSpeedMs)}<span className="text-xs font-normal">ms</span></p>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{labels?.speedLabel ?? 'Speed'}</p>
        </div>
        <div className="rounded-xl bg-muted/40 px-3 py-3">
          <p className="text-xl font-bold tabular-nums text-foreground">{Math.round(animatedPerformanceScore)}</p>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{labels?.scoreLabel ?? 'Score'}</p>
        </div>
        <div className="rounded-xl bg-muted/40 px-3 py-3">
          <p className="text-xl font-bold tabular-nums text-foreground">{formatMs(Math.round(animatedAverageReactionTimeMs))}</p>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{labels?.reactionLabel ?? 'Avg reaction'}</p>
        </div>
      </div>

      {/* Extra stats — pack-specific metrics (e.g. Word Flash's Recognition
          Speed / Estimated WPM Growth), only rendered when provided */}
      {extraStats !== undefined && extraStats.length > 0 && (
        <div
          className={cn('mx-auto mt-3 grid max-w-xs gap-3', extraStats.length > 1 ? 'grid-cols-2' : 'grid-cols-1', fadeIn)}
          style={anim(325)}
        >
          {extraStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl bg-muted/40 px-3 py-3"
              {...(stat.hint !== undefined ? { title: stat.hint } : {})}
              aria-label={stat.hint !== undefined ? `${stat.label}: ${stat.value} — ${stat.hint}` : undefined}
            >
              <p className="text-xl font-bold tabular-nums text-foreground">{stat.value}</p>
              <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Free-form pack-specific content (e.g. Word Flash's Reading
          Readiness / Personal Best / Weekly Progress summary) */}
      {extraContent !== undefined && (
        <div className={cn('mx-auto mt-3 max-w-xs', fadeIn)} style={anim(330)}>
          {extraContent}
        </div>
      )}

      {/* Reaction time detail */}
      {fastestReactionTimeMs > 0 && (
        <p className={cn('mt-3 flex items-center gap-1 text-xs text-muted-foreground', fadeIn)} style={anim(350)}>
          <Timer className="size-3" aria-hidden="true" />
          Fastest response: {formatMs(Math.round(animatedFastestReactionTimeMs))}
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
          {labels?.practiceAgainLabel ?? 'Train Again'}
        </Button>
        {onNext !== undefined && (
          <Button variant="outline" size="sm" className="gap-1.5 rounded-full" onClick={onNext}>
            {labels?.nextLabel ?? 'Continue to Next Step'}
            <ArrowRight className="size-3.5" />
          </Button>
        )}
        {onNext === undefined && recommendation.nextExerciseHref !== null && (
          <Button asChild variant="outline" size="sm" className="gap-1.5 rounded-full">
            <Link href={recommendation.nextExerciseHref}>
              {labels?.nextLabel ?? 'Continue to Next Step'}
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
