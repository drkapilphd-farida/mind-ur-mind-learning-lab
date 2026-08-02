'use client'

import { Lock, CircleCheck, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { QuantumJourneyChapterCard as ChapterCardData } from '@/features/learning-mode-runtime/actions/internal/deriveQuantumJourneyChapters'

type QuantumJourneyChapterCardProps = {
  chapter: ChapterCardData
  onSelect: () => void
}

const STATUS_LABEL: Record<ChapterCardData['status'], string> = {
  locked: 'Locked',
  ready: 'Ready',
  current: 'In Progress',
  completed: 'Completed',
}

// Reading Intelligence Engine™ Upgrade — Sprint QSR-2.5: Reading Journey
// UX & Navigation™. Objective 3 — every field the brief names (Chapter
// Number, Title, Completion %, Estimated Time, Status), current chapter
// always visually obvious (ring + Play affordance), locked chapters never
// clickable.
export function QuantumJourneyChapterCard({ chapter, onSelect }: QuantumJourneyChapterCardProps): React.JSX.Element {
  const isLocked = chapter.status === 'locked'
  const isCurrent = chapter.status === 'current' || chapter.status === 'ready'
  const completionPercent = chapter.status === 'completed' ? 100 : chapter.status === 'current' ? 50 : 0

  return (
    <button
      onClick={onSelect}
      disabled={isLocked}
      aria-current={isCurrent ? 'step' : undefined}
      className={cn(
        'flex w-full items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-all',
        isLocked && 'cursor-not-allowed border-border/60 bg-muted/20 opacity-60',
        isCurrent && 'border-foreground/40 bg-foreground/[0.03] ring-1 ring-foreground/20 hover:bg-foreground/[0.05]',
        chapter.status === 'completed' && 'border-success/30 bg-success/[0.03] hover:bg-success/[0.06]',
      )}
    >
      <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums', chapter.status === 'completed' ? 'bg-success/15 text-success' : isCurrent ? 'bg-foreground/10 text-foreground' : 'bg-muted text-muted-foreground')}>
        {chapter.status === 'completed' ? <CircleCheck className="size-5" aria-hidden="true" /> : isLocked ? <Lock className="size-4" aria-hidden="true" /> : chapter.chapterOrder + 1}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-foreground">{chapter.title}</p>
          {isCurrent && <Play className="size-3.5 shrink-0 text-foreground/60" aria-hidden="true" />}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {STATUS_LABEL[chapter.status]} · ~{chapter.estimatedMinutes} min
          {chapter.assessmentScore && ` · ${chapter.assessmentScore.correct}/${chapter.assessmentScore.total} on the check`}
        </p>
      </div>

      {/* Decorative only — the status text above already announces the real, honest state; this bar never claims a precise
          in-progress percentage we don't actually know, so it's hidden from assistive tech rather than exposed with a
          fabricated aria-valuenow. */}
      <div className="h-1.5 w-14 shrink-0 overflow-hidden rounded-full bg-muted-foreground/15" aria-hidden="true">
        <div className={cn('h-full rounded-full transition-[width]', chapter.status === 'completed' ? 'bg-success' : 'bg-foreground/60')} style={{ width: `${completionPercent}%` }} />
      </div>
    </button>
  )
}
