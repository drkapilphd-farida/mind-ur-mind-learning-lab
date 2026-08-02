import { LAB_STAT_LABEL_CLASS } from '../shell/LabPageHeader'

type MindScoreCardProps = {
  mindScore: number
  label: string
  description: string
}

// Sprint-6, Part 2 — surfaces the existing, untouched Mind Score™
// (computeMindScore/computeReadingScore/getMindScoreLabel from
// src/lib/exercises/mindScore.ts, the same cross-lab formula already used
// on the hub's Reading Intelligence Activated™ card) alongside the
// Dashboard's own Reading Intelligence Score — two distinct, already-real
// metrics, never conflated.
export function MindScoreCard({ mindScore, label, description }: MindScoreCardProps): React.JSX.Element {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <p className={LAB_STAT_LABEL_CLASS}>Mind Score™</p>
      <div className="mt-3 flex items-baseline gap-2">
        <p className="text-4xl font-bold tabular-nums text-foreground">{mindScore}</p>
        <p className="text-sm text-muted-foreground">/ 1000</p>
      </div>
      <p className="mt-2 text-sm font-semibold text-foreground">{label}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
