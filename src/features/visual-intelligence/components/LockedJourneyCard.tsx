import type { LucideIcon } from 'lucide-react'

type LockedJourneyCardProps = {
  title: string
  icon: LucideIcon
}

// Mirrors the established "Coming Soon" visual style used by
// LeaderboardPlaceholder/NextIntelligenceLabTeaser — architecture-only,
// no fabricated progress or unlock date.
export function LockedJourneyCard({ title, icon: Icon }: LockedJourneyCardProps): React.JSX.Element {
  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <p className="mt-4 text-base font-semibold text-foreground">{title}</p>
      <span className="mt-3 inline-flex items-center rounded-full bg-muted/30 px-3 py-1 text-xs font-medium text-muted-foreground">
        Coming Soon
      </span>
    </div>
  )
}
