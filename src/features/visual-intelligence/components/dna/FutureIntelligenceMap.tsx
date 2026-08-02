import { Map } from 'lucide-react'
import { cn } from '@/lib/utils'

const ROADMAP = [
  { label: 'Visual Intelligence', active: true },
  { label: 'Reading Intelligence', active: false },
  { label: 'Memory Intelligence', active: false },
  { label: 'Focus Intelligence', active: false },
  { label: 'Meditation Intelligence', active: false },
  { label: 'Emotional Intelligence', active: false },
] as const

// A static, honest roadmap — no data-driven logic needed, this section is
// intentionally just informational.
export function FutureIntelligenceMap(): React.JSX.Element {
  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
        <Map className="size-3.5" aria-hidden="true" />
        Future Intelligence Map™
      </div>
      <ul className="mt-4 space-y-2">
        {ROADMAP.map((lab) => (
          <li
            key={lab.label}
            className={cn(
              'flex items-center justify-between rounded-2xl border px-4 py-3 text-sm',
              lab.active ? 'border-success/30 bg-success/[0.04] font-semibold text-foreground' : 'bg-muted/30 text-muted-foreground',
            )}
          >
            <span>{lab.label}</span>
            <span className={cn('text-xs font-medium', lab.active ? 'text-success' : 'text-muted-foreground')}>
              {lab.active ? '✅ Active' : 'Coming Soon'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
