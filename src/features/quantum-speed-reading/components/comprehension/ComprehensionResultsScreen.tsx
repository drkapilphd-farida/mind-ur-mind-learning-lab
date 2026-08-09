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
}

// A calm, tiered summary line rather than a single fixed caption — no
// hype language, just an honest read on this specific attempt.
function getPerformanceMessage(accuracyPercent: number): string {
  if (accuracyPercent >= 85) return 'Excellent comprehension — you understood the passage deeply.'
  if (accuracyPercent >= 70) return 'Solid comprehension. Keep practicing to build on this.'
  if (accuracyPercent >= 50) return 'Good effort. A slower, more careful read next time may help.'
  return "Let's revisit this one — comprehension matters more than speed."
}

// Purpose-built rather than reusing RuntimeResultScreen — its metrics
// (reaction time, speed tier) belong to timed, flashed-stimulus exercises
// and have no honest equivalent for an untimed comprehension quiz. This
// reuses only the same staggered fade/zoom visual language already
// established by ReadingSessionComplete (Sprint-2) and ActivationCard.
//
// Redesigned around two headline numbers (Reading Speed, Comprehension)
// rather than six competing tiles — Correct/Incorrect/Time/Category still
// exist, just one tap away via "View Details" (the session report page,
// which defaults to this just-completed session) instead of crowding
// the first screen a student sees after finishing.
export function ComprehensionResultsScreen({
  correctCount,
  totalQuestions,
  accuracyPercent,
  readingTimeMs,
  readingWpm,
  readingIntelligenceScore,
}: ComprehensionResultsScreenProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()

  const fadeClass = !prefersReducedMotion ? 'animate-in fade-in slide-in-from-bottom-2 duration-500' : ''
  const fadeStyle = (delayMs: number): React.CSSProperties | undefined =>
    !prefersReducedMotion ? { animationDelay: `${delayMs}ms`, animationFillMode: 'backwards' } : undefined

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col items-center justify-center gap-10 px-6 py-16 text-center">
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
        <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground">Your Results</h1>
      </div>

      <div className={cn('grid w-full grid-cols-2 gap-4', fadeClass)} style={fadeStyle(220)}>
        <div className="rounded-2xl bg-muted/40 px-4 py-6">
          <p className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">Reading Speed</p>
          <p className="mt-1 text-4xl font-bold tabular-nums text-foreground">{readingWpm}</p>
          <p className="mt-0.5 text-xs font-medium text-muted-foreground">WPM · {formatElapsedTime(readingTimeMs)}</p>
        </div>
        <div className="rounded-2xl bg-muted/40 px-4 py-6">
          <p className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">Comprehension</p>
          <p className="mt-1 text-4xl font-bold tabular-nums text-foreground">{accuracyPercent}%</p>
          <p className="mt-0.5 text-xs font-medium text-muted-foreground">{correctCount} of {totalQuestions} correct</p>
        </div>
      </div>

      <div className={cn('flex flex-col items-center gap-2', fadeClass)} style={fadeStyle(300)}>
        <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{getPerformanceMessage(accuracyPercent)}</p>
        <p className="text-xs font-medium text-muted-foreground/70">Reading Intelligence Score: {readingIntelligenceScore}/100</p>
      </div>

      <div className={cn('flex w-full flex-col gap-2', fadeClass)} style={fadeStyle(380)}>
        <Button asChild size="lg" className="w-full gap-2 rounded-full">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="gap-1.5 rounded-full">
          <Link href="/labs/quantum-speed-reading/reports/session">
            View Details
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
