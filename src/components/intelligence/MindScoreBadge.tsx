// MindScoreBadge — compact inline chip for use in headers, profiles, and lists.
// Shows the 0–1000 Mind Score with its label in a minimal pill.

import { cn } from '@/lib/utils'
import type { MindScore } from '@/types/intelligence'

type MindScoreBadgeProps = {
  mindScore: MindScore
  size?: 'sm' | 'md'
}

export function MindScoreBadge({ mindScore, size = 'md' }: MindScoreBadgeProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-border bg-card font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
      )}
      aria-label={`Mind Score: ${mindScore.total} — ${mindScore.label}`}
    >
      <span className="tabular-nums text-foreground">{mindScore.total}</span>
      <span className="text-muted-foreground">Mind Score</span>
    </div>
  )
}
