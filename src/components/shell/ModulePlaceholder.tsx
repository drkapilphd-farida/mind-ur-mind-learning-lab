import type { LucideIcon } from 'lucide-react'
import { EmptyStateCard } from '@/components/ui/empty-state-card'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'

type ModulePlaceholderProps = {
  icon: LucideIcon
  eyebrow: string
  title: string
  description: string
}

// Sprint 0 renders every AI Learning Studio™ route as one of these — a
// real page (real route, real auth, real shell) with no business logic
// behind it yet, per the sprint's explicit scope. Swapping this out for
// the real module UI in a later sprint never touches routing/layout.
export function ModulePlaceholder({ icon, eyebrow, title, description }: ModulePlaceholderProps): React.JSX.Element {
  return (
    <div className="space-y-6">
      <div>
        <p className={TYPOGRAPHY.label}>{eyebrow}</p>
        <h1 className={cn(TYPOGRAPHY.h1, 'mt-1')}>{title}</h1>
      </div>
      <EmptyStateCard icon={icon} title="Coming soon" description={description} />
    </div>
  )
}
