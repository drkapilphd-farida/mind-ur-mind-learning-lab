'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import { formatElapsedTime } from '../../readingSessionEngine'

type ComprehensionResultsScreenProps = {
  correctCount: number
  totalQuestions: number
  accuracyPercent: number
  readingTimeMs: number
  readingWpm: number
  readingIntelligenceScore: number
  labHref: string
  continueHref: string
}

// Purpose-built rather than reusing RuntimeResultScreen — its metrics
// (reaction time, speed tier) belong to timed, flashed-stimulus exercises
// and have no honest equivalent for an untimed comprehension quiz. This
// reuses only the same staggered fade/zoom visual language already
// established by ReadingSessionComplete (Sprint-2) and ActivationCard.
export function ComprehensionResultsScreen({
  correctCount,
  totalQuestions,
  accuracyPercent,
  readingTimeMs,
  readingWpm,
  readingIntelligenceScore,
  labHref,
  continueHref,
}: ComprehensionResultsScreenProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const incorrectCount = totalQuestions - correctCount

  const fadeClass = !prefersReducedMotion ? 'animate-in fade-in slide-in-from-bottom-2 duration-500' : ''
  const fadeStyle = (delayMs: number): React.CSSProperties | undefined =>
    !prefersReducedMotion ? { animationDelay: `${delayMs}ms`, animationFillMode: 'backwards' } : undefined

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

      <div className={fadeClass} style={fadeStyle(120)}>
        <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">Reading Completed</p>
        <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground">Reading Intelligence Report</h1>
      </div>

      <div className={cn('flex flex-col items-center gap-1', fadeClass)} style={fadeStyle(200)}>
        <p className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">Reading Intelligence Score</p>
        <p className="text-5xl font-bold tabular-nums text-foreground">{readingIntelligenceScore}<span className="text-lg text-muted-foreground">/100</span></p>
      </div>

      <dl className={cn('grid w-full grid-cols-2 gap-3', fadeClass)} style={fadeStyle(280)}>
        <div className="rounded-xl bg-muted/40 px-3 py-4">
          <dt className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">Comprehension Score</dt>
          <dd className="mt-1 text-xl font-bold tabular-nums text-foreground">{correctCount}/{totalQuestions}</dd>
        </div>
        <div className="rounded-xl bg-muted/40 px-3 py-4">
          <dt className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">Accuracy</dt>
          <dd className="mt-1 text-xl font-bold tabular-nums text-foreground">{accuracyPercent}%</dd>
        </div>
        <div className="rounded-xl bg-muted/40 px-3 py-4">
          <dt className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">Correct Answers</dt>
          <dd className="mt-1 text-xl font-bold tabular-nums text-success">{correctCount}</dd>
        </div>
        <div className="rounded-xl bg-muted/40 px-3 py-4">
          <dt className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">Incorrect Answers</dt>
          <dd className="mt-1 text-xl font-bold tabular-nums text-destructive">{incorrectCount}</dd>
        </div>
        <div className="rounded-xl bg-muted/40 px-3 py-4">
          <dt className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">Time Taken</dt>
          <dd className="mt-1 text-xl font-bold tabular-nums text-foreground">{formatElapsedTime(readingTimeMs)}</dd>
        </div>
        <div className="rounded-xl bg-muted/40 px-3 py-4">
          <dt className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">Reading Speed</dt>
          <dd className="mt-1 text-xl font-bold tabular-nums text-foreground">{readingWpm} <span className="text-xs font-medium text-muted-foreground">WPM</span></dd>
        </div>
      </dl>

      <div className={cn('flex w-full flex-col gap-2', fadeClass)} style={fadeStyle(360)}>
        <Button asChild size="lg" className="w-full gap-2 rounded-full">
          <Link href={continueHref}>
            Continue
            <ArrowRight className="size-4" />
          </Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link href={labHref}>Back to Lab</Link>
        </Button>
      </div>
    </div>
  )
}
