import Link from 'next/link'
import { Check, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

export type JourneyTimelineStage = {
  id: string
  icon: string
  title: string
  status: 'locked' | 'current' | 'complete'
  href: string
  // Quantum Speed Reading Paywall™ — true when this stage's own real
  // lock (see the exercise pages' own hasQuantumSpeedReadingProAccess
  // checks) is a Pro requirement rather than the ordinary sequential-
  // mastery reason every other locked stage already shows. Only
  // meaningful when status is 'locked'.
  requiresPro?: boolean
}

type JourneyTimelineProps = {
  stages: readonly JourneyTimelineStage[]
  // The one real "active" stage (matches JourneyHero above). The terminal
  // Reading Intelligence™ stage is architecturally always status:'current'
  // too (documented since Sprint-12A — it's an ongoing resource with no
  // exercises to complete), so "is this stage current" and "is this THE
  // stage the learner is on right now" are different questions; only the
  // latter gets the "You are here" label, to avoid showing it twice.
  currentStageId: string | null
}

// Sprint-12F — Founder Journey Redesign™. Previously this expanded the
// current stage into its own nested card with a second "Continue Your
// Journey™" button — a duplicate of JourneyHero above it. That detail now
// lives once, in the Hero. This list exists purely to answer "how much
// transformation remains" at a glance: complete stages read as growth
// ("Evolved," not a bare checkbox), the current stage is simply marked
// (no expansion — it's already the page's hero), and locked stages read
// as anticipation, naming the real stage that unlocks them.
export function JourneyTimeline({ stages, currentStageId }: JourneyTimelineProps): React.JSX.Element {
  return (
    <ol className="divide-y divide-border rounded-3xl border bg-card">
      {stages.map((stage, index) => {
        const isCurrent = stage.status === 'current'
        const isComplete = stage.status === 'complete'
        const isLocked = stage.status === 'locked'
        const isHere = stage.id === currentStageId
        const previousStageTitle = index > 0 ? stages[index - 1]?.title : null

        const isProLocked = isLocked && stage.requiresPro === true

        const rowContent = (
          <>
            <div
              aria-hidden="true"
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-full transition-colors duration-(--duration-base) ease-in-out',
                isComplete ? 'bg-primary text-primary-foreground' : isCurrent ? 'bg-primary/10 text-foreground ring-2 ring-primary/30' : 'bg-muted text-muted-foreground',
              )}
            >
              {isLocked ? <Lock className="size-4" /> : isComplete ? <Check className="size-4" /> : <span className="text-base">{stage.icon}</span>}
            </div>

            <div className="min-w-0 flex-1">
              <p className={cn('text-sm font-semibold', isLocked ? 'text-muted-foreground' : 'text-foreground')}>
                {stage.title}
                {isHere && <span className="ml-2 text-xs font-medium tracking-wide text-primary uppercase">You are here</span>}
              </p>
              {isProLocked ? (
                <p className="mt-0.5 text-xs font-medium text-primary">Requires Pro — tap to upgrade</p>
              ) : isLocked ? (
                <p className="mt-0.5 text-xs text-muted-foreground/70">
                  {previousStageTitle !== null ? `Available after completing ${previousStageTitle}` : 'Available soon'}
                </p>
              ) : isComplete ? (
                <p className="mt-0.5 text-xs text-muted-foreground/70">Evolved</p>
              ) : null}
            </div>

            {isComplete && (
              <Link href={stage.href} className="shrink-0 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                Review
              </Link>
            )}
          </>
        )

        // Quantum Speed Reading Paywall™ — a Pro-locked stage is the one
        // "locked" state that's still a real, clickable entry point (to
        // /pricing), not just a status readout — matches every other
        // locked-day/locked-exercise treatment in this pass, where
        // locking is never a dead end.
        return isProLocked ? (
          <li key={stage.id}>
            <Link
              href="/pricing#family-pro"
              className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-primary/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
            >
              {rowContent}
            </Link>
          </li>
        ) : (
          <li key={stage.id} className="flex items-center gap-4 px-6 py-4">
            {rowContent}
          </li>
        )
      })}
    </ol>
  )
}
