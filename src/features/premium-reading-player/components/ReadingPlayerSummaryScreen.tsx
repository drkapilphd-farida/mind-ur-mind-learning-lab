'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { MicroVictoryMoment } from '@/components/exercises/MicroVictoryMoment'
import { Button } from '@/components/ui/button'
import type { ReadingPlayerSessionSummary } from '../types'

type ReadingPlayerSummaryScreenProps = {
  summary: ReadingPlayerSessionSummary
  progressLabel: string | null
  labHref: string
}

// Completion Animation reuses MicroVictoryMoment directly (the existing,
// shared "exercise just ended" beat, already used across 8+ exercises) — fed
// by reading-intelligence's own buildReadingCompletionContract shape
// (progressLabel), exactly as that function's own doc comment anticipated.
// Everything below it is new: Reading Score / Mind Score Update / XP Reward
// / Continue Learning, all sourced from ReadingPlayerSessionSummary, which
// itself only ever passes through already-computed real values.
export function ReadingPlayerSummaryScreen({
  summary,
  progressLabel,
  labHref,
}: ReadingPlayerSummaryScreenProps): React.JSX.Element {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-8 px-6 py-16 text-center">
      <MicroVictoryMoment progressLabel={progressLabel} />

      <div className="grid w-full grid-cols-2 gap-3 text-left sm:grid-cols-3">
        {summary.readingScore !== null && (
          <div className="rounded-xl border bg-card p-3">
            <p className="text-xs text-muted-foreground">Reading Score</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{summary.readingScore}%</p>
          </div>
        )}
        <div className="rounded-xl border bg-card p-3">
          <p className="text-xs text-muted-foreground">Mind Score™</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{summary.mindScore}</p>
          <p className="text-xs text-muted-foreground">{summary.mindScoreLabel}</p>
        </div>
        <div className="rounded-xl border bg-card p-3">
          <p className="text-xs text-muted-foreground">XP Earned</p>
          <p className="mt-1 text-lg font-semibold text-foreground">+{summary.xp.totalXp}</p>
        </div>
      </div>

      <div className="flex w-full flex-col gap-2.5">
        <Button asChild size="lg" className="w-full gap-2 rounded-full">
          <Link href={summary.continueHref}>
            {summary.continueLabel}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
        <Button variant="ghost" size="lg" className="w-full rounded-full" asChild>
          <Link href={labHref}>Back to Lab</Link>
        </Button>
      </div>
    </div>
  )
}
