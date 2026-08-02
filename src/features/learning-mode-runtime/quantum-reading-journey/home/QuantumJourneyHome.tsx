'use client'

import { useEffect, useState } from 'react'
import { Flame, Clock } from 'lucide-react'
import { loadQuantumJourneyOverview, type QuantumJourneyOverviewResult } from '@/features/learning-mode-runtime/actions/loadQuantumJourneyOverview'
import { QuantumJourneyChapterCard } from './QuantumJourneyChapterCard'
import { QuantumJourneyLoadingScreen } from '../components/QuantumJourneyLoadingScreen'
import { QuantumJourneyErrorScreen } from '../components/QuantumJourneyErrorScreen'
import { QuantumJourneyProcessingEmptyState } from '../components/QuantumJourneyProcessingEmptyState'

type QuantumJourneyHomeProps = {
  documentId: string
  onContinue: (chapterOrder: number) => void
  onSelectChapter: (chapterOrder: number) => void
}

// Reading Intelligence Engine™ Upgrade — Sprint QSR-2.5: Reading Journey
// UX & Navigation™. Objective 1/9 — the journey's own entry point AND
// ongoing dashboard, folded into one screen rather than two near-
// duplicate ones: current book, current chapter, journey progress,
// resume, estimated time, streak, chapter cards. Every figure here comes
// from loadQuantumJourneyOverview — a pure read over data Sprint QSR-2
// already persists, nothing new stored.
export function QuantumJourneyHome({ documentId, onContinue, onSelectChapter }: QuantumJourneyHomeProps): React.JSX.Element {
  const [result, setResult] = useState<QuantumJourneyOverviewResult | null>(null)

  const load = (): void => {
    setResult(null)
    loadQuantumJourneyOverview({ documentId }).then(setResult)
  }

  useEffect(() => {
    let cancelled = false
    loadQuantumJourneyOverview({ documentId }).then((res) => {
      if (!cancelled) setResult(res)
    })
    return () => {
      cancelled = true
    }
  }, [documentId])

  if (result === null) return <QuantumJourneyLoadingScreen label="Finding important ideas…" />
  if (!result.success) {
    if (result.reason === 'not-processed') return <QuantumJourneyProcessingEmptyState onCheckAgain={load} />
    return <QuantumJourneyErrorScreen message={result.error} onRetry={load} />
  }
  const overview = result

  const currentChapter = overview.chapters[overview.currentChapterOrder]
  const remainingMinutes = overview.chapters.filter((c) => c.status !== 'completed').reduce((sum, c) => sum + c.estimatedMinutes, 0)

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Reading Journey</p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{overview.documentTitle}</h1>
        <p className="text-sm text-muted-foreground">
          {overview.chaptersCompleted} of {overview.totalChapters} chapters complete
        </p>
      </div>

      <div className="mx-auto max-w-sm space-y-2">
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted-foreground/15" role="progressbar" aria-valuenow={overview.overallProgressPercent} aria-valuemin={0} aria-valuemax={100} aria-label="Overall journey progress">
          <div className="h-full rounded-full bg-foreground/70 transition-[width] duration-500" style={{ width: `${overview.overallProgressPercent}%` }} />
        </div>
        <p className="text-center text-xs tabular-nums text-muted-foreground">{overview.overallProgressPercent}% through this book</p>
      </div>

      <div className="mx-auto flex max-w-sm items-center justify-center gap-6 text-xs text-muted-foreground">
        {overview.currentStreak > 0 && (
          <span className="flex items-center gap-1.5">
            <Flame className="size-3.5 text-warning" aria-hidden="true" />
            {overview.currentStreak}-day streak
          </span>
        )}
        {overview.totalReadingMinutes > 0 && (
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5" aria-hidden="true" />
            {overview.totalReadingMinutes} min read so far
          </span>
        )}
      </div>

      {overview.journeyCompleted ? (
        <div className="mx-auto max-w-sm space-y-3 rounded-2xl border border-success/30 bg-success/5 px-6 py-8 text-center">
          <p className="text-3xl" aria-hidden="true">
            🏆
          </p>
          <p className="text-sm font-semibold text-foreground">You&apos;ve completed this book&apos;s Reading Journey.</p>
          <p className="text-xs text-muted-foreground">Revisit any chapter below whenever you&apos;d like a refresher.</p>
        </div>
      ) : (
        <div className="flex justify-center">
          <button onClick={() => onContinue(overview.currentChapterOrder)} className="rounded-full bg-foreground px-8 py-3 text-sm font-medium text-background transition-opacity hover:opacity-80">
            {currentChapter?.status === 'current' ? 'Continue Journey →' : 'Start Journey →'}
            {remainingMinutes > 0 && <span className="ml-2 font-normal opacity-70">~{remainingMinutes} min left</span>}
          </button>
        </div>
      )}

      <div className="mx-auto flex max-w-sm flex-col gap-2">
        {overview.chapters.map((chapter) => (
          <QuantumJourneyChapterCard key={chapter.chapterOrder} chapter={chapter} onSelect={() => onSelectChapter(chapter.chapterOrder)} />
        ))}
      </div>
    </div>
  )
}
