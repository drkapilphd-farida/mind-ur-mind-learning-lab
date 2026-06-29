'use client'

import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import { formatDurationLabel, type SessionHistoryItem } from '@/lib/exercises/practiceHistory'

type ProgressTimelineProps = {
  items: SessionHistoryItem[]
}

function formatTimelineDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function ProgressTimeline({ items }: ProgressTimelineProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No completed exercises yet — finish one to start your timeline.
      </p>
    )
  }

  return (
    <ol>
      {items.map((item, index) => (
        <li
          key={`${item.exerciseId}-${item.occurredAt}`}
          className={cn(
            'relative flex gap-3 pb-6 pl-1 last:pb-0',
            !prefersReducedMotion && 'animate-in fade-in slide-in-from-left-1 duration-500',
          )}
          style={!prefersReducedMotion ? { animationDelay: `${index * 60}ms`, animationFillMode: 'backwards' } : undefined}
        >
          {index < items.length - 1 && (
            <span aria-hidden="true" className="absolute left-[5px] top-3 h-full w-px bg-border" />
          )}
          <span aria-hidden="true" className="relative z-10 mt-1.5 size-[11px] shrink-0 rounded-full bg-primary" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">{item.title}</p>
            <p className="text-xs text-muted-foreground">
              {formatTimelineDate(item.occurredAt)} · {formatDurationLabel(item.durationMs)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}
