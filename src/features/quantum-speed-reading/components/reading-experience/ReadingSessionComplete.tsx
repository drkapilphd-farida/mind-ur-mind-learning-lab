'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import { formatElapsedTime } from '../../readingSessionEngine'

type ReadingSessionCompleteProps = {
  readingTimeMs: number
  estimatedWpm: number
  wordsRead: number
  labHref: string
  continueHref: string
  confidenceScore: number
  recommendationMessage: string
}

// Purpose-built rather than reusing RuntimeResultScreen — that component's
// shape (accuracyPercent, correct/incorrect) belongs to quiz-style
// exercises. A passive top-to-bottom read has no such concept, so this
// reuses only the visual language (the same zoom-in/fade-in stagger from
// ActivationCard/ReadingIntelligenceActivatedCard), not the component
// itself. Reading Confidence is a deterministic score derived from
// attention, pace, and completion signals; adaptive recommendation is
// based on the session's own runtime intelligence.
export function ReadingSessionComplete({
  readingTimeMs,
  estimatedWpm,
  wordsRead,
  labHref,
  continueHref,
  confidenceScore,
  recommendationMessage,
}: ReadingSessionCompleteProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()

  const fadeStyle = (delayMs: number): React.CSSProperties | undefined =>
    !prefersReducedMotion ? { animationDelay: `${delayMs}ms`, animationFillMode: 'backwards' } : undefined
  const fadeClass = !prefersReducedMotion ? 'animate-in fade-in slide-in-from-bottom-2 duration-500' : ''

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <div
        className={cn('flex h-20 w-20 items-center justify-center rounded-full bg-primary/[0.08] shadow-inner', !prefersReducedMotion && 'animate-in zoom-in-75 duration-500')}
        aria-hidden="true"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/[0.14]">
          <div className="h-6 w-6 rounded-full bg-primary" />
        </div>
      </div>

      <div className={fadeClass} style={fadeStyle(150)}>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">Finished reading</h1>
        <p className="mt-2 text-sm text-muted-foreground">A calm, focused read builds the strongest attention habits.</p>
      </div>

      <dl className={cn('grid w-full gap-3 md:grid-cols-2', fadeClass)} style={fadeStyle(250)}>
        <div className="rounded-3xl border border-border/70 bg-background/85 px-4 py-4 shadow-sm">
          <dt className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">Reading Time</dt>
          <dd className="mt-1 text-xl font-bold tabular-nums text-foreground">{formatElapsedTime(readingTimeMs)}</dd>
        </div>
        <div className="rounded-3xl border border-border/70 bg-background/85 px-4 py-4 shadow-sm">
          <dt className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">Estimated WPM</dt>
          <dd className="mt-1 text-xl font-bold tabular-nums text-foreground">{estimatedWpm}</dd>
        </div>
        <div className="rounded-3xl border border-border/70 bg-background/85 px-4 py-4 shadow-sm">
          <dt className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">Words Read</dt>
          <dd className="mt-1 text-xl font-bold tabular-nums text-foreground">{wordsRead}</dd>
        </div>
        <div className="rounded-3xl border border-border/70 bg-background/85 px-4 py-4 shadow-sm">
          <dt className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">Reading Confidence</dt>
          <dd className="mt-1 text-xl font-bold tabular-nums text-foreground">{confidenceScore}%</dd>
        </div>
      </dl>

      <div className={cn('rounded-3xl border border-border/70 bg-background/90 p-5 text-left text-sm text-muted-foreground shadow-sm', fadeClass)} style={fadeStyle(300)}>
        <p className="font-semibold text-sm text-foreground">Adaptive recommendation</p>
        <p className="mt-2 leading-6">{recommendationMessage}</p>
      </div>

      <div className={cn('flex w-full flex-col gap-3 sm:flex-row sm:justify-center', fadeClass)} style={fadeStyle(350)}>
        <Button asChild size="lg" className="w-full gap-2 rounded-full">
          <Link href={continueHref}>
            Continue to Questions
            <ArrowRight className="size-4" />
          </Link>
        </Button>
        <Button asChild variant="ghost" size="lg" className="w-full rounded-full sm:w-auto">
          <Link href={labHref}>Back to Lab</Link>
        </Button>
      </div>
    </div>
  )
}
