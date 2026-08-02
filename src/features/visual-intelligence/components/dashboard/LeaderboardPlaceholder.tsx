import { Trophy } from 'lucide-react'

const MODES = ['Private Mode', 'School Mode', 'Global Mode'] as const

// Static, informational "architecture only" preview — mirrors Sprint-8's
// Future Intelligence Map precedent. No backend, no fabricated rankings.
export function LeaderboardPlaceholder(): React.JSX.Element {
  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
        <Trophy className="size-3.5" aria-hidden="true" />
        Leaderboard Placeholder™
      </div>
      <div className="mt-4 space-y-2">
        {MODES.map((mode) => (
          <div key={mode} className="flex items-center justify-between rounded-2xl border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            <span>{mode}</span>
            <span className="text-xs font-medium">Coming Soon</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[10px] text-muted-foreground">Architecture only — no rankings are generated yet.</p>
    </div>
  )
}
