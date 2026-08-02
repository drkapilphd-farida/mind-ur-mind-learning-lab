import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ReportHistory, ReportHistoryEntry } from '../../reportHistory'

type ReportHistoryScreenProps = {
  reportHistory: ReportHistory
}

function overallScore(entry: ReportHistoryEntry): number {
  const { report } = entry
  return Math.round(
    (report.observationAccuracy + report.fixationStability + report.afterImageAwareness + report.attentionScore + report.visualRecall) / 5,
  )
}

function formatDate(occurredAt: string): string {
  return new Date(occurredAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function SessionTile({ label, entry }: { label: string; entry: ReportHistoryEntry | null }): React.JSX.Element {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">{label}</p>
      {entry === null ? (
        <p className="mt-1 text-sm text-muted-foreground">Not enough history yet</p>
      ) : (
        <>
          <p className="mt-1 text-lg font-semibold text-foreground">{overallScore(entry)}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Level {entry.levelNumber} · {formatDate(entry.occurredAt)}
          </p>
        </>
      )}
    </div>
  )
}

// Reads real, previously-persisted Visual Intelligence Reports™ — every
// tile honestly shows "Not enough history yet" rather than a fabricated
// value when fewer than the required sessions exist.
export function ReportHistoryScreen({ reportHistory }: ReportHistoryScreenProps): React.JSX.Element {
  const { latestSession, previousSession, bestSession, improvementPercent } = reportHistory

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-16">
      <div>
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Mandala Tratak™</p>
        <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground">Report History</h1>
        <p className="mt-2 text-sm text-muted-foreground">Your real Visual Intelligence Report™ history across every completed session.</p>
      </div>

      {latestSession === null ? (
        <div className="rounded-2xl border bg-card p-6 text-center text-sm text-muted-foreground shadow-sm">
          Complete a Mandala Tratak™ level with Observation Intelligence™ answered to see your first report here.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <SessionTile label="Latest Session" entry={latestSession} />
          <SessionTile label="Previous Session" entry={previousSession} />
          <SessionTile label="Best Session" entry={bestSession} />
          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Improvement</p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {improvementPercent === null ? '—' : `${improvementPercent >= 0 ? '+' : ''}${improvementPercent}`}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{improvementPercent === null ? 'Not enough history yet' : 'vs. previous session'}</p>
          </div>
        </div>
      )}

      <Button variant="outline" asChild className="w-full gap-2 rounded-full sm:w-auto">
        <Link href="/labs/visual-intelligence/tratak/mandala">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Mission
        </Link>
      </Button>
    </div>
  )
}
