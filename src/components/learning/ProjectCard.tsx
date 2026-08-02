import Link from 'next/link'
import { FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge, type StatusBadgeStatus } from '@/components/ui/status-badge'
import { ICON_SIZE } from '@/lib/designSystem/icons'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { formatRelativeTime } from '@/lib/formatRelativeTime'
import { cn } from '@/lib/utils'
import type { LearningProject } from '@/types/learning'

const STATUS_BADGE: Record<LearningProject['status'], { status: StatusBadgeStatus; label?: string }> = {
  active: { status: 'active' },
  completed: { status: 'completed' },
  archived: { status: 'locked', label: 'Archived' },
}

type ProjectCardProps = {
  project: LearningProject
  className?: string
}

// The one reusable card for a Learning Project — the Dashboard's Recent
// Learning Projects grid and any future project list (Sprint 2+) render
// this, never a hand-rolled variant.
//
// AI Learning Studio™ V1 Living Product Sprint — a small hover-elevation
// lift added (same `hover:shadow-md` + duration token convention already
// used by `LearningModeCard`), previously just a flat background-tint.
export function ProjectCard({ project, className }: ProjectCardProps): React.JSX.Element {
  const badge = STATUS_BADGE[project.status]

  return (
    <Link
      href={`/preview/learning-projects/${project.id}`}
      className={cn('block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', className)}
    >
      <Card className="h-full shadow-sm transition-all duration-(--duration-fast) ease-in-out hover:-translate-y-0.5 hover:bg-accent/40 hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <FileText className={cn(ICON_SIZE.lg, 'shrink-0 text-muted-foreground')} aria-hidden="true" />
            <StatusBadge status={badge.status} {...(badge.label !== undefined ? { label: badge.label } : {})} />
          </div>
          <CardTitle className="mt-2 line-clamp-2">{project.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={TYPOGRAPHY.caption}>Updated {formatRelativeTime(project.updatedAt)}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
