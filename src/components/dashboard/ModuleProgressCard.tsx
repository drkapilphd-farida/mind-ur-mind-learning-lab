import Link from 'next/link'
import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProgressRing } from '@/components/exercises/ProgressRing'

type ModuleProgressCardProps =
  | {
      status: 'available'
      labName: string
      completedCount: number
      totalCount: number
      href: string
    }
  | {
      status: 'coming-soon'
      labName: string
    }

const STATUS_LABEL: Record<'not-started' | 'in-progress' | 'completed', string> = {
  'not-started': 'Not started',
  'in-progress': 'In progress',
  completed: 'Completed',
}

// One card per Lab — live data and a Progress Ring for Labs that exist
// (currently only Quantum Speed Reading), a muted "Coming Soon" card for
// Labs named in the product constitution but not yet built. No fake
// progress is ever shown for a Coming Soon Lab.
export function ModuleProgressCard(props: ModuleProgressCardProps): React.JSX.Element {
  if (props.status === 'coming-soon') {
    return (
      <div
        role="group"
        aria-label={`${props.labName}, coming soon`}
        aria-disabled="true"
        className="flex items-center gap-4 rounded-2xl border border-dashed bg-card/40 p-5 opacity-50"
      >
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Lock className="size-3.5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{props.labName}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Coming soon</p>
        </div>
      </div>
    )
  }

  const { labName, completedCount, totalCount, href } = props
  const moduleStatus =
    completedCount === 0 ? 'not-started' : completedCount === totalCount ? 'completed' : 'in-progress'
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-sm',
        'transition-shadow duration-150 hover:shadow-md',
      )}
    >
      <ProgressRing
        progress={totalCount > 0 ? completedCount / totalCount : 0}
        size={48}
        label={`${percent}%`}
        accessibleLabel={`${labName}: ${percent}% complete, ${completedCount} of ${totalCount} exercises`}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{labName}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {completedCount} of {totalCount} exercises
        </p>
        <Badge
          variant={moduleStatus === 'in-progress' ? 'secondary' : 'outline'}
          className="mt-1.5"
        >
          {STATUS_LABEL[moduleStatus]}
        </Badge>
      </div>
      <Button asChild variant="ghost" size="sm" className="shrink-0 text-muted-foreground hover:text-foreground">
        <Link href={href}>Open</Link>
      </Button>
    </div>
  )
}
