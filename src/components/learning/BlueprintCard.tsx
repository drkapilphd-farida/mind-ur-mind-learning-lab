import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ICON_SIZE } from '@/lib/designSystem/icons'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'

type BlueprintCardProps = {
  icon: LucideIcon
  title: string
  description: string
  className?: string
}

// One of the sprint's named reusable components — the small icon/
// title/description card used for every Learning Blueprint™ concept.
// Deliberately generic (not concept-specific) so it can be reused for
// any future blueprint-adjacent card without a new component.
export function BlueprintCard({ icon: Icon, title, description, className }: BlueprintCardProps): React.JSX.Element {
  return (
    <Card className={cn('h-full', className)}>
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <Icon className={cn(ICON_SIZE.md, 'shrink-0 text-primary')} aria-hidden="true" />
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className={TYPOGRAPHY.caption}>{description}</p>
      </CardContent>
    </Card>
  )
}
