'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'

type LearningModeCardProps = {
  emoji: string
  title: string
  description: string
  href: string
  comingSoon?: boolean
  onClick?: () => void
}

const CARD_CLASS =
  'group relative flex h-full flex-col items-start gap-3 overflow-hidden rounded-3xl border border-border bg-background/60 px-6 py-6 text-left backdrop-blur-sm transition-all duration-300 ease-out shadow-sm hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'

// A Learning Mode card (Sprint LW-1E; simplified Sprint ALS-8) — reused
// by the "Other Available Learning Modes™" grid, same hover/lift/glow
// vocabulary as SourceTypeCard/PrimaryLearningMethodCard elsewhere in
// this arc. Every Learning Mode now resolves to a real destination (the
// universal Learning Workspace™, or AI Mentor's own real route) — always
// a real `<Link>`, never a click-handler fallback into a second, separate
// "coming soon" screen.
//
// AI Learning Studio™ Sprint ALS-21 — Complete Functional Completion. A
// production audit found this card had no visual treatment at all for
// the two real modes with no runtime yet (Research Mode™, Exam
// Preparation™) — every card rendered identically, indistinguishable
// from a genuinely working mode, unlike the Upload Wizard's own
// `SourceTypeCard`, which has always shown a real "Coming Soon" badge for
// its own not-yet-real options. `comingSoon` closes that gap with the
// same real `Badge` component, at the same real layout position
// (top-right, alongside the icon) — but deliberately does NOT disable the
// link itself: clicking still navigates to the universal Learning
// Workspace™'s own honest "Coming in a future production sprint" screen,
// a real, working destination, not a dead end.
export function LearningModeCard({ emoji, title, description, href, comingSoon = false, onClick }: LearningModeCardProps): React.JSX.Element {
  return (
    <Link href={href} className={cn(CARD_CLASS, comingSoon && 'opacity-80')} {...(onClick !== undefined ? { onClick } : {})}>
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-foreground/[0.04] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden="true"
      />
      <div className="flex w-full items-start justify-between gap-3">
        <span className="text-3xl" aria-hidden="true">
          {emoji}
        </span>
        {comingSoon && <Badge variant="secondary">Coming Soon</Badge>}
      </div>
      <div>
        <p className={TYPOGRAPHY.h4}>{title}</p>
        <p className={cn(TYPOGRAPHY.caption, 'mt-1')}>{description}</p>
      </div>
    </Link>
  )
}
