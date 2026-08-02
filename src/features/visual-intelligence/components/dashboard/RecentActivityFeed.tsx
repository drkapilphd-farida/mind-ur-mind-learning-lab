import { Sparkles, CircleCheck } from 'lucide-react'
import type { RecentActivityItem } from '../../dashboard/recentActivityEngine'

function formatRelativeDay(isoTimestamp: string): string {
  const date = new Date(isoTimestamp)
  const todayKey = new Date().toISOString().slice(0, 10)
  const yesterdayDate = new Date()
  yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1)
  const yesterdayKey = yesterdayDate.toISOString().slice(0, 10)
  const dateKey = date.toISOString().slice(0, 10)

  if (dateKey === todayKey) return 'Today'
  if (dateKey === yesterdayKey) return 'Yesterday'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
}

type RecentActivityFeedProps = {
  items: readonly RecentActivityItem[]
}

export function RecentActivityFeed({ items }: RecentActivityFeedProps): React.JSX.Element {
  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm">
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Recent Activity</p>

      {items.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Train more to unlock your activity feed.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3">
              <div
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/[0.08] text-primary"
                aria-hidden="true"
              >
                {item.kind === 'insight' ? <Sparkles className="size-4" /> : <CircleCheck className="size-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">
                  {formatRelativeDay(item.occurredAt)} · {item.detail}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
