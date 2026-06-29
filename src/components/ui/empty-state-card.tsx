import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type EmptyStateCardProps = {
  icon: LucideIcon
  title: string
  description?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

// Formalizes the empty-state pattern already used identically on the
// Dashboard ("haven't enrolled in any courses") and Progress page ("no
// progress data yet") — same markup, hand-rolled twice. Existing usages are
// left as-is per Sprint 1–2G preservation; this is the canonical version for
// every future empty state (new Labs, Parent Dashboard™, Admin CMS™, etc.).
export function EmptyStateCard({ icon: Icon, title, description, action, className }: EmptyStateCardProps): React.JSX.Element {
  return (
    <div className={cn('rounded-xl border bg-card p-8 text-center', className)}>
      <Icon className="mx-auto mb-4 size-10 text-muted-foreground/30" aria-hidden="true" />
      <p className="font-medium text-foreground">{title}</p>
      {description !== undefined && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      {action !== undefined && <div className="mt-4">{action}</div>}
    </div>
  )
}
