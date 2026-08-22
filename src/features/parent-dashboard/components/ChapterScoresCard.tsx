import type { ChapterScoreSummary } from '@/features/quantum-document-transformer/actions/getQuantumDocumentChapterScores'
import { cn } from '@/lib/utils'

type ChapterScoresCardProps = {
  chapters: readonly ChapterScoreSummary[]
}

// Transparent Comprehension Scoring™ (Phase 4) — undeniable, per-chapter
// proof of comprehension: no chapter's score is ever hidden or softened,
// whether it's 30% or 90% (there is no pass/fail gate anywhere in this
// flow — every completed Chapter Comprehension Check is recorded exactly
// as scored, see getQuantumDocumentChapterScores.ts). Colors are purely
// informational, never a gate — a low score never blocks anything, it
// just tells a parent which chapter is worth guiding a re-read on.
function scoreTone(scorePercent: number): { chip: string; label: string } {
  if (scorePercent >= 80) return { chip: 'bg-success/10 text-success', label: 'Strong' }
  if (scorePercent >= 50) return { chip: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', label: 'Needs review' }
  return { chip: 'bg-destructive/10 text-destructive', label: 'Re-read recommended' }
}

function formatScore(scorePercent: number): string {
  return Number.isInteger(scorePercent) ? `${scorePercent}%` : `${scorePercent.toFixed(1)}%`
}

export function ChapterScoresCard({ chapters }: ChapterScoresCardProps): React.JSX.Element {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Chapter Scores</p>

      {chapters.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Complete a Chapter Comprehension Check to see exact, per-chapter scores here.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {chapters.map((chapter) => {
            const tone = scoreTone(chapter.latestScorePercent)
            const hasImproved = chapter.attemptsCount > 1 && chapter.bestScorePercent > chapter.latestScorePercent
            return (
              <li key={chapter.quantumDocumentId} className="flex items-center justify-between gap-4 border-b border-border/60 pb-3 last:border-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{chapter.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {chapter.latestCorrectAnswersCount}/{chapter.latestTotalQuestionsCount} correct · {chapter.attemptsCount} attempt{chapter.attemptsCount === 1 ? '' : 's'}
                    {hasImproved ? ` · best ${formatScore(chapter.bestScorePercent)}` : ''}
                  </p>
                </div>
                <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums', tone.chip)} title={tone.label}>
                  {formatScore(chapter.latestScorePercent)}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
